import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Phone,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { formatCurrencyBRL } from '../utils/validators';

interface HeaderProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { storeSettings, categories, products, customerUser } = useStore();
  const { totalItemsCount } = useCart();
  const { favorites } = useFavorites();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Filter products for live suggestions
  const searchSuggestions = searchQuery.trim().length >= 2
    ? products
        .filter((p) => {
          const q = searchQuery.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            (p.brand && p.brand.toLowerCase().includes(q)) ||
            (p.subcategory && p.subcategory.toLowerCase().includes(q))
          );
        })
        .slice(0, 5)
    : [];

  // Close search suggestions on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      onNavigate('busca', { q: searchQuery.trim() });
    }
  };

  const handleSelectSuggestion = (slug: string) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    onNavigate('produto', { slug });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md shadow-[0_2px_15px_-3px_rgba(0,0,0,0.06)] border-b border-pink-100">
      {/* Top Promotional / Announcement Bar */}
      {storeSettings.is_announcement_bar_active && storeSettings.announcement_bar_text && (
        <div className="bg-gradient-to-r from-[#D0006E] via-[#E6007A] to-[#FF2D92] text-white text-xs sm:text-sm font-medium py-2 px-4 text-center tracking-wide flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>{storeSettings.announcement_bar_text}</span>
          <Sparkles className="w-3.5 h-3.5 animate-pulse hidden sm:inline" />
        </div>
      )}

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-zinc-700 hover:text-[#E6007A] focus:outline-none"
            aria-label="Abrir menu de navegação"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo & Brand Identity */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 text-left focus:outline-none group"
            aria-label="Página Inicial Casa & Beleza Express"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#FF3399] to-[#E6007A] p-0.5 shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <span className="font-serif text-[#E6007A] font-bold text-lg sm:text-xl leading-none">C&B</span>
              </div>
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 block leading-tight">
                Casa <span className="text-[#E6007A]">&</span> Beleza
              </span>
              <span className="text-[10px] tracking-[0.25em] uppercase text-zinc-400 font-semibold block">
                Express
              </span>
            </div>
          </button>

          {/* Search Bar with Autocomplete Dropdown */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-lg mx-6 relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                placeholder="Buscar cosméticos, velas, maquiagem ou utilidades..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full pl-11 pr-24 py-2.5 bg-[#F5F5F7] border border-transparent focus:border-[#E6007A] focus:bg-white rounded-full text-sm text-zinc-800 placeholder-zinc-400 outline-none transition-all duration-200"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#E6007A] hover:bg-[#D0006E] text-white text-xs font-semibold rounded-full transition-colors"
              >
                Buscar
              </button>
            </form>

            {/* Suggestions Modal */}
            {isSearchOpen && searchSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-pink-100 p-2 z-50 overflow-hidden">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Sugestões de Produtos
                </div>
                {searchSuggestions.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(prod.slug)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-[#FFF0F6] rounded-xl text-left transition-colors group"
                  >
                    <img
                      src={prod.image_url_1}
                      alt={prod.name}
                      className="w-10 h-10 rounded-lg object-cover bg-zinc-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-zinc-800 truncate group-hover:text-[#E6007A]">
                        {prod.name}
                      </p>
                      <p className="text-xs font-semibold text-[#E6007A]">
                        {formatCurrencyBRL(prod.promotional_price || prod.price)}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-[#E6007A]" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Wishlist / Favoritos */}
            <button
              type="button"
              onClick={() => onNavigate('favoritos')}
              className="relative p-2.5 text-zinc-700 hover:text-[#E6007A] hover:bg-pink-50 rounded-full transition-colors"
              aria-label="Ver produtos favoritos"
              title="Favoritos"
            >
              <Heart className="w-5 h-5" />
              {favorites.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#E6007A] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Minha Conta */}
            <button
              type="button"
              onClick={() => onNavigate('minha-conta')}
              className="relative p-2.5 text-zinc-700 hover:text-[#E6007A] hover:bg-pink-50 rounded-full transition-colors hidden sm:flex items-center gap-2 text-xs font-medium"
              aria-label="Acessar minha conta"
            >
              <User className="w-5 h-5" />
              <span className="hidden xl:inline text-zinc-700">
                {customerUser ? `Olá, ${customerUser.name}` : 'Minha Conta'}
              </span>
            </button>

            {/* Carrinho */}
            <button
              type="button"
              onClick={() => onNavigate('carrinho')}
              className="relative flex items-center gap-2.5 pl-3 pr-4 py-2 bg-[#FFF0F6] hover:bg-[#FFE0ED] text-[#E6007A] rounded-full transition-colors border border-pink-200"
              aria-label={`Carrinho com ${totalItemsCount} itens`}
            >
              <ShoppingBag className="w-5 h-5 text-[#E6007A]" />
              <span className="text-xs font-bold text-[#E6007A]">
                {totalItemsCount} <span className="hidden sm:inline">itens</span>
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="O que você procura hoje?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-20 py-2 bg-[#F5F5F7] border border-transparent focus:border-[#E6007A] focus:bg-white rounded-full text-xs text-zinc-800 outline-none"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#E6007A] text-white text-[11px] font-semibold rounded-full"
            >
              Buscar
            </button>
          </form>
        </div>

        {/* Desktop Category Navigation Bar */}
        <nav className="hidden lg:flex items-center justify-between border-t border-pink-50 py-2.5 text-xs font-medium text-zinc-600">
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-none py-1">
            <button
              type="button"
              onClick={() => onNavigate('catalogo')}
              className={`hover:text-[#E6007A] transition-colors whitespace-nowrap font-semibold ${
                currentPage === 'catalogo' ? 'text-[#E6007A]' : ''
              }`}
            >
              Todos os Produtos
            </button>
            {categories.slice(0, 7).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => onNavigate('categoria', { slug: cat.slug })}
                className="hover:text-[#E6007A] transition-colors whitespace-nowrap"
              >
                {cat.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onNavigate('categorias')}
              className="hover:text-[#E6007A] transition-colors font-medium text-pink-600 whitespace-nowrap"
            >
              + Ver Categorias
            </button>
          </div>

          <div className="flex items-center gap-4 text-zinc-500 text-[11px]">
            <button
              type="button"
              onClick={() => onNavigate('rastreio')}
              className="hover:text-[#E6007A] transition-colors"
            >
              Rastrear Pedido
            </button>
            <span className="text-zinc-300">|</span>
            <button
              type="button"
              onClick={() => onNavigate('contato')}
              className="hover:text-[#E6007A] transition-colors flex items-center gap-1"
            >
              <Phone className="w-3 h-3 text-[#E6007A]" />
              Atendimento
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[110px] z-50 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-4/5 max-w-sm h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <span className="font-serif text-lg font-bold text-zinc-900">Departamentos</span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-zinc-400 hover:text-zinc-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate('home');
                  }}
                  className="w-full text-left py-2 px-3 rounded-lg hover:bg-[#FFF0F6] text-sm font-semibold text-zinc-800 hover:text-[#E6007A]"
                >
                  Página Inicial
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNavigate('catalogo');
                  }}
                  className="w-full text-left py-2 px-3 rounded-lg hover:bg-[#FFF0F6] text-sm font-semibold text-[#E6007A]"
                >
                  Catálogo Completo
                </button>

                <div className="pt-2 pb-1 text-[11px] font-bold text-zinc-400 uppercase tracking-wider px-3">
                  Categorias
                </div>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onNavigate('categoria', { slug: cat.slug });
                    }}
                    className="w-full text-left py-2 px-3 rounded-lg hover:bg-[#FFF0F6] text-sm text-zinc-700 hover:text-[#E6007A] flex items-center justify-between"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="w-4 h-4 text-zinc-300" />
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-4 space-y-2 text-xs text-zinc-600">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('minha-conta');
                }}
                className="w-full text-left py-2 px-3 rounded-lg hover:bg-zinc-50 flex items-center gap-2 font-medium"
              >
                <User className="w-4 h-4 text-[#E6007A]" />
                Minha Conta / Pedidos
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigate('rastreio');
                }}
                className="w-full text-left py-2 px-3 rounded-lg hover:bg-zinc-50 flex items-center gap-2 font-medium"
              >
                <Search className="w-4 h-4 text-[#E6007A]" />
                Rastrear Meu Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
