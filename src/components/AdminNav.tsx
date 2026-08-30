'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ClipboardList,
  FolderTree,
  Package,
  Sliders,
  ExternalLink,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

interface AdminNavProps {
  onLogout?: () => void;
  pendingCount?: number;
}

export function AdminNav({ onLogout, pendingCount = 0 }: AdminNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Siparişler',
      href: '/admin',
      icon: ClipboardList,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      label: 'Kategoriler',
      href: '/admin/kategoriler',
      icon: FolderTree,
    },
    {
      label: 'Ürün & Fiyatlar',
      href: '/admin/urunler',
      icon: Package,
    },
    {
      label: 'Dükkan & Mahalleler',
      href: '/admin/ayarlar',
      icon: Sliders,
    },
  ];

  return (
    <header className="bg-emerald-950 text-white border-b border-emerald-900 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center text-xl font-bold shadow">
              🧀
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg text-amber-100">Esnaf Yönetim Paneli</span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  Admin
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-emerald-200 hover:text-white hover:bg-emerald-900/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge !== null && item.badge !== undefined && (
                    <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1 text-xs font-semibold text-emerald-200 hover:text-white bg-emerald-900/80 px-3 py-2 rounded-xl border border-emerald-800 transition-colors"
            >
              <span>Vitrini Gör</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1 text-xs font-semibold text-rose-300 hover:text-rose-100 bg-rose-950/60 hover:bg-rose-900 px-3 py-2 rounded-xl border border-rose-900/80 transition-colors"
                title="Çıkış Yap"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Çıkış</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-emerald-900/60 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[11px] font-bold ${
                  isActive ? 'text-amber-400 bg-emerald-900/50' : 'text-emerald-300 hover:text-white'
                }`}
              >
                <div className="relative">
                  <Icon className="w-4 h-4" />
                  {item.badge !== null && item.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-bold px-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
