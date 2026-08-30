import React from 'react';
import Link from 'next/link';
import { Phone, MapPin, Clock, MessageSquare, ShieldCheck, Heart } from 'lucide-react';
import { StoreSettings } from '@/types/database';

interface FooterProps {
  settings?: StoreSettings;
}

export function Footer({ settings }: FooterProps) {
  const storeName = settings?.store_name || 'Gurme Şarküteri';
  const phone = settings?.store_phone || '0532 123 45 67';
  const whatsapp = settings?.whatsapp_number || '905321234567';
  const address = settings?.address || 'İlçe Merkezi';
  const hours = settings?.opening_hours || '08:30 - 21:00';

  return (
    <footer className="bg-emerald-950 text-stone-300 pt-12 pb-8 border-t border-emerald-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
                🧀
              </div>
              <span className="font-serif font-bold text-xl text-amber-100">{storeName}</span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              İlçemizin en taze, katkısız ve yöresel şarküteri lezzetlerini dilediğiniz gramaj ve dilimleme seçeneğiyle kapınıza getiriyoruz.
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Sipariş Hattı</span>
              </a>
            </div>
          </div>

          {/* Col 2: Fast Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-amber-200 text-sm uppercase tracking-wider">Hızlı Bağlantılar</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-amber-300 transition-colors">Tüm Ürünler</Link>
              </li>
              <li>
                <Link href="/sepet" className="hover:text-amber-300 transition-colors">Sepetim & Sipariş Ver</Link>
              </li>
              <li>
                <Link href="/siparis-takip" className="hover:text-amber-300 transition-colors">Sipariş Durumu Takip Et</Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-300 transition-colors flex items-center gap-1.5 text-stone-400">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>Esnaf Yönetim Paneli</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Delivery Info */}
          <div className="space-y-3">
            <h4 className="font-semibold text-amber-200 text-sm uppercase tracking-wider">Teslimat & Hizmet</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>Yalnızca ilçe içerisindeki mahallelere taze teslimat yapılmaktadır.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>Soğuk zincir korunarak özenle paketlenir.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>Kapıda Nakit / Kredi Kartı ve Havale/EFT seçeneği.</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-amber-200 text-sm uppercase tracking-wider">İletişim & Adres</h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{hours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-emerald-900/60 text-xs text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {storeName} — İlçe İçi Hızlı Sipariş Sistemi.</p>
          <div className="flex items-center gap-1 text-stone-400">
            <span>Tazelik & Güvenle Hazırlanır</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
}
