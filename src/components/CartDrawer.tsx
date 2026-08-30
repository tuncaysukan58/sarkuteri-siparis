'use client';

import React from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, AlertCircle } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { StoreSettings } from '@/types/database';

interface CartDrawerProps {
  settings?: StoreSettings;
}

export function CartDrawer({ settings }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity, subtotal, isCartOpen, setIsCartOpen } = useCart();
  const minOrder = settings?.min_order_amount || 200;
  const isUnderMinOrder = subtotal < minOrder;

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-slide-left">
          {/* Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-600/10 text-amber-800 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-900 text-lg">Sipariş Sepetim</h3>
                <p className="text-xs text-stone-500">{cart.length} çeşit ürün</p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-stone-400">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-3xl">
                  🛒
                </div>
                <h4 className="font-bold text-stone-700 text-base">Sepetiniz Henüz Boş</h4>
                <p className="text-xs text-stone-500 max-w-xs">
                  Şarküterimizin taze peynir, zeytin ve yöresel ürünlerinden dilediğinizi ekleyin.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 text-xs font-bold text-amber-700 hover:text-amber-800 underline underline-offset-4"
                >
                  Ürünleri İncele
                </button>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div
                  key={`${item.product.id}-${item.selectedWeight}-${item.selectedSlice}-${idx}`}
                  className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-3.5 flex gap-3 items-center justify-between"
                >
                  <img
                    src={item.product.image_url || 'https://images.unsplash.com/photo-1589881133595-a3c085cb731d?w=800&auto=format&fit=crop&q=80'}
                    alt={item.product.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-stone-200"
                  />

                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className="font-bold text-stone-900 text-sm truncate">
                      {item.product.name}
                    </h4>

                    {/* Weight & Slicing info */}
                    <div className="flex flex-wrap gap-1 mt-1 text-[11px] text-stone-500 font-medium">
                      {item.selectedWeight && (
                        <span className="bg-white px-1.5 py-0.5 rounded border border-stone-200">
                          ⚖️ {item.selectedWeight >= 1000 ? `${item.selectedWeight / 1000} kg` : `${item.selectedWeight} gr`}
                        </span>
                      )}
                      {item.selectedSlice && (
                        <span className="bg-white px-1.5 py-0.5 rounded border border-stone-200">
                          🔪 {item.selectedSlice}
                        </span>
                      )}
                    </div>

                    <div className="font-extrabold text-sm text-emerald-950 mt-1">
                      {item.calculatedPrice.toFixed(2)} ₺
                    </div>
                  </div>

                  {/* Quantity Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => removeFromCart(idx)}
                      className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                      title="Kaldır"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-stone-200 shadow-sm">
                      <button
                        onClick={() => updateQuantity(idx, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center hover:bg-stone-200"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(idx, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center hover:bg-stone-200"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Area */}
          {cart.length > 0 && (
            <div className="p-5 bg-stone-50 border-t border-stone-200 space-y-4">
              {/* Min Order Warning */}
              {isUnderMinOrder && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-700" />
                  <span>
                    İlçe içi minimum sipariş tutarı <strong>{minOrder} ₺</strong>&apos;dir. (Kalan: {(minOrder - subtotal).toFixed(2)} ₺)
                  </span>
                </div>
              )}

              {/* Subtotal */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-stone-500">
                  <span>Ara Toplam</span>
                  <span className="font-semibold text-stone-700">{subtotal.toFixed(2)} ₺</span>
                </div>
                <div className="flex justify-between text-xs text-stone-500">
                  <span>İlçe İçi Teslimat</span>
                  <span className="text-emerald-700 font-bold">Adreste Hesaplanır / Ücretsiz</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-stone-900 pt-2 border-t border-stone-200">
                  <span>Toplam</span>
                  <span className="text-xl text-emerald-950 font-serif">{subtotal.toFixed(2)} ₺</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/sepet"
                onClick={() => setIsCartOpen(false)}
                className={`w-full py-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                  isUnderMinOrder
                    ? 'bg-stone-300 text-stone-600 cursor-pointer hover:bg-stone-400'
                    : 'bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-900 hover:to-emerald-950 text-amber-100 shadow-emerald-950/20'
                }`}
              >
                <span>Siparişi Tamamla & Adres Seç</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
