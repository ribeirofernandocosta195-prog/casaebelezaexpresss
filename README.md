# Casa & Beleza Express — E-commerce Profissional

**Casa & Beleza Express** é uma plataforma completa de comércio eletrônico desenvolvida com React 19, TypeScript, Tailwind CSS, Supabase (PostgreSQL, Storage e Edge Functions) e integração de pagamentos Pix instantâneos via Nexum Pay com criptografia AES-256-GCM.

---

## 1. Arquitetura e Tecnologias

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Canvas Confetti.
- **Backend & Servidor:** Node.js, Express, tsx, Criptografia AES-256-GCM.
- **Banco de Dados & Autenticação:** Supabase Database (PostgreSQL 15), Supabase Auth, Row Level Security (RLS).
- **Armazenamento:** Supabase Storage (Buckets `products` e `banners`).
- **Edge Functions:** Deno runtime (`pix-webhook` e `create-pix`).
- **Pagamentos Pix:** API REST Nexum Pay com Webhooks Idempotentes e QR Code real.
- **Deploy:** Vercel (Frontend/Serverless) e Supabase Cloud.

---

## 2. Estrutura de Diretórios

```
/
├── public/                     # Favicons, sitemap.xml, robots.txt
├── src/
│   ├── components/             # Header, Footer, ProductCard, FloatingWhatsApp, CookieConsent
│   ├── context/                # StoreContext, CartContext, FavoritesContext, AdminContext
│   ├── data/                   # Categorias iniciais, 3 Banners independentes, Produtos
│   ├── pages/                  # HomePage, CatalogPage, CategoriesPage, ProductDetailPage,
│   │   │                       # CartPage, CheckoutPage, PixPaymentPage, PaymentConfirmedPage,
│   │   │                       # AccountPage, OrderTrackingPage, ContactPage
│   │   ├── institutional/      # Sobre Nós, Como Comprar, Compra Garantida, Frete,
│   │   │                       # Trocas, Privacidade (LGPD), Termos, FAQ
│   │   └── admin/              # Dashboard, Produtos (6 Imagens), Categorias, Pedidos,
│   │                           # Banners, Avaliações, Cupons, Configurações, Nexum Pay, Admins
│   ├── services/               # Supabase Client e upload de arquivos
│   ├── types/                  # Tipagens completas de Banco de Dados e Modelos
│   └── utils/                  # Criptografia AES-256-GCM, Validadores (CPF, CEP), OrderCalculator
├── supabase/
│   ├── migrations/             # 20261111_init.sql (18 tabelas, RLS e constraints)
│   └── functions/              # Edge Functions pix-webhook e create-pix
├── server.ts                   # Servidor Express Full-Stack com rotas de API e Vite
├── .env.example                # Variáveis de ambiente documentadas
└── package.json
```

---

## 3. Instalação e Execução Local

### Pré-requisitos
- Node.js 18+ instalado.
- Gerenciador de pacotes npm.

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env

# 3. Executar testes de unidade
npx tsx --test src/utils/*.test.ts

# 4. Iniciar servidor full-stack de desenvolvimento
npm run dev
```

Acesse no navegador: `http://localhost:3000`.

---

## 4. Configuração do Supabase

### 4.1. Criar Projeto no Supabase
1. Acesse [https://supabase.com](https://supabase.com) e crie um novo projeto.
2. Copie a **URL do Projeto** e a **chave anon pública** para as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no arquivo `.env`.
3. Copie a **chave service_role privada** para `SUPABASE_SERVICE_ROLE_KEY` no seu ambiente de backend (Vercel ou servidor).

### 4.2. Executar as Migrations SQL
1. No painel do Supabase, vá em **SQL Editor**.
2. Abra o arquivo `supabase/migrations/20261111_init.sql`.
3. Cole todo o conteúdo e clique em **Run**.
4. As 18 tabelas com RLS e índices serão criadas automaticamente:
   - `profiles`, `admin_users`, `products`, `categories`, `banners`, `orders`, `order_items`, `customers`, `store_settings`, `payment_settings`, `payment_transactions`, `payment_webhook_events`, `coupons`, `reviews`, `contact_messages`, `newsletter_subscribers`, `shipping_settings`, `stock_reservations`.

### 4.3. Criar Buckets de Armazenamento
1. Vá em **Storage** no painel do Supabase.
2. Crie dois buckets públicos:
   - `products` (Public: habilitado)
   - `banners` (Public: habilitado)

### 4.4. Deploy das Edge Functions
```bash
# Instalar Supabase CLI e autenticar
npx supabase login

# Deploy da função de Webhook
npx supabase functions deploy pix-webhook

# Deploy da função de Criação Pix
npx supabase functions deploy create-pix
```

---

## 5. Integração Nexum Pay

A integração com a **Nexum Pay** é configurada diretamente no Painel Administrativo privado:
1. Abra no navegador a rota: `/admin`.
2. Acesse a aba **Nexum Pay Pix**.
3. Preencha:
   - **Chat ID**: seu identificador na Nexum Pay (`X-API-Chat-Id`).
   - **Credencial Fixa**: sua credencial de autenticação (`X-API-Credential`).
   - **Token Secreto do Webhook**: token aleatório para validar o cabeçalho `X-Webhook-Token`.
   - Marque a opção **Ativar integração**.
   - Clique em **Salvar Configurações**.
4. Suas credenciais são criptografadas com **AES-256-GCM** utilizando a chave privada `NEXUM_ENCRYPTION_KEY` antes de serem armazenadas.
5. Clique em **Testar Conexão Oficial** para verificar em tempo real se a API Nexum Pay responde com status `authenticated: true`.
6. Cadastre a URL do webhook no painel da Nexum Pay:
   `https://SEU-DOMINIO/api/pix/webhook` com o mesmo token secreto configurado.

---

## 6. Painel Administrativo Privado

Acesse em:
```
http://localhost:3000/admin
```
- **Login Inicial Padrão:**
  - E-mail: `admin@casabelezexpress.com.br`
  - Senha: `admin123`
- O painel não é divulgado no cabeçalho ou rodapé público.
- No painel você pode cadastrar outros administradores com diferentes níveis de permissão (`super_admin`, `admin`, `manager`).
- Cada produto possui **exatamente seis campos de imagem** identificados de 1 a 6, com pré-visualização individual, validação e opção de upload ou URL externa.
- Três banners independentes: Banner Principal, Banner de Beleza e Banner de Casa com edição independente e pré-visualização em tempo real.
- Gestão de pedidos com separação estrita de **Status Financeiro** e **Status Logístico**, além de inserção de código de rastreamento dos Correios e exportação para CSV.

---

## 7. Publicação na Vercel

1. Suba o repositório para o GitHub.
2. Importe o projeto na [Vercel](https://vercel.com).
3. Em **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXUM_ENCRYPTION_KEY`
   - `APP_URL`
4. Clique em **Deploy**.
