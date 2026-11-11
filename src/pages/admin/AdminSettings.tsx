import React, { useState } from 'react';
import { Save, CheckCircle2, Store, RefreshCw } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { initialProducts, initialCategories, initialBanners, initialStoreSettings } from '../../data/initialData';

export const AdminSettings: React.FC = () => {
  const { storeSettings, updateStoreSettings, saveProduct, saveCategory, saveBanner } = useAdmin();

  const [formData, setFormData] = useState({ ...storeSettings });
  const [success, setSuccess] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStoreSettings(formData);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleSeedDatabase = async () => {
    if (!confirm('Deseja restaurar as categorias, os 3 banners e os produtos iniciais de referência?')) return;
    setIsSeeding(true);

    try {
      for (const cat of initialCategories) {
        await saveCategory(cat);
      }
      for (const ban of initialBanners) {
        await saveBanner(ban);
      }
      for (const prod of initialProducts) {
        await saveProduct(prod);
      }
      setSeedMsg('Banco de dados populado com categorias, banners e produtos de referência com sucesso!');
    } catch {
      setSeedMsg('Erro ao restaurar dados.');
    } finally {
      setIsSeeding(false);
      setTimeout(() => setSeedMsg(null), 4000);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      <div className="pb-6 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900">
            Configurações da Loja
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Personalize a identidade da marca, dados de contato e mensagem da barra promocional.
          </p>
        </div>

        <button
          type="button"
          disabled={isSeeding}
          onClick={handleSeedDatabase}
          className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin text-[#E6007A]' : ''}`} />
          <span>Restaurar Dados Iniciais</span>
        </button>
      </div>

      {seedMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{seedMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-white border border-zinc-100 shadow-sm space-y-6 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Nome da Loja *</label>
            <input
              type="text"
              required
              value={formData.store_name}
              onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">CNPJ Comercial</label>
            <input
              type="text"
              value={formData.cnpj}
              onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">E-mail de Contato *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Número do WhatsApp *</label>
            <input
              type="text"
              required
              placeholder="11999998888"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Telefone Fixo / Central</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Endereço Comercial</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Instagram URL</label>
            <input
              type="url"
              value={formData.instagram_url}
              onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Facebook URL</label>
            <input
              type="url"
              value={formData.facebook_url}
              onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-semibold text-zinc-700 mb-1">
              Texto da Barra Promocional Superior (Topo da Loja)
            </label>
            <input
              type="text"
              value={formData.announcement_bar_text}
              onChange={(e) => setFormData({ ...formData, announcement_bar_text: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-zinc-800">
              <input
                type="checkbox"
                checked={formData.is_announcement_bar_active}
                onChange={(e) => setFormData({ ...formData, is_announcement_bar_active: e.target.checked })}
                className="rounded text-[#E6007A]"
              />
              <span>Exibir Barra Promocional no Topo do Site</span>
            </label>
          </div>
        </div>

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Configurações salvas e aplicadas imediatamente na loja virtual!</span>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-zinc-100">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#E6007A] hover:bg-[#D0006E] text-white font-bold rounded-xl shadow-md shadow-pink-500/20 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </form>
    </div>
  );
};
