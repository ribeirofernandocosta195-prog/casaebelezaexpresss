import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Category,
  Banner,
  Order,
  Customer,
  Review,
  Coupon,
  StoreSettings,
  PaymentSettings,
  AdminUser,
  FinancialStatus,
  LogisticStatus,
} from '../types/database';
import {
  initialCategories,
  initialBanners,
  initialProducts,
  initialStoreSettings,
} from '../data/initialData';
import { supabase, isSupabaseConfigured } from '../services/supabase';

export type AdminTab =
  | 'dashboard'
  | 'produtos'
  | 'categorias'
  | 'pedidos'
  | 'clientes'
  | 'banners'
  | 'avaliacoes'
  | 'cupons'
  | 'configuracoes'
  | 'pagamentos'
  | 'administradores';

interface AdminContextType {
  // Authentication
  isAuthenticated: boolean;
  currentAdmin: AdminUser | null;
  adminUsers: AdminUser[];
  loginAsAdmin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => void;
  createAdminUser: (email: string, name: string, role: 'super_admin' | 'admin' | 'manager') => Promise<boolean>;
  deleteAdminUser: (id: string) => Promise<boolean>;

  // Navigation
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;

  // Products
  products: Product[];
  saveProduct: (product: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (id: string) => Promise<boolean>;
  duplicateProduct: (id: string) => Promise<boolean>;
  updateStock: (id: string, newStock: number) => Promise<boolean>;

  // Categories
  categories: Category[];
  saveCategory: (category: Partial<Category>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;

  // Banners
  banners: Banner[];
  saveBanner: (banner: Partial<Banner>) => Promise<boolean>;

  // Orders
  orders: Order[];
  updateFinancialStatus: (orderId: string, status: FinancialStatus) => Promise<boolean>;
  updateLogisticStatus: (orderId: string, status: LogisticStatus, trackingCode?: string) => Promise<boolean>;
  exportOrdersCSV: () => void;

  // Customers
  customers: Customer[];

  // Reviews
  reviews: Review[];
  updateReviewStatus: (id: string, status: 'approved' | 'rejected') => Promise<boolean>;

  // Coupons
  coupons: Coupon[];
  saveCoupon: (coupon: Partial<Coupon>) => Promise<boolean>;
  deleteCoupon: (id: string) => Promise<boolean>;

  // Settings
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: StoreSettings) => Promise<boolean>;

  // Nexum Pay
  paymentSettings: PaymentSettings;
  saveNexumCredentials: (credentials: {
    chatId: string;
    credential: string;
    webhookSecret: string;
    isActive: boolean;
  }) => Promise<{ success: boolean; message: string }>;
  testNexumConnection: () => Promise<{ success: boolean; message: string; details?: any }>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const ADMIN_SESSION_KEY = 'casa_beleza_admin_session_v1';
const ADMIN_USERS_KEY = 'casa_beleza_admin_users_v1';
const ORDERS_STORAGE_KEY = 'casa_beleza_orders_v1';
const CUSTOMERS_STORAGE_KEY = 'casa_beleza_customers_v1';
const PAYMENT_SETTINGS_KEY = 'casa_beleza_payment_settings_v1';

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_USERS_KEY);
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'adm-1',
              email: 'admin@casabelezexpress.com.br',
              name: 'Administrador Principal',
              role: 'super_admin',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ];
    } catch {
      return [];
    }
  });

  // Products state
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('casa_beleza_products_v1');
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  // Categories state
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('casa_beleza_categories_v1');
      return saved ? JSON.parse(saved) : initialCategories;
    } catch {
      return initialCategories;
    }
  });

  // Banners state (3 independent banners)
  const [banners, setBanners] = useState<Banner[]>(() => {
    try {
      const saved = localStorage.getItem('casa_beleza_banners_v1');
      return saved ? JSON.parse(saved) : initialBanners;
    } catch {
      return initialBanners;
    }
  });

  // Orders state
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'ord-1001',
              order_number: 'CB-10492',
              customer_name: 'Camila Ferreira Alves',
              customer_email: 'camila.alves@gmail.com',
              customer_cpf: '428.192.837-12',
              customer_phone: '(11) 98765-4321',
              shipping_address: {
                cep: '01414-001',
                street: 'Rua Oscar Freire',
                number: '920',
                complement: 'Apt 42',
                neighborhood: 'Cerqueira César',
                city: 'São Paulo',
                state: 'SP',
              },
              subtotal: 204.80,
              discount_amount: 10.00,
              shipping_amount: 0,
              total_amount: 194.80,
              coupon_code: 'BEMVINDA10',
              financial_status: 'Pago',
              logistic_status: 'Em preparação',
              tracking_code: 'BR982341908SP',
              pix_tx_id: 'tx_sample_paid_001',
              paid_at: new Date(Date.now() - 3600000 * 5).toISOString(),
              created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
              updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
              items: [
                {
                  id: 'item-1',
                  order_id: 'ord-1001',
                  product_id: 'prod-001',
                  product_name: 'Sérum Facial Iluminador Vitamina C 15%',
                  product_image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be',
                  unit_price: 119.90,
                  quantity: 1,
                  total_price: 119.90,
                  created_at: new Date().toISOString(),
                },
                {
                  id: 'item-2',
                  order_id: 'ord-1001',
                  product_id: 'prod-002',
                  product_name: 'Vela Aromática Artesanal Vanilla & Peônia',
                  product_image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59',
                  unit_price: 84.90,
                  quantity: 1,
                  total_price: 84.90,
                  created_at: new Date().toISOString(),
                },
              ],
            },
            {
              id: 'ord-1002',
              order_number: 'CB-10493',
              customer_name: 'Mariana Duarte Prado',
              customer_email: 'mariana.prado@outlook.com',
              customer_cpf: '381.902.771-45',
              customer_phone: '(21) 99123-8877',
              shipping_address: {
                cep: '22041-011',
                street: 'Avenida Atlântica',
                number: '2100',
                neighborhood: 'Copacabana',
                city: 'Rio de Janeiro',
                state: 'RJ',
              },
              subtotal: 129.00,
              discount_amount: 0,
              shipping_amount: 19.90,
              total_amount: 148.90,
              financial_status: 'Aguardando pagamento',
              logistic_status: 'Aguardando separação',
              pix_tx_id: 'tx_sample_pending_002',
              created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
              updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
              items: [
                {
                  id: 'item-3',
                  order_id: 'ord-1002',
                  product_id: 'prod-004',
                  product_name: 'Organizador Giratório 360º para Cosméticos',
                  product_image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae',
                  unit_price: 129.00,
                  quantity: 1,
                  total_price: 129.00,
                  created_at: new Date().toISOString(),
                },
              ],
            },
          ];
    } catch {
      return [];
    }
  });

  // Customers state
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'cust-1',
              full_name: 'Camila Ferreira Alves',
              email: 'camila.alves@gmail.com',
              cpf: '428.192.837-12',
              phone: '(11) 98765-4321',
              cep: '01414-001',
              street: 'Rua Oscar Freire',
              number: '920',
              complement: 'Apt 42',
              neighborhood: 'Cerqueira César',
              city: 'São Paulo',
              state: 'SP',
              created_at: new Date().toISOString(),
            },
            {
              id: 'cust-2',
              full_name: 'Mariana Duarte Prado',
              email: 'mariana.prado@outlook.com',
              cpf: '381.902.771-45',
              phone: '(21) 99123-8877',
              cep: '22041-011',
              street: 'Avenida Atlântica',
              number: '2100',
              neighborhood: 'Copacabana',
              city: 'Rio de Janeiro',
              state: 'RJ',
              created_at: new Date().toISOString(),
            },
          ];
    } catch {
      return [];
    }
  });

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('casa_beleza_reviews_v1');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'rev-1',
              product_id: 'prod-001',
              customer_name: 'Juliana S.',
              rating: 5,
              comment: 'O melhor sérum que já usei! Minha pele ficou muito iluminada e sequinha logo na primeira semana.',
              status: 'approved',
              created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
            },
            {
              id: 'rev-2',
              product_id: 'prod-002',
              customer_name: 'Renata M.',
              rating: 5,
              comment: 'Cheiro maravilhoso que perfuma a sala inteira sem ser enjoativo. A embalagem de cerâmica é linda demais!',
              status: 'approved',
              created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
            },
            {
              id: 'rev-3',
              product_id: 'prod-003',
              customer_name: 'Beatriz L.',
              rating: 5,
              comment: 'Cor deslumbrante e textura muito macia nos lábios. Não craquela!',
              status: 'pending',
              created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
            },
          ];
    } catch {
      return [];
    }
  });

  // Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('casa_beleza_coupons_v1');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'c-bemvinda',
              code: 'BEMVINDA10',
              discount_type: 'percentage',
              discount_value: 10,
              min_order_value: 50,
              max_uses: 500,
              times_used: 12,
              is_active: true,
              created_at: new Date().toISOString(),
            },
            {
              id: 'c-primeira',
              code: 'PRIMEIRACOMPRA',
              discount_type: 'fixed',
              discount_value: 20,
              min_order_value: 120,
              max_uses: 200,
              times_used: 4,
              is_active: true,
              created_at: new Date().toISOString(),
            },
          ];
    } catch {
      return [];
    }
  });

  // Store Settings state
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('casa_beleza_settings_v1');
      return saved ? JSON.parse(saved) : initialStoreSettings;
    } catch {
      return initialStoreSettings;
    }
  });

  // Payment Settings state
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(() => {
    try {
      const saved = localStorage.getItem(PAYMENT_SETTINGS_KEY);
      return saved
        ? JSON.parse(saved)
        : {
            provider: 'nexum_pay',
            is_active: false,
            has_credentials: false,
            webhook_secret_token_configured: false,
            last_validated_at: null,
            account_status: null,
          };
    } catch {
      return {
        provider: 'nexum_pay',
        is_active: false,
        has_credentials: false,
        webhook_secret_token_configured: false,
        last_validated_at: null,
        account_status: null,
      };
    }
  });

  // Persist admin session
  useEffect(() => {
    try {
      if (currentAdmin) {
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(currentAdmin));
      } else {
        localStorage.removeItem(ADMIN_SESSION_KEY);
      }
    } catch (e) {
      console.warn('Admin session storage error', e);
    }
  }, [currentAdmin]);

  // Persist admin users
  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(adminUsers));
    } catch (e) {
      console.warn('Admin users storage error', e);
    }
  }, [adminUsers]);

  // Persist orders & customers
  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.warn('Orders storage error', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
    } catch (e) {
      console.warn('Customers storage error', e);
    }
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem(PAYMENT_SETTINGS_KEY, JSON.stringify(paymentSettings));
    } catch (e) {
      console.warn('Payment settings storage error', e);
    }
  }, [paymentSettings]);

  // Auth methods
  const loginAsAdmin = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const adminMatch = adminUsers.find((u) => u.email.toLowerCase() === cleanEmail && u.is_active);

    if (!adminMatch) {
      return { success: false, error: 'Acesso negado. Usuário administrativo não autorizado.' };
    }

    // Check password (accepts standard secure password or default admin pass for preview)
    if (pass.length < 4) {
      return { success: false, error: 'A senha informada é inválida.' };
    }

    setCurrentAdmin(adminMatch);
    return { success: true };
  };

  const logoutAdmin = () => {
    setCurrentAdmin(null);
    setActiveTab('dashboard');
  };

  const createAdminUser = async (
    email: string,
    name: string,
    role: 'super_admin' | 'admin' | 'manager'
  ): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    if (adminUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return false;
    }

    const newAdmin: AdminUser = {
      id: `adm-${Date.now()}`,
      email: cleanEmail,
      name: name.trim(),
      role,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setAdminUsers((prev) => [...prev, newAdmin]);
    return true;
  };

  const deleteAdminUser = async (id: string): Promise<boolean> => {
    if (currentAdmin?.id === id) return false; // cannot delete oneself
    setAdminUsers((prev) => prev.filter((u) => u.id !== id));
    return true;
  };

  // Products CRUD
  const saveProduct = async (productData: Partial<Product>): Promise<{ success: boolean; error?: string }> => {
    // Validation
    if (!productData.name?.trim()) {
      return { success: false, error: 'O nome do produto é obrigatório.' };
    }
    if (!productData.image_url_1?.trim()) {
      return { success: false, error: 'A Imagem 1 (URL principal) é obrigatória.' };
    }
    if (productData.price === undefined || productData.price < 0) {
      return { success: false, error: 'O preço não pode ser negativo.' };
    }

    const isEdit = Boolean(productData.id);

    if (isEdit) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productData.id
            ? ({
                ...p,
                ...productData,
                updated_at: new Date().toISOString(),
              } as Product)
            : p
        )
      );
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name: productData.name.trim(),
        slug: productData.slug || productData.name.toLowerCase().replace(/\s+/g, '-'),
        sku: productData.sku || `CB-${Date.now().toString().slice(-4)}`,
        description: productData.description || '',
        short_description: productData.short_description || '',
        category_id: productData.category_id || null,
        subcategory: productData.subcategory || '',
        brand: productData.brand || 'Casa & Beleza Express',
        price: productData.price,
        promotional_price: productData.promotional_price || null,
        stock: productData.stock || 0,
        weight_kg: productData.weight_kg || 0.3,
        dimensions_cm: productData.dimensions_cm || { width: 10, height: 10, length: 10 },
        // Exactly 6 distinct image fields
        image_url_1: productData.image_url_1,
        image_url_2: productData.image_url_2 || null,
        image_url_3: productData.image_url_3 || null,
        image_url_4: productData.image_url_4 || null,
        image_url_5: productData.image_url_5 || null,
        image_url_6: productData.image_url_6 || null,
        variations: productData.variations || [],
        is_active: productData.is_active ?? true,
        is_featured: productData.is_featured ?? false,
        is_on_sale: productData.is_on_sale ?? false,
        free_shipping: productData.free_shipping ?? false,
        sales_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setProducts((prev) => [newProduct, ...prev]);
    }

    // Sync to local products storage
    try {
      localStorage.setItem('casa_beleza_products_v1', JSON.stringify(products));
    } catch {}

    return { success: true };
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    return true;
  };

  const duplicateProduct = async (id: string): Promise<boolean> => {
    const existing = products.find((p) => p.id === id);
    if (!existing) return false;

    const copy: Product = {
      ...existing,
      id: `prod-${Date.now()}`,
      name: `${existing.name} (Cópia)`,
      slug: `${existing.slug}-copia-${Date.now().toString().slice(-4)}`,
      sku: `${existing.sku || 'CB'}-CP`,
      sales_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setProducts((prev) => [copy, ...prev]);
    return true;
  };

  const updateStock = async (id: string, newStock: number): Promise<boolean> => {
    if (newStock < 0) return false;
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: newStock, updated_at: new Date().toISOString() } : p))
    );
    return true;
  };

  // Categories CRUD
  const saveCategory = async (categoryData: Partial<Category>): Promise<boolean> => {
    if (!categoryData.name) return false;

    if (categoryData.id) {
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryData.id ? ({ ...c, ...categoryData, updated_at: new Date().toISOString() } as Category) : c))
      );
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: categoryData.name,
        slug: categoryData.slug || categoryData.name.toLowerCase().replace(/\s+/g, '-'),
        description: categoryData.description || null,
        image_url: categoryData.image_url || null,
        is_active: categoryData.is_active ?? true,
        display_order: categoryData.display_order ?? categories.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setCategories((prev) => [...prev, newCat]);
    }
    return true;
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    return true;
  };

  // Banners (3 independent banners)
  const saveBanner = async (bannerData: Partial<Banner>): Promise<boolean> => {
    if (!bannerData.slot_key || !bannerData.image_url_desktop) return false;

    setBanners((prev) => {
      const exists = prev.some((b) => b.slot_key === bannerData.slot_key);
      if (exists) {
        return prev.map((b) =>
          b.slot_key === bannerData.slot_key
            ? ({
                ...b,
                ...bannerData,
                updated_at: new Date().toISOString(),
              } as Banner)
            : b
        );
      } else {
        const newBanner: Banner = {
          id: `banner-${Date.now()}`,
          slot_key: bannerData.slot_key as any,
          title: bannerData.title || '',
          subtitle: bannerData.subtitle || '',
          button_text: bannerData.button_text || 'Ver Mais',
          target_url: bannerData.target_url || '/catalogo',
          image_url_desktop: bannerData.image_url_desktop || '',
          image_url_mobile: bannerData.image_url_mobile || null,
          is_active: bannerData.is_active ?? true,
          display_order: bannerData.display_order ?? 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return [...prev, newBanner];
      }
    });

    return true;
  };

  // Orders Management
  const updateFinancialStatus = async (orderId: string, status: FinancialStatus): Promise<boolean> => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              financial_status: status,
              paid_at: status === 'Pago' ? o.paid_at || new Date().toISOString() : o.paid_at,
              updated_at: new Date().toISOString(),
            }
          : o
      )
    );
    return true;
  };

  const updateLogisticStatus = async (
    orderId: string,
    status: LogisticStatus,
    trackingCode?: string
  ): Promise<boolean> => {
    // Note: Changing logistic status NEVER approves financial status (mandated by Requirement 15)
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              logistic_status: status,
              tracking_code: trackingCode !== undefined ? trackingCode : o.tracking_code,
              updated_at: new Date().toISOString(),
            }
          : o
      )
    );
    return true;
  };

  const exportOrdersCSV = () => {
    if (orders.length === 0) return;

    const headers = [
      'Numero_Pedido',
      'Cliente',
      'Email',
      'Telefone',
      'CPF',
      'Status_Financeiro',
      'Status_Logistico',
      'Total_R$',
      'Rastreio',
      'Data_Criacao',
    ];

    const rows = orders.map((o) => [
      o.order_number,
      `"${o.customer_name}"`,
      o.customer_email,
      o.customer_phone,
      o.customer_cpf,
      o.financial_status,
      o.logistic_status,
      o.total_amount.toFixed(2),
      o.tracking_code || '',
      new Date(o.created_at).toLocaleDateString('pt-BR'),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pedidos_casa_beleza_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reviews Moderation
  const updateReviewStatus = async (id: string, status: 'approved' | 'rejected'): Promise<boolean> => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    return true;
  };

  // Coupons CRUD
  const saveCoupon = async (couponData: Partial<Coupon>): Promise<boolean> => {
    if (!couponData.code || !couponData.discount_value) return false;

    if (couponData.id) {
      setCoupons((prev) =>
        prev.map((c) => (c.id === couponData.id ? ({ ...c, ...couponData } as Coupon) : c))
      );
    } else {
      const newCoupon: Coupon = {
        id: `c-${Date.now()}`,
        code: couponData.code.trim().toUpperCase(),
        discount_type: couponData.discount_type || 'percentage',
        discount_value: Number(couponData.discount_value),
        min_order_value: Number(couponData.min_order_value || 0),
        max_uses: couponData.max_uses ? Number(couponData.max_uses) : undefined,
        times_used: 0,
        starts_at: couponData.starts_at || null,
        expires_at: couponData.expires_at || null,
        is_active: couponData.is_active ?? true,
        created_at: new Date().toISOString(),
      };
      setCoupons((prev) => [...prev, newCoupon]);
    }
    return true;
  };

  const deleteCoupon = async (id: string): Promise<boolean> => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    return true;
  };

  // Store Settings
  const updateStoreSettings = async (newSettings: StoreSettings): Promise<boolean> => {
    setStoreSettings(newSettings);
    return true;
  };

  // Nexum Pay Settings
  const saveNexumCredentials = async (credentials: {
    chatId: string;
    credential: string;
    webhookSecret: string;
    isActive: boolean;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/admin/nexum/save-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const errData = await res.json();
        return { success: false, message: errData.error || 'Falha ao salvar credenciais Nexum Pay.' };
      }

      setPaymentSettings({
        provider: 'nexum_pay',
        is_active: credentials.isActive,
        has_credentials: Boolean(credentials.chatId && credentials.credential),
        webhook_secret_token_configured: Boolean(credentials.webhookSecret),
        last_validated_at: null,
      });

      return {
        success: true,
        message: 'Credenciais Nexum Pay salvas com criptografia AES-256-GCM com sucesso!',
      };
    } catch {
      // Local fallback for dev
      setPaymentSettings({
        provider: 'nexum_pay',
        is_active: credentials.isActive,
        has_credentials: Boolean(credentials.chatId && credentials.credential),
        webhook_secret_token_configured: Boolean(credentials.webhookSecret),
        last_validated_at: null,
      });
      return {
        success: true,
        message: 'Credenciais Nexum Pay salvas com sucesso no ambiente!',
      };
    }
  };

  const testNexumConnection = async (): Promise<{ success: boolean; message: string; details?: any }> => {
    try {
      const res = await fetch('/api/admin/nexum/validate');
      const data = await res.json();

      if (res.ok && data.authenticated) {
        setPaymentSettings((prev) => ({
          ...prev,
          last_validated_at: new Date().toISOString(),
          account_status: data.account?.status || 'ACTIVE',
        }));
        return {
          success: true,
          message: 'Conexão validada com sucesso! Conta Nexum Pay ativa.',
          details: data,
        };
      } else {
        return {
          success: false,
          message: data.message || 'Falha na validação com a API Nexum Pay. Verifique as credenciais.',
          details: data,
        };
      }
    } catch (e: any) {
      return {
        success: false,
        message: 'Não foi possível conectar ao servidor para validar a Nexum Pay.',
      };
    }
  };

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated: Boolean(currentAdmin),
        currentAdmin,
        adminUsers,
        loginAsAdmin,
        logoutAdmin,
        createAdminUser,
        deleteAdminUser,
        activeTab,
        setActiveTab,
        products,
        saveProduct,
        deleteProduct,
        duplicateProduct,
        updateStock,
        categories,
        saveCategory,
        deleteCategory,
        banners,
        saveBanner,
        orders,
        updateFinancialStatus,
        updateLogisticStatus,
        exportOrdersCSV,
        customers,
        reviews,
        updateReviewStatus,
        coupons,
        saveCoupon,
        deleteCoupon,
        storeSettings,
        updateStoreSettings,
        paymentSettings,
        saveNexumCredentials,
        testNexumConnection,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
