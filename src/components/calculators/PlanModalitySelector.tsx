"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface PlanModalitySelectorProps {
  selectedModality: 'standard' | 'premium';
  onModalityChange: (modality: 'standard' | 'premium') => void;
  disabled?: boolean;
  premiumPlan?: 'essencial' | 'professional' | null;
  premiumBillingType?: 'ilimitado-sem-aparelho' | 'ilimitado-com-aparelho' | 'tarifado-sem-aparelho' | 'tarifado-com-aparelho' | null;
  extensions?: number;
  showValidation?: boolean;
}

export const PlanModalitySelector: React.FC<PlanModalitySelectorProps> = ({
  selectedModality,
  onModalityChange,
  disabled = false,
  premiumPlan,
  premiumBillingType,
  extensions,
  showValidation = false
}) => {
  return (
    <Card className="w-full bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center text-white">
          Modalidade PABX
          <span className="text-red-500 ml-1" aria-label="Campo obrigatório">*</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <RadioGroup
          value={selectedModality}
          onValueChange={(value) => onModalityChange(value as 'standard' | 'premium')}
          disabled={disabled}
          className="space-y-3"
        >
          <div className="flex items-start space-x-3 p-4 border border-slate-600 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
            <RadioGroupItem 
              value="standard" 
              id="standard"
              disabled={disabled}
              className="border-slate-500 text-white mt-1 flex-shrink-0"
            />
            <Label 
              htmlFor="standard" 
              className="flex-1 cursor-pointer font-medium text-white"
            >
              <div className="flex flex-col">
                <span className="text-base font-semibold">PABX Standard</span>
                <span className="text-sm text-slate-400 mt-1 leading-relaxed">
                  Plano tradicional com preços da tabela padrão
                </span>
              </div>
            </Label>
          </div>

          <div className="flex items-start space-x-3 p-4 border border-slate-600 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
            <RadioGroupItem 
              value="premium" 
              id="premium"
              disabled={disabled}
              className="border-slate-500 text-white mt-1 flex-shrink-0"
            />
            <Label 
              htmlFor="premium" 
              className="flex-1 cursor-pointer font-medium text-white"
            >
              <div className="flex flex-col">
                <span className="text-base font-semibold">PABX Premium</span>
                <span className="text-sm text-slate-400 mt-1 leading-relaxed">
                  Planos avançados com opções Essencial e Professional
                </span>
              </div>
            </Label>
          </div>
        </RadioGroup>

        {selectedModality && (
          <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg">
            <p className="text-sm text-blue-300">
              <strong>Selecionado:</strong> PABX {selectedModality === 'standard' ? 'Standard' : 'Premium'}
              {selectedModality === 'premium' && (
                <span className="block mt-1">
                  {premiumPlan && premiumBillingType ? (
                    <>
                      Plano {premiumPlan === 'essencial' ? 'Essencial' : 'Professional'} - {
                        premiumBillingType === 'ilimitado-sem-aparelho' ? 'Ilimitado Sem Aparelho' :
                        premiumBillingType === 'ilimitado-com-aparelho' ? 'Ilimitado Com Aparelho' :
                        premiumBillingType === 'tarifado-sem-aparelho' ? 'Tarifado Sem Aparelho' :
                        premiumBillingType === 'tarifado-com-aparelho' ? 'Tarifado Com Aparelho' : ''
                      }
                    </>
                  ) : (
                    'Selecione um plano Premium para continuar'
                  )}
                </span>
              )}
            </p>
          </div>
        )}

        {showValidation && selectedModality === 'premium' && (!premiumPlan || !premiumBillingType) && (
          <div className="mt-2 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
            <p className="text-sm text-yellow-300">
              ⚠️ Para usar PABX Premium, você deve selecionar:
              {!premiumPlan && <span className="block ml-4">• Um plano (Essencial ou Professional)</span>}
              {!premiumBillingType && <span className="block ml-4">• Um tipo de cobrança (Ilimitado ou Tarifado)</span>}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlanModalitySelector;