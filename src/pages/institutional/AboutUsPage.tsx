import React from 'react';
import { Sparkles, Heart, Award, ShieldCheck } from 'lucide-react';

export const AboutUsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-[#E6007A] uppercase tracking-widest">Nossa História</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-zinc-900">
          Sobre a Casa & Beleza Express
        </h1>
        <p className="text-sm text-zinc-500 max-w-xl mx-auto leading-relaxed">
          Nascida da paixão por unir autocuidado, bem-estar e o aconchego de um lar acolhedor.
        </p>
      </div>

      <div className="prose prose-sm max-w-none text-zinc-700 leading-relaxed space-y-6 text-sm">
        <div className="p-8 rounded-3xl bg-[#FFF0F6]/70 border border-pink-100 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-[#E6007A] text-white flex items-center justify-center font-serif text-2xl font-bold flex-shrink-0 shadow-md shadow-pink-500/20">
            C&B
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-zinc-900 mb-1">
              Beleza e Aconchego em Sintonia
            </h2>
            <p className="text-xs text-zinc-600 leading-relaxed">
              A <strong>Casa & Beleza Express</strong> foi criada para atender a mulher contemporânea que busca praticidade sem abrir mão da sofisticação. Acreditamos que cuidar da própria pele e transformar o lar em um refúgio acolhedor são duas faces do mesmo compromisso: viver com harmonia, delicadeza e amor próprio.
            </p>
          </div>
        </div>

        <h3 className="font-serif text-2xl font-bold text-zinc-900 pt-4">Nossa Missão</h3>
        <p>
          Oferecer cosméticos de alta eficácia, maquiagens que realçam a beleza natural e produtos para casa que inspiram momentos de paz, sempre com entrega ágil, embalagens encantadoras e atendimento humanizado.
        </p>

        <h3 className="font-serif text-2xl font-bold text-zinc-900 pt-4">Nossos Valores</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-white border border-zinc-100 shadow-sm">
            <Heart className="w-6 h-6 text-[#E6007A] mb-2" />
            <h4 className="font-bold text-sm text-zinc-900 mb-1">Cuidado e Carinho</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Cada pedido é embalado com toques especiais e cheirinho exclusivo para transformar o recebimento em um momento inesquecível.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-zinc-100 shadow-sm">
            <Award className="w-6 h-6 text-[#E6007A] mb-2" />
            <h4 className="font-bold text-sm text-zinc-900 mb-1">Qualidade Rigorosa</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Trabalhamos exclusivamente com fórmulas aprovadas pela Anvisa e fornecedores certificados que prezam pela sustentabilidade.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-zinc-100 shadow-sm">
            <ShieldCheck className="w-6 h-6 text-emerald-600 mb-2" />
            <h4 className="font-bold text-sm text-zinc-900 mb-1">Transparência Total</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Pagamentos seguros via Pix, rastreamento pontual e respeito aos seus direitos de consumidora em cada etapa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
