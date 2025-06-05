import { makeAutoObservable } from 'mobx'
import itemsData from '../data/items.json'
import type { InventoryItem } from '../stores/InventoryStore'

export interface ItemDefinition {
  id: string
  name: string
  type: 'weapon' | 'armor' | 'consumable' | 'material' | 'key'
  slotType?: 'melee' | 'shield' | 'head' | 'chest' | 'boots' | 'gloves' | 'pants' | 'shoulder'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  description: string
  icon: string
  stats?: { [key: string]: number }
  damageType?: 'physical' | 'fire' | 'lightning' | 'ice' | 'dark'
  requirements?: { level?: number }
  effects?: { [key: string]: any }
  stackSize?: number
  craftingValue?: number
  enchantingValue?: number
  dungeonTier?: number
  dungeonType?: string
}

class ItemSystem {
  private itemDatabase: { [category: string]: { [id: string]: ItemDefinition } } = {}

  constructor() {
    makeAutoObservable(this)
    this.loadItemDatabase()
  }

  private loadItemDatabase() {
    // Load all item categories from JSON
    this.itemDatabase = itemsData as any
  }

  // Get item definition by ID
  getItemDefinition(itemId: string): ItemDefinition | null {
    for (const category of Object.values(this.itemDatabase)) {
      if (category[itemId]) {
        return category[itemId]
      }
    }
    return null
  }

  // Generate inventory item from definition
  generateInventoryItem(itemId: string): InventoryItem | null {
    const definition = this.getItemDefinition(itemId)
    if (!definition) {
      console.warn(`Item definition not found for ID: ${itemId}`)
      return null
    }

    return {
      id: `${itemId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Unique instance ID
      name: definition.name,
      icon: definition.icon,
      rarity: definition.rarity,
      type: definition.type,
      slotType: definition.slotType,
      description: definition.description,
      stats: definition.stats ? { ...definition.stats } : undefined
    }
  }


  // Get all items of a specific type
  getItemsByType(type: string): ItemDefinition[] {
    const category = this.itemDatabase[type]
    return category ? Object.values(category) : []
  }

  // Get all items of a specific rarity
  getItemsByRarity(rarity: string): ItemDefinition[] {
    const items: ItemDefinition[] = []
    for (const category of Object.values(this.itemDatabase)) {
      for (const item of Object.values(category)) {
        if (item.rarity === rarity) {
          items.push(item)
        }
      }
    }
    return items
  }

  // Get random item from specific category and rarity
  getRandomItem(type?: string, rarity?: string): InventoryItem | null {
    let candidateItems: ItemDefinition[] = []

    if (type) {
      candidateItems = this.getItemsByType(type)
      if (rarity) {
        candidateItems = candidateItems.filter(item => item.rarity === rarity)
      }
    } else if (rarity) {
      candidateItems = this.getItemsByRarity(rarity)
    } else {
      // Get all items
      for (const category of Object.values(this.itemDatabase)) {
        candidateItems.push(...Object.values(category))
      }
    }

    if (candidateItems.length === 0) return null

    const randomItem = candidateItems[Math.floor(Math.random() * candidateItems.length)]
    return this.generateInventoryItem(randomItem.id)
  }

  // Generate loot based on rarity weights
  generateLoot(options: {
    rarityWeights?: { [rarity: string]: number }
    itemTypes?: string[]
    minItems?: number
    maxItems?: number
  } = {}): InventoryItem[] {
    const {
      rarityWeights = { common: 60, uncommon: 25, rare: 10, epic: 4, legendary: 1 },
      itemTypes = ['weapons', 'armor', 'consumables', 'materials'],
      minItems = 1,
      maxItems = 3
    } = options

    const loot: InventoryItem[] = []
    const itemCount = Math.floor(Math.random() * (maxItems - minItems + 1)) + minItems

    for (let i = 0; i < itemCount; i++) {
      // Roll for rarity
      const rarity = this.rollRarity(rarityWeights)
      
      // Pick random item type
      const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)]
      
      // Generate item
      const item = this.getRandomItem(itemType, rarity)
      if (item) {
        loot.push(item)
      }
    }

    return loot
  }

  private rollRarity(weights: { [rarity: string]: number }): string {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
    let random = Math.random() * totalWeight
    
    for (const [rarity, weight] of Object.entries(weights)) {
      random -= weight
      if (random <= 0) {
        return rarity
      }
    }
    
    return 'common' // Fallback
  }

  // Get all available item IDs
  getAllItemIds(): string[] {
    const ids: string[] = []
    for (const category of Object.values(this.itemDatabase)) {
      ids.push(...Object.keys(category))
    }
    return ids
  }

  // Validate item exists
  itemExists(itemId: string): boolean {
    return this.getItemDefinition(itemId) !== null
  }
}

export const itemSystem = new ItemSystem()