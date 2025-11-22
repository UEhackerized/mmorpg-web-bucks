
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useGameStore } from '../store';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Loot } from './Loot';

// Constants for visual culling (inside the component)
const MESH_CULL_DISTANCE = 45; // Distance to stop rendering the 3D model
const LABEL_CULL_DISTANCE = 25; // Distance to stop rendering text/HP bars

// Hard limit for React Rendering (Optimization)
const REACT_RENDER_DISTANCE = 60; 
const NPC_RENDER_DISTANCE = 150; // NPCs visible from further away

const DamageNumbers: React.FC = () => {
    const floatingTexts = useGameStore(state => state.floatingTexts);

    return (
        <>
            {floatingTexts.map((ft) => (
                <group key={ft.id} position={ft.position}>
                    <Html center zIndexRange={[100, 0]}>
                        <FloatingTextInstance text={ft.text} color={ft.color} scale={ft.scale} />
                    </Html>
                </group>
            ))}
        </>
    )
}

const FloatingTextInstance: React.FC<{ text: string, color: string, scale?: number }> = ({ text, color, scale = 1 }) => {
    const [active, setActive] = React.useState(false);
    const xOffset = React.useRef((Math.random() - 0.5) * 50);

    useEffect(() => {
        const t = setTimeout(() => setActive(true), 50);
        return () => clearTimeout(t);
    }, []);

    return (
        <div 
            className="font-black text-3xl drop-shadow-[0_3px_3px_rgba(0,0,0,0.9)] pointer-events-none select-none transition-all duration-1000 ease-out"
            style={{ 
                color: color, 
                transform: `translate(${xOffset.current}px, ${active ? -100 : 0}px) scale(${active ? 0.5 * scale : 1 * scale})`,
                opacity: active ? 0 : 1,
                fontFamily: '"Roboto", sans-serif',
                textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
            }}
        >
            {text}
        </div>
    )
}

