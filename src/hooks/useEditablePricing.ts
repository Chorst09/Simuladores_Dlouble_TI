import { useState, useCallback, useMemo } from 'react';
import { PricingSection, PricingPlan } from '@/types/pricing';
import { validatePricingValue, ValidationResult } from '@/utils/pricingValidation';

export interface EditablePricingState {
  isEditing: boolean;
  editingSection: string | null;
  editedPlans: Map<string, PricingPlan>;
  errors: Map<string, string>;
  isSaving: boolean;
}

export interface EditablePricingActions {
  startEditing: (sectionId: string) => void;
  cancelEditing: () => void;
  saveChanges: () => Promise<boolean>;
  updatePlanValue: (planId: string, tableId: string, rowIndex: number, value: number) => void;
  validateValue: (value: number) => ValidationResult;
  isEditingSection: (sectionId: string) => boolean;
}

export const useEditablePricing = (
  initialSections: PricingSection[],
  onSave?: (updatedSections: PricingSection[]) => Promise<boolean>
): [EditablePricingState, EditablePricingActions] => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedPlans, setEditedPlans] = useState<Map<string, PricingPlan>>(new Map());
  const [errors, setErrors] = useState<Map<string, string>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  // Create a map of original plans for easy access
  const originalPlansMap = useMemo(() => {
    const map = new Map<string, PricingPlan>();
    initialSections.forEach(section => {
      section.plans.forEach(plan => {
        map.set(plan.id, plan);
      });
    });
    return map;
  }, [initialSections]);

  const startEditing = useCallback((sectionId: string) => {
    setIsEditing(true);
    setEditingSection(sectionId);
    setErrors(new Map());
    
    // Initialize edited plans with current values for this section
    const section = initialSections.find(s => s.title === sectionId);
    if (section) {
      const newEditedPlans = new Map(editedPlans);
      section.plans.forEach(plan => {
        // Deep clone the plan to avoid mutations
        const clonedPlan: PricingPlan = {
          ...plan,
          tables: plan.tables.map(table => ({
            ...table,
            rows: table.rows.map(row => ({ ...row }))
          }))
        };
        newEditedPlans.set(plan.id, clonedPlan);
      });
      setEditedPlans(newEditedPlans);
    }
  }, [initialSections, editedPlans]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditingSection(null);
    setEditedPlans(new Map());
    setErrors(new Map());
    setIsSaving(false);
  }, []);

  const saveChanges = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    
    try {
      // Validate all edited values before saving
      const newErrors = new Map<string, string>();
      let hasErrors = false;

      editedPlans.forEach((plan, planId) => {
        plan.tables.forEach((table, tableIndex) => {
          table.rows.forEach((row, rowIndex) => {
            const validation = validatePricingValue(row.value);
            if (!validation.isValid && validation.error) {
              const errorKey = `${planId}-${table.id}-${rowIndex}`;
              newErrors.set(errorKey, validation.error);
              hasErrors = true;
            }
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
        // Create updated sections with edited plans
        const updatedSections = initialSections.map(section => ({
          ...section,
          plans: section.plans.map(plan => 
            editedPlans.has(plan.id) ? editedPlans.get(plan.id)! : plan
          )
        }));

        const success = await onSave(updatedSections);
        if (success) {
          cancelEditing();
          return true;
        } else {
          setIsSaving(false);
          return false;
        }
      }

      // Default behavior: just update local state
      cancelEditing();
      return true;
    } catch (error) {
      console.error('Error saving pricing changes:', error);
      setIsSaving(false);
      return false;
    }
  }, [editedPlans, initialSections, onSave, cancelEditing]);

  const updatePlanValue = useCallback((
    planId: string, 
    tableId: string, 
    rowIndex: number, 
    value: number
  ) => {
    setEditedPlans(prev => {
      const newMap = new Map(prev);
      const plan = newMap.get(planId);
      
      if (plan) {
        const updatedPlan = {
          ...plan,
          tables: plan.tables.map(table => 
            table.id === tableId 
              ? {
                  ...table,
                  rows: table.rows.map((row, index) => 
                    index === rowIndex 
                      ? { ...row, value }
                      : row
                  )
                }
              : table
          )
        };
        newMap.set(planId, updatedPlan);
      }
      
      return newMap;
    });

    // Clear any existing error for this field
    const errorKey = `${planId}-${tableId}-${rowIndex}`;
    if (errors.has(errorKey)) {
      setErrors(prev => {
        const newErrors = new Map(prev);
        newErrors.delete(errorKey);
        return newErrors;
      });
    }
  }, [errors]);

  const validateValue = useCallback((value: number): ValidationResult => {
    return validatePricingValue(value);
  }, []);

  const isEditingSection = useCallback((sectionId: string): boolean => {
    return isEditing && editingSection === sectionId;
  }, [isEditing, editingSection]);

  const state: EditablePricingState = {
    isEditing,
    editingSection,
    editedPlans,
    errors,
    isSaving
  };

  const actions: EditablePricingActions = {
    startEditing,
    cancelEditing,
    saveChanges,
    updatePlanValue,
    validateValue,
    isEditingSection
  };

  return [state, actions];
};