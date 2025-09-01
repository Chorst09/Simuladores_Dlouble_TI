import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit3, Save, X, RotateCcw } from 'lucide-react';
import { PremiumPlanPricing, PABXPriceRange } from '@/types';
import { PremiumEditablePricingState, PremiumEditablePricingActions } from '@/hooks/usePremiumEditablePricing';

interface PremiumPricingEditorProps {
  prices: PremiumPlanPricing;
  state: PremiumEditablePricingState;
  actions: PremiumEditablePricingActions;
}

const priceRanges: PABXPriceRange[] = ['10', '20', '30', '50', '100', '500', '1000'];
const priceTypes = [
  { key: 'setup' as const, label: 'Setup', prefix: 'R$' },
  { key: 'monthly' as const, label: 'Mensal', prefix: 'R$' },
  { key: 'hosting' as const, label: 'Hosting', prefix: 'R$' },
  { key: 'device' as const, label: 'Device', prefix: 'R$' }
];

const planLabels = {
  essencial: 'Essencial',
  professional: 'Professional'
};

const billingLabels = {
  ilimitado: 'Ilimitado',
  tarifado: 'Tarifado'
};

export const PremiumPricingEditor: React.FC<PremiumPricingEditorProps> = ({
  prices,
  state,
  actions
}) => {
  const formatCurrency = (value: number): string => {
    if (value === 0) return 'A combinar';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handlePriceChange = (
    plan: 'essencial' | 'professional',
    billingType: 'ilimitado' | 'tarifado',
    priceType: 'setup' | 'monthly' | 'hosting' | 'device',
    range: PABXPriceRange,
    value: string
  ) => {
    const numericValue = value === '' ? 0 : parseFloat(value.replace(/[^\d.-]/g, ''));
    if (!isNaN(numericValue)) {
      actions.updatePrice(plan, billingType, priceType, range, numericValue);
    }
  };

  const getErrorKey = (
    plan: string,
    billingType: string,
    priceType: string,
    range: string
  ): string => {
    return `${plan}-${billingType}-${priceType}-${range}`;
  };

  const renderPricingTable = (
    plan: 'essencial' | 'professional',
    billingType: 'ilimitado' | 'tarifado'
  ) => {
    const isEditing = actions.isEditingPlanBilling(plan, billingType);
    const planData = state.editedPrices[plan][billingType];

    return (
      <Card key={`${plan}-${billingType}`} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">
                {planLabels[plan]} - {billingLabels[billingType]}
              </CardTitle>
              <Badge variant={billingType === 'ilimitado' ? 'default' : 'secondary'}>
                {billingLabels[billingType]}
              </Badge>
            </div>
            <div className="flex gap-2">
              {!state.isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => actions.startEditing(plan, billingType)}
                  className="flex items-center gap-1"
                >
                  <Edit3 className="h-4 w-4" />
                  Editar
                </Button>
              )}
              {isEditing && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={actions.resetToDefaults}
                    className="flex items-center gap-1"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Resetar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={actions.cancelEditing}
                    className="flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={actions.saveChanges}
                    disabled={state.isSaving}
                    className="flex items-center gap-1"
                  >
                    <Save className="h-4 w-4" />
                    {state.isSaving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Ramais</th>
                  {priceTypes.map(priceType => (
                    <th key={priceType.key} className="text-center p-2 font-medium">
                      {priceType.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {priceRanges.map(range => (
                  <tr key={range} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">
                      {range === '500' ? '500+' : range === '1000' ? '1000+' : `${range}`}
                    </td>
                    {priceTypes.map(priceType => {
                      const value = planData[priceType.key][range];
                      const errorKey = getErrorKey(plan, billingType, priceType.key, range);
                      const hasError = state.errors.has(errorKey);
                      
                      return (
                        <td key={priceType.key} className="p-2 text-center">
                          {isEditing ? (
                            <div className="flex flex-col items-center">
                              <Input
                                type="number"
                                value={value === 0 ? '' : value}
                                onChange={(e) => handlePriceChange(
                                  plan,
                                  billingType,
                                  priceType.key,
                                  range,
                                  e.target.value
                                )}
                                placeholder={value === 0 ? 'A combinar' : '0'}
                                className={`w-24 text-center ${hasError ? 'border-red-500' : ''}`}
                                min="0"
                                step="0.01"
                              />
                              {hasError && (
                                <span className="text-xs text-red-500 mt-1">
                                  {state.errors.get(errorKey)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className={`${value === 0 ? 'text-gray-500 italic' : ''}`}>
                              {formatCurrency(value)}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Edição de Preços Premium</h3>
        {state.isEditing && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Edit3 className="h-3 w-3" />
            Editando: {planLabels[state.editingPlan as keyof typeof planLabels]} - {billingLabels[state.editingBillingType as keyof typeof billingLabels]}
          </Badge>
        )}
      </div>

      <div className="grid gap-4">
        {/* Essencial Plans */}
        <div>
          <h4 className="text-lg font-medium mb-3 text-blue-700">Plano Essencial</h4>
          {renderPricingTable('essencial', 'ilimitado')}
          {renderPricingTable('essencial', 'tarifado')}
        </div>

        {/* Professional Plans */}
        <div>
          <h4 className="text-lg font-medium mb-3 text-green-700">Plano Professional</h4>
          {renderPricingTable('professional', 'ilimitado')}
          {renderPricingTable('professional', 'tarifado')}
        </div>
      </div>

      {state.errors.size > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-red-800 font-medium mb-2">Erros de Validação:</h4>
          <ul className="text-red-700 text-sm space-y-1">
            {Array.from(state.errors.entries()).map(([key, error]) => (
              <li key={key}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};