"use client";

import { motion } from "framer-motion";
import { MapPin, Navigation, Car, Bus, Edit3, Image as ImageIcon } from "lucide-react";
import { useTenant } from "@/context/TenantContext";

export default function LocationSection() {
  const { tenant, isEditMode, handleEdit } = useTenant();
  const config = tenant?.site_config || {};

  const locationTitle = config.location_title || "Mekan & Ulaşım";
  const venueName = config.venue_name || "Garden Palace";
  const venueAddress = config.venue_address || "Gaziantep Şehitkamil, 100. Yıl Atatürk Kültür Parkı İçi, Göl Kenarı Mevkii.";
  const mapUrl = config.map_url || "https://maps.google.com";
  const parkingTitle = config.parking_title || "Özel Araç & Otopark";
  const parkingDesc = config.parking_desc || "Mekanımızın 500 araçlık ücretsiz valeli otoparkı bulunmaktadır.";
  const transitTitle = config.transit_title || "Toplu Taşıma";
  const transitDesc = config.transit_desc || "Tramvay ile 'Kültür Parkı' durağında inerek 5 dk yürüme mesafesindedir.";
  const mapImage = config.map_image || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80";

  return (
    <section className="relative w-full bg-background py-32 flex items-center justify-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-gold tracking-[0.3em] uppercase text-sm font-semibold mb-4 block">
            Neredeyiz?
          </span>
          <h2 
            className={`font-serif text-5xl md:text-6xl text-foreground mb-8 relative group inline-block ${isEditMode ? 'cursor-pointer' : ''}`}
            onClick={() => handleEdit('location_title', locationTitle, "Başlığı girin:")}
          >
            {locationTitle}
            {isEditMode && <Edit3 size={16} className="absolute -right-6 top-2 text-blue-400 opacity-0 group-hover:opacity-100" />}
          </h2>
          
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <MapPin className="w-8 h-8 text-gold shrink-0 mt-1" />
              <div>
                <h3 
                  className={`font-serif text-2xl text-foreground mb-2 relative group inline-block ${isEditMode ? 'cursor-pointer' : ''}`}
                  onClick={() => handleEdit('venue_name', venueName, "Mekan adını girin:")}
                >
                  {venueName}
                  {isEditMode && <Edit3 size={14} className="absolute -right-5 top-1 text-blue-400 opacity-0 group-hover:opacity-100" />}
                </h3>
                <p 
                  className={`text-foreground/70 font-sans leading-relaxed mb-4 relative group rounded p-2 ${isEditMode ? 'cursor-pointer hover:bg-foreground/5' : ''}`}
                  onClick={() => handleEdit('venue_address', venueAddress, "Adresi girin:")}
                >
                  {venueAddress}
                  {isEditMode && <Edit3 size={14} className="absolute -right-2 top-2 text-blue-400 opacity-0 group-hover:opacity-100" />}
                </p>
                <div 
                  className={`inline-flex items-center gap-2 text-gold hover:text-gold-dark transition-colors font-semibold uppercase text-xs tracking-widest relative group ${isEditMode ? 'cursor-pointer' : ''}`}
                  onClick={() => {
                    if(isEditMode) handleEdit('map_url', mapUrl, "Google Haritalar linkini girin:");
                    else window.open(mapUrl, '_blank');
                  }}
                >
                  <Navigation className="w-4 h-4" /> Yol Tarifi Al
                  {isEditMode && <Edit3 size={12} className="absolute -right-4 top-0 text-blue-400 opacity-0 group-hover:opacity-100" />}
                </div>
              </div>
            </div>

            <div className="w-full h-[1px] bg-gold/20" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <Car className="w-6 h-6 text-foreground/50 shrink-0" />
                <div>
                  <h4 
                    className={`font-semibold text-foreground mb-1 relative group inline-block ${isEditMode ? 'cursor-pointer' : ''}`}
                    onClick={() => handleEdit('parking_title', parkingTitle, "Otopark başlığını girin:")}
                  >
                    {parkingTitle}
                    {isEditMode && <Edit3 size={12} className="absolute -right-4 top-1 text-blue-400 opacity-0 group-hover:opacity-100" />}
                  </h4>
                  <p 
                    className={`text-sm text-foreground/60 leading-relaxed relative group rounded p-1 ${isEditMode ? 'cursor-pointer hover:bg-foreground/5' : ''}`}
                    onClick={() => handleEdit('parking_desc', parkingDesc, "Otopark açıklamasını girin:")}
                  >
                    {parkingDesc}
                    {isEditMode && <Edit3 size={12} className="absolute -right-2 top-1 text-blue-400 opacity-0 group-hover:opacity-100" />}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Bus className="w-6 h-6 text-foreground/50 shrink-0" />
                <div>
                  <h4 
                    className={`font-semibold text-foreground mb-1 relative group inline-block ${isEditMode ? 'cursor-pointer' : ''}`}
                    onClick={() => handleEdit('transit_title', transitTitle, "Toplu taşıma başlığını girin:")}
                  >
                    {transitTitle}
                    {isEditMode && <Edit3 size={12} className="absolute -right-4 top-1 text-blue-400 opacity-0 group-hover:opacity-100" />}
                  </h4>
                  <p 
                    className={`text-sm text-foreground/60 leading-relaxed relative group rounded p-1 ${isEditMode ? 'cursor-pointer hover:bg-foreground/5' : ''}`}
                    onClick={() => handleEdit('transit_desc', transitDesc, "Toplu taşıma açıklamasını girin:")}
                  >
                    {transitDesc}
                    {isEditMode && <Edit3 size={12} className="absolute -right-2 top-1 text-blue-400 opacity-0 group-hover:opacity-100" />}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className={`w-full aspect-square md:aspect-video lg:aspect-square relative rounded-sm overflow-hidden border border-gold/20 shadow-2xl group ${isEditMode ? 'cursor-pointer ring-2 ring-transparent hover:ring-blue-500' : ''}`}
          onClick={() => handleEdit('map_image', mapImage, "Mekan resmi URL'sini girin:")}
        >
          <div className="absolute inset-0 bg-black/20 mix-blend-overlay z-10 pointer-events-none" />
          <img 
            src={mapImage} 
            alt="Venue Map Placeholder"
            className="w-full h-full object-cover filter sepia-[0.3]"
          />
          {/* Map Pin Overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center animate-bounce">
             <MapPin className="w-12 h-12 text-gold drop-shadow-xl fill-background" />
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
    </section>
  );
}
