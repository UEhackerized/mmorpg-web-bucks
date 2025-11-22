
import { Item } from '../types';

export const createItem = (templateId: string, quantity = 1): Item => {
  const base: Partial<Item> = {
    id: Math.random().toString(36).substr(2, 9),
    templateId,
    quantity,
    upgradeLevel: 0,
    rarity: 'normal',
    extraBonuses: [],
    stackable: false,
    maxStack: 1,
    requiredLevel: 0,
    subType: 'none'
  };

  switch(templateId) {
    // --- WARRIOR / SURA / NINJA (Swords) ---
    case 'sword_1': return { ...base, name: 'Sword', type: 'weapon', subType: 'sword', icon: '#C0C0C0', baseBonuses: [{type: 'ATTACK', value: 15}], requiredClass: ['warrior', 'ninja', 'sura'] } as Item;
    case 'long_sword': return { ...base, name: 'Long Sword', type: 'weapon', subType: 'sword', icon: '#A9A9A9', baseBonuses: [{type: 'ATTACK', value: 20}], requiredLevel: 5, requiredClass: ['warrior', 'ninja', 'sura'] } as Item;
    case 'crescent_sword': return { ...base, name: 'Crescent Sword', type: 'weapon', subType: 'sword', icon: '#B0C4DE', baseBonuses: [{type: 'ATTACK', value: 26}], requiredLevel: 10, requiredClass: ['warrior', 'ninja', 'sura'] } as Item;
    case 'bamboo_sword': return { ...base, name: 'Bamboo Sword', type: 'weapon', subType: 'sword', icon: '#8FBC8F', baseBonuses: [{type: 'ATTACK', value: 32}], requiredLevel: 15, requiredClass: ['warrior', 'ninja', 'sura'] } as Item;
    case 'broad_sword': return { ...base, name: 'Broad Sword', type: 'weapon', subType: 'sword', icon: '#708090', baseBonuses: [{type: 'ATTACK', value: 38}], requiredLevel: 20, requiredClass: ['warrior', 'ninja', 'sura'] } as Item;
    case 'silver_sword': return { ...base, name: 'Silver Sword', type: 'weapon', subType: 'sword', icon: '#E6E6FA', baseBonuses: [{type: 'ATTACK', value: 44}, {type: 'ATTACK_SPEED', value: 5}], requiredLevel: 25, requiredClass: ['warrior', 'ninja', 'sura'] } as Item;
    case 'full_moon_sword': return { ...base, name: 'Full Moon Sword', type: 'weapon', subType: 'sword', icon: '#FFD700', baseBonuses: [{type: 'ATTACK', value: 65}, {type: 'SKILL_ATTACK', value: 15}], rarity: 'rare', requiredLevel: 30, description: 'A legendary sword that glows under the moonlight.', requiredClass: ['warrior', 'ninja', 'sura'] } as Item;
    case 'bastard_sword': return { ...base, name: 'Bastard Sword', type: 'weapon', subType: 'sword', icon: '#696969', baseBonuses: [{type: 'ATTACK', value: 52}], requiredLevel: 36, requiredClass: ['warrior', 'ninja', 'sura'] } as Item;
    case 'barbarian_sword': return { ...base, name: 'Barbarian Sword', type: 'weapon', subType: 'sword', icon: '#8B0000', baseBonuses: [{type: 'ATTACK', value: 58}], requiredLevel: 40, requiredClass: ['warrior', 'ninja', 'sura'] } as Item;
    case 'bloody_sword': return { ...base, name: 'Bloody Sword', type: 'weapon', subType: 'sword', icon: '#DC143C', baseBonuses: [{type: 'ATTACK', value: 64}, {type: 'ATTACK_SPEED', value: 8}], requiredLevel: 45, requiredClass: ['warrior', 'ninja', 'sura'] } as Item;
    case 'great_sword': return { ...base, name: 'Great Sword', type: 'weapon', subType: 'sword', icon: '#2F4F4F', baseBonuses: [{type: 'ATTACK', value: 70}], requiredLevel: 50, requiredClass: ['warrior', 'ninja', 'sura'] } as Item;
    case 'wizard_sword': return { ...base, name: 'Wizard Sword', type: 'weapon', subType: 'sword', icon: '#9370DB', baseBonuses: [{type: 'ATTACK', value: 76}, {type: 'SKILL_ATTACK', value: 10}], requiredLevel: 55, requiredClass: ['warrior', 'ninja', 'sura'] } as Item;
    case 'half_moon_sword': return { ...base, name: 'Half Moon Sword', type: 'weapon', subType: 'sword', icon: '#00BFFF', baseBonuses: [{type: 'ATTACK', value: 82}], requiredLevel: 60, requiredClass: ['warrior', 'ninja', 'sura'] } as Item;
    case 'battle_sword': return { ...base, name: 'Battle Sword', type: 'weapon', subType: 'sword', icon: '#4682B4', baseBonuses: [{type: 'ATTACK', value: 90}, {type: 'ATTACK_SPEED', value: 15}], rarity: 'rare', requiredLevel: 65, requiredClass: ['warrior', 'ninja', 'sura'] } as Item;
    case 'nymph_sword': return { ...base, name: 'Nymph Sword', type: 'weapon', subType: 'sword', icon: '#FF69B4', baseBonuses: [{type: 'ATTACK', value: 95}, {type: 'ATTACK_SPEED', value: 20}], rarity: 'rare', requiredLevel: 65, requiredClass: ['warrior', 'ninja', 'sura'] } as Item;
    case 'poison_sword': return { ...base, name: 'Poison Sword', type: 'weapon', subType: 'sword', icon: '#32CD32', baseBonuses: [{type: 'ATTACK', value: 120}, {type: 'ATTACK_SPEED', value: 25}, {type: 'SKILL_ATTACK', value: 20}], rarity: 'legendary', requiredLevel: 75, description: 'Venomous blade forged in the depths.', requiredClass: ['warrior', 'sura', 'ninja'] } as Item;

    // --- WARRIOR (Two-Handed) ---
    case 'glaive_1': return { ...base, name: 'Glaive', type: 'weapon', subType: 'two_handed', icon: '#A9A9A9', baseBonuses: [{type: 'ATTACK', value: 25}], requiredLevel: 5, requiredClass: ['warrior'] } as Item;
    case 'spear': return { ...base, name: 'Spear', type: 'weapon', subType: 'two_handed', icon: '#708090', baseBonuses: [{type: 'ATTACK', value: 32}], requiredLevel: 10, requiredClass: ['warrior'] } as Item;
    case 'guillotine_blade': return { ...base, name: 'Guillotine Blade', type: 'weapon', subType: 'two_handed', icon: '#2F4F4F', baseBonuses: [{type: 'ATTACK', value: 40}], requiredLevel: 15, requiredClass: ['warrior'] } as Item;
    case 'spider_spear': return { ...base, name: 'Spider Spear', type: 'weapon', subType: 'two_handed', icon: '#8B4513', baseBonuses: [{type: 'ATTACK', value: 48}], requiredLevel: 20, requiredClass: ['warrior'] } as Item;
    case 'guisarme': return { ...base, name: 'Guisarme', type: 'weapon', subType: 'two_handed', icon: '#A52A2A', baseBonuses: [{type: 'ATTACK', value: 56}], requiredLevel: 25, requiredClass: ['warrior'] } as Item;
    case 'red_iron_blade': return { ...base, name: 'Red Iron Blade', type: 'weapon', subType: 'two_handed', icon: '#B22222', baseBonuses: [{type: 'ATTACK', value: 85}, {type: 'SKILL_ATTACK', value: 20}], rarity: 'rare', requiredLevel: 30, description: 'A heavy blade infused with blood iron.', requiredClass: ['warrior'] } as Item;
    case 'war_scythe': return { ...base, name: 'War Scythe', type: 'weapon', subType: 'two_handed', icon: '#666666', baseBonuses: [{type: 'ATTACK', value: 64}], requiredLevel: 32, requiredClass: ['warrior'] } as Item;
    case 'orchid_blade': return { ...base, name: 'Orchid Blade', type: 'weapon', subType: 'two_handed', icon: '#9933cc', baseBonuses: [{type: 'ATTACK', value: 70}], requiredLevel: 40, requiredClass: ['warrior'] } as Item;
    case 'partizan': return { ...base, name: 'Partizan', type: 'weapon', subType: 'two_handed', icon: '#cc0000', baseBonuses: [{type: 'ATTACK', value: 95}], requiredLevel: 65, requiredClass: ['warrior'] } as Item;

    // --- NINJA (Daggers) ---
    case 'dagger_1': return { ...base, name: 'Dagger', type: 'weapon', subType: 'dagger', icon: '#9e9e9e', baseBonuses: [{type: 'ATTACK', value: 12}, {type: 'ATTACK_SPEED', value: 20}], requiredLevel: 0, requiredClass: ['ninja'] } as Item;
    case 'amija': return { ...base, name: 'Amija', type: 'weapon', subType: 'dagger', icon: '#bdbdbd', baseBonuses: [{type: 'ATTACK', value: 16}], requiredLevel: 5, requiredClass: ['ninja'] } as Item;
    case 'cobra_dagger': return { ...base, name: 'Cobra Dagger', type: 'weapon', subType: 'dagger', icon: '#8d6e63', baseBonuses: [{type: 'ATTACK', value: 22}], requiredLevel: 10, requiredClass: ['ninja'] } as Item;
    case 'nine_blades': return { ...base, name: 'Nine Blades', type: 'weapon', subType: 'dagger', icon: '#5d4037', baseBonuses: [{type: 'ATTACK', value: 26}], requiredLevel: 15, requiredClass: ['ninja'] } as Item;
    case 'scissor_dagger': return { ...base, name: 'Scissor Dagger', type: 'weapon', subType: 'dagger', icon: '#4e342e', baseBonuses: [{type: 'ATTACK', value: 30}], requiredLevel: 20, requiredClass: ['ninja'] } as Item;
    case 'short_knife': return { ...base, name: 'Short Knife', type: 'weapon', subType: 'dagger', icon: '#3e2723', baseBonuses: [{type: 'ATTACK', value: 34}], requiredLevel: 25, requiredClass: ['ninja'] } as Item;
    case 'black_leaf_dagger': return { ...base, name: 'Black Leaf Dagger', type: 'weapon', subType: 'dagger', icon: '#212121', baseBonuses: [{type: 'ATTACK', value: 55}, {type: 'SKILL_ATTACK', value: 18}], rarity: 'rare', requiredLevel: 30, description: 'A dagger forged from black steel.', requiredClass: ['ninja'] } as Item;
    case 'face_dagger': return { ...base, name: 'Face Dagger', type: 'weapon', subType: 'dagger', icon: '#d84315', baseBonuses: [{type: 'ATTACK', value: 40}], requiredLevel: 32, requiredClass: ['ninja'] } as Item;
    case 'blitz_dagger': return { ...base, name: 'Blitz Dagger', type: 'weapon', subType: 'dagger', icon: '#ffab00', baseBonuses: [{type: 'ATTACK', value: 44}], requiredLevel: 36, requiredClass: ['ninja'] } as Item;
    case 'bloody_dagger': return { ...base, name: 'Bloody Dagger', type: 'weapon', subType: 'dagger', icon: '#b71c1c', baseBonuses: [{type: 'ATTACK', value: 50}], requiredLevel: 40, requiredClass: ['ninja'] } as Item;
    case 'rib_knife': return { ...base, name: 'Rib Knife', type: 'weapon', subType: 'dagger', icon: '#880e4f', baseBonuses: [{type: 'ATTACK', value: 56}], requiredLevel: 45, requiredClass: ['ninja'] } as Item;
    case 'chakram': return { ...base, name: 'Chakram', type: 'weapon', subType: 'dagger', icon: '#4a148c', baseBonuses: [{type: 'ATTACK', value: 62}], requiredLevel: 50, requiredClass: ['ninja'] } as Item;
    case 'lightning_knife': return { ...base, name: 'Lightning Knife', type: 'weapon', subType: 'dagger', icon: '#311b92', baseBonuses: [{type: 'ATTACK', value: 70}], requiredLevel: 55, requiredClass: ['ninja'] } as Item;
    case 'dragon_knife': return { ...base, name: 'Dragon Knife', type: 'weapon', subType: 'dagger', icon: '#1a237e', baseBonuses: [{type: 'ATTACK', value: 85}], rarity: 'rare', requiredLevel: 65, requiredClass: ['ninja'] } as Item;

    // --- NINJA (Bows) ---
    case 'short_bow': return { ...base, name: 'Short Bow', type: 'weapon', subType: 'bow', icon: '#DEB887', baseBonuses: [{type: 'ATTACK', value: 12}], requiredLevel: 0, requiredClass: ['ninja'] } as Item;
    case 'long_bow': return { ...base, name: 'Long Bow', type: 'weapon', subType: 'bow', icon: '#CD853F', baseBonuses: [{type: 'ATTACK', value: 18}], requiredLevel: 5, requiredClass: ['ninja'] } as Item;
    case 'composite_bow': return { ...base, name: 'Composite Bow', type: 'weapon', subType: 'bow', icon: '#8B4513', baseBonuses: [{type: 'ATTACK', value: 25}], requiredLevel: 10, requiredClass: ['ninja'] } as Item;
    case 'horn_bow': return { ...base, name: 'Horn Bow', type: 'weapon', subType: 'bow', icon: '#F4A460', baseBonuses: [{type: 'ATTACK', value: 50}, {type: 'SKILL_ATTACK', value: 15}], rarity: 'rare', requiredLevel: 30, requiredClass: ['ninja'] } as Item;
    case 'unicorn_bow': return { ...base, name: 'Unicorn Bow', type: 'weapon', subType: 'bow', icon: '#ffffff', baseBonuses: [{type: 'ATTACK', value: 60}], requiredLevel: 45, requiredClass: ['ninja'] } as Item;
    case 'yellow_dragon_bow': return { ...base, name: 'Yellow Dragon Bow', type: 'weapon', subType: 'bow', icon: '#ffd700', baseBonuses: [{type: 'ATTACK', value: 90}], requiredLevel: 65, requiredClass: ['ninja'] } as Item;

    // --- SHAMAN (Bells) ---
    case 'copper_bell': return { ...base, name: 'Copper Bell', type: 'weapon', subType: 'bell', icon: '#bcaaa4', baseBonuses: [{type: 'ATTACK', value: 14}, {type: 'SKILL_ATTACK', value: 5}], requiredLevel: 0, requiredClass: ['shaman'] } as Item;
    case 'silver_bell': return { ...base, name: 'Silver Bell', type: 'weapon', subType: 'bell', icon: '#eeeeee', baseBonuses: [{type: 'ATTACK', value: 18}], requiredLevel: 5, requiredClass: ['shaman'] } as Item;
    case 'gold_bell': return { ...base, name: 'Gold Bell', type: 'weapon', subType: 'bell', icon: '#ffecb3', baseBonuses: [{type: 'ATTACK', value: 24}], requiredLevel: 10, requiredClass: ['shaman'] } as Item;
    case 'antique_bell': return { ...base, name: 'Antique Bell', type: 'weapon', subType: 'bell', icon: '#ffca28', baseBonuses: [{type: 'ATTACK', value: 45}, {type: 'SKILL_ATTACK', value: 15}], rarity: 'rare', requiredLevel: 30, description: 'An ancient bell with mysterious power.', requiredClass: ['shaman'] } as Item;
    case 'jade_bell': return { ...base, name: 'Jade Bell', type: 'weapon', subType: 'bell', icon: '#a5d6a7', baseBonuses: [{type: 'ATTACK', value: 28}], requiredLevel: 15, requiredClass: ['shaman'] } as Item;
    case 'apricot_bell': return { ...base, name: 'Apricot Bell', type: 'weapon', subType: 'bell', icon: '#ffcc80', baseBonuses: [{type: 'ATTACK', value: 50}], requiredLevel: 40, requiredClass: ['shaman'] } as Item;
    case 'thunder_bird_bell': return { ...base, name: 'Thunder Bird Bell', type: 'weapon', subType: 'bell', icon: '#0288d1', baseBonuses: [{type: 'ATTACK', value: 65}], requiredLevel: 55, requiredClass: ['shaman'] } as Item;
    case 'heaven_earth_bell': return { ...base, name: 'Heaven & Earth Bell', type: 'weapon', subType: 'bell', icon: '#4db6ac', baseBonuses: [{type: 'ATTACK', value: 85}], requiredLevel: 65, requiredClass: ['shaman'] } as Item;

    // --- SHAMAN (Fans) ---
    case 'fan': return { ...base, name: 'Fan', type: 'weapon', subType: 'fan', icon: '#d7ccc8', baseBonuses: [{type: 'ATTACK', value: 14}], requiredLevel: 0, requiredClass: ['shaman'] } as Item;
    case 'iron_fan': return { ...base, name: 'Iron Fan', type: 'weapon', subType: 'fan', icon: '#757575', baseBonuses: [{type: 'ATTACK', value: 18}], requiredLevel: 5, requiredClass: ['shaman'] } as Item;
    case 'black_tiger_fan': return { ...base, name: 'Black Tiger Fan', type: 'weapon', subType: 'fan', icon: '#212121', baseBonuses: [{type: 'ATTACK', value: 24}], requiredLevel: 10, requiredClass: ['shaman'] } as Item;
    case 'peacock_fan': return { ...base, name: 'Peacock Fan', type: 'weapon', subType: 'fan', icon: '#009688', baseBonuses: [{type: 'ATTACK', value: 30}], requiredLevel: 20, requiredClass: ['shaman'] } as Item;
    case 'autumn_wind_fan': return { ...base, name: 'Autumn Wind Fan', type: 'weapon', subType: 'fan', icon: '#e64a19', baseBonuses: [{type: 'ATTACK', value: 45}, {type: 'SKILL_ATTACK', value: 15}], rarity: 'rare', requiredLevel: 30, requiredClass: ['shaman'] } as Item;
    case 'salvation_fan': return { ...base, name: 'Salvation Fan', type: 'weapon', subType: 'fan', icon: '#81c784', baseBonuses: [{type: 'ATTACK', value: 80}, {type: 'ATTACK_SPEED', value: 10}], requiredLevel: 65, requiredClass: ['shaman'] } as Item;

    // --- ARMOR (Basic) ---
    case 'armor_1': return { ...base, name: 'Monk Plate', type: 'armor', subType: 'body', icon: '#424242', baseBonuses: [{type: 'DEFENSE', value: 15}], requiredLevel: 0, requiredClass: ['warrior', 'sura'] } as Item;
    case 'cloth_armor': return { ...base, name: 'Azure Suit', type: 'armor', subType: 'body', icon: '#1565c0', baseBonuses: [{type: 'DEFENSE', value: 12}, {type: 'MOVE_SPEED', value: 5}], requiredLevel: 0, requiredClass: ['ninja', 'shaman'] } as Item;
    case 'leather_armor': return { ...base, name: 'Iron Plate', type: 'armor', subType: 'body', icon: '#3e2723', baseBonuses: [{type: 'DEFENSE', value: 25}], requiredLevel: 9, requiredClass: ['warrior', 'sura'] } as Item;
    
    case 'wooden_helmet': return { ...base, name: 'Wooden Helmet', type: 'helmet', subType: 'head', icon: '#5d4037', baseBonuses: [{type: 'DEFENSE', value: 5}], requiredLevel: 0 } as Item;
    case 'battle_shield': return { ...base, name: 'Battle Shield', type: 'shield', subType: 'shield', icon: '#8d6e63', baseBonuses: [{type: 'DEFENSE', value: 10}], requiredLevel: 0 } as Item;
    
    // --- POTIONS & MATERIALS ---
    case 'potion_red': return { ...base, name: 'Red Potion (S)', type: 'consumable', subType: 'potion', icon: '#d32f2f', baseBonuses: [{type: 'MAX_HP', value: 200}], stackable: true, maxStack: 200, description: 'Restores 200 HP.' } as Item;
    case 'potion_red_m': return { ...base, name: 'Red Potion (M)', type: 'consumable', subType: 'potion', icon: '#c62828', baseBonuses: [{type: 'MAX_HP', value: 500}], stackable: true, maxStack: 200, description: 'Restores 500 HP.' } as Item;
    case 'potion_blue': return { ...base, name: 'Blue Potion (S)', type: 'consumable', subType: 'potion', icon: '#1976d2', baseBonuses: [{type: 'MAX_HP', value: 50}], stackable: true, maxStack: 200, description: 'Restores 50 SP.' } as Item;
    case 'potion_blue_m': return { ...base, name: 'Blue Potion (M)', type: 'consumable', subType: 'potion', icon: '#1565c0', baseBonuses: [{type: 'MAX_HP', value: 150}], stackable: true, maxStack: 200, description: 'Restores 150 SP.' } as Item;
    
    case 'wolf_fur': return { ...base, name: 'Wolf Fur', type: 'material', subType: 'quest', icon: '#795548', stackable: true, maxStack: 200, description: 'Fur from a wolf.' } as Item;
    case 'book_aura': return { ...base, name: 'Aura of Sword Book', type: 'material', subType: 'quest', icon: '#8d6e63', stackable: false, description: 'Skill book for Warriors.' } as Item;
    
    default: return null as any;
  }
};
