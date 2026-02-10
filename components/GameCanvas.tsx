import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sky, Stars, Environment } from '@react-three/drei';
import { World } from './World';
import { Player } from './Player';
import { Enemies } from './Enemies';
import { useGameStore } from '../store';
import * as THREE from 'three';

const GameLoop: React.FC = () => {
    const tickGame = useGameStore((state) => state.tickGame);
    useFrame((_, delta) => {
        const limitedDelta = Math.min(delta, 0.1);
        tickGame(limitedDelta);
    });
    return null;
}

const DayNightCycle: React.FC = () => {
    const gameTime = useGameStore(state => state.gameTime);
    const sunRef = useRef<THREE.DirectionalLight>(null);
    const ambientRef = useRef<THREE.AmbientLight>(null);
    
    useFrame(() => {
        const angle = ((gameTime - 6) / 24) * Math.PI * 2;
        const radius = 300; 
        const sunX = Math.cos(angle) * radius;
        const sunY = Math.sin(angle) * radius;
        const sunZ = 50; 

        if (sunRef.current) {
            sunRef.current.position.set(sunX, sunY, sunZ);
            sunRef.current.intensity = Math.max(0, Math.sin(angle)) * 3.5; // Stronger sun
            
            // Redden sun at sunset/sunrise
            if (sunY < 50 && sunY > 0) {
                 sunRef.current.color.setHSL(0.1, 0.8, 0.6);
            } else {
                 sunRef.current.color.setHSL(0.1, 0.1, 0.95);
            }
        }

        if (ambientRef.current) {
            const t = (Math.sin(angle) + 1) / 2;
            ambientRef.current.intensity = 0.3 + (t * 0.4);
        }
    });

    return (
        <>
            <directionalLight 
                ref={sunRef}
                castShadow 
                shadow-mapSize={[4096, 4096]}
                shadow-camera-left={-100}
                shadow-camera-right={100}
                shadow-camera-top={100}
                shadow-camera-bottom={-100}
                shadow-bias={-0.0005}
            />
            <ambientLight ref={ambientRef} intensity={0.5} />
            <Sky sunPosition={[0, 0, 0]} inclination={0.6} azimuth={0.25} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </>
    )
}

export const GameCanvas: React.FC = () => {
    return (
        <Canvas shadows camera={{ position: [0, 10, 15], fov: 50 }}>
            <GameLoop />
            <DayNightCycle />
            <fog attach="fog" args={['#a0a0a0', 30, 150]} />
            <World />
            <Player />
            <Enemies />
            <Environment preset="forest" background={false} />
        </Canvas>
    );
};