"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

// RSVP Form Schema
const formSchema = z.object({
  fullName: z.string().min(3, "Lütfen adınızı ve soyadınızı girin."),
  attending: z.enum(["yes", "no"], {
    message: "Lütfen katılım durumunuzu belirtin.",
  }),
  guestCount: z.string().optional(),
  allergies: z.string().optional(),
  message: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

import VisualSeatMap from "./VisualSeatMap";

export default function RSVPForm({ defaultInviteCode, tenantId }: { defaultInviteCode?: string, tenantId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedSeat, setSelectedSeat] = useState<{tableId: string, seatNumber: number} | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      attending: "yes",
      guestCount: "1",
    },
  });

  const isAttending = watch("attending") === "yes";

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setErrorMsg("");
    
    if (data.attending === "yes" && !selectedSeat) {
      setErrorMsg("Lütfen oturma planından bir koltuk seçin.");
      setIsSubmitting(false);
      return;
    }

    try {
      const inviteCode = defaultInviteCode || `PUBLIC-${Date.now().toString().slice(-6)}`;
      
      const { data: guestData, error: guestError } = await supabase
        .from('guests')
        .upsert([
          {
            tenant_id: tenantId,
            full_name: data.fullName,
            is_attending: data.attending === "yes",
            invite_code: inviteCode
          }
        ], { onConflict: 'tenant_id,invite_code' }) // Assuming unique constraint is on tenant_id + invite_code
        .select('id')
        .single();

      if (guestError) {
        console.error("Guest insert error:", guestError);
        throw new Error("Misafir kaydı oluşturulamadı. Lütfen yöneticiye başvurun.");
      }

      const guestId = guestData.id;

      const { error: rsvpError } = await supabase
        .from('rsvp_responses')
        .upsert([
          {
            tenant_id: tenantId,
            guest_id: guestId,
            attending_count: data.attending === "yes" ? parseInt(data.guestCount || "1") : 0,
            dietary_requirements: data.allergies || null,
            message: data.message || null
          }
        ], { onConflict: 'guest_id' });

      if (rsvpError) throw rsvpError;

      // Insert Table Assignment if attending
      if (data.attending === "yes" && selectedSeat) {
        await supabase
          .from('table_assignments')
          .upsert([{ 
            tenant_id: tenantId,
            table_id: selectedSeat.tableId, 
            guest_id: guestId,
            seat_number: selectedSeat.seatNumber
          }], { onConflict: 'guest_id' });
      }
      
      setIsSuccess(true);
      // Reload page to show QR Code after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      console.error("Error submitting RSVP:", err);
      setErrorMsg(err.message || "Bir hata oluştu, lütfen daha sonra tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="glass p-10 rounded-3xl max-w-lg mx-auto w-full text-center animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="w-16 h-16 text-gold" />
        </div>
        <h3 className="font-serif text-3xl text-gold-dark mb-4">Teşekkür Ederiz!</h3>
        <p className="text-foreground/80 font-sans leading-relaxed">
          Cevabınız başarıyla kaydedildi. Davetiye ekranınız güncelleniyor...
        </p>
      </div>
    );
  }

  return (
    <div className="glass p-8 md:p-12 rounded-3xl max-w-xl mx-auto w-full relative overflow-hidden group">
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-32 h-1 bg-gradient-to-l from-gold to-transparent"></div>
      
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl md:text-4xl text-gold-dark mb-2">LCV / RSVP</h2>
        <p className="font-sans text-foreground/60 text-sm tracking-widest uppercase">Lütfen katılım durumunuzu bildirin</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gold-dark/80 mb-2">Adınız Soyadınız</label>
          <input
            {...register("fullName")}
            type="text"
            className="w-full bg-background/50 border border-gold/20 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/60 transition-colors"
            placeholder="Örn: Ayşe & Mehmet Yılmaz"
          />
          {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
        </div>

        {/* Attending Status */}
        <div>
          <label className="block text-sm font-medium text-gold-dark/80 mb-2">Katılım Durumunuz</label>
          <div className="grid grid-cols-2 gap-4">
            <label className={`cursor-pointer border rounded-xl p-4 text-center transition-all duration-300 ${isAttending ? 'bg-gold/10 border-gold text-gold-dark' : 'border-gold/20 text-foreground/60 hover:border-gold/40'}`}>
              <input type="radio" value="yes" {...register("attending")} className="hidden" />
              <span className="font-serif text-lg">Katılacağız</span>
            </label>
            <label className={`cursor-pointer border rounded-xl p-4 text-center transition-all duration-300 ${!isAttending ? 'bg-gold/10 border-gold text-gold-dark' : 'border-gold/20 text-foreground/60 hover:border-gold/40'}`}>
              <input type="radio" value="no" {...register("attending")} className="hidden" />
              <span className="font-serif text-lg">Katılamayacağız</span>
            </label>
          </div>
          {errors.attending && <p className="text-red-400 text-xs mt-1">{errors.attending.message}</p>}
        </div>

        {/* Dynamic fields if attending */}
        {isAttending && (
          <div className="space-y-6 animate-in slide-in-from-top-4 fade-in duration-300">
            <div>
              <label className="block text-sm font-medium text-gold-dark/80 mb-2">Kaç Kişi Katılacaksınız?</label>
              <select
                {...register("guestCount")}
                className="w-full bg-background/50 border border-gold/20 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/60 transition-colors appearance-none"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num} className="bg-background text-foreground">
                    {num} Kişi
                  </option>
                ))}
              </select>
            </div>

            {/* Visual Table Selection */}
            <VisualSeatMap 
              tenantId={tenantId} 
              onSeatSelect={(tableId, seatNumber) => setSelectedSeat({ tableId, seatNumber })} 
            />

            <div>
              <label className="block text-sm font-medium text-gold-dark/80 mb-2">Alerji / Özel Menü Talebi</label>
              <input
                {...register("allergies")}
                type="text"
                className="w-full bg-background/50 border border-gold/20 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/60 transition-colors"
                placeholder="Örn: Vejetaryen, Fıstık alerjisi..."
              />
            </div>
          </div>
        )}

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gold-dark/80 mb-2">Çifte Mesajınız (İsteğe Bağlı)</label>
          <textarea
            {...register("message")}
            rows={3}
            className="w-full bg-background/50 border border-gold/20 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/60 transition-colors resize-none"
            placeholder="Güzel dileklerinizi yazabilirsiniz..."
          ></textarea>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm text-center">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-gold-dark via-gold to-gold-light text-background font-bold uppercase tracking-widest py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Cevabı Gönder"
          )}
        </button>
      </form>
    </div>
  );
}
