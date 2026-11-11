import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
} from 'lucide-react';
import { Product } from '../../types/database';
import { useAdmin } from '../../context/AdminContext';
import { formatCurrencyBRL, slugify } from '../../utils/validators';
import { uploadImageToStorage } from '../../services/supabase';

export const AdminProducts: React.FC = () => {
  const { products, categories, saveProduct, deleteProduct, duplicateProduct, updateStock } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Filter products
  const filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q));

    const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenCreate = () => {
    setEditingProduct({
      name: '',
      slug: '',
      sku: '',
      description: '',
      short_description: '',
      category_id: categories[0]?.id || null,
      subcategory: '',
      brand: 'Casa & Beleza',
      price: 0,
      promotional_price: null,
      stock: 10,
      weight_kg: 0.3,
      dimensions_cm: { width: 10, height: 10, length: 15 },
      // Exactly 6 distinct image fields
      image_url_1: '',
      image_url_2: '',
      image_url_3: '',
      image_url_4: '',
      image_url_5: '',
      image_url_6: '',
      variations: [],
      is_active: true,
      is_featured: false,
      is_on_sale: false,
      free_shipping: false,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct({ ...product });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editingProduct.image_url_1?.trim()) {
      setFormError('A Imagem 1 (URL Principal) é obrigatória.');
      return;
    }

    const res = await saveProduct(editingProduct);
    if (res.success) {
      setIsModalOpen(false);
      setEditingProduct(null);
    } else {
      setFormError(res.error || 'Erro ao salvar produto.');
    }
  };

  // Image upload helper to Supabase Storage
  const handleUploadField = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: keyof Product, index: number) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    setIsUploading(index);
    const { url, error } = await uploadImageToStorage(file, 'products');
    setIsUploading(null);

    if (url) {
      setEditingProduct({ ...editingProduct, [fieldKey]: url });
    } else {
      alert(error || 'Não foi possível fazer upload para o Supabase Storage. Insira uma URL externa.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Bar with Search & Add Product Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900">
            Gerenciamento de Produtos
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Cadastre e edite produtos com os 6 campos obrigatórios de imagens e controle de estoque.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-[#E6007A] hover:bg-[#D0006E] text-white text-xs font-bold rounded-xl shadow-md shadow-pink-500/20 flex items-center gap-2 self-start transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Produto</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Buscar por nome, SKU ou marca..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs outline-none focus:border-[#E6007A]"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-auto bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-700 outline-none focus:border-[#E6007A]"
        >
          <option value="all">Todas as Categorias</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-500 uppercase tracking-wider font-semibold border-b border-zinc-100 text-[11px]">
              <tr>
                <th className="p-4">Produto</th>
                <th className="p-4">Preço</th>
                <th className="p-4">Estoque</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 text-zinc-700">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-pink-50/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.image_url_1}
                        alt={prod.name}
                        className="w-12 h-12 rounded-xl object-cover bg-zinc-100 border border-zinc-100 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-900 truncate max-w-xs">{prod.name}</p>
                        <p className="text-[11px] text-zinc-400">
                          SKU: {prod.sku || 'N/A'} • {prod.brand || 'Casa & Beleza'}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 font-semibold">
                    <div>
                      <span className="text-zinc-900">
                        {formatCurrencyBRL(prod.promotional_price || prod.price)}
                      </span>
                      {prod.promotional_price && (
                        <span className="text-[10px] text-zinc-400 line-through block">
                          {formatCurrencyBRL(prod.price)}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        value={prod.stock}
                        onChange={(e) => updateStock(prod.id, parseInt(e.target.value, 10) || 0)}
                        className="w-16 px-2 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-bold text-center"
                      />
                      <span className="text-[11px] text-zinc-400">un.</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        prod.is_active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {prod.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => duplicateProduct(prod.id)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100"
                        title="Duplicar"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(prod)}
                        className="p-1.5 text-zinc-400 hover:text-[#E6007A] rounded-lg hover:bg-pink-50"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Deseja realmente excluir "${prod.name}"?`)) {
                            deleteProduct(prod.id);
                          }
                        }}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Edit / Creation Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-pink-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h2 className="font-serif text-xl font-bold text-zinc-900">
                {editingProduct.id ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveSubmit} className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              {/* Mandatory 6 Image URL Fields Section */}
              <div className="p-5 rounded-2xl bg-[#FFF0F6]/60 border border-pink-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#E6007A]" />
                      Campos Individuais de Imagens (Exatamente 6 Campos)
                    </h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Cadastre URLs externas ou envie imagens para o Storage. Apenas a Imagem 1 é obrigatória.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { key: 'image_url_1', label: 'Imagem 1 — URL Principal (Obrigatória)', req: true, idx: 1 },
                    { key: 'image_url_2', label: 'Imagem 2 — URL Adicional', req: false, idx: 2 },
                    { key: 'image_url_3', label: 'Imagem 3 — URL Adicional', req: false, idx: 3 },
                    { key: 'image_url_4', label: 'Imagem 4 — URL Adicional', req: false, idx: 4 },
                    { key: 'image_url_5', label: 'Imagem 5 — URL Adicional', req: false, idx: 5 },
                    { key: 'image_url_6', label: 'Imagem 6 — URL Adicional', req: false, idx: 6 },
                  ].map((field) => {
                    const imgVal = (editingProduct as any)[field.key] || '';
                    return (
                      <div key={field.key} className="p-3.5 bg-white rounded-2xl border border-zinc-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="font-semibold text-zinc-800 text-[11px] truncate">
                            {field.label}
                          </label>
                          {field.req && (
                            <span className="text-[9px] bg-[#E6007A] text-white px-1.5 py-0.5 rounded font-bold">
                              Principal
                            </span>
                          )}
                        </div>

                        {/* Image Preview Box */}
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 flex items-center justify-center">
                          {imgVal ? (
                            <img
                              src={imgVal}
                              alt={field.label}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                          ) : (
                            <span className="text-[10px] text-zinc-400">Sem imagem cadastrada</span>
                          )}
                        </div>

                        {/* Input URL */}
                        <input
                          type="url"
                          required={field.req}
                          placeholder="https://..."
                          value={imgVal}
                          onChange={(e) => setEditingProduct({ ...editingProduct, [field.key]: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs outline-none focus:border-[#E6007A]"
                        />

                        {/* Storage Upload & Remove Buttons */}
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <label className="text-[10px] font-semibold text-[#E6007A] hover:underline cursor-pointer flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            <span>{isUploading === field.idx ? 'Enviando...' : 'Fazer Upload'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleUploadField(e, field.key as any, field.idx)}
                            />
                          </label>

                          {imgVal && (
                            <button
                              type="button"
                              onClick={() => setEditingProduct({ ...editingProduct, [field.key]: '' })}
                              className="text-[10px] text-rose-600 hover:underline"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* General Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-zinc-700 mb-1">Nome do Produto *</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => {
                      const name = e.target.value;
                      setEditingProduct({
                        ...editingProduct,
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
                    value={editingProduct.slug || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Categoria Principal</label>
                  <select
                    value={editingProduct.category_id || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Marca</label>
                  <input
                    type="text"
                    value={editingProduct.brand || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Preço Normal (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Preço Promocional (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Opcional"
                    value={editingProduct.promotional_price ?? ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        promotional_price: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Estoque Disponível *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editingProduct.stock || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.weight_kg || 0.3}
                    onChange={(e) => setEditingProduct({ ...editingProduct, weight_kg: parseFloat(e.target.value) || 0.3 })}
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-zinc-700 mb-1">Descrição Curta</label>
                  <input
                    type="text"
                    value={editingProduct.short_description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, short_description: e.target.value })}
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-zinc-700 mb-1">Descrição Completa</label>
                  <textarea
                    rows={4}
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-700">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_active ?? true}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_active: e.target.checked })}
                    className="rounded text-[#E6007A]"
                  />
                  <span>Produto Ativo</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-700">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_featured ?? false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })}
                    className="rounded text-[#E6007A]"
                  />
                  <span>Destaque</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-700">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_on_sale ?? false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_on_sale: e.target.checked })}
                    className="rounded text-[#E6007A]"
                  />
                  <span>Em Promoção</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-700">
                  <input
                    type="checkbox"
                    checked={editingProduct.free_shipping ?? false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, free_shipping: e.target.checked })}
                    className="rounded text-[#E6007A]"
                  />
                  <span>Frete Grátis</span>
                </label>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#E6007A] hover:bg-[#D0006E] text-white font-bold rounded-xl shadow-md shadow-pink-500/20"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
