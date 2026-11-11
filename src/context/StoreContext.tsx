import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  Category,
  Banner,
  StoreSettings,
  Review,
  Coupon,
  Order,
  ContactMessage,
} from '../types/database';
import {
  initialCategories,
  initialBanners,
  initialProducts,
  initialStoreSettings,
} from '../data/initialData';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  banners: Banner[];
  storeSettings: StoreSettings;
  reviews: Review[];
  coupons: Coupon[];
  isLoading: boolean;
  refreshStoreData: () => Promise<void>;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductsByCategory: (categoryId: string) => Product[];
  getBannerBySlot: (slot: 'banner_principal' | 'banner_beleza' | 'banner_casa') => Banner | undefined;
  submitReview: (productId: string, name: string, rating: number, comment: string) => Promise<{ success: boolean; message: string }>;
  submitContactMessage: (data: Omit<ContactMessage, 'id' | 'status' | 'created_at'>) => Promise<{ success: boolean; message: string }>;
  subscribeNewsletter: (email: string) => Promise<{ success: boolean; message: string }>;
  // Customer Session
  customerUser: { id: string; email: string; name: string } | null;
  customerOrders: Order[];
  loginCustomer: (email: string) => Promise<boolean>;
  logoutCustomer: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_PRODUCTS_KEY = 'casa_beleza_products_v1';
const LOCAL_CATEGORIES_KEY = 'casa_beleza_categories_v1';
const LOCAL_BANNERS_KEY = 'casa_beleza_banners_v1';
const LOCAL_SETTINGS_KEY = 'casa_beleza_settings_v1';
const LOCAL_REVIEWS_KEY = 'casa_beleza_reviews_v1';
const LOCAL_COUPONS_KEY = 'casa_beleza_coupons_v1';
const LOCAL_CUSTOMER_KEY = 'casa_beleza_customer_v1';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_PRODUCTS_KEY);
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_CATEGORIES_KEY);
      return saved ? JSON.parse(saved) : initialCategories;
    } catch {
      return initialCategories;
    }
  });

  const [banners, setBanners] = useState<Banner[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_BANNERS_KEY);
      return saved ? JSON.parse(saved) : initialBanners;
    } catch {
      return initialBanners;
    }
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_SETTINGS_KEY);
      return saved ? JSON.parse(saved) : initialStoreSettings;
    } catch {
      return initialStoreSettings;
    }
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_REVIEWS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_COUPONS_KEY);
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

  const [customerUser, setCustomerUser] = useState<{ id: string; email: string; name: string } | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_CUSTOMER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(categories));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_BANNERS_KEY, JSON.stringify(banners));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [banners]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(storeSettings));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [storeSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(reviews));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [reviews]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_COUPONS_KEY, JSON.stringify(coupons));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [coupons]);

  useEffect(() => {
    try {
      if (customerUser) {
        localStorage.setItem(LOCAL_CUSTOMER_KEY, JSON.stringify(customerUser));
      } else {
        localStorage.removeItem(LOCAL_CUSTOMER_KEY);
      }
    } catch (e) {
      console.warn('Customer storage error', e);
    }
  }, [customerUser]);

  // Load live data from Supabase if configured
  const refreshStoreData = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;
    setIsLoading(true);

    try {
      // 1. Fetch active categories
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (catData && catData.length > 0) {
        setCategories(catData);
      }

      // 2. Fetch active products
      const { data: prodData } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (prodData && prodData.length > 0) {
        setProducts(prodData);
      }

      // 3. Fetch active banners
      const { data: bannerData } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (bannerData && bannerData.length > 0) {
        setBanners(bannerData);
      }

      // 4. Fetch store settings
      const { data: settingsData } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (settingsData) {
        setStoreSettings(settingsData);
      }

      // 5. Fetch approved reviews
      const { data: reviewData } = await supabase
        .from('reviews')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (reviewData) {
        setReviews(reviewData);
      }

      // 6. Fetch active coupons
      const { data: couponData } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true);

      if (couponData && couponData.length > 0) {
        setCoupons(couponData);
      }
    } catch (err) {
      console.error('Error fetching Supabase store data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStoreData();
  }, [refreshStoreData]);

  const getProductBySlug = (slug: string) => {
    return products.find((p) => p.slug === slug);
  };

  const getProductsByCategory = (categoryId: string) => {
    return products.filter((p) => p.category_id === categoryId);
  };

  const getBannerBySlot = (slot: 'banner_principal' | 'banner_beleza' | 'banner_casa') => {
    return banners.find((b) => b.slot_key === slot && b.is_active);
  };

  const submitReview = async (productId: string, name: string, rating: number, comment: string) => {
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      product_id: productId,
      customer_name: name,
      rating,
      comment,
      status: 'pending', // Starts pending per Requirement 26
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('reviews').insert({
        product_id: productId,
        customer_name: name,
        rating,
        comment,
        status: 'pending',
      });
      if (error) {
        return { success: false, message: 'Erro ao enviar avaliação: ' + error.message };
      }
    }

    // Also store locally for admin moderation view
    setReviews((prev) => [newReview, ...prev]);
    return {
      success: true,
      message: 'Sua avaliação foi enviada com sucesso e está aguardando moderação!',
    };
  };

  const submitContactMessage = async (data: Omit<ContactMessage, 'id' | 'status' | 'created_at'>) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('contact_messages').insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        status: 'unread',
      });
      if (error) {
        return { success: false, message: 'Erro ao enviar mensagem: ' + error.message };
      }
    }
    return {
      success: true,
      message: 'Mensagem recebida com sucesso! Nossa equipe entrará em contato em breve.',
    };
  };

  const subscribeNewsletter = async (email: string) => {
    if (!email || !email.includes('@')) {
      return { success: false, message: 'Por favor, insira um e-mail válido.' };
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('newsletter_subscribers').insert({ email });
      if (error && !error.message.includes('unique')) {
        return { success: false, message: 'Erro ao cadastrar e-mail.' };
      }
    }

    return {
      success: true,
      message: 'Parabéns! Você se inscreveu com sucesso para receber ofertas e cupons exclusivos.',
    };
  };

  const loginCustomer = async (email: string) => {
    const mockUser = {
      id: 'cust-' + Math.random().toString(36).substring(2, 9),
      email: email.trim().toLowerCase(),
      name: email.split('@')[0],
    };
    setCustomerUser(mockUser);
    return true;
  };

  const logoutCustomer = () => {
    setCustomerUser(null);
    setCustomerOrders([]);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        banners,
        storeSettings,
        reviews,
        coupons,
        isLoading,
        refreshStoreData,
        getProductBySlug,
        getProductsByCategory,
        getBannerBySlot,
        submitReview,
        submitContactMessage,
        subscribeNewsletter,
        customerUser,
        customerOrders,
        loginCustomer,
        logoutCustomer,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
