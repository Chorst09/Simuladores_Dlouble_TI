import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export interface RoleAccess {
  canAccessAdmin: boolean;
  canAccessReports: boolean;
  canManageUsers: boolean;
  canViewAllProposals: boolean;
  canApplyDirectorDiscount: boolean;
  canDeleteProposals: boolean;
  canEditOtherProposals: boolean;
}

export function useRoleAccess(): RoleAccess {
  const { user } = useContext(AuthContext);

  if (!user) {
    return {
      canAccessAdmin: false,
      canAccessReports: false,
      canManageUsers: false,
      canViewAllProposals: false,
      canApplyDirectorDiscount: false,
      canDeleteProposals: false,
      canEditOtherProposals: false,
    };
  }

  const isAdmin = user.role === 'admin';
  const isDiretor = user.role === 'diretor';
  const isUser = user.role === 'user';

  return {
    // Admin tem acesso completo ao painel administrativo
    canAccessAdmin: isAdmin,
    
    // Admin e Diretor podem acessar relatórios
    canAccessReports: isAdmin || isDiretor,
    
    // Apenas Admin pode gerenciar usuários
    canManageUsers: isAdmin,
    
    // Admin e Diretor podem ver todas as propostas
    canViewAllProposals: isAdmin || isDiretor,
    
    // Apenas Diretor pode aplicar desconto especial
    canApplyDirectorDiscount: isDiretor,
    
    // Admin pode deletar qualquer proposta, outros apenas as próprias
    canDeleteProposals: isAdmin || isDiretor || isUser,
    
    // Admin pode editar qualquer proposta, Diretor pode editar as próprias
    canEditOtherProposals: isAdmin,
  };
}

/**
 * Hook para verificar permissão específica
 */
export function usePermission(resource: string, action: string): boolean {
  const { user } = useContext(AuthContext);
  const roleAccess = useRoleAccess();

  if (!user) return false;

  // Mapeamento de recursos e ações para permissões
  const permissionMap: Record<string, Record<string, keyof RoleAccess>> = {
    admin: {
      access: 'canAccessAdmin',
    },
    reports: {
      access: 'canAccessReports',
    },
    users: {
      manage: 'canManageUsers',
    },
    proposals: {
      viewAll: 'canViewAllProposals',
      delete: 'canDeleteProposals',
      editOthers: 'canEditOtherProposals',
    },
    discounts: {
      applyDirector: 'canApplyDirectorDiscount',
    },
  };

  const resourcePermissions = permissionMap[resource];
  if (!resourcePermissions) return false;

  const permissionKey = resourcePermissions[action];
  if (!permissionKey) return false;

  return roleAccess[permissionKey];
}