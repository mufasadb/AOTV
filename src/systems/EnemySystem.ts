import { makeAutoObservable } from 'mobx'
import enemiesData from '../data/enemies.json'
import type { CombatStats, CombatEntity, CombatAbility } from '../stores/CombatStore'

export interface EnemyDefinition {
  id: string
  name: string
  tier: number
  spawnChance: number
  iconName: string
  stats: CombatStats
  abilities?: EnemyAbility[]
}

export interface EnemyAbility {
  id: string
  name: string
  chance: number
  description: string
  effects: { [key: string]: any }
}

export interface EnemyTier {
  spawnWeight: number
  enemies: { [id: string]: EnemyDefinition }
}

class EnemySystem {
  private enemyDatabase: { [tier: string]: EnemyTier } = {}

  constructor() {
    makeAutoObservable(this)
    this.loadEnemyDatabase()
  }

  private loadEnemyDatabase() {
    this.enemyDatabase = enemiesData as any
  }

  // Get enemy definition by ID
  getEnemyDefinition(enemyId: string): EnemyDefinition | null {
    for (const tier of Object.values(this.enemyDatabase)) {
      if (tier.enemies[enemyId]) {
        return tier.enemies[enemyId]
      }
    }
    return null
  }

  // Generate enemies for a specific encounter based on tier weights
  generateEnemyEncounter(options: {
    enemyCount?: number
    tierWeights?: { [tier: string]: number }
    forceTier?: number
  } = {}): CombatEntity[] {
    const {
      enemyCount = Math.floor(Math.random() * 3) + 1, // 1-3 enemies
      tierWeights,
      forceTier
    } = options

    const enemies: CombatEntity[] = []

    // Use custom tier weights or database weights
    const weights = tierWeights || this.getDefaultTierWeights()

    for (let i = 0; i < enemyCount; i++) {
      const tier = forceTier || this.rollTier(weights)
      const enemy = this.generateRandomEnemyFromTier(tier)
      if (enemy) {
        // Ensure unique IDs for multiple enemies of same type
        enemy.id = `${enemy.id}_${i}`
        enemies.push(enemy)
      }
    }

    return enemies
  }

  private getDefaultTierWeights(): { [tier: string]: number } {
    const weights: { [tier: string]: number } = {}
    for (const [tierKey, tierData] of Object.entries(this.enemyDatabase)) {
      const tierNumber = parseInt(tierKey.replace('tier', ''))
      weights[tierNumber.toString()] = tierData.spawnWeight
    }
    return weights
  }

  private rollTier(weights: { [tier: string]: number }): number {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
    let random = Math.random() * totalWeight
    
    for (const [tier, weight] of Object.entries(weights)) {
      random -= weight
      if (random <= 0) {
        return parseInt(tier)
      }
    }
    
    return 1 // Fallback to tier 1
  }

  // Generate random enemy from specific tier
  generateRandomEnemyFromTier(tier: number): CombatEntity | null {
    const tierKey = `tier${tier}`
    const tierData = this.enemyDatabase[tierKey]
    
    if (!tierData) {
      console.warn(`Tier ${tier} not found in enemy database`)
      return null
    }

    // Get all enemies from this tier and their spawn chances
    const enemies = Object.values(tierData.enemies)
    const totalChance = enemies.reduce((sum, enemy) => sum + enemy.spawnChance, 0)
    let random = Math.random() * totalChance

    for (const enemyDef of enemies) {
      random -= enemyDef.spawnChance
      if (random <= 0) {
        return this.createCombatEntityFromDefinition(enemyDef)
      }
    }

    // Fallback to first enemy in tier
    return this.createCombatEntityFromDefinition(enemies[0])
  }

  // Create combat entity from enemy definition
  private createCombatEntityFromDefinition(definition: EnemyDefinition): CombatEntity {
    // Apply some variance to stats (±10%)
    const varianceMultiplier = () => 0.9 + Math.random() * 0.2

    const entity: CombatEntity = {
      id: definition.id,
      name: definition.name,
      stats: {
        ...definition.stats,
        // Apply variance to make encounters more interesting
        hp: Math.floor(definition.stats.hp * varianceMultiplier()),
        maxHp: definition.stats.maxHp,
        mp: Math.floor(definition.stats.mp * varianceMultiplier()),
        maxMp: definition.stats.maxMp,
        damage: Math.floor(definition.stats.damage * varianceMultiplier())
      },
      isBlocking: false,
      intent: this.getRandomIntent(definition),
      abilities: definition.abilities ? this.convertAbilities(definition.abilities) : []
    }

    return entity
  }

