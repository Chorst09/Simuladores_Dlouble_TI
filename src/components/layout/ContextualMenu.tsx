import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { 
  MoreVertical, 
  Plus, 
  Download, 
  Upload, 
  Settings, 
  Users, 
  FileText, 
  BarChart3,
  Calculator,
  Shield
} from 'lucide-react';

interface ContextualAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon: React.ComponentType<{ className?: string }>;
  roles: ('admin' | 'diretor' | 'user')[];
  variant?: 'default' | 'primary' | 'danger';
}

interface ContextualMenuProps {
  actions?: ContextualAction[];
  context?: 'proposals' | 'users' | 'reports' | 'calculators' | 'admin';
}

// Ações predefinidas por contexto
const contextActions: Record<string, ContextualAction[]> = {
  proposals: [
    {
      label: 'Nova Proposta',
      href: '/proposals/new',
      icon: Plus,
      roles: ['admin', 'diretor', 'user'],
      variant: 'primary'
    },
    {
      label: 'Exportar Propostas',
      onClick: () => console.log('Exportar propostas'),
      icon: Download,
      roles: ['admin', 'diretor']
    },
    {
      label: 'Importar Propostas',
      onClick: () => console.log('Importar propostas'),
      icon: Upload,
      roles: ['admin']
    }
  ],
  users: [
    {
      label: 'Novo Usuário',
      href: '/admin/users/new',
      icon: Plus,
      roles: ['admin'],
      variant: 'primary'
    },
    {
      label: 'Exportar Usuários',
      onClick: () => console.log('Exportar usuários'),
      icon: Download,
      roles: ['admin']
    },
    {
      label: 'Configurações de Usuário',
      href: '/admin/users/settings',
      icon: Settings,
      roles: ['admin']
    }
  ],
  reports: [
    {
      label: 'Novo Relatório',
      onClick: () => console.log('Novo relatório'),
      icon: Plus,
      roles: ['admin', 'diretor'],
      variant: 'primary'
    },
    {
      label: 'Exportar Dados',
      onClick: () => console.log('Exportar dados'),
      icon: Download,
      roles: ['admin', 'diretor']
    },
    {
      label: 'Configurar Relatórios',
      href: '/admin/reports/settings',
      icon: Settings,
      roles: ['admin']
    }
  ],
  calculators: [
    {
      label: 'Nova Calculadora',
      href: '/calculators/new',
      icon: Plus,
      roles: ['admin'],
      variant: 'primary'
    },
    {
      label: 'Configurar Calculadoras',
      href: '/admin/calculators/settings',
      icon: Settings,
      roles: ['admin']
    }
  ],
  admin: [
    {
      label: 'Gerenciar Usuários',
      href: '/admin/users',
      icon: Users,
      roles: ['admin']
    },
    {
      label: 'Ver Relatórios',
      href: '/reports',
      icon: BarChart3,
      roles: ['admin']
    },
    {
      label: 'Configurações do Sistema',
      href: '/admin/settings',
      icon: Settings,
      roles: ['admin']
    }
  ]
};

export function ContextualMenu({ actions, context }: ContextualMenuProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Usar ações do contexto se não foram fornecidas ações customizadas
  const menuActions = actions || (context ? contextActions[context] || [] : []);

  // Filtrar ações baseado no role do usuário
  const visibleActions = menuActions.filter(action => 
    user && action.roles.includes(user.role)
  );

  if (visibleActions.length === 0) {
    return null;
  }

  const getVariantClasses = (variant: string = 'default') => {
    switch (variant) {
      case 'primary':
        return 'text-indigo-700 hover:bg-indigo-50';
      case 'danger':
        return 'text-red-700 hover:bg-red-50';
      default:
        return 'text-gray-700 hover:bg-gray-50';
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center p-2 text-gray-400 bg-white rounded-full hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 z-20 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              {visibleActions.map((action, index) => {
                const Icon = action.icon;
                const classes = `group flex items-center px-4 py-2 text-sm ${getVariantClasses(action.variant)} transition-colors duration-200`;

                if (action.href) {
                  return (
                    <Link
                      key={index}
                      href={action.href}
                      className={classes}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="mr-3 h-4 w-4" />
                      {action.label}
                    </Link>
                  );
                }

                return (
                  <button
                    key={index}
                    onClick={() => {
                      action.onClick?.();
                      setIsOpen(false);
                    }}
                    className={`${classes} w-full text-left`}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Componente de ações rápidas baseado no role
export function QuickActions() {
  const { user } = useAuth();
  const roleAccess = useRoleAccess();

  if (!user) return null;

  const getQuickActions = () => {
    const actions: ContextualAction[] = [];

    // Ações para todos os usuários
    actions.push({
      label: 'Nova Proposta',
      href: '/calculators',
      icon: Calculator,
      roles: ['admin', 'diretor', 'user'],
      variant: 'primary'
    });

    // Ações para diretores e admins
    if (roleAccess.canAccessReports) {
      actions.push({
        label: 'Ver Relatórios',
        href: '/reports',
        icon: BarChart3,
        roles: ['admin', 'diretor']
      });
    }

    // Ações apenas para admins
    if (roleAccess.canManageUsers) {
      actions.push({
        label: 'Gerenciar Usuários',
        href: '/admin/users',
        icon: Users,
        roles: ['admin']
      });
    }

    if (roleAccess.canAccessAdmin) {
      actions.push({
        label: 'Painel Admin',
        href: '/admin',
        icon: Shield,
        roles: ['admin']
      });
    }

    return actions;
  };

  const quickActions = getQuickActions().filter(action => 
    action.roles.includes(user.role)
  );

  return (
    <div className="flex flex-wrap gap-2">
      {quickActions.map((action, index) => {
        const Icon = action.icon;
        const isPrimary = action.variant === 'primary';
        
        const buttonClasses = isPrimary
          ? 'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          : 'inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500';

        if (action.href) {
          return (
            <Link
              key={index}
              href={action.href}
              className={buttonClasses}
            >
              <Icon className="mr-2 h-4 w-4" />
              {action.label}
            </Link>
          );
        }

        return (
          <button
            key={index}
            onClick={action.onClick}
            className={buttonClasses}
          >
            <Icon className="mr-2 h-4 w-4" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}