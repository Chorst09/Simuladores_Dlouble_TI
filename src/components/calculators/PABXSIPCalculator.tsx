"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Phone, PhoneForwarded, Plus, Search, Save, Download } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Proposal, ProposalItem, ClientData, AccountManagerData, PABXPriceRange } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

import DREComponent from '@/components/calculators/DREComponent';
import { ProposalActions } from '@/components/calculators/shared/ProposalActions';
import { NegotiationRounds } from '@/components/calculators/shared/NegotiationRounds';
import { ProposalViewer } from '@/components/calculators/shared/ProposalViewer';
import { DeleteConfirmation } from '@/components/calculators/shared/DeleteConfirmation';
import { DirectorDiscount } from '@/components/calculators/shared/DirectorDiscount';
import { ClientManagerForm } from './ClientManagerForm';



import NovaPropostaModal from './NovaPropostaModal';
import { PlanModalitySelector } from './PlanModalitySelector';
import { PremiumPlanSelector } from './PremiumPlanSelector';
import { BillingTypeSelector } from './BillingTypeSelector';
import { ContractPeriodSelector } from './ContractPeriodSelector';

import { validateCalculationReadiness, validatePriceAvailability, createValidationState, PABXValidationContext } from '@/utils/pabxValidation';
import { ValidationSummary } from './shared/ValidationSummary';
import { pabxPremiumPrices } from '@/data/pabxPremiumPrices';

// Interfaces
interface PABXResult {
    setup: number;
    baseMonthly: number;
    deviceRentalCost: number;
    aiAgentCost: number;
    totalMonthly: number;
}

interface SIPResult {
    setup: number;
    monthly: number;
}

type AIPlanKey = '20K' | '40K' | '60K' | '100K' | '150K' | '200K';

// Utility function to ensure backward compatibility for PABX configuration
const ensurePABXConfigCompatibility = (item: ProposalItem): ProposalItem => {
    // If pabxConfig already exists, return as is
    if (item.pabxConfig) {
        return item;
    }

    // If details contains PABX configuration, migrate it to pabxConfig
    if (item.details && (item.details.modality || item.details.premiumPlan || item.details.premiumBillingType)) {
        return {
            ...item,
            pabxConfig: {
                modality: item.details.modality || 'standard',
                premiumPlan: item.details.premiumPlan || null,
                premiumBillingType: item.details.premiumBillingType || null,
                contractPeriod: item.details.contractPeriod || null,
            }
        };
    }

    // For items without PABX configuration, return as is
    return item;
};
type SIPPriceKey = '5' | '10' | '20' | '30';
type DTRPriceKey = '4' | '10' | '30';

interface PABXSIPCalculatorProps {
    userRole?: 'admin' | 'diretor' | 'user';
    onBackToPanel?: () => void;
    userId: string;
    userEmail: string;
    userName?: string;
}

