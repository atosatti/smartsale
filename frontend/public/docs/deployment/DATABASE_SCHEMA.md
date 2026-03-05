# 🗄️ Arquitetura de Armazenamento de Dados de Pagamento

## 📊 Visão Geral do Armazenamento

O SmartSale utiliza uma abordagem **híbrida e segura** para armazenar dados de pagamento:

```
┌────────────────────────────────────────────────────────────────┐
│                 DADOS DE PAGAMENTO DO USUÁRIO                  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ARMAZENAMENTO DIVIDIDO:                                      │
│                                                                │
│  ┌──────────────────────┐      ┌──────────────────────────┐   │
│  │   STRIPE (Externo)   │      │   MySQL (Nosso Banco)    │   │
│  ├──────────────────────┤      ├──────────────────────────┤   │
│  │ ✅ Cartões           │      │ ✅ stripe_customer_id    │   │
│  │ ✅ Tokens de pag.    │      │ ✅ subscription_plan     │   │
│  │ ✅ Endereços         │      │ ✅ Histórico de pagtos   │   │
│  │ ✅ Hist. de cobr.    │      │ ✅ Datas de renovação    │   │
│  │ ✅ Invoices          │      │ ✅ Status da assinatura  │   │
│  │                      │      │ ✅ Email de faturamento  │   │
│  │ 🔐 PCI-DSS Level 1   │      │ 🔐 Criptografado        │   │
│  │                      │      │                          │   │
│  └──────────────────────┘      └──────────────────────────┘   │
│                                                                │
│  Comunicação: API REST + Webhooks (HTTPS 256-bit SSL/TLS)     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 🏛️ Banco de Dados MySQL - Tabelas de Pagamento

### 1️⃣ Tabela: `users` (Extensão para pagamentos)

```sql
-- Campos adicionados para suportar pagamentos
ALTER TABLE users ADD COLUMN (
  -- IDs Stripe
  stripe_customer_id VARCHAR(255) UNIQUE COMMENT 'ID do cliente no Stripe',
  stripe_subscription_id VARCHAR(255) UNIQUE COMMENT 'ID da assinatura ativa no Stripe',
  
  -- Informações de Assinatura
  subscription_plan ENUM('free', 'basic', 'premium', 'enterprise') DEFAULT 'free',
  subscription_status ENUM('active', 'past_due', 'canceled', 'unpaid', 'incomplete') DEFAULT 'active',
  subscription_start_date TIMESTAMP NULL,
  subscription_end_date TIMESTAMP NULL,
  
  -- Informações de Faturamento
  billing_email VARCHAR(255) COMMENT 'Email para receber faturas',
  billing_name VARCHAR(255) COMMENT 'Nome para faturamento',
  billing_address VARCHAR(500) COMMENT 'Endereço de faturamento',
  tax_id VARCHAR(50) COMMENT 'CPF/CNPJ para NF-e',
  
  -- Período de Teste
  is_trial BOOLEAN DEFAULT false COMMENT 'Se está em período de teste',
  trial_start_date TIMESTAMP NULL,
  trial_end_date TIMESTAMP NULL,
  
  -- Método de Pagamento
  default_payment_method VARCHAR(255) COMMENT 'ID do método de pagamento padrão (Stripe)',
  payment_method_last_4 VARCHAR(4) COMMENT 'Últimos 4 dígitos do cartão/boleto',
  payment_method_type VARCHAR(50) COMMENT 'card, boleto, pix, etc',
  
  -- Automatização
  auto_renew BOOLEAN DEFAULT true COMMENT 'Renovação automática ativada?',
  
  -- Controle
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices para performance
  INDEX idx_stripe_customer_id (stripe_customer_id),
  INDEX idx_stripe_subscription_id (stripe_subscription_id),
  INDEX idx_subscription_plan (subscription_plan),
  INDEX idx_subscription_status (subscription_status)
);
```

**Exemplo de registro:**
```json
{
  "id": 123,
  "email": "usuario@example.com",
  "stripe_customer_id": "cus_M7mPzQ9R2X5K",
  "stripe_subscription_id": "sub_N8nQoR0S3Y6L",
  "subscription_plan": "premium",
  "subscription_status": "active",
  "subscription_start_date": "2024-01-15 10:30:00",
  "subscription_end_date": "2024-02-15 10:30:00",
  "billing_email": "financeiro@company.com",
  "tax_id": "12345678000195",
  "is_trial": false,
  "default_payment_method": "pm_1234567890ABCDEF",
  "payment_method_last_4": "4242",
  "payment_method_type": "card",
  "auto_renew": true
}
```

---

### 2️⃣ Tabela: `payment_methods` (Métodos de pagamento salvos)

```sql
CREATE TABLE payment_methods (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  
  -- Identificadores
  stripe_payment_method_id VARCHAR(255) UNIQUE COMMENT 'ID no Stripe (pm_xxx)',
  
  -- Tipo de Pagamento
  type ENUM('card', 'boleto', 'pix', 'bank_transfer') DEFAULT 'card',
  
  -- Informações do Cartão (apenas dados públicos)
  card_brand VARCHAR(50) COMMENT 'visa, mastercard, amex, elo, etc',
  card_last_4 VARCHAR(4),
  card_exp_month INT,
  card_exp_year INT,
  card_holder_name VARCHAR(255),
  
  -- Informações de Boleto/PIX
  bank_code VARCHAR(10),
  account_type VARCHAR(50),
  
  -- Controle
  is_default BOOLEAN DEFAULT false COMMENT 'Método de pagamento padrão?',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL COMMENT 'Data de exclusão (soft delete)',
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_stripe_payment_method_id (stripe_payment_method_id),
  UNIQUE KEY unique_default_per_user (user_id, is_default)
);
```

**Exemplo:**
```json
{
  "id": 45,
  "user_id": 123,
  "stripe_payment_method_id": "pm_1234567890ABCDEF",
  "type": "card",
  "card_brand": "visa",
  "card_last_4": "4242",
  "card_exp_month": 12,
  "card_exp_year": 2026,
  "card_holder_name": "João Silva",
  "is_default": true,
  "is_active": true,
  "created_at": "2024-01-01 10:00:00"
}
```

---

### 3️⃣ Tabela: `payment_history` (Histórico de transações)

```sql
CREATE TABLE payment_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  
  -- Identificadores Stripe
  stripe_charge_id VARCHAR(255) UNIQUE COMMENT 'ID da cobrança no Stripe',
  stripe_invoice_id VARCHAR(255) COMMENT 'ID da fatura',
  stripe_payment_intent_id VARCHAR(255) COMMENT 'ID da intenção de pagamento',
  
  -- Informações da Transação
  amount DECIMAL(10, 2) NOT NULL COMMENT 'Valor em reais',
  amount_refunded DECIMAL(10, 2) DEFAULT 0 COMMENT 'Valor reembolsado',
  currency VARCHAR(3) DEFAULT 'BRL',
  
  -- Tipo de Transação
  transaction_type ENUM('initial_charge', 'renewal', 'refund', 'adjustment') DEFAULT 'initial_charge',
  
  -- Status
  status ENUM('pending', 'succeeded', 'failed', 'refunded', 'disputed') DEFAULT 'pending',
  failure_reason VARCHAR(500) COMMENT 'Motivo da falha se houver',
  
  -- Método Utilizado
  payment_method_id INT COMMENT 'Qual método foi usado',
  payment_method_type VARCHAR(50),
  card_last_4 VARCHAR(4),
  
  -- Período
  billing_period_start TIMESTAMP NULL COMMENT 'Início do período de faturamento',
  billing_period_end TIMESTAMP NULL COMMENT 'Fim do período de faturamento',
  
  -- Descrição
  description TEXT COMMENT 'Descrição do pagamento',
  invoice_number VARCHAR(100) COMMENT 'Número da NF para auditoria',
  
  -- Controle
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_stripe_charge_id (stripe_charge_id)
);
```

**Exemplo:**
```json
{
  "id": 1234,
  "user_id": 123,
  "stripe_charge_id": "ch_1234567890ABCDEF",
  "stripe_invoice_id": "in_1234567890ABCDEF",
  "amount": 29.99,
  "amount_refunded": 0.00,
  "currency": "BRL",
  "transaction_type": "renewal",
  "status": "succeeded",
  "payment_method_type": "card",
  "card_last_4": "4242",
  "billing_period_start": "2024-01-15 10:30:00",
  "billing_period_end": "2024-02-15 10:30:00",
  "description": "Premium Plan Monthly Subscription",
  "created_at": "2024-01-15 10:30:00"
}
```

---

### 4️⃣ Tabela: `subscriptions` (Histórico de assinaturas)

```sql
CREATE TABLE subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  
  -- Identificadores Stripe
  stripe_subscription_id VARCHAR(255) UNIQUE COMMENT 'ID da assinatura no Stripe',
  
  -- Plano
  plan_id VARCHAR(50) NOT NULL COMMENT 'free, basic, premium, enterprise',
  plan_name VARCHAR(100),
  plan_price DECIMAL(10, 2),
  
  -- Status
  status ENUM('active', 'past_due', 'unpaid', 'canceled', 'incomplete') DEFAULT 'active',
  
  -- Períodos
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  
  -- Cancelamento
  cancel_at_period_end BOOLEAN DEFAULT false COMMENT 'Cancelar ao final do período?',
  canceled_at TIMESTAMP NULL COMMENT 'Data do cancelamento',
  ended_at TIMESTAMP NULL COMMENT 'Data do término',
  
  -- Tipo de Faturamento
  billing_cycle_anchor TIMESTAMP COMMENT 'Data de referência para renovações',
  
  -- Controle
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_stripe_subscription_id (stripe_subscription_id)
);
```

---

### 5️⃣ Tabela: `invoices` (Faturas/Recibos)

```sql
CREATE TABLE invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  
  -- Identificadores
  stripe_invoice_id VARCHAR(255) UNIQUE,
  nf_number VARCHAR(100) COMMENT 'Número da nota fiscal se emitida',
  invoice_number VARCHAR(100) COMMENT 'Número sequencial interno',
  
  -- Valores
  subtotal DECIMAL(10, 2),
  tax DECIMAL(10, 2) DEFAULT 0.00,
  discount DECIMAL(10, 2) DEFAULT 0.00,
  total DECIMAL(10, 2),
  amount_paid DECIMAL(10, 2),
  amount_due DECIMAL(10, 2),
  
  -- Datas
  issue_date TIMESTAMP,
  due_date TIMESTAMP,
  paid_at TIMESTAMP NULL,
  
  -- Status
  status ENUM('draft', 'open', 'paid', 'void', 'uncollectible') DEFAULT 'draft',
  
  -- PDF/Download
  pdf_url VARCHAR(500) COMMENT 'URL do PDF para download',
  
  -- Controle
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_invoice_number (invoice_number)
);
```

---

## 🔐 Segurança de Dados

### 1. O que NUNCA é armazenado no MySQL:

```
❌ Números de cartão completos
❌ CVV (Código de segurança)
❌ Senhas ou tokens de acesso (exceto Stripe)
❌ Dados sensíveis não tokenizados
```

### 2. O que É armazenado (de forma segura):

```
✅ Últimos 4 dígitos do cartão (redundante, pois Stripe já tem)
✅ IDs dos objetos no Stripe (pm_xxx, cus_xxx)
✅ Status e histórico de transações
✅ Datas de renovação
✅ Tipo de pagamento
```

### 3. Criptografia em Repouso

```sql
-- Campos sensíveis podem ser criptografados
ALTER TABLE users 
MODIFY COLUMN billing_email VARCHAR(255) GENERATED ALWAYS AS (
  AES_ENCRYPT(billing_email, 'encryption_key')
) STORED;
```

### 4. Criptografia em Trânsito

```
Todas as comunicações:
- HTTPS 256-bit SSL/TLS
- API tokens com JWT assinados
- Webhook signatures verificadas
```

---

## 🔄 Fluxo de Dados de Pagamento

### Quando usuário paga pela primeira vez:

```
1. Frontend coleta dados do cartão
   ↓ (via Stripe.js - NUNCA toca nosso servidor)
