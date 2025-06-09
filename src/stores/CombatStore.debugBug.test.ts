import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CombatStore } from './CombatStore'
import type { CombatStats } from './CombatStore'

// Create exactly 2 enemies for testing
const createTestEnemies = () => {
  return [
    {
      id: 'enemy_1',
      name: 'Enemy 1',
      stats: {
        hp: 1, maxHp: 1, mp: 0, maxMp: 0, es: 0, maxEs: 0,
        armor: 0, fireRes: 0, lightningRes: 0, iceRes: 0, darkRes: 0,
        dodge: 0, block: 0, critChance: 0, critMultiplier: 1.0,
        damage: 5, damageType: 'physical' as const
      },
      isBlocking: false,
      intent: 'attack',
      abilities: []
    },
    {
      id: 'enemy_2', 
      name: 'Enemy 2',
      stats: {
        hp: 1, maxHp: 1, mp: 0, maxMp: 0, es: 0, maxEs: 0,
        armor: 0, fireRes: 0, lightningRes: 0, iceRes: 0, darkRes: 0,
        dodge: 0, block: 0, critChance: 0, critMultiplier: 1.0,
        damage: 5, damageType: 'physical' as const
      },
      isBlocking: false,
      intent: 'attack',
      abilities: []
    }
  ]
}

// Mock the enemy system
vi.mock('../systems/EnemySystem', () => ({
  enemySystem: {
    generateEnemyEncounter: vi.fn(() => createTestEnemies()),
    generateEnemyLoot: vi.fn(() => ({ gold: 10, items: [] }))
  }
}))

describe('CombatStore Debug Bug', () => {
  let combatStore: CombatStore
  let mockPlayerStats: CombatStats

  beforeEach(() => {
    combatStore = new CombatStore()
    mockPlayerStats = {
      hp: 100, maxHp: 100, mp: 50, maxMp: 50, es: 0, maxEs: 0,
      armor: 10, fireRes: 0, lightningRes: 0, iceRes: 0, darkRes: 0,
      dodge: 5, block: 5, critChance: 10, critMultiplier: 1.5,
      damage: 50, damageType: 'physical'
    }
  })

  it('should debug the exact state progression during multi-enemy combat', async () => {
    // Initialize combat
    combatStore.initializeDungeon(mockPlayerStats, 1)
    
    console.log('=== INITIAL STATE ===')
    console.log('Turn phase:', combatStore.turnPhase)
    console.log('Selected target:', combatStore.selectedTargetId)
    console.log('Processing turn:', combatStore.isProcessingTurn)
    console.log('Enemy 1 HP:', combatStore.enemies[0].stats.hp)
    console.log('Enemy 2 HP:', combatStore.enemies[1].stats.hp)
    
    // Check attack button conditions
    const canAttack1 = combatStore.turnPhase === 'player' && 
                      combatStore.selectedTargetId && 
                      !combatStore.isProcessingTurn
    console.log('Can attack initially:', canAttack1)
    
    // Attack first enemy
    console.log('\n=== ATTACKING ENEMY 1 ===')
    combatStore.playerAttack()
    
    console.log('Immediately after attack call:')
    console.log('Turn phase:', combatStore.turnPhase)
    console.log('Selected target:', combatStore.selectedTargetId)
    console.log('Processing turn:', combatStore.isProcessingTurn)
    
    // Wait for attack to process (300ms delay + 600ms animation)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('\n=== AFTER ATTACK PROCESSING (1000ms) ===')
    console.log('Turn phase:', combatStore.turnPhase)
    console.log('Selected target:', combatStore.selectedTargetId)
    console.log('Processing turn:', combatStore.isProcessingTurn)
    console.log('Enemy 1 HP:', combatStore.enemies[0].stats.hp)
    console.log('Enemy 2 HP:', combatStore.enemies[1].stats.hp)
    
    // Wait for enemy turn to complete (enemy attack takes ~1000ms)
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    console.log('\n=== AFTER ENEMY TURN (2500ms total) ===')
    console.log('Turn phase:', combatStore.turnPhase)
    console.log('Selected target:', combatStore.selectedTargetId)
    console.log('Processing turn:', combatStore.isProcessingTurn)
    console.log('Enemy 1 HP:', combatStore.enemies[0].stats.hp)
    console.log('Enemy 2 HP:', combatStore.enemies[1].stats.hp)
    
    // Check if we can attack now
    const selectedTarget = combatStore.enemies.find(e => e.id === combatStore.selectedTargetId)
    console.log('Selected target object:', selectedTarget)
    console.log('Selected target alive?', selectedTarget && selectedTarget.stats.hp > 0)
    
    const canAttack2 = combatStore.turnPhase === 'player' && 
                      combatStore.selectedTargetId && 
                      !combatStore.isProcessingTurn &&
                      selectedTarget &&
                      selectedTarget.stats.hp > 0
    console.log('Can attack enemy 2:', canAttack2)
    
    // Try to attack enemy 2
    console.log('\n=== ATTEMPTING TO ATTACK ENEMY 2 ===')
    const beforeAttackHp = combatStore.enemies[1].stats.hp
    console.log('Enemy 2 HP before attack:', beforeAttackHp)
    
    const attackResult = combatStore.playerAttack()
    console.log('Attack method return:', attackResult)
    console.log('Processing turn after attack call:', combatStore.isProcessingTurn)
    
    // Wait for attack to process
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('\n=== AFTER SECOND ATTACK ===')
    console.log('Enemy 2 HP after attack:', combatStore.enemies[1].stats.hp)
    console.log('Did damage occur?', combatStore.enemies[1].stats.hp < beforeAttackHp)
    console.log('Turn phase:', combatStore.turnPhase)
    
    // Verify the attack actually worked
    expect(combatStore.enemies[1].stats.hp).toBeLessThan(beforeAttackHp)
  })
})