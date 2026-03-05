-- Create database
CREATE DATABASE IF NOT EXISTS smartsale;
USE smartsale;

-- Users table (Extended with payment fields)
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  google_id VARCHAR(255) UNIQUE,
  facebook_id VARCHAR(255) UNIQUE,
  two_fa_enabled BOOLEAN DEFAULT FALSE,
  two_fa_secret VARCHAR(255),
  subscription_plan ENUM('free', 'basic', 'premium', 'enterprise') DEFAULT 'free',
  subscription_status ENUM('active', 'past_due', 'canceled', 'unpaid', 'incomplete') DEFAULT 'active',
  is_verified BOOLEAN DEFAULT FALSE,
  
  -- Stripe IDs
  stripe_customer_id VARCHAR(255) UNIQUE COMMENT 'Stripe customer ID',
  stripe_subscription_id VARCHAR(255) UNIQUE COMMENT 'Stripe subscription ID',
  
  -- Subscription dates
  subscription_start_date TIMESTAMP NULL COMMENT 'Data início da assinatura',
  subscription_end_date TIMESTAMP NULL COMMENT 'Data fim da assinatura',
  
  -- Billing info
  billing_email VARCHAR(255) COMMENT 'Email de faturamento',
  billing_name VARCHAR(255) COMMENT 'Nome para faturamento',
  billing_address VARCHAR(500) COMMENT 'Endereço de faturamento',
  tax_id VARCHAR(50) COMMENT 'CPF/CNPJ para NF-e',
  
  -- Trial period
  is_trial BOOLEAN DEFAULT false COMMENT 'Em período de teste',
  trial_start_date TIMESTAMP NULL COMMENT 'Início do trial',
  trial_end_date TIMESTAMP NULL COMMENT 'Fim do trial',
  
  -- Payment method
  default_payment_method VARCHAR(255) COMMENT 'Stripe payment method ID',
  payment_method_last_4 VARCHAR(4) COMMENT 'Últimos 4 dígitos',
  payment_method_type VARCHAR(50) COMMENT 'card, boleto, pix, etc',
  
  -- Auto-renewal
  auto_renew BOOLEAN DEFAULT true COMMENT 'Renovação automática',
  
  -- Mercado Livre OAuth
  mercado_livre_token VARCHAR(1000) COMMENT 'Access token do Mercado Livre',
  mercado_livre_user_id VARCHAR(255) UNIQUE COMMENT 'ID do usuário no Mercado Livre',
  mercado_livre_refresh_token VARCHAR(1000) COMMENT 'Refresh token do Mercado Livre',
  mercado_livre_token_expires_at TIMESTAMP NULL COMMENT 'Quando o token expira',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_google_id (google_id),
  INDEX idx_facebook_id (facebook_id),
  INDEX idx_stripe_customer_id (stripe_customer_id),
  INDEX idx_stripe_subscription_id (stripe_subscription_id),
  INDEX idx_subscription_plan (subscription_plan),
  INDEX idx_subscription_status (subscription_status)
);

-- Products table (user's saved searches)
CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- Product prices from different platforms
CREATE TABLE IF NOT EXISTS product_prices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  platform VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'BRL',
  url TEXT NOT NULL,
  in_stock BOOLEAN DEFAULT TRUE,
  rating DECIMAL(3, 2),
  reviews_count INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id),
  INDEX idx_platform (platform)
);

-- Search logs for analytics
CREATE TABLE IF NOT EXISTS search_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  search_query VARCHAR(255) NOT NULL,
  results_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- Subscriptions table (Extended with Stripe integration)
CREATE TABLE IF NOT EXISTS subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  
  -- Stripe IDs
  stripe_subscription_id VARCHAR(255) UNIQUE COMMENT 'Stripe subscription ID',
  
  -- Plan info
  plan ENUM('free', 'basic', 'premium', 'enterprise') NOT NULL,
  plan_name VARCHAR(100),
  plan_price DECIMAL(10, 2),
  
  -- Status
  status ENUM('active', 'past_due', 'unpaid', 'canceled', 'incomplete') DEFAULT 'active',
  
  -- Periods
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  
  -- Cancellation
  cancel_at_period_end BOOLEAN DEFAULT false COMMENT 'Cancelar ao final do período?',
  canceled_at TIMESTAMP NULL COMMENT 'Data do cancelamento',
  ended_at TIMESTAMP NULL COMMENT 'Data do término',
  
  -- Billing anchor
  billing_cycle_anchor TIMESTAMP COMMENT 'Data referência para renovações',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_stripe_subscription_id (stripe_subscription_id)
);

-- Favorites/Wishlist
CREATE TABLE IF NOT EXISTS favorites (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product (user_id, product_id)
);

-- ==========================================
-- PAYMENT SYSTEM TABLES (STRIPE INTEGRATION)
-- ==========================================

