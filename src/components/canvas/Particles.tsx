'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const MAX_CONNECTIONS = 1200;
const MAX_MOUSE_CONNECTIONS = 18;

export default function Particles({ count = 160 }) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const mouseLinesRef = useRef<THREE.LineSegments>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  // Track mouse coordinates globally on the window
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates to [-1, 1] range
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate a beautiful radial glow texture for the particle nodes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(56, 189, 248, 0.85)');
        gradient.addColorStop(0.6, 'rgba(37, 99, 235, 0.25)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
      }
      const texture = new THREE.CanvasTexture(canvas);
      if (pointsRef.current) {
        const mat = pointsRef.current.material as THREE.PointsMaterial;
        mat.map = texture;
        mat.needsUpdate = true;
      }
    }
  }, []);

  // Generate particle structural parameters
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      // Random coordinates inside the camera viewport range
      const x = (Math.random() - 0.5) * viewport.width * 1.5;
      const y = (Math.random() - 0.5) * viewport.height * 1.5;
      const z = (Math.random() - 0.5) * 40 - 10;
      
      temp.push({
        x, y, z, // Current coordinates
        ox: x, oy: y, oz: z, // Original coordinates (spring targets)
        vx: 0, vy: 0, vz: 0, // Velocity
        seed: Math.random() * 100,
        speed: 0.15 + Math.random() * 0.2
      });
    }
    return temp;
  }, [count, viewport]);

  // Float32Arrays for GPU buffers
  const [pointPositions, linePositions, mouseLinePositions] = useMemo(() => {
    return [
      new Float32Array(count * 3),
      new Float32Array(MAX_CONNECTIONS * 2 * 3), // 2 points per line, 3 coordinates per point
      new Float32Array(MAX_MOUSE_CONNECTIONS * 2 * 3) // Lines to mouse cursor
    ];
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const pointsGeo = pointsRef.current?.geometry;
    const linesGeo = linesRef.current?.geometry;
    const mouseLinesGeo = mouseLinesRef.current?.geometry;

    if (!pointsGeo || !linesGeo) return;

    // Projected mouse coordinates to 3D space at z = 0 using global mouse ref
    const mouseX = (mouseRef.current.x * viewport.width) / 2;
    const mouseY = (mouseRef.current.y * viewport.height) / 2;
    const mouseZ = 0;

    // 1. Dynamic Tilting/Parallax based on cursor movement
    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, mouseRef.current.y * 0.25, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouseRef.current.x * 0.25, 0.05);
    }

    // 2. Particle Physics Loop (Float & Mouse Repulsion)
    particles.forEach((p, i) => {
      // Small wave drift to look organic
      const driftX = Math.sin(time * p.speed + p.seed) * 0.03;
      const driftY = Math.cos(time * p.speed + p.seed) * 0.03;

      // Mouse distance repulsion
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dz = p.z - mouseZ;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (dist < 15) {
        // Push force grows stronger the closer the mouse is
        const force = ((15 - dist) / 15) * 0.35;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
        p.vz += (dz / dist) * force;
      }

      // Spring force returning to original position + drift offset
      const springX = (p.ox + driftX * 8 - p.x) * 0.03;
      const springY = (p.oy + driftY * 8 - p.y) * 0.03;
      const springZ = (p.oz - p.z) * 0.03;

      p.vx += springX;
      p.vy += springY;
      p.vz += springZ;

      // Damp velocities (friction)
      p.vx *= 0.90;
      p.vy *= 0.90;
      p.vz *= 0.90;

      // Apply positions
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;

      // Write into points array
      pointPositions[i * 3] = p.x;
      pointPositions[i * 3 + 1] = p.y;
      pointPositions[i * 3 + 2] = p.z;
    });

    pointsGeo.attributes.position.needsUpdate = true;

    // 3. Line Connections Loop (Distance check)
    let lineIdx = 0;
    for (let i = 0; i < count; i++) {
      const p1 = particles[i];
      for (let j = i + 1; j < count; j++) {
        const p2 = particles[j];
        
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dz = p1.z - p2.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < 14) {
          if (lineIdx >= MAX_CONNECTIONS) break;

          // Connect p1
          linePositions[lineIdx * 6] = p1.x;
          linePositions[lineIdx * 6 + 1] = p1.y;
          linePositions[lineIdx * 6 + 2] = p1.z;

          // Connect p2
          linePositions[lineIdx * 6 + 3] = p2.x;
          linePositions[lineIdx * 6 + 4] = p2.y;
          linePositions[lineIdx * 6 + 5] = p2.z;

          lineIdx++;
        }
      }
      if (lineIdx >= MAX_CONNECTIONS) break;
    }

    // Set GPU draw range dynamically to hide unused line vertices
    linesGeo.setDrawRange(0, lineIdx * 2);
    linesGeo.attributes.position.needsUpdate = true;

    // 4. Mouse Interactive Data-Links (draw lines connecting cursor to nearest nodes)
    let mouseLineIdx = 0;
    if (mouseLinesGeo) {
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const dz = p.z - mouseZ;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Connect cursor to nodes within active radius
        if (dist < 16) {
          if (mouseLineIdx >= MAX_MOUSE_CONNECTIONS) break;

          // Origin (Mouse Cursor)
          mouseLinePositions[mouseLineIdx * 6] = mouseX;
          mouseLinePositions[mouseLineIdx * 6 + 1] = mouseY;
          mouseLinePositions[mouseLineIdx * 6 + 2] = mouseZ;

          // Target (Node)
          mouseLinePositions[mouseLineIdx * 6 + 3] = p.x;
          mouseLinePositions[mouseLineIdx * 6 + 4] = p.y;
          mouseLinePositions[mouseLineIdx * 6 + 5] = p.z;

          mouseLineIdx++;
        }
      }
      mouseLinesGeo.setDrawRange(0, mouseLineIdx * 2);
      mouseLinesGeo.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Ambient static/dynamic line connections */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#3b82f6" transparent opacity={0.28} />
      </lineSegments>

      {/* Interactive cursor data-link lines */}
      <lineSegments ref={mouseLinesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[mouseLinePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#10b981" transparent opacity={0.55} />
      </lineSegments>

      {/* Dynamic point nodes */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[pointPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial 
          color="#38bdf8" 
          size={0.65} 
          transparent 
          opacity={0.9} 
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  );
}