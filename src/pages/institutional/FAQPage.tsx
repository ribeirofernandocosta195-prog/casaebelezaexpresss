import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Como funciona o pagamento com Pix na Casa & Beleza Express?',
      a: 'Ao finalizar o pedido no checkout, nosso sistema gera um QR Code exclusivo e o código Pix Copia e Cola via Nexum Pay. Você tem até 30 minutos para concluir o pagamento no seu aplicativo de banco. A confirmação é instantânea e seu pedido é liberado para separação na hora.',
    },
    {
      q: 'Qual é o prazo de entrega dos produtos?',
      a: 'Para as regiões Sul e Sudeste, o prazo médio é de 3 a 6 dias úteis na Entrega Padrão e de 1 a 3 dias no Sedex Rápido. Para as demais regiões do Brasil, o prazo varia de 5 a 10 dias úteis. Você pode calcular o prazo exato inserindo seu CEP na página do produto ou no carrinho.',
    },
    {
      q: 'Como consigo frete grátis?',
      a: 'O frete grátis é concedido automaticamente para todas as compras acima de R$ 199,00, sem necessidade de cupom, válido para todo o território nacional.',
    },
    {
      q: 'Como acompanhar o rastreamento da minha encomenda?',
      a: 'Assim que a mercadoria é despachada nos Correios, você recebe o código de rastreamento no seu e-mail. Você também pode acessar a aba "Acompanhar Pedido" no cabeçalho ou rodapé e digitar seu número de pedido ou CPF.',
    },
    {
      q: 'Os cosméticos e produtos são originais?',
      a: 'Sim, 100% originais. Trabalhamos exclusivamente com marcas oficiais, formulações registradas na Anvisa e embalagens lacradas direto da fábrica.',
    },
    {
      q: 'Como solicito uma troca ou cancelamento?',
      a: 'Você tem até 7 dias corridos após o recebimento para solicitar a troca ou devolução gratuita. Basta nos chamar no WhatsApp ou enviar um e-mail para contato@casabelezexpress.com.br informando o número do pedido.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-[#E6007A] uppercase tracking-widest">Dúvidas Frequentes</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-zinc-900">
          Perguntas Frequentes (FAQ)
        </h1>
        <p className="text-sm text-zinc-500 max-w-xl mx-auto leading-relaxed">
          Encontre respostas rápidas para as principais dúvidas sobre pedidos, pagamentos e entregas.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-pink-100 shadow-sm transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full flex items-center justify-between text-left gap-4"
              >
                <span className="font-bold text-sm text-zinc-900 flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-[#E6007A] flex-shrink-0" />
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 transition-transform ${
                    isOpen ? 'rotate-180 text-[#E6007A]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="pt-3 mt-3 border-t border-zinc-100 text-xs text-zinc-600 leading-relaxed pl-6">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
