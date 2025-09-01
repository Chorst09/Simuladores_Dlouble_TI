import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AccessDeniedPage } from './AccessDeniedPage';

interface ProtectedRouteProps {
  allowedRoles: ('admin' | 'diretor' | 'user')[];
  children: React.ReactNode;
  redirectTo?: string;
  showAccessDenied?: boolean;
  requiredRole?: string;
}

/**
 * Componente para proteger rotas inteiras baseado em roles
 * Pode redirecionar ou mostrar página de acesso negado
 */
export function ProtectedRoute({ 
  allowedRoles, 
  children, 
  redirectTo,
  showAccessDenied = true,
  requiredRole
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se ainda está carregando, não faz nada
    if (isLoading) return;

    // Se não está autenticado, redireciona para login
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Se tem usuário mas não tem permissão
    if (user && !allowedRoles.includes(user.role)) {
      if (redirectTo) {
        router.push(redirectTo);
      }
      // Se não tem redirectTo, vai mostrar a página de acesso negado
    }
  }, [user, isLoading, isAuthenticated, allowedRoles, redirectTo, router]);

  // Enquanto carrega, mostra loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Se não está autenticado, não mostra nada (vai redirecionar)
  if (!isAuthenticated) {
    return null;
  }

  // Se não tem permissão
  if (user && !allowedRoles.includes(user.role)) {
    if (redirectTo) {
      return null; // Vai redirecionar
    }
    
    if (showAccessDenied) {
      return (
        <AccessDeniedPage 
          requiredRole={requiredRole || allowedRoles.join(' ou ')}
        />
      );
    }
    
    return null;
  }

  // Se chegou até aqui, tem permissão
  return <>{children}</>;
}

/**
 * HOC para proteger páginas
 */
export function withRoleProtection(
  Component: React.ComponentType,
  allowedRoles: ('admin' | 'diretor' | 'user')[],
  options?: {
    redirectTo?: string;
    showAccessDenied?: boolean;
    requiredRole?: string;
  }
) {
  return function ProtectedComponent(props: any) {
    return (
      <ProtectedRoute 
        allowedRoles={allowedRoles}
        redirectTo={options?.redirectTo}
        showAccessDenied={options?.showAccessDenied}
        requiredRole={options?.requiredRole}
      >
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * Componentes específicos para cada tipo de proteção
 */
export function AdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'allowedRoles'>) {
  return (
    <ProtectedRoute allowedRoles={['admin']} requiredRole="Administrador" {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function DirectorRoute({ children, ...props }: Omit<ProtectedRouteProps, 'allowedRoles'>) {
  return (
    <ProtectedRoute allowedRoles={['diretor']} requiredRole="Diretor" {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function DirectorOrAdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'allowedRoles'>) {
  return (
    <ProtectedRoute allowedRoles={['admin', 'diretor']} requiredRole="Diretor ou Administrador" {...props}>
      {children}
    </ProtectedRoute>
  );
}