
import React, { useMemo } from 'react';
import { useGameStore } from '../store';
import * as THREE from 'three';
import { Instance, Instances } from '@react-three/drei';

const WallSegment: React.FC<{ position: [number, number, number], rotation?: [number, number, number], width?: number, height?: number }> = ({ position, rotation = [0,0,0], width = 10, height = 4 }) => {
    return (
        <group position={position} rotation={rotation}>
            {/* Main Wall */}
            <mesh position={[0, height/2, 0]} castShadow receiveShadow>
                <boxGeometry args={[width, height, 1, 4, 4, 4]} />
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
                <boxGeometry args={[10, 1, 1.5, 8, 2, 2]} />
                <meshStandardMaterial color="#4a4a4a" />
            </mesh>
            {/* Wood Door */}
            <mesh position={[0, 2.5, 0]}>
                <planeGeometry args={[7, 5, 4, 4]} />
                <meshStandardMaterial color="#3e2723" side={THREE.DoubleSide} transparent opacity={0.3} />
            </mesh>
        </group>
    )
}

const Bridge: React.FC<{ position: [number, number, number], rotation?: [number, number, number] }> = ({ position, rotation }) => {
    return (
        <group position={position} rotation={rotation}>
            <mesh castShadow receiveShadow>
                <boxGeometry args={[15, 0.5, 8, 10, 1, 5]} />
                <meshStandardMaterial color="#5d4037" />
            </mesh>
            {/* Rails */}
            <mesh position={[0, 1, 3.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 15, 16]} />
                <meshStandardMaterial color="#3e2723" />
            </mesh>
            <mesh position={[0, 1, -3.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 15, 16]} />
                <meshStandardMaterial color="#3e2723" />
            </mesh>
             {/* Posts */}
             <mesh position={[7, 0.5, 3.5]}><cylinderGeometry args={[0.2, 0.2, 1.5, 16]} /><meshStandardMaterial color="#3e2723" /></mesh>
             <mesh position={[-7, 0.5, 3.5]}><cylinderGeometry args={[0.2, 0.2, 1.5, 16]} /><meshStandardMaterial color="#3e2723" /></mesh>
             <mesh position={[7, 0.5, -3.5]}><cylinderGeometry args={[0.2, 0.2, 1.5, 16]} /><meshStandardMaterial color="#3e2723" /></mesh>
             <mesh position={[-7, 0.5, -3.5]}><cylinderGeometry args={[0.2, 0.2, 1.5, 16]} /><meshStandardMaterial color="#3e2723" /></mesh>
        </group>
    )
}

