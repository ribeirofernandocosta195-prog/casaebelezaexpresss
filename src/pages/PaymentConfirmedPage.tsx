import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  PackageCheck,
  Truck,
  ArrowRight,
  ShieldCheck,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { formatCurrencyBRL } from '../utils/validators';

interface PaymentConfirmedPageProps {
  orderId: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const PaymentConfirmedPage: React.FC<PaymentConfirmedPageProps> = ({ orderId, onNavigate }) => {
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    async function verifyPayment() {
      try {
        const res = await fetch(`/api/orders/${orderId}/status`);
        const data = await res.json();

        if (res.ok) {
          setOrder(data);
          const paidStatuses = ['Pago', 'PAID', 'APPROVED', 'COMPLETED', 'CONFIRMED'];
          if (paidStatuses.includes(data.financial_status)) {
            setIsConfirmed(true);
            // Fire celebratory confetti!
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#E6007A', '#FF3399', '#FFE5F0', '#10B981'],
            });
          }
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (orderId) {
      verifyPayment();
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 border-4 border-pink-200 border-t-[#E6007A] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-semibold text-zinc-700">Validando confirmação bancária do pedido...</p>
      </div>
    );
  }

  // Security check: Never consider URL alone as proof if financial status is not paid!
  if (!isConfirmed) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-zinc-900 mb-2">
          Pagamento ainda não confirmado
        </h2>
        <p className="text-xs sm:text-sm text-zinc-600 mb-6 leading-relaxed max-w-md mx-auto">
          O pedido <strong>{order?.order_number || orderId}</strong> encontra-se com status{' '}
          <strong className="text-amber-600">{order?.financial_status || 'Pendente'}</strong>. Se você já realizou o Pix, aguarde alguns instantes enquanto o banco processa.
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('pagamento', { orderId })}
            className="px-6 py-2.5 bg-[#E6007A] text-white text-xs font-bold rounded-full shadow-md"
          >
            Ver QR Code Pix
          </button>
          <button
            type="button"
            onClick={() => onNavigate('rastreio')}
            className="px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold rounded-full"
          >
            Acompanhar Pedido
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="p-8 sm:p-12 rounded-3xl bg-white border border-pink-100 shadow-xl text-center space-y-8">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
            Pagamento Confirmado com Sucesso!
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-zinc-900">
            Obrigada pela sua compra!
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-md mx-auto">
            Seu pagamento Pix via Nexum Pay foi processado e seu pedido já está sendo preparado com muito carinho.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="p-6 rounded-2xl bg-[#FFF0F6]/60 border border-pink-100 text-left space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pink-200/60 pb-3">
            <div>
              <span className="text-zinc-500 block text-[11px]">Número do Pedido</span>
              <span className="font-mono text-base font-bold text-zinc-900">
                {order?.order_number || orderId}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[11px]">Total Pago no Pix</span>
              <span className="font-serif text-lg font-bold text-[#E6007A]">
                {formatCurrencyBRL(order?.total_amount || 0)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-zinc-600">
            <div className="flex items-start gap-3">
              <PackageCheck className="w-5 h-5 text-[#E6007A] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-zinc-800">Status do Pedido:</p>
                <p className="text-emerald-700 font-semibold">Pagamento Aprovado • Em Preparação</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-[#E6007A] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-zinc-800">Previsão de Envio:</p>
                <p className="text-zinc-600">Postagem expressa em até 24 horas úteis</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            type="button"
            onClick={() => onNavigate('rastreio', { code: order?.order_number })}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#E6007A] hover:bg-[#D0006E] text-white text-xs font-bold rounded-full shadow-lg shadow-pink-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Rastrear Meu Pedido</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="w-full sm:w-auto px-6 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold rounded-full transition-colors"
          >
            Voltar para a Página Inicial
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 pt-4 border-t border-zinc-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Enviamos todos os detalhes e atualizações para o seu e-mail cadastrado.</span>
        </div>
      </div>
    </div>
  );
};
