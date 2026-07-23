"use client";

import { use, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Users, UserCheck, UserX, Grid2X2, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function CoupleAdminDashboard({ params }: { params: Promise<{ locale: string, tenantSlug: string }> }) {
  const resolvedParams = use(params);
  const tenantSlug = resolvedParams.tenantSlug;
  const supabase = createClient();
  
  const [stats, setStats] = useState({
    totalGuests: 0,
    attending: 0,
    notAttending: 0,
    tablesCount: 0,
    checkedIn: 0,
    expectedGuests: 0
  });
  
  const [dietaryReqs, setDietaryReqs] = useState<{name: string, requirement: string}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // Get tenant
      const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', tenantSlug).single();
      if (!tenant) return;

      const tenantId = tenant.id;

      // Get Guests Stats (including guest_count and scanned_at)
      const { data: guests } = await supabase.from('guests').select('is_attending, guest_count, scanned_at, full_name').eq('tenant_id', tenantId);
      
      // Get RSVPs for dietary requirements
      const { data: rsvps } = await supabase.from('rsvp_responses').select('dietary_requirements, guests(full_name)').eq('tenant_id', tenantId).not('dietary_requirements', 'is', null).not('dietary_requirements', 'eq', '');
      
      // Get Tables
      const { count: tablesCount } = await supabase.from('tables').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId);

      if (guests) {
        const attendingGuests = guests.filter(g => g.is_attending === true);
        const notAttending = guests.filter(g => g.is_attending === false).length;
        
        // Sum total people attending (since one guest = multiple people)
        const expectedGuests = attendingGuests.reduce((sum, g) => sum + (g.guest_count || 1), 0);
        const checkedIn = attendingGuests.filter(g => g.scanned_at !== null).reduce((sum, g) => sum + (g.guest_count || 1), 0);
        
        setStats({
          totalGuests: guests.length, // total form submissions
          attending: attendingGuests.length,
          notAttending,
          tablesCount: tablesCount || 0,
          expectedGuests,
          checkedIn
        });
      }

      if (rsvps) {
        const reqs = rsvps.map(r => ({
          name: (r.guests as any)?.full_name || 'Bilinmiyor',
          requirement: r.dietary_requirements
        }));
        setDietaryReqs(reqs as any);
      }

      setLoading(false);
    };

    fetchStats();
  }, [tenantSlug, supabase]);

  if (loading) return <div className="text-gold">İstatistikler yükleniyor...</div>;

  const checkinPercentage = stats.expectedGuests > 0 ? Math.round((stats.checkedIn / stats.expectedGuests) * 100) : 0;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-serif text-white mb-8">Genel Bakış</h1>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard icon={Users} label="Form Dolduran" value={stats.totalGuests} color="text-blue-400" bgColor="bg-blue-500/10" borderColor="border-blue-500/20" />
        <StatCard icon={UserCheck} label="Katılacaklar (Grup)" value={stats.attending} color="text-green-400" bgColor="bg-green-500/10" borderColor="border-green-500/20" />
        <StatCard icon={Users} label="Katılacaklar (Kişi)" value={stats.expectedGuests} color="text-emerald-400" bgColor="bg-emerald-500/10" borderColor="border-emerald-500/20" />
        <StatCard icon={UserX} label="Katılamayacaklar" value={stats.notAttending} color="text-red-400" bgColor="bg-red-500/10" borderColor="border-red-500/20" />
        <StatCard icon={Grid2X2} label="Oluşturulan Masa" value={stats.tablesCount} color="text-gold" bgColor="bg-gold/10" borderColor="border-gold/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Check-in Progress */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-serif text-gold mb-6 flex items-center gap-2">
            <CheckCircle2 size={24} /> Canlı Giriş Durumu
          </h2>
          
          <div className="flex justify-between items-end mb-4">
            <div>
              <div className="text-4xl font-bold text-white mb-1">{stats.checkedIn} <span className="text-xl text-white/50 font-normal">/ {stats.expectedGuests} Kişi</span></div>
              <div className="text-sm text-white/50">Şu ana kadar mekana giriş yapanlar</div>
            </div>
            <div className="text-3xl font-bold text-green-400">
              %{checkinPercentage}
            </div>
          </div>
          
          <div className="w-full h-4 bg-black/50 rounded-full overflow-hidden border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-1000 ease-out relative"
              style={{ width: `${checkinPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Dietary Requirements */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-serif text-gold mb-6 flex items-center gap-2">
            <AlertCircle size={24} /> Özel Diyet İstekleri
          </h2>
          
          {dietaryReqs.length === 0 ? (
            <div className="text-white/50 italic text-center py-4">Özel diyet isteği bulunmuyor.</div>
          ) : (
            <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {dietaryReqs.map((req, i) => (
                <div key={i} className="flex flex-col bg-black/40 p-3 rounded-lg border border-red-500/10">
                  <span className="text-white font-semibold">{req.name}</span>
                  <span className="text-red-400 text-sm mt-1">{req.requirement}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bgColor, borderColor }: any) {
  return (
    <div className={`p-6 rounded-2xl border ${borderColor} ${bgColor} flex flex-col items-center justify-center text-center`}>
      <Icon className={`w-8 h-8 ${color} mb-4`} />
      <span className="text-4xl font-bold text-white mb-2">{value}</span>
      <span className={`text-sm ${color}`}>{label}</span>
    </div>
  );
}
