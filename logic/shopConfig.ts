
import { ShopConfig } from '../types';

export const SHOP_CONFIGS: Record<string, ShopConfig> = {
    // Weapon Shop (Basic items only)
    'v1_weapon_shop': {
        id: 'v1_weapon_shop',
        name: 'Weapon Shop',
        allowSell: true,
        items: [
            { itemId: 'sword_1', price: 100 },
            { itemId: 'long_sword', price: 500 },
            { itemId: 'crescent_sword', price: 1500 },
            { itemId: 'bamboo_sword', price: 3000 },
            { itemId: 'broad_sword', price: 6000 },
            // Two-handed
            { itemId: 'glaive_1', price: 500 },
            { itemId: 'spear', price: 1000 },
            { itemId: 'guillotine_blade', price: 3000 },
            // Daggers
            { itemId: 'dagger_1', price: 200 },
            { itemId: 'amija', price: 600 },
            { itemId: 'cobra_dagger', price: 1200 },
            // Bows
            { itemId: 'short_bow', price: 400 },
            { itemId: 'long_bow', price: 1200 },
            // Bells/Fans
            { itemId: 'copper_bell', price: 300 },
            { itemId: 'silver_bell', price: 800 },
            { itemId: 'fan', price: 300 },
            { itemId: 'iron_fan', price: 800 }
        ]
    },
    // Armor Shop
    'v1_armor_shop': {
        id: 'v1_armor_shop',
        name: 'Armor Shop',
        allowSell: true,
        items: [
            { itemId: 'armor_1', price: 800 },
            { itemId: 'cloth_armor', price: 1500 },
            { itemId: 'leather_armor', price: 4000 },
            { itemId: 'wooden_helmet', price: 600 },
            { itemId: 'battle_shield', price: 500 }
        ]
    },
    // General Store (Potions)
    'v1_potion_shop': {
        id: 'v1_potion_shop',
        name: 'General Store',
        allowSell: true,
        items: [
            { itemId: 'potion_red', price: 200 },
            { itemId: 'potion_red_m', price: 800 },
            { itemId: 'potion_blue', price: 400 },
            { itemId: 'potion_blue_m', price: 1600 },
            { itemId: 'wolf_fur', price: 0 } // Just for viewing, price 0 means not sold usually but keeps index
        ]
    }
};
