import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { encryptCredential, decryptCredential } from './utils/crypto.js';
import { sanitizeNameForNexum, validateCPF } from './utils/validators.js';
import { calculateOrderValues, ProductCatalogItem } from './utils/orderCalculator.js';
import { initialProducts } from './data/initialData.js';

dotenv.config();

export const app = express();
const NEXUM_ENCRYPTION_KEY =
  process.env.NEXUM_ENCRYPTION_KEY || 'c3629e4695b281b376518a221fca94ec71f9cfbfa23bb2e7e408ecbbcfd36a98';
const APP_URL = process.env.APP_URL || '';

app.use(express.json());

// In-memory persistent state for server-side orders, payments and webhooks
const paymentConfig = {
  chatIdEncrypted: '',
  credentialEncrypted: '',
  webhookSecret: 'cb_secret_webhook_token_2026',
  isActive: false,
  lastValidatedAt: null as string | null,
  accountStatus: null as string | null,
};

const serverOrders = new Map<string, any>();
const processedWebhookEvents = new Set<string>();

// Prepopulate initial catalog for recalculation
const catalogProducts = new Map<string, ProductCatalogItem>();
for (const p of initialProducts) {
  catalogProducts.set(p.id, {
    id: p.id,
    name: p.name,
    price: p.price,
    promotionalPrice: p.promotional_price,
    stock: p.stock,
    isActive: p.is_active,
    freeShipping: p.free_shipping,
    imageUrl1: p.image_url_1,
  });
}

// -----------------------------------------------------------------------------
// 1. VIA CEP PROXY
// -----------------------------------------------------------------------------
app.get('/api/cep/:cep', async (req: Request, res: Response) => {
  try {
    const rawCep = (req.params.cep || '').replace(/\D/g, '');
    if (rawCep.length !== 8) {
      return res.status(400).json({ error: 'CEP deve conter 8 dígitos.' });
    }
    const response = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
    if (!response.ok) {
      return res.status(502).json({ error: 'Erro ao consultar serviço de CEP.' });
    }
    const data = await response.json();
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: 'Falha interna ao consultar CEP.' });
  }
});

