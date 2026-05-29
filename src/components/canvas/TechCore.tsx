'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function TechCore() {
  const innerMeshRef = useRef<THREE.Mesh>(null);
  const outerMeshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  // Scale shapes responsively to prevent clipping/distortion on smaller/mobile screen sizes
  const responsiveScale = Math.min(1.0, Math.max(0.4, viewport.width / 45));

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
      <mesh ref={innerMeshRef} scale={[responsiveScale, responsiveScale, responsiveScale]}>
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
      <mesh ref={outerMeshRef} scale={[responsiveScale * 1.7, responsiveScale * 1.7, responsiveScale * 1.7]}>
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
