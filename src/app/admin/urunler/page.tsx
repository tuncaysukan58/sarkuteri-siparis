'use client';

import React, { useState, useEffect } from 'react';
import { AdminNav } from '@/components/AdminNav';
import { Category, Product, UnitType } from '@/types/database';
import {
  getCategories,
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from '@/lib/data-service';
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  Search,
  Check,
  X,
  Sparkles,
  SlidersHorizontal,
  Image as ImageIcon,
} from 'lucide-react';

const SAMPLE_IMAGES = [
  { label: 'Peynir', url: 'https://images.unsplash.com/photo-1589881133595-a3c085cb731d?w=800&auto=format&fit=crop&q=80' },
  { label: 'Eski Kaşar', url: 'https://images.unsplash.com/photo-1624806992066-5ffcf7ca186b?w=800&auto=format&fit=crop&q=80' },
  { label: 'Zeytin', url: 'https://images.unsplash.com/photo-1541256942802-7b2996a84d43?w=800&auto=format&fit=crop&q=80' },
  { label: 'Zeytinyağı', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80' },
  { label: 'Pastırma', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80' },
  { label: 'Sucuk', url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80' },
  { label: 'Bal', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80' },
  { label: 'Kaymak', url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&auto=format&fit=crop&q=80' },
  { label: 'Köy Yumurtası', url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=800&auto=format&fit=crop&q=80' },
  { label: 'Tereyağı', url: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800&auto=format&fit=crop&q=80' },
];

const COMMON_WEIGHT_OPTIONS = [100, 200, 250, 500, 750, 1000];
const COMMON_SLICE_OPTIONS = [
  'Standart Dilim',
  'Tül İnceliğinde',
  'Kalıp / Blok',
  'Vakumlu Paket',
  'Rendelenmiş',
  'Zeytinyağlı & Kekikli',
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [unitType, setUnitType] = useState<UnitType>('kg');
  const [basePrice, setBasePrice] = useState<string>('0');
  const [selectedWeights, setSelectedWeights] = useState<number[]>([250, 500, 750, 1000]);
  const [selectedSlices, setSelectedSlices] = useState<string[]>(['Standart Dilim', 'Kalıp / Blok']);
  const [badge, setBadge] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [stockStatus, setStockStatus] = useState<'in_stock' | 'out_of_stock'>('in_stock');
  const [formError, setFormError] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categories.length > 0 ? categories[0].id : '');
    setDescription('');
    setImageUrl(SAMPLE_IMAGES[0].url);
    setUnitType('kg');
    setBasePrice('');
    setSelectedWeights([250, 500, 750, 1000]);
    setSelectedSlices(['Standart Dilim', 'Kalıp / Blok']);
    setBadge('');
    setIsFeatured(false);
    setStockStatus('in_stock');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategoryId(p.category_id || (categories.length > 0 ? categories[0].id : ''));
    setDescription(p.description || '');
    setImageUrl(p.image_url || '');
    setUnitType(p.unit_type);
    setBasePrice(p.base_price.toString());
    setSelectedWeights(p.weight_options || [250, 500, 750, 1000]);
    setSelectedSlices(p.slice_options || ['Standart Dilim']);
    setBadge(p.badge || '');
    setIsFeatured(p.is_featured || false);
    setStockStatus(p.stock_status);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleToggleWeight = (w: number) => {
    if (selectedWeights.includes(w)) {
      setSelectedWeights(selectedWeights.filter((item) => item !== w));
    } else {
      setSelectedWeights([...selectedWeights, w].sort((a, b) => a - b));
    }
  };

  const handleToggleSlice = (s: string) => {
    if (selectedSlices.includes(s)) {
      setSelectedSlices(selectedSlices.filter((item) => item !== s));
    } else {
      setSelectedSlices([...selectedSlices, s]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const parsedPrice = parseFloat(basePrice);
    if (!name.trim()) {
      setFormError('Ürün adı zorunludur.');
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setFormError('Lütfen geçerli bir fiyat giriniz.');
      return;
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: name.trim(),
          category_id: categoryId || null,
          description: description.trim() || undefined,
          image_url: imageUrl.trim() || undefined,
          unit_type: unitType,
          base_price: parsedPrice,
          weight_options: unitType === 'kg' ? selectedWeights : undefined,
          slice_options: selectedSlices.length > 0 ? selectedSlices : undefined,
          badge: badge.trim() || null,
          is_featured: isFeatured,
          stock_status: stockStatus,
        });
      } else {
        await addProduct({
          name: name.trim(),
          category_id: categoryId || null,
          description: description.trim() || undefined,
          image_url: imageUrl.trim() || SAMPLE_IMAGES[0].url,
          unit_type: unitType,
          base_price: parsedPrice,
          default_weight: unitType === 'kg' ? selectedWeights[0] || 500 : undefined,
          weight_options: unitType === 'kg' ? selectedWeights : undefined,
          slice_options: selectedSlices.length > 0 ? selectedSlices : undefined,
          is_active: true,
          badge: badge.trim() || null,
          is_featured: isFeatured,
          stock_status: stockStatus,
        });
      }

      setIsModalOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
      setFormError('Ürün kaydedilirken bir hata oluştu.');
    }
  };

  const handleDelete = async (id: string, prodName: string) => {
    if (confirm(`"${prodName}" ürününü silmek istediğinize emin misiniz?`)) {
      await deleteProduct(id);
      loadData();
    }
  };

  const handleStockToggle = async (p: Product) => {
    const nextStatus = p.stock_status === 'in_stock' ? 'out_of_stock' : 'in_stock';
    await updateProduct(p.id, { stock_status: nextStatus });
    loadData();
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCatFilter !== 'all' && p.category_id !== selectedCatFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col justify-between">
      <div>
        <AdminNav />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Package className="w-7 h-7 text-amber-600" />
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
                  Ürün ve Fiyat Yönetimi
                </h1>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Şarküteri ürünlerinizi ekleyin, kilogram/adet fiyatlarını güncelleyin ve gramaj seçeneklerini belirleyin.
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="bg-emerald-950 hover:bg-emerald-900 text-amber-100 font-bold px-5 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Yeni Ürün Ekle</span>
            </button>
          </div>

          {/* Filters: Categories & Search */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedCatFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCatFilter === 'all'
                    ? 'bg-emerald-950 text-amber-100 shadow-md'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                Tümü ({products.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCatFilter(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    selectedCatFilter === cat.id
                      ? 'bg-emerald-950 text-amber-100 shadow-md'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  <span>{cat.icon || '🧀'}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ürün adı ara..."
                className="w-full bg-white border border-stone-300 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-3xl p-5 border border-stone-200 animate-pulse h-48"></div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-sm max-w-md mx-auto my-12 space-y-3">
              <div className="text-4xl">🧀</div>
              <h3 className="font-bold text-stone-800">Ürün Bulunamadı</h3>
              <p className="text-xs text-stone-500">Bu kategoride henüz ürün eklenmemiş.</p>
              <button
                onClick={openAddModal}
                className="bg-emerald-950 text-amber-100 px-4 py-2 rounded-xl text-xs font-bold"
              >
                İlk Ürünü Ekle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((p) => {
                const category = categories.find((c) => c.id === p.category_id);
                const isOutOfStock = p.stock_status === 'out_of_stock';
                return (
                  <div
                    key={p.id}
                    className={`bg-white rounded-3xl border overflow-hidden transition-all shadow-sm hover:shadow-md flex flex-col justify-between ${
                      isOutOfStock ? 'border-stone-200 opacity-60 bg-stone-50' : 'border-stone-200'
                    }`}
                  >
                    <div>
                      {/* Image & Badges */}
                      <div className="relative aspect-[16/9] w-full bg-stone-100">
                        <img
                          src={p.image_url || SAMPLE_IMAGES[0].url}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                        {category && (
                          <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                            {category.icon} {category.name}
                          </div>
                        )}
                        {p.badge && (
                          <div className="absolute bottom-3 left-3 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {p.badge}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-extrabold text-stone-900 text-base font-serif line-clamp-1">
                            {p.name}
                          </h3>
                        </div>
                        <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                          {p.description || 'Açıklama yok.'}
                        </p>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-lg font-black text-emerald-950 font-serif">
                            {p.base_price.toFixed(2)}{' '}
                            <span className="text-xs font-semibold text-stone-500">
                              ₺ / {p.unit_type === 'kg' ? 'kg' : p.unit_type === 'pack' ? 'paket' : 'adet'}
                            </span>
                          </div>

                          <button
                            onClick={() => handleStockToggle(p)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                              isOutOfStock
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            }`}
                          >
                            {isOutOfStock ? 'Tükendi' : 'Stokta Var'}
                          </button>
                        </div>

                        {p.unit_type === 'kg' && p.weight_options && (
                          <div className="mt-3 text-[11px] text-stone-500 flex flex-wrap gap-1">
                            <span className="font-semibold">Gramajlar:</span>
                            {p.weight_options.map((w) => (
                              <span key={w} className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-700">
                                {w}g
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="bg-white hover:bg-stone-100 text-stone-700 p-2 rounded-xl border border-stone-200 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Düzenle</span>
                      </button>

                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="bg-white hover:bg-rose-50 text-stone-400 hover:text-rose-600 p-2 rounded-xl border border-stone-200 text-xs font-bold transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-scale-in my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-lg font-bold text-stone-900 font-serif flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span>{editingProduct ? 'Ürünü Düzenle' : 'Yeni Şarküteri Ürünü Ekle'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Ürün Adı *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn: Hakiki Çanakkale Ezine Peyniri..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              {/* Dynamic Category & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Kategori Seçiniz *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-3 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Birim Türü
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'kg', label: 'Kilogram (kg)' },
                      { id: 'piece', label: 'Adet' },
                      { id: 'pack', label: 'Paket' },
                    ].map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setUnitType(u.id as UnitType)}
                        className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                          unitType === u.id
                            ? 'border-amber-600 bg-amber-50 text-amber-950'
                            : 'border-stone-200 bg-white text-stone-700'
                        }`}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Birim Fiyatı (₺) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    placeholder="Örn: 480"
                    className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-3 text-sm font-extrabold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Etiket / Rozet (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Örn: Çok Satan, Yöresel, Yeni Mahsul..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
              </div>

              {/* Weight Options (If unit is kg) */}
              {unitType === 'kg' && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    ⚖️ Müşterinin Seçebileceği Gramajlar
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_WEIGHT_OPTIONS.map((w) => {
                      const isSelected = selectedWeights.includes(w);
                      return (
                        <button
                          key={w}
                          type="button"
                          onClick={() => handleToggleWeight(w)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            isSelected
                              ? 'border-amber-600 bg-amber-100 text-amber-950'
                              : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100'
                          }`}
                        >
                          {w >= 1000 ? `${w / 1000} kg` : `${w} gr`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Slicing / Preparation options */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  🔪 Dilimleme & Hazırlama Seçenekleri
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SLICE_OPTIONS.map((s) => {
                    const isSelected = selectedSlices.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleToggleSlice(s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'border-emerald-700 bg-emerald-100 text-emerald-950'
                            : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Image URL & Preset Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Ürün Görseli (URL veya Hazır Seçin)
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 mb-2"
                />

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <span className="text-[11px] text-stone-500 shrink-0 font-medium">Hazır Görseller:</span>
                  {SAMPLE_IMAGES.map((img) => (
                    <button
                      key={img.label}
                      type="button"
                      onClick={() => setImageUrl(img.url)}
                      className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[11px] font-semibold shrink-0"
                    >
                      {img.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Ürün Açıklaması
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ürünün üretim yeri, dinlendirilme süresi veya tadım notları..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                ></textarea>
              </div>

              {/* Stock Status & Featured */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Stok Durumu
                  </label>
                  <button
                    type="button"
                    onClick={() => setStockStatus(stockStatus === 'in_stock' ? 'out_of_stock' : 'in_stock')}
                    className={`w-full p-2.5 rounded-2xl text-xs font-bold border transition-colors ${
                      stockStatus === 'in_stock'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-rose-100 text-rose-900 border-rose-300'
                    }`}
                  >
                    {stockStatus === 'in_stock' ? 'Stokta Var' : 'Tükendi'}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Öne Çıkarılan
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsFeatured(!isFeatured)}
                    className={`w-full p-2.5 rounded-2xl text-xs font-bold border transition-colors ${
                      isFeatured
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-stone-100 text-stone-600 border-stone-300'
                    }`}
                  >
                    {isFeatured ? '⭐ Vitrinde Öne Çıkar' : 'Standart'}
                  </button>
                </div>
              </div>

              {formError && (
                <p className="text-xs font-bold text-rose-600">{formError}</p>
              )}

              {/* Save Button */}
              <div className="pt-3 border-t border-stone-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-3 rounded-2xl text-xs transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-950 hover:bg-emerald-900 text-amber-100 font-bold py-3 rounded-2xl text-xs transition-all shadow-md active:scale-95"
                >
                  {editingProduct ? 'Güncelle' : 'Ürünü Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
