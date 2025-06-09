/**
 * Unit Tests for Item Utility Functions
 * 
 * Tests item creation, manipulation, and utility functions
 */

import { describe, it, expect, beforeEach } from 'vitest'
import type {
  ItemDefinition,
  EquipmentItem,
  CraftingMaterialItem,
  AffixInstance
} from '../types/ItemTypes'
import {
  generateUniqueItemId,
  createBaseItemFromDefinition,
  createEquipmentItemFromDefinition,
  createCraftingMaterialFromDefinition,
  createItemFromDefinition,
  cloneItem,
  combineItemStacks,
  splitItemStack,
  calculateFinalStats,
  addStatsToTotal,
  addAffixToItem,
  removeAffixFromItem,
  canStackWith,
  hasSpaceInStack,
  getStackSpace,
  canEquipToSlot,
  getRarityColor,
  getRarityWeight,
  formatItemName
} from './ItemUtils'

describe('Item Creation Utilities', () => {
  let weaponDefinition: ItemDefinition
  let materialDefinition: ItemDefinition

  beforeEach(() => {
    weaponDefinition = {
      id: 'iron_sword',
      name: 'Iron Sword',
      type: 'weapon',
      category: 'sword',
      slotType: 'melee',
      rarity: 'common',
      description: 'A basic iron sword',
      icon: '/icons/sword.png',
      itemLevel: 5,
      baseStats: { attack: 10, speed: 5 },
      requirements: { level: 3 },
      craftingValue: 20
    }

    materialDefinition = {
      id: 'iron_ore',
      name: 'Iron Ore',
      type: 'material',
      category: 'ore',
      rarity: 'common',
      description: 'Raw iron ore',
      icon: '/icons/ore.png',
      materialType: 'essence',
      tier: 1,
      craftingValue: 5,
      stackSize: 100,
      tags: ['metal', 'basic']
    }
  })

  describe('generateUniqueItemId', () => {
    it('should generate unique IDs with definition prefix', () => {
      const id1 = generateUniqueItemId('test_item')
      const id2 = generateUniqueItemId('test_item')
      
      expect(id1).toMatch(/^test_item_\d+_\w+$/)
      expect(id2).toMatch(/^test_item_\d+_\w+$/)
      expect(id1).not.toBe(id2)
    })
  })

  describe('createBaseItemFromDefinition', () => {
    it('should create base item with core properties', () => {
      const baseItem = createBaseItemFromDefinition(weaponDefinition)
      
      expect(baseItem.definitionId).toBe('iron_sword')
      expect(baseItem.name).toBe('Iron Sword')
      expect(baseItem.description).toBe('A basic iron sword')
      expect(baseItem.icon).toBe('/icons/sword.png')
      expect(baseItem.currentStack).toBe(1)
    })

    it('should preserve stackSize if present', () => {
      const baseItem = createBaseItemFromDefinition(materialDefinition)
      expect(baseItem.stackSize).toBe(100)
    })
  })

  describe('createEquipmentItemFromDefinition', () => {
    it('should create equipment item with all properties', () => {
      const equipment = createEquipmentItemFromDefinition(weaponDefinition)
      
      expect(equipment.type).toBe('equipment')
      expect(equipment.slotType).toBe('melee')
      expect(equipment.rarity).toBe('common')
      expect(equipment.itemLevel).toBe(5)
      expect(equipment.baseStats).toEqual({ attack: 10, speed: 5 })
      expect(equipment.stats).toEqual({ attack: 10, speed: 5 })
      expect(equipment.requirements).toEqual({ level: 3 })
      expect(equipment.prefixes).toEqual([])
      expect(equipment.suffixes).toEqual([])
    })

    it('should throw error for non-equipment types', () => {
      expect(() => createEquipmentItemFromDefinition(materialDefinition))
        .toThrow('Cannot create equipment item from definition of type: material')
    })

    it('should throw error for missing slotType', () => {
      const invalidDef = { ...weaponDefinition }
      delete invalidDef.slotType
      
      expect(() => createEquipmentItemFromDefinition(invalidDef))
        .toThrow('Equipment definition iron_sword missing slotType')
    })
  })

  describe('createCraftingMaterialFromDefinition', () => {
    it('should create crafting material with all properties', () => {
      const material = createCraftingMaterialFromDefinition(materialDefinition)
      
      expect(material.type).toBe('material')
      expect(material.materialType).toBe('essence')
      expect(material.tier).toBe(1)
      expect(material.craftingValue).toBe(5)
      expect(material.tags).toEqual(['metal', 'basic'])
      expect(material.stackSize).toBe(100)
      expect(material.currentStack).toBe(1)
    })

    it('should throw error for non-material types', () => {
      expect(() => createCraftingMaterialFromDefinition(weaponDefinition))
        .toThrow('Cannot create crafting material from definition of type: weapon')
    })

    it('should use default stackSize if not specified', () => {
      const defWithoutStack = { ...materialDefinition }
      delete defWithoutStack.stackSize
      
      const material = createCraftingMaterialFromDefinition(defWithoutStack)
      expect(material.stackSize).toBe(100) // Default for materials
    })
  })

  describe('createItemFromDefinition', () => {
    it('should create correct item type based on definition', () => {
      const equipment = createItemFromDefinition(weaponDefinition)
      const material = createItemFromDefinition(materialDefinition)
      
      expect(equipment.type).toBe('equipment')
      expect(material.type).toBe('material')
    })

    it('should throw error for unknown item type', () => {
      const invalidDef = { ...weaponDefinition, type: 'unknown' as any }
      expect(() => createItemFromDefinition(invalidDef))
        .toThrow('Unknown item type: unknown')
    })
  })
})

