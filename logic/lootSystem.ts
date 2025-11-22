
import { LootTable, Drop } from '../types';
import { createItem } from './itemFactory';

export const generateLootDrops = (
    table: LootTable, 
    origin: [number, number, number]
): Drop[] => {
    const drops: Drop[] = [];
    const rollCount = table.rollCount || 1;

    for (let i = 0; i < rollCount; i++) {
        for (const entry of table.entries) {
            if (Math.random() <= entry.chance) {
                const quantity = Math.floor(entry.minQuantity + Math.random() * (entry.maxQuantity - entry.minQuantity + 1));
                
                // Random position offset
                const angle = Math.random() * Math.PI * 2;
                const dist = 0.5 + Math.random() * 1.5;
                const pos: [number, number, number] = [
                    origin[0] + Math.sin(angle) * dist,
                    origin[1],
                    origin[2] + Math.cos(angle) * dist
                ];

                const dropId = Math.random().toString(36).substr(2, 9);
                
                if (entry.type === 'gold') {
                    drops.push({
                        id: dropId,
                        type: 'yang',
                        value: quantity,
                        position: pos,
                        timestamp: Date.now(),
                        autoDespawnAt: Date.now() + 60000 // 1 min
                    });
                } else {
                    const item = createItem(entry.itemId, quantity);
                    drops.push({
                        id: dropId,
                        type: 'item',
                        item: item,
                        value: quantity,
                        position: pos,
                        timestamp: Date.now(),
                        autoDespawnAt: Date.now() + 120000 // 2 min
                    });
                }
            }
        }
    }
    return drops;
};
