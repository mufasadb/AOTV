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
      staff: `${this.BASE_PATH}/WeaponIcons/WeaponIconsVol1/staff_${variant}.png`,
      bow: `${this.BASE_PATH}/WeaponIcons/WeaponIconsVol1/Bow_${formatNumber(variant)}.png`,
      spear: `${this.BASE_PATH}/WeaponIcons/WeaponIconsVol1/Spear_${formatNumber(variant)}.png`,
      shield: `${this.BASE_PATH}/WeaponIcons/WeaponIconsVol1/shield_${formatNumber(variant)}.png`,
    };
    
    return weaponPaths[weaponType.toLowerCase()] || weaponPaths.sword;
  }

  // Armor icons
  static getArmorIcon(armorType: string, variant: number = 1): string {
    const formatNumber = (num: number): string => {
      return num < 10 ? `0${num}` : num.toString();
    };
    
    const armorPaths: { [key: string]: string } = {
      helmet: `${this.BASE_PATH}/ArmorIcons/BasicArmor_Icons/Helm_${formatNumber(variant)}.png`,
      chest: `${this.BASE_PATH}/ArmorIcons/BasicArmor_Icons/Chest_${formatNumber(variant)}.png`,
      pants: `${this.BASE_PATH}/ArmorIcons/BasicArmor_Icons/Pants_${formatNumber(variant)}.png`,
      boots: `${this.BASE_PATH}/ArmorIcons/BasicArmor_Icons/Boots_${formatNumber(variant)}.png`,
      gloves: `${this.BASE_PATH}/ArmorIcons/BasicArmor_Icons/Gloves_${formatNumber(variant)}.png`,
      shoulders: `${this.BASE_PATH}/ArmorIcons/BasicArmor_Icons/Shoulder_${formatNumber(variant)}.png`,
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
    // Map actual file patterns found in the directory
    const elementalFiles = [
      'Earth_1_nb.png', 'Earth_2_nb.png', 'Earth_3_nb.png', 'Earth_4_nb.png', 'Earth_5_nb.png',
      'Fire_01_nb.png', 'Fire_02_nb.png', 'Fire_03_nb.png', 'Fire_04_nb.png', 'Fire_05_nb.png',
      'Ice_1_nb.png', 'Ice_2_nb.png', 'Ice_3_nb.png', 'Ice_4_nb.png', 'Ice_5_nb.png',
      'Light_1_nb.png', 'Light_2_nb.png', 'Light_3_nb.png', 'Light_4_nb.png', 'Light_5_nb.png',
      'Shadow_1_nb.png', 'Shadow_2_nb.png', 'Shadow_3_nb.png', 'Shadow_4_nb.png', 'Shadow_5_nb.png',
      'Water_1_nb.png', 'Water_2_nb.png', 'Water_3_nb.png', 'Water_4_nb.png', 'Water_5_nb.png'
    ];
    
    const fileIndex = Math.max(0, Math.min(elementalFiles.length - 1, elementNumber - 1));
    return `${this.BASE_PATH}/SkillsIcons/Bonus/Skills_elements_nobg/${elementalFiles[fileIndex]}`;
  }

  // Profession/crafting icons
  static getProfessionIcon(profession: string, variant: number = 1): string {
    // Map of specific profession icons with known descriptive names
    const professionIconMap: { [key: string]: { [key: number]: string } } = {
      blacksmith: {
        27: 'Blacksmith_27_anvil.png',
        35: 'Blacksmith_35_hammer.png',
        28: 'Blacksmith_28_runeanvil.png',
      }
    };
    
    const prof = profession.toLowerCase();
    if (professionIconMap[prof] && professionIconMap[prof][variant]) {
      return `${this.BASE_PATH}/ProfessionIcons/ProfessionAndCraftIcons/Blacksmith/${professionIconMap[prof][variant]}`;
    }
    
    // Fallback to padded number format
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
    
    return professionPaths[prof] || professionPaths.alchemy;
  }

  // Loot and resource icons
  static getLootIcon(lootNumber: number): string {
    // Common loot icons with known names - some have descriptive suffixes
    const lootIconMap: { [key: number]: string } = {
      54: 'Loot_54_key.png',
      101: 'Loot_101_chest.png',
      102: 'Loot_102_chest.png',
      103: 'Loot_103_chest.png',
      // For numbers without specific mapping, try the basic pattern
    };
    
    if (lootIconMap[lootNumber]) {
      return `${this.BASE_PATH}/ProfessionIcons/LootIcons/${lootIconMap[lootNumber]}`;
    }
    
    // Fallback to padded number format
    const lootNum = Math.max(1, Math.min(203, lootNumber)).toString().padStart(2, '0');
    return `${this.BASE_PATH}/ProfessionIcons/LootIcons/Loot_${lootNum}.png`;
  }

  static getResourceIcon(resourceNumber: number): string {
    const resNum = Math.max(1, Math.min(169, resourceNumber)).toString().padStart(2, '0');
    return `${this.BASE_PATH}/ProfessionIcons/ResourceIcons/Resource_${resNum}.png`;
  }

  // Enemy/creature icons from medieval collection
  static getMedievalIcon(iconName: string): string {
    // Common medieval enemy/creature icons using actual file names
    const medievalIcons: { [key: string]: string } = {
      goblin: `${this.BASE_PATH}/MedievalIcons/WeponMedieval/AssassinsDagger.png`,
      orc: `${this.BASE_PATH}/MedievalIcons/WeponMedieval/AxeViking.png`,
      mage: `${this.BASE_PATH}/MedievalIcons/WeponMedieval/Baton.png`,
      warrior: `${this.BASE_PATH}/MedievalIcons/WeponMedieval/Sword.png`,
      archer: `${this.BASE_PATH}/MedievalIcons/WeponMedieval/Bow.png`,
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

  // RPG GUI Elements
  static getRpgIcon(iconName: string): string {
    return `/Classic_RPG_GUI/Icons/${iconName}`;
  }

  static getRpgFrame(frameName: string): string {
    return `/Classic_RPG_GUI/Parts/${frameName}`;
  }

  static getRpgSilhouette(className: string, gender: 'man' | 'woman'): string {
    const silhouettes: { [key: string]: string } = {
      mage: `Mage_silhouette_${gender}.png`,
      archer: `archer_silhouette_${gender}.png`,
      assassin: `assassin_silhouette_${gender}.png`,
      berserk: `berserk_silhouette_${gender}.png`,
      druid: `druid_silhouette_${gender}.png`,
      shadowmage: `shadowmage_silhouette_${gender}.png`,
      warrior: `warrior_silhouette_${gender}.png`,
    };
    
    const fileName = silhouettes[className.toLowerCase()] || silhouettes.warrior;
    return `/Classic_RPG_GUI/Silhouette/${fileName}`;
  }

  static getRpgBackground(slotType: string): string {
    return `/Classic_RPG_GUI/frame_backgrounds/${slotType}_background.png`;
  }

  static getRpgRarityFrame(rarity: string, shape: 'round' | 'square' | 'background' = 'round'): string {
    const rarityMap: { [key: string]: string } = {
      common: 'grey',
      uncommon: 'green',
      rare: 'blue', 
      epic: 'purple',
      legendary: 'red',
    };
    
    const color = rarityMap[rarity.toLowerCase()] || 'grey';
    const shapePrefix = shape === 'round' ? 'RoundFrame_' : shape === 'square' ? 'Frame_' : 'Background_';
    
    return `/Classic_RPG_GUI/update/${shapePrefix}${color}.png`;
  }

  // Get icon with fallback handling
  static getIconWithFallback(iconPath: string): string {
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
export const getRpgIcon = IconHelper.getRpgIcon.bind(IconHelper);
export const getRpgFrame = IconHelper.getRpgFrame.bind(IconHelper);
export const getRpgSilhouette = IconHelper.getRpgSilhouette.bind(IconHelper);
export const getRpgBackground = IconHelper.getRpgBackground.bind(IconHelper);
export const getRpgRarityFrame = IconHelper.getRpgRarityFrame.bind(IconHelper);