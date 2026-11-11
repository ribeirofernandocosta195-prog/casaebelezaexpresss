import React, { useState } from 'react';
import { User, PackageCheck, Mail, LogOut, ArrowRight, Clock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatCurrencyBRL } from '../utils/validators';

interface AccountPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const { customerUser, loginCustomer, logoutCustomer } = useStore();
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  // Read local orders matching customer
  const savedOrders = (() => {
    try {
      const all = localStorage.getItem('casa_beleza_orders_v1');
      return all ? JSON.parse(all) : [];
    } catch {
      return [];
    }
  })();

  const customerOrders = customerUser
    ? savedOrders.filter((o: any) => o.customer_email?.toLowerCase() === customerUser.email.toLowerCase())
    : [];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      await loginCustomer(emailInput.trim());
    }
  };

  if (!customerUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="p-8 rounded-3xl bg-white border border-pink-100 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#E6007A] flex items-center justify-center mx-auto">
              <User className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-zinc-900">Minha Conta</h1>
            <p className="text-xs text-zinc-500">
              Acesse para consultar seus pedidos, favoritos e dados cadastrais.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Seu E-mail</label>
              <input
                type="email"
                required
                placeholder="exemplo@email.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Senha de Acesso</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#E6007A] hover:bg-[#D0006E] text-white font-bold rounded-xl transition-colors shadow-sm"
            >
              Entrar ou Cadastrar
            </button>
          </form>

          <div className="text-center pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => onNavigate('rastreio')}
              className="text-xs text-[#E6007A] hover:underline font-semibold"
            >
              Consultar pedido sem fazer login →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-zinc-100 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF3399] to-[#E6007A] text-white flex items-center justify-center font-bold text-xl shadow-md shadow-pink-500/20">
            {customerUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-zinc-900">
              Olá, {customerUser.name}
            </h1>
            <p className="text-xs text-zinc-500">{customerUser.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={logoutCustomer}
          className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl flex items-center gap-2 self-start transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair da Conta
        </button>
      </div>

      {/* Orders History */}
      <div className="space-y-6">
        <h2 className="font-serif text-lg font-bold text-zinc-900 flex items-center gap-2">
          <PackageCheck className="w-5 h-5 text-[#E6007A]" />
          Histórico de Pedidos
        </h2>

        {customerOrders.length > 0 ? (
          <div className="space-y-4">
            {customerOrders.map((ord: any) => (
              <div
                key={ord.id}
                className="p-5 rounded-2xl bg-white border border-zinc-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-zinc-900 text-sm">{ord.order_number}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.financial_status === 'Pago'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ord.financial_status}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-700">
                      {ord.logistic_status}
                    </span>
                  </div>
                  <p className="text-zinc-500">
                    Realizado em {new Date(ord.created_at).toLocaleDateString('pt-BR')} • {ord.items?.length || 1} itens
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                  <span className="font-bold text-sm text-[#E6007A]">
                    {formatCurrencyBRL(ord.total_amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate('rastreio', { code: ord.order_number })}
                    className="px-4 py-2 bg-pink-50 hover:bg-pink-100 text-[#E6007A] font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <span>Ver Detalhes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-zinc-200/60 text-zinc-500 text-xs">
            <Clock className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <p>Você ainda não realizou nenhum pedido com este e-mail.</p>
          </div>
        )}
      </div>
    </div>
  );
};
