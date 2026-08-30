# 🧀 Gurme Şarküteri — İlçe İçi Hızlı Sipariş ve Yönetim Sistemi

İlçe ve mahalle bazlı taze şarküteri siparişleri almak, ürünleri gramaj (250g, 500g, 1kg) ve dilimleme tercihleriyle müşteriye sunmak, esnaf panelinden canlı sipariş takibi ve termal fiş yazdırmak için geliştirilmiş modern web uygulamasıdır.

**Vercel** ve **Supabase** ile %100 uyumlu olarak tasarlanmıştır.

---

## 🌟 Öne Çıkan Özellikler

### 1. Müşteri Deneyimi (Mobil & Masaüstü)
- **Dinamik Kategoriler:** Peynirler, Zeytin & Yağlar, Et & Şarküteri, Bal-Kaymak, Yöresel Mezeler vb.
- **Şarküteriye Özel Gramaj Seçimi:** 100g, 250g, 500g, 750g, 1000g veya özel miktar seçimiyle anlık dinamik fiyat hesaplama.
- **Dilimleme & Hazırlama Tercihi:** Tül İnceliğinde, Standart Dilim, Kalıp/Blok, Vakumlu Paket, Rendelenmiş.
- **İlçe İçi Mahalle Seçimi:** Mahallelere göre minimum sipariş tutarı ve kurye ücreti kontrolü.
- **Hızlı Sipariş:** Kapıda Nakit, Kapıda Kredi Kartı (Mobil POS) veya IBAN / Havale.
- **Otomatik WhatsApp Sipariş Fişi:** Müşteri siparişi tek tıkla doğrudan dükkanın WhatsApp hattına iletebilir.
- **Canlı Sipariş Takibi:** Sipariş No veya Telefon ile siparişin anlık durumunu (*Hazırlanıyor -> Kuryede -> Teslim Edildi*) izleme.

### 2. Esnaf & Yönetim Paneli (`/admin`)
- **Canlı Sipariş Takibi & Sesli Bildirim:** Yeni sipariş geldiğinde anında ekrana düşer ve sesli uyarı verir.
- **Tek Tıkla Termal / A4 Fiş Yazdırma:** Kurye veya mutfak/tezgah için yazdırılabilir fiş formatı.
- **Dinamik Kategori Yönetimi (`/admin/kategoriler`):** Yeni kategori ekleme, emoji/ikon seçimi, vitrin sıralaması, aktif/pasif yapma, silme.
- **Ürün & Fiyat Yönetimi (`/admin/urunler`):** Ürün ekleme, kilogram/adet fiyatı belirleme, gramaj seçenekleri, stokta var/yok butonu.
- **Dükkan & Mahalle Ayarları (`/admin/ayarlar`):** Dükkan açık/kapalı anahtarı, üst duyuru barı, WhatsApp numarası, ilçe içi teslimat mahalleleri ekleme/düzenleme.

---

## 🚀 Yerel Olarak Çalıştırma

```bash
# 1. Bağımlılıkları yükleyin
npm install

# 2. Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açarak uygulamayı hemen kullanabilirsiniz.

---

## 🗄️ Supabase Kurulumu (2 Dakikada Canlı Veritabanı)

1. [Supabase](https://supabase.com) üzerinde ücretsiz bir proje oluşturun.
2. Sol menüden **SQL Editor** sayfasına gidin.
3. Projedeki [`supabase/schema.sql`](./supabase/schema.sql) dosyasının içeriğini kopyalayıp SQL Editor'e yapıştırın ve **Run** butonuna basın. (Tüm tablolar, kategoriler ve örnek şarküteri ürünleri otomatik yüklenecektir.)
4. **Project Settings > API** bölümünden `Project URL` ve `anon public` anahtarınızı alın.
5. `.env.local` dosyanıza ekleyin:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_ADMIN_PIN=1234
   ```

*(Not: Supabase bilgileri girilmediğinde uygulama otomatik olarak yerel demo modunda çalışmaya devam eder!)*

---

## 🌐 Vercel ile Canlıya Alma (Deployment)

1. Projeyi GitHub reponuza yükleyin.
2. [Vercel](https://vercel.com) paneline gidip **Add New Project > Import** adımıyla reponuzu seçin.
3. **Environment Variables** bölümüne:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ADMIN_PIN` (Varsayılan: `1234`)
   ekleyin.
4. **Deploy** butonuna basın! Saniyeler içinde canlıya alınacaktır.

---

## 🔐 Yönetici Paneli Girişi

- **URL:** `/admin`
- **Varsayılan PIN Kodu:** `1234` (Ayarlar sayfasından veya `.env` üzerinden değiştirilebilir)
