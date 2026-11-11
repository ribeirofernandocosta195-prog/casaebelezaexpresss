export interface ProductItemInput {
  productId: string;
  quantity: number;
  variationTitle?: string;
}

export interface ProductCatalogItem {
  id: string;
  name: string;
  price: number;
  promotionalPrice?: number | null;
  stock: number;
  isActive: boolean;
  freeShipping?: boolean;
  imageUrl1: string;
}

export interface CouponItem {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue?: number;
  maxUses?: number;
  timesUsed: number;
  isActive: boolean;
  startsAt?: string;
  expiresAt?: string;
}

export interface CalculationResult {
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  items: Array<{
    productId: string;
    productName: string;
    productImage: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    variationTitle?: string;
  }>;
  appliedCoupon?: CouponItem | null;
  couponError?: string;
}

/**
 * Pure calculation logic for e-commerce orders
 */
export function calculateOrderValues(
  itemsInput: ProductItemInput[],
  catalogProducts: Map<string, ProductCatalogItem>,
  coupon?: CouponItem | null,
  shippingChoice: 'standard' | 'express' | 'free' = 'standard',
  shippingRates = { standard: 19.90, express: 29.90, freeThreshold: 199.00 }
): CalculationResult {
  let subtotal = 0;
  const calculatedItems: CalculationResult['items'] = [];
  let allItemsHaveFreeShipping = itemsInput.length > 0;

  for (const input of itemsInput) {
    if (input.quantity <= 0) {
      throw new Error(`Quantidade inválida para o item: ${input.quantity}`);
    }

    const product = catalogProducts.get(input.productId);
    if (!product) {
      throw new Error(`Produto não encontrado: ID ${input.productId}`);
    }

    if (!product.isActive) {
      throw new Error(`O produto "${product.name}" está inativo e não pode ser comprado.`);
    }

    if (input.quantity > product.stock) {
      throw new Error(
        `Estoque insuficiente para "${product.name}". Solicitado: ${input.quantity}, Disponível: ${product.stock}`
      );
    }

    // Determine effective unit price (promotional if valid and lower)
    const unitPrice =
      product.promotionalPrice && product.promotionalPrice > 0 && product.promotionalPrice < product.price
        ? product.promotionalPrice
        : product.price;

    const itemTotal = Number((unitPrice * input.quantity).toFixed(2));
    subtotal += itemTotal;

    if (!product.freeShipping) {
      allItemsHaveFreeShipping = false;
    }

    calculatedItems.push({
      productId: product.id,
      productName: product.name,
      productImage: product.imageUrl1,
      unitPrice,
      quantity: input.quantity,
      totalPrice: itemTotal,
      variationTitle: input.variationTitle,
    });
  }

  subtotal = Number(subtotal.toFixed(2));

  // Discount calculation
  let discountAmount = 0;
  let couponError: string | undefined;
  let appliedCoupon: CouponItem | null = null;

  if (coupon) {
    const now = new Date();
    if (!coupon.isActive) {
      couponError = 'Este cupom não está mais ativo.';
    } else if (coupon.startsAt && new Date(coupon.startsAt) > now) {
      couponError = 'Este cupom ainda não é válido.';
    } else if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
      couponError = 'Este cupom expirou.';
    } else if (coupon.maxUses && coupon.timesUsed >= coupon.maxUses) {
      couponError = 'Este cupom atingiu o limite de utilizações.';
    } else if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
      couponError = `O valor mínimo para usar este cupom é R$ ${coupon.minOrderValue.toFixed(2)}.`;
    } else {
      if (coupon.discountType === 'percentage') {
        discountAmount = Number(((subtotal * coupon.discountValue) / 100).toFixed(2));
      } else {
        discountAmount = Number(Math.min(coupon.discountValue, subtotal).toFixed(2));
      }
      appliedCoupon = coupon;
    }
  }

  // Shipping calculation
  let shippingAmount = 0;
  const qualifiesForFreeShipping = subtotal >= shippingRates.freeThreshold || allItemsHaveFreeShipping;

  if (shippingChoice === 'free' || qualifiesForFreeShipping) {
    shippingAmount = 0;
  } else if (shippingChoice === 'express') {
    shippingAmount = shippingRates.express;
  } else {
    shippingAmount = shippingRates.standard;
  }

  const totalAmount = Number(Math.max(0, subtotal - discountAmount + shippingAmount).toFixed(2));

  return {
    subtotal,
    discountAmount,
    shippingAmount,
    totalAmount,
    items: calculatedItems,
    appliedCoupon,
    couponError,
  };
}
