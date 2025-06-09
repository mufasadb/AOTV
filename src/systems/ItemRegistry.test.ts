/**
 * Unit Tests for ItemRegistry System
 * 
 * Tests centralized item storage, location tracking, and event system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ItemRegistry } from './ItemRegistry'
import type { 
  EquipmentItem, 
  CraftingMaterialItem, 
  ItemLocation,
  ItemRegistryEventHandler
} from '../types/ItemTypes'

describe('ItemRegistry', () => {
  let registry: ItemRegistry
  let equipmentItem: EquipmentItem
  let materialItem: CraftingMaterialItem
  let eventHandler: ItemRegistryEventHandler

  beforeEach(() => {
    registry = new ItemRegistry()
    
    equipmentItem = {
      id: 'sword_001',
      definitionId: 'iron_sword',
      name: 'Iron Sword',
      description: 'A basic iron sword',
      icon: '/icons/sword.png',
      type: 'equipment',
      slotType: 'melee',
      rarity: 'common',
      itemLevel: 5,
      baseStats: { attack: 10 },
      prefixes: [],
      suffixes: [],
      stats: { attack: 10 }
    }

    materialItem = {
      id: 'mat_001',
      definitionId: 'iron_ore',
      name: 'Iron Ore',
      description: 'Raw iron ore',
      icon: '/icons/ore.png',
      type: 'material',
      materialType: 'essence',
      tier: 1,
      craftingValue: 5,
      tags: ['metal'],
      stackSize: 100,
      currentStack: 25
    }

    eventHandler = vi.fn()
  })

  describe('Item Registration', () => {
    it('should register item successfully', () => {
      const location: ItemLocation = { type: 'inventory', slotIndex: 0 }
      
      registry.registerItem(equipmentItem, location)
      
      expect(registry.hasItem('sword_001')).toBe(true)
      expect(registry.getItem('sword_001')).toBe(equipmentItem)
      expect(registry.getItemLocation('sword_001')).toEqual(location)
      expect(registry.getItemCount()).toBe(1)
    })

    it('should throw error for duplicate item ID', () => {
      const location: ItemLocation = { type: 'inventory', slotIndex: 0 }
      
      registry.registerItem(equipmentItem, location)
      
      expect(() => registry.registerItem(equipmentItem, location))
        .toThrow('Item with ID sword_001 already exists in registry')
    })

    it('should emit item_created event', () => {
      registry.addEventListener(eventHandler)
      const location: ItemLocation = { type: 'inventory', slotIndex: 0 }
      
      registry.registerItem(equipmentItem, location)
      
      expect(eventHandler).toHaveBeenCalledWith({
        type: 'item_created',
        itemId: 'sword_001',
        newLocation: location,
        item: equipmentItem
      })
    })
  })

  describe('Item Unregistration', () => {
    beforeEach(() => {
      const location: ItemLocation = { type: 'inventory', slotIndex: 0 }
      registry.registerItem(equipmentItem, location)
    })

    it('should unregister item successfully', () => {
      const result = registry.unregisterItem('sword_001')
      
      expect(result).toBe(true)
      expect(registry.hasItem('sword_001')).toBe(false)
      expect(registry.getItem('sword_001')).toBeUndefined()
      expect(registry.getItemLocation('sword_001')).toBeUndefined()
      expect(registry.getItemCount()).toBe(0)
    })

    it('should return false for non-existent item', () => {
      const result = registry.unregisterItem('nonexistent')
      expect(result).toBe(false)
    })

    it('should emit item_destroyed event', () => {
      registry.addEventListener(eventHandler)
      const location: ItemLocation = { type: 'inventory', slotIndex: 0 }
      
      registry.unregisterItem('sword_001')
      
      expect(eventHandler).toHaveBeenCalledWith({
        type: 'item_destroyed',
        itemId: 'sword_001',
        oldLocation: location,
        item: equipmentItem
      })
    })
  })

  describe('Item Updates', () => {
    beforeEach(() => {
      const location: ItemLocation = { type: 'inventory', slotIndex: 0 }
      registry.registerItem(equipmentItem, location)
    })

    it('should update item properties', () => {
      const updates = { name: 'Enhanced Iron Sword' }
      const result = registry.updateItem('sword_001', updates)
      
      expect(result).toBe(true)
      expect(registry.getItem('sword_001')!.name).toBe('Enhanced Iron Sword')
    })

    it('should return false for non-existent item', () => {
      const updates = { name: 'New Name' }
      const result = registry.updateItem('nonexistent', updates)
      
      expect(result).toBe(false)
    })

    it('should emit item_updated event', () => {
      registry.addEventListener(eventHandler)
      const updates = { name: 'Enhanced Iron Sword' }
      
      registry.updateItem('sword_001', updates)
      
      expect(eventHandler).toHaveBeenCalledWith({
        type: 'item_updated',
        itemId: 'sword_001',
        item: equipmentItem
      })
    })
  })

  describe('Location Management', () => {
    beforeEach(() => {
      const location: ItemLocation = { type: 'inventory', slotIndex: 0 }
      registry.registerItem(equipmentItem, location)
    })

    it('should move item to new location', () => {
      const newLocation: ItemLocation = { type: 'stash', slotIndex: 5 }
      const result = registry.moveItem('sword_001', newLocation)
      
      expect(result).toBe(true)
      expect(registry.getItemLocation('sword_001')).toEqual(newLocation)
    })

    it('should return false for non-existent item', () => {
      const newLocation: ItemLocation = { type: 'stash', slotIndex: 5 }
      const result = registry.moveItem('nonexistent', newLocation)
      
      expect(result).toBe(false)
    })

    it('should emit item_moved event', () => {
      registry.addEventListener(eventHandler)
      const oldLocation: ItemLocation = { type: 'inventory', slotIndex: 0 }
      const newLocation: ItemLocation = { type: 'stash', slotIndex: 5 }
      
      registry.moveItem('sword_001', newLocation)
      
      expect(eventHandler).toHaveBeenCalledWith({
        type: 'item_moved',
        itemId: 'sword_001',
        oldLocation,
        newLocation,
        item: equipmentItem
      })
    })
  })

  describe('Location Queries', () => {
    beforeEach(() => {
      // Set up multiple items in different locations
      registry.registerItem(equipmentItem, { type: 'inventory', slotIndex: 0 })
      registry.registerItem(materialItem, { type: 'stash', slotIndex: 2 })
      
      const equippedItem: EquipmentItem = {
        ...equipmentItem,
        id: 'sword_002',
        name: 'Equipped Sword'
      }
      registry.registerItem(equippedItem, { type: 'equipment', equipmentSlot: 'melee' })
    })

    it('should get inventory items', () => {
      const inventoryItems = registry.getInventoryItems()
      
      expect(inventoryItems).toHaveLength(1)
      expect(inventoryItems[0].id).toBe('sword_001')
    })

    it('should get stash items', () => {
      const stashItems = registry.getStashItems()
      
      expect(stashItems).toHaveLength(1)
      expect(stashItems[0].id).toBe('mat_001')
    })

    it('should get equipped items', () => {
      const equippedItems = registry.getEquippedItems()
      
      expect(equippedItems.size).toBe(1)
      expect(equippedItems.get('melee')?.id).toBe('sword_002')
    })

    it('should get specific equipped item', () => {
      const meleeWeapon = registry.getEquippedItem('melee')
      
      expect(meleeWeapon?.id).toBe('sword_002')
      expect(meleeWeapon?.name).toBe('Equipped Sword')
    })

    it('should return undefined for empty equipment slot', () => {
      const helmet = registry.getEquippedItem('head')
      expect(helmet).toBeUndefined()
    })

    it('should detect occupied locations', () => {
      expect(registry.isLocationOccupied({ type: 'inventory', slotIndex: 0 })).toBe(true)
      expect(registry.isLocationOccupied({ type: 'inventory', slotIndex: 1 })).toBe(false)
      expect(registry.isLocationOccupied({ type: 'equipment', equipmentSlot: 'melee' })).toBe(true)
      expect(registry.isLocationOccupied({ type: 'equipment', equipmentSlot: 'head' })).toBe(false)
    })

    it('should get items by partial location filter', () => {
      const inventoryItems = registry.getItemsInLocation({ type: 'inventory' })
      const equipmentItems = registry.getItemsInLocation({ type: 'equipment' })
      
      expect(inventoryItems).toHaveLength(1)
      expect(equipmentItems).toHaveLength(1)
    })
  })

  describe('Event System', () => {
    it('should add and remove event listeners', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      
      registry.addEventListener(handler1)
      registry.addEventListener(handler2)
      
      const location: ItemLocation = { type: 'inventory', slotIndex: 0 }
      registry.registerItem(equipmentItem, location)
      
      expect(handler1).toHaveBeenCalledTimes(1)
      expect(handler2).toHaveBeenCalledTimes(1)
      
      registry.removeEventListener(handler1)
      registry.unregisterItem('sword_001')
      
      expect(handler1).toHaveBeenCalledTimes(1) // Not called again
      expect(handler2).toHaveBeenCalledTimes(2) // Called again
    })

    it('should handle event handler errors gracefully', () => {
      const errorHandler = vi.fn(() => { throw new Error('Handler error') })
      const normalHandler = vi.fn()
      
      registry.addEventListener(errorHandler)
      registry.addEventListener(normalHandler)
      
      const location: ItemLocation = { type: 'inventory', slotIndex: 0 }
      
      // Should not throw despite error in first handler
      expect(() => registry.registerItem(equipmentItem, location)).not.toThrow()
      
      expect(errorHandler).toHaveBeenCalledTimes(1)
      expect(normalHandler).toHaveBeenCalledTimes(1)
    })
  })

  describe('Validation and Debugging', () => {
    beforeEach(() => {
      registry.registerItem(equipmentItem, { type: 'inventory', slotIndex: 0 })
      registry.registerItem(materialItem, { type: 'stash', slotIndex: 1 })
    })

    it('should validate integrity successfully', () => {
      const validation = registry.validateIntegrity()
      
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('should provide registry statistics', () => {
      const stats = registry.getStats()
      
      expect(stats.totalItems).toBe(2)
      expect(stats.byLocation.inventory).toBe(1)
      expect(stats.byLocation.stash).toBe(1)
      expect(stats.byType.equipment).toBe(1)
      expect(stats.byType.material).toBe(1)
    })

    it('should clear all items', () => {
      registry.addEventListener(eventHandler)
      
      registry.clear()
      
      expect(registry.getItemCount()).toBe(0)
      expect(registry.getAllItems()).toHaveLength(0)
      expect(eventHandler).toHaveBeenCalledTimes(2) // Two destroy events
    })
  })

  describe('Serialization', () => {
    beforeEach(() => {
      registry.registerItem(equipmentItem, { type: 'inventory', slotIndex: 0 })
      registry.registerItem(materialItem, { type: 'stash', slotIndex: 1 })
    })

    it('should serialize registry state', () => {
      const serialized = registry.serialize()
      
      expect(serialized.items).toHaveProperty('sword_001')
      expect(serialized.items).toHaveProperty('mat_001')
      expect(serialized.locations).toHaveProperty('sword_001')
      expect(serialized.locations).toHaveProperty('mat_001')
      
      expect(serialized.items.sword_001).toEqual(equipmentItem)
      expect(serialized.locations.sword_001).toEqual({ type: 'inventory', slotIndex: 0 })
    })

    it('should deserialize and restore state', () => {
      const serialized = registry.serialize()
      const newRegistry = new ItemRegistry()
      
      newRegistry.deserialize(serialized)
      
      expect(newRegistry.getItemCount()).toBe(2)
      expect(newRegistry.hasItem('sword_001')).toBe(true)
      expect(newRegistry.hasItem('mat_001')).toBe(true)
      expect(newRegistry.getItemLocation('sword_001')).toEqual({ type: 'inventory', slotIndex: 0 })
      expect(newRegistry.getItemLocation('mat_001')).toEqual({ type: 'stash', slotIndex: 1 })
    })

    it('should validate integrity after deserialization', () => {
      const serialized = registry.serialize()
      const newRegistry = new ItemRegistry()
      
      newRegistry.deserialize(serialized)
      const validation = newRegistry.validateIntegrity()
      
      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('should handle corrupted data gracefully', () => {
      const corruptedData = {
        items: { 'item_001': equipmentItem },
        locations: {} // Missing location for item_001
      }
      
      const newRegistry = new ItemRegistry()
      newRegistry.deserialize(corruptedData)
      
      // Should not crash, but validation should fail
      const validation = newRegistry.validateIntegrity()
      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Item item_001 has no location')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty registry operations', () => {
      expect(registry.getItemCount()).toBe(0)
      expect(registry.getAllItems()).toHaveLength(0)
      expect(registry.getInventoryItems()).toHaveLength(0)
      expect(registry.getStashItems()).toHaveLength(0)
      expect(registry.getEquippedItems().size).toBe(0)
      expect(registry.getEquippedItem('melee')).toBeUndefined()
    })

    it('should handle operations on non-existent items', () => {
      expect(registry.getItem('nonexistent')).toBeUndefined()
      expect(registry.getItemLocation('nonexistent')).toBeUndefined()
      expect(registry.updateItem('nonexistent', {})).toBe(false)
      expect(registry.moveItem('nonexistent', { type: 'inventory' })).toBe(false)
      expect(registry.unregisterItem('nonexistent')).toBe(false)
    })

    it('should handle complex location queries', () => {
      registry.registerItem(equipmentItem, { 
        type: 'inventory', 
        slotIndex: 0, 
        containerId: 'special_bag' 
      })
      
      const itemsInBag = registry.getItemsInLocation({ 
        type: 'inventory', 
        containerId: 'special_bag' 
      })
      
      expect(itemsInBag).toHaveLength(1)
      expect(itemsInBag[0].id).toBe('sword_001')
      
      const itemsInInventory = registry.getItemsInLocation({ type: 'inventory' })
      expect(itemsInInventory).toHaveLength(1) // Should still match
    })
  })
})