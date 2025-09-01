"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Server, Cpu, HardDrive, MemoryStick, Network,
  Calculator, Save, Download, RefreshCw, Search,
  TrendingUp, DollarSign, Clock, Zap, FileText,
  Brain, Plus, Trash2, Edit, Eye, ArrowLeft,
  Building, Settings, PieChart
} from 'lucide-react';

interface VMConfig {
  id: string;
  name: string;
  vcpu: number;
  ram: number;
  storageType: string;
  storageSize: number;
  networkCard: string;
  os: string;
  backupSize: number;
  additionalIP: boolean;
  additionalSnapshot: boolean;
  vpnSiteToSite: boolean;
  quantity: number;
}

interface NegotiationRound {
  id: string;
  roundNumber: number;
  date: string;
  description: string;
  discount: number;
  vms: VMConfig[];
  originalPrice: number;
  totalPrice: number;
  status: 'active' | 'accepted' | 'rejected';
}

interface Proposal {
  id: string;
  proposalNumber: string;
  name: string;
  clientName: string;
  date: string;
  vms: VMConfig[];
  totalPrice: number;
  negotiationRounds: NegotiationRound[];
  currentRound: number;
}

interface TaxConfig {
  pisCofins: number;
  iss: number;
  csllIr: number;
}

interface PricingConfig {
  vcpuPerCore: number;
  ramPerGB: number;
  storagePerGB: {
    'HDD SAS': number;
    'SSD SATA': number;
    'SSD NVMe': number;
  };
  networkPerGbps: number;
  osLicense: {
    'Linux': number;
    'Windows Server': number;
    'FreeBSD': number;
    'Custom': number;
  };
  backupPerGB: number;
  additionalIP: number;
  additionalSnapshot: number;
  vpnSiteToSite: number;
  taxes: {
    'Lucro Real': TaxConfig;
    'Lucro Presumido': TaxConfig;
    'Lucro Real Reduzido': TaxConfig;
    'Simples Nacional': TaxConfig;
  };
  markup: number;
  netMargin: number;
  commission: number;
  selectedTaxRegime: string;
  storageCosts: {
    'HDD SAS': number;
    'NVMe': number;
    'SSD Performance': number;
  };
  networkCosts: {
    '1 Gbps': number;
    '10 Gbps': number;
  };
  contractDiscounts: {
    '12': number;
    '24': number;
    '36': number;
    '48': number;
    '60': number;
  };
  setupFee: number;
  managementSupport: number;
}

interface VMCalculatorProps {
  onSave: (proposal: Proposal) => void;
  onCancel: () => void;
  proposalToEdit?: Proposal | null;
}