const PABXSIPCalculator: React.FC<PABXSIPCalculatorProps> = ({ userRole, onBackToPanel, userId, userEmail, userName }) => {
    const { token, logout } = useAuth();

    // Estado para controlar a tela atual
    const [currentView, setCurrentView] = useState<'search' | 'client-form' | 'calculator'>('search');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [savedProposals, setSavedProposals] = useState<Proposal[]>([]);
    const [showNovaPropostaModal, setShowNovaPropostaModal] = useState<boolean>(false);

    const handleNewProposal = async () => {
        // Limpar proposta atual para garantir que é uma nova proposta
        setCurrentProposal(null);
        setSelectedProposal(null);
        setShowNovaPropostaModal(true);
    };

    // Função para fechar o modal
    const handleCloseModal = () => {
        setShowNovaPropostaModal(false);
    };

    // Função para continuar com os dados da proposta
    const handleContinueWithProposal = (data: any) => {
        // Atualizar os dados do cliente e gerente
        setClientData({
            name: data.cliente.name,
            projectName: data.cliente.projectName,
            email: data.cliente.email,
            phone: data.cliente.phone
        });

        setAccountManagerData({
            name: data.gerente.name,
            email: data.gerente.email,
            phone: data.gerente.phone
        });

        // Fechar modal e ir para calculadora
        setShowNovaPropostaModal(false);
        setCurrentView('calculator');
        setSearchTerm('');
    };

    const handleEditProposalModal = (proposal: Proposal) => {

        // Carregar dados da proposta no estado para o modal
        setCurrentProposal(proposal);
        setSelectedProposal(proposal);

        // Pré-preencher os dados no modal
        const clientInfo = proposal.clientData || {};
        const managerInfo = proposal.accountManagerData || {};

        // Carregar produtos da proposta com compatibilidade PABX
        const products = (proposal.proposalItems || []).map(ensurePABXConfigCompatibility);
        setProposalItems(products);

        // Carregar desconto de diretor se existir
        const directorDiscountData = proposal.directorDiscount || proposal.director_discount;
        if (directorDiscountData) {
            setDirectorDiscount(directorDiscountData.percentage || 0);
            setDirectorDiscountReason(directorDiscountData.reason || '');
            setFinalTotalMonthly(directorDiscountData.discounted_value || 0);
        } else {
            setDirectorDiscount(0);
            setDirectorDiscountReason('');
            setFinalTotalMonthly(0);
        }

        // Carregar configuração PABX se existir
        const pabxConfig = proposal.pabxConfiguration || proposal.pabx_configuration;
        if (pabxConfig) {
            setPabxModality(pabxConfig.modality || 'standard');
            
            // Carregar outras configurações PABX se disponíveis
            if (pabxConfig.extensions !== undefined) {
                setPabxExtensions(pabxConfig.extensions);
            }
            if (pabxConfig.includeSetup !== undefined) {
                setPabxIncludeSetup(pabxConfig.includeSetup || pabxConfig.include_setup);
            }
            if (pabxConfig.includeDevices !== undefined) {
                setPabxIncludeDevices(pabxConfig.includeDevices || pabxConfig.include_devices);
            }
            if (pabxConfig.deviceQuantity !== undefined) {
                setPabxDeviceQuantity(pabxConfig.deviceQuantity || pabxConfig.device_quantity);
            }
            if (pabxConfig.includeAI !== undefined) {
                setPabxIncludeAI(pabxConfig.includeAI || pabxConfig.include_ai);
            }
            if (pabxConfig.aiPlan) {
                setPabxAIPlan(pabxConfig.aiPlan || pabxConfig.ai_plan);
            }
            setPremiumPlan(pabxConfig.premiumPlan || pabxConfig.premium_plan || null);
            setPremiumBillingType(pabxConfig.premiumBillingType || pabxConfig.premium_billing_type || null);
            setPremiumContractPeriod(pabxConfig.contractPeriod || pabxConfig.contract_period || null);
        } else {
            // Reset para valores padrão se não houver configuração
            setPabxModality('standard');
            setPremiumPlan(null);
            setPremiumBillingType(null);
            setPremiumContractPeriod(null);
        }

        // Abrir modal com dados preenchidos
        setShowNovaPropostaModal(true);
    };

    // Estados dos dados do cliente e gerente
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

    // Estados PABX
    const [pabxExtensions, setPabxExtensions] = useState<number>(32);
    const [pabxIncludeSetup, setPabxIncludeSetup] = useState<boolean>(true);
    const [pabxIncludeDevices, setPabxIncludeDevices] = useState<boolean>(true);
    const [pabxDeviceQuantity, setPabxDeviceQuantity] = useState<number>(5);
    const [pabxIncludeAI, setPabxIncludeAI] = useState<boolean>(true);
    const [pabxAIPlan, setPabxAIPlan] = useState<AIPlanKey>('100K');
    const [pabxResult, setPabxResult] = useState<PABXResult | null>(null);
    const [pabxModality, setPabxModality] = useState<'standard' | 'premium'>('standard');
    const [premiumPlan, setPremiumPlan] = useState<'essencial' | 'professional' | null>(null);
    const [premiumBillingType, setPremiumBillingType] = useState<'ilimitado-sem-aparelho' | 'ilimitado-com-aparelho' | 'tarifado-sem-aparelho' | 'tarifado-com-aparelho' | null>(null);
    const [premiumContractPeriod, setPremiumContractPeriod] = useState<'24' | '36' | null>(null);

    

    // Estados SIP
    const [sipPlan, setSipPlan] = useState<string>('SIP ILIMITADO 10 Canais');
    const [sipIncludeSetup, setSipIncludeSetup] = useState<boolean>(false);
    const [sipAdditionalChannels, setSipAdditionalChannels] = useState<number>(0);
    const [sipWithEquipment, setSipWithEquipment] = useState<boolean>(true);
    const [sipResult, setSipResult] = useState<SIPResult | null>(null);

    // Estados da Proposta
    const [proposalItems, setProposalItems] = useState<ProposalItem[]>([]);

    // Estados para edição das tabelas
    const [isEditingPABX, setIsEditingPABX] = useState(false);
    const [isEditingPremium, setIsEditingPremium] = useState(false);
    const [editablePremiumPrices, setEditablePremiumPrices] = useState(pabxPremiumPrices);
    
    const [isEditingSIP, setIsEditingSIP] = useState(false);
    
    // Estados para edição da tabela AI
    const [isEditingAI, setIsEditingAI] = useState(false);

    

    // Estados para Markup e Margem
    const [markup, setMarkup] = useState<number>(30);
    const [estimatedNetMargin, setEstimatedNetMargin] = useState<number>(0);
    const [commissionPercentage, setCommissionPercentage] = useState<number>(3);

    // Estados para DRE
    const [dreCommissionTable] = useState([
        { months: 12, commission: 1.2 },
        { months: 24, commission: 2.4 },
        { months: 36, commission: 3.6 },
        { months: 48, commission: 4.0 },
        { months: 60, commission: 5.0 }
    ]);

    // Estados para Período do Contrato
    const [contractPeriod, setContractPeriod] = useState<number>(12);
    const [hasPartnerIndicator, setHasPartnerIndicator] = useState<boolean>(false);

    // Estados para rodadas de negociação
    const [currentRound, setCurrentRound] = useState<number>(1);

    const [discountReason, setDiscountReason] = useState<string>('Desconto de 5%');
    const [activeTab, setActiveTab] = useState<string>('calculator');

    // Estados para desconto de diretor
    const [directorDiscount, setDirectorDiscount] = useState<number>(0);
    const [directorDiscountReason, setDirectorDiscountReason] = useState<string>('');
    const [finalTotalMonthly, setFinalTotalMonthly] = useState<number>(0);

    // Estados para modais e funcionalidades compartilhadas
    const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
    const [showNegotiationRounds, setShowNegotiationRounds] = useState<boolean>(false);
    const [showProposalViewer, setShowProposalViewer] = useState<boolean>(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<boolean>(false);

    // Debug useEffect
    useEffect(() => {
        console.log('Estado showNegotiationRounds mudou:', showNegotiationRounds);
        console.log('Estado selectedProposal mudou:', selectedProposal?.id);
    }, [showNegotiationRounds, selectedProposal]);

    // Debug userRole
    useEffect(() => {
        console.log('PABXSIPCalculator - userRole:', userRole);
        console.log('DirectorDiscount será renderizado?', userRole === 'diretor');
    }, [userRole]);

    // Função para gerar número de proposta com versão
    const generateProposalNumber = (type: 'PABX' | 'SIP', hasDirectorDiscount: boolean): string => {
        const currentYear = new Date().getFullYear();
        const storageKey = `${type.toLowerCase()}ProposalCounter_${currentYear}`;

        // Tenta obter o contador do localStorage
        let counter = 1;
        const savedCounter = localStorage.getItem(storageKey);
        if (savedCounter) {
            counter = parseInt(savedCounter, 10) + 1;
        }

        // Formata o contador com 4 dígitos
        const formattedCounter = counter.toString().padStart(4, '0');

        // Determina a versão baseada no tipo de usuário
        const version = hasDirectorDiscount ? '_v2' : '_v1';

        // Atualiza o contador no localStorage
        localStorage.setItem(storageKey, counter.toString());

        // Retorna o número da proposta formatado
        return `Prop_${type}/${formattedCounter}/${currentYear}${version}`;
    };
    const [currentProposal, setCurrentProposal] = useState<Proposal | null>(null);

    // Hook para toast
    const { toast } = useToast();


    useEffect(() => {
        if (userName || userEmail) {
            setAccountManagerData(prev => ({
                ...prev,
                name: userName || prev.name,
                email: userEmail || prev.email,
            }));
        }
    }, [userName, userEmail]);



    // Salvar preços SIP editados
    const handleSaveSIP = () => {
        localStorage.setItem('sipPrices', JSON.stringify(sipPrices));
        localStorage.setItem('sipConfig', JSON.stringify(sipConfig));
        setIsEditingSIP(false);
        alert('Preços SIP salvos com sucesso!');
    };

    // Salvar preços Premium editados
    const handleSavePremium = () => {
        localStorage.setItem('pabxPremiumPrices', JSON.stringify(editablePremiumPrices));
        setIsEditingPremium(false);
        alert('Preços PABX Premium salvos com sucesso!');
    };

    // Função para formatar número como moeda BRL
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    // Dados de preços do List Price - PABX (editáveis)
    const [pabxPrices, setPabxPrices] = useState({
        standard: {
            setup: {
                '10': 1250,
                '20': 2000,
                '30': 2500,
                '50': 3000,
                '100': 3500,
                '500': 0, // Valor a combinar
                '1000': 0 // Valor a combinar
            },
            monthly: {
                '10': 30,
                '20': 29,
                '30': 28,
                '50': 27,
                '100': 26,
                '500': 25,
                '1000': 24.5
            },
            hosting: {
                '10': 200,
                '20': 220,
                '30': 250,
                '50': 300,
                '100': 400,
                '500': 0, // Valor a combinar
                '1000': 0 // Valor a combinar
            },
            device: {
                '10': 35,
                '20': 34,
                '30': 33,
                '50': 32,
                '100': 30,
                '500': 0, // Valor a combinar
                '1000': 0 // Valor a combinar
            }
        },
        
    });

    // Dados de preços do List Price - SIP (editáveis)
    const [sipPrices, setSipPrices] = useState({
        'SIP TARIFADO Call Center 2 Canais': { setup: 0, monthly: 200, monthlyWithEquipment: null, channels: 2 },
        'SIP TARIFADO 2 Canais': { setup: 0, monthly: 150, monthlyWithEquipment: null, channels: 2 },
        'SIP TARIFADO 4 Canais': { setup: 0, monthly: 250, monthlyWithEquipment: 500, channels: 4 },
        'SIP TARIFADO 10 Canais': { setup: 0, monthly: 350, monthlyWithEquipment: 500, channels: 10 },
        'SIP TARIFADO 30 Canais': { setup: 0, monthly: 550, monthlyWithEquipment: 1200, channels: 30 },
        'SIP TARIFADO 60 Canais': { setup: 0, monthly: 1000, monthlyWithEquipment: null, channels: 60 },
        'SIP ILIMITADO 5 Canais': { setup: 0, monthly: 350, monthlyWithEquipment: 500, channels: 5 },
        'SIP ILIMITADO 10 Canais': { setup: 0, monthly: 450, monthlyWithEquipment: 600, channels: 10 },
        'SIP ILIMITADO 20 Canais': { setup: 0, monthly: 650, monthlyWithEquipment: 800, channels: 20 },
        'SIP ILIMITADO 30 Canais': { setup: 0, monthly: 850, monthlyWithEquipment: 950, channels: 30 },
        'SIP ILIMITADO 60 Canais': { setup: 0, monthly: 1600, monthlyWithEquipment: 1700, channels: 60 }
    });

    // Dados de preços do List Price - Agente IA (editáveis)
    const [sipConfig, setSipConfig] = useState({
        additionalChannels: {
            assinatura: {
                '5': { max: 3, price: 30 },
                '10': { max: 5, price: 20 },
                '20': { max: 3, price: 20 },
                '30': { max: 20, price: 5 },
            },
            franquia: {
                '4': { max: 10, price: 25 },
                '10': { max: 20, price: 25 },
                '30': { max: 30, price: 25 },
            },
        },
        includedMinutes: {
            '5': 15000,
            '10': 20000,
            '20': 25000,
            '30': 30000,
            '60': 60000,
        },
        includedNumbers: {
            callCenter: 'Consultar',
            tarifado: {
                '2': 'Máximo 3 Números',
                '4': 'Máximo 4 Números',
                '10': 'Máximo 5 Números',
                '30': 'Máximo 5 Números',
            },
            ilimitado: {
                '5': 'Máximo 10 Números',
                '10': 'Máximo 15 Números',
                '20': 'Máximo 20 Números',
                '30': 'Máximo 30 Números',
                '60': 'Máximo 30 Números',
            }
        },
        additionalNumberPrice: 10,
        tariffs: {
            localFixo: { callCenter: 0.015, tarifado: 0.02 },
            dddFixo: { callCenter: 0.05, tarifado: 0.06 },
            brasilMovel: { callCenter: 0.09, default: 0.10 },
        },
    });

    // Dados de preços do List Price - Agente IA (editáveis)
    const [aiAgentPrices, setAiAgentPrices] = useState({
        '20K': { price: 720, credits: 20000, messages: 10000, minutes: 2000, premium: 1000 },
        '40K': { price: 1370, credits: 40000, messages: 20000, minutes: 4000, premium: 2000 },
        '60K': { price: 1940, credits: 60000, messages: 30000, minutes: 6000, premium: 3000 },
        '100K': { price: 3060, credits: 100000, messages: 50000, minutes: 10000, premium: 5000 },
        '150K': { price: 4320, credits: 150000, messages: 75000, minutes: 15000, premium: 7500 },
        '200K': { price: 5400, credits: 200000, messages: 100000, minutes: 20000, premium: 10000 }
    });

    // Função para determinar a faixa de preço baseada no número de ramais
    const getPriceRange = (extensions: number): PABXPriceRange => {
        if (extensions <= 10) return '10';
        if (extensions <= 20) return '20';
        if (extensions <= 30) return '30';
        if (extensions <= 50) return '50';
        if (extensions <= 100) return '100';
        if (extensions <= 500) return '500';
        return '1000'; // Para valores acima de 1000
    };

    // Helper function to get Premium price range
    const getPremiumPriceRange = (extensions: number): keyof typeof pabxPremiumPrices['24']['essencialIlimitado'] => {
        if (extensions >= 2 && extensions <= 9) return '2-9';
        if (extensions >= 10 && extensions <= 19) return '10-19';
        if (extensions >= 20 && extensions <= 49) return '20-49';
        if (extensions >= 50 && extensions <= 99) return '50-99';
        if (extensions >= 100 && extensions <= 199) return '100-199';
        return '200+'; // 200 or more
    };

    // Calcular PABX
    const calculatePABX = () => {
        // Create validation context
        const validationContext: PABXValidationContext = {
            modality: pabxModality,
            premiumPlan: premiumPlan,
            premiumBillingType: premiumBillingType,
            contractPeriod: premiumContractPeriod,
            extensions: pabxExtensions
        };

        // Validate calculation readiness
        const readinessValidation = validateCalculationReadiness(validationContext);
        if (!readinessValidation.isValid) {
            toast({
                title: "Erro de Validação",
                description: readinessValidation.errors.join('. '),
                variant: "destructive"
            });
            return;
        }

        let setup = 0;
        let baseMonthly = 0;
        let deviceRentalCost = 0;

        if (pabxModality === 'premium' && premiumPlan && premiumBillingType && premiumContractPeriod) {
            // Use Premium pricing
            const contractPeriod = premiumContractPeriod;
            const premiumRange = getPremiumPriceRange(pabxExtensions);
            
            // Extract base plan type and equipment option from billing type
            const isIlimitado = premiumBillingType.startsWith('ilimitado');
            const hasEquipment = premiumBillingType.includes('com-aparelho');
            
            // Build the plan key based on plan and base billing type
            const baseBillingType = isIlimitado ? 'Ilimitado' : 'Tarifado';
            const planKey = `${premiumPlan}${baseBillingType}` as keyof typeof pabxPremiumPrices['36'];
            
            const premiumPlanPrices = editablePremiumPrices[contractPeriod][planKey];
            const priceData = premiumPlanPrices[premiumRange];
            
            // Use the equipment option from the billing type selection
            const monthlyPrice = hasEquipment ? priceData.withEquipment : priceData.withoutEquipment;
            
            setup = pabxIncludeSetup ? 1000 : 0; // Standard setup fee for Premium
            baseMonthly = monthlyPrice * pabxExtensions;
            deviceRentalCost = 0; // Already included in Premium pricing
        } else {
            // Use Standard pricing (existing logic)
            const range = getPriceRange(pabxExtensions);
            let currentPabxPrices = pabxPrices.standard;

            // Check for "a combinar" values (500+ ramais) and handle appropriately
            const setupPrice = currentPabxPrices.setup[range];
            const hostingPrice = currentPabxPrices.hosting[range];
            const devicePrice = currentPabxPrices.device[range];
            
            setup = pabxIncludeSetup ? setupPrice : 0;
            baseMonthly = (currentPabxPrices.monthly[range] * pabxExtensions) + hostingPrice;
            deviceRentalCost = pabxIncludeDevices ? (devicePrice * pabxDeviceQuantity) : 0;
        }
        
        const aiAgentCost = pabxIncludeAI ? aiAgentPrices[pabxAIPlan]?.price || 0 : 0;

        const result: PABXResult = {
            setup,
            baseMonthly,
            deviceRentalCost,
            aiAgentCost,
            totalMonthly: baseMonthly + deviceRentalCost + aiAgentCost
        };

        setPabxResult(result);
    };

    // Calcular SIP
    const calculateSIP = () => {
        const planPrice = sipPrices[sipPlan as keyof typeof sipPrices];

        if (!planPrice) {
            setSipResult({ setup: 0, monthly: 0 });
            return;
        }

        const setup = sipIncludeSetup ? 50 : 0; // Taxa padrão de setup SIP
        const monthly = sipWithEquipment && planPrice.monthlyWithEquipment !== null
            ? planPrice.monthlyWithEquipment
            : planPrice.monthly;

        const result: SIPResult = {
            setup,
            monthly
        };

        setSipResult(result);
    };

    // Adicionar PABX à proposta
    const addPABXToProposal = () => {
        if (!pabxResult) return;

        let description = `PABX Standard - ${pabxExtensions} ramais`;
        let name = `PABX Standard - ${pabxExtensions} ramais`;

        // Check for "a combinar" values
        const range = getPriceRange(pabxExtensions);
        const currentPrices = pabxPrices.standard;
        
        const hasACombinarValues = (pabxExtensions > 100 && 
            (currentPrices.setup[range] === 0 || currentPrices.hosting[range] === 0 || currentPrices.device[range] === 0));
        
        if (hasACombinarValues) {
            description += ' (Alguns valores a combinar)';
        }

        const newItem: ProposalItem = {
            id: `PABX-${Date.now()}-${Math.random()}`,
            name,
            description,
            unitPrice: pabxResult.totalMonthly,
            setup: pabxResult.setup,
            monthly: pabxResult.totalMonthly,
            quantity: 1,
            pabxConfig: {
                modality: pabxModality,
                premiumPlan: premiumPlan,
                premiumBillingType: premiumBillingType,
                contractPeriod: premiumContractPeriod,
            },
            details: {
                modality: pabxModality,
                premiumPlan: premiumPlan,
                premiumBillingType: premiumBillingType,
                contractPeriod: premiumContractPeriod,
                extensions: pabxExtensions,
                includeSetup: pabxIncludeSetup,
                includeDevices: pabxIncludeDevices,
                deviceQuantity: pabxDeviceQuantity,
                includeAI: pabxIncludeAI,
                aiPlan: pabxIncludeAI ? pabxAIPlan : null,
                hasACombinarValues
            }
        };

        setProposalItems(prev => [...prev, newItem]);
    };

    // Adicionar SIP à proposta
    const addSIPToProposal = () => {
        if (!sipResult) return;

        const newItem: ProposalItem = {
            id: `SIP-${Date.now()}-${Math.random()}`,
            name: sipPlan,
            description: sipPlan,
            unitPrice: sipResult.monthly,
            setup: sipResult.setup,
            monthly: sipResult.monthly,
            quantity: 1
        };

        setProposalItems(prev => [...prev, newItem]);
    };

    // Calcular totais da proposta
    const totalSetup = proposalItems.reduce((sum, item) => sum + item.setup, 0);
    const totalMonthly = proposalItems.reduce((sum, item) => sum + item.monthly, 0);
    const initialTotalMonthly = proposalItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

    // Atualizar total final quando totalMonthly muda
    useEffect(() => {
        if (directorDiscount > 0) {
            setFinalTotalMonthly(totalMonthly * (1 - directorDiscount / 100));
        } else {
            setFinalTotalMonthly(totalMonthly);
        }
    }, [totalMonthly, directorDiscount]);

    // Função para salvar proposta
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
        if (!proposalItems || proposalItems.length === 0) {
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
            const proposalType = 'PABX/SIP';
            const hasDirectorDiscount = directorDiscount > 0;

            // Obtém o próximo número sequencial
            const storageKey = 'pabxProposalCounter';
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
            const proposalId = `Prop_${proposalType.split('/').join('_')}_${proposalNumber}`;

            const proposalToSave = {
                id: proposalId,
                clientData: clientData,
                accountManagerData: accountManagerData,
                proposalItems: proposalItems.map(item => ({
                    ...ensurePABXConfigCompatibility(item),
                    id: `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    quantity: 1
                })),
                totalSetup: totalSetup,
                totalMonthly: totalMonthly,
                contractPeriod: contractPeriod,
                status: 'Pendente',
                type: 'PABX_SIP',
                createdAt: new Date().toISOString(),
                userId: userId,
                userEmail: userEmail || '',
                pabxConfiguration: {
                    modality: pabxModality,
                    premiumPlan: premiumPlan,
                    premiumBillingType: premiumBillingType,
                    contractPeriod: premiumContractPeriod,
                    extensions: pabxExtensions,
                    includeSetup: pabxIncludeSetup,
                    includeDevices: pabxIncludeDevices,
                    deviceQuantity: pabxDeviceQuantity,
                    includeAI: pabxIncludeAI,
                    aiPlan: pabxIncludeAI ? pabxAIPlan : null
                }
            };

            // Lógica de salvamento via API
            const storedToken = localStorage.getItem('auth-token') || token;

            if (!storedToken) {
                throw new Error('Token de autenticação não encontrado. Faça login novamente.');
            }

            // Preparar dados no formato esperado pelo backend
            const backendData = {
                id: proposalId,
                client_data: clientData,
                account_manager_data: accountManagerData,
                products: proposalItems.map(item => ({
                    ...ensurePABXConfigCompatibility(item),
                    id: `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    quantity: 1
                })),
                total_setup: Number(totalSetup),
                total_monthly: Number(finalTotalMonthly || totalMonthly),
                created_at: new Date().toISOString(),
                type: 'PABX_SIP',
                proposal_number: `PABX-${Date.now().toString().slice(-8)}`,
                status: 'pending',
                user_id: userId,
                user_email: userEmail || '',
                pabx_configuration: {
                    modality: pabxModality,
                    premium_plan: premiumPlan,
                    premium_billing_type: premiumBillingType,
                    extensions: pabxExtensions,
                    include_setup: pabxIncludeSetup,
                    include_devices: pabxIncludeDevices,
                    device_quantity: pabxDeviceQuantity,
                    include_ai: pabxIncludeAI,
                    ai_plan: pabxIncludeAI ? pabxAIPlan : null
                },
                directorDiscount: directorDiscount > 0 ? {
                    percentage: directorDiscount,
                    applied_by: userEmail || '',
                    applied_at: new Date().toISOString(),
                    reason: directorDiscountReason,
                    original_value: totalMonthly,
                    discounted_value: finalTotalMonthly
                } : undefined
            };

            console.log('Token sendo enviado:', storedToken);
            console.log('Dados enviados:', backendData);
            console.log('URL da API:', '/api/proposals');

            const response = await fetch('/api/proposals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${storedToken}`,
                },
                credentials: 'include',
                body: JSON.stringify(backendData),
            });

            if (response.status === 401) {
                localStorage.removeItem('auth-token');
                throw new Error('Token inválido ou expirado. Faça login novamente.');
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Erro ${response.status}: ${errorText}`);
            }

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
                    const response = await fetch('/api/proposals?type=PABX_SIP', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setSavedProposals(data);
                    }
                } catch (error) {
                    console.error('Erro ao buscar propostas:', error);
                }
            };
            await fetchProposalsAfterSave();
            setCurrentView('search');
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

    // Carregar propostas da API
    useEffect(() => {
        const fetchProposals = async () => {
            const storedToken = localStorage.getItem('auth-token') || token;

            if (!storedToken) {
                // Não é mais necessário um aviso aqui, pois o logout lidará com isso
                return;
            }

            try {
                const response = await fetch('/api/proposals?type=PABX_SIP', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${storedToken}`,
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    setSavedProposals(Array.isArray(data) ? data : []);
                } else if (response.status === 401 || response.status === 403) {
                    toast({
                        title: "Sessão expirada",
                        description: "Sua sessão expirou ou você não tem permissão. Por favor, faça login novamente.",
                        variant: "destructive",
                    });
                    logout();
                } else {
                    console.error(`Erro HTTP ${response.status} ao buscar propostas`);
                    setSavedProposals([]);
                }
            } catch (error) {
                console.error('Erro de rede ao buscar propostas:', error);
                setSavedProposals([]);
            }
        };

        if (token) {
            fetchProposals();
        }
    }, [token, logout, toast]);

    // Efeito para calcular a margem líquida estimada a partir do markup
    useEffect(() => {
        if (markup >= 0) {
            const margin = (markup / (100 + markup)) * 100;
            setEstimatedNetMargin(margin);
        }
    }, [markup]);

    // Calcular automaticamente quando os valores mudarem
    useEffect(() => {
        calculatePABX();
    }, [pabxExtensions, pabxIncludeSetup, pabxIncludeDevices, pabxDeviceQuantity, pabxIncludeAI, pabxAIPlan, pabxModality, premiumPlan, premiumBillingType, premiumContractPeriod]);

    useEffect(() => {
        calculateSIP();
    }, [sipPlan, sipIncludeSetup, sipAdditionalChannels, sipWithEquipment]);

    // Handlers para ações das propostas
    const handleEditProposal = (proposal: Proposal) => {

        // Carregar dados da proposta nos estados
        setCurrentProposal(proposal);
        setSelectedProposal(proposal);

        // Carregar dados do cliente e gerente
        const clientInfo = proposal.clientData || {};
        const managerInfo = proposal.accountManagerData || {};

        setClientData({
            name: clientInfo.name || '',
            projectName: clientInfo.projectName || '',
            email: clientInfo.email || '',
            phone: clientInfo.phone || ''
        });

        setAccountManagerData({
            name: managerInfo.name || '',
            email: managerInfo.email || '',
            phone: managerInfo.phone || ''
        });

        // Carregar produtos da proposta com compatibilidade PABX
        const products = (proposal.proposalItems || []).map(ensurePABXConfigCompatibility);
        setProposalItems(products);

        // Carregar desconto de diretor se existir
        const directorDiscountData = proposal.directorDiscount || proposal.director_discount;
        if (directorDiscountData) {
            setDirectorDiscount(directorDiscountData.percentage || 0);
            setDirectorDiscountReason(directorDiscountData.reason || '');
            setFinalTotalMonthly(directorDiscountData.discounted_value || 0);
        } else {
            setDirectorDiscount(0);
            setDirectorDiscountReason('');
            setFinalTotalMonthly(0);
        }

        // Carregar configuração PABX se existir
        const pabxConfig = proposal.pabxConfiguration || proposal.pabx_configuration;
        if (pabxConfig) {
            setPabxModality(pabxConfig.modality || 'standard');
            
            // Carregar outras configurações PABX se disponíveis
            if (pabxConfig.extensions !== undefined) {
                setPabxExtensions(pabxConfig.extensions);
            }
            if (pabxConfig.includeSetup !== undefined) {
                setPabxIncludeSetup(pabxConfig.includeSetup || pabxConfig.include_setup);
            }
            if (pabxConfig.includeDevices !== undefined) {
                setPabxIncludeDevices(pabxConfig.includeDevices || pabxConfig.include_devices);
            }
            if (pabxConfig.deviceQuantity !== undefined) {
                setPabxDeviceQuantity(pabxConfig.deviceQuantity || pabxConfig.device_quantity);
            }
            if (pabxConfig.includeAI !== undefined) {
                setPabxIncludeAI(pabxConfig.includeAI || pabxConfig.include_ai);
            }
            if (pabxConfig.aiPlan) {
                setPabxAIPlan(pabxConfig.aiPlan || pabxConfig.ai_plan);
            }
            setPremiumPlan(pabxConfig.premiumPlan || pabxConfig.premium_plan || null);
            setPremiumBillingType(pabxConfig.premiumBillingType || pabxConfig.premium_billing_type || null);
            setPremiumContractPeriod(pabxConfig.contractPeriod || pabxConfig.contract_period || null);
        } else {
            // Reset para valores padrão se não houver configuração
            setPabxModality('standard');
            setPremiumPlan(null);
            setPremiumBillingType(null);
            setPremiumContractPeriod(null);
        }

        // Mudar para a tela de calculadora para permitir edição
        setCurrentView('calculator');
        setActiveTab('calculator'); // Direcionar para a aba da calculadora
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
        if (!token) {
            toast({ title: "Erro", description: "Usuário não autenticado. Faça login novamente.", variant: "destructive" });
            return;
        }

        try {
            // Encode the proposal ID to handle special characters like slashes
            const encodedId = encodeURIComponent(proposal.id);
            const response = await fetch(`/api/proposals/${encodedId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                let errorMessage = `Falha ao excluir a proposta (status: ${response.status})`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    // Se não conseguir ler o JSON de erro, usar a mensagem padrão
                    console.error('Erro ao processar resposta de erro:', e);
                }
                throw new Error(errorMessage);
            }

            toast({ title: "Sucesso!", description: "Proposta excluída com sucesso." });

            // Otimisticamente remove a proposta da lista
            setSavedProposals(prev => prev.filter(p => p.id !== proposal.id));

        } catch (error: any) {
            console.error('Erro ao deletar proposta:', error);
            toast({
                title: "Erro ao Excluir",
                description: error.message || "Não foi possível concluir a exclusão.",
                variant: "destructive",
            });
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
                    type: 'PABX_SIP'
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
                    const response = await fetch('/api/proposals?type=PABX_SIP', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setSavedProposals(data);
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



    const createNewProposal = () => {
        const now = new Date();
        const formattedDate = now.toISOString().split('T')[0];

        setCurrentView('client-form');
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
        setCurrentProposal({
            id: `prop_${Date.now()}`,
            client_data: { name: '', projectName: '', email: '', phone: '' },
            account_manager_data: { name: '', email: '', phone: '' },
            products: [],
            total_setup: 0,
            total_monthly: 0,
            created_at: formattedDate,
            type: 'PABX_SIP',
            status: 'rascunho',
            user_id: userId || '',
            user_email: userEmail || ''
        });
    };

    // Se estiver na tela de formulário do cliente, mostrar o formulário
    if (currentView === 'client-form') {
        return (
            <div className="container mx-auto p-6 bg-slate-950 text-white min-h-screen">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Nova Proposta</h1>
                    <p className="text-slate-400">Preencha os dados do cliente e gerente de contas.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Dados do Cliente */}
                    <Card className="bg-slate-900/80 border-slate-800 text-white">
                        <CardHeader>
                            <CardTitle>Dados do Cliente</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="client-name">Nome do Cliente *</Label>
                                <Input
                                    id="client-name"
                                    value={clientData.name || ''}
                                    onChange={(e) => setClientData(prev => ({ ...prev, name: e.target.value }))}
                                    className="bg-slate-800 border-slate-700 text-white"
                                    placeholder="Nome completo do cliente"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="project-name">Nome do Projeto</Label>
                                <Input
                                    id="project-name"
                                    value={clientData.projectName || ''}
                                    onChange={(e) => setClientData(prev => ({ ...prev, projectName: e.target.value }))}
                                    className="bg-slate-800 border-slate-700 text-white"
                                    placeholder="Nome do projeto"
                                />
                            </div>
                            <div>
                                <Label htmlFor="client-email">Email do Cliente *</Label>
                                <Input
                                    id="client-email"
                                    type="email"
                                    value={clientData.email || ''}
                                    onChange={(e) => setClientData(prev => ({ ...prev, email: e.target.value }))}
                                    className="bg-slate-800 border-slate-700 text-white"
                                    placeholder="email@cliente.com"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="client-phone">Telefone do Cliente</Label>
                                <Input
                                    id="client-phone"
                                    value={clientData.phone || ''}
                                    onChange={(e) => setClientData(prev => ({ ...prev, phone: e.target.value }))}
                                    className="bg-slate-800 border-slate-700 text-white"
                                    placeholder="(11) 99999-9999"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dados do Gerente de Contas */}
                    <Card className="bg-slate-900/80 border-slate-800 text-white">
                        <CardHeader>
                            <CardTitle>Dados do Gerente de Contas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="manager-name">Nome do Gerente *</Label>
                                <Input
                                    id="manager-name"
                                    value={accountManagerData.name || ''}
                                    onChange={(e) => setAccountManagerData(prev => ({ ...prev, name: e.target.value }))}
                                    className="bg-slate-800 border-slate-700 text-white"
                                    placeholder="Nome completo do gerente"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="manager-email">Email do Gerente *</Label>
                                <Input
                                    id="manager-email"
                                    type="email"
                                    value={accountManagerData.email || ''}
                                    onChange={(e) => setAccountManagerData(prev => ({ ...prev, email: e.target.value }))}
                                    className="bg-slate-800 border-slate-700 text-white"
                                    placeholder="gerente@empresa.com"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="manager-phone">Telefone do Gerente</Label>
                                <Input
                                    id="manager-phone"
                                    value={accountManagerData.phone || ''}
                                    onChange={(e) => setAccountManagerData(prev => ({ ...prev, phone: e.target.value }))}
                                    className="bg-slate-800 border-slate-700 text-white"
                                    placeholder="(11) 99999-9999"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-between mt-8">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentView('search')}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                        ← Voltar
                    </Button>
                    <Button
                        onClick={() => {
                            if (!clientData.name || !clientData.email || !accountManagerData.name || !accountManagerData.email) {
                                alert('Preencha os campos obrigatórios marcados com *');
                                return;
                            }
                            setCurrentView('calculator');
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Continuar para Calculadora →
                    </Button>
                </div>
            </div>
        );
    }

    // Se estiver na tela de busca, mostrar a tela de buscar propostas
    if (currentView === 'search') {
        return (
            <div className="container mx-auto p-6 bg-slate-950 text-white min-h-screen">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Buscar Propostas</h1>
                    <p className="text-slate-400">Encontre propostas de PABX/SIP existentes ou crie uma nova.</p>
                </div>

                <Card className="bg-slate-900/80 border-slate-800 text-white mb-6">
                    <CardContent className="p-6">
                        <div className="flex gap-4 items-center">
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    placeholder="Buscar por cliente ou ID..."
                                    value={searchTerm || ''}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-400"
                                />
                            </div>
                            <Button
                                onClick={createNewProposal}
                                className="bg-blue-600 hover:bg-blue-700 px-6"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Nova Proposta
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabela de propostas */}
                <Card className="bg-slate-900/80 border-slate-800 text-white">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-700">
                                    <TableHead className="text-slate-300 font-semibold">ID</TableHead>
                                    <TableHead className="text-slate-300 font-semibold">Cliente</TableHead>
                                    <TableHead className="text-slate-300 font-semibold">Data</TableHead>
                                    <TableHead className="text-slate-300 font-semibold">Total Mensal</TableHead>
                                    <TableHead className="text-slate-300 font-semibold">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {savedProposals.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-slate-400">
                                            Nenhuma proposta encontrada. Clique em "Nova Proposta" para começar.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    savedProposals
                                        .filter(proposal => proposal && proposal.id)
                                        .filter(proposal =>
                                            (proposal.clientData?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                            (proposal.id?.toString() || '').includes(searchTerm) ||
                                            (proposal.proposalNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase())
                                        )
                                        .map((proposal, index) => (
                                            <TableRow key={proposal.id || `proposal-${index}`} className="border-slate-800 hover:bg-slate-800/50">
                                                <TableCell className="text-slate-300">{proposal.id}</TableCell>
                                                <TableCell className="text-slate-300">{proposal.clientData?.name || 'N/A'}</TableCell>
                                                <TableCell className="text-slate-300">{proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString('pt-BR') : 'N/A'}</TableCell>
                                                <TableCell className="text-slate-300">{formatCurrency(proposal.totalMonthly || 0)}</TableCell>
                                                <TableCell>
                                                    <ProposalActions
                                                        proposal={proposal}
                                                        onEdit={handleEditProposalModal}
                                                        onDelete={handleDeleteProposal}
                                                        onView={handleViewProposal}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Modais */}
                {console.log('Modal check (search):', { showNegotiationRounds, selectedProposal: !!selectedProposal })}
                {showNegotiationRounds && selectedProposal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg max-w-md">
                            <h2 className="text-xl font-bold mb-4 text-black">Modal de Teste</h2>
                            <p className="text-black">Proposta ID: {selectedProposal.id}</p>
                            <button
                                onClick={() => setShowNegotiationRounds(false)}
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
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
            </div>
        );
    }

    // Tela da calculadora
    return (
        <>
            <div className="container mx-auto p-4 bg-slate-950 text-white">
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                {currentProposal ? 'Editando Proposta PABX/SIP' : 'Calculadora PABX/SIP'}
                            </h1>
                            <p className="text-slate-400 mt-2">
                                {currentProposal
                                    ? `Editando proposta: ${currentProposal.id || 'Sem ID'}`
                                    : 'Configure e calcule os custos para PABX em Nuvem e SIP Trunk'
                                }
                            </p>
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
                                onClick={() => {
                                    setCurrentView('search');
                                    setCurrentProposal(null);
                                    setSelectedProposal(null);
                                }}
                                className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                                ← Voltar para Buscar
                            </Button>
                        </div>
                    </div>

                    {/* Informações do Cliente e Gerente */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <Card className="bg-slate-900/50 border-slate-800">
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-white mb-2">Cliente</h3>
                                <p className="text-slate-300 text-sm">{clientData.name}</p>
                                <p className="text-slate-400 text-xs">{clientData.email}</p>
                                {clientData.phone && <p className="text-slate-400 text-xs">{clientData.phone}</p>}
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-900/50 border-slate-800">
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-white mb-2">Gerente de Contas</h3>
                                <p className="text-slate-300 text-sm">{accountManagerData.name}</p>
                                <p className="text-slate-400 text-xs">{accountManagerData.email}</p>
                                {accountManagerData.phone && <p className="text-slate-400 text-xs">{accountManagerData.phone}</p>}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className={`grid w-full ${userRole === 'admin' ? 'grid-cols-6' : 'grid-cols-3'} bg-slate-800 text-slate-400`}>
                        <TabsTrigger value="calculator">Calculadora</TabsTrigger>
                        <TabsTrigger value="negotiations">Rodadas de Negociação</TabsTrigger>
                        <TabsTrigger value="configurations">Configurações</TabsTrigger>
                        {userRole === 'admin' && <TabsTrigger value="dre">DRE</TabsTrigger>}
                        {userRole === 'admin' && <TabsTrigger value="list-price">Tabela de Preços</TabsTrigger>}
                        
                    </TabsList>

                    <TabsContent value="calculator">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                            {/* PABX em Nuvem */}
                            <Card className="bg-slate-900/80 border-slate-800 text-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Phone className="h-5 w-5" />
                                        PABX em Nuvem
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Plan Selection Section */}
                                    <div className="space-y-4">
                                        <div className="border-b border-slate-700 pb-2">
                                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                                                Seleção de Modalidade
                                            </h3>
                                            <p className="text-sm text-slate-400 mt-1">Escolha entre PABX Standard ou Premium</p>
                                        </div>
                                        
                                        <PlanModalitySelector
                                            selectedModality={pabxModality}
                                            onModalityChange={(modality) => {
                                                setPabxModality(modality);
                                                // Reset Premium selections when changing modality
                                                if (modality === 'standard') {
                                                    setPremiumPlan(null);
                                                    setPremiumBillingType(null);
                                                    setPremiumContractPeriod(null);
                                                }
                                            }}
                                            premiumPlan={premiumPlan}
                                            premiumBillingType={premiumBillingType}
                                            extensions={pabxExtensions}
                                            showValidation={true}
                                        />

                                        {/* Premium Plan Selection - Only show when Premium is selected */}
                                        {pabxModality === 'premium' && (
                                            <div className="space-y-4 mt-4">
                                                <PremiumPlanSelector
                                                    selectedPlan={premiumPlan}
                                                    onPlanChange={(plan) => {
                                                        setPremiumPlan(plan);
                                                        // Reset billing type when plan changes
                                                        setPremiumBillingType(null);
                                                    }}
                                                    visible={true}
                                                    premiumBillingType={premiumBillingType}
                                                    extensions={pabxExtensions}
                                                    showValidation={true}
                                                />

                                                {/* Billing Type Selection - Only show when Premium plan is selected */}
                                                {premiumPlan && (
                                                    <BillingTypeSelector
                                                        selectedType={premiumBillingType}
                                                        onTypeChange={(type) => {
                                                            setPremiumBillingType(type);
                                                            // Reset contract period when billing type changes
                                                            setPremiumContractPeriod(null);
                                                        }}
                                                        visible={true}
                                                        premiumPlan={premiumPlan}
                                                        extensions={pabxExtensions}
                                                        showValidation={true}
                                                    />
                                                )}

                                                {/* Contract Period Selection - Only show when billing type is selected */}
                                                {premiumPlan && premiumBillingType && (
                                                    <ContractPeriodSelector
                                                        selectedPeriod={premiumContractPeriod}
                                                        onPeriodChange={setPremiumContractPeriod}
                                                        visible={true}
                                                        showValidation={true}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    

                                    {/* Configuration Section */}
                                    <div className="space-y-4">
                                        <div className="border-b border-slate-700 pb-2">
                                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                                <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                                                    {pabxModality === 'premium' ? '4' : '2'}
                                                </span>
                                                Configuração
                                            </h3>
                                            <p className="text-sm text-slate-400 mt-1">Configure os detalhes do seu PABX</p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="pabx-extensions" className="text-white">Quantidade de Ramais</Label>
                                                <Input
                                                    id="pabx-extensions"
                                                    type="number"
                                                    value={pabxExtensions || 0}
                                                    onChange={(e) => setPabxExtensions(parseInt(e.target.value) || 0)}
                                                    className="bg-slate-800 border-slate-700 text-white mt-1"
                                                    placeholder="Ex: 32"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="pabx-include-setup"
                                                    checked={pabxIncludeSetup}
                                                    onCheckedChange={(checked) => setPabxIncludeSetup(checked as boolean)}
                                                    className="border-slate-500"
                                                />
                                                <Label htmlFor="pabx-include-setup" className="text-white">Incluir Taxa de Setup</Label>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="pabx-include-devices"
                                                    checked={pabxIncludeDevices}
                                                    onCheckedChange={(checked) => setPabxIncludeDevices(checked as boolean)}
                                                    className="border-slate-500"
                                                />
                                                <Label htmlFor="pabx-include-devices" className="text-white">Incluir Aparelhos (Ramais Físicos)</Label>
                                            </div>

                                            {pabxIncludeDevices && (
                                                <div className="ml-6 mt-2">
                                                    <Label htmlFor="pabx-device-quantity" className="text-white">Quantidade de Aparelhos</Label>
                                                    <Input
                                                        id="pabx-device-quantity"
                                                        type="number"
                                                        value={pabxDeviceQuantity || 0}
                                                        onChange={(e) => setPabxDeviceQuantity(parseInt(e.target.value) || 0)}
                                                        className="bg-slate-800 border-slate-700 text-white mt-1 max-w-32"
                                                        placeholder="Ex: 5"
                                                    />
                                                </div>
                                            )}

                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="pabx-include-ai"
                                                    checked={pabxIncludeAI}
                                                    onCheckedChange={(checked) => setPabxIncludeAI(checked as boolean)}
                                                    className="border-slate-500"
                                                />
                                                <Label htmlFor="pabx-include-ai" className="text-white">Incluir Agente IA</Label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Agent Configuration */}
                                    {pabxIncludeAI && (
                                        <div className="space-y-4">
                                            <div className="border-b border-slate-700 pb-2">
                                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                                    <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                                                        {pabxModality === 'premium' ? '5' : '3'}
                                                    </span>
                                                    Configuração do Agente IA
                                                </h3>
                                                <p className="text-sm text-slate-400 mt-1">Configure o plano e período do Agente IA</p>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="contract-period" className="text-white">Período do Contrato (meses)</Label>
                                                    <Select value={contractPeriod.toString()} onValueChange={(value) => setContractPeriod(parseInt(value))}>
                                                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-slate-800 border-slate-700">
                                                            <SelectItem value="12">12 meses</SelectItem>
                                                            <SelectItem value="24">24 meses</SelectItem>
                                                            <SelectItem value="36">36 meses</SelectItem>
                                                            <SelectItem value="48">48 meses</SelectItem>
                                                            <SelectItem value="60">60 meses</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label className="text-white">Plano de Agente IA</Label>
                                                    <Select value={pabxAIPlan} onValueChange={(value) => setPabxAIPlan(value as AIPlanKey)}>
                                                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-slate-800 border-slate-700">
                                                            <SelectItem value="20K">20K Créditos</SelectItem>
                                                            <SelectItem value="40K">40K Créditos</SelectItem>
                                                            <SelectItem value="60K">60K Créditos</SelectItem>
                                                            <SelectItem value="100K">100K Créditos</SelectItem>
                                                            <SelectItem value="150K">150K Créditos</SelectItem>
                                                            <SelectItem value="200K">200K Créditos</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                                <h4 className="text-sm font-semibold text-white mb-2">Recursos Inclusos no Plano {pabxAIPlan}:</h4>
                                                <div className="text-sm text-slate-400 space-y-1">
                                                    <p>• {aiAgentPrices[pabxAIPlan]?.messages?.toLocaleString() || 'N/A'} mensagens de texto</p>
                                                    <p>• {aiAgentPrices[pabxAIPlan]?.minutes?.toLocaleString() || 'N/A'} minutos de voz</p>
                                                    <p>• {aiAgentPrices[pabxAIPlan]?.premium?.toLocaleString() || 'N/A'} interações premium</p>
                                                    <p className="text-xs mt-2 text-slate-500">*Recursos podem ser combinados conforme necessidade</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Calculation Section */}
                                    <div className="space-y-4">
                                        <div className="border-b border-slate-700 pb-2">
                                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                                <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                                                    {pabxModality === 'premium' ? (pabxIncludeAI ? '6' : '5') : (pabxIncludeAI ? '4' : '3')}
                                                </span>
                                                Cálculo e Resultado
                                            </h3>
                                            <p className="text-sm text-slate-400 mt-1">Calcule os valores e adicione à proposta</p>
                                        </div>

                                        {/* Validation Summary */}
                                        {(() => {
                                            const validationContext: PABXValidationContext = {
                                                modality: pabxModality,
                                                premiumPlan: premiumPlan,
                                                premiumBillingType: premiumBillingType,
                                                extensions: pabxExtensions
                                            };
                                            const validationResult = validateCalculationReadiness(validationContext);
                                            const validationState = createValidationState(validationResult);
                                            
                                            return (
                                                <ValidationSummary
                                                    validationState={validationState}
                                                    title="Status da Configuração PABX"
                                                    className="mb-4"
                                                />
                                            );
                                        })()}

                                        {/* Calculate Button */}
                                        <Button
                                            onClick={calculatePABX}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                                            size="lg"
                                        >
                                            Calcular PABX
                                        </Button>

                                        {/* Resultado PABX */}
                                        {pabxResult && (
                                            <div className="bg-slate-800/80 border border-slate-600 p-6 rounded-lg">
                                                <h3 className="font-semibold mb-4 text-white text-lg flex items-center gap-2">
                                                    📊 Resultado PABX
                                                    
                                                </h3>
                                                <div className="space-y-3 text-sm">
                                                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                                                        <span className="text-slate-300">Taxa de Setup:</span>
                                                        <span className="font-semibold text-white">{formatCurrency(pabxResult.setup)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                                                        <span className="text-slate-300">Mensalidade Base:</span>
                                                        <span className="font-semibold text-white">{formatCurrency(pabxResult.baseMonthly)}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                                                        <span className="text-slate-300">Aluguel de Aparelhos:</span>
                                                        <span className="font-semibold text-white">{formatCurrency(pabxResult.deviceRentalCost)}</span>
                                                    </div>
                                                    {pabxResult.aiAgentCost > 0 && (
                                                        <div className="flex justify-between items-center py-2 border-b border-slate-700">
                                                            <span className="text-slate-300">Agente IA ({pabxAIPlan}):</span>
                                                            <span className="font-semibold text-white">{formatCurrency(pabxResult.aiAgentCost)}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between items-center py-3 bg-green-900/30 px-4 rounded-lg border border-green-700/50">
                                                        <span className="font-bold text-green-300 text-base">Total Mensal:</span>
                                                        <span className="font-bold text-green-300 text-lg">{formatCurrency(pabxResult.totalMonthly)}</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                                                    onClick={addPABXToProposal}
                                                    size="lg"
                                                >
                                                    ✅ Adicionar à Proposta
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* SIP Trunk */}
                            <Card className="bg-slate-900/80 border-slate-800 text-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <PhoneForwarded className="h-5 w-5" />
                                        SIP Trunk
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Plano SIP</Label>
                                        <Select value={sipPlan} onValueChange={setSipPlan}>
                                            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-800 border-slate-700">
                                                <SelectItem value="SIP TARIFADO Call Center 2 Canais">SIP TARIFADO Call Center 2 Canais</SelectItem>
                                                <SelectItem value="SIP TARIFADO 2 Canais">SIP TARIFADO 2 Canais</SelectItem>
                                                <SelectItem value="SIP TARIFADO 4 Canais">SIP TARIFADO 4 Canais</SelectItem>
                                                <SelectItem value="SIP TARIFADO 10 Canais">SIP TARIFADO 10 Canais</SelectItem>
                                                <SelectItem value="SIP TARIFADO 30 Canais">SIP TARIFADO 30 Canais</SelectItem>
                                                <SelectItem value="SIP TARIFADO 60 Canais">SIP TARIFADO 60 Canais</SelectItem>
                                                <SelectItem value="SIP ILIMITADO 5 Canais">SIP ILIMITADO 5 Canais</SelectItem>
                                                <SelectItem value="SIP ILIMITADO 10 Canais">SIP ILIMITADO 10 Canais</SelectItem>
                                                <SelectItem value="SIP ILIMITADO 20 Canais">SIP ILIMITADO 20 Canais</SelectItem>
                                                <SelectItem value="SIP ILIMITADO 30 Canais">SIP ILIMITADO 30 Canais</SelectItem>
                                                <SelectItem value="SIP ILIMITADO 60 Canais">SIP ILIMITADO 60 Canais</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="sip-include-setup"
                                            checked={sipIncludeSetup}
                                            onCheckedChange={(checked) => setSipIncludeSetup(checked as boolean)}
                                        />
                                        <Label htmlFor="sip-include-setup">Incluir Taxa de Setup</Label>
                                    </div>

                                    <div>
                                        <Label htmlFor="sip-additional-channels">Canais Adicionais</Label>
                                        <Input
                                            id="sip-additional-channels"
                                            type="number"
                                            value={sipAdditionalChannels || 0}
                                            onChange={(e) => setSipAdditionalChannels(parseInt(e.target.value) || 0)}
                                            className="bg-slate-800 border-slate-700 text-white"
                                        />
                                    </div>

                                    <div>
                                        <Label>Franquia/Assinatura Mensal</Label>
                                        <RadioGroup value={sipWithEquipment ? "com" : "sem"} onValueChange={(value) => setSipWithEquipment(value === "com")}>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="sem" id="sem-equipamentos" />
                                                <Label htmlFor="sem-equipamentos">Sem Equipamentos</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="com" id="com-equipamentos" />
                                                <Label htmlFor="com-equipamentos">Com Equipamentos</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    {/* Resultado SIP */}
                                    {sipResult && (
                                        <div className="bg-slate-800 p-4 rounded-lg">
                                            <h3 className="font-semibold mb-2">Resultado SIP:</h3>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <span>Taxa de Setup:</span>
                                                    <span>{formatCurrency(sipResult.setup)}</span>
                                                </div>
                                                <Separator className="my-2 bg-slate-600" />
                                                <div className="flex justify-between font-bold text-lg text-green-400">
                                                    <span>Total Mensal:</span>
                                                    <span>{formatCurrency(sipResult.monthly)}</span>
                                                </div>
                                            </div>
                                            <Button
                                                className="w-full mt-3 bg-green-600 hover:bg-green-700"
                                                onClick={addSIPToProposal}
                                            >
                                                Adicionar à Proposta
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full mt-2 border-slate-600 text-slate-300 hover:bg-slate-700"
                                            >
                                                Ajustes do Sistema
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Condições Comerciais */}
                        <Card className="bg-slate-900/80 border-slate-800 text-white mt-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    📋 Condições Comerciais
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Configure o período do contrato
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <Label className="text-white font-medium mb-3 block">Prazo Contratual</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {[12, 24, 36, 48, 60].map((months) => (
                                                <Button
                                                    key={months}
                                                    variant={contractPeriod === months ? "default" : "outline"}
                                                    onClick={() => setContractPeriod(months)}
                                                    className={`px-6 py-2 ${contractPeriod === months
                                                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                                                        : "border-slate-600 text-slate-300 hover:bg-slate-700"
                                                        }`}
                                                >
                                                    {months} Meses
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Checkbox Parceiro Indicador */}
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="partner-indicator"
                                            checked={hasPartnerIndicator}
                                            onCheckedChange={(checked) => setHasPartnerIndicator(!!checked)}
                                            className="border-slate-600 data-[state=checked]:bg-blue-600"
                                        />
                                        <Label htmlFor="partner-indicator" className="text-slate-300 text-sm">
                                            Parceiro Indicador (exclui comissão do vendedor)
                                        </Label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Resumo da Proposta */}
                        {proposalItems.length > 0 && (
                            <Card className="bg-slate-900/80 border-slate-800 text-white mt-6">
                                <CardHeader>
                                    <CardTitle>Resumo da Proposta</CardTitle>
                                    <CardDescription className="text-slate-400">
                                        Período do contrato: {contractPeriod} meses
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-slate-700">
                                                <TableHead className="text-white">Descrição</TableHead>
                                                <TableHead className="text-white text-right">Setup</TableHead>
                                                <TableHead className="text-white text-right">Mensal</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {proposalItems.map((item, index) => (
                                                <TableRow key={index} className="border-slate-800">
                                                    <TableCell>{item.description}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(item.setup)}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(item.monthly)}</TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow className="border-slate-700 font-semibold">
                                                <TableCell>Total Setup:</TableCell>
                                                <TableCell className="text-right">{formatCurrency(totalSetup)}</TableCell>
                                                <TableCell></TableCell>
                                            </TableRow>
                                            <TableRow className="border-slate-700 font-semibold">
                                                <TableCell>Total Mensal:</TableCell>
                                                <TableCell></TableCell>
                                                <TableCell className="text-right">
                                                    {directorDiscount > 0 ? (
                                                        <div>
                                                            <div className="line-through text-slate-500 text-sm">
                                                                {formatCurrency(totalMonthly)}
                                                            </div>
                                                            <div className="text-amber-400 font-bold">
                                                                {formatCurrency(finalTotalMonthly)}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        formatCurrency(totalMonthly)
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>

                                    {/* Desconto de Diretor */}
                                    {userRole === 'diretor' && (
                                        <div className="mt-6">
                                            <DirectorDiscount
                                                totalValue={totalMonthly}
                                                onDiscountChange={(discount, discountedValue, reason) => {
                                                    setDirectorDiscount(discount);
                                                    setDirectorDiscountReason(reason);
                                                    setFinalTotalMonthly(discountedValue);
                                                }}
                                                initialDiscount={directorDiscount}
                                                initialReason={directorDiscountReason}
                                                userEmail={userEmail || ''}
                                            />
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-4 mt-6">
                                        <Button onClick={saveProposal} className="bg-green-600 hover:bg-green-700">
                                            Salvar Proposta
                                        </Button>
                                        <Button className="bg-blue-600 hover:bg-blue-700">
                                            Gerar PDF
                                        </Button>
                                        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                                            Cancelar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="negotiations">
                        <Card className="bg-slate-900/80 border-slate-800 text-white">
                            <CardHeader>
                                <CardTitle className="text-white">Rodadas de Negociação</CardTitle>
                                <CardDescription className="text-slate-400">Aplique descontos à proposta.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Valor Inicial */}
                                <div>
                                    <h3 className="text-lg font-semibold text-green-400 mb-2">Valor Inicial da Proposta</h3>
                                    <p className="text-2xl font-bold text-green-400">{formatCurrency(initialTotalMonthly)}</p>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-lg font-semibold text-blue-400 mb-2">Valor Atual da Rodada</h3>
                                    <p className="text-2xl font-bold text-blue-400">{formatCurrency(totalMonthly)}</p>
                                </div>

                                {/* Rodada Atual */}
                                <div className={`border border-slate-600 rounded-lg p-4 ${userRole === 'diretor' ? 'bg-slate-800/50 opacity-75' : 'bg-slate-800'}`}>
                                    <h3 className="text-lg font-semibold text-orange-400 mb-4">
                                        Rodada {currentRound}: Vendedor/Gerente de Contas
                                        {userRole === 'diretor' && <span className="text-slate-400 text-sm ml-2">(Somente Leitura)</span>}
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="discount-reason" className="text-slate-300">Motivo do Desconto</Label>
                                            <Input
                                                id="discount-reason"
                                                value={discountReason}
                                                onChange={(e) => setDiscountReason(e.target.value)}
                                                placeholder="Ex: Desconto de 5%"
                                                disabled={userRole === 'diretor'}
                                                className="mt-1 bg-slate-700 border-slate-600 text-white"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-400">Valor com desconto de 5%:</p>
                                            <p className="text-xl font-bold text-orange-400">
                                                {formatCurrency(totalMonthly * 0.95)}
                                            </p>
                                        </div>
                                        <Button
                                            className="bg-orange-500 hover:bg-orange-600"
                                            disabled={userRole === 'diretor'}
                                            onClick={() => {
                                                // Aplicar desconto de 5% aos produtos
                                                const discountedProducts = proposalItems.map(product => ({
                                                    ...product,
                                                    monthly: product.monthly * 0.95
                                                }));
                                                setProposalItems(discountedProducts);
                                                setCurrentRound(currentRound + 1);
                                                toast({ title: "Desconto Aplicado!", description: "Desconto de 5% aplicado com sucesso." });
                                            }}
                                        >
                                            Aplicar Desconto de 5%
                                        </Button>
                                    </div>
                                </div>

                                {/* Desconto de Diretor */}
                                {userRole === 'diretor' && (
                                    <div className="mt-6">
                                        <DirectorDiscount
                                            totalValue={totalMonthly}
                                            onDiscountChange={(discount, discountedValue, reason) => {
                                                setDirectorDiscount(discount);
                                                setDirectorDiscountReason(reason);
                                                setFinalTotalMonthly(discountedValue);
                                            }}
                                            initialDiscount={directorDiscount}
                                            initialReason={directorDiscountReason}
                                            userEmail={userEmail || ''}
                                        />
                                    </div>
                                )}

                                {/* Botões de Ação */}
                                <div className="flex gap-4 pt-4">
                                    <Button
                                        onClick={saveProposal}
                                        className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Salvar Proposta
                                    </Button>
                                    <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                                        <Download className="h-4 w-4 mr-2" />
                                        Imprimir
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setCurrentView('search')}
                                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="configurations">
                        <div className="mt-6 space-y-6">
                            {/* Tabela de Comissão Vendedores */}
                            <Card className="bg-slate-900/80 border-slate-800 text-white">
                                <CardHeader>
                                    <CardTitle className="text-blue-400">Tabela Comissão Vendedores</CardTitle>
                                    <CardDescription className="text-slate-400">Configure as comissões por período de contrato</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-slate-700">
                                                    <TableHead className="text-white bg-blue-800">Meses</TableHead>
                                                    <TableHead className="text-white bg-blue-800 text-center">% Comissão</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="font-semibold">12</TableCell>
                                                    <TableCell className="text-center">
                                                        <Input
                                                            type="number"
                                                            defaultValue="1.2"
                                                            className="bg-slate-800 text-center w-20"
                                                            step="0.1"
                                                        />
                                                        <span className="ml-1">%</span>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="font-semibold">24</TableCell>
                                                    <TableCell className="text-center">
                                                        <Input
                                                            type="number"
                                                            defaultValue="2.4"
                                                            className="bg-slate-800 text-center w-20"
                                                            step="0.1"
                                                        />
                                                        <span className="ml-1">%</span>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="font-semibold">36</TableCell>
                                                    <TableCell className="text-center">
                                                        <Input
                                                            type="number"
                                                            defaultValue="3.6"
                                                            className="bg-slate-800 text-center w-20"
                                                            step="0.1"
                                                        />
                                                        <span className="ml-1">%</span>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="font-semibold">48</TableCell>
                                                    <TableCell className="text-center">
                                                        <Input
                                                            type="number"
                                                            defaultValue="4.8"
                                                            className="bg-slate-800 text-center w-20"
                                                            step="0.1"
                                                        />
                                                        <span className="ml-1">%</span>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="font-semibold">60</TableCell>
                                                    <TableCell className="text-center">
                                                        <Input
                                                            type="number"
                                                            defaultValue="5"
                                                            className="bg-slate-800 text-center w-20"
                                                            step="0.1"
                                                        />
                                                        <span className="ml-1">%</span>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Tabela de Comissão Parceiro Indicador */}
                            <Card className="bg-slate-900/80 border-slate-800 text-white">
                                <CardHeader>
                                    <CardTitle className="text-blue-400">Tabela Comissão Parceiro Indicador</CardTitle>
                                    <CardDescription className="text-slate-400">Configure as comissões por faixa de receita mensal</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-slate-700">
                                                    <TableHead className="text-white bg-blue-800">Valores - Receita Mensal</TableHead>
                                                    <TableHead className="text-white bg-blue-800 text-center">Até 24 Meses</TableHead>
                                                    <TableHead className="text-white bg-blue-800 text-center">24 Meses ou Mais</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="font-semibold">R$ 0,00 a R$ 500,00</TableCell>
                                                    <TableCell className="text-center">
                                                        <Input type="number" defaultValue="1.5" className="bg-slate-800 text-center w-20" step="0.1" />
                                                        <span className="ml-1">%</span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Input type="number" defaultValue="2.5" className="bg-slate-800 text-center w-20" step="0.1" />
                                                        <span className="ml-1">%</span>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="font-semibold">R$ 500,01 a R$ 1.000,00</TableCell>
                                                    <TableCell className="text-center">
                                                        <Input type="number" defaultValue="2.5" className="bg-slate-800 text-center w-20" step="0.1" />
                                                        <span className="ml-1">%</span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Input type="number" defaultValue="4" className="bg-slate-800 text-center w-20" step="0.1" />
                                                        <span className="ml-1">%</span>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="font-semibold">R$ 1.000,01 a R$ 1.500,00</TableCell>
                                                    <TableCell className="text-center">
                                                        <Input type="number" defaultValue="4.01" className="bg-slate-800 text-center w-20" step="0.01" />
                                                        <span className="ml-1">%</span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Input type="number" defaultValue="5.5" className="bg-slate-800 text-center w-20" step="0.1" />
                                                        <span className="ml-1">%</span>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="font-semibold">R$ 1.500,01 a R$ 3.000,00</TableCell>
                                                    <TableCell className="text-center">
                                                        <Input type="number" defaultValue="5.51" className="bg-slate-800 text-center w-20" step="0.01" />
                                                        <span className="ml-1">%</span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Input type="number" defaultValue="7" className="bg-slate-800 text-center w-20" step="0.1" />
                                                        <span className="ml-1">%</span>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="font-semibold">R$ 3.000,01 a R$ 5.000,00</TableCell>
                                                    <TableCell className="text-center">
                                                        <Input type="number" defaultValue="7.01" className="bg-slate-800 text-center w-20" step="0.01" />
                                                        <span className="ml-1">%</span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Input type="number" defaultValue="8" className="bg-slate-800 text-center w-20" step="0.1" />
                                                        <span className="ml-1">%</span>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="font-semibold">R$ 5.000,01 a R$ 6.500,00</TableCell>
                                                    <TableCell className="text-center">
                                                        <Input type="number" defaultValue="8.01" className="bg-slate-800 text-center w-20" step="0.01" />
                                                        <span className="ml-1">%</span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Input type="number" defaultValue="9" className="bg-slate-800 text-center w-20" step="0.1" />
                                                        <span className="ml-1">%</span>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="font-semibold">R$ 6.500,01 a R$ 9.000,00</TableCell>
                                                    <TableCell className="text-center">
                                                        <Input type="number" defaultValue="9.01" className="bg-slate-800 text-center w-20" step="0.01" />
                                                        <span className="ml-1">%</span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Input type="number" defaultValue="9.5" className="bg-slate-800 text-center w-20" step="0.1" />
                                                        <span className="ml-1">%</span>
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow className="border-slate-800">
                                                    <TableCell className="font-semibold">Acima de R$ 9.000,01</TableCell>
                                                    <TableCell className="text-center">
                                                        <Input type="number" defaultValue="9.51" className="bg-slate-800 text-center w-20" step="0.01" />
                                                        <span className="ml-1">%</span>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Input type="number" defaultValue="10" className="bg-slate-800 text-center w-20" step="0.1" />
                                                        <span className="ml-1">%</span>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Botão para salvar configurações */}
                            <div className="flex justify-end">
                                <Button className="bg-green-600 hover:bg-green-700">
                                    <Save className="mr-2 h-4 w-4" />
                                    Salvar Configurações
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {userRole === 'admin' &&
                        <>
                            <TabsContent value="list-price">
                                <div className="mt-6 space-y-6">
                                    {/* Tabela de Preços Agente IA */}
                                    <Card className="bg-slate-900/80 border-slate-800 text-white">
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <div>
                                                <CardTitle className="text-blue-400">Agente de IA</CardTitle>
                                                <p className="text-slate-400 text-sm mt-1">Créditos de Interação</p>
                                                <p className="text-slate-500 text-xs">Por mensagem, ligação e voz premium</p>
                                            </div>
                                            <Button
                                                variant={isEditingAI ? "secondary" : "outline"}
                                                size="sm"
                                                onClick={() => setIsEditingAI(!isEditingAI)}
                                                className="border-slate-600"
                                            >
                                                {isEditingAI ? "Salvar" : "Editar"}
                                            </Button>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                                                {(Object.entries(aiAgentPrices) as [AIPlanKey, typeof aiAgentPrices[AIPlanKey]][]).map(([plan, data]) => (
                                                    <div key={plan} className="bg-gradient-to-b from-blue-900/30 to-cyan-900/30 rounded-lg p-4 border border-slate-700">
                                                        <div className="text-center mb-4">
                                                            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2">
                                                                {plan}
                                                            </div>
                                                            <p className="text-xs text-slate-400">{data.credits.toLocaleString()} Créditos de Interação</p>
                                                        </div>

                                                        <div className="space-y-2 text-xs text-slate-300 mb-4">
                                                            <p><strong>Tenha até:</strong></p>
                                                            <p>{(data.messages / 1000).toFixed(0)}.000 mensagens* ou</p>
                                                            <p>{(data.minutes / 1000).toFixed(0)}.000 minutos** ou</p>
                                                            <p>{(data.premium / 1000).toFixed(0)}.000 voz premium*** ou</p>
                                                            <p className="text-slate-500">Opções acima combinadas</p>
                                                        </div>

                                                        <div className="text-center">
                                                            {isEditingAI ? (
                                                                <Input
                                                                    type="number"
                                                                    value={data.price}
                                                                    onChange={(e) => {
                                                                        const newPrice = parseFloat(e.target.value) || 0;
                                                                        setAiAgentPrices(prev => ({
                                                                            ...prev,
                                                                            [plan]: { ...prev[plan], price: newPrice }
                                                                        }));
                                                                    }}
                                                                />
                                                            ) : (
                                                                <p className="text-2xl font-bold">{formatCurrency(data.price)}</p>
                                                            )}
                                                            <p className="text-xs text-slate-500">por mês</p>
                                                        </div>

                                                        <div className="text-xs text-slate-400 mt-4 space-y-1">
                                                            <p>* 1 crédito por mensagem</p>
                                                            <p>** 10 créditos por minuto</p>
                                                            <p>*** 20 créditos por minuto (voz premium)</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Tabela de Preços SIP TRUNK */}
                                    <Card className="bg-slate-900/80 border-slate-800 text-white">
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <CardTitle className="text-blue-400">SIP TRUNK | Planos e preços</CardTitle>
                                            <Button
                                                variant={isEditingSIP ? "secondary" : "outline"}
                                                size="sm"
                                                onClick={isEditingSIP ? handleSaveSIP : () => setIsEditingSIP(true)}
                                                className="border-slate-600"
                                            >
                                                {isEditingSIP ? "Salvar" : "Editar"}
                                            </Button>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="border-slate-700">
                                                            <TableHead rowSpan={3} className="text-white bg-blue-900 text-center align-middle">SIP TRUNK</TableHead>
                                                            <TableHead colSpan={6} className="text-white bg-blue-800 text-center">SIP TARIFADO</TableHead>
                                                            <TableHead colSpan={5} className="text-white bg-blue-700 text-center">SIP ILIMITADO</TableHead>
                                                        </TableRow>
                                                        <TableRow className="border-slate-700">
                                                            <TableHead className="text-white bg-blue-800 text-center">Call Center</TableHead>
                                                            <TableHead className="text-white bg-blue-800 text-center">2</TableHead>
                                                            <TableHead className="text-white bg-blue-800 text-center">4</TableHead>
                                                            <TableHead className="text-white bg-blue-800 text-center">10</TableHead>
                                                            <TableHead className="text-white bg-blue-800 text-center">30</TableHead>
                                                            <TableHead className="text-white bg-blue-800 text-center">60</TableHead>
                                                            <TableHead className="text-white bg-blue-700 text-center">5</TableHead>
                                                            <TableHead className="text-white bg-blue-700 text-center">10</TableHead>
                                                            <TableHead className="text-white bg-blue-700 text-center">20</TableHead>
                                                            <TableHead className="text-white bg-blue-700 text-center">30</TableHead>
                                                            <TableHead className="text-white bg-blue-700 text-center">60</TableHead>
                                                        </TableRow>
                                                        <TableRow className="border-slate-700">
                                                            <TableHead className="text-white bg-blue-800 text-center text-xs">2 Canais</TableHead>
                                                            <TableHead className="text-white bg-blue-800 text-center text-xs">2 Canais</TableHead>
                                                            <TableHead className="text-white bg-blue-800 text-center text-xs">4 Canais</TableHead>
                                                            <TableHead className="text-white bg-blue-800 text-center text-xs">10 Canais</TableHead>
                                                            <TableHead className="text-white bg-blue-800 text-center text-xs">30 Canais</TableHead>
                                                            <TableHead className="text-white bg-blue-800 text-center text-xs">60 Canais</TableHead>
                                                            <TableHead className="text-white bg-blue-700 text-center text-xs">5 Canais</TableHead>
                                                            <TableHead className="text-white bg-blue-700 text-center text-xs">10 Canais</TableHead>
                                                            <TableHead className="text-white bg-blue-700 text-center text-xs">20 Canais</TableHead>
                                                            <TableHead className="text-white bg-blue-700 text-center text-xs">30 Canais</TableHead>
                                                            <TableHead className="text-white bg-blue-700 text-center text-xs">60 Canais</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {/* Canais Adicionais - Assinatura */}
                                                        <TableRow className="border-slate-800">
                                                            <TableCell className="font-semibold bg-blue-900/30">Canais Adicionais (Assinatura Mensal)</TableCell>
                                                            <TableCell className="text-center bg-blue-800/20">Não Aplicável</TableCell>
                                                            <TableCell className="text-center" colSpan={5}>Não Aplicável</TableCell>
                                                            {Object.entries(sipConfig.additionalChannels.assinatura).map(([plan, data]) => (
                                                                <TableCell key={`assinatura-${plan}`} className="text-center bg-blue-600/20">
                                                                    {isEditingSIP ? (
                                                                        <div className="space-y-1">
                                                                            <Input type="number" value={data.max} onChange={(e) => setSipConfig(prev => ({ ...prev, additionalChannels: { ...prev.additionalChannels, assinatura: { ...prev.additionalChannels.assinatura, [plan]: { ...prev.additionalChannels.assinatura[plan], max: Number(e.target.value) } } } }))} className="bg-slate-800 text-center text-xs" placeholder="Canais" />
                                                                            <Input type="number" value={data.price} onChange={(e) => setSipConfig(prev => ({ ...prev, additionalChannels: { ...prev.additionalChannels, assinatura: { ...prev.additionalChannels.assinatura, [plan]: { ...prev.additionalChannels.assinatura[plan], price: Number(e.target.value) } } } }))} className="bg-slate-800 text-center text-xs" placeholder="Preço" />
                                                                        </div>
                                                                    ) : (
                                                                        `Até ${data.max} canais<br/>${formatCurrency(data.price)} por canal adicional`
                                                                    )}
                                                                </TableCell>
                                                            ))}
                                                            <TableCell className="text-center bg-blue-600/20">Sem possibilidade</TableCell>
                                                        </TableRow>

                                                        {/* Canais Adicionais - Franquia */}
                                                        <TableRow className="border-slate-800">
                                                            <TableCell className="font-semibold bg-blue-900/30">Canais Adicionais (Franquia Mensal)</TableCell>
                                                            <TableCell className="text-center bg-blue-800/20">Não Aplicável</TableCell>
                                                            {Object.entries(sipConfig.additionalChannels.franquia).map(([plan, data]) => (
                                                                <TableCell key={`franquia-${plan}`} className="text-center">
                                                                    {isEditingSIP ? (
                                                                        <div className="space-y-1">
                                                                            <Input type="number" value={data.max} onChange={(e) => setSipConfig(prev => ({ ...prev, additionalChannels: { ...prev.additionalChannels, franquia: { ...prev.additionalChannels.franquia, [plan]: { ...prev.additionalChannels.franquia[plan], max: Number(e.target.value) } } } }))} className="bg-slate-800 text-center text-xs" placeholder="Canais" />
                                                                            <Input type="number" value={data.price} onChange={(e) => setSipConfig(prev => ({ ...prev, additionalChannels: { ...prev.additionalChannels, franquia: { ...prev.additionalChannels.franquia, [plan]: { ...prev.additionalChannels.franquia[plan], price: Number(e.target.value) } } } }))} className="bg-slate-800 text-center text-xs" placeholder="Preço" />
                                                                        </div>
                                                                    ) : (
                                                                        `Até ${data.max} canais<br/>${formatCurrency(data.price)} por canal adicional/mês`
                                                                    )}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                        <TableRow className="border-slate-800">
                                                            <TableCell className="font-semibold bg-blue-900/30">Franquia/Assinatura Mensal (Sem Equipamentos)</TableCell>
                                                            {(Object.keys(sipPrices) as Array<keyof typeof sipPrices>).map(planKey => (
                                                                <TableCell key={planKey} className="text-center">
                                                                    {isEditingSIP ? (
                                                                        <Input
                                                                            className="bg-slate-800 text-center"
                                                                            value={sipPrices[planKey].monthly}
                                                                            onChange={(e) => {
                                                                                const newSipPrices = { ...sipPrices };
                                                                                newSipPrices[planKey].monthly = Number(e.target.value);
                                                                                setSipPrices(newSipPrices);
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <>{formatCurrency(sipPrices[planKey].monthly)}<br />({planKey.includes('TARIFADO') ? 'Franquia' : 'Assinatura'})</>
                                                                    )}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                        <TableRow className="border-slate-800">
                                                            <TableCell className="font-semibold bg-blue-900/30">Franquia/Assinatura Mensal (Com Equipamentos)</TableCell>
                                                            {(Object.keys(sipPrices) as Array<keyof typeof sipPrices>).map(planKey => {
                                                                const plan = sipPrices[planKey];
                                                                const value = plan.monthlyWithEquipment;

                                                                if (isEditingSIP) {
                                                                    return (
                                                                        <TableCell key={planKey} className="text-center">
                                                                            <Input
                                                                                className="bg-slate-800 text-center"
                                                                                value={value === null ? '' : value}
                                                                                disabled={value === null}
                                                                                onChange={(e) => {
                                                                                    const newSipPrices = { ...sipPrices };
                                                                                    newSipPrices[planKey].monthlyWithEquipment = Number(e.target.value);
                                                                                    setSipPrices(newSipPrices);
                                                                                }}
                                                                            />
                                                                        </TableCell>
                                                                    );
                                                                }

                                                                return (
                                                                    <TableCell key={planKey} className="text-center">
                                                                        {value === null ? 'Não Aplicável' : (
                                                                            <>
                                                                                {formatCurrency(value)}
                                                                                <br />
                                                                                ({planKey.includes('TARIFADO') ? 'Franquia' : 'Assinatura'})
                                                                            </>
                                                                        )}
                                                                    </TableCell>
                                                                );
                                                            })}
                                                        </TableRow>
                                                        {/* Minutos Inclusos */}
                                                        <TableRow className="border-slate-800">
                                                            <TableCell className="font-semibold bg-blue-900/30">Minutos Mensais Inclusos para Brasil Móvel</TableCell>
                                                            <TableCell className="text-center bg-blue-800/20">Não Aplicável</TableCell>
                                                            <TableCell className="text-center" colSpan={4}>Não aplicável</TableCell>
                                                            {Object.entries(sipConfig.includedMinutes).map(([plan, minutes]) => (
                                                                <TableCell key={`minutes-${plan}`} className="text-center">
                                                                    {isEditingSIP ? (
                                                                        <Input type="number" value={minutes} onChange={(e) => setSipConfig(prev => ({ ...prev, includedMinutes: { ...prev.includedMinutes, [plan]: Number(e.target.value) } }))} className="bg-slate-800 text-center" />
                                                                    ) : (
                                                                        `${minutes.toLocaleString()}<br/>Minutos`
                                                                    )}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                        {/* Números Incluídos */}
                                                        <TableRow className="border-slate-800">
                                                            <TableCell className="font-semibold bg-blue-900/30">Números Incluídos (Novos ou Portados)</TableCell>
                                                            <TableCell className="text-center">{isEditingSIP ? <Input value={sipConfig.includedNumbers.callCenter} onChange={(e) => setSipConfig(prev => ({ ...prev, includedNumbers: { ...prev.includedNumbers, callCenter: e.target.value } }))} className="bg-slate-800 text-center" /> : sipConfig.includedNumbers.callCenter}</TableCell>
                                                            {Object.entries(sipConfig.includedNumbers.tarifado).map(([plan, text]) => (
                                                                <TableCell key={`tarifado-num-${plan}`} className="text-center">{isEditingSIP ? <Input value={text} onChange={(e) => setSipConfig(prev => ({ ...prev, includedNumbers: { ...prev.includedNumbers, tarifado: { ...prev.includedNumbers.tarifado, [plan]: e.target.value } } }))} className="bg-slate-800 text-center" /> : text}</TableCell>
                                                            ))}
                                                            <TableCell className="text-center">Sem possibilidade</TableCell>{/* Coluna 60 canais tarifado */}
                                                            {Object.entries(sipConfig.includedNumbers.ilimitado).map(([plan, text]) => (
                                                                <TableCell key={`ilimitado-num-${plan}`} className="text-center">{isEditingSIP ? <Input value={text} onChange={(e) => setSipConfig(prev => ({ ...prev, includedNumbers: { ...prev.includedNumbers, ilimitado: { ...prev.includedNumbers.ilimitado, [plan]: e.target.value } } }))} className="bg-slate-800 text-center" /> : text}</TableCell>
                                                            ))}
                                                        </TableRow>
                                                        {/* Numeração Adicional */}
                                                        <TableRow className="border-slate-800">
                                                            <TableCell className="font-semibold bg-blue-900/30">Numeração Adicional (Mensalidade)</TableCell>
                                                            <TableCell className="text-center">Consultar</TableCell>
                                                            <TableCell colSpan={10} className="text-center">
                                                                {isEditingSIP ? (
                                                                    <Input type="number" value={sipConfig.additionalNumberPrice} onChange={(e) => setSipConfig(prev => ({ ...prev, additionalNumberPrice: Number(e.target.value) }))} className="bg-slate-800 text-center w-40 mx-auto" />
                                                                ) : (
                                                                    `${formatCurrency(sipConfig.additionalNumberPrice)} por Número`
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                        {/* Tarifas */}
                                                        <TableRow className="border-slate-800">
                                                            <TableCell className="font-semibold bg-blue-900/30">Tarifa Local Fixo (por minuto)</TableCell>
                                                            <TableCell className="text-center">{isEditingSIP ? <Input type="number" value={sipConfig.tariffs.localFixo.callCenter} onChange={(e) => setSipConfig(prev => ({ ...prev, tariffs: { ...prev.tariffs, localFixo: { ...prev.tariffs.localFixo, callCenter: Number(e.target.value) } } }))} className="bg-slate-800 text-center" /> : `${formatCurrency(sipConfig.tariffs.localFixo.callCenter)}<br/>por minuto`}</TableCell>
                                                            <TableCell colSpan={5} className="text-center">{isEditingSIP ? <Input type="number" value={sipConfig.tariffs.localFixo.tarifado} onChange={(e) => setSipConfig(prev => ({ ...prev, tariffs: { ...prev.tariffs, localFixo: { ...prev.tariffs.localFixo, tarifado: Number(e.target.value) } } }))} className="bg-slate-800 text-center" /> : `${formatCurrency(sipConfig.tariffs.localFixo.tarifado)} por minuto`}</TableCell>
                                                            <TableCell colSpan={5} className="text-center">Ilimitado</TableCell>
                                                        </TableRow>
                                                        <TableRow className="border-slate-800">
                                                            <TableCell className="font-semibold bg-blue-900/30">Tarifa DDD Fixo (por minuto)</TableCell>
                                                            <TableCell className="text-center">{isEditingSIP ? <Input type="number" value={sipConfig.tariffs.dddFixo.callCenter} onChange={(e) => setSipConfig(prev => ({ ...prev, tariffs: { ...prev.tariffs, dddFixo: { ...prev.tariffs.dddFixo, callCenter: Number(e.target.value) } } }))} className="bg-slate-800 text-center" /> : `${formatCurrency(sipConfig.tariffs.dddFixo.callCenter)}<br/>por minuto`}</TableCell>
                                                            <TableCell colSpan={5} className="text-center">{isEditingSIP ? <Input type="number" value={sipConfig.tariffs.dddFixo.tarifado} onChange={(e) => setSipConfig(prev => ({ ...prev, tariffs: { ...prev.tariffs, dddFixo: { ...prev.tariffs.dddFixo, tarifado: Number(e.target.value) } } }))} className="bg-slate-800 text-center" /> : `${formatCurrency(sipConfig.tariffs.dddFixo.tarifado)} por minuto`}</TableCell>
                                                            <TableCell colSpan={5} className="text-center">Ilimitado</TableCell>
                                                        </TableRow>
                                                        <TableRow className="border-slate-800">
                                                            <TableCell className="font-semibold bg-blue-900/30">Tarifa Brasil Móvel (por minuto)</TableCell>
                                                            <TableCell className="text-center">{isEditingSIP ? <Input type="number" value={sipConfig.tariffs.brasilMovel.callCenter} onChange={(e) => setSipConfig(prev => ({ ...prev, tariffs: { ...prev.tariffs, brasilMovel: { ...prev.tariffs.brasilMovel, callCenter: Number(e.target.value) } } }))} className="bg-slate-800 text-center" /> : `${formatCurrency(sipConfig.tariffs.brasilMovel.callCenter)}<br/>por minuto`}</TableCell>
                                                            <TableCell colSpan={10} className="text-center">{isEditingSIP ? <Input type="number" value={sipConfig.tariffs.brasilMovel.default} onChange={(e) => setSipConfig(prev => ({ ...prev, tariffs: { ...prev.tariffs, brasilMovel: { ...prev.tariffs.brasilMovel, default: Number(e.target.value) } } }))} className="bg-slate-800 text-center" /> : `${formatCurrency(sipConfig.tariffs.brasilMovel.default)} por minuto`}</TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Tabela de Preços PABX Standard */}
                                    <Card className="bg-slate-900/80 border-slate-800 text-white">
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <CardTitle className="text-green-400">PABX Standard</CardTitle>
                                            <Button
                                                variant={isEditingPABX ? "secondary" : "outline"}
                                                size="sm"
                                                onClick={() => setIsEditingPABX(!isEditingPABX)}
                                                className="border-slate-600"
                                            >
                                                {isEditingPABX ? "Salvar" : "Editar"}
                                            </Button>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="overflow-x-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="border-slate-700">
                                                            <TableHead className="text-white bg-green-800">Serviço</TableHead>
                                                            <TableHead className="text-white bg-yellow-600 text-center">Até 10 ramais</TableHead>
                                                            <TableHead className="text-white bg-yellow-600 text-center">De 11 a 20 ramais</TableHead>
                                                            <TableHead className="text-white bg-yellow-600 text-center">De 21 a 30 ramais</TableHead>
                                                            <TableHead className="text-white bg-yellow-600 text-center">De 31 a 50 ramais</TableHead>
                                                            <TableHead className="text-white bg-yellow-600 text-center">De 51 a 100 ramais</TableHead>
                                                            <TableHead className="text-white bg-yellow-600 text-center">De 101 a 500 ramais</TableHead>
                                                            <TableHead className="text-white bg-yellow-600 text-center">De 501 a 1.000 ramais</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        <TableRow className="border-slate-800">
                                                            <TableCell className="font-semibold bg-green-900/30">Setup (cobrança única)</TableCell>
                                                            {isEditingPABX ? (
                                                                <>
                                                                    <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.standard.setup['10']} onChange={(e) => setPabxPrices(prev => ({ ...prev, standard: { ...prev.standard, setup: { ...prev.standard.setup, '10': parseFloat(e.target.value) || 0 } } }))} /></TableCell>
                                                                    <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.standard.setup['20']} onChange={(e) => setPabxPrices(prev => ({ ...prev, standard: { ...prev.standard, setup: { ...prev.standard.setup, '20': parseFloat(e.target.value) || 0 } } }))} /></TableCell>
                                                                    <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.standard.setup['30']} onChange={(e) => setPabxPrices(prev => ({ ...prev, standard: { ...prev.standard, setup: { ...prev.standard.setup, '30': parseFloat(e.target.value) || 0 } } }))} /></TableCell>
                                                                    <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.standard.setup['50']} onChange={(e) => setPabxPrices(prev => ({ ...prev, standard: { ...prev.standard, setup: { ...prev.standard.setup, '50': parseFloat(e.target.value) || 0 } } }))} /></TableCell>
                                                                    <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.standard.setup['100']} onChange={(e) => setPabxPrices(prev => ({ ...prev, standard: { ...prev.standard, setup: { ...prev.standard.setup, '100': parseFloat(e.target.value) || 0 } } }))} /></TableCell>
                                                                    <TableCell className="text-center text-blue-400">Valor a combinar</TableCell>
                                                                    <TableCell className="text-center text-blue-400">Valor a combinar</TableCell>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <TableCell className="text-center">{formatCurrency(pabxPrices.standard.setup['10'])}</TableCell>
                                                                    <TableCell className="text-center">{formatCurrency(pabxPrices.standard.setup['20'])}</TableCell>
                                                                    <TableCell className="text-center">{formatCurrency(pabxPrices.standard.setup['30'])}</TableCell>
                                                                    <TableCell className="text-center">{formatCurrency(pabxPrices.standard.setup['50'])}</TableCell>
                                                                    <TableCell className="text-center">{formatCurrency(pabxPrices.standard.setup['100'])}</TableCell>
                                                                    <TableCell className="text-center text-blue-400">Valor a combinar</TableCell>
                                                                    <TableCell className="text-center text-blue-400">Valor a combinar</TableCell>
                                                                </>
                                                            )}
                                                        </TableRow>
                                                        <TableRow className="border-slate-800">
                                                            <TableCell className="font-semibold bg-green-900/30">Valor por ramal (mensal unitário)</TableCell>
                                                            {isEditingPABX ? (
                                                                <>
                                                                    <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.standard.monthly['10']} onChange={(e) => setPabxPrices(prev => ({ ...prev, standard: { ...prev.standard, monthly: { ...prev.standard.monthly, '10': parseFloat(e.target.value) || 0 } } }))} /></TableCell>
                                                                    <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.standard.monthly['20']} onChange={(e) => setPabxPrices(prev => ({ ...prev, standard: { ...prev.standard, monthly: { ...prev.standard.monthly, '20': parseFloat(e.target.value) || 0 } } }))} /></TableCell>
                                                                    <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.standard.monthly['30']} onChange={(e) => setPabxPrices(prev => ({ ...prev, standard: { ...prev.standard, monthly: { ...prev.standard.monthly, '30': parseFloat(e.target.value) || 0 } } }))} /></TableCell>
                                                                    <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.standard.monthly['50']} onChange={(e) => setPabxPrices(prev => ({ ...prev, standard: { ...prev.standard, monthly: { ...prev.standard.monthly, '50': parseFloat(e.target.value) || 0 } } }))} /></TableCell>
                                                                    <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.standard.monthly['100']} onChange={(e) => setPabxPrices(prev => ({ ...prev, standard: { ...prev.standard, monthly: { ...prev.standard.monthly, '100': parseFloat(e.target.value) || 0 } } }))} /></TableCell>
                                                                    <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.standard.monthly['500']} onChange={(e) => setPabxPrices(prev => ({ ...prev, standard: { ...prev.standard, monthly: { ...prev.standard.monthly, '500': parseFloat(e.target.value) || 0 } } }))} /></TableCell>
                                                                    <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.standard.monthly['1000']} onChange={(e) => setPabxPrices(prev => ({ ...prev, standard: { ...prev.standard, monthly: { ...prev.standard.monthly, '1000': parseFloat(e.target.value) || 0 } } }))} /></TableCell>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <TableCell className="text-center">{formatCurrency(pabxPrices.standard.monthly['10'])}</TableCell>
                                                                    <TableCell className="text-center">{formatCurrency(pabxPrices.standard.monthly['20'])}</TableCell>
                                                                    <TableCell className="text-center">{formatCurrency(pabxPrices.standard.monthly['30'])}</TableCell>
                                                                    <TableCell className="text-center">{formatCurrency(pabxPrices.standard.monthly['50'])}</TableCell>
                                                                    <TableCell className="text-center">{formatCurrency(pabxPrices.standard.monthly['100'])}</TableCell>
                                                                    <TableCell className="text-center">{formatCurrency(pabxPrices.standard.monthly['500'])}</TableCell>
                                                                    <TableCell className="text-center">{formatCurrency(pabxPrices.standard.monthly['1000'])}</TableCell>
                                                                </>
                                                            )}
                                                        </TableRow>
                                                        <TableRow className="border-slate-800">
                                                            <TableCell className="font-semibold bg-green-900/30">Valor hospedagem (mensal)</TableCell>
                                                            {isEditingPABX ? (
                                                                <>
                                                                    <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.standard.hosting['10']} onChange={(e) => setPabxPrices(prev => ({ ...prev, standard: { ...prev.standard, hosting: { ...prev.standard.hosting, '10': parseFloat(e.target.value) || 0 } } }))} /></TableCell>
                                                                    <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.standard.hosting['20']} onChange={(e) => setPabxPrices(prev => ({ ...prev, standard: { ...prev.standard, hosting: { ...prev.standard.hosting, '20': parseFloat(e.target.value) || 0 } } }))} /></TableCell>
                                                                    <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.standard.hosting['30']} onChange={(e) => setPabxPrices(prev => ({ ...prev, standard: { ...prev.standard, hosting: { ...prev.standard.hosting, '30': parseFloat(e.target.value) || 0 } } }))} /></TableCell>
                                                                    <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.standard.hosting['50']} onChange={(e) => setPabxPrices(prev => ({ ...prev, standard: { ...prev.standard, hosting: { ...prev.standard.hosting, '50': parseFloat(e.target.value) || 0 } } }))} /></TableCell>
                                                                    <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.standard.hosting['100']} onChange={(e) => setPabxPrices(prev => ({ ...prev, standard: { ...prev.standard, hosting: { ...prev.standard.hosting, '100': parseFloat(e.target.value) || 0 } } }))} /></TableCell>
                                                                    <TableCell className="text-center text-blue-400">Valor a combinar</TableCell>
                                                                    <TableCell className="text-center text-blue-400">Valor a combinar</TableCell>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <TableCell className="text-center">{formatCurrency(pabxPrices.standard.hosting['10'])}</TableCell>
                                                                    <TableCell className="text-center">{formatCurrency(pabxPrices.standard.hosting['20'])}</TableCell>
                                                                    <TableCell className="text-center">{formatCurrency(pabxPrices.standard.hosting['30'])}</TableCell>
                                                                    <TableCell className="text-center">{formatCurrency(pabxPrices.standard.hosting['50'])}</TableCell>
                                                                    <TableCell className="text-center">{formatCurrency(pabxPrices.standard.hosting['100'])}</TableCell>
                                                                    <TableCell className="text-center text-blue-400">Valor a combinar</TableCell>
                                                                    <TableCell className="text-center text-blue-400">Valor a combinar</TableCell>
                                                                </>
                                                            )}
                                                        </TableRow>
                                                        <TableRow className="border-slate-800">
                                                            <TableCell className="font-semibold bg-green-900/30">Aluguel Aparelho Grandstream (mensal)</TableCell>
                                                            {isEditingPABX ? (
                                                                <>
                                                                    <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.standard.device['10']} onChange={(e) => setPabxPrices(prev => ({ ...prev, standard: { ...prev.standard, device: { ...prev.standard.device, '10': parseFloat(e.target.value) || 0 } } }))} /></TableCell>
                                                                    <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.standard.device['20']} onChange={(e) => setPabxPrices(prev => ({ ...prev, standard: { ...prev.standard, device: { ...prev.standard.device, '20': parseFloat(e.target.value) || 0 } } }))} /></TableCell>
                                                                    <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.standard.device['30']} onChange={(e) => setPabxPrices(prev => ({ ...prev, standard: { ...prev.standard, device: { ...prev.standard.device, '30': parseFloat(e.target.value) || 0 } } }))} /></TableCell>
                                                                    <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.standard.device['50']} onChange={(e) => setPabxPrices(prev => ({ ...prev, standard: { ...prev.standard, device: { ...prev.standard.device, '50': parseFloat(e.target.value) || 0 } } }))} /></TableCell>
                                                                    <TableCell><Input className="bg-slate-800 text-center" value={pabxPrices.standard.device['100']} onChange={(e) => setPabxPrices(prev => ({ ...prev, standard: { ...prev.standard, device: { ...prev.standard.device, '100': parseFloat(e.target.value) || 0 } } }))} /></TableCell>
                                                                    <TableCell className="text-center text-blue-400">Valor a combinar</TableCell>
                                                                    <TableCell className="text-center text-blue-400">Valor a combinar</TableCell>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <TableCell className="text-center">{formatCurrency(pabxPrices.standard.device['10'])}</TableCell>
                                                                    <TableCell className="text-center">{formatCurrency(pabxPrices.standard.device['20'])}</TableCell>
                                                                    <TableCell className="text-center">{formatCurrency(pabxPrices.standard.device['30'])}</TableCell>
                                                                    <TableCell className="text-center">{formatCurrency(pabxPrices.standard.device['50'])}</TableCell>
                                                                    <TableCell className="text-center">{formatCurrency(pabxPrices.standard.device['100'])}</TableCell>
                                                                    <TableCell className="text-center text-blue-400">Valor a combinar</TableCell>
                                                                    <TableCell className="text-center text-blue-400">Valor a combinar</TableCell>
                                                                </>
                                                            )}
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Tabela de Preços PABX Premium */}
                                    <Card className="bg-slate-900/80 border-slate-800 text-white">
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <CardTitle className="text-purple-400">PABX Premium</CardTitle>
                                            <Button
                                                variant={isEditingPremium ? "secondary" : "outline"}
                                                size="sm"
                                                onClick={() => {
                                                    if (isEditingPremium) {
                                                        handleSavePremium();
                                                    } else {
                                                        setIsEditingPremium(true);
                                                    }
                                                }}
                                                className="border-slate-600"
                                            >
                                                {isEditingPremium ? "Salvar" : "Editar"}
                                            </Button>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-6">
                                                {/* Contratos de 24 meses */}
                                                <div>
                                                    <h4 className="text-lg font-semibold text-blue-400 mb-3 text-center bg-blue-900/30 py-2 rounded">24 MESES</h4>
                                                    
                                                    {/* Essencial Ilimitado */}
                                                    <div className="mb-4">
                                                        <h5 className="text-md font-semibold text-green-300 mb-2 bg-green-900/30 py-1 px-2 rounded">ESSENCIAL Ilimitado</h5>
                                                        <div className="overflow-x-auto">
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow className="border-slate-700">
                                                                        <TableHead className="text-white bg-green-800">Faixa de Ramais</TableHead>
                                                                        <TableHead className="text-white bg-yellow-600 text-center">Com Equipamento</TableHead>
                                                                        <TableHead className="text-white bg-yellow-600 text-center">Sem Equipamento</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {Object.entries(editablePremiumPrices['24'].essencialIlimitado).map(([range, prices]) => (
                                                                        <TableRow key={range} className="border-slate-800">
                                                                            <TableCell className="font-semibold bg-green-900/30">{range} ramais</TableCell>
                                                                            {isEditingPremium ? (
                                                                                <>
                                                                                    <TableCell>
                                                                                        <Input 
                                                                                            className="bg-slate-800 text-center" 
                                                                                            value={prices.withEquipment} 
                                                                                            onChange={(e) => setEditablePremiumPrices(prev => ({
                                                                                                ...prev,
                                                                                                '24': {
                                                                                                    ...prev['24'],
                                                                                                    essencialIlimitado: {
                                                                                                        ...prev['24'].essencialIlimitado,
                                                                                                        [range]: {
                                                                                                            ...prev['24'].essencialIlimitado[range as keyof typeof prev['24']['essencialIlimitado']],
                                                                                                            withEquipment: parseFloat(e.target.value) || 0
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }))}
                                                                                        />
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        <Input 
                                                                                            className="bg-slate-800 text-center" 
                                                                                            value={prices.withoutEquipment} 
                                                                                            onChange={(e) => setEditablePremiumPrices(prev => ({
                                                                                                ...prev,
                                                                                                '24': {
                                                                                                    ...prev['24'],
                                                                                                    essencialIlimitado: {
                                                                                                        ...prev['24'].essencialIlimitado,
                                                                                                        [range]: {
                                                                                                            ...prev['24'].essencialIlimitado[range as keyof typeof prev['24']['essencialIlimitado']],
                                                                                                            withoutEquipment: parseFloat(e.target.value) || 0
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }))}
                                                                                        />
                                                                                    </TableCell>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <TableCell className="text-center">{formatCurrency(prices.withEquipment)}</TableCell>
                                                                                    <TableCell className="text-center">{formatCurrency(prices.withoutEquipment)}</TableCell>
                                                                                </>
                                                                            )}
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </div>

                                                    {/* Essencial Tarifado */}
                                                    <div className="mb-4">
                                                        <h5 className="text-md font-semibold text-green-300 mb-2 bg-green-900/30 py-1 px-2 rounded">ESSENCIAL Tarifado</h5>
                                                        <div className="overflow-x-auto">
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow className="border-slate-700">
                                                                        <TableHead className="text-white bg-green-800">Faixa de Ramais</TableHead>
                                                                        <TableHead className="text-white bg-yellow-600 text-center">Com Equipamento</TableHead>
                                                                        <TableHead className="text-white bg-yellow-600 text-center">Sem Equipamento</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {Object.entries(editablePremiumPrices['24'].essencialTarifado).map(([range, prices]) => (
                                                                        <TableRow key={range} className="border-slate-800">
                                                                            <TableCell className="font-semibold bg-green-900/30">{range} ramais</TableCell>
                                                                            {isEditingPremium ? (
                                                                                <>
                                                                                    <TableCell>
                                                                                        <Input 
                                                                                            className="bg-slate-800 text-center" 
                                                                                            value={prices.withEquipment} 
                                                                                            onChange={(e) => setEditablePremiumPrices(prev => ({
                                                                                                ...prev,
                                                                                                '24': {
                                                                                                    ...prev['24'],
                                                                                                    essencialTarifado: {
                                                                                                        ...prev['24'].essencialTarifado,
                                                                                                        [range]: {
                                                                                                            ...prev['24'].essencialTarifado[range as keyof typeof prev['24']['essencialTarifado']],
                                                                                                            withEquipment: parseFloat(e.target.value) || 0
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }))}
                                                                                        />
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        <Input 
                                                                                            className="bg-slate-800 text-center" 
                                                                                            value={prices.withoutEquipment} 
                                                                                            onChange={(e) => setEditablePremiumPrices(prev => ({
                                                                                                ...prev,
                                                                                                '24': {
                                                                                                    ...prev['24'],
                                                                                                    essencialTarifado: {
                                                                                                        ...prev['24'].essencialTarifado,
                                                                                                        [range]: {
                                                                                                            ...prev['24'].essencialTarifado[range as keyof typeof prev['24']['essencialTarifado']],
                                                                                                            withoutEquipment: parseFloat(e.target.value) || 0
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }))}
                                                                                        />
                                                                                    </TableCell>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <TableCell className="text-center">{formatCurrency(prices.withEquipment)}</TableCell>
                                                                                    <TableCell className="text-center">{formatCurrency(prices.withoutEquipment)}</TableCell>
                                                                                </>
                                                                            )}
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </div>

                                                    {/* Professional Ilimitado */}
                                                    <div className="mb-4">
                                                        <h5 className="text-md font-semibold text-blue-300 mb-2 bg-blue-900/30 py-1 px-2 rounded">PROFESSIONAL Ilimitado</h5>
                                                        <div className="overflow-x-auto">
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow className="border-slate-700">
                                                                        <TableHead className="text-white bg-green-800">Faixa de Ramais</TableHead>
                                                                        <TableHead className="text-white bg-yellow-600 text-center">Com Equipamento</TableHead>
                                                                        <TableHead className="text-white bg-yellow-600 text-center">Sem Equipamento</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {Object.entries(editablePremiumPrices['24'].professionalIlimitado).map(([range, prices]) => (
                                                                        <TableRow key={range} className="border-slate-800">
                                                                            <TableCell className="font-semibold bg-green-900/30">{range} ramais</TableCell>
                                                                            {isEditingPremium ? (
                                                                                <>
                                                                                    <TableCell>
                                                                                        <Input 
                                                                                            className="bg-slate-800 text-center" 
                                                                                            value={prices.withEquipment} 
                                                                                            onChange={(e) => setEditablePremiumPrices(prev => ({
                                                                                                ...prev,
                                                                                                '24': {
                                                                                                    ...prev['24'],
                                                                                                    professionalIlimitado: {
                                                                                                        ...prev['24'].professionalIlimitado,
                                                                                                        [range]: {
                                                                                                            ...prev['24'].professionalIlimitado[range as keyof typeof prev['24']['professionalIlimitado']],
                                                                                                            withEquipment: parseFloat(e.target.value) || 0
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }))}
                                                                                        />
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        <Input 
                                                                                            className="bg-slate-800 text-center" 
                                                                                            value={prices.withoutEquipment} 
                                                                                            onChange={(e) => setEditablePremiumPrices(prev => ({
                                                                                                ...prev,
                                                                                                '24': {
                                                                                                    ...prev['24'],
                                                                                                    professionalIlimitado: {
                                                                                                        ...prev['24'].professionalIlimitado,
                                                                                                        [range]: {
                                                                                                            ...prev['24'].professionalIlimitado[range as keyof typeof prev['24']['professionalIlimitado']],
                                                                                                            withoutEquipment: parseFloat(e.target.value) || 0
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }))}
                                                                                        />
                                                                                    </TableCell>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <TableCell className="text-center">{formatCurrency(prices.withEquipment)}</TableCell>
                                                                                    <TableCell className="text-center">{formatCurrency(prices.withoutEquipment)}</TableCell>
                                                                                </>
                                                                            )}
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </div>

                                                    {/* Professional Tarifado */}
                                                    <div className="mb-6">
                                                        <h5 className="text-md font-semibold text-blue-300 mb-2 bg-blue-900/30 py-1 px-2 rounded">PROFESSIONAL Tarifado</h5>
                                                        <div className="overflow-x-auto">
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow className="border-slate-700">
                                                                        <TableHead className="text-white bg-green-800">Faixa de Ramais</TableHead>
                                                                        <TableHead className="text-white bg-yellow-600 text-center">Com Equipamento</TableHead>
                                                                        <TableHead className="text-white bg-yellow-600 text-center">Sem Equipamento</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {Object.entries(editablePremiumPrices['24'].professionalTarifado).map(([range, prices]) => (
                                                                        <TableRow key={range} className="border-slate-800">
                                                                            <TableCell className="font-semibold bg-green-900/30">{range} ramais</TableCell>
                                                                            {isEditingPremium ? (
                                                                                <>
                                                                                    <TableCell>
                                                                                        <Input 
                                                                                            className="bg-slate-800 text-center" 
                                                                                            value={prices.withEquipment} 
                                                                                            onChange={(e) => setEditablePremiumPrices(prev => ({
                                                                                                ...prev,
                                                                                                '24': {
                                                                                                    ...prev['24'],
                                                                                                    professionalTarifado: {
                                                                                                        ...prev['24'].professionalTarifado,
                                                                                                        [range]: {
                                                                                                            ...prev['24'].professionalTarifado[range as keyof typeof prev['24']['professionalTarifado']],
                                                                                                            withEquipment: parseFloat(e.target.value) || 0
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }))}
                                                                                        />
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        <Input 
                                                                                            className="bg-slate-800 text-center" 
                                                                                            value={prices.withoutEquipment} 
                                                                                            onChange={(e) => setEditablePremiumPrices(prev => ({
                                                                                                ...prev,
                                                                                                '24': {
                                                                                                    ...prev['24'],
                                                                                                    professionalTarifado: {
                                                                                                        ...prev['24'].professionalTarifado,
                                                                                                        [range]: {
                                                                                                            ...prev['24'].professionalTarifado[range as keyof typeof prev['24']['professionalTarifado']],
                                                                                                            withoutEquipment: parseFloat(e.target.value) || 0
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }))}
                                                                                        />
                                                                                    </TableCell>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <TableCell className="text-center">{formatCurrency(prices.withEquipment)}</TableCell>
                                                                                    <TableCell className="text-center">{formatCurrency(prices.withoutEquipment)}</TableCell>
                                                                                </>
                                                                            )}
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Contratos de 36 meses */}
                                                <div>
                                                    <h4 className="text-lg font-semibold text-blue-400 mb-3 text-center bg-blue-900/30 py-2 rounded">36 MESES</h4>
                                                    
                                                    {/* Essencial Ilimitado */}
                                                    <div className="mb-4">
                                                        <h5 className="text-md font-semibold text-green-300 mb-2 bg-green-900/30 py-1 px-2 rounded">ESSENCIAL Ilimitado</h5>
                                                        <div className="overflow-x-auto">
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow className="border-slate-700">
                                                                        <TableHead className="text-white bg-green-800">Faixa de Ramais</TableHead>
                                                                        <TableHead className="text-white bg-yellow-600 text-center">Com Equipamento</TableHead>
                                                                        <TableHead className="text-white bg-yellow-600 text-center">Sem Equipamento</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {Object.entries(editablePremiumPrices['36'].essencialIlimitado).map(([range, prices]) => (
                                                                        <TableRow key={range} className="border-slate-800">
                                                                            <TableCell className="font-semibold bg-green-900/30">{range} ramais</TableCell>
                                                                            {isEditingPremium ? (
                                                                                <>
                                                                                    <TableCell>
                                                                                        <Input 
                                                                                            className="bg-slate-800 text-center" 
                                                                                            value={prices.withEquipment} 
                                                                                            onChange={(e) => setEditablePremiumPrices(prev => ({
                                                                                                ...prev,
                                                                                                '36': {
                                                                                                    ...prev['36'],
                                                                                                    essencialIlimitado: {
                                                                                                        ...prev['36'].essencialIlimitado,
                                                                                                        [range]: {
                                                                                                            ...prev['36'].essencialIlimitado[range as keyof typeof prev['36']['essencialIlimitado']],
                                                                                                            withEquipment: parseFloat(e.target.value) || 0
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }))}
                                                                                        />
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        <Input 
                                                                                            className="bg-slate-800 text-center" 
                                                                                            value={prices.withoutEquipment} 
                                                                                            onChange={(e) => setEditablePremiumPrices(prev => ({
                                                                                                ...prev,
                                                                                                '36': {
                                                                                                    ...prev['36'],
                                                                                                    essencialIlimitado: {
                                                                                                        ...prev['36'].essencialIlimitado,
                                                                                                        [range]: {
                                                                                                            ...prev['36'].essencialIlimitado[range as keyof typeof prev['36']['essencialIlimitado']],
                                                                                                            withoutEquipment: parseFloat(e.target.value) || 0
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }))}
                                                                                        />
                                                                                    </TableCell>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <TableCell className="text-center">{formatCurrency(prices.withEquipment)}</TableCell>
                                                                                    <TableCell className="text-center">{formatCurrency(prices.withoutEquipment)}</TableCell>
                                                                                </>
                                                                            )}
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </div>

                                                    {/* Essencial Tarifado */}
                                                    <div className="mb-4">
                                                        <h5 className="text-md font-semibold text-green-300 mb-2 bg-green-900/30 py-1 px-2 rounded">ESSENCIAL Tarifado</h5>
                                                        <div className="overflow-x-auto">
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow className="border-slate-700">
                                                                        <TableHead className="text-white bg-green-800">Faixa de Ramais</TableHead>
                                                                        <TableHead className="text-white bg-yellow-600 text-center">Com Equipamento</TableHead>
                                                                        <TableHead className="text-white bg-yellow-600 text-center">Sem Equipamento</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {Object.entries(editablePremiumPrices['36'].essencialTarifado).map(([range, prices]) => (
                                                                        <TableRow key={range} className="border-slate-800">
                                                                            <TableCell className="font-semibold bg-green-900/30">{range} ramais</TableCell>
                                                                            {isEditingPremium ? (
                                                                                <>
                                                                                    <TableCell>
                                                                                        <Input 
                                                                                            className="bg-slate-800 text-center" 
                                                                                            value={prices.withEquipment} 
                                                                                            onChange={(e) => setEditablePremiumPrices(prev => ({
                                                                                                ...prev,
                                                                                                '36': {
                                                                                                    ...prev['36'],
                                                                                                    essencialTarifado: {
                                                                                                        ...prev['36'].essencialTarifado,
                                                                                                        [range]: {
                                                                                                            ...prev['36'].essencialTarifado[range as keyof typeof prev['36']['essencialTarifado']],
                                                                                                            withEquipment: parseFloat(e.target.value) || 0
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }))}
                                                                                        />
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        <Input 
                                                                                            className="bg-slate-800 text-center" 
                                                                                            value={prices.withoutEquipment} 
                                                                                            onChange={(e) => setEditablePremiumPrices(prev => ({
                                                                                                ...prev,
                                                                                                '36': {
                                                                                                    ...prev['36'],
                                                                                                    essencialTarifado: {
                                                                                                        ...prev['36'].essencialTarifado,
                                                                                                        [range]: {
                                                                                                            ...prev['36'].essencialTarifado[range as keyof typeof prev['36']['essencialTarifado']],
                                                                                                            withoutEquipment: parseFloat(e.target.value) || 0
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }))}
                                                                                        />
                                                                                    </TableCell>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <TableCell className="text-center">{formatCurrency(prices.withEquipment)}</TableCell>
                                                                                    <TableCell className="text-center">{formatCurrency(prices.withoutEquipment)}</TableCell>
                                                                                </>
                                                                            )}
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </div>

                                                    {/* Professional Ilimitado */}
                                                    <div className="mb-4">
                                                        <h5 className="text-md font-semibold text-blue-300 mb-2 bg-blue-900/30 py-1 px-2 rounded">PROFESSIONAL Ilimitado</h5>
                                                        <div className="overflow-x-auto">
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow className="border-slate-700">
                                                                        <TableHead className="text-white bg-green-800">Faixa de Ramais</TableHead>
                                                                        <TableHead className="text-white bg-yellow-600 text-center">Com Equipamento</TableHead>
                                                                        <TableHead className="text-white bg-yellow-600 text-center">Sem Equipamento</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {Object.entries(editablePremiumPrices['36'].professionalIlimitado).map(([range, prices]) => (
                                                                        <TableRow key={range} className="border-slate-800">
                                                                            <TableCell className="font-semibold bg-green-900/30">{range} ramais</TableCell>
                                                                            {isEditingPremium ? (
                                                                                <>
                                                                                    <TableCell>
                                                                                        <Input 
                                                                                            className="bg-slate-800 text-center" 
                                                                                            value={prices.withEquipment} 
                                                                                            onChange={(e) => setEditablePremiumPrices(prev => ({
                                                                                                ...prev,
                                                                                                '36': {
                                                                                                    ...prev['36'],
                                                                                                    professionalIlimitado: {
                                                                                                        ...prev['36'].professionalIlimitado,
                                                                                                        [range]: {
                                                                                                            ...prev['36'].professionalIlimitado[range as keyof typeof prev['36']['professionalIlimitado']],
                                                                                                            withEquipment: parseFloat(e.target.value) || 0
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }))}
                                                                                        />
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        <Input 
                                                                                            className="bg-slate-800 text-center" 
                                                                                            value={prices.withoutEquipment} 
                                                                                            onChange={(e) => setEditablePremiumPrices(prev => ({
                                                                                                ...prev,
                                                                                                '36': {
                                                                                                    ...prev['36'],
                                                                                                    professionalIlimitado: {
                                                                                                        ...prev['36'].professionalIlimitado,
                                                                                                        [range]: {
                                                                                                            ...prev['36'].professionalIlimitado[range as keyof typeof prev['36']['professionalIlimitado']],
                                                                                                            withoutEquipment: parseFloat(e.target.value) || 0
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }))}
                                                                                        />
                                                                                    </TableCell>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <TableCell className="text-center">{formatCurrency(prices.withEquipment)}</TableCell>
                                                                                    <TableCell className="text-center">{formatCurrency(prices.withoutEquipment)}</TableCell>
                                                                                </>
                                                                            )}
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </div>

                                                    {/* Professional Tarifado */}
                                                    <div className="mb-4">
                                                        <h5 className="text-md font-semibold text-blue-300 mb-2 bg-blue-900/30 py-1 px-2 rounded">PROFESSIONAL Tarifado</h5>
                                                        <div className="overflow-x-auto">
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow className="border-slate-700">
                                                                        <TableHead className="text-white bg-green-800">Faixa de Ramais</TableHead>
                                                                        <TableHead className="text-white bg-yellow-600 text-center">Com Equipamento</TableHead>
                                                                        <TableHead className="text-white bg-yellow-600 text-center">Sem Equipamento</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {Object.entries(editablePremiumPrices['36'].professionalTarifado).map(([range, prices]) => (
                                                                        <TableRow key={range} className="border-slate-800">
                                                                            <TableCell className="font-semibold bg-green-900/30">{range} ramais</TableCell>
                                                                            {isEditingPremium ? (
                                                                                <>
                                                                                    <TableCell>
                                                                                        <Input 
                                                                                            className="bg-slate-800 text-center" 
                                                                                            value={prices.withEquipment} 
                                                                                            onChange={(e) => setEditablePremiumPrices(prev => ({
                                                                                                ...prev,
                                                                                                '36': {
                                                                                                    ...prev['36'],
                                                                                                    professionalTarifado: {
                                                                                                        ...prev['36'].professionalTarifado,
                                                                                                        [range]: {
                                                                                                            ...prev['36'].professionalTarifado[range as keyof typeof prev['36']['professionalTarifado']],
                                                                                                            withEquipment: parseFloat(e.target.value) || 0
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }))}
                                                                                        />
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        <Input 
                                                                                            className="bg-slate-800 text-center" 
                                                                                            value={prices.withoutEquipment} 
                                                                                            onChange={(e) => setEditablePremiumPrices(prev => ({
                                                                                                ...prev,
                                                                                                '36': {
                                                                                                    ...prev['36'],
                                                                                                    professionalTarifado: {
                                                                                                        ...prev['36'].professionalTarifado,
                                                                                                        [range]: {
                                                                                                            ...prev['36'].professionalTarifado[range as keyof typeof prev['36']['professionalTarifado']],
                                                                                                            withoutEquipment: parseFloat(e.target.value) || 0
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }))}
                                                                                        />
                                                                                    </TableCell>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <TableCell className="text-center">{formatCurrency(prices.withEquipment)}</TableCell>
                                                                                    <TableCell className="text-center">{formatCurrency(prices.withoutEquipment)}</TableCell>
                                                                                </>
                                                                            )}
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>


                                </div>
                            </TabsContent>

                            

                        </>
                    }

                    {userRole === 'admin' && (
                        <TabsContent value="dre">
                            <DREComponent
                                monthlyRevenue={(pabxResult?.totalMonthly || 0) + (sipResult?.monthly || 0)}
                                setupRevenue={(pabxResult?.setup || 0) + (sipResult?.setup || 0)}
                                contractPeriod={contractPeriod}
                                projectCost={0}
                                installationRate={0}
                                hasPartnerIndicator={hasPartnerIndicator}
                            />
                        </TabsContent>
                    )}
                </Tabs>
            </div>

            {/* Modais */}
            {console.log('Modal check:', { showNegotiationRounds, selectedProposal: !!selectedProposal })}
            {showNegotiationRounds && selectedProposal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-black">Modal de Teste</h2>
                        <p className="text-black">Proposta ID: {selectedProposal.id}</p>
                        <button
                            onClick={() => setShowNegotiationRounds(false)}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
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

            {/* Modal Nova Proposta */}
            <NovaPropostaModal
                isOpen={showNovaPropostaModal}
                onClose={handleCloseModal}
                onContinue={handleContinueWithProposal}
                initialData={currentProposal ? {
                    cliente: {
                        name: currentProposal.clientData?.name || '',
                        projectName: currentProposal.clientData?.projectName || '',
                        email: currentProposal.clientData?.email || '',
                        phone: currentProposal.clientData?.phone || ''
                    },
                    gerente: {
                        name: currentProposal.accountManagerData?.name || '',
                        email: currentProposal.accountManagerData?.email || '',
                        phone: currentProposal.accountManagerData?.phone || ''
                    }
                } : undefined}
                isEditing={!!currentProposal}
            />
        </>
    );
};

export default PABXSIPCalculator;