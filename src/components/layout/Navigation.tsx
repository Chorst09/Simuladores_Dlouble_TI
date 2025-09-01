import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { 
  Calculator, 
  FileText, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Home,
  Shield,
  Building
} from 'lucide-react';

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ('admin' | 'diretor' | 'user')[];
  description?: string;
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Início',
    href: '/',
    icon: Home,
    roles: ['admin', 'diretor', 'user'],
    description: 'Página inicial'
  },
  {
    label: 'Calculadoras',
    href: '/calculators',
    icon: Calculator,
    roles: ['admin', 'diretor', 'user'],
    description: 'Ferramentas de cálculo de propostas'
  },
  {
    label: 'Minhas Propostas',
    href: '/proposals',
    icon: FileText,
    roles: ['user'],
    description: 'Suas propostas criadas'
  },
  {
    label: 'Todas as Propostas',
    href: '/proposals/all',
    icon: FileText,
    roles: ['admin', 'diretor'],
    description: 'Visualizar todas as propostas'
  },
  {
    label: 'Relatórios',
    href: '/reports',
    icon: BarChart3,
    roles: ['admin', 'diretor'],
    description: 'Relatórios e métricas'
  },
  {
    label: 'Gerenciar Usuários',
    href: '/admin/users',
    icon: Users,
    roles: ['admin'],
    description: 'Administração de usuários'
  },
  {
    label: 'Painel Admin',
    href: '/admin',
    icon: Shield,
    roles: ['admin'],
    description: 'Painel administrativo'
  },
  {
    label: 'Configurações',
    href: '/admin/settings',
    icon: Settings,
    roles: ['admin'],
    description: 'Configurações do sistema'
  }
];

export function Navigation() {
  const { user, logout } = useAuth();
  const roleAccess = useRoleAccess();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filtrar itens de navegação baseado no role do usuário
  const visibleItems = navigationItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (!user) {
    return null; // Não mostrar navegação se não estiver logado
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-gray-900 lg:text-white">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo/Brand */}
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-800">
            <Building className="h-8 w-8 text-indigo-400" />
            <span className="ml-2 text-xl font-semibold">Sistema</span>
          </div>

          {/* User Info */}
          <div className="flex items-center px-4 py-3 bg-gray-800 border-b border-gray-700">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-gray-300 capitalize">{user.role}</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                  title={item.description}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="flex-shrink-0 p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
              Sair
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between h-16 px-4 bg-gray-900 text-white">
          <div className="flex items-center">
            <Building className="h-8 w-8 text-indigo-400" />
            <span className="ml-2 text-xl font-semibold">Sistema</span>
          </div>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleMobileMenu} />
            <div className="relative flex flex-col w-full max-w-xs bg-gray-900 text-white">
              {/* User Info */}
              <div className="flex items-center px-4 py-3 bg-gray-800 border-b border-gray-700">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-gray-300 capitalize">{user.role}</p>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={toggleMobileMenu}
                      className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                    >
                      <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Logout Button */}
              <div className="flex-shrink-0 p-4 border-t border-gray-700">
                <button
                  onClick={handleLogout}
                  className="group flex w-full items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                >
                  <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Componente para indicar o role do usuário
export function UserRoleIndicator() {
  const { user } = useAuth();

  if (!user) return null;

  const roleColors = {
    admin: 'bg-red-100 text-red-800 border-red-200',
    diretor: 'bg-blue-100 text-blue-800 border-blue-200',
    user: 'bg-green-100 text-green-800 border-green-200'
  };

  const roleLabels = {
    admin: 'Administrador',
    diretor: 'Diretor',
    user: 'Vendedor'
  };

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleColors[user.role]}`}>
      <Shield className="w-3 h-3 mr-1" />
      {roleLabels[user.role]}
    </div>
  );
}