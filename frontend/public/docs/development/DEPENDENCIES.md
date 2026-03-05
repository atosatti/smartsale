# Dependências do SmartSale

## Backend Dependencies

### Production
```json
{
  "express": "^4.18.2",
  "typescript": "^5.3.3",
  "mysql2": "^3.6.5",
  "dotenv": "^16.3.1",
  "jsonwebtoken": "^9.1.2",
  "bcryptjs": "^2.4.3",
  "axios": "^1.6.2",
  "speakeasy": "^2.0.0",
  "qrcode": "^1.5.3",
  "passport": "^0.7.0",
  "passport-google-oauth20": "^2.0.0",
  "passport-facebook": "^3.0.0",
  "express-session": "^1.17.3",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "validator": "^13.11.0",
  "nodemailer": "^6.9.7",
  "stripe": "^14.7.0"
}
```

### Development
```json
{
  "@types/express": "^4.17.21",
  "@types/node": "^20.10.6",
  "@types/jsonwebtoken": "^9.0.7",
  "@types/bcryptjs": "^2.4.6",
  "@types/speakeasy": "^2.0.10",
  "tsx": "^4.7.0",
  "vitest": "^1.1.0",
  "@typescript-eslint/eslint-plugin": "^6.17.0",
  "@typescript-eslint/parser": "^6.17.0",
  "eslint": "^8.56.0"
}
```

### Descrição das Dependências

| Pacote | Versão | Propósito |
|--------|--------|----------|
| express | ^4.18.2 | Framework web |
| typescript | ^5.3.3 | Tipagem estática |
| mysql2 | ^3.6.5 | Driver MySQL |
| dotenv | ^16.3.1 | Variáveis de ambiente |
| jsonwebtoken | ^9.1.2 | JWT |
| bcryptjs | ^2.4.3 | Hash de senha |
| axios | ^1.6.2 | HTTP client |
| speakeasy | ^2.0.0 | TOTP 2FA |
| qrcode | ^1.5.3 | Gerar QR Code |
| passport | ^0.7.0 | Autenticação |
| passport-google-oauth20 | ^2.0.0 | OAuth Google |
| passport-facebook | ^3.0.0 | OAuth Facebook |
| express-session | ^1.17.3 | Sessões |
| cors | ^2.8.5 | CORS middleware |
| helmet | ^7.1.0 | Headers de segurança |
| validator | ^13.11.0 | Validação de dados |
| nodemailer | ^6.9.7 | Envio de emails |
| stripe | ^14.7.0 | Pagamentos |

---

## Frontend Dependencies

### Production
```json
{
  "next": "^14.0.4",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "axios": "^1.6.2",
  "zustand": "^4.4.5",
  "next-auth": "^4.24.10",
  "stripe": "^14.7.0",
  "@stripe/react-stripe-js": "^2.4.0",
  "@stripe/stripe-js": "^2.1.10",
  "react-hot-toast": "^2.4.1",
  "zustand-persist": "^1.2.4",
  "react-qr-code": "^1.4.4"
}
```

### Development
```json
{
  "typescript": "^5.3.3",
  "@types/react": "^18.2.42",
  "@types/react-dom": "^18.2.17",
  "@types/node": "^20.10.6",
  "tailwindcss": "^3.4.1",
  "postcss": "^8.4.32",
  "autoprefixer": "^10.4.16",
  "eslint": "^8.56.0",
  "eslint-config-next": "^14.0.4"
}
```

### Descrição das Dependências

| Pacote | Versão | Propósito |
|--------|--------|----------|
| next | ^14.0.4 | Framework React |
| react | ^18.2.0 | Biblioteca UI |
| react-dom | ^18.2.0 | Renderização DOM |
| axios | ^1.6.2 | HTTP client |
| zustand | ^4.4.5 | State management |
| next-auth | ^4.24.10 | Autenticação |
| stripe | ^14.7.0 | SDK Stripe |
| @stripe/react-stripe-js | ^2.4.0 | Componentes Stripe |
| @stripe/stripe-js | ^2.1.10 | Biblioteca Stripe |
| react-hot-toast | ^2.4.1 | Notificações toast |
| zustand-persist | ^1.2.4 | Persistência Zustand |
| react-qr-code | ^1.4.4 | Renderizar QR Code |
| tailwindcss | ^3.4.1 | CSS utility |
| postcss | ^8.4.32 | CSS processing |
| autoprefixer | ^10.4.16 | Prefixos CSS |

---

## Versão do Node.js

