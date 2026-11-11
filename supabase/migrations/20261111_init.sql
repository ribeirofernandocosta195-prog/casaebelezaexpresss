-- ==============================================================================
-- CASA & BELEZA EXPRESS - SUPABASE POSTGRESQL DATABASE INITIAL MIGRATION
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  cpf VARCHAR(14),
  phone VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. ADMIN USERS (Protected administrators table)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'manager')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. PRODUCTS (Strictly with 6 distinct image URL fields)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sku VARCHAR(64) UNIQUE,
  description TEXT NOT NULL,
  short_description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory TEXT,
  brand TEXT DEFAULT 'Casa & Beleza',
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  promotional_price DECIMAL(10,2) CHECK (promotional_price IS NULL OR promotional_price >= 0),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  weight_kg DECIMAL(6,3) DEFAULT 0.300,
  dimensions_cm JSONB DEFAULT '{"width": 15, "height": 10, "length": 20}'::jsonb,
  -- 6 Distinct Image URLs
  image_url_1 TEXT NOT NULL, -- Imagem 1: Principal
  image_url_2 TEXT,          -- Imagem 2: Adicional
  image_url_3 TEXT,          -- Imagem 3: Adicional
  image_url_4 TEXT,          -- Imagem 4: Adicional
  image_url_5 TEXT,          -- Imagem 5: Adicional
  image_url_6 TEXT,          -- Imagem 6: Adicional
  variations JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_on_sale BOOLEAN NOT NULL DEFAULT false,
  free_shipping BOOLEAN NOT NULL DEFAULT false,
  sales_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. BANNERS (3 Independent Banners: Principal, Beleza, Casa)
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_key TEXT NOT NULL UNIQUE CHECK (slot_key IN ('banner_principal', 'banner_beleza', 'banner_casa')),
  title TEXT NOT NULL,
  subtitle TEXT,
  button_text TEXT DEFAULT 'Ver Coleção',
  target_url TEXT DEFAULT '/catalogo',
  image_url_desktop TEXT NOT NULL,
  image_url_mobile TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. CUSTOMERS (Public customer directory / checkout records)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  cpf VARCHAR(14) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  cep VARCHAR(9) NOT NULL,
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state VARCHAR(2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE RESTRICT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Customer snapshot
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_cpf VARCHAR(14) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  shipping_address JSONB NOT NULL,
  
  -- Calculations (strictly controlled by backend)
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (shipping_amount >= 0),
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  coupon_code TEXT,
  
  -- Status fields: Strictly separated
  financial_status TEXT NOT NULL DEFAULT 'Aguardando pagamento' 
    CHECK (financial_status IN ('Aguardando pagamento', 'Pago', 'Falhou', 'Cancelado', 'Expirado', 'Reembolsado')),
  logistic_status TEXT NOT NULL DEFAULT 'Aguardando separação'
    CHECK (logistic_status IN ('Aguardando separação', 'Em preparação', 'Enviado', 'Em trânsito', 'Entregue', 'Cancelado')),
  
  tracking_code TEXT,
  pix_tx_id TEXT,
  pix_qr_code_text TEXT,
  pix_qr_code_base64 TEXT,
  pix_expires_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  product_image TEXT NOT NULL,
  product_sku TEXT,
  variation_title TEXT,
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  quantity INT NOT NULL CHECK (quantity > 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. STORE SETTINGS
CREATE TABLE IF NOT EXISTS public.store_settings (
  id INT PRIMARY KEY DEFAULT 1,
  store_name TEXT NOT NULL DEFAULT 'Casa & Beleza Express',
  logo_url TEXT,
  email TEXT NOT NULL DEFAULT 'contato@casabelezexpress.com.br',
  whatsapp TEXT NOT NULL DEFAULT '11999998888',
  phone TEXT DEFAULT '(11) 4002-8922',
  cnpj VARCHAR(18) DEFAULT '00.000.000/0001-00',
  address TEXT DEFAULT 'São Paulo, SP - Brasil',
  instagram_url TEXT DEFAULT 'https://instagram.com/casabelezexpress',
  facebook_url TEXT DEFAULT 'https://facebook.com/casabelezexpress',
  announcement_bar_text TEXT DEFAULT '🌸 Frete Grátis nas compras acima de R$ 199 | Pague com Pix com 5% OFF',
  is_announcement_bar_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. PAYMENT SETTINGS (Nexum Pay credentials encrypted)
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id INT PRIMARY KEY DEFAULT 1,
  provider TEXT NOT NULL DEFAULT 'nexum_pay',
  is_active BOOLEAN NOT NULL DEFAULT false,
  encrypted_chat_id TEXT,
  encrypted_credential TEXT,
  webhook_secret_token TEXT,
  test_mode BOOLEAN NOT NULL DEFAULT false,
  last_validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. PAYMENT TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  tx_id TEXT NOT NULL UNIQUE,
  external_reference TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  amount_paid DECIMAL(10,2) CHECK (amount_paid >= 0),
  amount_net DECIMAL(10,2) CHECK (amount_net >= 0),
  raw_status TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'nexum_pay',
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. PAYMENT WEBHOOK EVENTS (For Idempotency)
CREATE TABLE IF NOT EXISTS public.payment_webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT NOT NULL UNIQUE,
  tx_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_status TEXT NOT NULL DEFAULT 'processed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
  min_order_value DECIMAL(10,2) DEFAULT 0 CHECK (min_order_value >= 0),
  max_uses INT,
  times_used INT NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. CONTACT MESSAGES
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 16. NEWSLETTER SUBSCRIBERS
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 17. SHIPPING SETTINGS
CREATE TABLE IF NOT EXISTS public.shipping_settings (
  id INT PRIMARY KEY DEFAULT 1,
  free_shipping_min_order DECIMAL(10,2) DEFAULT 199.00,
  fixed_shipping_rate DECIMAL(10,2) DEFAULT 19.90,
  express_shipping_rate DECIMAL(10,2) DEFAULT 29.90,
  estimated_days_standard INT DEFAULT 6,
  estimated_days_express INT DEFAULT 3,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 18. STOCK RESERVATIONS (Atomic concurrency protection)
CREATE TABLE IF NOT EXISTS public.stock_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  status TEXT NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'converted', 'released')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE & SAFETY
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active_featured ON public.products(is_active, is_featured);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_pix_tx ON public.orders(pix_tx_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_approved ON public.reviews(product_id, status);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_stock_res_expires ON public.stock_reservations(expires_at, status);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_reservations ENABLE ROW LEVEL SECURITY;

-- Helper SQL function to check if current authenticated user is an authorized admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid() AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS: Products
CREATE POLICY "Public can view active products" ON public.products
  FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins full manage products" ON public.products
  FOR ALL USING (public.is_admin());

-- RLS: Categories
CREATE POLICY "Public can view active categories" ON public.categories
  FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins full manage categories" ON public.categories
  FOR ALL USING (public.is_admin());

-- RLS: Banners
CREATE POLICY "Public can view active banners" ON public.banners
  FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins full manage banners" ON public.banners
  FOR ALL USING (public.is_admin());

-- RLS: Reviews
CREATE POLICY "Public can view approved reviews" ON public.reviews
  FOR SELECT USING (status = 'approved' OR public.is_admin());

CREATE POLICY "Anyone can submit review" ON public.reviews
  FOR INSERT WITH CHECK (status = 'pending');

CREATE POLICY "Admins manage reviews" ON public.reviews
  FOR ALL USING (public.is_admin());

-- RLS: Orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Notice: Orders cannot be inserted/updated arbitrarily by clients - handled by server role or admin
CREATE POLICY "Admins full manage orders" ON public.orders
  FOR ALL USING (public.is_admin());

-- RLS: Order Items
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );

-- RLS: Store Settings & Shipping Settings
CREATE POLICY "Public read store settings" ON public.store_settings
  FOR SELECT USING (true);

CREATE POLICY "Admin update store settings" ON public.store_settings
  FOR ALL USING (public.is_admin());

CREATE POLICY "Public read shipping settings" ON public.shipping_settings
  FOR SELECT USING (true);

CREATE POLICY "Admin update shipping settings" ON public.shipping_settings
  FOR ALL USING (public.is_admin());

-- RLS: Payment Settings - Strictly admins only
CREATE POLICY "Admins only payment settings" ON public.payment_settings
  FOR ALL USING (public.is_admin());

-- RLS: Contact Messages
CREATE POLICY "Public can insert contact message" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view and manage contact messages" ON public.contact_messages
  FOR ALL USING (public.is_admin());

-- RLS: Newsletter
CREATE POLICY "Public can subscribe to newsletter" ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view newsletter subscribers" ON public.newsletter_subscribers
  FOR SELECT USING (public.is_admin());
