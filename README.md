# Invitation SaaS

Çok kiracılı dijital davetiye ve etkinlik operasyon platformu. Ürün; davetli deneyimini, RSVP ve koltuk seçimini, misafir yönetimini, medya yüklemeyi ve QR check-in operasyonunu aynı tenant sınırı içinde birleştirir.

**Canlı ürün:** [nlksoft-saas-invitation.vercel.app](https://nlksoft-saas-invitation.vercel.app)

**Veri bağımsız portfolyo demosu:** [nlksoft-saas-invitation.vercel.app/tr/portfolio-demo](https://nlksoft-saas-invitation.vercel.app/tr/portfolio-demo)

## Ürün kapsamı

- Tenant ve dil kodu tabanlı davetiye adresleri (`/{locale}/{tenantSlug}`)
- Düğün ve kurumsal etkinlik şablonları
- Kişiselleştirilmiş davet kodu, RSVP ve görsel koltuk seçimi
- Masa, misafir, mesaj ve katılım yönetimi
- Kamera tabanlı QR check-in ve tekrar okutma kontrolü
- Yönetici onaylı misafir fotoğraf/video yükleme akışı
- Türkçe, İngilizce ve Arapça içerik; RTL desteği
- React Three Fiber, GSAP ve Framer Motion tabanlı yaratıcı davetiye deneyimi

## Mimari

```text
Next.js App Router
  └─ locale sınırı
      └─ tenant sınırı
          ├─ herkese açık davetiye ve RSVP
          ├─ kişiselleştirilmiş davet/QR kartı
          └─ tenant admin operasyonları

Supabase
  ├─ Auth ve SSR oturum katmanı
  ├─ PostgreSQL tenant verisi
  └─ Storage medya alanı
```

İstemci tarafındaki etkileşimli yüzeyler Next.js Client Components ile, oturum ve tenant çözümleme katmanı ise Supabase SSR istemcileriyle ayrıştırılmıştır. Her operasyon `tenant_id` üzerinden kapsamlanır; üretim ortamında tablo ve Storage politikalarının Row Level Security ile uygulanması gerekir.

## Temel route'lar

| Route | Sorumluluk |
| --- | --- |
| `/{locale}` | Platform tanıtımı ve örnek davetiye girişi |
| `/{locale}/{tenantSlug}` | Tenant'a ait genel davetiye deneyimi |
| `/{locale}/{tenantSlug}/invitation/{id}` | Kişiselleştirilmiş davet, RSVP durumu ve QR giriş kartı |
| `/{locale}/{tenantSlug}/upload` | Davetli medya yükleme alanı |
| `/{locale}/{tenantSlug}/admin` | Etkinlik operasyon özeti |
| `/{locale}/{tenantSlug}/admin/checkin` | QR check-in operatör ekranı |

## Yerel kurulum

```bash
npm install
npm run dev
```

`.env.local` içinde aşağıdaki public Supabase değerleri tanımlanmalıdır:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Şema başlangıç dosyaları `saas_schema.sql` ve `src/lib/supabase/schema.sql` altında bulunur. Gerçek anahtarları veya müşteri verilerini repository'ye eklemeyin.

## Kalite kontrolleri

```bash
npm test -- --runInBand
npm run build
```

Mevcut paket; RSVP doğrulaması, medya seçim davranışı ve tenant kapsamlı QR okuyucu başlangıcını kapsayan 6 Jest/Testing Library testi içerir. Production build ayrıca TypeScript kontrolünden geçer.

## Teknoloji seti

Next.js 16, React 19, TypeScript, Supabase SSR/PostgreSQL/Storage, next-intl, React Three Fiber, GSAP, Framer Motion, Zod, React Hook Form, Jest ve Testing Library.

## Portfolyo notu

Bu repository ürünün teknik kapsamını göstermek için açıktır. Canlı ortamda görünen kişi, davet ve etkinlik bilgileri örnek veriyle sınırlı tutulmalı; gerçek müşteri içerikleri ekran görüntülerinde veya test fixture'larında kullanılmamalıdır.
