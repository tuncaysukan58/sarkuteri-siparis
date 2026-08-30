'use client';

import React from 'react';
import { Category } from '@/types/database';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryFilter({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryFilterProps) {
  const activeCategories = categories.filter((c) => c.is_active);

  return (
    <div className="w-full overflow-x-auto pb-3 pt-1 scrollbar-none">
      <div className="flex items-center gap-2.5 min-w-max px-1">
        {/* All Products Tab */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all shadow-sm ${
            selectedCategoryId === null
              ? 'bg-emerald-900 text-amber-100 shadow-emerald-950/20 scale-[1.02]'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <span className="text-base">✨</span>
          <span>Tüm Ürünler</span>
        </button>

        {/* Dynamic Categories */}
        {activeCategories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all shadow-sm ${
                isSelected
                  ? 'bg-emerald-900 text-amber-100 shadow-emerald-950/20 scale-[1.02]'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <span className="text-base">{cat.icon || '🧀'}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
