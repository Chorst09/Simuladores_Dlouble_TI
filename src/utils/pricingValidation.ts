// Validation utilities for pricing values

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ValidationConfig {
  minValue: number;
  maxValue: number;
  decimalPlaces: number;
  required: boolean;
}

export const PRICING_VALIDATION_CONFIG: ValidationConfig = {
  minValue: 0.01,
  maxValue: 9999.99,
  decimalPlaces: 2,
  required: true
};

export const ERROR_MESSAGES = {
  INVALID_VALUE: 'Valor deve ser um número positivo',
  VALUE_TOO_LOW: 'Valor deve ser maior que R$ 0,01',
  VALUE_TOO_HIGH: 'Valor deve ser menor que R$ 9.999,99',
  REQUIRED_FIELD: 'Este campo é obrigatório',
  INVALID_FORMAT: 'Formato de número inválido'
} as const;

/**
 * Validates a pricing value according to the defined rules
 */
export const validatePricingValue = (
  value: number | string,
  config: ValidationConfig = PRICING_VALIDATION_CONFIG
): ValidationResult => {
  // Handle empty or undefined values
  if (value === '' || value === null || value === undefined) {
    return config.required 
      ? { isValid: false, error: ERROR_MESSAGES.REQUIRED_FIELD }
      : { isValid: true };
  }

  // Convert to number if string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  // Check if it's a valid number
  if (isNaN(numValue)) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_FORMAT };
  }

  // Check minimum value
  if (numValue < config.minValue) {
    return { isValid: false, error: ERROR_MESSAGES.VALUE_TOO_LOW };
  }

  // Check maximum value
  if (numValue > config.maxValue) {
    return { isValid: false, error: ERROR_MESSAGES.VALUE_TOO_HIGH };
  }

  // Check decimal places
  const decimalPlaces = (numValue.toString().split('.')[1] || '').length;
  if (decimalPlaces > config.decimalPlaces) {
    return { isValid: false, error: `Máximo ${config.decimalPlaces} casas decimais` };
  }

  return { isValid: true };
};

/**
 * Validates a string input for pricing values
 */
export const validatePricingInput = (input: string): ValidationResult => {
  // Allow empty input during typing
  if (input === '') {
    return { isValid: true };
  }

  // Check for valid number format
  const numberRegex = /^\d+(\.\d{0,2})?$/;
  if (!numberRegex.test(input)) {
    return { isValid: false, error: ERROR_MESSAGES.INVALID_FORMAT };
  }

  return validatePricingValue(parseFloat(input));
};

/**
 * Formats a number for display in input fields
 */
export const formatPricingInput = (value: number): string => {
  return value.toFixed(2);
};

/**
 * Parses a string input to a valid pricing number
 */
export const parsePricingInput = (input: string): number => {
  const cleaned = input.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};