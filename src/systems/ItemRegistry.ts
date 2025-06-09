/**
 * ItemRegistry - Centralized Item Storage System
 * 
 * This system provides a single source of truth for all item instances in the game,
 * replacing the copy-based approach with a reference-based system that tracks
 * item locations and ensures data integrity.
 */

import { makeAutoObservable } from 'mobx'
import type {
  BaseItem,
  AnyItem,
  ItemLocation,
  EquipmentSlot
} from '../types/ItemTypes'

// Event types for item registry notifications
export interface ItemRegistryEvent {
  type: 'item_created' | 'item_destroyed' | 'item_moved' | 'item_updated'
  itemId: string
  oldLocation?: ItemLocation
  newLocation?: ItemLocation
  item?: AnyItem
}

export type ItemRegistryEventHandler = (event: ItemRegistryEvent) => void

/**
 * Central registry for all item instances in the game.
 * Provides single source of truth with location tracking and event notifications.
 */
class ItemRegistry {
  private items: Map<string, AnyItem> = new Map()
  private locations: Map<string, ItemLocation> = new Map()
  private eventHandlers: ItemRegistryEventHandler[] = []

  constructor() {
    makeAutoObservable(this)
  }

  // =====================================
  // ITEM MANAGEMENT
  // =====================================

  /**
   * Register a new item in the registry
   */
  registerItem(item: AnyItem, location: ItemLocation): void {
    if (this.items.has(item.id)) {
      throw new Error(`Item with ID ${item.id} already exists in registry`)
    }

    this.items.set(item.id, item)
    this.locations.set(item.id, location)

    this.notifyEventHandlers({
      type: 'item_created',
      itemId: item.id,
      newLocation: location,
      item
    })
  }

  /**
   * Remove an item from the registry (permanently destroy)
   */
  unregisterItem(itemId: string): boolean {
    const item = this.items.get(itemId)
    const location = this.locations.get(itemId)

    if (!item) return false

    this.items.delete(itemId)
    this.locations.delete(itemId)

    this.notifyEventHandlers({
      type: 'item_destroyed',
      itemId,
      oldLocation: location,
      item
    })

    return true
  }

  /**
   * Get an item by ID
   */
  getItem(itemId: string): AnyItem | undefined {
    return this.items.get(itemId)
  }

  /**
   * Update an item's properties (for stat modifications, etc.)
   */
  updateItem(itemId: string, updates: Partial<AnyItem>): boolean {
    const item = this.items.get(itemId)
    if (!item) return false

    Object.assign(item, updates)

    this.notifyEventHandlers({
      type: 'item_updated',
      itemId,
      item
    })

    return true
  }

  /**
   * Check if an item exists in the registry
   */
  hasItem(itemId: string): boolean {
    return this.items.has(itemId)
  }

  /**
   * Get all items in the registry
   */
  getAllItems(): AnyItem[] {
    return Array.from(this.items.values())
  }

  /**
   * Get total number of items in registry
   */
  getItemCount(): number {
    return this.items.size
  }

  // =====================================
  // LOCATION MANAGEMENT
  // =====================================

  /**
   * Get the current location of an item
   */
  getItemLocation(itemId: string): ItemLocation | undefined {
    return this.locations.get(itemId)
  }

  /**
   * Move an item to a new location
   */
  moveItem(itemId: string, newLocation: ItemLocation): boolean {
    const item = this.items.get(itemId)
    const oldLocation = this.locations.get(itemId)

    if (!item) return false

    this.locations.set(itemId, newLocation)

    this.notifyEventHandlers({
      type: 'item_moved',
      itemId,
      oldLocation,
      newLocation,
      item
    })

    return true
  }

  /**
   * Get all items in a specific location
   */
  getItemsInLocation(location: Partial<ItemLocation>): AnyItem[] {
    const items: AnyItem[] = []

    for (const [itemId, itemLocation] of this.locations.entries()) {
      if (this.locationMatches(itemLocation, location)) {
        const item = this.items.get(itemId)
        if (item) items.push(item)
      }
    }

    return items
  }

  /**
   * Get all items in inventory
   */
  getInventoryItems(): AnyItem[] {
    return this.getItemsInLocation({ type: 'inventory' })
  }

  /**
   * Get all items in stash
   */
  getStashItems(): AnyItem[] {
    return this.getItemsInLocation({ type: 'stash' })
  }

  /**
   * Get all equipped items as a map
   */
  getEquippedItems(): Map<EquipmentSlot, AnyItem> {
    const equipped = new Map<EquipmentSlot, AnyItem>()

    for (const [itemId, location] of this.locations.entries()) {
      if (location.type === 'equipment' && location.equipmentSlot) {
        const item = this.items.get(itemId)
        if (item) {
          equipped.set(location.equipmentSlot, item)
        }
      }
    }

    return equipped
  }

  /**
   * Get item equipped in a specific slot
   */
  getEquippedItem(slot: EquipmentSlot): AnyItem | undefined {
    return this.getEquippedItems().get(slot)
  }

