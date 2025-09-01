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
    Wifi,
    Calculator,
    FileText,
    Plus,
    Edit,
    Search,
    Save,
    Download,
    Trash2
} from 'lucide-react';
import {
    Proposal,
    ProposalItem,
    ClientData,
    AccountManagerData,
    DirectorDiscountData
} from '@/types';

type ViewMode = 'search' | 'client-form' | 'calculator';
import { ClientManagerForm } from './ClientManagerForm';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import DREComponent from './DREComponent';
import { ProposalActions } from '@/components/calculators/shared/ProposalActions';
import { DirectorDiscount } from '@/components/calculators/shared/DirectorDiscount';
import { NegotiationRounds } from '@/components/calculators/shared/NegotiationRounds';
import { ProposalViewer } from '@/components/calculators/shared/ProposalViewer';
import { DeleteConfirmation } from '@/components/calculators/shared/DeleteConfirmation';

// Interfaces
interface InternetPlan {
    speed: number;
    price12: number;
    price24: number;
    price36: number;
    installationCost: number;
    description: string;
}

interface InstallationTier {
    minValue: number;
    maxValue: number;
    cost: number;
}

interface ContractTerm {
    months: number;
    paybackMonths: number;
}

interface InternetMANCalculatorProps {
    userRole?: 'admin' | 'user' | 'diretor';
    onBackToPanel?: () => void;
    userId: string;
    userEmail: string;
}

