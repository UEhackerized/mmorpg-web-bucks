
import React, { useRef, useState } from 'react';
import { useGameStore } from '../store';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const LOOT_CULL_DISTANCE = 50;

const LootItem: React.FC<{ drop: any }> = ({ drop }) => {
    const ref = useRef<THREE.Group>(null);
    const { pickupDrop } = useGameStore();
    const [visible, setVisible] = useState(true);

    useFrame((state) => {
        if (!ref.current) return;

        // Culling logic
        const cameraPos = state.camera.position;
        const pos = ref.current.position;
        const distSq = (cameraPos.x - pos.x)**2 + (cameraPos.z - pos.z)**2;
        
        const shouldBeVisible = distSq < (LOOT_CULL_DISTANCE * LOOT_CULL_DISTANCE);
        
        if (visible !== shouldBeVisible) {
            ref.current.visible = shouldBeVisible;
            setVisible(shouldBeVisible);
        }

        if (!shouldBeVisible) return;

        ref.current.rotation.y += 0.02;
        ref.current.position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2 + drop.timestamp) * 0.2;
    });

    const isGold = drop.type === 'yang';
    const itemName = isGold ? `${drop.value} Yang` : drop.item?.name;
    const color = isGold ? '#ffd700' : '#00ff00';

    return (
        <group 
            ref={ref} 
            position={drop.position} 
            onClick={(e) => { e.stopPropagation(); pickupDrop(drop.id); }}
            onPointerEnter={() => document.body.style.cursor = 'pointer'}
            onPointerLeave={() => document.body.style.cursor = 'auto'}
        >
            <mesh castShadow>
                {isGold ? (
                    <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
                ) : (
                    <boxGeometry args={[0.3, 0.3, 0.3]} />
                )}
                <meshStandardMaterial 
                    color={color} 
                    emissive={color} 
                    emissiveIntensity={0.5} 
                    metalness={0.8} 
                    roughness={0.2} 
                />
            </mesh>
            {/* Light pillar for rare items? */}
            {!isGold && drop.item?.rarity !== 'normal' && visible && (
                 <pointLight color={color} intensity={1} distance={3} />
            )}
            
            {visible && (
                <Html position={[0, 0.5, 0]} center pointerEvents="none">
                    <div className={`text-[10px] font-bold drop-shadow-md whitespace-nowrap bg-black/60 px-1 rounded ${isGold ? 'text-yellow-300' : 'text-green-300'}`}>
                        {itemName}
                    </div>
                </Html>
            )}
        </group>
    )
}

export const Loot: React.FC = () => {
    const drops = useGameStore(state => state.drops);
    return (
        <>
            {drops.map(drop => <LootItem key={drop.id} drop={drop} />)}
        </>
    )
}
