# 🏗️ Arquitetura do Sistema Admin

## Diagrama de Fluxo Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  /admin (Layout com Sidebar)                                    │
│  ├── Dashboard (/admin)                                         │
│  ├── Users (/admin/users)                                       │
│  ├── User Detail (/admin/users/[id])                           │
│  ├── Audit Logs (/admin/audit-logs)                            │
│  └── Settings (/admin/settings)                                │
│                                                                  │
│  Componentes Reutilizáveis:                                     │
│  ├── Layout responsivo                                          │
│  ├── Tabelas com paginação                                      │
│  ├── Cards informativos                                         │
│  ├── Filtros e busca                                            │
│  └── Formulários de edição                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↑
                       Requisições HTTP
                      + JWT Token Auth
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express.js)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  /api/admin (Rotas Protegidas)                                  │
│  ├── GET /dashboard                                             │
│  ├── GET /users                 → getAllUsers()                │
│  ├── GET /users/:id             → getUserDetails()             │
│  ├── PUT /users/:id             → updateUser()                 │
│  ├── DELETE /users/:id          → deleteUser()                 │
│  ├── GET /users/:id/activity    → getUserActivity()            │
│  └── GET /audit-logs            → getAuditLogs()               │
│                                                                  │
│  Middlewares:                                                    │
│  ├── authMiddleware (JWT verification)                          │
│  └── adminMiddleware (Role check: admin?)                       │
│                                                                  │
│  Controllers:                                                    │
│  └── adminController.ts (7 funções principais)                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↑
                         SQL Queries
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (MySQL)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Tabelas:                                                        │
│  ├── users (UPDATED)                                            │
│  │   ├── id, email, password, ...                              │
│  │   ├── role (NEW) ← 'user' | 'admin'                         │
│  │   ├── admin_notes (NEW)                                     │
│  │   ├── is_active (NEW)                                       │
│  │   └── last_login (NEW)                                      │
│  │                                                              │
│  ├── admin_audit_logs (NEW)                                    │
│  │   ├── id, admin_user_id, target_user_id                    │
│  │   ├── action, resource_type, changes                        │
│  │   ├── ip_address, user_agent                                │
│  │   └── created_at                                            │
│  │                                                              │
│  └── [Outras tabelas existentes]                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Fluxo de Autenticação Admin

```
┌──────────────────────────────────────────────────────────┐
│ Usuário acessa http://localhost:3000/admin              │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│ Layout verifica useAuthStore (JWT token?)              │
│ - Se SIM: continua                                       │
│ - Se NÃO: redireciona para /login                       │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│ Página frontend carrega                                 │
│ Faz requisição: GET /api/admin/dashboard                │
│ Headers: Authorization: Bearer {JWT}                    │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│ Backend - authMiddleware                                │
│ ✓ Valida JWT token                                      │
│ ✓ Extrai user ID e email                                │
│ Se falhar → responde 401 (Não autenticado)              │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│ Backend - adminMiddleware                               │
│ ✓ Consulta database: SELECT role FROM users WHERE ...  │
│ ✓ Verifica se role = 'admin'                            │
│ Se falhar → responde 403 (Sem permissão)                │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│ Controller executa função solicitada                    │
│ Ex: getDashboardStats()                                 │
│ └─ Executa queries no DB                                │
│ └─ Formata resposta                                     │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│ Auditoria registra ação                                 │
│ INSERT INTO admin_audit_logs                            │
│ (admin_user_id, action, ip_address, created_at)        │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│ Resposta retorna ao frontend                            │
│ Ex: { users: {...}, revenue: {...} }                    │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│ Frontend atualiza estado e renderiza UI                 │
│ Usuário vê o dashboard                                  │
└──────────────────────────────────────────────────────────┘
```

---

## Estrutura de Dados - Diagrama ER

```
┌─────────────────────┐
│      users          │
├─────────────────────┤
│ id (PK)             │
│ email (UNIQUE)      │
│ password (hashed)   │
│ first_name          │
│ last_name           │
│ phone               │
├─────────────────────┤
│ role ✨ NEW         │ ──────┐
│ admin_notes ✨ NEW  │       │
│ is_active ✨ NEW    │       │
│ last_login ✨ NEW   │       │
├─────────────────────┤       │
│ two_fa_enabled      │       │
│ subscription_plan   │       │
│ subscription_status │       │
│ is_verified         │       │
├─────────────────────┤       │
│ created_at          │       │
│ updated_at          │       │
└─────────────────────┘       │
         │                    │
         │                    │
    ┌────┴─────────────┐      │
    │                  │      │
    ↓                  ↓      │
┌─────────────────┐  ┌──────────────────────────┐
│ products        │  │ admin_audit_logs ✨ NEW  │
├─────────────────┤  ├──────────────────────────┤
│ id (PK)         │  │ id (PK)                  │
│ user_id (FK)    │  │ admin_user_id (FK) ◄────┘
│ name            │  │ target_user_id (FK)
│ description     │  │ action
├─────────────────┤  │ resource_type
│ created_at      │  │ changes (JSON)
│ updated_at      │  │ ip_address
└─────────────────┘  │ user_agent
                     │ created_at
                     └──────────────────────────┘
```

