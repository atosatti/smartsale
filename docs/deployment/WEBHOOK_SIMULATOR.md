# 🎯 SOLUÇÃO PRONTA - Teste de Webhooks sem Stripe CLI

Sua máquina não tem acesso à internet para baixar Stripe CLI, mas **criamos uma solução alternativa 100% funcional** usando Node.js puro!

---

## ✅ O Que Você Precisa Fazer

### 1️⃣ Configurar Backend

Abra `backend/.env` e copie a linha com webhook secret (pode ser qualquer valor):

```env
STRIPE_WEBHOOK_SECRET=whsec_test_simulator_local_123
```

Se não tiver a variável, adicione:
```env
# Stripe
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_test_YOUR_WEBHOOK_SECRET
```

### 2️⃣ Iniciar 2 Terminais

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

### 3️⃣ Testar Webhooks (Terminal 3)

```powershell
# Na raiz do projeto
cd C:\Users\AndersonDosSantos\Anderson\Projects\SmartSale

# Listar eventos disponíveis
.\webhook-simulator.ps1 -ListEvents

# Testar pagamento bem-sucedido
.\webhook-simulator.ps1 charge.succeeded

# Testar assinatura criada
.\webhook-simulator.ps1 customer.subscription.created

# Testar cancelamento
.\webhook-simulator.ps1 customer.subscription.deleted
```

---

## 🎮 Teste Completo: Passo a Passo

### Etapa 1: Simulação de Evento
```powershell
.\webhook-simulator.ps1 charge.succeeded
```

**Resultado esperado no Terminal 1 (Backend):**
```
POST /api/webhooks/stripe 200 12ms
Webhook processed: charge.succeeded
```

**Resultado no Terminal 3:**
```
📤 Enviando webhook: charge.succeeded
   Assinatura: t=1707087000,v1=abc123...
✅ Status: 200
   Resposta: Webhook processed successfully
```

### Etapa 2: Verificar Banco de Dados
```sql
-- Consultas úteis
SELECT * FROM webhook_logs ORDER BY created_at DESC LIMIT 5;
SELECT * FROM payment_history ORDER BY created_at DESC LIMIT 5;
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 5;
```

### Etapa 3: Teste Manual via Browser

1. Abrir: http://localhost:3000/plans
2. Clicar em "Premium"
3. Preencher dados:
   - Nome: João Silva
   - Email: joao@test.com
   - Cartão: 4242 4242 4242 4242
   - Exp: 12/26
   - CVV: 123
4. Clicar "Confirmar Pagamento"
5. Esperar resposta do Stripe
6. Webhook é disparado automaticamente
7. Banco é atualizado
8. Verificar resultado:

```sql
SELECT u.email, u.subscription_plan FROM users u WHERE u.email = 'joao@test.com';
-- Resultado: joao@test.com | premium
```

---

## 📊 Fluxo Completo de Teste

```
┌─────────────────────────────────────────────────┐
│ 1. Browser (http://localhost:3000/plans)        │
│    └─ Clica "Premium"                           │
│       └─ Modal Checkout abre                    │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│ 2. StripeCheckout Component (Frontend)          │
│    └─ Preenche form (nome, email, cartão)      │
│       └─ Clica "Confirmar Pagamento"           │
│          └─ Envia para Stripe                   │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│ 3. POST /api/payments/create-payment-intent     │
│    └─ Backend cria PaymentIntent no Stripe     │
│       └─ Retorna clientSecret para frontend     │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│ 4. Frontend confirma pagamento com Stripe       │
│    └─ stripe.confirmCardPayment() executado    │
│       └─ Se sucesso → charge.succeeded         │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│ 5. Webhook Simulador ou Stripe CLI              │
│    └─ Envia evento para:                       │
│       POST /api/webhooks/stripe                │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│ 6. Backend recebe webhook                       │
│    └─ Valida assinatura                        │
│       └─ Processa evento charge.succeeded      │
│          └─ Atualiza tabelas:                  │
│             - payment_history (novo registro)  │
│             - users (subscription_plan)        │
│             - webhook_logs (auditoria)         │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│ 7. Frontend recebe resposta de sucesso          │
│    └─ Fecha modal                              │
│       └─ Mostra toast "Sucesso!"               │
│          └─ Recarrega planos                   │
│             └─ Exibe "Plano Atual" para Premium│
└─────────────────────────────────────────────────┘
```

---

## 🧪 Lista Completa de Eventos para Testar

```powershell
# Pagamentos
.\webhook-simulator.ps1 charge.succeeded           # ✅ Pagamento aprovado
.\webhook-simulator.ps1 charge.failed              # ❌ Pagamento recusado

# Faturas
.\webhook-simulator.ps1 invoice.payment_succeeded  # ✅ Fatura paga
.\webhook-simulator.ps1 invoice.payment_failed     # ❌ Fatura não paga

# Assinaturas
.\webhook-simulator.ps1 customer.subscription.created    # 🆕 Assinatura criada
.\webhook-simulator.ps1 customer.subscription.updated    # 🔄 Assinatura atualizada
.\webhook-simulator.ps1 customer.subscription.deleted    # ❌ Assinatura cancelada
```

---

## 📋 Checklist de Funcionamento

### Checklist Inicial
- [ ] Backend rodando: http://localhost:3001
- [ ] Frontend rodando: http://localhost:3000
- [ ] MySQL rodando
- [ ] `STRIPE_WEBHOOK_SECRET` configurado em `backend/.env`

### Checklist de Teste
- [ ] `.\webhook-simulator.ps1 -ListEvents` mostra eventos
- [ ] `.\webhook-simulator.ps1 charge.succeeded` envia webhook
- [ ] Backend mostra "Webhook processed" no log
- [ ] Banco de dados atualiza (webhook_logs)
- [ ] Modal de checkout abre em http://localhost:3000/plans
- [ ] Formulário de pagamento funciona
- [ ] Cartão de teste 4242 4242 4242 4242 é aceito
- [ ] Toast de sucesso aparece
- [ ] Banco atualiza (subscription_plan, payment_history)

### Troubleshooting
- ❌ "Cannot read properties of undefined"
  → Reinicie backend após atualizar .env

- ❌ "Webhook não está sendo recebido"
  → Backend está rodando? `npm run dev`
  → Webhook secret está correto?

- ❌ "POST /api/webhooks/stripe 401"
  → Verifique `STRIPE_WEBHOOK_SECRET` em .env
  → Reinicie backend

- ❌ "Modal não abre"
  → Abra F12 (DevTools)
  → Veja console.log de erros
  → Verifique token JWT (faça login novamente)

---

## 🎯 Próximas Etapas

1. ✅ Testar webhooks com simulator
2. ✅ Verificar banco de dados
3. ✅ Testar fluxo completo no browser
4. ⏳ Implementar email de confirmação
5. ⏳ Adicionar dashboard de pagamentos
6. ⏳ Configurar renovação automática

---

## 💡 Dicas

- **Webhook Simulator** está em: `webhook-simulator.js`
- **Webhook Simulator (PowerShell)** está em: `webhook-simulator.ps1`
- **Documentação completa** está em: `STRIPE_CLI_SETUP.md`

**Tudo pronto? Você pode testar webhooks completamente localmente! 🎉**

