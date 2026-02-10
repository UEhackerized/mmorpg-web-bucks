
import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Group } from 'three';
import { useGameStore } from '../store';
import { Html, OrbitControls, Sparkles, Cylinder, RoundedBox } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { COMBO_PROFILES, checkSectorHit } from '../combatLogic';
import { inputSystem } from '../logic/inputSystem';
import { CharacterClass } from '../types';

const CLASS_COLORS: Record<CharacterClass, string> = {
    'warrior': '#2b4d6d', // Darker, realistic blue
    'ninja': '#8a1c43',
    'sura': '#546e7a',
    'shaman': '#6a1b9a'
};

export const HumanoidBody: React.FC<{ color: string, isMoving: boolean, isAttacking: boolean }> = ({ color, isMoving, isAttacking }) => {
    const bodyRef = useRef<Group>(null);
    const leftArmRef = useRef<Group>(null);
    const rightArmRef = useRef<Group>(null);
    const leftLegRef = useRef<Group>(null);
    const rightLegRef = useRef<Group>(null);

    useFrame((state) => {
        if (!bodyRef.current) return;
        const t = state.clock.elapsedTime;
        
        // Breathing
        bodyRef.current.position.y = Math.sin(t * 2) * 0.01; 

        if (isMoving) {
            const speed = 15;
            if(leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t * speed) * 0.8;
            if(rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t * speed + Math.PI) * 0.8;
            if (!isAttacking) {
                if(leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * speed + Math.PI) * 0.8;
                if(rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t * speed) * 0.8;
            }
        } else {
            // Idle Pose
            if(leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, 0.1);
            if(rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, 0.1);
            if (!isAttacking) {
                if(leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.1);
                if(rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.1);
            }
        }
    });

    // Material for Armor (Shiny)
    const armorMat = <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} envMapIntensity={1.5} />;
    // Material for Skin
    const skinMat = <meshStandardMaterial color="#ffccaa" roughness={0.8} />;
    // Material for Pants/Boots
    const pantsMat = <meshStandardMaterial color="#1a1a1a" roughness={0.9} />;

    return (
        <group ref={bodyRef}>
            {/* Torso */}
            <RoundedBox args={[0.45, 0.75, 0.3]} radius={0.05} smoothness={4} position={[0, 0.75, 0]} castShadow receiveShadow>
                {armorMat}
            </RoundedBox>
            
            {/* Head */}
            <RoundedBox args={[0.25, 0.28, 0.3]} radius={0.08} smoothness={4} position={[0, 1.3, 0]} castShadow>
                {skinMat}
            </RoundedBox>

            {/* Arms */}
            <group position={[0.32, 1.0, 0]} ref={rightArmRef}>
                <RoundedBox args={[0.16, 0.75, 0.16]} radius={0.04} smoothness={4} position={[0, -0.3, 0]} castShadow>
                    {armorMat}
                </RoundedBox>
            </group>
            <group position={[-0.32, 1.0, 0]} ref={leftArmRef}>
                <RoundedBox args={[0.16, 0.75, 0.16]} radius={0.04} smoothness={4} position={[0, -0.3, 0]} castShadow>
                    {armorMat}
                </RoundedBox>
            </group>

            {/* Legs */}
            <group position={[0.12, 0.4, 0]} ref={rightLegRef}>
                <RoundedBox args={[0.18, 0.85, 0.2]} radius={0.04} smoothness={4} position={[0, -0.4, 0]} castShadow>
                    {pantsMat}
                </RoundedBox>
            </group>
            <group position={[-0.12, 0.4, 0]} ref={leftLegRef}>
                 <RoundedBox args={[0.18, 0.85, 0.2]} radius={0.04} smoothness={4} position={[0, -0.4, 0]} castShadow>
                    {pantsMat}
                </RoundedBox>
            </group>
        </group>
    )
}

