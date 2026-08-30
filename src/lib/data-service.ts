import { Category, DeliveryZone, Order, OrderStatus, Product, StoreSettings } from '@/types/database';
import { isSupabaseConfigured, supabase } from './supabase/client';
import {
  INITIAL_CATEGORIES,
  INITIAL_DELIVERY_ZONES,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_STORE_SETTINGS,
} from './mock-data';

// Helper for local storage persistence when Supabase is not yet connected
const LOCAL_STORAGE_KEYS = {
  CATEGORIES: 'sarkuteri_categories',
  PRODUCTS: 'sarkuteri_products',
  ZONES: 'sarkuteri_zones',
  SETTINGS: 'sarkuteri_settings',
  ORDERS: 'sarkuteri_orders',
};

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}

// ----------------------------------------------------
// CATEGORIES
// ----------------------------------------------------
export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data && data.length > 0) return data as Category[];
  }
  return getLocal<Category[]>(LOCAL_STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
}

export async function addCategory(category: Omit<Category, 'id'>): Promise<Category> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();
    if (!error && data) return data as Category;
    if (error) console.error('Supabase addCategory error:', error);
  }

  const newCat: Category = {
    ...category,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'cat_' + Date.now(),
    created_at: new Date().toISOString(),
  };

  const current = getLocal<Category[]>(LOCAL_STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  const updated = [...current, newCat];
  setLocal(LOCAL_STORAGE_KEYS.CATEGORIES, updated);
  return newCat;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('categories').update(updates).eq('id', id);
    if (!error) return true;
  }

  const current = getLocal<Category[]>(LOCAL_STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  const updated = current.map((c) => (c.id === id ? { ...c, ...updates } : c));
  setLocal(LOCAL_STORAGE_KEYS.CATEGORIES, updated);
  return true;
}

export async function deleteCategory(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) return true;
  }

  const current = getLocal<Category[]>(LOCAL_STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  const updated = current.filter((c) => c.id !== id);
  setLocal(LOCAL_STORAGE_KEYS.CATEGORIES, updated);
  return true;
}

// ----------------------------------------------------
// PRODUCTS
// ----------------------------------------------------
export async function getProducts(): Promise<Product[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data && data.length > 0) return data as Product[];
  }
  return getLocal<Product[]>(LOCAL_STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
}

export async function addProduct(product: Omit<Product, 'id'>): Promise<Product> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    if (!error && data) return data as Product;
    if (error) console.error('Supabase addProduct error:', error);
  }

  const newProd: Product = {
    ...product,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'prod_' + Date.now(),
    created_at: new Date().toISOString(),
  };

  const current = getLocal<Product[]>(LOCAL_STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const updated = [newProd, ...current];
  setLocal(LOCAL_STORAGE_KEYS.PRODUCTS, updated);
  return newProd;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('products').update(updates).eq('id', id);
    if (!error) return true;
    if (error) console.error('Supabase updateProduct error:', error);
  }

  const current = getLocal<Product[]>(LOCAL_STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const updated = current.map((p) => (p.id === id ? { ...p, ...updates } : p));
  setLocal(LOCAL_STORAGE_KEYS.PRODUCTS, updated);
  return true;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) return true;
    if (error) console.error('Supabase deleteProduct error:', error);
  }

  const current = getLocal<Product[]>(LOCAL_STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  const updated = current.filter((p) => p.id !== id);
  setLocal(LOCAL_STORAGE_KEYS.PRODUCTS, updated);
  return true;
}

// ----------------------------------------------------
// DELIVERY ZONES
// ----------------------------------------------------
export async function getDeliveryZones(): Promise<DeliveryZone[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('is_active', true);
    if (!error && data && data.length > 0) return data as DeliveryZone[];
  }
  return getLocal<DeliveryZone[]>(LOCAL_STORAGE_KEYS.ZONES, INITIAL_DELIVERY_ZONES);
}

export async function saveDeliveryZones(zones: DeliveryZone[]): Promise<boolean> {
  setLocal(LOCAL_STORAGE_KEYS.ZONES, zones);
  if (isSupabaseConfigured && supabase) {
    // Upsert delivery zones if needed
  }
  return true;
}

