
import { NpcConfig } from '../types';

export const NPC_CONFIGS: Record<string, NpcConfig> = {
    // 1. Weapon Merchant
    'v1_weapon_merchant': {
        id: 'v1_weapon_merchant',
        name: 'Weapon Merchant',
        type: 'shop',
        shopId: 'v1_weapon_shop',
        position: [12, 0, -5],
        rotation: -Math.PI / 2,
        modelColor: '#1976d2' // Blue
    },
    // 2. Armor Merchant
    'v1_armor_merchant': {
        id: 'v1_armor_merchant',
        name: 'Armor Merchant',
        type: 'shop',
        shopId: 'v1_armor_shop',
        position: [12, 0, 5],
        rotation: -Math.PI / 2,
        modelColor: '#388e3c' // Green
    },
    // 3. Potion Merchant (General Store)
    'v1_potion_merchant': {
        id: 'v1_potion_merchant',
        name: 'General Store',
        type: 'shop',
        shopId: 'v1_potion_shop',
        position: [-12, 0, 0],
        rotation: Math.PI / 2,
        modelColor: '#d32f2f' // Red
    },
    // 4. General (Guard/Quest Giver)
    'v1_general': {
        id: 'v1_general',
        name: 'General',
        type: 'guard',
        position: [0, 0, -12],
        rotation: 0,
        modelColor: '#ffd700' // Gold
    },
    // 5. Old Man
    'v1_old_man': {
        id: 'v1_old_man',
        name: 'Old Man',
        type: 'quest_giver',
        position: [-5, 0, -5],
        rotation: Math.PI / 4,
        modelColor: '#9e9e9e' // Grey
    },
    // 6. Teleporter
    'v1_teleporter': {
        id: 'v1_teleporter',
        name: 'Teleporter',
        type: 'teleporter',
        position: [20, 0, 0],
        rotation: -Math.PI / 2,
        modelColor: '#9c27b0' // Purple
    },
    // 7. Storage Keeper
    'v1_storage_keeper': {
        id: 'v1_storage_keeper',
        name: 'Storage Keeper',
        type: 'quest_giver', // Placeholder type
        position: [0, 0, -20],
        rotation: 0,
        modelColor: '#5d4037' // Brown
    },
    // 8. Stable Boy
    'v1_stable_boy': {
        id: 'v1_stable_boy',
        name: 'Stable Boy',
        type: 'quest_giver',
        position: [20, 0, -10],
        rotation: -Math.PI / 2,
        modelColor: '#ff9800' // Orange
    },
    // 9. Fisherman (Near river)
    'v1_fisherman': {
        id: 'v1_fisherman',
        name: 'Fisherman',
        type: 'quest_giver',
        position: [0, 0, -55], // Near the bridge/river
        rotation: Math.PI,
        modelColor: '#00bcd4' // Cyan
    },
    // 10. Village Guide (Spawn point)
    'v1_guide': {
        id: 'v1_guide',
        name: 'City Guard',
        type: 'guard',
        position: [0, 0, 10],
        rotation: Math.PI,
        modelColor: '#ffffff' // White
    },
    // 11. Blacksmith (Refinement)
    'v1_blacksmith': {
        id: 'v1_blacksmith',
        name: 'Blacksmith',
        type: 'blacksmith',
        position: [8, 0, 8],
        rotation: -Math.PI / 4,
        modelColor: '#212121' // Dark Grey
    }
};
