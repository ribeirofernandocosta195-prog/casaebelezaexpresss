import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Coupon } from '../types/database';
import { calculateOrderValues, ProductCatalogItem } from '../utils/orderCalculator';

export interface CartItem {
  id: string; // unique cart item key: `${productId}_${variationTitle || ''}`
  product: Product;
  quantity: number;
  variationTitle?: string;
}

export interface ShippingQuote {
  type: 'standard' | 'express';
  name: string;
  price: number;
  days: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, variationTitle?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItemsCount: number;
  appliedCoupon: Coupon | null;
  couponError: string | null;
  applyCouponCode: (code: string, availableCoupons: Coupon[]) => boolean;
  removeCoupon: () => void;
  shippingCep: string;
  setShippingCep: (cep: string) => void;
  selectedShipping: 'standard' | 'express';
  setSelectedShipping: (type: 'standard' | 'express') => void;
  shippingQuotes: ShippingQuote[];
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  isCalculatingShipping: boolean;
  calculateShippingByCep: (cep: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'casa_beleza_cart_v1';
const COUPON_STORAGE_KEY = 'casa_beleza_coupon_v1';
const CEP_STORAGE_KEY = 'casa_beleza_cep_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = localStorage.getItem(COUPON_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [couponError, setCouponError] = useState<string | null>(null);
  const [shippingCep, setShippingCep] = useState<string>(() => {
    try {
      return localStorage.getItem(CEP_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });

  const [selectedShipping, setSelectedShipping] = useState<'standard' | 'express'>('standard');
  const [isCalculatingShipping, setIsCalculatingShipping] = useState<boolean>(false);
  const [shippingQuotes, setShippingQuotes] = useState<ShippingQuote[]>([
    { type: 'standard', name: 'Entrega Padrão Express', price: 19.90, days: 5 },
    { type: 'express', name: 'Sedex Super Rápido', price: 29.90, days: 2 },
  ]);

  // Persist items
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  // Persist coupon
  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save coupon', e);
    }
  }, [appliedCoupon]);

  // Persist CEP
  useEffect(() => {
    try {
      localStorage.setItem(CEP_STORAGE_KEY, shippingCep);
    } catch (e) {
      console.error('Failed to save cep', e);
    }
  }, [shippingCep]);

  const totalItemsCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const addToCart = (product: Product, quantity = 1, variationTitle?: string) => {
    if (!product.is_active || product.stock <= 0) return;

    setItems((prevItems) => {
      const itemKey = `${product.id}_${variationTitle || ''}`;
      const existingIndex = prevItems.findIndex((it) => it.id === itemKey);

      if (existingIndex > -1) {
        const newQty = Math.min(prevItems[existingIndex].quantity + quantity, product.stock);
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        return updated;
      } else {
        const initialQty = Math.min(quantity, product.stock);
        return [
          ...prevItems,
          {
            id: itemKey,
            product,
            quantity: initialQty,
            variationTitle,
          },
        ];
      }
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((it) => it.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setItems((prev) =>
      prev.map((it) => {
        if (it.id === cartItemId) {
          const maxStock = it.product.stock;
          return {
            ...it,
            quantity: Math.min(quantity, maxStock),
          };
        }
        return it;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const applyCouponCode = (code: string, availableCoupons: Coupon[]): boolean => {
    const cleanCode = code.trim().toUpperCase();
    const found = availableCoupons.find((c) => c.code.toUpperCase() === cleanCode);

    if (!found) {
      setCouponError('Cupom inválido ou não encontrado.');
      return false;
    }

    if (!found.is_active) {
      setCouponError('Este cupom não está mais ativo.');
      return false;
    }

    // Check expiration
    if (found.expires_at && new Date(found.expires_at) < new Date()) {
      setCouponError('Este cupom já expirou.');
      return false;
    }

    setAppliedCoupon(found);
    setCouponError(null);
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const calculateShippingByCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setIsCalculatingShipping(true);
    try {
      // Query ViaCEP
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        // Adjust estimated days based on state
        const isSP = data.uf === 'SP';
        setShippingQuotes([
          {
            type: 'standard',
            name: 'Entrega Padrão Express',
            price: 19.90,
            days: isSP ? 3 : 6,
          },
          {
            type: 'express',
            name: 'Sedex Rápido',
            price: 29.90,
            days: isSP ? 1 : 3,
          },
        ]);
      }
    } catch (e) {
      console.warn('ViaCEP offline or failed, using defaults', e);
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  // Perform calculation
  const catalogMap = new Map<string, ProductCatalogItem>();
  for (const item of items) {
    catalogMap.set(item.product.id, {
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      promotionalPrice: item.product.promotional_price,
      stock: item.product.stock,
      isActive: item.product.is_active,
      freeShipping: item.product.free_shipping,
      imageUrl1: item.product.image_url_1,
    });
  }

  let subtotal = 0;
  let discountAmount = 0;
  let shippingAmount = 0;
  let totalAmount = 0;

  try {
    const result = calculateOrderValues(
      items.map((it) => ({
        productId: it.product.id,
        quantity: it.quantity,
        variationTitle: it.variationTitle,
      })),
      catalogMap,
      appliedCoupon
        ? {
            id: appliedCoupon.id,
            code: appliedCoupon.code,
            discountType: appliedCoupon.discount_type,
            discountValue: appliedCoupon.discount_value,
            minOrderValue: appliedCoupon.min_order_value,
            maxUses: appliedCoupon.max_uses,
            timesUsed: appliedCoupon.times_used,
            isActive: appliedCoupon.is_active,
            startsAt: appliedCoupon.starts_at || undefined,
            expiresAt: appliedCoupon.expires_at || undefined,
          }
        : null,
      selectedShipping
    );

    subtotal = result.subtotal;
    discountAmount = result.discountAmount;
    shippingAmount = result.shippingAmount;
    totalAmount = result.totalAmount;
  } catch (err) {
    // Basic fallback calculation if validation tripped
    subtotal = items.reduce((acc, it) => {
      const price =
        it.product.promotional_price && it.product.promotional_price < it.product.price
          ? it.product.promotional_price
          : it.product.price;
      return acc + price * it.quantity;
    }, 0);
    totalAmount = subtotal;
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItemsCount,
        appliedCoupon,
        couponError,
        applyCouponCode,
        removeCoupon,
        shippingCep,
        setShippingCep,
        selectedShipping,
        setSelectedShipping,
        shippingQuotes,
        subtotal,
        discountAmount,
        shippingAmount,
        totalAmount,
        isCalculatingShipping,
        calculateShippingByCep,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
