import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface Product3DProps {
  productType: string;
  color?: string;
}

// Simple 3D Box representing a product
const ProductBox: React.FC<{ color: string }> = ({ color }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
    </mesh>
  );
};

// Sphere for round products
const ProductSphere: React.FC<{ color: string }> = ({ color }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[1.5]} />
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.2} />
    </mesh>
  );
};

const Product3D: React.FC<Product3DProps> = ({ productType, color = '#3B82F6' }) => {
  const getProductMesh = () => {
    switch (productType.toLowerCase()) {
      case 'electronics':
      case 'headphones':
        return <ProductSphere color={color} />;
      case 'shoes':
      case 'clothing':
      case 'accessories':
      default:
        return <ProductBox color={color} />;
    }
  };

  return (
    <div className="w-full h-64 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        {getProductMesh()}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          autoRotate={false}
          minDistance={3}
          maxDistance={8}
        />
      </Canvas>
    </div>
  );
};

export default Product3D;