
import React, { useRef, useState, useEffect, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Group } from 'three';
import { useGameStore } from '../store';
import { Html, OrbitControls, Trail, CameraShake, Sparkles, Cylinder } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { COMBO_PROFILES, checkSectorHit } from '../combatLogic';
import { inputSystem } from '../logic/inputSystem';
import { CharacterClass } from '../types';

const CLASS_COLORS: Record<CharacterClass, string> = {
    'warrior': '#4a90e2', // Blue
    'ninja': '#e91e63',   // Pink/Red
    'sura': '#b0bec5',    // Light Grey
    'shaman': '#9c27b0'   // Purple
};

// Procedural Human Body Component
export const HumanoidBody: React.FC<{ color: string, isMoving: boolean, isAttacking: boolean }> = ({ color, isMoving, isAttacking }) => {
    const bodyRef = useRef<Group>(null);
    const leftArmRef = useRef<THREE.Mesh>(null);
    const rightArmRef = useRef<THREE.Mesh>(null);
    const leftLegRef = useRef<THREE.Mesh>(null);
    const rightLegRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!bodyRef.current) return;
        const t = state.clock.elapsedTime;

        // Breathing
        bodyRef.current.scale.y = 1 + Math.sin(t * 2) * 0.01;

        if (isMoving) {
            // Running Animation
            const speed = 15;
            if(leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t * speed) * 0.8;
            if(rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t * speed + Math.PI) * 0.8;
            
            if (!isAttacking) {
                if(leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(t * speed + Math.PI) * 0.8;
                if(rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(t * speed) * 0.8;
            }
        } else {
            // Idle
            if(leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, 0.1);
            if(rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, 0.1);
            
            if (!isAttacking) {
                if(leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.1);
                if(rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.1);
                if(rightArmRef.current) rightArmRef.current.rotation.z = Math.PI / 12; // Relaxed arms
                if(leftArmRef.current) leftArmRef.current.rotation.z = -Math.PI / 12;
            }
        }

        if (isAttacking) {
             // Attack override for arms
             if(rightArmRef.current) {
                 rightArmRef.current.rotation.x = -Math.PI / 2; // Raised for swing
                 rightArmRef.current.rotation.z = 0;
             }
             if(leftArmRef.current) {
                 leftArmRef.current.rotation.x = 0.5; // Balance
                 leftArmRef.current.rotation.z = -0.5;
             }
        }
    });

    return (
        <group ref={bodyRef}>
            {/* Torso */}
            <mesh position={[0, 0.75, 0]} castShadow>
                <boxGeometry args={[0.4, 0.7, 0.25]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Head */}
            <mesh position={[0, 1.3, 0]} castShadow>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial color="#ffccaa" />{/* Skin Tone */}
            </mesh>
            
            {/* Right Arm (Pivot at Shoulder) */}
            <group position={[0.3, 1.0, 0]}>
                <mesh ref={rightArmRef} position={[0, -0.3, 0]} castShadow>
                    <boxGeometry args={[0.15, 0.7, 0.15]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            </group>

            {/* Left Arm */}
            <group position={[-0.3, 1.0, 0]}>
                 <mesh ref={leftArmRef} position={[0, -0.3, 0]} castShadow>
                    <boxGeometry args={[0.15, 0.7, 0.15]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            </group>

            {/* Right Leg (Pivot at Hip) */}
            <group position={[0.12, 0.4, 0]}>
                <mesh ref={rightLegRef} position={[0, -0.4, 0]} castShadow>
                    <boxGeometry args={[0.16, 0.8, 0.18]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
            </group>

            {/* Left Leg */}
            <group position={[-0.12, 0.4, 0]}>
                <mesh ref={leftLegRef} position={[0, -0.4, 0]} castShadow>
                    <boxGeometry args={[0.16, 0.8, 0.18]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
            </group>
        </group>
    )
}

const WeaponGlow: React.FC<{ level: number }> = ({ level }) => {
    if (level < 7) return null;
    
    const color = level === 7 ? "#ffffff" : level === 8 ? "#00ffff" : "#ff0044";
    const count = level === 7 ? 5 : level === 8 ? 15 : 25;
    const size = level >= 9 ? 6 : 4;
    const scale = level >= 9 ? [0.5, 1.8, 0.5] : [0.4, 1.2, 0.4];

    return (
        <group>
            <Sparkles 
                count={count} 
                scale={new THREE.Vector3(...scale)} 
                size={size} 
                speed={0.8} 
                opacity={0.8} 
                color={color} 
                noise={0.2} 
            />
            {level >= 8 && (
                <pointLight 
                    color={color} 
                    intensity={level === 9 ? 2.0 : 0.8} 
                    distance={2} 
                    decay={2} 
                />
            )}
        </group>
    )
}

const LevelUpVFX: React.FC = () => {
    const { isLeveledUp, resetLevelUpFlag } = useGameStore();
    const ref = useRef<Group>(null);
    
    useEffect(() => {
        if (isLeveledUp) {
            const t = setTimeout(() => resetLevelUpFlag(), 3000); // 3s effect
            return () => clearTimeout(t);
        }
    }, [isLeveledUp]);

    useFrame((state, delta) => {
        if (!isLeveledUp || !ref.current) return;
        ref.current.rotation.y += delta;
        ref.current.scale.y = Math.min(1, ref.current.scale.y + delta * 2);
    });

    if (!isLeveledUp) return null;

    return (
        <group ref={ref} position={[0, 0, 0]} scale={[1, 0, 1]}>
            {/* Pillar of light */}
            <Cylinder args={[1, 1, 10, 32, 1, true]} position={[0, 5, 0]}>
                <meshBasicMaterial color="#ffd700" transparent opacity={0.3} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
            </Cylinder>
            <Cylinder args={[0.5, 0.5, 10, 32, 1, true]} position={[0, 5, 0]}>
                <meshBasicMaterial color="#fff" transparent opacity={0.5} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
            </Cylinder>
            <Sparkles count={100} scale={[3, 10, 3]} size={5} speed={2} color="#ffd700" />
            <pointLight color="#ffd700" intensity={2} distance={10} />
        </group>
    )
}

const DustTrails: React.FC<{ isMoving: boolean }> = ({ isMoving }) => {
    if (!isMoving) return null;
    return (
        <group position={[0, 0.1, -0.5]}>
            <Sparkles count={5} scale={[1, 0.5, 1]} size={4} speed={0.5} opacity={0.2} color="#8d6e63" />
        </group>
    )
}

const WeaponModel: React.FC<{ subType: string, isAttacking: boolean, comboStep: number, hasAura: boolean, upgradeLevel: number }> = ({ subType, isAttacking, comboStep, hasAura, upgradeLevel }) => {
    const ref = useRef<Group>(null);
    const trailColor = comboStep === 3 ? "#ff4400" : "#00ffff";

    // SubType rendering logic remains same but attached to hand
    if (subType === 'dagger') {
        return (
            <group>
                <group position={[0.3, 0, 0]}>
                    <Trail width={isAttacking ? 0.6 : 0} length={3} color={trailColor} attenuation={(t) => t * t}>
                        <mesh position={[0, 0.3, 0.2]}>
                            <boxGeometry args={[0.05, 0.6, 0.05, 4, 8, 4]} />
                            <meshStandardMaterial color="#e0e0e0" metalness={0.9} />
                        </mesh>
                    </Trail>
                    <mesh position={[0, 0, 0.2]}><boxGeometry args={[0.1, 0.05, 0.1]} /><meshStandardMaterial color="#3e2723" /></mesh>
                    <group position={[0, 0.3, 0.2]}>
                        <WeaponGlow level={upgradeLevel} />
                    </group>
                </group>
            </group>
        )
    }

    // Default Sword / Two Handed
    return (
         <group position={[0, 0, 0]}>
             <Trail width={isAttacking ? 0.8 : 0} length={4} color={trailColor} attenuation={(t) => t * t}>
                <mesh position={[0, 0.6, 0]}>
                    <boxGeometry args={[0.05, 1.4, 0.05]} />
                    <meshStandardMaterial visible={false} />
                </mesh>
             </Trail>
             <mesh position={[0, 0.6, 0]}>
                <boxGeometry args={[0.08, 1.6, 0.02, 4, 8, 2]} />
                <meshStandardMaterial color="#e0e0e0" metalness={0.9} roughness={0.1} />
             </mesh>
             <mesh position={[0, -0.3, 0]}>
                 <boxGeometry args={[0.3, 0.05, 0.1, 4, 2, 4]} />
                 <meshStandardMaterial color="#ffd700" />
             </mesh>
             
             <group visible={hasAura}>
                <mesh position={[0, 0.6, 0]}>
                    <boxGeometry args={[0.2, 1.8, 0.2]} />
                    <meshStandardMaterial color="#ff0000" transparent opacity={0.3} emissive="#ff0000" emissiveIntensity={2} depthWrite={false} />
                </mesh>
             </group>

             <group position={[0, 0.6, 0]}>
                 <WeaponGlow level={upgradeLevel} />
             </group>
         </group>
    );
}

export const Player: React.FC = () => {
  const playerRef = useRef<Group>(null);
  const weaponRef = useRef<Group>(null);
  const bodyMeshRef = useRef<Group>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  
  const { camera } = useThree();
  
  const { 
      damageEnemy, 
      enemies, 
      setNpcDialogue, 
      setPlayerPosition, 
      pickupAllNearby, 
      getDerivedStats,
      activateSkill,
      activeBuffs,
      playerClass,
      playerName,
      playerLevel,
      equipment
  } = useGameStore();

  const [isAttacking, setIsAttacking] = useState(false);
  const [comboStep, setComboStep] = useState(0);
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  
  const attackTimer = useRef(0);
  const hitEnemies = useRef<Set<string>>(new Set());
  const lastAttackEndTime = useRef(0);
  
  const hasAura = activeBuffs.some(b => b.skillId === 'aura_sword');
  const modelColor = CLASS_COLORS[playerClass] || '#4a90e2';
  const weaponType = equipment.weapon?.subType || 'sword';
  const weaponLevel = equipment.weapon?.upgradeLevel || 0;

  // Input Handlers
  useEffect(() => {
    const unsubs = [
        // Note: Continuous attack is now handled in useFrame
        inputSystem.onAction('INTERACT_OR_PICKUP', () => {
             handleInteract();
             pickupAllNearby();
        }),
        inputSystem.onAction('USE_QUICKSLOT_1', () => activateSkill(0)),
        inputSystem.onAction('USE_QUICKSLOT_2', () => activateSkill(1)),
        inputSystem.onAction('USE_QUICKSLOT_3', () => activateSkill(2)),
        inputSystem.onAction('USE_QUICKSLOT_4', () => activateSkill(3)),
        inputSystem.onAction('USE_QUICKSLOT_5', () => activateSkill(4)),
    ];

    return () => {
        unsubs.forEach(u => u());
    };
  }, [enemies]);

  const handleInteract = () => {
    if (!playerRef.current) return;
    const playerPos = playerRef.current.position;
    const closestNpc = enemies.find(e => {
      if (e.type !== 'npc') return false;
      const dx = playerPos.x - e.position[0];
      const dz = playerPos.z - e.position[2];
      return Math.sqrt(dx * dx + dz * dz) < 3;
    });
    if (closestNpc) {
      setNpcDialogue(true, closestNpc.id);
    }
  };

  const startAttack = () => {
      const now = Date.now();
      // If already attacking, do nothing until finished
      if (isAttacking) return;
      
      // Combo logic reset
      if (now - lastAttackEndTime.current > 1200) setComboStep(0);
      
      setIsAttacking(true);
      attackTimer.current = 0;
      hitEnemies.current.clear();
      
      if (playerRef.current) {
          const forward = new Vector3(0, 0, 1).applyQuaternion(playerRef.current.quaternion);
          playerRef.current.position.addScaledVector(forward, 0.4);
          camera.position.addScaledVector(forward, 0.4);
      }
  };

  useFrame((state, delta) => {
    if (!playerRef.current) return;
    const stats = getDerivedStats();
    const attackSpeed = stats.attackSpeed || 1.0;

    // Continuous Attack Input Check
    if (inputSystem.isActionActive('ATTACK_BASIC')) {
        startAttack();
    }

    // Attack Logic
    if (isAttacking) {
        attackTimer.current += delta * attackSpeed;
        const profile = COMBO_PROFILES[comboStep];
        if (attackTimer.current >= profile.hitStart && attackTimer.current <= profile.hitEnd) {
            const playerPos = playerRef.current.position;
            const forward = new Vector3(0, 0, 1).applyQuaternion(playerRef.current.quaternion).normalize();
            enemies.forEach(enemy => {
                if (enemy.isDead || enemy.type === 'npc') return;
                if (hitEnemies.current.has(enemy.id)) return;
                const enemyPos = new Vector3(enemy.position[0], enemy.position[1], enemy.position[2]);
                if (checkSectorHit(playerPos, forward, enemyPos, profile.range, profile.angle)) {
                    hitEnemies.current.add(enemy.id);
                    const isFinisher = comboStep === 3;
                    const comboMult = 20 * (1 + (comboStep * 0.2));
                    const dir = new Vector3().subVectors(enemyPos, playerPos).normalize();
                    damageEnemy(enemy.id, comboMult, [dir.x, dir.z], isFinisher);
                    setShakeIntensity(0.3 + (comboStep * 0.1));
                    setTimeout(() => setShakeIntensity(0), 100);
                }
            });
        }
        if (attackTimer.current >= profile.duration) {
            setIsAttacking(false);
            lastAttackEndTime.current = Date.now();
            setComboStep((prev) => (prev + 1) % 4);
        }
    }

    // Movement Logic
    const moveSpeed = stats.speed * delta; 
    const w = inputSystem.isActionActive('MOVE_FORWARD');
    const s = inputSystem.isActionActive('MOVE_BACKWARD');
    const a = inputSystem.isActionActive('MOVE_LEFT');
    const d = inputSystem.isActionActive('MOVE_RIGHT');
    const q = inputSystem.isActionActive('CAMERA_ROTATE_LEFT');
    const e = inputSystem.isActionActive('CAMERA_ROTATE_RIGHT');

    if (q || e) {
        if (controlsRef.current) {
            const rotSpeed = 2.0 * delta;
            const currentAzimuth = controlsRef.current.getAzimuthalAngle();
            controlsRef.current.setAzimuthalAngle(currentAzimuth + (q ? rotSpeed : -rotSpeed));
        }
    }

    let _isMoving = false;
    if ((w || a || s || d) && !isAttacking) {
        _isMoving = true;
        const forward = new Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        const right = new Vector3();
        right.crossVectors(forward, new Vector3(0, 1, 0));
        const moveVec = new Vector3(0, 0, 0);
        if (w) moveVec.add(forward);
        if (s) moveVec.sub(forward);
        if (d) moveVec.add(right);
        if (a) moveVec.sub(right);

        if (moveVec.lengthSq() > 0) {
            moveVec.normalize();
            playerRef.current.position.addScaledVector(moveVec, moveSpeed);
            camera.position.addScaledVector(moveVec, moveSpeed);
            
            const targetRotation = new THREE.Quaternion();
            const lookMatrix = new THREE.Matrix4();
            const targetPos = playerRef.current.position.clone().add(moveVec);
            lookMatrix.lookAt(targetPos, playerRef.current.position, new Vector3(0, 1, 0));
            targetRotation.setFromRotationMatrix(lookMatrix);
            playerRef.current.quaternion.slerp(targetRotation, 25 * delta);
            
            setPlayerPosition(
                 [playerRef.current.position.x, playerRef.current.position.y, playerRef.current.position.z],
                 playerRef.current.rotation.y
            );
        }
    }
    setIsMoving(_isMoving);

    if (controlsRef.current) {
      controlsRef.current.target.copy(playerRef.current.position);
      controlsRef.current.target.y = 1.5; 
      controlsRef.current.update();
    }
    
    // Weapon Animation / Attachment
    if (weaponRef.current) {
        if (isAttacking) {
            const t = attackTimer.current * 8;
            if (comboStep === 0) {
                weaponRef.current.rotation.set(1.5 + Math.sin(t)*1.5, -Math.sin(t)*1.0, -0.5);
                weaponRef.current.position.set(0.6 - Math.sin(t)*0.5, 1, 0.5 + Math.sin(t)*0.5);
            } else if (comboStep === 1) {
                weaponRef.current.rotation.set(1.5, 1.5 - Math.sin(t)*2.5, -Math.PI/2);
                weaponRef.current.position.set(0.6, 1, 0.5 + Math.sin(t));
            } else if (comboStep === 2) {
                weaponRef.current.rotation.set(1.5 + Math.sin(t)*2.0, 0, 0);
                weaponRef.current.position.set(0.6, 1 + Math.sin(t), 0.5 + Math.sin(t));
            } else {
                weaponRef.current.rotation.set(Math.PI/2, 0, 0);
                weaponRef.current.position.set(0.6, 1, 0.5 + Math.sin(t)*1.5);
            }
        } else {
             // Idle hold in right hand
            const breath = Math.sin(state.clock.elapsedTime * 2) * 0.05;
            weaponRef.current.position.set(0.55, 0.8 + breath, 0.3); // Adjusted for Humanoid
            weaponRef.current.rotation.set(1.8, 0, 0); 
        }
    }
  });

  return (
    <>
      <CameraShake 
        maxYaw={0.05} maxPitch={0.05} maxRoll={0.05} 
        yawFrequency={40} pitchFrequency={40} rollFrequency={40} 
        intensity={shakeIntensity} decay={false} 
      />
      <OrbitControls 
          ref={controlsRef} makeDefault enablePan={false} enableDamping={false} 
          maxPolarAngle={Math.PI / 2 - 0.1} minDistance={6} maxDistance={25} 
          mouseButtons={{ LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }}
      />
      
      <group ref={playerRef} position={[0, 0, 0]}>
        {/* Level Up VFX Container */}
        <LevelUpVFX />
        <DustTrails isMoving={isMoving} />

        <HumanoidBody color={modelColor} isMoving={isMoving} isAttacking={isAttacking} />
          
        <group ref={weaponRef} position={[0.5, 1, 0.5]} rotation={[1.5, 0, 0]}>
             <WeaponModel subType={weaponType} isAttacking={isAttacking} comboStep={comboStep} hasAura={hasAura} upgradeLevel={weaponLevel} />
        </group>

        <mesh position={[0, 2.2, 0]}>
            <Html center zIndexRange={[100, 0]}>
                <div className="flex flex-col items-center pointer-events-none select-none">
                <div className="text-yellow-400 font-bold text-xs drop-shadow-md font-serif whitespace-nowrap">
                    Lv. {playerLevel} {playerName}
                </div>
                <div className="text-gray-400 text-[8px] font-serif uppercase tracking-widest">
                    {playerClass}
                </div>
                </div>
            </Html>
        </mesh>
      </group>
    </>
  );
};
