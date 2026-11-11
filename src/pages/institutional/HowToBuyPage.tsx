import React from 'react';
import { ShoppingBag, QrCode, Truck, CheckCircle2 } from 'lucide-react';

export const HowToBuyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-[#E6007A] uppercase tracking-widest">Guia de Compra</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-zinc-900">
          Como Comprar na Casa & Beleza Express
        </h1>
        <p className="text-sm text-zinc-500 max-w-xl mx-auto leading-relaxed">
          Comprar em nossa loja é simples, seguro e leva menos de 2 minutos. Siga o passo a passo abaixo:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF0F6] text-[#E6007A] flex items-center justify-center font-bold text-base flex-shrink-0">
            1
          </div>
          <div className="space-y-1 text-xs">
            <h3 className="font-bold text-sm text-zinc-900">Escolha seus Produtos</h3>
            <p className="text-zinc-500 leading-relaxed">
              Navegue pelas categorias ou use o campo de busca. Na página do produto, confira a galeria de imagens, leia os benefícios, selecione a variação (tonalidade, tamanho ou fragrância) e clique em <strong>Adicionar ao Carrinho</strong>.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF0F6] text-[#E6007A] flex items-center justify-center font-bold text-base flex-shrink-0">
            2
          </div>
          <div className="space-y-1 text-xs">
            <h3 className="font-bold text-sm text-zinc-900">Revise sua Sacola e Frete</h3>
            <p className="text-zinc-500 leading-relaxed">
              Acesse o carrinho para checar as quantidades, insira seu CEP para calcular o prazo de entrega e digite seu cupom de desconto (como <strong>BEMVINDA10</strong>) para economizar.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF0F6] text-[#E6007A] flex items-center justify-center font-bold text-base flex-shrink-0">
            3
          </div>
          <div className="space-y-1 text-xs">
            <h3 className="font-bold text-sm text-zinc-900">Preencha seus Dados</h3>
            <p className="text-zinc-500 leading-relaxed">
              No checkout, informe seu nome, CPF e o endereço onde o pacote deverá ser entregue. Nosso sistema busca automaticamente sua rua e bairro a partir do CEP.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF0F6] text-[#E6007A] flex items-center justify-center font-bold text-base flex-shrink-0">
            4
          </div>
          <div className="space-y-1 text-xs">
            <h3 className="font-bold text-sm text-zinc-900">Pague com Pix Instantâneo</h3>
            <p className="text-zinc-500 leading-relaxed">
              Aponte a câmera do seu aplicativo bancário para o QR Code gerado ou clique em <strong>Copiar Código Pix</strong>. O pagamento é confirmado em segundos pela Nexum Pay e você recebe o e-mail de confirmação na hora!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
