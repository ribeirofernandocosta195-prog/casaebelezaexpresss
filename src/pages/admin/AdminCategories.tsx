import React, { useState } from 'react';
import { Plus, Edit, Trash2, X, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { Category } from '../../types/database';
import { useAdmin } from '../../context/AdminContext';
import { slugify } from '../../utils/validators';

export const AdminCategories: React.FC = () => {
  const { categories, saveCategory, deleteCategory } = useAdmin();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  const handleOpenCreate = () => {
    setEditingCategory({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      is_active: true,
      display_order: categories.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory({ ...category });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    await saveCategory(editingCategory);
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900">
            Gerenciamento de Categorias
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Crie, edite e organize a ordem de exibição dos departamentos da loja.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-[#E6007A] hover:bg-[#D0006E] text-white text-xs font-bold rounded-xl shadow-md shadow-pink-500/20 flex items-center gap-2 self-start transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-5 rounded-3xl bg-white border border-zinc-100 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-100">
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e'}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Ordem: {cat.display_order}
                </span>
                <span
                  className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    cat.is_active ? 'bg-emerald-500 text-white' : 'bg-zinc-600 text-white'
                  }`}
                >
                  {cat.is_active ? 'Ativa' : 'Inativa'}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-zinc-900">{cat.name}</h3>
                <p className="text-[11px] font-mono text-pink-600 mt-0.5">/{cat.slug}</p>
                {cat.description && (
                  <p className="text-xs text-zinc-500 mt-2 line-clamp-2">{cat.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-50">
              <button
                type="button"
                onClick={() => handleOpenEdit(cat)}
                className="p-1.5 text-zinc-400 hover:text-[#E6007A] rounded-lg hover:bg-pink-50"
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Deseja excluir a categoria "${cat.name}"?`)) {
                    deleteCategory(cat.id);
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

      {/* Category Modal */}
      {isModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-pink-100 overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-zinc-900">
                {editingCategory.id ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Nome da Categoria *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => {
                    const name = e.target.value;
                    setEditingCategory({
                      ...editingCategory,
                      name,
                      slug: slugify(name),
                    });
                  }}
                  className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Slug URL</label>
                <input
                  type="text"
                  required
                  value={editingCategory.slug || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">URL da Imagem</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={editingCategory.image_url || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, image_url: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Ordem de Exibição</label>
                  <input
                    type="number"
                    min="1"
                    value={editingCategory.display_order || 1}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        display_order: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-zinc-700">
                    <input
                      type="checkbox"
                      checked={editingCategory.is_active ?? true}
                      onChange={(e) =>
                        setEditingCategory({ ...editingCategory, is_active: e.target.checked })
                      }
                      className="rounded text-[#E6007A]"
                    />
                    <span>Ativa no site</span>
                  </label>
                </div>
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
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
