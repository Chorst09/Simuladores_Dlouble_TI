# Design Document

## Overview

Este documento descreve o design para implementar as atualizações nas tabelas de preços do componente PABX/SIP, incluindo a renomeação da tabela existente e a criação de novas tabelas para os planos Essencial e Profissional.

## Architecture

### Component Structure
O componente PABXSIPCalculator será atualizado para incluir:
- Tabela existente renomeada para "PABX - Standard"
- Nova seção "Plano Essencial" com sub-tabelas para 24 e 36 meses
- Nova seção "Plano Profissional" com sub-tabelas para 24 e 36 meses

### Data Structure
```typescript
interface PricingPlan {
  name: string;
  periods: {
    [key: string]: {
      ilimitado: PricingTable;
      tarifado: PricingTable;
    }
  }
}

interface PricingTable {
  name: string;
  rows: PricingRow[];
}

interface PricingRow {
  range: string;
  withEquipment: {
    total: number;
    breakdown: string;
  };
  withoutEquipment: {
    total: number;
    breakdown?: string;
  };
}
```

## Components and Interfaces

### 1. Updated PABXSIPCalculator Component
- **Location**: `src/components/calculators/PABXSIPCalculator.tsx`
- **Responsibility**: Renderizar as tabelas de preços atualizadas na seção "Lista de Preços"

### 2. PricingTableSection Component (New)
- **Responsibility**: Renderizar uma seção de tabela de preços com título e período
- **Props**:
  - `title: string` - Título da seção (ex: "PLANO ESSENCIAL")
  - `period: string` - Período (ex: "24 MESES", "36 MESES")
  - `tables: PricingTable[]` - Array de tabelas (Ilimitado e Tarifado)

### 3. PricingTable Component (Enhanced)
- **Responsibility**: Renderizar uma tabela individual de preços
- **Props**:
  - `title: string` - Título da tabela (ex: "ESSENCIAL Ilimitado")
  - `columns: string[]` - Títulos das colunas
  - `rows: PricingRow[]` - Dados das linhas
  - `editable?: boolean` - Se os valores podem ser editados

## Data Models

### Standard Plan Data
```typescript
const standardPlan = {
  name: "PABX - Standard",
  // Dados existentes mantidos
}
```

### Essential Plan Data
```typescript
const essentialPlan = {
  name: "Plano Essencial",
  periods: {
    "24": {
      ilimitado: {
        name: "ESSENCIAL Ilimitado",
        rows: [
          {
            range: "2 a 9 ramais",
            withEquipment: { total: 84, breakdown: "35 + 49" },
            withoutEquipment: { total: 75 }
          },
          // ... outros valores
        ]
      },
      tarifado: {
        name: "ESSENCIAL Tarifado",
        rows: [
          {
            range: "2 a 9 ramais",
            withEquipment: { total: 59, breakdown: "35 + 24" },
            withoutEquipment: { total: 44, breakdown: "20 + 24" }
          },
          // ... outros valores
        ]
      }
    },
    "36": {
      // Dados para 36 meses
    }
  }
}
```

### Professional Plan Data
```typescript
const professionalPlan = {
  name: "Plano Profissional",
  periods: {
    "24": {
      ilimitado: {
        name: "PROFISSIONAL Ilimitado",
        rows: [
          {
            range: "2 a 9 ramais",
            withEquipment: { total: 104, breakdown: "35 + 69" },
            withoutEquipment: { total: 95 }
          },
          // ... outros valores
        ]
      },
      tarifado: {
        name: "PROFISSIONAL Tarifado",
        rows: [
          {
            range: "2 a 9 ramais",
            withEquipment: { total: 79, breakdown: "35 + 44" },
            withoutEquipment: { total: 64, breakdown: "20 + 44" }
          },
          // ... outros valores
        ]
      }
    },
    "36": {
      // Dados para 36 meses
    }
  }
}
```

## Error Handling

### Data Validation
- Validar que todos os valores de preços são números positivos
- Validar que as decomposições de valores somam corretamente
- Validar que todas as faixas de ramais estão presentes

### User Input Validation
- Validar entrada numérica nos campos editáveis
- Prevenir valores negativos ou inválidos
- Mostrar mensagens de erro apropriadas

## Testing Strategy

### Unit Tests
1. **Data Structure Tests**
   - Verificar que todos os planos têm a estrutura correta
   - Verificar que todos os valores estão presentes
   - Verificar que as decomposições somam corretamente

2. **Component Rendering Tests**
   - Verificar que todas as tabelas são renderizadas
   - Verificar que os títulos estão corretos
   - Verificar que os valores são exibidos corretamente

3. **User Interaction Tests**
   - Verificar edição de valores (se aplicável)
   - Verificar navegação entre tabelas
   - Verificar responsividade

### Integration Tests
1. **Full Component Tests**
   - Verificar que todas as seções são exibidas
   - Verificar que a navegação funciona
   - Verificar que os dados são persistidos (se aplicável)

### Visual Regression Tests
1. **Layout Tests**
   - Verificar que as tabelas mantêm o layout consistente
   - Verificar que as cores e estilos estão corretos
   - Verificar responsividade em diferentes tamanhos de tela

## Implementation Notes

### CSS Classes
- Manter consistência com as classes existentes
- Usar classes utilitárias do Tailwind CSS
- Aplicar cores consistentes:
  - Azul para cabeçalhos de período
  - Cores alternadas para diferentes tipos de plano

### Accessibility
- Manter estrutura semântica das tabelas
- Usar cabeçalhos apropriados (th)
- Manter contraste adequado de cores
- Suporte a navegação por teclado

### Performance
- Usar React.memo para componentes de tabela se necessário
- Otimizar re-renderizações desnecessárias
- Lazy loading se as tabelas ficarem muito grandes

### Responsive Design
- Tabelas devem ser scrolláveis horizontalmente em telas pequenas
- Manter legibilidade em dispositivos móveis
- Considerar layout empilhado para telas muito pequenas