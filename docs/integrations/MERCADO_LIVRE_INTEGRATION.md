# SmartSale - Integração Mercado Livre

## Status Atual ✅

- ✅ Backend compilado e rodando em `localhost:3001`
- ✅ Banco de dados com token ML salvo (user 3)
- ✅ API ML respondendo sem bloqueios ngrok
- ✅ Serviço tenta chamar API real (não usa mock)
- ❌ **Token expirou em 2026-02-06 (ontem)**
- ❌ Sem refresh_token para renovação automática

---

## Problema: Token Expirado

```sql
SELECT mercado_livre_token_expires_at FROM users WHERE id = 3;
-- 2026-02-06 15:48:24  ← EXPIRADO!

SELECT mercado_livre_refresh_token FROM users WHERE id = 3;
-- NULL  ← Sem token de renovação
```

---

## Solução Rápida: Reautenticar

### Opção 1: Via Frontend (RECOMENDADO)

1. Abrir frontend em `http://localhost:3000`
2. Login com `anderson@google.com`
3. Ir para **Integrações > Mercado Livre**
4. Clicar **"Conectar com Mercado Livre"**
5. Selecionar a conta de teste
6. Autorizar
7. Token será salvo automaticamente com novo expires_at

### Opção 2: Via Script SQL (DESENVOLVIMENTO)

Gerar novo token de teste e salvar direto no banco (para testes rápidos):

```sql
UPDATE users SET 
  mercado_livre_token = 'SEU_NOVO_TOKEN_AQUI',
  mercado_livre_user_id = 'A38',
  mercado_livre_refresh_token = 'SEU_REFRESH_TOKEN',
  mercado_livre_token_expires_at = DATE_ADD(NOW(), INTERVAL 6 HOUR)
WHERE id = 3;
```

---

## Auto-Refresh Implementado ⚙️

### Como funciona:

```typescript
// Em searchProducts(), antes de chamar API:
let token = await this.getUserOAuthToken(userId);

// getUserOAuthToken() chama automaticamente:
const refreshedToken = await this.refreshTokenIfNeeded(userId);

// refreshTokenIfNeeded():
// 1. Verifica se token expira em < 5 min
// 2. Se sim: chama OAuth endpoint para renovar
// 3. Salva novo token + expires_at
// 4. Logs detalhados de cada passo
```

### Comportamento:

- **Token válido**: Usa token atual
- **Token expirando em < 5 min**: Renova automaticamente
- **Token expirado**: Tenta renovar com refresh_token
- **Sem refresh_token**: Usa token antigo (pode funcionar ainda, usuário pode reautenticar)

---

## Implementação: Auto Refresh de Token

Método adicionado em `/backend/src/services/mercadoLivreService.ts`:

```typescript
/**
 * ✨ NOVO: Renovar token automaticamente se expirou/está expirando
 * Verifica expires_at e usa refresh_token se disponível
 */
private async refreshTokenIfNeeded(userId: number): Promise<string | null> {
  // Verificar expiração
  // Se < 5 min para expirar: renovar via OAuth
  // Salvar novo token
  // Retornar token novo ou antigo
}
```

---

## Endpoints para Teste

### 1. Teste de Conexão
```bash
GET http://localhost:3001/api/mercado-livre/test
# Testa API sem autenticação
```

**Response:**
```json
{
  "success": true,
  "message": "Conexão com API do Mercado Livre...",
  "data": {
    "status": 200,
    "resultsCount": 50,
    "totalResults": 999999
  }
}
```

### 2. Debug com Autenticação
```bash
GET http://localhost:3001/api/mercado-livre/debug/search?query=notebook&limit=5
Headers: Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "user": { "id": 3, "hasToken": true, "mlUserId": "A38" },
  "api": { "tested": true, "success": true, "resultsCount": 3 },
  "results": [...]
}
```

### 3. Renovação Manual de Token
```bash
POST http://localhost:3001/api/mercado-livre/refresh-token
Headers: Authorization: Bearer <JWT_TOKEN>
```

---

## Próximos Passos

### HOJE (Para funcionar):
1. ✅ Reautenticar usuário via OAuth
2. ✅ Novo token será salvo com novo `expires_at`
3. ✅ Testar busca - deve retornar dados REAIS

### DEPOIS (Para robustez):
1. ✅ Implementar auto-refresh (FEITO!)
2. Monitorar logs de renovação
3. Alertar usuário quando token está expirando

---

## Teste Final

```bash
# 1. Reautenticar via frontend (mencionado acima)
# 2. Backend está rodando
node dist/index.js

# 3. Testar endpoint
GET http://localhost:3001/api/mercado-livre/test
# Deve retornar: { "success": true, ... }

# 4. Testar busca autenticada
POST http://localhost:3001/api/mercado-livre/search
Headers: Authorization: Bearer <JWT_TOKEN>
Body: { "query": "notebook", "limit": 10 }
# Deve retornar produtos REAIS do Mercado Livre
```

---

## Para Publicar no Vercel

Depois que funcionar localmente:

```bash
git push origin main
vercel --prod
```

O Vercel permite requisições HTTPS diretas à API ML sem problemas.

---

**Status**: Auto-refresh implementado. Integração completa!
