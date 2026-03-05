-- ==========================================
-- SMARTSALE DATABASE SEED DATA
-- Data de exemplo para testes
-- ==========================================

USE smartsale;

-- ==========================================
-- INSERT PLANS
-- ==========================================

INSERT INTO plans (
  name, display_name, description, 
  monthly_price, annual_price, 
  max_searches_per_day, max_saved_products,
  price_notifications, competitor_analysis, export_reports, priority_support,
  is_active, is_popular
) VALUES
  (
    'free', 'Gratuito', 'Plano básico para conhecer a plataforma',
    0, 0,
    5, 10,
    false, false, false, false,
    true, false
  ),
  (
    'basic', 'Básico', 'Ideal para pequenos negócios',
    9.99, 99.90,
    50, 100,
    true, false, false, false,
    true, false
  ),
  (
    'premium', 'Premium', 'Acesso completo com análises avançadas',
    29.99, 299.90,
    500, 1000,
    true, true, true, true,
    true, true
  ),
  (
    'enterprise', 'Enterprise', 'Solução completa para grandes empresas',
    99.99, 999.90,
    -1, -1,
    true, true, true, true,
    true, false
  );

-- ==========================================
-- INSERT PLAN FEATURES
-- ==========================================

-- Free plan features
INSERT INTO plan_features (plan_id, feature_name, feature_value, display_order) VALUES
  ((SELECT id FROM plans WHERE name = 'free'), 'Buscas ilimitadas (limitadas)', 'Até 5 por dia', 1),
  ((SELECT id FROM plans WHERE name = 'free'), 'Produtos salvos', '10 máximo', 2),
  ((SELECT id FROM plans WHERE name = 'free'), 'Histórico de buscas', '30 dias', 3);

-- Basic plan features
INSERT INTO plan_features (plan_id, feature_name, feature_value, display_order) VALUES
  ((SELECT id FROM plans WHERE name = 'basic'), 'Buscas diárias', 'Até 50', 1),
  ((SELECT id FROM plans WHERE name = 'basic'), 'Produtos salvos', '100 máximo', 2),
  ((SELECT id FROM plans WHERE name = 'basic'), 'Notificações de preço', 'Sim', 3),
  ((SELECT id FROM plans WHERE name = 'basic'), 'Histórico de buscas', '90 dias', 4);

-- Premium plan features
INSERT INTO plan_features (plan_id, feature_name, feature_value, display_order) VALUES
  ((SELECT id FROM plans WHERE name = 'premium'), 'Buscas diárias', 'Até 500', 1),
  ((SELECT id FROM plans WHERE name = 'premium'), 'Produtos salvos', '1000 máximo', 2),
  ((SELECT id FROM plans WHERE name = 'premium'), 'Notificações de preço', 'Sim', 3),
  ((SELECT id FROM plans WHERE name = 'premium'), 'Análise de concorrentes', 'Sim', 4),
  ((SELECT id FROM plans WHERE name = 'premium'), 'Exportar relatórios', 'Sim (PDF/CSV)', 5),
  ((SELECT id FROM plans WHERE name = 'premium'), 'Suporte prioritário', 'Email 24h', 6),
  ((SELECT id FROM plans WHERE name = 'premium'), 'Histórico de buscas', 'Ilimitado', 7);

-- Enterprise plan features
INSERT INTO plan_features (plan_id, feature_name, feature_value, display_order) VALUES
  ((SELECT id FROM plans WHERE name = 'enterprise'), 'Buscas diárias', 'Ilimitadas', 1),
  ((SELECT id FROM plans WHERE name = 'enterprise'), 'Produtos salvos', 'Ilimitados', 2),
  ((SELECT id FROM plans WHERE name = 'enterprise'), 'Notificações de preço', 'Sim', 3),
  ((SELECT id FROM plans WHERE name = 'enterprise'), 'Análise de concorrentes', 'Sim (avançada)', 4),
  ((SELECT id FROM plans WHERE name = 'enterprise'), 'Exportar relatórios', 'Sim (todos formatos)', 5),
  ((SELECT id FROM plans WHERE name = 'enterprise'), 'Suporte prioritário', 'Telefone + Chat 24/7', 6),
  ((SELECT id FROM plans WHERE name = 'enterprise'), 'API access', 'Sim', 7),
  ((SELECT id FROM plans WHERE name = 'enterprise'), 'Custom integration', 'Sim', 8),
  ((SELECT id FROM plans WHERE name = 'enterprise'), 'Dedicated account manager', 'Sim', 9);

