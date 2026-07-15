import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface GlobeProps {
  radius?: number;
  rotationSpeed?: number;
}

export default function Globe({ radius = 2, rotationSpeed = 0.002 }: GlobeProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group>
      {/* Main globe - low-poly wireframe sphere */}
      <Sphere ref={meshRef} args={[radius, 32, 32]}>
        <meshStandardMaterial
          color="#10B981"
          wireframe
          transparent
          opacity={0.3}
          emissive="#10B981"
          emissiveIntensity={0.2}
        />
      </Sphere>

      {/* Outer glow sphere */}
      <Sphere args={[radius * 1.05, 32, 32]}>
        <meshBasicMaterial
          color="#10B981"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </Sphere>
    </group>
  );
}
