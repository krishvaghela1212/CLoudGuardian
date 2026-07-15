import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RingConfig {
  radius: number;
  rotationAxis: 'x' | 'y' | 'z';
  speed: number;
  initialRotation: [number, number, number];
  phaseOffset: number;
}

const RINGS: RingConfig[] = [
  { radius: 2.8, rotationAxis: 'x', speed: 0.3, initialRotation: [Math.PI / 4, 0, 0], phaseOffset: 0 },
  { radius: 3.0, rotationAxis: 'z', speed: 0.2, initialRotation: [0, 0, Math.PI / 3], phaseOffset: 2 },
  { radius: 2.6, rotationAxis: 'y', speed: 0.4, initialRotation: [Math.PI / 6, Math.PI / 4, 0], phaseOffset: 4 },
];

export default function ScanningRings() {
  const ringRefs = useRef<(THREE.Mesh | null)[]>([]);
  const materialRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);

  useFrame(({ clock }, delta) => {
    const elapsed = clock.getElapsedTime();

    RINGS.forEach((ring, index) => {
      const mesh = ringRefs.current[index];
      const material = materialRefs.current[index];
      if (!mesh || !material) return;

      // Rotate on the configured axis
      mesh.rotation[ring.rotationAxis] += delta * ring.speed;

      // Pulse opacity with sin wave
      const opacity = 0.15 + Math.sin(elapsed * 1.5 + ring.phaseOffset) * 0.1;
      material.opacity = Math.max(0.05, opacity);
    });
  });

  return (
    <group>
      {RINGS.map((ring, index) => (
        <mesh
          key={index}
          ref={(el) => { ringRefs.current[index] = el; }}
          rotation={ring.initialRotation}
        >
          <torusGeometry args={[ring.radius, 0.01, 8, 64]} />
          <meshBasicMaterial
            ref={(el) => { materialRefs.current[index] = el; }}
            color="#10B981"
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
