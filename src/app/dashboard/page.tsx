'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { User } from '@/lib/auth';
import { Proposal } from '@/types';
import DashboardView from '@/components/dashboard/DashboardView';
import { useAuth } from '@/hooks/use-auth';
import { Eye, Edit, Trash2, Phone, Server, Wifi, Radio } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {
    fetchUser();
    fetchProposals();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchProposals = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/proposals', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        // Pegar apenas as 10 propostas mais recentes
        setProposals(data.slice(0, 10));
      }
    } catch (error) {
      console.error('Erro ao buscar propostas:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('auth-token');
      router.push('/login');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PABX_SIP':
        return <Phone className="w-4 h-4 text-blue-500" />;
      case 'VM':
        return <Server className="w-4 h-4 text-purple-500" />;
      case 'FIBER':
      case 'FIBER_LINK':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'RADIO':
        return <Radio className="w-4 h-4 text-orange-500" />;
      default:
        return <Server className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'PABX_SIP':
        return 'PABX/SIP';
      case 'VM':
        return 'Máquinas Virtuais';
      case 'FIBER':
      case 'FIBER_LINK':
        return 'Internet Fibra';
      case 'RADIO':
        return 'Internet Rádio';
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'rascunho':
        return <Badge variant="secondary">Rascunho</Badge>;
      case 'enviado':
        return <Badge variant="default">Enviado</Badge>;
      case 'aprovado':
        return <Badge variant="default" className="bg-green-600">Aprovado</Badge>;
      case 'rejeitado':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900/80 border-b border-slate-800 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400 mt-1">
              Bem-vindo, {user?.name} - {user?.role === 'admin' ? 'Administrador' : user?.role === 'diretor' ? 'Diretor' : 'Usuário'}
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
            Sair
          </Button>
        </div>
      </div>

      {/* Dashboard com gráficos */}
      {user && <DashboardView userId={user.id} />}

      {/* Lista de Propostas Recentes */}
      <div className="p-6">
        <Card className="bg-slate-900/80 border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Propostas Recentes
            </CardTitle>
            <CardDescription className="text-slate-400">
              Suas 10 propostas mais recentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {proposals.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Server className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma proposta encontrada</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Tipo</TableHead>
                    <TableHead className="text-slate-300">Cliente</TableHead>
                    <TableHead className="text-slate-300">Número</TableHead>
                    <TableHead className="text-slate-300">Valor</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Data</TableHead>
                    <TableHead className="text-slate-300">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proposals.map((proposal) => (
                    <TableRow key={proposal.id} className="border-slate-700 hover:bg-slate-800/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(proposal.type)}
                          <span className="text-sm">{getTypeName(proposal.type)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {proposal.clientData?.name || proposal.clientData?.companyName || 'N/A'}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {proposal.proposalNumber || proposal.id?.slice(0, 8)}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {formatCurrency(proposal.totalMonthly || proposal.totalValue || 0)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(proposal.status || 'rascunho')}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {formatDate(proposal.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}