"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [loading, setLoading] = useState(false);
  const [particles, setParticles] = useState<{w: number, h: number, l: number, t: number, o: number, dur: number, yDest: number, xDest: number}[]>([]);

  useEffect(() => {
    // Only show loading screen once per browser session
    const hasSeenLoading = sessionStorage.getItem("hasSeenLoading");
    if (hasSeenLoading) {
      setLoading(false);
      return;
    }

    // Mark as seen immediately so navigating back doesn't replay it
    sessionStorage.setItem("hasSeenLoading", "true");
    setLoading(true);

    // Generate particles on client side only to avoid hydration mismatch
    setParticles(
      Array.from({ length: 30 }).map(() => ({
        w: Math.random() * 4 + 1,
        h: Math.random() * 4 + 1,
        l: Math.random() * 100,
        t: Math.random() * 100,
        o: Math.random() * 0.5 + 0.1,
        dur: Math.random() * 2 + 2,
        yDest: Math.random() * -100 - 50,
        xDest: (Math.random() - 0.5) * 50
      }))
    );

    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.1, 
            filter: "blur(20px)", 
            transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] } 
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden"
        >
          {/* Scanlines Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-20"
               style={{
                 backgroundImage: "repeating-linear-gradient(transparent, transparent 2px, rgba(0, 0, 0, 0.5) 2px, rgba(0, 0, 0, 0.5) 4px)",
                 backgroundSize: "100% 4px",
                 zIndex: 10
               }}
          />

          {/* Grain Texture (CSS trick) */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
               style={{
                 backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')",
                 backgroundRepeat: "repeat",
                 zIndex: 9
               }}
          />

          {/* Heavy Bass Transitions (Simulated with scaling pulses) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [0.8, 1.2, 1], opacity: [0, 1, 1] }}
            transition={{ duration: 2, ease: "easeInOut", times: [0, 0.5, 1] }}
            className="absolute inset-0 bg-primary/10 rounded-full blur-[100px] mix-blend-screen"
            style={{ width: '150vw', height: '150vh', top: '-25vh', left: '-25vw' }}
          />

          {/* Animated Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-20 flex flex-col items-center"
          >
            <motion.h1 
              className="text-7xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text text-glow uppercase"
              style={{
                backgroundImage: "linear-gradient(to bottom right, #FFD700, #ff8c00)"
              }}
              initial={{ opacity: 0, x: -200 }}
              animate={{
                opacity: 1,
                x: 0,
                textShadow: ["0px 0px 0px #FFD700", "0px 0px 40px #FFD700", "0px 0px 10px #FFD700"]
              }}
              transition={{ 
                x: { duration: 1.5, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 1.5, ease: [0.16, 1, 0.3, 1] },
                textShadow: { duration: 2.5, repeat: Infinity, repeatType: "reverse", delay: 1.2 }
              }}
            >
              AG AGUU
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="mt-4 text-primary-dark tracking-[0.5em] text-sm uppercase"
            >
              agu universe
            </motion.p>
          </motion.div>

          {/* Floating Particles */}
          {particles.map((p, i) => (
            <motion.div
              key={i}
              className="absolute bg-primary rounded-full"
              style={{
                width: p.w + "px",
                height: p.h + "px",
                left: p.l + "vw",
                top: p.t + "vh",
                opacity: p.o,
              }}
              animate={{
                y: [0, p.yDest],
                x: [0, p.xDest],
                opacity: [null, 0],
              }}
              transition={{
                duration: p.dur,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
