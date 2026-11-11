import React from 'react';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-[#E6007A] uppercase tracking-widest">LGPD & Segurança</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-zinc-900">
          Política de Privacidade
        </h1>
        <p className="text-sm text-zinc-500 max-w-xl mx-auto leading-relaxed">
          Como coletamos, utilizamos, armazenamos e protegemos seus dados pessoais de acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
        </p>
      </div>

      <div className="space-y-6 text-xs text-zinc-600 leading-relaxed">
        <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-200/80 space-y-3">
          <h3 className="font-serif text-base font-bold text-zinc-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            1. Compromisso com a Privacidade
          </h3>
          <p>
            A <strong>Casa & Beleza Express</strong> assume o compromisso público de preservar a confidencialidade e a segurança de todos os dados confiados por nossos clientes. Não vendemos, alugamos nem transferimos suas informações pessoais a terceiros estranhos à operação de entrega e pagamento.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-serif text-base font-bold text-zinc-900">2. Quais Dados Coletamos</h3>
          <p>Para efetivar seus pedidos e emissão fiscal, coletamos:</p>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li>Nome completo e CPF (exigência fiscal e antifraude para expedição de encomendas).</li>
            <li>E-mail e telefone celular (para envio do código Pix, confirmação de pedido e rastreamento).</li>
            <li>Endereço completo de entrega.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="font-serif text-base font-bold text-zinc-900">3. Segurança dos Pagamentos Pix</h3>
          <p>
            Todas as transações financeiras são geradas e validadas por meio do gateway <strong>Nexum Pay</strong>, com criptografia AES-256 e protocolos autenticados pelo Banco Central do Brasil. Não temos acesso nem armazenamos senhas de aplicativos bancários.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-serif text-base font-bold text-zinc-900">4. Seus Direitos (Titular dos Dados)</h3>
          <p>
            Você tem o direito de solicitar a qualquer momento a confirmação da existência de tratamento, a correção de dados incompletos ou a revogação de consentimento para newsletters, bastando entrar em contato pelo e-mail <strong>contato@casabelezexpress.com.br</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
