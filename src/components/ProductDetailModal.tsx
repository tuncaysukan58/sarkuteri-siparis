'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types/database';
import { X, Plus, Minus, Check, ShoppingBag, Sparkles } from 'lucide-react';
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
    }, 600);
  };

  const weightOptions = product.weight_options && product.weight_options.length > 0
    ? product.weight_options
    : [250, 500, 750, 1000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[90vh] animate-scale-in"
      >
        {/* Header Image & Close Button */}
        <div className="relative aspect-[16/9] w-full bg-stone-100 shrink-0">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1589881133595-a3c085cb731d?w=800&auto=format&fit=crop&q=80'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-full backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          {product.badge && (
            <div className="absolute bottom-3 left-4 bg-amber-600/95 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{product.badge}</span>
            </div>
          )}
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Title & Desc */}
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-serif">
              {product.name}
            </h2>
            <p className="text-stone-600 text-sm mt-1.5 leading-relaxed">
              {product.description || 'Geleneksel yöntemlerle üretilmiş en taze şarküteri ürünü.'}
            </p>
          </div>

          {/* Grammage Selector (If unit is kg) */}
          {product.unit_type === 'kg' && (
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                ⚖️ Gramaj / Miktar Seçiniz
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {weightOptions.map((w) => {
                  const isSelected = selectedWeight === w;
                  const priceForWeight = (product.base_price * w) / 1000;
                  return (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setSelectedWeight(w)}
                      className={`p-3 rounded-2xl text-center border-2 transition-all flex flex-col items-center justify-center ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50/70 text-amber-900 shadow-sm'
                          : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                      }`}
                    >
                      <span className="font-extrabold text-base">
                        {w >= 1000 ? `${w / 1000} kg` : `${w} gr`}
                      </span>
                      <span className="text-[11px] font-semibold text-stone-500 mt-0.5">
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
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                🔪 Dilimleme & Hazırlama Tercihi
              </label>
              <div className="grid grid-cols-2 gap-2">
                {product.slice_options.map((option) => {
                  const isSelected = selectedSlice === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedSlice(option)}
                      className={`p-3 rounded-2xl text-left border-2 text-xs font-semibold transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-700 bg-emerald-50/70 text-emerald-950 shadow-sm'
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
            <span className="text-sm font-bold text-stone-700">Paket / Adet Adedi</span>
            <div className="flex items-center gap-3 bg-stone-100 p-1 rounded-2xl border border-stone-200">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-xl bg-white text-stone-800 flex items-center justify-center shadow-sm hover:bg-stone-50 active:scale-95 transition-all"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-extrabold text-stone-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-xl bg-white text-stone-800 flex items-center justify-center shadow-sm hover:bg-stone-50 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer: Price & Submit Button */}
        <div className="p-4 sm:p-6 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-4 shrink-0">
          <div>
            <div className="text-xs text-stone-500 font-medium">Toplam Tutar</div>
            <div className="text-2xl font-black text-emerald-950 font-sans">
              {calculatedTotalPrice.toFixed(2)} <span className="text-sm font-bold">₺</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdded}
            className={`flex-1 max-w-xs py-3.5 px-6 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
              isAdded
                ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-amber-900/20'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-5 h-5 stroke-[3]" />
                <span>Sepete Eklendi!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" />
                <span>Sepete Ekle</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
