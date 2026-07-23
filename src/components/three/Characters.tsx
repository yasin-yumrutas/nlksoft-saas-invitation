"use client";

import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";

// Premium Porcelain Material Properties
const porcelainMaterialProps = {
  roughness: 0.1,
  metalness: 0.1,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
};

// Premium Art Toy Face (Minimalist, elegant, round)
function ElegantFace({ blushColor = "#ffb3c6" }) {
  return (
    <group position={[0, 0, 0.43]}>
      {/* Smooth Eyes */}
      <mesh position={[-0.15, 0.05, 0]}>
        <sphereGeometry args={[0.06, 32, 32]} />
        <meshPhysicalMaterial color="#1a1a1a" {...porcelainMaterialProps} />
      </mesh>
      <mesh position={[-0.16, 0.07, 0.05]}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      <mesh position={[0.15, 0.05, 0]}>
        <sphereGeometry args={[0.06, 32, 32]} />
        <meshPhysicalMaterial color="#1a1a1a" {...porcelainMaterialProps} />
      </mesh>
      <mesh position={[0.14, 0.07, 0.05]}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Soft Blushes */}
      <mesh position={[-0.22, -0.06, -0.05]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshPhysicalMaterial color={blushColor} transparent opacity={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0.22, -0.06, -0.05]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshPhysicalMaterial color={blushColor} transparent opacity={0.5} roughness={0.4} />
      </mesh>

      {/* Elegant minimalist smile */}
      <mesh position={[0, -0.08, 0.02]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.07, 0.015, 16, 32, Math.PI]} />
        <meshPhysicalMaterial color="#1a1a1a" {...porcelainMaterialProps} />
      </mesh>
    </group>
  );
}

