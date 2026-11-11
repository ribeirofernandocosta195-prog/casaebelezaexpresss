import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateOrderValues, ProductCatalogItem, CouponItem } from './orderCalculator';

const mockCatalog = new Map<string, ProductCatalogItem>([
  [
    'prod-1',
    {
      id: 'prod-1',
      name: 'Batom Matte Velvet Rosa',
      price: 59.90,
      promotionalPrice: 49.90,
      stock: 15,
      isActive: true,
      imageUrl1: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa',
    },
  ],
  [
    'prod-2',
    {
      id: 'prod-2',
      name: 'Vela Aromática Vanilla Home',
      price: 89.90,
      promotionalPrice: null,
      stock: 5,
      isActive: true,
      imageUrl1: 'https://images.unsplash.com/photo-1603006905003-be475563bc59',
    },
  ],
  [
    'prod-inactive',
    {
      id: 'prod-inactive',
      name: 'Produto Descontinuado',
      price: 99.00,
      stock: 10,
      isActive: false,
      imageUrl1: 'https://images.unsplash.com/photo-1',
    },
  ],
]);

test('calculateOrderValues uses promotional price when available', () => {
  const result = calculateOrderValues(
    [{ productId: 'prod-1', quantity: 2 }],
    mockCatalog,
    null,
    'standard'
  );

  // 49.90 * 2 = 99.80, shipping = 19.90, total = 119.70
  assert.equal(result.subtotal, 99.80);
  assert.equal(result.discountAmount, 0);
  assert.equal(result.shippingAmount, 19.90);
  assert.equal(result.totalAmount, 119.70);
});

test('calculateOrderValues applies percentage coupon correctly', () => {
  const coupon: CouponItem = {
    id: 'c1',
    code: 'BEMVINDA10',
    discountType: 'percentage',
    discountValue: 10, // 10%
    timesUsed: 0,
    isActive: true,
  };

  const result = calculateOrderValues(
    [{ productId: 'prod-2', quantity: 2 }], // 89.90 * 2 = 179.80
    mockCatalog,
    coupon,
    'standard'
  );

  assert.equal(result.subtotal, 179.80);
  assert.equal(result.discountAmount, 17.98);
  assert.equal(result.shippingAmount, 19.90);
  assert.equal(result.totalAmount, 181.72);
});

test('calculateOrderValues applies free shipping over threshold', () => {
  const result = calculateOrderValues(
    [{ productId: 'prod-2', quantity: 3 }], // 89.90 * 3 = 269.70 (>= 199.00)
    mockCatalog,
    null,
    'standard'
  );

  assert.equal(result.subtotal, 269.70);
  assert.equal(result.shippingAmount, 0);
  assert.equal(result.totalAmount, 269.70);
});

test('calculateOrderValues rejects inactive or out of stock products', () => {
  assert.throws(() => {
    calculateOrderValues([{ productId: 'prod-inactive', quantity: 1 }], mockCatalog);
  }, /inativo/);

  assert.throws(() => {
    calculateOrderValues([{ productId: 'prod-2', quantity: 100 }], mockCatalog);
  }, /Estoque insuficiente/);
});
