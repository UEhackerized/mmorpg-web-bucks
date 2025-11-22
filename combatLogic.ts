
import { Vector3 } from 'three';

export interface AttackProfile {
    duration: number;
    hitStart: number;
    hitEnd: number;
    range: number;
    angle: number;
}

export const COMBO_PROFILES: AttackProfile[] = [
    { duration: 0.5, hitStart: 0.15, hitEnd: 0.35, range: 3.5, angle: Math.PI / 2 }, // Slash Right
    { duration: 0.5, hitStart: 0.15, hitEnd: 0.35, range: 3.5, angle: Math.PI / 2 }, // Slash Left
    { duration: 0.6, hitStart: 0.2, hitEnd: 0.4, range: 3.5, angle: Math.PI / 3 },   // Vertical Smash
    { duration: 0.8, hitStart: 0.25, hitEnd: 0.5, range: 4.0, angle: Math.PI / 4 },  // Thrust (Finisher)
];

export const checkSectorHit = (
    playerPos: Vector3,
    playerForward: Vector3,
    enemyPos: Vector3,
    range: number,
    angle: number
): boolean => {
    const toEnemy = new Vector3().subVectors(enemyPos, playerPos);
    toEnemy.y = 0; // Flat check
    const dist = toEnemy.length();
    
    if (dist > range) return false;
    if (dist < 0.5) return true; // Point blank is always a hit
    
    const toEnemyNorm = toEnemy.normalize();
    const dot = playerForward.dot(toEnemyNorm);
    // clamp dot
    const safeDot = Math.min(1, Math.max(-1, dot));
    const angleToEnemy = Math.acos(safeDot);
    
    return angleToEnemy <= (angle / 2);
};
