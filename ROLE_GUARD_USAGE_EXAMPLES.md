# RoleGuard - Exemplos de Uso

## Visão Geral

O sistema de controle de acesso baseado em roles (RBAC) foi implementado com os seguintes componentes:

- **RoleGuard**: Componente para proteger conteúdo baseado em roles
- **ProtectedRoute**: Componente para proteger rotas inteiras
- **useRoleAccess**: Hook para verificar permissões
- **usePermission**: Hook para verificar permissões específicas
- **AuthContext**: Contexto de autenticação

## Configuração Inicial

### 1. Configurar o AuthProvider

```tsx
// app/layout.tsx ou _app.tsx
import { AuthProvider } from '@/components/auth';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

## Exemplos de Uso

### 1. Protegendo Conteúdo com RoleGuard

```tsx
import { RoleGuard, AdminOnly, DirectorAndAdminOnly } from '@/components/auth';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Conteúdo apenas para admins */}
      <AdminOnly>
        <button>Gerenciar Usuários</button>
      </AdminOnly>
      
      {/* Conteúdo para diretores e admins */}
      <DirectorAndAdminOnly>
        <button>Ver Relatórios</button>
      </DirectorAndAdminOnly>
      
      {/* Conteúdo com roles específicos */}
      <RoleGuard allowedRoles={['admin', 'diretor']}>
        <div>Área restrita para gestores</div>
      </RoleGuard>
      
      {/* Com fallback personalizado */}
      <RoleGuard 
        allowedRoles={['admin']} 
        fallback={<div>Você precisa ser admin para ver isso</div>}
      >
        <button>Configurações Avançadas</button>
      </RoleGuard>
    </div>
  );
}
```

### 2. Protegendo Páginas Inteiras

```tsx
// pages/admin/users.tsx
import { AdminRoute } from '@/components/auth';

function UsersPage() {
  return (
    <AdminRoute>
      <div>
        <h1>Gerenciar Usuários</h1>
        <p>Esta página é apenas para administradores</p>
      </div>
    </AdminRoute>
  );
}

// Ou usando ProtectedRoute com mais opções
function ReportsPage() {
  return (
    <ProtectedRoute 
      allowedRoles={['admin', 'diretor']}
      requiredRole="Administrador ou Diretor"
    >
      <div>
        <h1>Relatórios</h1>
        <p>Área de relatórios para gestores</p>
      </div>
    </ProtectedRoute>
  );
}
```

### 3. Usando Hooks de Permissão

```tsx
import { useRoleAccess, usePermission, useAuth } from '@/components/auth';

function NavigationMenu() {
  const { user } = useAuth();
  const roleAccess = useRoleAccess();
  const canManageUsers = usePermission('users', 'manage');
  const canAccessReports = usePermission('reports', 'access');

  return (
    <nav>
      <ul>
        <li><a href="/calculators">Calculadoras</a></li>
        
        {roleAccess.canViewAllProposals && (
          <li><a href="/proposals">Todas as Propostas</a></li>
        )}
        
        {canAccessReports && (
          <li><a href="/reports">Relatórios</a></li>
        )}
        
        {canManageUsers && (
          <li><a href="/admin/users">Gerenciar Usuários</a></li>
        )}
        
        {roleAccess.canAccessAdmin && (
          <li><a href="/admin">Painel Admin</a></li>
        )}
      </ul>
      
      <div>
        Logado como: {user?.name} ({user?.role})
      </div>
    </nav>
  );
}
```

### 4. Renderização Condicional em Componentes

```tsx
import { useRoleAccess } from '@/components/auth';

function ProposalCard({ proposal, onEdit, onDelete }) {
  const { canEditOtherProposals, canDeleteProposals } = useRoleAccess();
  const { user } = useAuth();
  
  // Verifica se pode editar (admin pode editar qualquer, outros apenas próprias)
  const canEdit = canEditOtherProposals || proposal.user_id === user?.id;
  
  // Verifica se pode deletar
  const canDelete = canDeleteProposals && (
    canEditOtherProposals || proposal.user_id === user?.id
  );

  return (
    <div className="proposal-card">
      <h3>{proposal.title}</h3>
      <p>{proposal.description}</p>
      
      <div className="actions">
        {canEdit && (
          <button onClick={() => onEdit(proposal.id)}>
            Editar
          </button>
        )}
        
        {canDelete && (
          <button onClick={() => onDelete(proposal.id)}>
            Deletar
          </button>
        )}
      </div>
    </div>
  );
}
```

### 5. Proteção com HOC (Higher-Order Component)

```tsx
import { withRoleProtection } from '@/components/auth';

// Componente original
function AdminPanel() {
  return (
    <div>
      <h1>Painel Administrativo</h1>
      <p>Área restrita para administradores</p>
    </div>
  );
}

// Exportar versão protegida
export default withRoleProtection(AdminPanel, ['admin'], {
  requiredRole: 'Administrador',
  showAccessDenied: true
});
```

### 6. Verificação de Permissões em Formulários

```tsx
import { useRoleAccess } from '@/components/auth';

function ProposalForm({ proposal, isEditing }) {
  const { canApplyDirectorDiscount } = useRoleAccess();

  return (
    <form>
      <input name="title" placeholder="Título da proposta" />
      <input name="description" placeholder="Descrição" />
      
      {/* Campo de desconto apenas para diretores */}
      {canApplyDirectorDiscount && (
        <div>
          <label>Desconto Especial (%)</label>
          <input 
            type="number" 
            name="directorDiscount" 
            max="100" 
            min="0" 
          />
        </div>
      )}
      
      <button type="submit">
        {isEditing ? 'Atualizar' : 'Criar'} Proposta
      </button>
    </form>
  );
}
```

### 7. Redirecionamento Baseado em Role

```tsx
import { useAuth } from '@/components/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    // Redirecionar baseado no role
    switch (user.role) {
      case 'admin':
        router.push('/admin');
        break;
      case 'diretor':
        router.push('/reports');
        break;
      case 'user':
        router.push('/calculators');
        break;
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return <div>Redirecionando...</div>;
}
```

## Estrutura de Roles

### Admin
- Acesso completo ao sistema
- Pode gerenciar usuários (CRUD)
- Pode ver todas as propostas
- Pode acessar relatórios
- Pode editar/deletar qualquer proposta

### Diretor
- Pode ver todas as propostas (mas só edita as próprias)
- Pode acessar relatórios
- Pode aplicar desconto especial
- Não pode gerenciar usuários
- Não pode acessar painel admin

### User (Vendedor)
- Pode ver apenas suas próprias propostas
- Pode usar calculadoras
- Pode editar/deletar apenas suas propostas
- Não pode acessar relatórios ou admin

## Boas Práticas

1. **Sempre use o AuthProvider** no nível mais alto da aplicação
2. **Combine proteções** - use tanto no frontend quanto no backend
3. **Seja específico** com as permissões - prefira granularidade
4. **Teste cenários** de acesso negado
5. **Forneça feedback** claro quando o acesso é negado
6. **Use fallbacks** apropriados para melhor UX
7. **Mantenha consistência** entre as verificações de permissão