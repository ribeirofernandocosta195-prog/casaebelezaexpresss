import React from 'react';
import { Heart, ShoppingBag, Star, Sparkles } from 'lucide-react';
import { Product } from '../types/database';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { formatCurrencyBRL } from '../utils/validators';

interface ProductCardProps {
  product: Product;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate }) => {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const isFavorited = isFavorite(product.id);
  const isOutOfStock = product.stock <= 0;
  const hasPromo = Boolean(product.promotional_price && product.promotional_price < product.price);
  const effectivePrice = hasPromo ? product.promotional_price! : product.price;

  const discountPercent = hasPromo
    ? Math.round(((product.price - product.promotional_price!) / product.price) * 100)
    : 0;

  const handleCardClick = () => {
    onNavigate('produto', { slug: product.slug });
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product, 1);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl overflow-hidden border border-zinc-100/80 hover:border-pink-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_-6px_rgba(230,0,122,0.12)] transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Image Container with Badges */}
      <div className="relative aspect-square w-full overflow-hidden bg-zinc-50">
        <img
          src={product.image_url_1}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            // fallback image
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {hasPromo && (
            <span className="bg-gradient-to-r from-[#E6007A] to-[#D0006E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> -{discountPercent}%
            </span>
          )}
          {product.free_shipping && (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              Frete Grátis
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-zinc-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              Esgotado
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-colors z-10 shadow-sm ${
            isFavorited
              ? 'bg-[#E6007A] text-white'
              : 'bg-white/90 text-zinc-600 hover:text-[#E6007A] hover:bg-white'
          }`}
          aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Add Overlay on Hover for Desktop */}
        {!isOutOfStock && (
          <div className="absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
            <button
              type="button"
              onClick={handleQuickAdd}
              className="w-full py-2 bg-white/95 hover:bg-[#E6007A] text-zinc-900 hover:text-white backdrop-blur-sm text-xs font-bold rounded-xl shadow-md border border-pink-100 flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Adicionar ao Carrinho
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Subcategory */}
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-pink-600 truncate">
              {product.brand || 'Casa & Beleza'}
            </span>
            {product.sales_count > 10 && (
              <span className="text-[10px] bg-pink-50 text-pink-600 px-1.5 py-0.5 rounded-md font-medium">
                {product.sales_count} vendidos
              </span>
            )}
          </div>

          {/* Name */}
          <h3 className="font-medium text-xs sm:text-sm text-zinc-800 line-clamp-2 group-hover:text-[#E6007A] transition-colors leading-snug">
            {product.name}
          </h3>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 my-2">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-current" />
            ))}
          </div>
          <span className="text-[11px] text-zinc-400 font-medium">(5.0)</span>
        </div>

        {/* Pricing */}
        <div className="pt-2 border-t border-zinc-50">
          <div className="flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-bold text-zinc-900">
              {formatCurrencyBRL(effectivePrice)}
            </span>
            {hasPromo && (
              <span className="text-xs text-zinc-400 line-through">
                {formatCurrencyBRL(product.price)}
              </span>
            )}
          </div>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            ou 3x de {formatCurrencyBRL(effectivePrice / 3)} sem juros
          </p>

          {/* Mobile Quick Add Button */}
          <div className="mt-3 sm:hidden">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleQuickAdd}
              className={`w-full py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                isOutOfStock
                  ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                  : 'bg-[#FFF0F6] text-[#E6007A] active:bg-[#E6007A] active:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              {isOutOfStock ? 'Esgotado' : 'Comprar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
