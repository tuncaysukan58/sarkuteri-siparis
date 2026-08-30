'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useCart } from '@/lib/cart-context';
import { DeliveryZone, PaymentMethod, StoreSettings } from '@/types/database';
import { createOrder, getDeliveryZones, getStoreSettings } from '@/lib/data-service';
import {
  ArrowLeft,
  Trash2,
  MapPin,
  Clock,
  CreditCard,
  Banknote,
  Building,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  MessageSquare,
} from 'lucide-react';

export default function SepetPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, clearCart, subtotal } = useCart();

  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [settings, setSettings] = useState<StoreSettings | undefined>(undefined);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');

  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState('Hemen Gelsin (En Kısa Sürede)');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_delivery');
  const [orderNotes, setOrderNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [zones, sets] = await Promise.all([getDeliveryZones(), getStoreSettings()]);
      setDeliveryZones(zones);
      setSettings(sets);
      if (zones.length > 0) {
        setSelectedZoneId(zones[0].id);
      }
    }
    load();
  }, []);

  const selectedZone = deliveryZones.find((z) => z.id === selectedZoneId);
  const minOrderForZone = selectedZone ? selectedZone.min_order_amount : settings?.min_order_amount || 200;
  const deliveryFee = selectedZone ? selectedZone.delivery_fee : 0;
  const totalAmount = subtotal + deliveryFee;
  const isBelowMin = subtotal < minOrderForZone;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (cart.length === 0) {
      setErrorMessage('Sepetiniz boş.');
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setErrorMessage('Lütfen ad, telefon ve açık adres alanlarını eksiksiz doldurunuz.');
      return;
    }

    if (isBelowMin) {
      setErrorMessage(`Seçilen mahalle için minimum sepet tutarı ${minOrderForZone} ₺'dir.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const itemsPayload = cart.map((it) => {
        let unitPrice = it.product.base_price;
        if (it.product.unit_type === 'kg' && it.selectedWeight) {
          unitPrice = (it.product.base_price * it.selectedWeight) / 1000;
        }

        return {
          product_id: it.product.id,
          product_name: it.product.name,
          unit_type: it.product.unit_type,
          selected_weight: it.selectedWeight,
          selected_slice: it.selectedSlice,
          quantity: it.quantity,
          unit_price: unitPrice,
          total_price: it.calculatedPrice,
        };
      });

      const order = await createOrder({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_address: customerAddress.trim(),
        district_name: selectedZone?.district_name || 'Merkez',
        neighborhood_name: selectedZone?.neighborhood_name || 'İlçe Merkezi',
        delivery_time_slot: deliveryTimeSlot,
        payment_method: paymentMethod,
        order_notes: orderNotes.trim() || undefined,
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        total_amount: totalAmount,
        items: itemsPayload,
      });

      clearCart();
      setCreatedOrderNumber(order.order_number);
    } catch (err) {
      console.error(err);
      setErrorMessage('Sipariş oluşturulurken bir hata meydana geldi. Lütfen tekrar deneyiniz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp Message Generator
  const generateWhatsAppMessage = () => {
    if (!createdOrderNumber) return '';
    const paymentLabel =
      paymentMethod === 'cash_on_delivery'
        ? 'Kapıda Nakit'
        : paymentMethod === 'card_on_delivery'
        ? 'Kapıda Kredi Kartı'
        : 'Banka Havalesi / EFT';

    const text = `*Yeni Şarküteri Siparişi (${createdOrderNumber})*%0A%0A` +
      `*Müşteri:* ${customerName}%0A` +
      `*Telefon:* ${customerPhone}%0A` +
      `*Mahalle / Adres:* ${selectedZone?.neighborhood_name}, ${customerAddress}%0A` +
      `*Teslimat Zamanı:* ${deliveryTimeSlot}%0A` +
      `*Ödeme:* ${paymentLabel}%0A` +
      `*Toplam:* ${totalAmount.toFixed(2)} ₺%0A%0A` +
      `*Sipariş Notu:* ${orderNotes || 'Yok'}`;

    const phone = settings?.whatsapp_number || '905321234567';
    return `https://wa.me/${phone}?text=${text}`;
  };

  // If order was created, show Success Screen
  if (createdOrderNumber) {
    return (
      <div className="flex flex-col min-h-screen bg-[#faf7f2]">
        <Navbar settings={settings} />
        <main className="flex-1 max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-xl space-y-6 animate-scale-in">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner">
              🎉
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Siparişiniz Başarıyla Alındı
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-3 font-serif">
                Teşekkür Ederiz, Siparişiniz Hazırlanıyor!
              </h1>
              <p className="text-sm text-stone-500 mt-2">
                Sipariş Numaranız: <strong className="text-emerald-950 font-mono text-base">{createdOrderNumber}</strong>
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-stone-500">Teslimat Adresi:</span>
                <span className="font-semibold text-stone-800">{selectedZone?.neighborhood_name}, {customerAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Tahmini Teslimat:</span>
                <span className="font-semibold text-stone-800">{selectedZone?.estimated_time || '30-45 dk'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Ödeme Tutarı:</span>
                <span className="font-bold text-emerald-900 text-sm">{totalAmount.toFixed(2)} ₺</span>
              </div>
            </div>

            {/* WhatsApp Notify Button */}
            <div className="pt-2 space-y-3">
              <a
                href={generateWhatsAppMessage()}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Sipariş Özetiyle WhatsApp&apos;tan Bildir</span>
              </a>

              <Link
                href={`/siparis-takip?no=${createdOrderNumber}`}
                className="w-full bg-stone-900 hover:bg-black text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all block"
              >
                Siparişimi Canlı Takip Et
              </Link>

              <Link
                href="/"
                className="inline-block text-xs font-bold text-stone-500 hover:text-stone-800 underline underline-offset-4"
              >
                Alışverişe Devam Et
              </Link>
            </div>
          </div>
        </main>
        <Footer settings={settings} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#faf7f2]">
      <Navbar settings={settings} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Back link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-amber-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Alışverişe Devam Et</span>
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 max-w-md mx-auto my-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-3xl mx-auto">
              🛒
            </div>
            <h2 className="text-xl font-bold text-stone-800 font-serif">Sepetiniz Boş</h2>
            <p className="text-xs text-stone-500">
              Sipariş verebilmek için lütfen önce şarküteri ürünlerimizden sepetinize ekleyin.
            </p>
            <Link
              href="/"
              className="inline-block bg-emerald-900 text-amber-100 font-bold text-xs px-6 py-3 rounded-2xl hover:bg-emerald-800 transition-colors shadow-md"
            >
              Ürünleri İncele
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Checkout Form */}
            <div className="lg:col-span-7 space-y-6">
              <form onSubmit={handleSubmitOrder} className="space-y-6">
                {/* 1. Neighborhood / Delivery Zone */}
                <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 text-emerald-950">
                    <MapPin className="w-5 h-5 text-amber-600" />
                    <h3 className="font-extrabold text-lg">1. Teslimat Mahallesi</h3>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      İlçe İçi Mahallenizi Seçiniz
                    </label>
                    <select
                      value={selectedZoneId}
                      onChange={(e) => setSelectedZoneId(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-3.5 text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {deliveryZones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.neighborhood_name} — (Min: {z.min_order_amount} ₺ | Teslimat:{' '}
                          {z.delivery_fee === 0 ? 'Ücretsiz' : `${z.delivery_fee} ₺`})
                        </option>
                      ))}
                    </select>

                    {selectedZone && (
                      <div className="mt-2 text-xs text-stone-500 flex items-center justify-between">
                        <span>Tahmini Teslimat Süresi: <strong>{selectedZone.estimated_time}</strong></span>
                        <span>Minimum Tutar: <strong>{selectedZone.min_order_amount} ₺</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Customer Contact & Full Address */}
                <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 text-emerald-950">
                    <CheckCircle2 className="w-5 h-5 text-amber-600" />
                    <h3 className="font-extrabold text-lg">2. İletişim ve Açık Adres</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Adınız Soyadınız *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Örn: Ahmet Yılmaz"
                        className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Telefon Numaranız *
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="05XX XXX XX XX"
                        className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Açık Adres (Cadde, Sokak, Bina No, Kat, Daire) *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Örn: Çiçek Sokak, Güneş Apartmanı No: 14 Kat: 2 Daire: 5"
                      className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    ></textarea>
                  </div>
                </div>

                {/* 3. Delivery Time & Payment */}
                <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
                  <div className="flex items-center gap-2.5 text-emerald-950">
                    <Clock className="w-5 h-5 text-amber-600" />
                    <h3 className="font-extrabold text-lg">3. Teslimat Zamanı & Ödeme</h3>
                  </div>

                  {/* Delivery time slots */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Teslimat Tercihi
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        'Hemen Gelsin (En Kısa Sürede)',
                        '13:00 - 15:00 Arası',
                        '16:00 - 18:00 Arası',
                        '18:30 - 20:30 Arası',
                      ].map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setDeliveryTimeSlot(slot)}
                          className={`p-3 rounded-2xl text-xs font-bold border-2 text-left transition-all ${
                            deliveryTimeSlot === slot
                              ? 'border-emerald-800 bg-emerald-50 text-emerald-950'
                              : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment method */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Ödeme Yöntemi
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash_on_delivery')}
                        className={`p-3 rounded-2xl text-xs font-bold border-2 flex flex-col items-center gap-1.5 text-center transition-all ${
                          paymentMethod === 'cash_on_delivery'
                            ? 'border-amber-600 bg-amber-50 text-amber-950'
                            : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                        }`}
                      >
                        <Banknote className="w-5 h-5 text-amber-700" />
                        <span>Kapıda Nakit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card_on_delivery')}
                        className={`p-3 rounded-2xl text-xs font-bold border-2 flex flex-col items-center gap-1.5 text-center transition-all ${
                          paymentMethod === 'card_on_delivery'
                            ? 'border-amber-600 bg-amber-50 text-amber-950'
                            : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                        }`}
                      >
                        <CreditCard className="w-5 h-5 text-amber-700" />
                        <span>Kapıda Kart (POS)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('bank_transfer')}
                        className={`p-3 rounded-2xl text-xs font-bold border-2 flex flex-col items-center gap-1.5 text-center transition-all ${
                          paymentMethod === 'bank_transfer'
                            ? 'border-amber-600 bg-amber-50 text-amber-950'
                            : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                        }`}
                      >
                        <Building className="w-5 h-5 text-amber-700" />
                        <span>Havale / IBAN</span>
                      </button>
                    </div>

                    {paymentMethod === 'bank_transfer' && (
                      <div className="mt-3 bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs text-amber-900 space-y-1">
                        <strong>Şarküteri IBAN Bilgisi:</strong>
                        <p className="font-mono">{settings?.iban_info || 'TR12 0006 1005 1234 5678 9012 34'}</p>
                        <p className="text-[11px] text-amber-700">
                          * Açıklamaya adınızı yazınız. Sipariş onaylandıktan sonra kuryeye teslim edilir.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Order notes */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Sipariş / Dilimleme Notu (Opsiyonel)
                    </label>
                    <input
                      type="text"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Örn: Zile basmayın, pastırmaları ince dilimleyin vb."
                      className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    />
                  </div>
                </div>

                {/* Error message */}
                {errorMessage && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit button on mobile */}
                <button
                  type="submit"
                  disabled={isSubmitting || isBelowMin}
                  className={`w-full py-4 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 lg:hidden ${
                    isBelowMin
                      ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-900 hover:to-emerald-950 text-amber-100'
                  }`}
                >
                  {isSubmitting ? 'Sipariş İletiliyor...' : `Siparişi Onayla (${totalAmount.toFixed(2)} ₺)`}
                </button>
              </form>
            </div>

            {/* Right: Cart Summary Box */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm sticky top-28 space-y-5">
                <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                  <h3 className="font-bold text-stone-900 text-lg flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-amber-600" />
                    <span>Sipariş Özeti</span>
                  </h3>
                  <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                    {cart.length} çeşit
                  </span>
                </div>

                {/* Items List */}
                <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                  {cart.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 text-xs bg-stone-50 p-2.5 rounded-2xl border border-stone-200/60"
                    >
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-stone-800 truncate">{item.product.name}</h5>
                        <div className="text-[11px] text-stone-500">
                          {item.selectedWeight && `${item.selectedWeight} gr `}
                          {item.selectedSlice && `• ${item.selectedSlice} `}
                          • {item.quantity} adet
                        </div>
                      </div>
                      <div className="font-extrabold text-emerald-950 shrink-0">
                        {item.calculatedPrice.toFixed(2)} ₺
                      </div>
                      <button
                        onClick={() => removeFromCart(idx)}
                        className="text-stone-400 hover:text-rose-600 p-1"
                        title="Kaldır"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Min Order Check */}
                {isBelowMin && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-2xl text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      Minimum sipariş tutarı {minOrderForZone} ₺&apos;dir. ({ (minOrderForZone - subtotal).toFixed(2) } ₺ daha ekleyin)
                    </span>
                  </div>
                )}

                {/* Calculations */}
                <div className="space-y-2 pt-3 border-t border-stone-200 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Sepet Ara Toplamı</span>
                    <span className="font-semibold text-stone-800">{subtotal.toFixed(2)} ₺</span>
                  </div>
                  <div className="flex justify-between">
                    <span>İlçe İçi Teslimat</span>
                    <span className="font-semibold text-stone-800">
                      {deliveryFee === 0 ? 'Ücretsiz' : `${deliveryFee.toFixed(2)} ₺`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-black text-emerald-950 pt-2 border-t border-stone-200">
                    <span>Genel Toplam</span>
                    <span className="text-2xl font-serif">{totalAmount.toFixed(2)} ₺</span>
                  </div>
                </div>

                {/* Submit button on desktop */}
                <button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting || isBelowMin}
                  className={`w-full py-4 rounded-2xl font-extrabold text-base hidden lg:flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 ${
                    isBelowMin
                      ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-900 hover:to-emerald-950 text-amber-100 shadow-emerald-950/20'
                  }`}
                >
                  {isSubmitting ? 'Sipariş İletiliyor...' : 'Siparişi Onayla ve Gönder'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer settings={settings} />
    </div>
  );
}
