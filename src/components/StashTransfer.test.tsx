import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react'
import '@testing-library/jest-dom'
import { DndContext } from '@dnd-kit/core'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import StashOverlay from './StashOverlay'
import TownView from './TownView'
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

describe('Stash Item Transfer E2E Test', () => {
  beforeEach(() => {
    // Reset inventory store to known state
    inventoryStore.initializeTestItems()
  })

  afterEach(() => {
    // Clean up any state changes
    inventoryStore.stash = []
    inventoryStore.initializeTestItems()
  })

  test('complete stash transfer workflow: move item to stash and retrieve it back', async () => {
    // Step 1: Setup initial state
    const initialInventoryCount = inventoryStore.inventory.length
    const initialStashCount = inventoryStore.stash.length
    
    // Ensure we have at least one item in inventory to test with
    expect(initialInventoryCount).toBeGreaterThan(0)
    expect(initialStashCount).toBe(0) // Start with empty stash
    
    // Get the first item from inventory for testing
    const testItem = inventoryStore.inventory[0]
    const testItemId = testItem.id
    const testItemName = testItem.name

    console.log(`Starting test with item: ${testItemName} (ID: ${testItemId})`)

    // Step 2: Move item to stash programmatically (simulating UI interaction)
    act(() => {
      inventoryStore.moveToStash(testItemId)
    })

    // Verify item moved to stash
    expect(inventoryStore.inventory.length).toBe(initialInventoryCount - 1)
    expect(inventoryStore.stash.length).toBe(1)
    expect(inventoryStore.stash[0].id).toBe(testItemId)
    expect(inventoryStore.stash[0].name).toBe(testItemName)
    
    // Verify item is no longer in inventory
    const itemInInventory = inventoryStore.inventory.find(item => item.id === testItemId)
    expect(itemInInventory).toBeUndefined()

    console.log(`✅ Item ${testItemName} successfully moved to stash`)

    // Step 3: Simulate a "dungeon run" by modifying some game state
    // In a real scenario, this might involve combat, gaining XP, getting new items, etc.
    
    // Add some new items to inventory to simulate loot gained during dungeon
    const newLootItem = {
      id: 'loot_item_1',
      name: 'Dungeon Treasure',
      icon: 'chest.png',
      rarity: 'rare' as const,
      type: 'consumable' as const,
      description: 'Found in the depths of the dungeon'
    }
    
    act(() => {
      inventoryStore.inventory.push(newLootItem)
    })

    // Verify new loot was added
    expect(inventoryStore.inventory.length).toBe(initialInventoryCount) // Same as before since we removed one and added one
    expect(inventoryStore.inventory.find(item => item.id === 'loot_item_1')).toBeTruthy()
    
    // Verify our original item is still in stash
    expect(inventoryStore.stash.length).toBe(1)
    expect(inventoryStore.stash[0].id).toBe(testItemId)

    console.log(`✅ Simulated dungeon run completed, original item still in stash`)

    // Step 4: Retrieve item from stash back to inventory
    act(() => {
      inventoryStore.moveToInventory(testItemId)
    })

    // Verify item moved back to inventory
    expect(inventoryStore.inventory.length).toBe(initialInventoryCount + 1) // Original count + new loot
    expect(inventoryStore.stash.length).toBe(0)
    
    // Verify the original item is back in inventory with correct properties
    const retrievedItem = inventoryStore.inventory.find(item => item.id === testItemId)
    expect(retrievedItem).toBeTruthy()
    expect(retrievedItem?.name).toBe(testItemName)
    expect(retrievedItem?.id).toBe(testItemId)

    console.log(`✅ Item ${testItemName} successfully retrieved from stash back to inventory`)

    // Step 5: Verify item properties are preserved
    expect(retrievedItem?.rarity).toBe(testItem.rarity)
    expect(retrievedItem?.type).toBe(testItem.type)
    expect(retrievedItem?.icon).toBe(testItem.icon)
    if (testItem.stats) {
      expect(retrievedItem?.stats).toEqual(testItem.stats)
    }

    console.log(`✅ All item properties preserved during stash transfer`)
  })

  test('stash UI interaction test with StashOverlay component', async () => {
    let isStashOpen = true
    const handleClose = () => { isStashOpen = false }

    // Ensure we have items to work with
    expect(inventoryStore.inventory.length).toBeGreaterThan(0)
    const testItem = inventoryStore.inventory[0]

    // Render the StashOverlay component
    const { rerender } = render(
      <TestWrapper>
        <StashOverlay open={isStashOpen} onClose={handleClose} />
      </TestWrapper>
    )

    // Verify the stash overlay is rendered
    expect(screen.getByText("Adventurer's Stash")).toBeInTheDocument()
    expect(screen.getByText(/Stored Items \(0\)/)).toBeInTheDocument()
    expect(screen.getByText("Inventory")).toBeInTheDocument()

    // Move an item to stash
    act(() => {
      inventoryStore.moveToStash(testItem.id)
    })

    // Re-render to see the change
    rerender(
      <TestWrapper>
        <StashOverlay open={isStashOpen} onClose={handleClose} />
      </TestWrapper>
    )

    // Verify the UI shows the item in stash
    await waitFor(() => {
      expect(screen.getByText(/Stored Items \(1\)/)).toBeInTheDocument()
    })

    console.log(`✅ Stash UI correctly displays stored item`)

    // Move item back to inventory
    act(() => {
      inventoryStore.moveToInventory(testItem.id)
    })

    // Re-render to see the change
    rerender(
      <TestWrapper>
        <StashOverlay open={isStashOpen} onClose={handleClose} />
      </TestWrapper>
    )

    // Verify the UI shows empty stash
    await waitFor(() => {
      expect(screen.getByText(/Stored Items \(0\)/)).toBeInTheDocument()
    })

    console.log(`✅ Stash UI correctly shows empty stash after retrieval`)
  })

  test('multiple items stash transfer workflow', async () => {
    // Ensure we have multiple items
    expect(inventoryStore.inventory.length).toBeGreaterThanOrEqual(3)
    
    const itemsToStash = inventoryStore.inventory.slice(0, 3)
    const initialInventoryCount = inventoryStore.inventory.length
    
    // Move multiple items to stash
    act(() => {
      itemsToStash.forEach(item => {
        inventoryStore.moveToStash(item.id)
      })
    })

    // Verify all items moved to stash
    expect(inventoryStore.stash.length).toBe(3)
    expect(inventoryStore.inventory.length).toBe(initialInventoryCount - 3)

    // Verify specific items are in stash
    itemsToStash.forEach(originalItem => {
      const stashedItem = inventoryStore.stash.find(item => item.id === originalItem.id)
      expect(stashedItem).toBeTruthy()
      expect(stashedItem?.name).toBe(originalItem.name)
    })

    console.log(`✅ Multiple items successfully moved to stash`)

    // Simulate dungeon run by adding new items
    const newItems = [
      { id: 'loot_1', name: 'Magic Ring', icon: 'ring.png', rarity: 'epic' as const, type: 'consumable' as const },
      { id: 'loot_2', name: 'Ancient Scroll', icon: 'scroll.png', rarity: 'legendary' as const, type: 'consumable' as const }
    ]

    act(() => {
      newItems.forEach(item => inventoryStore.inventory.push(item))
    })

    // Verify new items added and stash unchanged
    expect(inventoryStore.inventory.length).toBe(initialInventoryCount - 3 + 2)
    expect(inventoryStore.stash.length).toBe(3)

    // Retrieve one specific item from stash
    const itemToRetrieve = itemsToStash[1] // Get the middle item
    act(() => {
      inventoryStore.moveToInventory(itemToRetrieve.id)
    })

    // Verify partial retrieval
    expect(inventoryStore.stash.length).toBe(2)
    expect(inventoryStore.inventory.length).toBe(initialInventoryCount - 3 + 2 + 1)
    
    const retrievedItem = inventoryStore.inventory.find(item => item.id === itemToRetrieve.id)
    expect(retrievedItem).toBeTruthy()
    expect(retrievedItem?.name).toBe(itemToRetrieve.name)

    console.log(`✅ Selective item retrieval from stash successful`)

    // Retrieve remaining items
    const remainingStashItems = [...inventoryStore.stash]
    act(() => {
      remainingStashItems.forEach(item => {
        inventoryStore.moveToInventory(item.id)
      })
    })

    // Verify all items retrieved
    expect(inventoryStore.stash.length).toBe(0)
    expect(inventoryStore.inventory.length).toBe(initialInventoryCount + 2) // Original + 2 new loot items

    // Verify all original items are back
    itemsToStash.forEach(originalItem => {
      const retrievedItem = inventoryStore.inventory.find(item => item.id === originalItem.id)
      expect(retrievedItem).toBeTruthy()
      expect(retrievedItem?.name).toBe(originalItem.name)
    })

    console.log(`✅ All items successfully retrieved from stash after dungeon run`)
  })

  test('edge case: attempt to move non-existent item', () => {
    const nonExistentId = 'fake_item_id_12345'
    const initialInventoryLength = inventoryStore.inventory.length
    const initialStashLength = inventoryStore.stash.length

    // Attempt to move non-existent item to stash
    act(() => {
      inventoryStore.moveToStash(nonExistentId)
    })

    // Verify no changes occurred
    expect(inventoryStore.inventory.length).toBe(initialInventoryLength)
    expect(inventoryStore.stash.length).toBe(initialStashLength)

    // Attempt to move non-existent item from stash to inventory
    act(() => {
      inventoryStore.moveToInventory(nonExistentId)
    })

    // Verify no changes occurred
    expect(inventoryStore.inventory.length).toBe(initialInventoryLength)
    expect(inventoryStore.stash.length).toBe(initialStashLength)

    console.log(`✅ Edge case handled: non-existent item operations do not break the system`)
  })
})