import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TIMING } from '../../utils/constants';

const BOUNDS = 5;

export default function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);

  const particleCount = TIMING.particleCount;

  const positions = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      arr[i3] = (Math.random() - 0.5) * BOUNDS * 2;
      arr[i3 + 1] = (Math.random() - 0.5) * BOUNDS * 2;
      arr[i3 + 2] = (Math.random() - 0.5) * BOUNDS * 2;
    }
    return arr;
  }, [particleCount]);

  const velocities = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      arr[i3] = (Math.random() - 0.5) * 0.02;
      arr[i3 + 1] = (Math.random() - 0.5) * 0.02;
      arr[i3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    return arr;
  }, [particleCount]);

  useFrame(() => {
    if (!pointsRef.current) return;

    const positionAttr = pointsRef.current.geometry.attributes.position;
    const posArray = positionAttr.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      posArray[i3] += velocities[i3];
      posArray[i3 + 1] += velocities[i3 + 1];
      posArray[i3 + 2] += velocities[i3 + 2];

      // Wrap at bounds
      if (Math.abs(posArray[i3]) > BOUNDS) posArray[i3] *= -1;
      if (Math.abs(posArray[i3 + 1]) > BOUNDS) posArray[i3 + 1] *= -1;
      if (Math.abs(posArray[i3 + 2]) > BOUNDS) posArray[i3 + 2] *= -1;
    }

    positionAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={particleCount}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#10B981"
        size={0.02}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}
