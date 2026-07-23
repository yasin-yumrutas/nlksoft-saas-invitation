"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Edit3, Image as ImageIcon } from "lucide-react";
import { useTenant } from "@/context/TenantContext";

export default function CoupleSection() {
  const { tenant, isEditMode, handleEdit } = useTenant();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["20%", "0%"]);

  const config = tenant?.site_config || {};

  const brideName = config.bride_name || tenant?.bride_name || "Ayşe Yılmaz";
  const groomName = config.groom_name || tenant?.groom_name || "Mehmet Kaya";
  const brideDesc = config.bride_desc || "Doğayı seven, sanat tutkunu ve şimdi hayatının en büyük macerasına atılmaya hazırlanan müstakbel gelin.";
  const groomDesc = config.groom_desc || "Müzik aşığı, gezgin ve ruh eşini bulduğu için dünyanın en şanslı hisseden müstakbel damat.";
  
  const bridePhoto = config.bride_photo || "https://images.unsplash.com/photo-1546194784-938029283fcc?auto=format&fit=crop&q=80";
  const groomPhoto = config.groom_photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80";

  return (
    <section ref={ref} className="relative w-full min-h-screen bg-background py-32 flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-8 w-full">
        <div className="text-center mb-24">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-gold tracking-[0.3em] uppercase text-sm font-semibold mb-4 block"
          >
            Gelin & Damat
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl md:text-7xl text-foreground"
          >
            Bizim Hikayemiz
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-32">
          {/* Bride */}
          <motion.div style={{ y: y1 }} className="flex flex-col items-center">
            <div 
              className={`w-full aspect-[3/4] overflow-hidden rounded-sm relative group mb-8 ${isEditMode ? 'cursor-pointer ring-2 ring-blue-500/0 hover:ring-blue-500 transition-all' : ''}`}
              onClick={() => handleEdit('bride_photo', bridePhoto, "Gelin fotoğrafının URL bağlantısını girin:\n(Örn: https://...) ")}
            >
              <div className="absolute inset-0 bg-gold/20 mix-blend-overlay z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <img 
                src={bridePhoto} 
                alt="Bride"
                className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
              />
              {isEditMode && (
                <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-blue-600 p-3 rounded-full flex flex-col items-center">
                    <ImageIcon className="w-6 h-6 text-white" />
                    <span className="text-white text-xs mt-1 font-bold">Resmi Değiştir</span>
                  </div>
                </div>
              )}
            </div>
            <h3 
              className={`font-serif text-4xl mb-2 text-foreground relative group ${isEditMode ? 'cursor-pointer' : ''}`}
              onClick={() => handleEdit('bride_name', brideName, "Gelinin adını girin:")}
            >
              {brideName}
              {isEditMode && <Edit3 size={16} className="absolute -right-6 top-2 text-blue-400 opacity-0 group-hover:opacity-100" />}
            </h3>
            <p 
              className={`text-foreground/60 text-center font-sans max-w-sm relative group p-2 rounded-lg ${isEditMode ? 'cursor-pointer hover:bg-white/5' : ''}`}
              onClick={() => handleEdit('bride_desc', brideDesc, "Gelin için açıklama yazısını girin:")}
            >
              {brideDesc}
              {isEditMode && <Edit3 size={16} className="absolute -right-2 top-2 text-blue-400 opacity-0 group-hover:opacity-100" />}
            </p>
          </motion.div>

          {/* Groom */}
          <motion.div style={{ y: y2 }} className="flex flex-col items-center md:mt-32">
            <div 
              className={`w-full aspect-[3/4] overflow-hidden rounded-sm relative group mb-8 ${isEditMode ? 'cursor-pointer ring-2 ring-blue-500/0 hover:ring-blue-500 transition-all' : ''}`}
              onClick={() => handleEdit('groom_photo', groomPhoto, "Damat fotoğrafının URL bağlantısını girin:\n(Örn: https://...) ")}
            >
              <div className="absolute inset-0 bg-gold/20 mix-blend-overlay z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <img 
                src={groomPhoto} 
                alt="Groom"
                className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
              />
              {isEditMode && (
                <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-blue-600 p-3 rounded-full flex flex-col items-center">
                    <ImageIcon className="w-6 h-6 text-white" />
                    <span className="text-white text-xs mt-1 font-bold">Resmi Değiştir</span>
                  </div>
                </div>
              )}
            </div>
            <h3 
              className={`font-serif text-4xl mb-2 text-foreground relative group ${isEditMode ? 'cursor-pointer' : ''}`}
              onClick={() => handleEdit('groom_name', groomName, "Damat adını girin:")}
            >
              {groomName}
              {isEditMode && <Edit3 size={16} className="absolute -right-6 top-2 text-blue-400 opacity-0 group-hover:opacity-100" />}
            </h3>
            <p 
              className={`text-foreground/60 text-center font-sans max-w-sm relative group p-2 rounded-lg ${isEditMode ? 'cursor-pointer hover:bg-white/5' : ''}`}
              onClick={() => handleEdit('groom_desc', groomDesc, "Damat için açıklama yazısını girin:")}
            >
              {groomDesc}
              {isEditMode && <Edit3 size={16} className="absolute -right-2 top-2 text-blue-400 opacity-0 group-hover:opacity-100" />}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
