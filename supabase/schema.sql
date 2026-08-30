-- ==========================================================
-- GURME ŞARKÜTERİ - SUPABASE VERİTABANI KURULUM ŞEMASI
-- ==========================================================

-- 1. KATEGORİLER TABLOSU
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT DEFAULT '🧀',
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ÜRÜNLER TABLOSU
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    unit_type TEXT NOT NULL DEFAULT 'kg', -- 'kg', 'piece', 'pack'
    base_price NUMERIC(10, 2) NOT NULL,
    default_weight INT DEFAULT 500, -- gram cinsinden (örn: 500)
    weight_options JSONB DEFAULT '[250, 500, 750, 1000]'::jsonb,
    slice_options JSONB DEFAULT '["Standart Dilim", "İnce Dilim", "Blok / Kalıp", "Vakumlu"]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    badge TEXT,
    stock_status TEXT DEFAULT 'in_stock', -- 'in_stock', 'out_of_stock'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TESLİMAT BÖLGELERİ & MAHALLELER TABLOSU
CREATE TABLE IF NOT EXISTS public.delivery_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_name TEXT NOT NULL DEFAULT 'Merkez',
    neighborhood_name TEXT NOT NULL,
    min_order_amount NUMERIC(10, 2) DEFAULT 200.00,
    delivery_fee NUMERIC(10, 2) DEFAULT 0.00,
    estimated_time TEXT DEFAULT '30-45 dk',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. SİPARİŞLER TABLOSU
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    district_name TEXT DEFAULT 'Merkez',
    neighborhood_name TEXT NOT NULL,
    delivery_time_slot TEXT DEFAULT 'Hemen Gelsin (En Kısa Sürede)',
    payment_method TEXT NOT NULL DEFAULT 'cash_on_delivery', -- 'cash_on_delivery', 'card_on_delivery', 'bank_transfer'
    order_notes TEXT,
    subtotal NUMERIC(10, 2) NOT NULL,
    delivery_fee NUMERIC(10, 2) DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'preparing', 'on_way', 'delivered', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. SİPARİŞ KALEMLERİ (ÜRÜNLERİ) TABLOSU
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID,
    product_name TEXT NOT NULL,
    unit_type TEXT NOT NULL,
    selected_weight INT,
    selected_slice TEXT,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. DÜKKAN AYARLARI TABLOSU
CREATE TABLE IF NOT EXISTS public.store_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_name TEXT DEFAULT 'Ege Gurme Şarküteri',
    store_phone TEXT DEFAULT '0532 123 45 67',
    whatsapp_number TEXT DEFAULT '905321234567',
    address TEXT DEFAULT 'Atatürk Cad. No: 12/A, Merkez',
    min_order_amount NUMERIC(10, 2) DEFAULT 250.00,
    is_open BOOLEAN DEFAULT true,
    announcement TEXT DEFAULT '🌟 Taze Ezine Peyniri ve Gemlik Zeytinlerimizde haftanın indirimi!',
    estimated_delivery_time TEXT DEFAULT '30-45 dk',
    opening_hours TEXT DEFAULT '08:30 - 21:00',
    iban_info TEXT DEFAULT 'TR12 0006 1005 1234 5678 9012 34 (Ahmet Yılmaz - Ziraat Bankası)',
    admin_pin TEXT DEFAULT '1234'
);

-- RLS (Row Level Security) İzinleri (Tüm tablolara tam okuma/yazma izni)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Full Access Categories" ON public.categories;
CREATE POLICY "Public Full Access Categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access Products" ON public.products;
CREATE POLICY "Public Full Access Products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access Zones" ON public.delivery_zones;
CREATE POLICY "Public Full Access Zones" ON public.delivery_zones FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access Orders" ON public.orders;
CREATE POLICY "Public Full Access Orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access Order Items" ON public.order_items;
CREATE POLICY "Public Full Access Order Items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Full Access Store Settings" ON public.store_settings;
CREATE POLICY "Public Full Access Store Settings" ON public.store_settings FOR ALL USING (true) WITH CHECK (true);

-- Realtime yayını etkinleştir
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;

-- ==========================================================
-- BAŞLANGIÇ / ÖRNEK VERİLERİ (SEED DATA)
-- ==========================================================

