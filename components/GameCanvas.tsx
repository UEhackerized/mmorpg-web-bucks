import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky, Stars, Environment } from '@react-three/drei';
import { World } from './World';
import { Player } from './Player';
import { Enemies } from './Enemies';
import { useGameStore } from '../store';
import * as THREE from 'three';

const GameLoop: React.FC = () => {
    const tickGame = useGameStore((state) => state.tickGame);
    useFrame((_, delta) => {
        tickGame(delta);
    });
    return null;
}

const DayNightCycle: React.FC = () => {
    const gameTime = useGameStore(state => state.gameTime); // 0 - 24
    const { scene } = useThree();
    const sunRef = useRef<THREE.DirectionalLight>(null);
    const ambientRef = useRef<THREE.AmbientLight>(null);
    
    useFrame(() => {
        // Calculate Sun Position based on Time
        const angle = ((gameTime - 6) / 24) * Math.PI * 2;
        
        const radius = 500; // Increased radius for larger map
        const sunX = Math.cos(angle) * radius;
        const sunY = Math.sin(angle) * radius;
        const sunZ = 100; 

        if (sunRef.current) {
            sunRef.current.position.set(sunX, sunY, sunZ);
            
            const isDay = sunY > 0;
            let intensity = Math.max(0, Math.sin(angle));
            
            sunRef.current.intensity = intensity * 2.0;
            
            if (intensity < 0.3 && isDay) {
                sunRef.current.color.setHSL(0.08, 0.8, 0.6);
            } else {
                sunRef.current.color.setHSL(0.1, 0.1, 1.0);
            }
        }

        if (ambientRef.current) {
            const t = (Math.sin(angle) + 1) / 2;
            const dayColor = new THREE.Color('#e6f0ff');
            const nightColor = new THREE.Color('#0a0a20');
            ambientRef.current.color.lerpColors(nightColor, dayColor, t);
            ambientRef.current.intensity = 0.2 + (t * 0.6);
        }
        
        // Fog control - INCREASED DISTANCE for larger map
        if (scene.fog instanceof THREE.Fog) {
             const t = (Math.sin(angle) + 1) / 2;
             const dayFog = new THREE.Color('#d1e2e8');
             const nightFog = new THREE.Color('#050510');
             scene.fog.color.lerpColors(nightFog, dayFog, t);
             // Start at 20, End at 250 (Much further visibility)
             scene.fog.near = 20;
             scene.fog.far = 250 + (t * 150); 
        }
    });

    return (
        <>
            <directionalLight 
                ref={sunRef}
                castShadow 
                shadow-mapSize={[4096, 4096]} // Higher res shadows for bigger map
                shadow-camera-left={-200}
                shadow-camera-right={200}
                shadow-camera-top={200}
                shadow-camera-bottom={-200}
                shadow-bias={-0.0005}
            />
            <ambientLight ref={ambientRef} />
        </>
    )
}

export const GameCanvas: React.FC = () => {
  const spawnEnemies = useGameStore((state) => state.spawnEnemies);
  const resetGame = useGameStore((state) => state.resetGame);
  const gameTime = useGameStore((state) => state.gameTime);

  useEffect(() => {
    resetGame();
    spawnEnemies();
  }, [spawnEnemies, resetGame]);

  const angle = ((gameTime - 6) / 24) * Math.PI * 2;
  const sunPos = new THREE.Vector3(Math.cos(angle) * 500, Math.sin(angle) * 500, 100);

  return (
    <div className="w-full h-full bg-gray-900">
      <Canvas shadows camera={{ position: [0, 12, 12], fov: 50, far: 1000 }} gl={{ antialias: true }}>
        {/* Increased fog distance */}
        <fog attach="fog" args={['#d1e2e8', 30, 300]} />
        
        <DayNightCycle />
        
        <Sky sunPosition={sunPos} turbidity={0.5} rayleigh={gameTime > 6 && gameTime < 18 ? 0.5 : 0.1} distance={1000} />
        
        {(gameTime < 6 || gameTime > 18) && (
            <Stars radius={300} depth={100} count={10000} factor={6} saturation={0} fade speed={1} />
        )}
        
        <Environment preset="city" environmentIntensity={gameTime > 6 && gameTime < 18 ? 0.5 : 0.1} />

        <World />
        <Player />
        <Enemies />
        <GameLoop />
        
      </Canvas>
    </div>
  );
};