import React, { useMemo } from 'react';
import { useGameStore } from '../store';
import * as THREE from 'three';

const WallSegment: React.FC<{ position: [number, number, number], rotation?: [number, number, number], width?: number, height?: number }> = ({ position, rotation = [0,0,0], width = 10, height = 4 }) => {
    return (
        <group position={position} rotation={rotation}>
            {/* Main Wall */}
            <mesh position={[0, height/2, 0]} castShadow receiveShadow>
                <boxGeometry args={[width, height, 1]} />
                <meshStandardMaterial color="#5a5a5a" roughness={0.8} />
            </mesh>
            {/* Battlements */}
            {Array.from({ length: Math.floor(width / 2) }).map((_, i) => (
                <mesh key={i} position={[-width/2 + 1 + (i * 2), height + 0.5, 0]} castShadow>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="#5a5a5a" roughness={0.8} />
                </mesh>
            ))}
        </group>
    )
}

const Gate: React.FC<{ position: [number, number, number], rotation?: [number, number, number] }> = ({ position, rotation = [0,0,0] }) => {
    return (
        <group position={position} rotation={rotation}>
            <WallSegment position={[-6, 0, 0]} width={5} height={6} />
            <WallSegment position={[6, 0, 0]} width={5} height={6} />
            {/* Arch */}
            <mesh position={[0, 5, 0]} castShadow>
                <boxGeometry args={[10, 1, 1.5]} />
                <meshStandardMaterial color="#4a4a4a" />
            </mesh>
            {/* Wood Door */}
            <mesh position={[0, 2.5, 0]}>
                <planeGeometry args={[7, 5]} />
                <meshStandardMaterial color="#3e2723" side={THREE.DoubleSide} transparent opacity={0.3} />
            </mesh>
        </group>
    )
}

const Bridge: React.FC<{ position: [number, number, number], rotation?: [number, number, number] }> = ({ position, rotation }) => {
    return (
        <group position={position} rotation={rotation}>
            <mesh castShadow receiveShadow>
                <boxGeometry args={[15, 0.5, 8]} />
                <meshStandardMaterial color="#5d4037" />
            </mesh>
            {/* Rails */}
            <mesh position={[0, 1, 3.5]}>
                <boxGeometry args={[15, 0.4, 0.4]} />
                <meshStandardMaterial color="#3e2723" />
            </mesh>
            <mesh position={[0, 1, -3.5]}>
                <boxGeometry args={[15, 0.4, 0.4]} />
                <meshStandardMaterial color="#3e2723" />
            </mesh>
             {/* Posts */}
             <mesh position={[7, 0.5, 3.5]}><boxGeometry args={[0.5, 1, 0.5]} /><meshStandardMaterial color="#3e2723" /></mesh>
             <mesh position={[-7, 0.5, 3.5]}><boxGeometry args={[0.5, 1, 0.5]} /><meshStandardMaterial color="#3e2723" /></mesh>
             <mesh position={[7, 0.5, -3.5]}><boxGeometry args={[0.5, 1, 0.5]} /><meshStandardMaterial color="#3e2723" /></mesh>
             <mesh position={[-7, 0.5, -3.5]}><boxGeometry args={[0.5, 1, 0.5]} /><meshStandardMaterial color="#3e2723" /></mesh>
        </group>
    )
}

const StreetLamp: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    const gameTime = useGameStore(state => state.gameTime);
    const isNight = gameTime < 6 || gameTime > 19;

    return (
        <group position={position}>
            <mesh position={[0, 2, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.15, 4]} />
                <meshStandardMaterial color="#2a2a2a" />
            </mesh>
            <mesh position={[0, 4, 0]}>
                <boxGeometry args={[0.6, 0.8, 0.6]} />
                <meshStandardMaterial color="#444" emissive={isNight ? "#ffaa00" : "#000"} emissiveIntensity={isNight ? 1 : 0} />
            </mesh>
            {isNight && <pointLight position={[0, 3.8, 0]} color="#ffaa00" intensity={3} distance={10} decay={2} />}
        </group>
    )
}

