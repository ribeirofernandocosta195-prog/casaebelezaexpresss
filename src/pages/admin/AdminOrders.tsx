import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  Download,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  X,
  FileText,
} from 'lucide-react';
import { Order, FinancialStatus, LogisticStatus } from '../../types/database';
import { useAdmin } from '../../context/AdminContext';
import { formatCurrencyBRL } from '../../utils/validators';

export const AdminOrders: React.FC = () => {
  const { orders, updateFinancialStatus, updateLogisticStatus, exportOrdersCSV } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [financialFilter, setFinancialFilter] = useState<string>('all');
  const [logisticFilter, setLogisticFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

  // Filter orders
  const filtered = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_email.toLowerCase().includes(q) ||
      o.customer_cpf.includes(q);

    const matchesFin = financialFilter === 'all' || o.financial_status === financialFilter;
    const matchesLog = logisticFilter === 'all' || o.logistic_status === logisticFilter;

    return matchesSearch && matchesFin && matchesLog;
  });

  const handleOpenDetails = (order: Order) => {
    setSelectedOrder(order);
    setTrackingInput(order.tracking_code || '');
  };

  const handleSaveTracking = async () => {
    if (!selectedOrder) return;
    await updateLogisticStatus(selectedOrder.id, selectedOrder.logistic_status, trackingInput.trim());
    setSelectedOrder({ ...selectedOrder, tracking_code: trackingInput.trim() });
  };

  const financialOptions: FinancialStatus[] = [
    'Aguardando pagamento',
    'Pago',
    'Falhou',
    'Cancelado',
    'Expirado',
    'Reembolsado',
  ];

  const logisticOptions: LogisticStatus[] = [
    'Aguardando separação',
    'Em preparação',
    'Enviado',
    'Em trânsito',
    'Entregue',
    'Cancelado',
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900">
            Gerenciamento de Pedidos
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Controle separado para Status Financeiro e Status Logístico com inserção de rastreio.
          </p>
        </div>

        <button
          type="button"
          onClick={exportOrdersCSV}
          className="px-4 py-2 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-colors self-start"
        >
          <Download className="w-3.5 h-3.5 text-zinc-600" />
          <span>Exportar Planilha CSV</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nº pedido, cliente ou CPF..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs outline-none focus:border-[#E6007A]"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={financialFilter}
          onChange={(e) => setFinancialFilter(e.target.value)}
          className="bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-700 outline-none focus:border-[#E6007A]"
        >
          <option value="all">Todos os Status Financeiros</option>
          {financialOptions.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>

        <select
          value={logisticFilter}
          onChange={(e) => setLogisticFilter(e.target.value)}
          className="bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-700 outline-none focus:border-[#E6007A]"
        >
          <option value="all">Todos os Status Logísticos</option>
          {logisticOptions.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-100 text-[11px]">
              <tr>
                <th className="p-4">Pedido / Data</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status Financeiro</th>
                <th className="p-4">Status Logístico</th>
                <th className="p-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 text-zinc-700">
              {filtered.map((ord) => (
                <tr key={ord.id} className="hover:bg-pink-50/20 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-zinc-900 block">{ord.order_number}</span>
                    <span className="text-[11px] text-zinc-400">
                      {new Date(ord.created_at).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(ord.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className="font-semibold text-zinc-900 block">{ord.customer_name}</span>
                    <span className="text-[11px] text-zinc-400">{ord.customer_email}</span>
                  </td>

                  <td className="p-4 font-bold text-zinc-900">
                    {formatCurrencyBRL(ord.total_amount)}
                  </td>

                  {/* Financial Status Dropdown */}
                  <td className="p-4">
                    <select
                      value={ord.financial_status}
                      onChange={(e) => updateFinancialStatus(ord.id, e.target.value as FinancialStatus)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold border-0 outline-none cursor-pointer ${
                        ord.financial_status === 'Pago'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.financial_status === 'Aguardando pagamento'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {financialOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Logistic Status Dropdown (NEVER updates financial status) */}
                  <td className="p-4">
                    <select
                      value={ord.logistic_status}
                      onChange={(e) => updateLogisticStatus(ord.id, e.target.value as LogisticStatus)}
                      className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-zinc-100 text-zinc-800 border-0 outline-none cursor-pointer"
                    >
                      {logisticOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenDetails(ord)}
                      className="p-1.5 text-zinc-500 hover:text-[#E6007A] rounded-xl hover:bg-pink-50 transition-colors"
                      title="Ver detalhes completos"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-pink-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div>
                <span className="text-[11px] text-zinc-400 block">Detalhes do Pedido</span>
                <h2 className="font-serif text-xl font-bold text-zinc-900">
                  {selectedOrder.order_number}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              {/* Customer Snapshot */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/60 space-y-1">
                <span className="font-bold text-zinc-900 block mb-1">Dados do Cliente</span>
                <p><strong>Nome:</strong> {selectedOrder.customer_name}</p>
                <p><strong>E-mail:</strong> {selectedOrder.customer_email}</p>
                <p><strong>CPF:</strong> {selectedOrder.customer_cpf}</p>
                <p><strong>Telefone:</strong> {selectedOrder.customer_phone}</p>
                <p>
                  <strong>Endereço:</strong> {selectedOrder.shipping_address?.street}, {selectedOrder.shipping_address?.number}
                  {selectedOrder.shipping_address?.complement ? ` (${selectedOrder.shipping_address.complement})` : ''} - {selectedOrder.shipping_address?.neighborhood}, {selectedOrder.shipping_address?.city}/{selectedOrder.shipping_address?.state} - CEP: {selectedOrder.shipping_address?.cep}
                </p>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <span className="font-bold text-zinc-900 block">Itens do Pedido:</span>
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 bg-white border border-zinc-100 rounded-xl">
                    <div className="flex items-center gap-3">
                      <img src={item.product_image} alt={item.product_name} className="w-10 h-10 rounded-lg object-cover bg-zinc-100" />
                      <div>
                        <p className="font-semibold text-zinc-900">{item.product_name}</p>
                        {item.variation_title && <p className="text-[11px] text-zinc-400">{item.variation_title}</p>}
                        <p className="text-[11px] text-zinc-500">Qtd: {item.quantity} x {formatCurrencyBRL(item.unit_price)}</p>
                      </div>
                    </div>
                    <span className="font-bold text-zinc-900">{formatCurrencyBRL(item.total_price)}</span>
                  </div>
                ))}
              </div>

              {/* Tracking Code Input */}
              <div className="p-4 rounded-2xl bg-[#FFF0F6]/70 border border-pink-200/70 space-y-2">
                <label className="font-bold text-zinc-800 block">Código de Rastreamento:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: BR982341908SP"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs outline-none focus:border-[#E6007A]"
                  />
                  <button
                    type="button"
                    onClick={handleSaveTracking}
                    className="px-4 py-2 bg-[#E6007A] hover:bg-[#D0006E] text-white font-bold rounded-xl"
                  >
                    Salvar Rastreio
                  </button>
                </div>
              </div>

              {/* Financial Totals Breakdown */}
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200/60 space-y-1.5">
                <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrencyBRL(selectedOrder.subtotal)}</span></div>
                <div className="flex justify-between"><span>Desconto:</span><span>- {formatCurrencyBRL(selectedOrder.discount_amount)}</span></div>
                <div className="flex justify-between"><span>Frete:</span><span>{formatCurrencyBRL(selectedOrder.shipping_amount)}</span></div>
                <div className="flex justify-between font-bold text-sm text-zinc-900 pt-1 border-t border-zinc-200">
                  <span>Total Geral:</span><span>{formatCurrencyBRL(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
