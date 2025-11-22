
import { LootTable } from '../types';

export const LOOT_TABLES: Record<string, LootTable> = {
    'wild_dog_loot': {
        id: 'wild_dog_loot',
        entries: [
            { id: 'g1', type: 'gold', chance: 0.8, minQuantity: 10, maxQuantity: 30 },
            { id: 'p1', type: 'item', itemId: 'potion_red', chance: 0.1, minQuantity: 1, maxQuantity: 1 },
            { id: 'w1', type: 'item', itemId: 'sword_1', chance: 0.05, minQuantity: 1, maxQuantity: 1 },
            { id: 'w2', type: 'item', itemId: 'dagger_1', chance: 0.05, minQuantity: 1, maxQuantity: 1 },
            { id: 'w3', type: 'item', itemId: 'fan', chance: 0.05, minQuantity: 1, maxQuantity: 1 }
        ],
        rollCount: 1
    },
    'wolf_loot': {
        id: 'wolf_loot',
        entries: [
            { id: 'g1', type: 'gold', chance: 0.9, minQuantity: 20, maxQuantity: 50 },
            { id: 'i1', type: 'item', itemId: 'wolf_fur', chance: 0.2, minQuantity: 1, maxQuantity: 1 },
            { id: 'p1', type: 'item', itemId: 'potion_red', chance: 0.15, minQuantity: 1, maxQuantity: 2 },
            { id: 'w1', type: 'item', itemId: 'long_sword', chance: 0.05, minQuantity: 1, maxQuantity: 1 },
            { id: 'w2', type: 'item', itemId: 'amija', chance: 0.05, minQuantity: 1, maxQuantity: 1 },
            { id: 'w3', type: 'item', itemId: 'short_bow', chance: 0.05, minQuantity: 1, maxQuantity: 1 },
            { id: 'w4', type: 'item', itemId: 'iron_fan', chance: 0.05, minQuantity: 1, maxQuantity: 1 }
        ],
        rollCount: 1
    },
    'bear_loot': {
        id: 'bear_loot',
        entries: [
            { id: 'g1', type: 'gold', chance: 1.0, minQuantity: 50, maxQuantity: 100 },
            { id: 'i1', type: 'item', itemId: 'glaive_1', chance: 0.1, minQuantity: 1, maxQuantity: 1 },
            { id: 'i2', type: 'item', itemId: 'potion_red', chance: 0.3, minQuantity: 2, maxQuantity: 5 },
            { id: 'w1', type: 'item', itemId: 'bamboo_sword', chance: 0.05, minQuantity: 1, maxQuantity: 1 },
            { id: 'w2', type: 'item', itemId: 'nine_blades', chance: 0.05, minQuantity: 1, maxQuantity: 1 },
            { id: 'rare1', type: 'item', itemId: 'red_iron_blade', chance: 0.02, minQuantity: 1, maxQuantity: 1 } // RIB Drop
        ],
        rollCount: 2
    },
    'tiger_loot': {
        id: 'tiger_loot',
        entries: [
            { id: 'g1', type: 'gold', chance: 1.0, minQuantity: 100, maxQuantity: 200 },
            { id: 'w1', type: 'item', itemId: 'broad_sword', chance: 0.05, minQuantity: 1, maxQuantity: 1 },
            { id: 'w2', type: 'item', itemId: 'scissor_dagger', chance: 0.05, minQuantity: 1, maxQuantity: 1 },
            { id: 'w3', type: 'item', itemId: 'composite_bow', chance: 0.05, minQuantity: 1, maxQuantity: 1 },
            { id: 'rare1', type: 'item', itemId: 'antique_bell', chance: 0.02, minQuantity: 1, maxQuantity: 1 } // Antique Bell Drop
        ],
        rollCount: 2
    },
    'metin_loot_low': {
        id: 'metin_loot_low',
        entries: [
            { id: 'g1', type: 'gold', chance: 1.0, minQuantity: 500, maxQuantity: 1000 },
            { id: 'p1', type: 'item', itemId: 'potion_red_m', chance: 1.0, minQuantity: 5, maxQuantity: 10 },
            { id: 'bk1', type: 'item', itemId: 'book_aura', chance: 0.3, minQuantity: 1, maxQuantity: 1 },
            { id: 'rare1', type: 'item', itemId: 'full_moon_sword', chance: 0.05, minQuantity: 1, maxQuantity: 1 }, // FMS Drop
            { id: 'rare2', type: 'item', itemId: 'black_leaf_dagger', chance: 0.05, minQuantity: 1, maxQuantity: 1 }, // BLD Drop
            { id: 'rare3', type: 'item', itemId: 'autumn_wind_fan', chance: 0.05, minQuantity: 1, maxQuantity: 1 }
        ],
        rollCount: 3
    }
};