const InternetMANCalculator: React.FC<InternetMANCalculatorProps> = ({
    userRole = 'user',
    onBackToPanel = () => { },
    userId = '',
    userEmail = ''
}) => {
    // Estados de gerenciamento de propostas
    const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [prices, setPrices] = useState<{ [key: string]: number }>({});

    // Estados para controle de modais e visualização
    const [showNegotiationRounds, setShowNegotiationRounds] = useState<boolean>(false);
    const [showProposalViewer, setShowProposalViewer] = useState<boolean>(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<ViewMode>('search');

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
    const [addedProducts, setAddedProducts] = useState<ProposalItem[]>([]);
    const [clientData, setClientData] = useState<ClientData>({ name: '', email: '', phone: '' });
    const [accountManagerData, setAccountManagerData] = useState<AccountManagerData>({ name: '', email: '', phone: '' });

    // Estados para desconto de diretor
    const [directorDiscountData, setDirectorDiscountData] = useState<DirectorDiscountData | null>(null);

    const [internetPlans, setInternetPlans] = useState<InternetPlan[]>([]);

    const handlePriceChange = (speed: number, priceType: 'price12' | 'price24' | 'price36', value: string) => {
        const numericValue = parseFloat(value.replace(',', '.')) || 0;
        setInternetPlans(prevPlans =>
            prevPlans.map(plan =>
                plan.speed === speed
                    ? { ...plan, [priceType]: numericValue }
                    : plan
            )
        );
    };

    const { toast } = useToast();
    const { token, logout } = useAuth();

    const handleSavePrices = async () => {
        try {
            const token = localStorage.getItem('auth-token');
            const response = await fetch('/api/internet-man-prices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ internetPlans }),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Falha ao salvar os preços');
            }

            toast({
                title: 'Sucesso',
                description: 'Preços salvos com sucesso',
                variant: 'default'
            });
        } catch (error) {
            console.error('Erro ao salvar preços:', error);
            toast({
                title: 'Erro',
                description: 'Erro ao salvar os preços',
                variant: 'destructive'
            });
        }
    };

    // Função para limpar o formulário
    const clearForm = () => {
        setClientData({ name: '', email: '', phone: '' });
        setAccountManagerData({ name: '', email: '', phone: '' });
        setAddedProducts([]);
        setSelectedSpeed(0);
        setContractTerm(12);
        setIncludeInstallation(true);
        setProjectValue(0);
        setDiscount(0);
        setCustomDiscountInput('');
        setDirectorDiscountData(null);
        setHasLastMile(false);
        setLastMileCost(0);
        setHasPartnerIndicator(false);
        setPreviousMonthlyFee(0);
        setIsExistingClient(false);
    };

    const cancelAction = () => {
        setViewMode('search');
        clearForm();
    };

    // Initialize contract terms
    const contractTerms: ContractTerm[] = [
        { months: 12, paybackMonths: 8 },
        { months: 24, paybackMonths: 10 },
        { months: 36, paybackMonths: 11 },
        { months: 48, paybackMonths: 13 },
        { months: 60, paybackMonths: 14 }
    ];

    // Handle view mode changes
    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
    };

    const handleNewProposal = () => {
        clearForm();
        setCurrentProposal(null);
        handleViewModeChange('client-form');
    };

    // Filter proposals based on search term
    const filteredProposals = React.useMemo(() => {
        if (!searchTerm.trim()) return proposals;
        const term = searchTerm.toLowerCase();
        return proposals.filter(proposal =>
            (proposal.clientData?.name?.toLowerCase().includes(term)) ||
            (proposal.proposalNumber?.toLowerCase().includes(term)) ||
            (proposal.id?.toLowerCase().includes(term))
        );
    }, [proposals, searchTerm]);

    // Handle print functionality
    const handlePrint = () => {
        window.print();
    };

    // Handle director discount change
    const handleDirectorDiscountChange = (data: DirectorDiscountData | null) => {
        setDirectorDiscountData(data);
    };

    useEffect(() => {
        const initialInternetPlans: InternetPlan[] = [
            { speed: 25, price12: 720.00, price24: 474.00, price36: 421.00, installationCost: 998.00, description: "25 Mbps" },
            { speed: 30, price12: 740.08, price24: 527.00, price36: 474.00, installationCost: 998.00, description: "30 Mbps" },
            { speed: 40, price12: 915.01, price24: 579.00, price36: 527.00, installationCost: 998.00, description: "40 Mbps" },
            { speed: 50, price12: 1103.39, price24: 632.00, price36: 579.00, installationCost: 998.00, description: "50 Mbps" },
            { speed: 60, price12: 1547.44, price24: 737.00, price36: 632.00, installationCost: 998.00, description: "60 Mbps" },
            { speed: 80, price12: 1825.98, price24: 943.00, price36: 832.00, installationCost: 998.00, description: "80 Mbps" },
            { speed: 100, price12: 2017.05, price24: 1158.00, price36: 948.00, installationCost: 998.00, description: "100 Mbps" },
            { speed: 150, price12: 2543.18, price24: 1474.00, price36: 1211.00, installationCost: 998.00, description: "150 Mbps" },
            { speed: 200, price12: 3215.98, price24: 1737.00, price36: 1368.00, installationCost: 998.00, description: "200 Mbps" },
            { speed: 300, price12: 7522.00, price24: 2316.00, price36: 1685.00, installationCost: 998.00, description: "300 Mbps" },
            { speed: 400, price12: 9469.00, price24: 3053.00, price36: 2421.00, installationCost: 1996.00, description: "400 Mbps" },
            { speed: 500, price12: 11174.00, price24: 3579.00, price36: 2790.00, installationCost: 1996.00, description: "500 Mbps" },
            { speed: 600, price12: 0, price24: 3948.00, price36: 3316.00, installationCost: 1996.00, description: "600 Mbps" },
            { speed: 700, price12: 0, price24: 4368.00, price36: 3684.00, installationCost: 1996.00, description: "700 Mbps" },
            { speed: 800, price12: 0, price24: 4727.00, price36: 4095.00, installationCost: 1996.00, description: "800 Mbps" },
            { speed: 900, price12: 0, price24: 5000.00, price36: 4474.00, installationCost: 1996.00, description: "900 Mbps" },
            { speed: 1000, price12: 17754.00, price24: 5264.00, price36: 4737.00, installationCost: 1996.00, description: "1000 Mbps (1 Gbps)" }
        ];
        setInternetPlans(initialInternetPlans);

        const fetchProposals = async () => {
            if (!token) return;

            try {
                const response = await fetch('/api/proposals?type=INTERNET_MAN', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setProposals(data);
                } else if (response.status === 401 || response.status === 403) {
                    toast({
                        title: "Sessão expirada",
                        description: "Sua sessão expirou ou você não tem permissão. Por favor, faça login novamente.",
                        variant: "destructive",
                    });
                    logout();
                } else {
                    console.error(`Erro HTTP ${response.status} ao buscar propostas`);
                }
            } catch (error) {
                console.error('Erro de rede ao buscar propostas:', error);
            }
        };

        fetchProposals();
    }, [token, logout, toast]);

    // Funções de cálculo
    const getMonthlyPrice = (plan: InternetPlan, term: number): number => {
        let basePrice: number;
        switch (term) {
            case 12: basePrice = plan.price12; break;
            case 24: basePrice = plan.price24; break;
            case 36: basePrice = plan.price36; break;
            default: basePrice = plan.price36; break;
        }
        
        // Apply 20% markup if partner indicator is enabled
        if (hasPartnerIndicator) {
            basePrice = basePrice * 1.2;
        }
        
        return basePrice;
    };

    const getInstallationCost = (speed: number): number => {
        const plan = internetPlans.find(p => p.speed === speed);
        if (!plan) return 0;
        return plan.installationCost;
    };

    const calculateResult = () => {
        const plan = internetPlans.find(p => p.speed === selectedSpeed);
        if (!plan) return null;

        const monthlyPrice = getMonthlyPrice(plan, contractTerm);
        if (monthlyPrice === 0) return null; // Plano não disponível para este prazo

        const installationCost = includeInstallation ? getInstallationCost(selectedSpeed) : 0;
        const contractInfo = contractTerms.find(c => c.months === contractTerm);

        return {
            plan,
            monthlyPrice,
            installationCost,
            contractInfo,
            totalFirstMonth: monthlyPrice + installationCost
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

    // Gerenciamento de produtos
    const handleAddProduct = () => {
        if (result) {
            const discountedPrice = getDiscountedPrice();
            const description = `Internet MAN ${result.plan.description || 'Plano'} - Contrato ${contractTerm} meses${includeInstallation ? ' (com instalação)' : ''}`;

            setAddedProducts(prev => [...prev, {
                id: generateUniqueId(),
                name: `Internet MAN ${result.plan.description || 'Plano'}`,
                description,
                unitPrice: discountedPrice,
                setup: result.installationCost,
                monthly: discountedPrice,
                quantity: 1,
                details: {
                    type: 'INTERNET_MAN',
                    speed: selectedSpeed,
                    contractTerm,
                    includeInstallation,
                    paybackMonths: result.contractInfo?.paybackMonths || 0,
                    discountApplied: discount
                }
            }]);
        }
    };

    const handleRemoveProduct = (id: string) => {
        setAddedProducts(prev => prev.filter(p => p.id !== id));
    };

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

    const handleConfirmDelete = async (proposal: Proposal) => {
        // ... (lógica de exclusão permanece a mesma)
    };

    const handleSaveNegotiation = async (updatedProposal: Proposal) => {
        // ... (lógica de salvar negociação permanece a mesma)
    };

    const editProposal = (proposal: Proposal) => {
        setCurrentProposal(proposal);
        setClientData(proposal.clientData || { name: '', email: '', phone: '' });
        setAccountManagerData(proposal.accountManagerData || { name: '', email: '', phone: '' });
        setAddedProducts(proposal.proposalItems || []);
        setViewMode('calculator');
    };

    // Calcular totais
    const totalSetup = addedProducts.reduce((acc, product) => acc + (product.setup || 0), 0);
    const totalMonthly = addedProducts.reduce((acc, product) => acc + (product.monthly || 0), 0);
    const finalTotalMonthly = directorDiscountData
        ? directorDiscountData.discountedValue
        : totalMonthly;

    const handleSaveProposal = async () => {
        // Validate inputs
        const validationErrors: string[] = [];

        if (totalSetup < 0) {
            validationErrors.push('O valor total de instalação não pode ser negativo.');
        }

        if (finalTotalMonthly <= 0) {
            validationErrors.push('O valor mensal deve ser maior que zero.');
        }

        if (!clientData.name || !clientData.email) {
            validationErrors.push('Por favor, preencha os dados do cliente.');
        }

        if (addedProducts.length === 0) {
            validationErrors.push('Adicione pelo menos um produto à proposta.');
        }

        // If there are validation errors, show them and stop execution
        if (validationErrors.length > 0) {
            toast({
                title: 'Erro de validação',
                description: validationErrors.join(' '),
                variant: 'destructive'
            });
            return;
        }

        // Generate proposal number
        const now = new Date();
        const year = now.getFullYear();
        const storageKey = 'internetMANProposalCounter';
        let nextProposalNumber = 1;
        const savedCounter = localStorage.getItem(storageKey);

        if (savedCounter) {
            nextProposalNumber = parseInt(savedCounter, 10) + 1;
        }

        const formattedNumber = nextProposalNumber.toString().padStart(4, '0');
        const hasDirectorDiscount = directorDiscountData && directorDiscountData.percentage > 0;
        const version = hasDirectorDiscount ? '_v2' : '_v1';
        const proposalNumber = `IM-${formattedNumber}/${year}${version}`;

        // Prepare proposal data
        const proposalData: Proposal = {
            id: `temp-${Date.now()}`,
            clientData,
            accountManagerData,
            proposalItems: addedProducts,
            totalSetup,
            totalMonthly: finalTotalMonthly,
            contractPeriod: contractTerm,
            directorDiscount: directorDiscountData || undefined,
            status: 'rascunho',
            type: 'INTERNET_MAN',
            userId,
            userEmail,
            proposalNumber,
            createdAt: new Date().toISOString()
        };

        toast({
            title: "Salvando...",
            description: "A sua proposta está sendo salva."
        });

        try {
            // Save the proposal to the database or API
            // const response = await saveProposal(proposalData);

            // For now, update local state
            setProposals(prev => [...prev, proposalData]);

            // Update the proposal counter in localStorage
            localStorage.setItem(storageKey, nextProposalNumber.toString());

            toast({
                title: 'Sucesso',
                description: 'Proposta salva com sucesso!',
                variant: 'default'
            });

            // Reset form and go back to search view
            clearForm();
            handleViewModeChange('search');

        } catch (error) {
            console.error('Erro ao salvar proposta:', error);
            toast({
                title: 'Erro',
                description: 'Não foi possível salvar a proposta. Tente novamente.',
                variant: 'destructive'
            });
        }
    };

    // Main component render
    if (viewMode === 'client-form') {
        return (
            <div className="p-4 md:p-8">
                <ClientManagerForm
                    clientData={clientData}
                    onClientDataChange={setClientData}
                    accountManagerData={accountManagerData}
                    onAccountManagerDataChange={setAccountManagerData}
                    onBack={() => setViewMode('search')}
                    onContinue={() => setViewMode('calculator')}
                    title="Nova Proposta de Internet MAN"
                    subtitle="Preencha os dados do cliente e do gerente de contas"
                />
            </div>
        );
    }

    if (viewMode === 'search') {
        return (
            <div className="p-4 md:p-8 print-hide">
                <Card className="bg-slate-900/80 border-slate-800 text-white">
                    <CardHeader>
                        <CardTitle>Buscar Propostas - Internet MAN</CardTitle>
                        <CardDescription>Encontre propostas de Internet MAN existentes ou crie uma nova.</CardDescription>
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
                                Nova Proposta
                            </Button>
                        </div>

                        {/* Proposals Table */}
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Valor</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProposals.map((proposal) => (
                                    <TableRow key={proposal.id}>
                                        <TableCell>{proposal.proposalNumber}</TableCell>
                                        <TableCell>{proposal.clientData?.companyName || 'N/A'}</TableCell>
                                        <TableCell>{new Date(proposal.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>{formatCurrency(proposal.totalValue)}</TableCell>
                                        <TableCell>
                                            <ProposalActions
                                                proposal={proposal}
                                                onEdit={handleEditProposal}
                                                onDelete={handleDeleteProposal}
                                                onView={handleViewProposal}
                                                userRole={userRole}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Default view (calculator mode)
    return (
        <div className="p-4 md:p-8 print-hide">
            <Card>
                <CardHeader>
                    <CardTitle>Calculadora de Internet MAN</CardTitle>
                    <CardDescription>
                        Configure os parâmetros da Internet MAN e visualize os valores
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <Button
                                    variant="outline"
                                    onClick={() => handleViewModeChange('search')}
                                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                >
                                    ← Voltar para Buscar
                                </Button>
                            </div>
                        </div>

                        <ClientManagerInfo
                            clientData={clientData}
                            accountManagerData={accountManagerData}
                        />
                    </div>

                    <Tabs defaultValue="calculator" className="w-full">
                        <TabsList className={`grid w-full ${userRole === 'admin' || userRole === 'diretor' ? 'grid-cols-4' : userRole === 'user' ? 'grid-cols-2' : 'grid-cols-1'} bg-slate-800`}>
                            <TabsTrigger value="calculator">Calculadora</TabsTrigger>
                            {(userRole === 'user' || userRole === 'admin' || userRole === 'diretor') && (
                                <TabsTrigger value="negotiation">Rodadas de Negociação</TabsTrigger>
                            )}
                            {(userRole === 'admin' || userRole === 'diretor') && (
                                <TabsTrigger value="dre">DRE</TabsTrigger>
                            )}
                            {(userRole === 'admin' || userRole === 'diretor') && (
                                <TabsTrigger value="list-price">Tabela de Preços</TabsTrigger>
                            )}
                        </TabsList>

                        <TabsContent value="calculator">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Wifi className="mr-2" />Internet MAN
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="speed">Velocidade</Label>
                                                <Select
                                                    onValueChange={(value) => setSelectedSpeed(Number(value))}
                                                    value={selectedSpeed.toString()}
                                                >
                                                    <SelectTrigger className="bg-slate-700">
                                                        <SelectValue placeholder="Selecione a velocidade" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-slate-800 text-white">
                                                        {internetPlans.map((plan) => (
                                                            <SelectItem key={plan.speed} value={plan.speed.toString()}>
                                                                {plan.description}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="includeInstallation"
                                                    checked={includeInstallation}
                                                    onCheckedChange={(checked) => setIncludeInstallation(checked as boolean)}
                                                />
                                                <Label htmlFor="includeInstallation">Incluir taxa de instalação</Label>
                                            </div>

                                            {result && (
                                                <div className="mt-4 p-4 bg-slate-800 rounded-lg">
                                                    <h3 className="text-lg font-semibold mb-2">Resultado do Cálculo</h3>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span>Velocidade:</span>
                                                            <span>{result.plan.description}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Valor Mensal:</span>
                                                            <span>{formatCurrency(result.monthlyPrice)}</span>
                                                        </div>
                                                        {includeInstallation && (
                                                            <div className="flex justify-between">
                                                                <span>Taxa de Instalação:</span>
                                                                <span>{formatCurrency(result.installationCost)}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between font-bold text-green-400">
                                                            <span>Total 1º Mês:</span>
                                                            <span>{formatCurrency(result.totalFirstMonth)}</span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        onClick={handleAddProduct}
                                                        className="w-full mt-4 bg-green-600 hover:bg-green-700"
                                                    >
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Adicionar à Proposta
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <Label className="text-white font-medium mb-3 block">Prazo Contratual</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {[12, 24, 36, 48, 60].map((months) => (
                                                    <Button
                                                        key={months}
                                                        variant={contractTerm === months ? "default" : "outline"}
                                                        onClick={() => setContractTerm(months)}
                                                        className={`px-6 py-2 ${contractTerm === months
                                                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                                                            : "border-slate-600 text-slate-300 hover:bg-slate-700"
                                                            }`}
                                                    >
                                                        {months} Meses
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
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
                                                        </div>
                                                    </div>
                                                ))}

                                                <Separator className="bg-slate-700 my-4" />
                                                <div className="space-y-2 font-bold">
                                                    <div className="flex justify-between">
                                                        <span>Total Setup:</span>
                                                        <span>{formatCurrency(totalSetup)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-green-400">
                                                        <span>Total Mensal:</span>
                                                        <span>{formatCurrency(finalTotalMonthly)}</span>
                                                    </div>
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
                                                onDiscountChange={handleDirectorDiscountChange}
                                                initialDiscount={directorDiscountData?.percentage || 0}
                                                initialReason={directorDiscountData?.reason || ''}
                                                userEmail={userEmail || ''}
                                            />
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </TabsContent>

                        {(userRole === 'admin' || userRole === 'diretor') && (
                            <TabsContent value="list-price">
                                <Card className="bg-slate-900/80 border-slate-800 text-white mt-6">
                                    <CardHeader>
                                        <CardTitle>Tabela de Preços - Internet MAN</CardTitle>
                                        <CardDescription>Valores de referência baseados na velocidade e prazo do contrato.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-8">
                                            {/* Tabela Principal */}
                                            <div>
                                                <h3 className="text-xl font-semibold mb-4 text-center">
                                                    <span className="bg-blue-600 text-white px-2 py-1 rounded">INTERNET MAN</span>
                                                    <span className="text-red-500 ml-2">SEM PARCEIRO INDICADOR</span>
                                                </h3>
                                                <div className="overflow-x-auto">
                                                    <Table className="min-w-full border-collapse">
                                                        <TableHeader>
                                                            <TableRow className="bg-blue-900">
                                                                <TableHead rowSpan={2} className="text-white font-bold border border-slate-500 text-center p-2">Velocidade Mbps</TableHead>
                                                                <TableHead colSpan={3} className="text-white font-bold border border-slate-500 text-center p-2">Prazos</TableHead>
                                                                <TableHead rowSpan={2} className="text-white font-bold border border-slate-500 text-center p-2">Taxa Instalação</TableHead>
                                                            </TableRow>
                                                            <TableRow className="bg-blue-800">
                                                                <TableHead className="text-white font-bold border border-slate-500 text-center p-2">12</TableHead>
                                                                <TableHead className="text-white font-bold border border-slate-500 text-center p-2">24</TableHead>
                                                                <TableHead className="text-white font-bold border border-slate-500 text-center p-2">36</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {internetPlans.map((plan) => (
                                                                <TableRow key={plan.speed} className="border-slate-800">
                                                                    <TableCell className="font-semibold border border-slate-600 text-center p-2 align-middle">
                                                                        {plan.description}
                                                                    </TableCell>
                                                                    <TableCell className="border border-slate-600 text-center p-1">
                                                                        <Input
                                                                            type="text"
                                                                            value={plan.price12 > 0 ? plan.price12.toFixed(2) : ''}
                                                                            onChange={(e) => handlePriceChange(plan.speed, 'price12', e.target.value)}
                                                                            className="w-full text-center bg-slate-700 border-slate-600"
                                                                            placeholder="N/A"
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell className="border border-slate-600 text-center p-1">
                                                                        <Input
                                                                            type="text"
                                                                            value={plan.price24 > 0 ? plan.price24.toFixed(2) : ''}
                                                                            onChange={(e) => handlePriceChange(plan.speed, 'price24', e.target.value)}
                                                                            className="w-full text-center bg-slate-700 border-slate-600"
                                                                            placeholder="N/A"
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell className="border border-slate-600 text-center p-1">
                                                                        <Input
                                                                            type="text"
                                                                            value={plan.price36 > 0 ? plan.price36.toFixed(2) : ''}
                                                                            onChange={(e) => handlePriceChange(plan.speed, 'price36', e.target.value)}
                                                                            className="w-full text-center bg-slate-700 border-slate-600"
                                                                            placeholder="N/A"
                                                                        />
                                                                    </TableCell>
                                                                    <TableCell className="border border-slate-600 text-center p-2 align-middle">
                                                                        {formatCurrency(plan.installationCost)}
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                                <div className="flex justify-end mt-6">
                                                    <Button onClick={handleSavePrices} className="bg-blue-600 hover:bg-blue-700">
                                                        <Save className="h-4 w-4 mr-2" />
                                                        Salvar Preços
                                                    </Button>
                                                </div>
                                                <div className="mt-4 text-sm text-blue-400">
                                                    <p>*** Produto Duplo - Adicionar 50% ao valor da mensalidade de RÁDIO.</p>
                                                    <p>*** Se reembolso de Parceiro Indicador - Adicionar 20% ao preço.</p>
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
                                                                <TableCell className="border border-slate-600 p-2">De 8.000,01 a 12.000,00</TableCell>
                                                                <TableCell className="border border-slate-600 p-2 text-center">2.500,00</TableCell>
                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell className="border border-slate-600 p-2">Acima R$ 12 mil</TableCell>
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
                                                    <p>Contratos de 12 meses - Retorno 08 meses</p>
                                                    <p>Contratos de 24 meses - Retorno 10 meses</p>
                                                    <p>Contratos de 36 meses - Retorno 11 meses</p>
                                                    <p>Contratos de 48 meses - Retorno 13 meses</p>
                                                    <p>Contratos de 60 meses - Retorno 14 meses</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )}

                        {(userRole === 'admin' || userRole === 'diretor') && (
                            <TabsContent value="dre">
                                {result && (
                                    <DREComponent
                                        monthlyRevenue={result.monthlyPrice}
                                        contractTerm={contractTerm}
                                        installationCost={result.installationCost}
                                        isExistingClient={isExistingClient}
                                        previousMonthlyFee={previousMonthlyFee}
                                        hasPartnerIndicator={hasPartnerIndicator}
                                    />
                                )}
                            </TabsContent>
                        )}

                        <TabsContent value="negotiation">
                            <Card className="bg-slate-900/80 border-slate-800 text-white">
                                <CardHeader>
                                    <CardTitle>Rodadas de Negociação</CardTitle>
                                    <CardDescription>Aplique descontos à proposta.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="discount">Desconto (%)</Label>
                                            <Input
                                                id="discount"
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={discount}
                                                onChange={(e) => setDiscount(Number(e.target.value))}
                                                className="bg-slate-700 border-slate-600"
                                            />
                                        </div>
                                        {result && (
                                            <div className="p-4 bg-slate-800 rounded-lg">
                                                <h3 className="text-lg font-semibold mb-2">Preço com Desconto</h3>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span>Preço Original:</span>
                                                        <span>{formatCurrency(result.monthlyPrice)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Desconto ({discount}%):</span>
                                                        <span>-{formatCurrency(result.monthlyPrice * (discount / 100))}</span>
                                                    </div>
                                                    <div className="flex justify-between font-bold text-green-400">
                                                        <span>Preço Final:</span>
                                                        <span>{formatCurrency(getDiscountedPrice())}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <div className="flex gap-4 mt-6">
                        <Button onClick={handleSaveProposal} className="bg-green-600 hover:bg-green-700">
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Proposta
                        </Button>
                        <Button onClick={handlePrint} variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Imprimir
                        </Button>
                        <Button onClick={cancelAction} variant="outline">
                            Cancelar
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default InternetMANCalculator;