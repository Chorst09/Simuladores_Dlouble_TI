"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ClientManagerInfo } from './ClientManagerInfo';
import { Checkbox } from '@/components/ui/checkbox';
import { 
    Radio, 
    Calculator, 
    FileText, 
    Plus,
    Edit,
    Search,
    Save,
    Download,
    Trash2
} from 'lucide-react';
import { Proposal, ProposalItem, ClientData, AccountManagerData } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { ClientManagerForm } from './ClientManagerForm';
import DREComponent from './DREComponent';
import { ProposalActions } from '@/components/calculators/shared/ProposalActions';
import { NegotiationRounds } from '@/components/calculators/shared/NegotiationRounds';
import { ProposalViewer } from '@/components/calculators/shared/ProposalViewer';
import { DeleteConfirmation } from '@/components/calculators/shared/DeleteConfirmation';
import { DirectorDiscount } from '@/components/calculators/shared/DirectorDiscount';

// Interfaces
interface RadioPlan {
    speed: number;
    price12: number;
    price24: number;
    price36: number;
    installationCost: number;
    description: string;
    baseCost: number;
}

interface ContractTerm {
    months: number;
    paybackMonths: number;
}

interface DoubleRadioFibraCalculatorProps {
    userRole?: 'admin' | 'user' | 'diretor';
    onBackToPanel?: () => void;
    userId: string;
    userEmail: string;
}

