
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useGameStore } from '../store';
import { Html, RoundedBox, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Loot } from './Loot';
import { HumanoidBody } from './Player';

const MESH_CULL_DISTANCE = 60; 
const LABEL_CULL_DISTANCE = 30; 
const RENDER_DISTANCE = 80; 

const ringGeo = new THREE.RingGeometry(1.0, 1.2, 32);

// Prosedürel Doku (Tekrar kullanım için, World.tsx'tekine benzer ama burada local)
const useEnemyTexture = (color: string) => {
    return useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        if(ctx) {
            ctx.fillStyle = color;
            ctx.fillRect(0,0,128,128);
            // Fur/Skin texture noise
            for(let i=0; i<500; i++) {
                ctx.fillStyle = `rgba(0,0,0,${Math.random()*0.1})`;
                ctx.fillRect(Math.random()*128, Math.random()*128, 2, 2);
            }
        }
        const tex = new THREE.CanvasTexture(canvas);
        return tex;
    }, [color]);
}

const MetinStoneVisual: React.FC = () => {
    const mesh = useRef<THREE.Mesh>(null);
    // Magma texture generation
    const magmaTex = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        if(ctx) {
            ctx.fillStyle = '#1a0505';
            ctx.fillRect(0,0,256,256);
            for(let i=0; i<300; i++) {
                const r = Math.floor(Math.random() * 255);
                ctx.fillStyle = `rgb(${r}, ${r/4}, 0)`;
                const s = Math.random() * 20;
                ctx.beginPath();
                ctx.arc(Math.random()*256, Math.random()*256, s, 0, Math.PI*2);
                ctx.fill();
            }
        }
        return new THREE.CanvasTexture(canvas);
    }, []);

    useFrame((state) => {
        if(mesh.current) {
            mesh.current.rotation.y += 0.01;
            mesh.current.rotation.z += 0.005;
            // Pulsing effect
            const s = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
            mesh.current.scale.set(s,s,s);
        }
    });

    return (
        <group>
            <mesh ref={mesh} position={[0, 1.5, 0]}>
                <dodecahedronGeometry args={[1.2, 1]} />
                <meshStandardMaterial 
                    map={magmaTex}
                    emissiveMap={magmaTex}
                    emissive="#ff4400"
                    emissiveIntensity={2}
                    color="#000"
                    roughness={0.4}
                    displacementMap={magmaTex}
                    displacementScale={0.2}
                />
            </mesh>
            <pointLight color="#ff2200" intensity={3} distance={10} decay={2} position={[0, 2, 0]} />
            {/* Dark smoke particles could go here */}
        </group>
    )
}

