import React from 'react';
import { ArrowLeft, PackageSearch } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';

interface CategoryDetailPageProps {
  slug: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const CategoryDetailPage: React.FC<CategoryDetailPageProps> = ({ slug, onNavigate }) => {
  const { categories, products } = useStore();

  const category = categories.find((c) => c.slug === slug);
  const categoryProducts = category
    ? products.filter((p) => p.category_id === category.id && p.is_active)
    : [];

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-zinc-900 mb-2">Categoria não encontrada</h2>
        <button
          type="button"
          onClick={() => onNavigate('categorias')}
          className="px-6 py-2.5 bg-[#E6007A] text-white font-bold text-xs rounded-full"
        >
          Ver Todas as Categorias
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Category Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-pink-100 via-[#FFF0F6] to-pink-50 p-8 sm:p-12 mb-10 border border-pink-200/60 shadow-sm">
        <button
          type="button"
          onClick={() => onNavigate('categorias')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-[#E6007A] mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para Categorias
        </button>

        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-zinc-900">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl mt-2 leading-relaxed">
            {category.description}
          </p>
        )}
        <div className="mt-4">
          <span className="inline-block text-xs font-bold text-[#E6007A] bg-white px-3 py-1 rounded-full shadow-sm border border-pink-100">
            {categoryProducts.length} produtos disponíveis
          </span>
        </div>
      </div>

      {/* Products Grid */}
      {categoryProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categoryProducts.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-zinc-50 rounded-3xl border border-zinc-200/70 p-8 max-w-md mx-auto">
          <PackageSearch className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-zinc-800">Nenhum produto nesta categoria</h3>
          <p className="text-xs text-zinc-500 mt-1 mb-4">
            Em breve novos lançamentos serão adicionados aqui.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('catalogo')}
            className="px-5 py-2 bg-[#E6007A] text-white text-xs font-bold rounded-full"
          >
            Explorar Catálogo
          </button>
        </div>
      )}
    </div>
  );
};
