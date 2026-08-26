import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Armchair, CalendarDays, Images, MapPin, QrCode, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Invitation SaaS · Güvenli Ürün Demosu',
  description: 'Tenant, RSVP, masa planı, medya ve QR check-in akışlarını örnek veriyle gösteren portfolyo demosu.',
};

const operations = [
  { icon: Users, label: 'Misafir yönetimi', value: '128 davetli', detail: 'RSVP durumu ve kişi sayısı' },
  { icon: Armchair, label: 'Masa planı', value: '14 masa', detail: 'Koltuk bazlı yerleşim' },
  { icon: QrCode, label: 'QR check-in', value: '96 giriş', detail: 'Tekrar okutma kontrolü' },
  { icon: Images, label: 'Medya onayı', value: '34 gönderi', detail: 'Yönetici moderasyonu' },
];

export default function PortfolioDemoPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080706] text-[#f6efe4]">
      <section className="relative isolate flex min-h-screen items-center justify-center px-6 py-24 text-center">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_28%,rgba(212,175,55,0.18),transparent_34%),linear-gradient(180deg,#100d09_0%,#080706_72%)]" />
        <div className="absolute inset-0 -z-10 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:48px_48px]" />

        <div className="mx-auto max-w-5xl">
          <span className="mb-8 inline-flex rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#e8c968]">
            Güvenli portfolyo demosu · Örnek veri
          </span>
          <p className="mb-5 text-sm uppercase tracking-[0.45em] text-[#d4af37]">Dijital davetiye ve etkinlik operasyonu</p>
          <h1 className="font-serif text-6xl leading-none md:text-8xl">Ece <span className="text-[#d4af37]">&</span> Mert</h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-white/60 md:text-lg">
            Davetli deneyiminden mekan girişine kadar bütün etkinlik akışını tenant bazında yöneten çok kiracılı ürün prototipi.
          </p>

          <div className="mx-auto mt-12 flex max-w-xl flex-col justify-center gap-4 text-left sm:flex-row">
            <div className="flex flex-1 items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <CalendarDays className="text-[#d4af37]" />
              <div><span className="block text-xs uppercase tracking-widest text-white/40">Tarih</span><strong className="font-serif text-lg">12 Eylül 2026</strong></div>
            </div>
            <div className="flex flex-1 items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <MapPin className="text-[#d4af37]" />
              <div><span className="block text-xs uppercase tracking-widest text-white/40">Konum</span><strong className="font-serif text-lg">İstanbul</strong></div>
            </div>
          </div>

          <a href="#operations" className="mx-auto mt-12 inline-flex items-center gap-3 rounded-full bg-[#d4af37] px-7 py-4 text-sm font-bold uppercase tracking-wider text-black transition hover:bg-[#ecd77f]">
            Operasyon akışını incele <ArrowRight size={17} />
          </a>
        </div>
      </section>

      <section id="operations" className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d4af37]">Tenant operasyon paneli</span>
            <h2 className="mt-5 font-serif text-4xl leading-tight md:text-6xl">Davetiyeden check-in’e tek veri akışı.</h2>
            <p className="mt-6 max-w-xl leading-8 text-white/55">
              Her etkinlik kendi tenant sınırında çalışır. Misafir yanıtı masa planını, kişiselleştirilmiş QR kartını ve giriş operasyonunu aynı kayıt üzerinden günceller.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {operations.map(({ icon: Icon, label, value, detail }) => (
              <article key={label} className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
                <Icon className="mb-10 text-[#d4af37]" size={26} />
                <span className="block text-xs uppercase tracking-widest text-white/40">{label}</span>
                <strong className="mt-3 block font-serif text-3xl">{value}</strong>
                <p className="mt-2 text-sm text-white/50">{detail}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-20 rounded-[2rem] border border-[#d4af37]/20 bg-gradient-to-br from-[#17120b] to-[#0c0a08] p-7 md:p-12">
          <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <span className="text-xs uppercase tracking-[0.28em] text-[#d4af37]">Kişiselleştirilmiş giriş kartı</span>
              <h3 className="mt-4 font-serif text-3xl md:text-5xl">RSVP onayından sonra QR geçiş kartı.</h3>
              <p className="mt-5 max-w-2xl leading-7 text-white/55">Davet kodu tenant ve misafir kaydıyla doğrulanır; daha önce okutulan veya katılmayacağını bildiren kayıtlar operatöre ayrı durum olarak gösterilir.</p>
            </div>
            <div className="grid h-44 w-44 place-items-center rounded-3xl bg-white text-black shadow-2xl">
              <QrCode size={108} strokeWidth={1.3} />
              <span className="-mt-5 font-mono text-[10px] tracking-widest">PORTFOLIO-DEMO</span>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
          <p className="max-w-2xl text-sm leading-6 text-white/45">Bu sayfa müşteri verisi kullanmaz ve Supabase bağlantısından bağımsızdır. Gerçek üründeki veri yazma işlemleri bu demoda devre dışıdır.</p>
          <Link href="/tr" className="inline-flex items-center gap-2 text-sm font-semibold text-[#d4af37]">Platform ana sayfası <ArrowRight size={16} /></Link>
        </div>
      </section>
    </main>
  );
}
