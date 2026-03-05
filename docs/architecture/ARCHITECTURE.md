# Arquitetura SmartSale

## Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      Cliente (Browser)                      │
│                   Next.js Frontend (port 3000)              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Pages: Home, Login, Register, Dashboard, Plans, 2FA │   │
│  │ Components: Navbar, SearchBox, ResultsList           │   │
│  │ Store: AuthStore, SearchStore (Zustand)             │   │
│  │ Styling: Tailwind CSS                                │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────┬────────────────────────────────────┘
                        │ HTTP/HTTPS
                        │ Axios + Interceptors
                        │
┌───────────────────────▼────────────────────────────────────┐
│                    Backend API Server                       │
│               Express + Node.js (port 3001)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Routes:                                              │  │
│  │  - /api/auth      → Auth Controller                  │  │
│  │  - /api/products  → Product Controller               │  │
│  │  - /api/subscriptions → Subscription Controller      │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ Middleware:                                          │  │
│  │  - authMiddleware → Valida JWT                       │  │
│  │  - errorHandler   → Trata erros                      │  │
│  │  - CORS           → Segurança                        │  │
│  │  - Helmet         → Headers segurança                │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ Services:                                            │  │
│  │  - Authentication Service                           │  │
│  │  - Product Search Service                           │  │
│  │  - Subscription Service                             │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ Utils:                                               │  │
│  │  - JWT          → Token management                   │  │
│  │  - Password     → Bcrypt hashing                     │  │
│  │  - 2FA          → TOTP/QR Code                       │  │
│  │  - Email        → Nodemailer                         │  │
│  └──────────────────────────────────────────────────────┘  │
└──────┬──────────────────┬──────────────────┬────────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
    MySQL DB         OAuth Providers   E-commerce APIs
    ┌─────────┐      ┌──────────┐      ┌───────────────┐
    │ Users   │      │ Google   │      │ Mercado Livre │
    │ Products│      │ Facebook │      │ Amazon        │
    │ Prices  │      └──────────┘      │ Shopee        │
    │ Logs    │                        └───────────────┘
    │ Subs.   │      
    └─────────┘      
```

## Fluxos Principais

### 1. Fluxo de Registro e Login

```
┌─────────────────────┐
│   Usuário acessa    │
│  page /register     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Preenche formulário de registro│
│  (email, senha, nome, sobrenome)│
└──────────┬──────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  POST /api/auth/register         │
│  Valida entrada                  │
│  Hash password com bcrypt        │
│  Salva em DB                     │
│  Envia email de verificação      │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  Usuário clica link de verificação│
│  Email é confirmado              │
│  Pode fazer login                │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  Usuário faz login               │
│  POST /api/auth/login            │
│  Verifica credenciais            │
└──────────┬───────────────────────┘
           │
        ┌──┴──────────────────┐
        │                     │
        ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│  2FA Desativado  │  │  2FA Ativado     │
│  Retorna JWT     │  │  Retorna tempToken│
│  Redirecion a    │  │  Redireciona para│
│  Dashboard       │  │  verify-2fa      │
└──────────────────┘  └────────┬─────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │ Usuário insere   │
                       │ código 2FA do    │
                       │ autenticador     │
                       └────────┬─────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │ POST verify-2fa  │
                       │ Valida TOTP      │
                       │ Retorna JWT      │
                       │ Redirecion a     │
                       │ Dashboard        │
                       └──────────────────┘
```

### 2. Fluxo de Pesquisa de Produtos

```
┌──────────────────┐
│ Usuário digita   │
│ produto na busca │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│ SearchBox Component           │
│ Valida input                  │
│ Chama API                     │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ GET /api/products/search     │
│ ?query=notebook              │
│                              │
│ Middleware:                  │
│ - Valida JWT                 │
│ - Valida plano do usuário    │
│ - Registra busca em DB       │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ fetchFromMultiplePlatforms:  │
│                              │
│ - Mercado Livre API          │
│   (público, implementado)     │
│ - Amazon API                 │
│   (requer chave)             │
│ - Shopee API                 │
│   (requer chave)             │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Processa e agrega resultados │
│ Ordena por preço             │
│ Adiciona metadados           │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Retorna JSON com:            │
│ - query                      │
│ - results[]                  │
│ - totalResults               │
│ - plan                       │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Frontend: SearchStore        │
│ Armazena resultados          │
│ ResultsList renderiza cards  │
└──────────────────────────────┘
```

### 3. Fluxo de Assinatura

```
┌──────────────────────┐
│ Usuário vai para     │
│ página de Planos     │
└─────────┬────────────┘
          │
          ▼
