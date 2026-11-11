import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  QrCode,
  Key,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const AdminPaymentNexum: React.FC = () => {
  const { paymentSettings, saveNexumCredentials, testNexumConnection } = useAdmin();

  const [chatId, setChatId] = useState('');
  const [credential, setCredential] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [isActive, setIsActive] = useState(paymentSettings.is_active);
  const [showSecret, setShowSecret] = useState(false);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(
    null
  );
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);
    setTestResult(null);

    const res = await saveNexumCredentials({
      chatId: chatId.trim(),
      credential: credential.trim(),
      webhookSecret: webhookSecret.trim(),
      isActive,
    });

    setSaveStatus(res);
    if (res.success) {
      // Clear sensitive inputs after saving to protect secrets
      setChatId('');
      setCredential('');
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await testNexumConnection();
    setTestResult(res);
    setIsTesting(false);
  };

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      <div className="pb-6 border-b border-zinc-100">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900">
          Integração Nexum Pay (Cobrança Pix)
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Configuração de credenciais com criptografia AES-256-GCM no servidor e validação de autenticação em tempo real.
        </p>
      </div>

      {/* Integration Status Card */}
      <div
        className={`p-6 rounded-3xl border ${
          paymentSettings.has_credentials && paymentSettings.is_active
            ? 'bg-emerald-50/70 border-emerald-200'
            : 'bg-amber-50/70 border-amber-200'
        } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-md ${
              paymentSettings.has_credentials && paymentSettings.is_active
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-amber-600 text-white shadow-amber-500/20'
            }`}
          >
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-base font-bold text-zinc-900">
              Status da Nexum Pay: {paymentSettings.is_active ? 'Ativa' : 'Desativada'}
            </h2>
            <p className="text-xs text-zinc-600 mt-0.5">
              {paymentSettings.has_credentials
                ? '✓ Credenciais cadastradas e protegidas com AES-256-GCM.'
                : '⚠ Nenhuma credencial cadastrada ainda. Configure abaixo para receber em Pix.'}
            </p>
            {paymentSettings.last_validated_at && (
              <span className="text-[10px] text-zinc-400 block mt-1">
                Última validação: {new Date(paymentSettings.last_validated_at).toLocaleString('pt-BR')} (Conta: {paymentSettings.account_status})
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={!paymentSettings.has_credentials || isTesting}
          onClick={handleTest}
          className="px-5 py-2.5 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 self-start transition-colors disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-[#E6007A]' : ''}`} />
          <span>{isTesting ? 'Validando...' : 'Testar Conexão Oficial'}</span>
        </button>
      </div>

      {testResult && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
            testResult.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {testResult.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <div>
            <p className="font-bold">{testResult.message}</p>
            {testResult.details && (
              <pre className="mt-2 p-2 bg-black/5 rounded-lg font-mono text-[10px] overflow-x-auto">
                {JSON.stringify(testResult.details, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Credentials Form */}
      <form onSubmit={handleSave} className="p-8 rounded-3xl bg-white border border-zinc-100 shadow-sm space-y-6 text-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 text-zinc-900 font-serif text-base font-bold">
          <Key className="w-4 h-4 text-[#E6007A]" />
          <span>Cadastrar / Atualizar Credenciais Nexum Pay</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-semibold text-zinc-700 mb-1">
              Chat ID (Header X-API-Chat-Id) *
            </label>
            <input
              type="text"
              required
              placeholder="Insira seu Chat ID da Nexum Pay..."
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
            />
            {paymentSettings.has_credentials && (
              <p className="text-[10px] text-zinc-400 mt-1">
                Existe uma credencial salva no banco de dados. Preencher este campo substituirá o valor anterior.
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-zinc-700">
                Credencial Fixa (Header X-API-Credential) *
              </label>
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="text-[11px] text-zinc-400 hover:text-zinc-600 flex items-center gap-1"
              >
                {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showSecret ? 'Ocultar' : 'Exibir'}</span>
              </button>
            </div>
            <input
              type={showSecret ? 'text' : 'password'}
              required
              placeholder="Insira sua Credencial Fixa..."
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 mb-1">
              Token Secreto do Webhook (Header X-Webhook-Token)
            </label>
            <input
              type="text"
              placeholder="Ex: seu_token_secreto_webhook_2026"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#E6007A]"
            />
            <p className="text-[10px] text-zinc-400 mt-1">
              URL do Webhook para cadastrar no painel da Nexum Pay:{' '}
              <code className="text-zinc-700 font-mono bg-zinc-100 px-1 py-0.5 rounded">
                https://SEU-DOMINIO/api/pix/webhook
              </code>
            </p>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-zinc-800">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded text-[#E6007A]"
              />
              <span>Ativar integração de pagamentos Pix na loja virtual</span>
            </label>
          </div>
        </div>

        {saveStatus && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
              saveStatus.success
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{saveStatus.message}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Criptografado com AES-256-GCM via NEXUM_ENCRYPTION_KEY</span>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#E6007A] hover:bg-[#D0006E] text-white font-bold rounded-xl shadow-md shadow-pink-500/20 transition-colors"
          >
            Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  );
};
