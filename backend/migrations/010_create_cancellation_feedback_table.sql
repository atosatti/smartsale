-- Criação da tabela de feedback de cancelamento
CREATE TABLE IF NOT EXISTS cancellation_feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  subscription_id INT,
  reason VARCHAR(100),
  details LONGTEXT,
  improvements LONGTEXT,
  would_return BOOLEAN DEFAULT NULL,
  admin_notified BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_subscription_id (subscription_id),
  INDEX idx_created_at (created_at)
);