┌───────────────────────────┐
│ GET /api/subscriptions/  │
│       plans               │
│ Carrega lista de planos  │
└─────────┬─────────────────┘
          │
          ▼
┌───────────────────────────┐
│ Usuário seleciona plano   │
│ (Basic, Premium, etc.)    │
└─────────┬─────────────────┘
          │
          ▼
┌───────────────────────────┐
│ Redireciona para Stripe   │
│ Checkout                  │
└─────────┬─────────────────┘
          │
          ▼
┌───────────────────────────┐
│ Usuário completa          │
│ pagamento no Stripe       │
└─────────┬─────────────────┘
          │
          ▼
┌───────────────────────────┐
│ POST /api/subscriptions/  │
│       create              │
│ Processa pagamento        │
│ Atualiza plan no DB       │
│ Envia email confirmação   │
└─────────┬─────────────────┘
          │
          ▼
┌───────────────────────────┐
│ Usuário tem acesso aos    │
│ recursos do plano         │
└───────────────────────────┘
```

## Estrutura de Dados

### User
```typescript
{
  id: number;
  email: string;
  password: string (hashed);
  first_name: string;
  last_name: string;
  phone?: string;
  google_id?: string;
  facebook_id?: string;
  two_fa_enabled: boolean;
  two_fa_secret?: string;
  subscription_plan: 'free' | 'basic' | 'premium' | 'enterprise';
  is_verified: boolean;
  stripe_customer_id?: string;
  created_at: timestamp;
  updated_at: timestamp;
}
```

### Product
```typescript
{
  id: number;
  name: string;
  description: string;
  user_id: number;
  created_at: timestamp;
  updated_at: timestamp;
}
```

### Product Price
```typescript
{
  id: number;
  product_id: number;
  platform: string; // 'amazon', 'mercado_livre', 'shopee'
  price: decimal;
  currency: string; // 'BRL', 'USD', etc
  url: string;
  in_stock: boolean;
  rating: decimal;
  reviews_count: number;
  last_updated: timestamp;
}
```

## Tecnologias Utilizadas

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Linguagem**: TypeScript
- **Database**: MySQL
- **Autenticação**: JWT + 2FA (TOTP)
- **Segurança**: Helmet, CORS, Bcrypt
- **Email**: Nodemailer
- **Pagamentos**: Stripe
- **Validação**: Validator.js

### Frontend
- **Framework**: Next.js 14
- **Linguagem**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **HTTP Client**: Axios
- **UI Feedback**: React Hot Toast
- **Auth**: JWT (localStorage)

### Integração
- **APIs Públicas**: Mercado Livre
- **OAuth**: Google, Facebook
- **Pagamento**: Stripe
- **Email**: Gmail (Nodemailer)

## Segurança

### Implementado
✅ Validação de entrada de dados
✅ Hashing de senhas com bcrypt
✅ JWT para autenticação
✅ 2FA com TOTP
✅ CORS configurado
✅ Helmet para headers HTTP
✅ Rate limiting (futuro)
✅ HTTPS (produção)

### Planned
🔲 Rate limiting
🔲 IP whitelist
🔲 WAF (Web Application Firewall)
🔲 Logs de auditoria
🔲 Criptografia de dados sensíveis

## Performance

### Otimizações Implementadas
- Conexão pooling no MySQL
- Interceptadores de erro globais
- Validação no middleware
- Cache de QR Code no frontend

### Otimizações Futuras
🔲 Redis para caching
🔲 CDN para assets
🔲 Database indexing
🔲 API response compression
🔲 Query optimization

## Escalabilidade

### Arquitetura Preparada Para
- Multi-instância com load balancer
- Separação de backend e frontend
- Microserviços ready (arquitetura modular)
- Database replication
- Queue system para tasks (futuro)

## Monitoramento (Futuro)

- Application Performance Monitoring (APM)
- Error tracking (Sentry)
- Log aggregation (ELK Stack)
- Health checks
- Uptime monitoring

---

Para mais detalhes, consulte:
- [README.md](README.md) - Overview completo
- [API_DOCS.md](API_DOCS.md) - Documentação de endpoints
- [SETUP.md](SETUP.md) - Guia de configuração
