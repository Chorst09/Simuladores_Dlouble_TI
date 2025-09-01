# Design Document

## Overview

Este documento descreve o design para padronizar todas as calculadoras do sistema para incluir o campo obrigatório "Nome do Projeto" através do uso consistente do componente `ClientManagerForm`. A implementação focará principalmente na migração do `VMCalculator.tsx` que ainda não utiliza este padrão.

## Architecture

### Current State Analysis

**Calculadoras que já usam ClientManagerForm:**
- PABXSIPCalculator.tsx
- RadioInternetCalculator.tsx  
- DoubleRadioFibraCalculator.tsx
- InternetMANCalculator.tsx
- FiberLinkCalculator.tsx
- MaquinasVirtuaisCalculator.tsx

**Calculadoras que precisam ser migradas:**
- VMCalculator.tsx (usa viewMode: 'search' | 'create' | 'edit' ao invés do padrão 'search' | 'client-form' | 'calculator')

### Target Architecture

Todas as calculadoras seguirão o padrão de três estados de visualização:
1. **'search'** - Tela de busca e listagem de propostas existentes
2. **'client-form'** - Formulário de dados do cliente usando `ClientManagerForm`
3. **'calculator'** - Interface principal da calculadora

## Components and Interfaces

### ClientManagerForm (Existing)

O componente já existe e está funcionando corretamente com a interface:

```typescript
interface ClientData {
    name: string;
    projectName: string; // Campo já implementado
    email: string;
    phone: string;
}

interface AccountManagerData {
    name: string;
    email: string;
    phone: string;
}
```

### VMCalculator Migration

**Current Structure:**
- viewMode: 'search' | 'create' | 'edit'
- Formulário de dados do cliente integrado na própria calculadora

**Target Structure:**
- viewMode: 'search' | 'client-form' | 'calculator'
- Uso do ClientManagerForm separado
- Estados clientData e accountManagerData

### State Management Changes

**Adicionar estados necessários:**
```typescript
const [clientData, setClientData] = useState<ClientData>({
    name: '',
    projectName: '',
    email: '',
    phone: ''
});

const [accountManagerData, setAccountManagerData] = useState<AccountManagerData>({
    name: '',
    email: '',
    phone: ''
});
```

**Modificar viewMode:**
```typescript
// De:
const [viewMode, setViewMode] = useState<'search' | 'create' | 'edit'>('search');

// Para:
const [viewMode, setViewMode] = useState<'search' | 'client-form' | 'calculator'>('search');
```

## Data Models

### Proposal Interface Updates

A interface Proposal no VMCalculator precisa ser atualizada para incluir os campos de cliente e gerente de contas:

```typescript
interface Proposal {
  id: string;
  proposalNumber: string;
  name: string;
  clientName: string; // Manter para compatibilidade
  clientData?: ClientData; // Adicionar
  accountManagerData?: AccountManagerData; // Adicionar
  date: string;
  vms: VMConfig[];
  totalPrice: number;
  negotiationRounds: NegotiationRound[];
  currentRound: number;
}
```

### Data Migration Strategy

Para manter compatibilidade com propostas existentes:
1. Manter o campo `clientName` existente
2. Adicionar campos opcionais `clientData` e `accountManagerData`
3. Na renderização, priorizar `clientData.name` se existir, senão usar `clientName`
4. Na criação de novas propostas, popular ambos os campos

## Error Handling

### Validation Rules

1. **Campo obrigatório:** Nome do Projeto não pode estar vazio
2. **Validação de formato:** Remover espaços em branco extras
3. **Feedback visual:** Destacar campos inválidos em vermelho
4. **Mensagens de erro:** Exibir mensagens claras e específicas

### Error States

```typescript
const validateClientData = (data: ClientData): string[] => {
    const errors: string[] = [];
    
    if (!data.name.trim()) {
        errors.push('Nome do cliente é obrigatório');
    }
    
    if (!data.projectName.trim()) {
        errors.push('Nome do projeto é obrigatório');
    }
    
    if (!data.email.trim()) {
        errors.push('Email do cliente é obrigatório');
    }
    
    return errors;
};
```

## Testing Strategy

### Unit Tests

1. **ClientManagerForm Integration:**
   - Verificar se o formulário é renderizado corretamente
   - Testar validação de campos obrigatórios
   - Verificar callbacks de navegação

2. **Data Persistence:**
   - Testar se dados do cliente são salvos corretamente
   - Verificar se o campo projectName é incluído nas propostas
   - Testar compatibilidade com propostas existentes

3. **Navigation Flow:**
   - Testar transição search → client-form → calculator
   - Verificar botões de voltar e continuar
   - Testar cancelamento de operações

### Integration Tests

1. **End-to-End Flow:**
   - Criar nova proposta completa
   - Editar proposta existente
   - Verificar persistência de dados

2. **Cross-Calculator Consistency:**
   - Verificar se todas as calculadoras seguem o mesmo padrão
   - Testar se dados são consistentes entre calculadoras

### Manual Testing Checklist

- [ ] VMCalculator usa ClientManagerForm
- [ ] Campo "Nome do Projeto" é obrigatório
- [ ] Validação funciona corretamente
- [ ] Navegação entre telas funciona
- [ ] Dados são salvos corretamente
- [ ] Propostas existentes continuam funcionando
- [ ] Interface é consistente com outras calculadoras

## Implementation Phases

### Phase 1: VMCalculator Migration
1. Adicionar imports necessários
2. Modificar estados e interfaces
3. Implementar fluxo client-form
4. Atualizar lógica de salvamento

### Phase 2: Data Migration
1. Atualizar interface Proposal
2. Implementar lógica de compatibilidade
3. Testar com propostas existentes

### Phase 3: Validation & Testing
1. Implementar validação robusta
2. Adicionar testes unitários
3. Realizar testes de integração

### Phase 4: Documentation & Cleanup
1. Atualizar documentação
2. Remover código obsoleto
3. Verificar consistência entre calculadoras