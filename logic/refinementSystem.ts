
import { RefinementLevelConfig } from '../types';

// 0 -> 1, 1 -> 2 ... 8 -> 9
export const REFINEMENT_TABLE: Record<number, RefinementLevelConfig> = {
    0: { level: 1, successChance: 1.0, cost: 500 },
    1: { level: 2, successChance: 0.9, cost: 1000 },
    2: { level: 3, successChance: 0.85, cost: 2000 },
    3: { level: 4, successChance: 0.8, cost: 4000 },
    4: { level: 5, successChance: 0.7, cost: 8000 },
    5: { level: 6, successChance: 0.6, cost: 15000 },
    6: { level: 7, successChance: 0.5, cost: 30000 },
    7: { level: 8, successChance: 0.4, cost: 50000 },
    8: { level: 9, successChance: 0.3, cost: 100000 }
};

export const getRefinementConfig = (currentLevel: number): RefinementLevelConfig | null => {
    if (currentLevel >= 9) return null;
    return REFINEMENT_TABLE[currentLevel] || null;
};
