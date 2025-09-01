import { useState, useCallback, useMemo } from 'react';
import { PremiumPlanPricing, PABXPriceRange } from '@/types';
import { validatePricingValue, ValidationResult } from '@/utils/pricingValidation';

export interface PremiumEditablePricingState {
  isEditing: boolean;
  editingPlan: string | null; // 'essencial' | 'professional'
  editingBillingType: string | null; // 'ilimitado' | 'tarifado'
  editedPrices: PremiumPlanPricing;
  errors: Map<string, string>;
  isSaving: boolean;
}

export interface PremiumEditablePricingActions {
  startEditing: (plan: 'essencial' | 'professional', billingType: 'ilimitado' | 'tarifado') => void;
  cancelEditing: () => void;
  saveChanges: () => Promise<boolean>;
  updatePrice: (
    plan: 'essencial' | 'professional',
    billingType: 'ilimitado' | 'tarifado',
    priceType: 'setup' | 'monthly' | 'hosting' | 'device',
    range: PABXPriceRange,
    value: number
  ) => void;
  validateValue: (value: number) => ValidationResult;
  isEditingPlanBilling: (plan: string, billingType: string) => boolean;
  resetToDefaults: () => void;
}

export const usePremiumEditablePricing = (
  initialPrices: PremiumPlanPricing,
  onSave?: (updatedPrices: PremiumPlanPricing) => Promise<boolean>
): [PremiumEditablePricingState, PremiumEditablePricingActions] => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editingBillingType, setEditingBillingType] = useState<string | null>(null);
  const [editedPrices, setEditedPrices] = useState<PremiumPlanPricing>(initialPrices);
  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  // Deep clone function for pricing data
  const deepClonePricing = useCallback((pricing: PremiumPlanPricing): PremiumPlanPricing => {
    return {
      essencial: {
        ilimitado: {
          setup: { ...pricing.essencial.ilimitado.setup },
          monthly: { ...pricing.essencial.ilimitado.monthly },
          hosting: { ...pricing.essencial.ilimitado.hosting },
          device: { ...pricing.essencial.ilimitado.device }
        },
        tarifado: {
          setup: { ...pricing.essencial.tarifado.setup },
          monthly: { ...pricing.essencial.tarifado.monthly },
          hosting: { ...pricing.essencial.tarifado.hosting },
          device: { ...pricing.essencial.tarifado.device }
        }
      },
      professional: {
        ilimitado: {
          setup: { ...pricing.professional.ilimitado.setup },
          monthly: { ...pricing.professional.ilimitado.monthly },
          hosting: { ...pricing.professional.ilimitado.hosting },
          device: { ...pricing.professional.ilimitado.device }
        },
        tarifado: {
          setup: { ...pricing.professional.tarifado.setup },
          monthly: { ...pricing.professional.tarifado.monthly },
          hosting: { ...pricing.professional.tarifado.hosting },
          device: { ...pricing.professional.tarifado.device }
        }
      }
    };
  }, []);

  const startEditing = useCallback((
    plan: 'essencial' | 'professional',
    billingType: 'ilimitado' | 'tarifado'
  ) => {
    setIsEditing(true);
    setEditingPlan(plan);
    setEditingBillingType(billingType);
    setErrors(new Map());
    
    // Initialize edited prices with current values
    setEditedPrices(deepClonePricing(editedPrices));
  }, [editedPrices, deepClonePricing]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditingPlan(null);
    setEditingBillingType(null);
    setErrors(new Map());
    setIsSaving(false);
    
    // Reset to original prices
    setEditedPrices(deepClonePricing(initialPrices));
  }, [initialPrices, deepClonePricing]);

  const saveChanges = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    
    try {
      // Validate all edited values before saving
      const newErrors = new Map<string, string>();
      let hasErrors = false;

      // Validate all price values
      Object.entries(editedPrices).forEach(([planKey, planData]) => {
        Object.entries(planData).forEach(([billingKey, billingData]) => {
          Object.entries(billingData).forEach(([priceTypeKey, priceTypeData]) => {
            Object.entries(priceTypeData).forEach(([rangeKey, value]) => {
              // Skip validation for "A combinar" values (0)
              if (value !== 0) {
                const validation = validatePricingValue(value);
                if (!validation.isValid && validation.error) {
                  const errorKey = `${planKey}-${billingKey}-${priceTypeKey}-${rangeKey}`;
                  newErrors.set(errorKey, validation.error);
                  hasErrors = true;
                }
              }
            });
          });
        });
      });

      if (hasErrors) {
        setErrors(newErrors);
        setIsSaving(false);
        return false;
      }

      // If onSave callback is provided, use it
      if (onSave) {
        const success = await onSave(editedPrices);
        if (success) {
          setIsEditing(false);
          setEditingPlan(null);
          setEditingBillingType(null);
          setErrors(new Map());
          setIsSaving(false);
          return true;
        } else {
          setIsSaving(false);
          return false;
        }
      }

      // Default behavior: just update local state
      setIsEditing(false);
      setEditingPlan(null);
      setEditingBillingType(null);
      setErrors(new Map());
      setIsSaving(false);
      return true;
    } catch (error) {
      console.error('Error saving premium pricing changes:', error);
      setIsSaving(false);
      return false;
    }
  }, [editedPrices, onSave]);

  const updatePrice = useCallback((
    plan: 'essencial' | 'professional',
    billingType: 'ilimitado' | 'tarifado',
    priceType: 'setup' | 'monthly' | 'hosting' | 'device',
    range: PABXPriceRange,
    value: number
  ) => {
    setEditedPrices(prev => {
      const updated = deepClonePricing(prev);
      updated[plan][billingType][priceType][range] = value;
      return updated;
    });

    // Clear any existing error for this field
    const errorKey = `${plan}-${billingType}-${priceType}-${range}`;
    if (errors.has(errorKey)) {
      setErrors(prev => {
        const newErrors = new Map(prev);
        newErrors.delete(errorKey);
        return newErrors;
      });
    }
  }, [errors, deepClonePricing]);

  const validateValue = useCallback((value: number): ValidationResult => {
    return validatePricingValue(value);
  }, []);

  const isEditingPlanBilling = useCallback((plan: string, billingType: string): boolean => {
    return isEditing && editingPlan === plan && editingBillingType === billingType;
  }, [isEditing, editingPlan, editingBillingType]);

  const resetToDefaults = useCallback(() => {
    setEditedPrices(deepClonePricing(initialPrices));
    setErrors(new Map());
  }, [initialPrices, deepClonePricing]);

  const state: PremiumEditablePricingState = {
    isEditing,
    editingPlan,
    editingBillingType,
    editedPrices,
    errors,
    isSaving
  };

  const actions: PremiumEditablePricingActions = {
    startEditing,
    cancelEditing,
    saveChanges,
    updatePrice,
    validateValue,
    isEditingPlanBilling,
    resetToDefaults
  };

  return [state, actions];
};