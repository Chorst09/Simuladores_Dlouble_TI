# Design Document

## Overview

Este documento descreve o design para implementar os planos PABX Premium no calculador PABX/SIP. A funcionalidade permitirá aos usuários escolher entre modalidades Standard e Premium, com os planos Premium oferecendo opções Essencial e Professional, cada um com modalidades ilimitado e tarifado.

## Architecture

### Component Structure

```
PABXSIPCalculator
├── PlanModalitySelector (novo)
│   ├── StandardOption
│   └── PremiumOption
│       ├── PlanSelector
│       │   ├── EssentialPlan
│       │   └── ProfessionalPlan
│       └── BillingTypeSelector
│           ├── UnlimitedOption
│           └── TariffedOption
└── PricingCalculation (modificado)
```

### State Management

```typescript
// Estados existentes (modificados)
const [pabxModality, setPabxModality] = useState<'standard' | 'premium'>('standard');

// Novos estados para Premium
const [premiumPlan, setPremiumPlan] = useState<'essencial' | 'professional' | null>(null);
const [premiumBillingType, setPremiumBillingType] = useState<'ilimitado' | 'tarifado' | null>(null);
```

### Data Structure

```typescript
interface PremiumPlanPricing {
  essencial: {
    ilimitado: PlanPrices;
    tarifado: PlanPrices;
  };
  professional: {
    ilimitado: PlanPrices;
    tarifado: PlanPrices;
  };
}

interface PlanPrices {
  setup: Record<PABXPriceRange, number>;
  monthly: Record<PABXPriceRange, number>;
  hosting: Record<PABXPriceRange, number>;
  device: Record<PABXPriceRange, number>;
}
```

## Components and Interfaces

### 1. PlanModalitySelector Component

**Responsabilidade**: Permitir seleção entre Standard e Premium

```typescript
interface PlanModalitySelectorProps {
  selectedModality: 'standard' | 'premium';
  onModalityChange: (modality: 'standard' | 'premium') => void;
  disabled?: boolean;
}
```

**Comportamento**:
- Radio buttons para Standard/Premium
- Quando Premium é selecionado, habilita seletores de plano
- Quando Standard é selecionado, usa preços existentes

### 2. PremiumPlanSelector Component

**Responsabilidade**: Permitir seleção entre planos Essencial e Professional

```typescript
interface PremiumPlanSelectorProps {
  selectedPlan: 'essencial' | 'professional' | null;
  onPlanChange: (plan: 'essencial' | 'professional') => void;
  disabled?: boolean;
}
```

**Comportamento**:
- Visível apenas quando modalidade Premium está selecionada
- Radio buttons para Essencial/Professional
- Habilita seletor de tipo de cobrança quando plano é selecionado

### 3. BillingTypeSelector Component

**Responsabilidade**: Permitir seleção entre Ilimitado e Tarifado

```typescript
interface BillingTypeSelectorProps {
  selectedType: 'ilimitado' | 'tarifado' | null;
  onTypeChange: (type: 'ilimitado' | 'tarifado') => void;
  disabled?: boolean;
}
```

**Comportamento**:
- Visível apenas quando plano Premium está selecionado
- Radio buttons para Ilimitado/Tarifado
- Atualiza cálculos quando selecionado

## Data Models

### Premium Pricing Structure

