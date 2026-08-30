'use client';

import React from 'react';
import { Product } from '@/types/database';
import { Plus, SlidersHorizontal, Check, ShoppingBag } from 'lucide-react';
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

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;

    if (product.unit_type === 'kg' && product.weight_options && product.weight_options.length > 0) {
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
      className={`group bg-white rounded-3xl overflow-hidden border border-stone-200/90 hover:border-amber-500/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer relative select-none ${
        isOutOfStock ? 'opacity-60 cursor-not-allowed' : ''
      }`}
    >
      <div>
        {/* Image & Badge Area */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1589881133595-a3c085cb731d?w=800&auto=format&fit=crop&q=80'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none"
            loading="lazy"
          />

          {/* Badge */}
          {product.badge && (
            <div className="absolute top-3 left-3 bg-amber-600/95 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
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
            <div className="absolute top-3 right-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1 border border-white">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
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

          {/* Grammage & Slice badges */}
          {product.unit_type === 'kg' && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              <span className="text-[11px] bg-amber-50 text-amber-900 border border-amber-200/80 font-bold px-2 py-0.5 rounded-lg">
                ⚖️ 250g, 500g, 1kg
              </span>
              {product.slice_options && product.slice_options.length > 0 && (
                <span className="text-[11px] bg-emerald-50 text-emerald-900 border border-emerald-200/80 font-bold px-2 py-0.5 rounded-lg">
                  🔪 Dilimleme Seçimi
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pricing & Add to Cart button */}
      <div className="p-4 sm:p-5 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between gap-2">
        <div>
          <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
            {getUnitLabel()} Fiyatı
          </div>
          <div className="font-extrabold text-lg sm:text-xl text-emerald-950">
            {product.base_price.toFixed(2)}{' '}
            <span className="text-xs font-bold text-stone-500">₺/{getUnitLabel()}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleActionClick}
          disabled={isOutOfStock}
          className={`px-3.5 py-2.5 rounded-2xl font-extrabold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md ${
            isOutOfStock
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
              : 'bg-emerald-900 hover:bg-emerald-800 text-amber-100 hover:text-white shadow-emerald-950/20'
          }`}
        >
          {product.unit_type === 'kg' ? (
            <>
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>Seç & Ekle</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Sepete Ekle</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
