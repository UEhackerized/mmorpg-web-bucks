
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useGameStore } from '../store';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Loot } from './Loot';
import { HumanoidBody } from './Player';

// Visual culling
const MESH_CULL_DISTANCE = 60; 
const LABEL_CULL_DISTANCE = 30; 
const RENDER_DISTANCE = 80; 

// Shared Geometries to reduce draw overhead and memory
const bodyGeo = new THREE.BoxGeometry(0.5, 0.5, 1.0);
const headGeo = new THREE.BoxGeometry(0.35, 0.35, 0.4);
const legGeo = new THREE.BoxGeometry(0.15, 0.4, 0.15);
const metinGeo = new THREE.DodecahedronGeometry(1.2, 1);
const ringGeo = new THREE.RingGeometry(1.0, 1.2, 32);

// Procedural Animal Body with Shared Geometry
const QuadrupedBody: React.FC<{ color: string, scale: number, isMoving: boolean }> = React.memo(({ color, scale, isMoving }) => {
    const group = useRef<THREE.Group>(null);
    const leg1 = useRef<THREE.Mesh>(null);
    const leg2 = useRef<THREE.Mesh>(null);
    const leg3 = useRef<THREE.Mesh>(null);
    const leg4 = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!isMoving) {
            if (group.current) group.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
            return;
        }
        const t = state.clock.elapsedTime * 15;
        if (leg1.current) leg1.current.rotation.x = Math.sin(t) * 0.5;
        if (leg2.current) leg2.current.rotation.x = Math.sin(t + Math.PI) * 0.5;
        if (leg3.current) leg3.current.rotation.x = Math.sin(t + Math.PI) * 0.5;
        if (leg4.current) leg4.current.rotation.x = Math.sin(t) * 0.5;
    });

    return (
        <group ref={group}>
            <mesh position={[0, 0.5, 0]} castShadow geometry={bodyGeo}>
                <meshStandardMaterial color={color} />
            </mesh>
            <mesh position={[0, 0.8, 0.6]} castShadow geometry={headGeo}>
                <meshStandardMaterial color={color} />
            </mesh>
            <group position={[0.2, 0.2, 0.35]}>
                <mesh ref={leg1} position={[0, -0.2, 0]} geometry={legGeo}><meshStandardMaterial color="#222" /></mesh>
            </group>
            <group position={[-0.2, 0.2, 0.35]}>
                <mesh ref={leg2} position={[0, -0.2, 0]} geometry={legGeo}><meshStandardMaterial color="#222" /></mesh>
            </group>
            <group position={[0.2, 0.2, -0.35]}>
                <mesh ref={leg3} position={[0, -0.2, 0]} geometry={legGeo}><meshStandardMaterial color="#222" /></mesh>
            </group>
            <group position={[-0.2, 0.2, -0.35]}>
                <mesh ref={leg4} position={[0, -0.2, 0]} geometry={legGeo}><meshStandardMaterial color="#222" /></mesh>
            </group>
        </group>
    )
});

const DamageNumbers: React.FC = () => {
    const floatingTexts = useGameStore(state => state.floatingTexts);
    return (
        <>
            {floatingTexts.map((ft) => (
                <group key={ft.id} position={ft.position}>
                    <Html center zIndexRange={[100, 0]}>
                        <FloatingTextInstance text={ft.text} color={ft.color} scale={ft.scale} isCritical={ft.isCritical} />
                    </Html>
                </group>
            ))}
        </>
    )
}

const FloatingTextInstance: React.FC<{ text: string, color: string, scale?: number, isCritical?: boolean }> = ({ text, color, scale = 1, isCritical }) => {
    const [active, setActive] = React.useState(false);
    const xOffset = React.useRef((Math.random() - 0.5) * 50);
    const yOffset = React.useRef(isCritical ? -150 : -100);

    useEffect(() => {
        const t = setTimeout(() => setActive(true), 50);
        return () => clearTimeout(t);
    }, []);

    return (
        <div 
            className={`font-black pointer-events-none select-none transition-all duration-1000 ease-out ${isCritical ? 'text-4xl' : 'text-2xl'}`}
            style={{ 
                color: color, 
                transform: `translate(${xOffset.current}px, ${active ? yOffset.current : 0}px) scale(${active ? 0.5 * scale : 1 * scale}) rotate(${isCritical ? (Math.random() * 20 - 10) : 0}deg)`,
                opacity: active ? 0 : 1,
                fontFamily: '"Roboto", sans-serif',
                textShadow: isCritical ? '0 0 10px rgba(255,0,0,0.8), -2px -2px 0 #000' : '-1px -1px 0 #000, 1px -1px 0 #000'
            }}
        >
            {text}
            {isCritical && <span className="block text-sm text-red-500 text-center">CRIT!</span>}
        </div>
    )
}

