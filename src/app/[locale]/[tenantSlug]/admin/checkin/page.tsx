"use client";

import { use, useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Html5QrcodeScanner } from "html5-qrcode";
import { QrCode, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function CheckinAdminPage({ params }: { params: Promise<{ locale: string, tenantSlug: string }> }) {
  const resolvedParams = use(params);
  const tenantSlug = resolvedParams.tenantSlug;
  const supabase = createClient();
  
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    fetchTenant();
    
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [tenantSlug]);

  const fetchTenant = async () => {
    const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', tenantSlug).single();
    if (tenant) {
      setTenantId(tenant.id);
      initializeScanner(tenant.id);
    }
    setLoading(false);
  };

  const initializeScanner = (tId: string) => {
    if (!document.getElementById("reader")) return;
    
    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );
    
    scannerRef.current.render(
      (decodedText) => onScanSuccess(decodedText, tId),
      (error) => { /* Ignore frequent scan errors */ }
    );
  };

  const onScanSuccess = async (decodedText: string, tId: string) => {
    // Pause scanning
    if (scannerRef.current) {
      scannerRef.current.pause(true);
    }
    setIsScanning(false);
    setScanError(null);
    setScanResult(null);

    try {
      // 1. Find guest by invite_code
      const { data: guest, error: guestError } = await supabase
        .from('guests')
        .select(`
          *,
          table_assignments(table_id, seat_number, tables(table_name))
        `)
        .eq('tenant_id', tId)
        .eq('invite_code', decodedText.trim().toUpperCase())
        .single();

      if (guestError || !guest) {
        setScanError("Bu QR koda ait misafir kaydı bulunamadı.");
        return;
      }

      if (!guest.is_attending) {
        setScanError("Bu misafir 'Katılamayacağım' olarak bildirim yapmış!");
        return;
      }

      if (guest.scanned_at) {
        setScanError("DİKKAT: Bu QR kod daha önce okutulmuş! (Giriş saati: " + new Date(guest.scanned_at).toLocaleTimeString() + ")");
        setScanResult(guest); // Still show who it is
        return;
      }

      // 2. Mark as scanned
      const now = new Date().toISOString();
      await supabase
        .from('guests')
        .update({ scanned_at: now })
        .eq('id', guest.id);

      guest.scanned_at = now;
      setScanResult(guest);

    } catch (err) {
      console.error(err);
      setScanError("Sunucu hatası oluştu. Lütfen tekrar deneyin.");
    }
  };

  const handleResumeScan = () => {
    setScanResult(null);
    setScanError(null);
    setIsScanning(true);
    if (scannerRef.current) {
      scannerRef.current.resume();
    }
  };

  if (loading) return <div className="text-gold">Kamera yükleniyor...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif text-white mb-2">QR Kod Okuyucu</h1>
        <p className="text-white/60">
          Mekan girişindeki davetlilerin QR kodlarını bu ekrandan okutarak içeri alabilirsiniz.
        </p>
      </div>

      {/* Scanner Box */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 overflow-hidden">
        <div id="reader" className={`w-full max-w-lg mx-auto overflow-hidden rounded-xl bg-black ${!isScanning ? 'hidden' : ''}`}></div>
        
        {/* Results Box */}
        {!isScanning && (
          <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
            {scanError && !scanResult && (
              <>
                <XCircle className="w-16 h-16 text-red-500 mb-4" />
                <h3 className="text-2xl font-bold text-red-500 mb-2">Geçersiz Kod</h3>
                <p className="text-white/70 mb-8">{scanError}</p>
              </>
            )}

            {scanError && scanResult && (
              <>
                <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
                <h3 className="text-2xl font-bold text-yellow-500 mb-2">Zaten Okutulmuş</h3>
                <p className="text-yellow-500/70 mb-8">{scanError}</p>
              </>
            )}

            {!scanError && scanResult && (
              <>
                <CheckCircle2 className="w-20 h-20 text-green-500 mb-4 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                <h3 className="text-3xl font-bold text-white mb-2">Giriş Başarılı</h3>
                <p className="text-green-400 mb-8 font-medium">Hoş geldiniz!</p>
              </>
            )}

            {/* Guest Details Card */}
            {scanResult && (
              <div className="bg-black/40 border border-white/10 w-full max-w-sm rounded-xl p-6 text-left mb-8 shadow-2xl">
                <div className="text-white/50 text-xs tracking-widest uppercase mb-1">Misafir</div>
                <div className="text-2xl font-serif text-gold mb-4">{scanResult.full_name}</div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-white/50 text-xs tracking-widest uppercase mb-1">Kişi Sayısı</div>
                    <div className="text-white font-mono">{scanResult.guest_count}</div>
                  </div>
                  <div>
                    <div className="text-white/50 text-xs tracking-widest uppercase mb-1">Masa</div>
                    <div className="text-white font-semibold">
                      {scanResult.table_assignments?.[0]?.tables?.table_name || 'Atanmadı'}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-white/50 text-xs tracking-widest uppercase mb-1">Seçilen Koltuklar</div>
                    <div className="text-white font-semibold flex gap-2 flex-wrap">
                      {scanResult.table_assignments && scanResult.table_assignments.length > 0 
                        ? scanResult.table_assignments.map((assignment: any, idx: number) => (
                            <span key={idx} className="bg-gold/20 text-gold px-3 py-1 rounded-full text-sm">
                              {assignment.tables?.table_name} - Koltuk {assignment.seat_number}
                            </span>
                          ))
                        : 'Atanmadı'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleResumeScan}
              className="bg-gold hover:bg-gold-light text-black px-8 py-4 rounded-full font-bold tracking-wider uppercase transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 active:scale-95"
            >
              <QrCode size={20} />
              Yeni Kod Okut
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        /* Override html5-qrcode default ugly styles */
        #reader { border: none !important; border-radius: 0.75rem; overflow: hidden; }
        #reader__dashboard_section_csr span { color: white !important; }
        #reader__dashboard_section_swaplink { color: #d4af37 !important; text-decoration: none; }
        #reader button { background-color: #d4af37 !important; color: black !important; font-weight: bold; padding: 8px 16px; border-radius: 4px; border: none; cursor: pointer; text-transform: uppercase; margin: 10px; }
      `}</style>
    </div>
  );
}
