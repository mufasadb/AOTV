import { inventoryStore } from '../stores/InventoryStore'

describe('Stash Dungeon Workflow Integration Test', () => {
  beforeEach(() => {
    // Reset inventory store to initial state
    inventoryStore.initializeTestItems()
    inventoryStore.stash = []
  })

  afterEach(() => {
    // Clean up state
    inventoryStore.stash = []
    inventoryStore.initializeTestItems()
  })

  test('complete dungeon workflow: stash items, run dungeon, retrieve items', async () => {
    // ===== PHASE 1: PRE-DUNGEON PREPARATION =====
    console.log('=== PHASE 1: PRE-DUNGEON PREPARATION ===')
    
    // Store initial state
    const initialInventoryCount = inventoryStore.inventory.length
    
    console.log(`Initial state: ${initialInventoryCount} items in inventory`)
    
    // Select valuable items to store in stash before dangerous dungeon
    const valuableItems = inventoryStore.inventory.filter(item => 
      item.rarity === 'rare' || item.rarity === 'epic' || item.rarity === 'legendary'
    ).slice(0, 2) // Take up to 2 valuable items
    
    // If no valuable items, take the first 2 items as test subjects
    const itemsToStash = valuableItems.length >= 2 ? valuableItems : inventoryStore.inventory.slice(0, 2)
    
    expect(itemsToStash.length).toBeGreaterThanOrEqual(1)
    
    console.log(`Items selected for stashing: ${itemsToStash.map(i => i.name).join(', ')}`)
    
    // Move valuable items to stash for safekeeping
    itemsToStash.forEach(item => {
      inventoryStore.moveToStash(item.id)
    })
    
    // Verify items are safely stashed
    expect(inventoryStore.stash.length).toBe(itemsToStash.length)
    expect(inventoryStore.inventory.length).toBe(initialInventoryCount - itemsToStash.length)
    
    // Verify each item is in stash with correct properties
    itemsToStash.forEach(originalItem => {
      const stashedItem = inventoryStore.stash.find(item => item.id === originalItem.id)
      expect(stashedItem).toBeTruthy()
      expect(stashedItem?.name).toBe(originalItem.name)
      expect(stashedItem?.rarity).toBe(originalItem.rarity)
      expect(stashedItem?.stats).toEqual(originalItem.stats)
    })
    
    console.log(`✅ Successfully stashed ${itemsToStash.length} valuable items`)

    // ===== PHASE 2: DUNGEON EXPLORATION =====
    console.log('=== PHASE 2: DUNGEON EXPLORATION ===')
    
    // Simulate dungeon exploration (simplified without combat details)
    console.log('Exploring dangerous dungeon corridors...')
    console.log('Battling fierce monsters...')
    console.log('Discovering hidden treasures...')
    
    // Simulate finding new loot during dungeon exploration
    const dungeonLoot = [
      {
        id: 'dungeon_loot_1',
        name: 'Goblin Dagger',
        icon: 'dagger.png',
        rarity: 'common' as const,
        type: 'weapon' as const,
        slotType: 'melee' as const,
        description: 'A crude but effective weapon found on a defeated goblin',
        stats: { attack: 6 }
      },
      {
        id: 'dungeon_loot_2', 
        name: 'Health Elixir',
        icon: 'potion_red.png',
        rarity: 'uncommon' as const,
        type: 'consumable' as const,
        description: 'A magical potion that restores health',
        stats: { healing: 25 }
      },
      {
        id: 'dungeon_loot_3',
        name: 'Ancient Coin',
        icon: 'coin_gold.png', 
        rarity: 'rare' as const,
        type: 'material' as const,
        description: 'An old coin with mysterious markings'
      }
    ]
    
    // Add loot to inventory
    dungeonLoot.forEach(item => {
      inventoryStore.inventory.push(item)
    })
    
    console.log(`Found ${dungeonLoot.length} items during dungeon exploration`)
    console.log('Successfully survived the dangerous dungeon!')
    
    // Verify dungeon loot was added and stash remains untouched
    expect(inventoryStore.inventory.length).toBe(initialInventoryCount - itemsToStash.length + dungeonLoot.length)
    expect(inventoryStore.stash.length).toBe(itemsToStash.length) // Stash unchanged
    
    // Verify original stashed items are still safe
    itemsToStash.forEach(originalItem => {
      const stashedItem = inventoryStore.stash.find(item => item.id === originalItem.id)
      expect(stashedItem).toBeTruthy()
      expect(stashedItem?.name).toBe(originalItem.name)
    })
    
    console.log(`✅ Dungeon exploration complete, stashed items remain safe`)

    // ===== PHASE 3: POST-DUNGEON RECOVERY =====
    console.log('=== PHASE 3: POST-DUNGEON RECOVERY ===')
    
    // Simulate using a health potion from new loot (consume it)
    const healthPotion = inventoryStore.inventory.find(item => item.name === 'Health Elixir')
    if (healthPotion) {
      const healAmount = healthPotion.stats?.healing || 25
      inventoryStore.removeItem(healthPotion)
      console.log(`Used Health Elixir to heal ${healAmount} HP`)
    }
    
    // Now retrieve valuable items from stash
    const stashedItemIds = inventoryStore.stash.map(item => item.id)
    
    stashedItemIds.forEach(itemId => {
      inventoryStore.moveToInventory(itemId)
    })
    
    // Verify all items successfully retrieved
    expect(inventoryStore.stash.length).toBe(0)
    
    // Verify original items are back in inventory with correct properties
    itemsToStash.forEach(originalItem => {
      const retrievedItem = inventoryStore.inventory.find(item => item.id === originalItem.id)
      expect(retrievedItem).toBeTruthy()
      expect(retrievedItem?.name).toBe(originalItem.name)
      expect(retrievedItem?.rarity).toBe(originalItem.rarity)
      expect(retrievedItem?.type).toBe(originalItem.type)
      expect(retrievedItem?.icon).toBe(originalItem.icon)
      
      // Verify stats are preserved
      if (originalItem.stats) {
        expect(retrievedItem?.stats).toEqual(originalItem.stats)
      }
    })
    
    console.log(`✅ Successfully retrieved all ${itemsToStash.length} items from stash`)
    
    // ===== PHASE 4: FINAL VERIFICATION =====
    console.log('=== PHASE 4: FINAL VERIFICATION ===')
    
    // Final inventory should have: original count - stashed + new loot - used potion + retrieved
    const expectedFinalCount = initialInventoryCount + dungeonLoot.length - 1 // -1 for used potion
    expect(inventoryStore.inventory.length).toBe(expectedFinalCount)
    
    // Verify we have both original items and new loot
    const hasOriginalItems = itemsToStash.every(originalItem => 
      inventoryStore.inventory.some(item => item.id === originalItem.id)
    )
    expect(hasOriginalItems).toBe(true)
    
    const hasNewLoot = inventoryStore.inventory.some(item => item.name === 'Goblin Dagger')
    expect(hasNewLoot).toBe(true)
    
    console.log(`✅ Final state verified: ${inventoryStore.inventory.length} items in inventory`)
    console.log(`✅ Complete dungeon workflow test passed successfully!`)
  })

  test('stash capacity and item preservation during extended gameplay', () => {
    console.log('=== TESTING STASH CAPACITY AND PRESERVATION ===')
    
    // Fill inventory with diverse items
    const testItems = Array.from({ length: 15 }, (_, i) => ({
      id: `test_item_${i}`,
      name: `Test Item ${i}`,
      icon: 'generic.png',
      rarity: (['common', 'uncommon', 'rare', 'epic', 'legendary'] as const)[i % 5],
      type: (['weapon', 'armor', 'consumable', 'material'] as const)[i % 4],
      description: `Test item number ${i}`,
      stats: { value: i * 10 }
    }))
    
    // Clear inventory and add test items
    inventoryStore.inventory = [...testItems]
    
    // Move different types of items to stash
    const weaponsToStash = testItems.filter(item => item.type === 'weapon')
    const armorsToStash = testItems.filter(item => item.type === 'armor')
    const materialsToStash = testItems.filter(item => item.type === 'material')
    
    // Stash weapons first
    weaponsToStash.forEach(item => inventoryStore.moveToStash(item.id))
    expect(inventoryStore.stash.length).toBe(weaponsToStash.length)
    
    // Simulate some gameplay where inventory changes
    inventoryStore.inventory.push({
      id: 'new_loot_1',
      name: 'Battle Trophy',
      icon: 'trophy.png',
      rarity: 'epic',
      type: 'material',
      description: 'A trophy from a defeated boss'
    })
    
    // Stash armor items
    armorsToStash.forEach(item => inventoryStore.moveToStash(item.id))
    expect(inventoryStore.stash.length).toBe(weaponsToStash.length + armorsToStash.length)
    
    // More gameplay simulation
    inventoryStore.inventory.push({
      id: 'new_loot_2',
      name: 'Magic Scroll',
      icon: 'scroll.png',
      rarity: 'rare',
      type: 'consumable',
      description: 'A scroll with arcane knowledge'
    })
    
    // Stash materials
    materialsToStash.forEach(item => inventoryStore.moveToStash(item.id))
    
    const totalStashedItems = weaponsToStash.length + armorsToStash.length + materialsToStash.length
    expect(inventoryStore.stash.length).toBe(totalStashedItems)
    
    // Verify all item types and properties are preserved in stash
    const allStashedItems = [...weaponsToStash, ...armorsToStash, ...materialsToStash]
    allStashedItems.forEach(originalItem => {
      const stashedItem = inventoryStore.stash.find(item => item.id === originalItem.id)
      expect(stashedItem).toBeTruthy()
      expect(stashedItem?.name).toBe(originalItem.name)
      expect(stashedItem?.rarity).toBe(originalItem.rarity)
      expect(stashedItem?.type).toBe(originalItem.type)
      expect(stashedItem?.stats).toEqual(originalItem.stats)
    })
    
    // Retrieve items in different order than they were stashed
    // First retrieve materials
    materialsToStash.forEach(item => inventoryStore.moveToInventory(item.id))
    expect(inventoryStore.stash.length).toBe(weaponsToStash.length + armorsToStash.length)
    
    // Then weapons
    weaponsToStash.forEach(item => inventoryStore.moveToInventory(item.id))
    expect(inventoryStore.stash.length).toBe(armorsToStash.length)
    
    // Finally armor
    armorsToStash.forEach(item => inventoryStore.moveToInventory(item.id))
    expect(inventoryStore.stash.length).toBe(0)
    
    // Verify all original items are back with correct properties
    allStashedItems.forEach(originalItem => {
      const retrievedItem = inventoryStore.inventory.find(item => item.id === originalItem.id)
      expect(retrievedItem).toBeTruthy()
      expect(retrievedItem?.name).toBe(originalItem.name)
      expect(retrievedItem?.rarity).toBe(originalItem.rarity)
      expect(retrievedItem?.type).toBe(originalItem.type)
      expect(retrievedItem?.stats).toEqual(originalItem.stats)
    })
    
    console.log(`✅ Stash capacity test passed: ${totalStashedItems} items preserved correctly`)
  })
})