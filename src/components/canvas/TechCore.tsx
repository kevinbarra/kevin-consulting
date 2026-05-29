'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function TechCore() {
  const innerMeshRef = useRef<THREE.Mesh>(null);
  const outerMeshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Slow elegant rotation in opposite directions
    if (innerMeshRef.current) {
      innerMeshRef.current.rotation.x = time * 0.1;
      innerMeshRef.current.rotation.y = time * 0.15;
    }
    if (outerMeshRef.current) {
      outerMeshRef.current.rotation.x = -time * 0.05;
      outerMeshRef.current.rotation.y = -time * 0.08;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Inner Torus Knot - Electric Blue */}
      <mesh ref={innerMeshRef} scale={[1, 1, 1]}>
        <torusKnotGeometry args={[8, 2.2, 100, 16]} />
        <meshStandardMaterial 
          color="#2563eb" 
          emissive="#1d4ed8"
          emissiveIntensity={0.6}
          wireframe 
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* 2. Outer Icosahedron - Emerald Green */}
      <mesh ref={outerMeshRef} scale={[1.7, 1.7, 1.7]}>
        <icosahedronGeometry args={[10, 2]} />
        <meshStandardMaterial 
          color="#10b981" 
          emissive="#047857"
          emissiveIntensity={0.3}
          wireframe 
          transparent
          opacity={0.15}
        />
      </mesh>
    </group>
  );
}
