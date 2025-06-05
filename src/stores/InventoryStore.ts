import { makeAutoObservable } from 'mobx'
import { itemSystem } from '../systems/ItemSystem'

export interface Item {
  id: string
  name: string
  icon: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  type: 'weapon' | 'armor' | 'material' | 'consumable' | 'key'
  slotType?: 'melee' | 'shield' | 'head' | 'chest' | 'boots' | 'gloves' | 'pants' | 'shoulder'
  description?: string
  stats?: { [key: string]: number }
}

// Alias for backward compatibility
export type InventoryItem = Item

class InventoryStore {
  // Player inventory (backpack)
  inventory: Item[] = []
  
  // Stash storage
  stash: Item[] = []
  
  // Equipped items
  equipped: { [slotType: string]: Item | null } = {
    melee: null,
    shield: null,
    head: null,
    chest: null,
    boots: null,
    gloves: null,
    pants: null,
    shoulder: null,
  }

  constructor() {
    makeAutoObservable(this)
    this.initializeTestItems()
  }

  // Getter for backpack (alias for inventory)
  get backpack() {
    return this.inventory
  }

  // Initialize with some test items using ItemSystem
  initializeTestItems() {
    // Generate items from the item system
    const testItemIds = [
      'iron_sword',
      'leather_cap', 
      'health_potion',
      'war_axe',
      'chain_mail',
      'iron_ore',
      'wooden_shield',
      'speed_boots'
    ]

    this.inventory = []
    for (const itemId of testItemIds) {
      const item = itemSystem.generateInventoryItem(itemId)
      if (item) {
        this.inventory.push(item)
      }
    }

    // Start with some items equipped for demonstration
    // Use equipItem() method to properly move items from inventory to equipped
    if (this.inventory.length >= 4) {
      // Find and equip specific items by their base type
      const swordItem = this.inventory.find(item => item.name === 'Iron Sword')
      const helmetItem = this.inventory.find(item => item.name === 'Leather Cap')
      const chestItem = this.inventory.find(item => item.name === 'Chain Mail')
      const shieldItem = this.inventory.find(item => item.name === 'Wooden Shield')

      if (swordItem) this.equipItem(swordItem.id)
      if (helmetItem) this.equipItem(helmetItem.id)
      if (chestItem) this.equipItem(chestItem.id)
      if (shieldItem) this.equipItem(shieldItem.id)
    }
  }

  // Move item within inventory (reordering)
  reorderInventory(fromIndex: number, toIndex: number) {
    const items = [...this.inventory]
    const [movedItem] = items.splice(fromIndex, 1)
    items.splice(toIndex, 0, movedItem)
    this.inventory = items
  }

  // Move item from inventory to stash
  moveToStash(itemId: string) {
    const item = this.inventory.find(item => item.id === itemId)
    if (item) {
      this.inventory = this.inventory.filter(item => item.id !== itemId)
      this.stash.push(item)
    }
  }

  // Move item from stash to inventory
  moveToInventory(itemId: string) {
    const item = this.stash.find(item => item.id === itemId)
    if (item) {
      this.stash = this.stash.filter(item => item.id !== itemId)
      this.inventory.push(item)
    }
  }

  // Equip item from inventory
  equipItem(itemId: string) {
    const item = this.inventory.find(item => item.id === itemId)
    if (item && item.slotType) {
      // Unequip current item in slot if any
      const currentItem = this.equipped[item.slotType]
      if (currentItem) {
        this.inventory.push(currentItem)
      }
      
      // Equip new item
      this.equipped[item.slotType] = item
      this.inventory = this.inventory.filter(item => item.id !== itemId)
    }
  }

  // Unequip item to inventory
  unequipItem(slotType: string) {
    const item = this.equipped[slotType]
    if (item) {
      this.equipped[slotType] = null
      this.inventory.push(item)
    }
  }

  // Remove item from inventory by item object
  removeItem(item: Item) {
    this.inventory = this.inventory.filter(invItem => invItem.id !== item.id)
  }

  // Unequip item directly to stash
  unequipToStash(slotType: string) {
    const item = this.equipped[slotType]
    if (item) {
      this.equipped[slotType] = null
      this.stash.push(item)
    }
  }

  // Get item by ID from any location
  getItemById(itemId: string): Item | null {
    // Check inventory
    let item = this.inventory.find(item => item.id === itemId)
    if (item) return item
    
    // Check stash
    item = this.stash.find(item => item.id === itemId)
    if (item) return item
    
    // Check equipped
    for (const slot of Object.values(this.equipped)) {
      if (slot && slot.id === itemId) return slot
    }
    
    return null
  }
}

export const inventoryStore = new InventoryStore()