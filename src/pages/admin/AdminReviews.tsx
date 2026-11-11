import React, { useState } from 'react';
import { Star, CheckCircle2, XCircle, Clock, Check } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const AdminReviews: React.FC = () => {
  const { reviews, products, updateReviewStatus } = useAdmin();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const filtered = reviews.filter((r) => (filter === 'all' ? true : r.status === filter));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900">
            Moderação de Avaliações
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Novas avaliações começam pendentes e só aparecem na loja pública após sua aprovação.
          </p>
        </div>

        <div className="flex bg-zinc-100 p-1 rounded-xl text-xs font-semibold self-start">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'all' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600'
            }`}
          >
            Todas ({reviews.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'pending' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600'
            }`}
          >
            Pendentes ({reviews.filter((r) => r.status === 'pending').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('approved')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filter === 'approved' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-600'
            }`}
          >
            Aprovadas ({reviews.filter((r) => r.status === 'approved').length})
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((rev) => {
            const product = products.find((p) => p.id === rev.product_id);
            return (
              <div
                key={rev.id}
                className="p-5 rounded-3xl bg-white border border-zinc-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900">{rev.customer_name}</span>
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rev.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rev.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rev.status === 'approved' ? 'Aprovada' : rev.status === 'rejected' ? 'Rejeitada' : 'Pendente'}
                    </span>
                  </div>

                  <p className="text-zinc-700 leading-relaxed italic">"{rev.comment}"</p>
                  <p className="text-[11px] text-zinc-400">
                    Produto: <strong>{product?.name || 'Geral'}</strong> • {new Date(rev.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {rev.status !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => updateReviewStatus(rev.id, 'approved')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Aprovar</span>
                    </button>
                  )}
                  {rev.status !== 'rejected' && (
                    <button
                      type="button"
                      onClick={() => updateReviewStatus(rev.id, 'rejected')}
                      className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-rose-200"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Rejeitar</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-zinc-200/60 text-zinc-500 text-xs">
            Nenhuma avaliação encontrada com o filtro selecionado.
          </div>
        )}
      </div>
    </div>
  );
};
