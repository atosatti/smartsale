# 💻 Development

Recursos para desenvolvedores contribuindo ao projeto SmartSale.

## 📋 Arquivos desta Seção

### 1️⃣ [CONTRIBUTING.md](./CONTRIBUTING.md) - Guia de Contribuição
Como contribuir para o projeto SmartSale.
- Padrões de código
- Fluxo de Git
- Como submeter PRs
- Requisitos de testes
- Code review guidelines

### 2️⃣ [DEPENDENCIES.md](./DEPENDENCIES.md) - Dependências do Projeto
Lista completa de todas as dependências.
- Backend (Node.js)
- Frontend (React)
- Devtools
- Versões mínimas necessárias

### 3️⃣ [INDEX.md](./INDEX.md) - Índice de Desenvolvimento
Índice geral para recursos de desenvolvimento.

---

## 🛠️ Ferramentas Recomendadas

### IDE / Editor
- VS Code (recomendado)
- WebStorm
- Vim/Neovim

### Extensões VS Code
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Thunder Client (para testar APIs)
- MySQL Shell
- TypeScript

### Ferramentas de Teste
- Jest (testes unitários)
- Supertest (testes API)
- Cypress (testes E2E)

### Database Tools
- MySQL Workbench
- DBeaver
- TablePlus

---

## 📚 Padrões de Código

### TypeScript
- Strict mode habilitado
- Tipos explícitos sempre
- Evitar `any`

### React/Next.js
- Functional components
- Hooks para estado
- Client components com 'use client'

### Node.js
- ES6+ modules
- Async/await
- Error handling com try/catch

### Banco de Dados
- Use migrations para schema changes
- Documentar relacionamentos
- Indexes em foreign keys

---

## 🔄 Fluxo de Desenvolvimento

1. **Create** - Crie uma branch: `git checkout -b feature/sua-feature`
2. **Develop** - Faça as mudanças seguindo os padrões
3. **Test** - Execute os testes localmente
4. **Commit** - Commit com mensagens descritivas
5. **Push** - Push para a branch
6. **PR** - Abra um Pull Request
7. **Review** - Aguarde o code review
8. **Merge** - Merge para main

---

## 📦 Scripts Úteis

### Frontend
```bash
npm run dev      # Desenvolvimento
npm run build    # Produção
npm run lint     # Linting
npm test         # Testes
```

### Backend
```bash
npm run dev      # Desenvolvimento
npm run build    # Compilar TypeScript
npm run start    # Produção
npm test         # Testes
```

---

## 🔗 Relacionado

- 🏗️ [Architecture](../architecture/) - Design da aplicação
- 🔌 [APIs](../api/) - Endpoints disponíveis
- 📖 [Guides](../guides/) - Guias práticos

---

**Nível de experiência:** Intermediário até Avançado

---

**❓ Dúvidas?** Consulte [TROUBLESHOOTING.md](../guides/TROUBLESHOOTING.md) ou abra uma issue.
