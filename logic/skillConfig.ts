
import { SkillConfig } from '../types';

// Simplified Metin2 Warrior Skills
export const SKILL_CONFIGS: Record<string, SkillConfig> = {
    'aura_sword': {
        id: 'aura_sword',
        name: 'Aura of Sword',
        description: 'Increases Attack Power for a duration.',
        type: 'buff',
        icon: '#ff4444',
        baseCooldown: 60,
        castTime: 1.0,
        attributeScaling: 'STR',
        basePower: 10, // Base +10 attack
        range: 0,
        levels: Array.from({ length: 20 }, (_, i) => ({
            level: i + 1,
            powerMultiplier: 1.5 + (i * 0.2), // Scales with STR strongly
            cooldownReduction: i * 0.5,
            cost: 20 + (i * 5)
        }))
    },
    'whirlwind': {
        id: 'whirlwind',
        name: 'Whirlwind',
        description: 'Spin attack hitting all enemies around you.',
        type: 'melee_aoe',
        icon: '#4444ff',
        baseCooldown: 15,
        castTime: 0, // Instant
        attributeScaling: 'STR',
        basePower: 50,
        range: 3.5, // Radius
        radius: 3.5,
        levels: Array.from({ length: 20 }, (_, i) => ({
            level: i + 1,
            powerMultiplier: 2.0 + (i * 0.1),
            cooldownReduction: i * 0.2,
            cost: 30 + (i * 2)
        }))
    },
    'dash': {
        id: 'dash',
        name: 'Dash',
        description: 'Charge forward and strike enemies.',
        type: 'melee_aoe',
        icon: '#ffff00',
        baseCooldown: 12,
        castTime: 0,
        attributeScaling: 'DEX',
        basePower: 60,
        range: 6.0,
        angle: Math.PI / 3, // Narrow cone forward
        levels: Array.from({ length: 20 }, (_, i) => ({
            level: i + 1,
            powerMultiplier: 2.5 + (i * 0.15),
            cooldownReduction: i * 0.1,
            cost: 25 + (i * 2)
        }))
    },
    'sword_spin': {
        id: 'sword_spin',
        name: 'Sword Spin',
        description: 'A powerful triple-hit attack.',
        type: 'melee_aoe',
        icon: '#00ff00',
        baseCooldown: 20,
        castTime: 0,
        attributeScaling: 'STR',
        basePower: 100,
        range: 4.0,
        angle: Math.PI, // Wide front arc
        levels: Array.from({ length: 20 }, (_, i) => ({
            level: i + 1,
            powerMultiplier: 3.0 + (i * 0.2),
            cooldownReduction: i * 0.3,
            cost: 50 + (i * 5)
        }))
    }
};
