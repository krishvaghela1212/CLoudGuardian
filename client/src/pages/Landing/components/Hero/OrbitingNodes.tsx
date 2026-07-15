import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { AWS_NODES } from '../../utils/constants';

export default function OrbitingNodes() {
  const groupRef = useRef<THREE.Group>(null);
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    AWS_NODES.forEach((node, index) => {
      const mesh = nodeRefs.current[index];
      if (!mesh) return;

      const angle = elapsed * node.orbitSpeed + node.orbitOffset;
      const x = Math.cos(angle) * node.orbitRadius;
      const z = Math.sin(angle) * node.orbitRadius;
      const y = Math.sin(node.orbitOffset) * node.orbitRadius * 0.3;

      mesh.position.set(x, y, z);
    });
  });

  return (
    <group ref={groupRef}>
      {AWS_NODES.map((node, index) => (
        <mesh
          key={node.id}
          ref={(el) => { nodeRefs.current[index] = el; }}
        >
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial
            color={node.color}
            emissive={node.color}
            emissiveIntensity={0.5}
          />
          <Html
            distanceFactor={8}
            style={{
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            <span
              className="text-xs font-medium whitespace-nowrap px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm"
              style={{ color: node.color }}
            >
              {node.label}
            </span>
          </Html>
        </mesh>
      ))}
    </group>
  );
}
