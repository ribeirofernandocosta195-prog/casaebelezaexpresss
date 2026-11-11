import React from 'react';
import { Search, PackageSearch } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';

interface SearchPageProps {
  query: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ query, onNavigate }) => {
  const { products, categories } = useStore();

  const q = (query || '').toLowerCase().trim();

  const searchResults = products.filter((p) => {
    if (!p.is_active) return false;
    if (!q) return true;

    const cat = categories.find((c) => c.id === p.category_id);
    const catName = cat ? cat.name.toLowerCase() : '';

    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.subcategory && p.subcategory.toLowerCase().includes(q)) ||
      catName.includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="pb-6 mb-8 border-b border-zinc-100 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#E6007A] uppercase tracking-widest">Resultado da Busca</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 mt-1">
            "{query}"
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Encontramos {searchResults.length} {searchResults.length === 1 ? 'produto' : 'produtos'} correspondentes.
          </p>
        </div>
      </div>

      {searchResults.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {searchResults.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-zinc-50 rounded-3xl border border-zinc-200/70 p-8 max-w-md mx-auto">
          <PackageSearch className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-zinc-800">Nenhum resultado para "{query}"</h3>
          <p className="text-xs text-zinc-500 mt-1 mb-6 leading-relaxed">
            Verifique a ortografia, tente termos mais genéricos ou explore nosso catálogo completo.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('catalogo')}
            className="px-6 py-2.5 bg-[#E6007A] text-white text-xs font-bold rounded-full"
          >
            Ver Todos os Produtos
          </button>
        </div>
      )}
    </div>
  );
};
