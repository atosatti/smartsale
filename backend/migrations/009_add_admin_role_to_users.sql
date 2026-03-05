-- Migration: Add admin role support to users table
-- Notes: Adds role field to support RBAC (role-based access control)
-- User IDs are already INT which supports up to 2,147,483,647
-- For future bigint support, can migrate to BIGINT if needed

USE smartsale;

-- Add role column to users table with ENUM for 'user' and 'admin'
-- Default value is 'user' for all existing and new users
ALTER TABLE users 
ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user' 
AFTER two_fa_secret,
ADD INDEX idx_role (role);

-- Optional: Set first user as admin (uncomment if needed)
-- UPDATE users SET role = 'admin' WHERE id = 1 LIMIT 1;

-- Add admin_notes column for admin to take notes about users
ALTER TABLE users 
ADD COLUMN admin_notes TEXT NULL 
AFTER role;

-- Add last_login tracking for admin view
ALTER TABLE users 
ADD COLUMN last_login TIMESTAMP NULL 
DEFAULT NULL 
ON UPDATE CURRENT_TIMESTAMP 
AFTER updated_at;

-- Create admin_audit_logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  admin_user_id INT NOT NULL,
  target_user_id INT,
  action VARCHAR(100) NOT NULL COMMENT 'view, edit, delete, verify, etc',
  resource_type VARCHAR(50) COMMENT 'user, payment, subscription, etc',
  changes JSON COMMENT 'Before and after values',
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_admin_user_id (admin_user_id),
  INDEX idx_target_user_id (target_user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);

-- Add active status for users (soft delete support)
ALTER TABLE users 
ADD COLUMN is_active BOOLEAN DEFAULT true 
AFTER is_verified;
