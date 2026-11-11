import React, { useState } from 'react';
import { Plus, Tag, Trash2, Edit, X, CheckCircle2 } from 'lucide-react';
import { Coupon } from '../../types/database';
import { useAdmin } from '../../context/AdminContext';
import { formatCurrencyBRL } from '../../utils/validators';

export const AdminCoupons: React.FC = () => {
  const { coupons, saveCoupon, deleteCoupon } = useAdmin();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);

  const handleOpenCreate = () => {
    setEditingCoupon({
      code: '',
      discount_type: 'percentage',
      discount_value: 10,
      min_order_value: 0,
      max_uses: 100,
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;
    await saveCoupon(editingCoupon);
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900">
            Cupons de Desconto
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Cadastre cupons promocionais em porcentagem ou valor fixo em reais com regras de pedido mínimo.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-[#E6007A] hover:bg-[#D0006E] text-white text-xs font-bold rounded-xl shadow-md shadow-pink-500/20 flex items-center gap-2 self-start transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Cupom</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-3xl bg-white border border-pink-100 shadow-sm flex flex-col justify-between space-y-4 text-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-bold text-[#E6007A] bg-pink-50 px-3 py-1 rounded-xl border border-pink-200">
                  {c.code}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    c.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {c.is_active ? 'Ativo' : 'Pausado'}
                </span>
              </div>

              <div className="pt-2 space-y-1 text-zinc-600">
                <p>
                  <strong>Desconto:</strong>{' '}
                  {c.discount_type === 'percentage'
                    ? `${c.discount_value}% OFF`
                    : formatCurrencyBRL(c.discount_value)}
                </p>
                {c.min_order_value ? (
                  <p>Pedido Mínimo: {formatCurrencyBRL(c.min_order_value)}</p>
                ) : null}
                <p>
                  Utilizações: <strong>{c.times_used}</strong> {c.max_uses ? `/ ${c.max_uses}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-50">
              <button
                type="button"
                onClick={() => {
                  setEditingCoupon({ ...c });
                  setIsModalOpen(true);
                }}
                className="p-1.5 text-zinc-400 hover:text-[#E6007A] rounded-lg hover:bg-pink-50"
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Deseja excluir o cupom "${c.code}"?`)) {
                    deleteCoupon(c.id);
                  }
                }}
                className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && editingCoupon && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-pink-100 overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-zinc-900">
                {editingCoupon.id ? 'Editar Cupom' : 'Novo Cupom'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Código do Cupom *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: VERAO15"
                  value={editingCoupon.code || ''}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A] uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Tipo de Desconto</label>
                  <select
                    value={editingCoupon.discount_type || 'percentage'}
                    onChange={(e) =>
                      setEditingCoupon({
                        ...editingCoupon,
                        discount_type: e.target.value as any,
                      })
                    }
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  >
                    <option value="percentage">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Valor do Desconto *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingCoupon.discount_value || 0}
                    onChange={(e) =>
                      setEditingCoupon({
                        ...editingCoupon,
                        discount_value: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Pedido Mínimo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingCoupon.min_order_value || 0}
                    onChange={(e) =>
                      setEditingCoupon({
                        ...editingCoupon,
                        min_order_value: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Limite de Usos</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ilimitado"
                    value={editingCoupon.max_uses ?? ''}
                    onChange={(e) =>
                      setEditingCoupon({
                        ...editingCoupon,
                        max_uses: e.target.value ? parseInt(e.target.value, 10) : undefined,
                      })
                    }
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-zinc-800">
                  <input
                    type="checkbox"
                    checked={editingCoupon.is_active ?? true}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, is_active: e.target.checked })}
                    className="rounded text-[#E6007A]"
                  />
                  <span>Cupom Ativo para uso no Checkout</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#E6007A] hover:bg-[#D0006E] text-white font-bold rounded-xl shadow-md"
                >
                  Salvar Cupom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
