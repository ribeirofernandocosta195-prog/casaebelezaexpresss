import React, { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
  Truck,
  Tag,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { formatCurrencyBRL } from '../utils/validators';

interface CartPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
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
  } = useCart();

  const { coupons } = useStore();
  const [couponInput, setCouponInput] = useState('');
  const [cepInput, setCepInput] = useState(shippingCep);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCouponCode(couponInput.trim(), coupons);
    }
  };

  const handleCalculateCep = (e: React.FormEvent) => {
    e.preventDefault();
    setShippingCep(cepInput);
    calculateShippingByCep(cepInput);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-pink-100 text-[#E6007A] flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-zinc-900 mb-2">Seu carrinho está vazio</h2>
        <p className="text-xs sm:text-sm text-zinc-500 mb-6 max-w-sm mx-auto">
          Explore nossa seleção de cosméticos, maquiagem e artigos para o lar e adicione seus itens favoritos.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('catalogo')}
          className="px-8 py-3 bg-[#E6007A] hover:bg-[#D0006E] text-white text-xs font-bold rounded-full transition-colors shadow-md shadow-pink-500/20"
        >
          Explorar Produtos
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-zinc-100">
        <div>
          <span className="text-xs font-bold text-[#E6007A] uppercase tracking-widest">Sua Sacola</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 mt-1">
            Carrinho de Compras
          </h1>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-zinc-400 hover:text-rose-600 font-medium transition-colors"
        >
          Esvaziar Carrinho
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const unitPrice =
              item.product.promotional_price && item.product.promotional_price < item.product.price
                ? item.product.promotional_price
                : item.product.price;
            const itemTotal = unitPrice * item.quantity;

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Product Image & Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={item.product.image_url_1}
                    alt={item.product.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-zinc-50 border border-zinc-100 flex-shrink-0"
                  />
                  <div>
                    <h3 className="font-semibold text-xs sm:text-sm text-zinc-900 line-clamp-1">
                      {item.product.name}
                    </h3>
                    {item.variationTitle && (
                      <span className="text-[11px] text-zinc-500 block mt-0.5">
                        {item.variationTitle}
                      </span>
                    )}
                    <span className="text-xs font-bold text-[#E6007A] block mt-1">
                      {formatCurrencyBRL(unitPrice)}
                    </span>
                  </div>
                </div>

                {/* Quantity Controls & Total */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-50">
                  <div className="flex items-center border border-zinc-200 rounded-xl bg-white">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-xs text-zinc-600 hover:text-[#E6007A]"
                      aria-label="Diminuir"
                    >
                      -
                    </button>
                    <span className="px-2 py-1 text-xs font-bold text-zinc-900 min-w-7 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      disabled={item.quantity >= item.product.stock}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1 text-xs text-zinc-600 hover:text-[#E6007A] disabled:opacity-30"
                      aria-label="Aumentar"
                    >
                      +
                    </button>
                  </div>

                  <span className="font-bold text-sm text-zinc-900 min-w-20 text-right">
                    {formatCurrencyBRL(itemTotal)}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors"
                    aria-label="Remover item"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Shipping Calculator & Coupon Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {/* CEP Calculator */}
            <div className="p-5 rounded-2xl bg-[#F5F5F7]/80 border border-zinc-200/60 space-y-3">
              <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#E6007A]" />
                Calcular Frete
              </span>
              <form onSubmit={handleCalculateCep} className="flex gap-2">
                <input
                  type="text"
                  placeholder="00000-000"
                  maxLength={9}
                  value={cepInput}
                  onChange={(e) => setCepInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white rounded-xl border border-zinc-200 text-xs focus:border-[#E6007A] outline-none"
                />
                <button
                  type="submit"
                  disabled={isCalculatingShipping}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-900 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  {isCalculatingShipping ? '...' : 'OK'}
                </button>
              </form>

              {shippingQuotes.length > 0 && (
                <div className="space-y-2 pt-1 text-xs">
                  {shippingQuotes.map((q) => (
                    <label
                      key={q.type}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${
                        selectedShipping === q.type
                          ? 'border-[#E6007A] bg-pink-50/50 font-semibold'
                          : 'border-zinc-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shipping_opt"
                          checked={selectedShipping === q.type}
                          onChange={() => setSelectedShipping(q.type)}
                          className="text-[#E6007A] focus:ring-[#E6007A]"
                        />
                        <span className="text-[11px] text-zinc-800">
                          {q.name} ({q.days} dias)
                        </span>
                      </div>
                      <span className="text-xs font-bold text-zinc-900">
                        {subtotal >= 199 && q.type === 'standard' ? 'GRÁTIS' : formatCurrencyBRL(q.price)}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Coupon Box */}
            <div className="p-5 rounded-2xl bg-[#F5F5F7]/80 border border-zinc-200/60 space-y-3">
              <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#E6007A]" />
                Cupom de Desconto
              </span>

              {appliedCoupon ? (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900">Cupom: {appliedCoupon.code}</p>
                      <p className="text-[10px] text-emerald-700">
                        Desconto aplicado no total da compra
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: BEMVINDA10"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white rounded-xl border border-zinc-200 text-xs focus:border-[#E6007A] outline-none uppercase"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#E6007A] hover:bg-[#D0006E] text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    Aplicar
                  </button>
                </form>
              )}

              {couponError && (
                <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 p-6 rounded-3xl bg-white border border-pink-100 shadow-md space-y-4">
            <h3 className="font-serif text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-3">
              Resumo do Pedido
            </h3>

            <div className="space-y-2.5 text-xs text-zinc-600">
              <div className="flex justify-between">
                <span>Subtotal ({items.length} itens)</span>
                <span className="font-semibold text-zinc-900">{formatCurrencyBRL(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Desconto de Cupom</span>
                  <span>- {formatCurrencyBRL(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Frete</span>
                <span className="font-semibold text-zinc-900">
                  {shippingAmount === 0 ? (
                    <span className="text-emerald-600 font-bold">Grátis</span>
                  ) : (
                    formatCurrencyBRL(shippingAmount)
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex justify-between items-baseline">
                <span className="font-bold text-sm text-zinc-900">Total</span>
                <span className="font-serif text-2xl font-bold text-[#E6007A]">
                  {formatCurrencyBRL(totalAmount)}
                </span>
              </div>

              <p className="text-[10px] text-zinc-400 text-right">
                Pagamento seguro e à vista via Pix pela Nexum Pay
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('checkout')}
              className="w-full py-3.5 bg-gradient-to-r from-[#E6007A] to-[#D0006E] hover:from-[#D0006E] hover:to-[#B5005E] text-white text-xs font-bold rounded-full shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all flex items-center justify-center gap-2"
            >
              <span>Fechar Pedido</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-3 border-t border-zinc-100 flex items-center justify-center gap-2 text-[11px] text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Compra 100% Protegida & Criptografada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
