# Migrations SQL - SmartSale

Todos os scripts SQL de migração e seed do banco de dados.

## Ordem de Execução

Execute os arquivos na seguinte ordem:

### 1. **Criação Inicial do Banco**
```bash
mysql -u root -p < database.sql
```
Cria todas as tabelas principais: users, products, search_logs, subscriptions, etc.

### 2. **Tabelas de Pagamento**
```bash
mysql -u root -p smartsale < create-payment-tables.sql
```
Cria as tabelas: payment_methods, payment_history, invoices, webhook_logs

### 3. **Colunas Adicionais de Pagamento** (se necessário)
```bash
mysql -u root -p smartsale < add-payment-columns.sql
```
Adiciona colunas extras para suportar novos recursos de pagamento.

### 4. **Dados de Coluna de Fatura** (Novas)
```bash
mysql -u root -p smartsale < add-invoice-data-column.sql
```
Adiciona coluna `invoice_data` (JSON) para armazenar dados de CPF/CNPJ.

### 5. **Dados de Teste**
```bash
mysql -u root -p smartsale < insert-test-data.sql
```
Insere usuários de teste para desenvolvimento.

### 6. **Planos de Assinatura**
```bash
mysql -u root -p smartsale < insert-plans.sql
```
Insere os planos disponíveis (Free, Premium, Enterprise).

### 7. **Dados Iniciais** (Seed)
```bash
mysql -u root -p smartsale < database-seed.sql
```
Dados adicionais para inicializar a aplicação.

### 8. **Migrações Gerais** (se aplicável)
```bash
mysql -u root -p smartsale < migrations.sql
```
Outras migrações necessárias.

---

## Para Novo Desenvolvedor

Se você é um novo desenvolvedor e precisa apenas configurar o banco:

```bash
# Execute o script principal que faz tudo
mysql -u root -p < database.sql

# Depois execute os scripts de pagamento e dados
mysql -u root -p smartsale < create-payment-tables.sql
mysql -u root -p smartsale < add-payment-columns.sql
mysql -u root -p smartsale < add-invoice-data-column.sql
mysql -u root -p smartsale < insert-plans.sql
```

---

## Descrição dos Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `database.sql` | Schema principal do banco de dados |
| `create-payment-tables.sql` | Tabelas para sistema de pagamentos |
| `add-payment-columns.sql` | Colunas adicionais de pagamento |
| `add-invoice-data-column.sql` | Suporte a dados de fatura (CPF/CNPJ) |
| `insert-test-data.sql` | Usuários de teste |
| `insert-plans.sql` | Planos de assinatura |
| `database-seed.sql` | Dados iniciais da aplicação |
| `migrations.sql` | Migrações gerais |

---

## Importante

- ⚠️ Sempre fazer backup antes de executar migrações em produção
- 🔐 Não commitar dados sensíveis no banco
- 📝 Documentar novas migrações neste README
- ✅ Testar migrações em desenvolvimento antes de produção
