import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CombatStore } from '../stores/CombatStore'
import CombatView from './CombatView'

// Create enemies for testing button state
const createButtonTestEnemies = () => {
  return [
    {
      id: 'button_enemy_1',
      name: 'Button Enemy 1',
      stats: {
        hp: 0, maxHp: 25, mp: 0, maxMp: 0, es: 0, maxEs: 0, // Dead enemy
        armor: 0, fireRes: 0, lightningRes: 0, iceRes: 0, darkRes: 0,
        dodge: 0, block: 0, critChance: 0, critMultiplier: 1.0,
        damage: 5, damageType: 'physical' as const
      },
      isBlocking: false,
      intent: 'attack',
      abilities: []
    },
    {
      id: 'button_enemy_2', 
      name: 'Button Enemy 2',
      stats: {
        hp: 25, maxHp: 25, mp: 0, maxMp: 0, es: 0, maxEs: 0, // Alive enemy
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
    generateEnemyEncounter: vi.fn(() => createButtonTestEnemies()),
    generateEnemyLoot: vi.fn(() => ({ gold: 10, items: [] }))
  }
}))

// Mock the player store
vi.mock('../stores/PlayerStore', () => ({
  playerStore: {
    combatStats: {
      hp: 100, maxHp: 100, mp: 50, maxMp: 50, es: 0, maxEs: 0,
      armor: 10, fireRes: 0, lightningRes: 0, iceRes: 0, darkRes: 0,
      dodge: 5, block: 5, critChance: 10, critMultiplier: 1.5,
      damage: 50, damageType: 'physical'
    },
    vitals: { hp: 100, maxHp: 100, mp: 50, maxMp: 50, es: 0, maxEs: 0 },
    fullHeal: vi.fn(),
    updateVitals: vi.fn(),
    calculateTotalStat: vi.fn((stat: string) => {
      const stats: any = { maxHp: 100, maxMp: 50, maxEs: 0, armor: 10, attack: 50 }
      return stats[stat] || 0
    })
  }
}))

describe('CombatView Button Bug Test', () => {
  let mockOnNavigateToTown: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockOnNavigateToTown = vi.fn()
    vi.clearAllMocks()
  })

  it('should disable attack button when selected target is dead', async () => {
    // Create a combat store with a dead enemy selected
    const combatStore = new CombatStore()
    combatStore.initializeDungeon({
      hp: 100, maxHp: 100, mp: 50, maxMp: 50, es: 0, maxEs: 0,
      armor: 10, fireRes: 0, lightningRes: 0, iceRes: 0, darkRes: 0,
      dodge: 5, block: 5, critChance: 10, critMultiplier: 1.5,
      damage: 50, damageType: 'physical'
    }, 1)
    
    // Manually set up the bug scenario
    combatStore.turnPhase = 'player'
    combatStore.selectedTargetId = 'button_enemy_1' // Dead enemy
    combatStore.isProcessingTurn = false
    
    // Enemy 1 is dead, Enemy 2 is alive
    combatStore.enemies[0].stats.hp = 0
    combatStore.enemies[1].stats.hp = 25
    
    render(<CombatView onNavigateToTown={mockOnNavigateToTown} />)
    
    // Wait for render
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // The attack button should be disabled because selected target is dead
    const attackButton = screen.getByText('Attack').closest('button')
    expect(attackButton).toBeDisabled()
    
    console.log('=== BUTTON STATE WITH DEAD TARGET ===')
    console.log('Turn phase:', combatStore.turnPhase)
    console.log('Selected target:', combatStore.selectedTargetId)
    console.log('Processing turn:', combatStore.isProcessingTurn)
    console.log('Selected target HP:', combatStore.enemies.find(e => e.id === combatStore.selectedTargetId)?.stats.hp)
    console.log('Button disabled:', attackButton?.disabled)
  })

  it('should enable attack button when target switches to alive enemy', async () => {
    const combatStore = new CombatStore()
    combatStore.initializeDungeon({
      hp: 100, maxHp: 100, mp: 50, maxMp: 50, es: 0, maxEs: 0,
      armor: 10, fireRes: 0, lightningRes: 0, iceRes: 0, darkRes: 0,
      dodge: 5, block: 5, critChance: 10, critMultiplier: 1.5,
      damage: 50, damageType: 'physical'
    }, 1)
    
    // Set up scenario with alive enemy selected
    combatStore.turnPhase = 'player'
    combatStore.selectedTargetId = 'button_enemy_2' // Alive enemy
    combatStore.isProcessingTurn = false
    
    combatStore.enemies[0].stats.hp = 0
    combatStore.enemies[1].stats.hp = 25
    
    render(<CombatView onNavigateToTown={mockOnNavigateToTown} />)
    
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // The attack button should be enabled because selected target is alive
    const attackButton = screen.getByText('Attack').closest('button')
    
    console.log('=== BUTTON STATE WITH ALIVE TARGET ===')
    console.log('Turn phase:', combatStore.turnPhase)
    console.log('Selected target:', combatStore.selectedTargetId)
    console.log('Processing turn:', combatStore.isProcessingTurn)
    console.log('Selected target HP:', combatStore.enemies.find(e => e.id === combatStore.selectedTargetId)?.stats.hp)
    console.log('Button disabled:', attackButton?.disabled)
    
    // Debug each condition
    console.log('=== BUTTON DISABLED CONDITIONS ===')
    console.log('1. turnPhase !== player:', combatStore.turnPhase !== 'player')
    console.log('2. !selectedTargetId:', !combatStore.selectedTargetId)
    console.log('3. isProcessingTurn:', combatStore.isProcessingTurn)
    console.log('4. !target HP:', !combatStore.enemies.find(e => e.id === combatStore.selectedTargetId)?.stats.hp)
    
    expect(attackButton).not.toBeDisabled()
  })
})