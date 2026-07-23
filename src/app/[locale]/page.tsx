"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Scene from "@/components/three/Scene";

export default function PlatformLandingPage() {
  return (
    <main className="relative w-full min-h-screen bg-background text-foreground font-sans flex flex-col items-center justify-center overflow-hidden">
      
      {/* 3D Scene Background */}
      <div className="absolute inset-0 w-full h-full z-0 opacity-50 pointer-events-none">
        <Scene />
      </div>

      <div className="relative z-10 w-full max-w-4xl p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <span className="text-gold tracking-[0.3em] uppercase text-sm font-semibold mb-4 block">
            NLKSOFT Dijital Etkinlik & Davetiye Platformu
          </span>
          <h1 className="font-serif text-5xl md:text-7xl text-gradient-gold mb-6">
            Sonsuzluğa İlk Adım
          </h1>
          <p className="text-foreground/80 md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            Sadece bir davetiye değil, misafirlerinizin unutamayacağı interaktif bir deneyim oluşturun. 
            Düğün, gala veya kurumsal lansmanlarınız için kendi temanızı seçin, masalarınızı tasarlayın ve misafirlerinizin yerini ayırtmasına izin verin.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Demo Link */}
            <Link 
              href="/tr/ayse-mehmet"
              className="group relative p-6 bg-white/5 border border-gold/20 rounded-2xl hover:bg-gold/10 transition-all duration-300"
            >
              <h3 className="font-serif text-2xl text-gold mb-2 group-hover:text-gold-light">Örnek Davetiye Gör</h3>
              <p className="text-sm text-foreground/60">Örnek bir etkileşimli davetiyeyi ve LCV (koltuk seçim) sistemini inceleyin.</p>
            </Link>

            {/* Master Admin Link */}
            <Link 
              href="/tr/master-admin"
              className="group relative p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300"
            >
              <h3 className="font-serif text-2xl text-white mb-2">Sistem Yönetimi (Master Admin)</h3>
              <p className="text-sm text-foreground/60">Tüm şablonları, müşterileri ve etkinlikleri tek bir panelden yönetin.</p>
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-8 text-center w-full z-10 opacity-50 text-xs tracking-widest uppercase">
        © 2026 NLKSOFT Platform
      </div>
    </main>
  );
}
