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

describe('Real Enemy Stats Investigation', () => {
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

  test('investigate real enemy stats and damage calculation', async () => {
    console.log('=== INVESTIGATING REAL ENEMY STATS ===')
    
    // Step 1: Setup and enter combat
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    )

    const initButton = screen.getByRole('button', { name: 'Initialize Game' })
    fireEvent.click(initButton)

    await waitFor(() => {
      const townTab = screen.getByRole('tab', { name: 'Town' })
      expect(townTab).toBeInTheDocument()
    })

    const combatTab = screen.getByRole('tab', { name: 'Combat' })
    fireEvent.click(combatTab)

    await waitFor(() => {
      expect(combatStore.isInCombat).toBe(true)
      expect(combatStore.enemies.length).toBeGreaterThan(0)
    }, { timeout: 3000 })
    
    // Step 2: Investigate enemy stats
    const enemy = combatStore.enemies[0]
    console.log(`=== REAL ENEMY: ${enemy.name} ===`)
    console.log('Enemy stats:', JSON.stringify(enemy.stats, null, 2))
    
    // Step 3: Investigate player stats
    const playerStats = playerStore.combatStats
    console.log(`=== PLAYER STATS ===`)
    console.log('Player stats:', JSON.stringify(playerStats, null, 2))
    
    // Step 4: Create player entity like combat system does
    const playerEntity = {
      id: 'player',
      name: 'Player',
      stats: playerStats,
      intent: undefined,
      isBlocking: false
    }
    
    // Step 5: Test damage calculation manually
    console.log(`=== MANUAL DAMAGE CALCULATION ===`)
    const damageResult = combatStore.calculateDamage(playerEntity, enemy)
    console.log('Damage result:', JSON.stringify(damageResult, null, 2))
    
    // Step 6: Test 10 damage calculations to see hit rate
    let hits = 0
    let dodges = 0
    let blocks = 0
    
    for (let i = 0; i < 10; i++) {
      const result = combatStore.calculateDamage(playerEntity, enemy)
      if (result.wasDodged) {
        dodges++
      } else if (result.wasBlocked) {
        blocks++
      } else if (result.actualDamage > 0) {
        hits++
      }
    }
    
    console.log(`=== 10 ATTACK TEST ===`)
    console.log(`Hits: ${hits}`)
    console.log(`Dodges: ${dodges}`)
    console.log(`Blocks: ${blocks}`)
    console.log(`Hit rate: ${(hits / 10) * 100}%`)
    
    // Step 7: Check what happens in actual UI attack
    console.log(`=== TESTING ACTUAL UI ATTACK ===`)
    
    await waitFor(() => {
      expect(combatStore.currentTurn).toBe('player')
    }, { timeout: 3000 })

    const attackButton = screen.getByRole('button', { name: /Attack/i })
    const enemyHpBefore = enemy.stats.hp
    
    console.log(`Enemy HP before UI attack: ${enemyHpBefore}`)
    
    // Check if enemy is the selected target
    console.log(`Selected target ID: ${combatStore.selectedTargetId}`)
    console.log(`Enemy ID: ${enemy.id}`)
    
    // Check if attack button is disabled
    const isDisabled = attackButton.hasAttribute('disabled') || attackButton.getAttribute('aria-disabled') === 'true'
    console.log(`Attack button disabled: ${isDisabled}`)
    
    // Check the disabled conditions
    console.log(`Button disabled conditions:`, {
      turnPhase: combatStore.turnPhase,
      expectedTurnPhase: 'player',
      turnPhaseOk: combatStore.turnPhase === 'player',
      selectedTargetId: combatStore.selectedTargetId,
      hasSelectedTarget: !!combatStore.selectedTargetId,
      isProcessingTurn: combatStore.isProcessingTurn,
      targetHp: combatStore.enemies.find(e => e.id === combatStore.selectedTargetId)?.stats.hp,
      hasValidTarget: !!combatStore.enemies.find(e => e.id === combatStore.selectedTargetId)?.stats.hp
    })
    
    act(() => {
      // RpgButton uses mouseDown/mouseUp instead of click
      fireEvent.mouseDown(attackButton)
      fireEvent.mouseUp(attackButton)
    })
    
    // Wait for attack to process
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const enemyHpAfter = enemy.stats.hp
    console.log(`Enemy HP after UI attack: ${enemyHpAfter}`)
    
    if (enemyHpAfter < enemyHpBefore) {
      console.log(`✅ UI attack successful: ${enemyHpBefore - enemyHpAfter} damage`)
    } else {
      console.log(`❌ UI attack failed: no damage dealt`)
      
      // Additional debugging
      console.log(`Combat state after attack:`)
      console.log(`  - Current turn: ${combatStore.currentTurn}`)
      console.log(`  - Selected target: ${combatStore.selectedTargetId}`)
      console.log(`  - Enemy HP: ${enemy.stats.hp}`)
      console.log(`  - Combat log (last 3):`, combatStore.combatLog.slice(-3))
    }
    
    // Test passes regardless - this is just for investigation
    expect(true).toBe(true)
    
  }, 15000) // 15 second timeout
})