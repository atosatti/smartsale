-- ==========================================
-- MIGRATION: Create Cancellation Feedback Table
-- Descrição: Tabela para armazenar feedbacks de cancelamento de assinatura
-- ==========================================

USE smartsale;

CREATE TABLE IF NOT EXISTS cancellation_feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  subscription_id INT,
  reason VARCHAR(100) COMMENT 'Motivo principal: too_expensive, not_using, found_alternative, other',
  details TEXT COMMENT 'Detalhes adicionais do cancelamento',
  email_feedback VARCHAR(100) COMMENT 'Como podemos melhorar',
  improvements TEXT COMMENT 'Sugestões de melhorias',
  would_return BOOLEAN COMMENT 'Voltaria a usar no futuro?',
  should_notify_admin BOOLEAN DEFAULT true COMMENT 'Notificar admin?',
  admin_notified BOOLEAN DEFAULT false COMMENT 'Admin foi notificado?',
  notified_at TIMESTAMP NULL COMMENT 'Data da notificação',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_reason (reason),
  INDEX idx_created_at (created_at)
);

-- Adicionar colunas à tabela subscriptions se não existirem
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false COMMENT 'Cancelar ao final do período?',
ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMP NULL COMMENT 'Data do cancelamento solicitado';

-- Adicionar coluna à tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS cancellation_feedback_id INT COMMENT 'ID do último feedback de cancelamento';

SELECT 'Tabela cancellation_feedback criada com sucesso!' as status;
