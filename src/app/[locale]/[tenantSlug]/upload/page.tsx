"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

import { createClient } from "@/lib/supabase/client";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setErrorMsg("");
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('wedding-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('wedding-media')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('uploaded_media')
        .insert([
          {
            media_url: publicUrlData.publicUrl,
            media_type: file.type.startsWith('video/') ? 'video' : 'image',
            is_approved: false
          }
        ]);

      if (dbError) throw dbError;

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFile(null);
      }, 3000);
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMsg(err.message || "Yükleme sırasında bir hata oluştu.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#0a0a0a] p-8 rounded-2xl shadow-2xl border border-gold/20"
      >
        <div className="text-center mb-8">
          <span className="text-gold tracking-[0.3em] uppercase text-xs font-semibold mb-2 block">
            Bizimle Paylaşın
          </span>
          <h1 className="font-serif text-3xl text-white mb-4">Anı Ekle</h1>
          <p className="text-white/60 font-sans text-sm">
            Düğünümüzde çektiğiniz en güzel fotoğrafları buraya yükleyerek galerimize katkıda bulunabilirsiniz.
          </p>
        </div>

        {success ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
            <h2 className="text-2xl text-white font-serif">Teşekkürler!</h2>
            <p className="text-white/50 text-sm mt-2">Fotoğrafınız yönetici onayına gönderildi.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="relative border-2 border-dashed border-white/20 rounded-xl p-8 hover:border-gold/50 transition-colors flex flex-col items-center justify-center cursor-pointer bg-white/5 group">
              <input 
                type="file" 
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-12 h-12 text-white/30 group-hover:text-gold transition-colors mb-4" />
              <p className="text-white/70 font-sans text-center">
                {file ? (
                  <span className="text-gold font-semibold">{file.name}</span>
                ) : (
                  <>Fotoğraf seçmek için <span className="text-gold">tıklayın</span> veya sürükleyin.</>
                )}
              </p>
            </div>

            <button 
              type="submit"
              disabled={!file || uploading}
              className="w-full bg-gold text-black font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Yükleniyor..." : "Gönder"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
