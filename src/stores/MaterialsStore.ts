import { makeAutoObservable } from 'mobx'

export interface Material {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  category: 'essence' | 'dust' | 'fragment' | 'shard' | 'crystal' | 'rune' | 'orb'
  stackable: boolean
}

export interface MaterialStack {
  material: Material
  quantity: number
}

class MaterialsStore {
  // Material stacks organized by material ID
  materials: { [materialId: string]: MaterialStack } = {}

  constructor() {
    makeAutoObservable(this)
    this.initializeBasicMaterials()
  }

  // Initialize with basic material definitions
  initializeBasicMaterials() {
    // Start with empty materials - they'll be added through deconstruction
  }

  // Add materials from deconstruction or other sources
  addMaterial(materialId: string, quantity: number = 1) {
    if (this.materials[materialId]) {
      this.materials[materialId].quantity += quantity
    } else {
      const materialDef = this.getMaterialDefinition(materialId)
      if (materialDef) {
        this.materials[materialId] = {
          material: materialDef,
          quantity: quantity
        }
      }
    }
  }

  // Remove materials (for crafting)
  removeMaterial(materialId: string, quantity: number = 1): boolean {
    if (!this.materials[materialId] || this.materials[materialId].quantity < quantity) {
      return false
    }

    this.materials[materialId].quantity -= quantity
    
    // Remove from storage if quantity reaches 0
    if (this.materials[materialId].quantity <= 0) {
      delete this.materials[materialId]
    }
    
    return true
  }

  // Check if we have enough of a material
  hasMaterial(materialId: string, quantity: number = 1): boolean {
    return this.materials[materialId]?.quantity >= quantity || false
  }

  // Get quantity of a specific material
  getQuantity(materialId: string): number {
    return this.materials[materialId]?.quantity || 0
  }

  // Get all materials as an array
  get allMaterials(): MaterialStack[] {
    return Object.values(this.materials).sort((a, b) => {
      // Sort by category first, then by name
      if (a.material.category !== b.material.category) {
        return a.material.category.localeCompare(b.material.category)
      }
      return a.material.name.localeCompare(b.material.name)
    })
  }

  // Get materials by category
  getMaterialsByCategory(category: Material['category']): MaterialStack[] {
    return this.allMaterials.filter(stack => stack.material.category === category)
  }

  // Get total number of unique materials
  get uniqueMaterialCount(): number {
    return Object.keys(this.materials).length
  }

  // Get total quantity of all materials
  get totalMaterialCount(): number {
    return Object.values(this.materials).reduce((total, stack) => total + stack.quantity, 0)
  }

  // Material definitions - these define what materials exist
  private getMaterialDefinition(materialId: string): Material | null {
    const materialDefinitions: { [id: string]: Material } = {
      'magic_dust': {
        id: 'magic_dust',
        name: 'Magic Dust',
        description: 'Shimmering powder from deconstructed magical items',
        icon: '/5000FantasyIcons/ProfessionIcons/ProfessionAndCraftIcons/Enchantment/Enchantment_04_magicdust.png',
        rarity: 'common',
        category: 'dust',
        stackable: true
      },
      'essence_fragments': {
        id: 'essence_fragments',
        name: 'Essence Fragments',
        description: 'Crystallized magical essence from rare items',
        icon: '/5000FantasyIcons/ProfessionIcons/ProfessionAndCraftIcons/Enchantment/Enchantment_12_magicsubstance.png',
        rarity: 'uncommon',
        category: 'fragment',
        stackable: true
      },
      'chaos_shards': {
        id: 'chaos_shards',
        name: 'Chaos Shards',
        description: 'Volatile fragments from epic equipment',
        icon: '/5000FantasyIcons/ProfessionIcons/ProfessionAndCraftIcons/Enchantment/Enchantment_19_shadowsubstance.png',
        rarity: 'rare',
        category: 'shard',
        stackable: true
      },
      'iron_ore': {
        id: 'iron_ore',
        name: 'Iron Ore',
        description: 'Raw iron suitable for basic crafting',
        icon: '/5000FantasyIcons/ProfessionIcons/QuestIcons/Quest_131_crystal.png',
        rarity: 'common',
        category: 'essence',
        stackable: true
      },
      'leather_scraps': {
        id: 'leather_scraps',
        name: 'Leather Scraps',
        description: 'Pieces of leather from armor deconstruction',
        icon: '/5000FantasyIcons/ProfessionIcons/ProfessionAndCraftIcons/Enchantment/Enchantment_15_naturesubstance.png',
        rarity: 'common',
        category: 'essence',
        stackable: true
      },
      'gems': {
        id: 'gems',
        name: 'Gems',
        description: 'Precious stones for enhancing equipment',
        icon: '/5000FantasyIcons/ProfessionIcons/QuestIcons/Quest_134_crystal.png',
        rarity: 'uncommon',
        category: 'crystal',
        stackable: true
      }
    }

    return materialDefinitions[materialId] || null
  }

  // Clear all materials (for testing)
  clearAll() {
    this.materials = {}
  }

  // Add multiple materials at once
  addMaterials(materials: { [materialId: string]: number }) {
    Object.entries(materials).forEach(([materialId, quantity]) => {
      this.addMaterial(materialId, quantity)
    })
  }
}

export const materialsStore = new MaterialsStore()