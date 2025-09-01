import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
}

export function Breadcrumb({ items = [], showHome = true }: BreadcrumbProps) {
  const { user } = useAuth();
  const roleAccess = useRoleAccess();
  const router = useRouter();

  // Determinar página inicial baseada no role
  const getHomePath = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'diretor':
        return '/reports';
      case 'user':
        return '/calculators';
      default:
        return '/';
    }
  };

  const homeItem: BreadcrumbItem = {
    label: 'Início',
    href: getHomePath()
  };

  const allItems = showHome ? [homeItem, ...items] : items;

  if (allItems.length === 0) {
    return null;
  }

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isCurrent = item.current || isLast;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="flex-shrink-0 h-4 w-4 text-gray-400 mx-2" />
              )}
              
              {item.href && !isCurrent ? (
                <Link
                  href={item.href}
                  className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  {index === 0 && showHome ? (
                    <div className="flex items-center">
                      <Home className="h-4 w-4 mr-1" />
                      {item.label}
                    </div>
                  ) : (
                    item.label
                  )}
                </Link>
              ) : (
                <span className={`text-sm font-medium ${
                  isCurrent 
                    ? 'text-gray-900' 
                    : 'text-gray-500'
                }`}>
                  {index === 0 && showHome ? (
                    <div className="flex items-center">
                      <Home className="h-4 w-4 mr-1" />
                      {item.label}
                    </div>
                  ) : (
                    item.label
                  )}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Hook para gerar breadcrumbs automaticamente baseado na rota
export function useBreadcrumb() {
  const router = useRouter();
  const { user } = useAuth();
  const roleAccess = useRoleAccess();

  const generateBreadcrumb = (pathname: string): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [];

    // Mapear segmentos para labels legíveis
    const segmentLabels: Record<string, string> = {
      'admin': 'Administração',
      'users': 'Usuários',
      'settings': 'Configurações',
      'reports': 'Relatórios',
      'proposals': 'Propostas',
      'calculators': 'Calculadoras',
      'all': 'Todas',
      'new': 'Novo',
      'edit': 'Editar'
    };

    let currentPath = '';
    
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      
      // Verificar se o usuário tem acesso a este segmento
      const hasAccess = checkSegmentAccess(segment, user?.role);
      
      if (hasAccess) {
        items.push({
          label: segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
          href: isLast ? undefined : currentPath,
          current: isLast
        });
      }
    });

    return items;
  };

  return { generateBreadcrumb };
}

// Verificar se o usuário tem acesso a um segmento específico
function checkSegmentAccess(segment: string, userRole?: string): boolean {
  if (!userRole) return false;

  const accessMap: Record<string, string[]> = {
    'admin': ['admin'],
    'users': ['admin'],
    'settings': ['admin'],
    'reports': ['admin', 'diretor'],
    'proposals': ['admin', 'diretor', 'user'],
    'calculators': ['admin', 'diretor', 'user'],
    'all': ['admin', 'diretor']
  };

  const allowedRoles = accessMap[segment];
  return !allowedRoles || allowedRoles.includes(userRole);
}

// Componente de breadcrumb específico para diferentes seções
export function AdminBreadcrumb({ items = [] }: { items?: BreadcrumbItem[] }) {
  const adminItems: BreadcrumbItem[] = [
    { label: 'Administração', href: '/admin' },
    ...items
  ];

  return <Breadcrumb items={adminItems} />;
}

export function ReportsBreadcrumb({ items = [] }: { items?: BreadcrumbItem[] }) {
  const reportsItems: BreadcrumbItem[] = [
    { label: 'Relatórios', href: '/reports' },
    ...items
  ];

  return <Breadcrumb items={reportsItems} />;
}

export function ProposalsBreadcrumb({ items = [] }: { items?: BreadcrumbItem[] }) {
  const proposalsItems: BreadcrumbItem[] = [
    { label: 'Propostas', href: '/proposals' },
    ...items
  ];

  return <Breadcrumb items={proposalsItems} />;
}