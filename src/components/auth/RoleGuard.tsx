import React, { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

interface RoleGuardProps {
  allowedRoles: ('admin' | 'diretor' | 'user')[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean; // Se true, usuário deve ter TODOS os roles (AND), se false, pelo menos um (OR)
}

/**
 * Componente para proteger conteúdo baseado em roles do usuário
 * Renderiza children apenas se o usuário tiver pelo menos um dos roles permitidos
 */
export function RoleGuard({ 
  allowedRoles, 
  children, 
  fallback = null,
  requireAll = false 
}: RoleGuardProps) {
  const { user, isLoading } = useContext(AuthContext);

  // Enquanto carrega, não mostra nada
  if (isLoading) {
    return null;
  }

  // Se não há usuário logado, não mostra o conteúdo
  if (!user) {
    return <>{fallback}</>;
  }

  // Verifica se o usuário tem permissão
  const hasPermission = requireAll
    ? allowedRoles.every(role => user.role === role) // Deve ter todos os roles (raramente usado)
    : allowedRoles.includes(user.role); // Deve ter pelo menos um dos roles

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Componente para mostrar conteúdo apenas para administradores
 */
export function AdminOnly({ children, fallback }: Omit<RoleGuardProps, 'allowedRoles'>) {
  return (
    <RoleGuard allowedRoles={['admin']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Componente para mostrar conteúdo apenas para diretores
 */
export function DirectorOnly({ children, fallback }: Omit<RoleGuardProps, 'allowedRoles'>) {
  return (
    <RoleGuard allowedRoles={['diretor']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Componente para mostrar conteúdo para diretores e administradores
 */
export function DirectorAndAdminOnly({ children, fallback }: Omit<RoleGuardProps, 'allowedRoles'>) {
  return (
    <RoleGuard allowedRoles={['admin', 'diretor']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Componente para mostrar conteúdo apenas para usuários comuns
 */
export function UserOnly({ children, fallback }: Omit<RoleGuardProps, 'allowedRoles'>) {
  return (
    <RoleGuard allowedRoles={['user']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Componente para mostrar mensagem de acesso negado
 */
export function AccessDenied({ 
  message = "Você não tem permissão para acessar este conteúdo.",
  requiredRole,
  showContactInfo = true 
}: {
  message?: string;
  requiredRole?: string;
  showContactInfo?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
          <svg 
            className="w-6 h-6 text-red-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        </div>
        
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Acesso Negado
        </h3>
        
        <p className="text-red-700 mb-4">
          {message}
        </p>
        
        {requiredRole && (
          <p className="text-sm text-red-600 mb-4">
            Permissão necessária: <span className="font-medium">{requiredRole}</span>
          </p>
        )}
        
        {showContactInfo && (
          <p className="text-sm text-red-600">
            Entre em contato com o administrador do sistema se você acredita que deveria ter acesso a esta funcionalidade.
          </p>
        )}
      </div>
    </div>
  );
}