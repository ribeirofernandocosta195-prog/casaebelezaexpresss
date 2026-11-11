import React, { useState, useEffect } from 'react';
import { StoreProvider } from './context/StoreContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { AdminProvider } from './context/AdminContext';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { CookieConsent } from './components/CookieConsent';

import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CategoryDetailPage } from './pages/CategoryDetailPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SearchPage } from './pages/SearchPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PixPaymentPage } from './pages/PixPaymentPage';
import { PaymentConfirmedPage } from './pages/PaymentConfirmedPage';
import { AccountPage } from './pages/AccountPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { ContactPage } from './pages/ContactPage';

import { AboutUsPage } from './pages/institutional/AboutUsPage';
import { HowToBuyPage } from './pages/institutional/HowToBuyPage';
import { GuaranteedPurchasePage } from './pages/institutional/GuaranteedPurchasePage';
import { ShippingAndDeliveryPage } from './pages/institutional/ShippingAndDeliveryPage';
import { ReturnsAndExchangesPage } from './pages/institutional/ReturnsAndExchangesPage';
import { PrivacyPolicyPage } from './pages/institutional/PrivacyPolicyPage';
import { TermsOfUsePage } from './pages/institutional/TermsOfUsePage';
import { FAQPage } from './pages/institutional/FAQPage';

import { AdminPage } from './pages/admin/AdminPage';

interface RouteState {
  page: string;
  params: Record<string, string>;
}

