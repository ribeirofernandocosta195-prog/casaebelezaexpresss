import React, { useState } from 'react';
import {
  Heart,
  ShoppingBag,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { Product } from '../types/database';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { formatCurrencyBRL } from '../utils/validators';

interface ProductDetailPageProps {
  slug: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug, onNavigate }) => {
  const { getProductBySlug, reviews, submitReview } = useStore();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const product = getProductBySlug(slug);

  // Collect only valid registered images (from the 6 fields, ignoring empty/null)
  const registeredImages: string[] = product
    ? [
        product.image_url_1,
        product.image_url_2,
        product.image_url_3,
        product.image_url_4,
        product.image_url_5,
        product.image_url_6,
      ].filter((img): img is string => Boolean(img && img.trim().length > 0))
    : [];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [localCep, setLocalCep] = useState('');
  const [shippingResult, setShippingResult] = useState<{ standard: number; express: number } | null>(null);
  const [isCalculatingCep, setIsCalculatingCep] = useState(false);

  // Review submission state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-zinc-900 mb-2">Produto não encontrado</h2>
        <p className="text-zinc-500 text-sm mb-6">
          O produto que você procura não está disponível ou foi descontinuado.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('catalogo')}
          className="px-6 py-2.5 bg-[#E6007A] text-white font-bold text-xs rounded-full"
        >
          Voltar ao Catálogo
        </button>
      </div>
    );
  }

  const isFavorited = isFavorite(product.id);
  const isOutOfStock = product.stock <= 0;
  const hasPromo = Boolean(product.promotional_price && product.promotional_price < product.price);
  const effectivePrice = hasPromo ? product.promotional_price! : product.price;

  const currentImage = registeredImages[activeImageIndex] || product.image_url_1;

  // Filter approved reviews for this product
  const productReviews = reviews.filter((r) => r.product_id === product.id && r.status === 'approved');

  const handleCalculateCep = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = localCep.replace(/\D/g, '');
    if (clean.length !== 8) return;

    setIsCalculatingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setShippingResult({ standard: 19.90, express: 29.90 });
      }
    } catch {
      setShippingResult({ standard: 19.90, express: 29.90 });
    } finally {
      setIsCalculatingCep(false);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const varTitle = Object.entries(selectedVariations)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' / ');
    addToCart(product, quantity, varTitle || undefined);
    onNavigate('carrinho');
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    const varTitle = Object.entries(selectedVariations)
      .map(([k, v]) => `${k}: ${v}`)
      .join(' / ');
    addToCart(product, quantity, varTitle || undefined);
    onNavigate('checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    const res = await submitReview(product.id, reviewName, reviewRating, reviewComment);
    setReviewFeedback(res.message);
    setReviewName('');
    setReviewComment('');
  };

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % registeredImages.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + registeredImages.length) % registeredImages.length);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-6 overflow-x-auto">
        <button type="button" onClick={() => onNavigate('home')} className="hover:text-[#E6007A]">
          Início
        </button>
        <span>/</span>
        <button type="button" onClick={() => onNavigate('catalogo')} className="hover:text-[#E6007A]">
          Catálogo
        </button>
        <span>/</span>
        <span className="text-zinc-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Grid: Gallery on left, Details on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Image Gallery (Mandated with individual switcher, zoom, and no empty boxes) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Hero Image */}
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-zinc-50 border border-zinc-100 shadow-sm group">
            <img
              src={currentImage}
              alt={`${product.name} - Imagem ${activeImageIndex + 1}`}
              className="w-full h-full object-cover object-center cursor-zoom-in"
              onClick={() => setIsZoomOpen(true)}
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {hasPromo && (
                <span className="bg-[#E6007A] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> OFERTA ESPECIAL
                </span>
              )}
              {product.free_shipping && (
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  Frete Grátis
                </span>
              )}
            </div>

            {/* Zoom / Lightbox Trigger Button */}
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-zinc-700 shadow-sm flex items-center justify-center transition-colors"
              title="Ampliar imagem"
              aria-label="Ampliar imagem do produto"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Prev / Next Arrows if more than 1 image */}
            {registeredImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-zinc-800 shadow-md flex items-center justify-center transition-transform hover:scale-110"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-zinc-800 shadow-md flex items-center justify-center transition-transform hover:scale-110"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails row (NO empty placeholders, only registered images) */}
          {registeredImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {registeredImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-zinc-50 flex-shrink-0 border-2 transition-all ${
                    activeImageIndex === idx
                      ? 'border-[#E6007A] ring-2 ring-pink-100 scale-105'
                      : 'border-zinc-200/80 hover:border-pink-300'
                  }`}
                  aria-label={`Ver imagem ${idx + 1}`}
                >
                  <img src={imgUrl} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute bottom-1 inset-x-1 bg-black/60 text-white text-[9px] font-semibold text-center rounded py-0.5">
                      Principal
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Purchasing Details */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
              <span className="font-bold uppercase tracking-wider text-pink-600">
                {product.brand || 'Casa & Beleza Express'}
              </span>
              {product.sku && <span>SKU: {product.sku}</span>}
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating Stars & Quick Feedback */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs font-semibold text-zinc-700">5.0</span>
              <span className="text-xs text-zinc-400">({productReviews.length || 1} avaliações de clientes)</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF0F6]/60 border border-pink-100/90">
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-3xl sm:text-4xl font-extrabold text-[#E6007A]">
                {formatCurrencyBRL(effectivePrice)}
              </span>
              {hasPromo && (
                <span className="text-sm text-zinc-400 line-through">
                  {formatCurrencyBRL(product.price)}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-600 mt-1">
              ou até <strong>3x de {formatCurrencyBRL(effectivePrice / 3)}</strong> sem juros no cartão
            </p>
            <div className="mt-3 pt-3 border-t border-pink-200/60 flex items-center gap-2 text-xs font-bold text-emerald-700">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>5% de desconto imediato pagando no Pix via Nexum Pay</span>
            </div>
          </div>

          {/* Short description */}
          {product.short_description && (
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
              {product.short_description}
            </p>
          )}

          {/* Variations (e.g. Volume, Tonalidade, Fragrância) */}
          {product.variations && product.variations.length > 0 && (
            <div className="space-y-4 pt-2">
              {product.variations.map((v) => (
                <div key={v.id}>
                  <label className="block text-xs font-bold text-zinc-800 mb-2">
                    {v.name}: <span className="text-[#E6007A]">{selectedVariations[v.name] || v.options[0]}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {v.options.map((opt) => {
                      const isSelected = (selectedVariations[v.name] || v.options[0]) === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSelectedVariations({ ...selectedVariations, [v.name]: opt })}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                            isSelected
                              ? 'border-[#E6007A] bg-[#FFF0F6] text-[#E6007A] font-bold shadow-sm'
                              : 'border-zinc-200 hover:border-pink-300 text-zinc-700'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity & Stock Status */}
          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-zinc-800">Quantidade:</span>
              <div className="flex items-center border border-zinc-200 rounded-xl bg-white shadow-sm">
                <button
                  type="button"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-zinc-600 hover:text-[#E6007A] disabled:opacity-40"
                  aria-label="Diminuir quantidade"
                >
                  -
                </button>
                <span className="px-3 py-1.5 text-xs font-bold text-zinc-900 min-w-8 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= product.stock || isOutOfStock}
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3 py-1.5 text-zinc-600 hover:text-[#E6007A] disabled:opacity-40"
                  aria-label="Aumentar quantidade"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-xs">
              {product.stock > 0 ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Em estoque ({product.stock} un.)
                </span>
              ) : (
                <span className="text-rose-600 font-bold">Produto esgotado</span>
              )}
            </div>
          </div>

          {/* Action Buttons: Add to Cart & Buy Now */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              className={`w-full py-3.5 rounded-full text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                isOutOfStock
                  ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#E6007A] to-[#D0006E] hover:from-[#D0006E] hover:to-[#B5005E] text-white shadow-pink-500/25 hover:shadow-pink-500/40 hover:-translate-y-0.5'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Comprar Agora com Pix
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex-1 py-3 bg-white hover:bg-pink-50 text-[#E6007A] border-2 border-[#E6007A] text-xs font-bold rounded-full transition-colors flex items-center justify-center gap-2"
              >
                Adicionar ao Carrinho
              </button>

              <button
                type="button"
                onClick={() => toggleFavorite(product.id)}
                className={`px-4 py-3 rounded-full border transition-colors flex items-center justify-center ${
                  isFavorited
                    ? 'bg-[#E6007A] text-white border-[#E6007A]'
                    : 'bg-white hover:bg-pink-50 text-zinc-600 border-zinc-200'
                }`}
                aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* CEP Shipping Calculator */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 space-y-3 text-xs">
            <span className="font-bold text-zinc-800 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#E6007A]" />
              Calcular Frete e Prazo de Entrega:
            </span>
            <form onSubmit={handleCalculateCep} className="flex gap-2">
              <input
                type="text"
                placeholder="00000-000"
                maxLength={9}
                value={localCep}
                onChange={(e) => setLocalCep(e.target.value)}
                className="flex-1 px-3 py-2 bg-white rounded-xl border border-zinc-200 text-xs outline-none focus:border-[#E6007A]"
              />
              <button
                type="submit"
                disabled={isCalculatingCep}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-900 text-white font-bold rounded-xl whitespace-nowrap transition-colors"
              >
                {isCalculatingCep ? 'Calculando...' : 'Calcular'}
              </button>
            </form>

            {shippingResult && (
              <div className="pt-2 space-y-1.5 text-[11px] text-zinc-700">
                <div className="flex justify-between p-2 rounded-lg bg-white border border-zinc-100">
                  <span>Entrega Padrão Express (3-6 dias úteis)</span>
                  <span className="font-bold text-emerald-600">{formatCurrencyBRL(shippingResult.standard)}</span>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-white border border-zinc-100">
                  <span>Sedex Rápido (1-3 dias úteis)</span>
                  <span className="font-bold text-zinc-900">{formatCurrencyBRL(shippingResult.express)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs: Description, Specs, Reviews */}
      <div className="mt-16 pt-10 border-t border-zinc-100">
        <div className="flex items-center gap-6 border-b border-zinc-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('desc')}
            className={`font-serif text-base sm:text-lg font-bold pb-2 -mb-3 transition-colors ${
              activeTab === 'desc'
                ? 'border-b-2 border-[#E6007A] text-[#E6007A]'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Descrição Completa
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`font-serif text-base sm:text-lg font-bold pb-2 -mb-3 transition-colors ${
              activeTab === 'specs'
                ? 'border-b-2 border-[#E6007A] text-[#E6007A]'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Especificações Técnicas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`font-serif text-base sm:text-lg font-bold pb-2 -mb-3 transition-colors ${
              activeTab === 'reviews'
                ? 'border-b-2 border-[#E6007A] text-[#E6007A]'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Avaliações ({productReviews.length})
          </button>
        </div>

        <div className="py-8">
          {activeTab === 'desc' && (
            <div className="prose prose-sm max-w-3xl text-zinc-700 leading-relaxed space-y-4">
              <p>{product.description}</p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-2xl bg-white rounded-2xl border border-zinc-100 overflow-hidden text-xs">
              <div className="grid grid-cols-2 p-3 bg-zinc-50 font-semibold text-zinc-700 border-b border-zinc-100">
                <span>Marca</span>
                <span className="text-zinc-900">{product.brand || 'Casa & Beleza'}</span>
              </div>
              <div className="grid grid-cols-2 p-3 border-b border-zinc-100">
                <span className="text-zinc-500">Subcategoria</span>
                <span className="text-zinc-900 font-medium">{product.subcategory || 'Geral'}</span>
              </div>
              <div className="grid grid-cols-2 p-3 bg-zinc-50 border-b border-zinc-100">
                <span className="text-zinc-500">Peso Estimado</span>
                <span className="text-zinc-900 font-medium">{(product.weight_kg || 0.3) * 1000}g</span>
              </div>
              <div className="grid grid-cols-2 p-3">
                <span className="text-zinc-500">Dimensões da Embalagem</span>
                <span className="text-zinc-900 font-medium">
                  {product.dimensions_cm
                    ? `${product.dimensions_cm.width} x ${product.dimensions_cm.height} x ${product.dimensions_cm.length} cm`
                    : 'Padrão Express'}
                </span>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Reviews List */}
              <div className="md:col-span-7 space-y-4">
                {productReviews.length > 0 ? (
                  productReviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-zinc-900">{rev.customer_name}</span>
                        <div className="flex text-amber-400">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed">{rev.comment}</p>
                      <span className="text-[10px] text-zinc-400 block">
                        {new Date(rev.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500 italic">
                    Ainda não há avaliações aprovadas para este produto. Seja a primeira a avaliar!
                  </p>
                )}
              </div>

              {/* Submit Review Form */}
              <div className="md:col-span-5 p-6 rounded-2xl bg-white border border-pink-100 shadow-sm">
                <h4 className="font-serif text-sm font-bold text-zinc-900 mb-3">Deixe sua Avaliação</h4>
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Seu Nome</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Ana Clara"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:border-[#E6007A] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Nota (1 a 5 estrelas)</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 focus:outline-none"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= reviewRating ? 'text-amber-400 fill-current' : 'text-zinc-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">Seu Comentário</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Conte o que achou do produto, fragrância, fixação ou acabamento..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:border-[#E6007A] outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-[#E6007A] hover:bg-[#D0006E] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                  >
                    Enviar Avaliação
                  </button>

                  {reviewFeedback && (
                    <p className="text-[11px] text-emerald-600 font-medium text-center">{reviewFeedback}</p>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / Zoom Modal */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/20 text-white hover:bg-white/40 flex items-center justify-center transition-colors"
            aria-label="Fechar zoom"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImage}
              alt={product.name}
              className="max-h-[85vh] w-auto object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};
