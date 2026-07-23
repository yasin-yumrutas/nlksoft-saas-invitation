"use client";

import { motion } from "framer-motion";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { useTenant } from "@/context/TenantContext";

const defaultProgramSteps = [
  { time: "17:00", title: "Karşılama & Kokteyl", description: "Misafirlerimizin karşılanması ve hafif atıştırmalıklar eşliğinde canlı müzik." },
  { time: "18:00", title: "Nikah Töreni", description: "Hayatımızı birleştireceğimiz o özel an için bahçede toplanıyoruz." },
  { time: "19:00", title: "Akşam Yemeği", description: "Şefin özel menüsü ile lezzetli bir akşam yemeği." },
  { time: "20:30", title: "İlk Dans", description: "Çiftin ilk dansı ve ardından pastanın kesilmesi." },
  { time: "21:00", title: "Eğlence & Parti", description: "DJ performansı ile gece boyunca sınırsız eğlence." },
];

export default function ProgramSection() {
  const { tenant, isEditMode, handleEdit, handleEditArray, handleAddArrayItem, handleRemoveArrayItem } = useTenant();
  const config = tenant?.site_config || {};
  
  const sectionTitle = config.program_title || "Düğün Programı";
  const sectionSubtitle = config.program_subtitle || "Büyük Gün";
  const programSteps = config.program_steps || defaultProgramSteps;

  return (
    <section className="relative w-full py-32 bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto px-8 w-full">
        <div className="text-center mb-24">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-gold tracking-[0.3em] uppercase text-sm font-semibold mb-4 block relative group inline-block ${isEditMode ? 'cursor-pointer' : ''}`}
            onClick={() => handleEdit('program_subtitle', sectionSubtitle, "Alt başlığı girin:")}
          >
            {sectionSubtitle}
            {isEditMode && <Edit3 size={14} className="absolute -right-6 top-0 text-blue-400 opacity-0 group-hover:opacity-100" />}
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={`font-serif text-5xl md:text-7xl relative group inline-block ${isEditMode ? 'cursor-pointer' : ''}`}
            onClick={() => handleEdit('program_title', sectionTitle, "Ana başlığı girin:")}
          >
            {sectionTitle}
            {isEditMode && <Edit3 size={20} className="absolute -right-8 top-4 text-blue-400 opacity-0 group-hover:opacity-100" />}
          </motion.h2>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[15px] md:left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-gold/50 to-transparent -translate-x-1/2" />

          <div className="flex flex-col gap-12">
            {programSteps.map((step: any, index: number) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex flex-col md:flex-row items-start md:items-center w-full relative group/item ${isEven ? 'md:flex-row-reverse' : ''}`}
                >
                  {isEditMode && (
                    <button 
                      onClick={() => handleRemoveArrayItem('program_steps', programSteps, index)}
                      className="absolute top-0 right-0 md:-right-8 p-2 text-red-500 opacity-0 group-hover/item:opacity-100 hover:bg-red-500/10 rounded-full transition-all z-20"
                      title="Bu program adımını sil"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}

                  <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${isEven ? 'md:text-left md:pl-16' : 'md:text-right md:pr-16'}`}>
                    <div 
                      className={`font-serif text-3xl text-gold mb-2 relative group inline-block ${isEditMode ? 'cursor-pointer' : ''}`}
                      onClick={() => handleEditArray('program_steps', programSteps, index, 'time', "Zamanı girin (Örn: 17:00):")}
                    >
                      {step.time}
                      {isEditMode && <Edit3 size={14} className="absolute -right-5 top-2 text-blue-400 opacity-0 group-hover:opacity-100" />}
                    </div>
                    
                    <h3 
                      className={`font-serif text-2xl mb-3 relative group inline-block ${isEditMode ? 'cursor-pointer' : ''}`}
                      onClick={() => handleEditArray('program_steps', programSteps, index, 'title', "Program başlığını girin:")}
                    >
                      {step.title}
                      {isEditMode && <Edit3 size={14} className="absolute -right-5 top-2 text-blue-400 opacity-0 group-hover:opacity-100" />}
                    </h3>
                    
                    <p 
                      className={`text-white/60 font-sans leading-relaxed relative group rounded-md p-2 ${isEditMode ? 'cursor-pointer hover:bg-white/10' : ''}`}
                      onClick={() => handleEditArray('program_steps', programSteps, index, 'description', "Açıklamayı girin:")}
                    >
                      {step.description}
                      {isEditMode && <Edit3 size={14} className="absolute -right-2 top-2 text-blue-400 opacity-0 group-hover:opacity-100" />}
                    </p>
                  </div>
                  
                  {/* Dot */}
                  <div className="absolute left-[15px] md:left-1/2 w-[9px] h-[9px] bg-gold rounded-full -translate-x-1/2 mt-2 md:mt-0 shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
                  
                  <div className="hidden md:block w-1/2" />
                </motion.div>
              );
            })}
          </div>
          
          {isEditMode && (
            <div className="mt-16 flex justify-center w-full relative z-20">
              <button 
                onClick={() => handleAddArrayItem('program_steps', programSteps, { time: "22:00", title: "Yeni Program", description: "Program açıklaması ekleyin." })}
                className="flex items-center gap-2 px-6 py-3 bg-gold/10 hover:bg-gold/20 text-gold rounded-full border border-gold/30 transition-all shadow-lg"
              >
                <Plus size={20} />
                <span className="font-semibold uppercase tracking-wider text-sm">Yeni Program Ekle</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
