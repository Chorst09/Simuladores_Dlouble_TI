# Design Document

## Overview

O sistema de desconto personalizado da função DIRETOR será implementado como uma funcionalidade exclusiva que permite à diretoria aplicar descontos customizados em todas as calculadoras. O desconto será aplicado ao valor total da proposta e será persistido junto com os dados da proposta.

## Architecture

### Componente Principal
- **DirectorDiscount**: Componente reutilizável que será integrado em todas as calculadoras
- **Localização**: `src/components/calculators/shared/DirectorDiscount.tsx`

### Integração com Calculadoras
- Todas as calculadoras existentes receberão o componente DirectorDiscount
- O componente será renderizado condicionalmente baseado na função do usuário (`userRole === 'diretor'`)

### Fluxo de Dados
1. Verificação da função do usuário (DIRETOR)
2. Renderização condicional do campo de desconto
3. Aplicação do desconto ao cálculo total
4. Persistência do desconto na proposta
5. Exibição do desconto aplicado

## Components and Interfaces

### DirectorDiscount Component

```typescript
interface DirectorDiscountProps {
  totalValue: number;
  onDiscountChange: (discount: number, discountedValue: number) => void;
  initialDiscount?: number;
  disabled?: boolean;
}
```

### Atualização do Tipo Proposal

```typescript
interface Proposal {
  // ... campos existentes
  directorDiscount?: {
    percentage: number;
    appliedBy: string;
    appliedAt: string;
    reason?: string;
  };
}
```

### Estados Adicionais nas Calculadoras

```typescript
// Estados para desconto de diretor
const [directorDiscount, setDirectorDiscount] = useState<number>(0);
const [directorDiscountReason, setDirectorDiscountReason] = useState<string>('');
const [finalTotal, setFinalTotal] = useState<number>(0);
```

## Data Models

### DirectorDiscount Interface

```typescript
interface DirectorDiscountData {
  percentage: number;
  appliedBy: string;
  appliedAt: string;
  reason?: string;
  originalValue: number;
  discountedValue: number;
}
```

### Atualização do ProposalItem

Não há necessidade de alterar o ProposalItem, pois o desconto será aplicado ao total final.

## Error Handling

### Validações de Input
- **Valores negativos**: Exibir erro e não aplicar
- **Valores não numéricos**: Sanitizar entrada e exibir aviso
- **Valores acima de 100%**: Solicitar confirmação
- **Campo vazio**: Considerar como 0%

### Tratamento de Erros
```typescript
const validateDirectorDiscount = (value: number): string | null => {
  if (value < 0) return "O desconto não pode ser negativo";
  if (value > 100) return "Desconto acima de 100% requer confirmação";
  if (isNaN(value)) return "Por favor, insira um valor numérico válido";
  return null;
};
```

## Testing Strategy

### Testes Unitários
1. **Componente DirectorDiscount**
   - Renderização condicional baseada na função
   - Validação de inputs
   - Cálculo correto do desconto
   - Callbacks de mudança de valor

2. **Integração com Calculadoras**
   - Verificação de renderização em cada calculadora
   - Aplicação correta do desconto ao total
   - Persistência do desconto na proposta

### Testes de Integração
1. **Fluxo Completo**
   - Login como diretor
   - Aplicação de desconto
   - Salvamento da proposta
   - Carregamento da proposta salva
   - Verificação da persistência do desconto

### Casos de Teste
1. **Acesso Autorizado**: Diretor vê o campo de desconto
2. **Acesso Negado**: Usuários não-diretores não veem o campo
3. **Validação de Entrada**: Valores inválidos são rejeitados
4. **Cálculo Correto**: Desconto é aplicado corretamente
5. **Persistência**: Desconto é salvo e carregado corretamente

## Implementation Details

### Estrutura do Componente DirectorDiscount

```typescript
const DirectorDiscount: React.FC<DirectorDiscountProps> = ({
  totalValue,
  onDiscountChange,
  initialDiscount = 0,
  disabled = false
}) => {
  const [discount, setDiscount] = useState<number>(initialDiscount);
  const [reason, setReason] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  // Lógica de validação e aplicação do desconto
};
```

### Integração nas Calculadoras

Cada calculadora receberá:
1. Import do componente DirectorDiscount
2. Estados para gerenciar o desconto
3. Lógica para recalcular totais
4. Persistência do desconto na proposta

### Posicionamento na Interface

O componente será posicionado:
- Após o cálculo dos totais
- Antes dos botões de ação (salvar, gerar proposta)
- Em uma seção destacada visualmente
- Com indicação clara de que é exclusivo para diretores

### Cálculo do Desconto

```typescript
const calculateFinalTotal = (originalTotal: number, discountPercentage: number): number => {
  return originalTotal * (1 - discountPercentage / 100);
};
```

### Persistência

O desconto será salvo como parte do objeto Proposal:
- Percentual aplicado
- Usuário que aplicou (diretor)
- Data/hora da aplicação
- Motivo (opcional)
- Valores original e com desconto