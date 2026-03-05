# 🗄️ Backend - Banco de Dados SmartSale

## ✅ Status: Banco Inicializado

O banco de dados MySQL foi criado e populado com sucesso!

---

## 📊 O que foi criado

### 14 Tabelas
- `users` - Usuários com suporte a pagamentos
- `payment_methods` - Cartões e métodos salvos
- `payment_history` - Histórico de transações
- `invoices` - Faturas e recibos
- `webhook_logs` - Log de webhooks
- `subscriptions` - Assinaturas ativas
- `plans` - Configuração de planos
- `plan_features` - Features por plano
- `revenue_summary` - Analytics de receita
- `migrations` - Histórico de migrações
- `products`, `product_prices`, `search_logs`, `favorites` - Tabelas existentes

### 7 Usuários de Teste
```
free.user@smartsale.com (Plano Free)
basic.user@smartsale.com (Plano Basic - Cartão: 4242)
premium.user@smartsale.com (Plano Premium - Cartão: 5555)
```

### 4 Planos
- **Free** - R$ 0/mês (5 buscas/dia)
- **Basic** - R$ 9.99/mês (50 buscas/dia)
- **Premium** - R$ 29.99/mês (500 buscas/dia) ⭐ Popular
- **Enterprise** - R$ 99.99/mês (Ilimitado)

---

## 🚀 Como Executar o Backend

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
# Verificar .env
cat .env

# Já configuradas:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=Nicholas@022025
# DB_NAME=smartsale
```

### 3. Instalar Stripe
```bash
npm install stripe
```

### 4. Iniciar Servidor
```bash
npm run dev
```

Acesse: `http://localhost:3001`

---

## 📁 Scripts SQL

Todos os scripts estão em `backend/`:

### `database.sql` (Backup)
Script original de criação do banco. Já foi executado.

### `add-payment-columns.sql`
Adiciona colunas de pagamento ao `users`. Já foi executado.

### `create-payment-tables.sql`
Cria todas as 9 tabelas de pagamento. Já foi executado.

### `insert-test-data.sql`
Insere usuários de teste, métodos de pagamento, assinaturas. Já foi executado.

### `setup-database.ps1`
Script PowerShell para recriar tudo de uma vez (Windows).

---

## 🔧 Variáveis de Ambiente Necessárias

Adicione ao `.env`:

```env
# Database (já configurado)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Nicholas@022025
DB_NAME=smartsale

# Stripe (configure com suas chaves)
STRIPE_SECRET_KEY=sk_test_seu_codigo_aqui
STRIPE_PUBLISHABLE_KEY=pk_test_seu_codigo_aqui
STRIPE_WEBHOOK_SECRET=whsec_seu_codigo_aqui

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001

# JWT (já configurado)
JWT_SECRET=smartsale_jwt_secret_key_2024_secure
SESSION_SECRET=smartsale_session_secret_key_2024
```

---

## 💰 Teste de Cartão (Stripe)

```
Número: 4242 4242 4242 4242
Expiração: 12/26
CVV: 123
Nome: Test User

✅ Débito bem-sucedido (test_chargeDeclined)
❌ Débito falhado (test_cardDeclined)
```

Veja mais em: https://stripe.com/docs/testing

---

## 📊 Verificar Dados no Banco

```bash
# Conectar ao MySQL
mysql -u root -p

# Usar banco
USE smartsale;

# Ver usuários
SELECT email, subscription_plan FROM users;

# Ver planos
SELECT name, monthly_price FROM plans;

# Ver histórico de pagamentos
SELECT * FROM payment_history ORDER BY created_at DESC;

# Ver assinaturas ativas
SELECT u.email, s.plan FROM subscriptions s 
JOIN users u ON s.user_id = u.id 
WHERE s.status = 'active';
```

---

## 🔐 Segurança

### ✅ Implementado
- Índices em Foreign Keys
- Unique constraints para IDs Stripe
- Colunas de "soft delete"
- Comentários em colunas sensíveis

### ❌ Não Armazenado
- Números de cartão completos (apenas últimos 4)
- CVV/CVC
- Senhas em texto plano

---

## 📚 Documentação

| Arquivo | Descrição |
|---------|-----------|
| `../docs/deployment/DATABASE_SCHEMA.md` | Schema completo com exemplos |
| `../docs/deployment/PAYMENT_SYSTEM.md` | Arquitetura de pagamentos |
| `../docs/deployment/DATABASE_SETUP.md` | Guia de inicialização |
| `../BANCO_INICIALIZADO.md` | Status e resumo |

---

## 🧪 Testes Básicos

### 1. Conectar ao Banco
```bash
mysql -u root -p smartsale -e "SELECT 1;"
```

### 2. Verificar Tabelas
```bash
mysql -u root -p smartsale -e "SHOW TABLES;"
```

### 3. Contar Registros
```bash
mysql -u root -p smartsale -e "SELECT COUNT(*) FROM users;"
```

---

## 🚨 Troubleshooting

### Erro: "Access denied"
```bash
# Verifique a senha em .env
grep DB_PASSWORD .env

# Tente conectar diretamente
mysql -u root -p
# Digite a senha: Nicholas@022025
```

### Erro: "Unknown database"
```bash
# Execute database.sql novamente
mysql -u root -p < database.sql
```

### Port já em uso
```bash
# Mude em .env
DB_PORT=3307  # ou outra porta

# Ou mate o processo
lsof -i :3306  # Ver processo
kill -9 <PID>  # Matar processo
```

---

## 🎯 Próximas Etapas

1. ✅ **Banco de dados** - CONCLUÍDO
2. ⏳ **Backend** - Instalar e configurar
3. ⏳ **Frontend** - Instalar e configurar
4. ⏳ **Stripe** - Chaves configuradas
5. ⏳ **Webhooks** - Implementar endpoint
6. ⏳ **Checkout** - UI de pagamento
7. ⏳ **Testes** - E2E com Stripe

---

## 📞 Suporte

### Documentação
- [MySQL Docs](https://dev.mysql.com/doc/)
- [Stripe Docs](https://stripe.com/docs)
- [Node.js Docs](https://nodejs.org/docs/)

### Arquivos de Referência
- Schema: `/docs/deployment/DATABASE_SCHEMA.md`
- Pagamentos: `/docs/deployment/PAYMENT_SYSTEM.md`
- Setup: `/docs/deployment/DATABASE_SETUP.md`

---

**Banco de dados:** ✅ Pronto  
**Dados de teste:** ✅ Populados  
**Documentação:** ✅ Completa  

Comece a desenvolvimento! 🚀