const LevelUpVFX: React.FC = () => {
    const { isLeveledUp, resetLevelUpFlag } = useGameStore();
    const ref = useRef<Group>(null);
    useEffect(() => {
        if (isLeveledUp) {
            const t = setTimeout(() => resetLevelUpFlag(), 3000);
            return () => clearTimeout(t);
        }
    }, [isLeveledUp]);
    useFrame((_, delta) => {
        if (!isLeveledUp || !ref.current) return;
        ref.current.rotation.y += delta * 5;
    });
    if (!isLeveledUp) return null;
    return (
        <group ref={ref} position={[0, 0, 0]}>
            <Cylinder args={[1.5, 1.5, 15, 32, 1, true]} position={[0, 7.5, 0]}>
                <meshBasicMaterial color="#ffd700" transparent opacity={0.3} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
            </Cylinder>
            <Sparkles count={50} scale={[3, 10, 3]} size={5} speed={3} color="#ffd700" />
        </group>
    )
}

export const Player: React.FC = () => {
  const playerRef = useRef<Group>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const { 
    damageEnemy, enemies, setPlayerPosition, getDerivedStats, 
    playerClass, playerName, playerLevel,
    moveDestination, setMoveDestination 
  } = useGameStore();

  const [isAttacking, setIsAttacking] = useState(false);
  const [comboStep, setComboStep] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const attackTimer = useRef(0);
  const hitEnemies = useRef<Set<string>>(new Set());
  const lastAttackEndTime = useRef(0);

  const modelColor = CLASS_COLORS[playerClass] || '#4a90e2';

  useFrame((state, delta) => {
    if (!playerRef.current) return;
    const stats = getDerivedStats();

    if (controlsRef.current) {
        // Camera Rotation (Q/E)
        if (inputSystem.isActionActive('CAMERA_ROTATE_LEFT')) {
            controlsRef.current.setAzimuthalAngle(controlsRef.current.getAzimuthalAngle() + 2 * delta);
        }
        if (inputSystem.isActionActive('CAMERA_ROTATE_RIGHT')) {
            controlsRef.current.setAzimuthalAngle(controlsRef.current.getAzimuthalAngle() - 2 * delta);
        }

        // Camera Zoom (R/F)
        const zoomIn = inputSystem.isActionActive('CAMERA_ZOOM_IN');
        const zoomOut = inputSystem.isActionActive('CAMERA_ZOOM_OUT');
        
        if (zoomIn || zoomOut) {
            // Get current vector from target to camera
            const offset = new Vector3().subVectors(camera.position, controlsRef.current.target);
            const currentDist = offset.length();
            
            // Zoom speed proportional to delta
            const zoomSpeed = 20 * delta; 
            
            let newDist = currentDist;
            if (zoomIn) newDist -= zoomSpeed;
            if (zoomOut) newDist += zoomSpeed;

            // Clamp to min/max distance allowed by controls
            newDist = Math.max(controlsRef.current.minDistance, Math.min(controlsRef.current.maxDistance, newDist));

            // Apply new length to offset vector and update camera position
            offset.setLength(newDist);
            camera.position.copy(controlsRef.current.target).add(offset);
        }
    }

    if (inputSystem.isActionActive('ATTACK_BASIC')) {
        const now = Date.now();
        if (!isAttacking) {
            if (now - lastAttackEndTime.current > 1000) setComboStep(0);
            setIsAttacking(true);
            attackTimer.current = 0;
            hitEnemies.current.clear();
            setMoveDestination(null);
        }
    }

    if (isAttacking) {
        attackTimer.current += delta * 1.5;
        const profile = COMBO_PROFILES[comboStep];
        if (attackTimer.current >= profile.hitStart && attackTimer.current <= profile.hitEnd) {
            const playerPos = playerRef.current.position;
            const forward = new Vector3(0, 0, 1).applyQuaternion(playerRef.current.quaternion).normalize();
            enemies.forEach(enemy => {
                if (enemy.isDead || enemy.type === 'npc' || hitEnemies.current.has(enemy.id)) return;
                const enemyPos = new Vector3(enemy.position[0], enemy.position[1], enemy.position[2]);
                if (checkSectorHit(playerPos, forward, enemyPos, profile.range, profile.angle)) {
                    hitEnemies.current.add(enemy.id);
                    const dir = new Vector3().subVectors(enemyPos, playerPos).normalize();
                    damageEnemy(enemy.id, 25, [dir.x, dir.z], comboStep === 3);
                }
            });
        }
        if (attackTimer.current >= profile.duration) {
            setIsAttacking(false);
            lastAttackEndTime.current = Date.now();
            setComboStep((prev) => (prev + 1) % 4);
        }
    }

    const moveSpeed = stats.speed * delta;
    const w = inputSystem.isActionActive('MOVE_FORWARD');
    const s = inputSystem.isActionActive('MOVE_BACKWARD');
    const a = inputSystem.isActionActive('MOVE_LEFT');
    const d = inputSystem.isActionActive('MOVE_RIGHT');
    
    const jX = inputSystem.joystickVector.x;
    const jY = inputSystem.joystickVector.y;
    const hasInput = w || a || s || d || Math.abs(jX) > 0.1 || Math.abs(jY) > 0.1;

    let _isMoving = false;
    let moveVec = new Vector3(0, 0, 0);

    if (hasInput) {
        if (moveDestination) setMoveDestination(null);
        const forward = new Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        const right = new Vector3().crossVectors(forward, new Vector3(0, 1, 0));
        
        if (Math.abs(jX) > 0.1 || Math.abs(jY) > 0.1) {
            moveVec.add(forward.clone().multiplyScalar(jY));
            moveVec.add(right.clone().multiplyScalar(jX));
        } else {
            if (w) moveVec.add(forward);
            if (s) moveVec.sub(forward);
            if (d) moveVec.add(right);
            if (a) moveVec.sub(right);
        }
    } else if (moveDestination && !isAttacking) {
        const currentPos = playerRef.current.position;
        const destVec = new Vector3(moveDestination[0], currentPos.y, moveDestination[2]);
        const dist = currentPos.distanceTo(destVec);
        if (dist > 0.5) {
            moveVec.subVectors(destVec, currentPos).normalize();
        } else {
            setMoveDestination(null);
        }
    }

    if (moveVec.lengthSq() > 0.01 && !isAttacking) {
        _isMoving = true;
        moveVec.normalize();
        playerRef.current.position.addScaledVector(moveVec, moveSpeed);
        const lookTarget = playerRef.current.position.clone().add(moveVec);
        const lookMatrix = new THREE.Matrix4();
        lookMatrix.lookAt(lookTarget, playerRef.current.position, new Vector3(0, 1, 0));
        const targetRotation = new THREE.Quaternion().setFromRotationMatrix(lookMatrix);
        playerRef.current.quaternion.slerp(targetRotation, 15 * delta);
        setPlayerPosition([playerRef.current.position.x, playerRef.current.position.y, playerRef.current.position.z], playerRef.current.rotation.y);
    }
    
    setIsMoving(_isMoving);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(new Vector3(playerRef.current.position.x, 1.2, playerRef.current.position.z), 0.2);
      controlsRef.current.update();
    }
  });

  return (
    <>
      <OrbitControls 
          ref={controlsRef} 
          makeDefault 
          enablePan={false} 
          enableDamping={true} 
          dampingFactor={0.1}
          minDistance={5} 
          maxDistance={35}
          maxPolarAngle={Math.PI / 2.5} 
          minPolarAngle={Math.PI / 4}   
          mouseButtons={{
              LEFT: null as any,
              MIDDLE: THREE.MOUSE.DOLLY,
              RIGHT: THREE.MOUSE.ROTATE
          }}
      />
      <group ref={playerRef} position={[0, 0, 0]}>
        <LevelUpVFX />
        <HumanoidBody color={modelColor} isMoving={isMoving} isAttacking={isAttacking} />
        {/* Weapon */}
        <group position={[0.5, 1, 0.4]} rotation={[1.2, 0, 0]}>
             <RoundedBox args={[0.08, 1.8, 0.04]} radius={0.01} smoothness={2}>
                 <meshStandardMaterial color="#e0e0e0" metalness={1.0} roughness={0.1} />
             </RoundedBox>
             <mesh position={[0, -0.6, 0]}>
                <cylinderGeometry args={[0.1, 0.05, 0.4]} />
                <meshStandardMaterial color="#8B4513" />
             </mesh>
        </group>
        <Html position={[0, 2.6, 0]} center>
            <div className="flex flex-col items-center pointer-events-none select-none">
                <span className="text-yellow-400 font-bold text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,1)] font-serif whitespace-nowrap bg-black/60 px-2 py-0.5 rounded border border-yellow-900/50">
                    Lv.{playerLevel} {playerName}
                </span>
            </div>
        </Html>
      </group>
    </>
  );
};
