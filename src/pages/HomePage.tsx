import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  QrCode,
  PackageCheck,
  Heart,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';

interface HomePageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { products, categories, getBannerBySlot, storeSettings, subscribeNewsletter } = useStore();
  const [newsletterEmail, setNewsletterEmail] = React.useState('');
  const [newsletterStatus, setNewsletterStatus] = React.useState<{ text: string; success: boolean } | null>(null);

  const bannerPrincipal = getBannerBySlot('banner_principal');
  const bannerBeleza = getBannerBySlot('banner_beleza');
  const bannerCasa = getBannerBySlot('banner_casa');

  // Product groups
  const bestSellers = products.filter((p) => p.is_active).slice(0, 4);
  const newArrivals = [...products].filter((p) => p.is_active).reverse().slice(0, 4);
  const onSaleProducts = products.filter((p) => p.is_active && (p.is_on_sale || p.promotional_price)).slice(0, 4);
  const featuredProducts = products.filter((p) => p.is_active && p.is_featured).slice(0, 4);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await subscribeNewsletter(newsletterEmail);
    setNewsletterStatus({ text: res.message, success: res.success });
    if (res.success) setNewsletterEmail('');
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. BANNER PRINCIPAL */}
      {bannerPrincipal && (
        <section className="relative w-full overflow-hidden bg-gradient-to-r from-pink-50 via-[#FFF0F6] to-pink-50 border-b border-pink-100/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm border border-pink-100 text-[#E6007A] text-xs font-bold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-[#E6007A]" />
                  <span>COLEÇÃO EXCLUSIVA 2026</span>
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900 tracking-tight leading-[1.15]">
                  {bannerPrincipal.title}
                </h1>
                <p className="text-sm sm:text-base text-zinc-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  {bannerPrincipal.subtitle}
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => onNavigate(bannerPrincipal.target_url?.replace('/', '') || 'catalogo')}
                    className="px-7 py-3.5 bg-gradient-to-r from-[#E6007A] to-[#D0006E] hover:from-[#D0006E] hover:to-[#B5005E] text-white text-sm font-bold rounded-full shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                  >
                    <span>{bannerPrincipal.button_text || 'Explorar Coleção'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('categorias')}
                    className="px-6 py-3.5 bg-white hover:bg-zinc-50 text-zinc-800 text-sm font-semibold rounded-full border border-pink-200 transition-colors"
                  >
                    Ver Departamentos
                  </button>
                </div>
              </div>

              {/* Banner Image */}
              <div className="lg:col-span-6 relative">
                <div className="relative mx-auto max-w-lg lg:max-w-none">
                  <div className="absolute -inset-4 bg-gradient-to-tr from-pink-300 to-rose-200 rounded-[32px] blur-2xl opacity-40"></div>
                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                    <img
                      src={bannerPrincipal.image_url_desktop}
                      alt={bannerPrincipal.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. CATEGORIAS EM DESTAQUE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-[#E6007A] tracking-widest uppercase">Departamentos</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 mt-1">
              Explore por Categoria
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('categorias')}
            className="text-xs font-bold text-[#E6007A] hover:text-[#D0006E] flex items-center gap-1 group"
          >
            Ver Todas
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.slice(0, 8).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onNavigate('categoria', { slug: cat.slug })}
              className="group flex flex-col items-center text-center p-3 rounded-2xl bg-white hover:bg-[#FFF0F6] border border-zinc-100 hover:border-pink-200 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-pink-50 mb-3 border-2 border-transparent group-hover:border-[#E6007A] transition-all p-0.5">
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e'}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-xs font-semibold text-zinc-800 group-hover:text-[#E6007A] line-clamp-1">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. PRODUTOS MAIS VENDIDOS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-[#E6007A] tracking-widest uppercase">Favoritos dos Clientes</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 mt-1">
              Mais Vendidos da Loja
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('catalogo')}
            className="text-xs font-bold text-[#E6007A] hover:text-[#D0006E] flex items-center gap-1 group"
          >
            Ver Catálogo
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {bestSellers.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.map((prod) => (
              <ProductCard key={prod.id} product={prod} onNavigate={onNavigate} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-zinc-200/60">
            <PackageCheck className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-zinc-700">Nenhum produto cadastrado ainda no banco de dados.</p>
            <p className="text-xs text-zinc-500 mt-1">Acesse o painel em /admin para cadastrar novos produtos.</p>
          </div>
        )}
      </section>

      {/* 4. BANNER DE BELEZA (Banner 2) */}
      {bannerBeleza && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-800 to-pink-950 text-white shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-12 items-center">
              <div className="p-8 sm:p-12 lg:p-16 md:col-span-7 space-y-4">
                <span className="inline-block px-3 py-1 rounded-full bg-[#E6007A] text-[11px] font-bold tracking-wider uppercase">
                  Cuidados & Skincare Glow
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                  {bannerBeleza.title}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-md leading-relaxed">
                  {bannerBeleza.subtitle}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onNavigate(bannerBeleza.target_url?.replace('/', '') || 'catalogo')}
                    className="px-6 py-3 bg-white hover:bg-pink-50 text-[#E6007A] text-xs font-bold rounded-full transition-colors shadow-md flex items-center gap-2"
                  >
                    <span>{bannerBeleza.button_text || 'Conhecer Linha Glow'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="md:col-span-5 h-64 md:h-full relative overflow-hidden">
                <img
                  src={bannerBeleza.image_url_desktop}
                  alt={bannerBeleza.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. NOVIDADES (Lançamentos Recentes) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-[#E6007A] tracking-widest uppercase">Acabaram de Chegar</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 mt-1">
              Novidades em Destaque
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('catalogo')}
            className="text-xs font-bold text-[#E6007A] hover:text-[#D0006E] flex items-center gap-1 group"
          >
            Ver Todos
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((prod) => (
            <ProductCard key={prod.id} product={prod} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* 6. BANNER DE CASA E UTILIDADES (Banner 3) */}
      {bannerCasa && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-50 via-rose-50 to-pink-50 border border-pink-100/80 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-12 items-center">
              <div className="p-8 sm:p-12 lg:p-16 md:col-span-7 space-y-4">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-600 text-white text-[11px] font-bold tracking-wider uppercase">
                  Casa, Aromas & Aconchego
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 leading-tight">
                  {bannerCasa.title}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 max-w-md leading-relaxed">
                  {bannerCasa.subtitle}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onNavigate(bannerCasa.target_url?.replace('/', '') || 'catalogo')}
                    className="px-6 py-3 bg-[#E6007A] hover:bg-[#D0006E] text-white text-xs font-bold rounded-full transition-colors shadow-md shadow-pink-500/20 flex items-center gap-2"
                  >
                    <span>{bannerCasa.button_text || 'Ver Coleção Casa'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="md:col-span-5 h-64 md:h-full relative overflow-hidden">
                <img
                  src={bannerCasa.image_url_desktop}
                  alt={bannerCasa.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 7. OFERTAS ESPECIAIS & PRODUTOS EM DESTAQUE */}
      {onSaleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold text-[#E6007A] tracking-widest uppercase">Preços Imperdíveis</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 mt-1">
                Ofertas & Promoções Especiais
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('catalogo')}
              className="text-xs font-bold text-[#E6007A] hover:text-[#D0006E] flex items-center gap-1 group"
            >
              Aproveitar Todas
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {onSaleProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}

      {/* 8. BENEFÍCIOS DA LOJA & INFORMAÇÕES DE ENTREGA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-pink-100 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#E6007A] uppercase tracking-widest">Nossa Promessa</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 mt-1">
              Por que comprar na Casa & Beleza Express?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-2">
              Compromisso com produtos autênticos, embalagens delicadas e entrega ágil para todo o país.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-[#FFF0F6]/50 border border-pink-100">
              <div className="w-14 h-14 rounded-2xl bg-white text-[#E6007A] flex items-center justify-center shadow-md shadow-pink-500/10 mb-4">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-sm text-zinc-900 mb-1">Frete Grátis & Rápido</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Frete gratuito nas compras a partir de R$ 199 com envio prioritário rastreado pelos Correios e transportadoras parceiras.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-[#FFF0F6]/50 border border-pink-100">
              <div className="w-14 h-14 rounded-2xl bg-white text-[#E6007A] flex items-center justify-center shadow-md shadow-pink-500/10 mb-4">
                <QrCode className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-sm text-zinc-900 mb-1">Pix com 5% de Desconto</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Pagamento seguro e imediato via Pix pela Nexum Pay com geração de QR Code e confirmação automática do seu pedido.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-[#FFF0F6]/50 border border-pink-100">
              <div className="w-14 h-14 rounded-2xl bg-white text-[#E6007A] flex items-center justify-center shadow-md shadow-pink-500/10 mb-4">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-sm text-zinc-900 mb-1">Garantia e Satisfação</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Produtos 100% originais e garantia incondicional de 7 dias para trocas ou devoluções sem complicações.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. ATENDIMENTO WHATSAPP CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-emerald-600/20">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold">
              Precisa de ajuda para escolher seu produto?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-lg leading-relaxed">
              Nossa equipe de consultoras de beleza e decoração está pronta para te atender de forma exclusiva no WhatsApp.
            </p>
          </div>
          <a
            href={`https://wa.me/55${storeSettings.whatsapp.replace(/\D/g, '')}?text=Ol%C3%A1%2C+preciso+de+ajuda+para+escolher+um+produto+na+Casa+%26+Beleza+Express`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 bg-white text-emerald-700 hover:bg-emerald-50 text-xs font-bold rounded-full shadow-md flex items-center gap-2.5 transition-colors whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            Falar com Consultora no WhatsApp
          </a>
        </div>
      </section>

      {/* 10. NEWSLETTER EXCLUSIVA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="p-8 sm:p-10 rounded-3xl bg-pink-50/70 border border-pink-200/60">
          <span className="text-xs font-bold text-[#E6007A] uppercase tracking-wider">Clube Casa & Beleza</span>
          <h3 className="font-serif text-2xl font-bold text-zinc-900 mt-1 mb-2">
            Receba Cupons e Lançamentos em Primeira Mão
          </h3>
          <p className="text-xs text-zinc-600 max-w-md mx-auto mb-6">
            Cadastre seu e-mail e ganhe 10% de desconto na sua primeira compra com o cupom <strong>BEMVINDA10</strong>.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              required
              placeholder="Seu melhor e-mail aqui..."
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-white rounded-full text-xs text-zinc-800 border border-pink-200 focus:outline-none focus:border-[#E6007A]"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#E6007A] hover:bg-[#D0006E] text-white text-xs font-bold rounded-full transition-colors whitespace-nowrap shadow-sm"
            >
              Quero Desconto
            </button>
          </form>

          {newsletterStatus && (
            <p className={`text-xs mt-3 font-medium ${newsletterStatus.success ? 'text-emerald-600' : 'text-rose-600'}`}>
              {newsletterStatus.text}
            </p>
          )}
        </div>
      </section>
    </div>
  );
};
