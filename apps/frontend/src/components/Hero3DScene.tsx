'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function FloatingShape({ position, color, speed = 1, scale = 1, type = 'box' }: { position: [number, number, number]; color: string; speed?: number; scale?: number; type?: 'box' | 'sphere' | 'octahedron' | 'torus' }) {
  const ref = useRef<THREE.Mesh>(null);
  const randomOffset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * 0.3 * speed;
    ref.current.position.y = position[1] + Math.sin(t + randomOffset) * 0.4;
    ref.current.rotation.x = t * 0.2;
    ref.current.rotation.y = t * 0.3;
  });

  const Component = type === 'sphere' ? 'sphereGeometry' : type === 'octahedron' ? 'octahedronGeometry' : type === 'torus' ? 'torusGeometry' : 'boxGeometry';

  return (
    <Float speed={1.5 * speed} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={ref} position={position} scale={scale}>
        {type === 'sphere' ? <sphereGeometry args={[1, 32, 32]} /> :
         type === 'octahedron' ? <octahedronGeometry args={[1, 0]} /> :
         type === 'torus' ? <torusGeometry args={[0.8, 0.3, 16, 32]} /> :
         <boxGeometry args={[1, 1, 1]} />}
        <MeshDistortMaterial
          color={color}
          roughness={0.3}
          metalness={0.1}
          distort={0.15}
          speed={1.5}
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  );
}

function Shapes() {
  const shapes = useMemo(() => [
    { pos: [-4, 1, -2] as [number, number, number], color: '#6366f1', speed: 0.8, scale: 0.7, type: 'box' as const },
    { pos: [3, -0.5, -3] as [number, number, number], color: '#8b5cf6', speed: 1.2, scale: 0.5, type: 'sphere' as const },
    { pos: [-2, -1.5, -4] as [number, number, number], color: '#ec4899', speed: 0.6, scale: 0.6, type: 'octahedron' as const },
    { pos: [5, 1.5, -1] as [number, number, number], color: '#06b6d4', speed: 0.9, scale: 0.8, type: 'torus' as const },
    { pos: [0, -0.8, -5] as [number, number, number], color: '#6366f1', speed: 0.7, scale: 0.9, type: 'sphere' as const },
    { pos: [-5, -1, 0] as [number, number, number], color: '#a78bfa', speed: 1.0, scale: 0.4, type: 'box' as const },
    { pos: [6, -0.2, -2] as [number, number, number], color: '#f472b6', speed: 0.5, scale: 0.55, type: 'octahedron' as const },
    { pos: [-3, 2, -1] as [number, number, number], color: '#22d3ee', speed: 1.1, scale: 0.45, type: 'torus' as const },
  ], []);

  return (
    <group>
      {shapes.map((s, i) => (
        <FloatingShape key={i} position={s.pos} color={s.color} speed={s.speed} scale={s.scale} type={s.type} />
      ))}
    </group>
  );
}

function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 45 }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} color="#8b5cf6" />
      <Shapes />
    </Canvas>
  );
}

export default function Hero3DScene() {
  return <Scene />;
}