const EnemyInstance: React.FC<{ data: any }> = React.memo(({ data }) => {
    const groupRef = useRef<THREE.Group>(null);
    const targetRingRef = useRef<THREE.Mesh>(null);
    
    const [visible, setVisible] = useState(true);
    const [showLabel, setShowLabel] = useState(true);
    const [isMoving, setIsMoving] = useState(false);
    
    const targetId = useGameStore(s => s.targetId);
    const setTarget = useGameStore(s => s.setTarget);
    const interactWithNpc = useGameStore(s => s.interactWithNpc);
    const isTargeted = targetId === data.id;

    // Use a ref for last position to calculate movement without state spam
    const lastPos = useRef(new THREE.Vector3(data.position[0], data.position[1], data.position[2]));

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Culling Check
        const cameraPos = state.camera.position;
        const currentPos = groupRef.current.position;
        const distSq = cameraPos.distanceToSquared(currentPos);

        const shouldBeVisible = distSq < (MESH_CULL_DISTANCE * MESH_CULL_DISTANCE);
        if (visible !== shouldBeVisible) {
            groupRef.current.visible = shouldBeVisible;
            setVisible(shouldBeVisible);
        }
        
        if (!shouldBeVisible) return;
        
        setShowLabel(distSq < (LABEL_CULL_DISTANCE * LABEL_CULL_DISTANCE));

        if (!data.isDead) {
             const targetX = data.position[0];
             const targetZ = data.position[2];
             
             if (data.type === 'enemy') {
                // Interpolate position for smoothness
                lastPos.current.x = THREE.MathUtils.lerp(lastPos.current.x, targetX, delta * 10);
                lastPos.current.z = THREE.MathUtils.lerp(lastPos.current.z, targetZ, delta * 10);
                
                // Detect Movement locally
                const distMovedSq = (targetX - lastPos.current.x)**2 + (targetZ - lastPos.current.z)**2;
                setIsMoving(distMovedSq > 0.0001); // Epsilon

                groupRef.current.position.set(lastPos.current.x, 0, lastPos.current.z);

                // Smooth Rotation
                let targetRot = data.rotationY;
                let currentRot = groupRef.current.rotation.y;
                while (targetRot > Math.PI) targetRot -= Math.PI * 2;
                while (targetRot < -Math.PI) targetRot += Math.PI * 2;
                while (currentRot > Math.PI) currentRot -= Math.PI * 2;
                while (currentRot < -Math.PI) currentRot += Math.PI * 2;
                let diff = targetRot - currentRot;
                while (diff > Math.PI) diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;
                groupRef.current.rotation.y += diff * 10 * delta;

             } else {
                groupRef.current.position.set(targetX, 0, targetZ);
                groupRef.current.rotation.y = data.rotationY || 0;
             }
             
             if (targetRingRef.current) targetRingRef.current.rotation.z += delta * 2;
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
            position={[data.position[0], 0, data.position[2]]}
            onClick={(e) => { 
                e.stopPropagation(); 
                setTarget(data.id);
                if (isNpc) interactWithNpc(data.id);
            }}
            scale={[scale, scale, scale]}
        >
            {isTargeted && visible && (
                <mesh ref={targetRingRef} position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]} geometry={ringGeo}>
                    <meshBasicMaterial color={isNpc ? "#00ff00" : "#ff0000"} transparent opacity={0.8} side={THREE.DoubleSide} />
                </mesh>
            )}

            {showLabel && (
                <Html position={[0, 2.2, 0]} center>
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

            <group>
                {isMetin ? (
                    <mesh position={[0, 1, 0]} geometry={metinGeo}>
                        <meshStandardMaterial color="#2a0a0a" roughness={0.4} emissive="#500" emissiveIntensity={0.3} />
                        <pointLight color="#f00" intensity={1.5} distance={6} />
                    </mesh>
                ) : isNpc ? (
                     <HumanoidBody color={npcColor} isMoving={false} isAttacking={false} />
                ) : (
                    <QuadrupedBody color={data.color} scale={1} isMoving={isMoving} />
                )}
            </group>
            
            {isNpc && visible && (
                <pointLight color={npcColor} distance={3} intensity={0.5} position={[0, 2, 0]} />
            )}
        </group>
    );
});

export const Enemies: React.FC = () => {
  const enemies = useGameStore((state) => state.enemies);
  const playerPosition = useGameStore((state) => state.playerPosition);

  // Virtualization: Only render React components for enemies within range
  const visibleEnemies = useMemo(() => {
      return enemies.filter(e => {
          const dx = e.position[0] - playerPosition[0];
          const dz = e.position[2] - playerPosition[2];
          return (dx*dx + dz*dz) < (RENDER_DISTANCE * RENDER_DISTANCE);
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
