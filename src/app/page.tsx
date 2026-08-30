'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { CartDrawer } from '@/components/CartDrawer';
import { Category, Product, StoreSettings } from '@/types/database';
import { getCategories, getProducts, getStoreSettings } from '@/lib/data-service';
import { Sparkles, Bike, Scale, ShieldCheck, Search, SlidersHorizontal } from 'lucide-react';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings | undefined>(undefined);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, prods, sets] = await Promise.all([
          getCategories(),
          getProducts(),
          getStoreSettings(),
        ]);
        setCategories(cats);
        setProducts(prods);
        setSettings(sets);
      } catch (err) {
        console.error('Veri yükleme hatası:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const openProductModal = (prod: Product) => {
    setModalProduct(prod);
    setIsModalOpen(true);
  };

  // Filtered products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategoryId && p.category_id !== selectedCategoryId) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = p.description?.toLowerCase().includes(q);
        return matchName || matchDesc;
      }
      return true;
    });
  }, [products, selectedCategoryId, searchQuery]);

  // Featured products
  const featuredProducts = useMemo(() => {
    return products.filter((p) => p.is_featured && p.is_active);
  }, [products]);

  // Selected Category name
  const currentCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="flex flex-col min-h-screen bg-[#faf7f2]">
      {/* Navigation */}
      <Navbar
        settings={settings}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white overflow-hidden py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]"></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left text */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide backdrop-blur-md">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>İlçe İçi Aynı Gün & Taze Teslimat</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-serif tracking-tight text-white leading-tight">
                  Taptaze Şarküteri Lezzetleri <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200">
                    Kapınıza Gelsin
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Ezine peynirlerinden Kayseri pastırmasına, Gemlik sele zeytinlerinden yayla ballarına kadar en seçkin lezzetler dilediğiniz gramajda hazırlanıp ilçe içi adresinize teslim edilir.
                </p>

                {/* Badges */}
                <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg mx-auto lg:mx-0">
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex flex-col items-center lg:items-start text-center lg:text-left">
                    <Bike className="w-5 h-5 text-amber-400 mb-1" />
                    <span className="text-xs font-bold text-white">30-45 Dk</span>
                    <span className="text-[10px] text-stone-300">Hızlı Kurye</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex flex-col items-center lg:items-start text-center lg:text-left">
                    <Scale className="w-5 h-5 text-amber-400 mb-1" />
                    <span className="text-xs font-bold text-white">Özel Gramaj</span>
                    <span className="text-[10px] text-stone-300">250g, 500g, 1kg</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex flex-col items-center lg:items-start text-center lg:text-left">
                    <ShieldCheck className="w-5 h-5 text-amber-400 mb-1" />
                    <span className="text-xs font-bold text-white">%100 Doğal</span>
                    <span className="text-[10px] text-stone-300">Yöresel Lezzet</span>
                  </div>
                </div>

                {/* Mobile Search input */}
                <div className="md:hidden pt-2 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Şarküteri ürünü ara (örn: Ezine, Pastırma)..."
                    className="w-full bg-white/95 text-stone-900 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-lg placeholder:text-stone-400"
                  />
                  <Search className="w-4 h-4 text-stone-500 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Right promo highlight box */}
              <div className="lg:col-span-5 hidden lg:block">
                <div className="bg-gradient-to-br from-amber-500/20 to-amber-900/30 border border-amber-500/30 p-6 rounded-3xl backdrop-blur-md shadow-2xl relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      🧀 Haftanın Şarküteri Seçkisi
                    </span>
                    <span className="text-[11px] bg-emerald-700/80 text-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                      Taze Kesim
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-emerald-950/80 p-3 rounded-2xl border border-emerald-800/80">
                      <img
                        src="https://images.unsplash.com/photo-1589881133595-a3c085cb731d?w=200&auto=format&fit=crop&q=80"
                        alt="Ezine Peyniri"
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-white truncate">Çanakkale Ezine Peyniri</div>
                        <div className="text-xs text-amber-300 font-semibold">480.00 ₺ / kg</div>
                        <div className="text-[10px] text-stone-300">İstediğiniz gramajda dilimlenir</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-emerald-950/80 p-3 rounded-2xl border border-emerald-800/80">
                      <img
                        src="https://images.unsplash.com/photo-1544025162-d76694265947?w=200&auto=format&fit=crop&q=80"
                        alt="Pastırma"
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-white truncate">Kayseri Antrikot Pastırma</div>
                        <div className="text-xs text-amber-300 font-semibold">1450.00 ₺ / kg</div>
                        <div className="text-[10px] text-stone-300">Tül inceliğinde el kesimi</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Bar Sticky */}
        <section className="sticky top-20 z-30 bg-[#faf7f2]/95 backdrop-blur-md border-b border-stone-200/80 py-3 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CategoryFilter
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
            />
          </div>
        </section>

        {/* Products Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
                  {currentCategory ? (
                    <span className="flex items-center gap-2">
                      <span>{currentCategory.icon || '🧀'}</span>
                      <span>{currentCategory.name}</span>
                    </span>
                  ) : searchQuery ? (
                    <span>&quot;{searchQuery}&quot; Arama Sonuçları</span>
                  ) : (
                    <span>Tüm Şarküteri Ürünleri</span>
                  )}
                </h2>
                <span className="text-xs font-bold text-stone-500 bg-stone-200/70 px-2.5 py-1 rounded-full">
                  {filteredProducts.length} ürün
                </span>
              </div>
              {currentCategory?.description && (
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  {currentCategory.description}
                </p>
              )}
            </div>

            {selectedCategoryId && (
              <button
                onClick={() => setSelectedCategoryId(null)}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 underline underline-offset-4 self-start sm:self-auto"
              >
                Filtreyi Temizle (Tüm Ürünleri Göster)
              </button>
            )}
          </div>

          {/* Loading Skeleton or Empty State */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-white rounded-3xl p-4 border border-stone-200 animate-pulse space-y-3">
                  <div className="aspect-[4/3] bg-stone-200 rounded-2xl"></div>
                  <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                  <div className="h-3 bg-stone-200 rounded w-1/2"></div>
                  <div className="h-8 bg-stone-200 rounded-xl mt-4"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-sm space-y-4 max-w-md mx-auto my-12">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-3xl mx-auto">
                🔍
              </div>
              <h3 className="text-lg font-bold text-stone-800">Aradığınız Ürün Bulunamadı</h3>
              <p className="text-xs text-stone-500">
                Arama kelimenizi kontrol edebilir veya diğer kategorilerimize göz atabilirsiniz.
              </p>
              <button
                onClick={() => {
                  setSelectedCategoryId(null);
                  setSearchQuery('');
                }}
                className="bg-emerald-900 text-amber-100 font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-emerald-800 transition-colors"
              >
                Tüm Ürünleri Listele
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenModal={openProductModal}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Product Detail / Grammage Modal */}
      <ProductDetailModal
        product={modalProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Cart Slide-Over Drawer */}
      <CartDrawer settings={settings} />

      {/* Footer */}
      <Footer settings={settings} />
    </div>
  );
}
