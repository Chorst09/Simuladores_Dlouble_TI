"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Calculator, FileText, Settings, Server, Plus, Search, Trash2, Eye, Download, Edit, Cpu, MemoryStick, HardDrive, Network, Monitor, Save, BrainCircuit as Brain, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ClientManagerForm } from './ClientManagerForm';
import { ClientManagerInfo } from './ClientManagerInfo';
import { Proposal, ProposalItem, ClientData, AccountManagerData } from '@/types';
import { ProposalActions } from '@/components/calculators/shared/ProposalActions';
import { ProposalViewer } from '@/components/calculators/shared/ProposalViewer';
import { DirectorDiscount } from '@/components/calculators/shared/DirectorDiscount';



interface MaquinasVirtuaisCalculatorProps {
    userRole?: 'admin' | 'user' | 'diretor';
    onBackToPanel?: () => void;
    userId: string;
    userEmail: string;
}

const MaquinasVirtuaisCalculator: React.FC<MaquinasVirtuaisCalculatorProps> = ({ userRole, onBackToPanel, userId, userEmail }) => {
    const { token } = useAuth();
    const { toast } = useToast();
    
    // Estados de gerenciamento de propostas
    const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);
    const [viewMode, setViewMode] = useState<'search' | 'client-form' | 'calculator'>('search');
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    
    // Estados de loading e feedback
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
    
    // Estados para configurações de preços
    const [pisCofins, setPisCofins] = useState<number>(3.65);
    const [iss, setIss] = useState<number>(5.00);
    const [csllIr, setCsllIr] = useState<number>(8.88);
    const [markup, setMarkup] = useState<number>(40);
    const [commission, setCommission] = useState<number>(3.00);
    const [vcpuWindows, setVcpuWindows] = useState<number>(45.5);
    const [vcpuLinux, setVcpuLinux] = useState<number>(26.44);
    const [ramCost, setRamCost] = useState<number>(11.13);
    const [hddSas, setHddSas] = useState<number>(0.2);
    const [ssdPerformance, setSsdPerformance] = useState<number>(0.35);
    const [nvme, setNvme] = useState<number>(0.45);
    const [network1Gbps, setNetwork1Gbps] = useState<number>(0);
    const [network10Gbps, setNetwork10Gbps] = useState<number>(100);
    const [windowsServer2022, setWindowsServer2022] = useState<number>(135);
    const [windows10Pro, setWindows10Pro] = useState<number>(120);
    const [ubuntuServer, setUbuntuServer] = useState<number>(0);
    const [centosStream, setCentosStream] = useState<number>(0);
    const [debian12, setDebian12] = useState<number>(0);
    const [rockyLinux, setRockyLinux] = useState<number>(0);
    const [backupPerGb, setBackupPerGb] = useState<number>(1.25);
    const [additionalIp, setAdditionalIp] = useState<number>(35);
    const [discount12m, setDiscount12m] = useState<number>(0);
    const [discount24m, setDiscount24m] = useState<number>(5);
    const [discount36m, setDiscount36m] = useState<number>(10);
    const [discount48m, setDiscount48m] = useState<number>(15);
    const [discount60m, setDiscount60m] = useState<number>(20);
    const [setupFeeGeneral, setSetupFeeGeneral] = useState<number>(0);
    const [managementSupport, setManagementSupport] = useState<number>(250);

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
    const [proposalItems, setProposalItems] = useState<ProposalItem[]>([]);
    const [monthlySupportCost, setMonthlySupportCost] = useState<number>(250);
    
    // Estados para desconto de diretor
    const [directorDiscountData, setDirectorDiscountData] = useState<{
        percentage: number;
        appliedBy: string;
        appliedAt: string;
        reason: string;
        originalValue: number;
        discountedValue: number;
    } | null>(null);


    // Estados para regime tributário
    const [selectedTaxRegime, setSelectedTaxRegime] = useState<string>('lucro_real');

    // Estados para configurações de preço (removidos duplicados)
    const [estimatedNetMargin, setEstimatedNetMargin] = useState<number>(0);

    // Estados para tabela de comissões
    const [commissionTable, setCommissionTable] = useState([
        { months: 12, commission: 1.2 },
        { months: 24, commission: 2.4 },
        { months: 36, commission: 3.6 },
        { months: 48, commission: 4.0 },
        { months: 60, commission: 5.0 }
    ]);

    // Estados para Período do Contrato
    const [contractPeriod, setContractPeriod] = useState<number>(12);

    // Estados para salvar propostarole de abas
    const [activeTab, setActiveTab] = useState<string>('calculator');

    // Estados para rodadas de negociação
    const [currentRound, setCurrentRound] = useState<number>(1);
    const [negotiationDiscount, setNegotiationDiscount] = useState<number>(0);
    const [discountReason, setDiscountReason] = useState<string>('Desconto de 5%');

    // Estados para modal de exclusão
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [proposalToDelete, setProposalToDelete] = useState<Proposal | null>(null);

    // Estados para visualização de proposta
    const [showProposalViewer, setShowProposalViewer] = useState<boolean>(false);
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

    // Estados para configuração de VM
    const [vmName, setVmName] = useState<string>('Servidor Principal');
    const [vmCpuCores, setVmCpuCores] = useState<number>(2);
    const [vmRamGb, setVmRamGb] = useState<number>(4);
    const [vmStorageType, setVmStorageType] = useState<string>('HDD SAS');
    const [vmStorageSize, setVmStorageSize] = useState<number>(50);
    const [vmNetworkSpeed, setVmNetworkSpeed] = useState<string>('1 Gbps');
    const [vmOperatingSystem, setVmOperatingSystem] = useState<string>('Ubuntu Server 22.04 LTS');
    const [vmBackupSize, setVmBackupSize] = useState<number>(0);
    const [vmAdditionalIp, setVmAdditionalIp] = useState<boolean>(false);
    const [vmSnapshot, setVmSnapshot] = useState<boolean>(false);
    const [vmVpnSiteToSite, setVmVpnSiteToSite] = useState<boolean>(false);
    const [vmContractPeriod, setVmContractPeriod] = useState<number>(12);

    // Estados para custos de recursos VM (removidos duplicados)
    const [snapshotCost, setSnapshotCost] = useState<number>(25);
    const [vpnSiteToSiteCost, setVpnSiteToSiteCost] = useState<number>(50);

    // Dados para as tabelas de List Price

    useEffect(() => {
        const fetchProposals = async () => {
            if (!token) return;
            
            try {
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
                // Handle error silently
            }
        };

        fetchProposals();
    }, [token]);


    // Função para alterar regime tributário
    const handleTaxRegimeChange = (regime: string) => {
        setSelectedTaxRegime(regime);
        // Atualizar os valores dos impostos baseado no regime selecionado
        switch (regime) {
            case 'lucro_real':
                setPisCofins(3.65);
                setIss(5.00);
                setCsllIr(8.88);
                break;
            case 'lucro_presumido':
                setPisCofins(3.65);
                setIss(5.00);
                setCsllIr(4.80);
                break;
            case 'lucro_real_reduzido':
                setPisCofins(0.00);
                setIss(5.00);
                setCsllIr(2.40);
                break;
            case 'simples_nacional':
                setPisCofins(0.00);
                setIss(0.00);
                setCsllIr(6.00);
                break;
            default:
                break;
        }
    };

    // Cálculo dos impostos totais
    const totalTaxes = useMemo(() => {
        return pisCofins + iss + csllIr;
    }, [pisCofins, iss, csllIr]);

    // Função para calcular o custo da VM
    const calculateVMCost = useMemo(() => {
        let totalCost = 0;

        // Custo vCPU baseado no OS
        const isWindows = vmOperatingSystem.includes('Windows');
        const vcpuCost = isWindows ? vcpuWindows : vcpuLinux;
        totalCost += vmCpuCores * vcpuCost;

        // Custo RAM
        totalCost += vmRamGb * ramCost;

        // Custo Armazenamento
        let storageCost = 0;
        switch (vmStorageType) {
            case 'HDD SAS':
                storageCost = hddSas;
                break;
            case 'SSD Performance':
                storageCost = ssdPerformance;
                break;
            case 'NVMe':
                storageCost = nvme;
                break;
        }
        totalCost += vmStorageSize * storageCost;

        // Custo Rede
        if (vmNetworkSpeed === '10 Gbps') {
            totalCost += network10Gbps;
        }

        // Custo Sistema Operacional
        switch (vmOperatingSystem) {
            case 'Windows Server 2022 Standard':
                totalCost += windowsServer2022;
                break;
            case 'Windows 10 Pro':
                totalCost += windows10Pro;
                break;
            case 'Ubuntu Server 22.04 LTS':
                totalCost += ubuntuServer;
                break;
            case 'CentOS Stream 9':
                totalCost += centosStream;
                break;
            case 'Debian 12':
                totalCost += debian12;
                break;
            case 'Rocky Linux 9':
                totalCost += rockyLinux;
                break;
        }

        // Serviços Adicionais
        if (vmBackupSize > 0) {
            totalCost += vmBackupSize * backupPerGb;
        }
        if (vmAdditionalIp) {
            totalCost += additionalIp;
        }
        if (vmSnapshot) {
            totalCost += snapshotCost;
        }
        if (vmVpnSiteToSite) {
            totalCost += vpnSiteToSiteCost;
        }

        return totalCost;
    }, [
        vmCpuCores, vmRamGb, vmStorageType, vmStorageSize, vmNetworkSpeed, vmOperatingSystem,
        vmBackupSize, vmAdditionalIp, vmSnapshot, vmVpnSiteToSite,
        vcpuWindows, vcpuLinux, ramCost, hddSas, ssdPerformance, nvme,
        network1Gbps, network10Gbps, windowsServer2022, windows10Pro, ubuntuServer,
        centosStream, debian12, rockyLinux, backupPerGb, additionalIp, snapshotCost, vpnSiteToSiteCost
    ]);

    // Cálculo do desconto por período contratual
    const contractDiscount = useMemo(() => {
        switch (vmContractPeriod) {
            case 12: return 0; // 0% desconto para 12 meses
            case 24: return 5; // 5% desconto para 24 meses
            case 36: return 10; // 10% desconto para 36 meses
            case 48: return 15; // 15% desconto para 48 meses
            case 60: return 20; // 20% desconto para 60 meses
            default: return 0;
        }
    }, [vmContractPeriod]);

    // Efeito para calcular a margem líquida estimada a partir do markup
    useEffect(() => {
        if (markup >= 0) {
            const margin = (markup / (100 + markup)) * 100;
            setEstimatedNetMargin(margin);
        }
    }, [markup]);

    // Cálculo do preço final com impostos, markup e desconto por período
    const vmFinalPrice = useMemo(() => {
        const baseCost = calculateVMCost;
        const taxAmount = baseCost * (totalTaxes / 100);
        const costWithTaxes = baseCost + taxAmount;
        const priceWithMarkup = costWithTaxes * (1 + markup / 100);
        const finalPrice = priceWithMarkup * (1 - contractDiscount / 100);
        return finalPrice;
    }, [calculateVMCost, totalTaxes, markup, contractDiscount]);

    // Função para remover produto da proposta
    const handleRemoveProduct = (productId: string) => {
        setAddedProducts(prev => prev.filter(p => p.id !== productId));
    };

    // Funções auxiliares
    const formatCurrency = (value: number | undefined | null) => {
        const numValue = typeof value === 'number' && !isNaN(value) ? value : 0;
        return `R$ ${numValue.toFixed(2).replace('.', ',')}`;
    };
    const generateUniqueId = () => `_${Math.random().toString(36).substr(2, 9)}`;
    
    // Função para gerar número da proposta automaticamente
    const generateProposalNumber = (): string => {
        const existingProposalsThisYear = proposals.filter(p => 
            new Date(p.createdAt || new Date()).getFullYear() === new Date().getFullYear()
        );
        const nextNumber = existingProposalsThisYear.length + 1;
        const year = new Date().getFullYear();
        return `Prop_MV_${nextNumber.toString().padStart(4, '0')}/${year}`;
    };

    // Função para adicionar VM à proposta
    const handleAddVMProduct = () => {
        if (vmName && vmCpuCores && vmRamGb && vmStorageSize) {
            let description = `${vmName} - ${vmCpuCores} vCPU, ${vmRamGb}GB RAM, ${vmStorageSize}GB ${vmStorageType}, ${vmNetworkSpeed}, ${vmOperatingSystem}`;
            
            if (vmBackupSize > 0) {
                description += `, Backup: ${vmBackupSize}GB`;
            }
            if (vmAdditionalIp) {
                description += ', IP Adicional';
            }
            if (vmSnapshot) {
                description += ', Snapshot';
            }
            if (vmVpnSiteToSite) {
                description += ', VPN Site-to-Site';
            }

            const newProduct: ProposalItem = {
                id: generateUniqueId(),
                name: vmName,
                description,
                unitPrice: vmFinalPrice,
                quantity: 1,
                setup: setupFeeGeneral,
                monthly: vmFinalPrice,
                details: { 
                    type: 'VM',
                    cpu: vmCpuCores,
                    ram: vmRamGb,
                    storage: `${vmStorageSize}GB ${vmStorageType}`,
                    network: vmNetworkSpeed,
                    os: vmOperatingSystem,
                    backup: vmBackupSize,
                    additionalIp: vmAdditionalIp,
                    snapshot: vmSnapshot,
                    vpnSiteToSite: vmVpnSiteToSite,
                    contractPeriod: vmContractPeriod
                }
            };

            setProposalItems([...proposalItems, newProduct]);
            setAddedProducts([...addedProducts, newProduct]);
            toast({ title: "Sucesso!", description: "VM adicionada à proposta." });

            // Reset form
            setVmName('Servidor Principal');
            setVmCpuCores(2);
            setVmRamGb(4);
            setVmStorageSize(50);
            setVmBackupSize(0);
            setVmAdditionalIp(false);
            setVmSnapshot(false);
            setVmVpnSiteToSite(false);
        } else {
            toast({ title: "Erro", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
        }
    };


    // Lógica de Gerenciamento de Propostas
    const totalSetup = addedProducts.reduce((sum, p) => sum + p.setup, 0);
    const totalMonthly = addedProducts.reduce((sum, p) => sum + p.monthly, 0);
    const finalTotalMonthly = directorDiscountData ? directorDiscountData.discountedValue : totalMonthly;

    const handlePrint = () => {
        window.print();
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
        } else {
            addedProducts.forEach((product, index) => {
                if (!product.name?.trim()) {
                    validationErrors.push(`Produto ${index + 1}: Nome é obrigatório`);
                }
                if (!product.description?.trim()) {
                    validationErrors.push(`Produto ${index + 1}: Descrição é obrigatória`);
                }
                if (typeof product.monthly !== 'number' || product.monthly < 0) {
                    validationErrors.push(`Produto ${index + 1}: Valor mensal deve ser um número positivo`);
                }
                if (typeof product.setup !== 'number' || product.setup < 0) {
                    validationErrors.push(`Produto ${index + 1}: Valor de setup deve ser um número positivo`);
                }
            });
        }
        
        // Validar totais
        if (totalSetup < 0) {
            validationErrors.push("Total de setup não pode ser negativo");
        }
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

        // Obtém a data atual
        const now = new Date();
        const year = now.getFullYear();
        const formattedDate = now.toISOString().split('T')[0]; // Formato YYYY-MM-DD para o campo de data
        
        // Define o tipo de proposta
        const proposalType = 'MV';
        const hasDirectorDiscount = directorDiscountData && directorDiscountData.discount > 0;
        
        // Obtém o próximo número sequencial
        const storageKey = 'vmProposalCounter';
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

        const proposalData = {
            id: proposalId,
            client_data: clientData,
            account_manager_data: accountManagerData,
            products: addedProducts,
            total_setup: Number(totalSetup),
            total_monthly: Number(finalTotalMonthly),
            director_discount: directorDiscountData,
            status: 'Salva',
            type: 'VM',
            proposal_number: proposalNumber,
            created_at: new Date().toISOString(),
            user_id: userId || currentProposal?.userId || '',
            user_email: userEmail || currentProposal?.userEmail || '',
        };

        setIsSaving(true);
        setSaveSuccess(false);
        
        console.log('=== INÍCIO DO PROCESSO DE SALVAMENTO ===');
        console.log('Dados de entrada:', {
            clientData,
            accountManagerData,
            addedProducts: addedProducts.length,
            totalSetup,
            totalMonthly: finalTotalMonthly,
            directorDiscount: directorDiscountData,
            userId,
            userEmail
        });
        
        toast({ title: "Salvando...", description: "A sua proposta está sendo salva." });

        try {
            if (!token) {
                throw new Error('Usuário não autenticado. Faça login novamente.');
            }
            
            console.log('Enviando dados da proposta:', JSON.stringify(proposalData, null, 2));
            console.log('Token:', token);
            console.log('UserId:', userId);
            console.log('UserEmail:', userEmail);
            
            const response = await fetch('/api/proposals', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify(proposalData),
            });
            
            let responseData;
            try {
                responseData = await response.json();
            } catch (parseError) {
                console.error('Erro ao fazer parse da resposta da API:', parseError);
                console.error('Resposta raw:', await response.text());
                throw new Error('Resposta inválida do servidor');
            }
            
            console.log('Resposta da API:', responseData);
            console.log('Status da resposta:', response.status, response.statusText);
            
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
                    const response = await fetch('/api/proposals', {
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
            setSaveSuccess(true);
            setViewMode('search');
            
            console.log('=== PROPOSTA SALVA COM SUCESSO ===');
            console.log('ID da proposta salva:', proposalData.proposal_number);
            
            toast({ 
                title: "Proposta Salva!", 
                description: `Proposta ${proposalData.proposal_number} salva com sucesso.`,
                variant: "default"
            });
        } catch (error: any) {
            console.error('Erro detalhado ao salvar proposta:', {
                error: error,
                message: error.message,
                stack: error.stack,
                proposalData: proposalData
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
        } finally {
            console.log('=== FIM DO PROCESSO DE SALVAMENTO ===');
            setIsSaving(false);
        }
    };

    const filteredProposals = proposals.filter(p =>
        (p.clientData?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (p.id?.toString() || '').includes(searchTerm) ||
        (p.proposalNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    const clearForm = () => {
        setCurrentProposal(null);
        setClientData({ name: '', email: '', phone: '' });
        setAccountManagerData({ name: '', email: '', phone: '' });
        setAddedProducts([]);
        setProposalItems([]);
        setDirectorDiscountData(null);
        setVmName('Servidor Principal');
        setVmCpuCores(2);
        setVmRamGb(4);
        setVmStorageType('HDD SAS');
        setVmStorageSize(50);
        setVmNetworkSpeed('1 Gbps');
        setVmOperatingSystem('Ubuntu Server 22.04 LTS');
        setVmBackupSize(0);
        setVmAdditionalIp(false);
        setVmSnapshot(false);
        setVmVpnSiteToSite(false);
        setVmContractPeriod(12);
        setActiveTab('calculator');
        setCurrentRound(1);
        setNegotiationDiscount(0);
        setDiscountReason('Desconto de 5%');
    };

    const handleNewProposal = () => {
        clearForm();
        setViewMode('client-form');
    };

    const handleDeleteProposal = (proposal: Proposal) => {
        setProposalToDelete(proposal);
        setShowDeleteModal(true);
    };

    const handleSelectProposal = (proposal: Proposal) => {
        if (proposal) {
            setCurrentProposal(proposal);
            setAddedProducts(proposal.proposalItems || []);
            setClientData(proposal.clientData || { name: '', email: '', phone: '' });
            setAccountManagerData(proposal.accountManagerData || { name: '', email: '', phone: '' });
            setDirectorDiscountData(proposal.directorDiscount || null);
            setViewMode('calculator');
        }
    };

    const handleViewProposal = (proposal: Proposal) => {
        setSelectedProposal(proposal);
        setShowProposalViewer(true);
    };

    const confirmDeleteProposal = async () => {
        if (!proposalToDelete) return;

        try {
            if (!token) {
                throw new Error('Usuário não autenticado. Faça login novamente.');
            }

            const response = await fetch(`/api/proposals/${proposalToDelete.id}`, {
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
            await fetchProposalsAfterDelete();
            setShowDeleteModal(false);
            setProposalToDelete(null);
        } catch (error: any) {
            console.error('Erro ao excluir proposta:', error);
            toast({ title: "Erro", description: error.message || "Não foi possível excluir a proposta.", variant: "destructive" });
        }
    };

    if (viewMode === 'search') {
        return (
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Buscar Proposta de VM</CardTitle>
                    <CardDescription>Busque por propostas de Máquinas Virtuais existentes ou crie uma nova.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 mb-4">
                        <Input 
                            placeholder="Buscar por cliente ou ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button onClick={() => setSearchTerm('')}><Search className="h-4 w-4 mr-2" /> Limpar</Button>
                        <Button onClick={handleNewProposal}><Plus className="h-4 w-4 mr-2" /> Nova Proposta</Button>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Número da Proposta</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Total Mensal</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProposals.map((proposal) => (
                                <TableRow key={proposal.id}>
                                    <TableCell>{proposal.proposalNumber || proposal.id}</TableCell>
                                    <TableCell>{proposal.clientData?.name}</TableCell>
                                    <TableCell>{new Date(proposal.createdAt || '').toLocaleDateString()}</TableCell>
                                    <TableCell>{proposal.status}</TableCell>
                                    <TableCell>{formatCurrency(proposal.totalMonthly)}</TableCell>
                                    <TableCell>
                                        <ProposalActions
                                            proposal={proposal}
                                            onEdit={handleSelectProposal}
                                            onDelete={handleDeleteProposal}
                                            onView={handleViewProposal}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        );
    } else if (viewMode === 'client-form') {
        return (
            <ClientManagerForm 
                clientData={clientData} 
                onClientDataChange={setClientData} 
                accountManagerData={accountManagerData} 
                onAccountManagerDataChange={setAccountManagerData} 
                onContinue={() => setViewMode('calculator')} 
                onBack={() => setViewMode('search')}
            />
        );
    } else { // viewMode === 'calculator'
        return (
            <div className="w-full p-4 md:p-6 print-container">
                <Card className="w-full max-w-6xl mx-auto print-content">
                    <CardHeader className="flex flex-row items-center justify-between print-header">
                        <div>
                            <CardTitle className="text-2xl font-bold">Calculadora de Máquinas Virtuais</CardTitle>
                            <CardDescription>Configure e gere propostas para VMs.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 no-print">
                            <Button onClick={() => setViewMode('search')} variant="outline">Voltar para Busca</Button>
                            <Button onClick={handlePrint}><Download className="h-4 w-4 mr-2" /> Baixar PDF</Button>
                            <Button onClick={saveProposal} disabled={isSaving}>
                                {isSaving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" /> Salvar Proposta
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ClientManagerInfo 
                            clientData={clientData} 
                            accountManagerData={accountManagerData} 
                        />
                        <Separator className="my-6" />
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className={`grid w-full ${userRole === 'admin' ? 'grid-cols-5' : 'grid-cols-3'} no-print`}>
                                <TabsTrigger value="calculator"> <Calculator className="h-4 w-4 mr-2" />Calculadora</TabsTrigger>
                                <TabsTrigger value="negotiations"> <Brain className="h-4 w-4 mr-2" />Rodadas de Negociação</TabsTrigger>
                                {userRole === 'admin' && (
                                    <TabsTrigger value="dre"> <TrendingUp className="h-4 w-4 mr-2" />DRE</TabsTrigger>
                                )}
                                {userRole === 'admin' && (
                                    <TabsTrigger value="configurations"> <Settings className="h-4 w-4 mr-2" />Configurações/Lista de Preços</TabsTrigger>
                                )}
                                <TabsTrigger value="proposal"> <FileText className="h-4 w-4 mr-2" />Resumo da Proposta</TabsTrigger>
                            </TabsList>
                            <TabsContent value="calculator">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                                    {/* Coluna de Configuração da VM */}
                                    <div className="space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center text-cyan-400"><Server className="mr-2 h-5 w-5"/>Configurar Máquina Virtual</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="vm-name" className="flex items-center"><Edit className="mr-2 h-4 w-4"/>Nome da VM</Label>
                                                    <Input id="vm-name" value={vmName} onChange={(e) => setVmName(e.target.value)} placeholder="Servidor Principal" className="bg-gray-800 border-gray-600" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="vm-cpu" className="flex items-center"><Cpu className="mr-2 h-4 w-4"/>vCPU Cores</Label>
                                                        <Input id="vm-cpu" type="number" value={vmCpuCores} onChange={(e) => setVmCpuCores(Number(e.target.value))} min={1} className="bg-gray-800 border-gray-600" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="vm-ram" className="flex items-center"><MemoryStick className="mr-2 h-4 w-4"/>Memória RAM (GB)</Label>
                                                        <Input id="vm-ram" type="number" value={vmRamGb} onChange={(e) => setVmRamGb(Number(e.target.value))} min={1} className="bg-gray-800 border-gray-600" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="vm-storage-type" className="flex items-center"><HardDrive className="mr-2 h-4 w-4"/>Tipo de Armazenamento</Label>
                                                    <Select value={vmStorageType} onValueChange={setVmStorageType}>
                                                        <SelectTrigger className="bg-gray-800 border-gray-600"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="HDD SAS">HDD SAS</SelectItem>
                                                            <SelectItem value="SSD Performance">SSD Performance</SelectItem>
                                                            <SelectItem value="NVMe">NVMe</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="vm-storage-size" className="flex items-center"><HardDrive className="mr-2 h-4 w-4"/>Armazenamento {vmStorageType} (GB)</Label>
                                                    <Input id="vm-storage-size" type="number" value={vmStorageSize} onChange={(e) => setVmStorageSize(Number(e.target.value))} min={10} className="bg-gray-800 border-gray-600" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="vm-network" className="flex items-center"><Network className="mr-2 h-4 w-4"/>Placa de Rede</Label>
                                                    <Select value={vmNetworkSpeed} onValueChange={setVmNetworkSpeed}>
                                                        <SelectTrigger className="bg-gray-800 border-gray-600"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="1 Gbps">1 Gbps</SelectItem>
                                                            <SelectItem value="10 Gbps">10 Gbps</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="vm-os" className="flex items-center"><Monitor className="mr-2 h-4 w-4"/>Sistema Operacional</Label>
                                                    <Select value={vmOperatingSystem} onValueChange={setVmOperatingSystem}>
                                                        <SelectTrigger className="bg-gray-800 border-gray-600"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Ubuntu Server 22.04 LTS">Ubuntu Server 22.04 LTS</SelectItem>
                                                            <SelectItem value="Debian 12">Debian 12</SelectItem>
                                                            <SelectItem value="CentOS Stream 9">CentOS Stream 9</SelectItem>
                                                            <SelectItem value="Rocky Linux 9">Rocky Linux 9</SelectItem>
                                                            <SelectItem value="Windows Server 2022 Standard">Windows Server 2022 Standard</SelectItem>
                                                            <SelectItem value="Windows 10 Pro">Windows 10 Pro</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center text-cyan-400">Serviços Adicionais</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="vm-backup">Backup em Bloco: <span className="text-cyan-400">{vmBackupSize} GB</span></Label>
                                                    <Input id="vm-backup" type="number" value={vmBackupSize} onChange={(e) => setVmBackupSize(Number(e.target.value))} min={0} className="bg-gray-800 border-gray-600" />
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox id="vm-ip" checked={vmAdditionalIp} onCheckedChange={(checked) => setVmAdditionalIp(Boolean(checked))} className="border-gray-600" />
                                                        <Label htmlFor="vm-ip">IP Adicional</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox id="vm-snapshot" checked={vmSnapshot} onCheckedChange={(checked) => setVmSnapshot(Boolean(checked))} className="border-gray-600" />
                                                        <Label htmlFor="vm-snapshot">Snapshot Adicional</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox id="vm-vpn" checked={vmVpnSiteToSite} onCheckedChange={(checked) => setVmVpnSiteToSite(Boolean(checked))} className="border-gray-600" />
                                                        <Label htmlFor="vm-vpn">VPN Site-to-Site</Label>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Coluna de Custos e Preços */}
                                    <div className="space-y-6">
                                        {/* VM Summary Card */}
                                        {proposalItems.length > 0 && (
                                            <Card className="bg-gray-900 border-gray-700">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center text-cyan-400"><Server className="mr-2 h-5 w-5"/>Máquinas Virtuais ({proposalItems.length})</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    {proposalItems.map((item, index) => (
                                                        <div key={index} className="p-4 bg-gray-800 rounded-lg border border-gray-600">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className="font-semibold text-white">{item.name} (#{index + 1})</h4>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        const newItems = proposalItems.filter((_, i) => i !== index);
                                                                        setProposalItems(newItems);
                                                                    }}
                                                                    className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                            <div className="text-sm text-gray-300 space-y-1">
                                                                <p>{item.description}</p>
                                                                <p><strong>Placa de rede:</strong> {vmNetworkSpeed}</p>
                                                                <p><strong>Backup:</strong> {vmBackupSize} GB</p>
                                                                <p><strong>IP Adicional:</strong> {vmAdditionalIp ? 'Sim' : 'Não'}</p>
                                                                <p><strong>Snapshot Adicional:</strong> {vmSnapshot ? 'Sim' : 'Não'}</p>
                                                                <p><strong>VPN Site-to-Site:</strong> {vmVpnSiteToSite ? 'Sim' : 'Não'}</p>
                                                            </div>
                                                            <div className="mt-3 space-y-1">
                                                                <p className="text-gray-400 line-through">Mensal s/ Desc: {formatCurrency(item.unitPrice / (1 - contractDiscount / 100))}</p>
                                                                <p className="text-cyan-400">Mensal c/ Desc: {formatCurrency(item.unitPrice)}</p>
                                                                <p className="text-yellow-400 font-semibold">Total 12m: {formatCurrency(item.unitPrice * 12)}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Investment Summary */}
                                        {proposalItems.length > 0 && (
                                            <Card className="bg-gray-900 border-gray-700">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center text-cyan-400">Resumo do Investimento</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-300">Subtotal Mensal</span>
                                                        <span className="text-white font-semibold">{formatCurrency(totalMonthly)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-300">Desconto ({vmContractPeriod} Meses)</span>
                                                        <span className="text-green-400">- {formatCurrency(totalMonthly * contractDiscount / 100)} ({contractDiscount}%)</span>
                                                    </div>
                                                    <Separator className="bg-gray-600" />
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <h4 className="text-white font-semibold">Taxa de Setup</h4>
                                                            <p className="text-2xl font-bold text-white">{formatCurrency(setupFeeGeneral)}</p>
                                                        </div>
                                                        <div className="space-y-2 text-right">
                                                            <h4 className="text-cyan-400 font-semibold">Total Mensal</h4>
                                                            <p className="text-2xl font-bold text-cyan-400">{formatCurrency(totalMonthly * (1 - contractDiscount / 100))}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-cyan-400 font-semibold">Gestão e Suporte (Mensal)</span>
                                                            <span className="text-white font-semibold">{formatCurrency(monthlySupportCost)}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-sm">
                                                            <span className="text-gray-400">Total Gestão e Suporte ({vmContractPeriod} meses)</span>
                                                            <span className="text-gray-300">{formatCurrency(monthlySupportCost * vmContractPeriod)}</span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Contract Total */}
                                        {proposalItems.length > 0 && (
                                            <Card className="bg-gradient-to-r from-yellow-600 to-yellow-500 border-yellow-400">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <Calculator className="h-6 w-6 mr-3 text-yellow-900" />
                                                            <span className="text-yellow-900 font-semibold">Valor Total do Contrato</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-3xl font-bold text-yellow-900">{formatCurrency((totalMonthly * (1 - contractDiscount / 100) + monthlySupportCost) * vmContractPeriod)}</p>
                                                            <p className="text-sm text-yellow-800">({vmContractPeriod} meses)</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {/* Commercial Conditions */}
                                        <Card className="bg-gray-900 border-gray-700">
                                            <CardHeader>
                                                <CardTitle className="flex items-center text-cyan-400"><Calculator className="mr-2 h-5 w-5"/>Condições Comerciais</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <h4 className="text-white font-semibold">Prazo Contratual</h4>
                                                    <div className="grid grid-cols-5 gap-2">
                                                        {[12, 24, 36, 48, 60].map((months) => (
                                                            <Button
                                                                key={months}
                                                                variant={vmContractPeriod === months ? "default" : "outline"}
                                                                onClick={() => setVmContractPeriod(months)}
                                                                className={`${vmContractPeriod === months ? 'bg-blue-600 text-white' : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'}`}
                                                            >
                                                                {months} Meses
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Add VM Button */}
                                        <Card className="bg-gray-900 border-gray-700">
                                            <CardContent className="p-4">
                                                <div className="space-y-4">
                                                    <div className="p-4 bg-gray-800 rounded-lg">
                                                        <h4 className="font-semibold text-lg text-white mb-2">Custo Mensal da VM: {formatCurrency(vmFinalPrice)}</h4>
                                                        <p className="text-sm text-gray-400">Custo base: {formatCurrency(calculateVMCost)}</p>
                                                        <p className="text-sm text-gray-400">Desconto contratual: {contractDiscount}%</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <Button variant="outline" className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700">
                                                            <Brain className="h-4 w-4 mr-2" />Sugestão IA
                                                        </Button>
                                                        <Button onClick={handleAddVMProduct} className="bg-cyan-600 text-white hover:bg-cyan-700">
                                                            <Plus className="h-4 w-4 mr-2" />Adicionar à Proposta
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="dre">
                                <Card className="bg-slate-900/80 border-slate-800 text-white">
                                    <CardHeader>
                                        <CardTitle className="text-blue-400 flex items-center">
                                            <TrendingUp className="mr-2 h-5 w-5"/>
                                            DRE - Demonstrativo de Resultado do Exercício
                                        </CardTitle>
                                        <p className="text-slate-400 text-sm">Análise financeira e comissões por período de contrato</p>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Análise Financeira */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-200 mb-4">Análise Financeira</h3>
                                            <div className="bg-slate-800/50 rounded-lg p-6 space-y-4">
                                                {/* Receita Bruta Mensal */}
                                                {(() => {
                                                    const monthlyRevenue = totalMonthly;
                                                    const commission = commissionTable.find(c => c.months === contractPeriod)?.commission || 0;
                                                    
                                                    return (
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-slate-300">Receita Bruta Mensal:</span>
                                                                <span className="font-semibold text-green-300">
                                                                    {new Intl.NumberFormat('pt-BR', {
                                                                        style: 'currency',
                                                                        currency: 'BRL',
                                                                    }).format(monthlyRevenue)}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-slate-300">Receita Total do Contrato ({contractPeriod}m):</span>
                                                                <span className="font-semibold text-green-300">
                                                                    {new Intl.NumberFormat('pt-BR', {
                                                                        style: 'currency',
                                                                        currency: 'BRL',
                                                                    }).format(monthlyRevenue * contractPeriod)}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-slate-300">Taxa de Setup:</span>
                                                                <span className="font-semibold text-green-300">
                                                                    {new Intl.NumberFormat('pt-BR', {
                                                                        style: 'currency',
                                                                        currency: 'BRL',
                                                                    }).format(totalSetup)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                {/* Comissão do Vendedor */}
                                                {(() => {
                                                    const monthlyRevenue = totalMonthly;
                                                    const commission = commissionTable.find(c => c.months === contractPeriod)?.commission || 0;
                                                    const commissionValue = (monthlyRevenue * contractPeriod * commission) / 100;
                                                    
                                                    return (
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-slate-300">Comissão Vendedor ({commission}%):</span>
                                                                <span className="font-semibold text-red-300">
                                                                    -{new Intl.NumberFormat('pt-BR', {
                                                                        style: 'currency',
                                                                        currency: 'BRL',
                                                                    }).format(commissionValue)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                {/* Receita Líquida Total */}
                                                {(() => {
                                                    const monthlyRevenue = totalMonthly;
                                                    const totalRevenue = monthlyRevenue * contractPeriod;
                                                    const setupRevenue = totalSetup;
                                                    const commission = commissionTable.find(c => c.months === contractPeriod)?.commission || 0;
                                                    const commissionValue = (totalRevenue * commission) / 100;
                                                    const netRevenue = totalRevenue + setupRevenue - commissionValue;
                                                    const monthlyNetRevenue = netRevenue / contractPeriod;
                                                    
                                                    return (
                                                        <>
                                                            <div className="flex justify-between items-center pt-2 border-t border-slate-600">
                                                                <span className="text-slate-300 font-semibold">Receita Líquida Total:</span>
                                                                <span className="font-bold text-green-300 text-lg">
                                                                    {new Intl.NumberFormat('pt-BR', {
                                                                        style: 'currency',
                                                                        currency: 'BRL',
                                                                    }).format(netRevenue)}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-slate-300">Receita Líquida Mensal Média:</span>
                                                                <span className="font-semibold text-green-300">
                                                                    {new Intl.NumberFormat('pt-BR', {
                                                                        style: 'currency',
                                                                        currency: 'BRL',
                                                                    }).format(monthlyNetRevenue)}
                                                                </span>
                                                            </div>
                                                        </>
                                                    );
                                                })()}

                                                {/* Margem Líquida */}
                                                {(() => {
                                                    const monthlyRevenue = totalMonthly;
                                                    const totalRevenue = monthlyRevenue * contractPeriod;
                                                    const setupRevenue = totalSetup;
                                                    const grossRevenue = totalRevenue + setupRevenue;
                                                    const commission = commissionTable.find(c => c.months === contractPeriod)?.commission || 0;
                                                    const commissionValue = (totalRevenue * commission) / 100;
                                                    const netRevenue = grossRevenue - commissionValue;
                                                    const marginPercentage = grossRevenue > 0 ? ((netRevenue / grossRevenue) * 100) : 0;
                                                    
                                                    return (
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-slate-300">Margem Líquida:</span>
                                                            <span className="font-semibold text-green-300">
                                                                {marginPercentage.toFixed(2)}%
                                                            </span>
                                                        </div>
                                                    );
                                                })()}

                                                {!totalMonthly && (
                                                    <div className="text-center py-8 text-slate-400">
                                                        <p>Configure uma máquina virtual na aba Calculadora para ver a análise DRE</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="configurations">
                                <div className="space-y-6">
                                    {/* Tributos */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center text-cyan-400">
                                                <Settings className="mr-2 h-5 w-5"/>
                                                Tributos
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-4 gap-4 mb-6">
                                                <Button variant="default" className="bg-blue-600 hover:bg-blue-700">Lucro Real</Button>
                                                <Button variant="outline">Lucro Presumido</Button>
                                                <Button variant="outline">Lucro Real Reduzido</Button>
                                                <Button variant="outline">Simples Nacional</Button>
                                            </div>
                                            <div className="grid grid-cols-3 gap-6 mb-4">
                                                <div>
                                                    <Label className="text-sm font-medium">PIS/COFINS (%)</Label>
                                                    <Input type="number" value={pisCofins} onChange={(e) => setPisCofins(Number(e.target.value))} className="mt-1" />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium">ISS (%)</Label>
                                                    <Input type="number" value={iss} onChange={(e) => setIss(Number(e.target.value))} className="mt-1" />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium">CSLL/IR (%)</Label>
                                                    <Input type="number" value={csllIr} onChange={(e) => setCsllIr(Number(e.target.value))} className="mt-1" />
                                                </div>
                                            </div>
                                            <div className="text-center text-cyan-400 text-lg font-semibold mb-4">
                                                Total de Impostos do Regime Selecionado: {(pisCofins + iss + csllIr).toFixed(2)}%
                                            </div>
                                            <p className="text-sm text-gray-400">
                                                Edite os impostos de cada regime tributário. Os valores são percentuais e aceitam até 2 casas decimais.
                                            </p>
                                        </CardContent>
                                    </Card>

                                    {/* Markup e Margem Líquida + Comissões */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-cyan-400">Markup e Margem Líquida</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div>
                                                    <Label className="text-sm font-medium">% Markup sobre o Custo (%)</Label>
                                                    <Input type="number" value={markup} onChange={(e) => setMarkup(Number(e.target.value))} className="mt-1" />
                                                </div>
                                                <div>
                                                    <Label className="text-sm font-medium">% Margem Líquida Estimada (%)</Label>
                                                    <Input value={`${((markup / (100 + markup)) * 100).toFixed(2)}%`} readOnly className="mt-1 bg-gray-800" />
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="no-print">
                                            <CardHeader>
                                                <CardTitle className="text-cyan-400">Comissões</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center gap-2">
                                                    <Label className="text-sm font-medium">% Percentual sobre a Receita Bruta</Label>
                                                    <Input type="number" value={commission} onChange={(e) => setCommission(Number(e.target.value))} className="w-20" />
                                                    <span className="text-sm">%</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Recursos Base (Custos) */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-cyan-400">Recursos Base (Custos)</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 gap-8">
                                                <div>
                                                    <h4 className="text-cyan-400 font-medium mb-3">vCPU Windows (por core)</h4>
                                                    <div>
                                                        <Label className="text-sm">Custo Mensal</Label>
                                                        <Input type="number" value={vcpuWindows} onChange={(e) => setVcpuWindows(Number(e.target.value))} className="mt-1" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-cyan-400 font-medium mb-3">vCPU Linux (por core)</h4>
                                                    <div>
                                                        <Label className="text-sm">Custo Mensal</Label>
                                                        <Input type="number" value={vcpuLinux} onChange={(e) => setVcpuLinux(Number(e.target.value))} className="mt-1" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-6">
                                                <h4 className="text-cyan-400 font-medium mb-3">RAM (por GB)</h4>
                                                <div className="w-1/2">
                                                    <Label className="text-sm">Custo Mensal</Label>
                                                    <Input type="number" value={ramCost} onChange={(e) => setRamCost(Number(e.target.value))} className="mt-1" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Armazenamento (Custos) */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-cyan-400">Armazenamento (Custos)</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 gap-8 mb-6">
                                                <div>
                                                    <h4 className="text-cyan-400 font-medium mb-3">HDD SAS</h4>
                                                    <div>
                                                        <Label className="text-sm">Custo Mensal</Label>
                                                        <Input type="number" value={hddSas} onChange={(e) => setHddSas(Number(e.target.value))} className="mt-1" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-cyan-400 font-medium mb-3">SSD Performance</h4>
                                                    <div>
                                                        <Label className="text-sm">Custo Mensal</Label>
                                                        <Input type="number" value={ssdPerformance} onChange={(e) => setSsdPerformance(Number(e.target.value))} className="mt-1" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-1/2">
                                                <h4 className="text-cyan-400 font-medium mb-3">NVMe</h4>
                                                <div>
                                                    <Label className="text-sm">Custo Mensal</Label>
                                                    <Input type="number" value={nvme} onChange={(e) => setNvme(Number(e.target.value))} className="mt-1" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Placa de Rede (Custos) */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-cyan-400">Placa de Rede (Custos)</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 gap-8">
                                                <div>
                                                    <h4 className="text-cyan-400 font-medium mb-3">1 Gbps</h4>
                                                    <div>
                                                        <Label className="text-sm">Custo Mensal</Label>
                                                        <Input type="number" value={0} className="mt-1" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-cyan-400 font-medium mb-3">10 Gbps</h4>
                                                    <div>
                                                        <Label className="text-sm">Custo Mensal</Label>
                                                        <Input type="number" value={network10Gbps} onChange={(e) => setNetwork10Gbps(Number(e.target.value))} className="mt-1" />
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Sistema Operacional e Serviços (Custos) */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-cyan-400">Sistema Operacional e Serviços (Custos)</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 gap-8 mb-6">
                                                <div>
                                                    <h4 className="text-cyan-400 font-medium mb-3">Windows Server 2022 Standard</h4>
                                                    <div>
                                                        <Label className="text-sm">Custo Mensal</Label>
                                                        <Input type="number" value={windowsServer2022} onChange={(e) => setWindowsServer2022(Number(e.target.value))} className="mt-1" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-cyan-400 font-medium mb-3">Windows 10 Pro</h4>
                                                    <div>
                                                        <Label className="text-sm">Custo Mensal</Label>
                                                        <Input type="number" value={windows10Pro} onChange={(e) => setWindows10Pro(Number(e.target.value))} className="mt-1" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-8 mb-6">
                                                <div>
                                                    <h4 className="text-cyan-400 font-medium mb-3">Ubuntu Server 22.04 LTS</h4>
                                                    <div>
                                                        <Label className="text-sm">Custo Mensal</Label>
                                                        <Input type="number" value={ubuntuServer} onChange={(e) => setUbuntuServer(Number(e.target.value))} className="mt-1" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-cyan-400 font-medium mb-3">CentOS Stream 9</h4>
                                                    <div>
                                                        <Label className="text-sm">Custo Mensal</Label>
                                                        <Input type="number" value={centosStream} onChange={(e) => setCentosStream(Number(e.target.value))} className="mt-1" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-8 mb-6">
                                                <div>
                                                    <h4 className="text-cyan-400 font-medium mb-3">Debian 12</h4>
                                                    <div>
                                                        <Label className="text-sm">Custo Mensal</Label>
                                                        <Input type="number" value={debian12} onChange={(e) => setDebian12(Number(e.target.value))} className="mt-1" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-cyan-400 font-medium mb-3">Rocky Linux 9</h4>
                                                    <div>
                                                        <Label className="text-sm">Custo Mensal</Label>
                                                        <Input type="number" value={rockyLinux} onChange={(e) => setRockyLinux(Number(e.target.value))} className="mt-1" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-8">
                                                <div>
                                                    <h4 className="text-cyan-400 font-medium mb-3">Backup (por GB)</h4>
                                                    <div>
                                                        <Label className="text-sm">Custo Mensal</Label>
                                                        <Input type="number" value={backupPerGb} onChange={(e) => setBackupPerGb(Number(e.target.value))} className="mt-1" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-cyan-400 font-medium mb-3">IP Adicional</h4>
                                                    <div>
                                                        <Label className="text-sm">Custo Mensal</Label>
                                                        <Input type="number" value={additionalIp} onChange={(e) => setAdditionalIp(Number(e.target.value))} className="mt-1" />
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Prazos Contratuais e Descontos */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-cyan-400">Prazos Contratuais e Descontos</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 gap-8 mb-6">
                                                <div>
                                                    <h4 className="text-cyan-400 font-medium mb-3">12 Meses</h4>
                                                    <div>
                                                        <Label className="text-sm">Desconto (%)</Label>
                                                        <Input type="number" value={discount12m} onChange={(e) => setDiscount12m(Number(e.target.value))} className="mt-1" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-cyan-400 font-medium mb-3">24 Meses</h4>
                                                    <div>
                                                        <Label className="text-sm">Desconto (%)</Label>
                                                        <Input type="number" value={discount24m} onChange={(e) => setDiscount24m(Number(e.target.value))} className="mt-1" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-8 mb-6">
                                                <div>
                                                    <h4 className="text-cyan-400 font-medium mb-3">36 Meses</h4>
                                                    <div>
                                                        <Label className="text-sm">Desconto (%)</Label>
                                                        <Input type="number" value={discount36m} onChange={(e) => setDiscount36m(Number(e.target.value))} className="mt-1" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-cyan-400 font-medium mb-3">48 Meses</h4>
                                                    <div>
                                                        <Label className="text-sm">Desconto (%)</Label>
                                                        <Input type="number" value={discount48m} onChange={(e) => setDiscount48m(Number(e.target.value))} className="mt-1" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-1/2">
                                                <h4 className="text-cyan-400 font-medium mb-3">60 Meses</h4>
                                                <div>
                                                    <Label className="text-sm">Desconto (%)</Label>
                                                    <Input type="number" value={discount60m} onChange={(e) => setDiscount60m(Number(e.target.value))} className="mt-1" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Taxa de Setup */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-cyan-400">Taxa de Setup</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="w-1/2">
                                                <h4 className="text-cyan-400 font-medium mb-3">Taxa de Setup Geral</h4>
                                                <div>
                                                    <Label className="text-sm">Valor Base</Label>
                                                    <Input type="number" value={setupFeeGeneral} onChange={(e) => setSetupFeeGeneral(Number(e.target.value))} className="mt-1" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Gestão e Suporte */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-cyan-400">Gestão e Suporte</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="w-1/2 mb-6">
                                                <h4 className="text-cyan-400 font-medium mb-3">Serviço Mensal de Gestão e Suporte</h4>
                                                <div>
                                                    <Label className="text-sm">Valor Mensal</Label>
                                                    <Input type="number" value={managementSupport} onChange={(e) => setManagementSupport(Number(e.target.value))} className="mt-1" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Tabela de Comissões */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-cyan-400">Tabela de Comissões</CardTitle>
                                            <CardDescription className="text-slate-400">
                                                Configure as comissões por período de contrato
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="bg-slate-800/50 rounded-lg p-4">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="border-slate-700">
                                                            <TableHead className="text-slate-300 font-bold">Período (meses)</TableHead>
                                                            <TableHead className="text-slate-300 font-bold">Comissão (%)</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {commissionTable.map((item, index) => (
                                                            <TableRow key={item.months} className="border-slate-700">
                                                                <TableCell className="text-slate-200 font-medium">{item.months}</TableCell>
                                                                <TableCell className="text-slate-200">
                                                                    <Input
                                                                        type="number"
                                                                        step="0.1"
                                                                        value={item.commission}
                                                                        onChange={(e) => {
                                                                            const newTable = [...commissionTable];
                                                                            newTable[index].commission = Number(e.target.value);
                                                                            setCommissionTable(newTable);
                                                                        }}
                                                                        className="w-20 bg-slate-700 border-slate-600"
                                                                    />
                                                                    <span className="ml-1">%</span>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                            <div className="flex justify-end mt-6">
                                                <Button className="bg-blue-600 hover:bg-blue-700">
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Salvar Configurações
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                            <TabsContent value="negotiations">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Rodadas de Negociação</CardTitle>
                                        <CardDescription>Aplique descontos à proposta.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Valor Inicial */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-green-400 mb-2">Valor Inicial</h3>
                                            <p className="text-2xl font-bold text-green-400">{formatCurrency(totalMonthly)}</p>
                                        </div>

                                        {/* Rodada Atual */}
                                        <div className={`border border-gray-600 rounded-lg p-4 ${userRole === 'diretor' ? 'bg-gray-800 opacity-60' : 'bg-gray-800'}`}>
                                            <h3 className="text-lg font-semibold text-orange-400 mb-4">
                                                Rodada {currentRound}: Vendedor/Gerente de Contas
                                                {userRole === 'diretor' && <span className="text-xs text-gray-400 ml-2">(Somente leitura)</span>}
                                            </h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label htmlFor="discount-reason">Motivo do Desconto</Label>
                                                    <Input 
                                                        id="discount-reason"
                                                        value={discountReason}
                                                        onChange={(e) => setDiscountReason(e.target.value)}
                                                        placeholder="Ex: Desconto de 5%"
                                                        className="mt-1"
                                                        disabled={userRole === 'diretor'}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="discount-percentage">Desconto (%)</Label>
                                                    <Input 
                                                        id="discount-percentage"
                                                        type="number"
                                                        value={negotiationDiscount}
                                                        onChange={(e) => setNegotiationDiscount(Number(e.target.value))}
                                                        min="0"
                                                        max="100"
                                                        className="mt-1"
                                                        disabled={userRole === 'diretor'}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">Valor com desconto:</p>
                                                    <p className="text-xl font-bold text-orange-400">
                                                        {formatCurrency(totalMonthly * (1 - negotiationDiscount / 100))}
                                                    </p>
                                                </div>
                                                {userRole !== 'diretor' && (
                                                    <Button 
                                                        className="bg-orange-500 hover:bg-orange-600"
                                                        onClick={() => {
                                                            // Aplicar desconto aos produtos
                                                            const discountedProducts = addedProducts.map(product => ({
                                                                ...product,
                                                                monthly: product.monthly * (1 - negotiationDiscount / 100)
                                                            }));
                                                            setAddedProducts(discountedProducts);
                                                            setCurrentRound(currentRound + 1);
                                                            setNegotiationDiscount(0);
                                                            setDiscountReason('');
                                                            toast({ title: "Desconto Aplicado!", description: `Desconto de ${negotiationDiscount}% aplicado com sucesso.` });
                                                        }}
                                                    >
                                                        Aplicar {negotiationDiscount}% de Desconto
                                                    </Button>
                                                )}
                                                {userRole === 'diretor' && (
                                                    <p className="text-xs text-gray-400">Esta seção é gerenciada por vendedores e gerentes de contas</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Desconto de Diretor */}
                                        {userRole === 'diretor' && (
                                            <div className="border border-blue-600 rounded-lg p-4 bg-blue-900/20">
                                                <h3 className="text-lg font-semibold text-blue-400 mb-4">
                                                    Desconto de Diretor
                                                </h3>
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
                                            </div>
                                        )}

                                        {/* Resumo dos Descontos */}
                                        {(negotiationDiscount > 0 || directorDiscountData) && (
                                            <div className="border border-green-600 rounded-lg p-4 bg-green-900/20">
                                                <h3 className="text-lg font-semibold text-green-400 mb-4">Resumo dos Descontos Aplicados</h3>
                                                {negotiationDiscount > 0 && (
                                                    <div className="mb-2">
                                                        <p className="text-gray-300">Desconto padrão: <span className="font-bold text-orange-400">{negotiationDiscount}%</span></p>
                                                        <p className="text-sm text-gray-400">Valor com desconto padrão: {formatCurrency(totalMonthly * (1 - negotiationDiscount / 100))}</p>
                                                    </div>
                                                )}
                                                {directorDiscountData && (
                                                    <div className="mb-2">
                                                        <p className="text-gray-300">Desconto de diretor: <span className="font-bold text-blue-400">{directorDiscountData.percentage}%</span></p>
                                                        <p className="text-xs text-gray-400">Motivo: {directorDiscountData.reason}</p>
                                                        <p className="text-xs text-gray-400">Aplicado por: {directorDiscountData.appliedBy}</p>
                                                    </div>
                                                )}
                                                <p className="text-sm text-gray-400">Valor final:</p>
                                                <p className="text-2xl font-bold text-green-400">
                                                    {formatCurrency(directorDiscountData ? directorDiscountData.discountedValue : totalMonthly * (1 - negotiationDiscount / 100))}
                                                </p>
                                            </div>
                                        )}

                                        {/* Botões de Ação */}
                                        <div className="flex gap-4 pt-4">
                                            <Button 
                                                onClick={saveProposal}
                                                disabled={isSaving}
                                                className="bg-green-600 hover:bg-green-700 text-white border-green-600 disabled:opacity-50"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Salvando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4 mr-2" />
                                                        Salvar Proposta
                                                    </>
                                                )}
                                            </Button>
                                            <Button variant="outline" onClick={handlePrint}>
                                                <Download className="h-4 w-4 mr-2" />
                                                Imprimir
                                            </Button>
                                            <Button variant="outline" onClick={() => setViewMode('search')}>
                                                Cancelar
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="proposal">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Resumo da Proposta</CardTitle>
                                        <CardDescription>Revise os itens antes de salvar ou imprimir.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Descrição</TableHead>
                                                    <TableHead className="text-right">Setup</TableHead>
                                                    <TableHead className="text-right">Mensal</TableHead>
                                                    <TableHead className="no-print"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {addedProducts.map((p) => (
                                                    <TableRow key={p.id}>
                                                        <TableCell>{p.description}</TableCell>
                                                        <TableCell className="text-right">{formatCurrency(p.setup)}</TableCell>
                                                        <TableCell className="text-right">{formatCurrency(p.monthly)}</TableCell>
                                                        <TableCell className="text-right no-print">
                                                            <Button variant="ghost" size="icon" onClick={() => handleRemoveProduct(p.id)}>
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                    <CardFooter className="flex-col space-y-4">
                                        <div className="w-full text-right font-bold text-lg">
                                            <p>Total Setup: {formatCurrency(totalSetup)}</p>
                                            <p>Total Mensal: {formatCurrency(totalMonthly)}</p>
                                            {directorDiscountData && (
                                                <p className="text-blue-400">Total com Desconto de Diretor: {formatCurrency(finalTotalMonthly)}</p>
                                            )}
                                        </div>
                                        
                                        {/* Desconto de Diretor */}
                                        {userRole === 'diretor' && (
                                            <div className="w-full">
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
                                            </div>
                                        )}
                                    </CardFooter>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Modal de Confirmação de Exclusão */}
                <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tem certeza que deseja excluir a proposta "{proposalToDelete?.proposalNumber || proposalToDelete?.id}" 
                                do cliente "{proposalToDelete?.clientData?.name}"?
                                <br /><br />
                                <strong>Esta ação não pode ser desfeita.</strong>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => {
                                setShowDeleteModal(false);
                                setProposalToDelete(null);
                            }}>
                                Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction 
                                onClick={confirmDeleteProposal}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Excluir Proposta
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Modal de Visualização de Proposta */}
                {showProposalViewer && selectedProposal && (
                    <ProposalViewer
                        proposal={selectedProposal}
                        isOpen={showProposalViewer}
                        onClose={() => setShowProposalViewer(false)}
                    />
                )}
            </div>
        );
    }
};

export default MaquinasVirtuaisCalculator;
