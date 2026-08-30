'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Clock, MapPin, ShieldCheck } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { StoreSettings } from '@/types/database';

interface NavbarProps {
  settings?: StoreSettings;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export function Navbar({ settings, searchQuery, onSearchChange }: NavbarProps) {
  const { totalItems, subtotal, setIsCartOpen } = useCart();
  const isOpen = settings ? settings.is_open : true;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-900/10 shadow-sm">
      {/* Top announcement bar */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-amber-100 text-xs font-medium py-1.5 px-4 text-center flex items-center justify-between">
        <div className="hidden sm:flex items-center gap-2 text-emerald-200">
          <Clock className="w-3.5 h-3.5" />
          <span>Çalışma Saatleri: {settings?.opening_hours || '08:30 - 21:00'}</span>
        </div>
        <div className="mx-auto sm:mx-0 flex items-center gap-2 truncate">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span>{settings?.announcement || '🧀 Taze İlçe İçi Hızlı Şarküteri Siparişi Kapınızda!'}</span>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/siparis-takip"
            className="hover:text-white transition-colors underline underline-offset-2"
          >
            Sipariş Sorgula
          </Link>
          <span>•</span>
          <Link
            href="/admin"
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Esnaf Girişi</span>
          </Link>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Store Info */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-amber-900/20 group-hover:scale-105 transition-transform">
              🧀
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl sm:text-2xl text-emerald-950 tracking-tight font-serif">
                  {settings?.store_name || 'Gurme Şarküteri'}
                </span>
                {isOpen ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-emerald-300">
                    Açık
                  </span>
                ) : (
                  <span className="bg-rose-100 text-rose-800 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-rose-300">
                    Kapalı
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-stone-500 font-medium">
                <MapPin className="w-3.5 h-3.5 text-amber-700" />
                <span>İlçe İçi Hızlı Teslimat (~{settings?.estimated_delivery_time || '30-45 dk'})</span>
              </div>
            </div>
          </Link>

          {/* Search bar (desktop/tablet) */}
          {onSearchChange !== undefined && (
            <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
              <input
                type="text"
                value={searchQuery || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Peynir, zeytin, pastırma, bal ara..."
                className="w-full bg-stone-100/80 border border-stone-200 rounded-full py-2.5 pl-11 pr-4 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 transition-all"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Action buttons: Track Order & Cart */}
          <div className="flex items-center gap-3">
            <Link
              href="/siparis-takip"
              className="hidden sm:inline-flex items-center text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-xl border border-stone-200 transition-colors"
            >
              Sipariş Takibi
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-4 py-2.5 rounded-2xl font-semibold shadow-md shadow-amber-900/15 hover:shadow-lg transition-all active:scale-95"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-scale-in">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col items-start text-left text-xs leading-none">
                <span className="text-amber-200 text-[10px]">Sepetim</span>
                <span className="font-bold text-sm">{subtotal.toFixed(2)} ₺</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