  /**
   * Check if a location is currently occupied
   */
  isLocationOccupied(location: ItemLocation): boolean {
    for (const itemLocation of this.locations.values()) {
      if (this.locationsEqual(itemLocation, location)) {
        return true
      }
    }
    return false
  }

  // =====================================
  // LOCATION UTILITIES
  // =====================================

  private locationMatches(itemLocation: ItemLocation, filter: Partial<ItemLocation>): boolean {
    if (filter.type && itemLocation.type !== filter.type) return false
    if (filter.slotIndex !== undefined && itemLocation.slotIndex !== filter.slotIndex) return false
    if (filter.equipmentSlot && itemLocation.equipmentSlot !== filter.equipmentSlot) return false
    if (filter.containerId && itemLocation.containerId !== filter.containerId) return false
    return true
  }

  private locationsEqual(loc1: ItemLocation, loc2: ItemLocation): boolean {
    return (
      loc1.type === loc2.type &&
      loc1.slotIndex === loc2.slotIndex &&
      loc1.equipmentSlot === loc2.equipmentSlot &&
      loc1.containerId === loc2.containerId
    )
  }

  // =====================================
  // EVENT SYSTEM
  // =====================================

  /**
   * Subscribe to item registry events
   */
  addEventListener(handler: ItemRegistryEventHandler): void {
    this.eventHandlers.push(handler)
  }

  /**
   * Unsubscribe from item registry events
   */
  removeEventListener(handler: ItemRegistryEventHandler): void {
    const index = this.eventHandlers.indexOf(handler)
    if (index !== -1) {
      this.eventHandlers.splice(index, 1)
    }
  }

  private notifyEventHandlers(event: ItemRegistryEvent): void {
    for (const handler of this.eventHandlers) {
      try {
        handler(event)
      } catch (error) {
        console.error('Error in item registry event handler:', error)
      }
    }
  }

  // =====================================
  // VALIDATION AND DEBUGGING
  // =====================================

  /**
   * Validate registry integrity (for debugging)
   */
  validateIntegrity(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check that all items have locations
    for (const itemId of this.items.keys()) {
      if (!this.locations.has(itemId)) {
        errors.push(`Item ${itemId} has no location`)
      }
    }

    // Check that all locations have items
    for (const itemId of this.locations.keys()) {
      if (!this.items.has(itemId)) {
        errors.push(`Location exists for non-existent item ${itemId}`)
      }
    }

    // Check for duplicate locations (same exact location)
    const locationStrings = new Set<string>()
    for (const [itemId, location] of this.locations.entries()) {
      const locationStr = JSON.stringify(location)
      if (locationStrings.has(locationStr)) {
        errors.push(`Duplicate location found: ${locationStr}`)
      }
      locationStrings.add(locationStr)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Get registry statistics for debugging
   */
  getStats(): {
    totalItems: number
    byLocation: { [locationType: string]: number }
    byType: { [itemType: string]: number }
  } {
    const stats = {
      totalItems: this.items.size,
      byLocation: {} as { [locationType: string]: number },
      byType: {} as { [itemType: string]: number }
    }

    // Count by location
    for (const location of this.locations.values()) {
      stats.byLocation[location.type] = (stats.byLocation[location.type] || 0) + 1
    }

    // Count by item type
    for (const item of this.items.values()) {
      const itemType = (item as any).type || 'unknown'
      stats.byType[itemType] = (stats.byType[itemType] || 0) + 1
    }

    return stats
  }

  /**
   * Clear all items (for testing or reset)
   */
  clear(): void {
    const itemIds = Array.from(this.items.keys())
    
    for (const itemId of itemIds) {
      this.unregisterItem(itemId)
    }
  }

  // =====================================
  // SERIALIZATION (for save/load)
  // =====================================

  /**
   * Serialize registry state for saving
   */
  serialize(): {
    items: { [itemId: string]: AnyItem }
    locations: { [itemId: string]: ItemLocation }
  } {
    const items: { [itemId: string]: AnyItem } = {}
    const locations: { [itemId: string]: ItemLocation } = {}

    for (const [itemId, item] of this.items.entries()) {
      items[itemId] = JSON.parse(JSON.stringify(item)) // Deep clone
    }

    for (const [itemId, location] of this.locations.entries()) {
      locations[itemId] = { ...location } // Shallow clone is fine for locations
    }

    return { items, locations }
  }

  /**
   * Deserialize and restore registry state from save data
   */
  deserialize(data: {
    items: { [itemId: string]: AnyItem }
    locations: { [itemId: string]: ItemLocation }
  }): void {
    this.clear()

    // Restore items and locations
    for (const [itemId, item] of Object.entries(data.items)) {
      const location = data.locations[itemId]
      if (location) {
        this.items.set(itemId, item)
        this.locations.set(itemId, location)
      }
    }

    // Validate after loading
    const validation = this.validateIntegrity()
    if (!validation.isValid) {
      console.error('Registry integrity errors after deserialize:', validation.errors)
    }
  }
}

// Singleton instance
export const itemRegistry = new ItemRegistry()

// Export class for testing
export { ItemRegistry }