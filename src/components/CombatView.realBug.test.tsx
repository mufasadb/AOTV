import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { CombatStats } from '../stores/CombatStore'
import CombatView from './CombatView'

// Helper to create mock enemies with low health for quick kills
const createWeakMockEnemies = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `weak_enemy_${i + 1}`,
    name: `Weak Enemy ${i + 1}`,
    stats: {
      hp: 1, maxHp: 1, mp: 0, maxMp: 0, es: 0, maxEs: 0,
      armor: 0, fireRes: 0, lightningRes: 0, iceRes: 0, darkRes: 0,
      dodge: 0, block: 0, critChance: 0, critMultiplier: 1.0,
      damage: 5, damageType: 'physical' as const
    },
    isBlocking: false,
    intent: 'attack',
    abilities: []
  }))
}

// Mock the enemy system
vi.mock('../systems/EnemySystem', () => ({
  enemySystem: {
    generateEnemyEncounter: vi.fn(() => createWeakMockEnemies(2)),
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
    } as CombatStats,
    vitals: { hp: 100, maxHp: 100, mp: 50, maxMp: 50, es: 0, maxEs: 0 },
    fullHeal: vi.fn(),
    updateVitals: vi.fn(),
    calculateTotalStat: vi.fn((stat: string) => {
      const stats: any = { maxHp: 100, maxMp: 50, maxEs: 0, armor: 10, attack: 50 }
      return stats[stat] || 0
    })
  }
}))

describe('CombatView Real Multi-Enemy Attack Bug', () => {
  let mockOnNavigateToTown: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockOnNavigateToTown = vi.fn()
    vi.clearAllMocks()
  })

  it('should keep attack button enabled after killing first enemy in UI', async () => {
    render(<CombatView onNavigateToTown={mockOnNavigateToTown} />)
    
    // Wait for combat to initialize
    await waitFor(() => {
      expect(screen.getByText('Attack')).toBeInTheDocument()
    })

    // Verify initial state - attack button should be enabled
    const attackButton = screen.getByText('Attack').closest('button')
    expect(attackButton).not.toBeDisabled()
    
    // Click attack button to kill first enemy
    fireEvent.click(attackButton!)
    
    // Wait for the attack animation and enemy turn to complete
    // This should match real timing in the app
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    // Check if attack button is enabled again for the second enemy
    await waitFor(() => {
      const attackButtonAfter = screen.getByText('Attack').closest('button')
      expect(attackButtonAfter).not.toBeDisabled()
    }, { timeout: 3000 })
    
    // Try to attack the second enemy
    const finalAttackButton = screen.getByText('Attack').closest('button')
    expect(finalAttackButton).not.toBeDisabled()
    
    fireEvent.click(finalAttackButton!)
    
    // This should work without throwing errors
    // If the bug exists, the click won't do anything because conditions aren't met
  })

  it('should show correct turn phase and target selection after first enemy dies', async () => {
    render(<CombatView onNavigateToTown={mockOnNavigateToTown} />)
    
    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('🗡️ Your Turn')).toBeInTheDocument()
    })
    
    // Attack first enemy
    const attackButton = screen.getByText('Attack').closest('button')
    fireEvent.click(attackButton!)
    
    // Wait for turn sequence to complete
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Should be back to player turn
    await waitFor(() => {
      expect(screen.getByText('🗡️ Your Turn')).toBeInTheDocument()
    }, { timeout: 1000 })
    
    // Attack button should be enabled
    const finalAttackButton = screen.getByText('Attack').closest('button')
    expect(finalAttackButton).not.toBeDisabled()
  })
})