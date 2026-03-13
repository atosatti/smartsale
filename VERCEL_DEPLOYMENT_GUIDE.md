# SmartSale - Deploy Vercel & Teste Mercado Livre

## Status: ✅ PRONTO PARA DEPLOY

### Mudanças Implementadas

1. **Auto-refresh de Token ML** ✅
   - Método `refreshTokenIfNeeded()` verifica expiração
   - Renova automaticamente se expirar em < 5 min
   - Usa `refresh_token` armazenado
   - Salva novo token + novo expires_at

2. **Integração Automática** ✅
   - `searchProducts()` chama auto-refresh antes de buscar
   - Se token renovado: usa novo token
   - Se renovação falha: usa token antigo (pode funcionar ainda)
   - Logs detalhados de cada passo

3. **Endpoint de Teste** ✅
   - `GET /api/mercado-livre/test` - Testa conexão com API
   - `GET /api/mercado-livre/debug/search` - Debug detalhado com autenticação
   - `POST /api/mercado-livre/refresh-token` - Renovação manual

---

## Deploy Vercel (Passo-a-Passo)

### Pré-requisitos
- ✅ Código no GitHub
- ✅ `.env` com todas as variáveis
- ✅ Backend compilado localmente (testado)

### Passos

#### 1. Push para GitHub com mudanças
```bash
cd /path/to/SmartSale
git add .
git commit -m "feat: Implementar auto-refresh Mercado Livre"
git push origin main  # ou dev/staging
```

#### 2. Deploy Vercel

**Opção A: Via CLI (Recomendado)**
```bash
npm install -g vercel
vercel login  # Autenticar com sua conta Vercel
vercel --prod
```

**Opção B: Via Vercel Dashboard**
1. Ir para https://vercel.com
2. New Project → Selecionar repo GitHub
3. Framework: Next.js (auto-detecta)
4. Build Command: `npm run build`
5. Start Command: `npm start`
6. Environment Variables → Adicionar .env

#### 3. Configurar Variáveis de Ambiente no Vercel

```env
# Backend & Frontend
FRONTEND_URL=https://seu-app.vercel.app
API_URL=https://seu-backend.vercel.app  # Se hospedado separado
NODE_ENV=production

# Mercado Livre
MERCADO_LIVRE_APP_ID=4900804968573884
MERCADO_LIVRE_SECRET_KEY=SRJPUjvZ5TL2FR0defvPJqZNPt9CLuw9
MERCADO_LIVRE_REDIRECT_URI=https://seu-app.vercel.app/api/oauth/mercado-livre/callback

# Database
DB_HOST=seu-host.mysql.database.azure.com  # ou seu provedor
DB_USER=admin
DB_PASSWORD=***
DB_NAME=smartsale
DB_PORT=3306

# Outros (copiar do .env local)
JWT_SECRET=***
SESSION_SECRET=***
STRIPE_SECRET_KEY=***
# ...
```

#### 4. Testar no Vercel

```bash
# Após deploy bem-sucedido
curl https://seu-app.vercel.app/api/mercado-livre/test

# Response esperado:
# { "success": true, "message": "Conexão...", "data": {...} }
```

---

## Opcional: Backend em Vercel também

Se quiser backend + frontend no Vercel:

```bash
# 1. Criar `vercel.json` na raiz:
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/out",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ]
}

# 2. Ou usar Vercel CLI com múltiplos serviços
vercel --prod --scope=seu-usuario
```

---

## Teste Pós-Deploy

### 1. Acesso ao Frontend
```
https://seu-app.vercel.app
```

### 2. Login com usuário de teste
```
Email: anderson@google.com
Senha: (sua senha)
```

### 3. Ir para Integrações > Mercado Livre

### 4. Se token expirado, reautenticar
- Clique em "Conectar"
- Selecione conta de teste
- Autorizar → Novo token salvo em Vercel DB

### 5. Fazer busca
```bash
POST https://seu-app.vercel.app/api/mercado-livre/search
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "query": "notebook",
  "limit": 10
}
```

**Resultado esperado**: Lista de produtos REAIS do Mercado Livre (não mock)

### 6. Verificar logs
```bash
vercel logs  # Ver logs de execução
```

---

## Auto-Refresh Em Ação

Quando fazer busca com token expirado:

```
[ML Service] Verificando expiração de token para user 3...
[ML Service] Token expira em: 2026-02-06T15:48:24.000Z
[ML Service] Tempo até expiração: -86400s  ← EXPIRADO!
[ML Service] ⚠️ Token expirando, iniciando renovação...
[ML Service] Chamando OAuth endpoint...
[ML Service] ✅ Token renovado! Novo expires_at: 2026-03-13T19:00:00Z
[ML Search] ✓ Buscando com token renovado...
```

---

## Monitoramento Contínuo

O auto-refresh roda **automaticamente** para:
- POST `/api/mercado-livre/search`
- GET `/api/mercado-livre/product/:id`
- POST `/api/mercado-livre/compare`

Sem intervenção do usuário! ✅

---

## Próximos Passos para Shopee

1. ✅ Implementar auto-refresh (FEITO)
2. ✅ Deploy no Vercel (ESTE DOCUMENTO)
3. 📝 Preparar print da busca funcionando (para Shopee)
4. 📤 Enviar Shopee:
   - URL: `https://seu-app.vercel.app`
   - User teste com Mercado Livre funcionando
   - Print de busca retornando dados REAIS

---

## Troubleshooting

### ❌ "401 Unauthorized - invalid access token"
- Token expirou
- **Solução**: Reautenticar via OAuth

### ❌ "500 - Refresh token error"
- Refresh token não foi salvo ao fazer login
- **Solução**: Reautenticar novamente com OAuth

### ❌ "403 Forbidden"
- Rate limit da ML excedido
- **Solução**: Aguardar 1 hora

### ❌ "Database connection error"
- Variáveis de banco incorretas em Vercel
- **Solução**: Verificar `DB_HOST`, `DB_USER`, `DB_PASSWORD`

---

**Status**: Auto-refresh implementado e testado. Pronto para Vercel! 🚀