-- Payment methods (Cartões salvos, Boletos, PIX, etc)
CREATE TABLE IF NOT EXISTS payment_methods (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  
  -- Stripe ID
  stripe_payment_method_id VARCHAR(255) UNIQUE COMMENT 'Stripe payment method ID (pm_xxx)',
  
  -- Type
  type ENUM('card', 'boleto', 'pix', 'bank_transfer') DEFAULT 'card',
  
  -- Card info (public only)
  card_brand VARCHAR(50) COMMENT 'visa, mastercard, amex, elo, etc',
  card_last_4 VARCHAR(4),
  card_exp_month INT,
  card_exp_year INT,
  card_holder_name VARCHAR(255),
  
  -- Bank info
  bank_code VARCHAR(10),
  account_type VARCHAR(50),
  
  -- Control
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

-- Payment history (Histórico de transações)
CREATE TABLE IF NOT EXISTS payment_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  
  -- Stripe IDs
  stripe_charge_id VARCHAR(255) UNIQUE COMMENT 'Stripe charge ID',
  stripe_invoice_id VARCHAR(255) COMMENT 'Stripe invoice ID',
  stripe_payment_intent_id VARCHAR(255) COMMENT 'Stripe payment intent ID',
  
  -- Transaction info
  amount DECIMAL(10, 2) NOT NULL COMMENT 'Valor em reais',
  amount_refunded DECIMAL(10, 2) DEFAULT 0 COMMENT 'Valor reembolsado',
  currency VARCHAR(3) DEFAULT 'BRL',
  
  -- Type
  transaction_type ENUM('initial_charge', 'renewal', 'refund', 'adjustment') DEFAULT 'initial_charge',
  
  -- Status
  status ENUM('pending', 'succeeded', 'failed', 'refunded', 'disputed') DEFAULT 'pending',
  failure_reason VARCHAR(500) COMMENT 'Motivo da falha',
  
  -- Payment method used
  payment_method_id INT COMMENT 'Qual método foi usado',
  payment_method_type VARCHAR(50),
  card_last_4 VARCHAR(4),
  
  -- Billing period
  billing_period_start TIMESTAMP NULL COMMENT 'Início do período',
  billing_period_end TIMESTAMP NULL COMMENT 'Fim do período',
  
  -- Description
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

-- Invoices/Faturas
CREATE TABLE IF NOT EXISTS invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  
  -- IDs
  stripe_invoice_id VARCHAR(255) UNIQUE,
  nf_number VARCHAR(100) COMMENT 'Número da nota fiscal',
  invoice_number VARCHAR(100) COMMENT 'Número sequencial interno',
  
  -- Values
  subtotal DECIMAL(10, 2),
  tax DECIMAL(10, 2) DEFAULT 0.00,
  discount DECIMAL(10, 2) DEFAULT 0.00,
  total DECIMAL(10, 2),
  amount_paid DECIMAL(10, 2),
  amount_due DECIMAL(10, 2),
  
  -- Dates
  issue_date TIMESTAMP,
  due_date TIMESTAMP,
  paid_at TIMESTAMP NULL,
  
  -- Status
  status ENUM('draft', 'open', 'paid', 'void', 'uncollectible') DEFAULT 'draft',
  
  -- PDF/Download
  pdf_url VARCHAR(500) COMMENT 'URL do PDF para download',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_invoice_number (invoice_number)
);

-- Payment webhooks log (Para debugging)
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
-- PRICING AND PLANS CONFIGURATION
-- ==========================================

-- Plans (Configuração de planos)
CREATE TABLE IF NOT EXISTS plans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100),
  description TEXT,
  stripe_price_id VARCHAR(255) UNIQUE COMMENT 'Stripe price ID',
  
  -- Pricing
  monthly_price DECIMAL(10, 2),
  annual_price DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'BRL',
  
  -- Features
  max_searches_per_day INT COMMENT 'Limite de buscas por dia (-1 = ilimitado)',
  max_saved_products INT COMMENT 'Máximo de produtos salvos',
  price_notifications BOOLEAN DEFAULT false COMMENT 'Notificações de preço',
  competitor_analysis BOOLEAN DEFAULT false COMMENT 'Análise de concorrentes',
  export_reports BOOLEAN DEFAULT false COMMENT 'Exportar relatórios',
  priority_support BOOLEAN DEFAULT false COMMENT 'Suporte prioritário',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false COMMENT 'Plano popular (badge)',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_name (name)
);

-- Plan features (Detalhe de features por plano)
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
-- ANALYTICS AND REPORTING
-- ==========================================

-- Revenue by period (Para relatórios)
CREATE TABLE IF NOT EXISTS revenue_summary (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date_period DATE,
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  total_transactions INT DEFAULT 0,
  successful_transactions INT DEFAULT 0,
  failed_transactions INT DEFAULT 0,
  average_transaction DECIMAL(10, 2) DEFAULT 0,
  unique_customers INT DEFAULT 0,
  
  -- By plan
  revenue_free DECIMAL(15, 2) DEFAULT 0,
  revenue_basic DECIMAL(15, 2) DEFAULT 0,
  revenue_premium DECIMAL(15, 2) DEFAULT 0,
  revenue_enterprise DECIMAL(15, 2) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_date_period (date_period),
  INDEX idx_date_period (date_period)
);
