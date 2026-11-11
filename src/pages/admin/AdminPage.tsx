import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Image as ImageIcon,
  Star,
  Tag,
  Settings,
  CreditCard,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Lock,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useAdmin, AdminTab } from '../../context/AdminContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminBanners } from './AdminBanners';
import { AdminOrders } from './AdminOrders';
import { AdminCustomers } from './AdminCustomers';
import { AdminReviews } from './AdminReviews';
import { AdminCoupons } from './AdminCoupons';
import { AdminSettings } from './AdminSettings';
import { AdminPaymentNexum } from './AdminPaymentNexum';
import { AdminUsers } from './AdminUsers';

interface AdminPageProps {
  onNavigateHome: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigateHome }) => {
  const {
    isAuthenticated,
    currentAdmin,
    loginAsAdmin,
    logoutAdmin,
    activeTab,
    setActiveTab,
    orders,
    reviews,
  } = useAdmin();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@casabelezexpress.com.br');
  const [loginPass, setLoginPass] = useState('admin123');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    const res = await loginAsAdmin(loginEmail, loginPass);
    setIsSubmitting(false);

    if (!res.success) {
      setLoginError(res.error || 'Acesso negado. Credenciais inválidas.');
    }
  };

  // If not authenticated: show private login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-pink-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10 space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#E6007A] text-white flex items-center justify-center mx-auto shadow-lg shadow-pink-500/30">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-zinc-900">
              Painel Administrativo
            </h1>
            <p className="text-xs text-zinc-500">
              Área restrita exclusivamente para operadores autorizados da Casa & Beleza Express.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">E-mail Administrativo</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Senha de Acesso</label>
              <input
                type="password"
                required
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
              />
            </div>

            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-[#E6007A] to-[#D0006E] hover:from-[#D0006E] hover:to-[#B5005E] text-white text-xs font-bold rounded-xl shadow-lg shadow-pink-500/25 transition-all"
            >
              {isSubmitting ? 'Verificando permissões...' : 'Acessar Painel Seguro'}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-xs text-zinc-400 hover:text-zinc-600 font-medium"
            >
              ← Voltar para a loja pública
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pendingOrdersCount = orders.filter((o) => o.financial_status === 'Aguardando pagamento').length;
  const pendingReviewsCount = reviews.filter((r) => r.status === 'pending').length;

  const navItems: Array<{ tab: AdminTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }> = [
    { tab: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { tab: 'produtos', label: 'Produtos', icon: Package },
    { tab: 'categorias', label: 'Categorias', icon: Layers },
    { tab: 'pedidos', label: 'Pedidos', icon: ShoppingBag, badge: pendingOrdersCount },
    { tab: 'clientes', label: 'Clientes', icon: Users },
    { tab: 'banners', label: '3 Banners', icon: ImageIcon },
    { tab: 'avaliacoes', label: 'Avaliações', icon: Star, badge: pendingReviewsCount },
    { tab: 'cupons', label: 'Cupons', icon: Tag },
    { tab: 'configuracoes', label: 'Configurações', icon: Settings },
    { tab: 'pagamentos', label: 'Nexum Pay Pix', icon: CreditCard },
    { tab: 'administradores', label: 'Administradores', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col">
      {/* Top Admin Navbar */}
      <header className="bg-white border-b border-zinc-200/80 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF3399] to-[#E6007A] flex items-center justify-center text-white font-serif font-bold text-sm shadow-sm">
            C&B
          </div>
          <div>
            <span className="font-serif font-bold text-zinc-900 text-sm">
              Casa & Beleza Express
            </span>
            <span className="text-[10px] text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full font-bold ml-2">
              Painel Admin Privado
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onNavigateHome}
            className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <span>Ver Loja</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-3 pl-3 border-l border-zinc-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-zinc-900">{currentAdmin?.name}</p>
              <p className="text-[10px] text-zinc-400 capitalize">{currentAdmin?.role}</p>
            </div>
            <button
              type="button"
              onClick={logoutAdmin}
              className="p-2 text-zinc-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
              title="Sair do painel"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace (Sidebar + Content) */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-zinc-200/80 p-4 hidden md:flex flex-col justify-between shrink-0">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  type="button"
                  onClick={() => setActiveTab(item.tab)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#E6007A] text-white shadow-md shadow-pink-500/20'
                      : 'text-zinc-600 hover:bg-pink-50/50 hover:text-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 ? (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white text-[#E6007A]' : 'bg-pink-100 text-[#E6007A]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          <div className="pt-4 border-t border-zinc-100 text-[11px] text-zinc-400 text-center">
            Casa & Beleza Express v1.0
          </div>
        </aside>

        {/* Mobile Horizontal Tab Navigation */}
        <div className="md:hidden w-full bg-white border-b border-zinc-200 overflow-x-auto p-2 flex gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                type="button"
                onClick={() => setActiveTab(item.tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  isActive ? 'bg-[#E6007A] text-white' : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'produtos' && <AdminProducts />}
          {activeTab === 'categorias' && <AdminCategories />}
          {activeTab === 'pedidos' && <AdminOrders />}
          {activeTab === 'clientes' && <AdminCustomers />}
          {activeTab === 'banners' && <AdminBanners />}
          {activeTab === 'avaliacoes' && <AdminReviews />}
          {activeTab === 'cupons' && <AdminCoupons />}
          {activeTab === 'configuracoes' && <AdminSettings />}
          {activeTab === 'pagamentos' && <AdminPaymentNexum />}
          {activeTab === 'administradores' && <AdminUsers />}
        </main>
      </div>
    </div>
  );
};
