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

// El valor default ahora es 2000 (para PC)
const Particles = ({ count = 2000 }) => {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const [data, setData] = useState<ParticleData[]>([]);

  useEffect(() => {
    // Detección de pantalla móvil
    const isMobile = window.innerWidth < 768;

    // CALIBRACIÓN DE RENDIMIENTO:
    // Si es móvil, usamos solo el 15% de las partículas solicitadas (ej. 300 de 2000).
    // Esto es suficiente para que la pantalla chica se vea llena, pero no quema la batería.
    const finalCount = isMobile ? Math.floor(count * 0.15) : count;

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
    // Aquí usamos data.length para asegurarnos de renderizar solo las calculadas (300 o 2000)
    <instancedMesh ref={mesh} args={[undefined, undefined, data.length || count]}>
      <dodecahedronGeometry args={[0.08, 0]} />
      <meshPhongMaterial color="#3b82f6" emissive="#10b981" emissiveIntensity={0.2} />
    </instancedMesh>
  );
};

export default Particles;