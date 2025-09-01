"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { RequiredFieldIndicator } from './shared/RequiredFieldIndicator';

interface ContractPeriodSelectorProps {
  selectedPeriod: '24' | '36' | null;
  onPeriodChange: (period: '24' | '36') => void;
  disabled?: boolean;
  visible?: boolean;
  showValidation?: boolean;
}

export const ContractPeriodSelector: React.FC<ContractPeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
  disabled = false,
  visible = true,
  showValidation = true
}) => {
  // Don't render if not visible
  if (!visible) {
    return null;
  }

  return (
    <Card className="w-full bg-slate-800/50 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center text-white">
          Período do Contrato
          <RequiredFieldIndicator required={true} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <RadioGroup
          value={selectedPeriod || ''}
          onValueChange={(value) => onPeriodChange(value as '24' | '36')}
          disabled={disabled}
          className="space-y-3"
        >
          {/* 24 Meses */}
          <div className="flex items-start space-x-3 p-4 border border-slate-600 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
            <RadioGroupItem 
              value="24" 
              id="24-meses"
              disabled={disabled}
              className="border-slate-500 text-white mt-1 flex-shrink-0"
            />
            <Label 
              htmlFor="24-meses" 
              className="flex-1 cursor-pointer font-medium text-white"
            >
              <div className="flex flex-col">
                <span className="text-base font-semibold">24 Meses</span>
                <span className="text-sm text-slate-400 mt-1 leading-relaxed">
                  Contrato de 2 anos com preços diferenciados
                </span>
              </div>
            </Label>
          </div>

          {/* 36 Meses */}
          <div className="flex items-start space-x-3 p-4 border border-slate-600 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
            <RadioGroupItem 
              value="36" 
              id="36-meses"
              disabled={disabled}
              className="border-slate-500 text-white mt-1 flex-shrink-0"
            />
            <Label 
              htmlFor="36-meses" 
              className="flex-1 cursor-pointer font-medium text-white"
            >
              <div className="flex flex-col">
                <span className="text-base font-semibold">36 Meses</span>
                <span className="text-sm text-slate-400 mt-1 leading-relaxed">
                  Contrato de 3 anos com melhores preços (recomendado)
                </span>
              </div>
            </Label>
          </div>
        </RadioGroup>

        {selectedPeriod && (
          <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg">
            <p className="text-sm text-blue-300">
              <strong>Selecionado:</strong> Contrato de {selectedPeriod} meses
              <span className="block mt-1">
                Agora selecione o plano Premium desejado
              </span>
            </p>
          </div>
        )}

        {showValidation && !selectedPeriod && (
          <div className="mt-2 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
            <p className="text-sm text-yellow-300">
              ⚠️ Selecione o período do contrato para continuar
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContractPeriodSelector;