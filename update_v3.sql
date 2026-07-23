-- Lütfen bu kodu Supabase SQL Editor alanında çalıştırın!
-- Bu kod mevcut verilerinizi SİLMEZ, sadece tenans tablosuna yeni özelliği ekler.

ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS site_config JSONB DEFAULT '{}'::jsonb;
