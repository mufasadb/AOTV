import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { inventoryStore } from '../stores/InventoryStore'
import TownView from './TownView'

// Mock navigation function
const mockNavigateToCombat = vi.fn()

describe('Drag and Drop Cycle Tests', () => {
  beforeEach(() => {
    // Reset inventory store to known state
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
    
    // Add test items to inventory
    inventoryStore.inventory = [
      {
        id: 'war_axe_test_1',
        name: 'War Axe',
        icon: '/test/axe.png',
        rarity: 'rare',
        type: 'weapon',
        slotType: 'melee',
        description: 'Test weapon',
        stats: { attack: 28 }
      },
      {
        id: 'leather_cap_test_1', 
        name: 'Leather Cap',
        icon: '/test/cap.png',
        rarity: 'common',
        type: 'armor',
        slotType: 'head',
        description: 'Test armor'
      }
    ]
  })

  it('should handle complete drag cycle: inventory -> equipment -> inventory', async () => {
    render(
      <TownView onNavigateToCombat={mockNavigateToCombat} />
    )

    // Initial state: weapon should be in inventory, melee slot empty
    expect(inventoryStore.inventory).toHaveLength(2)
    expect(inventoryStore.equipped.melee).toBeNull()
    

    // First, click on the Items tab to show inventory
    const itemsTab = screen.getByRole('tab', { name: /items/i })
    act(() => {
      fireEvent.click(itemsTab)
    })
    
    await waitFor(() => {
      expect(screen.getByText(/character equipment/i)).toBeInTheDocument()
    })

    // Find the war axe in DOM  
    const warAxeElement = screen.getByText(/war axe/i)
    expect(warAxeElement).toBeInTheDocument()

    // Step 1: Drag from inventory to equipment
    
    // Find melee equipment slot
    const meleeSlot = screen.getByText(/weapon/i).closest('[data-testid*="equipment"]') || 
                     screen.getByLabelText(/melee/i) ||
                     document.querySelector('[id*="equipment-melee"]')
    
    expect(meleeSlot).toBeInTheDocument()
    
    // Simulate drag and drop
    act(() => {
      fireEvent.dragStart(warAxeElement)
      fireEvent.dragOver(meleeSlot!)
      fireEvent.drop(meleeSlot!)
      fireEvent.dragEnd(warAxeElement)
    })

    await waitFor(() => {
      expect(inventoryStore.equipped.melee).not.toBeNull()
      expect(inventoryStore.equipped.melee?.name).toBe('War Axe')
      expect(inventoryStore.inventory).toHaveLength(1) // One less item in inventory
    })


    // Step 2: Drag from equipment back to inventory
    
    // Find the equipped weapon
    const equippedWeapon = screen.getByAltText(/war axe/i) || screen.getByText(/war axe/i)
    
    // Find inventory area
    const inventoryArea = screen.getByText(/inventory/i).closest('div') ||
                         document.querySelector('[id*="inventory"]')
    
    expect(inventoryArea).toBeInTheDocument()
    
    // Simulate drag and drop from equipment to inventory
    act(() => {
      fireEvent.dragStart(equippedWeapon)
      fireEvent.dragOver(inventoryArea!)
      fireEvent.drop(inventoryArea!)
      fireEvent.dragEnd(equippedWeapon)
    })

    await waitFor(() => {
      expect(inventoryStore.equipped.melee).toBeNull()
      expect(inventoryStore.inventory).toHaveLength(2) // Back to original count
      expect(inventoryStore.inventory.some(i => i.name === 'War Axe')).toBe(true)
    })


    // Step 3: Try to equip again (this is where the bug occurs)
    console.log('=== STEP 3: INVENTORY -> EQUIPMENT (AGAIN) ===')
    
    const warAxeAgain = screen.getByAltText(/war axe/i) || screen.getByText(/war axe/i)
    const meleeSlotAgain = screen.getByText(/weapon/i).closest('[data-testid*="equipment"]') ||
                          document.querySelector('[id*="equipment-melee"]')
    
    // This should work but currently doesn't
    act(() => {
      fireEvent.dragStart(warAxeAgain)
      fireEvent.dragOver(meleeSlotAgain!)
      fireEvent.drop(meleeSlotAgain!)
      fireEvent.dragEnd(warAxeAgain)
    })

    await waitFor(() => {
      // This should pass but likely fails due to the bug
      expect(inventoryStore.equipped.melee).not.toBeNull()
      expect(inventoryStore.equipped.melee?.name).toBe('War Axe')
    })

    console.log('After re-equip - Equipped melee:', inventoryStore.equipped.melee?.name)
  })

  it('should handle drag to empty equipment slot', async () => {
    render(
      <TownView onNavigateToCombat={mockNavigateToCombat} />
    )

    console.log('=== TESTING EMPTY SLOT DROP ===')
    
    // First, click on the Items tab to show inventory
    const itemsTab = screen.getByRole('tab', { name: /items/i })
    act(() => {
      fireEvent.click(itemsTab)
    })
    
    await waitFor(() => {
      expect(screen.getByText(/character equipment/i)).toBeInTheDocument()
    })
    
    // Ensure melee slot is empty
    expect(inventoryStore.equipped.melee).toBeNull()
    
    // Find war axe in inventory
    const warAxe = inventoryStore.inventory.find(i => i.name === 'War Axe')
    expect(warAxe).toBeDefined()
    expect(warAxe?.slotType).toBe('melee')
    
    console.log('War axe found:', warAxe?.name, 'slotType:', warAxe?.slotType)
    
    // This test specifically checks if empty slots accept drops
    const warAxeElement = screen.getByText(/war axe/i)
    const emptyMeleeSlot = document.querySelector('[id="equipment-melee"]')
    
    expect(emptyMeleeSlot).toBeInTheDocument()
    
    // Check if the empty slot highlights (indicates it accepts the drop)
    // This is where the issue likely occurs
    act(() => {
      fireEvent.dragStart(warAxeElement)
      fireEvent.dragOver(emptyMeleeSlot!)
      fireEvent.drop(emptyMeleeSlot!)
      fireEvent.dragEnd(warAxeElement)
    })

    await waitFor(() => {
      expect(inventoryStore.equipped.melee).not.toBeNull()
    })
  })
})