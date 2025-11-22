
import { Entity, EnemyConfig } from '../types';
import { Vector3 } from 'three';

interface AIUpdateResult {
    updatedEnemy: Entity;
    didAttack: boolean;
}

export const updateEnemyAI = (
    enemy: Entity,
    config: EnemyConfig,
    playerPos: [number, number, number],
    delta: number
): AIUpdateResult => {
    const updatedEnemy = { ...enemy };
    let didAttack = false;

    // Skip logic if dead or NPC
    if (enemy.isDead || enemy.type !== 'enemy') {
        return { updatedEnemy, didAttack: false };
    }

    // Timers
    updatedEnemy.stateTimer += delta;
    updatedEnemy.attackTimer -= delta;

    // Vectors
    const currentPos = new Vector3(enemy.position[0], enemy.position[1], enemy.position[2]);
    const targetPos = new Vector3(playerPos[0], playerPos[1], playerPos[2]);
    const spawnPos = new Vector3(enemy.spawnOrigin[0], enemy.spawnOrigin[1], enemy.spawnOrigin[2]);

    const toPlayer = new Vector3().subVectors(targetPos, currentPos);
    toPlayer.y = 0; // Flat world logic
    const distToPlayer = toPlayer.length();

    const toSpawn = new Vector3().subVectors(spawnPos, currentPos);
    toSpawn.y = 0;
    const distToSpawn = toSpawn.length();

    // --- STATE MACHINE ---

    switch (enemy.state) {
        case 'idle':
            // Transition: If player close -> Chase
            if (distToPlayer <= config.detectionRadius) {
                updatedEnemy.state = 'chasing';
                updatedEnemy.isAggroed = true;
            }
            break;

        case 'chasing':
            // Movement: Move towards player
            if (distToPlayer > 0.1) {
                const moveDir = toPlayer.clone().normalize();
                const moveDist = config.movementSpeed * delta;
                
                // Don't move inside the player perfectly, stop at attack range slightly
                if (distToPlayer > config.attackRange * 0.8) {
                    updatedEnemy.position = [
                        currentPos.x + moveDir.x * moveDist,
                        currentPos.y,
                        currentPos.z + moveDir.z * moveDist
                    ];
                }

                // Rotation: Face player
                updatedEnemy.rotationY = Math.atan2(moveDir.x, moveDir.z);
            }

            // Transitions
            if (distToPlayer <= config.attackRange) {
                updatedEnemy.state = 'attacking';
                updatedEnemy.stateTimer = 0;
                // Slight delay before first attack? No, immediate feels better
            } else if (distToSpawn > config.resetRadius) {
                updatedEnemy.state = 'returning';
                updatedEnemy.isAggroed = false;
            }
            break;

        case 'attacking':
            // Rotation: Keep facing player
            const faceDir = toPlayer.clone().normalize();
            updatedEnemy.rotationY = Math.atan2(faceDir.x, faceDir.z);

            // Logic: Attack if cooldown ready
            if (updatedEnemy.attackTimer <= 0) {
                didAttack = true;
                updatedEnemy.attackTimer = config.attackCooldown;
            }

            // Transitions
            if (distToPlayer > config.attackRange * 1.2) {
                updatedEnemy.state = 'chasing';
            }
            // Also check reset radius while attacking (kiting)
            if (distToSpawn > config.resetRadius) {
                updatedEnemy.state = 'returning';
                updatedEnemy.isAggroed = false;
            }
            break;

        case 'returning':
            // Movement: Move to spawn
            if (distToSpawn > 0.1) {
                const moveDir = toSpawn.clone().normalize();
                const moveDist = config.movementSpeed * delta; // Run back fast? Or same speed.
                
                updatedEnemy.position = [
                    currentPos.x + moveDir.x * moveDist,
                    currentPos.y,
                    currentPos.z + moveDir.z * moveDist
                ];
                
                updatedEnemy.rotationY = Math.atan2(moveDir.x, moveDir.z);
            }

            // Transitions
            if (distToSpawn < 1.0) {
                updatedEnemy.state = 'idle';
                updatedEnemy.hp = updatedEnemy.maxHp; // Metin2 reset mechanics
                updatedEnemy.position = enemy.spawnOrigin; // Snap to exact spawn
            }
            break;

        case 'dead':
            // Handled in store (despawn timer)
            break;
    }

    return { updatedEnemy, didAttack };
};
