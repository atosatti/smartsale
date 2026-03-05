# Verificar Dados do Banco

## Verificar Tabela de Planos

```sql
-- Ver todos os planos
SELECT * FROM plans;

-- Ver estrutura da tabela plans
DESCRIBE plans;

-- Ver colunas disponíveis
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='plans';
```

## Resultado Esperado

A tabela `plans` deve ter:
- id (INT)
- name (VARCHAR) - 'free', 'basic', 'premium', 'enterprise'
- display_name (VARCHAR)
- monthly_price (DECIMAL)
- features (TEXT)
- created_at (TIMESTAMP)

## Se não houver dados:

```sql
INSERT INTO plans (name, display_name, monthly_price, features, created_at) VALUES
('free', 'Free', 0, 'Basic features', NOW()),
('basic', 'Basic', 9.99, 'Basic features', NOW()),
('premium', 'Premium', 29.99, 'Premium features', NOW()),
('enterprise', 'Enterprise', 99.99, 'Enterprise features', NOW());
```

## Problema Identificado

O endpoint `/confirm-payment` busca na tabela `plans`:
```typescript
const [plans] = await connection.execute(
  'SELECT * FROM plans WHERE name = ?',
  [planId]
);
```

Se a tabela não existir ou não tiver dados, retornará "Plano não encontrado".
