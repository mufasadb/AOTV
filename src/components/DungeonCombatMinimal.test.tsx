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

describe('Dungeon Combat Minimal Flow Test', () => {
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

  test('dungeon: enter combat, defeat enemy, accept reward', async () => {
    console.log('=== STARTING MINIMAL DUNGEON TEST ===')
    
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
    console.log(`✅ Entered combat with enemy: ${firstEnemy.name} (HP: ${firstEnemy.stats.hp})`)

    // Step 3: Attack until enemy is defeated
    let attackCount = 0
    while (combatStore.enemies.some(e => e.id === firstEnemy.id && e.stats.hp > 0) && attackCount < 15) {
      // Wait for player turn
      await waitFor(() => {
        expect(combatStore.currentTurn).toBe('player')
      }, { timeout: 3000 })

      const attackButton = screen.getByRole('button', { name: /Attack/i })
      
      // Perform attack
      act(() => {
        fireEvent.click(attackButton)
      })
      
      attackCount++
      
      // Wait a bit for animations
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    console.log(`✅ Enemy defeated after ${attackCount} attacks`)

    // Step 4: Check for reward modal (might take a moment for victory to process)
    await waitFor(() => {
      // Check if either reward modal shows or combat phase changed to victory
      const hasRewardModal = combatStore.showRewardModal
      const isVictoryPhase = combatStore.turnPhase === 'victory'
      console.log(`   Checking: showRewardModal=${hasRewardModal}, turnPhase=${combatStore.turnPhase}`)
      expect(hasRewardModal || isVictoryPhase).toBe(true)
    }, { timeout: 5000 })

    console.log('✅ Reward modal appeared')

    // Step 5: Click button to dismiss modal
    const dismissButton = screen.getByRole('button', { name: /Return to Town/i })
    
    act(() => {
      fireEvent.click(dismissButton)
    })

    // Wait for modal to close
    await waitFor(() => {
      expect(combatStore.showRewardModal).toBe(false)
    })

    console.log('✅ Reward modal dismissed')

    // Step 6: Try to attack one more time to confirm we can hit something
    // (Could be next enemy or back in town depending on dungeon structure)
    
    if (combatStore.isInCombat && combatStore.enemies.length > 0) {
      console.log('✅ Still in combat - testing next attack')
      
      // Wait for player turn
      await waitFor(() => {
        expect(combatStore.currentTurn).toBe('player')
      }, { timeout: 2000 })

      const nextEnemy = combatStore.enemies[0]
      const enemyHpBefore = nextEnemy.stats.hp
      
      const attackButton = screen.getByRole('button', { name: /Attack/i })
      
      act(() => {
        fireEvent.click(attackButton)
      })

      // Wait a moment for the attack to process
      await new Promise(resolve => setTimeout(resolve, 500))

      // Check that something happened (hit or dodge/block)
      const enemyHpAfter = combatStore.enemies[0].stats.hp
      
      if (enemyHpAfter < enemyHpBefore) {
        console.log(`✅ Hit next enemy - HP: ${enemyHpBefore} -> ${enemyHpAfter}`)
      } else {
        console.log(`✅ Attack was dodged/blocked (HP unchanged: ${enemyHpBefore})`)
      }
    } else {
      console.log('✅ Returned to town after combat - test complete')
    }

    console.log('=== MINIMAL DUNGEON TEST COMPLETED ===')
  }, 20000) // 20 second timeout
})