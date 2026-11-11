import React from 'react';
import { Truck, Clock, ShieldCheck, MapPin } from 'lucide-react';

export const ShippingAndDeliveryPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-[#E6007A] uppercase tracking-widest">Logística & Envio</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-zinc-900">
          Entrega e Frete
        </h1>
        <p className="text-sm text-zinc-500 max-w-xl mx-auto leading-relaxed">
          Entenda como funciona o envio do seu pedido desde a separação até a chegada na sua residência.
        </p>
      </div>

      <div className="space-y-6 text-xs text-zinc-600 leading-relaxed">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm text-center">
            <Clock className="w-8 h-8 text-[#E6007A] mx-auto mb-3" />
            <h4 className="font-bold text-sm text-zinc-900 mb-1">Despacho em 24h</h4>
            <p className="text-zinc-500">
              Pedidos com pagamento Pix confirmado até as 13h são separados e enviados no mesmo dia útil.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm text-center">
            <Truck className="w-8 h-8 text-[#E6007A] mx-auto mb-3" />
            <h4 className="font-bold text-sm text-zinc-900 mb-1">Rastreamento Ativo</h4>
            <p className="text-zinc-500">
              Você recebe o código oficial dos Correios por e-mail e pode acompanhar passo a passo no site.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-pink-100 shadow-sm text-center">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
            <h4 className="font-bold text-sm text-zinc-900 mb-1">Seguro de Carga</h4>
            <p className="text-zinc-500">
              Todas as encomendas viajam com seguro postal completo contra danos, perdas ou extravios.
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-200/80 space-y-3">
          <h3 className="font-serif text-base font-bold text-zinc-900">Prazos e Modalidades</h3>
          <ul className="list-disc list-inside space-y-1.5 text-zinc-600">
            <li><strong>Entrega Padrão Express:</strong> Prazo de 3 a 6 dias úteis para Sul e Sudeste, e 5 a 10 dias úteis para demais regiões.</li>
            <li><strong>Sedex Super Rápido:</strong> Prazo de 1 a 3 dias úteis para capitais e regiões metropolitanas.</li>
            <li><strong>Frete Grátis:</strong> Válido automaticamente para pedidos a partir de R$ 199,00 para todo o Brasil.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