export function App() {
  const parseCurrentUrl = (): RouteState => {
    const path = window.location.pathname.replace(/^\/+/g, '').replace(/\/+$/g, '');
    const searchParams = new URLSearchParams(window.location.search);
    const params: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      params[key] = val;
    });

    if (!path || path === '') return { page: 'home', params };

    const parts = path.split('/');
    const mainSection = parts[0];

    if (mainSection === 'admin') return { page: 'admin', params };
    if (mainSection === 'catalogo') return { page: 'catalogo', params };
    if (mainSection === 'categorias') return { page: 'categorias', params };
    if (mainSection === 'categoria' && parts[1]) {
      return { page: 'categoria', params: { ...params, slug: parts[1] } };
    }
    if (mainSection === 'produto' && parts[1]) {
      return { page: 'produto', params: { ...params, slug: parts[1] } };
    }
    if (mainSection === 'busca') return { page: 'busca', params };
    if (mainSection === 'favoritos') return { page: 'favoritos', params };
    if (mainSection === 'carrinho') return { page: 'carrinho', params };
    if (mainSection === 'checkout') return { page: 'checkout', params };
    if (mainSection === 'pagamento' && parts[1]) {
      return { page: 'pagamento', params: { ...params, orderId: parts[1] } };
    }
    if (mainSection === 'pagamento-confirmado') return { page: 'pagamento-confirmado', params };
    if (mainSection === 'minha-conta') return { page: 'minha-conta', params };
    if (mainSection === 'rastreio' || mainSection === 'acompanhar-pedido') {
      return { page: 'rastreio', params };
    }
    if (mainSection === 'contato') return { page: 'contato', params };
    if (mainSection === 'sobre-nos') return { page: 'sobre-nos', params };
    if (mainSection === 'como-comprar') return { page: 'como-comprar', params };
    if (mainSection === 'compra-garantida') return { page: 'compra-garantida', params };
    if (mainSection === 'entrega-e-frete') return { page: 'entrega-e-frete', params };
    if (mainSection === 'trocas-e-devolucoes') return { page: 'trocas-e-devolucoes', params };
    if (mainSection === 'politica-de-privacidade') return { page: 'politica-de-privacidade', params };
    if (mainSection === 'termos-de-uso') return { page: 'termos-de-uso', params };
    if (mainSection === 'perguntas-frequentes' || mainSection === 'faq') {
      return { page: 'perguntas-frequentes', params };
    }

    return { page: 'home', params };
  };

  const [currentRoute, setCurrentRoute] = useState<RouteState>(parseCurrentUrl);

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(parseCurrentUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (page: string, params: Record<string, string> = {}) => {
    let targetPath = '/';

    if (page === 'home') targetPath = '/';
    else if (page === 'categoria' && params.slug) targetPath = `/categoria/${params.slug}`;
    else if (page === 'produto' && params.slug) targetPath = `/produto/${params.slug}`;
    else if (page === 'pagamento' && params.orderId) targetPath = `/pagamento/${params.orderId}`;
    else if (page === 'pagamento-confirmado' && params.orderId) {
      targetPath = `/pagamento-confirmado?orderId=${encodeURIComponent(params.orderId)}`;
    } else if (page === 'busca' && params.q) {
      targetPath = `/busca?q=${encodeURIComponent(params.q)}`;
    } else {
      targetPath = `/${page}`;
    }

    window.history.pushState({}, '', targetPath);
    setCurrentRoute({ page, params });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    const { page, params } = currentRoute;

    if (page === 'admin') {
      return <AdminPage onNavigateHome={() => navigateTo('home')} />;
    }

    switch (page) {
      case 'home':
        return <HomePage onNavigate={navigateTo} />;
      case 'catalogo':
        return <CatalogPage onNavigate={navigateTo} />;
      case 'categorias':
        return <CategoriesPage onNavigate={navigateTo} />;
      case 'categoria':
        return <CategoryDetailPage slug={params.slug || ''} onNavigate={navigateTo} />;
      case 'produto':
        return <ProductDetailPage slug={params.slug || ''} onNavigate={navigateTo} />;
      case 'busca':
        return <SearchPage query={params.q || ''} onNavigate={navigateTo} />;
      case 'favoritos':
        return <FavoritesPage onNavigate={navigateTo} />;
      case 'carrinho':
        return <CartPage onNavigate={navigateTo} />;
      case 'checkout':
        return <CheckoutPage onNavigate={navigateTo} />;
      case 'pagamento':
        return <PixPaymentPage orderId={params.orderId || ''} onNavigate={navigateTo} />;
      case 'pagamento-confirmado':
        return <PaymentConfirmedPage orderId={params.orderId || ''} onNavigate={navigateTo} />;
      case 'minha-conta':
        return <AccountPage onNavigate={navigateTo} />;
      case 'rastreio':
        return <OrderTrackingPage initialCode={params.code} onNavigate={navigateTo} />;
      case 'contato':
        return <ContactPage />;
      case 'sobre-nos':
        return <AboutUsPage />;
      case 'como-comprar':
        return <HowToBuyPage />;
      case 'compra-garantida':
        return <GuaranteedPurchasePage />;
      case 'entrega-e-frete':
        return <ShippingAndDeliveryPage />;
      case 'trocas-e-devolucoes':
        return <ReturnsAndExchangesPage />;
      case 'politica-de-privacidade':
        return <PrivacyPolicyPage />;
      case 'termos-de-uso':
        return <TermsOfUsePage />;
      case 'perguntas-frequentes':
        return <FAQPage />;
      default:
        return <HomePage onNavigate={navigateTo} />;
    }
  };

  const isAdminView = currentRoute.page === 'admin';

  return (
    <StoreProvider>
      <CartProvider>
        <FavoritesProvider>
          <AdminProvider>
            <div className="min-h-screen flex flex-col bg-[#FCFCFD] text-[#27272A]">
              {!isAdminView && (
                <Header onNavigate={navigateTo} currentPage={currentRoute.page} />
              )}

              <main className="flex-1">{renderContent()}</main>

              {!isAdminView && (
                <>
                  <Footer onNavigate={navigateTo} />
                  <FloatingWhatsApp />
                  <CookieConsent onNavigate={navigateTo} />
                </>
              )}
            </div>
          </AdminProvider>
        </FavoritesProvider>
      </CartProvider>
    </StoreProvider>
  );
}

export default App;
