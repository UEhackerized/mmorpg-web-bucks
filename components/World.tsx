
import React, { useMemo } from 'react';
import { useGameStore } from '../store';
import * as THREE from 'three';
import { Instance, Instances, RoundedBox, useTexture } from '@react-three/drei';

// --- Procedural Texture Generator ---
// Gerçek texture dosyaları yüklemeden yüksek detaylı "Noise" dokusu üretir.
const useProceduralTexture = (color: string, noiseScale: number = 1) => {
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = color;
            ctx.fillRect(0,0,512,512);
            // Noise
            for(let i=0; i<40000; i++) {
                ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.15})`;
                const x = Math.random() * 512;
                const y = Math.random() * 512;
                const s = Math.random() * 2 * noiseScale;
                ctx.fillRect(x,y,s,s);
                
                ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.15})`;
                const x2 = Math.random() * 512;
                const y2 = Math.random() * 512;
                const s2 = Math.random() * 2 * noiseScale;
                ctx.fillRect(x2,y2,s2,s2);
            }
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    }, [color, noiseScale]);
    return texture;
}

const WallSegment: React.FC<{ position: [number, number, number], rotation?: [number, number, number], width?: number, height?: number }> = ({ position, rotation = [0,0,0], width = 10, height = 4 }) => {
    const stoneTex = useProceduralTexture('#5a5a5a', 2);
    
    return (
        <group position={position} rotation={rotation}>
            <mesh position={[0, height/2, 0]} castShadow receiveShadow>
                <boxGeometry args={[width, height, 1.2]} />
                <meshStandardMaterial 
                    map={stoneTex} 
                    roughness={0.9} 
                    bumpMap={stoneTex} 
                    bumpScale={0.1}
                    color="#666"
                />
            </mesh>
            {Array.from({ length: Math.floor(width / 2) }).map((_, i) => (
                <mesh key={i} position={[-width/2 + 1 + (i * 2), height + 0.5, 0]} castShadow>
                    <boxGeometry args={[1, 1, 1.2]} />
                    <meshStandardMaterial map={stoneTex} roughness={0.9} color="#666" />
                </mesh>
            ))}
        </group>
    )
}

const Gate: React.FC<{ position: [number, number, number], rotation?: [number, number, number] }> = ({ position, rotation = [0,0,0] }) => {
    const woodTex = useProceduralTexture('#3e2723', 0.5);
    return (
        <group position={position} rotation={rotation}>
            <WallSegment position={[-6, 0, 0]} width={5} height={6} />
            <WallSegment position={[6, 0, 0]} width={5} height={6} />
            <mesh position={[0, 5, 0]} castShadow receiveShadow>
                <boxGeometry args={[10, 1, 1.8]} />
                <meshStandardMaterial color="#4a4a4a" roughness={0.8} />
            </mesh>
            <mesh position={[0, 2.5, 0]}>
                <planeGeometry args={[7, 5]} />
                <meshStandardMaterial map={woodTex} side={THREE.DoubleSide} transparent opacity={0.6} />
            </mesh>
        </group>
    )
}

const Bridge: React.FC<{ position: [number, number, number], rotation?: [number, number, number] }> = ({ position, rotation }) => {
    const woodTex = useProceduralTexture('#5d4037', 1);
    return (
        <group position={position} rotation={rotation}>
            <mesh castShadow receiveShadow>
                <boxGeometry args={[15, 0.4, 8]} />
                <meshStandardMaterial map={woodTex} roughness={1} />
            </mesh>
            <mesh position={[0, 1, 3.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 15, 16]} />
                <meshStandardMaterial color="#3e2723" roughness={0.9} />
            </mesh>
            <mesh position={[0, 1, -3.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.2, 0.2, 15, 16]} />
                <meshStandardMaterial color="#3e2723" roughness={0.9} />
            </mesh>
        </group>
    )
}

const GrassField: React.FC = () => {
    const grassCount = 12000; 
    
    const grassData = useMemo(() => {
        const data = [];
        for (let i = 0; i < grassCount; i++) {
             const r = 50 + Math.random() * 600; 
             const theta = Math.random() * Math.PI * 2;
             const x = r * Math.cos(theta);
             const z = r * Math.sin(theta);
             if (z > -80 && z < -40 && Math.abs(x) < 100) continue;
             data.push({ position: [x, 0, z], rotation: [0, Math.random() * Math.PI, 0], scale: 0.5 + Math.random() * 0.8 });
        }
        return data;
    }, []);

    // Blade of grass geometry (more realistic than plane)
    // Simple triangle roughly
    const shape = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(0,0);
        shape.lineTo(0.1, 0);
        shape.lineTo(0.05, 1); // Tip
        shape.lineTo(0,0);
        return shape;
    }, []);

    return (
        <Instances range={grassCount}>
            <planeGeometry args={[0.8, 0.8]} /> 
            {/* Alpha map usage simulation with color variation */}
            <meshStandardMaterial 
                color="#4a6b2f" 
                side={THREE.DoubleSide} 
                roughness={1}
            />
            {grassData.map((d: any, i) => (
                <Instance key={i} position={d.position as any} rotation={d.rotation as any} scale={[d.scale, d.scale, d.scale]} color={Math.random() > 0.5 ? "#3a5b25" : "#4a6b2f"} />
            ))}
        </Instances>
    )
}

