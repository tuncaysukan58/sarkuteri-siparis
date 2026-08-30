'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Order, StoreSettings } from '@/types/database';
import { findOrderByQuery, getStoreSettings } from '@/lib/data-service';
import {
  Search,
  CheckCircle2,
  Clock,
  Bike,
  PackageCheck,
  XCircle,
  Phone,
  MessageSquare,
  ArrowLeft,
} from 'lucide-react';

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const initialNo = searchParams.get('no') || '';

  const [query, setQuery] = useState(initialNo);
  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<StoreSettings | undefined>(undefined);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getStoreSettings().then(setSettings);
  }, []);

  useEffect(() => {
    if (initialNo) {
      handleSearch(initialNo);
    }
  }, [initialNo]);

  const handleSearch = async (searchTerm?: string) => {
    const q = searchTerm !== undefined ? searchTerm : query;
    if (!q.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await findOrderByQuery(q);
      setOrder(res);
    } catch (e) {
      console.error(e);
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStepStatus = (step: 'pending' | 'preparing' | 'on_way' | 'delivered') => {
    if (!order) return 'inactive';
    if (order.status === 'cancelled') return 'cancelled';

    const orderHierarchy = ['pending', 'preparing', 'on_way', 'delivered'];
    const currentIndex = orderHierarchy.indexOf(order.status);
    const stepIndex = orderHierarchy.indexOf(step);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'inactive';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold border border-amber-300">Sipariş Alındı</span>;
      case 'preparing':
        return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold border border-blue-300 animate-pulse">Hazırlanıyor & Dilimleniyor</span>;
      case 'on_way':
        return <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold border border-purple-300 animate-pulse">Kuryede / Yolda</span>;
      case 'delivered':
        return <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold border border-emerald-300">Teslim Edildi</span>;
      case 'cancelled':
        return <span className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-xs font-bold border border-rose-300">İptal Edildi</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#faf7f2]">
      <Navbar settings={settings} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Back button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-amber-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ana Sayfaya Dön</span>
          </Link>
        </div>

        {/* Search header card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 bg-amber-50 text-amber-800 rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-inner">
            🔍
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
            Sipariş Durumu Sorgulama
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            Sipariş numaranızı (örn: <strong>SRK-9841</strong>) veya siparişte kullandığınız telefon numaranızı yazınız.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="max-w-md mx-auto flex gap-2 pt-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Sipariş No veya Telefon No..."
              className="flex-1 bg-stone-50 border border-stone-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-emerald-900 hover:bg-emerald-800 text-amber-100 px-6 py-3 rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95"
            >
              {isLoading ? 'Aranıyor...' : 'Sorgula'}
            </button>
          </form>
        </div>

        {/* Results Area */}
        {hasSearched && !isLoading && !order && (
          <div className="bg-white rounded-3xl p-8 border border-stone-200 text-center space-y-3 mt-8 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-2xl mx-auto">
              ⚠️
            </div>
            <h3 className="font-bold text-stone-800">Sipariş Bulunamadı</h3>
            <p className="text-xs text-stone-500">
              Lütfen sipariş numaranızı veya telefon numaranızı doğru yazdığınızdan emin olunuz.
            </p>
          </div>
        )}

        {order && (
          <div className="mt-8 space-y-6 animate-scale-in">
            {/* Timeline Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-5">
                <div>
                  <div className="text-xs text-stone-400 font-semibold uppercase tracking-wider">
                    Sipariş Numarası
                  </div>
                  <div className="text-xl font-extrabold text-stone-900 font-mono">
                    {order.order_number}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {new Date(order.created_at).toLocaleString('tr-TR')}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Status Timeline */}
              {order.status !== 'cancelled' ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
                  {/* Step 1 */}
                  <div className={`p-4 rounded-2xl border-2 flex flex-col items-center text-center gap-2 transition-all ${
                    getStepStatus('pending') === 'completed' || getStepStatus('pending') === 'active'
                      ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 shadow-sm'
                      : 'border-stone-200 bg-stone-50 text-stone-400'
                  }`}>
                    <Clock className="w-6 h-6 text-amber-600" />
                    <div>
                      <div className="font-bold text-xs">Sipariş Alındı</div>
                      <div className="text-[10px] text-stone-500">Sisteme düştü</div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className={`p-4 rounded-2xl border-2 flex flex-col items-center text-center gap-2 transition-all ${
                    getStepStatus('preparing') === 'completed' || getStepStatus('preparing') === 'active'
                      ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 shadow-sm'
                      : 'border-stone-200 bg-stone-50 text-stone-400'
                  }`}>
                    <PackageCheck className="w-6 h-6 text-blue-600" />
                    <div>
                      <div className="font-bold text-xs">Hazırlanıyor</div>
                      <div className="text-[10px] text-stone-500">Dilimleniyor & paket</div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className={`p-4 rounded-2xl border-2 flex flex-col items-center text-center gap-2 transition-all ${
                    getStepStatus('on_way') === 'completed' || getStepStatus('on_way') === 'active'
                      ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 shadow-sm'
                      : 'border-stone-200 bg-stone-50 text-stone-400'
                  }`}>
                    <Bike className="w-6 h-6 text-purple-600" />
                    <div>
                      <div className="font-bold text-xs">Kuryede / Yolda</div>
                      <div className="text-[10px] text-stone-500">Kapınıza geliyor</div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className={`p-4 rounded-2xl border-2 flex flex-col items-center text-center gap-2 transition-all ${
                    getStepStatus('delivered') === 'completed' || getStepStatus('delivered') === 'active'
                      ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 shadow-sm'
                      : 'border-stone-200 bg-stone-50 text-stone-400'
                  }`}>
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <div>
                      <div className="font-bold text-xs">Teslim Edildi</div>
                      <div className="text-[10px] text-stone-500">Afiyet olsun</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center text-rose-800 text-xs font-semibold flex items-center justify-center gap-2">
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span>Bu sipariş iptal edilmiştir. Detaylı bilgi için lütfen şarküteriyle iletişime geçiniz.</span>
                </div>
              )}
            </div>

            {/* Order Items & Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Items Card */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
                <h4 className="font-bold text-stone-900 text-sm uppercase tracking-wider border-b border-stone-100 pb-2">
                  Siparişteki Ürünler
                </h4>
                <div className="space-y-3">
                  {order.items?.map((it, i) => (
                    <div key={i} className="flex justify-between items-center text-xs bg-stone-50 p-2.5 rounded-xl">
                      <div>
                        <div className="font-bold text-stone-800">{it.product_name}</div>
                        <div className="text-[11px] text-stone-500">
                          {it.selected_weight && `${it.selected_weight} gr `}
                          {it.selected_slice && `• ${it.selected_slice} `}
                          • {it.quantity} adet
                        </div>
                      </div>
                      <div className="font-extrabold text-emerald-950">
                        {it.total_price.toFixed(2)} ₺
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Ara Toplam:</span>
                    <span className="font-bold">{order.subtotal.toFixed(2)} ₺</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Teslimat Ücreti:</span>
                    <span className="font-bold">{order.delivery_fee.toFixed(2)} ₺</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-emerald-950 pt-2 border-t border-stone-200">
                    <span>Toplam Tutar:</span>
                    <span className="text-base font-serif">{order.total_amount.toFixed(2)} ₺</span>
                  </div>
                </div>
              </div>

              {/* Customer & Delivery Card */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
                <h4 className="font-bold text-stone-900 text-sm uppercase tracking-wider border-b border-stone-100 pb-2">
                  Teslimat & İletişim Bilgileri
                </h4>
                <div className="text-xs space-y-2.5 text-stone-600">
                  <div>
                    <span className="text-stone-400 block">Müşteri:</span>
                    <strong className="text-stone-800">{order.customer_name}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Telefon:</span>
                    <strong className="text-stone-800">{order.customer_phone}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Mahalle & Açık Adres:</span>
                    <strong className="text-stone-800">{order.neighborhood_name}, {order.customer_address}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Teslimat Zamanı:</span>
                    <strong className="text-stone-800">{order.delivery_time_slot}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block">Ödeme Türü:</span>
                    <strong className="text-stone-800">
                      {order.payment_method === 'cash_on_delivery'
                        ? 'Kapıda Nakit'
                        : order.payment_method === 'card_on_delivery'
                        ? 'Kapıda Kredi Kartı (Mobil POS)'
                        : 'Banka Havalesi / EFT'}
                    </strong>
                  </div>
                  {order.order_notes && (
                    <div>
                      <span className="text-stone-400 block">Sipariş Notu:</span>
                      <strong className="text-amber-800 bg-amber-50 px-2 py-1 rounded inline-block">
                        {order.order_notes}
                      </strong>
                    </div>
                  )}
                </div>

                {/* WhatsApp Help Button */}
                <div className="pt-2">
                  <a
                    href={`https://wa.me/${settings?.whatsapp_number || '905321234567'}?text=Merhaba, ${order.order_number} numaralı siparişim hakkında bilgi almak istiyorum.`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Şarküteriye WhatsApp&apos;tan Yaz</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer settings={settings} />
    </div>
  );
}

export default function SiparisTakipPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Yükleniyor...</div>}>
      <OrderTrackingContent />
    </Suspense>
  );
}
