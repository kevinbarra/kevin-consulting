'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type ParticleData = {
  t: number;
  factor: number;
  speed: number;
  x: number;
  y: number;
  z: number;
};

const Particles = ({ count = 400 }) => { // Default bajo
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const [data, setData] = useState<ParticleData[]>([]);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    // En móvil, usamos MUY POCAS (100) para garantizar 60fps
    const finalCount = isMobile ? 100 : count;

    const temp: ParticleData[] = [];
    for (let i = 0; i < finalCount; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const x = Math.random() * 100 - 50;
      const y = Math.random() * 100 - 50;
      const z = Math.random() * 100 - 50;
      temp.push({ t, factor, speed, x, y, z });
    }
    setData(temp);
  }, [count]);

  useFrame(() => {
    const currentMesh = mesh.current;
    if (!currentMesh || data.length === 0) return;

    data.forEach((particle, i) => {
      let { t } = particle;
      const { factor, speed, x, y, z } = particle;

      t = particle.t += speed / 2;

      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);

      dummy.position.set(
        (x / 10) * a + x + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (y / 10) * b + y + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (y / 10) * b + z + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );

      dummy.scale.set(s, s, s);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();

      currentMesh.setMatrixAt(i, dummy.matrix);
    });

    currentMesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, data.length || count]}>
      <dodecahedronGeometry args={[0.08, 0]} />
      <meshPhongMaterial color="#3b82f6" emissive="#10b981" emissiveIntensity={0.2} />
    </instancedMesh>
  );
};

export default Particles;