export function InteractiveGroom({ position }: { position?: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  
  const [hovered, setHovered] = useState(false);
  const [clickRot, setClickRot] = useState(0);

  const handleClick = (e: any) => {
    e.stopPropagation();
    setClickRot((prev) => prev + Math.PI * 2);
  };

  useFrame((state, delta) => {
    if (!groupRef.current || !leftArmRef.current || !rightArmRef.current || !bodyRef.current) return;

    const t = state.clock.getElapsedTime();
    const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
    
    let targetLeftZ = 0.1;
    let targetRightZ = -0.1;
    let targetRightX = 0;
    
    const isPointing = progress > 0.15 && progress < 0.85;

    if (hovered) {
      targetRightZ = -2.8;
      targetRightX = Math.sin(t * 15) * 0.5;
      targetLeftZ = 2.8;
    } else if (isPointing) {
      targetRightZ = -1.5; 
      targetRightX = -1.0; 
    }

    // Finale Logic
    let currentBaseX = position?.[0] || -3.5;
    let currentBaseY = position?.[1] || 0;
    const floatY = Math.sin(t * 2) * 0.05;

    if (progress > 0.85) {
      const finale = Math.max(0, (progress - 0.9) / 0.1);
      currentBaseX = THREE.MathUtils.lerp(currentBaseX, -0.4, Math.min(finale * 4, 1));
      
      if (finale >= 0.5) {
         const flyProgress = (finale - 0.5) * 2;
         currentBaseY = -1.2 + flyProgress * 15; 
         targetRightZ = -2.8;
         targetRightX = Math.sin(t * 10) * 0.5;
         targetLeftZ = 2.8;
      }
    }

    groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, currentBaseX, 4, delta);
    groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, currentBaseY + floatY, 4, delta);
    
    const isJumping = Math.abs(groupRef.current.rotation.y - clickRot) > 0.1;
    bodyRef.current.position.y = THREE.MathUtils.damp(bodyRef.current.position.y, isJumping ? 0.6 : 0, 10, delta);
    
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, clickRot, 5, delta);

    leftArmRef.current.rotation.z = THREE.MathUtils.damp(leftArmRef.current.rotation.z, targetLeftZ, 8, delta);
    rightArmRef.current.rotation.z = THREE.MathUtils.damp(rightArmRef.current.rotation.z, targetRightZ, 8, delta);
    rightArmRef.current.rotation.x = THREE.MathUtils.damp(rightArmRef.current.rotation.x, targetRightX, 8, delta);
  });

  return (
    <group 
      ref={groupRef} 
      position={position} 
      scale={1.1}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false); }}
      onClick={handleClick}
    >
      <group ref={bodyRef}>
        {/* Head - Perfect Sphere */}
        <group position={[0, 1.2, 0]}>
          <mesh>
            <sphereGeometry args={[0.45, 64, 64]} />
            <meshPhysicalMaterial color="#fff0e6" {...porcelainMaterialProps} />
          </mesh>
          
          {/* Elegant minimalist hair (Smooth dome) */}
          <mesh position={[0, 0.1, -0.05]} rotation={[0.1, 0, 0]}>
            <sphereGeometry args={[0.47, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
            <meshPhysicalMaterial color="#1a1a1a" {...porcelainMaterialProps} />
          </mesh>

          <ElegantFace blushColor="#ffb3c6" />
        </group>

        {/* Tuxedo Body - Smooth Capsule */}
        <mesh position={[0, 0.45, 0]}>
          <capsuleGeometry args={[0.3, 0.5, 32, 64]} />
          <meshPhysicalMaterial color="#111" {...porcelainMaterialProps} />
        </mesh>
        
        {/* Shirt Detail */}
        <mesh position={[0, 0.55, 0.28]}>
          <planeGeometry args={[0.15, 0.4]} />
          <meshPhysicalMaterial color="#ffffff" {...porcelainMaterialProps} />
        </mesh>

        {/* Bowtie - Smooth toruses */}
        <group position={[0, 0.7, 0.3]}>
          <mesh position={[-0.05, 0, 0]} rotation={[0, 0, 0.2]}>
            <torusGeometry args={[0.04, 0.02, 16, 32]} />
            <meshPhysicalMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0.05, 0, 0]} rotation={[0, 0, -0.2]}>
            <torusGeometry args={[0.04, 0.02, 16, 32]} />
            <meshPhysicalMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshPhysicalMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>

        {/* Left Arm - Capsule Pivot */}
        <group ref={leftArmRef} position={[-0.35, 0.75, 0]}>
          <mesh position={[0, -0.35, 0]}>
            <capsuleGeometry args={[0.08, 0.5, 16, 32]} />
            <meshPhysicalMaterial color="#111" {...porcelainMaterialProps} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.7, 0]}>
            <sphereGeometry args={[0.1, 32, 32]} />
            <meshPhysicalMaterial color="#fff0e6" {...porcelainMaterialProps} />
          </mesh>
        </group>

        {/* Right Arm - Capsule Pivot */}
        <group ref={rightArmRef} position={[0.35, 0.75, 0]}>
          <mesh position={[0, -0.35, 0]}>
            <capsuleGeometry args={[0.08, 0.5, 16, 32]} />
            <meshPhysicalMaterial color="#111" {...porcelainMaterialProps} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.7, 0]}>
            <sphereGeometry args={[0.1, 32, 32]} />
            <meshPhysicalMaterial color="#fff0e6" {...porcelainMaterialProps} />
          </mesh>
        </group>
        
        {/* Legs - Smooth Cylinders */}
        <mesh position={[-0.15, -0.1, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.5, 32]} />
          <meshPhysicalMaterial color="#111" {...porcelainMaterialProps} />
        </mesh>
        <mesh position={[0.15, -0.1, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.5, 32]} />
          <meshPhysicalMaterial color="#111" {...porcelainMaterialProps} />
        </mesh>
      </group>
    </group>
  );
}

export function InteractiveBride({ position }: { position?: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  
  const [hovered, setHovered] = useState(false);
  const [clickRot, setClickRot] = useState(0);

  const handleClick = (e: any) => {
    e.stopPropagation();
    setClickRot((prev) => prev - Math.PI * 2); 
  };

  useFrame((state, delta) => {
    if (!groupRef.current || !leftArmRef.current || !rightArmRef.current || !bodyRef.current) return;

    const t = state.clock.getElapsedTime();
    const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
    
    let targetLeftZ = 0.1;
    let targetLeftX = 0;
    let targetRightZ = -0.1;

    const isPointing = progress > 0.15 && progress < 0.85;

    if (hovered) {
      targetLeftZ = 2.8 + Math.sin(t * 10) * 0.5;
      targetRightZ = -2.8 - Math.cos(t * 10) * 0.5;
    } else if (isPointing) {
      targetLeftZ = 1.5;
      targetLeftX = -1.0;
    }

    // Finale Logic
    let currentBaseX = position?.[0] || 3.5;
    let currentBaseY = position?.[1] || 0;
    const floatY = Math.sin(t * 2 + Math.PI) * 0.05; 

    if (progress > 0.85) {
      const finale = Math.max(0, (progress - 0.9) / 0.1);
      currentBaseX = THREE.MathUtils.lerp(currentBaseX, 0.4, Math.min(finale * 4, 1));
      
      if (finale >= 0.5) {
         const flyProgress = (finale - 0.5) * 2;
         currentBaseY = -1.2 + flyProgress * 15; 
         targetLeftZ = 2.8 + Math.sin(t * 10) * 0.5;
         targetRightZ = -2.8 - Math.cos(t * 10) * 0.5;
      }
    }

    groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, currentBaseX, 4, delta);
    groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, currentBaseY + floatY, 4, delta);
    
    const isJumping = Math.abs(groupRef.current.rotation.y - clickRot) > 0.1;
    bodyRef.current.position.y = THREE.MathUtils.damp(bodyRef.current.position.y, isJumping ? 0.6 : 0, 10, delta);
    
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, clickRot, 5, delta);

    leftArmRef.current.rotation.z = THREE.MathUtils.damp(leftArmRef.current.rotation.z, targetLeftZ, 8, delta);
    leftArmRef.current.rotation.x = THREE.MathUtils.damp(leftArmRef.current.rotation.x, targetLeftX, 8, delta);
    rightArmRef.current.rotation.z = THREE.MathUtils.damp(rightArmRef.current.rotation.z, targetRightZ, 8, delta);
  });

  return (
    <group 
      ref={groupRef} 
      position={position} 
      scale={1.1}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false); }}
      onClick={handleClick}
    >
      <group ref={bodyRef}>
        {/* Elegant Bell Dress - Cone + Fillets */}
        <mesh position={[0, 0.2, 0]}>
          <coneGeometry args={[0.7, 1.2, 64]} />
          <meshPhysicalMaterial color="#ffffff" {...porcelainMaterialProps} roughness={0.2} />
        </mesh>
        
        {/* Head */}
        <group position={[0, 1.2, 0]}>
          <mesh>
            <sphereGeometry args={[0.45, 64, 64]} />
            <meshPhysicalMaterial color="#fff0e6" {...porcelainMaterialProps} />
          </mesh>
          <ElegantFace blushColor="#ff99b3" />
          
          {/* Premium Hair Bun (Glossy) */}
          <mesh position={[0, 0.35, -0.3]}>
            <sphereGeometry args={[0.25, 32, 32]} />
            <meshPhysicalMaterial color="#2d1c10" {...porcelainMaterialProps} />
          </mesh>
          <mesh position={[0, 0.1, -0.05]} rotation={[0.1, 0, 0]}>
            <sphereGeometry args={[0.47, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.45]} />
            <meshPhysicalMaterial color="#2d1c10" {...porcelainMaterialProps} />
          </mesh>

          {/* Premium Glass Veil */}
          <mesh position={[0, -0.1, -0.3]} rotation={[-0.2, 0, 0]}>
            <coneGeometry args={[0.65, 1.6, 64, 1, true]} />
            <MeshTransmissionMaterial 
              transmission={1} 
              opacity={0.8} 
              transparent 
              roughness={0.05} 
              thickness={0.5}
              ior={1.3} 
              color="#ffffff" 
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.32, 0.75, 0]}>
          <mesh position={[0, -0.3, 0]}>
            <capsuleGeometry args={[0.07, 0.5, 16, 32]} />
            <meshPhysicalMaterial color="#fff0e6" {...porcelainMaterialProps} />
          </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.32, 0.75, 0]}>
          <mesh position={[0, -0.3, 0]}>
            <capsuleGeometry args={[0.07, 0.5, 16, 32]} />
            <meshPhysicalMaterial color="#fff0e6" {...porcelainMaterialProps} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
