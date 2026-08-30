'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product } from '@/types/database';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, selectedWeight?: number, selectedSlice?: string, quantity?: number) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sarkuteri_cart');
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Cart load error', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('sarkuteri_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (
    product: Product,
    selectedWeight?: number,
    selectedSlice?: string,
    quantity: number = 1
  ) => {
    // Calculate price for this specific item
    let unitPrice = product.base_price;
    if (product.unit_type === 'kg' && selectedWeight) {
      unitPrice = (product.base_price * selectedWeight) / 1000;
    }

    const calculatedPrice = unitPrice * quantity;

    setCart((prev) => {
      // Check if exact same item with same weight & slice option exists
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedWeight === selectedWeight &&
          item.selectedSlice === selectedSlice
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          calculatedPrice: unitPrice * newQty,
        };
        return updated;
      }

      return [
        ...prev,
        {
          product,
          selectedWeight,
          selectedSlice,
          quantity,
          calculatedPrice,
        },
      ];
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }

    setCart((prev) => {
      const updated = [...prev];
      const item = updated[index];
      let unitPrice = item.product.base_price;
      if (item.product.unit_type === 'kg' && item.selectedWeight) {
        unitPrice = (item.product.base_price * item.selectedWeight) / 1000;
      }
      updated[index] = {
        ...item,
        quantity,
        calculatedPrice: unitPrice * quantity,
      };
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.calculatedPrice, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
