-- ==========================================
-- SMARTSALE - ADICIONAR COLUNAS DE PAGAMENTO
-- Script corrigido para MySQL 9.6
-- ==========================================

USE smartsale;

-- Adicionar colunas à tabela users para suporte a pagamentos
ALTER TABLE users ADD COLUMN subscription_status ENUM('active', 'past_due', 'canceled', 'unpaid', 'incomplete') DEFAULT 'active' COMMENT 'Status da assinatura';
ALTER TABLE users ADD COLUMN stripe_subscription_id VARCHAR(255) UNIQUE COMMENT 'Stripe subscription ID';
ALTER TABLE users ADD COLUMN subscription_start_date TIMESTAMP NULL COMMENT 'Data início da assinatura';
ALTER TABLE users ADD COLUMN subscription_end_date TIMESTAMP NULL COMMENT 'Data fim da assinatura';
ALTER TABLE users ADD COLUMN billing_email VARCHAR(255) COMMENT 'Email de faturamento';
ALTER TABLE users ADD COLUMN billing_name VARCHAR(255) COMMENT 'Nome para faturamento';
ALTER TABLE users ADD COLUMN billing_address VARCHAR(500) COMMENT 'Endereço de faturamento';
ALTER TABLE users ADD COLUMN tax_id VARCHAR(50) COMMENT 'CPF/CNPJ para NF-e';
ALTER TABLE users ADD COLUMN is_trial BOOLEAN DEFAULT false COMMENT 'Em período de teste';
ALTER TABLE users ADD COLUMN trial_start_date TIMESTAMP NULL COMMENT 'Início do trial';
ALTER TABLE users ADD COLUMN trial_end_date TIMESTAMP NULL COMMENT 'Fim do trial';
ALTER TABLE users ADD COLUMN default_payment_method VARCHAR(255) COMMENT 'Stripe payment method ID';
ALTER TABLE users ADD COLUMN payment_method_last_4 VARCHAR(4) COMMENT 'Últimos 4 dígitos';
ALTER TABLE users ADD COLUMN payment_method_type VARCHAR(50) COMMENT 'card, boleto, pix, etc';
ALTER TABLE users ADD COLUMN auto_renew BOOLEAN DEFAULT true COMMENT 'Renovação automática';

-- Adicionar índices
ALTER TABLE users ADD INDEX idx_stripe_subscription_id (stripe_subscription_id);
ALTER TABLE users ADD INDEX idx_subscription_status (subscription_status);

-- Modificar coluna subscription_status em subscriptions
ALTER TABLE subscriptions MODIFY COLUMN status ENUM('active', 'past_due', 'unpaid', 'canceled', 'incomplete') DEFAULT 'active';

-- Adicionar colunas à tabela subscriptions
ALTER TABLE subscriptions ADD COLUMN plan_name VARCHAR(100);
ALTER TABLE subscriptions ADD COLUMN plan_price DECIMAL(10, 2);
ALTER TABLE subscriptions ADD COLUMN current_period_start TIMESTAMP;
ALTER TABLE subscriptions ADD COLUMN current_period_end TIMESTAMP;
ALTER TABLE subscriptions ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT false COMMENT 'Cancelar ao final do período?';
ALTER TABLE subscriptions ADD COLUMN canceled_at TIMESTAMP NULL COMMENT 'Data do cancelamento';
ALTER TABLE subscriptions ADD COLUMN ended_at TIMESTAMP NULL COMMENT 'Data do término';
ALTER TABLE subscriptions ADD COLUMN billing_cycle_anchor TIMESTAMP COMMENT 'Data referência para renovações';

-- Adicionar índices
ALTER TABLE subscriptions ADD INDEX idx_stripe_subscription_id (stripe_subscription_id);

SELECT 'Colunas adicionadas com sucesso!' as status;
