import type { ItemRarity, EquipmentItem, AnyItem, ItemStats, AffixInstance } from '../types/ItemTypes'
import itemsData from '../data/items.json'
import modifiersData from '../data/modifiers.json'

// Loot generation configuration
export interface LootGenerationConfig {
  enemyTier: number           // 1-3, determines base power level
  playerLevel: number         // Player's current level
  dungeonType?: string        // Optional theme for contextual drops
  guaranteedRarity?: ItemRarity // Force minimum rarity
  bonusRarityChance?: number  // Additional % chance for better rarity
}

// Individual drop result
export interface LootDrop {
  item: AnyItem
  isUpgrade: boolean          // Whether it's better than player's current gear
  powerLevel: number          // Calculated item power for balance analysis
}

// Complete loot generation result
export interface LootResult {
  gold: number
  items: LootDrop[]
  totalPowerLevel: number
  rarityDistribution: { [rarity: string]: number }
}

// Rarity weights based on enemy tier
const RARITY_WEIGHTS: { [tier: number]: { [rarity: string]: number } } = {
  1: { common: 60, uncommon: 25, rare: 10, epic: 4, legendary: 1 },
  2: { common: 45, uncommon: 30, rare: 15, epic: 8, legendary: 2 },
  3: { common: 30, uncommon: 25, rare: 25, epic: 15, legendary: 5 }
}

// Quality variance multipliers for stat ranges
const QUALITY_VARIANCE = {
  common: { min: 0.8, max: 1.0 },
  uncommon: { min: 0.85, max: 1.15 },
  rare: { min: 0.9, max: 1.25 },
  epic: { min: 1.0, max: 1.4 },
  legendary: { min: 1.2, max: 1.6 }
}

// Affix count by rarity
const AFFIX_COUNTS: { [rarity: string]: { prefixes: [number, number], suffixes: [number, number] } } = {
  common: { prefixes: [0, 0], suffixes: [0, 0] },
  uncommon: { prefixes: [0, 1], suffixes: [0, 1] },
  rare: { prefixes: [1, 2], suffixes: [1, 2] },
  epic: { prefixes: [2, 3], suffixes: [2, 2] },
  legendary: { prefixes: [3, 3], suffixes: [2, 3] }
}

export class LootEngine {
  private itemDefinitions: any
  private modifiers: any

  constructor() {
    this.itemDefinitions = itemsData
    this.modifiers = modifiersData
  }

  /**
   * Main entry point for generating loot from enemy encounters
   */
  generateEnemyLoot(config: LootGenerationConfig): LootResult {
    const result: LootResult = {
      gold: this.generateGold(config.enemyTier),
      items: [],
      totalPowerLevel: 0,
      rarityDistribution: {}
    }

    // Determine how many items to generate (50% base chance + 15% per tier)
    const dropChance = 0.50 + (0.15 * config.enemyTier)
    if (Math.random() > dropChance) {
      return result // No item drop
    }

    // Generate primary item
    const primaryItem = this.generateItem(config)
    if (primaryItem) {
      result.items.push(primaryItem)
      result.totalPowerLevel += primaryItem.powerLevel
      
      const rarity = this.getItemRarity(primaryItem.item)
      result.rarityDistribution[rarity] = (result.rarityDistribution[rarity] || 0) + 1
    }

    // Small chance for bonus items from higher tier enemies
    if (config.enemyTier >= 2 && Math.random() < 0.1 * config.enemyTier) {
      const bonusItem = this.generateItem(config)
      if (bonusItem) {
        result.items.push(bonusItem)
        result.totalPowerLevel += bonusItem.powerLevel
        
        const rarity = this.getItemRarity(bonusItem.item)
        result.rarityDistribution[rarity] = (result.rarityDistribution[rarity] || 0) + 1
      }
    }

    return result
  }

  /**
   * Generate a single item with procedural stats and affixes
   */
  private generateItem(config: LootGenerationConfig): LootDrop | null {
    // Select item category and base item
    const itemCategory = this.selectItemCategory()
    const baseItemDef = this.selectBaseItem(itemCategory, config.enemyTier)
    if (!baseItemDef) return null

    // Determine item rarity
    const rarity = config.guaranteedRarity || this.rollItemRarity(config.enemyTier, config.bonusRarityChance)
    
    // Calculate item level based on enemy tier and player level
    const itemLevel = this.calculateItemLevel(config.enemyTier, config.playerLevel)

    // Generate base item instance
    const item = this.createBaseEquipmentItem(baseItemDef, rarity, itemLevel)

    // Apply stat variance based on rarity
    this.applyStatVariance(item, rarity)

    // Apply affixes based on rarity and item level
    this.applyAffixes(item, rarity, config.playerLevel)

    // Calculate final stats (base + affixes)
    this.calculateFinalStats(item)

    // Calculate power level for balance analysis
    const powerLevel = this.calculateItemPowerLevel(item)

    return {
      item,
      isUpgrade: false, // TODO: Implement upgrade detection
      powerLevel
    }
  }

