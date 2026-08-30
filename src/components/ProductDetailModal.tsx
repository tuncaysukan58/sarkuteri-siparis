'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types/database';
import { X, Plus, Minus, Check, ShoppingBag, Sparkles, Scale, Utensils } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const { addToCart, setIsCartOpen } = useCart();

  const [selectedWeight, setSelectedWeight] = useState<number>(500);
  const [selectedSlice, setSelectedSlice] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (product) {
      if (product.unit_type === 'kg') {
        const defaultW = product.default_weight || (product.weight_options && product.weight_options[0]) || 500;
        setSelectedWeight(defaultW);
      }
      if (product.slice_options && product.slice_options.length > 0) {
        setSelectedSlice(product.slice_options[0]);
      } else {
        setSelectedSlice('');
      }
      setQuantity(1);
      setIsAdded(false);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  // Calculate price
  let singleItemPrice = product.base_price;
  if (product.unit_type === 'kg') {
    singleItemPrice = (product.base_price * selectedWeight) / 1000;
  }
  const calculatedTotalPrice = singleItemPrice * quantity;

  const handleAddToCart = () => {
    addToCart(
      product,
      product.unit_type === 'kg' ? selectedWeight : undefined,
      selectedSlice || undefined,
      quantity
    );
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
      setIsCartOpen(true);
    }, 400);
  };

  const weightOptions = product.weight_options && product.weight_options.length > 0
    ? product.weight_options
    : [250, 500, 750, 1000];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col md:flex-row animate-scale-in relative max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-stone-900/80 hover:bg-black text-white p-2 rounded-full backdrop-blur-md transition-colors z-20 shadow-md"
          title="Kapat"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left / Top: Product Photo */}
        <div className="md:w-5/12 h-36 md:h-auto bg-stone-900 relative shrink-0">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1589881133595-a3c085cb731d?w=800&auto=format&fit=crop&q=80'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden"></div>

          {product.badge && (
            <div className="absolute top-3 left-3 bg-amber-600/95 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{product.badge}</span>
            </div>
          )}
        </div>

        {/* Right / Content: Choices & Actions */}
        <div className="md:w-7/12 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-3.5">
            {/* Header */}
            <div>
              <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                {product.unit_type === 'kg' ? 'Taze Tartım & Dilimleme' : 'Adet / Paket Ürünü'}
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 font-serif leading-snug">
                {product.name}
              </h2>
              <div className="text-emerald-900 font-black text-base mt-0.5 font-serif">
                {product.base_price.toFixed(2)} ₺ <span className="text-xs font-semibold text-stone-500">/ {product.unit_type === 'kg' ? 'kg' : 'adet'}</span>
              </div>
            </div>

            {/* Grammage Selector */}
            {product.unit_type === 'kg' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-amber-600" />
                  <span>Gramaj Seçin:</span>
                </label>

                <div className="grid grid-cols-4 gap-1.5">
                  {weightOptions.map((w) => {
                    const isSelected = selectedWeight === w;
                    const priceForWeight = (product.base_price * w) / 1000;
                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setSelectedWeight(w)}
                        className={`p-2 rounded-xl text-center border-2 transition-all flex flex-col items-center justify-center ${
                          isSelected
                            ? 'border-amber-600 bg-amber-100/70 text-amber-950 font-black shadow-sm'
                            : 'border-stone-200 hover:border-stone-300 bg-stone-50 text-stone-700'
                        }`}
                      >
                        <span className="text-xs font-bold">
                          {w >= 1000 ? `${w / 1000}kg` : `${w}g`}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-800">
                          {priceForWeight.toFixed(0)} ₺
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Slicing / Preparation */}
            {product.slice_options && product.slice_options.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                  <Utensils className="w-3.5 h-3.5 text-amber-600" />
                  <span>Dilimleme Tercihi:</span>
                </label>

                <div className="grid grid-cols-2 gap-1.5">
                  {product.slice_options.map((option) => {
                    const isSelected = selectedSlice === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSelectedSlice(option)}
                        className={`p-2 rounded-xl text-left border-2 text-[11px] font-bold transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-emerald-700 bg-emerald-50 text-emerald-950 shadow-sm'
                            : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                        }`}
                      >
                        <span className="truncate">{option}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center justify-between pt-1 border-t border-stone-100">
              <span className="text-xs font-bold text-stone-700">Adet:</span>
              <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl border border-stone-200">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-lg bg-white text-stone-800 flex items-center justify-center font-bold shadow-sm"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-extrabold text-stone-900 text-xs">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-7 h-7 rounded-lg bg-white text-stone-800 flex items-center justify-center font-bold shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Footer: Prominent Price & Big Add to Cart Button */}
          <div className="pt-3 mt-3 border-t border-stone-200 flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] text-stone-400 font-bold uppercase">Toplam</div>
              <div className="text-xl font-black text-emerald-950 font-serif leading-none">
                {calculatedTotalPrice.toFixed(2)} ₺
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdded}
              className={`flex-1 py-3 px-4 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 ${
                isAdded
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-900 hover:to-black text-amber-100'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Sepete Eklendi!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>Sepete Ekle ({calculatedTotalPrice.toFixed(2)} ₺)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
