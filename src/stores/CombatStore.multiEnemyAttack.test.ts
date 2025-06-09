import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CombatStore } from './CombatStore'
import type { CombatStats } from './CombatStore'

// Helper to create mock enemies with low health for quick kills
const createWeakMockEnemies = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `weak_enemy_${i + 1}`,
    name: `Weak Enemy ${i + 1}`,
    stats: {
      hp: 1, maxHp: 1, mp: 0, maxMp: 0, es: 0, maxEs: 0, // Very low health for quick kills
      armor: 0, fireRes: 0, lightningRes: 0, iceRes: 0, darkRes: 0,
      dodge: 0, block: 0, critChance: 0, critMultiplier: 1.0, // No defensive stats
      damage: 5, damageType: 'physical' as const
    },
    isBlocking: false,
    intent: 'attack',
    abilities: []
  }))
}

// Mock the enemy system to return exactly 2 weak enemies for testing
vi.mock('../systems/EnemySystem', () => ({
  enemySystem: {
    generateEnemyEncounter: vi.fn(() => createWeakMockEnemies(2)),
    generateEnemyLoot: vi.fn(() => ({ gold: 10, items: [] }))
  }
}))

describe('CombatStore Multi-Enemy Attack Bug', () => {
  let combatStore: CombatStore
  let mockPlayerStats: CombatStats

  beforeEach(() => {
    combatStore = new CombatStore()
    mockPlayerStats = {
      hp: 100, maxHp: 100, mp: 50, maxMp: 50, es: 0, maxEs: 0,
      armor: 10, fireRes: 0, lightningRes: 0, iceRes: 0, darkRes: 0,
      dodge: 5, block: 5, critChance: 10, critMultiplier: 1.5,
      damage: 50, damageType: 'physical' // High damage to ensure kills
    }
  })

  it('should allow attacking the second enemy after defeating the first enemy', async () => {
    // Initialize combat with 2 weak enemies
    combatStore.initializeDungeon(mockPlayerStats, 1)
    
    // Verify we have 2 enemies
    expect(combatStore.enemies).toHaveLength(2)
    expect(combatStore.enemies[0].stats.hp).toBe(1)
    expect(combatStore.enemies[1].stats.hp).toBe(1)
    
    // Verify initial state
    expect(combatStore.turnPhase).toBe('player')
    expect(combatStore.selectedTargetId).toBe('weak_enemy_1')
    expect(combatStore.isProcessingTurn).toBe(false)
    
    // Attack the first enemy
    const firstEnemyInitialHp = combatStore.enemies[0].stats.hp
    combatStore.playerAttack()
    
    // Wait for attack processing and enemy turn to complete
    // Need extra time because: player attack (900ms) + enemy turn (1000ms) 
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Verify first enemy is dead
    expect(combatStore.enemies[0].stats.hp).toBe(0)
    expect(combatStore.enemies[0].stats.hp).toBeLessThan(firstEnemyInitialHp)
    
    // Verify second enemy is still alive
    expect(combatStore.enemies[1].stats.hp).toBe(1)
    
    // Check that combat has returned to player turn after enemy turn completed
    expect(combatStore.turnPhase).toBe('player') // Should return to player turn
    expect(combatStore.isProcessingTurn).toBe(false) // Should not be processing
    
    // Most importantly: verify target has switched to second enemy
    expect(combatStore.selectedTargetId).toBe('weak_enemy_2')
    
    // Now attempt to attack the second enemy
    const secondEnemyInitialHp = combatStore.enemies[1].stats.hp
    combatStore.playerAttack()
    
    // Wait for attack processing to complete (no enemy turn this time since all will be dead)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Verify the second enemy took damage
    expect(combatStore.enemies[1].stats.hp).toBeLessThan(secondEnemyInitialHp)
    expect(combatStore.enemies[1].stats.hp).toBe(0)
    
    // Now all enemies should be dead, combat should be in victory state
    expect(combatStore.turnPhase).toBe('victory')
  })

  it('should properly update selectedTargetId when enemies die', () => {
    combatStore.initializeDungeon(mockPlayerStats, 1)
    
    // Initially should target first enemy
    expect(combatStore.selectedTargetId).toBe('weak_enemy_1')
    
    // Manually kill first enemy
    combatStore.enemies[0].stats.hp = 0
    
    // Trigger target selection update
    combatStore.startNewTurn()
    
    // Should now target second enemy
    expect(combatStore.selectedTargetId).toBe('weak_enemy_2')
  })

  it('should validate attack conditions are met for second enemy', () => {
    combatStore.initializeDungeon(mockPlayerStats, 1)
    
    // Kill first enemy manually
    combatStore.enemies[0].stats.hp = 0
    combatStore.startNewTurn()
    
    // Verify attack conditions
    expect(combatStore.turnPhase).toBe('player') // Player turn
    expect(combatStore.selectedTargetId).toBe('weak_enemy_2') // Valid target
    expect(combatStore.isProcessingTurn).toBe(false) // Not processing
    
    // Find selected target
    const target = combatStore.enemies.find(e => e.id === combatStore.selectedTargetId)
    expect(target).toBeDefined()
    expect(target!.stats.hp).toBeGreaterThan(0) // Target is alive
    
    // All conditions should allow attack
    const canAttack = combatStore.turnPhase === 'player' && 
                     combatStore.selectedTargetId && 
                     !combatStore.isProcessingTurn &&
                     target &&
                     target.stats.hp > 0
    
    expect(canAttack).toBe(true)
  })
})