-- ====================================================================================
-- SAAAS WEDDING PLATFORM SCHEMA (MULTI-TENANT)
-- Lütfen bu kodu Supabase SQL Editor'de çalıştırın (Mevcut verileriniz silinecektir!)
-- ====================================================================================

-- Eklenti (UUID için)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Temizlik (Sıfırdan kurmak için eski tabloları sil)
DROP TABLE IF EXISTS guest_messages CASCADE;
DROP TABLE IF EXISTS uploaded_media CASCADE;
DROP TABLE IF EXISTS table_assignments CASCADE;
DROP TABLE IF EXISTS rsvp_responses CASCADE;
DROP TABLE IF EXISTS guests CASCADE;
DROP TABLE IF EXISTS tables CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;

-- 1. TENANTS (ÇİFTLER / MÜŞTERİLER) TABLOSU
-- Her çiftin kendi sitesi ve kendi veritabanı yalıtımı (isolation) olacak.
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL, -- Örn: ayse-mehmet (URL'de kullanılacak)
  bride_name TEXT NOT NULL,
  groom_name TEXT NOT NULL,
  wedding_date TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- pending, approved, active, suspended
  owner_email TEXT, -- Çiftin admin girişi yapacağı mail adresi
  hero_image_url TEXT, -- Canlı düzenlemede arka plan resmi vs.
  site_config JSONB DEFAULT '{}'::jsonb, -- Çiftlerin site içindeki yazıları ve fotoları özelleştirmesi için esnek alan
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. GUESTS (MİSAFİRLER)
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  email TEXT,
  is_attending BOOLEAN,
  guest_count INT DEFAULT 1,
  invite_code TEXT,
  scanned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, invite_code) -- Aynı çiftte aynı kod 2 kez olamaz.
);

-- 3. RSVP_RESPONSES (LCV YANITLARI)
CREATE TABLE rsvp_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  attending_count INT DEFAULT 0,
  dietary_requirements TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(guest_id)
);

-- 4. TABLES (MASALAR)
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL, -- Örn: Masa 1, Aile Masası
  capacity INT DEFAULT 8, -- Görsel tasarım için standart 8 kişilik
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLE_ASSIGNMENTS (MASA VE KOLTUK ATAMALARI - OBILET TARZI)
CREATE TABLE table_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  table_id UUID REFERENCES tables(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  seat_number INT NOT NULL CHECK (seat_number >= 1 AND seat_number <= 8), -- 1'den 8'e kadar koltuk numarası
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Bir misafir (aile temsilen) birden fazla koltuk alabilir, bu yüzden UNIQUE(guest_id) KILDIRILDI
  UNIQUE(table_id, seat_number) -- Bir sandalyeye sadece 1 kişi oturabilir (Çift rezervasyon engeli)
);

