"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ValidationIndicator } from './shared/ValidationIndicator';
import { RequiredFieldIndicator } from './shared/RequiredFieldIndicator';
import { validatePABXSelection, createValidationState, PABXValidationContext } from '@/utils/pabxValidation';

interface PremiumPlanSelectorProps {
  selectedPlan: 'essencial' | 'professional' | null;
  onPlanChange: (plan: 'essencial' | 'professional') => void;
  disabled?: boolean;
  visible?: boolean;
  premiumBillingType?: 'ilimitado-sem-aparelho' | 'ilimitado-com-aparelho' | 'tarifado-sem-aparelho' | 'tarifado-com-aparelho' | null;
  extensions?: number;
  showValidation?: boolean;
}

export const PremiumPlanSelector: React.FC<PremiumPlanSelectorProps> = ({
  selectedPlan,
  onPlanChange,
  disabled = false,
  visible = true,
  premiumBillingType = null,
  extensions = 0,
  showValidation = true
}) => {
  // Don't render if not visible
  if (!visible) {
    return null;
  }

  // Create validation context
  const validationContext: PABXValidationContext = {
    modality: 'premium',
    premiumPlan: selectedPlan,
    premiumBillingType,
    extensions
  };

  // Get validation state
  const validationResult = validatePABXSelection(validationContext);
  const validationState = createValidationState(validationResult);

  return (
    <Card className="w-full bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center text-white">
          Plano Premium
          <RequiredFieldIndicator required={true} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <RadioGroup
          value={selectedPlan || ''}
          onValueChange={(value) => onPlanChange(value as 'essencial' | 'professional')}
          disabled={disabled}
          className="space-y-3"
        >
          <div className="flex items-start space-x-3 p-4 border border-slate-600 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
            <RadioGroupItem 
              value="essencial" 
              id="essencial"
              disabled={disabled}
              className="border-slate-500 text-white mt-1 flex-shrink-0"
            />
            <Label 
              htmlFor="essencial" 
              className="flex-1 cursor-pointer font-medium text-white"
            >
              <div className="flex flex-col">
                <span className="text-base font-semibold">Essencial</span>
                <span className="text-sm text-slate-400 mt-1 leading-relaxed">
                  Plano básico Premium com recursos essenciais para pequenas e médias empresas
                </span>
              </div>
            </Label>
          </div>

          <div className="flex items-start space-x-3 p-4 border border-slate-600 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
            <RadioGroupItem 
              value="professional" 
              id="professional"
              disabled={disabled}
              className="border-slate-500 text-white mt-1 flex-shrink-0"
            />
            <Label 
              htmlFor="professional" 
              className="flex-1 cursor-pointer font-medium text-white"
            >
              <div className="flex flex-col">
                <span className="text-base font-semibold">Professional</span>
                <span className="text-sm text-slate-400 mt-1 leading-relaxed">
                  Plano avançado Premium com recursos completos para empresas de grande porte
                </span>
              </div>
            </Label>
          </div>
        </RadioGroup>

        {selectedPlan && (
          <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg">
            <p className="text-sm text-blue-300">
              <strong>Selecionado:</strong> Plano {selectedPlan === 'essencial' ? 'Essencial' : 'Professional'}
              <span className="block mt-1">
                Agora selecione o tipo de cobrança
              </span>
            </p>
          </div>
        )}

        {showValidation && (
          <ValidationIndicator
            hasErrors={validationState.hasErrors && !selectedPlan}
            hasWarnings={validationState.hasWarnings}
            errorMessage={!selectedPlan ? "Selecione um plano Premium para continuar" : ""}
            warningMessage={validationState.warningMessage}
            isComplete={selectedPlan !== null && premiumBillingType !== null}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default PremiumPlanSelector;