-- Kategorileri Ekle
INSERT INTO public.categories (id, name, slug, icon, description, sort_order) VALUES
('c1111111-1111-1111-1111-111111111111', 'Peynir Çeşitleri', 'peynirler', '🧀', 'Ezine, Kaşar, Tulum, Yöresel Gurme Peynirler', 1),
('c2222222-2222-2222-2222-222222222222', 'Zeytin & Zeytinyağı', 'zeytinler', '🫒', 'Gemlik, Sele, Çizik Zeytinler ve Soğuk Sıkım Yağlar', 2),
('c3333333-3333-3333-3333-333333333333', 'Et & Şarküteri', 'et-sarkuteri', '🥩', 'Kayseri Pastırması, Sucuk, Kavurma, Füme Et', 3),
('c4444444-4444-4444-4444-444444444444', 'Bal, Kaymak & Reçel', 'bal-recel', '🍯', 'Karakovan Balı, Afyon Kaymağı, Ev Yapımı Reçeller', 4),
('c5555555-5555-5555-5555-555555555555', 'Yöresel & Meze', 'meze-kahvaltilik', '🥗', 'Acuka, Zahter, Çemen, Günlük Gurme Mezeler', 5),
('c6666666-6666-6666-6666-666666666666', 'Köy Yumurtası & Süt', 'yumurta-sut', '🥚', 'Gezen Tavuk Yumurtası, Günlük Çiftlik Sütü, Tereyağı', 6)
ON CONFLICT (slug) DO NOTHING;

