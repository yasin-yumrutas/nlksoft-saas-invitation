"use client";

import { motion } from "framer-motion";
import { Edit3, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { useTenant } from "@/context/TenantContext";

const defaultImages = [
  { url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80" },
  { url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80" },
  { url: "https://images.unsplash.com/photo-1583939411023-14783179e581?auto=format&fit=crop&q=80" },
  { url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80" },
  { url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80" },
  { url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80" },
];

export default function GallerySection() {
  const { tenant, isEditMode, handleEdit, handleEditArray, handleAddArrayItem, handleRemoveArrayItem } = useTenant();
  const config = tenant?.site_config || {};

  const sectionSubtitle = config.gallery_subtitle || "Anılarımız";
  const sectionTitle = config.gallery_title || "Fotoğraf Galerisi";
  const images = config.gallery_images || defaultImages;

  return (
    <section className="w-full bg-background py-32 px-4 md:px-8">
      <div className="max-w-7xl mx-auto w-full">
        <div className="text-center mb-16 relative">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-gold tracking-[0.3em] uppercase text-sm font-semibold mb-4 block relative inline-block group ${isEditMode ? 'cursor-pointer' : ''}`}
            onClick={() => handleEdit('gallery_subtitle', sectionSubtitle, "Alt başlığı girin:")}
          >
            {sectionSubtitle}
            {isEditMode && <Edit3 size={14} className="absolute -right-6 top-0 text-blue-400 opacity-0 group-hover:opacity-100" />}
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={`font-serif text-5xl md:text-6xl text-foreground relative inline-block group ${isEditMode ? 'cursor-pointer' : ''}`}
            onClick={() => handleEdit('gallery_title', sectionTitle, "Ana başlığı girin:")}
          >
            {sectionTitle}
            {isEditMode && <Edit3 size={20} className="absolute -right-8 top-4 text-blue-400 opacity-0 group-hover:opacity-100" />}
          </motion.h2>

          {isEditMode && (
            <div className="mt-8 flex justify-center w-full">
              <button 
                onClick={() => handleAddArrayItem('gallery_images', images, { url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80" })}
                className="flex items-center gap-2 px-6 py-3 bg-gold/10 hover:bg-gold/20 text-gold rounded-full border border-gold/30 transition-all shadow-lg"
              >
                <Plus size={20} />
                <span className="font-semibold uppercase tracking-wider text-sm">Yeni Fotoğraf Ekle</span>
              </button>
            </div>
          )}
        </div>

        {/* Masonry Layout approximation using CSS columns */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {images.map((img: any, index: number) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`break-inside-avoid relative group/img overflow-hidden rounded-sm border border-gold/10 ${isEditMode ? 'cursor-pointer ring-2 ring-transparent hover:ring-blue-500' : ''}`}
            >
              <div 
                className="relative w-full h-full block"
                onClick={() => handleEditArray('gallery_images', images, index, 'url', "Resim URL'sini girin:")}
              >
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
                <img 
                  src={img.url || img} // Backward compatibility if array of strings
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-auto object-cover transform group-hover/img:scale-105 transition-transform duration-700 filter grayscale group-hover/img:grayscale-0"
                />
                {isEditMode && (
                  <div className="absolute inset-0 bg-black/50 z-30 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                    <div className="bg-blue-600 p-3 rounded-full flex flex-col items-center">
                      <ImageIcon className="w-6 h-6 text-white" />
                      <span className="text-white text-xs mt-1 font-bold">Resmi Değiştir</span>
                    </div>
                  </div>
                )}
              </div>
              
              {isEditMode && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveArrayItem('gallery_images', images, index);
                  }}
                  className="absolute top-4 right-4 p-2 bg-black/70 hover:bg-red-500 text-white rounded-full transition-all z-40 opacity-0 group-hover/img:opacity-100 shadow-xl"
                  title="Bu fotoğrafı sil"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
