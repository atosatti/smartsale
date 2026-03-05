-- Verificar assinaturas no banco de dados

-- 1. Ver todas as assinaturas
SELECT id, user_id, plan, status, stripe_subscription_id, created_at, current_period_end 
FROM subscriptions 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Ver assinaturas de um usuário específico (trocar ID)
SELECT id, user_id, plan, status, stripe_subscription_id, cancel_at_period_end, canceled_at, created_at
FROM subscriptions 
WHERE user_id = 1;  -- ← TROCAR para seu user_id

-- 3. Ver quantas assinaturas cada usuário tem
SELECT u.id, u.email, COUNT(s.id) as total_subs
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
GROUP BY u.id, u.email
ORDER BY u.id DESC
LIMIT 10;

-- 4. Ver feedback de cancelamento
SELECT * FROM cancellation_feedback 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Se nenhuma assinatura for encontrada, criar uma de teste:
-- INSERT INTO subscriptions (user_id, plan, status, stripe_subscription_id, stripe_charge_id, created_at, current_period_end)
-- VALUES (1, 'premium', 'active', 'sub_test_123', 'ch_test_123', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY));
