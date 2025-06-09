import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { inventoryStore } from '../stores/InventoryStore'
import { itemSystem } from '../systems/ItemSystem'
import TownView from './TownView'

// Mock navigation function
const mockNavigateToCombat = vi.fn()

describe('Drag Drop UI Integration Test', () => {
  beforeEach(() => {
    // Reset completely and add specific test items
    inventoryStore.inventory = []
    inventoryStore.equipped = {
      melee: null,
      shield: null,
      head: null,
      chest: null,
      boots: null,
      gloves: null,
      pants: null,
      shoulder: null,
    }
    
    // Generate fresh items 
    const warAxe = itemSystem.generateInventoryItem('war_axe')
    const ironSword = itemSystem.generateInventoryItem('iron_sword')
    
    if (warAxe && ironSword) {
      inventoryStore.inventory = [warAxe, ironSword]
    }
  })

  it('should perform the exact drag sequence that fails in the UI', async () => {
    render(<TownView onNavigateToCombat={mockNavigateToCombat} />)
    
    // Navigate to Items tab
    const itemsTab = screen.getByRole('tab', { name: /items/i })
    act(() => {
      fireEvent.click(itemsTab)
    })
    
    await waitFor(() => {
      expect(screen.getByText(/character equipment/i)).toBeInTheDocument()
    })
    
    // Get initial state
    const warAxe = inventoryStore.inventory.find(i => i.name === 'War Axe')!
    
    
    // Step 1: Equip War Axe directly via store (simulating successful first drag)
    act(() => {
      inventoryStore.equipItem(warAxe.id)
    })
    
    // Wait for UI to update
    await waitFor(() => {
      expect(inventoryStore.equipped.melee?.name).toBe('War Axe')
    })
    
    
    // Step 2: Unequip by dragging to inventory (simulating drag back)
    act(() => {
      inventoryStore.unequipItem('melee')
    })
    
    await waitFor(() => {
      expect(inventoryStore.equipped.melee).toBeNull()
      expect(inventoryStore.inventory.length).toBe(2)
    })
    
    
    // Step 3: Try to re-equip using actual drag and drop
    
    // Find the war axe element in the DOM
    const warAxeElements = screen.getAllByText(/war axe/i)
    
    // Find the one that's draggable (should be in inventory)
    let draggableWarAxe = null
    for (const element of warAxeElements) {
      const parent = element.closest('[draggable]') || element.closest('[data-rbd-draggable-id]')
      if (parent) {
        draggableWarAxe = parent
        break
      }
    }
    
    // If we can't find a draggable element, look for the item by its container
    if (!draggableWarAxe) {
      // The war axe should be in the inventory grid
      const inventoryArea = screen.getByText(/inventory/i).closest('div')
      const warAxeInInventory = inventoryArea?.querySelector(`[id*="${warAxe.id}"]`) ||
                               inventoryArea?.querySelector(`[data-id*="${warAxe.id}"]`)
      draggableWarAxe = warAxeInInventory as HTMLElement
    }
    
    expect(draggableWarAxe).not.toBeNull()
    
    // Find the melee equipment slot
    const meleeSlots = screen.getAllByText(/weapon/i)
    let meleeSlot = null
    for (const slot of meleeSlots) {
      const parent = slot.closest('[id*="equipment-melee"]') || 
                    slot.closest('[data-testid*="equipment"]')
      if (parent) {
        meleeSlot = parent
        break
      }
    }
    
    expect(meleeSlot).not.toBeNull()
    
    // Perform the drag and drop that should work but doesn't
    
    // This should trigger our console logging
    act(() => {
      fireEvent.dragStart(draggableWarAxe!)
      fireEvent.dragOver(meleeSlot!)
      fireEvent.drop(meleeSlot!)
      fireEvent.dragEnd(draggableWarAxe!)
    })
    
    // Check if it worked
    await waitFor(() => {
      // This should pass now that drag and drop is working
      expect(inventoryStore.equipped.melee?.name).toBe('War Axe')
    }, { timeout: 2000 })
  })
})