const VMCalculator: React.FC<VMCalculatorProps> = ({ onSave, onCancel, proposalToEdit }) => {
  const [currentVM, setCurrentVM] = useState<VMConfig>({
    id: '',
    name: '',
    vcpu: 2,
    ram: 4,
    storageType: 'HDD SAS',
    storageSize: 100,
    networkCard: '1 Gbps',
    os: 'Linux',
    backupSize: 0,
    additionalIP: false,
    additionalSnapshot: false,
    vpnSiteToSite: false,
    quantity: 1
  });

  const [currentProposal, setCurrentProposal] = useState<Proposal>({
    id: '',
    proposalNumber: '',
    name: '',
    clientName: '',
    date: new Date().toISOString(),
    vms: [],
    totalPrice: 0,
    negotiationRounds: [],
    currentRound: 0
  });

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [viewMode, setViewMode] = useState<'search' | 'create' | 'edit'>('search');
  const [activeTab, setActiveTab] = useState<'config' | 'summary' | 'negotiations' | 'settings'>('config');
  const [searchTerm, setSearchTerm] = useState('');
  const [proposalSearchTerm, setProposalSearchTerm] = useState('');

  // Configurações de preços
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>({
    vcpuPerCore: 50,
    ramPerGB: 30,
    storagePerGB: {
      'HDD SAS': 0.3,
      'SSD SATA': 0.8,
      'SSD NVMe': 1.2
    },
    networkPerGbps: 20,
    osLicense: {
      'Linux': 0,
      'Windows Server': 200,
      'FreeBSD': 0,
      'Custom': 100
    },
    backupPerGB: 0.1,
    additionalIP: 50,
    additionalSnapshot: 25,
    vpnSiteToSite: 150,
    taxes: {
      'Lucro Real': { pisCofins: 9.25, iss: 5, csllIr: 34 },
      'Lucro Presumido': { pisCofins: 3.65, iss: 5, csllIr: 15 },
      'Lucro Real Reduzido': { pisCofins: 9.25, iss: 2, csllIr: 15.25 },
      'Simples Nacional': { pisCofins: 0, iss: 0, csllIr: 6 }
    },
    markup: 100,
    netMargin: 0,
    commission: 5,
    selectedTaxRegime: 'Lucro Presumido',
    storageCosts: {
      'HDD SAS': 0.15,
      'NVMe': 0.6,
      'SSD Performance': 0.4
    },
    networkCosts: {
      '1 Gbps': 10,
      '10 Gbps': 100
    },
    contractDiscounts: {
      '12': 5,
      '24': 10,
      '36': 15,
      '48': 20,
      '60': 25
    },
    setupFee: 500,
    managementSupport: 200
  });

  // Função para gerar número da proposta automaticamente
  const generateProposalNumber = (): string => {
    const existingProposalsThisYear = proposals.filter(p => 
      new Date(p.date).getFullYear() === new Date().getFullYear()
    );
    const nextNumber = existingProposalsThisYear.length + 1;
    const year = new Date().getFullYear();
    return `Prop_MV_${nextNumber.toString().padStart(4, '0')}/${year}`;
  };

  // Função para calcular preço de uma VM
  const calculateVMPrice = (vm: VMConfig): number => {
    const vcpuCost = vm.vcpu * pricingConfig.vcpuPerCore;
    const ramCost = vm.ram * pricingConfig.ramPerGB;
    const storageCost = vm.storageSize * pricingConfig.storagePerGB[vm.storageType as keyof typeof pricingConfig.storagePerGB];
    const networkCost = pricingConfig.networkPerGbps;
    const osCost = pricingConfig.osLicense[vm.os as keyof typeof pricingConfig.osLicense];
    const backupCost = vm.backupSize * pricingConfig.backupPerGB;
    const additionalIPCost = vm.additionalIP ? pricingConfig.additionalIP : 0;
    const additionalSnapshotCost = vm.additionalSnapshot ? pricingConfig.additionalSnapshot : 0;
    const vpnCost = vm.vpnSiteToSite ? pricingConfig.vpnSiteToSite : 0;

    return vcpuCost + ramCost + storageCost + networkCost + osCost + backupCost + additionalIPCost + additionalSnapshotCost + vpnCost;
  };

  // Calcular preço total
  const calculateTotalPrice = useMemo(() => {
    return currentProposal.vms.reduce((total, vm) => {
      return total + (calculateVMPrice(vm) * vm.quantity);
    }, 0);
  }, [currentProposal.vms, pricingConfig]);

  // Buscar propostas da API
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        const response = await fetch('/api/proposals?type=VM', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setProposals(data);
        }
      } catch (error) {
        console.error('Erro ao buscar propostas:', error);
      }
    };

    fetchProposals();
  }, []);

  // Filtrar propostas
  const filteredProposals = proposals.filter(proposal =>
    proposal.name.toLowerCase().includes(proposalSearchTerm.toLowerCase()) ||
    proposal.clientName.toLowerCase().includes(proposalSearchTerm.toLowerCase()) ||
    proposal.proposalNumber.toLowerCase().includes(proposalSearchTerm.toLowerCase())
  );

  // Funções de gerenciamento de propostas
  const createNewProposal = () => {
    setCurrentProposal({
      id: `proposal-${Date.now()}`,
      proposalNumber: generateProposalNumber(),
      name: '',
      clientName: '',
      date: new Date().toISOString(),
      vms: [],
      totalPrice: 0,
      negotiationRounds: [],
      currentRound: 0
    });
    setViewMode('create');
    setActiveTab('config');
  };

  const editProposal = (proposal: Proposal) => {
    setCurrentProposal(proposal);
    setViewMode('edit');
    setActiveTab('config');
  };

  const cancelAction = () => {
    setViewMode('search');
    setCurrentProposal({
      id: '',
      proposalNumber: '',
      name: '',
      clientName: '',
      date: new Date().toISOString(),
      vms: [],
      totalPrice: 0,
      negotiationRounds: [],
      currentRound: 0
    });
    setActiveTab('config');
  };

  const deleteProposal = (proposalId: string) => {
    if (confirm('Tem certeza que deseja excluir esta proposta?')) {
      setProposals(prev => prev.filter(p => p.id !== proposalId));
    }
  };

  const saveProposal = async () => {
    if (!currentProposal.clientName || !currentProposal.name) {
      alert('Por favor, preencha o nome do cliente e o nome da proposta.');
      return;
    }

    if (currentProposal.vms.length === 0) {
      alert('Por favor, adicione pelo menos uma VM à proposta');
      return;
    }

    const proposal: Proposal = {
      id: currentProposal.id || `proposal-${Date.now()}`,
      proposalNumber: currentProposal.proposalNumber || generateProposalNumber(),
      clientName: currentProposal.clientName || '',
      name: currentProposal.name || '',
      date: new Date().toISOString(),
      vms: currentProposal.vms,
      totalPrice: calculateTotalPrice,
      negotiationRounds: currentProposal.negotiationRounds || [],
      currentRound: currentProposal.currentRound || 0
    };

    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(proposal),
      });

      if (response.ok) {
        const savedProposal = await response.json();
        
        // Recarregar propostas
        const fetchResponse = await fetch('/api/proposals?type=VM', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (fetchResponse.ok) {
          const data = await fetchResponse.json();
          setProposals(data);
        }

        // Reset form and go back to search view
        setCurrentProposal({
          id: '',
          proposalNumber: '',
          name: '',
          clientName: '',
          date: new Date().toISOString(),
          vms: [],
          totalPrice: 0,
          negotiationRounds: [],
          currentRound: 0
        });
        setActiveTab('config');
        setViewMode('search');

        alert('Proposta salva com sucesso!');
      } else {
        const errorData = await response.json();
        alert(`Erro ao salvar proposta: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao salvar proposta:', error);
      alert('Erro ao salvar proposta. Tente novamente.');
    }
  };

  const addVMToProposal = () => {
    if (!currentVM.name) {
      alert('Por favor, insira um nome para a VM');
      return;
    }

    const newVM: VMConfig = {
      ...currentVM,
      id: `vm-${Date.now()}`
    };

    setCurrentProposal(prev => ({
      ...prev,
      vms: [...prev.vms, newVM]
    }));

    // Reset current VM
    setCurrentVM({
      id: '',
      name: '',
      vcpu: 2,
      ram: 4,
      storageType: 'HDD SAS',
      storageSize: 100,
      networkCard: '1 Gbps',
      os: 'Linux',
      backupSize: 0,
      additionalIP: false,
      additionalSnapshot: false,
      vpnSiteToSite: false,
      quantity: 1
    });
  };

  const removeVMFromProposal = (vmId: string) => {
    setCurrentProposal(prev => ({
      ...prev,
      vms: prev.vms.filter(vm => vm.id !== vmId)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 relative" style={{
      backgroundImage: 'url(https://img.freepik.com/premium-photo/corridor-data-center-server-room-server-room-internet-communication-networks-ai-generativex9_28914-4589.jpg?w=1380)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Overlay para melhorar legibilidade */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>

      {/* Conteúdo */}
      <div className="relative z-10">
        {/* Search View */}
        {viewMode === 'search' && (
          <div className="container mx-auto p-4 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">Buscar Propostas - VM</h1>
                <p className="text-slate-300 mt-2">Encontre propostas existentes ou crie uma nova.</p>
              </div>
              <Button onClick={createNewProposal} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova Proposta
              </Button>
            </div>

            {/* Search Input */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar por cliente ou ID..."
                    value={proposalSearchTerm}
                    onChange={(e) => setProposalSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Proposals Table */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Propostas</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredProposals.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-600">
                          <th className="text-left py-3 px-4 text-slate-300">ID</th>
                          <th className="text-left py-3 px-4 text-slate-300">Cliente</th>
                          <th className="text-left py-3 px-4 text-slate-300">Data</th>
                          <th className="text-left py-3 px-4 text-slate-300">Total Mensal</th>
                          <th className="text-left py-3 px-4 text-slate-300">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProposals.map((proposal) => (
                          <tr key={proposal.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                            <td className="py-3 px-4 text-white">{proposal.proposalNumber}</td>
                            <td className="py-3 px-4 text-white">{proposal.clientName}</td>
                            <td className="py-3 px-4 text-slate-300">
                              {new Date(proposal.date).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="py-3 px-4 text-green-400 font-semibold">
                              R$ {proposal.totalPrice.toFixed(2)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => editProposal(proposal)}
                                  className="border-slate-600 text-white hover:bg-slate-600"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteProposal(proposal.id)}
                                  className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                    <h3 className="text-lg font-semibold text-white mb-2">Nenhuma proposta encontrada</h3>
                    <p className="text-slate-400">Clique em "Nova Proposta" para começar.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create/Edit View */}
        {(viewMode === 'create' || viewMode === 'edit') && (
          <div className="container mx-auto p-4 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {viewMode === 'create' ? 'Nova Proposta' : 'Editar Proposta'}
                </h1>
                <p className="text-slate-300 mt-2">Configure as VMs e detalhes da proposta.</p>
              </div>
              <Button onClick={cancelAction} variant="outline" className="border-slate-600 text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>

            {/* Proposal Basic Info */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Informações da Proposta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="proposalName" className="text-white">Nome da Proposta</Label>
                    <Input
                      id="proposalName"
                      value={currentProposal.name}
                      onChange={(e) => setCurrentProposal(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Digite o nome da proposta"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientName" className="text-white">Nome do Cliente</Label>
                    <Input
                      id="clientName"
                      value={currentProposal.clientName}
                      onChange={(e) => setCurrentProposal(prev => ({ ...prev, clientName: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Digite o nome do cliente"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* VM Configuration */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Configuração de VM</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="vmName" className="text-white">Nome da VM</Label>
                    <Input
                      id="vmName"
                      value={currentVM.name}
                      onChange={(e) => setCurrentVM(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Nome da VM"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vcpu" className="text-white">vCPU</Label>
                    <Input
                      id="vcpu"
                      type="number"
                      value={currentVM.vcpu}
                      onChange={(e) => setCurrentVM(prev => ({ ...prev, vcpu: parseInt(e.target.value) || 0 }))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ram" className="text-white">RAM (GB)</Label>
                    <Input
                      id="ram"
                      type="number"
                      value={currentVM.ram}
                      onChange={(e) => setCurrentVM(prev => ({ ...prev, ram: parseInt(e.target.value) || 0 }))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="storageType" className="text-white">Tipo de Storage</Label>
                    <Select
                      value={currentVM.storageType}
                      onValueChange={(value) => setCurrentVM(prev => ({ ...prev, storageType: value }))}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HDD SAS">HDD SAS</SelectItem>
                        <SelectItem value="SSD SATA">SSD SATA</SelectItem>
                        <SelectItem value="SSD NVMe">SSD NVMe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="storageSize" className="text-white">Storage (GB)</Label>
                    <Input
                      id="storageSize"
                      type="number"
                      value={currentVM.storageSize}
                      onChange={(e) => setCurrentVM(prev => ({ ...prev, storageSize: parseInt(e.target.value) || 0 }))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity" className="text-white">Quantidade</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={currentVM.quantity}
                      onChange={(e) => setCurrentVM(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <Button onClick={addVMToProposal} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar VM
                </Button>
              </CardContent>
            </Card>

            {/* VMs List */}
            {currentProposal.vms.length > 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">VMs da Proposta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentProposal.vms.map((vm) => (
                      <div key={vm.id} className="border border-slate-600 rounded-lg p-4 bg-slate-700">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-white">{vm.name}</h5>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeVMFromProposal(vm.id)}
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
                          <div>
                            <span className="text-slate-400">vCPU:</span> {vm.vcpu}
                          </div>
                          <div>
                            <span className="text-slate-400">RAM:</span> {vm.ram}GB
                          </div>
                          <div>
                            <span className="text-slate-400">Storage:</span> {vm.storageSize}GB {vm.storageType}
                          </div>
                          <div>
                            <span className="text-slate-400">Qtd:</span> {vm.quantity}
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-600">
                          <div className="font-medium text-green-400">
                            R$ {calculateVMPrice(vm).toFixed(2)}/mês por VM
                          </div>
                          <div className="text-sm text-slate-400">
                            Total: R$ {(calculateVMPrice(vm) * vm.quantity).toFixed(2)}/mês
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-600 p-4 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">
                      R$ {calculateTotalPrice.toFixed(2)}
                    </div>
                    <div className="text-sm text-blue-100">Total Mensal</div>
                  </div>
                </div>

                <div className="space-y-2 text-slate-300">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {calculateTotalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Desconto (0%):</span>
                    <span>R$ 0,00</span>
                  </div>
                  <Separator className="bg-slate-600" />
                  <div className="flex justify-between font-bold text-white">
                    <span>Total:</span>
                    <span>R$ {calculateTotalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <Button onClick={saveProposal} className="w-full bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Proposta
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default VMCalculator;
