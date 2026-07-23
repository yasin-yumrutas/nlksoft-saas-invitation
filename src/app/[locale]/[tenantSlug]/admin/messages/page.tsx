"use client";

import { use, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MessageSquareHeart, Check, X, Trash2 } from "lucide-react";

export default function MessagesAdminPage({ params }: { params: Promise<{ locale: string, tenantSlug: string }> }) {
  const resolvedParams = use(params);
  const tenantSlug = resolvedParams.tenantSlug;
  const supabase = createClient();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, [tenantSlug]);

  const fetchMessages = async () => {
    setLoading(true);
    const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', tenantSlug).single();
    if (!tenant) return;

    const { data } = await supabase
      .from('guest_messages')
      .select('*, guests(full_name)')
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false });
      
    if (data) setMessages(data);
    setLoading(false);
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    await supabase.from('guest_messages').update({ is_approved: !currentStatus }).eq('id', id);
    fetchMessages();
  };

  const deleteMessage = async (id: string) => {
    if (!window.confirm("Bu mesajı silmek istediğinize emin misiniz?")) return;
    await supabase.from('guest_messages').delete().eq('id', id);
    fetchMessages();
  };

  if (loading) return <div className="text-gold">Mesajlar yükleniyor...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif text-white">Anı Defteri Mesajları</h1>
        <div className="flex items-center gap-2 text-white/50">
          <MessageSquareHeart size={20} />
          <span>Toplam {messages.length} Mesaj</span>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-black/40 text-gold uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Gönderen</th>
                <th className="px-6 py-4">Mesaj</th>
                <th className="px-6 py-4 text-center">Tarih</th>
                <th className="px-6 py-4 text-center">Durum</th>
                <th className="px-6 py-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-white/50">
                    Henüz mesaj bulunmuyor.
                  </td>
                </tr>
              ) : (
                messages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">
                      {(msg.guests as any)?.full_name}
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <p className="line-clamp-3 italic text-white/70">"{msg.message}"</p>
                    </td>
                    <td className="px-6 py-4 text-center text-white/50">
                      {new Date(msg.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {msg.is_approved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                          Yayında
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                          Onay Bekliyor
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => toggleApproval(msg.id, msg.is_approved)}
                          className={`p-2 rounded-lg transition-colors ${
                            msg.is_approved 
                              ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20' 
                              : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                          }`}
                          title={msg.is_approved ? "Yayından Kaldır" : "Onayla ve Yayınla"}
                        >
                          {msg.is_approved ? <X size={18} /> : <Check size={18} />}
                        </button>
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                          title="Sil"
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
  );
}
