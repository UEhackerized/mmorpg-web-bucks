
import React, { useRef, useState, useEffect, Suspense } from 'react';
import { useFrame, useThree, useLoader } from '@react-three/fiber';
import { Vector3, Group } from 'three';
import { useGameStore } from '../store';
import { Capsule, Html, OrbitControls, Trail, CameraShake, Sparkles } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { OBJLoader, MTLLoader } from 'three-stdlib';
import * as THREE from 'three';
import { COMBO_PROFILES, checkSectorHit } from '../combatLogic';
import { inputSystem } from '../logic/inputSystem';
import { CharacterClass } from '../types';

const CLASS_COLORS: Record<CharacterClass, string> = {
    'warrior': '#4a90e2', // Blue
    'ninja': '#e91e63',   // Pink/Red
    'sura': '#ffffff',    // White
    'shaman': '#9c27b0'   // Purple
};

// Simple Error Boundary to catch loader failures (404s)
class ModelErrorBoundary extends React.Component<{ fallback: React.ReactNode, children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { fallback: React.ReactNode, children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error: any) {
        return { hasError: true };
    }
    componentDidCatch(error: any) {
        console.warn("Failed to load 3D model, reverting to fallback. Ensure /characters/warrior/warrior.obj exists.", error);
    }
    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

// --- CUSTOM MODEL LOADER ---
const WarriorModel3D: React.FC<{ isMoving: boolean, isAttacking: boolean }> = ({ isMoving, isAttacking }) => {
    // Try to load OBJ and MTL.
    // Ensure files are at /public/characters/warrior/warrior.obj and .mtl
    const materials = useLoader(MTLLoader, '/characters/warrior/warrior.mtl');
    const obj = useLoader(OBJLoader, '/characters/warrior/warrior.obj', (loader) => {
        materials.preload();
        (loader as any).setMaterials(materials);
    });

    const ref = useRef<Group>(null);

    // Simple animation simulation by rocking the model
    useFrame((state) => {
        if (!ref.current) return;
        if (isMoving) {
            ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.05;
            ref.current.position.y = -0.9 + Math.abs(Math.sin(state.clock.elapsedTime * 10)) * 0.05;
        } else {
            ref.current.rotation.z = 0;
            ref.current.position.y = -0.9;
        }

        if (isAttacking) {
            ref.current.rotation.y = Math.PI + Math.sin(state.clock.elapsedTime * 20) * 0.5;
        } else {
             ref.current.rotation.y = Math.PI; // Face forward (OBJ usually faces +Z, we rotate 180 if needed)
        }
    });

    // Scale needs adjustment depending on the export. Starting with 0.01 as many OBJs are huge.
    // Adjust 'scale={0.01}' if the model is too big/small.
    return <primitive ref={ref} object={obj} scale={0.02} position={[0, -0.9, 0]} rotation={[0, Math.PI, 0]} />;
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

const WeaponModel: React.FC<{ subType: string, isAttacking: boolean, comboStep: number, hasAura: boolean, upgradeLevel: number }> = ({ subType, isAttacking, comboStep, hasAura, upgradeLevel }) => {
    const ref = useRef<Group>(null);

    useFrame((state) => {
        if (!ref.current) return;
        if (isAttacking) {
             // Optional extra animation logic
        }
    });

    const trailColor = comboStep === 3 ? "#ff4400" : "#00ffff";

    if (subType === 'dagger') {
        // Dual Daggers
        return (
            <group>
                {/* Right Hand */}
                <group position={[0.3, 0, 0]}>
                    <Trail width={isAttacking ? 0.6 : 0} length={3} color={trailColor} attenuation={(t) => t * t}>
                        <mesh position={[0, 0.3, 0.2]}>
                            <boxGeometry args={[0.05, 0.6, 0.05]} />
                            <meshStandardMaterial color="#e0e0e0" metalness={0.9} />
                        </mesh>
                    </Trail>
                    <mesh position={[0, 0, 0.2]}><boxGeometry args={[0.1, 0.05, 0.1]} /><meshStandardMaterial color="#3e2723" /></mesh>
                    <group position={[0, 0.3, 0.2]}>
                        <WeaponGlow level={upgradeLevel} />
                    </group>
                </group>
                {/* Left Hand */}
                <group position={[-0.3, 0, 0]}>
                     <Trail width={isAttacking ? 0.6 : 0} length={3} color={trailColor} attenuation={(t) => t * t}>
                        <mesh position={[0, 0.3, 0.2]}>
                            <boxGeometry args={[0.05, 0.6, 0.05]} />
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

    if (subType === 'bell') {
        return (
             <group position={[0, 0.4, 0.2]}>
                <mesh position={[0, 0.4, 0]}>
                    <cylinderGeometry args={[0.02, 0.02, 1]} />
                    <meshStandardMaterial color="#8d6e63" />
                </mesh>
                <mesh position={[0, 1.0, 0]}>
                    <sphereGeometry args={[0.15]} />
                    <meshStandardMaterial color="#ffd700" metalness={0.8} />
                </mesh>
                {hasAura && <pointLight color="#ff0000" intensity={0.5} distance={2} />}
                <group position={[0, 0.8, 0]}>
                     <WeaponGlow level={upgradeLevel} />
                </group>
             </group>
        )
    }
    
    if (subType === 'fan') {
        return (
            <group position={[0, 0.4, 0.2]}>
                 <mesh position={[0, 0, 0]} rotation={[0,0,-0.2]}>
                    <cylinderGeometry args={[0.02, 0.02, 0.6]} />
                    <meshStandardMaterial color="#5d4037" />
                </mesh>
                <mesh position={[0.2, 0.4, 0]} rotation={[0,0,-0.2]}>
                     <cylinderGeometry args={[0.4, 0.4, 0.01, 8, 1, true, 0, Math.PI]} />
                     <meshStandardMaterial color="#e91e63" side={THREE.DoubleSide} />
                </mesh>
                <group position={[0.2, 0.4, 0]}>
                     <WeaponGlow level={upgradeLevel} />
                </group>
            </group>
        )
    }

    if (subType === 'bow') {
        return (
            <group position={[-0.2, 0.5, 0.3]} rotation={[0, -1.5, 1.5]}>
                <mesh>
                    <torusGeometry args={[0.6, 0.05, 8, 20, 3]} />
                    <meshStandardMaterial color="#8d6e63" />
                </mesh>
                <mesh position={[0, 0, 0]} rotation={[0,0,1.5]}>
                    <cylinderGeometry args={[0.01, 0.01, 1.1]} />
                    <meshStandardMaterial color="#eee" />
                </mesh>
                <group position={[0, 0, 0]}>
                     <WeaponGlow level={upgradeLevel} />
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
                <boxGeometry args={[0.08, 1.6, 0.02]} />
                <meshStandardMaterial color="#e0e0e0" metalness={0.9} roughness={0.1} />
             </mesh>
             <mesh position={[0, -0.3, 0]}>
                 <boxGeometry args={[0.3, 0.05, 0.1]} />
                 <meshStandardMaterial color="#ffd700" />
             </mesh>
             
             {/* Aura Effect */}
             <group visible={hasAura}>
                <mesh position={[0, 0.6, 0]}>
                    <boxGeometry args={[0.2, 1.8, 0.2]} />
                    <meshStandardMaterial color="#ff0000" transparent opacity={0.3} emissive="#ff0000" emissiveIntensity={2} depthWrite={false} />
                </mesh>
             </group>

             {/* Upgrade Glow */}
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
      usePotion,
      getDerivedStats,
      setTarget,
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

  useEffect(() => {
    const unsubs = [
        inputSystem.onAction('ATTACK_BASIC', () => startAttack()),
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
  }, [isAttacking, enemies, comboStep]);

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
      if (isAttacking) return;
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

    // --- COMBAT LOOP ---
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

    // --- MOVEMENT ---
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

    // Animation logic for fallback model
    if (bodyMeshRef.current && playerClass !== 'warrior') {
        if (_isMoving) {
            bodyMeshRef.current.position.y = Math.sin(state.clock.elapsedTime * 15) * 0.05;
            bodyMeshRef.current.rotation.x = 0.1;
        } else {
            bodyMeshRef.current.position.y = THREE.MathUtils.lerp(bodyMeshRef.current.position.y, 0, delta * 5);
            bodyMeshRef.current.rotation.x = THREE.MathUtils.lerp(bodyMeshRef.current.rotation.x, 0, delta * 5);
        }
    }

    if (controlsRef.current) {
      controlsRef.current.target.copy(playerRef.current.position);
      controlsRef.current.target.y = 1.5; 
      controlsRef.current.update();
    }
    
    // Weapon Animation
    if (weaponRef.current) {
        if (isAttacking) {
            const t = attackTimer.current * 8;
            if (weaponType === 'dagger') {
                weaponRef.current.position.z = 0.5 + Math.sin(t * 2) * 0.5;
            } else if (comboStep === 0) {
                weaponRef.current.rotation.set(1.5 + Math.sin(t)*1.5, -Math.sin(t)*1.0, -0.5);
                weaponRef.current.position.set(0.5 - Math.sin(t)*0.5, 1, 0.5 + Math.sin(t)*0.5);
            } else if (comboStep === 1) {
                weaponRef.current.rotation.set(1.5, 1.5 - Math.sin(t)*2.5, -Math.PI/2);
                weaponRef.current.position.set(0.5, 1, 0.5 + Math.sin(t));
            } else if (comboStep === 2) {
                weaponRef.current.rotation.set(1.5 + Math.sin(t)*2.0, 0, 0);
                weaponRef.current.position.set(0.5, 1 + Math.sin(t), 0.5 + Math.sin(t));
            } else {
                weaponRef.current.rotation.set(Math.PI/2, 0, 0);
                weaponRef.current.position.set(0.5, 1, 0.5 + Math.sin(t)*1.5);
            }
        } else {
            const breath = Math.sin(state.clock.elapsedTime * 2) * 0.05;
            weaponRef.current.rotation.set(1.5 + breath, 0, 0);
            weaponRef.current.position.set(0.5, 1 + breath, 0.5);
            weaponRef.current.rotation.z = 0;
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
      
      <group ref={playerRef} position={[0, 1, 0]}>
        <group ref={bodyMeshRef}>
          
          {/* RENDER WARRIOR MODEL IF SELECTED, ELSE FALLBACK CAPSULE */}
          {playerClass === 'warrior' ? (
             <ModelErrorBoundary fallback={
                <Capsule args={[0.4, 1.2]} position={[0, 0.6, 0]} castShadow>
                   <meshStandardMaterial color={modelColor} />
                </Capsule>
             }>
                 <Suspense fallback={
                    <Capsule args={[0.4, 1.2]} position={[0, 0.6, 0]}><meshStandardMaterial color="gray" wireframe /></Capsule>
                 }>
                     <WarriorModel3D isMoving={isMoving} isAttacking={isAttacking} />
                 </Suspense>
             </ModelErrorBoundary>
          ) : (
             <Capsule args={[0.4, 1.2]} position={[0, 0.6, 0]} castShadow>
                <meshStandardMaterial color={modelColor} />
             </Capsule>
          )}
          
          {/* Weapon Group */}
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
      </group>
    </>
  );
};
