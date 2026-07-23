"use client";

import { use, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Shield, Plus, Building2, Eye, Trash2, Power } from "lucide-react";
import Link from "next/link";

const MASTER_PASSWORD = "321654987";

export default function MasterAdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = use(params);
  const locale = resolvedParams.locale;
  const supabase = createClient();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Tenant Form
  const [isCreating, setIsCreating] = useState(false);
  const [newTenant, setNewTenant] = useState({
    bride_name: "",
    groom_name: "",
    slug: "",
    owner_email: "",
    template_type: "wedding"
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchTenants();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === MASTER_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("Hatalı Şifre!");
      setPassword("");
    }
  };

  const fetchTenants = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (data) setTenants(data);
    setLoading(false);
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basit bir slug (link) doğrulama
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(newTenant.slug)) {
      alert("Link (Slug) sadece küçük harf, rakam ve tire (-) içerebilir!");
      return;
    }

    setIsCreating(true);
    
    const { data, error } = await supabase.from('tenants').insert({
      bride_name: newTenant.bride_name,
      groom_name: newTenant.groom_name,
      slug: newTenant.slug,
      owner_email: newTenant.owner_email,
      status: 'active',
      site_config: { template_type: newTenant.template_type }
    }).select().single();

    setIsCreating(false);

    if (error) {
      alert("Hata oluştu: " + error.message);
    } else {
      alert("Çift başarıyla oluşturuldu!");
      setNewTenant({ bride_name: "", groom_name: "", slug: "", owner_email: "", template_type: "wedding" });
      fetchTenants();
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    await supabase.from('tenants').update({ status: newStatus }).eq('id', id);
    fetchTenants();
  };

  const deleteTenant = async (id: string) => {
    if (!window.confirm("DİKKAT: Bu çifti ve ona ait TÜM verileri (misafirler, masalar vs.) kalıcı olarak silmek istediğinize emin misiniz?")) return;
    
    await supabase.from('tenants').delete().eq('id', id);
    fetchTenants();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <form onSubmit={handleLogin} className="bg-white/5 border border-white/10 p-8 rounded-2xl w-full max-w-sm text-center">
          <Shield className="w-16 h-16 text-gold mx-auto mb-6" />
          <h1 className="text-2xl font-serif text-white mb-6">Nlksoft Master Admin</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Yönetici Şifresi"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-center tracking-widest text-white focus:outline-none focus:border-gold mb-4"
          />
          <button type="submit" className="w-full bg-gold text-black font-bold py-3 rounded-xl hover:bg-gold-light transition-colors">
            Giriş Yap
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white/5 border border-white/10 p-6 rounded-2xl">
          <div className="flex items-center gap-4">
            <Building2 className="w-10 h-10 text-gold" />
            <div>
              <h1 className="text-2xl font-serif text-white">SaaS Yönetim Paneli</h1>
              <p className="text-white/50">Tüm düğün davetiyelerini buradan yönetebilirsiniz.</p>
            </div>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-2 text-sm font-semibold">
            <Power size={16} /> Çıkış Yap
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* New Tenant Form */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-8">
              <h2 className="text-xl font-serif text-gold mb-6 flex items-center gap-2">
                <Plus size={20} /> Yeni Çift (Müşteri) Ekle
              </h2>
              
              <form onSubmit={handleCreateTenant} className="space-y-4">
                <div>
                  <label className="text-white/70 text-xs uppercase tracking-wider mb-1 block">Şablon Tipi</label>
                  <select 
                    value={newTenant.template_type} 
                    onChange={e => setNewTenant({...newTenant, template_type: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold"
                  >
                    <option value="wedding">Düğün Davetiyesi</option>
                    <option value="corporate">Kurumsal Etkinlik (Gala/Lansman)</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/70 text-xs uppercase tracking-wider mb-1 block">
                    {newTenant.template_type === 'corporate' ? "Firma/Ana İsim (Örn: Nlksoft)" : "Gelin Adı"}
                  </label>
                  <input required type="text" value={newTenant.bride_name} onChange={e => setNewTenant({...newTenant, bride_name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="text-white/70 text-xs uppercase tracking-wider mb-1 block">
                    {newTenant.template_type === 'corporate' ? "Etkinlik Adı (Örn: 20. Yıl Galası)" : "Damat Adı"}
                  </label>
                  <input required type="text" value={newTenant.groom_name} onChange={e => setNewTenant({...newTenant, groom_name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold" />
                </div>
                <div>
                  <label className="text-white/70 text-xs uppercase tracking-wider mb-1 block">Site Linki (Slug)</label>
                  <div className="flex items-center">
                    <span className="bg-white/10 border border-r-0 border-white/10 rounded-l-lg px-3 py-2.5 text-white/50 text-sm">site.com/tr/</span>
                    <input required type="text" placeholder="ayse-mehmet" value={newTenant.slug} onChange={e => setNewTenant({...newTenant, slug: e.target.value.toLowerCase()})} className="w-full bg-black/40 border border-white/10 rounded-r-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-white/70 text-xs uppercase tracking-wider mb-1 block">Müşteri E-posta</label>
                  <input required type="email" value={newTenant.owner_email} onChange={e => setNewTenant({...newTenant, owner_email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-gold" />
                </div>
                <button type="submit" disabled={isCreating} className="w-full bg-gold hover:bg-gold-light text-black font-bold py-3 rounded-lg transition-colors mt-6 disabled:opacity-50">
                  {isCreating ? "Oluşturuluyor..." : "Sistemi Kur"}
                </button>
              </form>
            </div>
          </div>

          {/* Tenants List */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm text-white/80">
                <thead className="bg-black/40 text-gold uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Çift</th>
                    <th className="px-6 py-4">Link (Slug)</th>
                    <th className="px-6 py-4 text-center">Durum</th>
                    <th className="px-6 py-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {loading ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-white/50">Yükleniyor...</td></tr>
                  ) : tenants.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-white/50">Sistemde henüz kayıtlı çift yok.</td></tr>
                  ) : (
                    tenants.map(t => (
                      <tr key={t.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-serif text-lg text-white">
                          {t.bride_name} & {t.groom_name}
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/${locale}/${t.slug}`} target="_blank" className="text-blue-400 hover:underline flex items-center gap-1">
                            /{t.slug} <Eye size={14} />
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => toggleStatus(t.id, t.status)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                              t.status === 'active' 
                                ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20' 
                                : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/20'
                            }`}
                            title={t.status === 'active' ? "Pasife Al" : "Aktifleştir"}
                          >
                            {t.status === 'active' ? 'Aktif' : 'Pasif'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/${locale}/${t.slug}/admin`}
                              target="_blank"
                              className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                              title="Çiftin Paneline Git"
                            >
                              <Shield size={18} />
                            </Link>
                            <button
                              onClick={() => deleteTenant(t.id)}
                              className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                              title="Siteyi Sil"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
