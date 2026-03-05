-- ==========================================
-- SMARTSALE MIGRATIONS
-- Script para gerenciar mudanças no schema
-- ==========================================

-- Uma tabela para rastrear quais migrações foram executadas
CREATE TABLE IF NOT EXISTS migrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  version VARCHAR(50) UNIQUE NOT NULL COMMENT 'Versão/Data da migração',
  name VARCHAR(255) NOT NULL COMMENT 'Nome descritivo',
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_version (version)
);

-- ==========================================
-- MIGRATION: 2026-02-04-001-payment-system
-- Descrição: Adicionar sistema de pagamento completo com Stripe
-- ==========================================

-- Registrar migração
INSERT IGNORE INTO migrations (version, name) VALUES
  ('2026-02-04-001-payment-system', 'Adicionar sistema de pagamento Stripe');

-- Extensão da tabela users (se já não existir as colunas)
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS subscription_status ENUM('active', 'past_due', 'canceled', 'unpaid', 'incomplete') DEFAULT 'active' COMMENT 'Status da assinatura',
  ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255) UNIQUE COMMENT 'Stripe subscription ID',
  ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP NULL COMMENT 'Data início da assinatura',
  ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP NULL COMMENT 'Data fim da assinatura',
  ADD COLUMN IF NOT EXISTS billing_email VARCHAR(255) COMMENT 'Email de faturamento',
  ADD COLUMN IF NOT EXISTS billing_name VARCHAR(255) COMMENT 'Nome para faturamento',
  ADD COLUMN IF NOT EXISTS billing_address VARCHAR(500) COMMENT 'Endereço de faturamento',
  ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50) COMMENT 'CPF/CNPJ para NF-e',
  ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT false COMMENT 'Em período de teste',
  ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP NULL COMMENT 'Início do trial',
  ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP NULL COMMENT 'Fim do trial',
  ADD COLUMN IF NOT EXISTS default_payment_method VARCHAR(255) COMMENT 'Stripe payment method ID',
  ADD COLUMN IF NOT EXISTS payment_method_last_4 VARCHAR(4) COMMENT 'Últimos 4 dígitos',
  ADD COLUMN IF NOT EXISTS payment_method_type VARCHAR(50) COMMENT 'card, boleto, pix, etc',
  ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT true COMMENT 'Renovação automática',
  ADD INDEX IF NOT EXISTS idx_stripe_subscription_id (stripe_subscription_id),
  ADD INDEX IF NOT EXISTS idx_subscription_status (subscription_status);

-- ==========================================
-- MIGRATION: 2026-02-04-002-payment-tables
-- Descrição: Criar tabelas de pagamento
-- ==========================================

INSERT IGNORE INTO migrations (version, name) VALUES
  ('2026-02-04-002-payment-tables', 'Criar tabelas de pagamento');

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

-- ==========================================
-- MIGRATION: 2026-02-04-003-plans-tables
-- Descrição: Criar tabelas de planos e pricing
-- ==========================================

INSERT IGNORE INTO migrations (version, name) VALUES
  ('2026-02-04-003-plans-tables', 'Criar tabelas de planos e pricing');

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

-- ==========================================
-- MIGRATION: 2026-02-04-004-subscriptions-extend
-- Descrição: Estender tabela de subscriptions
-- ==========================================

INSERT IGNORE INTO migrations (version, name) VALUES
  ('2026-02-04-004-subscriptions-extend', 'Estender tabela de subscriptions');

-- Modificar tabela subscriptions se existir
ALTER TABLE subscriptions 
  MODIFY COLUMN status ENUM('active', 'past_due', 'unpaid', 'canceled', 'incomplete') DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS plan_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS plan_price DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP,
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false COMMENT 'Cancelar ao final do período?',
  ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMP NULL COMMENT 'Data do cancelamento',
  ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP NULL COMMENT 'Data do término',
  ADD COLUMN IF NOT EXISTS billing_cycle_anchor TIMESTAMP COMMENT 'Data referência para renovações',
  DROP COLUMN IF EXISTS start_date,
  DROP COLUMN IF EXISTS end_date,
  ADD INDEX IF NOT EXISTS idx_stripe_subscription_id (stripe_subscription_id);

-- ==========================================
-- MIGRATION: 2026-02-04-005-analytics
-- Descrição: Criar tabelas de analytics
-- ==========================================

INSERT IGNORE INTO migrations (version, name) VALUES
  ('2026-02-04-005-analytics', 'Criar tabelas de analytics');

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

-- ==========================================
-- MIGRATION HELPER FUNCTIONS
-- ==========================================

-- Função para resetar banco de testes
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS reset_test_data()
BEGIN
  -- Desabilitar foreign key constraints temporariamente
  SET FOREIGN_KEY_CHECKS=0;
  
  -- Limpar dados de teste
  DELETE FROM revenue_summary WHERE date_period >= DATE_SUB(CURDATE(), INTERVAL 7 DAY);
  DELETE FROM webhook_logs WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY);
  DELETE FROM invoices WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY);
  DELETE FROM payment_history WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY);
  DELETE FROM payment_methods WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY);
  DELETE FROM subscriptions WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY);
  DELETE FROM users WHERE email LIKE '%.test@%';
  
  -- Re-habilitar foreign key constraints
  SET FOREIGN_KEY_CHECKS=1;
  
  SELECT 'Dados de teste removidos com sucesso' as message;
END //

DELIMITER ;

-- ==========================================
-- MIGRATION TRACKING VIEW
-- ==========================================

CREATE OR REPLACE VIEW v_migrations_status AS
SELECT 
  version,
  name,
  executed_at,
  DATE_FORMAT(executed_at, '%d/%m/%Y %H:%i:%s') as executed_at_formatted
FROM migrations
ORDER BY executed_at DESC;

-- ==========================================
-- STATUS FINAL
-- ==========================================

SELECT 'Sistema de pagamento Stripe iniciado com sucesso!' as status;
SELECT COUNT(*) as total_migrations FROM migrations;

-- Mostrar última migração executada
SELECT version, name, executed_at FROM v_migrations_status LIMIT 1;