// ----------------------------------------------------
// STORE SETTINGS
// ----------------------------------------------------
export async function getStoreSettings(): Promise<StoreSettings> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('store_settings').select('*').limit(1).maybeSingle();
    if (!error && data) return data as StoreSettings;
  }
  return getLocal<StoreSettings>(LOCAL_STORAGE_KEYS.SETTINGS, INITIAL_STORE_SETTINGS);
}

export async function updateStoreSettings(settings: StoreSettings): Promise<boolean> {
  setLocal(LOCAL_STORAGE_KEYS.SETTINGS, settings);
  if (isSupabaseConfigured && supabase) {
    const { data: existing } = await supabase.from('store_settings').select('id').limit(1).maybeSingle();
    if (existing && existing.id) {
      await supabase.from('store_settings').update(settings).eq('id', existing.id);
    } else {
      await supabase.from('store_settings').insert([settings]);
    }
  }
  return true;
}

// ----------------------------------------------------
// ORDERS
// ----------------------------------------------------
export async function getOrders(): Promise<Order[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*)
      `)
      .order('created_at', { ascending: false });
    if (!error && data) return data as Order[];
  }
  return getLocal<Order[]>(LOCAL_STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
}

export async function createOrder(orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'status'>): Promise<Order> {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const order_number = `SRK-${randomSuffix}`;
  const now = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    const { items, ...orderHeader } = orderData;
    const { data: insertedOrder, error: orderErr } = await supabase
      .from('orders')
      .insert([
        {
          order_number,
          customer_name: orderHeader.customer_name,
          customer_phone: orderHeader.customer_phone,
          customer_address: orderHeader.customer_address,
          district_name: orderHeader.district_name || 'Merkez',
          neighborhood_name: orderHeader.neighborhood_name,
          delivery_time_slot: orderHeader.delivery_time_slot,
          payment_method: orderHeader.payment_method,
          order_notes: orderHeader.order_notes || null,
          subtotal: orderHeader.subtotal,
          delivery_fee: orderHeader.delivery_fee || 0,
          total_amount: orderHeader.total_amount,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (orderErr) {
      console.error('Supabase order insert error:', orderErr);
    } else if (insertedOrder) {
      if (items && items.length > 0) {
        const orderItemsToInsert = items.map((it) => ({
          order_id: insertedOrder.id,
          product_name: it.product_name,
          unit_type: it.unit_type,
          selected_weight: it.selected_weight || null,
          selected_slice: it.selected_slice || null,
          quantity: it.quantity,
          unit_price: it.unit_price,
          total_price: it.total_price,
        }));
        const { error: itemsErr } = await supabase.from('order_items').insert(orderItemsToInsert);
        if (itemsErr) console.error('Supabase order_items insert error:', itemsErr);
      }
      return { ...insertedOrder, items } as Order;
    }
  }

  // Local fallback
  const newOrder: Order = {
    ...orderData,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'ord_' + Date.now(),
    order_number,
    status: 'pending',
    created_at: now,
  };

  const current = getLocal<Order[]>(LOCAL_STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  const updated = [newOrder, ...current];
  setLocal(LOCAL_STORAGE_KEYS.ORDERS, updated);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('new_order_placed', { detail: newOrder }));
  }

  return newOrder;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    if (!error) return true;
  }

  const current = getLocal<Order[]>(LOCAL_STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  const updated = current.map((o) => (o.id === orderId ? { ...o, status, updated_at: new Date().toISOString() } : o));
  setLocal(LOCAL_STORAGE_KEYS.ORDERS, updated);
  return true;
}

export async function findOrderByQuery(query: string): Promise<Order | null> {
  const clean = query.trim().toLowerCase();
  const all = await getOrders();
  return (
    all.find(
      (o) =>
        o.order_number.toLowerCase() === clean ||
        o.customer_phone.replace(/\s+/g, '').includes(clean.replace(/\s+/g, ''))
    ) || null
  );
}
