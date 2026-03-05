# 💳 Sistema de Pagamento SmartSale

## 📋 Visão Geral

O SmartSale utiliza **Stripe** como gateway de pagamento principal para processar assinaturas e planos, independentemente da integração com Mercado Livre (que é apenas para dados de produtos).

---

## 🏗️ Arquitetura de Pagamento

### Fluxo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                  USUÁRIO ACESSA PÁGINA DE PLANOS                │
│                                                                   │
│          GET /api/subscriptions/plans (carrega planos)           │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SELECIONA UM PLANO                            │
│                                                                   │
│  (Free, Basic: R$9.99/mês, Premium: R$29.99/mês, Enterprise)    │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                 REDIRECIONA PARA STRIPE                          │
│                                                                   │
│     Frontend: @stripe/react-stripe-js (Componentes)              │
│     Stripe Checkout ou Embedded Payment Form                     │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              USUÁRIO PREENCHE DADOS DE CARTÃO                    │
│                                                                   │
│  - Número do cartão                                              │
│  - Data de validade                                              │
│  - CVV                                                           │
│  - Endereço de cobrança                                          │
│                                                                   │
│  ⚠️ IMPORTANTE: Dados de cartão NUNCA tocam nossos servidores!   │
│     Stripe processa tudo com PCI-DSS compliance                  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              STRIPE PROCESSA O PAGAMENTO                         │
│                                                                   │
│  POST /charges (Processa o cartão)                               │
│  Retorna: payment_method_id ou payment_intent_id                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│           FRONTEND ENVIA CONFIRMAÇÃO AO BACKEND                  │
│                                                                   │
│  POST /api/subscriptions/create                                  │
│  {                                                               │
│    planId: "premium",                                            │
│    paymentMethodId: "pm_1234567890"                              │
│  }                                                               │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│            BACKEND CRIA STRIPE CUSTOMER                          │
│                                                                   │
│  stripe.customers.create({                                       │
│    email: "usuario@email.com"                                    │
│  })                                                              │
│                                                                   │
│  ✅ Armazena stripe_customer_id no banco de dados                │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│         BACKEND ATUALIZA BANCO DE DADOS DO USUÁRIO              │
│                                                                   │
│  UPDATE users SET                                                │
│    subscription_plan = 'premium',                                │
│    stripe_customer_id = 'cus_xxx',                               │
│    subscription_end_date = DATE_ADD(NOW(), INTERVAL 30 DAY)      │
│  WHERE id = user_id                                              │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              WEBHOOK STRIPE NOTIFICA BACKEND                     │
│                                                                   │
│  POST /api/webhooks/stripe                                       │
│  Eventos: charge.succeeded, customer.subscription.created        │
│                                                                   │
│  ✅ Confirma pagamento no banco de dados                         │
│  ✅ Envia email de confirmação                                   │
│  ✅ Inicia período de teste se aplicável                         │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│           ✅ USUÁRIO TEM ACESSO AO PLANO PAGO                    │
│                                                                   │
│  - Backend verifica subscription_plan ao validar requisições     │
│  - Frontend exibe features baseado no plano                      │
│  - Quota de buscas aumenta conforme o plano                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Armazenamento de Dados de Pagamento

### 1. Dados Armazenados no SmartSale (MySQL)

**Tabela: `users`**
```sql
ALTER TABLE users ADD COLUMN (
  stripe_customer_id VARCHAR(255) UNIQUE,           -- ID do cliente no Stripe
  subscription_plan ENUM('free', 'basic', 'premium', 'enterprise') DEFAULT 'free',
  subscription_start_date TIMESTAMP,                 -- Quando iniciou a assinatura
  subscription_end_date TIMESTAMP,                   -- Quando termina/renova
  payment_method VARCHAR(255),                       -- Último método de pagamento usado
  billing_email VARCHAR(255),                        -- Email para faturas
  tax_id VARCHAR(255),                               -- CNPJ/CPF para NF
  is_trial BOOLEAN DEFAULT false,                    -- Se está em período de teste
  trial_end_date TIMESTAMP                           -- Quando termina o teste
);

-- Índices para melhor performance
CREATE INDEX idx_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX idx_subscription_plan ON users(subscription_plan);
```

