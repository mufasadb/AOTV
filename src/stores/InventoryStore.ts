import { makeAutoObservable } from 'mobx'
import { getWeaponIcon, getArmorIcon, getLootIcon, getProfessionIcon } from '../utils/iconHelper'

export interface InventoryItem {
  id: string
  name: string
  icon: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  type: 'weapon' | 'armor' | 'material' | 'consumable' | 'key'
  slotType?: 'melee' | 'shield' | 'head' | 'chest' | 'boots' | 'gloves' | 'pants' | 'shoulder'
  description?: string
  stats?: { [key: string]: number }
}

class InventoryStore {
  // Player inventory (backpack)
  inventory: InventoryItem[] = []
  
  // Stash storage
  stash: InventoryItem[] = []
  
  // Equipped items
  equipped: { [slotType: string]: InventoryItem | null } = {
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

  // Initialize with some test items for drag-drop testing
  initializeTestItems() {
    this.inventory = [
      {
        id: 'sword-1',
        name: 'Iron Sword',
        icon: getWeaponIcon('sword', 15),
        rarity: 'uncommon',
        type: 'weapon',
        slotType: 'melee',
        description: 'A sturdy iron blade',
        stats: { attack: 12, speed: 8 }
      },
      {
        id: 'helmet-1',
        name: 'Leather Cap',
        icon: getArmorIcon('helmet', 12),
        rarity: 'common',
        type: 'armor',
        slotType: 'head',
        description: 'Basic head protection',
        stats: { armor: 3, dodge: 2 }
      },
      {
        id: 'potion-1',
        name: 'Health Potion',
        icon: getProfessionIcon('alchemy', 5),
        rarity: 'common',
        type: 'consumable',
        description: 'Restores 50 HP'
      },
      {
        id: 'axe-1',
        name: 'War Axe',
        icon: getWeaponIcon('axe', 22),
        rarity: 'rare',
        type: 'weapon',
        slotType: 'melee',
        description: 'Heavy two-handed axe',
        stats: { attack: 18, speed: 4 }
      },
      {
        id: 'chest-1',
        name: 'Chain Mail',
        icon: getArmorIcon('chest', 8),
        rarity: 'uncommon',
        type: 'armor',
        slotType: 'chest',
        description: 'Interlocked metal rings',
        stats: { armor: 8, dodge: -2 }
      },
      {
        id: 'material-1',
        name: 'Iron Ore',
        icon: getLootIcon(45),
        rarity: 'common',
        type: 'material',
        description: 'Raw iron for crafting'
      },
      {
        id: 'shield-1',
        name: 'Wooden Shield',
        icon: getWeaponIcon('shield', 25),
        rarity: 'common',
        type: 'weapon',
        slotType: 'shield',
        description: 'Basic wooden protection',
        stats: { armor: 4, block: 15 }
      },
      {
        id: 'boots-1',
        name: 'Speed Boots',
        icon: getArmorIcon('boots', 46),
        rarity: 'rare',
        type: 'armor',
        slotType: 'boots',
        description: 'Enchanted for swift movement',
        stats: { dodge: 8, speed: 12 }
      }
    ]

    // Start with some items equipped for demonstration
    this.equipped.melee = this.inventory[0] // Iron Sword
    this.equipped.shield = this.inventory[6] // Wooden Shield
    this.equipped.head = this.inventory[1] // Leather Cap
    this.equipped.chest = this.inventory[4] // Chain Mail
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

  // Get item by ID from any location
  getItemById(itemId: string): InventoryItem | null {
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