/**
 * Tests for PABX Premium Plans Validation Utilities
 */

import {
  validatePABXSelection,
  validateCalculationReadiness,
  validatePriceAvailability,
  createValidationState,
  getDisplayErrorMessage,
  getDisplayWarningMessage,
  validationMessages,
  PABXValidationContext
} from '../pabxValidation';

describe('PABX Validation Utilities', () => {
  describe('validatePABXSelection', () => {
    it('should validate standard modality successfully', () => {
      const context: PABXValidationContext = {
        modality: 'standard',
        premiumPlan: null,
        premiumBillingType: null,
        extensions: 50
      };

      const result = validatePABXSelection(context);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require premium plan when premium modality is selected', () => {
      const context: PABXValidationContext = {
        modality: 'premium',
        premiumPlan: null,
        premiumBillingType: null,
        extensions: 50
      };

      const result = validatePABXSelection(context);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(validationMessages.noPremiumPlanSelected);
    });

    it('should require billing type when premium plan is selected', () => {
      const context: PABXValidationContext = {
        modality: 'premium',
        premiumPlan: 'essencial',
        premiumBillingType: null,
        extensions: 50
      };

      const result = validatePABXSelection(context);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(validationMessages.noBillingTypeSelected);
    });

    it('should validate complete premium selection', () => {
      const context: PABXValidationContext = {
        modality: 'premium',
        premiumPlan: 'essencial',
        premiumBillingType: 'ilimitado',
        extensions: 50
      };

      const result = validatePABXSelection(context);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should warn about "a combinar" for high extension counts', () => {
      const context: PABXValidationContext = {
        modality: 'premium',
        premiumPlan: 'essencial',
        premiumBillingType: 'ilimitado',
        extensions: 600
      };

      const result = validatePABXSelection(context);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain(validationMessages.aCombinarWarning);
    });

    it('should validate extensions count', () => {
      const context: PABXValidationContext = {
        modality: 'standard',
        premiumPlan: null,
        premiumBillingType: null,
        extensions: 0
      };

      const result = validatePABXSelection(context);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(validationMessages.invalidExtensionCount);
    });
  });

  describe('validateCalculationReadiness', () => {
    it('should validate complete configuration for calculation', () => {
      const context: PABXValidationContext = {
        modality: 'premium',
        premiumPlan: 'professional',
        premiumBillingType: 'tarifado',
        extensions: 30
      };

      const result = validateCalculationReadiness(context);
      
      expect(result.isValid).toBe(true);
    });

    it('should reject incomplete configuration', () => {
      const context: PABXValidationContext = {
        modality: 'premium',
        premiumPlan: null,
        premiumBillingType: null,
        extensions: 30
      };

      const result = validateCalculationReadiness(context);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(validationMessages.incompleteSelection);
    });
  });

  describe('validatePriceAvailability', () => {
    const mockPriceData = {
      essencial: {
        ilimitado: {
          setup: { '50': 3200, '500': 0 },
          hosting: { '50': 320, '500': 0 },
          device: { '50': 34, '500': 0 }
        }
      }
    };

    it('should validate available prices', () => {
      const context: PABXValidationContext = {
        modality: 'premium',
        premiumPlan: 'essencial',
        premiumBillingType: 'ilimitado',
        extensions: 50
      };

      const result = validatePriceAvailability(context, mockPriceData);
      
      expect(result.isValid).toBe(true);
    });

    it('should warn about "a combinar" prices', () => {
      const context: PABXValidationContext = {
        modality: 'premium',
        premiumPlan: 'essencial',
        premiumBillingType: 'ilimitado',
        extensions: 500
      };

      const result = validatePriceAvailability(context, mockPriceData);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain(validationMessages.aCombinarWarning);
    });

    it('should handle missing price data', () => {
      const context: PABXValidationContext = {
        modality: 'premium',
        premiumPlan: 'professional',
        premiumBillingType: 'ilimitado',
        extensions: 50
      };

      const result = validatePriceAvailability(context, mockPriceData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(validationMessages.priceNotAvailable);
    });
  });

  describe('createValidationState', () => {
    it('should create error state', () => {
      const result = {
        isValid: false,
        errors: ['Test error'],
        warnings: []
      };

      const state = createValidationState(result);
      
      expect(state.hasErrors).toBe(true);
      expect(state.hasWarnings).toBe(false);
      expect(state.errorMessage).toBe('Test error');
      expect(state.isComplete).toBe(false);
    });

    it('should create warning state', () => {
      const result = {
        isValid: true,
        errors: [],
        warnings: ['Test warning']
      };

      const state = createValidationState(result);
      
      expect(state.hasErrors).toBe(false);
      expect(state.hasWarnings).toBe(true);
      expect(state.warningMessage).toBe('Test warning');
      expect(state.isComplete).toBe(false);
    });

    it('should create complete state', () => {
      const result = {
        isValid: true,
        errors: [],
        warnings: []
      };

      const state = createValidationState(result);
      
      expect(state.hasErrors).toBe(false);
      expect(state.hasWarnings).toBe(false);
      expect(state.isComplete).toBe(true);
    });
  });

  describe('getDisplayErrorMessage', () => {
    it('should return empty string for no errors', () => {
      expect(getDisplayErrorMessage([])).toBe('');
    });

    it('should return single error', () => {
      expect(getDisplayErrorMessage(['Error 1'])).toBe('Error 1');
    });

    it('should join multiple errors', () => {
      expect(getDisplayErrorMessage(['Error 1', 'Error 2'])).toBe('Error 1. Error 2');
    });
  });

  describe('getDisplayWarningMessage', () => {
    it('should return empty string for no warnings', () => {
      expect(getDisplayWarningMessage([])).toBe('');
    });

    it('should return single warning', () => {
      expect(getDisplayWarningMessage(['Warning 1'])).toBe('Warning 1');
    });

    it('should join multiple warnings', () => {
      expect(getDisplayWarningMessage(['Warning 1', 'Warning 2'])).toBe('Warning 1. Warning 2');
    });
  });
});