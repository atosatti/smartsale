# CONTRIBUTING.md - Guia de Contribuição

## 🎉 Obrigado por querer contribuir!

Contribuições são o que torna a comunidade de código aberto um lugar incrível para aprender, inspirar e criar. Qualquer contribuição que você fizer será **muito apreciada**.

---

## Como Contribuir

### Reportar Bugs

Antes de criar um report de bug, verifique [issues](https://github.com/seu-usuario/smartsale/issues) pois você pode descobrir que não precisa criar um.

Ao reportar um bug, inclua:
- **Título descritivo** para o issue
- **Descrição clara** do comportamento esperado vs real
- **Passos para reproduzir** o problema
- **Exemplos específicos** para demonstrar os passos
- **Screenshots** se relevante
- **Seu ambiente** (OS, navegador, Node.js version)

### Sugerir Enhancements

Enhancements podem incluir features completamente novas ou melhorias em features existentes.

Ao sugerir um enhancement:
- Use um **título descritivo**
- Providencie uma **descrição clara** da sugestão
- Descreva o **comportamento esperado** vs comportamento atual
- Explique **por que** essa melhoria seria útil
- Se possível, faça um **protótipo** da feature

### Pull Requests

- Siga os estilos de código do projeto
- Inclua screenshots/GIFs se relevante para mudanças no UI
- Escreva mensagens de commit bem descritivas
- Documente qualquer comportamento novo
- Termine todos os arquivos com uma newline

---

## Workflow de Desenvolvimento

### 1. Fork o Repositório
```bash
# No GitHub, clique em "Fork"
```

### 2. Clone seu Fork
```bash
git clone https://github.com/seu-usuario/smartsale.git
cd smartsale
```

### 3. Crie uma Branch
```bash
# Para features
git checkout -b feature/nome-da-feature

# Para bugfixes
git checkout -b fix/nome-do-bug

# Para documentação
git checkout -b docs/descricao
```

### 4. Faça suas Mudanças
```bash
# Edite os arquivos necessários
# Teste suas mudanças
# Commit quando estiver pronto
```

### 5. Commit e Push
```bash
git add .
git commit -m "tipo: breve descrição"
# Exemplos:
# feat: adicionar autenticação com OAuth
# fix: corrigir erro de validação
# docs: atualizar README
# refactor: melhorar estrutura do código
# test: adicionar testes

git push origin feature/nome-da-feature
```

### 6. Abra um Pull Request
- Vá para o repositório original
- Clique em "New Pull Request"
- Selecione sua branch
- Descreva suas mudanças
- Submit!

---

## Padrões de Código

### JavaScript/TypeScript

```typescript
// ✅ Bom - Use const por padrão
const usuario = { nome: 'João' };

// ✅ Use let apenas quando necessário modificar
let contador = 0;
contador++;

// ❌ Evite var
var nao_use_isso = true;

// ✅ Use arrow functions
const processar = (dados) => {
  return dados.map(d => d.id);
};

// ✅ Use async/await
const buscarDados = async () => {
  const resultado = await api.get('/dados');
  return resultado.data;
};

// ✅ Use destructuring
const { nome, email } = usuario;

// ✅ Use template literals
const mensagem = `Olá, ${nome}!`;

// ✅ Use optional chaining
const endereco = usuario?.endereco?.rua;
```

### Convenção de Nomes

```typescript
// Classes - PascalCase
class UsuarioController { }

// Funções e variáveis - camelCase
const processarDados = () => { };
const meuNome = 'João';

// Constantes - UPPER_SNAKE_CASE
const API_URL = 'http://api.com';
const MAX_RETRIES = 3;

// Tipos/Interfaces - PascalCase
interface Usuario { }
type Status = 'active' | 'inactive';

// Propriedades privadas - _privateVar
class Classe {
  _private = 'privado';
}
```

### Formatação de Código

- Use **2 espaços** para indentação
- Use **single quotes** para strings
- Use **semicolons**
- Mantenha linhas com menos de 100 caracteres

```bash
# Prettier vai formatar automaticamente
npm run lint:fix
```

---

## Estrutura de Commits

### Tipos de Commits
```
feat:      Adição de nova feature
fix:       Correção de bug
docs:      Mudanças na documentação
style:     Formatação (sem mudanças lógicas)
refactor:  Mudança de código sem alterar comportamento
perf:      Mudanças que melhoram performance
test:      Adicionar ou atualizar testes
chore:     Atualizações de dependências
ci:        Mudanças em CI/CD
```

### Exemplos
```bash
git commit -m "feat: adicionar autenticação com 2FA"
git commit -m "fix: corrigir erro ao fazer login"
git commit -m "docs: atualizar guia de setup"
git commit -m "refactor: melhorar estrutura do searchStore"
git commit -m "test: adicionar testes de autenticação"
```

---

## Testes

### Backend
```bash
# Rodar testes
cd backend
npm test

# Com coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Frontend
```bash
# Rodar testes
cd frontend
npm test

# Com coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Cobertura Mínima
- Backend: 80%
- Frontend: 70%

---

## Documentação

### Adicionar nova feature

1. **Atualize README.md**
```markdown
### Minha Nova Feature
- Descrição breve
- Casos de uso
```

2. **Documente a API** em API_DOCS.md
```markdown
### Novo Endpoint
**POST** `/api/novo-endpoint`

Request:
Response:
```

3. **Atualize arquitetura** se necessário em ARCHITECTURE.md

4. **Documente mudanças** em CHANGES.md (futuro)

### Padrão JSDoc

```typescript
/**
 * Processa dados de entrada e retorna resultado
 * @param dados - Array de dados a processar
 * @param opcoes - Opções de processamento
 * @returns Array processado
 * @throws Error se dados inválidos
 */
function processar(dados: any[], opcoes: any): any[] {
  // implementação
}
```

---

## Code Review

### Ao Revisar PRs, Verifique

- ✅ Código segue os padrões do projeto
- ✅ Não há lógica duplicada
- ✅ Performance é adequada
- ✅ Testes cobrem mudanças
- ✅ Documentação está atualizada
- ✅ Sem console.logs ou debuggers
- ✅ Mensagens de commit são claras
- ✅ Não quebra features existentes

### Feedback Construtivo

```typescript
// ❌ Ruim
// Isso está errado

// ✅ Bom
// Sugestão: usar const em vez de let aqui, pois
// a variável não é modificada depois da inicialização.
// Isso melhora a clareza do código.
```

---

## Antes de Fazer um PR

### Checklist
- [ ] Meu código segue os estilos do projeto
- [ ] Fiz self-review do meu próprio código
- [ ] Adicionei comentários quando código é complexo
- [ ] Atualizei documentação relevante
- [ ] Minhas mudanças não geram novos warnings
- [ ] Adicionei testes que provam minha fix/feature
- [ ] Testes novos e existentes passam
- [ ] Não há console.logs ou code comments inúteis

---

## Processo de Review

1. **Submeta seu PR** com descrição clara
2. **Espere review** de um mantenedor
3. **Atenda feedback** se necessário
4. **Rebase** se houver conflitos
5. **Merge** quando aprovado

---

## Community Standards

### Código de Conduta (Resumido)

- Seja respeitoso
- Aceite crítica construtiva
- Foque no que é melhor para a comunidade
- Mostre empatia com outros contribuidores

### Reportando Problemas

Se você experimentar ou testemunhar alguma violação, entre em contato:
- 📧 conduct@smartsale.com
- 🔒 Relatórios serão tratados com confidencialidade

---

## Recursos para Contribuidores

### Documentação
- [README.md](README.md) - Overview
- [ARCHITECTURE.md](ARCHITECTURE.md) - Design
- [API_DOCS.md](API_DOCS.md) - Endpoints
- [SETUP.md](SETUP.md) - Setup local
- [ROADMAP.md](ROADMAP.md) - Features futuras

### Ferramentas Recomendadas
- [VS Code](https://code.visualstudio.com/)
- [Postman](https://www.postman.com/) - API testing
- [DBeaver](https://dbeaver.io/) - Database
- [Git](https://git-scm.com/)

### Extensões VS Code
- ESLint
- Prettier
- Thunder Client (ou Postman)
- SQL Server
- TypeScript Vue Plugin

---

## FAQ sobre Contribuições

### Posso contribuir com documentação?
**Sim!** Documentação é tão importante quanto código. Correções, melhorias e novas seções são bem-vindas.

### Preciso de permissão para começar?
**Não!** Basta fazer um fork e começar. Submeta um PR quando estiver pronto.

### Quais tipos de PRs são aceitos?
- Novas features
- Bug fixes
- Melhorias de performance
- Documentação
- Testes
- Refactoring
- Traduções

### Quanto tempo leva para revisar um PR?
Normalmente 2-5 dias. Mantenedores são voluntários.

### Pode meu PR ser rejeitado?
Sim, mas forneceremos feedback claro sobre o porquê.

### Posso trabalhar em features do Roadmap?
**Sim!** Comente na issue correspondente primeiro para evitar duplicação.

---

## Bônus: Primeiro Contribuidor

Se é sua primeira vez contribuindo, parabéns! 🎉

Ideias para começar:
- ✅ Melhorias em documentação
- ✅ Correções de typos
- ✅ Testes
- ✅ Pequenos bugfixes

---

## Dúvidas?

- 📧 Email: support@smartsale.com
- 💬 Discussions no GitHub
- 🐦 Twitter: @smartsale

---

## Obrigado! 💖

Seu esforço e contribuição significam muito para este projeto e para a comunidade.

**Juntos estamos tornando SmartSale ainda melhor!**

---

**Última atualização**: 30 de Janeiro, 2026
