"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Edit3, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { useTenant } from "@/context/TenantContext";

const defaultTimelineEvents = [
  {
    date: "14 Şubat 2024",
    title: "İlk Tanışma",
    description: "Bir kahve dükkanında başlayan o tesadüfi buluşma, hayatlarımızın en güzel hikayesinin başlangıcı oldu. Göz göze geldiğimiz ilk an, zamanın durduğu andı.",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80",
  },
  {
    date: "20 Haziran 2024",
    title: "İlk Tatil",
    description: "Birlikte keşfettiğimiz o ilk şehir, sadece yeni yerler görmemizi değil, birbirimizin kalbindeki yeni dünyaları keşfetmemizi sağladı.",
    image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80",
  },
  {
    date: "31 Aralık 2024",
    title: "Büyük Sürpriz",
    description: "Yeni yıla girerken gelen o sihirli soru ve gözyaşları içinde söylenen 'Evet!'. Hayatımızın geri kalanını birlikte geçirmeye söz verdik.",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80",
  },
  {
    date: "Bugün",
    title: "Sonsuzluk",
    description: "Ve şimdi, tüm sevdiklerimizin şahitliğinde bu güzel hikayeyi sonsuzluğa taşıyoruz. Bu masalın en güzel bölümüne hoş geldiniz.",
    image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80",
  }
];

function CinematicSection({ event, index, timelineEvents }: { event: typeof defaultTimelineEvents[0], index: number, timelineEvents: any[] }) {
  const { isEditMode, handleEditArray, handleRemoveArrayItem } = useTenant();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Parallax effect for the image
  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const isEven = index % 2 === 0;

  return (
    <section ref={ref} className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden group/section">
      {/* Background Parallax Image */}
      <motion.div 
        style={{ y }}
        className={`absolute inset-0 w-full h-[120%] -top-[10%] z-0 group ${isEditMode ? 'cursor-pointer ring-2 ring-transparent hover:ring-blue-500' : ''}`}
        onClick={() => handleEditArray('timeline_events', timelineEvents, index, 'image', "Arka plan resmi URL'sini girin:")}
      >
        <div className="absolute inset-0 bg-black/40 z-10" /> {/* Dark overlay for text readability */}
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-full object-cover"
        />
        {isEditMode && (
          <div className="absolute inset-0 bg-black/50 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-blue-600 p-3 rounded-full flex flex-col items-center">
              <ImageIcon className="w-6 h-6 text-white" />
              <span className="text-white text-xs mt-1 font-bold">Resmi Değiştir</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Delete button */}
      {isEditMode && (
        <button 
          onClick={() => handleRemoveArrayItem('timeline_events', timelineEvents, index)}
          className="absolute top-8 right-8 p-3 bg-black/50 hover:bg-red-500 text-white rounded-full transition-all z-40 opacity-0 group-hover/section:opacity-100 shadow-xl"
          title="Bu anıyı sil"
        >
          <Trash2 size={24} />
        </button>
      )}

      {/* Content */}
      <motion.div 
        style={{ opacity }}
        className={`relative z-20 w-full max-w-7xl mx-auto px-8 flex flex-col ${isEven ? 'items-start' : 'items-end'}`}
      >
        <div className="max-w-xl backdrop-blur-md bg-white/5 border border-white/10 p-12 rounded-sm text-white relative">
          <span 
            className={`text-gold-light tracking-[0.3em] uppercase text-sm font-semibold mb-4 block relative inline-block group/date ${isEditMode ? 'cursor-pointer' : ''}`}
            onClick={() => handleEditArray('timeline_events', timelineEvents, index, 'date', "Tarihi girin:")}
          >
            {event.date}
            {isEditMode && <Edit3 size={12} className="absolute -right-4 top-0 text-blue-400 opacity-0 group-hover/date:opacity-100" />}
          </span>
          <h2 
            className={`font-serif text-5xl md:text-6xl mb-6 relative inline-block group/title ${isEditMode ? 'cursor-pointer' : ''}`}
            onClick={() => handleEditArray('timeline_events', timelineEvents, index, 'title', "Başlığı girin:")}
          >
            {event.title}
            {isEditMode && <Edit3 size={16} className="absolute -right-6 top-2 text-blue-400 opacity-0 group-hover/title:opacity-100" />}
          </h2>
          <p 
            className={`font-sans text-lg md:text-xl leading-relaxed text-white/90 relative rounded p-2 group/desc ${isEditMode ? 'cursor-pointer hover:bg-white/10' : ''}`}
            onClick={() => handleEditArray('timeline_events', timelineEvents, index, 'description', "Açıklamayı girin:")}
          >
            {event.description}
            {isEditMode && <Edit3 size={16} className="absolute -right-2 top-2 text-blue-400 opacity-0 group-hover/desc:opacity-100" />}
          </p>
        </div>
      </motion.div>
    </section>
  );
}

export default function CinematicTimeline() {
  const { tenant, isEditMode, handleAddArrayItem } = useTenant();
  const config = tenant?.site_config || {};
  const timelineEvents = config.timeline_events || defaultTimelineEvents;

  return (
    <div className="w-full bg-[#111] flex flex-col relative z-20">
      {/* Spacer to transition from light theme to dark cinematic theme */}
      <div className="w-full h-32 bg-gradient-to-b from-transparent to-[#111]"></div>
      
      {timelineEvents.map((event: any, index: number) => (
        <CinematicSection key={index} event={event} index={index} timelineEvents={timelineEvents} />
      ))}
      
      {isEditMode && (
        <div className="py-16 flex justify-center w-full relative z-20">
          <button 
            onClick={() => handleAddArrayItem('timeline_events', timelineEvents, { date: "Yeni Tarih", title: "Yeni Anı", description: "Bu anıyı anlatan bir açıklama.", image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80" })}
            className="flex items-center gap-2 px-6 py-3 bg-gold/10 hover:bg-gold/20 text-gold rounded-full border border-gold/30 transition-all shadow-lg"
          >
            <Plus size={20} />
            <span className="font-semibold uppercase tracking-wider text-sm">Yeni Anı Ekle</span>
          </button>
        </div>
      )}

      {/* Spacer back out */}
      <div className="w-full h-32 bg-gradient-to-b from-[#111] to-transparent"></div>
    </div>
  );
}
