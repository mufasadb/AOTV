import { makeAutoObservable } from 'mobx'

export type DamageType = 'physical' | 'fire' | 'lightning' | 'ice' | 'dark'

export interface CombatStats {
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  es: number // Energy Shield
  maxEs: number
  armor: number // Physical damage reduction %
  fireRes: number
  lightningRes: number 
  iceRes: number
  darkRes: number
  dodge: number // % chance to avoid damage completely
  block: number // % chance to block (for shields)
  critChance: number
  critMultiplier: number
  damage: number
  damageType: DamageType
}

export interface CombatEntity {
  id: string
  name: string
  stats: CombatStats
  intent?: string // For enemies - what they plan to do
  isBlocking: boolean // If they used block action this turn
  abilities?: CombatAbility[]
}

export interface CombatAbility {
  id: string
  name: string
  description: string
  manaCost: number
  cooldown: number
  currentCooldown: number
  effect: (caster: CombatEntity, target: CombatEntity) => DamageResult
}

export interface DamageResult {
  damage: number
  damageType: DamageType
  wasCrit: boolean
  wasDodged: boolean
  wasBlocked: boolean
  actualDamage: number // After all reductions
  hitShield: boolean // If it hit energy shield
}

export type TurnPhase = 'player' | 'enemy' | 'combat_end' | 'victory' | 'defeat'
export type AnimationState = 'idle' | 'hit' | 'attacking' | 'returning'

export interface FloatingDamageData {
  id: string
  damage: number
  isCrit: boolean
  isDodged: boolean
  isBlocked: boolean
  position: { x: number, y: number }
  targetType: 'player' | 'enemy'
  targetId?: string
}

class CombatStore {
  // Combat state
  isInCombat = false
  turnPhase: TurnPhase = 'player'
  currentEnemyIndex = 0 // Which enemy is currently taking their turn
  selectedTargetId: string | null = null
  
  // Entities
  player: CombatEntity | null = null
  enemies: CombatEntity[] = []
  
  // Dungeon progression
  currentFight = 1
  totalFights = 5 // Default dungeon length
  
  // Combat log for feedback
  combatLog: string[] = []
  
  // Animation system
  enemyAnimations: { [enemyId: string]: AnimationState } = {}
  playerAnimation: AnimationState = 'idle'
  floatingDamages: FloatingDamageData[] = []
  isProcessingTurn = false

  constructor() {
    makeAutoObservable(this)
  }

  // Initialize combat with player and enemies
  startCombat(playerStats: CombatStats, enemyData: Array<{name: string, stats: CombatStats, abilities?: CombatAbility[]}>) {
    this.player = {
      id: 'player',
      name: 'Player',
      stats: {...playerStats},
      isBlocking: false,
    }
    
    this.enemies = enemyData.map((enemy, index) => ({
      id: `enemy_${index}`,
      name: enemy.name,
      stats: {...enemy.stats},
      isBlocking: false,
      intent: this.getRandomIntent(),
      abilities: enemy.abilities || []
    }))
    
    // Initialize enemy animations
    this.enemyAnimations = {}
    this.enemies.forEach(enemy => {
      this.enemyAnimations[enemy.id] = 'idle'
    })
    
    this.isInCombat = true
    this.turnPhase = 'player'
    this.currentEnemyIndex = 0
    this.selectedTargetId = this.enemies.length > 0 ? this.enemies[0].id : null
    this.combatLog = ['Combat begins!']
  }

  // Player actions
  playerAttack() {
    if (this.turnPhase !== 'player' || !this.player || !this.selectedTargetId || this.isProcessingTurn) return
    
    const target = this.enemies.find(e => e.id === this.selectedTargetId)
    if (!target || target.stats.hp <= 0) return
    
    this.isProcessingTurn = true
    
    const result = this.calculateDamage(this.player, target)
    
    // Trigger enemy hit animation
    this.enemyAnimations[target.id] = 'hit'
    
    // Show floating damage
    this.showFloatingDamage(result, 'enemy', target.id)
    
    // Apply damage after a short delay for visual effect
    setTimeout(() => {
      this.applyDamage(target, result)
      this.addToCombatLog(`Player attacks ${target.name} for ${result.actualDamage} damage${result.wasCrit ? ' (CRIT!)' : ''}`)
      
      // Return enemy to idle after animation
      setTimeout(() => {
        this.enemyAnimations[target.id] = 'idle'
        this.isProcessingTurn = false
        this.endPlayerTurn()
      }, 600) // Time for return animation
    }, 300) // Time for hit animation
  }

