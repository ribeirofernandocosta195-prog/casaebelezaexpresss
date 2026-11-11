import React from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useFavorites } from '../context/FavoritesContext';
import { ProductCard } from '../components/ProductCard';

interface FavoritesPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ onNavigate }) => {
  const { products } = useStore();
  const { favorites } = useFavorites();

  const favoritedProducts = products.filter((p) => favorites.includes(p.id) && p.is_active);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="pb-6 mb-8 border-b border-zinc-100 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#E6007A] uppercase tracking-widest">Sua Lista de Desejos</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 mt-1">
            Produtos Favoritos
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            {favoritedProducts.length} itens salvos para você não perder de vista.
          </p>
        </div>
      </div>

      {favoritedProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {favoritedProducts.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-zinc-50 rounded-3xl border border-zinc-200/70 p-8 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-pink-100 text-[#E6007A] flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-lg font-bold text-zinc-800">Sua lista de favoritos está vazia</h3>
          <p className="text-xs text-zinc-500 mt-1 mb-6 leading-relaxed">
            Clique no ícone de coração nos produtos para salvá-los aqui e acompanhar ofertas.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('catalogo')}
            className="px-6 py-2.5 bg-[#E6007A] hover:bg-[#D0006E] text-white text-xs font-bold rounded-full transition-colors flex items-center gap-2 mx-auto"
          >
            <span>Explorar Novidades</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
