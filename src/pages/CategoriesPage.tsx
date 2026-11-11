import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface CategoriesPageProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ onNavigate }) => {
  const { categories, products } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold text-[#E6007A] uppercase tracking-widest">Nossos Departamentos</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900 mt-1">
          Explore Todas as Categorias
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-2">
          Navegue pelas melhores seleções de cuidados faciais, corporais, velas decorativas e utilidades domésticas.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => {
          const count = products.filter((p) => p.category_id === cat.id && p.is_active).length;
          return (
            <div
              key={cat.id}
              onClick={() => onNavigate('categoria', { slug: cat.slug })}
              className="group relative rounded-3xl overflow-hidden bg-white border border-pink-100 shadow-sm hover:shadow-xl hover:border-pink-300 transition-all duration-300 cursor-pointer flex flex-col"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-pink-50">
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <span className="absolute bottom-3 left-4 text-white text-xs font-bold bg-[#E6007A] px-2.5 py-0.5 rounded-full shadow-sm">
                  {count} {count === 1 ? 'produto' : 'produtos'}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-zinc-900 group-hover:text-[#E6007A] transition-colors">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 flex items-center text-xs font-bold text-[#E6007A] group-hover:translate-x-1 transition-transform">
                  <span>Ver Coleção</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
