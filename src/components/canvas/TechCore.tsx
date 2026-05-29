'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function TechCore() {
  const innerMeshRef = useRef<THREE.Mesh>(null);
  const outerMeshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  // Scale shapes responsively, making it significantly larger on mobile (min 0.9) to look spectacular
  const responsiveScale = Math.min(1.25, Math.max(0.9, viewport.width / 22));

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
      {/* 1. Inner Torus Knot - High Emissive Electric Blue/Cyan Glow */}
      <mesh ref={innerMeshRef} scale={[responsiveScale, responsiveScale, responsiveScale]}>
        <torusKnotGeometry args={[8, 2.2, 100, 16]} />
        <meshStandardMaterial 
          color="#3b82f6" 
          emissive="#00f0ff" 
          emissiveIntensity={1.8}
          wireframe 
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* 2. Outer Icosahedron - Bright Glowing Emerald Shell */}
      <mesh ref={outerMeshRef} scale={[responsiveScale * 1.75, responsiveScale * 1.75, responsiveScale * 1.75]}>
        <icosahedronGeometry args={[10, 2]} />
        <meshStandardMaterial 
          color="#10b981" 
          emissive="#34d399" 
          emissiveIntensity={1.2}
          wireframe 
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}