```typescript
const premiumPlanPrices: PremiumPlanPricing = {
  essencial: {
    ilimitado: {
      setup: {
        '10': 1400,
        '20': 2200,
        '30': 2700,
        '50': 3200,
        '100': 3700,
        '500': 0, // A combinar
        '1000': 0 // A combinar
      },
      monthly: {
        '10': 35,
        '20': 33,
        '30': 31,
        '50': 29,
        '100': 27,
        '500': 25,
        '1000': 23
      },
      hosting: {
        '10': 220,
        '20': 250,
        '30': 280,
        '50': 320,
        '100': 380,
        '500': 0, // A combinar
        '1000': 0 // A combinar
      },
      device: {
        '10': 40,
        '20': 38,
        '30': 36,
        '50': 34,
        '100': 32,
        '500': 0, // A combinar
        '1000': 0 // A combinar
      }
    },
    tarifado: {
      setup: {
        '10': 1300,
        '20': 2100,
        '30': 2600,
        '50': 3100,
        '100': 3600,
        '500': 0, // A combinar
        '1000': 0 // A combinar
      },
      monthly: {
        '10': 32,
        '20': 30,
        '30': 28,
        '50': 26,
        '100': 24,
        '500': 22,
        '1000': 20
      },
      hosting: {
        '10': 200,
        '20': 230,
        '30': 260,
        '50': 300,
        '100': 360,
        '500': 0, // A combinar
        '1000': 0 // A combinar
      },
      device: {
        '10': 38,
        '20': 36,
        '30': 34,
        '50': 32,
        '100': 30,
        '500': 0, // A combinar
        '1000': 0 // A combinar
      }
    }
  },
  professional: {
    ilimitado: {
      setup: {
        '10': 1600,
        '20': 2400,
        '30': 2900,
        '50': 3400,
        '100': 3900,
        '500': 0, // A combinar
        '1000': 0 // A combinar
      },
      monthly: {
        '10': 45,
        '20': 43,
        '30': 41,
        '50': 39,
        '100': 37,
        '500': 35,
        '1000': 33
      },
      hosting: {
        '10': 280,
        '20': 320,
        '30': 360,
        '50': 420,
        '100': 500,
        '500': 0, // A combinar
        '1000': 0 // A combinar
      },
      device: {
        '10': 50,
        '20': 48,
        '30': 46,
        '50': 44,
        '100': 42,
        '500': 0, // A combinar
        '1000': 0 // A combinar
      }
    },
    tarifado: {
      setup: {
        '10': 1500,
        '20': 2300,
        '30': 2800,
        '50': 3300,
        '100': 3800,
        '500': 0, // A combinar
        '1000': 0 // A combinar
      },
      monthly: {
        '10': 42,
        '20': 40,
        '30': 38,
        '50': 36,
        '100': 34,
        '500': 32,
        '1000': 30
      },
      hosting: {
        '10': 260,
        '20': 300,
        '30': 340,
        '50': 400,
        '100': 480,
        '500': 0, // A combinar
        '1000': 0 // A combinar
      },
      device: {
        '10': 47,
        '20': 45,
        '30': 43,
        '50': 41,
        '100': 39,
        '500': 0, // A combinar
        '1000': 0 // A combinar
      }
    }
  }
};
```

## Error Handling

### Validation Rules

1. **Modalidade Selection**: Sempre deve ter uma modalidade selecionada
2. **Premium Plan Selection**: Se Premium for selecionado, deve ter um plano
3. **Billing Type Selection**: Se plano Premium for selecionado, deve ter tipo de cobrança
4. **Price Calculation**: Validar se preços existem para a combinação selecionada

### Error Messages

```typescript
const validationMessages = {
  noModalitySelected: "Selecione uma modalidade (Standard ou Premium)",
  noPremiumPlanSelected: "Selecione um plano Premium (Essencial ou Professional)",
  noBillingTypeSelected: "Selecione o tipo de cobrança (Ilimitado ou Tarifado)",
  priceNotAvailable: "Preço não disponível para esta configuração. Entre em contato.",
};
```

## Testing Strategy

### Unit Tests

1. **Component Rendering**:
   - PlanModalitySelector renderiza corretamente
   - PremiumPlanSelector aparece apenas quando Premium selecionado
   - BillingTypeSelector aparece apenas quando plano Premium selecionado

2. **State Management**:
   - Mudanças de modalidade resetam seleções dependentes
   - Seleções são persistidas corretamente
   - Cálculos são atualizados quando seleções mudam

3. **Price Calculation**:
   - Preços Standard são calculados corretamente
   - Preços Premium são calculados corretamente para cada combinação
   - Valores "a combinar" são tratados adequadamente

### Integration Tests

1. **User Flow**:
   - Fluxo completo: Standard → cálculo → proposta
   - Fluxo completo: Premium → plano → tipo → cálculo → proposta
   - Mudança de modalidade limpa seleções anteriores

2. **Data Persistence**:
   - Propostas salvas incluem informações de modalidade/plano
   - Edição de propostas carrega configurações corretas

### E2E Tests

1. **Complete Workflows**:
   - Criar proposta com PABX Standard
   - Criar proposta com PABX Premium Essencial Ilimitado
   - Criar proposta com PABX Premium Professional Tarifado
   - Editar proposta existente e alterar modalidade

## Implementation Notes

### Backward Compatibility

- Propostas existentes continuam funcionando (assumem Standard)
- Estrutura de dados existente é mantida
- Novos campos são opcionais

### Performance Considerations

- Lazy loading dos preços Premium
- Memoização dos cálculos complexos
- Debounce nas mudanças de seleção

### Accessibility

- Labels apropriados para screen readers
- Navegação por teclado
- Indicadores visuais claros para seleções ativas

### Responsive Design

- Layout adaptável para mobile
- Seletores empilhados em telas pequenas
- Botões com tamanho adequado para touch