export const World: React.FC = () => {
  const { trees, rocks, bushes } = useMemo(() => {
      const _trees = [];
      const _rocks = [];
      const _bushes = [];
      
      // Generating a much larger forest area
      // We skip the center (Village) area: roughly -50 to 50 X/Z
      
      const MAP_SIZE = 1200; // Half size (Range -1200 to 1200)
      
      for(let i=0; i<600; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 60 + Math.random() * MAP_SIZE; // Start after village
          const x = Math.sin(angle) * radius;
          const z = Math.cos(angle) * radius;
          
          // Don't spawn on river (approx Z = -50 to -70)
          if (z > -80 && z < -40) continue;

          _trees.push({ 
              id: i, 
              position: [x, 0, z] as [number,number,number], 
              scale: 1 + Math.random() * 1.5
          });
      }
      
      for(let i=0; i<200; i++) {
          const x = (Math.random() - 0.5) * 2000;
          const z = (Math.random() - 0.5) * 2000;
           if (Math.abs(x) < 50 && Math.abs(z) < 50) continue; // Skip village
           
          _rocks.push({ id: i, position: [x, 0, z] as [number,number,number], scale: 0.5 + Math.random() * 2 });
          _bushes.push({ id: i, position: [x + 2, 0, z + 2] as [number,number,number] });
      }

      return { trees: _trees, rocks: _rocks, bushes: _bushes };
  }, []);

  return (
    <group>
      {/* --- TERRAIN SYSTEM --- */}
      
      {/* Main Green Plane (Grass) - HUGE MAP */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[2400, 2400, 128, 128]} />
        <meshStandardMaterial color="#3a5f2d" roughness={1} />
      </mesh>

      {/* Village Floor (Stone) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <circleGeometry args={[35, 64]} />
          <meshStandardMaterial color="#757575" roughness={0.8} />
      </mesh>

      {/* Safe Zone Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[34, 35, 64]} />
          <meshStandardMaterial color="#cfb53b" emissive="#cfb53b" emissiveIntensity={0.5} />
      </mesh>

      {/* --- CITY WALLS & GATES --- */}
      
      {/* North Gate */}
      <Gate position={[0, 0, -35]} />
      <WallSegment position={[15, 0, -35]} width={20} />
      <WallSegment position={[-15, 0, -35]} width={20} />
      
      {/* South Gate */}
      <Gate position={[0, 0, 35]} />
      <WallSegment position={[15, 0, 35]} width={20} />
      <WallSegment position={[-15, 0, 35]} width={20} />
      
      {/* East Gate */}
      <Gate position={[35, 0, 0]} rotation={[0, Math.PI/2, 0]} />
      <WallSegment position={[35, 0, 15]} width={20} rotation={[0, Math.PI/2, 0]} />
      <WallSegment position={[35, 0, -15]} width={20} rotation={[0, Math.PI/2, 0]} />

      {/* West Wall (Closed) */}
      <WallSegment position={[-35, 0, 0]} width={70} rotation={[0, Math.PI/2, 0]} />

      {/* --- RIVER & BRIDGES --- */}
      
      {/* River (Blue Plane) - Extended for huge map */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -50]}>
          <planeGeometry args={[2400, 25]} />
          <meshStandardMaterial color="#1e88e5" roughness={0.1} metalness={0.1} />
      </mesh>
      
      <Bridge position={[0, 0.2, -50]} rotation={[0, Math.PI/2, 0]} />
      <Bridge position={[60, 0.2, -50]} rotation={[0, Math.PI/2, 0]} />
      <Bridge position={[-60, 0.2, -50]} rotation={[0, Math.PI/2, 0]} />

      {/* --- PROPS --- */}

      {/* Village Center Decor */}
      <mesh position={[0, 2, 0]} castShadow>
          <cylinderGeometry args={[2, 2.5, 4, 8]} />
          <meshStandardMaterial color="#4e342e" />
      </mesh>
      <StreetLamp position={[10, 0, 10]} />
      <StreetLamp position={[-10, 0, 10]} />
      <StreetLamp position={[10, 0, -10]} />
      <StreetLamp position={[-10, 0, -10]} />

      {trees.map((t) => (
         <group key={t.id} position={t.position} scale={[t.scale, t.scale, t.scale]}>
            <mesh position={[0, 1, 0]} castShadow>
                <cylinderGeometry args={[0.2, 0.4, 2, 6]} />
                <meshStandardMaterial color="#3e2723" />
            </mesh>
            <mesh position={[0, 3, 0]} castShadow>
                <coneGeometry args={[1.5, 4, 8]} />
                <meshStandardMaterial color="#1b5e20" />
            </mesh>
        </group>
      ))}
      
      {rocks.map(r => (
          <mesh key={r.id} position={r.position} scale={[r.scale, r.scale*0.7, r.scale]} castShadow>
              <dodecahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color="#555" />
          </mesh>
      ))}

      {bushes.map(b => (
          <mesh key={b.id} position={b.position} castShadow>
              <sphereGeometry args={[0.7, 7, 7]} />
              <meshStandardMaterial color="#2e7d32" />
          </mesh>
      ))}

    </group>
  );
};