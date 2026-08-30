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

  // Calculate single item price
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[92vh] animate-scale-in relative"
      >
        {/* Compact Header with Image & Overlay */}
        <div className="relative h-40 sm:h-48 w-full bg-stone-900 shrink-0 overflow-hidden">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1589881133595-a3c085cb731d?w=800&auto=format&fit=crop&q=80'}
            alt={product.name}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white p-2 rounded-full backdrop-blur-md transition-colors z-10"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge */}
          {product.badge && (
            <div className="absolute top-3 left-3 bg-amber-600/95 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{product.badge}</span>
            </div>
          )}

          {/* Product Title on Image Bottom */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <h2 className="text-lg sm:text-xl font-extrabold font-serif leading-snug drop-shadow-md">
              {product.name}
            </h2>
            <div className="text-amber-300 font-bold text-xs mt-0.5 flex items-center gap-2">
              <span>{product.base_price.toFixed(2)} ₺ / {product.unit_type === 'kg' ? 'kg' : 'adet'}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {product.description && (
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/40">
              {product.description}
            </p>
          )}

          {/* Grammage Selector (If unit is kg) */}
          {product.unit_type === 'kg' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-600" />
                  <span>Gramaj Seçiniz</span>
                </label>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md">
                  Seçilen: {selectedWeight >= 1000 ? `${selectedWeight / 1000} kg` : `${selectedWeight} gr`}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {weightOptions.map((w) => {
                  const isSelected = selectedWeight === w;
                  const priceForWeight = (product.base_price * w) / 1000;
                  return (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setSelectedWeight(w)}
                      className={`p-2.5 rounded-2xl text-center border-2 transition-all flex flex-col items-center justify-center ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50 text-amber-950 shadow-md scale-[1.02]'
                          : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                      }`}
                    >
                      <span className="font-extrabold text-sm sm:text-base">
                        {w >= 1000 ? `${w / 1000} kg` : `${w} gr`}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-800 mt-0.5">
                        {priceForWeight.toFixed(2)} ₺
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Slicing / Preparation options */}
          {product.slice_options && product.slice_options.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-amber-600" />
                <span>Dilimleme & Hazırlanış Tercihi</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {product.slice_options.map((option) => {
                  const isSelected = selectedSlice === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedSlice(option)}
                      className={`p-2.5 rounded-2xl text-left border-2 text-xs font-bold transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-950 shadow-sm'
                          : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                      }`}
                    >
                      <span>{option}</span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity selector */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <span className="text-xs font-extrabold text-stone-800 uppercase tracking-wider">Paket / Adet Adedi</span>
            <div className="flex items-center gap-3 bg-stone-100 p-1 rounded-2xl border border-stone-200">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-xl bg-white text-stone-800 flex items-center justify-center shadow-sm hover:bg-stone-50 active:scale-95 transition-all font-bold"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-extrabold text-stone-900 text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-xl bg-white text-stone-800 flex items-center justify-center shadow-sm hover:bg-stone-50 active:scale-95 transition-all font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer: Prominent Price & Big Add to Cart Button */}
        <div className="p-3.5 sm:p-5 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
          <div>
            <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Toplam Tutar</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-950 font-serif leading-none">
              {calculatedTotalPrice.toFixed(2)} <span className="text-xs font-bold text-stone-600">₺</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdded}
            className={`flex-1 py-3.5 px-5 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 ${
              isAdded
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-gradient-to-r from-emerald-800 via-emerald-900 to-emerald-950 hover:from-emerald-900 hover:to-black text-amber-100 shadow-emerald-950/20'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-5 h-5 stroke-[3]" />
                <span>Sepete Eklendi!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <span>Sepete Ekle</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
