import { premiumPlanPrices } from '@/data/premiumPlanPrices';
import { PABXPriceRange } from '@/types';

// Mock data for standard PABX pricing (simulating the existing pabxPrices.standard)
const mockStandardPrices = {
  setup: {
    '10': 1200,
    '20': 2000,
    '30': 2500,
    '50': 3000,
    '100': 3500,
    '500': 4000,
    '1000': 4500
  },
  monthly: {
    '10': 30,
    '20': 28,
    '30': 26,
    '50': 24,
    '100': 22,
    '500': 20,
    '1000': 18
  },
  hosting: {
    '10': 180,
    '20': 210,
    '30': 240,
    '50': 280,
    '100': 340,
    '500': 400,
    '1000': 460
  },
  device: {
    '10': 35,
    '20': 33,
    '30': 31,
    '50': 29,
    '100': 27,
    '500': 25,
    '1000': 23
  }
};

// Helper function to get price range based on extensions
const getPriceRange = (extensions: number): PABXPriceRange => {
  if (extensions <= 10) return '10';
  if (extensions <= 20) return '20';
  if (extensions <= 30) return '30';
  if (extensions <= 50) return '50';
  if (extensions <= 100) return '100';
  if (extensions <= 500) return '500';
  return '1000';
};

// PABX calculation function (extracted from component for testing)
interface PABXCalculationParams {
  extensions: number;
  includeSetup: boolean;
  includeDevices: boolean;
  deviceQuantity: number;
  includeAI: boolean;
  aiCost: number;
  modality: 'standard' | 'premium';
  premiumPlan?: 'essencial' | 'professional' | null;
  premiumBillingType?: 'ilimitado' | 'tarifado' | null;
}

interface PABXCalculationResult {
  setup: number;
  baseMonthly: number;
  deviceRentalCost: number;
  aiAgentCost: number;
  totalMonthly: number;
}

const calculatePABXPricing = (params: PABXCalculationParams): PABXCalculationResult => {
  const {
    extensions,
    includeSetup,
    includeDevices,
    deviceQuantity,
    includeAI,
    aiCost,
    modality,
    premiumPlan,
    premiumBillingType
  } = params;

  const range = getPriceRange(extensions);
  
  // Select prices based on modality and premium plan configuration
  let currentPrices;
  if (modality === 'premium' && premiumPlan && premiumBillingType) {
    currentPrices = premiumPlanPrices[premiumPlan][premiumBillingType];
  } else {
    currentPrices = mockStandardPrices;
  }

  const setup = includeSetup ? currentPrices.setup[range] : 0;
  const baseMonthly = (currentPrices.monthly[range] * extensions) + currentPrices.hosting[range];
  const deviceRentalCost = includeDevices ? (currentPrices.device[range] * deviceQuantity) : 0;
  const aiAgentCost = includeAI ? aiCost : 0;

  return {
    setup,
    baseMonthly,
    deviceRentalCost,
    aiAgentCost,
    totalMonthly: baseMonthly + deviceRentalCost + aiAgentCost
  };
};

