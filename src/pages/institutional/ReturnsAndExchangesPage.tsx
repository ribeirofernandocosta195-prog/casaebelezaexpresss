import React from 'react';
import { RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ReturnsAndExchangesPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-[#E6007A] uppercase tracking-widest">Satisfação Garantida</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-zinc-900">
          Trocas e Devoluções
        </h1>
        <p className="text-sm text-zinc-500 max-w-xl mx-auto leading-relaxed">
          Nossa política foi desenvolvida para oferecer facilidade e segurança jurídica aos clientes.
        </p>
      </div>

      <div className="space-y-6 text-xs text-zinc-600 leading-relaxed">
        <div className="p-6 rounded-3xl bg-pink-50/70 border border-pink-100 flex items-start gap-4">
          <RotateCcw className="w-8 h-8 text-[#E6007A] flex-shrink-0 mt-1" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-zinc-900">Direito de Arrependimento em 7 Dias</h3>
            <p>
              Conforme previsto no Art. 49 do Código de Defesa do Consumidor, você pode solicitar a troca ou devolução do produto em até <strong>7 dias corridos</strong> após a entrega, sem custos de postagem de volta.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-serif text-base font-bold text-zinc-900">Condições para Devolução</h3>
          <ul className="list-disc list-inside space-y-2 text-zinc-600">
            <li>O produto deve estar na embalagem original, lacrado (no caso de cosméticos e skincare por questões higiênicas e sanitárias), sem indícios de uso indevido.</li>
            <li>Acompanhado de todos os acessórios, manuais e brindes eventualmente enviados.</li>
            <li>Para iniciar o processo, envie uma mensagem para <strong>contato@casabelezexpress.com.br</strong> ou fale diretamente pelo WhatsApp informando o número do seu pedido.</li>
          </ul>
        </div>

        <div className="space-y-4 pt-4 border-t border-zinc-100">
          <h3 className="font-serif text-base font-bold text-zinc-900">Estorno do Valor Pago</h3>
          <p>
            Assim que a mercadoria retornar ao nosso centro de distribuição e passar pela conferência da equipe de qualidade (prazo de até 2 dias úteis), o estorno será realizado integralmente via chave Pix informada pelo titular da compra.
          </p>
        </div>
      </div>
    </div>
  );
};
