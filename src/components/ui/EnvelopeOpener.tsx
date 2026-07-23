"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTenant } from "@/context/TenantContext";

export default function EnvelopeOpener({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPreloading, setIsPreloading] = useState(true);
  const { tenant } = useTenant();

  // Determine colors based on template type
  const isCorporate = tenant?.site_config?.template_type === 'corporate';
  const bgColor = isCorporate ? "bg-zinc-950" : "bg-background";
  const doorsColor = isCorporate ? "bg-zinc-950" : "bg-white";
  const borderColor = isCorporate ? "border-gold/30" : "border-gold/20";
  const firstLetter = isCorporate ? (tenant.bride_name?.charAt(0) || "N") : (tenant.bride_name?.charAt(0) || "A");

  useEffect(() => {
    // Preloader Timer
    const timer = setTimeout(() => {
      setIsPreloading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isPreloading || !isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    
    return () => {
      document.body.style.overflow = "auto";
    }
  }, [isPreloading, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        {isPreloading && (
          <motion.div
            className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center ${bgColor}`}
            exit={{ opacity: 0, filter: "blur(10px)", transition: { duration: 1.5, ease: "easeInOut" } }}
          >
            <svg viewBox="0 0 100 100" className="w-24 h-24">
              <motion.path
                d="M 20 80 L 20 20 L 80 80 L 80 20"
                stroke="var(--color-gold)"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </svg>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1 }}
              className="mt-8 font-sans text-gold tracking-[0.4em] uppercase text-xs"
            >
              Yükleniyor...
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isPreloading && !isOpen && (
          <motion.div
            className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden ${bgColor}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.2, delay: 0.8 } }}
          >
            <motion.div
              className={`absolute top-0 bottom-0 left-0 w-1/2 border-r ${doorsColor} ${borderColor} z-10`}
              exit={{ x: "-100%", transition: { duration: 1.8, ease: [0.77, 0, 0.175, 1] } }}
            />
            <motion.div
              className={`absolute top-0 bottom-0 right-0 w-1/2 border-l ${doorsColor} ${borderColor} z-10`}
              exit={{ x: "100%", transition: { duration: 1.8, ease: [0.77, 0, 0.175, 1] } }}
            />

            <motion.div
              className="relative z-20 flex flex-col items-center cursor-pointer group"
              onClick={handleOpen}
              exit={{ scale: 3, opacity: 0, filter: "blur(20px)", transition: { duration: 1 } }}
            >
              <div className="w-24 h-24 rounded-full flex items-center justify-center relative transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-[5deg]"
                   style={{
                     background: "radial-gradient(circle at 35% 35%, #e1c87e, #a37c22, #6b5011)",
                     boxShadow: "0 10px 25px rgba(0,0,0,0.5), inset 0 -3px 15px rgba(0,0,0,0.4), inset 0 2px 5px rgba(255,255,255,0.4)"
                   }}>
                <div className="absolute w-[85%] h-[85%] rounded-full border border-white/20" />
                <span className="font-serif text-4xl text-white drop-shadow-md">{firstLetter}</span>
              </div>
              <span className="mt-8 font-sans text-xs tracking-[0.4em] uppercase text-foreground/80 animate-pulse">
                Açmak İçin Tıklayın
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={isOpen ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}>
        {children}
      </div>
    </>
  );
}
