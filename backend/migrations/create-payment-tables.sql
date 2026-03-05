-- ==========================================
-- SMARTSALE - TABELAS DE PAGAMENTO
-- ==========================================

USE smartsale;

-- payment_methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  stripe_payment_method_id VARCHAR(255) UNIQUE COMMENT 'Stripe payment method ID (pm_xxx)',
  type ENUM('card', 'boleto', 'pix', 'bank_transfer') DEFAULT 'card',
  card_brand VARCHAR(50) COMMENT 'visa, mastercard, amex, elo, etc',
  card_last_4 VARCHAR(4),
  card_exp_month INT,
  card_exp_year INT,
  card_holder_name VARCHAR(255),
  bank_code VARCHAR(10),
  account_type VARCHAR(50),
  is_default BOOLEAN DEFAULT false COMMENT 'Método padrão?',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL COMMENT 'Soft delete',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_stripe_payment_method_id (stripe_payment_method_id),
  UNIQUE KEY unique_default_per_user (user_id, is_default)
);

-- payment_history
CREATE TABLE IF NOT EXISTS payment_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  stripe_charge_id VARCHAR(255) UNIQUE COMMENT 'Stripe charge ID',
  stripe_invoice_id VARCHAR(255) COMMENT 'Stripe invoice ID',
  stripe_payment_intent_id VARCHAR(255) COMMENT 'Stripe payment intent ID',
  amount DECIMAL(10, 2) NOT NULL COMMENT 'Valor em reais',
  amount_refunded DECIMAL(10, 2) DEFAULT 0 COMMENT 'Valor reembolsado',
  currency VARCHAR(3) DEFAULT 'BRL',
  transaction_type ENUM('initial_charge', 'renewal', 'refund', 'adjustment') DEFAULT 'initial_charge',
  status ENUM('pending', 'succeeded', 'failed', 'refunded', 'disputed') DEFAULT 'pending',
  failure_reason VARCHAR(500) COMMENT 'Motivo da falha',
  payment_method_id INT COMMENT 'Qual método foi usado',
  payment_method_type VARCHAR(50),
  card_last_4 VARCHAR(4),
  billing_period_start TIMESTAMP NULL COMMENT 'Início do período',
  billing_period_end TIMESTAMP NULL COMMENT 'Fim do período',
  description TEXT COMMENT 'Descrição do pagamento',
  invoice_number VARCHAR(100) COMMENT 'Número para auditoria',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_stripe_charge_id (stripe_charge_id)
);

-- invoices
CREATE TABLE IF NOT EXISTS invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  stripe_invoice_id VARCHAR(255) UNIQUE,
  nf_number VARCHAR(100) COMMENT 'Número da nota fiscal',
  invoice_number VARCHAR(100) COMMENT 'Número sequencial interno',
  subtotal DECIMAL(10, 2),
  tax DECIMAL(10, 2) DEFAULT 0.00,
  discount DECIMAL(10, 2) DEFAULT 0.00,
  total DECIMAL(10, 2),
  amount_paid DECIMAL(10, 2),
  amount_due DECIMAL(10, 2),
  issue_date TIMESTAMP,
  due_date TIMESTAMP,
  paid_at TIMESTAMP NULL,
  status ENUM('draft', 'open', 'paid', 'void', 'uncollectible') DEFAULT 'draft',
  pdf_url VARCHAR(500) COMMENT 'URL do PDF para download',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_invoice_number (invoice_number)
);

-- webhook_logs
CREATE TABLE IF NOT EXISTS webhook_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  stripe_event_id VARCHAR(255) UNIQUE COMMENT 'Stripe event ID',
  event_type VARCHAR(100) COMMENT 'charge.succeeded, invoice.payment_failed, etc',
  stripe_object_id VARCHAR(255) COMMENT 'ID do objeto relacionado',
  payload JSON COMMENT 'Dados completos do evento',
  processed BOOLEAN DEFAULT false COMMENT 'Já foi processado?',
  processed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event_type (event_type),
  INDEX idx_processed (processed),
  INDEX idx_created_at (created_at)
);

-- plans
CREATE TABLE IF NOT EXISTS plans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100),
  description TEXT,
  stripe_price_id VARCHAR(255) UNIQUE COMMENT 'Stripe price ID',
  monthly_price DECIMAL(10, 2),
  annual_price DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'BRL',
  max_searches_per_day INT COMMENT 'Limite de buscas por dia (-1 = ilimitado)',
  max_saved_products INT COMMENT 'Máximo de produtos salvos',
  price_notifications BOOLEAN DEFAULT false COMMENT 'Notificações de preço',
  competitor_analysis BOOLEAN DEFAULT false COMMENT 'Análise de concorrentes',
  export_reports BOOLEAN DEFAULT false COMMENT 'Exportar relatórios',
  priority_support BOOLEAN DEFAULT false COMMENT 'Suporte prioritário',
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false COMMENT 'Plano popular (badge)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);

-- plan_features
CREATE TABLE IF NOT EXISTS plan_features (
  id INT PRIMARY KEY AUTO_INCREMENT,
  plan_id INT NOT NULL,
  feature_name VARCHAR(100),
  feature_value VARCHAR(255) COMMENT 'Valor da feature (true/false ou número)',
  display_order INT DEFAULT 0,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
  INDEX idx_plan_id (plan_id)
);

-- revenue_summary
CREATE TABLE IF NOT EXISTS revenue_summary (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date_period DATE,
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  total_transactions INT DEFAULT 0,
  successful_transactions INT DEFAULT 0,
  failed_transactions INT DEFAULT 0,
  average_transaction DECIMAL(10, 2) DEFAULT 0,
  unique_customers INT DEFAULT 0,
  revenue_free DECIMAL(15, 2) DEFAULT 0,
  revenue_basic DECIMAL(15, 2) DEFAULT 0,
  revenue_premium DECIMAL(15, 2) DEFAULT 0,
  revenue_enterprise DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_date_period (date_period),
  INDEX idx_date_period (date_period)
);

-- migrations
CREATE TABLE IF NOT EXISTS migrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  version VARCHAR(50) UNIQUE NOT NULL COMMENT 'Versão/Data da migração',
  name VARCHAR(255) NOT NULL COMMENT 'Nome descritivo',
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_version (version)
);

SELECT 'Tabelas de pagamento criadas com sucesso!' as status;
SELECT COUNT(*) as total_tables FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'smartsale';
