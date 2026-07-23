"use client";

import { useFrame } from "@react-three/fiber";
import { Trail, MeshDistortMaterial, MeshTransmissionMaterial, Sparkles } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

export function MagicalOrbs() {
  const goldOrbRef = useRef<THREE.Mesh>(null);
  const diamondOrbRef = useRef<THREE.Mesh>(null);
  const gemRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const sparklesRef = useRef<THREE.Group>(null);

  // A brilliant cut gemstone look using Octahedron with detail 1 (which makes it an Icosahedron/diamond shape)
  const diamondGeometry = useMemo(() => new THREE.OctahedronGeometry(1.5, 1), []);
  
  useFrame((state, delta) => {
    if (!goldOrbRef.current || !diamondOrbRef.current || !gemRef.current || !sparklesRef.current) return;

    const t = state.clock.getElapsedTime();
    const maxScroll = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const scrollY = window.scrollY;
    const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
    
    // 1. DANCE CHOREOGRAPHY (Helix / Spiral)
    const spiralRadius = 3.5;
    const scrollAngle = progress * Math.PI * 10; 
    
    const floatY = Math.sin(t * 2) * 0.3;
    const floatY2 = Math.cos(t * 2) * 0.3;

    let goldTargetX = Math.cos(scrollAngle + t) * spiralRadius;
    let goldTargetZ = Math.sin(scrollAngle + t) * spiralRadius;
    let goldTargetY = floatY;

    let diamondTargetX = Math.cos(scrollAngle + t + Math.PI) * spiralRadius;
    let diamondTargetZ = Math.sin(scrollAngle + t + Math.PI) * spiralRadius;
    let diamondTargetY = floatY2;

    // Finale Logic (Crash into Brilliant Diamond + Supernova Burst)
    const isFinale = progress > 0.92;
    const finaleProgress = Math.min(Math.max((progress - 0.92) / 0.08, 0), 1);
    
    let gemScale = 0;
    let sparklesScale = 0;
    
    if (isFinale) {
      // Crash into center
      const crashDamp = 1 - Math.pow(finaleProgress, 3); 
      
      goldTargetX *= crashDamp;
      goldTargetZ *= crashDamp;
      goldTargetY *= crashDamp;

      diamondTargetX *= crashDamp;
      diamondTargetZ *= crashDamp;
      diamondTargetY *= crashDamp;

      // Melt away just before the diamond appears
      const orbScale = finaleProgress > 0.8 ? 0 : THREE.MathUtils.lerp(1, 0, finaleProgress);
      goldOrbRef.current.scale.setScalar(THREE.MathUtils.damp(goldOrbRef.current.scale.x, orbScale, 10, delta));
      diamondOrbRef.current.scale.setScalar(THREE.MathUtils.damp(diamondOrbRef.current.scale.x, orbScale, 10, delta));
      
      // The Diamond & Supernova are born
      if (finaleProgress > 0.8) {
         // Giant Diamond slowly rotates
         gemScale = THREE.MathUtils.lerp(0, 1, (finaleProgress - 0.8) * 5);
         
         // Supernova burst expansion
         sparklesScale = THREE.MathUtils.lerp(0, 20, (finaleProgress - 0.8) * 10);
      }
    } else {
      goldOrbRef.current.scale.setScalar(THREE.MathUtils.damp(goldOrbRef.current.scale.x, 1, 4, delta));
      diamondOrbRef.current.scale.setScalar(THREE.MathUtils.damp(diamondOrbRef.current.scale.x, 1, 4, delta));
    }

    // Apply fluid targets
    goldOrbRef.current.position.x = THREE.MathUtils.damp(goldOrbRef.current.position.x, goldTargetX, 4, delta);
    goldOrbRef.current.position.y = THREE.MathUtils.damp(goldOrbRef.current.position.y, goldTargetY, 4, delta);
    goldOrbRef.current.position.z = THREE.MathUtils.damp(goldOrbRef.current.position.z, goldTargetZ, 4, delta);

    diamondOrbRef.current.position.x = THREE.MathUtils.damp(diamondOrbRef.current.position.x, diamondTargetX, 4, delta);
    diamondOrbRef.current.position.y = THREE.MathUtils.damp(diamondOrbRef.current.position.y, diamondTargetY, 4, delta);
    diamondOrbRef.current.position.z = THREE.MathUtils.damp(diamondOrbRef.current.position.z, diamondTargetZ, 4, delta);

    // Diamond rotation & scale
    gemRef.current.rotation.y = t * 0.8;
    gemRef.current.rotation.x = t * 0.4;
    gemRef.current.scale.setScalar(THREE.MathUtils.damp(gemRef.current.scale.x, gemScale, 10, delta));
    
    // Supernova scale
    sparklesRef.current.scale.setScalar(THREE.MathUtils.damp(sparklesRef.current.scale.x, sparklesScale, 15, delta));
  });

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      
      {/* GOLD FLUID SOUL (Groom) */}
      <Trail
        width={3}
        length={60}
        color={new THREE.Color("#d4af37")}
        attenuation={(t) => t * t}
      >
        <mesh ref={goldOrbRef}>
          <icosahedronGeometry args={[0.3, 32]} />
          {/* Liquid Gold */}
          <MeshDistortMaterial 
            color="#ffcc00" 
            emissive="#ff9900"
            emissiveIntensity={1.5}
            distort={0.4} 
            speed={4} 
            roughness={0} 
            metalness={1}
            toneMapped={false} 
          />
          <pointLight color="#d4af37" intensity={3} distance={15} />
        </mesh>
      </Trail>

      {/* DIAMOND FLUID SOUL (Bride) */}
      <Trail
        width={3}
        length={60}
        color={new THREE.Color("#a2d8f2")}
        attenuation={(t) => t * t}
      >
        <mesh ref={diamondOrbRef}>
          <icosahedronGeometry args={[0.3, 32]} />
          {/* Liquid Glass / Ice */}
          <MeshDistortMaterial 
            color="#ffffff" 
            emissive="#a2d8f2"
            emissiveIntensity={1.5}
            distort={0.5} 
            speed={5} 
            roughness={0} 
            transmission={1}
            thickness={0.5}
            toneMapped={false} 
          />
          <pointLight color="#a2d8f2" intensity={3} distance={15} />
        </mesh>
      </Trail>

      {/* GRAND FINALE: BRILLIANT CUT DIAMOND */}
      <mesh ref={gemRef} geometry={diamondGeometry} scale={0}>
        {/* Awwwards level Glass Refraction */}
        <MeshTransmissionMaterial 
          transmission={1} 
          thickness={2.5} 
          roughness={0} 
          ior={2.4} // Diamond IOR
          chromaticAberration={0.5} // High rainbow dispersion
          color="#ffffff" 
          anisotropy={0.3}
          distortion={0.2}
          distortionScale={0.5}
          temporalDistortion={0.1}
          clearcoat={1}
        />
        <pointLight color="#ffffff" intensity={5} distance={20} />
      </mesh>
      
      {/* SUPERNOVA BURST */}
      <group ref={sparklesRef} scale={0}>
        <Sparkles count={500} scale={1} size={4} speed={0} color="#d4af37" opacity={0.8} />
      </group>

    </group>
  );
}
