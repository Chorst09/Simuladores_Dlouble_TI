"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ValidationIndicator } from './shared/ValidationIndicator';
import { RequiredFieldIndicator } from './shared/RequiredFieldIndicator';
import { validatePABXSelection, createValidationState, PABXValidationContext } from '@/utils/pabxValidation';

interface BillingTypeSelectorProps {
  selectedType: 'ilimitado-sem-aparelho' | 'ilimitado-com-aparelho' | 'tarifado-sem-aparelho' | 'tarifado-com-aparelho' | null;
  onTypeChange: (type: 'ilimitado-sem-aparelho' | 'ilimitado-com-aparelho' | 'tarifado-sem-aparelho' | 'tarifado-com-aparelho') => void;
  disabled?: boolean;
  visible?: boolean;
  premiumPlan?: 'essencial' | 'professional' | null;
  extensions?: number;
  showValidation?: boolean;
}

export const BillingTypeSelector: React.FC<BillingTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
  disabled = false,
  visible = true,
  premiumPlan = null,
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
    premiumPlan,
    premiumBillingType: selectedType,
    extensions
  };

  // Get validation state
  const validationResult = validatePABXSelection(validationContext);
  const validationState = createValidationState(validationResult);

  return (
    <Card className="w-full bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center text-white">
          Tipo de Cobrança
          <RequiredFieldIndicator required={true} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <RadioGroup
          value={selectedType || ''}
          onValueChange={(value) => onTypeChange(value as 'ilimitado-sem-aparelho' | 'ilimitado-com-aparelho' | 'tarifado-sem-aparelho' | 'tarifado-com-aparelho')}
          disabled={disabled}
          className="space-y-3"
        >
          {/* Ilimitado Sem Aparelho */}
          <div className="flex items-start space-x-3 p-4 border border-slate-600 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
            <RadioGroupItem 
              value="ilimitado-sem-aparelho" 
              id="ilimitado-sem-aparelho"
              disabled={disabled}
              className="border-slate-500 text-white mt-1 flex-shrink-0"
            />
            <Label 
              htmlFor="ilimitado-sem-aparelho" 
              className="flex-1 cursor-pointer font-medium text-white"
            >
              <div className="flex flex-col">
                <span className="text-base font-semibold">Ilimitado Sem Aparelho</span>
                <span className="text-sm text-slate-400 mt-1 leading-relaxed">
                  Plano com chamadas ilimitadas, preço fixo mensal (apenas assinatura)
                </span>
              </div>
            </Label>
          </div>

          {/* Ilimitado Com Aparelho */}
          <div className="flex items-start space-x-3 p-4 border border-slate-600 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
            <RadioGroupItem 
              value="ilimitado-com-aparelho" 
              id="ilimitado-com-aparelho"
              disabled={disabled}
              className="border-slate-500 text-white mt-1 flex-shrink-0"
            />
            <Label 
              htmlFor="ilimitado-com-aparelho" 
              className="flex-1 cursor-pointer font-medium text-white"
            >
              <div className="flex flex-col">
                <span className="text-base font-semibold">Ilimitado Com Aparelho</span>
                <span className="text-sm text-slate-400 mt-1 leading-relaxed">
                  Plano com chamadas ilimitadas, preço fixo mensal (aluguel + assinatura)
                </span>
              </div>
            </Label>
          </div>

          {/* Tarifado Sem Aparelho */}
          <div className="flex items-start space-x-3 p-4 border border-slate-600 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
            <RadioGroupItem 
              value="tarifado-sem-aparelho" 
              id="tarifado-sem-aparelho"
              disabled={disabled}
              className="border-slate-500 text-white mt-1 flex-shrink-0"
            />
            <Label 
              htmlFor="tarifado-sem-aparelho" 
              className="flex-1 cursor-pointer font-medium text-white"
            >
              <div className="flex flex-col">
                <span className="text-base font-semibold">Tarifado Sem Aparelho</span>
                <span className="text-sm text-slate-400 mt-1 leading-relaxed">
                  Plano com cobrança baseada no consumo (apenas assinatura + franquia)
                </span>
              </div>
            </Label>
          </div>

          {/* Tarifado Com Aparelho */}
          <div className="flex items-start space-x-3 p-4 border border-slate-600 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
            <RadioGroupItem 
              value="tarifado-com-aparelho" 
              id="tarifado-com-aparelho"
              disabled={disabled}
              className="border-slate-500 text-white mt-1 flex-shrink-0"
            />
            <Label 
              htmlFor="tarifado-com-aparelho" 
              className="flex-1 cursor-pointer font-medium text-white"
            >
              <div className="flex flex-col">
                <span className="text-base font-semibold">Tarifado Com Aparelho</span>
                <span className="text-sm text-slate-400 mt-1 leading-relaxed">
                  Plano com cobrança baseada no consumo (aluguel + assinatura + franquia)
                </span>
              </div>
            </Label>
          </div>
        </RadioGroup>

        {selectedType && (
          <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg">
            <p className="text-sm text-blue-300">
              <strong>Selecionado:</strong> {
                selectedType === 'ilimitado-sem-aparelho' ? 'Ilimitado Sem Aparelho' :
                selectedType === 'ilimitado-com-aparelho' ? 'Ilimitado Com Aparelho' :
                selectedType === 'tarifado-sem-aparelho' ? 'Tarifado Sem Aparelho' :
                selectedType === 'tarifado-com-aparelho' ? 'Tarifado Com Aparelho' : ''
              }
            </p>
          </div>
        )}

        {showValidation && (
          <ValidationIndicator
            hasErrors={validationState.hasErrors && !selectedType}
            hasWarnings={validationState.hasWarnings}
            errorMessage={!selectedType ? "Selecione o tipo de cobrança para continuar" : ""}
            warningMessage={validationState.warningMessage}
            isComplete={selectedType !== null && premiumPlan !== null}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default BillingTypeSelector;