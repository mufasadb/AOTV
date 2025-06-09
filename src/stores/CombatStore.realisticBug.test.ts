import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CombatStore } from './CombatStore'
import type { CombatStats } from './CombatStore'

// Create realistic enemies similar to actual game data
const createRealisticEnemies = () => {
  return [
    {
      id: 'goblin_warrior_0',
      name: 'Goblin Warrior',
      stats: {
        hp: 45, maxHp: 45, mp: 5, maxMp: 5, es: 0, maxEs: 0,
        armor: 5, fireRes: 0, lightningRes: 0, iceRes: 0, darkRes: 5,
        dodge: 10, block: 0, critChance: 12, critMultiplier: 1.3,
        damage: 12, damageType: 'physical' as const
      },
      isBlocking: false,
      intent: 'attack',
      abilities: []
    },
    {
      id: 'goblin_scout_1', 
      name: 'Goblin Scout',
      stats: {
        hp: 25, maxHp: 25, mp: 5, maxMp: 5, es: 0, maxEs: 0,
        armor: 2, fireRes: 0, lightningRes: 0, iceRes: 0, darkRes: 5,
        dodge: 15, block: 0, critChance: 8, critMultiplier: 1.2,
        damage: 8, damageType: 'physical' as const
      },
      isBlocking: false,
      intent: 'attack',
      abilities: []
    }
  ]
}

// Mock the enemy system with realistic enemies
vi.mock('../systems/EnemySystem', () => ({
  enemySystem: {
    generateEnemyEncounter: vi.fn(() => createRealisticEnemies()),
    generateEnemyLoot: vi.fn(() => ({ gold: 10, items: [] }))
  }
}))

describe('CombatStore Realistic Bug Test', () => {
  let combatStore: CombatStore
  let mockPlayerStats: CombatStats

  beforeEach(() => {
    combatStore = new CombatStore()
    // Strong player that can kill enemies in 2-3 hits
    mockPlayerStats = {
      hp: 100, maxHp: 100, mp: 50, maxMp: 50, es: 0, maxEs: 0,
      armor: 10, fireRes: 0, lightningRes: 0, iceRes: 0, darkRes: 0,
      dodge: 5, block: 5, critChance: 10, critMultiplier: 1.5,
      damage: 30, damageType: 'physical' // Should kill goblin scout in ~2 hits
    }
  })

  it('should reproduce bug with realistic combat scenario', async () => {
    // Initialize combat
    combatStore.initializeDungeon(mockPlayerStats, 1)
    
    console.log('=== INITIAL STATE ===')
    console.log('Enemies:', combatStore.enemies.map(e => `${e.name}: ${e.stats.hp}/${e.stats.maxHp} HP`))
    console.log('Selected target:', combatStore.selectedTargetId)
    console.log('Turn phase:', combatStore.turnPhase)
    
    // Attack first enemy multiple times until it dies
    let attackCount = 0
    while (combatStore.enemies[0].stats.hp > 0 && attackCount < 5) {
      attackCount++
      console.log(`\n=== ATTACK ${attackCount} ON ENEMY 1 ===`)
      console.log('Before attack - Enemy 1 HP:', combatStore.enemies[0].stats.hp)
      console.log('Turn phase:', combatStore.turnPhase)
      console.log('Selected target:', combatStore.selectedTargetId)
      console.log('Can attack:', combatStore.turnPhase === 'player' && combatStore.selectedTargetId && !combatStore.isProcessingTurn)
      
      // Attempt attack
      combatStore.playerAttack()
      
      // Wait for full attack + enemy turn cycle
      await new Promise(resolve => setTimeout(resolve, 2500))
      
      console.log('After attack cycle - Enemy 1 HP:', combatStore.enemies[0].stats.hp)
      console.log('Turn phase:', combatStore.turnPhase)
      console.log('Selected target:', combatStore.selectedTargetId)
      
      // If enemy 1 died, check if we can attack enemy 2
      if (combatStore.enemies[0].stats.hp <= 0) {
        console.log('\n=== ENEMY 1 DIED - CHECKING ENEMY 2 ATTACK ===')
        console.log('Enemy 2 HP:', combatStore.enemies[1].stats.hp)
        console.log('Turn phase:', combatStore.turnPhase)
        console.log('Selected target:', combatStore.selectedTargetId)
        console.log('Processing turn:', combatStore.isProcessingTurn)
        
        const selectedTarget = combatStore.enemies.find(e => e.id === combatStore.selectedTargetId)
        console.log('Selected target exists and alive:', selectedTarget && selectedTarget.stats.hp > 0)
        
        const canAttackSecond = combatStore.turnPhase === 'player' && 
                               combatStore.selectedTargetId && 
                               !combatStore.isProcessingTurn &&
                               selectedTarget && 
                               selectedTarget.stats.hp > 0
        console.log('Can attack second enemy:', canAttackSecond)
        
        if (canAttackSecond) {
          console.log('=== ATTACKING SECOND ENEMY ===')
          const beforeHp = combatStore.enemies[1].stats.hp
          combatStore.playerAttack()
          
          // Wait for attack
          await new Promise(resolve => setTimeout(resolve, 1000))
          console.log('Second enemy HP after attack:', combatStore.enemies[1].stats.hp)
          console.log('Did damage occur?', combatStore.enemies[1].stats.hp < beforeHp)
          
          expect(combatStore.enemies[1].stats.hp).toBeLessThan(beforeHp)
          return // Test completed successfully
        } else {
          console.log('❌ BUG REPRODUCED: Cannot attack second enemy!')
          // This would be the bug condition
          expect(canAttackSecond).toBe(true) // This should fail if bug exists
        }
        break
      }
    }
    
    if (attackCount >= 5) {
      throw new Error('Enemy 1 did not die after 5 attacks - test setup issue')
    }
  })
})