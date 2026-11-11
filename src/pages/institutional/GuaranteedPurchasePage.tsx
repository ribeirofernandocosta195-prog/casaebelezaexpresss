import React from 'react';
import { ShieldCheck, CheckCircle2, Lock, Scale, RotateCcw } from 'lucide-react';

export const GuaranteedPurchasePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Segurança & Direitos</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-zinc-900">
          Compra Garantida Casa & Beleza Express
        </h1>
        <p className="text-sm text-zinc-500 max-w-xl mx-auto leading-relaxed">
          Compre com total serenidade: seus direitos são assegurados por lei e respeitados em cada detalhe.
        </p>
      </div>

      <div className="space-y-6 text-xs text-zinc-600 leading-relaxed">
        <div className="p-6 rounded-3xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-4">
          <ShieldCheck className="w-10 h-10 text-emerald-600 flex-shrink-0 mt-1" />
          <div className="space-y-2">
            <h3 className="font-serif text-base font-bold text-emerald-950">
              O que é o Programa de Compra Garantida?
            </h3>
            <p>
              O compromisso de Compra Garantida é o reflexo da nossa transparência operacional. Do momento em que você seleciona seu produto até o uso em sua rotina, garantimos que você receberá exatamente o item anunciado, em perfeito estado, original e com suporte total de nossa equipe.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
          <div className="p-6 rounded-2xl bg-white border border-zinc-100 shadow-sm space-y-2">
            <Scale className="w-6 h-6 text-[#E6007A]" />
            <h4 className="font-bold text-sm text-zinc-900">Código de Defesa do Consumidor</h4>
            <p>
              Seguimos estritamente o Artigo 49 do CDC brasileiro (Lei nº 8.078/1990), que garante o direito de arrependimento em até <strong>7 (sete) dias corridos</strong> após o recebimento da encomenda, sem qualquer custo de devolução para você.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-zinc-100 shadow-sm space-y-2">
            <Lock className="w-6 h-6 text-emerald-600" />
            <h4 className="font-bold text-sm text-zinc-900">Pagamento Pix Protegido</h4>
            <p>
              Nossa cobrança Pix é intermediada pela <strong>Nexum Pay</strong> sob as diretrizes do Banco Central do Brasil. O dinheiro só é liberado mediante processamento seguro e o pedido é atualizado em tempo real no nosso sistema.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-zinc-100 shadow-sm space-y-2">
            <RotateCcw className="w-6 h-6 text-[#E6007A]" />
            <h4 className="font-bold text-sm text-zinc-900">Reembolso Integral Garantido</h4>
            <p>
              Caso o produto apresente qualquer defeito de fabricação ou extravio comprovado no transporte, realizamos o envio imediato de uma nova unidade ou estornamos 100% do valor pago via Pix na mesma conta de origem.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-zinc-100 shadow-sm space-y-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            <h4 className="font-bold text-sm text-zinc-900">Atendimento Humanizado</h4>
            <p>
              Não usamos robôs de resposta automática para resolver problemas de entrega. Você fala diretamente com uma de nossas consultoras pelo WhatsApp ou e-mail oficial com prazo de resposta em até 24 horas úteis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
