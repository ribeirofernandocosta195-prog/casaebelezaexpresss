import React from 'react';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  RotateCcw,
  Instagram,
  Facebook,
  Mail,
  Phone,
  MapPin,
  Lock,
  QrCode,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { storeSettings } = useStore();

  return (
    <footer className="bg-white border-t border-pink-100 text-zinc-700 pt-14 pb-8">
      {/* Trust & Guarantee Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-zinc-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FFF0F6]/60 border border-pink-100/80">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#E6007A] shadow-sm flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900">Entrega Rápida Express</h4>
              <p className="text-xs text-zinc-500">Envio seguro com rastreamento para todo o Brasil.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FFF0F6]/60 border border-pink-100/80">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#E6007A] shadow-sm flex-shrink-0">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900">Pix Instantâneo Seguro</h4>
              <p className="text-xs text-zinc-500">Confirmação imediata e 5% de desconto especial.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FFF0F6]/60 border border-pink-100/80">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#E6007A] shadow-sm flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900">Compra 100% Garantida</h4>
              <p className="text-xs text-zinc-500">Seus dados protegidos com criptografia SSL 256 bits.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FFF0F6]/60 border border-pink-100/80">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#E6007A] shadow-sm flex-shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900">Troca Fácil em 7 Dias</h4>
              <p className="text-xs text-zinc-500">Satisfação garantida ou seu dinheiro de volta.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Presentation */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF3399] to-[#E6007A] flex items-center justify-center shadow-md shadow-pink-500/20">
                <span className="font-serif text-white font-bold text-base leading-none">C&B</span>
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-zinc-900">
                Casa <span className="text-[#E6007A]">&</span> Beleza Express
              </span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
              Sua loja virtual de referência para cuidar de você e do seu lar. Produtos de beleza inovadores, cosméticos selecionados e utilidades que agregam conforto, elegância e praticidade.
            </p>

            <div className="space-y-2 pt-2 text-xs text-zinc-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E6007A] flex-shrink-0" />
                <span>{storeSettings.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#E6007A] flex-shrink-0" />
                <span>{storeSettings.phone} | WhatsApp: {storeSettings.whatsapp}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#E6007A] flex-shrink-0" />
                <span>{storeSettings.email}</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              {storeSettings.instagram_url && (
                <a
                  href={storeSettings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-pink-50 hover:bg-[#E6007A] text-zinc-600 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Siga-nos no Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {storeSettings.facebook_url && (
                <a
                  href={storeSettings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-pink-50 hover:bg-[#E6007A] text-zinc-600 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Siga-nos no Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Section 1: Institucional */}
          <div>
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-4 border-l-2 border-[#E6007A] pl-2">
              Institucional
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('sobre-nos')}
                  className="hover:text-[#E6007A] transition-colors"
                >
                  Sobre Nós
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('como-comprar')}
                  className="hover:text-[#E6007A] transition-colors"
                >
                  Como Comprar
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('compra-garantida')}
                  className="hover:text-[#E6007A] transition-colors"
                >
                  Compra Garantida
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('trocas-e-devolucoes')}
                  className="hover:text-[#E6007A] transition-colors"
                >
                  Trocas e Devoluções
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('politica-de-privacidade')}
                  className="hover:text-[#E6007A] transition-colors"
                >
                  Política de Privacidade
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('termos-de-uso')}
                  className="hover:text-[#E6007A] transition-colors"
                >
                  Termos de Uso
                </button>
              </li>
            </ul>
          </div>

          {/* Section 2: Atendimento */}
          <div>
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-4 border-l-2 border-[#E6007A] pl-2">
              Atendimento
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contato')}
                  className="hover:text-[#E6007A] transition-colors"
                >
                  Fale Conosco
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('perguntas-frequentes')}
                  className="hover:text-[#E6007A] transition-colors"
                >
                  Perguntas Frequentes (FAQ)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('rastreio')}
                  className="hover:text-[#E6007A] transition-colors"
                >
                  Acompanhar Meu Pedido
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('minha-conta')}
                  className="hover:text-[#E6007A] transition-colors"
                >
                  Minha Conta
                </button>
              </li>
              <li>
                <a
                  href={`https://wa.me/55${storeSettings.whatsapp.replace(/\D/g, '')}?text=Ol%C3%A1%2C+gostaria+de+tirar+uma+d%C3%BAvida+sobre+um+produto+da+Casa+%26+Beleza+Express`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#E6007A] transition-colors font-medium text-pink-600 inline-block"
                >
                  WhatsApp Oficial
                </a>
              </li>
            </ul>
          </div>

          {/* Section 3: Informações */}
          <div>
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-4 border-l-2 border-[#E6007A] pl-2">
              Informações & Segurança
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('entrega-e-frete')}
                  className="hover:text-[#E6007A] transition-colors"
                >
                  Entrega e Frete
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('como-comprar')}
                  className="hover:text-[#E6007A] transition-colors"
                >
                  Formas de Pagamento
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('compra-garantida')}
                  className="hover:text-[#E6007A] transition-colors"
                >
                  Segurança & Privacidade
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('entrega-e-frete')}
                  className="hover:text-[#E6007A] transition-colors"
                >
                  Prazo de Envio
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('trocas-e-devolucoes')}
                  className="hover:text-[#E6007A] transition-colors"
                >
                  Política de Reembolso
                </button>
              </li>
            </ul>

            {/* Payment & Security Seals */}
            <div className="pt-6 space-y-2">
              <div className="flex items-center gap-2 text-[11px] text-zinc-600">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Ambiente Seguro SSL 256 bits</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-600">
                <CreditCard className="w-3.5 h-3.5 text-[#E6007A]" />
                <span>Pagamento Pix Instantâneo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
        <p>
          © {new Date().getFullYear()} {storeSettings.store_name}. Todos os direitos reservados. CNPJ: {storeSettings.cnpj}
        </p>
        <p className="text-[11px]">
          Desenvolvido com excelência técnica e segurança para comércio eletrônico.
        </p>
      </div>
    </footer>
  );
};
