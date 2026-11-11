import React, { useState } from 'react';
import { Image as ImageIcon, Eye, Save, Sparkles, CheckCircle2 } from 'lucide-react';
import { Banner } from '../../types/database';
import { useAdmin } from '../../context/AdminContext';

export const AdminBanners: React.FC = () => {
  const { banners, saveBanner } = useAdmin();

  // Selected banner slot to edit: banner_principal, banner_beleza, banner_casa
  const [activeSlot, setActiveSlot] = useState<'banner_principal' | 'banner_beleza' | 'banner_casa'>(
    'banner_principal'
  );

  const bannerData = banners.find((b) => b.slot_key === activeSlot) || {
    id: `banner-${activeSlot}`,
    slot_key: activeSlot,
    title: '',
    subtitle: '',
    button_text: 'Ver Mais',
    target_url: '/catalogo',
    image_url_desktop: '',
    image_url_mobile: '',
    is_active: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const [formData, setFormData] = useState<Banner>(bannerData);
  const [successMsg, setSuccessMsg] = useState(false);

  // Sync when activeSlot changes
  const handleSlotChange = (slot: 'banner_principal' | 'banner_beleza' | 'banner_casa') => {
    setActiveSlot(slot);
    const found = banners.find((b) => b.slot_key === slot);
    if (found) {
      setFormData(found);
    } else {
      setFormData({
        id: `banner-${slot}`,
        slot_key: slot,
        title: '',
        subtitle: '',
        button_text: 'Ver Mais',
        target_url: '/catalogo',
        image_url_desktop: '',
        image_url_mobile: '',
        is_active: true,
        display_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    setSuccessMsg(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveBanner(formData);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="pb-6 border-b border-zinc-100">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900">
          Gerenciamento dos 3 Banners Independentes
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Configure de forma totalmente autônoma o Banner Principal, Banner de Beleza e Banner de Casa.
        </p>
      </div>

      {/* Tabs for the 3 distinct banners */}
      <div className="flex bg-zinc-100 p-1.5 rounded-2xl max-w-xl text-xs font-bold">
        <button
          type="button"
          onClick={() => handleSlotChange('banner_principal')}
          className={`flex-1 py-2.5 rounded-xl transition-all ${
            activeSlot === 'banner_principal'
              ? 'bg-white text-[#E6007A] shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Banner 1 — Principal
        </button>
        <button
          type="button"
          onClick={() => handleSlotChange('banner_beleza')}
          className={`flex-1 py-2.5 rounded-xl transition-all ${
            activeSlot === 'banner_beleza'
              ? 'bg-white text-[#E6007A] shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Banner 2 — Beleza
        </button>
        <button
          type="button"
          onClick={() => handleSlotChange('banner_casa')}
          className={`flex-1 py-2.5 rounded-xl transition-all ${
            activeSlot === 'banner_casa'
              ? 'bg-white text-[#E6007A] shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Banner 3 — Casa & Decoração
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSave} className="p-6 rounded-3xl bg-white border border-zinc-100 shadow-sm space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Título do Banner *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Subtítulo / Descrição</label>
              <textarea
                rows={2}
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-zinc-700 mb-1">Texto do Botão (CTA)</label>
                <input
                  type="text"
                  value={formData.button_text || ''}
                  onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 mb-1">URL de Destino (Link)</label>
                <input
                  type="text"
                  value={formData.target_url || ''}
                  onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">URL da Imagem Desktop *</label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/..."
                value={formData.image_url_desktop}
                onChange={(e) => setFormData({ ...formData, image_url_desktop: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">URL da Imagem Mobile (Opcional)</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={formData.image_url_mobile || ''}
                onChange={(e) => setFormData({ ...formData, image_url_mobile: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-zinc-800">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-[#E6007A]"
                />
                <span>Banner Ativo na Página Inicial</span>
              </label>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#E6007A] hover:bg-[#D0006E] text-white font-bold rounded-xl shadow-md shadow-pink-500/20 flex items-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Banner</span>
              </button>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Banner salvo com sucesso e atualizado no site!</span>
              </div>
            )}
          </form>
        </div>

        {/* Right: Live Preview */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-[#E6007A]" />
            Pré-visualização em Tempo Real:
          </span>

          <div className="p-5 rounded-3xl bg-zinc-900 text-white shadow-xl space-y-3 relative overflow-hidden">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700">
              {formData.image_url_desktop ? (
                <img
                  src={formData.image_url_desktop}
                  alt={formData.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
                  Sem imagem configurada
                </div>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF3399]">
                {activeSlot.replace('_', ' ')}
              </span>
              <h3 className="font-serif text-lg font-bold leading-tight mt-1">
                {formData.title || 'Título do Banner'}
              </h3>
              <p className="text-xs text-zinc-300 mt-1 line-clamp-2">
                {formData.subtitle || 'Subtítulo descritivo do banner de promoção ou coleção.'}
              </p>
              <div className="mt-3">
                <span className="inline-block px-4 py-1.5 bg-[#E6007A] text-white text-[11px] font-bold rounded-full">
                  {formData.button_text || 'Ver Mais'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
