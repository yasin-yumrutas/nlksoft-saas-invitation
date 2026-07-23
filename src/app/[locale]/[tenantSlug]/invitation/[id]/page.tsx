"use client";

import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import RSVPForm from "@/components/forms/RSVPForm";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/client";

export default function InvitationPage({
  params,
}: {
  params: Promise<{ id: string; locale: string; tenantSlug: string }>;
}) {
  const resolvedParams = use(params);
  const inviteCode = resolvedParams.id;
  const tenantSlug = resolvedParams.tenantSlug;
  const supabase = createClient();
  
  const [tenant, setTenant] = useState<any>(null);
  const [guest, setGuest] = useState<any>(null);
  const [assignedTable, setAssignedTable] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenantAndGuestData = async () => {
      try {
        // 1. Fetch Tenant
        const { data: tenantData } = await supabase
          .from('tenants')
          .select('*')
          .eq('slug', tenantSlug)
          .single();

        if (!tenantData) throw new Error("Tenant not found");
        setTenant(tenantData);

        // 2. Fetch Guest
        const { data: guestData } = await supabase
          .from('guests')
          .select('*')
          .eq('tenant_id', tenantData.id)
          .eq('invite_code', inviteCode)
          .single();

        if (guestData) {
          setGuest(guestData);
          
          // 3. Fetch Table Assignment if attending
          if (guestData.is_attending) {
            const { data: assignmentData } = await supabase
              .from('table_assignments')
              .select('seat_number, tables(table_name)')
              .eq('guest_id', guestData.id)
              .single();
              
            if (assignmentData && assignmentData.tables) {
              // @ts-ignore
              setAssignedTable(`${assignmentData.tables.table_name} - Koltuk ${assignmentData.seat_number}`);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantAndGuestData();
  }, [inviteCode, tenantSlug, supabase]);

  const guestName = guest?.full_name || inviteCode.replace(/-/g, ' '); 

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-gold">Yükleniyor...</div>;
  }

  if (!tenant) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-gold">Böyle bir davetiye bulunamadı.</div>;
  }

  const isAttending = guest?.is_attending;

  return (
    <main className="relative w-full min-h-screen bg-background text-foreground font-sans flex flex-col">
      {/* Personalized Header */}
      <section className="relative w-full pt-32 pb-16 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <span className="text-gold tracking-[0.3em] uppercase text-sm font-semibold mb-4 block">
            Özel Davetiye
          </span>
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">
            Sevgili {guestName},
          </h1>
          <p className="text-foreground/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Hayatımızın bu en özel gününde, yanımızda olmanızdan büyük mutluluk duyacağız. 
            Sizin için hazırladığımız özel davetiyemizi inceleyebilir ve katılım durumunuzu aşağıdan bize iletebilirsiniz.
          </p>
          
          {/* Conditional QR Code Pass */}
          {isAttending ? (
            <div className="flex flex-col items-center justify-center my-12 animate-in zoom-in duration-500">
              <div className="bg-white p-6 rounded-2xl shadow-[0_0_40px_rgba(212,175,55,0.1)] border-4 border-gold relative">
                <div className="absolute -top-3 bg-background px-4 text-gold font-serif text-sm tracking-widest uppercase left-1/2 -translate-x-1/2 whitespace-nowrap">
                  Giriş & Oturma Kartı
                </div>
                <div className="mb-4 text-center border-b border-black/10 pb-4">
                   <p className="text-black font-sans text-sm">Masa Konumunuz:</p>
                   <p className="text-gold-dark font-serif text-2xl mt-1">{assignedTable || "Belirleniyor..."}</p>
                </div>
                <QRCodeSVG 
                  value={inviteCode} 
                  size={200}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"M"}
                />
                <p className="text-black font-mono text-xs mt-4 tracking-widest text-center">{inviteCode}</p>
              </div>
              <p className="text-foreground/50 text-sm mt-4 font-sans max-w-xs">
                Bu QR kodu mekana girişte okutarak onay alabilirsiniz.
              </p>
            </div>
          ) : (
            <div className="w-[1px] h-16 bg-gradient-to-b from-gold to-transparent mx-auto" />
          )}
        </motion.div>
      </section>

      {/* RSVP Form - Hide if already attending (or show a message) */}
      {!isAttending && (
        <section className="relative flex-grow flex items-center justify-center p-4 z-20 mb-32">
          <div className="w-full max-w-2xl rsvp-trigger shadow-2xl rounded-lg overflow-hidden border border-gold/20">
            <div className="bg-[#0a0a0a] p-8 md:p-12 relative">
              <h2 className="font-serif text-3xl md:text-4xl text-center text-white mb-8">
                LCV Formu
              </h2>
              <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-white/60 text-sm text-center">
                  Davet Kodunuz: <strong className="text-gold">{inviteCode}</strong>
                </p>
              </div>
              
              <RSVPForm defaultInviteCode={inviteCode} tenantId={tenant.id} />
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