2. Stripe cria PaymentMethod
   ↓ (pm_xxxxx)
3. Frontend envia pm_xxxxx ao backend
   ↓
4. Backend armazena:
   - stripe_customer_id em users
   - payment_method_id em payment_methods
   - Transação em payment_history
   ↓
5. Stripe envia webhook de sucesso
   ↓
6. Backend confirma no banco de dados
```

### Quando assinatura renova:

```
1. Stripe detecta data de renovação
   ↓
2. Stripe tenta cobrar usando payment_method_id armazenado
   ↓
3. Se bem-sucedido:
   - Novo charge criado
   - Webhook charge.succeeded recebido
   - Backend registra em payment_history
   ↓
4. Se falhar:
   - Webhook invoice.payment_failed recebido
   - Backend marca como past_due
   - Email de erro enviado ao usuário
```

---

## 📈 Escalabilidade e Performance

### Índices Estratégicos

```sql
-- Acesso rápido por usuário
CREATE INDEX idx_user_payment_methods ON payment_methods(user_id);
CREATE INDEX idx_user_payment_history ON payment_history(user_id);

-- Acesso por Stripe ID (para webhooks)
CREATE INDEX idx_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX idx_stripe_charge_id ON payment_history(stripe_charge_id);

-- Acesso por status (para relatórios)
CREATE INDEX idx_payment_status ON payment_history(status);
CREATE INDEX idx_subscription_status ON subscriptions(status);

