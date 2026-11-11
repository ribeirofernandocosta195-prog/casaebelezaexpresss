import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const FloatingWhatsApp: React.FC = () => {
  const { storeSettings } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const cleanNumber = (storeSettings.whatsapp || '11999998888').replace(/\D/g, '');
  const initialText = encodeURIComponent(
    'Olá! Estava navegando na Casa & Beleza Express e gostaria de tirar uma dúvida sobre um produto.'
  );
  const whatsappUrl = `https://wa.me/55${cleanNumber}?text=${initialText}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Tooltip Dialog */}
      {isOpen && (
        <div className="mb-3 w-72 bg-white rounded-2xl shadow-2xl border border-pink-100 p-4 animate-fade-in relative text-zinc-800">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-600 p-1"
            aria-label="Fechar mensagem de atendimento"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
              CB
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900">Atendimento Express</p>
              <p className="text-[10px] text-emerald-600 font-medium">Online agora</p>
            </div>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed mb-3">
            Precisa de ajuda com sua compra, dúvidas sobre cosméticos ou entrega? Chame nossa equipe no WhatsApp!
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            Iniciar Conversa no WhatsApp
          </a>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 focus:outline-none"
        aria-label="Atendimento pelo WhatsApp"
        title="Atendimento WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="sr-only">Atendimento WhatsApp</span>
      </button>
    </div>
  );
};
