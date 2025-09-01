# Design Document

## Overview

Este documento descreve o design para implementar controle de acesso baseado em roles (RBAC) no sistema. A solução garantirá que usuários tenham acesso apenas às funcionalidades apropriadas para seu nível de permissão, implementando segurança tanto no frontend quanto no backend.

## Architecture

### Role Hierarchy
```
admin (Administrador)
├── Acesso completo ao sistema
├── Gerenciamento de usuários (CRUD)
├── Painel de administração
├── Todas as propostas
└── Relatórios completos

diretor (Diretor)
├── Visualização de todas as propostas
├── Relatórios e métricas
├── Aplicação de descontos especiais
└── Sem acesso ao gerenciamento de usuários

user (Usuário/Vendedor)
├── Apenas suas próprias propostas
├── Calculadoras
└── Sem acesso a relatórios ou administração
```

### Security Layers
1. **API Layer**: Validação de permissões em todas as rotas
2. **Frontend Layer**: Renderização condicional baseada em roles
3. **Database Layer**: Filtros de dados baseados em ownership e roles
4. **Route Protection**: Middleware para proteger rotas sensíveis

## Components and Interfaces

### 1. Role-Based Route Protection

#### RoleGuard Component
```typescript
interface RoleGuardProps {
  allowedRoles: ('admin' | 'diretor' | 'user')[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

#### useRoleAccess Hook
```typescript
interface RoleAccess {
  canAccessAdmin: boolean;
  canAccessReports: boolean;
  canManageUsers: boolean;
  canViewAllProposals: boolean;
}
```

### 2. API Middleware Enhancement

#### Enhanced requireAuth Function
```typescript
interface AuthOptions {
  roles?: string[];
  requireOwnership?: boolean;
  resourceField?: string;
}

function requireAuth(options: AuthOptions)
```

### 3. Navigation Component Updates

#### Conditional Menu Rendering
- Admin: Dashboard, Usuários, Relatórios, Calculadoras
- Diretor: Relatórios, Todas as Propostas, Calculadoras
- User: Calculadoras, Minhas Propostas

### 4. Proposal Access Control

#### Proposal Filtering Logic
- Admin: Acesso a todas as propostas
- Diretor: Acesso a todas as propostas (read-only para propostas de outros)
- User: Apenas propostas próprias

## Data Models

### Enhanced User Interface
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'diretor' | 'user';
  permissions?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Access Control Context
```typescript
interface AccessControlContext {
  user: User | null;
  permissions: RoleAccess;
  checkPermission: (resource: string, action: string) => boolean;
}
```

### Audit Log Model
```typescript
interface AccessLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  allowed: boolean;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}
```

## Error Handling

### Access Denied Responses
- **403 Forbidden**: Para tentativas de acesso não autorizadas
- **404 Not Found**: Para recursos que o usuário não deve saber que existem
- **401 Unauthorized**: Para tokens inválidos ou expirados

### Frontend Error Handling
- Página de "Acesso Negado" customizada
- Redirecionamento automático para área permitida
- Mensagens de erro contextuais

## Testing Strategy

### Unit Tests
- Testes para cada componente de proteção de rota
- Testes para hooks de verificação de permissão
- Testes para middleware de API

### Integration Tests
- Fluxos completos de acesso por role
- Testes de tentativas de acesso não autorizado
- Validação de filtros de dados

### Security Tests
- Testes de bypass de autenticação
- Testes de escalação de privilégios
- Validação de logs de auditoria

## Implementation Plan

### Phase 1: Backend Security
1. Atualizar middleware de autenticação
2. Implementar validação de roles nas APIs
3. Adicionar filtros de dados baseados em ownership
4. Criar sistema de logs de auditoria

### Phase 2: Frontend Protection
1. Criar componentes de proteção de rota
2. Implementar renderização condicional
3. Atualizar navegação baseada em roles
4. Criar páginas de acesso negado

### Phase 3: Data Access Control
1. Implementar filtros de propostas por role
2. Criar APIs específicas para relatórios de diretor
3. Atualizar queries de banco para respeitar ownership
4. Implementar cache de permissões

### Phase 4: Audit and Monitoring
1. Implementar logging de tentativas de acesso
2. Criar dashboard de auditoria para admins
3. Adicionar alertas de segurança
4. Implementar métricas de acesso

## Security Considerations

### Token Validation
- Validação de JWT em todas as requisições
- Verificação de expiração de token
- Refresh token automático quando necessário

### Data Isolation
- Usuários comuns veem apenas seus dados
- Diretores veem dados de todos mas com restrições de edição
- Admins têm acesso completo

### Audit Trail
- Log de todas as tentativas de acesso
- Rastreamento de mudanças em dados sensíveis
- Retenção de logs por período definido

### Rate Limiting
- Limitação de tentativas de acesso por IP
- Proteção contra ataques de força bruta
- Bloqueio temporário após múltiplas tentativas falhadas