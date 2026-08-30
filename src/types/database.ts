export type UnitType = 'kg' | 'piece' | 'pack';

export type OrderStatus = 'pending' | 'preparing' | 'on_way' | 'delivered' | 'cancelled';

export type PaymentMethod = 'cash_on_delivery' | 'card_on_delivery' | 'bank_transfer';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  name: string;
  description?: string;
  image_url?: string;
  unit_type: UnitType;
  base_price: number; // kg veya adet fiyatı
  default_weight?: number; // gram
  weight_options?: number[]; // [250, 500, 750, 1000]
  slice_options?: string[]; // ["Standart Dilim", "İnce Dilim", "Kalıp"]
  is_active: boolean;
  is_featured?: boolean;
  badge?: string | null;
  stock_status: 'in_stock' | 'out_of_stock';
  created_at?: string;
}

export interface DeliveryZone {
  id: string;
  district_name: string;
  neighborhood_name: string;
  min_order_amount: number;
  delivery_fee: number;
  estimated_time: string;
  is_active: boolean;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id?: string;
  product_name: string;
  unit_type: UnitType;
  selected_weight?: number; // örn 500g
  selected_slice?: string; // örn İnce Dilim
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  district_name: string;
  neighborhood_name: string;
  delivery_time_slot: string;
  payment_method: PaymentMethod;
  order_notes?: string;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  status: OrderStatus;
  items?: OrderItem[];
  created_at: string;
  updated_at?: string;
}

export interface StoreSettings {
  id?: string;
  store_name: string;
  store_phone: string;
  whatsapp_number: string;
  address: string;
  min_order_amount: number;
  is_open: boolean;
  announcement: string;
  estimated_delivery_time: string;
  opening_hours: string;
  iban_info?: string;
  admin_pin?: string;
}

export interface CartItem {
  product: Product;
  selectedWeight?: number; // gram cinsinden (eğer kg ise)
  selectedSlice?: string;
  quantity: number;
  calculatedPrice: number; // hesaplanan toplam kalem tutarı
}