  /**
   * Generate gold drops based on enemy tier
   */
  private generateGold(enemyTier: number): number {
    const goldRanges: { [key: number]: [number, number] } = {
      1: [2, 10],
      2: [10, 30], 
      3: [50, 120]
    }
    
    const range = goldRanges[enemyTier] || goldRanges[1]
    return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0]
  }

  /**
   * Select which category of item to generate
   */
  private selectItemCategory(): string {
    const categories = ['weapons', 'armor']
    const weights = [40, 60] // Slightly favor armor for survivability
    
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
    let random = Math.random() * totalWeight
    
    for (let i = 0; i < categories.length; i++) {
      random -= weights[i]
      if (random <= 0) {
        return categories[i]
      }
    }
    
    return categories[0]
  }

  /**
   * Select a base item definition from the category
   */
  private selectBaseItem(category: string, enemyTier: number): any {
    const categoryItems = this.itemDefinitions[category]
    if (!categoryItems) return null

    const itemIds = Object.keys(categoryItems)
    if (itemIds.length === 0) return null

    // Filter items by tier appropriateness
    const appropriateItems = itemIds.filter(id => {
      const item = categoryItems[id]
      const reqLevel = item.requirements?.level || 1
      
      // Items should be appropriate for the tier range
      const tierLevelRange: { [key: number]: [number, number] } = {
        1: [1, 15],
        2: [10, 30],
        3: [25, 50]
      }
      
      const range = tierLevelRange[enemyTier] || tierLevelRange[1]
      return reqLevel >= range[0] && reqLevel <= range[1]
    })

    if (appropriateItems.length === 0) {
      // Fallback to any item if no appropriate ones found
      return categoryItems[itemIds[0]]
    }

    // Select random appropriate item
    const selectedId = appropriateItems[Math.floor(Math.random() * appropriateItems.length)]
    return categoryItems[selectedId]
  }

  /**
   * Roll item rarity based on tier and bonus chances
   */
  private rollItemRarity(enemyTier: number, bonusChance: number = 0): ItemRarity {
    const weights = { ...RARITY_WEIGHTS[enemyTier] }
    
    // Apply bonus rarity chance by reducing common weight
    if (bonusChance > 0) {
      const reduction = weights.common * (bonusChance / 100)
      weights.common -= reduction
      weights.rare += reduction * 0.5
      weights.epic += reduction * 0.3
      weights.legendary += reduction * 0.2
    }

    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
    let random = Math.random() * totalWeight

    const rarities: ItemRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']
    for (const rarity of rarities) {
      random -= weights[rarity]
      if (random <= 0) {
        return rarity
      }
    }

    return 'common'
  }

  /**
   * Calculate appropriate item level based on enemy tier and player level
   */
  private calculateItemLevel(enemyTier: number, playerLevel: number): number {
    // Base item level from enemy tier
    const baseLevels: { [key: number]: number } = { 1: 5, 2: 20, 3: 35 }
    const baseLevel = baseLevels[enemyTier] || 1
    
    // Add variance based on player level
    const variance = Math.floor(playerLevel * 0.2)
    const minLevel = Math.max(1, baseLevel - variance)
    const maxLevel = baseLevel + variance
    
    return Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel
  }

  /**
   * Create base equipment item instance from definition
   */
  private createBaseEquipmentItem(definition: any, rarity: ItemRarity, itemLevel: number): EquipmentItem {
    return {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      definitionId: definition.id,
      name: definition.name,
      description: definition.description,
      icon: definition.icon,
      type: 'equipment',
      slotType: definition.slotType,
      rarity,
      itemLevel,
      requirements: definition.requirements,
      baseStats: { ...definition.stats },
      prefixes: [],
      suffixes: [],
      stats: { ...definition.stats }, // Will be recalculated after affixes
      damageType: definition.damageType
    }
  }

  /**
   * Apply stat variance based on rarity quality ranges
   */
  private applyStatVariance(item: EquipmentItem, rarity: ItemRarity): void {
    const variance = QUALITY_VARIANCE[rarity]
    const multiplier = Math.random() * (variance.max - variance.min) + variance.min

    // Apply multiplier to all numeric base stats
    Object.keys(item.baseStats).forEach(statKey => {
      const value = item.baseStats[statKey as keyof ItemStats]
      if (typeof value === 'number') {
        ;(item.baseStats as any)[statKey] = Math.round(value * multiplier)
      }
    })
  }

  /**
   * Apply procedural affixes based on rarity and level
   */
  private applyAffixes(item: EquipmentItem, rarity: ItemRarity, playerLevel: number): void {
    const affixConfig = AFFIX_COUNTS[rarity]
    if (!affixConfig) return

    // Generate prefixes
    const prefixCount = Math.floor(Math.random() * (affixConfig.prefixes[1] - affixConfig.prefixes[0] + 1)) + affixConfig.prefixes[0]
    for (let i = 0; i < prefixCount; i++) {
      const affix = this.generateAffix('prefix', playerLevel, item.slotType)
      if (affix && !item.prefixes.find(p => p.id === affix.id)) {
        item.prefixes.push(affix)
      }
    }

    // Generate suffixes
    const suffixCount = Math.floor(Math.random() * (affixConfig.suffixes[1] - affixConfig.suffixes[0] + 1)) + affixConfig.suffixes[0]
    for (let i = 0; i < suffixCount; i++) {
      const affix = this.generateAffix('suffix', playerLevel, item.slotType)
      if (affix && !item.suffixes.find(s => s.id === affix.id)) {
        item.suffixes.push(affix)
      }
    }
  }

  /**
   * Generate a single affix (prefix or suffix)
   */
  private generateAffix(type: 'prefix' | 'suffix', playerLevel: number, slotType: string): AffixInstance | null {
    const affixPool = type === 'prefix' ? this.modifiers.prefixes : this.modifiers.suffixes
    
    // Filter by slot compatibility and level requirements
    const availableAffixes = affixPool.filter((affix: any) => {
      // Check slot restrictions
      if (affix.validSlots && !affix.validSlots.includes(slotType)) {
        return false
      }
      
      // Check if any tier is available for player level
      return affix.tiers.some((tier: any) => tier.requiredLevel <= playerLevel)
    })

    if (availableAffixes.length === 0) return null

    // Select random affix
    const selectedAffix = availableAffixes[Math.floor(Math.random() * availableAffixes.length)]
    
    // Select appropriate tier based on player level
    const availableTiers = selectedAffix.tiers.filter((tier: any) => tier.requiredLevel <= playerLevel)
    if (availableTiers.length === 0) return null

    // Weight tiers by their spawn weights
    const totalWeight = availableTiers.reduce((sum: number, tier: any) => sum + tier.weight, 0)
    let random = Math.random() * totalWeight

    let selectedTier: any = null
    for (const tier of availableTiers) {
      random -= tier.weight
      if (random <= 0) {
        selectedTier = tier
        break
      }
    }

    if (!selectedTier) selectedTier = availableTiers[0]

    // Generate stat value within tier range
    const statValue = Array.isArray(selectedTier.value) 
      ? Math.random() * (selectedTier.value[1] - selectedTier.value[0]) + selectedTier.value[0]
      : selectedTier.value

    // Create affix instance
    return {
      id: selectedAffix.id,
      name: selectedAffix.name,
      description: `${selectedAffix.name} T${selectedTier.tier}`,
      stats: {
        [selectedTier.stat]: Math.round(statValue * 100) / 100 // Round to 2 decimal places
      },
      tier: selectedTier.tier,
      weight: selectedTier.weight
    }
  }

  /**
   * Calculate final item stats by combining base stats and affixes
   */
  private calculateFinalStats(item: EquipmentItem): void {
    // Start with base stats
    item.stats = { ...item.baseStats }

    // Add prefix stats
    item.prefixes.forEach(prefix => {
      Object.keys(prefix.stats).forEach(statKey => {
        const key = statKey as keyof ItemStats
        const currentValue = item.stats[key] || 0
        const affixValue = prefix.stats[key] || 0
        ;(item.stats as any)[key] = currentValue + affixValue
      })
    })

    // Add suffix stats
    item.suffixes.forEach(suffix => {
      Object.keys(suffix.stats).forEach(statKey => {
        const key = statKey as keyof ItemStats
        const currentValue = item.stats[key] || 0
        const affixValue = suffix.stats[key] || 0
        ;(item.stats as any)[key] = currentValue + affixValue
      })
    })

    // Add implicit stats if present
    if (item.implicit) {
      Object.keys(item.implicit.stats).forEach(statKey => {
        const key = statKey as keyof ItemStats
        const currentValue = item.stats[key] || 0
        const implicitValue = item.implicit!.stats[key] || 0
        ;(item.stats as any)[key] = currentValue + implicitValue
      })
    }
  }

  /**
   * Calculate item power level for balance analysis
   */
  private calculateItemPowerLevel(item: EquipmentItem): number {
    let power = 0
    
    // Weight different stats by their impact
    const statWeights: { [key in keyof ItemStats]?: number } = {
      attack: 2.0,
      maxHp: 0.5,
      armor: 1.5,
      critChance: 1.2,
      critMultiplier: 10, // Multipliers are very powerful
      dodge: 1.5,
      fireRes: 0.8,
      lightningRes: 0.8,
      iceRes: 0.8,
      darkRes: 0.8
    }

    Object.keys(item.stats).forEach(statKey => {
      const key = statKey as keyof ItemStats
      const value = item.stats[key]
      const weight = statWeights[key] || 1.0
      
      if (typeof value === 'number') {
        power += value * weight
      }
    })

    // Bonus for rarity
    const rarityMultipliers = {
      common: 1.0,
      uncommon: 1.2,
      rare: 1.5,
      epic: 2.0,
      legendary: 3.0
    }

    return Math.round(power * rarityMultipliers[item.rarity])
  }

  /**
   * Helper to get item rarity from any item type
   */
  private getItemRarity(item: AnyItem): string {
    if (item.type === 'equipment') {
      return item.rarity
    }
    return 'common' // Default for non-equipment items
  }
}

// Export singleton instance
export const lootEngine = new LootEngine()