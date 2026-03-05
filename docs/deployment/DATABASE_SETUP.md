# 🗄️ Guia de Inicialização do Banco de Dados

## 📋 Visão Geral

O SmartSale utiliza **MySQL 8.0** com um schema completo para suportar:
- ✅ Autenticação de usuários
- ✅ Sistema de assinaturas com Stripe
- ✅ Histórico de pagamentos
- ✅ Métodos de pagamento salvos
- ✅ Faturas e recibos
- ✅ Analytics de receita

---

## 🚀 Instalação Rápida

### 1️⃣ Pré-requisitos

```bash
# Windows - Verificar se MySQL está instalado
mysql --version

# Se não tiver instalado:
# Baixe em: https://dev.mysql.com/downloads/mysql/
# ou use: https://www.apachefriends.org/pt_br/index.html (XAMPP)
```

### 2️⃣ Criar Banco de Dados

```bash
# Abra um terminal e entre no MySQL
mysql -u root -p

# Digite sua senha (padrão para XAMPP: deixe em branco)

# Execute na linha mysql>:
mysql> source backend/database.sql
```

**Ou em uma única linha:**

```bash
mysql -u root -p < backend/database.sql
```

### 3️⃣ Verificar Criação

```bash
mysql -u root -p

# Na linha mysql>:
mysql> USE smartsale;
mysql> SHOW TABLES;
```

Você deve ver estas tabelas:

```
+----------------------+
| Tables_in_smartsale  |
+----------------------+
| users                |
| products             |
| product_prices       |
| search_logs          |
| subscriptions        |
| favorites            |
| payment_methods      |
| payment_history      |
| invoices             |
| webhook_logs         |
| plans                |
| plan_features        |
| revenue_summary      |
| migrations           |
+----------------------+
```

---

## 📚 Scripts Disponíveis

### 1. **database.sql** - Schema Principal
Cria toda a estrutura do banco de dados.

```bash
mysql -u root -p < backend/database.sql
```

**O que cria:**
- Tabelas de usuários
- Tabelas de produtos e buscas
- Tabelas de pagamento (Stripe)
- Tabelas de análise
- Índices para performance
- Comentários de documentação

---

### 2. **database-seed.sql** - Dados de Exemplo

Popula o banco com dados de teste:

```bash
mysql -u root -p smartsale < backend/database-seed.sql
```

**Cria:**
- 4 planos (Free, Basic, Premium, Enterprise)
- 3 usuários de teste
- Métodos de pagamento de teste
- Histórico de pagamentos de exemplo
- Faturas de teste

**Usuários de Teste:**

| Email | Plano | Status |
|-------|-------|--------|
| free.user@smartsale.com | Free | Ativo |
| basic.user@smartsale.com | Basic | Ativo |
| premium.user@smartsale.com | Premium | Ativo |

---

### 3. **migrations.sql** - Controle de Versão

Gerencia mudanças no schema:

```bash
mysql -u root -p smartsale < backend/migrations.sql
```

**Registra:**
- Histórico de migrações executadas
- Versão do schema
- Data de execução
- Permite rollback seguro

---

## 🔧 Configuração de Variáveis de Ambiente

Crie arquivo `.env` no backend:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=smartsale
DB_PORT=3306

# Stripe
STRIPE_SECRET_KEY=sk_test_sua_chave_aqui
STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_aqui
STRIPE_WEBHOOK_SECRET=whsec_sua_chave_aqui

# JWT
JWT_SECRET=sua_chave_secreta_super_longa_aqui
SESSION_SECRET=outra_chave_secreta_aqui

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=seu_email@gmail.com
EMAIL_PASSWORD=sua_senha_app
```

---

## 🗑️ Operações de Limpeza

### Resetar dados de teste

```sql
mysql> USE smartsale;
mysql> CALL reset_test_data();
```

### Limpar tudo e recriar

```bash
mysql -u root -p -e "DROP DATABASE smartsale;"
mysql -u root -p < backend/database.sql
mysql -u root -p smartsale < backend/database-seed.sql
```

### Visualizar histórico de migrações

```sql
mysql> USE smartsale;
mysql> SELECT * FROM v_migrations_status;
```

---

## 📊 Consultas Úteis para Testes

### Ver todos os usuários

```sql
SELECT id, email, subscription_plan, subscription_status, created_at 
FROM users;
```

### Ver histórico de pagamentos

```sql
SELECT 
  id, user_id, amount, status, transaction_type, created_at
