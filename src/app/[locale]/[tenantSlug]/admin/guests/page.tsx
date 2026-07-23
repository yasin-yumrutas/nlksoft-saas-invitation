"use client";

import { use, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Users, CheckCircle2, XCircle, Clock } from "lucide-react";

export default function GuestsAdminPage({ params }: { params: Promise<{ locale: string, tenantSlug: string }> }) {
  const resolvedParams = use(params);
  const tenantSlug = resolvedParams.tenantSlug;
  const supabase = createClient();
  
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [tenantSlug]);

  const fetchData = async () => {
    setLoading(true);
    
    // Get tenant
    const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', tenantSlug).single();
    if (!tenant) return;

    // Get guests with their RSVP details and table assignments
    const { data: gData } = await supabase
      .from('guests')
      .select(`
        *,
        rsvp_responses(attending_count, dietary_requirements, message),
        table_assignments(table_id, seat_number, tables(table_name))
      `)
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false });
      
    if (gData) setGuests(gData);
    
    setLoading(false);
  };

  if (loading) return <div className="text-gold">Misafir listesi yükleniyor...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif text-white">Misafir Listesi</h1>
        <div className="flex items-center gap-2 text-white/50">
          <Users size={20} />
          <span>Toplam {guests.length} Kayıt</span>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-black/40 text-gold uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Ad Soyad</th>
                <th className="px-6 py-4">İletişim</th>
                <th className="px-6 py-4 text-center">Durum</th>
                <th className="px-6 py-4 text-center">Kişi</th>
                <th className="px-6 py-4">Masa / Koltuk</th>
                <th className="px-6 py-4 text-center">Giriş Yapıldı Mı?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {guests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-white/50">
                    Henüz LCV kaydı bulunmamaktadır.
                  </td>
                </tr>
              ) : (
                guests.map((guest) => {
                  const assignment = guest.table_assignments?.[0];
                  
                  return (
                    <tr key={guest.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{guest.full_name}</div>
                        {guest.rsvp_responses?.[0]?.message && (
                          <div className="text-xs text-white/50 mt-1 italic">
                            "{guest.rsvp_responses[0].message}"
                          </div>
                        )}
                        {guest.rsvp_responses?.[0]?.dietary_requirements && (
                          <div className="text-xs text-red-400 mt-1">
                            Özel Diyet: {guest.rsvp_responses[0].dietary_requirements}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white/70">{guest.phone_number || '-'}</div>
                        <div className="text-xs text-white/40">{guest.email || '-'}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {guest.is_attending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                            <CheckCircle2 size={14} /> Katılıyor
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                            <XCircle size={14} /> Katılamıyor
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center font-mono">
                        {guest.guest_count}
                      </td>
                      <td className="px-6 py-4">
                        {guest.table_assignments && guest.table_assignments.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {guest.table_assignments.map((assignment: any, idx: number) => (
                              <div key={idx}>
                                <span className="text-gold font-semibold">{assignment.tables?.table_name}</span>
                                <span className="text-white/50 ml-2">Koltuk {assignment.seat_number}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-white/30 italic">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {guest.scanned_at ? (
                          <span className="inline-flex items-center gap-1 text-green-400">
                            <CheckCircle2 size={16} /> 
                            <span className="text-xs">{new Date(guest.scanned_at).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</span>
                          </span>
                        ) : guest.is_attending ? (
                          <span className="inline-flex items-center gap-1 text-white/30">
                            <Clock size={16} /> Bekleniyor
                          </span>
                        ) : (
                          <span className="text-white/30">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