const QuadrupedBody: React.FC<{ color: string, scale: number, isMoving: boolean }> = React.memo(({ color, scale, isMoving }) => {
    const group = useRef<THREE.Group>(null);
    const leg1 = useRef<THREE.Group>(null);
    const leg2 = useRef<THREE.Group>(null);
    const leg3 = useRef<THREE.Group>(null);
    const leg4 = useRef<THREE.Group>(null);
    
    const skinTex = useEnemyTexture(color);

    useFrame((state) => {
        if (!isMoving) {
            if (group.current) group.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
            return;
        }
        const t = state.clock.elapsedTime * 15;
        if (leg1.current) leg1.current.rotation.x = Math.sin(t) * 0.6;
        if (leg2.current) leg2.current.rotation.x = Math.sin(t + Math.PI) * 0.6;
        if (leg3.current) leg3.current.rotation.x = Math.sin(t + Math.PI) * 0.6;
        if (leg4.current) leg4.current.rotation.x = Math.sin(t) * 0.6;
    });

    const mat = <meshStandardMaterial map={skinTex} roughness={0.9} color={color} />;

    return (
        <group ref={group}>
            {/* Body */}
            <RoundedBox args={[0.5, 0.55, 1.1]} radius={0.1} smoothness={4} position={[0, 0.6, 0]} castShadow>
                {mat}
            </RoundedBox>
            
            {/* Head */}
            <group position={[0, 1.0, 0.6]}>
                 <RoundedBox args={[0.35, 0.35, 0.45]} radius={0.05} smoothness={4} castShadow>
                    {mat}
                </RoundedBox>
                {/* Ears */}
                <mesh position={[0.12, 0.2, 0]} rotation={[0,0,-0.2]}><coneGeometry args={[0.05, 0.2, 4]} />{mat}</mesh>
                <mesh position={[-0.12, 0.2, 0]} rotation={[0,0,0.2]}><coneGeometry args={[0.05, 0.2, 4]} />{mat}</mesh>
            </group>

            {/* Legs */}
            <group position={[0.2, 0.3, 0.4]} ref={leg1}>
                <RoundedBox args={[0.15, 0.6, 0.15]} radius={0.03} position={[0, -0.3, 0]} castShadow>{mat}</RoundedBox>
            </group>
            <group position={[-0.2, 0.3, 0.4]} ref={leg2}>
                <RoundedBox args={[0.15, 0.6, 0.15]} radius={0.03} position={[0, -0.3, 0]} castShadow>{mat}</RoundedBox>
            </group>
            <group position={[0.2, 0.3, -0.4]} ref={leg3}>
                <RoundedBox args={[0.15, 0.6, 0.15]} radius={0.03} position={[0, -0.3, 0]} castShadow>{mat}</RoundedBox>
            </group>
            <group position={[-0.2, 0.3, -0.4]} ref={leg4}>
                <RoundedBox args={[0.15, 0.6, 0.15]} radius={0.03} position={[0, -0.3, 0]} castShadow>{mat}</RoundedBox>
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
                fontFamily: '"Cinzel", serif',
                textShadow: '0 0 5px #000'
            }}
        >
            {text}
            {isCritical && <span className="block text-sm text-red-500 text-center font-bold">CRIT!</span>}
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

    const lastPos = useRef(new THREE.Vector3(data.position[0], data.position[1], data.position[2]));

    useFrame((state, delta) => {
        if (!groupRef.current) return;
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
                lastPos.current.x = THREE.MathUtils.lerp(lastPos.current.x, targetX, delta * 8);
                lastPos.current.z = THREE.MathUtils.lerp(lastPos.current.z, targetZ, delta * 8);
                
                const distMovedSq = (targetX - lastPos.current.x)**2 + (targetZ - lastPos.current.z)**2;
                setIsMoving(distMovedSq > 0.0001);

                groupRef.current.position.set(lastPos.current.x, 0, lastPos.current.z);

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
                    <meshBasicMaterial color={isNpc ? "#00ff00" : "#ff0000"} transparent opacity={0.6} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
                </mesh>
            )}

            {showLabel && (
                <Html position={[0, isMetin ? 3 : 2.2, 0]} center>
                    <div className="flex flex-col items-center pointer-events-none select-none">
                        <span className={`text-[10px] font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] whitespace-nowrap ${isNpc ? 'text-[#ffd700]' : isMetin ? 'text-purple-300' : isTargeted ? 'text-red-500 scale-125 transition-transform' : 'text-red-300'}`}>
                            {isNpc ? data.name : `Lv.${data.level} ${data.name}`}
                        </span>
                        {!isNpc && (
                            <div className={`w-12 h-1 bg-black/50 border border-gray-600 mt-1 ${isMetin ? 'w-20 h-1.5' : ''}`}>
                                <div 
                                    className="h-full bg-gradient-to-r from-red-800 to-red-500 transition-all duration-200" 
                                    style={{ width: `${(data.hp / data.maxHp) * 100}%` }}
                                />
                            </div>
                        )}
                    </div>
                </Html>
            )}

            <group>
                {isMetin ? (
                    <MetinStoneVisual />
                ) : isNpc ? (
                     <HumanoidBody color={npcColor} isMoving={false} isAttacking={false} />
                ) : (
                    <QuadrupedBody color={data.color} scale={1} isMoving={isMoving} />
                )}
            </group>
        </group>
    );
});

export const Enemies: React.FC = () => {
  const enemies = useGameStore((state) => state.enemies);
  const playerPosition = useGameStore((state) => state.playerPosition);

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
