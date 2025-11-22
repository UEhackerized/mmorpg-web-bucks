
import { MetinConfig } from '../types';

export const METIN_CONFIGS: Record<string, MetinConfig> = {
    'metin_stone': {
        id: 'metin_stone',
        name: 'Metin of Sorrow',
        maxHP: 2500,
        lootTableId: 'metin_loot_low',
        spawnWaves: [
            { waveIndex: 0, enemyConfigId: 'wild_dog', count: 3, triggerHPPercent: 90, spawnRadius: 3 },
            { waveIndex: 1, enemyConfigId: 'wolf', count: 3, triggerHPPercent: 70, spawnRadius: 3 },
            { waveIndex: 2, enemyConfigId: 'wild_boar', count: 2, triggerHPPercent: 50, spawnRadius: 4 },
            { waveIndex: 3, enemyConfigId: 'bear', count: 2, triggerHPPercent: 25, spawnRadius: 4 },
            { waveIndex: 4, enemyConfigId: 'alpha_wolf', count: 3, triggerHPPercent: 10, spawnRadius: 5 }
        ]
    }
};