// -----------------------------------------------------------------------------
// 2. NEXUM PAY ADMIN CONFIG & VALIDATION
// -----------------------------------------------------------------------------
app.post('/api/admin/nexum/save-credentials', (req: Request, res: Response) => {
  try {
    const { chatId, credential, webhookSecret, isActive } = req.body;

    if (!NEXUM_ENCRYPTION_KEY) {
      return res.status(500).json({
        error: 'NEXUM_ENCRYPTION_KEY ausente no ambiente. Não é possível salvar com segurança.',
      });
    }

    if (chatId && credential) {
      paymentConfig.chatIdEncrypted = encryptCredential(chatId, NEXUM_ENCRYPTION_KEY);
      paymentConfig.credentialEncrypted = encryptCredential(credential, NEXUM_ENCRYPTION_KEY);
    }
    if (webhookSecret) {
      paymentConfig.webhookSecret = webhookSecret;
    }
    paymentConfig.isActive = Boolean(isActive);

    return res.json({
      success: true,
      has_credentials: Boolean(paymentConfig.chatIdEncrypted && paymentConfig.credentialEncrypted),
      is_active: paymentConfig.isActive,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao criptografar credenciais.' });
  }
});

app.get('/api/admin/nexum/validate', async (_req: Request, res: Response) => {
  try {
    if (!paymentConfig.chatIdEncrypted || !paymentConfig.credentialEncrypted) {
      return res.status(400).json({
        authenticated: false,
        message: 'Nenhuma credencial cadastrada ainda. Insira o Chat ID e a Credencial Fixa.',
      });
    }

    const chatId = decryptCredential(paymentConfig.chatIdEncrypted, NEXUM_ENCRYPTION_KEY);
    const credential = decryptCredential(paymentConfig.credentialEncrypted, NEXUM_ENCRYPTION_KEY);

    const response = await fetch('https://nexumpay.squareweb.app/api/public/auth/validate', {
      method: 'GET',
      headers: {
        'X-API-Chat-Id': chatId,
        'X-API-Credential': credential,
      },
    });

    const data = await response.json();
    if (response.ok && data.authenticated) {
      paymentConfig.lastValidatedAt = new Date().toISOString();
      paymentConfig.accountStatus = data.account?.status || 'ACTIVE';
    }

    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({
      authenticated: false,
      message: 'Erro ao contactar a API Nexum Pay: ' + err.message,
    });
  }
});

// -----------------------------------------------------------------------------
// 3. CREATE ORDER & PIX (Backend Calculation & Nexum Integration)
// -----------------------------------------------------------------------------
app.post('/api/orders/create', async (req: Request, res: Response) => {
  try {
    const { customer, shippingAddress, items, coupon, shippingChoice } = req.body;

    if (!customer?.fullName || !customer?.email || !customer?.cpf || !customer?.phone) {
      return res.status(400).json({ error: 'Dados do cliente incompletos.' });
    }

    if (!validateCPF(customer.cpf)) {
      return res.status(400).json({ error: 'CPF inválido.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'O carrinho está vazio.' });
    }

    // Strictly recalculate values on backend (never trust frontend totals)
    let calculated;
    try {
      calculated = calculateOrderValues(
        items.map((it: any) => ({
          productId: it.productId,
          quantity: it.quantity,
          variationTitle: it.variationTitle,
        })),
        catalogProducts,
        coupon,
        shippingChoice || 'standard'
      );
    } catch (calcError: any) {
      return res.status(400).json({ error: calcError.message });
    }

    const orderNumber = `CB-${Math.floor(10000 + Math.random() * 90000)}`;
    const orderId = `ord-${Date.now()}`;

    let pixResult: any = null;

    // Check if Nexum is configured & active
    const isNexumConfigured = Boolean(
      paymentConfig.isActive && paymentConfig.chatIdEncrypted && paymentConfig.credentialEncrypted
    );

    if (isNexumConfigured) {
      const chatId = decryptCredential(paymentConfig.chatIdEncrypted, NEXUM_ENCRYPTION_KEY);
      const credential = decryptCredential(paymentConfig.credentialEncrypted, NEXUM_ENCRYPTION_KEY);

      const host = req.get('host') || 'localhost:3000';
      const protocol = req.protocol === 'https' || host.includes('vercel.app') ? 'https' : 'http';
      const baseUrl = APP_URL || `${protocol}://${host}`;

      const nexumPayload = {
        amount: calculated.totalAmount,
        generatedName: sanitizeNameForNexum(customer.fullName),
        generatedEmail: customer.email,
        generatedDocument: customer.cpf.replace(/\D/g, ''),
        webhook: {
          url: `${baseUrl}/api/pix/webhook`,
          token: paymentConfig.webhookSecret,
        },
        externalReference: orderNumber,
      };

      try {
        const nexumRes = await fetch('https://nexumpay.squareweb.app/api/public/pix/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Chat-Id': chatId,
            'X-API-Credential': credential,
          },
          body: JSON.stringify(nexumPayload),
        });

        const nexumData = await nexumRes.json();
        if (nexumRes.ok && nexumData.tx_id) {
          pixResult = nexumData;
        } else {
          console.warn('Nexum API call returned error:', nexumData);
        }
      } catch (nexumErr) {
        console.error('Failed to communicate with Nexum Pay:', nexumErr);
      }
    }

    // Fallback standard Pix representation if credentials not yet configured
    if (!pixResult) {
      const sampleTxId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const samplePixCode = `00020101021226830014br.gov.bcb.pix2561pix.casabelezexpress.com.br/qr/v2/${sampleTxId}520400005303986540${calculated.totalAmount.toFixed(2).replace('.', '')}5802BR5921CASA E BELEZA EXPRESS6009SAO PAULO62070503***6304`;

      pixResult = {
        tx_id: sampleTxId,
        amount: calculated.totalAmount,
        qr_code_text: samplePixCode,
        qr_code_base64: null,
        expires_in_seconds: 1800,
        status: 'PENDING',
        external_reference: orderNumber,
        is_simulated: !isNexumConfigured,
      };
    }

    const orderData = {
      id: orderId,
      order_number: orderNumber,
      customer_name: customer.fullName,
      customer_email: customer.email,
      customer_cpf: customer.cpf,
      customer_phone: customer.phone,
      shipping_address: shippingAddress,
      subtotal: calculated.subtotal,
      discount_amount: calculated.discountAmount,
      shipping_amount: calculated.shippingAmount,
      total_amount: calculated.totalAmount,
      coupon_code: calculated.appliedCoupon?.code || null,
      financial_status: 'Aguardando pagamento',
      logistic_status: 'Aguardando separação',
      pix_tx_id: pixResult.tx_id,
      pix_qr_code_text: pixResult.qr_code_text,
      pix_qr_code_base64: pixResult.qr_code_base64,
      pix_expires_at: new Date(Date.now() + (pixResult.expires_in_seconds || 1800) * 1000).toISOString(),
      items: calculated.items,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    serverOrders.set(orderId, orderData);

    return res.status(201).json({
      success: true,
      order: orderData,
      pix: pixResult,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Erro ao processar pedido.' });
  }
});

// -----------------------------------------------------------------------------
// 4. CHECK ORDER & PIX STATUS
// -----------------------------------------------------------------------------
app.get('/api/orders/:orderId/status', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = serverOrders.get(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    // If order is still pending, query Nexum API directly if credentials exist
    if (
      order.financial_status === 'Aguardando pagamento' &&
      order.pix_tx_id &&
      paymentConfig.isActive &&
      paymentConfig.chatIdEncrypted
    ) {
      try {
        const chatId = decryptCredential(paymentConfig.chatIdEncrypted, NEXUM_ENCRYPTION_KEY);
        const credential = decryptCredential(paymentConfig.credentialEncrypted, NEXUM_ENCRYPTION_KEY);

        const nexumRes = await fetch(
          `https://nexumpay.squareweb.app/api/public/pix/status/${order.pix_tx_id}`,
          {
            headers: {
              'X-API-Chat-Id': chatId,
              'X-API-Credential': credential,
            },
          }
        );

        if (nexumRes.ok) {
          const statusData = await nexumRes.json();
          const paidStatuses = ['PAID', 'APPROVED', 'COMPLETED', 'SUCCESS', 'CONFIRMED', 'COMPLETO'];
          if (paidStatuses.includes((statusData.status || '').toUpperCase())) {
            order.financial_status = 'Pago';
            order.paid_at = new Date().toISOString();
            order.updated_at = new Date().toISOString();
          }
        }
      } catch (e) {
        console.warn('Error polling status from Nexum API', e);
      }
    }

    return res.json({
      order_id: order.id,
      order_number: order.order_number,
      financial_status: order.financial_status,
      logistic_status: order.logistic_status,
      paid_at: order.paid_at,
      total_amount: order.total_amount,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// 5. WEBHOOK PIX (Nexum Pay Webhook Receiver)
// -----------------------------------------------------------------------------
app.post('/api/pix/webhook', async (req: Request, res: Response) => {
  try {
    const receivedToken = req.headers['x-webhook-token'] as string;

    // Token validation
    if (paymentConfig.webhookSecret && receivedToken !== paymentConfig.webhookSecret) {
      console.warn('Webhook received with invalid token:', receivedToken);
      return res.status(401).json({ error: 'Token do webhook inválido.' });
    }

    const { event, tx_id, status, transaction } = req.body;
    console.log(`[Nexum Webhook] event: ${event}, tx_id: ${tx_id}, status: ${status}`);

    if (!tx_id) {
      return res.status(400).json({ error: 'tx_id não fornecido.' });
    }

    // Idempotency: Ignore already processed event
    const idempotencyKey = `${tx_id}_${status}`;
    if (processedWebhookEvents.has(idempotencyKey)) {
      return res.status(200).json({ message: 'Evento já processado (idempotente).' });
    }
    processedWebhookEvents.add(idempotencyKey);

    // Locate order by tx_id
    let matchingOrder: any = null;
    for (const ord of serverOrders.values()) {
      if (ord.pix_tx_id === tx_id) {
        matchingOrder = ord;
        break;
      }
    }

    if (!matchingOrder) {
      console.warn('Order not found on server for tx_id:', tx_id);
      return res.status(200).json({ warning: 'Pedido não localizado para o tx_id.' });
    }

    const paidStatuses = ['PAID', 'APPROVED', 'COMPLETED', 'SUCCESS', 'CONFIRMED', 'COMPLETO'];
    const isPaid = paidStatuses.includes((status || '').toUpperCase());

    if (isPaid && matchingOrder.financial_status !== 'Pago') {
      // Amount verification
      if (transaction?.amount_paid && Number(transaction.amount_paid) < Number(matchingOrder.total_amount)) {
        console.error('Valor pago inferior ao total do pedido!');
        matchingOrder.financial_status = 'Falhou';
        matchingOrder.notes = 'Valor pago diverge do total do pedido.';
        return res.status(400).json({ error: 'Divergência de valores.' });
      }

      // Mark order as paid atomically
      matchingOrder.financial_status = 'Pago';
      matchingOrder.paid_at = new Date().toISOString();
      matchingOrder.updated_at = new Date().toISOString();

      console.log(`Pedido ${matchingOrder.order_number} confirmado com sucesso via Webhook!`);
    }

    return res.status(200).json({ success: true, order_id: matchingOrder.id });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
