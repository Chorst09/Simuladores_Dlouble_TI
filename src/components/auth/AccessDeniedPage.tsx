import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AccessDeniedPageProps {
  requiredRole?: string;
  message?: string;
  showBackButton?: boolean;
}

export function AccessDeniedPage({ 
  requiredRole,
  message = "Você não tem permissão para acessar esta página.",
  showBackButton = true 
}: AccessDeniedPageProps) {
  const router = useRouter();
  const { user } = useAuth();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    // Redirecionar para página apropriada baseada no role
    switch (user?.role) {
      case 'admin':
        router.push('/admin');
        break;
      case 'diretor':
        router.push('/reports');
        break;
      case 'user':
        router.push('/calculators');
        break;
      default:
        router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Ícone de acesso negado */}
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100">
            <svg 
              className="h-12 w-12 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" 
              />
            </svg>
          </div>

          {/* Título */}
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Acesso Negado
          </h2>

          {/* Mensagem */}
          <p className="mt-2 text-sm text-gray-600">
            {message}
          </p>

          {/* Role necessário */}
          {requiredRole && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Permissão necessária:</span> {requiredRole}
              </p>
            </div>
          )}

          {/* Informações do usuário atual */}
          {user && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Usuário atual:</span> {user.name} ({user.role})
              </p>
            </div>
          )}

          {/* Botões de ação */}
          <div className="mt-6 space-y-3">
            {showBackButton && (
              <button
                onClick={handleGoBack}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Voltar
              </button>
            )}
            
            <button
              onClick={handleGoHome}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Ir para Página Inicial
            </button>
          </div>

          {/* Informações de contato */}
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-xs text-gray-600">
              Se você acredita que deveria ter acesso a esta funcionalidade, 
              entre em contato com o administrador do sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}