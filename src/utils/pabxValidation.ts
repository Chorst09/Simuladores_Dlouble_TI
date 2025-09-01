/**
 * PABX Premium Plans Validation Utilities
 * Provides validation functions and error messages for PABX Premium plan selections
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PABXValidationContext {
  modality: 'standard' | 'premium';
  premiumPlan: 'essencial' | 'professional' | null;
  premiumBillingType: 'ilimitado-sem-aparelho' | 'ilimitado-com-aparelho' | 'tarifado-sem-aparelho' | 'tarifado-com-aparelho' | null;
  contractPeriod: '24' | '36' | null;
  extensions: number;
}

/**
 * Validation messages for different scenarios
 */
export const validationMessages = {
  noModalitySelected: "Selecione uma modalidade (Standard ou Premium)",
  noPremiumPlanSelected: "Selecione um plano Premium (Essencial ou Professional)",
  noBillingTypeSelected: "Selecione o tipo de cobrança (Ilimitado ou Tarifado)",
  noContractPeriodSelected: "Selecione o período do contrato (24 ou 36 meses)",
  priceNotAvailable: "Preço não disponível para esta configuração. Entre em contato.",
  aCombinarWarning: "Alguns valores são 'a combinar' para esta quantidade de ramais. Entre em contato para orçamento personalizado.",
  invalidExtensionCount: "Número de ramais deve ser maior que zero",
  incompleteSelection: "Complete todas as seleções obrigatórias antes de calcular"
};

/**
 * Validates PABX modality and plan selections
 */
export function validatePABXSelection(context: PABXValidationContext): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate modality selection
  if (!context.modality) {
    errors.push(validationMessages.noModalitySelected);
  }

  // Validate Premium plan selections
  if (context.modality === 'premium') {
    if (!context.premiumPlan) {
      errors.push(validationMessages.noPremiumPlanSelected);
    }
    
    if (!context.premiumBillingType) {
      errors.push(validationMessages.noBillingTypeSelected);
    }
    
    if (!context.contractPeriod) {
      errors.push(validationMessages.noContractPeriodSelected);
    }
  }

  // Validate extensions count
  if (!context.extensions || context.extensions <= 0) {
    errors.push(validationMessages.invalidExtensionCount);
  }

  // Check for "a combinar" scenarios (500+ extensions)
  if (context.extensions > 100) {
    warnings.push(validationMessages.aCombinarWarning);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates if a price calculation can be performed
 */
export function validateCalculationReadiness(context: PABXValidationContext): ValidationResult {
  const baseValidation = validatePABXSelection(context);
  
  if (!baseValidation.isValid) {
    return {
      ...baseValidation,
      errors: [...baseValidation.errors, validationMessages.incompleteSelection]
    };
  }

  return baseValidation;
}

/**
 * Checks if prices are available for the given configuration
 */
export function validatePriceAvailability(
  context: PABXValidationContext,
  priceData: any
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (context.modality === 'premium' && context.premiumPlan && context.premiumBillingType) {
    const planPrices = priceData[context.premiumPlan]?.[context.premiumBillingType];
    
    if (!planPrices) {
      errors.push(validationMessages.priceNotAvailable);
      return { isValid: false, errors, warnings };
    }

    // Check for "a combinar" values (0 prices for setup, hosting, device)
    const range = getPriceRange(context.extensions);
    const hasACombinarValues = (
      planPrices.setup?.[range] === 0 ||
      planPrices.hosting?.[range] === 0 ||
      planPrices.device?.[range] === 0
    );

    if (hasACombinarValues) {
      warnings.push(validationMessages.aCombinarWarning);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Helper function to determine price range based on extensions
 */
function getPriceRange(extensions: number): string {
  if (extensions <= 10) return '10';
  if (extensions <= 20) return '20';
  if (extensions <= 30) return '30';
  if (extensions <= 50) return '50';
  if (extensions <= 100) return '100';
  if (extensions <= 500) return '500';
  return '1000';
}

/**
 * Gets user-friendly error message for display
 */
export function getDisplayErrorMessage(errors: string[]): string {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0];
  return errors.join('. ');
}

/**
 * Gets user-friendly warning message for display
 */
export function getDisplayWarningMessage(warnings: string[]): string {
  if (warnings.length === 0) return '';
  if (warnings.length === 1) return warnings[0];
  return warnings.join('. ');
}

/**
 * Validation state for UI components
 */
export interface ValidationState {
  hasErrors: boolean;
  hasWarnings: boolean;
  errorMessage: string;
  warningMessage: string;
  isComplete: boolean;
}

/**
 * Creates validation state for UI components
 */
export function createValidationState(result: ValidationResult): ValidationState {
  return {
    hasErrors: !result.isValid,
    hasWarnings: result.warnings.length > 0,
    errorMessage: getDisplayErrorMessage(result.errors),
    warningMessage: getDisplayWarningMessage(result.warnings),
    isComplete: result.isValid && result.warnings.length === 0
  };
}