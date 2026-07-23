"use client";

import { use, useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Scene from "@/components/three/Scene";
import CinematicTimeline from "@/components/animations/Timeline";
import WelcomeScreen from "@/components/sections/WelcomeScreen";
import CoupleSection from "@/components/sections/CoupleSection";
import ProgramSection from "@/components/sections/ProgramSection";
import LocationSection from "@/components/sections/LocationSection";
import DressCodeSection from "@/components/sections/DressCodeSection";
import GallerySection from "@/components/sections/GallerySection";
import RsvpSection from "@/components/sections/RsvpSection";
import GuestbookSection from "@/components/sections/GuestbookSection";
import Footer from "@/components/layout/Footer";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Settings, Image as ImageIcon } from "lucide-react";
import { TenantProvider } from "@/context/TenantContext";
import CustomCursor from "@/components/ui/CustomCursor";
import EnvelopeOpener from "@/components/ui/EnvelopeOpener";

export default function Home({ 
  params,
  searchParams
}: { 
  params: Promise<{ locale: string, tenantSlug: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  
  const tenantSlug = resolvedParams.tenantSlug;
  const locale = resolvedParams.locale;
  const isEditMode = resolvedSearchParams.edit === 'true';

  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const mainRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("Hero");
  const supabase = createClient();
  
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -100]);

  useEffect(() => {
    fetchTenant();
  }, [tenantSlug]);

  const fetchTenant = async () => {
    const { data } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', tenantSlug)
      .single();
      
    if (data) {
      setTenant(data);
    }
    setLoading(false);
  };

  const handleUpdateBackground = async () => {
    if (!isEditMode) return;
    
    const newUrl = window.prompt("Yeni arka plan resminin URL adresini yapıştırın:\n(Eski 3D arka plana dönmek için burayı tamamen boş bırakıp Tamam'a basın)");
    if (newUrl === null) return;

    setIsUpdating(true);
    await supabase.from('tenants').update({ hero_image_url: newUrl || null }).eq('id', tenant.id);
    await fetchTenant();
    setIsUpdating(false);
    alert(newUrl ? "Arka plan güncellendi!" : "Eski 3D arka plana dönüldü!");
  };

  const handleUpdateConfig = async (key: string, value: string) => {
    if (!isEditMode || !tenant) return;
    
    const newConfig = { ...(tenant.site_config || {}), [key]: value };
    await supabase.from('tenants').update({ site_config: newConfig }).eq('id', tenant.id);
    
    setTenant({ ...tenant, site_config: newConfig });
  };

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-background text-gold">Yükleniyor...</div>;
  if (!tenant) return <div className="h-screen w-full flex items-center justify-center bg-background text-gold">Böyle bir davetiye bulunamadı.</div>;

  const isCorporate = tenant.site_config?.template_type === 'corporate';
  const coupleName = isCorporate 
    ? `${tenant.bride_name} ${tenant.groom_name}` // "Nlksoft 20. Yıl Galası"
    : `${tenant.bride_name} & ${tenant.groom_name}`;

  return (
    <TenantProvider tenant={tenant} isEditMode={isEditMode} onUpdateConfig={handleUpdateConfig}>
      <CustomCursor />
      <EnvelopeOpener>
        <main id="main-root" ref={mainRef} className={`relative w-full overflow-x-hidden font-sans ${isCorporate ? 'bg-[#050505] text-white' : 'bg-background text-foreground'} ${isEditMode ? 'border-4 border-dashed border-blue-500' : ''}`}>
          
          {/* Edit Mode Banner */}
          {isEditMode && (
            <div className="fixed top-0 left-0 w-full bg-blue-600 text-white z-50 p-2 text-center text-sm font-bold shadow-lg flex items-center justify-center gap-2">
              <Settings size={16} className="animate-spin-slow" />
              DÜZENLEME MODU AKTİF - Sayfadaki yazılara ve fotoğraflara tıklayarak değiştirebilirsiniz
            </div>
          )}

          {/* 3D Scene - Hide if there is a custom hero image or corporate theme */}
          {!tenant.hero_image_url && !isCorporate && (
            <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
              <Scene />
            </div>
          )}

          <div className="relative z-10 w-full flex flex-col">
            
            {/* Cinematic Hero Section */}
            <section 
              className={`min-h-screen w-full relative flex flex-col items-center justify-center p-6 text-center group ${isCorporate ? 'bg-zinc-950' : ''}`}
              style={{
                backgroundImage: tenant.hero_image_url ? `url(${tenant.hero_image_url})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
              }}
            >
              {(tenant.hero_image_url || isCorporate) && <div className="absolute inset-0 bg-black/60 z-0" />}

              {isEditMode && (
                <div 
                  onClick={handleUpdateBackground}
                  className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <div className="bg-white/10 p-4 rounded-full backdrop-blur-md flex flex-col items-center">
                    {isUpdating ? <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" /> : <ImageIcon className="w-12 h-12 text-white" />}
                    <span className="text-white text-sm mt-2 font-bold">{isUpdating ? "Güncelleniyor..." : "Arka Planı Değiştir"}</span>
                  </div>
                </div>
              )}
              
              <motion.div 
                style={{ opacity, y }}
                className="flex flex-col items-center justify-center pointer-events-auto relative z-10"
                initial={{ filter: "blur(20px)", opacity: 0, y: 30 }}
                animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
              >
                <p className="tracking-[0.5em] uppercase text-gold-dark mb-6 text-sm md:text-base drop-shadow-sm font-semibold">
                  {isCorporate ? tenant.site_config?.corporate_subtitle || "Lütfen Bize Katılın" : t('title')}
                </p>
                <h1 className={`font-serif ${isCorporate ? 'text-5xl md:text-7xl text-gold' : 'text-6xl md:text-9xl text-gradient-gold'} drop-shadow-lg mb-8 mix-blend-multiply`}>
                  {isCorporate ? tenant.bride_name : coupleName}
                </h1>
                {isCorporate && (
                  <p className="font-serif italic text-2xl md:text-4xl text-gold-light max-w-2xl mb-4">
                    {tenant.groom_name}
                  </p>
                )}
                <p className={`font-serif italic text-xl md:text-2xl ${isCorporate ? 'text-white/80' : 'text-foreground/70'} max-w-2xl`}>
                  {isCorporate ? tenant.site_config?.corporate_desc || "Sizleri aramızda görmekten onur duyarız." : t('invitation')}
                </p>
              </motion.div>
              
              <motion.div 
                className="absolute bottom-12 flex flex-col items-center opacity-70 pointer-events-auto"
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <span className="text-xs tracking-[0.2em] uppercase text-gold-dark mb-2">Keşfetmek İçin Kaydırın</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-gold to-transparent" />
              </motion.div>
            </section>

            {!isCorporate && <CoupleSection />}
            
            {/* The rest of the sections */}
            <ProgramSection />
            <LocationSection />
            {!isCorporate && <DressCodeSection />}
            <GallerySection />
            <GuestbookSection />
            <RsvpSection />
            <Footer />
          </div>
        </main>
      </EnvelopeOpener>
    </TenantProvider>
  );
}
