// Icon Helper - Provides easy access to categorized game icons
export class IconHelper {
  private static readonly BASE_PATH = '/5000FantasyIcons';

  // Weapon icons
  static getWeaponIcon(weaponType: string, variant: number = 1): string {
    // Handle the inconsistent naming pattern (some have leading zeros, some don't)
    const formatNumber = (num: number): string => {
      return num < 10 ? `0${num}` : num.toString();
    };
    
    const weaponPaths: { [key: string]: string } = {
      sword: `${this.BASE_PATH}/WeaponIcons/WeaponIconsVol1/Sword_${formatNumber(variant)}.png`,
      dagger: `${this.BASE_PATH}/WeaponIcons/WeaponIconsVol1/Dagger_${formatNumber(variant)}.png`,
      axe: `${this.BASE_PATH}/WeaponIcons/WeaponIconsVol1/Axe_${formatNumber(variant)}.png`,
      hammer: `${this.BASE_PATH}/WeaponIcons/WeaponIconsVol1/Hammer_${formatNumber(variant)}.png`,
      staff: `${this.BASE_PATH}/WeaponIcons/WeaponIconsVol1/Staff_${formatNumber(variant)}.png`,
      bow: `${this.BASE_PATH}/WeaponIcons/WeaponIconsVol1/Bow_${formatNumber(variant)}.png`,
      spear: `${this.BASE_PATH}/WeaponIcons/WeaponIconsVol1/Spear_${formatNumber(variant)}.png`,
      shield: `${this.BASE_PATH}/WeaponIcons/WeaponIconsVol1/Shield_${formatNumber(variant)}.png`,
    };
    
    return weaponPaths[weaponType.toLowerCase()] || weaponPaths.sword;
  }

  // Armor icons
  static getArmorIcon(armorType: string, variant: number = 1): string {
    const formatNumber = (num: number): string => {
      return num < 10 ? `0${num}` : num.toString();
    };
    
    const armorPaths: { [key: string]: string } = {
      helmet: `${this.BASE_PATH}/ArmorIcons/BasicArmor_Icons/Helmet_${formatNumber(variant)}.png`,
      chest: `${this.BASE_PATH}/ArmorIcons/BasicArmor_Icons/Chest_${formatNumber(variant)}.png`,
      pants: `${this.BASE_PATH}/ArmorIcons/BasicArmor_Icons/Pants_${formatNumber(variant)}.png`,
      boots: `${this.BASE_PATH}/ArmorIcons/BasicArmor_Icons/Boots_${formatNumber(variant)}.png`,
      gloves: `${this.BASE_PATH}/ArmorIcons/BasicArmor_Icons/Gloves_${formatNumber(variant)}.png`,
      shoulders: `${this.BASE_PATH}/ArmorIcons/BasicArmor_Icons/Shoulders_${formatNumber(variant)}.png`,
      belt: `${this.BASE_PATH}/ArmorIcons/BasicArmor_Icons/Belt_${formatNumber(variant)}.png`,
    };
    
    return armorPaths[armorType.toLowerCase()] || armorPaths.chest;
  }

  // Skill icons - without background for UI flexibility
  static getSkillIcon(skillClass: string, skillNumber: number): string {
    const validClasses = [
      'Archerskill', 'Assassinskill', 'Druideskill', 'Engineerskill', 'Mageskill',
      'Paladinskill', 'Priestskill', 'Shamanskill', 'Warlock', 'Warriorskill'
    ];
    
    const className = validClasses.find(cls => 
      cls.toLowerCase().includes(skillClass.toLowerCase())
    ) || 'Warriorskill';
    
    const skillNum = Math.max(1, Math.min(50, skillNumber)).toString().padStart(2, '0');
    return `${this.BASE_PATH}/SkillsIcons/Skillicons/Skill_nobg/${className}_${skillNum}_nobg.png`;
  }

  // Elemental skill icons
  static getElementalSkillIcon(elementNumber: number): string {
    const elemNum = Math.max(1, Math.min(92, elementNumber)).toString().padStart(2, '0');
    return `${this.BASE_PATH}/SkillsIcons/Bonus/Skills_elements_nobg/Skill_element_${elemNum}_nobg.png`;
  }

