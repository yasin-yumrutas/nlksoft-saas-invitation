"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, MailOpen } from "lucide-react";
import EnvelopeScene from "../three/EnvelopeScene";

export default function WelcomeScreen({ onComplete }: { onComplete: () => void }) {
  const [stage, setStage] = useState<"initial" | "opening" | "entering">("initial");
  const [audioEnabled, setAudioEnabled] = useState<boolean | null>(null);

  const handleOpen = (withAudio: boolean) => {
    setAudioEnabled(withAudio);
    setStage("opening");
    
    if (withAudio) {
      // Initialize audio here in the future
      // const audio = new Audio('/romantic-bgm.mp3');
      // audio.play();
    }

    // Trigger the 3D envelope opening animation duration
    setTimeout(() => {
      setStage("entering");
      setTimeout(() => {
        onComplete();
      }, 2000); // Wait for camera to dive into envelope
    }, 4000); // 4 seconds for envelope to open
  };

  return (
    <div className="fixed inset-0 z-50 w-full h-full bg-[#0a0a0a] overflow-hidden">
      {/* 3D Envelope Canvas */}
      <div className="absolute inset-0 w-full h-full">
        <EnvelopeScene stage={stage} />
      </div>

      {/* UI Overlay */}
      <AnimatePresence>
        {stage === "initial" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-end pb-32 z-10 pointer-events-auto"
          >
            <div className="backdrop-blur-md bg-black/40 p-8 rounded-2xl border border-gold/20 flex flex-col items-center text-center max-w-sm w-full mx-4 shadow-2xl">
              <h2 className="font-serif text-3xl text-gold mb-8">Davetiyeyi Aç</h2>
              
              <div className="flex flex-col gap-4 w-full">
                <button 
                  onClick={() => handleOpen(true)}
                  className="flex items-center justify-center gap-3 w-full bg-gold text-background py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gold-light transition-all"
                >
                  <Volume2 className="w-5 h-5" /> Sesi Açarak Devam Et
                </button>
                
                <button 
                  onClick={() => handleOpen(false)}
                  className="flex items-center justify-center gap-3 w-full bg-transparent border border-white/20 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  <VolumeX className="w-5 h-5" /> Sessiz Devam Et
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entering Flash Effect */}
      <AnimatePresence>
        {stage === "entering" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-white z-20"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
