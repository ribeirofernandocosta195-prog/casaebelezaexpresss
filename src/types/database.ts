export type FinancialStatus =
  | 'Aguardando pagamento'
  | 'Pago'
  | 'Falhou'
  | 'Cancelado'
  | 'Expirado'
  | 'Reembolsado';

export type LogisticStatus =
  | 'Aguardando separação'
  | 'Em preparação'
  | 'Enviado'
  | 'Em trânsito'
  | 'Entregue'
  | 'Cancelado';

export interface AdminUser {
  id: string;
  user_id?: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'manager';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductVariation {
  id: string;
  name: string;
  options: string[]; // e.g. ["Rosa Suave", "Vermelho Rubi", "Nude Chic"] or ["100ml", "250ml"]
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  description: string;
  short_description?: string | null;
  category_id?: string | null;
  category?: Category | null;
  subcategory?: string | null;
  brand?: string;
  price: number;
  promotional_price?: number | null;
  stock: number;
  weight_kg?: number;
  dimensions_cm?: {
    width: number;
    height: number;
    length: number;
  };
  // Exactly 6 distinct image fields as mandated
  image_url_1: string; // Principal
  image_url_2?: string | null;
  image_url_3?: string | null;
  image_url_4?: string | null;
  image_url_5?: string | null;
  image_url_6?: string | null;
  variations?: ProductVariation[];
  is_active: boolean;
  is_featured: boolean;
  is_on_sale: boolean;
  free_shipping: boolean;
  sales_count: number;
  created_at: string;
  updated_at: string;
}

export interface Banner {
  id: string;
  slot_key: 'banner_principal' | 'banner_beleza' | 'banner_casa';
  title: string;
  subtitle?: string | null;
  button_text?: string | null;
  target_url?: string | null;
  image_url_desktop: string;
  image_url_mobile?: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  user_id?: string | null;
  full_name: string;
  email: string;
  cpf: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  product_sku?: string | null;
  variation_title?: string | null;
  unit_price: number;
  quantity: number;
  total_price: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  user_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_cpf: string;
  customer_phone: string;
  shipping_address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  total_amount: number;
  coupon_code?: string | null;
  financial_status: FinancialStatus;
  logistic_status: LogisticStatus;
  tracking_code?: string | null;
  pix_tx_id?: string | null;
  pix_qr_code_text?: string | null;
  pix_qr_code_base64?: string | null;
  pix_expires_at?: string | null;
  paid_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface StoreSettings {
  store_name: string;
  logo_url?: string;
  email: string;
  whatsapp: string;
  phone: string;
  cnpj: string;
  address: string;
  instagram_url: string;
  facebook_url: string;
  announcement_bar_text: string;
  is_announcement_bar_active: boolean;
}

export interface PaymentSettings {
  provider: 'nexum_pay';
  is_active: boolean;
  has_credentials: boolean; // safe boolean returned to frontend, never exposes secret
  webhook_secret_token_configured: boolean;
  last_validated_at?: string | null;
  account_status?: string | null;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value?: number;
  max_uses?: number;
  times_used: number;
  starts_at?: string | null;
  expires_at?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number; // 1 to 5
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: string;
}

export interface ShippingSettings {
  free_shipping_min_order: number;
  fixed_shipping_rate: number;
  express_shipping_rate: number;
  estimated_days_standard: number;
  estimated_days_express: number;
}
