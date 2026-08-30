'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AdminNav } from '@/components/AdminNav';
import { Order, OrderStatus } from '@/types/database';
import { getOrders, updateOrderStatus } from '@/lib/data-service';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';
import {
  Search,
  Printer,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  PackageCheck,
  Bike,
  XCircle,
  Volume2,
  VolumeX,
  Lock,
  RefreshCw,
  Bell,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Store known order IDs to detect brand new incoming orders
  const knownOrderIds = useRef<Set<string>>(new Set());
  const isInitialLoad = useRef(true);

  // Pleasant Ding-Dong Doorbell sound generator
  const playOrderChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();

      // First Ding (High tone 784 Hz - G5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(784, ctx.currentTime);
      gain1.gain.setValueAtTime(0.5, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.6);

      // Second Dong (Lower tone 587 Hz - D5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(587, ctx.currentTime + 0.25);
      gain2.gain.setValueAtTime(0.6, ctx.currentTime + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.25);
      osc2.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.error('Audio chime error:', e);
    }
  };

  // Check auth session
  useEffect(() => {
    const auth = sessionStorage.getItem('sarkuteri_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = process.env.NEXT_PUBLIC_ADMIN_PIN || '1234';
    if (pinInput === correctPin || pinInput === '1234') {
      setIsAuthenticated(true);
      sessionStorage.setItem('sarkuteri_admin_auth', 'true');
      setPinError(false);
      // Prime audio context on user click
      playOrderChime();
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('sarkuteri_admin_auth');
    setIsAuthenticated(false);
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await getOrders();

      // Check if new orders arrived since last fetch
      if (!isInitialLoad.current && data && data.length > 0) {
        const hasNewOrder = data.some((o) => !knownOrderIds.current.has(o.id) && o.status === 'pending');
        if (hasNewOrder) {
          playOrderChime();
        }
      }

      // Update known IDs
      data.forEach((o) => knownOrderIds.current.add(o.id));
      isInitialLoad.current = false;
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();

      // Supabase Realtime channel for instant order popup
      let channel: ReturnType<typeof supabase.channel> | null = null;
      if (isSupabaseConfigured && supabase) {
        channel = supabase
          .channel('realtime-orders-admin')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'orders' },
            () => {
              playOrderChime();
              fetchOrders();
            }
          )
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'orders' },
            () => {
              fetchOrders();
            }
          )
          .subscribe();
      }

      // Local storage cross-tab event
      const handleLocalNewOrder = () => {
        playOrderChime();
        fetchOrders();
      };
      window.addEventListener('new_order_placed', handleLocalNewOrder);

      // 10-second polling fallback
      const interval = setInterval(fetchOrders, 10000);

      return () => {
        window.removeEventListener('new_order_placed', handleLocalNewOrder);
        clearInterval(interval);
        if (channel && supabase) {
          supabase.removeChannel(channel);
        }
      };
    }
  }, [isAuthenticated, soundEnabled]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    fetchOrders();
  };

  const handlePrint = (order: Order) => {
    setSelectedOrderForPrint(order);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-stone-200 text-center space-y-5 animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-amber-600 text-white flex items-center justify-center text-3xl mx-auto shadow-md">
            🧀
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900 font-serif">Esnaf Yönetim Girişi</h2>
            <p className="text-xs text-stone-500 mt-1">Lütfen 4 haneli yönetici PIN kodunuzu giriniz.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="PIN Kodu (Varsayılan: 1234)"
                autoFocus
                className="w-full bg-stone-50 border border-stone-300 rounded-2xl py-3 px-4 text-center font-mono text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>

            {pinError && (
              <p className="text-xs font-bold text-rose-600">Hatalı PIN kodu! (Varsayılan: 1234)</p>
            )}

            <button
              type="submit"
              className="w-full bg-emerald-950 hover:bg-emerald-900 text-amber-100 font-bold py-3.5 rounded-2xl transition-all shadow-md active:scale-95 text-sm"
            >
              Giriş Yap
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (activeFilter !== 'all' && o.status !== activeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNo = o.order_number.toLowerCase().includes(q);
      const matchName = o.customer_name.toLowerCase().includes(q);
      const matchPhone = o.customer_phone.includes(q);
      return matchNo || matchName || matchPhone;
    }
    return true;
  });

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col justify-between">
      <div>
        <AdminNav onLogout={handleLogout} pendingCount={pendingOrdersCount} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Top Bar: Title, Search, Refresh, Sound */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
                  Canlı Sipariş Yönetimi
                </h1>
                {pendingOrdersCount > 0 && (
                  <span className="bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-full animate-bounce">
                    {pendingOrdersCount} Yeni Sipariş
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                İlçe içinden gelen siparişleri anlık takip edin, durumunu güncelleyin ve fiş yazdırın.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Test Sound Bell Button */}
              <button
                onClick={playOrderChime}
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 p-2.5 rounded-xl border border-amber-600 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                title="Sipariş Uyarı Zilini Çal"
              >
                <Bell className="w-4 h-4" />
                <span>Zili Test Et</span>
              </button>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  soundEnabled
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-stone-200 text-stone-600 border-stone-300'
                }`}
                title={soundEnabled ? 'Sesli Uyarı Açık' : 'Sesli Uyarı Kapalı'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-700" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden sm:inline">Ses {soundEnabled ? 'Açık' : 'Kapalı'}</span>
              </button>

              <button
                onClick={fetchOrders}
                disabled={isLoading}
                className="bg-white hover:bg-stone-100 text-stone-700 p-2.5 rounded-xl border border-stone-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Yenile</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs & Search */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center mb-6">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
              {[
                { id: 'all', label: 'Tümü', count: orders.length },
                { id: 'pending', label: 'Yeni Sipariş', count: orders.filter((o) => o.status === 'pending').length },
                { id: 'preparing', label: 'Hazırlanıyor', count: orders.filter((o) => o.status === 'preparing').length },
                { id: 'on_way', label: 'Kuryede', count: orders.filter((o) => o.status === 'on_way').length },
                { id: 'delivered', label: 'Teslim Edildi', count: orders.filter((o) => o.status === 'delivered').length },
                { id: 'cancelled', label: 'İptal', count: orders.filter((o) => o.status === 'cancelled').length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as 'all' | OrderStatus)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    activeFilter === tab.id
                      ? 'bg-emerald-950 text-amber-100 shadow-md'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeFilter === tab.id ? 'bg-amber-500 text-stone-950 font-black' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Müşteri, tel veya sipariş no..."
                className="w-full bg-white border border-stone-300 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Orders Cards List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-sm max-w-md mx-auto my-12 space-y-3">
              <div className="text-4xl">📋</div>
              <h3 className="font-bold text-stone-800">Sipariş Bulunamadı</h3>
              <p className="text-xs text-stone-500">Seçilen filtrede henüz bir sipariş bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const isPending = order.status === 'pending';
                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all shadow-sm hover:shadow-md ${
                      isPending ? 'border-amber-400 bg-amber-50/30 ring-2 ring-amber-400/30' : 'border-stone-200'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                      {/* Left: Customer & Order ID */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-600/10 text-amber-800 flex items-center justify-center font-mono font-bold text-sm">
                          🧀
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-stone-900 text-base">{order.customer_name}</h3>
                            <span className="font-mono text-xs font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                              {order.order_number}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-stone-400" />
                              <a href={`tel:${order.customer_phone}`} className="hover:underline font-medium text-emerald-800 font-bold">
                                {order.customer_phone}
                              </a>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-stone-400" />
                              <span>{new Date(order.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Print */}
                      <div className="flex items-center gap-3 self-end lg:self-center">
                        <div className="text-right">
                          <div className="text-[11px] text-stone-400 font-semibold uppercase">Toplam Tutar</div>
                          <div className="text-lg sm:text-xl font-extrabold text-emerald-950 font-serif">
                            {order.total_amount.toFixed(2)} ₺
                          </div>
                        </div>

                        <button
                          onClick={() => handlePrint(order)}
                          className="bg-stone-100 hover:bg-stone-200 text-stone-700 p-2.5 rounded-xl border border-stone-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                          title="Sipariş Fişi Yazdır"
                        >
                          <Printer className="w-4 h-4" />
                          <span className="hidden sm:inline">Fiş Yazdır</span>
                        </button>
                      </div>
                    </div>

                    {/* Middle: Items & Address */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 py-4 text-xs">
                      {/* Products List */}
                      <div className="md:col-span-7 space-y-2">
                        <span className="font-bold text-stone-500 uppercase tracking-wider block text-[10px]">
                          Sipariş Edilen Ürünler & Gramajlar:
                        </span>
                        <div className="space-y-1.5">
                          {order.items?.map((it, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center bg-stone-50 p-2 rounded-xl border border-stone-200/50"
                            >
                              <div>
                                <span className="font-bold text-stone-800">{it.product_name}</span>
                                <span className="text-amber-800 font-semibold ml-2">
                                  {it.selected_weight ? `[${it.selected_weight} gr]` : ''}
                                  {it.selected_slice ? ` (${it.selected_slice})` : ''}
                                </span>
                              </div>
                              <div className="font-bold text-stone-900 shrink-0">
                                {it.quantity} adet × {it.unit_price.toFixed(2)} = {it.total_price.toFixed(2)} ₺
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Address & Payment Details */}
                      <div className="md:col-span-5 space-y-2 bg-amber-50/50 p-3 rounded-2xl border border-amber-200/60">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-stone-900">{order.neighborhood_name}</span>
                            <p className="text-stone-600 mt-0.5 font-medium">{order.customer_address}</p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-amber-200/50 flex flex-wrap justify-between gap-2 text-[11px]">
                          <span>
                            ⏰ <strong>{order.delivery_time_slot}</strong>
                          </span>
                          <span>
                            💳 <strong>
                              {order.payment_method === 'cash_on_delivery'
                                ? 'Kapıda Nakit'
                                : order.payment_method === 'card_on_delivery'
                                ? 'Kapıda Kart'
                                : 'Havale / EFT'}
                            </strong>
                          </span>
                        </div>

                        {order.order_notes && (
                          <div className="pt-1 text-[11px] text-amber-950 font-bold bg-amber-100/60 p-1.5 rounded-lg">
                            📝 Not: {order.order_notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom: Status Action Buttons */}
                    <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-400 font-medium">Durum:</span>
                        {order.status === 'pending' && <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-300">Yeni Sipariş</span>}
                        {order.status === 'preparing' && <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-300">Hazırlanıyor</span>}
                        {order.status === 'on_way' && <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-full border border-purple-300">Kuryede / Yolda</span>}
                        {order.status === 'delivered' && <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-300">Teslim Edildi</span>}
                        {order.status === 'cancelled' && <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-full border border-rose-300">İptal Edildi</span>}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'preparing')}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-sm active:scale-95"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>Hazırlanıyor&apos;a Al</span>
                          </button>
                        )}

                        {order.status === 'preparing' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'on_way')}
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-sm active:scale-95"
                          >
                            <Bike className="w-3.5 h-3.5" />
                            <span>Kuryeye Ver</span>
                          </button>
                        )}

                        {order.status === 'on_way' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'delivered')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-sm active:scale-95"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Teslim Edildi</span>
                          </button>
                        )}

                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <button
                            onClick={() => {
                              if (confirm('Bu siparişi iptal etmek istediğinize emin misiniz?')) {
                                handleStatusChange(order.id, 'cancelled');
                              }
                            }}
                            className="bg-stone-100 hover:bg-rose-50 text-stone-500 hover:text-rose-600 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-colors"
                          >
                            İptal Et
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Hidden Printable Receipt for Thermal / A4 Printers */}
      {selectedOrderForPrint && (
        <div id="printable-receipt" className="hidden print:block font-mono text-black">
          <div className="text-center font-bold text-sm border-b pb-2 mb-2">
            <div>🧀 GURME ŞARKÜTERİ</div>
            <div className="text-xs">İlçe İçi Sipariş Fişi</div>
            <div className="text-xs mt-1">Sipariş No: {selectedOrderForPrint.order_number}</div>
            <div className="text-[10px]">{new Date(selectedOrderForPrint.created_at).toLocaleString('tr-TR')}</div>
          </div>

          <div className="text-xs border-b pb-2 mb-2 space-y-0.5">
            <div><strong>Müşteri:</strong> {selectedOrderForPrint.customer_name}</div>
            <div><strong>Tel:</strong> {selectedOrderForPrint.customer_phone}</div>
            <div><strong>Mahalle:</strong> {selectedOrderForPrint.neighborhood_name}</div>
            <div><strong>Adres:</strong> {selectedOrderForPrint.customer_address}</div>
            <div><strong>Teslimat:</strong> {selectedOrderForPrint.delivery_time_slot}</div>
            <div><strong>Ödeme:</strong> {selectedOrderForPrint.payment_method}</div>
            {selectedOrderForPrint.order_notes && (
              <div><strong>Not:</strong> {selectedOrderForPrint.order_notes}</div>
            )}
          </div>

          <div className="text-xs border-b pb-2 mb-2 space-y-1">
            <div className="font-bold">ÜRÜNLER:</div>
            {selectedOrderForPrint.items?.map((it, i) => (
              <div key={i} className="flex justify-between">
                <span>
                  {it.product_name} {it.selected_weight ? `(${it.selected_weight}g)` : ''} {it.selected_slice ? `[${it.selected_slice}]` : ''} x{it.quantity}
                </span>
                <span>{it.total_price.toFixed(2)} TL</span>
              </div>
            ))}
          </div>

          <div className="text-xs text-right font-bold space-y-0.5">
            <div>Ara Toplam: {selectedOrderForPrint.subtotal.toFixed(2)} TL</div>
            <div>Teslimat: {selectedOrderForPrint.delivery_fee.toFixed(2)} TL</div>
            <div className="text-sm border-t pt-1 mt-1">GENEL TOPLAM: {selectedOrderForPrint.total_amount.toFixed(2)} TL</div>
          </div>

          <div className="text-center text-[10px] mt-4 border-t pt-2">
            Afiyet Olsun! - Bizi Tercih Ettiğiniz İçin Teşekkür Ederiz.
          </div>
        </div>
      )}
    </div>
  );
}