const TreeInstances: React.FC<{ data: any[] }> = ({ data }) => {
    return (
      <group>
        <Instances range={data.length} castShadow receiveShadow>
          <cylinderGeometry args={[0.3, 0.5, 2.5, 7]} />
          <meshStandardMaterial color="#3e2723" roughness={1} />
          {data.map((t, i) => (
              <Instance key={`trunk-${i}`} position={[t.position[0], t.position[1] + 1.25 * t.scale, t.position[2]]} scale={[t.scale, t.scale, t.scale]} />
          ))}
        </Instances>
        {/* Daha organik yapraklar için Icosahedron */}
        <Instances range={data.length} castShadow receiveShadow>
          <icosahedronGeometry args={[2, 0]} />
          <meshStandardMaterial color="#1b5e20" roughness={0.8} />
          {data.map((t, i) => (
               <Instance key={`leaf1-${i}`} position={[t.position[0], t.position[1] + 4 * t.scale, t.position[2]]} scale={[t.scale, t.scale, t.scale]} />
          ))}
        </Instances>
      </group>
    )
}

const RockInstances: React.FC<{ data: any[] }> = ({ data }) => {
    return (
        <Instances range={data.length} castShadow receiveShadow>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#666" roughness={0.7} metalness={0.1} />
            {data.map((r, i) => (
                <Instance key={i} position={r.position} scale={[r.scale, r.scale*0.7, r.scale]} rotation={[Math.random(), Math.random(), Math.random()]} />
            ))}
        </Instances>
    )
}

const Ground: React.FC<{ onClick: (e: any) => void }> = ({ onClick }) => {
    // Toprak ve Çimen karışımı texture
    const groundTex = useProceduralTexture('#2d4c1e', 3);
    groundTex.repeat.set(100, 100);

    return (
        <mesh 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, -0.05, 0]} 
            receiveShadow
            onClick={onClick}
        >
            <planeGeometry args={[2000, 2000, 256, 256]} />
            <meshStandardMaterial 
                map={groundTex}
                color="#444" // Daha koyu, atmosferik
                roughness={1}
                metalness={0}
                bumpMap={groundTex}
                bumpScale={0.5}
            />
        </mesh>
    )
}

const VillageFloor: React.FC<{ onClick: (e: any) => void }> = ({ onClick }) => {
    const pavingTex = useProceduralTexture('#555', 1);
    pavingTex.repeat.set(10, 10);
    
    return (
         <mesh 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[0, 0.01, 0]} 
            receiveShadow
            onClick={onClick}
        >
            <circleGeometry args={[35, 64]} />
            <meshStandardMaterial 
                map={pavingTex}
                roughness={0.8}
                bumpMap={pavingTex}
                bumpScale={0.2}
                color="#777"
            />
        </mesh>
    )
}

export const World: React.FC = () => {
  const { trees, rocks, bushes } = useMemo(() => {
      const _trees = [];
      const _rocks = [];
      const _bushes = [];
      const MAP_SIZE = 1500; 
      
      for(let i=0; i<600; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = 50 + Math.random() * MAP_SIZE; 
          const x = Math.sin(angle) * radius;
          const z = Math.cos(angle) * radius;
          if (z > -80 && z < -40) continue;
          _trees.push({ id: i, position: [x, 0, z] as [number,number,number], scale: 1.2 + Math.random() * 2 });
      }
      for(let i=0; i<300; i++) {
          const x = (Math.random() - 0.5) * 2000;
          const z = (Math.random() - 0.5) * 2000;
          if (Math.abs(x) < 40 && Math.abs(z) < 40) continue;
          _rocks.push({ id: i, position: [x, 0, z] as [number,number,number], scale: 1 + Math.random() * 5 });
      }
      return { trees: _trees, rocks: _rocks, bushes: _bushes };
  }, []);

  const setMoveDestination = useGameStore(s => s.setMoveDestination);
  const handleGroundClick = (e: any) => {
      e.stopPropagation();
      setMoveDestination([e.point.x, 0, e.point.z]);
  };

  return (
    <group>
      <Ground onClick={handleGroundClick} />
      <VillageFloor onClick={handleGroundClick} />

      {/* Safe Zone Ring - Glowing Hologram Style */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} onClick={handleGroundClick}>
          <ringGeometry args={[34, 34.5, 64]} />
          <meshBasicMaterial color="#ffd700" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
      </mesh>

      <Gate position={[0, 0, -35]} />
      <Gate position={[0, 0, 35]} />
      <Gate position={[35, 0, 0]} rotation={[0, Math.PI/2, 0]} />
      <Gate position={[-35, 0, 0]} rotation={[0, Math.PI/2, 0]} />

      <WallSegment position={[15, 0, -35]} width={20} />
      <WallSegment position={[-15, 0, -35]} width={20} />
      
      {/* Water Shader Simulation */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, -55]}>
          <planeGeometry args={[2000, 30, 64, 4]} />
          <meshStandardMaterial 
            color="#006994" 
            roughness={0.1} 
            metalness={0.8} 
            transparent 
            opacity={0.9} 
          />
      </mesh>
      
      <Bridge position={[0, 0.2, -55]} rotation={[0, Math.PI/2, 0]} />

      <GrassField />
      <TreeInstances data={trees} />
      <RockInstances data={rocks} />
    </group>
  );
};
