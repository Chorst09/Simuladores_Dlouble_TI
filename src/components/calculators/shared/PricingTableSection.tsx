import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { PricingSection, PricingPlan } from '@/types/pricing';
import { EditableControls } from './EditableControls';
import { validatePricingInput, formatPricingInput, parsePricingInput } from '@/utils/pricingValidation';

interface PricingTableSectionProps {
  section: PricingSection;
  formatCurrency: (value: number) => string;
  className?: string;
  // New props for editing functionality
  isEditable?: boolean;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onSaveEdit?: () => Promise<boolean>;
  onCancelEdit?: () => void;
  onPlanChange?: (planId: string, tableId: string, rowIndex: number, value: number) => void;
  editingErrors?: Map<string, string>;
  isSaving?: boolean;
  editedPlans?: Map<string, PricingPlan>;
}

export const PricingTableSection: React.FC<PricingTableSectionProps> = React.memo(({
  section,
  formatCurrency,
  className = '',
  // New props
  isEditable = false,
  isEditing = false,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onPlanChange,
  editingErrors = new Map(),
  isSaving = false,
  editedPlans = new Map()
}) => {
  const [inputValues, setInputValues] = useState<Map<string, string>>(new Map());
  const [localErrors, setLocalErrors] = useState<Map<string, string>>(new Map());

  // Clear local state when exiting edit mode
  React.useEffect(() => {
    if (!isEditing) {
      setInputValues(new Map());
      setLocalErrors(new Map());
    }
  }, [isEditing]);
  
  const handleValueChange = useCallback((planId: string, tableId: string, rowIndex: number, inputValue: string) => {
    // Update local input state for immediate UI feedback
    const inputKey = `${planId}-${tableId}-${rowIndex}`;
    setInputValues(prev => new Map(prev.set(inputKey, inputValue)));
    
    // Validate input in real-time
    const validation = validatePricingInput(inputValue);
    
    // Update local errors
    setLocalErrors(prev => {
      const newErrors = new Map(prev);
      if (!validation.isValid && validation.error) {
        newErrors.set(inputKey, validation.error);
      } else {
        newErrors.delete(inputKey);
      }
      return newErrors;
    });
    
    // Parse and validate the input
    const numericValue = parsePricingInput(inputValue);
    
    // Update the plan data if callback is provided and validation passes
    if (onPlanChange && validation.isValid && numericValue >= 0) {
      onPlanChange(planId, tableId, rowIndex, numericValue);
    }
  }, [onPlanChange]);

  const getDisplayValue = useCallback((planId: string, tableId: string, rowIndex: number, originalValue: number): number => {
    // If we have an edited plan, use its value
    const editedPlan = editedPlans.get(planId);
    if (editedPlan) {
      const table = editedPlan.tables.find(t => t.id === tableId);
      if (table && table.rows[rowIndex]) {
        return table.rows[rowIndex].value;
      }
    }
    return originalValue;
  }, [editedPlans]);

  const getInputValue = useCallback((planId: string, tableId: string, rowIndex: number, displayValue: number): string => {
    const inputKey = `${planId}-${tableId}-${rowIndex}`;
    return inputValues.get(inputKey) ?? formatPricingInput(displayValue);
  }, [inputValues]);

  const getErrorMessage = useCallback((planId: string, tableId: string, rowIndex: number): string | undefined => {
    const errorKey = `${planId}-${tableId}-${rowIndex}`;
    // Check local errors first (real-time validation), then global errors
    return localErrors.get(errorKey) || editingErrors.get(errorKey);
  }, [localErrors, editingErrors]);
  return (
    <Card className={`bg-slate-900/80 border-slate-800 text-white ${className}`}>
      <CardHeader>
        <CardTitle className="text-center text-white bg-blue-800 py-3 px-4 rounded-lg">
          {section.title}
        </CardTitle>
        {isEditable && (
          <div className="mt-4">
            <EditableControls
              isEditing={isEditing}
              isSaving={isSaving}
              onEdit={onStartEdit || (() => {})}
              onSave={onSaveEdit || (async () => false)}
              onCancel={onCancelEdit || (() => {})}
              hasErrors={editingErrors.size > 0 || localErrors.size > 0}
            />
            {isSaving && (
              <div className="mt-2 text-center">
                <span className="text-sm text-blue-400">Salvando alterações...</span>
              </div>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {section.plans.map((plan) => (
          <div key={plan.id} className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-400 text-center">
              {plan.name}
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {plan.tables.map((table) => (
                <div key={table.id} className="space-y-2">
                  <h4 className="text-md font-medium text-center text-white bg-blue-700 py-2 px-3 rounded">
                    {table.name}
                  </h4>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700">
                          <TableHead className="text-white bg-blue-800">Ramais</TableHead>
                          <TableHead className="text-white bg-blue-800 text-center">
                            {table.type === 'ilimitado' ? 'Aluguel + Assinatura' : 'Aluguel + Franquia'}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {table.rows.map((row, index) => {
                          const displayValue = getDisplayValue(plan.id, table.id, index, row.value);
                          const inputValue = getInputValue(plan.id, table.id, index, displayValue);
                          const errorMessage = getErrorMessage(plan.id, table.id, index);
                          
                          return (
                            <TableRow key={index} className="border-slate-800">
                              <TableCell className="font-medium">{row.range}</TableCell>
                              <TableCell className="text-center">
                                {isEditing ? (
                                  <div className="flex flex-col space-y-1">
                                    <Input
                                      type="number"
                                      value={inputValue}
                                      onChange={(e) => handleValueChange(plan.id, table.id, index, e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          onSaveEdit?.();
                                        } else if (e.key === 'Escape') {
                                          e.preventDefault();
                                          onCancelEdit?.();
                                        }
                                      }}
                                      className={`bg-slate-800 text-center w-24 mx-auto ${
                                        errorMessage ? 'border-red-500' : ''
                                      }`}
                                      step="0.01"
                                      min="0.01"
                                      max="9999.99"
                                      tabIndex={0}
                                    />
                                    {errorMessage && (
                                      <span className="text-xs text-red-400">
                                        {errorMessage}
                                      </span>
                                    )}
                                    {row.decomposition && !errorMessage && (
                                      <span className="text-xs text-slate-400">
                                        ({row.decomposition})
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex flex-col">
                                    <span className="font-bold text-green-400">
                                      {formatCurrency(displayValue)}
                                    </span>
                                    {row.decomposition && (
                                      <span className="text-xs text-slate-400">
                                        ({row.decomposition})
                                      </span>
                                    )}
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
});