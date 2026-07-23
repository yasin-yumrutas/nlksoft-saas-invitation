-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. admin_users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. site_settings
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bride_name TEXT NOT NULL,
  groom_name TEXT NOT NULL,
  wedding_date TIMESTAMPTZ NOT NULL,
  venue_name TEXT NOT NULL,
  venue_address TEXT NOT NULL,
  map_coordinates TEXT,
  dress_code TEXT,
  theme_colors JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. translations
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  locale TEXT NOT NULL, -- 'tr', 'en', 'ar'
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. events (Wedding Program)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  time_start TIME NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. guests
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invite_code TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  max_plus_ones INT DEFAULT 0,
  is_attending BOOLEAN,
  email TEXT,
  phone TEXT,
  language_preference TEXT DEFAULT 'tr',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. rsvp_responses
CREATE TABLE rsvp_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  attending_count INT NOT NULL DEFAULT 1,
  plus_one_names TEXT,
  children_count INT DEFAULT 0,
  dietary_requirements TEXT,
  needs_transport BOOLEAN DEFAULT false,
  needs_accommodation BOOLEAN DEFAULT false,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. guest_messages (For the public message board)
CREATE TABLE guest_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_name TEXT NOT NULL,
  message TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. tables
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  capacity INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. table_assignments
CREATE TABLE table_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID REFERENCES tables(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(guest_id)
);

-- 10. check_ins
CREATE TABLE check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  check_in_time TIMESTAMPTZ DEFAULT NOW(),
  scanned_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. gallery_items
CREATE TABLE gallery_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  caption TEXT,
  is_visible BOOLEAN DEFAULT true,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. uploaded_media (By guests during wedding)
CREATE TABLE uploaded_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id UUID REFERENCES guests(id),
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL, -- 'image' or 'video'
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. story_items (Our Story timeline)
CREATE TABLE story_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date_text TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. weddings (For multi-tenant SaaS structure later)
CREATE TABLE weddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvp_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to necessary tables
CREATE POLICY "Public Read Settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Events" ON events FOR SELECT USING (true);
CREATE POLICY "Public Read Translations" ON translations FOR SELECT USING (true);
CREATE POLICY "Public Read Story" ON story_items FOR SELECT USING (true);
CREATE POLICY "Public Read Gallery" ON gallery_items FOR SELECT USING (is_visible = true);
CREATE POLICY "Public Read Approved Messages" ON guest_messages FOR SELECT USING (is_approved = true);

-- Allow public inserts (with restrictions)
CREATE POLICY "Public Insert Messages" ON guest_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert RSVP" ON rsvp_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Guest Uploads" ON uploaded_media FOR INSERT WITH CHECK (true);

-- Admins can do everything on all tables
CREATE POLICY "Admin Full Access Settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access Events" ON events FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access Guests" ON guests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access RSVP" ON rsvp_responses FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access Messages" ON guest_messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access Tables" ON tables FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access Assignments" ON table_assignments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access CheckIns" ON check_ins FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access Gallery" ON gallery_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access Media" ON uploaded_media FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin Full Access Story" ON story_items FOR ALL USING (auth.role() = 'authenticated');
