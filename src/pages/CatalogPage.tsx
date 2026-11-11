import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, PackageSearch } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';

interface CatalogPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
  initialCategorySlug?: string;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ onNavigate, initialCategorySlug }) => {
  const { products, categories } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategorySlug || 'all');
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'newest'>('relevance');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyPromotional, setOnlyPromotional] = useState(false);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (!p.is_active) return false;
        if (selectedCategory !== 'all') {
          const cat = categories.find((c) => c.slug === selectedCategory);
          if (cat && p.category_id !== cat.id) return false;
        }
        if (onlyInStock && p.stock <= 0) return false;
        if (onlyPromotional && (!p.promotional_price || p.promotional_price >= p.price)) return false;
        return true;
      })
      .sort((a, b) => {
        const priceA = a.promotional_price || a.price;
        const priceB = b.promotional_price || b.price;
        if (sortBy === 'price_asc') return priceA - priceB;
        if (sortBy === 'price_desc') return priceB - priceA;
        if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return b.sales_count - a.sales_count;
      });
  }, [products, categories, selectedCategory, sortBy, onlyInStock, onlyPromotional]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Title & Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-zinc-100">
        <div>
          <span className="text-xs font-bold text-[#E6007A] uppercase tracking-widest">Loja Online</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 mt-1">
            Catálogo Completo
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Mostrando {filteredProducts.length} produtos selecionados com excelência.
          </p>
        </div>

        {/* Sort & Quick Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-700 outline-none focus:border-[#E6007A]"
            >
              <option value="relevance">Mais Populares</option>
              <option value="price_asc">Menor Preço</option>
              <option value="price_desc">Maior Preço</option>
              <option value="newest">Lançamentos Recentes</option>
            </select>
          </div>

          <label className="flex items-center gap-1.5 text-xs text-zinc-600 cursor-pointer bg-zinc-50 px-3 py-2 rounded-xl border border-zinc-200">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="rounded text-[#E6007A] focus:ring-[#E6007A]"
            />
            <span>Em Estoque</span>
          </label>

          <label className="flex items-center gap-1.5 text-xs text-zinc-600 cursor-pointer bg-zinc-50 px-3 py-2 rounded-xl border border-zinc-200">
            <input
              type="checkbox"
              checked={onlyPromotional}
              onChange={(e) => setOnlyPromotional(e.target.checked)}
              className="rounded text-[#E6007A] focus:ring-[#E6007A]"
            />
            <span>Com Desconto</span>
          </label>
        </div>
      </div>

      {/* Categories Filter Pills */}
      <div className="py-6 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-[#E6007A] text-white shadow-sm'
              : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
          }`}
        >
          Todas as Categorias
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.slug)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat.slug
                ? 'bg-[#E6007A] text-white shadow-sm'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-zinc-50 rounded-3xl border border-zinc-200/70 p-8 max-w-lg mx-auto">
          <PackageSearch className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-zinc-800">Nenhum produto encontrado</h3>
          <p className="text-xs text-zinc-500 mt-1 mb-4">
            Tente remover os filtros selecionados ou escolher outra categoria.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setOnlyInStock(false);
              setOnlyPromotional(false);
            }}
            className="px-5 py-2 bg-[#E6007A] text-white text-xs font-bold rounded-full"
          >
            Limpar Filtros
          </button>
        </div>
      )}
    </div>
  );
};
