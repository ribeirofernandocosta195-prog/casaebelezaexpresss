import React, { useState, useEffect } from 'react';
import {
  Search,
  PackageCheck,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { formatCurrencyBRL } from '../utils/validators';

interface OrderTrackingPageProps {
  initialCode?: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ initialCode, onNavigate }) => {
  const [searchInput, setSearchInput] = useState(initialCode || '');
  const [matchedOrder, setMatchedOrder] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = (code: string) => {
    const q = code.trim().toLowerCase();
    if (!q) return;

    try {
      const allOrders = localStorage.getItem('casa_beleza_orders_v1');
      if (allOrders) {
        const parsed = JSON.parse(allOrders);
        const match = parsed.find(
          (o: any) =>
            o.order_number?.toLowerCase() === q ||
            o.id?.toLowerCase() === q ||
            o.customer_cpf?.replace(/\D/g, '') === q.replace(/\D/g, '')
        );
        setMatchedOrder(match || null);
      }
    } catch {
      setMatchedOrder(null);
    }
    setHasSearched(true);
  };

  useEffect(() => {
    if (initialCode) {
      performSearch(initialCode);
    }
  }, [initialCode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchInput);
  };

  // Logistic steps
  const steps = [
    { title: 'Aguardando Separação', key: 'Aguardando separação' },
    { title: 'Em Preparação', key: 'Em preparação' },
    { title: 'Enviado aos Correios', key: 'Enviado' },
    { title: 'Em Trânsito', key: 'Em trânsito' },
    { title: 'Entregue com Sucesso', key: 'Entregue' },
  ];

  const getStepIndex = (status: string) => {
    const idx = steps.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  const currentStepIdx = matchedOrder ? getStepIndex(matchedOrder.logistic_status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-xs font-bold text-[#E6007A] uppercase tracking-widest">Rastreamento Rápido</span>
        <h1 className="font-serif text-3xl font-bold text-zinc-900 mt-1">
          Acompanhe seu Pedido
        </h1>
        <p className="text-xs text-zinc-500 mt-2">
          Insira o número do pedido (ex: CB-10492) ou o CPF utilizado no momento da compra.
        </p>

        {/* Search Input Box */}
        <form onSubmit={handleSearchSubmit} className="mt-6 flex gap-2 max-w-md mx-auto">
          <input
            type="text"
            required
            placeholder="Número do pedido ou CPF..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-full text-xs text-zinc-800 outline-none focus:border-[#E6007A] focus:bg-white"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-[#E6007A] hover:bg-[#D0006E] text-white text-xs font-bold rounded-full transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Consultar</span>
          </button>
        </form>
      </div>

      {hasSearched && (
        <>
          {matchedOrder ? (
            <div className="p-6 sm:p-10 rounded-3xl bg-white border border-pink-100 shadow-xl space-y-8 animate-fade-in">
              {/* Order Header Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-100 gap-4">
                <div>
                  <span className="text-xs text-zinc-400 block">Número do Pedido</span>
                  <h2 className="font-serif text-2xl font-bold text-zinc-900">{matchedOrder.order_number}</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Realizado em {new Date(matchedOrder.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      matchedOrder.financial_status === 'Pago'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    Pagamento: {matchedOrder.financial_status}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-100 text-pink-800">
                    Logística: {matchedOrder.logistic_status}
                  </span>
                </div>
              </div>

              {/* Logistic Step Progression */}
              <div>
                <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-6">
                  Linha do Tempo de Entrega
                </h3>
                <div className="relative">
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {steps.map((st, i) => {
                      const isPastOrCurrent = i <= currentStepIdx;
                      return (
                        <div key={st.key} className="flex flex-col items-center">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                              isPastOrCurrent
                                ? 'bg-[#E6007A] text-white shadow-md shadow-pink-500/20'
                                : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                            }`}
                          >
                            {isPastOrCurrent ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                          </div>
                          <span
                            className={`text-[10px] sm:text-xs mt-2 font-medium line-clamp-2 leading-tight ${
                              isPastOrCurrent ? 'text-zinc-900 font-semibold' : 'text-zinc-400'
                            }`}
                          >
                            {st.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Tracking Code */}
              {matchedOrder.tracking_code && (
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Código de Rastreamento dos Correios:</span>
                    <span className="font-mono text-sm font-bold text-zinc-900">
                      {matchedOrder.tracking_code}
                    </span>
                  </div>
                  <a
                    href={`https://rastreamento.correios.com.br/app/index.php?codigo=${matchedOrder.tracking_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-800 rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Rastrear nos Correios</span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                  </a>
                </div>
              )}

              {/* Shipping Address & Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-100 text-xs">
                <div>
                  <h4 className="font-bold text-zinc-900 mb-2">Endereço de Destino:</h4>
                  <p className="text-zinc-600 leading-relaxed">
                    {matchedOrder.customer_name}
                    <br />
                    {matchedOrder.shipping_address?.street}, {matchedOrder.shipping_address?.number}
                    {matchedOrder.shipping_address?.complement ? ` - ${matchedOrder.shipping_address.complement}` : ''}
                    <br />
                    {matchedOrder.shipping_address?.neighborhood} - {matchedOrder.shipping_address?.city}/{matchedOrder.shipping_address?.state}
                    <br />
                    CEP: {matchedOrder.shipping_address?.cep}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-900 mb-2">Resumo Financeiro:</h4>
                  <div className="space-y-1 text-zinc-600">
                    <p>Subtotal: {formatCurrencyBRL(matchedOrder.subtotal || 0)}</p>
                    <p>Frete: {formatCurrencyBRL(matchedOrder.shipping_amount || 0)}</p>
                    <p className="font-bold text-zinc-900 pt-1 border-t border-zinc-100">
                      Total: {formatCurrencyBRL(matchedOrder.total_amount || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-zinc-50 rounded-3xl border border-zinc-200/70 max-w-md mx-auto">
              <Clock className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
              <h3 className="font-serif text-lg font-bold text-zinc-800">Pedido não localizado</h3>
              <p className="text-xs text-zinc-500 mt-1 mb-4">
                Não encontramos nenhum pedido com o código ou documento informado. Certifique-se de digitar corretamente.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
