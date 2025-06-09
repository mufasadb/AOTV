import { describe, it, expect } from 'vitest'
import itemsData from '../data/items.json'

describe('Icon Path Validation', () => {
  it('should not have any broken icon paths in items.json', () => {
    const allItems = Object.values(itemsData).flat()
    
    allItems.forEach((category: any) => {
      Object.values(category).forEach((item: any) => {
        if (item.icon) {
          // Check that icon paths don't contain "broken" in the filename
          expect(item.icon, `Item ${item.name} has broken icon path: ${item.icon}`)
            .not.toMatch(/broken/i)
          
          // Check that icon paths start correctly
          expect(item.icon, `Item ${item.name} has invalid icon path: ${item.icon}`)
            .toMatch(/^\/5000FantasyIcons\//)
          
          // Check that icon paths end with image extension
          expect(item.icon, `Item ${item.name} has invalid icon extension: ${item.icon}`)
            .toMatch(/\.(png|jpg|jpeg|gif)$/i)
        }
      })
    })
  })

  it('should have valid icon paths for specific test items', () => {
    // Test the leather cap we just fixed
    const leatherCap = itemsData.armor.leather_cap
    expect(leatherCap.icon).toBe('/5000FantasyIcons/ArmorIcons/BasicArmor_Icons/Helm_13.png')
    expect(leatherCap.icon).not.toMatch(/broken/i)
    
    // Test some other items
    const ironSword = itemsData.weapons.iron_sword
    expect(ironSword.icon).toBe('/5000FantasyIcons/WeaponIcons/WeaponIconsVol1/Sword_15.png')
    
    const healthPotion = itemsData.consumables.health_potion
    expect(healthPotion.icon).toBe('/5000FantasyIcons/ProfessionIcons/ProfessionAndCraftIcons/Alchemy/Alchemy_15.png')
  })
})