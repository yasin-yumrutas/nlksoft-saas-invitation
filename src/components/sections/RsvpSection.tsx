"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTenant } from "@/context/TenantContext";
import { createClient } from "@/lib/supabase/client";
import { Edit3, CheckCircle2, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

type TableData = {
  id: string;
  table_name: string;
  capacity: number;
};

type AssignmentData = {
  table_id: string;
  seat_number: number;
};

export default function RsvpSection() {
  const { tenant, isEditMode, handleEdit } = useTenant();
  const config = tenant?.site_config || {};
  const supabase = createClient();

  // Editable text
  const sectionSubtitle = config.rsvp_subtitle || "Davetlisiniz";
  const sectionTitle = config.rsvp_title || "Katılım Durumu";
  const sectionDesc = config.rsvp_desc || "Lütfen katılım durumunuzu bildirin ve yerinizi seçin.";

  // Flow State
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    isAttending: true,
    guestCount: 1,
    dietary: "",
    message: ""
  });

  // Table State
  const [tables, setTables] = useState<TableData[]>([]);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<{tableId: string, seatNumber: number}[]>([]);

  // Success State
  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    if (step === 2 && formData.isAttending) {
      fetchTablesAndAssignments();
    }
  }, [step]);

  const fetchTablesAndAssignments = async () => {
    setLoading(true);
    // Fetch Tables
    const { data: tData, error: tError } = await supabase
      .from('tables')
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('table_name');
    
    if (tData) setTables(tData);

    // Fetch Assignments
    const { data: aData } = await supabase
      .from('table_assignments')
      .select('table_id, seat_number')
      .eq('tenant_id', tenant.id);
    
    if (aData) setAssignments(aData);
    setLoading(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.fullName.trim()) {
      setError("Lütfen adınızı ve soyadınızı girin.");
      return;
    }
    
    if (formData.isAttending) {
      setStep(2); // Go to table selection
    } else {
      submitRsvp(); // Directly submit if not attending
    }
  };

  const submitRsvp = async () => {
    setLoading(true);
    setError("");
    
    try {
      // 1. Generate unique invite code
      const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // 2. Call the RPC function (Database Transaction)
      const { data: rpcData, error: rpcError } = await supabase.rpc('submit_rsvp_with_seats', {
        p_tenant_id: tenant.id,
        p_full_name: formData.fullName,
        p_phone_number: formData.phoneNumber,
        p_email: formData.email,
        p_is_attending: formData.isAttending,
        p_guest_count: formData.guestCount,
        p_invite_code: generatedCode,
        p_dietary: formData.dietary,
        p_message: formData.message,
        p_seats: formData.isAttending ? selectedSeats : []
      });

      if (rpcError) {
        if (rpcError.message.includes('SEAT_TAKEN')) {
          throw new Error("Seçtiğiniz koltuklardan en az biri saniyeler önce başkası tarafından alındı. Lütfen başka bir koltuk seçin.");
        }
        throw rpcError;
      }

      setInviteCode(generatedCode);
      setStep(3); // Go to success screen

    } catch (err: any) {
      console.error(err);
      setError("Bir hata oluştu. Lütfen tekrar deneyin. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const isSeatTaken = (tableId: string, seatNum: number) => {
    return assignments.some(a => a.table_id === tableId && a.seat_number === seatNum);
  };

  const toggleSeatSelection = (tableId: string, seatNum: number) => {
    const isAlreadySelected = selectedSeats.some(s => s.tableId === tableId && s.seatNumber === seatNum);
    
    if (isAlreadySelected) {
      // Remove it
      setSelectedSeats(prev => prev.filter(s => !(s.tableId === tableId && s.seatNumber === seatNum)));
    } else {
      // Add it, if we haven't reached the limit
      if (selectedSeats.length < formData.guestCount) {
        setSelectedSeats(prev => [...prev, { tableId, seatNumber: seatNum }]);
      } else {
        alert(`Sadece ${formData.guestCount} koltuk seçebilirsiniz. Lütfen farklı bir koltuk seçmek istiyorsanız önce seçili olanlardan birini iptal edin.`);
      }
    }
  };

  return (
    <section className="relative w-full bg-[#0a0a0a] py-32 flex flex-col items-center justify-center border-t border-gold/10">
      <div className="max-w-4xl mx-auto px-4 md:px-8 w-full relative z-10">
        
        <div className="text-center mb-16 relative">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`text-gold tracking-[0.3em] uppercase text-sm font-semibold mb-4 block relative inline-block group ${isEditMode ? 'cursor-pointer' : ''}`}
            onClick={() => handleEdit('rsvp_subtitle', sectionSubtitle, "Alt başlığı girin:")}
          >
            {sectionSubtitle}
            {isEditMode && <Edit3 size={14} className="absolute -right-6 top-0 text-blue-400 opacity-0 group-hover:opacity-100" />}
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={`font-serif text-5xl md:text-6xl text-white mb-6 relative inline-block group ${isEditMode ? 'cursor-pointer' : ''}`}
            onClick={() => handleEdit('rsvp_title', sectionTitle, "Ana başlığı girin:")}
          >
            {sectionTitle}
            {isEditMode && <Edit3 size={20} className="absolute -right-8 top-4 text-blue-400 opacity-0 group-hover:opacity-100" />}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className={`text-white/60 font-sans max-w-2xl mx-auto leading-relaxed relative group p-2 rounded ${isEditMode ? 'cursor-pointer hover:bg-white/5' : ''}`}
            onClick={() => handleEdit('rsvp_desc', sectionDesc, "Açıklamayı girin:")}
          >
            {sectionDesc}
            {isEditMode && <Edit3 size={16} className="absolute -right-2 top-2 text-blue-400 opacity-0 group-hover:opacity-100" />}
          </motion.p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-12 max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-lg mb-8 text-center">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleFormSubmit}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-white/80 text-sm tracking-wide">Ad Soyad *</label>
                    <input 
                      type="text" 
                      required
                      disabled={isEditMode}
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
                      placeholder="Örn: Ahmet Yılmaz"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-white/80 text-sm tracking-wide">Telefon Numarası</label>
                    <input 
                      type="tel" 
                      disabled={isEditMode}
                      value={formData.phoneNumber}
                      onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
                      placeholder="Örn: 0532 000 00 00"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <label className="text-white/80 text-sm tracking-wide block">Katılım Durumunuz</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      disabled={isEditMode}
                      onClick={() => setFormData({...formData, isAttending: true})}
                      className={`py-3 rounded-lg border transition-all ${formData.isAttending ? 'bg-gold/20 border-gold text-gold' : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/5'}`}
                    >
                      Katılıyorum
                    </button>
                    <button 
                      type="button"
                      disabled={isEditMode}
                      onClick={() => setFormData({...formData, isAttending: false})}
                      className={`py-3 rounded-lg border transition-all ${!formData.isAttending ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-black/40 border-white/10 text-white/60 hover:bg-white/5'}`}
                    >
                      Maalesef Katılamayacağım
                    </button>
                  </div>
                </div>

                {formData.isAttending && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-6 pt-4"
                  >
                    <div className="space-y-2">
                      <label className="text-white/80 text-sm tracking-wide">Kişi Sayısı</label>
                      <select 
                        disabled={isEditMode}
                        value={formData.guestCount}
                        onChange={e => setFormData({...formData, guestCount: parseInt(e.target.value)})}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors"
                      >
                        {[1, 2, 3, 4, 5].map(n => (
                          <option key={n} value={n} className="bg-[#111]">{n} Kişi</option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-2 pt-4">
                  <label className="text-white/80 text-sm tracking-wide">Çifte Mesajınız (İsteğe Bağlı)</label>
                  <textarea 
                    disabled={isEditMode}
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                    rows={3}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50 transition-colors resize-none"
                    placeholder="Güzel dileklerinizi yazabilirsiniz..."
                  />
                </div>

                <div className="pt-6">
                  <button 
                    type="submit"
                    disabled={isEditMode || loading}
                    className="w-full py-4 bg-gold hover:bg-gold-light text-black font-semibold tracking-wider rounded-lg transition-all disabled:opacity-50 uppercase text-sm"
                  >
                    {isEditMode ? "Düzenleme Modunda Kapalı" : (formData.isAttending ? "Koltuk Seçimine Geç" : "Yanıtı Gönder")}
                  </button>
                </div>
              </motion.form>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-serif text-gold mb-2">Koltuk Seçimi</h3>
                  <p className="text-white/60 text-sm">
                    Lütfen oturmak istediğiniz {formData.guestCount} sandalyeyi seçin. 
                    <span className="block mt-1 text-gold">Seçilen: {selectedSeats.length} / {formData.guestCount}</span>
                  </p>
                </div>

                {loading ? (
                  <div className="py-12 text-center text-gold">Masalar Yükleniyor...</div>
                ) : tables.length === 0 ? (
                  <div className="py-12 text-center text-white/50">Henüz masa oluşturulmamış. Lütfen girişinizi onaysız tamamlayın.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {tables.map(table => (
                      <div key={table.id} className="bg-black/30 p-6 rounded-xl border border-white/5 flex flex-col items-center">
                        <h4 className="text-white font-serif mb-6">{table.table_name}</h4>
                        
                        <div className="relative w-48 h-48 rounded-full border-4 border-white/10 flex items-center justify-center">
                          <span className="text-white/30 text-sm tracking-widest uppercase">Masa</span>
                          
                          {/* Render 8 seats in a circle */}
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(seatNum => {
                            const angle = (seatNum - 1) * (360 / 8);
                            const radius = 110; // Distance from center
                            const x = Math.sin((angle * Math.PI) / 180) * radius;
                            const y = -Math.cos((angle * Math.PI) / 180) * radius;
                            
                            const isTaken = isSeatTaken(table.id, seatNum);
                            const isSelected = selectedSeats.some(s => s.tableId === table.id && s.seatNumber === seatNum);
                            
                            return (
                              <button
                                key={seatNum}
                                disabled={isTaken && !isSelected}
                                onClick={() => toggleSeatSelection(table.id, seatNum)}
                                className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                  ${isTaken && !isSelected ? 'bg-red-500/20 text-red-500 cursor-not-allowed border border-red-500/30' : 
                                    isSelected ? 'bg-gold text-black scale-110 shadow-[0_0_15px_rgba(212,175,55,0.6)]' : 
                                    'bg-white/10 text-white hover:bg-white/20 border border-white/20'}`}
                                style={{
                                  transform: `translate(${x}px, ${y}px)`,
                                }}
                              >
                                {seatNum}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-4 pt-6">
                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 py-4 bg-transparent border border-white/20 text-white hover:bg-white/5 font-semibold rounded-lg transition-all uppercase text-sm"
                  >
                    Geri
                  </button>
                  <button 
                    type="button"
                    onClick={submitRsvp}
                    disabled={loading || (tables.length > 0 && selectedSeats.length !== formData.guestCount)}
                    className="w-2/3 py-4 bg-gold hover:bg-gold-light text-black font-semibold tracking-wider rounded-lg transition-all disabled:opacity-50 uppercase text-sm"
                  >
                    {loading ? "Kaydediliyor..." : "Kaydı Tamamla"}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                
                <h3 className="text-3xl font-serif text-white">Teşekkürler!</h3>
                <p className="text-white/70 max-w-md">
                  {formData.isAttending 
                    ? "Katılımınız onaylandı. Düğün mekanına giriş yaparken aşağıdaki QR kodu görevliye göstermeniz yeterlidir." 
                    : "Yanıtınız için teşekkür ederiz. Sizi aramızda göremeyeceğimiz için üzgünüz."}
                </p>

                {formData.isAttending && inviteCode && (
                  <div className="mt-8 p-6 bg-white rounded-2xl flex flex-col items-center">
                    <QRCodeSVG value={inviteCode} size={200} level="H" includeMargin={false} />
                    <div className="mt-4 flex items-center gap-2 text-black/60 font-mono bg-black/5 px-4 py-2 rounded-full">
                      <QrCode size={16} />
                      <span className="tracking-widest font-bold">{inviteCode}</span>
                    </div>
                  </div>
                )}
                
                {formData.isAttending && (
                  <p className="text-gold text-sm mt-4 italic">
                    Lütfen bu ekranın ekran görüntüsünü almayı unutmayın.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
