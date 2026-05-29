"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import HeroShirt from "./HeroShirt";

export default function Scene() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-auto touch-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: true,
        }}
      >
        <Suspense fallback={null}>
          <HeroShirt />
        </Suspense>
      </Canvas>
    </div>
  );
}
