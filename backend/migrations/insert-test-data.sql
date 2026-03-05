-- ==========================================
-- SMARTSALE - INSERIR USUÁRIOS E DADOS DE TESTE
-- ==========================================

USE smartsale;

-- Inserir usuários de teste
INSERT INTO users (email, first_name, last_name, phone, subscription_plan, subscription_status, is_verified, two_fa_enabled)
VALUES
  ('free.user@smartsale.com', 'Free', 'User', '+5511999999999', 'free', 'active', true, false),
  ('basic.user@smartsale.com', 'Basic', 'User', '+5511988888888', 'basic', 'active', true, false),
  ('premium.user@smartsale.com', 'Premium', 'User', '+5511977777777', 'premium', 'active', true, true);

SELECT 'Usuários de teste inseridos com sucesso!' as status;

-- Inserir métodos de pagamento
INSERT INTO payment_methods (user_id, stripe_payment_method_id, type, card_brand, card_last_4, card_exp_month, card_exp_year, card_holder_name, is_default, is_active)
VALUES
  ((SELECT id FROM users WHERE email = 'basic.user@smartsale.com'), 'pm_1234567890ABCDEF_TEST', 'card', 'visa', '4242', 12, 2026, 'Basic User', true, true),
  ((SELECT id FROM users WHERE email = 'premium.user@smartsale.com'), 'pm_ABCDEF1234567890_TEST', 'card', 'mastercard', '5555', 6, 2027, 'Premium User', true, true);

SELECT 'Métodos de pagamento inseridos!' as status;

-- Inserir assinaturas
INSERT INTO subscriptions (user_id, stripe_subscription_id, plan, plan_name, plan_price, status, current_period_start, current_period_end, billing_cycle_anchor, created_at)
VALUES
  ((SELECT id FROM users WHERE email = 'basic.user@smartsale.com'), 'sub_1234567890ABCDEF_TEST', 'basic', 'Básico', 9.99, 'active', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), NOW(), NOW()),
  ((SELECT id FROM users WHERE email = 'premium.user@smartsale.com'), 'sub_ABCDEF1234567890_TEST', 'premium', 'Premium', 29.99, 'active', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), NOW(), DATE_SUB(NOW(), INTERVAL 30 DAY));

SELECT 'Assinaturas inseridas!' as status;

-- Inserir histórico de pagamentos
INSERT INTO payment_history (user_id, stripe_charge_id, stripe_invoice_id, stripe_payment_intent_id, amount, amount_refunded, currency, transaction_type, status, payment_method_id, payment_method_type, card_last_4, billing_period_start, billing_period_end, description, invoice_number, created_at)
VALUES
  ((SELECT id FROM users WHERE email = 'basic.user@smartsale.com'), 'ch_1234567890ABCDEF_TEST', 'in_1234567890ABCDEF_TEST', 'pi_1234567890ABCDEF_TEST', 9.99, 0.00, 'BRL', 'initial_charge', 'succeeded', (SELECT id FROM payment_methods WHERE stripe_payment_method_id = 'pm_1234567890ABCDEF_TEST'), 'card', '4242', DATE_SUB(NOW(), INTERVAL 30 DAY), NOW(), 'Assinatura Basic - Primeira cobrança', 'INV-001-2026', DATE_SUB(NOW(), INTERVAL 30 DAY)),
  ((SELECT id FROM users WHERE email = 'premium.user@smartsale.com'), 'ch_ABCDEF1234567890_TEST', 'in_ABCDEF1234567890_TEST', 'pi_ABCDEF1234567890_TEST', 29.99, 0.00, 'BRL', 'initial_charge', 'succeeded', (SELECT id FROM payment_methods WHERE stripe_payment_method_id = 'pm_ABCDEF1234567890_TEST'), 'card', '5555', DATE_SUB(NOW(), INTERVAL 60 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY), 'Assinatura Premium - Cobrança anterior', 'INV-002-2026', DATE_SUB(NOW(), INTERVAL 60 DAY)),
  ((SELECT id FROM users WHERE email = 'premium.user@smartsale.com'), 'ch_RENEWAL1234567890_TEST', 'in_RENEWAL1234567890_TEST', 'pi_RENEWAL1234567890_TEST', 29.99, 0.00, 'BRL', 'renewal', 'succeeded', (SELECT id FROM payment_methods WHERE stripe_payment_method_id = 'pm_ABCDEF1234567890_TEST'), 'card', '5555', DATE_SUB(NOW(), INTERVAL 30 DAY), NOW(), 'Assinatura Premium - Renovação mensal', 'INV-003-2026', DATE_SUB(NOW(), INTERVAL 30 DAY));

SELECT 'Histórico de pagamentos inserido!' as status;

-- Inserir faturas
INSERT INTO invoices (user_id, stripe_invoice_id, invoice_number, subtotal, tax, discount, total, amount_paid, amount_due, issue_date, due_date, paid_at, status)
VALUES
  ((SELECT id FROM users WHERE email = 'basic.user@smartsale.com'), 'in_1234567890ABCDEF_TEST', 'FAT-2026-0001', 9.99, 0.00, 0.00, 9.99, 9.99, 0.00, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY), 'paid'),
  ((SELECT id FROM users WHERE email = 'premium.user@smartsale.com'), 'in_ABCDEF1234567890_TEST', 'FAT-2026-0002', 29.99, 0.00, 0.00, 29.99, 29.99, 0.00, DATE_SUB(NOW(), INTERVAL 60 DAY), DATE_SUB(NOW(), INTERVAL 50 DAY), DATE_SUB(NOW(), INTERVAL 55 DAY), 'paid'),
  ((SELECT id FROM users WHERE email = 'premium.user@smartsale.com'), 'in_RENEWAL1234567890_TEST', 'FAT-2026-0003', 29.99, 0.00, 0.00, 29.99, 29.99, 0.00, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY), 'paid');

SELECT 'Faturas inseridas!' as status;

-- Resumo da inicialização
SELECT '====== BANCO INICIALIZADO COM SUCESSO ======' as info;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_plans FROM plans;
SELECT COUNT(*) as total_subscriptions FROM subscriptions;
SELECT COUNT(*) as total_payment_history FROM payment_history;
SELECT COUNT(*) as total_invoices FROM invoices;
