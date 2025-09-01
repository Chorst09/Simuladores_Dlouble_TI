export interface ClientData {
    name: string;
    projectName: string;
    email: string;
    phone: string;
}

export interface AccountManagerData {
    name: string;
    email: string;
    phone: string;
}

// Premium PABX Plan Types
export type PABXPriceRange = '10' | '20' | '30' | '50' | '100' | '500' | '1000';

export interface PlanPrices {
    setup: Record<PABXPriceRange, number>;
    monthly: Record<PABXPriceRange, number>;
    hosting: Record<PABXPriceRange, number>;
    device: Record<PABXPriceRange, number>;
}

export interface PremiumPlanPricing {
    essencial: {
        ilimitado: PlanPrices;
        tarifado: PlanPrices;
    };
    professional: {
        ilimitado: PlanPrices;
        tarifado: PlanPrices;
    };
}

// Re-export pricing types
export * from './pricing';

export interface ProposalItem {
    id: string;
    name: string;
    description: string;
    unitPrice: number;
    setup: number;
    monthly: number;
    quantity: number;
    details?: any;
    // PABX Premium configuration for individual items
    pabxConfig?: {
        modality?: 'standard' | 'premium';
        premiumPlan?: 'essencial' | 'professional' | null;
        premiumBillingType?: 'ilimitado-sem-aparelho' | 'ilimitado-com-aparelho' | 'tarifado-sem-aparelho' | 'tarifado-com-aparelho' | null;
    };
}

export interface DirectorDiscountData {
    percentage: number;
    appliedBy: string;
    appliedAt: string;
    reason?: string;
    originalValue: number;
    discountedValue: number;
}

export interface PABXConfiguration {
    modality: 'standard' | 'premium';
    premiumPlan?: 'essencial' | 'professional' | null;
    premiumBillingType?: 'ilimitado-sem-aparelho' | 'ilimitado-com-aparelho' | 'tarifado-sem-aparelho' | 'tarifado-com-aparelho' | null;
    extensions?: number;
    includeSetup?: boolean;
    includeDevices?: boolean;
    deviceQuantity?: number;
    includeAI?: boolean;
    aiPlan?: string | null;
}

export interface Proposal {
    id: string;
    clientData: ClientData;
    accountManagerData: AccountManagerData;
    proposalItems: ProposalItem[];
    totalSetup: number;
    totalMonthly: number;
    contractPeriod?: number;
    createdAt: string;
    status?: string;
    type?: string;
    proposalNumber?: string;
    userId: string;
    userEmail: string;
    directorDiscount?: DirectorDiscountData;
    negotiationRounds?: any[];
    currentRound?: number;
    // PABX Premium configuration for the entire proposal
    pabxConfiguration?: PABXConfiguration;
    pabx_configuration?: PABXConfiguration; // Backend format compatibility
}
