"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Sparkles, PerspectiveCamera, Text } from "@react-three/drei";
import { useRef, Suspense, useEffect } from "react";
import * as THREE from "three";

function Envelope({ stage }: { stage: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const topFlapRef = useRef<THREE.Mesh>(null);
  const sealRef = useRef<THREE.Group>(null);
  const cardRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current || !topFlapRef.current || !sealRef.current || !cardRef.current) return;

    if (stage === "opening" || stage === "entering") {
      // 1. Break the seal (scale to 0)
      sealRef.current.scale.setScalar(THREE.MathUtils.damp(sealRef.current.scale.x, 0, 10, delta));

      // 2. Open the top flap
      if (sealRef.current.scale.x < 0.5) {
        topFlapRef.current.rotation.x = THREE.MathUtils.damp(
          topFlapRef.current.rotation.x,
          Math.PI, // Fold it back
          4,
          delta
        );
      }

      // 3. Pull out the card
      if (topFlapRef.current.rotation.x > 2.5) {
        cardRef.current.position.y = THREE.MathUtils.damp(cardRef.current.position.y, 2, 2, delta);
      }
      
      // 4. Move envelope towards camera
      if (cardRef.current.position.y > 1.5 || stage === "entering") {
        groupRef.current.position.z = THREE.MathUtils.damp(groupRef.current.position.z, 5, 2, delta);
      }
    }
    
    // Gentle floating
    if (stage === "initial") {
      groupRef.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.1;
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Envelope Body */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[4, 2.5, 0.1]} />
        <meshStandardMaterial color="#fdfbf7" roughness={0.8} />
      </mesh>

      {/* Top Flap (Hinged at top) */}
      <group position={[0, 1.25, 0]}>
        <mesh ref={topFlapRef} position={[0, -0.625, 0.06]}>
          <coneGeometry args={[2, 1.25, 3]} />
          <meshStandardMaterial color="#f4efe6" roughness={0.9} />
        </mesh>
      </group>

      {/* Wax Seal */}
      <group ref={sealRef} position={[0, 0.2, 0.1]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.05, 32]} />
          <meshPhysicalMaterial 
            color="#8b0000" // Deep red wax
            metalness={0.1}
            roughness={0.3}
            clearcoat={0.5}
          />
        </mesh>
        <Text
          position={[0, 0, 0.03]}
          fontSize={0.2}
          color="#d4af37"
          font="/fonts/PlayfairDisplay-Italic.ttf"
        >
          T&J
        </Text>
      </group>

      {/* The Invitation Card inside */}
      <group ref={cardRef} position={[0, 0, 0]}>
        <mesh>
          <planeGeometry args={[3.8, 2.3]} />
          <meshStandardMaterial color="#ffffff" roughness={1} />
        </mesh>
        <Text
          position={[0, 0.3, 0.01]}
          fontSize={0.3}
          color="#d4af37"
          maxWidth={3}
          textAlign="center"
        >
          Thanu & Jathu
        </Text>
        <Text
          position={[0, -0.3, 0.01]}
          fontSize={0.15}
          color="#333333"
        >
          You are invited
        </Text>
      </group>
    </group>
  );
}

export default function EnvelopeScene({ stage }: { stage: "initial" | "opening" | "entering" }) {
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 6], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" castShadow />
      <spotLight position={[-10, 5, -5]} intensity={1} color="#d4af37" penumbra={1} />
      
      <Suspense fallback={null}>
        <Environment preset="city" />
        <Envelope stage={stage} />
      </Suspense>

      {/* Gold Dust Particles */}
      <Sparkles count={200} scale={10} size={2} speed={0.5} color="#d4af37" opacity={0.6} />
    </Canvas>
  );
}