-- ==========================================
-- INSERT TEST USERS
-- ==========================================

INSERT INTO users (
  email, password, first_name, last_name, phone,
  subscription_plan, subscription_status,
  is_verified, two_fa_enabled
) VALUES
  (
    'free.user@smartsale.com', '$2b$10$encrypted_password_hash_here', 
    'Free', 'User', '+5511999999999',
    'free', 'active',
    true, false
  ),
  (
    'basic.user@smartsale.com', '$2b$10$encrypted_password_hash_here',
    'Basic', 'User', '+5511988888888',
    'basic', 'active',
    true, false
  ),
  (
    'premium.user@smartsale.com', '$2b$10$encrypted_password_hash_here',
    'Premium', 'User', '+5511977777777',
    'premium', 'active',
    true, true
  );

-- ==========================================
-- INSERT TEST PAYMENT METHODS
-- ==========================================

INSERT INTO payment_methods (
  user_id, stripe_payment_method_id, type,
  card_brand, card_last_4, card_exp_month, card_exp_year, card_holder_name,
  is_default, is_active
) VALUES
  (
    (SELECT id FROM users WHERE email = 'basic.user@smartsale.com'),
    'pm_1234567890ABCDEF_TEST',
    'card',
    'visa', '4242', 12, 2026, 'Basic User',
    true, true
  ),
  (
    (SELECT id FROM users WHERE email = 'premium.user@smartsale.com'),
    'pm_ABCDEF1234567890_TEST',
    'card',
    'mastercard', '5555', 6, 2027, 'Premium User',
    true, true
  );

-- ==========================================
-- INSERT TEST SUBSCRIPTIONS
-- ==========================================

INSERT INTO subscriptions (
  user_id, stripe_subscription_id,
  plan, plan_name, plan_price,
  status,
  current_period_start, current_period_end,
  billing_cycle_anchor,
  created_at
) VALUES
  (
    (SELECT id FROM users WHERE email = 'basic.user@smartsale.com'),
    'sub_1234567890ABCDEF_TEST',
    'basic', 'Básico', 9.99,
    'active',
    NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY),
    NOW(),
    NOW()
  ),
  (
    (SELECT id FROM users WHERE email = 'premium.user@smartsale.com'),
    'sub_ABCDEF1234567890_TEST',
    'premium', 'Premium', 29.99,
    'active',
    NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY),
    NOW(),
    DATE_SUB(NOW(), INTERVAL 30 DAY)
  );

-- ==========================================
-- INSERT TEST PAYMENT HISTORY
-- ==========================================

INSERT INTO payment_history (
  user_id, stripe_charge_id, stripe_invoice_id, stripe_payment_intent_id,
  amount, amount_refunded, currency,
  transaction_type, status,
  payment_method_id, payment_method_type, card_last_4,
  billing_period_start, billing_period_end,
  description, invoice_number,
  created_at
) VALUES
  (
    (SELECT id FROM users WHERE email = 'basic.user@smartsale.com'),
    'ch_1234567890ABCDEF_TEST',
    'in_1234567890ABCDEF_TEST',
    'pi_1234567890ABCDEF_TEST',
    9.99, 0.00, 'BRL',
    'initial_charge', 'succeeded',
    (SELECT id FROM payment_methods WHERE stripe_payment_method_id = 'pm_1234567890ABCDEF_TEST'),
    'card', '4242',
    DATE_SUB(NOW(), INTERVAL 30 DAY), NOW(),
    'Assinatura Basic - Primeira cobrança',
    'INV-001-2026',
    DATE_SUB(NOW(), INTERVAL 30 DAY)
  ),
  (
    (SELECT id FROM users WHERE email = 'premium.user@smartsale.com'),
    'ch_ABCDEF1234567890_TEST',
    'in_ABCDEF1234567890_TEST',
    'pi_ABCDEF1234567890_TEST',
    29.99, 0.00, 'BRL',
    'initial_charge', 'succeeded',
    (SELECT id FROM payment_methods WHERE stripe_payment_method_id = 'pm_ABCDEF1234567890_TEST'),
    'card', '5555',
    DATE_SUB(NOW(), INTERVAL 60 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY),
    'Assinatura Premium - Cobrança anterior',
    'INV-002-2026',
    DATE_SUB(NOW(), INTERVAL 60 DAY)
  ),
  (
    (SELECT id FROM users WHERE email = 'premium.user@smartsale.com'),
    'ch_RENEWAL1234567890_TEST',
    'in_RENEWAL1234567890_TEST',
    'pi_RENEWAL1234567890_TEST',
    29.99, 0.00, 'BRL',
    'renewal', 'succeeded',
    (SELECT id FROM payment_methods WHERE stripe_payment_method_id = 'pm_ABCDEF1234567890_TEST'),
    'card', '5555',
    DATE_SUB(NOW(), INTERVAL 30 DAY), NOW(),
    'Assinatura Premium - Renovação mensal',
    'INV-003-2026',
    DATE_SUB(NOW(), INTERVAL 30 DAY)
  );

