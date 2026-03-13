# SmartSale - Solução Integração Mercado Livre

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

## Implementação: Auto Refresh de Token

Para evitar essa situação, vou implementar renovação automática:

### Adicionar em `/backend/src/services/mercadoLivreService.ts`:

```typescript
private async refreshTokenIfNeeded(userId: number): Promise<string | null> {
  // Obter token e data de expiração
  const [rows]: any = await db.query(
    'SELECT mercado_livre_token, mercado_livre_expires_at, mercado_livre_refresh_token FROM users WHERE id = ?',
    [userId]
  );

  const user = rows?.[0];
  if (!user || !user.mercado_livre_token) return null;

  // Verificar se expirou (renovar 5 min antes)
  const expiresAt = new Date(user.mercado_livre_expires_at);
  const now = new Date();
  const timeToExpire = expiresAt.getTime() - now.getTime();

  // Se vencer em menos de 5 min, renovar
  if (timeToExpire < 300000) {
    console.log(`[ML Service] Token expirado/expirando, usando refresh_token...`);
    
    if (!user.mercado_livre_refresh_token) {
      console.error('[ML Service] Refresh token não disponível!');
      return null;
    }

    try {
      const response = await axios.post('https://api.mercadolibre.com/oauth/token', {
        grant_type: 'refresh_token',
        client_id: this.appId,
        client_secret: this.secretKey,
        refresh_token: user.mercado_livre_refresh_token,
      });

      const newToken = response.data.access_token;
      const newRefreshToken = response.data.refresh_token;
      const expiresIn = response.data.expires_in;

      // Salvar novo token
      const expiresAt2 = new Date(Date.now() + expiresIn * 1000);
      await db.query(
        'UPDATE users SET mercado_livre_token = ?, mercado_livre_refresh_token = ?, mercado_livre_token_expires_at = ? WHERE id = ?',
        [newToken, newRefreshToken, expiresAt2, userId]
      );

      console.log('[ML Service] Token renovado com sucesso');
      return newToken;
    } catch (error) {
      console.error('[ML Service] Erro ao renovar token:', error.message);
      return null;
    }
  }

  return user.mercado_livre_token;
}
```

---

## Próximos Passos

### HOJE (Para funcionar):
1. ✅ Reautenticar usuário via OAuth
2. ✅ Novo token será salvo com novo `expires_at`
3. ✅ Testar busca - deve retornar dados REAIS

### DEPOIS (Para robustez):
1. Implementar auto-refresh em `mercadoLivreService.ts`
2. Adicionar endpoint para gerenciar conexões
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
vercel --prod
```

O Vercel permite requisições HTTPS diretas à API ML sem problemas.

---

**Status**: Problema identificado (token expirado). Solução: Fazer reautenticação OAuth. Depois disso, tudo funciona!
