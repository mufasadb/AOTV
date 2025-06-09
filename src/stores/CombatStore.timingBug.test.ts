import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CombatStore } from './CombatStore'
import type { CombatStats } from './CombatStore'

// Create enemies that die in one hit to test timing
const createTimingTestEnemies = () => {
  return [
    {
      id: 'timing_enemy_1',
      name: 'Timing Enemy 1',
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
      id: 'timing_enemy_2', 
      name: 'Timing Enemy 2',
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
    generateEnemyEncounter: vi.fn(() => createTimingTestEnemies()),
    generateEnemyLoot: vi.fn(() => ({ gold: 10, items: [] }))
  }
}))

describe('CombatStore Timing Bug Test', () => {
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

  it('should reproduce timing bug when clicking attack too quickly', async () => {
    combatStore.initializeDungeon(mockPlayerStats, 1)
    
    console.log('=== INITIAL STATE ===')
    console.log('Turn phase:', combatStore.turnPhase)
    console.log('Selected target:', combatStore.selectedTargetId)
    console.log('Enemy 1 HP:', combatStore.enemies[0].stats.hp)
    console.log('Enemy 2 HP:', combatStore.enemies[1].stats.hp)
    
    // Attack first enemy
    console.log('\n=== ATTACKING ENEMY 1 ===')
    combatStore.playerAttack()
    
    // Immediately try to attack again (simulating rapid clicking)
    console.log('\n=== IMMEDIATE SECOND CLICK (simulating user clicking quickly) ===')
    console.log('Turn phase:', combatStore.turnPhase)
    console.log('Selected target:', combatStore.selectedTargetId)
    console.log('Processing turn:', combatStore.isProcessingTurn)
    
    const immediateResult = combatStore.playerAttack()
    console.log('Second attack result (should fail):', immediateResult)
    
    // Wait a bit and try again (simulating user clicking during enemy turn)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log('\n=== CLICK DURING ENEMY TURN (500ms later) ===')
    console.log('Turn phase:', combatStore.turnPhase)
    console.log('Selected target:', combatStore.selectedTargetId)
    console.log('Processing turn:', combatStore.isProcessingTurn)
    console.log('Enemy 1 HP:', combatStore.enemies[0].stats.hp)
    
    const duringEnemyTurnResult = combatStore.playerAttack()
    console.log('Attack during enemy turn result (should fail):', duringEnemyTurnResult)
    
    // Wait for enemy turn to complete
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('\n=== AFTER ENEMY TURN COMPLETES ===')
    console.log('Turn phase:', combatStore.turnPhase)
    console.log('Selected target:', combatStore.selectedTargetId)
    console.log('Processing turn:', combatStore.isProcessingTurn)
    console.log('Enemy 1 HP:', combatStore.enemies[0].stats.hp)
    console.log('Enemy 2 HP:', combatStore.enemies[1].stats.hp)
    
    // Now try to attack - this should work
    const selectedTarget = combatStore.enemies.find(e => e.id === combatStore.selectedTargetId)
    console.log('Selected target alive?', selectedTarget && selectedTarget.stats.hp > 0)
    
    const canAttack = combatStore.turnPhase === 'player' && 
                     combatStore.selectedTargetId && 
                     !combatStore.isProcessingTurn &&
                     selectedTarget &&
                     selectedTarget.stats.hp > 0
    
    console.log('Can attack now?', canAttack)
    
    if (canAttack) {
      console.log('\n=== PROPER ATTACK ON SECOND ENEMY ===')
      const beforeHp = combatStore.enemies[1].stats.hp
      combatStore.playerAttack()
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Enemy 2 HP after proper attack:', combatStore.enemies[1].stats.hp)
      expect(combatStore.enemies[1].stats.hp).toBeLessThan(beforeHp)
    } else {
      console.log('❌ BUG: Still cannot attack second enemy!')
      expect(canAttack).toBe(true)
    }
  })

  it('should show attack button state progression in UI terms', async () => {
    combatStore.initializeDungeon(mockPlayerStats, 1)
    
    // Helper function to check button state
    const checkButtonState = (label: string) => {
      const isDisabled = combatStore.turnPhase !== 'player' || 
                        !combatStore.selectedTargetId || 
                        combatStore.isProcessingTurn
      
      const selectedTarget = combatStore.enemies.find(e => e.id === combatStore.selectedTargetId)
      const targetValidation = selectedTarget && selectedTarget.stats.hp > 0
      
      console.log(`${label}:`)
      console.log('  Attack button disabled?', isDisabled)
      console.log('  - Turn phase:', combatStore.turnPhase)
      console.log('  - Selected target ID:', combatStore.selectedTargetId)
      console.log('  - Processing turn:', combatStore.isProcessingTurn)
      console.log('  Target validation passed?', targetValidation)
      
      return !isDisabled && targetValidation
    }
    
    // Initial state
    const canAttackInitially = checkButtonState('INITIAL STATE')
    expect(canAttackInitially).toBe(true)
    
    // Attack first enemy
    combatStore.playerAttack()
    
    // State during processing
    const canAttackDuringProcessing = checkButtonState('DURING ATTACK PROCESSING')
    expect(canAttackDuringProcessing).toBe(false)
    
    // Wait for attack + enemy turn
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    // State after turn cycle
    const canAttackAfterCycle = checkButtonState('AFTER TURN CYCLE')
    expect(canAttackAfterCycle).toBe(true)
  })
})