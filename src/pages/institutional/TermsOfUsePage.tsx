import React from 'react';

export const TermsOfUsePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-[#E6007A] uppercase tracking-widest">Termos Legais</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-zinc-900">
          Termos e Condições de Uso
        </h1>
        <p className="text-sm text-zinc-500 max-w-xl mx-auto leading-relaxed">
          As regras e diretrizes que regem a navegação e realização de compras na loja virtual Casa & Beleza Express.
        </p>
      </div>

      <div className="space-y-6 text-xs text-zinc-600 leading-relaxed">
        <div className="space-y-3">
          <h3 className="font-serif text-base font-bold text-zinc-900">1. Aceitação dos Termos</h3>
          <p>
            Ao navegar ou concluir uma compra na <strong>Casa & Beleza Express</strong>, o usuário declara ter lido, compreendido e concordado integralmente com as disposições destes Termos de Uso e com a nossa Política de Privacidade.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-serif text-base font-bold text-zinc-900">2. Cadastro e Responsabilidade das Informações</h3>
          <p>
            O cliente é o único responsável pela veracidade e exatidão dos dados cadastrais fornecidos (nome, CPF, endereço e CEP). Informações incorretas podem impossibilitar a entrega da encomenda ou a validação do Pix.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-serif text-base font-bold text-zinc-900">3. Preços e Estoques</h3>
          <p>
            Os preços e promoções divulgados na loja estão sujeitos a alterações sem aviso prévio e são válidos exclusivamente para compras concluídas no momento da geração da cobrança. O pedido só é reservado definitivamente após a confirmação do pagamento pelo gateway bancário.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-serif text-base font-bold text-zinc-900">4. Propriedade Intelectual</h3>
          <p>
            Todo o conteúdo da plataforma (marca Casa & Beleza Express, logotipos, textos, layouts e fotos) é de propriedade exclusiva ou devidamente licenciado, sendo proibida a reprodução para fins comerciais sem autorização prévia por escrito.
          </p>
        </div>
      </div>
    </div>
  );
};
