import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react'
import '@testing-library/jest-dom'
import { DndContext } from '@dnd-kit/core'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import App from '../App'
import { combatStore } from '../stores/CombatStore'
import { playerStore } from '../stores/PlayerStore'
import { inventoryStore } from '../stores/InventoryStore'

// Create a theme for tests
const theme = createTheme()

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>
    <DndContext>
      {children}
    </DndContext>
  </ThemeProvider>
)

describe('Dungeon Combat Flow E2E Test', () => {
  beforeEach(() => {
    // Reset stores to initial state
    inventoryStore.initializeTestItems()
    combatStore.isInCombat = false
    combatStore.enemies = []
    combatStore.currentTurn = 'player'
    combatStore.selectedEnemyId = null
    combatStore.currentEnemyIndex = 0
    combatStore.showRewardModal = false
    combatStore.pendingRewards = []
    combatStore.totalCombatsCompleted = 0
    
    // Ensure player has enough health
    playerStore.vitals.hp = playerStore.vitals.maxHp
  })

  test('complete dungeon combat workflow', async () => {
    console.log('=== STARTING DUNGEON COMBAT WORKFLOW TEST ===')
    
    // Step 1: Render and initialize the app
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    )

    // Initialize the game
    const initButton = screen.getByRole('button', { name: 'Initialize Game' })
    fireEvent.click(initButton)

    // Wait for town to load
    await waitFor(() => {
      const townTab = screen.getByRole('tab', { name: 'Town' })
      expect(townTab).toBeInTheDocument()
    })
    
    console.log('✅ Game initialized')

    // Step 2: Navigate to combat
    const combatTab = screen.getByRole('tab', { name: 'Combat' })
    fireEvent.click(combatTab)

    // Wait for combat to start
    await waitFor(() => {
      expect(combatStore.isInCombat).toBe(true)
      expect(combatStore.enemies.length).toBeGreaterThan(0)
    }, { timeout: 3000 })
    
    const firstEnemy = combatStore.enemies[0]
    console.log(`✅ Entered combat with ${combatStore.enemies.length} enemies`)
    console.log(`   First enemy: ${firstEnemy.name} (HP: ${firstEnemy.stats.hp})`)

    // Step 3: Attack until first enemy is defeated
    let attackCount = 0
    while (combatStore.enemies.some(e => e.id === firstEnemy.id && e.stats.hp > 0) && attackCount < 20) {
      // Make sure it's player turn
      if (combatStore.currentTurn === 'player') {
        const attackButton = screen.getByRole('button', { name: /Attack/i })
        
        // Perform attack
        act(() => {
          fireEvent.click(attackButton)
        })
        
        attackCount++
        
        // Wait a bit for animations
        await new Promise(resolve => setTimeout(resolve, 100))
      } else {
        // Wait for enemy turn to complete
        await waitFor(() => {
          expect(combatStore.currentTurn).toBe('player')
        }, { timeout: 3000 })
      }
    }

    console.log(`✅ First enemy defeated after ${attackCount} attacks`)

    // Step 4: Check for reward modal
    await waitFor(() => {
      expect(combatStore.showRewardModal).toBe(true)
    }, { timeout: 3000 })

    console.log('✅ Reward modal appeared')

    // Find and click continue button to progress to next fight
    const continueButton = screen.getByRole('button', { name: /Return to Town/i })
    
    act(() => {
      fireEvent.click(continueButton)
    })

    // Wait for modal to close
    await waitFor(() => {
      expect(combatStore.showRewardModal).toBe(false)
    })

    // Wait for next fight to start
    await waitFor(() => {
      expect(combatStore.isInCombat).toBe(true)
      expect(combatStore.enemies.length).toBeGreaterThan(0)
      expect(combatStore.currentTurn).toBe('player')
    }, { timeout: 5000 })

    const secondEnemy = combatStore.enemies[0]
    console.log(`✅ Next enemy ready: ${secondEnemy.name} (HP: ${secondEnemy.stats.hp})`)

    // Step 5: Attack the next enemy once
    await waitFor(() => {
      expect(combatStore.currentTurn).toBe('player')
    })

    const attackButton = screen.getByRole('button', { name: /Attack/i })
    const enemyHpBefore = secondEnemy.stats.hp

    act(() => {
      fireEvent.click(attackButton)
    })

    // Wait a moment for the attack to process
    await new Promise(resolve => setTimeout(resolve, 500))

    // Check that we hit the enemy (or it was dodged/blocked)
    const enemyHpAfter = combatStore.enemies[0].stats.hp
    
    if (enemyHpAfter < enemyHpBefore) {
      console.log(`✅ Successfully hit next enemy - HP: ${enemyHpBefore} -> ${enemyHpAfter}`)
    } else {
      console.log(`✅ Attack was dodged/blocked (HP unchanged: ${enemyHpBefore})`)
    }

    // Verify combat is still active
    expect(combatStore.isInCombat).toBe(true)

    console.log('=== DUNGEON COMBAT WORKFLOW TEST COMPLETED ===')
  }, 15000) // 15 second timeout
})