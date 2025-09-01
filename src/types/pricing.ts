// Interfaces para as tabelas de preços PABX
export interface PricingRow {
  range: string;
  value: number;
  decomposition?: string; // Ex: "35 + 49" para mostrar aluguel + assinatura
  withEquipment?: number;
  withoutEquipment?: number;
}

export interface PricingTable {
  id: string;
  name: string; // "Ilimitado" ou "Tarifado"
  type: 'ilimitado' | 'tarifado';
  rows: PricingRow[];
}

export interface PricingPlan {
  id: string;
  name: string; // "PABX - Standard", "ESSENCIAL", "PROFISSIONAL"
  period: number; // 24 ou 36 meses
  tables: PricingTable[];
}

export interface PricingSection {
  title: string;
  period: number;
  plans: PricingPlan[];
}

// Dados para PABX - Standard removidos conforme solicitado
// O plano Standard foi removido, mantendo apenas ESSENCIAL e PROFISSIONAL

// Dados para Plano Essencial
export const essentialPlans: PricingPlan[] = [
  {
    id: 'essencial-24',
    name: 'ESSENCIAL',
    period: 24,
    tables: [
      {
        id: 'essencial-ilimitado-24',
        name: 'Ilimitado',
        type: 'ilimitado',
        rows: [
          { range: '2-9 ramais', value: 84, decomposition: '35 + 49' },
          { range: '10-19 ramais', value: 65, decomposition: '34 + 31' },
          { range: '20-49 ramais', value: 62, decomposition: '33 + 29' },
          { range: '50-99 ramais', value: 59, decomposition: '32 + 27' },
          { range: '100-199 ramais', value: 55, decomposition: '30 + 25' },
          { range: '+200 ramais', value: 52, decomposition: '29 + 23' }
        ]
      },
      {
        id: 'essencial-tarifado-24',
        name: 'Tarifado',
        type: 'tarifado',
        rows: [
          { range: '2-9 ramais', value: 59, decomposition: '35 + 24' },
          { range: '10-49 ramais', value: 49, decomposition: '34 + 15' },
          { range: '50-99 ramais', value: 38, decomposition: '33 + 5' },
          { range: '100-199 ramais', value: 34, decomposition: '32 + 2' },
          { range: '+200 ramais', value: 32, decomposition: '30 + 2' }
        ]
      }
    ]
  },
  {
    id: 'essencial-36',
    name: 'ESSENCIAL',
    period: 36,
    tables: [
      {
        id: 'essencial-ilimitado-36',
        name: 'Ilimitado',
        type: 'ilimitado',
        rows: [
          { range: '2-9 ramais', value: 77, decomposition: '35 + 42' },
          { range: '10-19 ramais', value: 59, decomposition: '34 + 25' },
          { range: '20-49 ramais', value: 55, decomposition: '33 + 22' },
          { range: '50-99 ramais', value: 53, decomposition: '32 + 21' },
          { range: '100-199 ramais', value: 48, decomposition: '30 + 18' },
          { range: '+200 ramais', value: 45, decomposition: '29 + 16' }
        ]
      },
      {
        id: 'essencial-tarifado-36',
        name: 'Tarifado',
        type: 'tarifado',
        rows: [
          { range: '2-9 ramais', value: 57, decomposition: '35 + 22' },
          { range: '10-49 ramais', value: 47, decomposition: '34 + 13' },
          { range: '50-99 ramais', value: 36, decomposition: '33 + 3' },
          { range: '100-199 ramais', value: 32, decomposition: '32 + 0' },
          { range: '+200 ramais', value: 30, decomposition: '30 + 0' }
        ]
      }
    ]
  }
];

// Dados para Plano Profissional
export const professionalPlans: PricingPlan[] = [
  {
    id: 'profissional-24',
    name: 'PROFISSIONAL',
    period: 24,
    tables: [
      {
        id: 'profissional-ilimitado-24',
        name: 'Ilimitado',
        type: 'ilimitado',
        rows: [
          { range: '2-9 ramais', value: 104, decomposition: '35 + 69' },
          { range: '10-19 ramais', value: 77, decomposition: '34 + 43' },
          { range: '20-49 ramais', value: 73, decomposition: '33 + 40' },
          { range: '50-99 ramais', value: 69, decomposition: '32 + 37' },
          { range: '100-199 ramais', value: 65, decomposition: '30 + 35' },
          { range: '+200 ramais', value: 62, decomposition: '29 + 33' }
        ]
      },
      {
        id: 'profissional-tarifado-24',
        name: 'Tarifado',
        type: 'tarifado',
        rows: [
          { range: '2-9 ramais', value: 79, decomposition: '35 + 44' },
          { range: '10-49 ramais', value: 59, decomposition: '34 + 25' },
          { range: '50-99 ramais', value: 51, decomposition: '33 + 18' },
          { range: '100-199 ramais', value: 39, decomposition: '32 + 7' },
          { range: '+200 ramais', value: 35, decomposition: '30 + 5' }
        ]
      }
    ]
  },
  {
    id: 'profissional-36',
    name: 'PROFISSIONAL',
    period: 36,
    tables: [
      {
        id: 'profissional-ilimitado-36',
        name: 'Ilimitado',
        type: 'ilimitado',
        rows: [
          { range: '2-9 ramais', value: 97, decomposition: '35 + 62' },
          { range: '10-19 ramais', value: 73, decomposition: '34 + 39' },
          { range: '20-49 ramais', value: 69, decomposition: '33 + 36' },
          { range: '50-99 ramais', value: 65, decomposition: '32 + 33' },
          { range: '100-199 ramais', value: 60, decomposition: '30 + 30' },
          { range: '+200 ramais', value: 57, decomposition: '29 + 28' }
        ]
      },
      {
        id: 'profissional-tarifado-36',
        name: 'Tarifado',
        type: 'tarifado',
        rows: [
          { range: '2-9 ramais', value: 75, decomposition: '35 + 40' },
          { range: '10-49 ramais', value: 57, decomposition: '34 + 23' },
          { range: '50-99 ramais', value: 49, decomposition: '33 + 16' },
          { range: '100-199 ramais', value: 37, decomposition: '32 + 5' },
          { range: '+200 ramais', value: 33, decomposition: '30 + 3' }
        ]
      }
    ]
  }
];

// Seções organizadas por período
export const pricingSections: PricingSection[] = [
  {
    title: '24 MESES',
    period: 24,
    plans: [
      essentialPlans[0],    // ESSENCIAL 24 meses
      professionalPlans[0]  // PROFISSIONAL 24 meses
    ]
  },
  {
    title: '36 MESES',
    period: 36,
    plans: [
      essentialPlans[1],    // ESSENCIAL 36 meses
      professionalPlans[1]  // PROFISSIONAL 36 meses
    ]
  }
];