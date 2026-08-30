'use client';

import React, { useState, useEffect } from 'react';
import { AdminNav } from '@/components/AdminNav';
import { DeliveryZone, StoreSettings } from '@/types/database';
import {
  getDeliveryZones,
  getStoreSettings,
  saveDeliveryZones,
  updateStoreSettings,
} from '@/lib/data-service';
import {
  Sliders,
  MapPin,
  Store,
  Plus,
  Trash2,
  Check,
  Save,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>({
    store_name: '',
    store_phone: '',
    whatsapp_number: '',
    address: '',
    min_order_amount: 200,
    is_open: true,
    announcement: '',
    estimated_delivery_time: '30-45 dk',
    opening_hours: '08:30 - 21:00',
    iban_info: '',
    admin_pin: '1234',
  });

  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New zone inputs
  const [newNeighborhood, setNewNeighborhood] = useState('');
  const [newMinOrder, setNewMinOrder] = useState('200');
  const [newFee, setNewFee] = useState('0');
  const [newTime, setNewTime] = useState('30-40 dk');

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [sets, zns] = await Promise.all([getStoreSettings(), getDeliveryZones()]);
        setSettings(sets);
        setZones(zns);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStoreSettings(settings);
    await saveDeliveryZones(zones);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleAddZone = () => {
    if (!newNeighborhood.trim()) return;

    const newZ: DeliveryZone = {
      id: 'zone_' + Date.now(),
      district_name: 'Merkez',
      neighborhood_name: newNeighborhood.trim(),
      min_order_amount: parseFloat(newMinOrder) || 200,
      delivery_fee: parseFloat(newFee) || 0,
      estimated_time: newTime.trim() || '30-45 dk',
      is_active: true,
    };

    const updated = [...zones, newZ];
    setZones(updated);
    saveDeliveryZones(updated);
    setNewNeighborhood('');
  };

  const handleDeleteZone = (id: string) => {
    const updated = zones.filter((z) => z.id !== id);
    setZones(updated);
    saveDeliveryZones(updated);
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col justify-between">
      <div>
        <AdminNav />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-7 h-7 text-amber-600" />
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
                  Dükkan & Teslimat Ayarları
                </h1>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Çalışma saatleri, WhatsApp numarası, dükkan açık/kapalı durumu ve ilçe içi teslimat mahalleleri.
              </p>
            </div>

            <button
              onClick={handleSaveSettings}
              className="bg-emerald-950 hover:bg-emerald-900 text-amber-100 font-bold px-6 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 self-start sm:self-auto"
            >
              {isSaved ? <Check className="w-4 h-4 text-emerald-400 stroke-[3]" /> : <Save className="w-4 h-4 text-amber-400" />}
              <span>{isSaved ? 'Ayarlar Kaydedildi!' : 'Tüm Ayarları Kaydet'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: General Store Settings */}
            <div className="lg:col-span-7 space-y-6">
              <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Store className="w-5 h-5 text-amber-600" />
                    <h3 className="font-bold text-stone-900 text-lg">Dükkan Bilgileri</h3>
                  </div>

                  {/* Open / Close Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-600">Sipariş Alımı:</span>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, is_open: !settings.is_open })}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                        settings.is_open
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}
                    >
                      {settings.is_open ? '🟢 Dükkan Açık' : '🔴 Dükkan Kapalı'}
                    </button>
                  </div>
                </div>

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Şarküteri Adı
                    </label>
                    <input
                      type="text"
                      value={settings.store_name}
                      onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Telefon Numarası
                    </label>
                    <input
                      type="text"
                      value={settings.store_phone}
                      onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                    />
                  </div>
                </div>

                {/* WhatsApp & Hours */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      WhatsApp Bildirim No (Ülke kodu ile, örn: 905321234567)
                    </label>
                    <input
                      type="text"
                      value={settings.whatsapp_number}
                      onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Çalışma Saatleri
                    </label>
                    <input
                      type="text"
                      value={settings.opening_hours}
                      onChange={(e) => setSettings({ ...settings, opening_hours: e.target.value })}
                      placeholder="08:30 - 21:00"
                      className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Announcement Bar */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Üst Kayan Duyuru Metni
                  </label>
                  <input
                    type="text"
                    value={settings.announcement}
                    onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                    placeholder="🧀 Taze Ezine Peynirimiz ve Yeni Mahsul Zeytinyağımız Geldi!"
                    className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>

                {/* Address & IBAN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Dükkan Açık Adresi
                    </label>
                    <textarea
                      rows={2}
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Havale İçin IBAN Bilgisi
                    </label>
                    <textarea
                      rows={2}
                      value={settings.iban_info || ''}
                      onChange={(e) => setSettings({ ...settings, iban_info: e.target.value })}
                      placeholder="TR12 0006 ... (İsim Soyisim - Banka)"
                      className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    ></textarea>
                  </div>
                </div>

                {/* Delivery Time & Admin PIN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Genel Tahmini Teslimat Süresi
                    </label>
                    <input
                      type="text"
                      value={settings.estimated_delivery_time}
                      onChange={(e) => setSettings({ ...settings, estimated_delivery_time: e.target.value })}
                      placeholder="30-45 dk"
                      className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Admin Giriş PIN Kodu
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={settings.admin_pin || '1234'}
                      onChange={(e) => setSettings({ ...settings, admin_pin: e.target.value })}
                      placeholder="1234"
                      className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    className="w-full bg-emerald-950 hover:bg-emerald-900 text-amber-100 font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                  >
                    <Save className="w-4 h-4 text-amber-400" />
                    <span>Dükkan Ayarlarını Kaydet</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Delivery Zones / Neighborhoods */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-5 h-5 text-amber-600" />
                    <h3 className="font-bold text-stone-900 text-lg">İlçe İçi Mahalleler</h3>
                  </div>
                  <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                    {zones.length} mahalle
                  </span>
                </div>

                {/* Add New Zone Form */}
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60 space-y-3">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    + Yeni Mahalle Ekle
                  </h4>

                  <input
                    type="text"
                    value={newNeighborhood}
                    onChange={(e) => setNewNeighborhood(e.target.value)}
                    placeholder="Mahalle Adı (örn: Cumhuriyet Mah.)"
                    className="w-full bg-white border border-stone-300 rounded-xl p-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-stone-500">Min. Tutar (₺)</label>
                      <input
                        type="number"
                        value={newMinOrder}
                        onChange={(e) => setNewMinOrder(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-xl p-2 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-stone-500">Kurye Ücreti (0 = Ücretsiz)</label>
                      <input
                        type="number"
                        value={newFee}
                        onChange={(e) => setNewFee(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-xl p-2 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddZone}
                    className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Mahalleyi Listeye Ekle</span>
                  </button>
                </div>

                {/* Existing Zones List */}
                <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                  {zones.map((z) => (
                    <div
                      key={z.id}
                      className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-extrabold text-stone-900">{z.neighborhood_name}</div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          Min: <strong>{z.min_order_amount} ₺</strong> • Kurye:{' '}
                          <strong>{z.delivery_fee === 0 ? 'Ücretsiz' : `${z.delivery_fee} ₺`}</strong> • {z.estimated_time}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteZone(z.id)}
                        className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Mahalleyi Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
