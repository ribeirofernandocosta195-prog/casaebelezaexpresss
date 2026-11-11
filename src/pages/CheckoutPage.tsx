import React, { useState } from 'react';
import {
  ShieldCheck,
  QrCode,
  Lock,
  ArrowRight,
  AlertCircle,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import {
  validateCPF,
  maskCPF,
  maskCEP,
  maskPhone,
  formatCurrencyBRL,
} from '../utils/validators';

interface CheckoutPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const {
    items,
    appliedCoupon,
    selectedShipping,
    subtotal,
    discountAmount,
    shippingAmount,
    totalAmount,
    clearCart,
  } = useCart();

  // Customer Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');

  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // CEP Auto-fill
  const handleCepBlur = async () => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;

    setIsLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        if (data.logradouro) setStreet(data.logradouro);
        if (data.bairro) setNeighborhood(data.bairro);
        if (data.localidade) setCity(data.localidade);
        if (data.uf) setState(data.uf);
      }
    } catch (e) {
      console.warn('ViaCEP offline', e);
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validate CPF
    if (!validateCPF(cpf)) {
      setErrorMessage('O CPF informado é inválido. Por favor, verifique os dígitos.');
      return;
    }

    if (!fullName.trim() || fullName.trim().split(' ').length < 2) {
      setErrorMessage('Por favor, informe seu nome e sobrenome completos.');
      return;
    }

    if (!email.includes('@')) {
      setErrorMessage('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Seu carrinho está vazio.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customer: {
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          cpf: cpf.replace(/\D/g, ''),
          phone: phone.trim(),
        },
        shippingAddress: {
          cep: cep.trim(),
          street: street.trim(),
          number: number.trim(),
          complement: complement.trim(),
          neighborhood: neighborhood.trim(),
          city: city.trim(),
          state: state.trim(),
        },
        items: items.map((it) => ({
          productId: it.product.id,
          quantity: it.quantity,
          variationTitle: it.variationTitle,
        })),
        coupon: appliedCoupon
          ? {
              id: appliedCoupon.id,
              code: appliedCoupon.code,
              discountType: appliedCoupon.discount_type,
              discountValue: appliedCoupon.discount_value,
              minOrderValue: appliedCoupon.min_order_value,
              maxUses: appliedCoupon.max_uses,
              timesUsed: appliedCoupon.times_used,
              isActive: appliedCoupon.is_active,
            }
          : null,
        shippingChoice: selectedShipping,
      };

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao criar pedido no servidor.');
      }

      // Clear cart
      clearCart();

      // Navigate to Pix payment page
      onNavigate('pagamento', { orderId: data.order.id });
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao processar o pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-xs font-bold text-[#E6007A] uppercase tracking-widest">Finalização Segura</span>
        <h1 className="font-serif text-3xl font-bold text-zinc-900 mt-1">
          Identificação e Entrega
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Preencha seus dados para gerarmos seu QR Code Pix exclusivo.
        </p>
      </div>

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left: Customer Data & Address */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Customer Data */}
            <div className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-4">
              <h2 className="font-serif text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#E6007A] text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                Dados Pessoais
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-zinc-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Beatriz Lima Silveira"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">E-mail para Confirmação *</label>
                  <input
                    type="email"
                    required
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">CPF (somente números) *</label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    maxLength={14}
                    value={cpf}
                    onChange={(e) => setCpf(maskCPF(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-zinc-700 mb-1">Telefone Celular / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 98765-4321"
                    maxLength={15}
                    value={phone}
                    onChange={(e) => setPhone(maskPhone(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Address */}
            <div className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-4">
              <h2 className="font-serif text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#E6007A] text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                Endereço de Entrega
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">CEP *</label>
                  <input
                    type="text"
                    required
                    placeholder="00000-000"
                    maxLength={9}
                    value={cep}
                    onChange={(e) => setCep(maskCEP(e.target.value))}
                    onBlur={handleCepBlur}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  />
                  {isLoadingCep && <span className="text-[10px] text-zinc-400">Buscando CEP...</span>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-zinc-700 mb-1">Rua / Logradouro *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Rua das Flores"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Número *</label>
                  <input
                    type="text"
                    required
                    placeholder="123"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-zinc-700 mb-1">Complemento</label>
                  <input
                    type="text"
                    placeholder="Apt 12, Bloco B (opcional)"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Bairro *</label>
                  <input
                    type="text"
                    required
                    placeholder="Centro"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Cidade *</label>
                  <input
                    type="text"
                    required
                    placeholder="São Paulo"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Estado (UF) *</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    placeholder="SP"
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A] uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method Info */}
            <div className="p-6 rounded-3xl bg-[#FFF0F6]/80 border border-pink-200/80 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E6007A] text-white flex items-center justify-center shadow-md shadow-pink-500/20">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-sm font-bold text-zinc-900">
                    Forma de Pagamento: Pix via Nexum Pay
                  </h3>
                  <p className="text-xs text-zinc-600">
                    Ao clicar em finalizar, o QR Code e o código Pix Copia e Cola serão gerados imediatamente.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order Summary Box */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 p-6 rounded-3xl bg-white border border-pink-100 shadow-md space-y-5">
              <h3 className="font-serif text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-3">
                Resumo da Compra
              </h3>

              {/* Items List Snapshot */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((it) => (
                  <div key={it.id} className="flex items-center gap-3 text-xs">
                    <img
                      src={it.product.image_url_1}
                      alt={it.product.name}
                      className="w-12 h-12 rounded-lg object-cover bg-zinc-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-800 truncate">{it.product.name}</p>
                      <p className="text-[11px] text-zinc-400">Qtd: {it.quantity}</p>
                    </div>
                    <span className="font-bold text-zinc-900">
                      {formatCurrencyBRL((it.product.promotional_price || it.product.price) * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="pt-3 border-t border-zinc-100 space-y-2 text-xs text-zinc-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-900">{formatCurrencyBRL(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Desconto</span>
                    <span>- {formatCurrencyBRL(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Frete</span>
                  <span className="font-semibold text-zinc-900">
                    {shippingAmount === 0 ? <span className="text-emerald-600 font-bold">Grátis</span> : formatCurrencyBRL(shippingAmount)}
                  </span>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex justify-between items-baseline">
                  <span className="font-bold text-sm text-zinc-900">Total a Pagar</span>
                  <span className="font-serif text-2xl font-bold text-[#E6007A]">
                    {formatCurrencyBRL(totalAmount)}
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-[#E6007A] to-[#D0006E] hover:from-[#D0006E] hover:to-[#B5005E] text-white text-xs sm:text-sm font-bold rounded-full shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Processando e gerando Pix...</span>
                ) : (
                  <>
                    <span>Gerar Cobrança Pix Agora</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 pt-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ambiente Seguro com Criptografia de Ponta a Ponta</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
