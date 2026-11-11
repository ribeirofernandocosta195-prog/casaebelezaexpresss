import React, { useState } from 'react';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Package,
  AlertTriangle,
  Download,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { formatCurrencyBRL } from '../../utils/validators';

export const AdminDashboard: React.FC = () => {
  const { orders, products, customers, exportOrdersCSV } = useAdmin();
  const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | 'month'>('all');

  // Filter orders by period
  const filteredOrders = orders.filter((o) => {
    if (periodFilter === 'all') return true;
    const orderDate = new Date(o.created_at);
    const now = new Date();
    if (periodFilter === 'today') {
      return orderDate.toDateString() === now.toDateString();
    }
    if (periodFilter === 'month') {
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    }
    return true;
  });

  // Strict metric calculations: only confirm revenue from PAID orders
  const paidOrders = filteredOrders.filter((o) => o.financial_status === 'Pago');
  const pendingOrders = filteredOrders.filter((o) => o.financial_status === 'Aguardando pagamento');
  const cancelledOrders = filteredOrders.filter(
    (o) => o.financial_status === 'Cancelado' || o.financial_status === 'Falhou'
  );
  const shippedOrders = filteredOrders.filter(
    (o) => o.logistic_status === 'Enviado' || o.logistic_status === 'Em trânsito' || o.logistic_status === 'Entregue'
  );

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const averageTicket = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

  // Products metrics
  const activeProducts = products.filter((p) => p.is_active);
  const outOfStockProducts = products.filter((p) => p.stock <= 0);

  // Top selling products
  const topSelling = [...products].sort((a, b) => b.sales_count - a.sales_count).slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with Period Filter & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900">
            Painel de Controle
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Visão geral de faturamento, pedidos e desempenho em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setPeriodFilter('today')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                periodFilter === 'today' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600'
              }`}
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => setPeriodFilter('month')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                periodFilter === 'month' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600'
              }`}
            >
              Este Mês
            </button>
            <button
              type="button"
              onClick={() => setPeriodFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                periodFilter === 'all' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600'
              }`}
            >
              Todo o Período
            </button>
          </div>

          <button
            type="button"
            onClick={exportOrdersCSV}
            className="px-4 py-2 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-zinc-600" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Faturamento Real */}
        <div className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold uppercase tracking-wider">Faturamento Confirmado</span>
            <div className="w-9 h-9 rounded-xl bg-pink-50 text-[#E6007A] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-extrabold text-zinc-900">
            {formatCurrencyBRL(totalRevenue)}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            {paidOrders.length} pedidos pagos via Pix
          </p>
        </div>

        {/* Ticket Médio */}
        <div className="p-6 rounded-3xl bg-white border border-zinc-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold uppercase tracking-wider">Ticket Médio</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-extrabold text-zinc-900">
            {formatCurrencyBRL(averageTicket)}
          </div>
          <p className="text-[11px] text-zinc-500">
            Média por pedido aprovado
          </p>
        </div>

        {/* Total de Pedidos */}
        <div className="p-6 rounded-3xl bg-white border border-zinc-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold uppercase tracking-wider">Total de Pedidos</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-extrabold text-zinc-900">
            {filteredOrders.length}
          </div>
          <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {pendingOrders.length} aguardando pagamento Pix
          </p>
        </div>

        {/* Produtos Ativos & Sem Estoque */}
        <div className="p-6 rounded-3xl bg-white border border-zinc-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold uppercase tracking-wider">Catálogo Ativo</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="font-serif text-2xl sm:text-3xl font-extrabold text-zinc-900">
            {activeProducts.length} <span className="text-xs font-sans text-zinc-400 font-normal">/ {products.length} total</span>
          </div>
          <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            {outOfStockProducts.length} produto(s) sem estoque
          </p>
        </div>
      </div>

      {/* Status Breakdown & Top Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Status Breakdown */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-zinc-100 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3">
            Detalhamento de Pedidos
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pagos e Confirmados</span>
              </div>
              <span className="font-bold text-emerald-800 text-sm">{paidOrders.length}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 border border-amber-100">
              <div className="flex items-center gap-2 text-amber-900 font-semibold">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Aguardando Pix</span>
              </div>
              <span className="font-bold text-amber-800 text-sm">{pendingOrders.length}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/70 border border-blue-100">
              <div className="flex items-center gap-2 text-blue-900 font-semibold">
                <Package className="w-4 h-4 text-blue-600" />
                <span>Despachados / Em Trânsito</span>
              </div>
              <span className="font-bold text-blue-800 text-sm">{shippedOrders.length}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/70 border border-rose-100">
              <div className="flex items-center gap-2 text-rose-900 font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Cancelados / Falharam</span>
              </div>
              <span className="font-bold text-rose-800 text-sm">{cancelledOrders.length}</span>
            </div>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-zinc-100 shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-zinc-900 border-b border-zinc-100 pb-3">
            Produtos Mais Vendidos
          </h3>

          <div className="space-y-3">
            {topSelling.map((prod) => (
              <div
                key={prod.id}
                className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-zinc-50 border border-zinc-50 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={prod.image_url_1}
                    alt={prod.name}
                    className="w-12 h-12 rounded-xl object-cover bg-zinc-100 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-900 truncate">{prod.name}</p>
                    <p className="text-[11px] text-zinc-400">Estoque atual: {prod.stock} un.</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 pl-3">
                  <span className="font-bold text-zinc-900 block text-xs">
                    {formatCurrencyBRL(prod.promotional_price || prod.price)}
                  </span>
                  <span className="text-[10px] text-[#E6007A] font-semibold">
                    {prod.sales_count} vendidos
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
