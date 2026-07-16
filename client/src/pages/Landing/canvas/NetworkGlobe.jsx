import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Line } from '@react-three/drei';
import * as THREE from 'three';

const FloatingNode = ({ position, color, label, icon }) => {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.005;
    }
  });

  return (
    <group position={position} ref={meshRef}>
      {/* Node Core */}
      <mesh>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
      {/* Halo */}
      <mesh>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
      
      {/* Simple Connection Line to center */}
      <Line points={[[0, 0, 0], [-position[0], -position[1], -position[2]]]} color={color} opacity={0.3} transparent />
    </group>
  );
};

const NetworkGlobe = () => {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const nodes = [
    { id: 'EC2', position: [2.5, 1, 0], color: '#8B5CF6' },
    { id: 'S3', position: [-2, 1.5, -1], color: '#F59E0B' },
    { id: 'RDS', position: [1.5, -1.5, 2], color: '#8B5CF6' },
    { id: 'Lambda', position: [-1.5, -1, -2.5], color: '#EC4899' },
    { id: 'IAM', position: [0, 2.5, 1.5], color: '#EF4444' }, // Critical red node
  ];

  return (
    <group ref={groupRef}>
      {/* Main Earth Sphere */}
      <Sphere args={[2, 64, 64]}>
        <meshStandardMaterial 
          color="#0a0a0a" 
          emissive="#121212"
          wireframe
          transparent
          opacity={0.3}
        />
      </Sphere>

      {/* Solid Inner Core */}
      <Sphere args={[1.9, 64, 64]}>
        <meshStandardMaterial color="#050505" />
      </Sphere>

      {/* Floating Nodes */}
      {nodes.map((node) => (
        <FloatingNode key={node.id} position={node.position} color={node.color} label={node.id} />
      ))}
      
      {/* Scanning Ring */}
      <mesh rotation-x={Math.PI / 2}>
        <torusGeometry args={[2.8, 0.02, 16, 100]} />
        <meshBasicMaterial color="#8B5CF6" transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

export default NetworkGlobe;