- **Mínima Recomendada**: Node.js 18.x
- **Recomendada**: Node.js 20.x
- **Testada**: Node.js 18.x, 20.x

```bash
# Verificar versão
node --version
npm --version
```

---

## Versão do MySQL

- **Mínima Recomendada**: MySQL 8.0
- **Compatível com**: MySQL 5.7+ (com limitações)

```bash
# Verificar versão
mysql --version
```

---

## Gerenciador de Pacotes

Tanto **npm** quanto **yarn** são suportados:

### Com npm
```bash
npm install
npm run dev
```

### Com yarn
```bash
yarn install
yarn dev
```

---

## Scripts Disponíveis

### Backend

```bash
npm run dev          # Desenvolvimento com hot reload
npm run build        # Build TypeScript
npm start            # Produção
npm run test         # Rodar testes
npm run lint         # Verificar linting
npm run lint:fix     # Corrigir linting automático
```

### Frontend

```bash
npm run dev          # Desenvolvimento
npm run build        # Build otimizado
npm start            # Servidor de produção
npm run lint         # Verificar linting
npm run type-check   # Verificar tipos TypeScript
```

---

## Instalação de Dependências

### Backend

```bash
cd backend
npm install
```

Para instalar apenas dependências de produção:
```bash
npm install --production
```

### Frontend

```bash
cd frontend
npm install
```

Para instalar apenas dependências de produção:
```bash
npm install --production
```

---

## Atualizando Dependências

### Verificar atualizações disponíveis
```bash
npm outdated
```

### Atualizar dependências minor/patch
```bash
npm update
```

### Atualizar dependência específica
```bash
npm install nome-do-pacote@latest
```

### Atualizar todas para versão latest
```bash
npm install -g npm-check-updates
ncu -u
npm install
```

---

## Vulnerabilidades de Segurança

### Verificar vulnerabilidades
```bash
npm audit
```

### Corrigir vulnerabilidades automaticamente
```bash
npm audit fix
```

### Força versão específica se necessário
```bash
npm audit fix --force
```

---

## Tamanho das Dependências

### Analisar tamanho
```bash
npm ls --depth=0
```

### Análise mais detalhada
```bash
npm install --save-dev webpack-bundle-analyzer
```

---

## Compatibilidade de Versões

### Backend Node.js
- ✅ Node.js 18.x (LTS)
- ✅ Node.js 20.x (LTS)
- ⚠️ Node.js 16.x (suporte limitado)
- ❌ Node.js < 16.x

### Navegadores Suportados (Frontend)
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## Lock Files

### Usar package-lock.json
```bash
git add package-lock.json
```

### Gerar novo lock file
```bash
rm package-lock.json
npm install
```

---

## Troubleshooting de Dependências

### npm ERR! ERESOLVE unable to resolve dependency tree

```bash
# Opção 1: Forçar instalação
npm install --legacy-peer-deps

# Opção 2: Limpar cache
npm cache clean --force
npm install
```

### npm ERR! peer dep missing

```bash
# Instalar a dependência faltante
npm install nome-da-dependencia
```

### Módulo não encontrado

```bash
# Limpar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## Documentação de Dependências

Para aprender mais sobre as dependências:

- [Express.js Docs](https://expressjs.com)
- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [MySQL2 Docs](https://github.com/sidorares/node-mysql2)
- [JWT Docs](https://jwt.io)
- [Bcryptjs Docs](https://github.com/dcodeIO/bcrypt.js)
- [Axios Docs](https://axios-http.com)
- [Passport.js Docs](http://www.passportjs.org)
- [Stripe Docs](https://stripe.com/docs)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

## Performance

### Bundle Size
- Backend: ~2MB (sem node_modules)
- Frontend: ~500KB (buildado)

### Recomendações
- Use `npm install --production` em produção
- Use `npm ci` em CI/CD para versões exatas
- Regularmente atualize dependências críticas

---

## Política de Versões

### Semântica de Versionamento
- **Major** (x.0.0): Breaking changes
- **Minor** (0.x.0): Novas features
- **Patch** (0.0.x): Bug fixes

### Caret (^) vs Tilde (~)
- `^1.2.3`: Aceita `1.x.x` (mudanças menores)
- `~1.2.3`: Aceita `1.2.x` (apenas patches)

---

## Próximas Versões

### Planejado
- [ ] Atualizar para Node.js 22 LTS
- [ ] Atualizar para React 19
- [ ] Atualizar para Next.js 15
- [ ] Adicionar Prisma ORM
- [ ] Adicionar testes (Vitest, Jest)

---

Última atualização: 30 de Janeiro, 2026
