'use client';

import React from 'react';
import { Product } from '@/types/database';
import { Plus, SlidersHorizontal, Check } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

interface ProductCardProps {
  product: Product;
  onOpenModal: (product: Product) => void;
}

export function ProductCard({ product, onOpenModal }: ProductCardProps) {
  const { cart, addToCart } = useCart();
  const isOutOfStock = product.stock_status === 'out_of_stock';

  // Check if product is in cart
  const cartItemCount = cart
    .filter((it) => it.product.id === product.id)
    .reduce((sum, it) => sum + it.quantity, 0);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;

    if (product.unit_type === 'kg' && product.weight_options && product.weight_options.length > 0) {
      // If it's a weighted item with multiple options, opening modal is best for accuracy
      onOpenModal(product);
    } else {
      addToCart(product, product.default_weight, undefined, 1);
    }
  };

  const getUnitLabel = () => {
    if (product.unit_type === 'kg') return 'kg';
    if (product.unit_type === 'pack') return 'paket';
    return 'adet';
  };

  return (
    <div
      onClick={() => !isOutOfStock && onOpenModal(product)}
      className={`group bg-white rounded-3xl overflow-hidden border border-stone-200/80 hover:border-amber-500/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer ${
        isOutOfStock ? 'opacity-60 cursor-not-allowed' : ''
      }`}
    >
      <div>
        {/* Image & Badge Area */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1589881133595-a3c085cb731d?w=800&auto=format&fit=crop&q=80'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Badge */}
          {product.badge && (
            <div className="absolute top-3 left-3 bg-amber-600/90 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              {product.badge}
            </div>
          )}

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                Tükendi
              </span>
            </div>
          )}

          {/* In cart indicator */}
          {cartItemCount > 0 && !isOutOfStock && (
            <div className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>{cartItemCount} sepette</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          <h3 className="font-bold text-stone-900 text-base sm:text-lg line-clamp-1 group-hover:text-amber-800 transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description || 'Taze ve yöresel şarküteri ürünü.'}
          </p>

          {/* Grammage or Slice badges if kg */}
          {product.unit_type === 'kg' && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              <span className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200/60 font-medium px-2 py-0.5 rounded-lg">
                ⚖️ Gramaj Seçilebilir
              </span>
              {product.slice_options && product.slice_options.length > 0 && (
                <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-medium px-2 py-0.5 rounded-lg">
                  🔪 Dilimleme Tercihi
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pricing & Add to Cart button */}
      <div className="p-4 sm:p-5 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between gap-2">
        <div>
          <div className="text-[11px] text-stone-400 font-medium uppercase tracking-wider">
            {getUnitLabel()} Fiyatı
          </div>
          <div className="font-extrabold text-lg sm:text-xl text-emerald-950">
            {product.base_price.toFixed(2)}{' '}
            <span className="text-xs font-semibold text-stone-500">₺/{getUnitLabel()}</span>
          </div>
        </div>

        <button
          onClick={handleQuickAdd}
          disabled={isOutOfStock}
          className={`px-3.5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-sm ${
            isOutOfStock
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
              : 'bg-emerald-900 hover:bg-emerald-800 text-amber-100 hover:text-white shadow-emerald-950/15'
          }`}
        >
          {product.unit_type === 'kg' ? (
            <>
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Seç & Ekle</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Sepete Ekle</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