FROM payment_history
ORDER BY created_at DESC;
```

### Ver assinaturas ativas

```sql
SELECT 
  s.id, u.email, s.plan, s.status, s.current_period_end
FROM subscriptions s
JOIN users u ON s.user_id = u.id
WHERE s.status = 'active';
```

### Ver receita por dia

```sql
SELECT 
  DATE(created_at) as data,
  COUNT(*) as transacoes,
  SUM(amount) as receita
FROM payment_history
WHERE status = 'succeeded'
GROUP BY DATE(created_at)
ORDER BY data DESC;
```

### Ver métodos de pagamento salvos

```sql
SELECT 
  user_id, type, card_brand, card_last_4, is_default, is_active
FROM payment_methods
WHERE is_active = true;
```

---

## 🔐 Segurança

### ✅ Boas Práticas Implementadas

1. **Índices estratégicos**
   - FK (Foreign Keys) com índices
   - Índices em colunas de busca frequente
   - Unique constraints para IDs Stripe

2. **Soft Deletes**
   - Tabela `payment_methods` tem coluna `deleted_at`
   - Preserva histórico de pagamentos

3. **Timezone**
   - Todos os timestamps em CURRENT_TIMESTAMP
   - Configure timezone do servidor: `SET GLOBAL time_zone = '-03:00';`

4. **Comentários**
   - Cada coluna sensível tem COMMENT explicativo
   - Facilita manutenção futura

### ⚠️ O Que NÃO é Armazenado

- ❌ Números de cartão completos
- ❌ CVV/CVC
- ❌ Senhas de usuário (apenas hash)
- ❌ Tokens de acesso (apenas IDs do Stripe)

---

## 📈 Performance e Scaling

### Índices Criados

```sql
-- Acesso por usuário
idx_user_id (user_id)
idx_stripe_customer_id (stripe_customer_id)

-- Acesso por status (para relatórios)
idx_status (status)
idx_subscription_plan (subscription_plan)

-- Acesso por data (para queries de período)
idx_created_at (created_at)

-- Acesso por Stripe (para webhooks)
idx_stripe_charge_id (stripe_charge_id)
```

### Plano de Escalabilidade

**Curto prazo (< 10k usuários):**
- Schema atual é suficiente
- Performance em 50ms para queries

**Médio prazo (10k-100k usuários):**
- Adicionar particionamento por data
- Implementar caching (Redis)

**Longo prazo (> 100k usuários):**
- Separar payment_history em shards
- Backup automático incrementativo

---

## 🆘 Troubleshooting

### Erro: "Access denied for user 'root'@'localhost'"

```bash
# Se usar XAMPP/Windows, a senha pode estar vazia
mysql -u root < backend/database.sql

# Ou para XAMPP especificamente
"C:\xampp\mysql\bin\mysql" -u root < backend/database.sql
```

### Erro: "Cannot add or update a child row"

Significa que a FK constraint falhou. Verifique:

```sql
-- Verificar se usuário existe
SELECT * FROM users WHERE id = X;

-- Verificar integridade
CHECK TABLE payment_history;
REPAIR TABLE payment_history;
```

### Erro: "Unknown database 'smartsale'"

Execute primeiro o `database.sql` completo:

```bash
mysql -u root -p < backend/database.sql
```

### Performance lenta?

```sql
-- Analisar tabelas
ANALYZE TABLE payment_history;
ANALYZE TABLE payment_methods;

-- Ver status
SHOW TABLE STATUS FROM smartsale;

-- Otimizar
OPTIMIZE TABLE payment_history;
```

---

## 📝 Próximos Passos

Após criar o banco:

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Testar Conexão**
   - Criar conta em http://localhost:3000
   - Verificar dados em banco

4. **Configurar Stripe**
   - Criar conta em https://stripe.com
   - Copiar chaves para `.env`
   - Testar pagamento

5. **Implementar Webhooks**
   - Criar endpoint `/api/webhooks/stripe`
   - Testar com Stripe CLI

---

## 📚 Referências

- [MySQL 8.0 Docs](https://dev.mysql.com/doc/refman/8.0/en/)
- [Stripe Documentation](https://stripe.com/docs)
- [SQL Performance Tips](https://dev.mysql.com/doc/refman/8.0/en/optimization.html)
- Documentação SmartSale: `/docs/deployment/PAYMENT_SYSTEM.md`

---

**Última Atualização:** 4 de Fevereiro de 2026
**Versão do Schema:** 2026-02-04