-- Örnek Ürünleri Ekle
INSERT INTO public.products (category_id, name, description, image_url, unit_type, base_price, default_weight, weight_options, slice_options, is_active, is_featured, badge) VALUES
('c1111111-1111-1111-1111-111111111111', 'Hakiki Çanakkale Ezine Beyaz Peyniri', '12 ay olgunlaştırılmış tam yağlı koyun-keçi sütü karışımı geleneksel Ezine lezzeti.', 'https://images.unsplash.com/photo-1589881133595-a3c085cb731d?w=800&auto=format&fit=crop&q=80', 'kg', 480.00, 500, '[250, 500, 750, 1000]'::jsonb, '["Standart Dilim", "Kalıp / Blok", "Vakumlu Paket"]'::jsonb, true, true, 'Çok Satan'),
('c1111111-1111-1111-1111-111111111111', 'Eski Kars Kaşarı (18 Ay Dinlenmiş)', 'Doğal şirden mayalı, Kars yaylalarının taze sütlerinden üretilmiş enfes lezzet.', 'https://images.unsplash.com/photo-1624806992066-5ffcf7ca186b?w=800&auto=format&fit=crop&q=80', 'kg', 540.00, 500, '[250, 500, 750, 1000]'::jsonb, '["İnce Dilim", "Standart Dilim", "Kalıp / Blok"]'::jsonb, true, true, 'Yöresel'),
('c1111111-1111-1111-1111-111111111111', 'İzmir Tulum Peyniri', 'Geleneksel deride olgunlaştırılmış, tuz oranı dengeli sert kahvaltılık tulum.', 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&auto=format&fit=crop&q=80', 'kg', 490.00, 500, '[250, 500, 750, 1000]'::jsonb, '["Kalıp / Parça", "Rendelenmiş", "Vakumlu"]'::jsonb, true, false, NULL),
('c2222222-2222-2222-2222-222222222222', 'Gemlik Doğal Yağlı Sele Siyah Zeytin', 'Düşük tuzlu, ince kabuklu, çekirdeği küçük etli birinci sınıf Gemlik zeytini.', 'https://images.unsplash.com/photo-1541256942802-7b2996a84d43?w=800&auto=format&fit=crop&q=80', 'kg', 290.00, 500, '[250, 500, 1000]'::jsonb, '["Standart Paket", "Zeytinyağlı & Kekikli"]'::jsonb, true, true, 'Özel Seçim'),
('c2222222-2222-2222-2222-222222222222', 'Ayvalık Erken Hasat Soğuk Sıkım Zeytinyağı (1 Lt)', '0.4 asit, filtrelenmemiş, yoğun aromalı hakiki Ayvalık zeytinyağı.', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80', 'piece', 420.00, 1, '[]'::jsonb, '["Cam Şişe", "Koyu Şişe"]'::jsonb, true, true, 'Yeni Mahsul'),
('c3333333-3333-3333-3333-333333333333', 'Kayseri Çemenli Özel Antrikot Pastırma', 'Geleneksel kurutma yöntemiyle hazırlanan, tül inceliğinde dilimlenen antrikot pastırma.', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80', 'kg', 1450.00, 250, '[100, 200, 250, 500]'::jsonb, '["Tül İnceliğinde", "Standart Dilim", "Çemensiz"]'::jsonb, true, true, 'Gurme'),
('c3333333-3333-3333-3333-333333333333', 'Geleneksel Kangal Dana Sucuk (Acılı/Tatlı)', '%100 dana eti, doğal bağırsakta dinlendirilmiş özel baharat harmanlı sucuk.', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80', 'kg', 780.00, 500, '[500, 1000]'::jsonb, '["Bütün Kangal", "Dilimlenmiş & Vakumlu"]'::jsonb, true, true, 'Ödüllü'),
('c4444444-4444-4444-4444-444444444444', 'Karakovan Çiçek Balı (Süzme 850g)', 'Yüksek rakımlı Doğu Anadolu yaylalarından katkısız saf çiçek balı.', 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80', 'piece', 520.00, 1, '[]'::jsonb, '["Cam Kavanoz"]'::jsonb, true, false, 'Doğal'),
('c4444444-4444-4444-4444-444444444444', 'Taze Afyon Manda Kaymağı (200g)', 'Günlük taze manda sütünden elde edilmiş kıvamlı enfes kaymak.', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&auto=format&fit=crop&q=80', 'piece', 130.00, 1, '[]'::jsonb, '["Taze Kapalı Kutu"]'::jsonb, true, true, 'Günlük'),
('c5555555-5555-5555-5555-555555555555', 'Cevizli Ev Yapımı Acuka (300g)', 'Köz biber, domates salçası, ceviz ve zeytinyağı ile hazırlanmış kahvaltılık sos.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80', 'piece', 110.00, 1, '[]'::jsonb, '["Kavanoz"]'::jsonb, true, false, 'Katkısız'),
('c6666666-6666-6666-6666-666666666666', 'Doğal Gezen Tavuk Köy Yumurtası (15''li)', 'GDO''suz yemle beslenen serbest gezen tavuk yumurtası.', 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=800&auto=format&fit=crop&q=80', 'pack', 120.00, 1, '[]'::jsonb, '["15''li Viyol"]'::jsonb, true, true, 'Taze');

-- Mahalleleri Ekle
INSERT INTO public.delivery_zones (district_name, neighborhood_name, min_order_amount, delivery_fee, estimated_time) VALUES
('Merkez', 'Cumhuriyet Mahallesi', 200.00, 0.00, '25-35 dk'),
('Merkez', 'Atatürk Mahallesi', 200.00, 0.00, '25-35 dk'),
('Merkez', 'Fevzi Çakmak Mahallesi', 250.00, 0.00, '30-40 dk'),
('Merkez', 'Yıldıztepe Mahallesi', 250.00, 20.00, '35-45 dk'),
('Merkez', 'İstiklal Mahallesi', 200.00, 0.00, '25-35 dk'),
('Merkez', 'Bahçelievler Mahallesi', 300.00, 30.00, '40-50 dk');

-- Başlangıç Dükkan Ayarı Ekle
INSERT INTO public.store_settings (store_name, store_phone, whatsapp_number, address, min_order_amount, is_open, announcement, estimated_delivery_time, opening_hours, admin_pin)
VALUES ('Gurme Şarküteri & Yöresel Lezzetler', '0532 123 45 67', '905321234567', 'Cumhuriyet Cad. No: 24, İlçe Merkezi', 200.00, true, '🧀 Taze Ezine Peynirimiz ve Yeni Mahsul Zeytinyağımız Geldi! İlçe içi 30-45 dk kapınızda.', '30-45 dk', '08:30 - 20:30', '1234');
