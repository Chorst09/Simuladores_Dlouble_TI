import React from 'react';
import { PricingTableSection } from './PricingTableSection';
import { pricingSections } from '@/types/pricing';

// Função de formatação de moeda simples para teste
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const PricingTableTest: React.FC = () => {
  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">
            Teste das Tabelas de Preços PABX
          </h1>
          <p className="text-slate-400">
            Visualização dos novos planos Standard, Essencial e Profissional
          </p>
        </div>
        
        {pricingSections.map((section) => (
          <PricingTableSection
            key={section.period}
            section={section}
            formatCurrency={formatCurrency}
            className="mb-8"
          />
        ))}
      </div>
    </div>
  );
};