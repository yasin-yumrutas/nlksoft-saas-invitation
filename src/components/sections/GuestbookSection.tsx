"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquareHeart, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTenant } from "@/context/TenantContext";

export default function GuestbookSection() {
  const { tenant } = useTenant();
  const supabase = createClient();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (tenant) {
      fetchMessages();
    }
  }, [tenant]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('guest_messages')
      .select('*, guests(full_name)')
      .eq('tenant_id', tenant.id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });
      
    if (data) {
      setMessages(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || !tenant) return;

    setLoading(true);

    // Create a dummy guest entry for the message if they don't have an invite code
    // In a real flow, you might link this to their RSVP guest_id if they are logged in.
    const { data: guestData } = await supabase.from('guests').insert({
      tenant_id: tenant.id,
      full_name: name.trim(),
      is_attending: null // null means we just created them for the guestbook
    }).select().single();

    if (guestData) {
      await supabase.from('guest_messages').insert({
        tenant_id: tenant.id,
        guest_id: guestData.id,
        message: message.trim(),
        is_approved: false // requires admin approval
      });
      setSubmitted(true);
    }

    setLoading(false);
  };

  return (
    <section className="relative w-full bg-background py-32 flex flex-col items-center justify-center border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4 md:px-8 w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <MessageSquareHeart className="w-12 h-12 text-gold mx-auto mb-6" />
          <h2 className="font-serif text-4xl md:text-5xl text-gold mb-6">Anı Defteri</h2>
          <p className="text-white/60 text-lg">Güzel dileklerinizi bizimle paylaşın.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-black/40 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center h-full min-h-[300px] text-center"
                  >
                    <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                    <h3 className="text-2xl font-serif text-gold mb-2">Mesajınız Alındı</h3>
                    <p className="text-white/60">Güzel dilekleriniz için teşekkür ederiz. Çiftin onayından sonra burada yayınlanacaktır.</p>
                    <button 
                      onClick={() => { setSubmitted(false); setName(""); setMessage(""); }}
                      className="mt-8 text-gold hover:text-white transition-colors"
                    >
                      Yeni bir mesaj yaz
                    </button>
                  </motion.div>
                ) : (
                  <motion.form 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit} 
                    className="space-y-6"
                  >
                    <h3 className="text-2xl font-serif text-white mb-6">Dilek Bırakın</h3>
                    
                    <div className="space-y-2">
                      <label className="text-white/80 text-sm">Adınız Soyadınız</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-white/80 text-sm">Mesajınız</label>
                      <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold/50 resize-none"
                        required
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={loading || !name.trim() || !message.trim()}
                      className="w-full py-4 bg-gold hover:bg-gold-light text-black font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                    >
                      <Send size={18} />
                      {loading ? "Gönderiliyor..." : "Mesajı Gönder"}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Messages */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white/5 border border-white/10 rounded-2xl">
                <MessageSquareHeart className="w-12 h-12 text-white/20 mb-4" />
                <p className="text-white/50">Henüz onaylanmış bir mesaj bulunmuyor. İlk mesajı siz yazın!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                  <p className="text-white/80 italic mb-4">"{msg.message}"</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gold font-semibold">{(msg.guests as any)?.full_name}</span>
                    <span className="text-white/30">{new Date(msg.created_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
