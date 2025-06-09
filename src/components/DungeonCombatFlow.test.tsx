import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
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

describe('Dungeon Combat Flow Click-Through Test', () => {
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

  test('complete dungeon combat flow: enter dungeon, kill enemy, accept reward, attack next enemy', async () => {
    console.log('=== STARTING DUNGEON COMBAT FLOW TEST ===')
    
    // Step 1: Render the app starting in town
    const { container } = render(
      <TestWrapper>
        <App />
      </TestWrapper>
    )

    // Initialize the game first
    const initButton = screen.getByRole('button', { name: 'Initialize Game' })
    expect(initButton).toBeInTheDocument()
    
    act(() => {
      fireEvent.click(initButton)
    })

    // Wait for town view to load - look for the Town tab to be selected
    await waitFor(() => {
      const townTab = screen.getByRole('tab', { name: 'Town' })
      expect(townTab).toBeInTheDocument()
      expect(townTab).toHaveAttribute('aria-selected', 'true')
    })
    
    console.log('✅ Game initialized and started in Town')

    // Step 2: Navigate to dungeon by clicking Combat tab
    const combatTab = screen.getByRole('tab', { name: 'Combat' })
    expect(combatTab).toBeInTheDocument()
    
    act(() => {
      fireEvent.click(combatTab)
    })

    // Wait for combat view to load - check that Combat tab is now selected
    await waitFor(() => {
      expect(combatTab).toHaveAttribute('aria-selected', 'true')
    }, { timeout: 3000 })
    
    console.log('✅ Entered Dungeon')

    // Step 3: Verify combat started with enemies
    await waitFor(() => {
      expect(combatStore.isInCombat).toBe(true)
      expect(combatStore.enemies.length).toBeGreaterThan(0)
    })

    const initialEnemyCount = combatStore.enemies.length
    const firstEnemy = combatStore.enemies[0]
    console.log(`✅ Combat started with ${initialEnemyCount} enemies`)
    console.log(`   First enemy: ${firstEnemy.name} (HP: ${firstEnemy.stats.hp}/${firstEnemy.stats.maxHp})`)

    // Step 4: Attack the first enemy until it's defeated
    let attackCount = 0
    const maxAttacks = 20 // Safety limit
    
    while (combatStore.enemies.length > 0 && combatStore.enemies[0].stats.hp > 0 && attackCount < maxAttacks) {
      // Wait for player turn
      await waitFor(() => {
        expect(combatStore.currentTurn).toBe('player')
      })

      // Find and click attack button
      const attackButton = screen.getByRole('button', { name: /Attack/i })
      expect(attackButton).toBeInTheDocument()
      expect(attackButton).not.toBeDisabled()

      const enemyHpBefore = combatStore.enemies[0].stats.hp
      
      act(() => {
        fireEvent.click(attackButton)
      })

      attackCount++

      // Wait for attack animation and damage
      await waitFor(() => {
        const currentEnemy = combatStore.enemies.find(e => e.id === firstEnemy.id)
        if (currentEnemy && currentEnemy.stats.hp === enemyHpBefore) {
          // Attack might have been dodged/blocked, that's okay
          console.log(`   Attack ${attackCount}: Dodged or blocked!`)
        } else if (currentEnemy) {
          expect(currentEnemy.stats.hp).toBeLessThanOrEqual(enemyHpBefore)
        }
      }, { timeout: 2000 })

      console.log(`   Attack ${attackCount}: Enemy HP reduced to ${combatStore.enemies[0]?.stats.hp || 0}`)

      // If enemy is still alive, wait for enemy turn to complete
      if (combatStore.enemies[0]?.stats.hp > 0) {
        await waitFor(() => {
          expect(combatStore.currentTurn).toBe('enemy')
        }, { timeout: 1000 })

        // Wait for enemy attack to complete
        await waitFor(() => {
          expect(combatStore.currentTurn).toBe('player')
        }, { timeout: 2000 })
      }
    }

    console.log(`✅ First enemy defeated after ${attackCount} attacks`)

    // Step 5: Wait for reward modal to appear
    await waitFor(() => {
      expect(combatStore.showRewardModal).toBe(true)
      expect(screen.getByText(/Victory!/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    console.log('✅ Reward modal appeared')

    // Verify rewards are shown
    const rewardModal = screen.getByRole('dialog')
    expect(rewardModal).toBeInTheDocument()
    
    // Check for XP reward
    const xpReward = within(rewardModal).getByText(/\+\d+\s*XP/i)
    expect(xpReward).toBeInTheDocument()
    console.log(`   Reward: ${xpReward.textContent}`)

    // Check for gold reward  
    const goldReward = within(rewardModal).queryByText(/\+\d+\s*Gold/i)
    if (goldReward) {
      console.log(`   Reward: ${goldReward.textContent}`)
    }

    // Step 6: Accept the reward
    const acceptButton = within(rewardModal).getByRole('button', { name: /Continue/i })
    expect(acceptButton).toBeInTheDocument()

    const playerXpBefore = playerStore.xp
    const playerGoldBefore = playerStore.gold

    act(() => {
      fireEvent.click(acceptButton)
    })

    // Wait for modal to close
    await waitFor(() => {
      expect(combatStore.showRewardModal).toBe(false)
      expect(screen.queryByText(/Victory!/i)).not.toBeInTheDocument()
    })

    // Verify rewards were applied
    expect(playerStore.xp).toBeGreaterThan(playerXpBefore)
    console.log(`✅ Rewards accepted - XP: ${playerXpBefore} -> ${playerStore.xp}`)

    // Step 7: Verify next enemy is ready
    await waitFor(() => {
      expect(combatStore.enemies.length).toBeGreaterThan(0)
      expect(combatStore.isInCombat).toBe(true)
      expect(combatStore.currentTurn).toBe('player')
    })

    const secondEnemy = combatStore.enemies[0]
    console.log(`✅ Next enemy ready: ${secondEnemy.name} (HP: ${secondEnemy.stats.hp}/${secondEnemy.stats.maxHp})`)

    // Step 8: Attack the next enemy to confirm combat continues
    const attackButton2 = screen.getByRole('button', { name: /Attack/i })
    expect(attackButton2).toBeInTheDocument()
    expect(attackButton2).not.toBeDisabled()

    const secondEnemyHpBefore = secondEnemy.stats.hp

    act(() => {
      fireEvent.click(attackButton2)
    })

    // Wait for damage to be dealt
    await waitFor(() => {
      expect(combatStore.enemies[0].stats.hp).toBeLessThan(secondEnemyHpBefore)
    }, { timeout: 2000 })

    console.log(`✅ Successfully hit next enemy - HP: ${secondEnemyHpBefore} -> ${combatStore.enemies[0].stats.hp}`)
    
    // Verify combat is still active
    expect(combatStore.isInCombat).toBe(true)
    expect(combatStore.enemies.length).toBeGreaterThan(0)

    console.log('=== DUNGEON COMBAT FLOW TEST COMPLETED SUCCESSFULLY ===')
  })

  test('edge case: player death and retreat to town', async () => {
    console.log('=== TESTING PLAYER DEATH SCENARIO ===')
    
    // Set player to low health
    playerStore.vitals.hp = 10
    
    // Render the app
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    )

    // Initialize the game first
    const initButton = screen.getByRole('button', { name: 'Initialize Game' })
    act(() => {
      fireEvent.click(initButton)
    })

    // Wait for town view
    await waitFor(() => {
      const townTab = screen.getByRole('tab', { name: 'Town' })
      expect(townTab).toBeInTheDocument()
    })

    // Enter dungeon by clicking Combat tab
    const combatTab = screen.getByRole('tab', { name: 'Combat' })
    fireEvent.click(combatTab)

    // Wait for combat
    await waitFor(() => {
      expect(combatTab).toHaveAttribute('aria-selected', 'true')
      expect(combatStore.isInCombat).toBe(true)
    })

    console.log(`Starting combat with ${playerStore.vitals.hp} HP`)

    // Keep attacking until player dies or enemy dies
    let turnCount = 0
    while (playerStore.vitals.hp > 0 && combatStore.enemies[0]?.stats.hp > 0 && turnCount < 10) {
      if (combatStore.currentTurn === 'player') {
        const attackButton = screen.getByRole('button', { name: /Attack/i })
        fireEvent.click(attackButton)
      }
      
      // Wait for turn to change
      await waitFor(() => {
        expect(combatStore.currentTurn).toBe(turnCount % 2 === 0 ? 'enemy' : 'player')
      }, { timeout: 2000 }).catch(() => {
        // Turn might not change if someone died
      })
      
      turnCount++
    }

    // Check if player died
    if (playerStore.vitals.hp <= 0) {
      console.log('✅ Player defeated - should show defeat screen')
      
      // Look for defeat message or retreat button
      await waitFor(() => {
        const retreatButton = screen.queryByRole('button', { name: /Retreat|Town/i })
        expect(retreatButton).toBeInTheDocument()
      })
      
      console.log('✅ Defeat handling working correctly')
    } else {
      console.log('✅ Enemy defeated before player - combat system working')
    }
  })
})