"use client";

import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

export function VoxelBalloon() {
  const groupRef = useRef<THREE.Group>(null);
  const envelopeRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current || !envelopeRef.current) return;

    const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);

    let targetY = -15; 
    let targetScale = 0;

    if (progress > 0.85) {
      const finale = Math.max(0, (progress - 0.9) / 0.1);
      targetScale = THREE.MathUtils.clamp(finale * 2, 0, 1.5);
      
      if (finale < 0.5) {
         targetY = -15 + (finale * 2) * 13.8; 
      } else {
         const flyProgress = (finale - 0.5) * 2;
         targetY = -1.2 + flyProgress * 15;
      }
    }

    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, delta * 4);
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, delta * 3));

    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.1;
    groupRef.current.rotation.z = Math.sin(t * 1.2) * 0.05;
    groupRef.current.rotation.x = Math.cos(t * 0.8) * 0.05;
    
    // Smooth breathing
    envelopeRef.current.scale.y = 1 + Math.sin(t * 2) * 0.02;
    envelopeRef.current.scale.x = 1 + Math.cos(t * 2) * 0.01;
    envelopeRef.current.scale.z = 1 + Math.sin(t * 2 + Math.PI) * 0.01;
  });

  return (
    <group ref={groupRef} position={[0, -15, -1]} scale={0}>
      
      {/* Premium Hot Air Balloon Envelope */}
      <group ref={envelopeRef} position={[0, 5, 0]}>
        <mesh>
          <sphereGeometry args={[3.5, 64, 64]} />
          <meshPhysicalMaterial 
            color="#fdfbf7" 
            roughness={0.4} 
            clearcoat={0.5} 
            clearcoatRoughness={0.2}
          />
        </mesh>

        {/* Elegant Gold Accents (Latitudes) */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.51, 0.04, 32, 64]} />
          <meshPhysicalMaterial color="#d4af37" metalness={1} roughness={0.1} />
        </mesh>
        <mesh position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.17, 0.03, 32, 64]} />
          <meshPhysicalMaterial color="#d4af37" metalness={1} roughness={0.1} />
        </mesh>
        <mesh position={[0, -1.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.17, 0.03, 32, 64]} />
          <meshPhysicalMaterial color="#d4af37" metalness={1} roughness={0.1} />
        </mesh>
        
        {/* Bottom nozzle / burner cover */}
        <mesh position={[0, -3.3, 0]}>
          <cylinderGeometry args={[0.8, 0.5, 1, 32]} />
          <meshPhysicalMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Elegant Golden Ropes */}
      <mesh position={[-0.6, 2.5, 0.6]} rotation={[0, 0, 0.1]}><cylinderGeometry args={[0.02, 0.02, 3.5, 16]} /><meshPhysicalMaterial color="#d4af37" metalness={1} roughness={0.2} /></mesh>
      <mesh position={[0.6, 2.5, 0.6]} rotation={[0, 0, -0.1]}><cylinderGeometry args={[0.02, 0.02, 3.5, 16]} /><meshPhysicalMaterial color="#d4af37" metalness={1} roughness={0.2} /></mesh>
      <mesh position={[-0.6, 2.5, -0.6]} rotation={[0.1, 0, 0]}><cylinderGeometry args={[0.02, 0.02, 3.5, 16]} /><meshPhysicalMaterial color="#d4af37" metalness={1} roughness={0.2} /></mesh>
      <mesh position={[0.6, 2.5, -0.6]} rotation={[-0.1, 0, 0]}><cylinderGeometry args={[0.02, 0.02, 3.5, 16]} /><meshPhysicalMaterial color="#d4af37" metalness={1} roughness={0.2} /></mesh>

      {/* Burner Flame */}
      <mesh position={[0, 3, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#ff9f43" />
      </mesh>
      <mesh position={[0, 3.1, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Premium Woven Basket (Approximated with a sleek cylinder with rich wood texture) */}
      <group position={[0, 0.2, 0]}>
        {/* Basket Body */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[1.2, 1.0, 1.2, 32, 1, true]} />
          <meshPhysicalMaterial color="#8b5a2b" roughness={0.8} clearcoat={0.1} side={THREE.DoubleSide} />
        </mesh>
        
        {/* Basket Floor */}
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[1.0, 1.0, 0.1, 32]} />
          <meshPhysicalMaterial color="#5c3a21" roughness={0.9} />
        </mesh>
        
        {/* Basket Rim */}
        <mesh position={[0, 0.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.2, 0.08, 16, 64]} />
          <meshPhysicalMaterial color="#5c3a21" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}