  playerBlock() {
    if (this.turnPhase !== 'player' || !this.player || this.isProcessingTurn) return
    
    this.isProcessingTurn = true
    this.player.isBlocking = true
    this.addToCombatLog('Player blocks, doubling armor and reducing damage by 25%')
    
    // Small delay for block action feedback
    setTimeout(() => {
      this.isProcessingTurn = false
      this.endPlayerTurn()
    }, 500)
  }

  // End player turn and start enemy turns
  endPlayerTurn() {
    this.turnPhase = 'enemy'
    this.currentEnemyIndex = 0
    this.processEnemyTurns()
  }

  // Process all enemy turns in sequence (left to right)
  processEnemyTurns() {
    if (!this.player) return
    
    this.processNextEnemyTurn()
  }

  processNextEnemyTurn() {
    if (!this.player) return
    
    // Find next alive enemy
    while (this.currentEnemyIndex < this.enemies.length) {
      const enemy = this.enemies[this.currentEnemyIndex]
      
      if (enemy.stats.hp > 0) {
        // Animate enemy attack
        this.enemyAnimations[enemy.id] = 'attacking'
        
        // Calculate damage
        const result = this.calculateDamage(enemy, this.player)
        
        // Show floating damage on player
        this.showFloatingDamage(result, 'player')
        
        setTimeout(() => {
          // Apply damage
          if (this.player) {
            this.applyDamage(this.player, result)
            this.addToCombatLog(`${enemy.name} attacks for ${result.actualDamage} damage${result.wasCrit ? ' (CRIT!)' : ''}`)
            
            // Return enemy to idle
            this.enemyAnimations[enemy.id] = 'idle'
            
            // Check if player died
            if (this.player.stats.hp <= 0) {
              this.turnPhase = 'defeat'
              this.addToCombatLog('Player has been defeated!')
              return
            }
          }
          
          // Move to next enemy
          this.currentEnemyIndex++
          
          // Continue with next enemy after a brief pause
          setTimeout(() => {
            this.processNextEnemyTurn()
          }, 400)
          
        }, 600) // Time for attack animation
        
        return // Exit to wait for animation
      }
      
      this.currentEnemyIndex++
    }
    
    // All enemies have attacked, check victory condition
    const aliveEnemies = this.enemies.filter(e => e.stats.hp > 0)
    if (aliveEnemies.length === 0) {
      this.turnPhase = 'victory'
      this.addToCombatLog('All enemies defeated!')
      return
    }
    
    // Reset for next turn
    this.startNewTurn()
  }

  startNewTurn() {
    this.turnPhase = 'player'
    this.currentEnemyIndex = 0
    
    // Reset blocking status
    if (this.player) this.player.isBlocking = false
    this.enemies.forEach(enemy => enemy.isBlocking = false)
    
    // Update enemy intents
    this.enemies.forEach(enemy => {
      if (enemy.stats.hp > 0) {
        enemy.intent = this.getRandomIntent()
      }
    })
    
    // Auto-select first alive enemy if current target is dead
    if (this.selectedTargetId) {
      const currentTarget = this.enemies.find(e => e.id === this.selectedTargetId)
      if (!currentTarget || currentTarget.stats.hp <= 0) {
        const firstAlive = this.enemies.find(e => e.stats.hp > 0)
        this.selectedTargetId = firstAlive?.id || null
      }
    }
  }

  // Damage calculation following GDD rules
  calculateDamage(attacker: CombatEntity, defender: CombatEntity): DamageResult {
    let baseDamage = attacker.stats.damage
    const damageType = attacker.stats.damageType
    
    // Check for dodge first
    if (Math.random() * 100 < defender.stats.dodge) {
      return {
        damage: baseDamage,
        damageType,
        wasCrit: false,
        wasDodged: true,
        wasBlocked: false,
        actualDamage: 0,
        hitShield: false
      }
    }
    
    // Check for block (only physical damage can be blocked)
    if (damageType === 'physical' && Math.random() * 100 < defender.stats.block) {
      return {
        damage: baseDamage,
        damageType,
        wasCrit: false,
        wasDodged: false,
        wasBlocked: true,
        actualDamage: 0,
        hitShield: false
      }
    }
    
    // Check for crit
    const wasCrit = Math.random() * 100 < attacker.stats.critChance
    if (wasCrit) {
      baseDamage *= attacker.stats.critMultiplier
    }
    
    // Apply resistances/armor
    let finalDamage = baseDamage
    switch (damageType) {
      case 'physical':
        let armor = defender.stats.armor
        if (defender.isBlocking) {
          armor *= 2 // Block doubles armor
          finalDamage *= 0.75 // Block reduces damage by 25%
        }
        finalDamage *= (1 - armor / 100)
        break
      case 'fire':
        finalDamage *= (1 - defender.stats.fireRes / 100)
        break
      case 'lightning':
        finalDamage *= (1 - defender.stats.lightningRes / 100)
        break
      case 'ice':
        finalDamage *= (1 - defender.stats.iceRes / 100)
        break
      case 'dark':
        finalDamage *= (1 - defender.stats.darkRes / 100)
        break
    }
    
    finalDamage = Math.max(1, Math.floor(finalDamage)) // Minimum 1 damage
    
    return {
      damage: baseDamage,
      damageType,
      wasCrit,
      wasDodged: false,
      wasBlocked: false,
      actualDamage: finalDamage,
      hitShield: defender.stats.es > 0
    }
  }