const DoubleRadioFibraCalculator: React.FC<DoubleRadioFibraCalculatorProps> = ({ userRole, onBackToPanel, userId, userEmail }) => {
    // Estados de gerenciamento de propostas
    const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);
    const [viewMode, setViewMode] = useState<'search' | 'client-form' | 'calculator'>('search');
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Estados dos dados do cliente e gerente
    const [clientData, setClientData] = useState<ClientData>({
        name: '',
        email: '',
        phone: ''
    });
    const [accountManagerData, setAccountManagerData] = useState<AccountManagerData>({
        name: '',
        email: '',
        phone: ''
    });
    const [addedProducts, setAddedProducts] = useState<ProposalItem[]>([]);

    // Estados da calculadora
    const [selectedSpeed, setSelectedSpeed] = useState<number>(0);
    const [contractTerm, setContractTerm] = useState<number>(12);
    const [includeInstallation, setIncludeInstallation] = useState<boolean>(true);
    const [projectValue, setProjectValue] = useState<number>(0);
    const [isExistingClient, setIsExistingClient] = useState<boolean>(false);
    const [previousMonthlyFee, setPreviousMonthlyFee] = useState<number>(0);
    const [hasLastMile, setHasLastMile] = useState<boolean>(false);
    const [lastMileCost, setLastMileCost] = useState<number>(0);
    const [hasPartnerIndicator, setHasPartnerIndicator] = useState<boolean>(false);
    const [negotiationRound, setNegotiationRound] = useState<number>(1);
    const [discount, setDiscount] = useState<number>(0);
    const [customDiscountInput, setCustomDiscountInput] = useState<string>('');

    // Estados para desconto de diretor
    const [directorDiscountData, setDirectorDiscountData] = useState<{
        percentage: number;
        appliedBy: string;
        appliedAt: string;
        reason: string;
        originalValue: number;
        discountedValue: number;
    } | null>(null);
    
    // Estados para edição de preços
    const [isEditingPrices, setIsEditingPrices] = useState<boolean>(false);

    // Estados para modais e funcionalidades compartilhadas
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [showNegotiationRounds, setShowNegotiationRounds] = useState<boolean>(false);
    const [showProposalViewer, setShowProposalViewer] = useState<boolean>(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);
    const [showDirectorDiscount, setShowDirectorDiscount] = useState<boolean>(false);
    const [selectedProposalForDiscount, setSelectedProposalForDiscount] = useState<Proposal | null>(null);

    // Hooks
    const { token, userId: authUserId, userEmail: authUserEmail } = useAuth();
    const { toast } = useToast();

    // Dados das tabelas - DOUBLE RADIO+FIBRA
    const [radioPlans, setRadioPlans] = useState<RadioPlan[]>([
        { speed: 25, price12: 720.00, price24: 527.00, price36: 474.00, installationCost: 998.00, description: "25 Mbps", baseCost: 1580.00 },
        { speed: 30, price12: 740.08, price24: 579.00, price36: 527.00, installationCost: 998.00, description: "30 Mbps", baseCost: 1580.00 },
        { speed: 40, price12: 915.01, price24: 632.00, price36: 579.00, installationCost: 998.00, description: "40 Mbps", baseCost: 1580.00 },
        { speed: 50, price12: 1103.39, price24: 685.00, price36: 632.00, installationCost: 998.00, description: "50 Mbps", baseCost: 1580.00 },
        { speed: 60, price12: 1547.44, price24: 790.00, price36: 737.00, installationCost: 998.00, description: "60 Mbps", baseCost: 1580.00 },
        { speed: 80, price12: 1825.98, price24: 1000.00, price36: 948.00, installationCost: 998.00, description: "80 Mbps", baseCost: 5700.00 },
        { speed: 100, price12: 2017.05, price24: 1578.00, price36: 1316.00, installationCost: 1996.00, description: "100 Mbps", baseCost: 5700.00 },
        { speed: 150, price12: 2543.18, price24: 1789.00, price36: 1527.00, installationCost: 1996.00, description: "150 Mbps", baseCost: 5700.00 },
        { speed: 200, price12: 3215.98, price24: 2053.00, price36: 1737.00, installationCost: 1996.00, description: "200 Mbps", baseCost: 5700.00 },
        { speed: 300, price12: 7522.00, price24: 4316.00, price36: 4000.00, installationCost: 2500.00, description: "300 Mbps", baseCost: 23300.00 },
        { speed: 400, price12: 9469.00, price24: 5211.00, price36: 4736.00, installationCost: 2500.00, description: "400 Mbps", baseCost: 23300.00 },
        { speed: 500, price12: 11174.00, price24: 5789.00, price36: 5253.00, installationCost: 2500.00, description: "500 Mbps", baseCost: 23300.00 },
        { speed: 600, price12: 0, price24: 6315.00, price36: 5790.00, installationCost: 2500.00, description: "600 Mbps", baseCost: 23300.00 },
        { speed: 700, price12: 0, price24: 0, price36: 0, installationCost: 2500.00, description: "700 Mbps", baseCost: 23300.00 },
        { speed: 800, price12: 0, price24: 0, price36: 0, installationCost: 2500.00, description: "800 Mbps", baseCost: 23300.00 },
        { speed: 900, price12: 0, price24: 0, price36: 0, installationCost: 2500.00, description: "900 Mbps", baseCost: 23300.00 },
        { speed: 1000, price12: 0, price24: 0, price36: 0, installationCost: 2500.00, description: "1000 Mbps (1 Gbps)", baseCost: 23300.00 }
    ]);

    const contractTerms: ContractTerm[] = [
        { months: 12, paybackMonths: 8 },
        { months: 24, paybackMonths: 10 },
        { months: 36, paybackMonths: 11 },
        { months: 48, paybackMonths: 13 },
        { months: 60, paybackMonths: 14 }
    ];

    // Funções de cálculo
    const getMonthlyPrice = (plan: RadioPlan, term: number): number => {
        let basePrice: number;
        switch (term) {
            case 12: basePrice = plan.price12; break;
            case 24: basePrice = plan.price24; break;
            case 36: basePrice = plan.price36; break;
            case 48: basePrice = plan.price36; break; // Use 36-month price for 48 months
            case 60: basePrice = plan.price36; break; // Use 36-month price for 60 months
            default: basePrice = plan.price36; break;
        }
        // Apply 2x multiplier for Double-Radio+Fibra
        return basePrice * 2;
    };

    const getInstallationCost = (speed: number): number => {
        const plan = radioPlans.find(p => p.speed === speed);
        if (!plan) return 0;
        
        let baseCost: number;
        
        // Se há valor do projeto, calcular baseado nas faixas
        if (projectValue > 0) {
            const installationTiers: InstallationTier[] = [
                { minValue: 0, maxValue: 4500, cost: 998.00 },
                { minValue: 4500.01, maxValue: 8000, cost: 1996.00 },
                { minValue: 8000.01, maxValue: Infinity, cost: 2500.00 }
            ];
            
            const tier = installationTiers.find(t => 
                projectValue >= t.minValue && projectValue <= t.maxValue
            );
            baseCost = tier ? tier.cost : plan.installationCost;
        } else {
            // Caso contrário, usar o custo padrão do plano
            baseCost = plan.installationCost;
        }
        
        // Apply 2x multiplier for Double-Radio+Fibra installation cost
        return baseCost * 2;
    };

    const calculateResult = () => {
        const plan = radioPlans.find(p => p.speed === selectedSpeed);
        if (!plan) return null;

        const monthlyPrice = getMonthlyPrice(plan, contractTerm);
        if (monthlyPrice === 0) return null;

        const installationCost = includeInstallation ? getInstallationCost(selectedSpeed) : 0;
        const contractInfo = contractTerms.find(c => c.months === contractTerm);

        return {
            plan,
            monthlyPrice,
            installationCost,
            contractInfo,
            totalFirstMonth: monthlyPrice + installationCost,
            baseCost: plan.baseCost
        };
    };

    const result = calculateResult();

    const getDiscountedPrice = () => {
        if (!result) return 0;
        if (discount > 0) {
            return result.monthlyPrice * (1 - discount / 100);
        }
        return result.monthlyPrice;
    }

    // Funções auxiliares
    const formatCurrency = (value: number | undefined | null) => {
        if (value === undefined || value === null) return 'R$ 0,00';
        return `R$ ${value.toFixed(2).replace('.', ',')}`;
    };
    const generateUniqueId = () => `_${Math.random().toString(36).substr(2, 9)}`;

    const generateProposalNumber = (): string => {
        const currentYear = new Date().getFullYear();
        const storageKey = `doubleProposalCounter_${currentYear}`;
        
        let nextNumber = parseInt(localStorage.getItem(storageKey) || '1', 10);
        const formattedNumber = nextNumber.toString().padStart(4, '0');
        
        localStorage.setItem(storageKey, (nextNumber + 1).toString());
        
        return `Prop_Double_${formattedNumber}/${currentYear}`;
    };

    // Gerenciamento de produtos
    const handleAddProduct = () => {
        if (result) {
            const discountedPrice = getDiscountedPrice();
            const description = `Double-Radio+Fibra ${result.plan.description} - Contrato ${contractTerm} meses${includeInstallation ? ' (com instalação)' : ''}`;
            
            setAddedProducts(prev => [...prev, {
                id: generateUniqueId(),
                name: `Double-Radio+Fibra ${result.plan.description}`,
                description,
                unitPrice: discountedPrice,
                setup: result.installationCost,
                monthly: discountedPrice,
                quantity: 1,
                details: { 
                    type: 'DOUBLE_RADIO_FIBRA',
                    speed: selectedSpeed, 
                    contractTerm, 
                    includeInstallation,
                    paybackMonths: result.contractInfo?.paybackMonths || 0,
                    baseCost: result.baseCost,
                    discountApplied: discount
                }
            }]);
        }
    };

    const handleRemoveProduct = (id: string) => {
        setAddedProducts(prev => prev.filter(p => p.id !== id));
    };

    // Gerenciamento de propostas
    useEffect(() => {
        const fetchProposals = async () => {
            try {
                const token = localStorage.getItem('auth-token');
                
                const response = await fetch('/api/proposals?type=DOUBLE_RADIO_FIBRA', {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setProposals(data);
                } else {
                    console.error('Falha ao buscar propostas de Double-Radio+Fibra');
                }
            } catch (error) {
                console.error('Erro ao conectar com a API:', error);
            }
        };

        fetchProposals();
    }, []);

    // Handlers para ações das propostas
    const handleEditProposal = (proposal: Proposal) => {
        setSelectedProposal(proposal);
        setCurrentProposal(proposal);
        setShowNegotiationRounds(true);
    };

    const handleDeleteProposal = (proposal: Proposal) => {
        setSelectedProposal(proposal);
        setShowDeleteConfirmation(true);
    };

    const handleViewProposal = (proposal: Proposal) => {
        setSelectedProposal(proposal);
        setShowProposalViewer(true);
    };

    const handleDirectorDiscount = (proposal: Proposal) => {
        setSelectedProposalForDiscount(proposal);
        setShowDirectorDiscount(true);
    };

    const handleApplyDirectorDiscount = async (proposalId: string, discountPercentage: number, reason: string) => {
        try {
            if (!token) {
                throw new Error('Usuário não autenticado. Faça login novamente.');
            }

            const response = await fetch(`/api/proposals/${proposalId}/director-discount`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    discount_percentage: discountPercentage,
                    reason: reason
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao aplicar desconto da diretoria');
            }

            toast({ title: "Sucesso!", description: "Desconto da diretoria aplicado com sucesso." });
            setShowDirectorDiscount(false);
            
            // Refresh proposals list
            const fetchProposalsAfterDiscount = async () => {
                try {
                    const response = await fetch('/api/proposals?type=DOUBLE_RADIO_FIBRA', {
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
            await fetchProposalsAfterDiscount();
        } catch (error: any) {
            console.error('Erro ao aplicar desconto da diretoria:', error);
            toast({ title: "Erro", description: error.message || "Não foi possível aplicar o desconto da diretoria.", variant: "destructive" });
        }
    };

    const handleConfirmDelete = async (proposal: Proposal) => {
        try {
            if (!token) {
                throw new Error('Usuário não autenticado. Faça login novamente.');
            }

            const response = await fetch(`/api/proposals/${proposal.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao excluir a proposta');
            }

            toast({ title: "Sucesso!", description: "Proposta excluída com sucesso." });
            
            // Refresh proposals list after deletion
            const fetchProposalsAfterDelete = async () => {
                if (!token) return;
                
                try {
                    const response = await fetch('/api/proposals?type=DOUBLE_RADIO_FIBRA', {
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
            await fetchProposalsAfterDelete();
        } catch (error: any) {
            console.error('Erro ao excluir proposta:', error);
            toast({ title: "Erro", description: error.message || "Não foi possível excluir a proposta.", variant: "destructive" });
        }
    };

    const handleSaveNegotiation = async (updatedProposal: Proposal) => {
        try {
            if (!token) {
                throw new Error('Usuário não autenticado. Faça login novamente.');
            }

            const response = await fetch(`/api/proposals/${updatedProposal.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    client_data: updatedProposal.clientData,
                    account_manager_data: updatedProposal.accountManagerData,
                    products: updatedProposal.proposalItems,
                    total_setup: updatedProposal.totalSetup,
                    total_monthly: updatedProposal.totalMonthly,
                    director_discount: updatedProposal.directorDiscount,
                    negotiation_rounds: updatedProposal.negotiationRounds || [],
                    current_round: updatedProposal.currentRound || 1,
                    status: updatedProposal.status,
                    type: 'DOUBLE_RADIO_FIBRA'
                }),
            });

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (parseError) {
                    console.error('Erro ao fazer parse da resposta de erro:', parseError);
                    throw new Error(`Erro ${response.status}: ${response.statusText}`);
                }
                
                console.error('Erro na resposta da API:', {
                    status: response.status,
                    statusText: response.statusText,
                    data: errorData
                });
                
                throw new Error(errorData.error || errorData.message || `Erro ${response.status}: ${response.statusText}`);
            }

            toast({ title: "Sucesso!", description: "Proposta atualizada com sucesso." });
            setShowNegotiationRounds(false);
            
            // Refresh proposals list
            const fetchProposalsAfterSave = async () => {
                if (!token) return;
                
                try {
                    const response = await fetch('/api/proposals?type=DOUBLE_RADIO_FIBRA', {
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
            await fetchProposalsAfterSave();
        } catch (error: any) {
            console.error('Erro ao salvar proposta:', error);
            toast({ title: "Erro", description: error.message || "Não foi possível salvar a proposta.", variant: "destructive" });
        }
    };



    const handleNewProposal = () => {
        setCurrentProposal(null);
        setClientData({ name: '', email: '', phone: '' });
        setAccountManagerData({ name: '', email: '', phone: '' });
        setAddedProducts([]);
        setViewMode('client-form');
    };

    const totalSetup = addedProducts.reduce((sum, p) => sum + p.setup, 0);
    const totalMonthly = addedProducts.reduce((sum, p) => sum + p.monthly, 0);
    const finalTotalMonthly = directorDiscountData ? directorDiscountData.discountedValue : totalMonthly;

    const clearForm = () => {
        setClientData({ name: '', email: '', phone: '' });
        setAccountManagerData({ name: '', email: '', phone: '' });
        setAddedProducts([]);
        setSelectedSpeed(0);
        setContractTerm(12);
        setIncludeInstallation(true);
        setProjectValue(0);
        setDirectorDiscountData(null);
    };

    const createNewProposal = () => {
        clearForm();
        setCurrentProposal(null);
        setViewMode('client-form');
    };

    const editProposal = (proposal: Proposal) => {
        setCurrentProposal(proposal);
        setClientData(proposal.clientData || { name: '', email: '', phone: '' });
        setAccountManagerData(proposal.accountManagerData || { name: '', email: '', phone: '' });
        setAddedProducts(proposal.proposalItems || []);
        setDirectorDiscountData(proposal.directorDiscount || null);
        setViewMode('calculator');
    };

    const saveProposal = async () => {
        // Validação abrangente dos dados
        const validationErrors: string[] = [];
        
        // Validar dados do cliente
        if (!clientData.name?.trim()) {
            validationErrors.push("Nome do cliente é obrigatório");
        }
        if (!clientData.email?.trim()) {
            validationErrors.push("Email do cliente é obrigatório");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.email)) {
            validationErrors.push("Email do cliente deve ter um formato válido");
        }
        
        // Validar produtos
        if (!addedProducts || addedProducts.length === 0) {
            validationErrors.push("Adicione pelo menos um produto à proposta");
        }
        
        // Validar totais
        if (totalMonthly <= 0) {
            validationErrors.push("Total mensal deve ser maior que zero");
        }
        
        // Validar autenticação
        if (!token) {
            validationErrors.push("Usuário não autenticado. Faça login novamente.");
        }
        if (!userId) {
            validationErrors.push("ID do usuário não encontrado");
        }
        
        // Se houver erros de validação, mostrar e parar
        if (validationErrors.length > 0) {
            toast({ 
                title: "Erro de Validação", 
                description: validationErrors.join(". "), 
                variant: "destructive" 
            });
            return;
        }

        try {
            // Obtém a data atual
            const now = new Date();
            const year = now.getFullYear();
            const formattedDate = now.toISOString().split('T')[0]; // Formato YYYY-MM-DD para o campo de data
            
            // Define o tipo de proposta
            const proposalType = 'Double';
            const hasDirectorDiscount = directorDiscountData && directorDiscountData.discount > 0;
            
            // Obtém o próximo número sequencial
            const storageKey = 'doubleProposalCounter';
            let nextProposalNumber = 1;
            const savedCounter = localStorage.getItem(storageKey);
            if (savedCounter) {
                nextProposalNumber = parseInt(savedCounter, 10) + 1;
            }
            
            // Formata o número com 4 dígitos
            const formattedNumber = nextProposalNumber.toString().padStart(4, '0');
            
            // Determina a versão baseada no desconto de diretor
            const version = hasDirectorDiscount ? '_v2' : '_v1';
            
            // Cria o número da proposta no formato solicitado (apenas número/ano)
            const proposalNumber = `${formattedNumber}/${year}${version}`;
            
            // Atualiza o contador
            localStorage.setItem(storageKey, nextProposalNumber.toString());
            
            // Cria o ID da proposta
            const proposalId = `Prop_${proposalType}_${proposalNumber}`;
            
            // Preparar dados no formato esperado pelo backend
            const backendData = {
                id: proposalId,
                client_data: clientData,
                account_manager_data: accountManagerData,
                products: addedProducts.map(item => ({
                    ...item, 
                    id: `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    quantity: 1
                })),
                total_setup: Number(totalSetup),
                total_monthly: Number(finalTotalMonthly),
                director_discount: directorDiscountData,
                created_at: new Date().toISOString(),
                type: 'DOUBLE_RADIO_FIBRA',
                proposal_number: proposalId, // Usa o ID formatado como número da proposta
                status: 'pending',
                user_id: userId,
                user_email: userEmail || ''
            };

            console.log('Enviando dados para API:', backendData);

            const response = await fetch('/api/proposals', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(backendData),
            });

            let responseData;
            try {
                responseData = await response.json();
            } catch (parseError) {
                console.error('Erro ao fazer parse da resposta da API:', parseError);
                throw new Error('Resposta inválida do servidor');
            }
            
            console.log('Resposta da API:', responseData);
            
            if (!response.ok) {
                console.error('Erro na resposta da API:', {
                    status: response.status,
                    statusText: response.statusText,
                    data: responseData
                });
                
                // Tratamento específico para diferentes tipos de erro
                if (response.status === 400) {
                    throw new Error(responseData.error || 'Dados da proposta inválidos');
                } else if (response.status === 401) {
                    throw new Error('Sessão expirada. Faça login novamente.');
                } else if (response.status === 403) {
                    throw new Error('Você não tem permissão para salvar propostas');
                } else if (response.status === 500) {
                    throw new Error('Erro interno do servidor. Tente novamente.');
                } else {
                    throw new Error(responseData.error || `Erro ${response.status}: ${response.statusText}`);
                }
            }

            toast({ title: "Sucesso!", description: "Proposta salva com sucesso." });
            
            // Refresh proposals list after saving
            const fetchProposalsAfterSave = async () => {
                if (!token) return;
                
                try {
                    const response = await fetch('/api/proposals?type=DOUBLE_RADIO_FIBRA', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        setProposals(data);
                    }
                } catch (error) {
                    console.error('Erro ao buscar propostas:', error);
                }
            };
            await fetchProposalsAfterSave(); 
            setViewMode('search');
        } catch (error: any) {
            console.error('Erro detalhado ao salvar proposta:', {
                error: error,
                message: error.message,
                stack: error.stack
            });
            
            // Tratamento específico para diferentes tipos de erro
            let errorMessage = "Não foi possível salvar a proposta.";
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
            } else if (error.message.includes('não autenticado')) {
                errorMessage = "Sessão expirada. Faça login novamente.";
            } else if (error.message.includes('Dados da proposta inválidos')) {
                errorMessage = "Verifique se todos os campos obrigatórios estão preenchidos.";
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast({ 
                title: "Erro ao Salvar Proposta", 
                description: errorMessage, 
                variant: "destructive" 
            });
        }
    };

    const cancelAction = () => {
        setViewMode('search');
        setCurrentProposal(null);
        clearForm();
    };

    const filteredProposals = (proposals || []).filter(p =>
        ((p.clientData?.name || '').toLowerCase()).includes(searchTerm.toLowerCase()) ||
        (p.id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (p.proposalNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const handlePrint = () => window.print();

    // Funções para edição de preços
    const handlePriceChange = (speed: number, priceType: 'price12' | 'price24' | 'price36' | 'installationCost', value: string) => {
        const numericValue = parseFloat(value.replace(',', '.')) || 0;
        setRadioPlans(prevPlans =>
            prevPlans.map(plan =>
                plan.speed === speed
                    ? { ...plan, [priceType]: numericValue }
                    : plan
            )
        );
    };

    const handleSavePrices = async () => {
        try {
            const token = localStorage.getItem('auth-token');
            const response = await fetch('/api/double-radio-fibra-prices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ radioPlans }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Falha ao salvar os preços');
            }

            alert('Preços salvos com sucesso!');
            setIsEditingPrices(false);
        } catch (error) {
            console.error('Erro ao salvar preços:', error);
            alert('Erro ao salvar os preços');
        }
    };

    // Se estiver na tela de formulário do cliente, mostrar o formulário
    if (viewMode === 'client-form') {
        return (
            <ClientManagerForm
                clientData={clientData}
                accountManagerData={accountManagerData}
                onClientDataChange={setClientData}
                onAccountManagerDataChange={setAccountManagerData}
                onBack={() => setViewMode('search')}
                onContinue={() => setViewMode('calculator')}
                title="Nova Proposta - Double-Radio+Fibra"
                subtitle="Preencha os dados do cliente e gerente de contas para continuar."
            />
        );
    }

    return (
        <>
            <div className="p-4 md:p-8 print-hide">
                {viewMode === 'search' ? (
                    <Card className="bg-slate-900/80 border-slate-800 text-white">
                        <CardHeader>
                            <CardTitle>Buscar Propostas - Double-Radio+Fibra</CardTitle>
                            <CardDescription>Encontre propostas de Double-Radio+Fibra existentes ou crie uma nova.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4 mb-4">
                                <Input
                                    type="text"
                                    placeholder="Buscar por cliente, ID ou número da proposta..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-slate-800 border-slate-700 text-white"
                                />
                                <Button onClick={handleNewProposal} className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="h-4 w-4 mr-2" />Nova Proposta
                                </Button>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-slate-700">
                                            <TableHead className="text-white">Número da Proposta</TableHead>
                                            <TableHead className="text-white">Cliente</TableHead>
                                            <TableHead className="text-white">Data</TableHead>
                                            <TableHead className="text-white">Total Mensal</TableHead>
                                            <TableHead className="text-white">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                          {filteredProposals.map((p, index) => (
                                             <TableRow key={p.id || `proposal-${index}`} className="border-slate-800">
                                                 <TableCell>{p.proposalNumber || p.id}</TableCell>
                                                 <TableCell>{p.clientData?.name || 'N/D'}</TableCell>
                                                 <TableCell>{new Date(p.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                                                 <TableCell>{formatCurrency(p.totalMonthly)}</TableCell>
                                                 <TableCell>
                                                     <ProposalActions
                                                         proposal={p}
                                                         onEdit={handleEditProposal}
                                                         onDelete={handleDeleteProposal}
                                                         onView={handleViewProposal}
                                                         onDirectorDiscount={handleDirectorDiscount}
                                                         userRole={userRole}
                                                     />
                                                 </TableCell>
                                             </TableRow>
                                          ))}
                                      </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-white">Calculadora Double-Radio+Fibra</h1>
                                    <p className="text-slate-400 mt-2">Configure e calcule os custos para Double-Radio+Fibra</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {onBackToPanel && (
                                        <Button
                                            variant="outline"
                                            onClick={onBackToPanel}
                                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                        >
                                            ← Voltar ao Painel
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={() => setViewMode('search')}
                                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                    >
                                        ← Voltar para Buscar
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Informações do Cliente e Gerente */}
                            <ClientManagerInfo 
                                clientData={clientData}
                                accountManagerData={accountManagerData}
                            />
                        </div>

                        <Tabs defaultValue="calculator" className="w-full">
                            <TabsList className={`grid w-full ${userRole === 'admin' || userRole === 'diretor' ? 'grid-cols-4' : userRole === 'user' ? 'grid-cols-2' : 'grid-cols-1'} bg-slate-800`}>
                                <TabsTrigger value="calculator">Calculadora</TabsTrigger>
                                {(userRole === 'user' || userRole === 'admin' || userRole === 'diretor') && <TabsTrigger value="negotiation">Rodadas de Negociação</TabsTrigger>}
                                {(userRole === 'admin' || userRole === 'diretor') && <TabsTrigger value="dre">DRE</TabsTrigger>}
                                {(userRole === 'admin' || userRole === 'diretor') && <TabsTrigger value="list-price">Tabela de Preços</TabsTrigger>}
                            </TabsList>
                            
                            <TabsContent value="calculator">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                                    {/* Calculadora */}
                                    <Card className="bg-slate-900/80 border-slate-800 text-white">
                                        <CardHeader>
                                            <CardTitle className="flex items-center">
                                                <Radio className="mr-2" />Double-Radio+Fibra
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label htmlFor="speed">Velocidade</Label>
                                                    <Select onValueChange={(value) => setSelectedSpeed(Number(value))} value={selectedSpeed.toString()}>
                                                        <SelectTrigger className="bg-slate-700">
                                                            <SelectValue placeholder="Selecione a velocidade" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-slate-800 text-white">
                                                            {radioPlans.map((plan) => (
                                                                <SelectItem key={plan.speed} value={plan.speed.toString()}>
                                                                    {plan.description}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label className="text-white font-medium mb-3 block">Prazo Contratual</Label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {[12, 24, 36, 48, 60].map((months) => (
                                                            <Button
                                                                key={months}
                                                                variant={contractTerm === months ? "default" : "outline"}
                                                                onClick={() => setContractTerm(months)}
                                                                className={`px-6 py-2 ${
                                                                    contractTerm === months
                                                                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                                                                        : "border-slate-600 text-slate-300 hover:bg-slate-700"
                                                                }`}
                                                            >
                                                                {months} Meses
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2 pt-2">
                                                    <Checkbox 
                                                        id="includeInstallation" 
                                                        checked={includeInstallation} 
                                                        onCheckedChange={(checked) => setIncludeInstallation(!!checked)} 
                                                        className="border-white" 
                                                    />
                                                    <label htmlFor="includeInstallation" className="text-sm font-medium leading-none">
                                                        Incluir Taxa de Instalação
                                                    </label>
                                                </div>

                                                <div className="flex items-center space-x-2 pt-2">
                                                    <Checkbox
                                                        id="isExistingClient"
                                                        checked={isExistingClient}
                                                        onCheckedChange={(checked) => setIsExistingClient(!!checked)}
                                                        className="border-white"
                                                    />
                                                    <label htmlFor="isExistingClient" className="text-sm font-medium leading-none">
                                                        Já é cliente da base?
                                                    </label>
                                                </div>

                                                {isExistingClient && (
                                                    <div className="space-y-4">
                                                        <div>
                                                            <Label htmlFor="previousMonthlyFee">Mensalidade Anterior</Label>
                                                            <Input
                                                                id="previousMonthlyFee"
                                                                type="number"
                                                                placeholder="R$ 0,00"
                                                                value={previousMonthlyFee}
                                                                onChange={(e) => setPreviousMonthlyFee(Number(e.target.value))}
                                                                className="bg-slate-700 border-slate-600"
                                                            />
                                                        </div>
                                                        {previousMonthlyFee > 0 && result && (
                                                            <div>
                                                                <Label>Diferença (Valor Mensal - Mensalidade Anterior)</Label>
                                                                <div className={`p-3 rounded-md border ${
                                                                    (result.monthlyPrice - previousMonthlyFee) >= 0 
                                                                        ? 'bg-green-900/20 border-green-600 text-green-300'
                                                                        : 'bg-red-900/20 border-red-600 text-red-300'
                                                                }`}>
                                                                    <span className="font-semibold">
                                                                        {formatCurrency(result.monthlyPrice - previousMonthlyFee)}
                                                                    </span>
                                                                    <span className="text-sm ml-2">
                                                                        ({(result.monthlyPrice - previousMonthlyFee) >= 0 ? 'Aumento' : 'Redução'})
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="flex items-center space-x-2 pt-2">
                                                    <Checkbox
                                                        id="hasLastMile"
                                                        checked={hasLastMile}
                                                        onCheckedChange={(checked) => setHasLastMile(!!checked)}
                                                        className="border-white"
                                                    />
                                                    <label htmlFor="hasLastMile" className="text-sm font-medium leading-none">
                                                        Last Mile?
                                                    </label>
                                                </div>

                                                {hasLastMile && (
                                                    <div>
                                                        <Label htmlFor="lastMileCost">Custo (Last Mile)</Label>
                                                        <Input
                                                            id="lastMileCost"
                                                            type="number"
                                                            placeholder="R$ 0,00"
                                                            value={lastMileCost}
                                                            onChange={(e) => setLastMileCost(Number(e.target.value))}
                                                            className="bg-slate-700 border-slate-600"
                                                        />
                                                    </div>
                                                )}

                                                <div className="flex items-center space-x-2 pt-2">
                                                    <Checkbox
                                                        id="hasPartnerIndicator"
                                                        checked={hasPartnerIndicator}
                                                        onCheckedChange={(checked) => setHasPartnerIndicator(!!checked)}
                                                        className="border-white"
                                                    />
                                                    <label htmlFor="hasPartnerIndicator" className="text-sm font-medium leading-none">
                                                        PARCEIRO INDICADOR
                                                    </label>
                                                </div>

                                                <div>
                                                    <Label htmlFor="project-value">Valor do Projeto (opcional)</Label>
                                                    <Input 
                                                        id="project-value" 
                                                        type="number" 
                                                        value={projectValue || ''} 
                                                        onChange={(e) => setProjectValue(Number(e.target.value))} 
                                                        className="bg-slate-700" 
                                                        placeholder="Para cálculo da taxa de instalação"
                                                    />
                                                </div>
                                            </div>

                                            {result && (
                                                <div className="mt-6">
                                                    <Separator className="bg-slate-700 my-4" />
                                                    <div className="text-lg font-bold mb-2">Resultado:</div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span>Velocidade:</span> 
                                                            <span>{result.plan.description}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Prazo:</span> 
                                                            <span>{contractTerm} meses (Payback: {result.contractInfo?.paybackMonths} meses)</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Taxa de Instalação:</span> 
                                                            <span>{formatCurrency(result.installationCost)}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Custo Base:</span> 
                                                            <span>{formatCurrency(result.baseCost)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-green-400 font-bold">
                                                            <span>Valor Mensal:</span> 
                                                            <span>
                                                                {discount > 0 && result ? (
                                                                    <>
                                                                        <span className="line-through mr-2 text-slate-400">{formatCurrency(result.monthlyPrice)}</span>
                                                                        {formatCurrency(getDiscountedPrice())}
                                                                    </>
                                                                ) : (
                                                                    formatCurrency(result?.monthlyPrice)
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-blue-400 font-bold">
                                                            <span>Total 1º Mês:</span> 
                                                            <span>{result && formatCurrency(getDiscountedPrice() + result.installationCost)}</span>
                                                        </div>
                                                    </div>
                                                    <Button 
                                                        onClick={handleAddProduct} 
                                                        className="w-full mt-4 bg-green-600 hover:bg-green-700"
                                                    >
                                                        Adicionar à Proposta
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Lista de Produtos */}
                                    <Card className="bg-slate-900/80 border-slate-800 text-white">
                                        <CardHeader>
                                            <CardTitle>Produtos Adicionados</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {addedProducts.length === 0 ? (
                                                <p className="text-slate-400">Nenhum produto adicionado ainda.</p>
                                            ) : (
                                                <div className="space-y-4">
                                                    {addedProducts.map((product) => (
                                                        <div key={product.id} className="border border-slate-700 rounded p-4">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className="font-semibold">{product.description}</h4>
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm" 
                                                                    onClick={() => handleRemoveProduct(product.id)}
                                                                    className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                            <div className="text-sm space-y-1">
                                                                <div className="flex justify-between">
                                                                    <span>Setup:</span>
                                                                    <span>{formatCurrency(product.setup)}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>Mensal:</span>
                                                                    <span>{formatCurrency(product.monthly)}</span>
                                                                </div>
                                                                {product.details.baseCost && (
                                                                    <div className="flex justify-between text-slate-400">
                                                                        <span>Custo Base:</span>
                                                                        <span>{formatCurrency(product.details.baseCost)}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    
                                                    <Separator className="bg-slate-700" />
                                                    <div className="space-y-2 font-bold">
                                                        <div className="flex justify-between">
                                                            <span>Total Setup:</span>
                                                            <span>{formatCurrency(totalSetup)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-green-400">
                                                            <span>Total Mensal:</span>
                                                            <span>{formatCurrency(totalMonthly)}</span>
                                                        </div>
                                                        {directorDiscountData && (
                                                            <div className="flex justify-between text-blue-400">
                                                                <span>Total com Desconto de Diretor:</span>
                                                                <span>{formatCurrency(finalTotalMonthly)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Desconto de Diretor */}
                                    {userRole === 'diretor' && addedProducts.length > 0 && (
                                        <Card className="bg-slate-900/80 border-slate-800 mt-6">
                                            <CardHeader>
                                                <CardTitle className="text-yellow-400">👑 Desconto Diretoria</CardTitle>
                                                <CardDescription className="text-slate-400">Funcionalidade exclusiva para Diretores</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <DirectorDiscount
                                                    totalValue={totalMonthly}
                                                    onDiscountChange={(discount, discountedValue, reason) => {
                                                        setDirectorDiscountData({
                                                            percentage: discount,
                                                            appliedBy: userEmail || '',
                                                            appliedAt: new Date().toISOString(),
                                                            reason: reason,
                                                            originalValue: totalMonthly,
                                                            discountedValue: discountedValue
                                                        });
                                                    }}
                                                    initialDiscount={directorDiscountData?.percentage || 0}
                                                    initialReason={directorDiscountData?.reason || ''}
                                                    userEmail={userEmail || ''}
                                                />
                                            </CardContent>
                                        </Card>
                                    )}

                                    {addedProducts.length > 0 && (
                                        <Card className="bg-slate-900/80 border-slate-800 text-white mt-6">
                                            <CardContent className="pt-6">
                                                <div className="flex gap-2">
                                                    <Button onClick={saveProposal} className="flex-1 bg-green-600 hover:bg-green-700">
                                                        <Save className="h-4 w-4 mr-2" />Salvar Proposta
                                                    </Button>
                                                    <Button onClick={handlePrint} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                                                        <FileText className="h-4 w-4 mr-2" />Imprimir
                                                    </Button>
                                                    <Button onClick={cancelAction} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                                                        Cancelar
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="negotiation">
                                <Card className="bg-slate-900/80 border-slate-800 mt-6">
                                    <CardHeader>
                                        <CardTitle className="text-white">Rodadas de Negociação</CardTitle>
                                        <CardDescription className="text-slate-400">Aplique descontos à proposta.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {result ? (
                                            <div className="space-y-6">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-green-400 mb-2">Valor Inicial</h3>
                                                    <p className="text-2xl font-bold text-green-400">{formatCurrency(result.monthlyPrice)}</p>
                                                </div>

                                                <Separator className="bg-slate-700" />

                                                {/* Rodada 1 */}
                                                <div className={`border border-slate-600 rounded-lg p-4 ${userRole === 'diretor' ? 'bg-slate-800 opacity-60' : 'bg-slate-700'}`}>
                                                    <h4 className="text-lg font-semibold text-orange-400 mb-4">
                                                        Rodada 1: Vendedor/Gerente de Contas
                                                        {userRole === 'diretor' && <span className="text-xs text-slate-400 ml-2">(Somente leitura)</span>}
                                                    </h4>
                                                    <p className="text-sm text-slate-300">Desconto de 5%</p>
                                                    <p className="text-xl font-bold text-orange-400">{formatCurrency(result.monthlyPrice * 0.95)}</p>
                                                    
                                                    {userRole !== 'diretor' && (
                                                        <Button 
                                                            onClick={() => { setDiscount(5); setNegotiationRound(2); }} 
                                                            className="mt-2 bg-orange-500 hover:bg-orange-600"
                                                            disabled={negotiationRound !== 1}
                                                        >
                                                            {negotiationRound === 1 ? 'Aplicar 5% de Desconto' : 'Desconto já aplicado'}
                                                        </Button>
                                                    )}
                                                    {userRole === 'diretor' && (
                                                        <p className="text-xs text-slate-400 mt-2">Esta seção é gerenciada por vendedores e gerentes de contas</p>
                                                    )}
                                                </div>


                                                <Separator className="bg-slate-700" />

                                                {/* Desconto de Diretor */}
                                                {userRole === 'diretor' && (
                                                    <div className="border border-slate-600 rounded-lg p-4 bg-slate-700">
                                                        <h4 className="text-lg font-semibold text-orange-400 mb-4">Rodada 2: Desconto de Diretor</h4>
                                                        <DirectorDiscount
                                                            totalValue={result.monthlyPrice}
                                                            onDiscountChange={(discount, discountedValue, reason) => {
                                                                setDirectorDiscountData({
                                                                    percentage: discount,
                                                                    appliedBy: userEmail || '',
                                                                    appliedAt: new Date().toISOString(),
                                                                    reason: reason,
                                                                    originalValue: result.monthlyPrice,
                                                                    discountedValue: discountedValue
                                                                });
                                                            }}
                                                            initialDiscount={directorDiscountData?.percentage || 0}
                                                            initialReason={directorDiscountData?.reason || ''}
                                                            userEmail={userEmail || ''}
                                                        />
                                                    </div>
                                                )}
                                                
                                                <Separator className="bg-slate-700" />

                                                {/* Resumo do Desconto */}
                                                {(discount > 0 || directorDiscountData) && (
                                                    <div className="border border-slate-600 rounded-lg p-4 bg-slate-800">
                                                        <h4 className="text-lg font-semibold text-green-400 mb-4">Resumo dos Descontos Aplicados</h4>
                                                        {discount > 0 && (
                                                            <div className="mb-2">
                                                                <p className="text-slate-300">Desconto padrão: <span className="font-bold text-orange-400">{discount}%</span></p>
                                                                <p className="text-sm text-slate-400">Valor com desconto padrão: {formatCurrency(getDiscountedPrice())}</p>
                                                            </div>
                                                        )}
                                                        {directorDiscountData && (
                                                            <div className="mb-2">
                                                                <p className="text-slate-300">Desconto de diretor: <span className="font-bold text-blue-400">{directorDiscountData.percentage}%</span></p>
                                                                <p className="text-xs text-slate-400">Motivo: {directorDiscountData.reason}</p>
                                                                <p className="text-xs text-slate-400">Aplicado por: {directorDiscountData.appliedBy}</p>
                                                            </div>
                                                        )}
                                                        <p className="text-sm text-slate-400">Valor final:</p>
                                                        <p className="text-2xl font-bold text-green-400">
                                                            {formatCurrency(directorDiscountData ? directorDiscountData.discountedValue : getDiscountedPrice())}
                                                        </p>
                                                    </div>
                                                )}

                                            </div>
                                        ) : (
                                            <p className="text-slate-400">Selecione uma velocidade e um prazo para ver as opções de negociação.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="list-price">
                                <Card className="bg-slate-900/80 border-slate-800 text-white mt-6">
                                    <CardHeader>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <CardTitle>Tabela de Preços - Double-Radio+Fibra</CardTitle>
                                                <CardDescription>Valores de referência baseados na velocidade e prazo do contrato.</CardDescription>
                                            </div>
                                            <div className="flex gap-2">
                                                {!isEditingPrices ? (
                                                    <Button 
                                                        onClick={() => setIsEditingPrices(true)}
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Editar Preços
                                                    </Button>
                                                ) : (
                                                    <>
                                                        <Button 
                                                            onClick={handleSavePrices}
                                                            className="bg-green-600 hover:bg-green-700"
                                                        >
                                                            <Save className="h-4 w-4 mr-2" />
                                                            Salvar
                                                        </Button>
                                                        <Button 
                                                            onClick={() => setIsEditingPrices(false)}
                                                            variant="outline"
                                                        >
                                                            Cancelar
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-8">
                                            {/* Tabela Principal */}
                                            <div>
                                                <h3 className="text-xl font-semibold mb-4 text-center">
                                                    <span className="bg-yellow-400 text-black px-2 py-1 rounded">DOUBLE-RADIO+FIBRA</span>
                                                    <span className="text-red-500 ml-2">SEM PARCEIRO INDICADOR</span>
                                                </h3>
                                                <div className="overflow-x-auto">
                                                    <Table className="min-w-full border-collapse">
                                                        <TableHeader>
                                                            <TableRow className="bg-blue-900">
                                                                <TableHead rowSpan={2} className="text-white font-bold border border-slate-500 text-center p-2">Velocidade Mbps</TableHead>
                                                                <TableHead colSpan={5} className="text-white font-bold border border-slate-500 text-center p-2">Prazos</TableHead>
                                                                <TableHead rowSpan={2} className="text-white font-bold border border-slate-500 text-center p-2">Taxa Instalação</TableHead>
                                                            </TableRow>
                                                            <TableRow className="bg-blue-800">
                                                                <TableHead className="text-white font-bold border border-slate-500 text-center p-2">12</TableHead>
                                                                <TableHead className="text-white font-bold border border-slate-500 text-center p-2">24</TableHead>
                                                                <TableHead className="text-white font-bold border border-slate-500 text-center p-2">36</TableHead>
                                                                <TableHead className="text-white font-bold border border-slate-500 text-center p-2">48</TableHead>
                                                                <TableHead className="text-white font-bold border border-slate-500 text-center p-2">60</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {radioPlans.map((plan) => (
                                                                <TableRow key={plan.speed} className="border-slate-800">
                                                                    <TableCell className="font-semibold border border-slate-600 text-center p-2">
                                                                        {plan.speed}
                                                                    </TableCell>
                                                                    <TableCell className="border border-slate-600 text-center p-2">
                                                                        {isEditingPrices ? (
                                                                            <Input
                                                                                type="number"
                                                                                value={plan.price12 || ''}
                                                                                onChange={(e) => handlePriceChange(plan.speed, 'price12', e.target.value)}
                                                                                className="w-20 h-8 text-center bg-slate-700 border-slate-600"
                                                                                step="0.01"
                                                                            />
                                                                        ) : (
                                                                            plan.price12 > 0 ? formatCurrency(plan.price12) : '-'
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell className="border border-slate-600 text-center p-2">
                                                                        {isEditingPrices ? (
                                                                            <Input
                                                                                type="number"
                                                                                value={plan.price24 || ''}
                                                                                onChange={(e) => handlePriceChange(plan.speed, 'price24', e.target.value)}
                                                                                className="w-20 h-8 text-center bg-slate-700 border-slate-600"
                                                                                step="0.01"
                                                                            />
                                                                        ) : (
                                                                            plan.price24 > 0 ? formatCurrency(plan.price24) : '-'
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell className="border border-slate-600 text-center p-2">
                                                                        {isEditingPrices ? (
                                                                            <Input
                                                                                type="number"
                                                                                value={plan.price36 || ''}
                                                                                onChange={(e) => handlePriceChange(plan.speed, 'price36', e.target.value)}
                                                                                className="w-20 h-8 text-center bg-slate-700 border-slate-600"
                                                                                step="0.01"
                                                                            />
                                                                        ) : (
                                                                            plan.price36 > 0 ? formatCurrency(plan.price36) : '-'
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell className="border border-slate-600 text-center p-2">
                                                                        {plan.price36 > 0 ? formatCurrency(plan.price36) : '-'}
                                                                    </TableCell>
                                                                    <TableCell className="border border-slate-600 text-center p-2">
                                                                        {plan.price36 > 0 ? formatCurrency(plan.price36) : '-'}
                                                                    </TableCell>
                                                                    <TableCell className="border border-slate-600 text-center p-2">
                                                                        {isEditingPrices ? (
                                                                            <Input
                                                                                type="number"
                                                                                value={plan.installationCost || ''}
                                                                                onChange={(e) => handlePriceChange(plan.speed, 'installationCost', e.target.value)}
                                                                                className="w-20 h-8 text-center bg-slate-700 border-slate-600"
                                                                                step="0.01"
                                                                            />
                                                                        ) : (
                                                                            formatCurrency(plan.installationCost)
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                                <div className="mt-4 space-y-2">
                                                    <div className="text-sm text-blue-400">
                                                        <p>*** Produto Double - Adicionar 50% ao valor da mensalidade de RÁDIO.</p>
                                                        <p>*** Se oriundo de Parceiro Indicador - Adicionar 20% ao preço.</p>
                                                    </div>
                                                    <div className="text-xs text-slate-400 space-y-1">
                                                        <p>*** baseado em um custo médio de R$ 1.580,00 ref. ao par de rádios e equipos acessórios (25-60 Mbps)</p>
                                                        <p>*** baseado em um custo médio de R$ 5.700,00 ref. ao par de rádios e equipos acessórios (80-200 Mbps)</p>
                                                        <p>*** baseado em um custo médio de R$ 23.300,00 ref. ao par de rádios e equipos acessórios (300-600 Mbps)</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Tabela de Taxa de Instalação */}
                                            <div>
                                                <h3 className="text-lg font-semibold mb-4">Valores Taxa de Instalação</h3>
                                                <div className="max-w-md">
                                                    <Table className="border-collapse">
                                                        <TableHeader>
                                                            <TableRow className="bg-slate-800">
                                                                <TableHead className="text-white font-bold border border-slate-500 p-2">Orçamentos</TableHead>
                                                                <TableHead className="text-white font-bold border border-slate-500 p-2">Valor</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            <TableRow>
                                                                <TableCell className="border border-slate-600 p-2">Até R$ 4.500,00</TableCell>
                                                                <TableCell className="border border-slate-600 p-2 text-center">998,00</TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell className="border border-slate-600 p-2">De 4.500,01 a 8.000,00</TableCell>
                                                                <TableCell className="border border-slate-600 p-2 text-center">1.996,00</TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell className="border border-slate-600 p-2">De 8.000,01 a 27.000,00</TableCell>
                                                                <TableCell className="border border-slate-600 p-2 text-center">2.500,00</TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell className="border border-slate-600 p-2">Acima R$ 27 mil</TableCell>
                                                                <TableCell className="border border-slate-600 p-2 text-center">Verificar com a controladoria</TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>

                                            {/* Informações de Contrato */}
                                            <div>
                                                <h3 className="text-lg font-semibold mb-4">Informações de Contrato</h3>
                                                <div className="space-y-1 text-sm">
                                                    <p>Contratos de 12 meses - Payback 08 meses</p>
                                                    <p>Contratos de 24 meses - Payback 10 meses</p>
                                                    <p>Contratos de 36 meses - Payback 11 meses</p>
                                                    <p>Contratos de 48 meses - Payback 13 meses</p>
                                                    <p>Contratos de 60 meses - Payback 14 meses</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {userRole === 'admin' && (
                                <TabsContent value="dre">
                                    <DREComponent
                                        monthlyRevenue={totalMonthly}
                                        setupRevenue={totalSetup}
                                        contractPeriod={contractTerm}
                                    projectCost={projectValue}
                                    installationRate={5000}
                                    hasPartnerIndicator={hasPartnerIndicator}
                                />
                                </TabsContent>
                            )}
                        </Tabs>
                    </>
                )}
            </div>

            {/* Modais */}
            {showNegotiationRounds && selectedProposal && (
                <NegotiationRounds
                    proposal={selectedProposal}
                    onSave={handleSaveNegotiation}
                    onClose={() => setShowNegotiationRounds(false)}
                />
            )}

            {showProposalViewer && selectedProposal && (
                <ProposalViewer
                    proposal={selectedProposal}
                    isOpen={showProposalViewer}
                    onClose={() => setShowProposalViewer(false)}
                />
            )}

            <DeleteConfirmation
                proposal={selectedProposal}
                isOpen={showDeleteConfirmation}
                onClose={() => setShowDeleteConfirmation(false)}
                onConfirm={handleConfirmDelete}
            />

            {/* Modal de Desconto da Diretoria */}
            {showDirectorDiscount && selectedProposalForDiscount && (
                <DirectorDiscount
                    proposal={selectedProposalForDiscount}
                    isOpen={showDirectorDiscount}
                    onClose={() => setShowDirectorDiscount(false)}
                    onApplyDiscount={handleApplyDirectorDiscount}
                />
            )}
        </>
    );
};

export default DoubleRadioFibraCalculator;