-- Acesso por data (para queries de período)
CREATE INDEX idx_payment_date ON payment_history(created_at);
```

### Particionamento (Para crescimento futuro)

```sql
-- Particionar payment_history por data
ALTER TABLE payment_history 
PARTITION BY RANGE (YEAR(created_at)) (
  PARTITION p2024 VALUES LESS THAN (2025),
  PARTITION p2025 VALUES LESS THAN (2026),
  PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

---

## 📊 Exemplo de Query de Relatório

```sql
-- Receita por mês
SELECT 
  DATE_FORMAT(ph.created_at, '%Y-%m') as mes,
  COUNT(*) as total_transacoes,
  SUM(ph.amount) as receita_total,
  COUNT(DISTINCT ph.user_id) as clientes_unicos
FROM payment_history ph
WHERE ph.status = 'succeeded'
GROUP BY DATE_FORMAT(ph.created_at, '%Y-%m')
ORDER BY mes DESC;

-- Churn (usuários que cancelaram)
SELECT 
  u.id,
  u.email,
  s.created_at as data_assinatura,
  s.canceled_at as data_cancelamento,
  DATEDIFF(s.canceled_at, s.created_at) as dias_ate_cancelamento
FROM subscriptions s
JOIN users u ON s.user_id = u.id
WHERE s.status = 'canceled'
ORDER BY s.canceled_at DESC
LIMIT 100;

-- Taxa de sucesso de pagamento
SELECT 
  DATE_FORMAT(created_at, '%Y-%m-%d') as data,
  status,
  COUNT(*) as quantidade
FROM payment_history
GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d'), status
ORDER BY data DESC;
```

---

## 🎯 Resumo da Arquitetura

| Aspecto | Solução |
|---------|---------|
| **Processamento de Cartões** | Stripe (PCI-DSS Level 1) |
| **Armazenamento de Cartões** | Stripe (tokenizado) |
| **Armazenamento de IDs** | MySQL (criptografado) |
| **Histórico de Transações** | MySQL + Stripe |
| **Renovação Automática** | Stripe (triggers automáticas) |
| **Conformidade** | LGPD, PCI-DSS, GDPR |
| **Segurança** | HTTPS, JWT, Webhooks assinados |
| **Backup** | MySQL backups + Stripe redundância |

---

**Conclusão:** Sistema robusto, seguro e escalável para processar pagamentos totalmente independente da integração com Mercado Livre! 🚀