  // Profession/crafting icons
  static getProfessionIcon(profession: string, variant: number = 1): string {
    const professionPaths: { [key: string]: string } = {
      alchemy: `${this.BASE_PATH}/ProfessionIcons/ProfessionAndCraftIcons/Alchemy/Alchemy_${variant.toString().padStart(2, '0')}.png`,
      blacksmith: `${this.BASE_PATH}/ProfessionIcons/ProfessionAndCraftIcons/Blacksmith/Blacksmith_${variant.toString().padStart(2, '0')}.png`,
      cooking: `${this.BASE_PATH}/ProfessionIcons/ProfessionAndCraftIcons/Cooking_fishing/Cooking_${variant.toString().padStart(2, '0')}.png`,
      enchantment: `${this.BASE_PATH}/ProfessionIcons/ProfessionAndCraftIcons/Enchantment/Enchantment_${variant.toString().padStart(2, '0')}.png`,
      engineering: `${this.BASE_PATH}/ProfessionIcons/ProfessionAndCraftIcons/Engineering/Engineering_${variant.toString().padStart(2, '0')}.png`,
      herbalism: `${this.BASE_PATH}/ProfessionIcons/ProfessionAndCraftIcons/Herbalism/Herbalism_${variant.toString().padStart(2, '0')}.png`,
      jewelry: `${this.BASE_PATH}/ProfessionIcons/ProfessionAndCraftIcons/Jewelry/Jewelry_${variant.toString().padStart(2, '0')}.png`,
      mining: `${this.BASE_PATH}/ProfessionIcons/ProfessionAndCraftIcons/Mining/Mining_${variant.toString().padStart(2, '0')}.png`,
      skinning: `${this.BASE_PATH}/ProfessionIcons/ProfessionAndCraftIcons/Skinning/Skinning_${variant.toString().padStart(2, '0')}.png`,
      tailoring: `${this.BASE_PATH}/ProfessionIcons/ProfessionAndCraftIcons/Tailoring/Tailoring_${variant.toString().padStart(2, '0')}.png`,
    };
    
    return professionPaths[profession.toLowerCase()] || professionPaths.alchemy;
  }

  // Loot and resource icons
  static getLootIcon(lootNumber: number): string {
    const lootNum = Math.max(1, Math.min(203, lootNumber)).toString().padStart(2, '0');
    return `${this.BASE_PATH}/ProfessionIcons/LootIcons/Loot_${lootNum}.png`;
  }

  static getResourceIcon(resourceNumber: number): string {
    const resNum = Math.max(1, Math.min(169, resourceNumber)).toString().padStart(2, '0');
    return `${this.BASE_PATH}/ProfessionIcons/ResourceIcons/Resource_${resNum}.png`;
  }

  // Enemy/creature icons from medieval collection
  static getMedievalIcon(iconName: string): string {
    // Common medieval enemy/creature icons
    const medievalIcons: { [key: string]: string } = {
      goblin: `${this.BASE_PATH}/MedievalIcons/WeponMedieval/CombatDagger.png`,
      orc: `${this.BASE_PATH}/MedievalIcons/WeponMedieval/WarAxe.png`,
      mage: `${this.BASE_PATH}/MedievalIcons/WeponMedieval/MagicStaff.png`,
      warrior: `${this.BASE_PATH}/MedievalIcons/WeponMedieval/KnightSword.png`,
      archer: `${this.BASE_PATH}/MedievalIcons/WeponMedieval/LongBow.png`,
    };
    
    return medievalIcons[iconName.toLowerCase()] || medievalIcons.warrior;
  }

  // Utility to get item rarity colors
  static getRarityColor(rarity: string): string {
    const rarityColors: { [key: string]: string } = {
      common: '#9D9D9D',
      uncommon: '#1EFF00', 
      rare: '#0070DD',
      epic: '#A335EE',
      legendary: '#FF8000',
      unique: '#FFF000',
    };
    
    return rarityColors[rarity.toLowerCase()] || rarityColors.common;
  }

  // Get icon with fallback handling
  static getIconWithFallback(iconPath: string, fallbackPath?: string): string {
    // In a real application, you might want to check if the icon exists
    // For now, we'll return the path and let the browser handle missing images
    return iconPath;
  }
}

// Convenience functions for common use cases
export const getWeaponIcon = IconHelper.getWeaponIcon.bind(IconHelper);
export const getArmorIcon = IconHelper.getArmorIcon.bind(IconHelper);
export const getSkillIcon = IconHelper.getSkillIcon.bind(IconHelper);
export const getProfessionIcon = IconHelper.getProfessionIcon.bind(IconHelper);
export const getLootIcon = IconHelper.getLootIcon.bind(IconHelper);
export const getMedievalIcon = IconHelper.getMedievalIcon.bind(IconHelper);