describe('Item Manipulation', () => {
  let stackableItem: CraftingMaterialItem
  let equipmentItem: EquipmentItem

  beforeEach(() => {
    stackableItem = {
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
  })

  describe('cloneItem', () => {
    it('should create deep copy of item', () => {
      const clone = cloneItem(stackableItem)
      
      expect(clone).toEqual(stackableItem)
      expect(clone).not.toBe(stackableItem)
      expect(clone.tags).not.toBe(stackableItem.tags)
    })
  })

  describe('combineItemStacks', () => {
    it('should combine compatible stacks within limit', () => {
      const item1 = { ...stackableItem, currentStack: 30 }
      const item2 = { ...stackableItem, id: 'mat_002', currentStack: 20 }
      
      const combined = combineItemStacks(item1, item2)
      
      expect(combined).not.toBeNull()
      expect(combined!.currentStack).toBe(50)
    })

    it('should return null if stacks exceed maximum', () => {
      const item1 = { ...stackableItem, currentStack: 80 }
      const item2 = { ...stackableItem, id: 'mat_002', currentStack: 30 }
      
      const combined = combineItemStacks(item1, item2)
      expect(combined).toBeNull()
    })

    it('should return null for different definition IDs', () => {
      const item2 = { ...stackableItem, id: 'mat_002', definitionId: 'steel_ore' }
      
      const combined = combineItemStacks(stackableItem, item2)
      expect(combined).toBeNull()
    })

    it('should return null for non-stackable items', () => {
      const combined = combineItemStacks(equipmentItem, equipmentItem)
      expect(combined).toBeNull()
    })
  })

  describe('splitItemStack', () => {
    it('should split stack into two items', () => {
      const result = splitItemStack(stackableItem, 10)
      
      expect(result).not.toBeNull()
      const [original, split] = result!
      
      expect(original.currentStack).toBe(15) // 25 - 10
      expect(split.currentStack).toBe(10)
      expect(split.id).not.toBe(original.id)
      expect(split.definitionId).toBe(original.definitionId)
    })

    it('should return null for invalid split amounts', () => {
      expect(splitItemStack(stackableItem, 0)).toBeNull()
      expect(splitItemStack(stackableItem, 25)).toBeNull() // Full amount
      expect(splitItemStack(stackableItem, 30)).toBeNull() // Exceeds current
    })

    it('should return null for non-stackable items', () => {
      expect(splitItemStack(equipmentItem, 1)).toBeNull()
    })
  })
})

describe('Equipment Stats and Affixes', () => {
  let equipment: EquipmentItem
  let attackAffix: AffixInstance
  let speedAffix: AffixInstance

  beforeEach(() => {
    equipment = {
      id: 'sword_001',
      definitionId: 'iron_sword',
      name: 'Iron Sword',
      description: 'A basic iron sword',
      icon: '/icons/sword.png',
      type: 'equipment',
      slotType: 'melee',
      rarity: 'common',
      itemLevel: 5,
      baseStats: { attack: 10, speed: 5 },
      prefixes: [],
      suffixes: [],
      stats: { attack: 10, speed: 5 }
    }

    attackAffix = {
      id: 'sharp_prefix',
      name: 'Sharp',
      description: 'Increases attack',
      stats: { attack: 5 },
      tier: 1,
      weight: 100
    }

    speedAffix = {
      id: 'swift_suffix',
      name: 'of Swiftness',
      description: 'Increases speed',
      stats: { speed: 3 },
      tier: 1,
      weight: 100
    }
  })

  describe('calculateFinalStats', () => {
    it('should calculate stats with no affixes', () => {
      const finalStats = calculateFinalStats(equipment)
      expect(finalStats).toEqual({ attack: 10, speed: 5 })
    })

    it('should calculate stats with prefixes and suffixes', () => {
      equipment.prefixes = [attackAffix]
      equipment.suffixes = [speedAffix]
      
      const finalStats = calculateFinalStats(equipment)
      expect(finalStats.attack).toBe(15) // 10 base + 5 prefix
      expect(finalStats.speed).toBe(8)   // 5 base + 3 suffix
    })

    it('should handle implicit affixes', () => {
      const implicitAffix: AffixInstance = {
        id: 'sword_implicit',
        name: 'Weapon Training',
        description: 'Inherent weapon bonus',
        stats: { attack: 2 },
        tier: 0,
        weight: 0
      }
      
      equipment.implicit = implicitAffix
      equipment.prefixes = [attackAffix]
      
      const finalStats = calculateFinalStats(equipment)
      expect(finalStats.attack).toBe(17) // 10 base + 2 implicit + 5 prefix
    })
  })

  describe('addStatsToTotal', () => {
    it('should add stats correctly', () => {
      const total = { attack: 10, speed: 5 }
      const source = { attack: 3, critChance: 10 }
      
      addStatsToTotal(total, source)
      
      expect(total.attack).toBe(13)
      expect(total.speed).toBe(5)
      expect(total.critChance).toBe(10)
    })

    it('should handle undefined source stats', () => {
      const total = { attack: 10 }
      const source = { attack: 5, speed: undefined }
      
      addStatsToTotal(total, source)
      expect(total.attack).toBe(15)
      expect(total.speed).toBeUndefined()
    })
  })

  describe('addAffixToItem', () => {
    it('should add prefix successfully', () => {
      const result = addAffixToItem(equipment, attackAffix, 'prefix')
      
      expect(result).toBe(true)
      expect(equipment.prefixes).toHaveLength(1)
      expect(equipment.prefixes[0]).toBe(attackAffix)
      expect(equipment.stats.attack).toBe(15) // Recalculated
    })

    it('should add suffix successfully', () => {
      const result = addAffixToItem(equipment, speedAffix, 'suffix')
      
      expect(result).toBe(true)
      expect(equipment.suffixes).toHaveLength(1)
      expect(equipment.suffixes[0]).toBe(speedAffix)
      expect(equipment.stats.speed).toBe(8) // Recalculated
    })

    it('should reject when at maximum affixes', () => {
      // Fill prefixes to maximum (3)
      equipment.prefixes = [attackAffix, attackAffix, attackAffix]
      
      const result = addAffixToItem(equipment, speedAffix, 'prefix')
      expect(result).toBe(false)
      expect(equipment.prefixes).toHaveLength(3)
    })
  })

  describe('removeAffixFromItem', () => {
    beforeEach(() => {
      equipment.prefixes = [attackAffix]
      equipment.suffixes = [speedAffix]
      equipment.stats = calculateFinalStats(equipment)
    })

    it('should remove prefix by ID', () => {
      const result = removeAffixFromItem(equipment, 'sharp_prefix')
      
      expect(result).toBe(true)
      expect(equipment.prefixes).toHaveLength(0)
      expect(equipment.stats.attack).toBe(10) // Recalculated without prefix
    })

    it('should remove suffix by ID', () => {
      const result = removeAffixFromItem(equipment, 'swift_suffix')
      
      expect(result).toBe(true)
      expect(equipment.suffixes).toHaveLength(0)
      expect(equipment.stats.speed).toBe(5) // Recalculated without suffix
    })

    it('should return false for non-existent affix', () => {
      const result = removeAffixFromItem(equipment, 'nonexistent')
      expect(result).toBe(false)
    })
  })
})

describe('Item Validation and Queries', () => {
  let stackableItem: CraftingMaterialItem
  let equipmentItem: EquipmentItem

  beforeEach(() => {
    stackableItem = {
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
      currentStack: 75
    }

    equipmentItem = {
      id: 'sword_001',
      definitionId: 'iron_sword',
      name: 'Iron Sword',
      description: 'A basic iron sword',
      icon: '/icons/sword.png',
      type: 'equipment',
      slotType: 'melee',
      rarity: 'rare',
      itemLevel: 5,
      baseStats: { attack: 10 },
      prefixes: [],
      suffixes: [],
      stats: { attack: 10 }
    }
  })

  describe('canStackWith', () => {
    it('should return true for compatible items', () => {
      const item2 = { ...stackableItem, id: 'mat_002', currentStack: 20 }
      expect(canStackWith(stackableItem, item2)).toBe(true)
    })

    it('should return false for different definition IDs', () => {
      const item2 = { ...stackableItem, definitionId: 'steel_ore' }
      expect(canStackWith(stackableItem, item2)).toBe(false)
    })

    it('should return false for non-stackable items', () => {
      expect(canStackWith(equipmentItem, equipmentItem)).toBe(false)
    })
  })

  describe('hasSpaceInStack', () => {
    it('should return true when there is space', () => {
      expect(hasSpaceInStack(stackableItem, 25)).toBe(true)
      expect(hasSpaceInStack(stackableItem, 10)).toBe(true)
    })

    it('should return false when at capacity', () => {
      expect(hasSpaceInStack(stackableItem, 26)).toBe(false)
    })

    it('should return false for non-stackable items', () => {
      expect(hasSpaceInStack(equipmentItem, 1)).toBe(false)
      expect(hasSpaceInStack(equipmentItem, 0)).toBe(true) // 0 is always valid
    })
  })

  describe('getStackSpace', () => {
    it('should return remaining space', () => {
      expect(getStackSpace(stackableItem)).toBe(25) // 100 - 75
    })

    it('should return 0 for non-stackable items', () => {
      expect(getStackSpace(equipmentItem)).toBe(0)
    })
  })

  describe('canEquipToSlot', () => {
    it('should return true for correct slot', () => {
      expect(canEquipToSlot(equipmentItem, 'melee')).toBe(true)
    })

    it('should return false for incorrect slot', () => {
      expect(canEquipToSlot(equipmentItem, 'head')).toBe(false)
    })

    it('should return false for non-equipment items', () => {
      expect(canEquipToSlot(stackableItem, 'melee')).toBe(false)
    })
  })
})

describe('Display Helpers', () => {
  describe('getRarityColor', () => {
    it('should return correct colors for rarities', () => {
      expect(getRarityColor('common')).toBe('#ffffff')
      expect(getRarityColor('uncommon')).toBe('#1eff00')
      expect(getRarityColor('rare')).toBe('#0070dd')
      expect(getRarityColor('epic')).toBe('#a335ee')
      expect(getRarityColor('legendary')).toBe('#ff8000')
    })
  })

  describe('getRarityWeight', () => {
    it('should return correct weights for rarities', () => {
      expect(getRarityWeight('common')).toBe(1)
      expect(getRarityWeight('uncommon')).toBe(2)
      expect(getRarityWeight('rare')).toBe(3)
      expect(getRarityWeight('epic')).toBe(4)
      expect(getRarityWeight('legendary')).toBe(5)
    })
  })

  describe('formatItemName', () => {
    it('should format basic item name', () => {
      const item = {
        id: 'sword_001',
        definitionId: 'iron_sword',
        name: 'Iron Sword',
        description: 'A basic sword',
        icon: '/icons/sword.png',
        type: 'equipment' as const,
        slotType: 'melee' as const,
        rarity: 'common' as const,
        itemLevel: 5,
        baseStats: { attack: 10 },
        prefixes: [],
        suffixes: [],
        stats: { attack: 10 }
      }

      expect(formatItemName(item)).toBe('Iron Sword')
    })

    it('should include affix names for equipment', () => {
      const item = {
        id: 'sword_001',
        definitionId: 'iron_sword',
        name: 'Iron Sword',
        description: 'A basic sword',
        icon: '/icons/sword.png',
        type: 'equipment' as const,
        slotType: 'melee' as const,
        rarity: 'rare' as const,
        itemLevel: 5,
        baseStats: { attack: 10 },
        prefixes: [{ id: 'sharp', name: 'Sharp', description: '', stats: {}, tier: 1, weight: 100 }],
        suffixes: [{ id: 'speed', name: 'of Speed', description: '', stats: {}, tier: 1, weight: 100 }],
        stats: { attack: 15 }
      }

      expect(formatItemName(item)).toBe('Sharp Iron Sword of Speed')
    })

    it('should include stack count for stackable items', () => {
      const item = {
        id: 'mat_001',
        definitionId: 'iron_ore',
        name: 'Iron Ore',
        description: 'Raw iron ore',
        icon: '/icons/ore.png',
        type: 'material' as const,
        materialType: 'essence' as const,
        tier: 1,
        craftingValue: 5,
        tags: ['metal'],
        stackSize: 100,
        currentStack: 25
      }

      expect(formatItemName(item)).toBe('Iron Ore (25)')
    })
  })
})