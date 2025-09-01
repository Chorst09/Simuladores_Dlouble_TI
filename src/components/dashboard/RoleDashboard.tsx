import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { 
  Calculator, 
  FileText, 
  BarChart3, 
  Users, 
  Settings, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface DashboardCard {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  stats?: {
    value: string | number;
    label: string;
    trend?: 'up' | 'down' | 'neutral';
  };
}

export function RoleDashboard() {
  const { user } = useAuth();
  const roleAccess = useRoleAccess();

  if (!user) return null;

  const getDashboardCards = (): DashboardCard[] => {
    switch (user.role) {
      case 'admin':
        return [
          {
            title: 'Gerenciar Usuários',
            description: 'Criar, editar e gerenciar contas de usuário',
            href: '/admin/users',
            icon: Users,
            color: 'bg-blue-500',
            stats: {
              value: '12',
              label: 'Usuários ativos',
              trend: 'up'
            }
          },
          {
            title: 'Relatórios Completos',
            description: 'Visualizar métricas e relatórios detalhados',
            href: '/reports',
            icon: BarChart3,
            color: 'bg-green-500',
            stats: {
              value: '45',
              label: 'Propostas este mês',
              trend: 'up'
            }
          },
          {
            title: 'Configurações do Sistema',
            description: 'Configurar parâmetros e preferências',
            href: '/admin/settings',
            icon: Settings,
            color: 'bg-purple-500'
          },
          {
            title: 'Todas as Propostas',
            description: 'Visualizar e gerenciar todas as propostas',
            href: '/proposals/all',
            icon: FileText,
            color: 'bg-indigo-500',
            stats: {
              value: '128',
              label: 'Total de propostas',
              trend: 'neutral'
            }
          }
        ];

      case 'diretor':
        return [
          {
            title: 'Relatórios Executivos',
            description: 'Métricas de desempenho e análises',
            href: '/reports',
            icon: BarChart3,
            color: 'bg-green-500',
            stats: {
              value: 'R$ 2.4M',
              label: 'Vendas este mês',
              trend: 'up'
            }
          },
          {
            title: 'Todas as Propostas',
            description: 'Supervisionar propostas da equipe',
            href: '/proposals/all',
            icon: FileText,
            color: 'bg-blue-500',
            stats: {
              value: '23',
              label: 'Propostas pendentes',
              trend: 'neutral'
            }
          },
          {
            title: 'Calculadoras',
            description: 'Ferramentas de cálculo e cotação',
            href: '/calculators',
            icon: Calculator,
            color: 'bg-indigo-500'
          },
          {
            title: 'Análise de Performance',
            description: 'Acompanhar performance da equipe',
            href: '/reports/performance',
            icon: TrendingUp,
            color: 'bg-orange-500',
            stats: {
              value: '87%',
              label: 'Taxa de conversão',
              trend: 'up'
            }
          }
        ];

      case 'user':
        return [
          {
            title: 'Calculadoras',
            description: 'Criar novas propostas e cotações',
            href: '/calculators',
            icon: Calculator,
            color: 'bg-indigo-500',
            stats: {
              value: '5',
              label: 'Propostas este mês',
              trend: 'up'
            }
          },
          {
            title: 'Minhas Propostas',
            description: 'Visualizar e gerenciar suas propostas',
            href: '/proposals',
            icon: FileText,
            color: 'bg-blue-500',
            stats: {
              value: '12',
              label: 'Total de propostas',
              trend: 'neutral'
            }
          },
          {
            title: 'Propostas Pendentes',
            description: 'Propostas aguardando aprovação',
            href: '/proposals?status=pending',
            icon: Clock,
            color: 'bg-yellow-500',
            stats: {
              value: '3',
              label: 'Aguardando aprovação',
              trend: 'neutral'
            }
          },
          {
            title: 'Propostas Aprovadas',
            description: 'Propostas aprovadas e finalizadas',
            href: '/proposals?status=approved',
            icon: CheckCircle,
            color: 'bg-green-500',
            stats: {
              value: '8',
              label: 'Aprovadas',
              trend: 'up'
            }
          }
        ];

      default:
        return [];
    }
  };

  const cards = getDashboardCards();

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bem-vindo, {user.name}!
          </h2>
          <p className="text-gray-600">
            {getRoleWelcomeMessage(user.role)}
          </p>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          
          return (
            <Link
              key={index}
              href={card.href}
              className="group relative bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-md ${card.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                      {card.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {card.description}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                {card.stats && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-semibold text-gray-900">
                          {card.stats.value}
                        </p>
                        <p className="text-sm text-gray-500">
                          {card.stats.label}
                        </p>
                      </div>
                      {card.stats.trend && (
                        <div className={`flex items-center ${
                          card.stats.trend === 'up' 
                            ? 'text-green-600' 
                            : card.stats.trend === 'down' 
                            ? 'text-red-600' 
                            : 'text-gray-400'
                        }`}>
                          <TrendingUp className={`h-4 w-4 ${
                            card.stats.trend === 'down' ? 'rotate-180' : ''
                          }`} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats */}
      <QuickStats />
    </div>
  );
}

function getRoleWelcomeMessage(role: string): string {
  switch (role) {
    case 'admin':
      return 'Você tem acesso completo ao sistema. Gerencie usuários, visualize relatórios e configure o sistema.';
    case 'diretor':
      return 'Acompanhe o desempenho da equipe através de relatórios detalhados e supervisione todas as propostas.';
    case 'user':
      return 'Crie novas propostas usando as calculadoras e acompanhe o status das suas cotações.';
    default:
      return 'Bem-vindo ao sistema!';
  }
}

function QuickStats() {
  const { user } = useAuth();

  // Mock data - em produção, estes dados viriam de APIs
  const getStatsForRole = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { label: 'Usuários Ativos', value: '12', icon: Users, color: 'text-blue-600' },
          { label: 'Propostas Hoje', value: '8', icon: FileText, color: 'text-green-600' },
          { label: 'Alertas', value: '2', icon: AlertCircle, color: 'text-red-600' }
        ];
      case 'diretor':
        return [
          { label: 'Equipe Ativa', value: '8', icon: Users, color: 'text-blue-600' },
          { label: 'Meta do Mês', value: '78%', icon: TrendingUp, color: 'text-green-600' },
          { label: 'Pendências', value: '5', icon: Clock, color: 'text-yellow-600' }
        ];
      case 'user':
        return [
          { label: 'Propostas Ativas', value: '3', icon: FileText, color: 'text-blue-600' },
          { label: 'Aprovadas', value: '8', icon: CheckCircle, color: 'text-green-600' },
          { label: 'Em Análise', value: '2', icon: Clock, color: 'text-yellow-600' }
        ];
      default:
        return [];
    }
  };

  const stats = getStatsForRole();

  if (stats.length === 0) return null;

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Resumo Rápido
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="flex items-center">
                <Icon className={`h-8 w-8 ${stat.color}`} />
                <div className="ml-3">
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500">
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}