---

## Diagrama de Permissões

```
┌─────────────────────────────────────────────────────────┐
│                  User (role = 'user')                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✓ Acessar: /dashboard (sua conta)                     │
│  ✓ Acessar: /profile                                   │
│  ✓ Acessar: /search                                    │
│  ✓ Acessar: /favorites                                 │
│                                                         │
│  ✗ BLOQUEADO: /admin                                   │
│  ✗ BLOQUEADO: /admin/users                             │
│  ✗ BLOQUEADO: /admin/audit-logs                        │
│                                                         │
│  Resposta: 403 Forbidden                               │
│  Mensagem: "Access denied. Admin privileges required." │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  Admin (role = 'admin')                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ✓ Acessar: /admin                                     │
│  ✓ Acessar: /admin/users                               │
│  ✓ Acessar: /admin/users/[id]                         │
│  ✓ Acessar: /admin/audit-logs                          │
│  ✓ Acessar: /admin/settings                            │
│                                                         │
│  ✓ API: GET /admin/dashboard                           │
│  ✓ API: GET /admin/users                               │
│  ✓ API: PUT /admin/users/:id                           │
│  ✓ API: DELETE /admin/users/:id                        │
│  ✓ API: GET /admin/audit-logs                          │
│                                                         │
│  TODAS as ações são auditadas                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Pipeline de uma Requisição de Edição de Usuário

```
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: PUT /api/admin/users/5                               │
│ Body: { role: 'admin', is_active: true, subscription_plan: ... │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Express recebe requisição                                       │
│ Passa por middleware stack                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ authMiddleware                                                   │
│ └─ Valida JWT token                                             │
│ └─ Extrai user info (ID, email)                                │
│ └─ Adiciona req.user = { id: 1, email: 'admin@...' }          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ adminMiddleware                                                  │
│ └─ Consulta: SELECT role FROM users WHERE id = 1               │
│ └─ Valida: role === 'admin' ?                                   │
│ └─ Se não, retorna 403 Forbidden                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ updateUser() Controller                                          │
│ └─ Valida campos (role, is_active, subscription_plan)          │
│ └─ Executa: UPDATE users SET ... WHERE id = 5                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ logAdminAction() - Auditoria                                    │
│ └─ Registra no admin_audit_logs:                               │
│    ├─ admin_user_id: 1 (quem fez)                              │
│    ├─ target_user_id: 5 (quem sofreu ação)                     │
│    ├─ action: 'update'                                         │
│    ├─ changes: { role: {from: 'user', to: 'admin'} }          │
│    ├─ ip_address: '192.168.1.100'                              │
│    └─ created_at: NOW()                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Response                                                        │
│ Status: 200 OK                                                  │
│ Body: { message: 'User updated successfully', changes: {...} } │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Frontend recebe resposta                                        │
│ └─ Atualiza estado local                                        │
│ └─ Mostra notificação de sucesso                               │
│ └─ Recarrega dados (opcional)                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Arquitetura de Segurança em Camadas

```
                         CLIENTE
                            │
                            ↓
    ┌──────────────────────────────────────────┐
    │   JWT Token Validation (authMiddleware)   │
    │   - Verifica assinatura                   │
    │   - Valida expiração                      │
    │   - Extrai user info                      │
    └──────────────────────────────────────────┘
                            │
                      ✓ Válido?
                            │
                      SIM ←─┴─→ NÃO → 401 Unauthorized
                            │
                            ↓
    ┌──────────────────────────────────────────┐
    │   Role-Based Access Control (admin)       │
    │   - Consulta role do user no DB           │
    │   - Verifica se é 'admin'                 │
    └──────────────────────────────────────────┘
                            │
                      ✓ Admin?
                            │
                      SIM ←─┴─→ NÃO → 403 Forbidden
                            │
                            ↓
    ┌──────────────────────────────────────────┐
    │   Input Validation                        │
    │   - Valida tipos de dados                 │
    │   - Valida ranges                         │
    │   - Previne SQL injection                 │
    └──────────────────────────────────────────┘
                            │
                      ✓ Válido?
                            │
                      SIM ←─┴─→ NÃO → 400 Bad Request
                            │
                            ↓
    ┌──────────────────────────────────────────┐
    │   Database Operations                     │
    │   - Prepared statements (queries)         │
    │   - Transações seguras                    │
    └──────────────────────────────────────────┘
                            │
                            ↓
    ┌──────────────────────────────────────────┐
    │   Audit Logging                           │
    │   - Registra ação realizada               │
    │   - Registra IP e user agent              │
    │   - Registra alterações (before/after)    │
    └──────────────────────────────────────────┘
                            │
                            ↓
                        SUCESSO
```

---

## Comparação: User vs Admin

| Recurso | User | Admin |
|---------|------|-------|
| Ver próprio perfil | ✅ | ✅ |
| Ver dashboard pessoal | ✅ | ✅ |
| Ver perfil de outro usuário | ❌ | ✅ |
| Listar todos os usuários | ❌ | ✅ |
| Editar informações de usuário | (próprio) | ✅ (qualquer) |
| Deletar usuário | ❌ | ✅ |
| Alterar role de usuário | ❌ | ✅ |
| Acessar auditoria | ❌ | ✅ |
| Ver estatísticas | (próprio) | ✅ (global) |
| Adicionar notas internas | ❌ | ✅ |

---

## Performance & Índices

```sql
-- Índices criados para otimizar queries:

✓ PRIMARY KEY (id)
✓ UNIQUE KEY (email)
✓ INDEX (google_id)
✓ INDEX (facebook_id)
✓ INDEX (stripe_customer_id)
✓ INDEX (subscription_plan)
✓ INDEX (role) ✨ NEW

-- admin_audit_logs:
✓ PRIMARY KEY (id)
✓ FOREIGN KEY (admin_user_id)
✓ FOREIGN KEY (target_user_id)
✓ INDEX (action)
✓ INDEX (created_at)

-- Benefícios:
├─ Queries de filtro rápidas (~5ms)
├─ Paginação eficiente
├─ Índices por role para verificação de admin
└─ Índice de created_at para auditoria
```

---

## Fluxo de Estado Frontend

```
useAuthStore (Zustand)
├── user: User | null
├── token: string | null
├── login(credentials)
├── logout()
└── updateUser(data)

Layout
├── useAuthStore() → user
├── useRouter() → navigate
├── useState(sidebarOpen)
├── useEffect()
│  └─ Verifica autenticação
│     └─ Se não autenticado → /login
└─ Renderiza Sidebar + Content

Page (ex: admin/users)
├── useAuthStore() → user
├── useRouter() → navigate
├── useState(users, pagination, loading, error)
├── useState(filters)
├── useEffect()
│  └─ Chama fetchUsers()
│     └─ api.get('/admin/users?...')
│        └─ Atualiza estado
└─ Renderiza tabela

Detail (admin/users/[id])
├── useParams() → userId
├── useAuthStore() → user
├── useState(userDetail, payments, subscriptions)
├── useEffect()
│  └─ Chama fetchUserDetail()
│     └─ api.get('/admin/users/:id')
│        └─ Popula formulário
└─ Renderiza edição + dados
```

---

## Resumo Arquitetural

```
┌────────────────────────────────────────────────────────────┐
│                    ADMIN SYSTEM ARCHITECTURE               │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  TIER 1 - Frontend (Next.js/React)                         │
│  ├─ 5 páginas admin                                        │
│  ├─ Componentes reutilizáveis                              │
│  ├─ State management (Zustand)                             │
│  └─ API integration layer                                  │
│                                                             │
│  TIER 2 - API Gateway (Express.js)                         │
│  ├─ Route handling                                         │
│  ├─ Middleware stack                                       │
│  │  ├─ authMiddleware (JWT)                               │
│  │  └─ adminMiddleware (RBAC)                             │
│  └─ Error handling                                         │
│                                                             │
│  TIER 3 - Business Logic (Controllers)                     │
│  ├─ adminController (7 funções)                            │
│  ├─ Validação de entrada                                   │
│  ├─ Lógica de negócio                                      │
│  └─ Auditoria                                              │
│                                                             │
│  TIER 4 - Data Layer (MySQL)                               │
│  ├─ Tabela users (modificada)                              │
│  ├─ Tabela admin_audit_logs (nova)                         │
│  ├─ Índices otimizados                                     │
│  └─ Integridade referencial                                │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## Conclusão

Este diagrama ilustra como:
1. **Solicitações** fluem do frontend ao backend
2. **Autenticação e Autorização** são validadas em camadas
3. **Dados** são processados com segurança
4. **Auditoria** rastreia todas as ações
5. **Resposta** retorna ao frontend com dados

O sistema é **escalável**, **seguro** e **auditado** em todos os níveis.
