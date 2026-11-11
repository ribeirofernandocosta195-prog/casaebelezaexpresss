import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Settings } from 'lucide-react';

export const CookieConsent: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // always required
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('casa_beleza_cookie_consent_v1');
    if (!consent) {
      // Small timeout for smooth entrance
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(
      'casa_beleza_cookie_consent_v1',
      JSON.stringify({ essential: true, analytics: true, marketing: true, date: new Date().toISOString() })
    );
    setIsVisible(false);
  };

  const handleRejectNonEssential = () => {
    localStorage.setItem(
      'casa_beleza_cookie_consent_v1',
      JSON.stringify({ essential: true, analytics: false, marketing: false, date: new Date().toISOString() })
    );
    setIsVisible(false);
  };

  const handleSaveCustom = () => {
    localStorage.setItem(
      'casa_beleza_cookie_consent_v1',
      JSON.stringify({ ...preferences, date: new Date().toISOString() })
    );
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Consentimento de Cookies e Privacidade"
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-white/95 backdrop-blur-md border-t border-pink-100 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 max-w-3xl">
          <div className="p-2.5 rounded-xl bg-[#FFF0F6] text-[#E6007A] flex-shrink-0 mt-0.5">
            <Cookie className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              Sua privacidade é prioridade para a Casa & Beleza Express
              <ShieldCheck className="w-4 h-4 text-emerald-600 inline" />
            </h4>
            <p className="text-xs text-zinc-600 leading-relaxed mt-1">
              Utilizamos cookies essenciais para o funcionamento do carrinho, navegação segura e para melhorar sua experiência em nossa loja virtual, em conformidade com a LGPD (Lei nº 13.709/2018). Conheça nossa{' '}
              <button
                type="button"
                onClick={() => onNavigate('politica-de-privacidade')}
                className="text-[#E6007A] underline hover:text-[#D0006E] font-medium"
              >
                Política de Privacidade
              </button>
              .
            </p>

            {isCustomizing && (
              <div className="mt-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <label className="flex items-center gap-2 text-zinc-700">
                  <input type="checkbox" checked disabled className="rounded text-[#E6007A]" />
                  <span>Essenciais (Obrigatórios)</span>
                </label>
                <label className="flex items-center gap-2 text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="rounded text-[#E6007A] focus:ring-[#E6007A]"
                  />
                  <span>Métricas & Desempenho</span>
                </label>
                <label className="flex items-center gap-2 text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    className="rounded text-[#E6007A] focus:ring-[#E6007A]"
                  />
                  <span>Recomendações Pessoais</span>
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {!isCustomizing ? (
            <>
              <button
                type="button"
                onClick={() => setIsCustomizing(true)}
                className="px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 border border-zinc-200 rounded-xl hover:bg-zinc-50 flex items-center gap-1.5 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                Personalizar
              </button>
              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors"
              >
                Recusar Não Essenciais
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-5 py-2 text-xs font-bold text-white bg-[#E6007A] hover:bg-[#D0006E] rounded-xl transition-colors shadow-sm"
              >
                Aceitar Todos
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsCustomizing(false)}
                className="px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveCustom}
                className="px-5 py-2 text-xs font-bold text-white bg-[#E6007A] hover:bg-[#D0006E] rounded-xl transition-colors shadow-sm"
              >
                Salvar Preferências
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};
