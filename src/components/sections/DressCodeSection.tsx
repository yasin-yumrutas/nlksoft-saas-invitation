"use client";

import { motion } from "framer-motion";
import { Edit3, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { useTenant } from "@/context/TenantContext";

const defaultColors = [
  { name: "Koyu Yeşil", hex: "#1a332a" },
  { name: "Siyah", hex: "#000000" },
  { name: "Altın/Şampanya", hex: "#d4af37" },
  { name: "Krem", hex: "#fdfbf7" },
];

export default function DressCodeSection() {
  const { tenant, isEditMode, handleEdit, handleEditArray, handleAddArrayItem, handleRemoveArrayItem } = useTenant();
  const config = tenant?.site_config || {};

  const sectionSubtitle = config.dresscode_subtitle || "Konsept";
  const sectionTitle = config.dresscode_title || "Kıyafet Kodu";
  const sectionDesc = config.dresscode_desc || "Düğünümüzde 'Black Tie Optional' konsepti geçerlidir. Gecenin atmosferine uyum sağlaması adına koyu yeşil, şampanya, toprak tonları ve siyah renkleri tercih etmeniz bizi çok mutlu edecektir.";
  
  const colors = config.dresscode_colors || defaultColors;

  const ladiesImage = config.dresscode_ladies_image || "https://images.unsplash.com/photo-1594938298596-f9d23dbdf7b0?auto=format&fit=crop&q=80";
  const gentsImage = config.dresscode_gents_image || "https://images.unsplash.com/photo-1593030761757-71fae4630bd2?auto=format&fit=crop&q=80";

  return (
    <section className="relative w-full bg-[#0a0a0a] py-32 flex flex-col items-center justify-center text-center overflow-hidden">
      
      {/* Background blur effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-gold/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-white/5 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto px-8 w-full relative z-10">
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`text-gold tracking-[0.3em] uppercase text-sm font-semibold mb-4 block relative inline-block group ${isEditMode ? 'cursor-pointer' : ''}`}
          onClick={() => handleEdit('dresscode_subtitle', sectionSubtitle, "Alt başlığı girin:")}
        >
          {sectionSubtitle}
          {isEditMode && <Edit3 size={14} className="absolute -right-6 top-0 text-blue-400 opacity-0 group-hover:opacity-100" />}
        </motion.span>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className={`font-serif text-5xl md:text-6xl text-white mb-8 relative inline-block group ${isEditMode ? 'cursor-pointer' : ''}`}
          onClick={() => handleEdit('dresscode_title', sectionTitle, "Ana başlığı girin:")}
        >
          {sectionTitle}
          {isEditMode && <Edit3 size={20} className="absolute -right-8 top-4 text-blue-400 opacity-0 group-hover:opacity-100" />}
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className={`text-white/60 font-sans max-w-2xl mx-auto mb-16 leading-relaxed relative group p-2 rounded ${isEditMode ? 'cursor-pointer hover:bg-white/5' : ''}`}
          onClick={() => handleEdit('dresscode_desc', sectionDesc, "Kıyafet kuralı açıklamasını girin:")}
        >
          {sectionDesc}
          {isEditMode && <Edit3 size={16} className="absolute -right-2 top-2 text-blue-400 opacity-0 group-hover:opacity-100" />}
        </motion.p>

        {/* Color Palette */}
        <div className="relative w-full flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-6 mb-8"
          >
            {colors.map((color: any, idx: number) => (
              <div key={idx} className="flex flex-col items-center gap-3 relative group/color">
                {isEditMode && (
                  <button 
                    onClick={() => handleRemoveArrayItem('dresscode_colors', colors, idx)}
                    className="absolute -top-3 -right-3 p-1.5 bg-red-500 text-white rounded-full transition-all z-40 opacity-0 group-hover/color:opacity-100 shadow-xl"
                    title="Bu rengi sil"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
                <div 
                  className={`w-16 h-16 rounded-full border border-white/20 shadow-lg relative group/hex ${isEditMode ? 'cursor-pointer' : ''}`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => handleEditArray('dresscode_colors', colors, idx, 'hex', "Renk kodunu girin (Örn: #1a332a):")}
                >
                  {isEditMode && (
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover/hex:opacity-100 transition-opacity">
                      <Edit3 size={16} className="text-white" />
                    </div>
                  )}
                </div>
                <span 
                  className={`text-xs text-white/50 tracking-wider uppercase font-semibold relative group/name p-1 rounded ${isEditMode ? 'cursor-pointer hover:bg-white/10' : ''}`}
                  onClick={() => handleEditArray('dresscode_colors', colors, idx, 'name', "Renk adını girin:")}
                >
                  {color.name}
                  {isEditMode && <Edit3 size={10} className="absolute -right-3 top-1 text-blue-400 opacity-0 group-hover/name:opacity-100" />}
                </span>
              </div>
            ))}
          </motion.div>

          {isEditMode && (
            <div className="mb-16">
              <button 
                onClick={() => handleAddArrayItem('dresscode_colors', colors, { name: "Yeni Renk", hex: "#ffffff" })}
                className="flex items-center gap-2 px-4 py-2 bg-gold/10 hover:bg-gold/20 text-gold rounded-full border border-gold/30 transition-all shadow-lg"
              >
                <Plus size={16} />
                <span className="font-semibold uppercase tracking-wider text-xs">Yeni Renk Ekle</span>
              </button>
            </div>
          )}
        </div>

        {/* Style Inspiration Images */}
        <div className="grid grid-cols-2 gap-4 md:gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`aspect-[3/4] rounded-sm overflow-hidden border border-gold/10 relative group ${isEditMode ? 'cursor-pointer ring-2 ring-transparent hover:ring-blue-500' : ''}`}
            onClick={() => handleEdit('dresscode_ladies_image', ladiesImage, "Kadın konsept resmi URL'sini girin:")}
          >
            <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-transparent transition-all duration-700" />
            <img 
              src={ladiesImage} 
              alt="Ladies Style" 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            />
            <div className="absolute bottom-6 w-full text-center z-20">
              <span className="text-white tracking-[0.2em] font-serif uppercase text-sm drop-shadow-md">Kadın</span>
            </div>
            {isEditMode && (
              <div className="absolute inset-0 bg-black/50 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-blue-600 p-3 rounded-full flex flex-col items-center">
                  <ImageIcon className="w-6 h-6 text-white" />
                  <span className="text-white text-xs mt-1 font-bold">Resmi Değiştir</span>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`aspect-[3/4] rounded-sm overflow-hidden border border-gold/10 relative group ${isEditMode ? 'cursor-pointer ring-2 ring-transparent hover:ring-blue-500' : ''}`}
            onClick={() => handleEdit('dresscode_gents_image', gentsImage, "Erkek konsept resmi URL'sini girin:")}
          >
            <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-transparent transition-all duration-700" />
            <img 
              src={gentsImage} 
              alt="Gentlemen Style" 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            />
            <div className="absolute bottom-6 w-full text-center z-20">
              <span className="text-white tracking-[0.2em] font-serif uppercase text-sm drop-shadow-md">Erkek</span>
            </div>
            {isEditMode && (
              <div className="absolute inset-0 bg-black/50 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-blue-600 p-3 rounded-full flex flex-col items-center">
                  <ImageIcon className="w-6 h-6 text-white" />
                  <span className="text-white text-xs mt-1 font-bold">Resmi Değiştir</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
