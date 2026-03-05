# 🚀 Configuração do Stripe CLI para Webhooks Locais

## O Problema
O Stripe precisa de URLs **publicamente acessíveis** para enviar webhooks. Como você está desenvolvendo localmente, a URL `http://localhost:3001/api/webhooks/stripe` não é acessível da internet.

## A Solução: Stripe CLI
O **Stripe CLI** cria um túnel seguro entre os servidores do Stripe e seu computador local.

---

## 📦 Instalação

### Windows (usando Chocolatey)
```powershell
choco install stripe
```

### Windows (Manual)
1. Baixe em: https://github.com/stripe/stripe-cli/releases
2. Extraia o arquivo
3. Adicione ao PATH ou use o caminho completo

### Verificar Instalação
```powershell
stripe --version
stripe login
```

---

## 🔐 Configuração

### Passo 1: Login no Stripe
```powershell
stripe login
```
- Abre navegador para autenticar
- Copia o token para terminal

### Passo 2: Dar Forward aos Webhooks
```powershell
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

**Resultado esperado:**
```
> Ready! Your webhook signing secret is: whsec_test_YWNjdmFsbCBkZXZpY2Ug...
```

### Passo 3: Copiar o Webhook Secret
Adicione ao `backend/.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_test_YWNjdmFsbCBkZXZpY2Ug...
```

---

## 🧪 Testar Webhooks Localmente

### Em um Terminal Novo (enquanto o CLI está rodando)

```powershell
# Triggerar evento de charge bem-sucedido
stripe trigger charge.succeeded

# Triggerar falha de pagamento
stripe trigger charge.failed

# Triggerar criação de assinatura
stripe trigger customer.subscription.created

# Triggerar atualização de assinatura
stripe trigger customer.subscription.updated

# Triggerar cancelamento
stripe trigger customer.subscription.deleted
```

**Ver os eventos no terminal do CLI:**
```
 2026-02-04 10:30:45  event  evt_test_123abc
 -> charge.succeeded
    charge_id: ch_test_xxx
    amount: 2999
    customer: cus_test_xxx
```

---

## 📋 Fluxo Completo de Teste

### Terminal 1: Backend
```powershell
cd backend
npm run dev
```

### Terminal 2: Frontend
```powershell
cd frontend
npm run dev
```

### Terminal 3: Stripe CLI
```powershell
stripe listen --forward-to localhost:3001/api/webhooks/stripe
# Aguardar: "Your webhook signing secret is: whsec_test_..."
# Copiar e adicionar ao backend/.env
```

### Terminal 4: Testes Manuais
```powershell
# Triggerar eventos
stripe trigger charge.succeeded
stripe trigger charge.failed
stripe trigger customer.subscription.created

# Observar logs no Terminal 1 (backend)
# Verificar banco de dados
# Conferir webhook_logs table
```

---

## 🎮 Teste de Ponta a Ponta

1. **Stripe CLI rodando** (Terminal 3)
   ```powershell
   stripe listen --forward-to localhost:3001/api/webhooks/stripe
   ```

2. **Acessar http://localhost:3000/plans**
3. **Clicar em "Premium"**
4. **Preencher checkout:**
   - Nome: Teste
   - Email: teste@example.com
   - Cartão: 4242 4242 4242 4242
   - Expiração: 12/26
   - CVV: 123

5. **Observar:**
   - ✅ Charge criada no Stripe
   - ✅ Webhook enviado (visto no Terminal 3)
   - ✅ Banco de dados atualizado (Terminal 1)
   - ✅ Tabelas atualizadas:
     - `users.subscription_plan = premium`
     - `payment_history` com novo registro
     - `webhooks_logs` com eventos

---

## 🔧 Comandos Úteis do Stripe CLI

```powershell
# Login/Logout
stripe login
stripe logout

# Ver eventos em tempo real
stripe logs tail

# Ouvir eventos específicos
stripe listen --events charge.succeeded,charge.failed

# Triggerar eventos customizados
stripe trigger charge.succeeded \
  --override amount=5000 \
  --override currency=brl

# Ver status
stripe status

# Listar eventos recentes
stripe events list
```

---

## ⚠️ Troubleshooting

### "webhook signing secret is invalid"
**Causa:** Secret no `.env` não corresponde ao do CLI
**Solução:** Copie novamente o secret exato do CLI ao reiniciar

### "Webhook não está sendo recebido"
**Verificar:**
1. Terminal 3 está rodando com `stripe listen`?
2. Backend está rodando (`npm run dev`)?
3. `.env` tem o webhook secret correto?
4. Verificar logs do backend: `console.log` no webhookRoutes.ts

### "Erro ao iniciar Stripe CLI"
**Solução:**
```powershell
# Reinstalar
pip uninstall stripe
pip install stripe

# Ou atualizar
stripe update
```

---

## 📊 Monitorar Webhooks

### Ver em Tempo Real
Terminal com Stripe CLI ativo mostra cada webhook:
```
2026-02-04 10:35:22  charge.succeeded  ch_test_xxx
2026-02-04 10:35:23  invoice.payment_succeeded  in_test_xxx
2026-02-04 10:35:24  customer.subscription.created  sub_test_xxx
```

### Consultar Banco de Dados
```sql
SELECT * FROM webhook_logs ORDER BY created_at DESC LIMIT 5;
SELECT * FROM payment_history ORDER BY created_at DESC LIMIT 5;
SELECT user_id, subscription_plan FROM users WHERE email LIKE '%test%';
```

---

## 🎉 Próximas Etapas

1. ✅ Backend e Frontend rodando
2. ✅ Stripe CLI escutando webhooks
3. ⏳ Testar fluxo completo de pagamento
4. ⏳ Verificar banco de dados após cada pagamento
5. ⏳ Implementar notificações por email (optional)

**Agora está tudo pronto para testar webhooks localmente sem expor sua máquina!** 🔒

