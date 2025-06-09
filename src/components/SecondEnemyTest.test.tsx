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

describe('Second Enemy Attack Test', () => {
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

  test('can damage second enemy after first is defeated', async () => {
    console.log('=== TESTING SECOND ENEMY DAMAGE ===')
    
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
    
    console.log(`✅ Combat started with ${combatStore.enemies.length} enemies`)

    // If there's only one enemy, we can't test the second enemy bug
    if (combatStore.enemies.length < 2) {
      console.log('⚠️ Only one enemy found - manually adding a second enemy for testing')
      
      // Manually add a second enemy to test the bug
      const secondEnemy = {
        id: 'test_enemy_2',
        name: 'Test Goblin',
        stats: {
          hp: 50,
          maxHp: 50,
          mp: 10,
          maxMp: 10,
          es: 0,
          maxEs: 0,
          armor: 0,
          fireRes: 0,
          lightningRes: 0,
          iceRes: 0,
          darkRes: 0,
          dodge: 0,
          block: 0,
          critChance: 5,
          critMultiplier: 1.5,
          damage: 15,
          damageType: 'physical' as const
        },
        intent: 'attack',
        isBlocking: false
      }
      
      combatStore.enemies.push(secondEnemy)
      console.log(`✅ Added second enemy: ${secondEnemy.name}`)
    }

    const firstEnemy = combatStore.enemies[0]
    const secondEnemy = combatStore.enemies[1]
    
    console.log(`First enemy: ${firstEnemy.name} (HP: ${firstEnemy.stats.hp})`)
    console.log(`Second enemy: ${secondEnemy.name} (HP: ${secondEnemy.stats.hp})`)

    // Step 2: Kill the first enemy
    console.log('--- Killing first enemy ---')
    let attackCount = 0
    
    while (firstEnemy.stats.hp > 0 && attackCount < 20) {
      await waitFor(() => {
        expect(combatStore.currentTurn).toBe('player')
      }, { timeout: 3000 })

      const attackButton = screen.getByRole('button', { name: /Attack/i })
      const hpBefore = firstEnemy.stats.hp
      
      act(() => {
        fireEvent.mouseDown(attackButton)
        fireEvent.mouseUp(attackButton)
      })
      
      attackCount++
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const hpAfter = firstEnemy.stats.hp
      console.log(`Attack ${attackCount}: ${firstEnemy.name} HP ${hpBefore} -> ${hpAfter}`)
      
      if (hpAfter < hpBefore) {
        console.log(`  ✅ Damage dealt: ${hpBefore - hpAfter}`)
      } else {
        console.log(`  ⚔️ Dodged/blocked`)
      }
    }

    console.log(`✅ First enemy defeated after ${attackCount} attacks`)
    expect(firstEnemy.stats.hp).toBe(0)

    // Step 3: Now try to attack the second enemy
    console.log('--- Testing second enemy damage ---')
    
    // Give the combat system time to process the first enemy's death
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Check combat state
    console.log(`Combat state: isInCombat=${combatStore.isInCombat}, currentTurn=${combatStore.currentTurn}`)
    console.log(`Enemies alive: ${combatStore.enemies.filter(e => e.stats.hp > 0).length}`)
    console.log(`Selected target: ${combatStore.selectedTargetId}`)
    
    // Make sure we're targeting the second enemy
    if (combatStore.selectedTargetId !== secondEnemy.id) {
      console.log(`Switching target to second enemy: ${secondEnemy.id}`)
      combatStore.selectTarget(secondEnemy.id)
    }

    // Try to attack the second enemy multiple times
    let secondEnemyAttacks = 0
    const initialSecondEnemyHp = secondEnemy.stats.hp
    let damageDealt = false
    
    while (secondEnemyAttacks < 5 && !damageDealt) {
      if (combatStore.currentTurn === 'player' && combatStore.isInCombat) {
        const attackButton = screen.getByRole('button', { name: /Attack/i })
        const hpBefore = secondEnemy.stats.hp
        
        console.log(`Attempting attack ${secondEnemyAttacks + 1} on ${secondEnemy.name} (HP: ${hpBefore})`)
        
        act(() => {
          fireEvent.mouseDown(attackButton)
          fireEvent.mouseUp(attackButton)
        })
        
        secondEnemyAttacks++
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const hpAfter = secondEnemy.stats.hp
        console.log(`  Result: HP ${hpBefore} -> ${hpAfter}`)
        
        if (hpAfter < hpBefore) {
          console.log(`  ✅ SUCCESS! Damaged second enemy: ${hpBefore - hpAfter} damage`)
          damageDealt = true
        } else if (hpBefore === hpAfter) {
          console.log(`  ❌ NO DAMAGE - Second enemy HP unchanged`)
        }
        
        // Wait for enemy turn if it happens
        if (combatStore.currentTurn === 'enemy') {
          await waitFor(() => {
            expect(combatStore.currentTurn).toBe('player')
          }, { timeout: 3000 })
        }
      } else {
        console.log(`Cannot attack - currentTurn: ${combatStore.currentTurn}, isInCombat: ${combatStore.isInCombat}`)
        break
      }
    }

    // Final check
    const finalSecondEnemyHp = secondEnemy.stats.hp
    const totalDamageToSecond = initialSecondEnemyHp - finalSecondEnemyHp
    
    console.log(`=== SECOND ENEMY DAMAGE TEST RESULTS ===`)
    console.log(`Initial HP: ${initialSecondEnemyHp}`)
    console.log(`Final HP: ${finalSecondEnemyHp}`)
    console.log(`Total damage dealt: ${totalDamageToSecond}`)
    console.log(`Attacks attempted: ${secondEnemyAttacks}`)
    
    if (totalDamageToSecond > 0) {
      console.log(`✅ SUCCESS: Can damage second enemy`)
    } else {
      console.log(`❌ BUG CONFIRMED: Cannot damage second enemy after first is killed`)
      
      // Additional debugging info
      console.log(`Debug info:`)
      console.log(`  - Combat store state: ${JSON.stringify({
        isInCombat: combatStore.isInCombat,
        currentTurn: combatStore.currentTurn,
        selectedTargetId: combatStore.selectedTargetId,
        enemiesAlive: combatStore.enemies.filter(e => e.stats.hp > 0).length,
        turnPhase: combatStore.turnPhase
      }, null, 2)}`)
    }

    // The test passes if we can deal damage to the second enemy
    // If there's a bug, this assertion will fail
    expect(totalDamageToSecond).toBeGreaterThan(0)
    
  }, 30000) // 30 second timeout
})