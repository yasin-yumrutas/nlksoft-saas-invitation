"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Sparkles, PerspectiveCamera } from "@react-three/drei";
import { useRef, Suspense } from "react";
import * as THREE from "three";

function FloatingWeddingRings() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();
    
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    const maxScroll = typeof window !== 'undefined' ? Math.max(1, document.body.scrollHeight - window.innerHeight) : 1;
    const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
    
    // Yüzükler yavaşça yukarı doğru kaybolur
    groupRef.current.position.y = Math.sin(t * 1.5) * 0.1 + (progress * 15);
    
    // Kilitli dönüş
    groupRef.current.rotation.x = t * 0.3;
    groupRef.current.rotation.y = t * 0.5;
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      {/* Damat Yüzüğü */}
      <mesh position={[-0.45, 0, 0]}>
        <torusGeometry args={[0.8, 0.15, 32, 64]} />
        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.2} />
      </mesh>
      
      {/* Gelin Yüzüğü (Zincir gibi kilitli) */}
      <group position={[0.45, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <torusGeometry args={[0.7, 0.08, 32, 64]} />
          <meshStandardMaterial color="#e6c280" metalness={1} roughness={0.15} />
        </mesh>
        <mesh position={[0, 0.75, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <octahedronGeometry args={[0.3, 0]} />
          <meshPhysicalMaterial 
            color="#ffffff"
            metalness={0.9}
            roughness={0}
            transmission={1}
            ior={2.4}
            thickness={0.5}
          />
        </mesh>
      </group>
    </group>
  );
}

function CinematicCamera() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  
  useFrame(() => {
    if (!cameraRef.current) return;
    
    const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const scrollY = window.scrollY;
    const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
    
    let targetZ = 8;
    let targetY = 0;
    
    if (progress < 0.1) {
      targetZ = 8 - progress * 10; 
      targetY = progress * 5;
    } else {
      targetZ = 6;
      targetY = 0;
    } 
    
    cameraRef.current.position.z += (targetZ - cameraRef.current.position.z) * 0.05;
    cameraRef.current.position.y += (targetY - cameraRef.current.position.y) * 0.05;
    
    if (progress > 0.1) {
       cameraRef.current.lookAt(0, 0, 0);
    }
  });
  
  return (
    <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 8]} fov={45} />
  );
}

export default function Scene({ eventSourceId }: { eventSourceId?: string }) {
  const source = typeof document !== 'undefined' && eventSourceId ? document.getElementById(eventSourceId) : undefined;
  
  return (
    <Canvas shadows="basic" dpr={[1, 2]} eventSource={source || undefined} eventPrefix="client">
      <CinematicCamera />
      
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={2.5} color="#ffffff" castShadow />
      <spotLight position={[-10, 5, -5]} intensity={2} color="#d4af37" penumbra={1} angle={0.5} />
      
      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>

      <FloatingWeddingRings />

      {/* Arka plandaki zarif asil parıltılar */}
      <Sparkles count={150} scale={15} size={1} speed={0.2} color="#d4af37" opacity={0.3} />
      
      <fog attach="fog" args={["#fdfbf7", 8, 25]} />
    </Canvas>
  );
}
