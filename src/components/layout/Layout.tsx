import React from 'react';
import { Navigation, UserRoleIndicator } from './Navigation';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showRoleIndicator?: boolean;
}

export function Layout({ children, title, showRoleIndicator = true }: LayoutProps) {
  const { user, isLoading } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Se não há usuário, não mostrar o layout (será redirecionado)
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Page Title */}
              <div className="flex items-center">
                {title && (
                  <h1 className="text-xl font-semibold text-gray-900">
                    {title}
                  </h1>
                )}
              </div>

              {/* Right Side - Role Indicator */}
              <div className="flex items-center space-x-4">
                {showRoleIndicator && <UserRoleIndicator />}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Layout específico para páginas de administração
export function AdminLayout({ children, title }: Omit<LayoutProps, 'showRoleIndicator'>) {
  return (
    <Layout title={title || 'Painel Administrativo'} showRoleIndicator={true}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </Layout>
  );
}

// Layout específico para relatórios
export function ReportsLayout({ children, title }: Omit<LayoutProps, 'showRoleIndicator'>) {
  return (
    <Layout title={title || 'Relatórios'} showRoleIndicator={true}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </Layout>
  );
}

// Layout específico para calculadoras
export function CalculatorLayout({ children, title }: Omit<LayoutProps, 'showRoleIndicator'>) {
  return (
    <Layout title={title || 'Calculadoras'} showRoleIndicator={false}>
      <div className="max-w-6xl mx-auto">
        {children}
      </div>
    </Layout>
  );
}