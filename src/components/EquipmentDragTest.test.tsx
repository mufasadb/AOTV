import { describe, it, expect, beforeEach } from 'vitest'
import { inventoryStore } from '../stores/InventoryStore'
import { itemSystem } from '../systems/ItemSystem'

describe('Equipment Drag Drop - Direct Store Test', () => {
  beforeEach(() => {
    // Reset inventory store completely
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
    
    // Generate fresh items with unique IDs
    const warAxe = itemSystem.generateInventoryItem('war_axe')
    const ironSword = itemSystem.generateInventoryItem('iron_sword')
    
    if (warAxe && ironSword) {
      inventoryStore.inventory = [warAxe, ironSword]
    }
  })

  it('should handle axe->melee, then sword->melee equipment swapping', () => {
    console.log('=== STARTING EQUIPMENT SWAP TEST ===')
    
    // Initial state validation
    expect(inventoryStore.inventory).toHaveLength(2)
    expect(inventoryStore.equipped.melee).toBeNull()
    
    const warAxe = inventoryStore.inventory.find(i => i.name === 'War Axe')
    const ironSword = inventoryStore.inventory.find(i => i.name === 'Iron Sword')
    
    expect(warAxe).toBeDefined()
    expect(ironSword).toBeDefined()
    expect(warAxe?.slotType).toBe('melee')
    expect(ironSword?.slotType).toBe('melee')
    

    // Step 1: Equip War Axe
    inventoryStore.equipItem(warAxe!.id)
    
    expect(inventoryStore.equipped.melee).not.toBeNull()
    expect(inventoryStore.equipped.melee?.name).toBe('War Axe')
    expect(inventoryStore.inventory).toHaveLength(1) // Should have one less item
    expect(inventoryStore.inventory.find(i => i.name === 'War Axe')).toBeUndefined() // War axe should be gone from inventory
    

    // Step 2: Equip Iron Sword (should swap with War Axe)
    const remainingIronSword = inventoryStore.inventory.find(i => i.name === 'Iron Sword')
    expect(remainingIronSword).toBeDefined()
    
    inventoryStore.equipItem(remainingIronSword!.id)
    
    expect(inventoryStore.equipped.melee).not.toBeNull()
    expect(inventoryStore.equipped.melee?.name).toBe('Iron Sword')
    expect(inventoryStore.inventory).toHaveLength(1) // Should still have 1 item
    expect(inventoryStore.inventory.find(i => i.name === 'War Axe')).toBeDefined() // War axe should be back in inventory
    expect(inventoryStore.inventory.find(i => i.name === 'Iron Sword')).toBeUndefined() // Iron sword should be gone from inventory
    

    // Step 3: Unequip to empty slot
    console.log('\n=== STEP 3: UNEQUIP TO EMPTY SLOT ===')
    inventoryStore.unequipItem('melee')
    
    expect(inventoryStore.equipped.melee).toBeNull()
    expect(inventoryStore.inventory).toHaveLength(2) // Should be back to 2 items
    
    console.log('After unequipping:')
    console.log('- Inventory count:', inventoryStore.inventory.length)
    console.log('- Equipped melee:', inventoryStore.equipped.melee)
    console.log('- Inventory items:', inventoryStore.inventory.map(i => i.name))

    // Step 4: Re-equip War Axe to empty slot (this is where it often fails)
    console.log('\n=== STEP 4: RE-EQUIP WAR AXE TO EMPTY SLOT ===')
    const warAxeAgain = inventoryStore.inventory.find(i => i.name === 'War Axe')
    expect(warAxeAgain).toBeDefined()
    
    console.log('Before re-equipping War Axe:')
    console.log('- War Axe ID:', warAxeAgain?.id)
    console.log('- War Axe slotType:', warAxeAgain?.slotType)
    console.log('- Item exists in store:', inventoryStore.getItemById(warAxeAgain!.id))
    
    inventoryStore.equipItem(warAxeAgain!.id)
    
    expect(inventoryStore.equipped.melee).not.toBeNull()
    expect(inventoryStore.equipped.melee?.name).toBe('War Axe')
    expect(inventoryStore.inventory).toHaveLength(1)
    
    console.log('After re-equipping War Axe:')
    console.log('- Inventory count:', inventoryStore.inventory.length)
    console.log('- Equipped melee:', inventoryStore.equipped.melee?.name)
    console.log('- Final inventory items:', inventoryStore.inventory.map(i => i.name))

    console.log('\n=== TEST COMPLETED SUCCESSFULLY ===')
  })

  it('should verify item IDs remain consistent throughout operations', () => {
    console.log('\n=== TESTING ID CONSISTENCY ===')
    
    const initialWarAxe = inventoryStore.inventory.find(i => i.name === 'War Axe')
    const initialWarAxeId = initialWarAxe!.id
    
    console.log('Initial War Axe ID:', initialWarAxeId)
    
    // Equip
    inventoryStore.equipItem(initialWarAxeId)
    const equippedWarAxe = inventoryStore.equipped.melee
    expect(equippedWarAxe?.id).toBe(initialWarAxeId)
    console.log('Equipped War Axe ID:', equippedWarAxe?.id)
    
    // Unequip
    inventoryStore.unequipItem('melee')
    const unequippedWarAxe = inventoryStore.inventory.find(i => i.name === 'War Axe')
    expect(unequippedWarAxe?.id).toBe(initialWarAxeId)
    console.log('Unequipped War Axe ID:', unequippedWarAxe?.id)
    
    // Re-equip with same ID
    inventoryStore.equipItem(initialWarAxeId)
    const reequippedWarAxe = inventoryStore.equipped.melee
    expect(reequippedWarAxe?.id).toBe(initialWarAxeId)
    console.log('Re-equipped War Axe ID:', reequippedWarAxe?.id)
    
    console.log('ID consistency test passed!')
  })

  it('should verify getItemById works correctly after operations', () => {
    console.log('\n=== TESTING getItemById CONSISTENCY ===')
    
    const warAxe = inventoryStore.inventory.find(i => i.name === 'War Axe')!
    const warAxeId = warAxe.id
    
    // Check initial lookup
    let foundItem = inventoryStore.getItemById(warAxeId)
    expect(foundItem).toBeDefined()
    expect(foundItem?.name).toBe('War Axe')
    console.log('Initial lookup success:', foundItem?.name)
    
    // Equip and check lookup
    inventoryStore.equipItem(warAxeId)
    foundItem = inventoryStore.getItemById(warAxeId)
    expect(foundItem).toBeDefined()
    expect(foundItem?.name).toBe('War Axe')
    console.log('After equip lookup success:', foundItem?.name)
    
    // Unequip and check lookup
    inventoryStore.unequipItem('melee')
    foundItem = inventoryStore.getItemById(warAxeId)
    expect(foundItem).toBeDefined()
    expect(foundItem?.name).toBe('War Axe')
    console.log('After unequip lookup success:', foundItem?.name)
    
    // Try to equip again using the same ID
    foundItem = inventoryStore.getItemById(warAxeId)
    expect(foundItem).toBeDefined()
    inventoryStore.equipItem(warAxeId)
    expect(inventoryStore.equipped.melee?.name).toBe('War Axe')
    console.log('Re-equip using same ID success!')
    
    console.log('getItemById consistency test passed!')
  })
})