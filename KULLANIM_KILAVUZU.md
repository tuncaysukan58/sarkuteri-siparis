# 🧀 Gurme Şarküteri — Hızlı Kullanım & Yönetim Kılavuzu

Tebrikler! Şarküteri sipariş ve yönetim sisteminiz başarıyla canlıya alındı. Bu kılavuz, sistemi hem müşterileriniz hem de sizin en verimli şekilde nasıl kullanacağınızı adım adım anlatır.

---

## 📱 1. Müşteri Sipariş Süreci (Müşteri Gözünden)

Müşteriniz web sitenize girdiğinde şu kolay adımlarla sipariş verir:

1. **Ürün & Kategori Seçimi:**
   - Kategorilerden (Peynir, Zeytin, Pastırma, Bal vb.) dilediği ürüne tıklar.
2. **Gramaj ve Dilimleme Tercihi:**
   - Kilogramlık ürünlerde (ör. Ezine Peyniri veya Pastırma): *250g, 500g, 750g, 1000g* seçebilir. Fiyat anında otomatik hesaplanır.
   - Hazırlanış tercihi seçer: *Standart Dilim, Tül İnceliğinde, Kalıp / Blok, Vakumlu Paket*.
3. **Sepet & Mahalle Seçimi:**
   - Sağdaki sepetten **"Siparişi Tamamla"** butonuna basar.
   - İlçe içerisindeki mahallesini seçer (Minimum paket tutarı ve kurye ücreti otomatik uygulanır).
   - Adını, telefonunu ve açık adresini yazar.
4. **Ödeme Yöntemi:**
   - *Kapıda Nakit*, *Kapıda Kredi Kartı (Mobil POS)* veya *Banka Havalesi / IBAN* seçer.
5. **Sipariş Tamamlama & WhatsApp Bildirimi:**
   - Siparişi tamamladığında ekranda sipariş numarası (**SRK-XXXX**) çıkar.
   - Müşteri tek tıkla **"WhatsApp'tan Bildir"** butonuna basarak sipariş özet fişini dükkanınızın WhatsApp hattına doğrudan gönderebilir.

---

## 👨‍🍳 2. Esnaf Yönetim Paneli (Admin)

Dükkanınızı ve siparişlerinizi yönetmek için:
- **Giriş Adresi:** `siteniz.vercel.app/admin`
- **Varsayılan PIN Kodu:** `1234` *(Ayarlar sayfasından değiştirebilirsiniz)*

### 📋 A. Canlı Siparişler Ekranı (`/admin`)
- **Sesli Uyarı:** Yeni sipariş geldiğinde dükkandaki bilgisayar/telefonda sesli sinyal çalar.
- **Sipariş Aşamaları:** Siparişi tek tıkla aşama aşama güncelleyebilirsiniz:
  - *Yeni Sipariş -> Hazırlanıyor -> Kuryede / Yolda -> Teslim Edildi*.
- **Fiş Yazdır:** Sipariş kutusundaki **"Fiş Yazdır"** butonuna basarak termal fiş yazıcısından veya A4'ten anında kurye/mutfak fişi çıkartabilirsiniz.

---

### 🏷️ B. Kategori Yönetimi (`/admin/kategoriler`)
- Yeni ürün grupları ekleyebilirsiniz (Örn: *Doğal Reçeller, Kahvaltılık Soslar*).
- Kategorinize uygun **emoji / ikon** seçebilirsiniz (🧀, 🫒, 🥩, 🍯 vb.).
- Kategorilerin vitrinde hangi sırada çıkacağını belirleyebilirsiniz.

---

### 📦 C. Ürün ve Fiyat Yönetimi (`/admin/urunler`)
- **Yeni Ürün Ekleme:** Ürün adı, kategorisi, birim türü (kg / adet / paket), fiyatı ve fotoğrafını ekleyebilirsiniz.
- **Gramaj & Dilimleme:** Müşterinin o ürün için hangi gramajları seçebileceğini işaretleyebilirsiniz.
- **Tek Tıkla Stok Durumu:** Biten bir ürünü tek tıkla **"Tükendi"** yapabilir, geldiğinde tekrar **"Stokta Var"**a alabilirsiniz.
- **Rozetler:** Ürünlerin üzerine *Çok Satan, Yöresel, Yeni Mahsul* gibi dikkat çekici etiketler koyabilirsiniz.

---

### ⚙️ D. Dükkan & Mahalle Ayarları (`/admin/ayarlar`)
- **Dükkan Açık / Kapalı:** Dükkan kapandığında tek anahtarla sipariş alımını durdurabilirsiniz.
- **Üst Duyuru Metni:** Sitenin en üstündeki kayan indirim/duyuru yazısını dilediğiniz an değiştirebilirsiniz.
- **WhatsApp Hattı:** Sipariş bildirimlerinin geleceği WhatsApp telefon numaranızı güncelleyebilirsiniz.
- **Mahalle Ekleme / Düzenleme:** İlçe içindeki yeni mahalleleri, o mahalleye ait minimum sepet tutarını ve kurye ücretini belirleyebilirsiniz.

---

## 🔍 3. Müşteri Sipariş Takibi (`/siparis-takip`)
Müşterileriniz diledikleri zaman ana sayfadaki **"Sipariş Sorgula"** linkinden sipariş kodunu veya telefon numarasını girerek siparişlerinin hazırlanıp kuryeye verilip verilmediğini canlı olarak görebilirler.

---

### 💡 Günlük Pratik İpuçları
1. Sabah dükkanı açtığınızda bilgisayarınızda veya tabletinizde `/admin` sayfasını açık bırakıp sesini açın.
2. Yeni sipariş düştüğünde fişini yazdırıp hazırlığa başlayın.
3. Kurye yola çıktığında **"Kuryeye Ver"**, teslim edildiğinde **"Teslim Edildi"** butonuna basın; müşteri de canlı takip ekranında bunu anında görsün.
