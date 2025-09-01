// Contexto de autenticação
export { AuthProvider, AuthContext, useAuth } from '@/contexts/AuthContext';
export type { User } from '@/contexts/AuthContext';

// Hooks de permissão
export { useRoleAccess, usePermission } from '@/hooks/useRoleAccess';
export type { RoleAccess } from '@/hooks/useRoleAccess';

// Componentes de proteção
export { 
  RoleGuard, 
  AdminOnly, 
  DirectorOnly, 
  DirectorAndAdminOnly, 
  UserOnly,
  AccessDenied 
} from './RoleGuard';

export { 
  ProtectedRoute, 
  withRoleProtection,
  AdminRoute,
  DirectorRoute,
  DirectorOrAdminRoute 
} from './ProtectedRoute';

export { AccessDeniedPage } from './AccessDeniedPage';