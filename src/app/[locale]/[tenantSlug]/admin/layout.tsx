"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Users, Grid2X2, QrCode, Image as ImageIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CoupleAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; tenantSlug: string }>;
}) {
  const resolvedParams = use(params);
  const tenantSlug = resolvedParams.tenantSlug;
  const locale = resolvedParams.locale;
  const pathname = usePathname();
  const [isCorporate, setIsCorporate] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function getTenant() {
      const { data } = await supabase.from('tenants').select('site_config').eq('slug', tenantSlug).single();
      if (data?.site_config?.template_type === 'corporate') {
        setIsCorporate(true);
      }
    }
    getTenant();
  }, [tenantSlug]);

  const navItems = [
    { name: "Genel Bakış", href: `/${locale}/${tenantSlug}/admin`, icon: LayoutDashboard },
    { name: isCorporate ? "Katılımcı Listesi" : "Misafir Listesi", href: `/${locale}/${tenantSlug}/admin/guests`, icon: Users },
    { name: isCorporate ? "Oturma Düzeni" : "Masa Yönetimi", href: `/${locale}/${tenantSlug}/admin/tables`, icon: Grid2X2 },
    { name: "QR Okuyucu", href: `/${locale}/${tenantSlug}/admin/checkin`, icon: QrCode },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-black/50 border-r border-gold/20 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gold/20">
          <h2 className="font-serif text-2xl text-gold-dark">Yönetim Paneli</h2>
          <p className="text-sm text-white/50 mt-1">/{tenantSlug}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? "bg-gold/20 text-gold font-medium border border-gold/30" 
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gold/20">
          <a
            href={`/${locale}/${tenantSlug}?edit=true`}
            target="_blank"
            className="flex items-center gap-3 px-4 py-3 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors border border-blue-500/30"
          >
            <ImageIcon size={20} />
            <span>Siteyi Düzenle</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
