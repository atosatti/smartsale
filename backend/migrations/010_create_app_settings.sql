-- Criar tabela de configurações globais da aplicação
CREATE TABLE IF NOT EXISTS app_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(255) NOT NULL UNIQUE,
  setting_value LONGTEXT,
  data_type VARCHAR(50) DEFAULT 'string', -- string, json, boolean, number
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Criar tabela de auditoria para configurações
CREATE TABLE IF NOT EXISTS app_settings_audit_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL, -- create, update, delete
  old_value LONGTEXT,
  new_value LONGTEXT,
  admin_user_id INT NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_setting_key (setting_key),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Criar tabela específica para tokens OAuth
CREATE TABLE IF NOT EXISTS oauth_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  provider VARCHAR(50) NOT NULL, -- mercado-livre, google, facebook, etc
  access_token LONGTEXT NOT NULL,
  refresh_token LONGTEXT,
  token_type VARCHAR(50) DEFAULT 'Bearer',
  expires_in INT, -- segundos
  expires_at TIMESTAMP NULL,
  scope TEXT,
  provider_user_id VARCHAR(255), -- para rastrear qual usuário do provider
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_refreshed_at TIMESTAMP NULL,
  
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_provider (provider),
  INDEX idx_provider (provider),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Criar tabela de auditoria para tokens OAuth
CREATE TABLE IF NOT EXISTS oauth_tokens_audit_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  oauth_token_id INT,
  provider VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL, -- connect, refresh, disconnect, rotate
  reason TEXT,
  admin_user_id INT NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (oauth_token_id) REFERENCES oauth_tokens(id) ON DELETE SET NULL,
  FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_provider (provider),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