-- 6. UPLOADED MEDIA (GALERİ - ÇİFTLERE ÖZEL)
CREATE TABLE uploaded_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image',
  is_approved BOOLEAN DEFAULT false,
  uploaded_by UUID REFERENCES guests(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. GUEST MESSAGES (DİLEKLER - ÇİFTLERE ÖZEL)
CREATE TABLE guest_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================================
-- RLS (ROW LEVEL SECURITY) POLICIES
-- ====================================================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvp_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_messages ENABLE ROW LEVEL SECURITY;

-- HERKES (PUBLIC) OKUMA VE YAZMA İZİNLERİ (Uygulama kodunda tenant_id ile filtrelenecek)
CREATE POLICY "Public Read Tenants" ON tenants FOR SELECT USING (status = 'approved' OR status = 'active');
CREATE POLICY "Public Insert Tenants" ON tenants FOR INSERT WITH CHECK (true); -- Çiftlerin kayıt başvurusu yapabilmesi için
CREATE POLICY "Public Update Tenants" ON tenants FOR UPDATE USING (true);

CREATE POLICY "Public Insert Guests" ON guests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Guests" ON guests FOR UPDATE USING (true);
CREATE POLICY "Public Read Guests" ON guests FOR SELECT USING (true);

CREATE POLICY "Public Insert RSVP" ON rsvp_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read RSVP" ON rsvp_responses FOR SELECT USING (true);

CREATE POLICY "Public Read Tables" ON tables FOR SELECT USING (true);
CREATE POLICY "Public Insert Tables" ON tables FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Delete Tables" ON tables FOR DELETE USING (true);

CREATE POLICY "Public Insert Table Assignments" ON table_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Table Assignments" ON table_assignments FOR SELECT USING (true);
CREATE POLICY "Public Delete Table Assignments" ON table_assignments FOR DELETE USING (true);

CREATE POLICY "Public Insert Media" ON uploaded_media FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Media" ON uploaded_media FOR SELECT USING (true);

CREATE POLICY "Public Insert Messages" ON guest_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Messages" ON guest_messages FOR SELECT USING (true);

-- ====================================================================================
-- DUMMY VERİ EKLENMESİ (TEST İÇİN)
-- ====================================================================================

-- 1. İlk Çifti Ekleyelim (Müşteri)
INSERT INTO tenants (id, slug, bride_name, groom_name, status, owner_email)
VALUES ('11111111-1111-1111-1111-111111111111', 'ayse-mehmet', 'Ayşe', 'Mehmet', 'active', 'cift@example.com');

-- 2. Bu Çifte Özel 3 Tane 8 Kişilik Masa Ekleyelim
INSERT INTO tables (id, tenant_id, table_name, capacity)
VALUES 
('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Aile Masası', 8),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Masa 1', 8),
('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Masa 2', 8);

-- ====================================================================================
-- RPC FUNCTIONS (DATABASE TRANSACTIONS)
-- ====================================================================================

-- Bu fonksiyon Misafir Ekleme, LCV Yanıtı ve Masa/Koltuk atamasını TEK BİR İŞLEMDE (Transaction) yapar.
-- Eğer seçilen koltuklardan biri dahi doluysa (unique_violation), işlemi iptal eder ve hiçbir veriyi kaydetmez.
CREATE OR REPLACE FUNCTION submit_rsvp_with_seats(
  p_tenant_id UUID,
  p_full_name TEXT,
  p_phone_number TEXT,
  p_email TEXT,
  p_is_attending BOOLEAN,
  p_guest_count INTEGER,
  p_invite_code TEXT,
  p_dietary TEXT,
  p_message TEXT,
  p_seats JSONB
) RETURNS JSONB AS $$
DECLARE
  v_guest_id UUID;
  v_seat JSONB;
BEGIN
  -- 1. Insert Guest
  INSERT INTO guests (tenant_id, full_name, phone_number, email, is_attending, guest_count, invite_code)
  VALUES (p_tenant_id, p_full_name, p_phone_number, p_email, p_is_attending, p_guest_count, p_invite_code)
  RETURNING id INTO v_guest_id;

  -- 2. Insert RSVP Response
  INSERT INTO rsvp_responses (tenant_id, guest_id, attending_count, dietary_requirements, message)
  VALUES (
    p_tenant_id, 
    v_guest_id, 
    CASE WHEN p_is_attending THEN p_guest_count ELSE 0 END, 
    p_dietary, 
    p_message
  );

  -- 3. Insert Seats
  IF p_is_attending AND jsonb_array_length(p_seats) > 0 THEN
    FOR v_seat IN SELECT * FROM jsonb_array_elements(p_seats)
    LOOP
      BEGIN
        INSERT INTO table_assignments (tenant_id, guest_id, table_id, seat_number)
        VALUES (
          p_tenant_id, 
          v_guest_id, 
          (v_seat->>'table_id')::UUID, 
          (v_seat->>'seat_number')::INTEGER
        );
      EXCEPTION WHEN unique_violation THEN
        -- Koltuklardan biri doluysa tüm transaction'ı iptal et (Rollback)
        RAISE EXCEPTION 'SEAT_TAKEN';
      END;
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'guest_id', v_guest_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
