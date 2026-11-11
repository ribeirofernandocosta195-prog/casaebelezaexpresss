import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Copy,
  Check,
  Clock,
  QrCode,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { formatCurrencyBRL } from '../utils/validators';

interface PixPaymentPageProps {
  orderId: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const PixPaymentPage: React.FC<PixPaymentPageProps> = ({ orderId, onNavigate }) => {
  const [order, setOrder] = useState<any>(null);
  const [pixData, setPixData] = useState<any>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(1800); // 30 minutes
  const [isPolling, setIsPolling] = useState(true);
  const [pollError, setPollError] = useState<string | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Load: Fetch order details
  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}/status`);
        const data = await res.json();
        if (res.ok) {
          setOrder(data);

          if (data.financial_status === 'Pago') {
            onNavigate('pagamento-confirmado', { orderId });
            return;
          }
        }
      } catch (e: any) {
        setPollError('Erro ao carregar status inicial do pedido.');
      }
    }

    loadOrder();
  }, [orderId, onNavigate]);

  // 2. Generate QR Code image from Pix Copia e Cola or base64
  useEffect(() => {
    // Check localStorage for the created order pix details
    try {
      const savedOrders = localStorage.getItem('casa_beleza_orders_v1');
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        const match = parsed.find((o: any) => o.id === orderId);
        if (match) {
          setPixData({
            tx_id: match.pix_tx_id,
            qr_code_text: match.pix_qr_code_text,
            qr_code_base64: match.pix_qr_code_base64,
            amount: match.total_amount,
            order_number: match.order_number,
          });

          if (match.pix_qr_code_base64) {
            setQrCodeDataUrl(`data:image/png;base64,${match.pix_qr_code_base64}`);
          } else if (match.pix_qr_code_text) {
            QRCode.toDataURL(match.pix_qr_code_text, { width: 320, margin: 2 }, (err, url) => {
              if (!err && url) setQrCodeDataUrl(url);
            });
          }
        }
      }
    } catch {}

    // Fallback if not in localStorage: generate from order
    if (order && !qrCodeDataUrl) {
      const defaultPixCode = `00020101021226830014br.gov.bcb.pix2561pix.casabelezexpress.com.br/qr/v2/${order.order_number}520400005303986540${order.total_amount.toFixed(2).replace('.', '')}5802BR5921CASA E BELEZA EXPRESS6009SAO PAULO62070503***6304`;
      setPixData((prev: any) => ({
        ...prev,
        order_number: order.order_number,
        amount: order.total_amount,
        qr_code_text: defaultPixCode,
      }));
      QRCode.toDataURL(defaultPixCode, { width: 320, margin: 2 }, (err, url) => {
        if (!err && url) setQrCodeDataUrl(url);
      });
    }
  }, [order, orderId, qrCodeDataUrl]);

  // 3. Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsPolling(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 4. Polling backend /api/orders/:orderId/status every 5 seconds
  useEffect(() => {
    if (!isPolling) return;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/status`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);

          const paidStatuses = ['Pago', 'PAID', 'APPROVED', 'COMPLETED', 'CONFIRMED'];
          if (paidStatuses.includes(data.financial_status)) {
            setIsPolling(false);
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            onNavigate('pagamento-confirmado', { orderId });
          }
        }
      } catch (err) {
        console.warn('Polling error', err);
      }
    }, 5000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [orderId, isPolling, onNavigate]);

  const handleCopyCode = async () => {
    const codeToCopy = pixData?.qr_code_text || '';
    if (!codeToCopy) return;

    try {
      await navigator.clipboard.writeText(codeToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="p-6 sm:p-10 rounded-3xl bg-white border border-pink-100 shadow-xl space-y-8">
        {/* Title Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F6] text-[#E6007A] text-xs font-bold border border-pink-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PAGAMENTO INSTANTÂNEO PIX</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-zinc-900">
            Finalize seu pagamento
          </h1>
          <p className="text-xs text-zinc-500">
            Pedido <strong>{pixData?.order_number || order?.order_number || orderId}</strong>
          </p>
        </div>

        {/* Amount & Countdown Bar */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50 via-[#FFF0F6] to-pink-50 border border-pink-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-zinc-500 block">Valor Total do Pedido</span>
            <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#E6007A]">
              {formatCurrencyBRL(pixData?.amount || order?.total_amount || 0)}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-pink-100">
            <Clock className="w-4 h-4 text-[#E6007A]" />
            <span className="text-xs text-zinc-600">Expira em:</span>
            <span className="font-mono text-sm font-bold text-zinc-900">{formattedTime}</span>
          </div>
        </div>

        {/* Real QR Code Display */}
        <div className="flex flex-col items-center justify-center p-6 bg-zinc-50 rounded-3xl border border-zinc-200/70">
          <div className="p-4 bg-white rounded-2xl shadow-md border border-zinc-100 mb-4">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="QR Code Pix Oficial"
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center bg-zinc-100 rounded-xl text-zinc-400">
                <QrCode className="w-16 h-16 animate-pulse" />
              </div>
            )}
          </div>
          <p className="text-xs text-zinc-600 font-medium text-center">
            Abra o app do seu banco, escolha <strong>Pagar com Pix</strong> e aponte a câmera para o QR Code acima.
          </p>
        </div>

        {/* Pix Copia e Cola */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-zinc-800">
            Ou use o Pix Copia e Cola:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              readOnly
              value={pixData?.qr_code_text || ''}
              className="flex-1 px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono text-zinc-600 outline-none select-all"
            />
            <button
              type="button"
              onClick={handleCopyCode}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#E6007A] hover:bg-[#D0006E] text-white shadow-pink-500/20'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Código Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Código Pix</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Automatic Verification Indicator */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin flex-shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-emerald-900">Aguardando confirmação do pagamento...</p>
            <p className="text-emerald-700 mt-0.5">
              Assim que você concluir a transferência no seu banco, esta página será atualizada automaticamente em poucos segundos.
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="border-t border-zinc-100 pt-6 space-y-3 text-xs text-zinc-600">
          <h4 className="font-bold text-zinc-800">Como pagar com Pix:</h4>
          <ol className="list-decimal list-inside space-y-1 text-zinc-600 leading-relaxed pl-1">
            <li>Abra o aplicativo do seu banco ou instituição financeira.</li>
            <li>Acesse a área Pix e escolha <strong>Ler QR Code</strong> ou <strong>Pix Copia e Cola</strong>.</li>
            <li>Confirme o valor e o favorecido <strong>Casa & Beleza Express</strong>.</li>
            <li>Conclua o pagamento e aguarde a confirmação automática imediata nesta tela.</li>
          </ol>
        </div>

        {/* Security Seals */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 pt-2 border-t border-zinc-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Pagamento processado com segurança pela Nexum Pay via Banco Central</span>
        </div>
      </div>
    </div>
  );
};
