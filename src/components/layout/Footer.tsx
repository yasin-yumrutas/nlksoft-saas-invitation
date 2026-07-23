"use client";

import { motion } from "framer-motion";
import { useTenant } from "@/context/TenantContext";

export default function Footer() {
  const { tenant } = useTenant();
  
  const isCorporate = tenant?.site_config?.template_type === 'corporate';
  const brideName = tenant?.bride_name || "Gelin";
  const groomName = tenant?.groom_name || "Damat";

  return (
    <footer className="w-full bg-[#050505] text-white/50 py-16 border-t border-gold/10 flex flex-col items-center text-center">
      <div className="max-w-4xl mx-auto px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-serif text-4xl text-gold mb-2">
            {isCorporate ? brideName : `${brideName} & ${groomName}`}
          </h2>
          {isCorporate && <p className="text-xl text-white/70 italic font-serif mb-6">{groomName}</p>}
          
          <div className="flex items-center justify-center gap-8 mb-12 text-sm font-sans mt-8">
            <a href="#" className="hover:text-gold transition-colors">Instagram</a>
            <span className="w-1 h-1 bg-gold rounded-full" />
            <a href="#" className="hover:text-gold transition-colors">Pinterest</a>
            <span className="w-1 h-1 bg-gold rounded-full" />
            <a href="#" className="hover:text-gold transition-colors">Bize Ulaşın</a>
          </div>

          <div className="w-full h-[1px] bg-white/10 mb-8" />
          
          <p className="text-xs font-sans">
            © {new Date().getFullYear()} <span className="text-gold font-semibold tracking-wider">NLKSOFT</span>. Tüm hakları saklıdır.
          </p>
          <p className="text-[10px] font-sans mt-2 opacity-50 uppercase tracking-widest">
            Premium Dijital Davetiye Platformu
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