-- ==========================================
-- INSERT TEST INVOICES
-- ==========================================

INSERT INTO invoices (
  user_id, stripe_invoice_id, invoice_number,
  subtotal, tax, discount, total, amount_paid, amount_due,
  issue_date, due_date, paid_at,
  status
) VALUES
  (
    (SELECT id FROM users WHERE email = 'basic.user@smartsale.com'),
    'in_1234567890ABCDEF_TEST',
    'FAT-2026-0001',
    9.99, 0.00, 0.00, 9.99, 9.99, 0.00,
    DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY),
    'paid'
  ),
  (
    (SELECT id FROM users WHERE email = 'premium.user@smartsale.com'),
    'in_ABCDEF1234567890_TEST',
    'FAT-2026-0002',
    29.99, 0.00, 0.00, 29.99, 29.99, 0.00,
    DATE_SUB(NOW(), INTERVAL 60 DAY), DATE_SUB(NOW(), INTERVAL 50 DAY), DATE_SUB(NOW(), INTERVAL 55 DAY),
    'paid'
  ),
  (
    (SELECT id FROM users WHERE email = 'premium.user@smartsale.com'),
    'in_RENEWAL1234567890_TEST',
    'FAT-2026-0003',
    29.99, 0.00, 0.00, 29.99, 29.99, 0.00,
    DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY),
    'paid'
  );

-- ==========================================
-- INSERT INITIAL REVENUE SUMMARY
-- ==========================================

INSERT INTO revenue_summary (
  date_period,
  total_revenue, total_transactions, successful_transactions, failed_transactions,
  average_transaction, unique_customers,
  revenue_free, revenue_basic, revenue_premium, revenue_enterprise
) VALUES
  (
    DATE(NOW()),
    39.98, 2, 2, 0,
    19.99, 2,
    0.00, 9.99, 29.99, 0.00
  ),
  (
    DATE_SUB(DATE(NOW()), INTERVAL 1 DAY),
    0.00, 0, 0, 0,
    0.00, 0,
    0.00, 0.00, 0.00, 0.00
  );

-- ==========================================
-- SUMMARY STATISTICS
-- ==========================================

-- Mostrar estatísticas
SELECT 
  'SMARTSALE - INICIALIZAÇÃO COMPLETA' as status,
  COUNT(*) as total_users FROM users;

SELECT 'Planos criados' as info, COUNT(*) as total FROM plans;
SELECT 'Métodos de pagamento' as info, COUNT(*) as total FROM payment_methods;
SELECT 'Histórico de pagamentos' as info, COUNT(*) as total FROM payment_history;
SELECT 'Faturas' as info, COUNT(*) as total FROM invoices;
SELECT 'Assinaturas' as info, COUNT(*) as total FROM subscriptions;

-- ==========================================
-- DICAS DE TESTE
-- ==========================================

/*
USUÁRIOS DE TESTE:
1. Email: free.user@smartsale.com (Plano Free - Sem pagamento)
2. Email: basic.user@smartsale.com (Plano Basic - Ativo)
3. Email: premium.user@smartsale.com (Plano Premium - Ativo)

INFORMAÇÕES DE CARTÃO (Para teste no Stripe):
- Número: 4242 4242 4242 4242
- Expiração: 12/26
- CVV: 123
- Nome: Test User

STRIPE TEST MODE:
- Use chaves de teste do Stripe em .env
- Todos os pagamentos serão simulados
- Consulte: https://stripe.com/docs/testing

PRÓXIMOS PASSOS:
1. Configurar variáveis de ambiente (.env)
2. Inicializar Stripe SDK
3. Implementar webhook endpoints
4. Criar UI de checkout
5. Testar fluxo de pagamento
*/
