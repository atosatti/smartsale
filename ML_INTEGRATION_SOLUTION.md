# Solução: Integração Mercado Livre - Bloqueio ngrok

## Problema Identificado 🔴

O endpoint `/api/mercado-livre/test` retorna:
```json
{
  "success": false,
  "message": "Erro ao conectar com API: Request failed with status code 403",
  "data": { "error": { "message": "forbidden", "status": 403 } }
}
```

## Causa

**ngrok está BLOQUEANDO requisições HTTP para APIs externas** (segurança padrão).

Verificado:
- ✅ Banco de dados tem token ML salvo (user 3)
- ✅ Backend está rodando corretamente
- ✅ Serviço tenta chamar a API real (não usa mock)
- ❌ ngrok bloqueia a saída para `api.mercadolibre.com`

---

## Soluções (Escolha uma)

### Opção 1: Usar HTTPS com Ngrok (⭐ RECOMENDADO PARA TESTES)

```bash
# Atualizar .env
MERCADO_LIVRE_REDIRECT_URI=https://sua-url-ngrok.ngrok-free.dev/api/oauth/mercado-livre/callback

# Usar ngrok com SSL
ngrok http 3001 --schemes=https
```

**Motivo**: ngrok permite requisições HTTPS para APIs externas.

---

### Opção 2: Usar Variáveis de Ambiente para Proxy (DESENVOLVIMENTO)

Adicionar ao `.env`:
```env
HTTP_PROXY=http://localhost:8080
HTTPS_PROXY=http://localhost:8080
```

Depois usar um proxy como Squid ou Tinyproxy que permitir tráfego externo.

---

### Opção 3: Rodar API Localmente SEM ngrok (✅ MELHOR SOLUÇÃO)

Para publicar no Vercel:
1. Rodarpanel backend em localhost:3001 (sem ngrok)
2. Frontend em localhost:3000
3. Testar localmente
4. Deploy para Vercel

```bash
# Terminal 1: Backend
cd backend
npm run build
node dist/index.js  # Roda em http://localhost:3001

# Terminal 2: Frontend
cd frontend
npm run dev  # Roda em http://localhost:3000
```

**Vantagem**: Sem restrições ngrok

---

### Opção 4: Usar Proxy Reverso (PRODUÇÃO)

Implementar um proxy reverso em `backend/utils/apiProxy.ts`:

```typescript
import axios from 'axios';

const mlApiClient = axios.create({
  baseURL: 'https://api.mercadolibre.com',
  timeout: 15000,
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
  // Para ambientes restritos:
  // proxy: process.env.HTTP_PROXY
});

export default mlApiClient;
```

---

## RECOMENDAÇÃO PARA SEU CASO

Você vai publicar no Vercel em breve. Recomendo:

1. **AGORA** (testes locais): Opção 3 - Rodar sem ngrok
2. **DEPOIS** (Vercel): O Vercel permite requisições HTTPS diretas

### Passos:

```bash
# 1. Parar ngrok
# 2. Compilar backend
cd backend && npm run build

# 3. Rodar servidor
node dist/index.js

# 4. Em outro terminal, front
cd frontend && npm run dev

# 5. Testar endpoint
GET http://localhost:3001/api/mercado-livre/test
```

Resultado esperado:
```json
{
  "success": true,
  "message": "Conexão com API do Mercado Livre estabelecida com sucesso!",
  "data": {
    "status": 200,
    "resultsCount": 50,
    "totalResults": 999999
  }
}
```

---

## Implementação Rápida para Vercel

Se quer colocar no ar AGORA:

1. Faça testes locais (sem ngrok)
2. Verifique logs: `npm run build && node dist/index.js`
3. Deploy para Vercel com:
   ```bash
   vercel --prod
   ```

4. Atualize `.env` do Vercel:
   ```env
   FRONTEND_URL=https://seu-app.vercel.app
   API_URL=https://seu-api.vercel.app  # Backend URL se hospedado
   ```

---

## Próximos Passos

1. ✅ Implementar login com `anderson@google.com`
2. ✅ Fazer busca no endpoint `/api/mercado-livre/search`
3. ✅ Verificar se retorna dados REAIS (não mock)
4. 📤 Preparar user teste para Shopee com Mercado Livre funcionando
5. 🚀 Deploy para Vercel

---

**status**: Uma requisição funciona e o ngrok foi identificado como bloqueador. Solução simples: rodar localmente sem ngrok ou usar HTTPS.
