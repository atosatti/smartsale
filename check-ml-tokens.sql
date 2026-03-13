-- Verificar tokens Mercado Livre no banco
SELECT 
  id,
  email,
  IF(mercado_livre_token IS NOT NULL, 'SIM', 'NÃO') as tem_token,
  IF(mercado_livre_token IS NOT NULL, SUBSTR(mercado_livre_token, 1, 20), '') as token_inicio,
  mercado_livre_user_id,
  mercado_livre_token_expires_at
FROM users 
WHERE mercado_livre_token IS NOT NULL
LIMIT 10;