const EnemyInstance: React.FC<{ data: any }> = ({ data }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);
    const targetRingRef = useRef<THREE.Mesh>(null);
    
    const [visible, setVisible] = useState(true);
    const [showLabel, setShowLabel] = useState(true);
    
    const targetId = useGameStore(s => s.targetId);
    const setTarget = useGameStore(s => s.setTarget);
    const interactWithNpc = useGameStore(s => s.interactWithNpc);
    const isTargeted = targetId === data.id;

    // Initialize position ref to prevent jumps on mount
    const lastPos = useRef(new THREE.Vector3(data.position[0], data.position[1], data.position[2]));

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // --- DISTANCE CULLING LOGIC ---
        const cameraPos = state.camera.position;
        const currentPos = groupRef.current.position;
        
        // Calculate rough 2D distance squared (faster than sqrt)
        const dx = cameraPos.x - currentPos.x;
        const dz = cameraPos.z - currentPos.z;
        const distSq = dx*dx + dz*dz;

        // Check Mesh Visibility
        const shouldBeVisible = distSq < (MESH_CULL_DISTANCE * MESH_CULL_DISTANCE);
        
        if (visible !== shouldBeVisible) {
            groupRef.current.visible = shouldBeVisible;
            setVisible(shouldBeVisible);
        }

        // If too far, skip all animation logic to save CPU
        if (!shouldBeVisible) return;

        // Check Label Visibility
        const shouldShowLabel = distSq < (LABEL_CULL_DISTANCE * LABEL_CULL_DISTANCE);
        if (showLabel !== shouldShowLabel) {
            setShowLabel(shouldShowLabel);
        }

        // --- ANIMATION LOGIC ---
        if (!data.isDead) {
             const targetX = data.position[0];
             const targetZ = data.position[2];
             
             // Smooth Movement for enemies, Instant for NPCs/Metins
             if (data.type === 'enemy') {
                lastPos.current.x = THREE.MathUtils.lerp(lastPos.current.x, targetX, delta * 15);
                lastPos.current.z = THREE.MathUtils.lerp(lastPos.current.z, targetZ, delta * 15);
                
                currentPos.x = lastPos.current.x;
                currentPos.z = lastPos.current.z;
             } else {
                currentPos.x = targetX;
                currentPos.z = targetZ;
             }
             
             // Rotation
             if (data.type === 'enemy') {
                 let targetRot = data.rotationY;
                 let currentRot = groupRef.current.rotation.y;
                 
                 // Smooth angle interpolation
                 while (targetRot > Math.PI) targetRot -= Math.PI * 2;
                 while (targetRot < -Math.PI) targetRot += Math.PI * 2;
                 while (currentRot > Math.PI) currentRot -= Math.PI * 2;
                 while (currentRot < -Math.PI) currentRot += Math.PI * 2;

                 let diff = targetRot - currentRot;
                 while (diff > Math.PI) diff -= Math.PI * 2;
                 while (diff < -Math.PI) diff += Math.PI * 2;
                 
                 groupRef.current.rotation.y += diff * 10 * delta;
             } else {
                 groupRef.current.rotation.y = data.rotationY || 0;
             }
             
             // Metin Pulse / Idle Bounce
             if (data.type === 'metin') {
                 groupRef.current.position.y = (data.scale || 1.5) * 0.6 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
                 if (meshRef.current) {
                     meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
                     meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime) * 0.1;
                 }
             } else if (data.type === 'enemy' && Math.abs(targetX - currentPos.x) > 0.01) {
                 groupRef.current.position.y = (data.scale || 1) * 0.5 + Math.abs(Math.sin(state.clock.elapsedTime * 15)) * 0.2;
             } else {
                 groupRef.current.position.y = (data.scale || 1) * 0.5;
             }
             
             if (targetRingRef.current) {
                 targetRingRef.current.rotation.z += delta * 2;
             }
        }

        // Hit Flash Effect
        if (materialRef.current) {
            const timeSinceHit = Date.now() - (data.lastHitTime || 0);
            const isMetin = data.type === 'metin';
            
            if (timeSinceHit < 150) {
                materialRef.current.emissive.setHex(0xffffff);
                materialRef.current.emissiveIntensity = 0.8;
                if(groupRef.current) groupRef.current.scale.setScalar(1.1);
            } else {
                materialRef.current.emissive.setHex(isMetin ? 0x550000 : 0x000000);
                materialRef.current.emissiveIntensity = isMetin ? 0.5 : 0; 
                if(groupRef.current) groupRef.current.scale.setScalar(1);
            }
        }
    });

    if (data.isDead) return null;

    const isMetin = data.type === 'metin';
    const isNpc = data.type === 'npc';
    const scale = data.scale || 1;
    const npcColor = data.color || '#ffffff';

    return (
        <group 
            ref={groupRef} 
            position={[data.position[0], scale * 0.5, data.position[2]]}
            onClick={(e) => { 
                e.stopPropagation(); 
                setTarget(data.id);
                if (isNpc) interactWithNpc(data.id);
            }}
        >
            {/* Target Ring */}
            {isTargeted && visible && (
                <mesh ref={targetRingRef} position={[0, isMetin ? -1 : -(scale*0.4), 0]} rotation={[-Math.PI/2, 0, 0]}>
                    <ringGeometry args={[scale * 1.0, scale * 1.2, 32]} />
                    <meshBasicMaterial color={isNpc ? "#00ff00" : "#ff0000"} transparent opacity={0.8} side={THREE.DoubleSide} />
                </mesh>
            )}

            {/* Name Label - Culled */}
            {showLabel && (
                <Html position={[0, isMetin ? 2.5 : scale + 0.5, 0]} center>
                    <div className="flex flex-col items-center pointer-events-none select-none">
                        <span className={`text-[10px] font-bold drop-shadow-md whitespace-nowrap ${isNpc ? 'text-[#ffd700]' : isMetin ? 'text-purple-400' : isTargeted ? 'text-red-500 scale-125 transition-transform' : 'text-red-300'}`}>
                            {isNpc ? data.name : `Lv.${data.level} ${data.name}`}
                        </span>
                        {!isNpc && (
                            <div className={`w-12 h-1 bg-black/50 border border-gray-600 mt-1 ${isMetin ? 'w-20 h-1.5' : ''}`}>
                                <div 
                                    className="h-full bg-red-600 transition-all duration-200" 
                                    style={{ width: `${(data.hp / data.maxHp) * 100}%` }}
                                />
                            </div>
                        )}
                    </div>
                </Html>
            )}

            <mesh ref={meshRef} castShadow receiveShadow>
                {isMetin ? (
                    <dodecahedronGeometry args={[1.8, 0]} />
                ) : isNpc ? (
                    data.npcType === 'shop' ? <boxGeometry args={[0.6, 1.8, 0.6]} /> :
                    data.npcType === 'guard' ? <boxGeometry args={[0.8, 2.0, 0.8]} /> :
                    <capsuleGeometry args={[0.4, 1.2, 4, 8]} />
                ) : (
                    <boxGeometry args={[scale * 0.8, scale * 0.8, scale * 1.5]} /> 
                )}
                
                <meshStandardMaterial 
                    ref={materialRef}
                    color={isMetin ? "#1a0505" : isNpc ? npcColor : data.color} 
                    roughness={isMetin ? 0.4 : 0.7}
                    metalness={isMetin ? 0.5 : 0.1}
                />
            </mesh>
            
            {isMetin && visible && (
                <pointLight color="#ff0000" distance={5} intensity={2} />
            )}
            
            {isNpc && visible && (
                <pointLight color={npcColor} distance={3} intensity={0.5} position={[0, 2, 0]} />
            )}
            
        </group>
    );
};

export const Enemies: React.FC = () => {
  const enemies = useGameStore((state) => state.enemies);
  const playerPosition = useGameStore((state) => state.playerPosition);

  // Optimization: Filter enemies strictly based on distance before rendering React Components
  // This drastically reduces the React Reconciliation overhead when there are 1000+ enemies on the map.
  const visibleEnemies = useMemo(() => {
      return enemies.filter(e => {
          // Always show NPCs/Metins from further away (important landmarks)
          if (e.type === 'npc' || e.type === 'metin') {
              const dx = e.position[0] - playerPosition[0];
              const dz = e.position[2] - playerPosition[2];
              return (dx*dx + dz*dz) < (NPC_RENDER_DISTANCE * NPC_RENDER_DISTANCE);
          }
          
          // For normal mobs, hard cull them if they are too far.
          // The EnemyInstance component handles visual hiding at 45 units (MESH_CULL_DISTANCE),
          // but here we stop the React Component from even mounting if > 60 units.
          const dx = e.position[0] - playerPosition[0];
          const dz = e.position[2] - playerPosition[2];
          return (dx*dx + dz*dz) < (REACT_RENDER_DISTANCE * REACT_RENDER_DISTANCE);
      });
  }, [enemies, playerPosition]);

  return (
    <>
      {visibleEnemies.map((enemy) => (
        <EnemyInstance key={enemy.id} data={enemy} />
      ))}
      <Loot />
      <DamageNumbers />
    </>
  );
};
