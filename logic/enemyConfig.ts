
import { EnemyConfig } from '../types';

export const ENEMY_CONFIGS: Record<string, EnemyConfig> = {
    'wild_dog': {
        id: 'wild_dog',
        name: 'Wild Dog',
        maxHp: 150,
        damage: 10,
        movementSpeed: 3.0,
        detectionRadius: 6,
        resetRadius: 25,
        attackRange: 1.8,
        attackCooldown: 1.5,
        expReward: 15,
        scale: 0.6,
        color: '#A0522D'
    },
    'wolf': {
        id: 'wolf',
        name: 'Wolf',
        maxHp: 250,
        damage: 18,
        movementSpeed: 3.8,
        detectionRadius: 10,
        resetRadius: 35,
        attackRange: 1.8,
        attackCooldown: 1.4,
        expReward: 30,
        scale: 0.7,
        color: '#696969'
    },
    'alpha_wolf': {
        id: 'alpha_wolf',
        name: 'Alpha Wolf',
        maxHp: 350,
        damage: 25,
        movementSpeed: 4.0,
        detectionRadius: 12,
        resetRadius: 40,
        attackRange: 1.9,
        attackCooldown: 1.3,
        expReward: 50,
        scale: 0.8,
        color: '#4a4a4a'
    },
    'wild_boar': {
        id: 'wild_boar',
        name: 'Wild Boar',
        maxHp: 500,
        damage: 30,
        movementSpeed: 2.5,
        detectionRadius: 8,
        resetRadius: 30,
        attackRange: 2.0,
        attackCooldown: 1.8,
        expReward: 80,
        scale: 0.85,
        color: '#5D4037'
    },
    'bear': {
        id: 'bear',
        name: 'Bear',
        maxHp: 900,
        damage: 55,
        movementSpeed: 2.2,
        detectionRadius: 10,
        resetRadius: 40,
        attackRange: 2.5,
        attackCooldown: 2.0,
        expReward: 200,
        scale: 1.3,
        color: '#3E2723'
    },
    'tiger': {
        id: 'tiger',
        name: 'Tiger',
        maxHp: 1500,
        damage: 90,
        movementSpeed: 5.0,
        detectionRadius: 15,
        resetRadius: 50,
        attackRange: 2.0,
        attackCooldown: 1.2,
        expReward: 500,
        scale: 1.1,
        color: '#FF8F00'
    }
};

export const METIN_CONFIG: EnemyConfig = {
    id: 'metin_stone',
    name: 'Metin of Sorrow',
    maxHp: 2500,
    damage: 0,
    movementSpeed: 0,
    detectionRadius: 0,
    resetRadius: 0,
    attackRange: 0,
    attackCooldown: 999,
    expReward: 5000,
    scale: 1.5,
    color: '#2a0a0a'
};
