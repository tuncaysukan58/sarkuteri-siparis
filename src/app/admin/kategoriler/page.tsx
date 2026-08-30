'use client';

import React, { useState, useEffect } from 'react';
import { AdminNav } from '@/components/AdminNav';
import { Category, Product } from '@/types/database';
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getProducts,
} from '@/lib/data-service';
import {
  Plus,
  Edit2,
  Trash2,
  FolderTree,
  Check,
  X,
  Sparkles,
  ArrowUpDown,
  Search,
} from 'lucide-react';

const EMOJI_PRESETS = ['🧀', '🫒', '🥩', '🍯', '🥗', '🥚', '🧈', '🍇', '🍞', '🧂', '🥛', '🌿', '🌶️', '🍖', '🥪'];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('🧀');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cats, prods] = await Promise.all([getCategories(), getProducts()]);
      setCategories(cats);
      setProducts(prods);
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
    setEditingCategory(null);
    setName('');
    setSlug('');
    setIcon('🧀');
    setDescription('');
    setSortOrder(categories.length + 1);
    setIsActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setIcon(cat.icon || '🧀');
    setDescription(cat.description || '');
    setSortOrder(cat.sort_order || 1);
    setIsActive(cat.is_active);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      // Auto generate slug
      const generatedSlug = val
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Kategori adı zorunludur.');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: name.trim(),
          slug: slug.trim() || name.toLowerCase(),
          icon: icon || '🧀',
          description: description.trim() || undefined,
          sort_order: Number(sortOrder) || 1,
          is_active: isActive,
        });
      } else {
        await addCategory({
          name: name.trim(),
          slug: slug.trim() || `kat-${Date.now()}`,
          icon: icon || '🧀',
          description: description.trim() || undefined,
          sort_order: Number(sortOrder) || categories.length + 1,
          is_active: isActive,
        });
      }

      setIsModalOpen(false);
      loadData();
    } catch (e) {
      console.error(e);
      setFormError('Kategori kaydedilirken hata oluştu.');
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    const attachedCount = products.filter((p) => p.category_id === id).length;
    let message = `"${catName}" kategorisini silmek istediğinize emin misiniz?`;
    if (attachedCount > 0) {
      message = `Bu kategoriye bağlı ${attachedCount} adet ürün bulunmaktadır. Kategori silindiğinde ürünler kategorisiz kalacaktır. Devam edilsin mi?`;
    }

    if (confirm(message)) {
      await deleteCategory(id);
      loadData();
    }
  };

  const toggleActiveStatus = async (cat: Category) => {
    await updateCategory(cat.id, { is_active: !cat.is_active });
    loadData();
  };

  const filteredCategories = categories.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
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
                <FolderTree className="w-7 h-7 text-amber-600" />
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
                  Kategori Yönetimi
                </h1>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Şarküterinizdeki ürün gruplarını (Peynir, Zeytin, Meze vb.) ekleyin, sıralayın ve düzenleyin.
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="bg-emerald-950 hover:bg-emerald-900 text-amber-100 font-bold px-5 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Yeni Kategori Ekle</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6 max-w-md relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Kategori adı ara..."
              className="w-full bg-white border border-stone-300 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Categories Grid / Table */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-3xl p-5 border border-stone-200 animate-pulse h-32"></div>
              ))}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-sm max-w-md mx-auto my-12 space-y-3">
              <div className="text-4xl">🏷️</div>
              <h3 className="font-bold text-stone-800">Kategori Bulunamadı</h3>
              <p className="text-xs text-stone-500">
                Henüz kategori eklenmemiş veya arama kriterine uygun kategori yok.
              </p>
              <button
                onClick={openAddModal}
                className="bg-emerald-950 text-amber-100 px-4 py-2 rounded-xl text-xs font-bold"
              >
                İlk Kategoriyi Ekle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCategories.map((cat) => {
                const productCount = products.filter((p) => p.category_id === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className={`bg-white rounded-3xl p-5 border transition-all shadow-sm hover:shadow-md flex flex-col justify-between ${
                      cat.is_active ? 'border-stone-200' : 'border-stone-200 bg-stone-50/70 opacity-70'
                    }`}
                  >
                    <div>
                      {/* Top icon & Status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl shadow-inner">
                          {cat.icon || '🧀'}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">
                            Sıra: {cat.sort_order}
                          </span>

                          <button
                            onClick={() => toggleActiveStatus(cat)}
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${
                              cat.is_active
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-stone-200 text-stone-600 border-stone-300'
                            }`}
                          >
                            {cat.is_active ? 'Aktif' : 'Pasif'}
                          </button>
                        </div>
                      </div>

                      {/* Name & Description */}
                      <h3 className="font-extrabold text-stone-900 text-lg font-serif">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                        {cat.description || 'Açıklama belirtilmemiş.'}
                      </p>
                    </div>

                    {/* Footer: Product count & Action buttons */}
                    <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/50">
                        {productCount} Çeşit Ürün
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-scale-in"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-lg font-bold text-stone-900 font-serif flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span>{editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Kategori Adı *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Örn: Yöresel Peynirler, Meze Çeşitleri..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              {/* Emoji / Icon Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  İkon / Emoji Seçiniz
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-2xl flex items-center justify-center border border-amber-300 shrink-0">
                    {icon}
                  </div>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="Emoji yazın veya seçin"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {EMOJI_PRESETS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setIcon(em)}
                      className={`w-8 h-8 rounded-lg text-base flex items-center justify-center border transition-all ${
                        icon === em ? 'border-amber-600 bg-amber-100 scale-110' : 'border-stone-200 bg-white hover:bg-stone-100'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Açıklama (Opsiyonel)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Örn: Ezine, Kaşar, Tulum ve Yöresel Peynirler..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                ></textarea>
              </div>

              {/* Sort Order & Active Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Görüntüleme Sırası
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-2xl p-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Durum
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`w-full p-2.5 rounded-2xl text-xs font-bold border transition-colors ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-stone-200 text-stone-600 border-stone-300'
                    }`}
                  >
                    {isActive ? 'Aktif (Vitrinde Görünür)' : 'Pasif (Gizli)'}
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
                  {editingCategory ? 'Güncelle' : 'Kategori Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