describe('PABX Premium Calculation Logic', () => {
  describe('Standard PABX Calculations', () => {
    it('calculates standard PABX pricing correctly for 10 extensions', () => {
      const result = calculatePABXPricing({
        extensions: 10,
        includeSetup: true,
        includeDevices: true,
        deviceQuantity: 10,
        includeAI: false,
        aiCost: 0,
        modality: 'standard'
      });

      expect(result.setup).toBe(1200);
      expect(result.baseMonthly).toBe(30 * 10 + 180); // monthly per extension + hosting
      expect(result.deviceRentalCost).toBe(35 * 10);
      expect(result.aiAgentCost).toBe(0);
      expect(result.totalMonthly).toBe(result.baseMonthly + result.deviceRentalCost);
    });

    it('calculates standard PABX pricing without setup and devices', () => {
      const result = calculatePABXPricing({
        extensions: 20,
        includeSetup: false,
        includeDevices: false,
        deviceQuantity: 0,
        includeAI: false,
        aiCost: 0,
        modality: 'standard'
      });

      expect(result.setup).toBe(0);
      expect(result.baseMonthly).toBe(28 * 20 + 210);
      expect(result.deviceRentalCost).toBe(0);
      expect(result.totalMonthly).toBe(result.baseMonthly);
    });
  });

  describe('Premium Essencial Ilimitado Calculations', () => {
    it('calculates Premium Essencial Ilimitado pricing for 10 extensions', () => {
      const result = calculatePABXPricing({
        extensions: 10,
        includeSetup: true,
        includeDevices: true,
        deviceQuantity: 10,
        includeAI: false,
        aiCost: 0,
        modality: 'premium',
        premiumPlan: 'essencial',
        premiumBillingType: 'ilimitado'
      });

      expect(result.setup).toBe(1400);
      expect(result.baseMonthly).toBe(35 * 10 + 220);
      expect(result.deviceRentalCost).toBe(40 * 10);
      expect(result.totalMonthly).toBe(result.baseMonthly + result.deviceRentalCost);
    });

    it('calculates Premium Essencial Ilimitado pricing for 50 extensions', () => {
      const result = calculatePABXPricing({
        extensions: 50,
        includeSetup: true,
        includeDevices: true,
        deviceQuantity: 50,
        includeAI: true,
        aiCost: 500,
        modality: 'premium',
        premiumPlan: 'essencial',
        premiumBillingType: 'ilimitado'
      });

      expect(result.setup).toBe(3200);
      expect(result.baseMonthly).toBe(29 * 50 + 320);
      expect(result.deviceRentalCost).toBe(34 * 50);
      expect(result.aiAgentCost).toBe(500);
      expect(result.totalMonthly).toBe(result.baseMonthly + result.deviceRentalCost + result.aiAgentCost);
    });
  });

  describe('Premium Essencial Tarifado Calculations', () => {
    it('calculates Premium Essencial Tarifado pricing for 30 extensions', () => {
      const result = calculatePABXPricing({
        extensions: 30,
        includeSetup: true,
        includeDevices: true,
        deviceQuantity: 25,
        includeAI: false,
        aiCost: 0,
        modality: 'premium',
        premiumPlan: 'essencial',
        premiumBillingType: 'tarifado'
      });

      expect(result.setup).toBe(2600);
      expect(result.baseMonthly).toBe(28 * 30 + 260);
      expect(result.deviceRentalCost).toBe(34 * 25);
      expect(result.totalMonthly).toBe(result.baseMonthly + result.deviceRentalCost);
    });
  });

  describe('Premium Professional Ilimitado Calculations', () => {
    it('calculates Premium Professional Ilimitado pricing for 20 extensions', () => {
      const result = calculatePABXPricing({
        extensions: 20,
        includeSetup: true,
        includeDevices: true,
        deviceQuantity: 20,
        includeAI: true,
        aiCost: 750,
        modality: 'premium',
        premiumPlan: 'professional',
        premiumBillingType: 'ilimitado'
      });

      expect(result.setup).toBe(2400);
      expect(result.baseMonthly).toBe(43 * 20 + 320);
      expect(result.deviceRentalCost).toBe(48 * 20);
      expect(result.aiAgentCost).toBe(750);
      expect(result.totalMonthly).toBe(result.baseMonthly + result.deviceRentalCost + result.aiAgentCost);
    });

    it('calculates Premium Professional Ilimitado pricing for 100 extensions', () => {
      const result = calculatePABXPricing({
        extensions: 100,
        includeSetup: false,
        includeDevices: false,
        deviceQuantity: 0,
        includeAI: false,
        aiCost: 0,
        modality: 'premium',
        premiumPlan: 'professional',
        premiumBillingType: 'ilimitado'
      });

      expect(result.setup).toBe(0);
      expect(result.baseMonthly).toBe(37 * 100 + 500);
      expect(result.deviceRentalCost).toBe(0);
      expect(result.aiAgentCost).toBe(0);
      expect(result.totalMonthly).toBe(result.baseMonthly);
    });
  });

  describe('Premium Professional Tarifado Calculations', () => {
    it('calculates Premium Professional Tarifado pricing for 50 extensions', () => {
      const result = calculatePABXPricing({
        extensions: 50,
        includeSetup: true,
        includeDevices: true,
        deviceQuantity: 40,
        includeAI: true,
        aiCost: 1000,
        modality: 'premium',
        premiumPlan: 'professional',
        premiumBillingType: 'tarifado'
      });

      expect(result.setup).toBe(3300);
      expect(result.baseMonthly).toBe(36 * 50 + 400);
      expect(result.deviceRentalCost).toBe(41 * 40);
      expect(result.aiAgentCost).toBe(1000);
      expect(result.totalMonthly).toBe(result.baseMonthly + result.deviceRentalCost + result.aiAgentCost);
    });
  });

  describe('Price Range Selection', () => {
    it('selects correct price range for different extension counts', () => {
      expect(getPriceRange(5)).toBe('10');
      expect(getPriceRange(10)).toBe('10');
      expect(getPriceRange(15)).toBe('20');
      expect(getPriceRange(20)).toBe('20');
      expect(getPriceRange(25)).toBe('30');
      expect(getPriceRange(30)).toBe('30');
      expect(getPriceRange(40)).toBe('50');
      expect(getPriceRange(50)).toBe('50');
      expect(getPriceRange(75)).toBe('100');
      expect(getPriceRange(100)).toBe('100');
      expect(getPriceRange(250)).toBe('500');
      expect(getPriceRange(500)).toBe('500');
      expect(getPriceRange(750)).toBe('1000');
      expect(getPriceRange(1000)).toBe('1000');
    });
  });

  describe('A Combinar Cases (500+ extensions)', () => {
    it('handles "a combinar" values for Premium Essencial Ilimitado with 500+ extensions', () => {
      const result = calculatePABXPricing({
        extensions: 500,
        includeSetup: true,
        includeDevices: true,
        deviceQuantity: 500,
        includeAI: false,
        aiCost: 0,
        modality: 'premium',
        premiumPlan: 'essencial',
        premiumBillingType: 'ilimitado'
      });

      // Setup, hosting, and device should be 0 (a combinar) for 500+ extensions
      expect(result.setup).toBe(0);
      expect(result.baseMonthly).toBe(25 * 500 + 0); // monthly price available, hosting is 0
      expect(result.deviceRentalCost).toBe(0); // device price is 0 (a combinar)
    });

    it('handles "a combinar" values for Premium Professional Tarifado with 1000 extensions', () => {
      const result = calculatePABXPricing({
        extensions: 1000,
        includeSetup: true,
        includeDevices: true,
        deviceQuantity: 1000,
        includeAI: false,
        aiCost: 0,
        modality: 'premium',
        premiumPlan: 'professional',
        premiumBillingType: 'tarifado'
      });

      // Setup, hosting, and device should be 0 (a combinar) for 1000 extensions
      expect(result.setup).toBe(0);
      expect(result.baseMonthly).toBe(30 * 1000 + 0); // monthly price available, hosting is 0
      expect(result.deviceRentalCost).toBe(0); // device price is 0 (a combinar)
    });
  });

  describe('Premium Plan Pricing Comparison', () => {
    it('Professional plans are more expensive than Essencial plans', () => {
      const essencialResult = calculatePABXPricing({
        extensions: 30,
        includeSetup: true,
        includeDevices: true,
        deviceQuantity: 30,
        includeAI: false,
        aiCost: 0,
        modality: 'premium',
        premiumPlan: 'essencial',
        premiumBillingType: 'ilimitado'
      });

      const professionalResult = calculatePABXPricing({
        extensions: 30,
        includeSetup: true,
        includeDevices: true,
        deviceQuantity: 30,
        includeAI: false,
        aiCost: 0,
        modality: 'premium',
        premiumPlan: 'professional',
        premiumBillingType: 'ilimitado'
      });

      expect(professionalResult.setup).toBeGreaterThan(essencialResult.setup);
      expect(professionalResult.baseMonthly).toBeGreaterThan(essencialResult.baseMonthly);
      expect(professionalResult.deviceRentalCost).toBeGreaterThan(essencialResult.deviceRentalCost);
      expect(professionalResult.totalMonthly).toBeGreaterThan(essencialResult.totalMonthly);
    });

    it('Ilimitado plans are more expensive than Tarifado plans', () => {
      const tarifadoResult = calculatePABXPricing({
        extensions: 20,
        includeSetup: true,
        includeDevices: true,
        deviceQuantity: 20,
        includeAI: false,
        aiCost: 0,
        modality: 'premium',
        premiumPlan: 'essencial',
        premiumBillingType: 'tarifado'
      });

      const ilimitadoResult = calculatePABXPricing({
        extensions: 20,
        includeSetup: true,
        includeDevices: true,
        deviceQuantity: 20,
        includeAI: false,
        aiCost: 0,
        modality: 'premium',
        premiumPlan: 'essencial',
        premiumBillingType: 'ilimitado'
      });

      expect(ilimitadoResult.setup).toBeGreaterThan(tarifadoResult.setup);
      expect(ilimitadoResult.baseMonthly).toBeGreaterThan(tarifadoResult.baseMonthly);
      expect(ilimitadoResult.deviceRentalCost).toBeGreaterThan(tarifadoResult.deviceRentalCost);
      expect(ilimitadoResult.totalMonthly).toBeGreaterThan(tarifadoResult.totalMonthly);
    });
  });

  describe('Edge Cases', () => {
    it('handles zero extensions gracefully', () => {
      const result = calculatePABXPricing({
        extensions: 0,
        includeSetup: false,
        includeDevices: false,
        deviceQuantity: 0,
        includeAI: false,
        aiCost: 0,
        modality: 'premium',
        premiumPlan: 'essencial',
        premiumBillingType: 'ilimitado'
      });

      expect(result.setup).toBe(0);
      expect(result.baseMonthly).toBe(0 + 220); // 0 extensions + hosting
      expect(result.deviceRentalCost).toBe(0);
      expect(result.totalMonthly).toBe(220);
    });

    it('handles device quantity different from extensions', () => {
      const result = calculatePABXPricing({
        extensions: 50,
        includeSetup: true,
        includeDevices: true,
        deviceQuantity: 25, // Half the extensions
        includeAI: false,
        aiCost: 0,
        modality: 'premium',
        premiumPlan: 'professional',
        premiumBillingType: 'ilimitado'
      });

      expect(result.setup).toBe(3400);
      expect(result.baseMonthly).toBe(39 * 50 + 420);
      expect(result.deviceRentalCost).toBe(44 * 25); // Only 25 devices
      expect(result.totalMonthly).toBe(result.baseMonthly + result.deviceRentalCost);
    });
  });
});