'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function TechCore() {
  const innerMeshRef = useRef<THREE.Mesh>(null);
  const outerMeshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  // Scale shapes responsively, optimized middle size on mobile (min 0.65) to not overlap text readability
  const responsiveScale = Math.min(1.1, Math.max(0.65, viewport.width / 24));

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
      {/* 1. Inner Torus Knot - Royal Blue (Soft and elegant, matches original style) */}
      <mesh ref={innerMeshRef} scale={[responsiveScale, responsiveScale, responsiveScale]}>
        <torusKnotGeometry args={[8, 2.2, 100, 16]} />
        <meshStandardMaterial 
          color="#2563eb" 
          emissive="#1d4ed8" 
          emissiveIntensity={0.8}
          wireframe 
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* 2. Outer Icosahedron - Emerald Green Shell (Subtle contrast) */}
      <mesh ref={outerMeshRef} scale={[responsiveScale * 1.7, responsiveScale * 1.7, responsiveScale * 1.7]}>
        <icosahedronGeometry args={[10, 2]} />
        <meshStandardMaterial 
          color="#10b981" 
          emissive="#047857" 
          emissiveIntensity={0.4}
          wireframe 
          transparent
          opacity={0.15}
        />
      </mesh>
    </group>
  );
}