**Tabela: `payment_history` (Novo)**
```sql
CREATE TABLE payment_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  stripe_payment_id VARCHAR(255) UNIQUE,             -- ID do pagamento no Stripe
  stripe_invoice_id VARCHAR(255),                    -- ID da fatura
  amount DECIMAL(10, 2),                             -- Valor pago
  currency VARCHAR(3) DEFAULT 'BRL',                 -- Moeda
  status ENUM('pending', 'succeeded', 'failed', 'refunded') DEFAULT 'pending',
  payment_method VARCHAR(255),                       -- Tipo: card, boleto, etc
  card_last_4 VARCHAR(4),                            -- Últimos 4 dígitos do cartão
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);

CREATE TABLE subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  stripe_subscription_id VARCHAR(255) UNIQUE,        -- ID da assinatura no Stripe
  plan_id VARCHAR(50) NOT NULL,                      -- free, basic, premium, enterprise
  status ENUM('active', 'past_due', 'canceled', 'unpaid') DEFAULT 'active',
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,        -- Cancelar ao final do período
  canceled_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);
```

### 2. Dados Armazenados no Stripe (Sistema Externo Seguro)

🔐 **IMPORTANTE:** O Stripe armazena de forma segura e criptografada:
- ✅ Números de cartão (tokenizados)
- ✅ Data de expiração
- ✅ Endereço de cobrança
- ✅ Histórico de transações
- ✅ Informações de faturamento

❌ **NÓS NUNCA ARMAZENAMOS:**
- ❌ Números de cartão completos
- ❌ CVV
- ✅ Apenas o ID do método de pagamento (`pm_xxxxx`) é armazenado no nosso banco

---

## 💳 Planos e Preços

```javascript
const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    currency: 'BRL',
    features: [
      '5 buscas por dia',
      'Resultados básicos',
      'Pesquisa em Mercado Livre'
    ],
    limits: {
      searches_per_day: 5,
      saved_products: 10,
      api_calls_per_month: 1000
    }
  },
  
  basic: {
    name: 'Basic',
    price: 9.99,
    currency: 'BRL',
    billing_cycle: 'monthly',
    features: [
      '50 buscas por dia',
      'Resultados detalhados',
      'Análise de concorrência',
      'Histórico de pesquisas'
    ],
    limits: {
      searches_per_day: 50,
      saved_products: 100,
      api_calls_per_month: 10000
    }
  },
  
  premium: {
    name: 'Premium',
    price: 29.99,
    currency: 'BRL',
    billing_cycle: 'monthly',
    features: [
      'Buscas ilimitadas',
      'Filtros avançados',
      'Análise de concorrência detalhada',
      'Alertas de preço',
      'Relatórios personalizados',
      'Suporte priorizado'
    ],
    limits: {
      searches_per_day: -1, // unlimited
      saved_products: 10000,
      api_calls_per_month: 100000
    }
  },
  
  enterprise: {
    name: 'Enterprise',
    price: 99.99,
    currency: 'BRL',
    billing_cycle: 'monthly',
    features: [
      'Tudo do Premium',
      'Acesso à API completa',
      'Webhook de eventos',
      'Suporte 24/7 dedicado',
      'Integração customizada',
      'SLA garantido',
      'Exportação em massa'
    ],
    limits: {
      searches_per_day: -1,
      saved_products: -1, // unlimited
      api_calls_per_month: -1
    }
  }
};
```

---

## 🔄 Fluxo de Renovação Automática

```
┌──────────────────────────────────────────┐
│  Período de assinatura está se encerrando│
│  (ex: 30 dias)                           │
└─────────────┬──────────────────────────────┘
              │
              ▼
  ┌──────────────────────────────────────┐
  │ Stripe tenta renovação automática     │
  │ POST /charges (renovação)             │
  └─────────────┬────────────────────────┘
                │
         ┌──────┴──────┐
         │             │
         ▼             ▼
    ✅ SUCESSO    ❌ FALHA
    
    ✅ Webhook:              ❌ Webhook:
    customer.subscription.   invoice.payment_failed
    updated
    
    ✅ Email confirmação     ❌ Email aviso
    ✅ Continua funcionando  ❌ Estado: past_due
                             ❌ Tentativas por 3 dias
```

---

## 🛡️ Segurança de Dados

### Conformidade PCI-DSS

✅ **Level 1 PCI-DSS Compliance** (Máxima segurança)
- Stripe processa todos os dados sensíveis
- Nós usamos apenas tokens seguros
- Zero exposição de números de cartão

### Criptografia

```
Dados de Pagamento
  ↓
[Token Stripe: pm_xxxxx]
  ↓
Armazenado no banco de dados criptografado
  ↓
Usado apenas com Stripe API
```

### Variáveis de Ambiente Seguras

