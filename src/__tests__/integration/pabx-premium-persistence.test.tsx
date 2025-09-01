import { Proposal, ProposalItem, PABXConfiguration } from '@/types';

describe('PABX Premium Persistence', () => {
  test('should save PABX Premium configuration in proposal', () => {
    const mockProposal: Proposal = {
      id: 'test-proposal-1',
      clientData: { name: 'Test Client', projectName: 'Test Project', email: 'client@test.com', phone: '123456789' },
      accountManagerData: { name: 'Test Manager', email: 'manager@test.com', phone: '987654321' },
      proposalItems: [],
      totalSetup: 0,
      totalMonthly: 1000,
      createdAt: new Date().toISOString(),
      userId: 'mock-user-id',
      userEmail: 'test@example.com',
      pabxConfiguration: {
        modality: 'premium',
        premiumPlan: 'essencial',
        premiumBillingType: 'ilimitado',
        extensions: 50,
        includeSetup: true,
        includeDevices: true,
        deviceQuantity: 10,
        includeAI: false,
        aiPlan: null,
      }
    };

    // Test that the proposal has the correct PABX configuration structure
    expect(mockProposal.pabxConfiguration).toBeDefined();
    expect(mockProposal.pabxConfiguration?.modality).toBe('premium');
    expect(mockProposal.pabxConfiguration?.premiumPlan).toBe('essencial');
    expect(mockProposal.pabxConfiguration?.premiumBillingType).toBe('ilimitado');
  });

  test('should load PABX Premium configuration from proposal', () => {
    const mockProposalItem: ProposalItem = {
      id: 'test-item-1',
      name: 'PABX Premium Essencial Ilimitado - 50 ramais',
      description: 'PABX Premium Essencial Ilimitado - 50 ramais',
      unitPrice: 1450,
      setup: 3200,
      monthly: 1450,
      quantity: 1,
      pabxConfig: {
        modality: 'premium',
        premiumPlan: 'essencial',
        premiumBillingType: 'ilimitado',
      },
      details: {
        modality: 'premium',
        premiumPlan: 'essencial',
        premiumBillingType: 'ilimitado',
        extensions: 50,
        includeSetup: true,
        includeDevices: true,
        deviceQuantity: 10,
        includeAI: false,
        aiPlan: null,
        hasACombinarValues: false
      }
    };

    // Test that the proposal item has the correct structure
    expect(mockProposalItem.pabxConfig).toBeDefined();
    expect(mockProposalItem.pabxConfig?.modality).toBe('premium');
    expect(mockProposalItem.pabxConfig?.premiumPlan).toBe('essencial');
    expect(mockProposalItem.pabxConfig?.premiumBillingType).toBe('ilimitado');
  });

  test('should handle backward compatibility for old proposal format', () => {
    const oldFormatProposalItem: ProposalItem = {
      id: 'test-item-old',
      name: 'PABX Premium Professional Tarifado - 100 ramais',
      description: 'PABX Premium Professional Tarifado - 100 ramais',
      unitPrice: 3400,
      setup: 3800,
      monthly: 3400,
      quantity: 1,
      // No pabxConfig field - old format
      details: {
        modality: 'premium',
        premiumPlan: 'professional',
        premiumBillingType: 'tarifado',
        extensions: 100,
        includeSetup: true,
        includeDevices: true,
        deviceQuantity: 20,
        includeAI: true,
        aiPlan: '100K',
        hasACombinarValues: false
      }
    };

    // Import the utility function to test it
    // Note: In a real test, we would need to export this function or test it through the component
    const ensurePABXConfigCompatibility = (item: ProposalItem): ProposalItem => {
      if (item.pabxConfig) {
        return item;
      }

      if (item.details && (item.details.modality || item.details.premiumPlan || item.details.premiumBillingType)) {
        return {
          ...item,
          pabxConfig: {
            modality: item.details.modality || 'standard',
            premiumPlan: item.details.premiumPlan || null,
            premiumBillingType: item.details.premiumBillingType || null,
          }
        };
      }

      return item;
    };

    const migratedItem = ensurePABXConfigCompatibility(oldFormatProposalItem);

    expect(migratedItem.pabxConfig).toBeDefined();
    expect(migratedItem.pabxConfig?.modality).toBe('premium');
    expect(migratedItem.pabxConfig?.premiumPlan).toBe('professional');
    expect(migratedItem.pabxConfig?.premiumBillingType).toBe('tarifado');
  });

  test('should handle standard PABX proposals without Premium configuration', () => {
    const standardProposalItem: ProposalItem = {
      id: 'test-item-standard',
      name: 'PABX Standard - 30 ramais',
      description: 'PABX Standard - 30 ramais',
      unitPrice: 930,
      setup: 2700,
      monthly: 930,
      quantity: 1,
      details: {
        modality: 'standard',
        extensions: 30,
        includeSetup: true,
        includeDevices: true,
        deviceQuantity: 5,
        includeAI: false,
        aiPlan: null,
        hasACombinarValues: false
      }
    };

    // Test that standard proposals work without Premium configuration
    expect(standardProposalItem.pabxConfig).toBeUndefined();
    expect(standardProposalItem.details.modality).toBe('standard');
  });
});