  private convertAbilities(enemyAbilities: EnemyAbility[]): CombatAbility[] {
    return enemyAbilities.map(ability => ({
      id: ability.id,
      name: ability.name,
      description: ability.description,
      manaCost: 0, // Enemies don't use mana for abilities typically
      cooldown: 0,
      currentCooldown: 0,
      effect: (caster: CombatEntity, _target: CombatEntity) => {
        // This would be implemented based on ability effects
        // For now, return basic damage result
        return {
          damage: caster.stats.damage,
          damageType: caster.stats.damageType,
          wasCrit: false,
          wasDodged: false,
          wasBlocked: false,
          actualDamage: caster.stats.damage,
          hitShield: false
        }
      }
    }))
  }

  private getRandomIntent(definition: EnemyDefinition): string {
    if (definition.abilities && definition.abilities.length > 0) {
      // Randomly choose between basic attack and abilities based on their chances
      const roll = Math.random() * 100
      let currentChance = 0
      
      for (const ability of definition.abilities) {
        currentChance += ability.chance
        if (roll <= currentChance) {
          return ability.name.toLowerCase().replace(/\s+/g, '_')
        }
      }
    }
    
    // Default intents
    const intents = ['attack', 'block', 'spell']
    return intents[Math.floor(Math.random() * intents.length)]
  }

  // Get enemies by tier
  getEnemiesByTier(tier: number): EnemyDefinition[] {
    const tierKey = `tier${tier}`
    const tierData = this.enemyDatabase[tierKey]
    return tierData ? Object.values(tierData.enemies) : []
  }

  // Get all available tiers
  getAvailableTiers(): number[] {
    return Object.keys(this.enemyDatabase)
      .map(key => parseInt(key.replace('tier', '')))
      .sort((a, b) => a - b)
  }

  // Generate loot from enemy based on tier
  generateEnemyLoot(enemyId: string): { gold: number, items: string[] } {
    const definition = this.getEnemyDefinition(enemyId.split('_')[0]) // Remove instance suffix
    if (!definition) {
      return { gold: 0, items: [] }
    }

    const tier = definition.tier
    
    // Generate gold based on tier
    const goldRanges = {
      1: { min: 2, max: 10 },
      2: { min: 10, max: 30 },
      3: { min: 50, max: 120 }
    }
    
    const goldRange = goldRanges[tier as keyof typeof goldRanges] || goldRanges[1]
    const gold = Math.floor(Math.random() * (goldRange.max - goldRange.min + 1)) + goldRange.min

    // Generate items based on tier (placeholder implementation)
    // This would be expanded with proper tier-based loot tables
    const items: string[] = []
    const dropChance = tier * 15 // Higher tier = higher chance
    
    if (Math.random() * 100 < dropChance) {
      // Basic tier-based item drops
      const tierItems = {
        1: ['iron_ore', 'health_potion', 'leather_cap'],
        2: ['steel_ingot', 'magic_crystal', 'mana_potion'],
        3: ['dragon_scale', 'magic_crystal', 'flame_blade']
      }
      
      const availableItems = tierItems[tier as keyof typeof tierItems] || tierItems[1]
      const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)]
      items.push(randomItem)
    }

    return { gold, items }
  }

  // Get enemy by ID
  generateSpecificEnemy(enemyId: string): CombatEntity | null {
    const definition = this.getEnemyDefinition(enemyId)
    return definition ? this.createCombatEntityFromDefinition(definition) : null
  }

  // Get tier information
  getTierInfo(tier: number): EnemyTier | null {
    const tierKey = `tier${tier}`
    return this.enemyDatabase[tierKey] || null
  }

  // Validate enemy exists
  enemyExists(enemyId: string): boolean {
    return this.getEnemyDefinition(enemyId) !== null
  }

  // Generate balanced encounter for specific difficulty
  generateBalancedEncounter(playerLevel: number, difficulty: 'easy' | 'normal' | 'hard' = 'normal'): CombatEntity[] {
    // Calculate appropriate tier based on player level and difficulty
    let baseTier = Math.max(1, Math.floor(playerLevel / 5))
    
    if (difficulty === 'easy') {
      baseTier = Math.max(1, baseTier - 1)
    } else if (difficulty === 'hard') {
      baseTier = Math.min(3, baseTier + 1)
    }

    // Create tier weights favoring the calculated tier
    const tierWeights: { [tier: string]: number } = {}
    const availableTiers = this.getAvailableTiers()
    
    for (const tier of availableTiers) {
      if (tier === baseTier) {
        tierWeights[tier.toString()] = 50
      } else if (Math.abs(tier - baseTier) === 1) {
        tierWeights[tier.toString()] = 25
      } else {
        tierWeights[tier.toString()] = 5
      }
    }

    return this.generateEnemyEncounter({ tierWeights })
  }
}

export const enemySystem = new EnemySystem()