```bash
# .env (backend)
STRIPE_SECRET_KEY=sk_live_51234567890ABCDEF  # Nunca expor!
STRIPE_PUBLISHABLE_KEY=pk_live_11234567890  # Seguro usar no frontend

# Frontend (.env.local)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_11234567890  # Apenas public key
```

---

## 📊 Monitoring e Logs

### Logs de Transações

```typescript
// Backend: Registrar todas as transações
const logPayment = async (payment: {
  userId: number;
  stripePaymentId: string;
  amount: number;
  status: string;
  timestamp: Date;
}) => {
  await pool.query(
    'INSERT INTO payment_history (user_id, stripe_payment_id, amount, status) VALUES (?, ?, ?, ?)',
    [payment.userId, payment.stripePaymentId, payment.amount, payment.status]
  );
};
```

### Webhooks do Stripe para Sincronização

```typescript
// POST /api/webhooks/stripe
const handleStripeWebhook = async (event) => {
  switch(event.type) {
    case 'charge.succeeded':
      // Atualizar status do pagamento
      break;
      
    case 'customer.subscription.created':
      // Nova assinatura ativa
      break;
      
    case 'customer.subscription.updated':
      // Renovação de assinatura
      break;
      
    case 'customer.subscription.deleted':
      // Assinatura cancelada
      break;
      
    case 'invoice.payment_failed':
      // Falha no pagamento
      break;
  }
};
```

---

## 🔌 Integração Técnica Atual

### Backend (Node.js + Express)

**Arquivo:** `backend/src/controllers/subscriptionController.ts`

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Criar Stripe Customer
const customer = await stripe.customers.create({
  email: user.email,
  metadata: {
    userId: user.id,
    firstName: user.firstName,
    lastName: user.lastName
  }
});

// Atualizar banco de dados
await pool.query(
  'UPDATE users SET stripe_customer_id = ? WHERE id = ?',
  [customer.id, user.id]
);
```

### Frontend (React + Next.js)

**Componentes:**
```typescript
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Nos componentes
<Elements stripe={stripe}>
  <CheckoutForm />
</Elements>

// Em CheckoutForm
const { stripe, elements } = useStripe();
const paymentElement = elements?.create('payment');
paymentElement?.mount('#payment-element');
```

---

## 📧 Emails de Confirmação

### Templates de Email

1. **Confirmação de Pagamento**
   - Número da transação
   - Valor pago
   - Plano ativado
   - Data de renovação
   - Link para gerenciar assinatura

2. **Falha no Pagamento**
   - Motivo da falha
   - Próximas tentativas
   - Link para atualizar cartão

3. **Renovação Automática**
   - Confirmação de renovação
   - Novo período
   - Fatura anexada

4. **Cancelamento de Assinatura**
   - Confirmação do cancelamento
   - Data final do acesso
   - Opção de reativar

---

## 🚀 Próximos Passos de Implementação

### Phase 3: Integração Stripe Completa

- [ ] **Stripe Checkout Completo**
  - [ ] Implementar Stripe.js
  - [ ] Criar componente de checkout
  - [ ] Testar fluxo de pagamento

- [ ] **Webhooks**
  - [ ] Criar endpoint `/api/webhooks/stripe`
  - [ ] Verificar assinatura do webhook
  - [ ] Processar eventos corretamente

- [ ] **Renovação Automática**
  - [ ] Testar renovação após 30 dias
  - [ ] Testar falha de pagamento
  - [ ] Testar reativação

- [ ] **Dashboard de Pagamentos**
  - [ ] Ver histórico de pagamentos
  - [ ] Atualizar método de pagamento
  - [ ] Cancelar assinatura
  - [ ] Ver próxima cobrança

- [ ] **Testes**
  - [ ] Testes de integração com Stripe
  - [ ] Testes de webhook
  - [ ] Testes de erro de pagamento

---

## 🎯 Conclusão

O SmartSale usa **Stripe como gateway de pagamento único e confiável**, completamente desacoplado da integração com Mercado Livre.

### Independência entre Sistemas:

```
┌─────────────────────────────────────┐
│     SmartSale (Nossa Aplicação)     │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────────────┐   │
│  │  Mercado Livre Integration   │   │
│  │  (Apenas dados de produtos)  │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌──────────────────────────────┐   │
│  │  Stripe Integration (Pagtos) │   │
│  │  (Processamento de cartões)  │   │
│  └──────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

Mesmo que Mercado Livre não disponibilize o API secret, o sistema de pagamento funcionará normalmente via Stripe!
