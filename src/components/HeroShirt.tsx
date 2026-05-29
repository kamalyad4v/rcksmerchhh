"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { PresentationControls, useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";

export default function HeroShirt() {
  const meshRef = useRef<THREE.Group>(null);
  const scrollRef = useRef(0);

  // Load the 3D model
  const { scene } = useGLTF("/shirt.glb");

  useEffect(() => {
    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      const baseRotation = state.clock.elapsedTime * 0.1;
      const scrollRotation = scrollRef.current * 0.002;
      meshRef.current.rotation.y = baseRotation + scrollRotation;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <>
      {/* Pure local lighting — no CDN, works on HTTP/LAN */}
      <ambientLight intensity={1.5} color="#ffffff" />
      <directionalLight position={[5, 10, 5]} intensity={4} color="#ffffff" castShadow />
      <directionalLight position={[-5, -5, -5]} intensity={2} color="#FFD700" />
      <pointLight position={[0, 5, 8]} intensity={3} color="#ffffff" />
      <pointLight position={[0, -5, -8]} intensity={1.5} color="#FFD700" />
      <spotLight position={[0, 12, 6]} intensity={4} angle={0.4} penumbra={0.8} color="#ffffff" />

      <PresentationControls
        global
        rotation={[0, 0, 0]}
        polar={[-Math.PI / 3, Math.PI / 3]}
        azimuth={[-Math.PI / 1.4, Math.PI / 2]}
      >
        <Center>
          <primitive
            object={scene}
            ref={meshRef}
            scale={2.5}
            position={[0, -1, 0]}
          />
        </Center>
      </PresentationControls>
    </>
  );
}

// Preload the model
useGLTF.preload("/shirt.glb");

