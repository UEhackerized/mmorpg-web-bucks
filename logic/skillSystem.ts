
import { Entity, SkillConfig, PlayerSkillState, PlayerStats, DerivedStats, ActiveBuff } from '../types';
import { checkSectorHit } from '../combatLogic';
import { Vector3 } from 'three';

interface SkillExecutionContext {
    playerPos: [number, number, number];
    playerRot: number; // quaternion or y-rot
    playerStats: PlayerStats;
    derivedStats: DerivedStats;
    enemies: Entity[];
}

interface SkillResult {
    damageMap: { enemyId: string, damage: number, knockback: [number, number] }[];
    newBuff?: ActiveBuff;
}

export const calculateSkillDamage = (
    config: SkillConfig, 
    level: number, 
    stats: PlayerStats,
    derived: DerivedStats
): number => {
    const levelData = config.levels[level - 1] || config.levels[0];
    
    let statVal = 0;
    switch(config.attributeScaling) {
        case 'STR': statVal = stats.str; break;
        case 'DEX': statVal = stats.dex; break;
        case 'INT': statVal = stats.int; break;
        case 'VIT': statVal = stats.vit; break;
    }

    // Formula: (Base + (Stat * 2) + (MagicAttack)) * Multiplier
    let baseDmg = config.basePower + (statVal * 3) + derived.magic;
    return Math.floor(baseDmg * levelData.powerMultiplier);
};

export const executeSkillLogic = (
    config: SkillConfig,
    skillState: PlayerSkillState,
    context: SkillExecutionContext
): SkillResult => {
    const result: SkillResult = { damageMap: [] };
    const { playerPos, playerStats, derivedStats, enemies } = context;
    
    const level = skillState.currentLevel;
    const damage = calculateSkillDamage(config, level, playerStats, derivedStats);

    const pPosVec = new Vector3(playerPos[0], playerPos[1], playerPos[2]);
    // Calculate player forward vector from simple Y rotation for simplicity in logic
    // (In Player.tsx we use Quaternion, here we assume RotationY was passed or we derive forward vector)
    // NOTE: Ideally we pass the forward vector directly. Let's assume playerRot is Y-axis rotation.
    const pForward = new Vector3(Math.sin(context.playerRot), 0, Math.cos(context.playerRot)); // Assuming 0 is +Z

    if (config.type === 'melee_aoe' || config.type === 'direct_damage') {
        enemies.forEach(enemy => {
            if (enemy.isDead || enemy.type === 'npc') return;
            const ePosVec = new Vector3(enemy.position[0], enemy.position[1], enemy.position[2]);
            
            let hit = false;
            
            if (config.radius) {
                // Circle check
                const dist = pPosVec.distanceTo(ePosVec);
                if (dist <= config.radius) hit = true;
            } else if (config.angle && config.range) {
                // Cone check
                hit = checkSectorHit(pPosVec, pForward, ePosVec, config.range, config.angle);
            }

            if (hit) {
                const knockbackDir: [number, number] = [
                    ePosVec.x - pPosVec.x,
                    ePosVec.z - pPosVec.z
                ];
                // Normalize
                const len = Math.sqrt(knockbackDir[0]**2 + knockbackDir[1]**2) || 1;
                knockbackDir[0] /= len;
                knockbackDir[1] /= len;

                result.damageMap.push({
                    enemyId: enemy.id,
                    damage: damage,
                    knockback: knockbackDir
                });
            }
        });
    } else if (config.type === 'buff') {
        // Create buff
        if (config.id === 'aura_sword') {
            result.newBuff = {
                skillId: config.id,
                remainingDuration: 30 + (level * 2), // 30s base + 2s per level
                modifiers: {
                    attack: 30 + (level * 5) + (playerStats.str * 0.5) // Massive attack boost
                },
                vfxColor: '#ff0000'
            };
        }
    }

    return result;
};
