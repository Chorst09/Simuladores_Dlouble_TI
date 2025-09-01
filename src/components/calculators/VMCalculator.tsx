"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Trash2, 
  Save, 
  X, 
  Search, 
  Edit, 
  Pencil,
  PlusCircle, 
  FileText, 
  DollarSign, 
  Settings, 
  ArrowLeft, 
  Check, 
  Clock, 
  AlertCircle, 
  Download, 
  Copy, 
  Share2, 
  MoreHorizontal, 
  BarChart2, 
  HardDrive, 
  Cpu, 
  Memory, 
  MemoryStick,
  Network, 
  Server 
} from 'lucide-react';
import { ClientManagerForm, ClientData, AccountManagerData } from './ClientManagerForm';

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
  clientData?: ClientData;
  accountManagerData?: AccountManagerData;
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
  
  // Estado para controlar se está editando uma VM existente
  const [isEditingVM, setIsEditingVM] = useState(false);
  const [editingVMId, setEditingVMId] = useState<string | null>(null);

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
  
  const [discount, setDiscount] = useState<number>(0);
  const [isDiscountApplied, setIsDiscountApplied] = useState<boolean>(false);

  const applyDiscount = () => {
    setDiscount(5); // 5% de desconto
    setIsDiscountApplied(true);
  };

  const removeDiscount = () => {
    setDiscount(0);
    setIsDiscountApplied(false);
  };

  const calculateDiscountedPrice = (price: number): number => {
    if (!isDiscountApplied || discount <= 0) return price;
    return price * (1 - discount / 100);
  };

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [viewMode, setViewMode] = useState<'search' | 'client-form' | 'calculator'>('search');
  const [activeTab, setActiveTab] = useState<'config' | 'summary' | 'negotiations' | 'settings'>('config');
  const [searchTerm, setSearchTerm] = useState('');
  const [proposalSearchTerm, setProposalSearchTerm] = useState('');

  // Client and Account Manager data states
  const [clientData, setClientData] = useState<ClientData>({
    name: '',
    projectName: '',
    email: '',
    phone: ''
  });

  const [accountManagerData, setAccountManagerData] = useState<AccountManagerData>({
    name: '',
    email: '',
    phone: ''
  });

  // Validation function
  const validateClientData = (data: ClientData): string[] => {
    const errors: string[] = [];
    
    if (!data.name.trim()) {
      errors.push('Nome do cliente é obrigatório');
    }
    
    if (!data.projectName.trim()) {
      errors.push('Nome do projeto é obrigatório');
    }
    
    if (!data.email.trim()) {
      errors.push('Email do cliente é obrigatório');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Email do cliente deve ter um formato válido');
    }
    
    return errors;
  };

  const validateAccountManagerData = (data: AccountManagerData): string[] => {
    const errors: string[] = [];
    
    if (!data.name.trim()) {
      errors.push('Nome do gerente de contas é obrigatório');
    }
    
    if (!data.email.trim()) {
      errors.push('Email do gerente de contas é obrigatório');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Email do gerente de contas deve ter um formato válido');
    }
    
    return errors;
  };

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


  // Estado para armazenar o subtotal (preço sem desconto)
  const [subtotalPrice, setSubtotalPrice] = useState<number>(0);

  // Atualizar o subtotal quando as VMs mudarem
  useEffect(() => {
    const newSubtotal = currentProposal.vms.reduce((total, vm) => {
      return total + (calculateVMPrice(vm) * (vm.quantity || 1));
    }, 0);
    setSubtotalPrice(newSubtotal);
  }, [currentProposal.vms]);

  const totalPrice = useMemo(() => {
    return calculateDiscountedPrice(subtotalPrice);
  }, [subtotalPrice, discount]);

  const discountAmount = useMemo(() => {
    return subtotalPrice * (discount / 100);
  }, [subtotalPrice, discount]);

  // Efeito para carregar propostas quando o componente montar
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        if (!token) {
          console.error('Token de autenticação não encontrado');
          return;
        }
        
        const response = await fetch('/api/proposals?type=VM', {
          method: 'GET',
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

  // Efeito para sincronizar o estado do desconto e subtotal quando a proposta atual for alterada
  useEffect(() => {
    // Calcular o subtotal com base nas VMs atuais
    const calculateCurrentSubtotal = () => {
      if (currentProposal.vms.length === 0) return 0;
      return currentProposal.vms.reduce((total, vm) => {
        return total + (calculateVMPrice(vm) * (vm.quantity || 1));
      }, 0);
    };

    if (currentProposal.id && currentProposal.negotiationRounds?.length > 0) {
      const activeRound = currentProposal.negotiationRounds.find(
        round => round.status === 'active'
      );
      
      if (activeRound) {
        const hasDiscount = activeRound.discount > 0;
        setIsDiscountApplied(hasDiscount);
        setDiscount(hasDiscount ? activeRound.discount : 0);
        
        // Se houver desconto e um preço original válido, usá-lo, caso contrário, calcular o subtotal
        const subtotal = (hasDiscount && activeRound.originalPrice > 0)
          ? activeRound.originalPrice
          : calculateCurrentSubtotal();
          
        setSubtotalPrice(subtotal);
      } else {
        // Se não houver rodada ativa, usar o cálculo padrão
        setSubtotalPrice(calculateCurrentSubtotal());
      }
    } else {
      // Se não houver rodadas de negociação, calcular o subtotal com base nas VMs
      setSubtotalPrice(calculateCurrentSubtotal());
    }
  }, [currentProposal]);

  // Filtrar propostas
  const filteredProposals = proposals.filter(proposal =>
    proposal.name.toLowerCase().includes(proposalSearchTerm.toLowerCase()) ||
    (proposal.clientName?.toLowerCase() || '').includes(proposalSearchTerm.toLowerCase()) ||
    (proposal.proposalNumber?.toLowerCase() || '').includes(proposalSearchTerm.toLowerCase())
  );

  // Funções de gerenciamento de propostas
  const createNewProposal = () => {
    const newProposal = {
      id: `proposal-${Date.now()}`,
      proposalNumber: generateProposalNumber(),
      name: '',
      clientName: '',
      clientData: {
        name: '',
        projectName: '',
        email: '',
        phone: ''
      },
      accountManagerData: {
        name: '',
        email: '',
        phone: ''
      },
      date: new Date().toISOString(),
      vms: [],
      totalPrice: 0,
      currentRound: 1,
      negotiationRounds: [
        {
          id: `round-${Date.now()}`,
          roundNumber: 1,
          date: new Date().toISOString(),
          description: 'Proposta Inicial',
          discount: 0,
          vms: [],
          originalPrice: 0,
          totalPrice: 0,
          status: 'active' as const
        }
      ]
    };
    
    setCurrentProposal(newProposal);
    setClientData({
      name: '',
      projectName: '',
      email: '',
      phone: ''
    });
    setAccountManagerData({
      name: '',
      email: '',
      phone: ''
    });
    setIsDiscountApplied(false);
    setDiscount(0);
    setViewMode('client-form');
    setActiveTab('config');
  };

  const [initialProposal, setInitialProposal] = useState<Proposal | null>(null);

  const editProposal = (proposal: Proposal) => {
    // Fazer uma cópia profunda da proposta para edição
    const proposalWithRounds = {
      ...proposal,
      vms: [...proposal.vms],
      negotiationRounds: proposal.negotiationRounds ? [...proposal.negotiationRounds] : []
    };
    
    // Salvar a proposta inicial antes de aplicar quaisquer alterações
    setInitialProposal({
      ...proposal,
      vms: [...proposal.vms],
      negotiationRounds: [] // Não precisamos das rodadas de negociação iniciais
    });
    
    // Verificar se já existe uma rodada ativa
    const hasActiveRound = proposalWithRounds.negotiationRounds?.some(round => round.status === 'active');
    
    if (hasActiveRound) {
      // Se já existir uma rodada ativa, usá-la
      const activeRound = proposalWithRounds.negotiationRounds.find(round => round.status === 'active');
      if (activeRound) {
        // Se for a primeira rodada, usar os valores iniciais da proposta
        if (activeRound.roundNumber === 1) {
          activeRound.originalPrice = proposal.totalPrice || 0;
        }
        
        proposalWithRounds.vms = [...activeRound.vms];
        proposalWithRounds.totalPrice = activeRound.totalPrice;
        setIsDiscountApplied(activeRound.discount > 0);
        setDiscount(activeRound.discount);
        
        // Calcular e atualizar o subtotal das VMs
        const subtotal = proposalWithRounds.vms.reduce((total, vm) => {
          return total + (calculateVMPrice(vm) * (vm.quantity || 1));
        }, 0);
        setSubtotalPrice(subtotal);
      }
    } else {
      // Se não houver rodada ativa, criar uma nova
      const newRound: NegotiationRound = {
        id: `round-${Date.now()}`,
        roundNumber: 1,
        date: new Date().toISOString(),
        description: 'Proposta Inicial',
        discount: 0,
        vms: [...proposal.vms],
        originalPrice: proposal.totalPrice || 0, // Salvar o preço original
        totalPrice: proposal.totalPrice || 0,
        status: 'active' as const
      };
      
      proposalWithRounds.negotiationRounds.push(newRound);
      proposalWithRounds.currentRound = 1;
      setIsDiscountApplied(false);
      setDiscount(0);
    }
    
    // Carregar dados do cliente e gerente de contas
    if (proposal.clientData) {
      setClientData(proposal.clientData);
    } else {
      // Compatibilidade com propostas antigas
      setClientData({
        name: proposal.clientName || '',
        projectName: '',
        email: '',
        phone: ''
      });
    }
    
    if (proposal.accountManagerData) {
      setAccountManagerData(proposal.accountManagerData);
    } else {
      setAccountManagerData({
        name: '',
        email: '',
        phone: ''
      });
    }
    
    setCurrentProposal(proposalWithRounds);
    setViewMode('calculator');
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
    setClientData({
      name: '',
      projectName: '',
      email: '',
      phone: ''
    });
    setAccountManagerData({
      name: '',
      email: '',
      phone: ''
    });
    setActiveTab('config');
  };

  const deleteProposal = (proposalId: string) => {
    if (confirm('Tem certeza que deseja excluir esta proposta?')) {
      setProposals(prev => prev.filter(p => p.id !== proposalId));
    }
  };

  const saveProposal = async () => {
    try {
      // Validar dados do cliente e gerente de contas
      const clientErrors = validateClientData(clientData);
      const managerErrors = validateAccountManagerData(accountManagerData);
      const allErrors = [...clientErrors, ...managerErrors];
      
      if (allErrors.length > 0) {
        alert('Erro na validação:\n' + allErrors.join('\n'));
        return;
      }

      // Calcular o subtotal atual das VMs
      const currentSubtotal = currentProposal.vms.reduce((total, vm) => {
        return total + (calculateVMPrice(vm) * (vm.quantity || 1));
      }, 0);
      
      // Atualizar o estado do subtotal
      setSubtotalPrice(currentSubtotal);
      
      // Calcular o preço total com desconto, se aplicável
      const finalDiscount = isDiscountApplied ? discount : 0;
      const finalPrice = finalDiscount > 0 
        ? currentSubtotal * (1 - finalDiscount / 100) 
        : currentSubtotal;
      
      // Atualiza a rodada ativa com o desconto, se aplicável
      const updatedRounds = currentProposal.negotiationRounds?.map(round => {
        if (round.status === 'active') {
          return {
            ...round,
            discount: finalDiscount,
            vms: [...currentProposal.vms],
            originalPrice: currentSubtotal,
            totalPrice: finalPrice,
            date: new Date().toISOString()
          };
        }
        return round;
      }) || [];

      // Garantir que há pelo menos uma rodada de negociação
      if (updatedRounds.length === 0) {
        updatedRounds.push({
          id: `round-${Date.now()}`,
          roundNumber: 1,
          date: new Date().toISOString(),
          description: 'Proposta Inicial',
          discount: finalDiscount,
          vms: [...currentProposal.vms],
          originalPrice: currentSubtotal,
          totalPrice: finalPrice,
          status: 'active' as const
        });
      }

      // Preparar os dados do cliente usando os estados atuais
      const clientDataToSave = {
        name: clientData.name || 'Cliente não informado',
        projectName: clientData.projectName || 'Projeto não informado',
        email: clientData.email || '',
        phone: clientData.phone || ''
      };

      // Criar objeto com os dados do gerente de contas
      const accountManagerDataToSave = {
        name: accountManagerData.name || '',
        email: accountManagerData.email || '',
        phone: accountManagerData.phone || ''
      };

      // Log dos dados que serão enviados
      console.log('Dados do cliente:', JSON.stringify(clientDataToSave, null, 2));
      console.log('Dados do gerente de contas:', JSON.stringify(accountManagerDataToSave, null, 2));

      // Verificar se o clientData está definido corretamente
      if (!clientDataToSave) {
        console.error('Erro: clientData não está definido');
        throw new Error('Dados do cliente não estão disponíveis');
      }

      // Garantir que o client_data tem todos os campos necessários
      const completeClientData = {
        name: clientDataToSave.name || 'Cliente não informado',
        projectName: clientDataToSave.projectName || 'Projeto não informado',
        email: clientDataToSave.email || '',
        phone: clientDataToSave.phone || '',
        // Garantir que não há valores undefined
        ...Object.fromEntries(
          Object.entries(clientDataToSave).filter(([_, v]) => v !== undefined)
        )
      };

      // Garantir que o account_manager_data tem todos os campos necessários
      const completeAccountManagerData = {
        name: accountManagerDataToSave.name || '',
        email: accountManagerDataToSave.email || '',
        phone: accountManagerDataToSave.phone || '',
        ...Object.fromEntries(
          Object.entries(accountManagerDataToSave).filter(([_, v]) => v !== undefined)
        )
      };

      // Preparar os produtos da proposta
      const products = currentProposal.vms.map(vm => ({
        ...vm,
        unitPrice: calculateVMPrice(vm),
        setup: 0,
        monthly: calculateVMPrice(vm),
        quantity: vm.quantity || 1,
        total: calculateVMPrice(vm) * (vm.quantity || 1)
      }));

      // Calcular totais
      const totalMonthly = products.reduce((sum, product) => sum + (product.total || 0), 0);
      const totalSetup = 0; // Valor fixo para setup

      // Criar objeto final da proposta
      const proposalToSave = {
        // Identificação
        id: currentProposal.id || `proposal-${Date.now()}`,
        
        // Dados principais
        client_data: completeClientData,
        account_manager_data: completeAccountManagerData,
        
        // Produtos e totais
        products: products,
        total_setup: totalSetup,
        total_monthly: totalMonthly,
        
        // Metadados
        type: 'VM',
        status: 'pending',
        proposal_number: currentProposal.proposalNumber || `VM-${Date.now()}`,
        name: clientDataToSave.projectName || 'Proposta de VM',
        clientName: clientDataToSave.name || 'Cliente não informado',
        date: currentProposal.date || new Date().toISOString(),
        
        // Negociação
        negotiation_rounds: currentProposal.negotiationRounds || [],
        current_round: currentProposal.currentRound || 1,
        
        // Timestamps
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Verificar se o client_data está presente e tem o formato correto
      if (!proposalToSave.client_data || typeof proposalToSave.client_data !== 'object') {
        console.error('Erro: client_data inválido ou ausente', proposalToSave.client_data);
        throw new Error('Dados do cliente inválidos');
      }

      // Verificar se todos os campos obrigatórios da proposta estão presentes
      const hasClientData = !!proposalToSave.client_data;
      const hasProducts = Array.isArray(proposalToSave.products) && proposalToSave.products.length > 0;
      const hasTotalMonthly = typeof proposalToSave.total_monthly === 'number';
      
      const missingProposalFields = [];
      if (!hasClientData) missingProposalFields.push('client_data');
      if (!hasProducts) missingProposalFields.push('products');
      if (!hasTotalMonthly) missingProposalFields.push('total_monthly');
      
      if (missingProposalFields.length > 0) {
        console.error('Campos obrigatórios faltando na proposta:', missingProposalFields);
        throw new Error(`Dados da proposta incompletos. Campos faltando: ${missingProposalFields.join(', ')}`);
      }

      // Verificar se o client_data tem os campos obrigatórios
      const requiredClientFields = ['name'];
      const missingClientFields = requiredClientFields.filter(
        field => !proposalToSave.client_data || !proposalToSave.client_data[field]
      );
      
      if (missingClientFields.length > 0) {
        console.error('Campos obrigatórios faltando no client_data:', missingClientFields);
        throw new Error(`Dados do cliente incompletos. Campos faltando: ${missingClientFields.join(', ')}`);
      }

      // Log detalhado para depuração
      console.log('=== DETALHES DA PROPOSTA ===');
      console.log('ID:', proposalToSave.id);
      console.log('Client Data:', JSON.stringify(proposalToSave.client_data, null, 2));
      console.log('Total de produtos:', proposalToSave.products.length);
      console.log('Total mensal:', proposalToSave.total_monthly);
      console.log('Tipo:', proposalToSave.type);
      console.log('Status:', proposalToSave.status);
      console.log('Rodadas de negociação:', proposalToSave.negotiation_rounds?.length || 0);
      console.log('===========================');

      const token = localStorage.getItem('auth-token');
      if (!token) {
        console.error('Token de autenticação não encontrado');
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      const method = viewMode === 'edit' ? 'PUT' : 'POST';
      const url = viewMode === 'edit' ? `/api/proposals/${currentProposal.id}` : '/api/proposals';
      
      console.log('Enviando requisição para:', url, 'Método:', method);

      console.log('Enviando requisição para:', url);
      console.log('Método:', method);
      console.log('Corpo da requisição:', JSON.stringify(proposalToSave, null, 2));

      try {
        console.log('Enviando requisição para:', url);
        console.log('Método:', method);
        console.log('Dados da proposta:', JSON.stringify(proposalToSave, null, 2));

        const response = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(proposalToSave),
        });

        let responseData;
        try {
          responseData = await response.json();
        } catch (e) {
          console.error('Erro ao fazer parse da resposta JSON:', e);
          throw new Error('Resposta inválida do servidor');
        }

        console.log('Resposta da API:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });

        if (!response.ok) {
          throw new Error(responseData.message || 'Erro ao salvar proposta');
        }

        // Recarregar propostas
        const refreshResponse = await fetch('/api/proposals?type=VM', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setProposals(data);
        } else {
          console.error('Erro ao recarregar propostas:', await refreshResponse.text());
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
        setClientData({
          name: '',
          projectName: '',
          email: '',
          phone: ''
        });
        setAccountManagerData({
          name: '',
          email: '',
          phone: ''
        });
        setActiveTab('config');
        setViewMode('search');

        alert('Proposta salva com sucesso!');
      } catch (error) {
        console.error('Erro ao salvar proposta:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao salvar proposta';
        alert(`Erro ao salvar proposta: ${errorMessage}`);
      }
  };

  const addVMToProposal = () => {
    if (!currentVM.name) {
      alert('Por favor, insira um nome para a VM');
      return;
    }

    if (isEditingVM && editingVMId) {
      // Atualizar VM existente
      setCurrentProposal(prev => ({
        ...prev,
        vms: prev.vms.map(vm => 
          vm.id === editingVMId ? { ...currentVM, id: editingVMId } : vm
        )
      }));
      
      // Atualizar também na rodada ativa de negociação, se houver
      const activeRoundIndex = currentProposal.negotiationRounds?.findIndex(
        round => round.status === 'active'
      );
      
      if (activeRoundIndex !== -1 && currentProposal.negotiationRounds) {
        const updatedRounds = [...currentProposal.negotiationRounds];
        updatedRounds[activeRoundIndex] = {
          ...updatedRounds[activeRoundIndex],
          vms: updatedRounds[activeRoundIndex].vms.map(vm => 
            vm.id === editingVMId ? { ...currentVM, id: editingVMId } : vm
          )
        };
        
        setCurrentProposal(prev => ({
          ...prev,
          negotiationRounds: updatedRounds
        }));
      }
      
      // Sair do modo de edição
      setIsEditingVM(false);
      setEditingVMId(null);
    } else {
      // Adicionar nova VM
      const newVM: VMConfig = {
        ...currentVM,
        id: `vm-${Date.now()}`
      };

      setCurrentProposal(prev => ({
        ...prev,
        vms: [...prev.vms, newVM]
      }));
      
      // Atualizar também na rodada ativa de negociação, se houver
      const activeRoundIndex = currentProposal.negotiationRounds?.findIndex(
        round => round.status === 'active'
      );
      
      if (activeRoundIndex !== -1 && currentProposal.negotiationRounds) {
        const updatedRounds = [...currentProposal.negotiationRounds];
        updatedRounds[activeRoundIndex] = {
          ...updatedRounds[activeRoundIndex],
          vms: [...updatedRounds[activeRoundIndex].vms, newVM]
        };
        
        setCurrentProposal(prev => ({
          ...prev,
          negotiationRounds: updatedRounds
        }));
      }
    }

    // Resetar formulário
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

  const editVM = (vmId: string) => {
    const vmToEdit = currentProposal.vms.find(vm => vm.id === vmId);
    if (vmToEdit) {
      setCurrentVM(vmToEdit);
      setIsEditingVM(true);
      setEditingVMId(vmId);
      // Rolar para o topo do formulário
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const removeVMFromProposal = (vmId: string) => {
    if (!confirm('Tem certeza que deseja remover esta VM?')) return;
    
    // Remover da lista de VMs principal
    setCurrentProposal(prev => ({
      ...prev,
      vms: prev.vms.filter(vm => vm.id !== vmId)
    }));
    
    // Remover também da rodada ativa de negociação, se existir
    const activeRoundIndex = currentProposal.negotiationRounds?.findIndex(
      round => round.status === 'active'
    );
    
    if (activeRoundIndex !== -1 && currentProposal.negotiationRounds) {
      const updatedRounds = [...currentProposal.negotiationRounds];
      updatedRounds[activeRoundIndex] = {
        ...updatedRounds[activeRoundIndex],
        vms: updatedRounds[activeRoundIndex].vms.filter(vm => vm.id !== vmId)
      };
      
      setCurrentProposal(prev => ({
        ...prev,
        negotiationRounds: updatedRounds
      }));
    }
    
    // Se estiver editando a VM que está sendo removida, limpar o formulário
    if (editingVMId === vmId) {
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
      setIsEditingVM(false);
      setEditingVMId(null);
    }
  };
  
  const cancelEdit = () => {
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
    setIsEditingVM(false);
    setEditingVMId(null);
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
                <p className="text-slate-300 mt-2">Encontre propostas de VM existentes ou crie uma nova.</p>
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

            {/* Proposals List */}
            <div className="grid gap-4">
              {filteredProposals.length > 0 ? (
                filteredProposals.map((proposal) => (
                  <Card key={proposal.id} className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {proposal.clientData?.projectName || proposal.name || 'Projeto sem nome'}
                          </h3>
                          <p className="text-slate-300">
                            {proposal.clientData?.name || proposal.clientName || 'Cliente não informado'}
                          </p>
                          <p className="text-sm text-slate-400">
                            {new Date(proposal.date).toLocaleDateString('pt-BR')} • {proposal.vms.length} VMs
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => editProposal(proposal)}
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-white hover:bg-slate-700"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            onClick={() => deleteProposal(proposal.id)}
                            variant="outline"
                            size="sm"
                            className="border-red-600 text-red-400 hover:bg-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Nenhuma proposta encontrada</h3>
                    <p className="text-slate-400">Crie uma nova proposta para começar.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Client Form View */}
        {viewMode === 'client-form' && (
          <ClientManagerForm
            clientData={clientData}
            accountManagerData={accountManagerData}
            onClientDataChange={setClientData}
            onAccountManagerDataChange={setAccountManagerData}
            onBack={() => setViewMode('search')}
            onContinue={() => setViewMode('calculator')}
            title="Nova Proposta - VM"
            subtitle="Preencha os dados do cliente e gerente de contas para continuar."
          />
        )}

        {/* Calculator View */}
        {viewMode === 'calculator' && (
          <div className="container mx-auto p-4 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {clientData.projectName || 'Calculadora de VM'}
                </h1>
                <p className="text-slate-300 mt-2">
                  Cliente: {clientData.name || 'Não informado'} • Configure as VMs e detalhes da proposta
                </p>
              </div>
              <Button onClick={cancelAction} variant="outline" className="border-slate-600 text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>

            {/* Client Information */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Informações do Cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
                  <div>
                    <p><strong>Cliente:</strong> {clientData.name}</p>
                    <p><strong>Email:</strong> {clientData.email}</p>
                    {clientData.phone && <p><strong>Telefone:</strong> {clientData.phone}</p>}
                  </div>
                  <div>
                    <p><strong>Projeto:</strong> {clientData.projectName}</p>
                    {accountManagerData.name && (
                      <>
                        <p><strong>Gerente:</strong> {accountManagerData.name}</p>
                        <p><strong>Email Gerente:</strong> {accountManagerData.email}</p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

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
                <CardTitle className="text-white">
                  {isEditingVM ? 'Editar VM' : 'Adicionar Nova VM'}
                </CardTitle>
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
                      placeholder="Ex: Servidor Web"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vcpu" className="text-white">vCPU</Label>
                    <Input
                      id="vcpu"
                      type="number"
                      min="1"
                      value={currentVM.vcpu}
                      onChange={(e) => setCurrentVM(prev => ({ ...prev, vcpu: parseInt(e.target.value) || 1 }))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ram" className="text-white">RAM (GB)</Label>
                    <Input
                      id="ram"
                      type="number"
                      min="1"
                      value={currentVM.ram}
                      onChange={(e) => setCurrentVM(prev => ({ ...prev, ram: parseInt(e.target.value) || 1 }))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="storageType" className="text-white">Tipo de Armazenamento</Label>
                    <Select
                      value={currentVM.storageType}
                      onValueChange={(value) => setCurrentVM(prev => ({ ...prev, storageType: value }))}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="HDD SAS" className="hover:bg-slate-700">HDD SAS</SelectItem>
                        <SelectItem value="SSD SATA" className="hover:bg-slate-700">SSD SATA</SelectItem>
                        <SelectItem value="SSD NVMe" className="hover:bg-slate-700">SSD NVMe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="storageSize" className="text-white">Tamanho do Armazenamento (GB)</Label>
                    <Input
                      id="storageSize"
                      type="number"
                      min="1"
                      value={currentVM.storageSize}
                      onChange={(e) => setCurrentVM(prev => ({ ...prev, storageSize: parseInt(e.target.value) || 10 }))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity" className="text-white">Quantidade</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={currentVM.quantity}
                      onChange={(e) => setCurrentVM(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="os" className="text-white">Sistema Operacional</Label>
                    <Select
                      value={currentVM.os}
                      onValueChange={(value) => setCurrentVM(prev => ({ ...prev, os: value }))}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Selecione o SO" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="Linux" className="hover:bg-slate-700">Linux</SelectItem>
                        <SelectItem value="Windows Server" className="hover:bg-slate-700">Windows Server</SelectItem>
                        <SelectItem value="FreeBSD" className="hover:bg-slate-700">FreeBSD</SelectItem>
                        <SelectItem value="Outro" className="hover:bg-slate-700">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="additionalIP" 
                      checked={currentVM.additionalIP}
                      onCheckedChange={(checked) => setCurrentVM(prev => ({ ...prev, additionalIP: Boolean(checked) }))}
                      className="border-slate-600 data-[state=checked]:bg-blue-600"
                    />
                    <label htmlFor="additionalIP" className="text-sm font-medium text-white">
                      IP Adicional
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="additionalSnapshot" 
                      checked={currentVM.additionalSnapshot}
                      onCheckedChange={(checked) => setCurrentVM(prev => ({ ...prev, additionalSnapshot: Boolean(checked) }))}
                      className="border-slate-600 data-[state=checked]:bg-blue-600"
                    />
                    <label htmlFor="additionalSnapshot" className="text-sm font-medium text-white">
                      Snapshot Adicional
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="vpnSiteToSite" 
                      checked={currentVM.vpnSiteToSite}
                      onCheckedChange={(checked) => setCurrentVM(prev => ({ ...prev, vpnSiteToSite: Boolean(checked) }))}
                      className="border-slate-600 data-[state=checked]:bg-blue-600"
                    />
                    <label htmlFor="vpnSiteToSite" className="text-sm font-medium text-white">
                      VPN Site-to-Site
                    </label>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={addVMToProposal} 
                    className={`${isEditingVM ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {isEditingVM ? (
                      <Save className="h-4 w-4 mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {isEditingVM ? 'Atualizar VM' : 'Adicionar VM'}
                  </Button>
                  
                  {isEditingVM && (
                    <Button 
                      variant="outline" 
                      onClick={cancelEdit}
                      className="text-white border-slate-600 hover:bg-slate-700"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar Edição
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* VMs List */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">
                    VMs da Proposta
                    {currentProposal.vms.length > 0 && (
                      <span className="ml-2 text-sm text-slate-400 font-normal">
                        ({currentProposal.vms.length} {currentProposal.vms.length === 1 ? 'VM adicionada' : 'VMs adicionadas'})
                      </span>
                    )}
                  </CardTitle>
                  {currentProposal.vms.length > 0 && (
                    <Badge variant="outline" className="text-sm text-green-400 border-green-400/30">
                      {currentProposal.vms.reduce((total, vm) => total + vm.quantity, 0)} instâncias
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className={currentProposal.vms.length === 0 ? 'py-8' : ''}>
                {currentProposal.vms.length > 0 ? (
                  <div className="space-y-3">
                    {currentProposal.vms.map((vm) => (
                      <div key={vm.id} className="group border border-slate-600 rounded-lg p-4 bg-slate-700/50 hover:bg-slate-700/80 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className="font-medium text-white flex items-center">
                              {vm.name}
                              {vm.quantity > 1 && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-900/50 text-blue-300 rounded-full">
                                  {vm.quantity}x
                                </span>
                              )}
                            </h5>
                            <p className="text-xs text-slate-400">
                              {vm.os} • {vm.storageType}
                            </p>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => editVM(vm.id)}
                              className="h-8 w-8 p-0 border-slate-600 text-blue-400 hover:bg-blue-900/30 hover:border-blue-500 hover:text-blue-300"
                              title="Editar VM"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeVMFromProposal(vm.id)}
                              className="h-8 w-8 p-0 border-slate-600 text-red-400 hover:bg-red-900/30 hover:border-red-500 hover:text-red-300"
                              title="Remover VM"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                          <div className="flex items-center">
                            <Cpu className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
                            <span>{vm.vcpu} vCPU</span>
                          </div>
                          <div className="flex items-center">
                            <MemoryStick className="h-3.5 w-3.5 mr-1.5 text-purple-400" />
                            <span>{vm.ram}GB RAM</span>
                          </div>
                          <div className="flex items-center">
                            <HardDrive className="h-3.5 w-3.5 mr-1.5 text-yellow-400" />
                            <span>{vm.storageSize}GB</span>
                          </div>
                          <div className="flex items-center">
                            <Network className="h-3.5 w-3.5 mr-1.5 text-green-400" />
                            <span>{vm.networkCard}</span>
                          </div>
                        </div>
                        
                        {vm.additionalIP || vm.additionalSnapshot || vm.vpnSiteToSite ? (
                          <div className="mt-2 pt-2 border-t border-slate-600">
                            <div className="flex flex-wrap gap-1.5">
                              {vm.additionalIP && (
                                <Badge variant="outline" className="text-xs text-blue-300 border-blue-900/50 bg-blue-900/20">
                                  +IP
                                </Badge>
                              )}
                              {vm.additionalSnapshot && (
                                <Badge variant="outline" className="text-xs text-purple-300 border-purple-900/50 bg-purple-900/20">
                                  Snapshot
                                </Badge>
                              )}
                              {vm.vpnSiteToSite && (
                                <Badge variant="outline" className="text-xs text-green-300 border-green-900/50 bg-green-900/20">
                                  VPN
                                </Badge>
                              )}
                            </div>
                          </div>
                        ) : null}
                        
                        <div className="mt-3 pt-3 border-t border-slate-600">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-sm text-slate-400">Preço unitário</div>
                              <div className="font-medium text-green-400">
                                R$ {calculateVMPrice(vm).toFixed(2)}/mês
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-slate-400">Total</div>
                              <div className="text-lg font-semibold text-white">
                                R$ {(calculateVMPrice(vm) * vm.quantity).toFixed(2)}/mês
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Server className="h-12 w-12 mx-auto mb-3 text-slate-500" />
                    <h3 className="text-lg font-medium text-white mb-1">Nenhuma VM adicionada</h3>
                    <p className="text-slate-400">Adicione VMs à proposta para começar</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-600 p-4 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">
                      R$ {totalPrice.toFixed(2)}
                    </div>
                    <div className="text-sm text-blue-100">Total Mensal {discount > 0 ? `(${discount}% OFF)` : ''}</div>
                  </div>
                </div>

                <div className="space-y-2 text-slate-300">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {subtotalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Desconto ({discount}%):</span>
                    <span>-R$ {discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-end">
                    {!isDiscountApplied ? (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={applyDiscount}
                        className="text-xs text-green-400 border-green-400 hover:bg-green-900 hover:text-green-300"
                      >
                        Aplicar 5% de desconto
                      </Button>
                    ) : (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={removeDiscount}
                        className="text-xs text-red-400 border-red-400 hover:bg-red-900 hover:text-red-300"
                      >
                        Remover desconto
                      </Button>
                    )}
                  </div>
                  <Separator className="bg-slate-600" />
                  <div className="flex justify-between font-bold text-white">
                    <span>Total:</span>
                    <span>R$ {totalPrice.toFixed(2)}</span>
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