const StreetLamp: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    const gameTime = useGameStore(state => state.gameTime);
    const isNight = gameTime < 6 || gameTime > 19;

    return (
        <group position={position}>
            <mesh position={[0, 2, 0]} castShadow>
                <cylinderGeometry args={[0.1, 0.15, 4, 16]} />
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

const GrassField: React.FC = () => {
    const grassCount = 8000; 
    
    const grassData = useMemo(() => {
        const data = [];
        for (let i = 0; i < grassCount; i++) {
             const r = 50 + Math.random() * 600; 
             const theta = Math.random() * Math.PI * 2;
             const x = r * Math.cos(theta);
             const z = r * Math.sin(theta);
             
             if (z > -80 && z < -40 && Math.abs(x) < 100) continue;
             
             data.push({ position: [x, 0, z], rotation: [0, Math.random() * Math.PI, 0], scale: 0.5 + Math.random() * 0.5 });
        }
        return data;
    }, []);

    return (
        <Instances range={grassCount}>
            <planeGeometry args={[1, 1, 1, 1]} /> 
            <meshStandardMaterial color="#2e7d32" side={THREE.DoubleSide} />
            {grassData.map((d: any, i) => (
                <Instance key={i} position={d.position as any} rotation={d.rotation as any} scale={[d.scale, d.scale * 2, d.scale]} />
            ))}
        </Instances>
    )
}

const TreeInstances: React.FC<{ data: any[] }> = ({ data }) => {
    return (
      <group>
        {/* Trunk */}
        <Instances range={data.length} castShadow receiveShadow>
          <cylinderGeometry args={[0.2, 0.4, 2, 8]} />
          <meshStandardMaterial color="#3e2723" />
          {data.map((t, i) => (
              <Instance key={`trunk-${i}`} position={[t.position[0], t.position[1] + 1 * t.scale, t.position[2]]} scale={[t.scale, t.scale, t.scale]} />
          ))}
        </Instances>
        {/* Lower Leaves */}
        <Instances range={data.length} castShadow receiveShadow>
          <coneGeometry args={[1.5, 4, 8]} />
          <meshStandardMaterial color="#1b5e20" />
          {data.map((t, i) => (
               <Instance key={`leaf1-${i}`} position={[t.position[0], t.position[1] + 3 * t.scale, t.position[2]]} scale={[t.scale, t.scale, t.scale]} />
          ))}
        </Instances>
        {/* Upper Leaves */}
        <Instances range={data.length} castShadow receiveShadow>
          <coneGeometry args={[1.2, 3, 8]} />
          <meshStandardMaterial color="#2e7d32" />
          {data.map((t, i) => (
               <Instance key={`leaf2-${i}`} position={[t.position[0], t.position[1] + 4 * t.scale, t.position[2]]} scale={[t.scale, t.scale, t.scale]} />
          ))}
        </Instances>
      </group>
    )
}

const RockInstances: React.FC<{ data: any[] }> = ({ data }) => {
    return (
        <Instances range={data.length} castShadow receiveShadow>
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial color="#555" roughness={0.9} />
            {data.map((r, i) => (
                <Instance key={i} position={r.position} scale={[r.scale, r.scale*0.8, r.scale]} rotation={[Math.random(), Math.random(), Math.random()]} />
            ))}
        </Instances>
    )
}

const BushInstances: React.FC<{ data: any[] }> = ({ data }) => {
    return (
        <Instances range={data.length} castShadow>
             <sphereGeometry args={[0.7, 8, 8]} />
             <meshStandardMaterial color="#2e7d32" />
             {data.map((b, i) => (
                 <Instance key={i} position={b.position} scale={[1, 0.7, 1]} />
             ))}
        </Instances>
    )
}

const MountainRange: React.FC = () => {
    const mountains = useMemo(() => {
        const m = [];
        for (let i = 0; i < 60; i++) {
            const angle = (i / 60) * Math.PI * 2;
            const r = 900 + Math.random() * 200;
            const x = Math.cos(angle) * r;
            const z = Math.sin(angle) * r;
            const height = 100 + Math.random() * 150;
            const width = 150 + Math.random() * 100;
            m.push({ pos: [x, height/2 - 10, z], args: [width, height, 8] });
        }
        for (let i = 0; i < 20; i++) {
            const x = (Math.random() - 0.5) * 1600;
            const z = (Math.random() - 0.5) * 1600;
            if (Math.sqrt(x*x + z*z) < 300) continue; 
            const height = 40 + Math.random() * 60;
            const width = 60 + Math.random() * 60;
            m.push({ pos: [x, height/2 - 5, z], args: [width, height, 5] });
        }
        return m;
    }, []);

    // Instancing not strictly necessary for mountains as they are few and large, but efficient enough as meshes.
    // Keeping as meshes for simplicity of non-uniform geometry args, although could be scaled cones.
    // Let's optimize by merging if possible, but map is fine.
    
    return (
        <group>
            {mountains.map((m: any, i) => (
                <mesh key={i} position={m.pos as any} castShadow receiveShadow>
                    <coneGeometry args={m.args as any} />
                    <meshStandardMaterial color="#4a3b32" roughness={0.9} />
                </mesh>
            ))}
        </group>
    )
}

export const World: React.FC = () => {
  const { trees, rocks, bushes } = useMemo(() => {
      const _trees = [];
      const _rocks = [];
      const _bushes = [];
      
      const MAP_SIZE = 2000; 
      
      for(let i=0; i<800; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 60 + Math.random() * MAP_SIZE; 
          const x = Math.sin(angle) * radius;
          const z = Math.cos(angle) * radius;
          
          if (z > -80 && z < -40) continue;

          _trees.push({ 
              id: i, 
              position: [x, 0, z] as [number,number,number], 
              scale: 1 + Math.random() * 1.5
          });
      }
      
      for(let i=0; i<400; i++) {
          const x = (Math.random() - 0.5) * 3000;
          const z = (Math.random() - 0.5) * 3000;
           if (Math.abs(x) < 50 && Math.abs(z) < 50) continue;
           
          _rocks.push({ id: i, position: [x, 0, z] as [number,number,number], scale: 0.5 + Math.random() * 4 });
          _bushes.push({ id: i, position: [x + 2, 0, z + 2] as [number,number,number] });
      }

      return { trees: _trees, rocks: _rocks, bushes: _bushes };
  }, []);

  return (
    <group>
      {/* Terrain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[5000, 5000, 256, 256]} /> {/* Reduced segments from 512 to 256 */}
        <meshStandardMaterial color="#2d4c1e" roughness={1} />
      </mesh>

      <MountainRange />
      <GrassField />

      {/* Village Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <circleGeometry args={[35, 64]} />
          <meshStandardMaterial color="#757575" roughness={0.8} />
      </mesh>

      {/* Safe Zone */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[34, 35, 64]} />
          <meshStandardMaterial color="#cfb53b" emissive="#cfb53b" emissiveIntensity={0.5} />
      </mesh>

      <Gate position={[0, 0, -35]} />
      <WallSegment position={[15, 0, -35]} width={20} />
      <WallSegment position={[-15, 0, -35]} width={20} />
      
      <Gate position={[0, 0, 35]} />
      <WallSegment position={[15, 0, 35]} width={20} />
      <WallSegment position={[-15, 0, 35]} width={20} />
      
      <Gate position={[35, 0, 0]} rotation={[0, Math.PI/2, 0]} />
      <WallSegment position={[35, 0, 15]} width={20} rotation={[0, Math.PI/2, 0]} />
      <WallSegment position={[35, 0, -15]} width={20} rotation={[0, Math.PI/2, 0]} />

      <WallSegment position={[-35, 0, 0]} width={70} rotation={[0, Math.PI/2, 0]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -50]}>
          <planeGeometry args={[5000, 35, 64, 4]} />
          <meshStandardMaterial color="#1e88e5" roughness={0.1} metalness={0.3} />
      </mesh>
      
      <Bridge position={[0, 0.2, -50]} rotation={[0, Math.PI/2, 0]} />
      <Bridge position={[60, 0.2, -50]} rotation={[0, Math.PI/2, 0]} />
      <Bridge position={[-60, 0.2, -50]} rotation={[0, Math.PI/2, 0]} />

      <mesh position={[0, 2, 0]} castShadow>
          <cylinderGeometry args={[2, 2.5, 4, 32]} />
          <meshStandardMaterial color="#4e342e" />
      </mesh>
      <StreetLamp position={[10, 0, 10]} />
      <StreetLamp position={[-10, 0, 10]} />
      <StreetLamp position={[10, 0, -10]} />
      <StreetLamp position={[-10, 0, -10]} />

      {/* Instanced Props */}
      <TreeInstances data={trees} />
      <RockInstances data={rocks} />
      <BushInstances data={bushes} />

    </group>
  );
};
