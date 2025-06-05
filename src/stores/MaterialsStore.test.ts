import { describe, it, expect, beforeEach } from 'vitest'
import { materialsStore } from './MaterialsStore'

describe('MaterialsStore', () => {
  beforeEach(() => {
    materialsStore.clearAll()
  })

  it('starts with empty materials', () => {
    expect(materialsStore.allMaterials).toEqual([])
    expect(materialsStore.uniqueMaterialCount).toBe(0)
    expect(materialsStore.totalMaterialCount).toBe(0)
  })

  it('can add materials', () => {
    materialsStore.addMaterial('magic_dust', 5)
    
    expect(materialsStore.getQuantity('magic_dust')).toBe(5)
    expect(materialsStore.uniqueMaterialCount).toBe(1)
    expect(materialsStore.totalMaterialCount).toBe(5)
  })

  it('can add multiple materials at once', () => {
    materialsStore.addMaterials({
      'magic_dust': 3,
      'essence_fragments': 2,
      'iron_ore': 1
    })
    
    expect(materialsStore.getQuantity('magic_dust')).toBe(3)
    expect(materialsStore.getQuantity('essence_fragments')).toBe(2)
    expect(materialsStore.getQuantity('iron_ore')).toBe(1)
    expect(materialsStore.uniqueMaterialCount).toBe(3)
    expect(materialsStore.totalMaterialCount).toBe(6)
  })

  it('stacks identical materials', () => {
    materialsStore.addMaterial('magic_dust', 3)
    materialsStore.addMaterial('magic_dust', 2)
    
    expect(materialsStore.getQuantity('magic_dust')).toBe(5)
    expect(materialsStore.uniqueMaterialCount).toBe(1)
  })

  it('can remove materials', () => {
    materialsStore.addMaterial('magic_dust', 5)
    
    const success = materialsStore.removeMaterial('magic_dust', 2)
    
    expect(success).toBe(true)
    expect(materialsStore.getQuantity('magic_dust')).toBe(3)
  })

  it('removes material stack when quantity reaches zero', () => {
    materialsStore.addMaterial('magic_dust', 3)
    
    materialsStore.removeMaterial('magic_dust', 3)
    
    expect(materialsStore.getQuantity('magic_dust')).toBe(0)
    expect(materialsStore.uniqueMaterialCount).toBe(0)
    expect(materialsStore.allMaterials).toEqual([])
  })

  it('fails to remove more materials than available', () => {
    materialsStore.addMaterial('magic_dust', 2)
    
    const success = materialsStore.removeMaterial('magic_dust', 5)
    
    expect(success).toBe(false)
    expect(materialsStore.getQuantity('magic_dust')).toBe(2)
  })

  it('checks material availability correctly', () => {
    materialsStore.addMaterial('magic_dust', 5)
    
    expect(materialsStore.hasMaterial('magic_dust', 3)).toBe(true)
    expect(materialsStore.hasMaterial('magic_dust', 5)).toBe(true)
    expect(materialsStore.hasMaterial('magic_dust', 6)).toBe(false)
    expect(materialsStore.hasMaterial('nonexistent')).toBe(false)
  })

  it('sorts materials by category and name', () => {
    materialsStore.addMaterials({
      'gems': 1,         // crystal category
      'magic_dust': 2,   // dust category  
      'iron_ore': 3,     // essence category
      'essence_fragments': 4 // fragment category
    })
    
    const materials = materialsStore.allMaterials
    const categories = materials.map(m => m.material.category)
    
    // Should be sorted: crystal, dust, essence, fragment
    expect(categories).toEqual(['crystal', 'dust', 'essence', 'fragment'])
  })

  it('can get materials by category', () => {
    materialsStore.addMaterials({
      'magic_dust': 2,       // dust
      'essence_fragments': 4, // fragment
      'iron_ore': 3,         // essence
      'leather_scraps': 1    // essence
    })
    
    const essenceMaterials = materialsStore.getMaterialsByCategory('essence')
    const dustMaterials = materialsStore.getMaterialsByCategory('dust')
    
    expect(essenceMaterials).toHaveLength(2)
    expect(dustMaterials).toHaveLength(1)
    expect(essenceMaterials.find(m => m.material.name === 'Iron Ore')).toBeTruthy()
    expect(dustMaterials[0].material.name).toBe('Magic Dust')
  })

  it('can clear all materials', () => {
    materialsStore.addMaterials({
      'magic_dust': 5,
      'essence_fragments': 3
    })
    
    materialsStore.clearAll()
    
    expect(materialsStore.allMaterials).toEqual([])
    expect(materialsStore.uniqueMaterialCount).toBe(0)
    expect(materialsStore.totalMaterialCount).toBe(0)
  })

  it('returns proper material definitions', () => {
    materialsStore.addMaterial('magic_dust', 1)
    
    const materialStack = materialsStore.allMaterials[0]
    
    expect(materialStack.material.name).toBe('Magic Dust')
    expect(materialStack.material.category).toBe('dust')
    expect(materialStack.material.rarity).toBe('common')
    expect(materialStack.material.stackable).toBe(true)
    expect(materialStack.material.icon).toContain('magicdust')
  })
})