  // Apply damage to entity (shield first, then HP)
  applyDamage(target: CombatEntity, result: DamageResult) {
    if (result.actualDamage === 0) return
    
    // Energy shield absorbs all damage types first
    if (target.stats.es > 0) {
      const shieldDamage = Math.min(target.stats.es, result.actualDamage)
      target.stats.es -= shieldDamage
      result.actualDamage -= shieldDamage
      result.hitShield = true
    }
    
    // Remaining damage goes to HP
    if (result.actualDamage > 0) {
      target.stats.hp = Math.max(0, target.stats.hp - result.actualDamage)
    }
  }

  // Utility methods
  selectTarget(enemyId: string) {
    this.selectedTargetId = enemyId
  }

  getRandomIntent(): string {
    const intents = ['attack', 'block', 'spell']
    return intents[Math.floor(Math.random() * intents.length)]
  }

  addToCombatLog(message: string) {
    this.combatLog.push(message)
    if (this.combatLog.length > 10) {
      this.combatLog.shift() // Keep only last 10 messages
    }
  }

  // Floating damage system
  showFloatingDamage(result: DamageResult, targetType: 'player' | 'enemy', targetId?: string) {
    const damageData: FloatingDamageData = {
      id: `damage_${Date.now()}_${Math.random()}`,
      damage: result.actualDamage,
      isCrit: result.wasCrit,
      isDodged: result.wasDodged,
      isBlocked: result.wasBlocked,
      position: this.getFloatingDamagePosition(targetType, targetId),
      targetType,
      targetId
    }
    
    this.floatingDamages.push(damageData)
  }

  getFloatingDamagePosition(targetType: 'player' | 'enemy', targetId?: string): { x: number, y: number } {
    if (targetType === 'player') {
      // Position over player health bar area
      return { x: 80, y: 50 }
    } else if (targetType === 'enemy' && targetId) {
      // Find enemy position and offset slightly
      const enemyIndex = this.enemies.findIndex(e => e.id === targetId)
      const positions = [
        { x: 30, y: 25 }, // Back left
        { x: 50, y: 20 }, // Back center  
        { x: 70, y: 25 }, // Back right
        { x: 35, y: 45 }, // Front left
        { x: 65, y: 45 }, // Front right
      ]
      
      if (enemyIndex >= 0 && enemyIndex < positions.length) {
        return {
          x: positions[enemyIndex].x + Math.random() * 20 - 10, // Add some randomness
          y: positions[enemyIndex].y - 20 // Above the enemy
        }
      }
    }
    
    return { x: 50, y: 30 } // Default position
  }

  removeFloatingDamage(damageId: string) {
    this.floatingDamages = this.floatingDamages.filter(damage => damage.id !== damageId)
  }

  // Progress to next fight or end dungeon
  nextFight() {
    this.currentFight++
    
    if (this.currentFight > this.totalFights) {
      // Dungeon complete - return to town
      this.endCombat()
      return 'dungeon_complete'
    } else {
      // Generate new enemies for next fight
      this.generateNextFight()
      return 'next_fight'
    }
  }

  generateNextFight() {
    // This would generate new enemies based on dungeon type
    // For now, just reset the same enemies with full HP
    this.enemies.forEach(enemy => {
      enemy.stats.hp = enemy.stats.maxHp
      enemy.stats.es = enemy.stats.maxEs
      enemy.isBlocking = false
      enemy.intent = this.getRandomIntent()
    })
    
    this.turnPhase = 'player'
    this.currentEnemyIndex = 0
    this.selectedTargetId = this.enemies.length > 0 ? this.enemies[0].id : null
    this.addToCombatLog(`Fight ${this.currentFight} begins!`)
  }

  endCombat() {
    this.isInCombat = false
    this.player = null
    this.enemies = []
    this.currentFight = 1
    this.combatLog = []
  }

  // Death penalty - remove random item
  applyDeathPenalty() {
    // This would integrate with InventoryStore to remove random items
    // Implementation depends on how inventory system is structured
    console.log('Death penalty applied - random item removed')
  }
}

export const combatStore = new CombatStore()