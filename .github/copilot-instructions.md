# Instruções para Desenvolvimento - SmartSale

## Visão Geral do Projeto

O SmartSale é uma aplicação Full-Stack para pesquisa de produtos em e-commerce com autenticação segura, 2FA, OAuth, e sistema de assinatura.

## Stack Tecnológico

**Backend**: Node.js + Express + TypeScript + MySQL
**Frontend**: Next.js 14 + React + TypeScript + Tailwind CSS

## Estrutura e Convenções

### Backend
- Pasta `controllers/`: Lidam com requisições HTTP
- Pasta `services/`: Contêm a lógica de negócio
- Pasta `routes/`: Definem os endpoints da API
- Pasta `middleware/`: Middlewares de autenticação e erro
- Pasta `models/`: Tipos TypeScript
- Pasta `utils/`: Funções auxiliares (JWT, 2FA, email)
- Pasta `config/`: Configurações (banco de dados, etc)

### Frontend
- Pasta `app/`: Páginas do Next.js (app router)
- Pasta `components/`: Componentes React reutilizáveis
- Pasta `lib/`: Serviços de API e funções auxiliares
- Pasta `store/`: Gerenciamento de estado com Zustand
- Pasta `public/`: Arquivos estáticos

## Banco de Dados

O schema SQL está em `backend/database.sql`

### Principais Tabelas
- `users`: Usuários com autenticação
- `products`: Produtos pesquisados
- `product_prices`: Preços em diferentes plataformas
- `search_logs`: Histórico de pesquisas
- `subscriptions`: Planos de assinatura

## Fluxo de Autenticação

1. Usuário registra/faz login
2. Se 2FA está ativado, recebe um token temporário
3. Usuário escaneia QR Code do 2FA com aplicativo autenticador
4. Verifica o token TOTP
5. Recebe JWT token de acesso

## Integrações Externas

### APIs de E-commerce
- Mercado Livre: API pública (implementada)
- Amazon: Requer API keys
- Shopee: Requer API keys

### Serviços de Terceiros
- Google OAuth
- Facebook OAuth
- Stripe para pagamentos
- Nodemailer para emails

## Como Executar Localmente

### Backend
```bash
cd backend
npm install
cp .env.example .env
mysql -u root -p < database.sql
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Variáveis de Ambiente Necessárias

### Backend
- DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
- JWT_SECRET, SESSION_SECRET
- Google/Facebook OAuth credentials
- Email service credentials
- E-commerce API keys

### Frontend
- NEXT_PUBLIC_API_URL
- OAuth public IDs/keys
- Stripe public key

## Boas Práticas

1. **Segurança**: Sempre validar entrada de dados
2. **Tipos**: Use TypeScript strict mode
3. **Erros**: Use try-catch e trate corretamente
4. **Logs**: Use console.error para erros
5. **API**: Use aborto de token inválido com 401
6. **Componentes**: Mantenha componentes pequenos e reutilizáveis

## Próximos Passos para Implementação

- [ ] Configurar OAuth (Google/Facebook)
- [ ] Integrar Stripe para pagamentos
- [ ] Implementar cache de resultados
- [ ] Adicionar notificações de preço
- [ ] Criar dashboard analítico
- [ ] Testes automatizados
- [ ] CI/CD pipeline
- [ ] Deploy em produção

## Contato para Dúvidas

Consulte o README.md para informações mais detalhadas sobre o projeto.

## Fluxo para o Github Copilot
Local Development
    ↓
staging (branch de testes)
    ↓
main (produção)

## Documentação
Toda a documentação criada deve ser clara, concisa e atualizada. Use comentários no código para explicar lógica complexa. Mantenha o README.md atualizado com instruções de configuração e uso.
Todo o novo documento deve ser enviado e catalogado na pasta Docs
