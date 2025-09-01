# Design Document

## Overview

Este documento descreve o design para adicionar uma aba específica "Tabela de Preços" ao componente MaquinasVirtuaisCalculator, mantendo consistência com os outros componentes calculadores e organizando melhor as funcionalidades de preços.

## Architecture

### Component Structure
```
MaquinasVirtuaisCalculator
├── TabsList
│   ├── Calculadora
│   ├── Rodadas de Negociação  
│   ├── DRE (admin only)
│   ├── Configurações (admin only)
│   ├── Tabela de Preços (admin/diretor only) [NEW]
│   └── Resumo da Proposta
└── TabsContent
    └── list-price [NEW]
        ├── Tabela de Comissões [MOVED from configurations]
        ├── Recursos de Computação
        ├── Armazenamento
        ├── Rede
        ├── Sistemas Operacionais
        └── Serviços Adicionais
```

## Components and Interfaces

### New Tab Structure
- **Tab Trigger**: `value="list-price"` com label "Tabela de Preços"
- **Visibility**: Apenas para `userRole === 'admin' || userRole === 'diretor'`
- **Icon**: `<Settings />` ou similar

### Pricing Tables Organization

#### 1. Tabela de Comissões (Moved from Configurations)
```typescript
interface CommissionTableProps {
  commissionTable: Array<{months: number, commission: number}>;
  onCommissionChange: (newTable: CommissionTable[]) => void;
}
```

#### 2. Recursos de Computação
```typescript
interface ComputeResourcesProps {
  vcpuWindows: number;
  vcpuLinux: number;
  ramCost: number;
  onResourceChange: (resource: string, value: number) => void;
}
```

#### 3. Armazenamento
```typescript
interface StorageProps {
  hddSas: number;
  ssdPerformance: number;
  nvme: number;
  onStorageChange: (type: string, value: number) => void;
}
```

#### 4. Rede
```typescript
interface NetworkProps {
  network1Gbps: number;
  network10Gbps: number;
  onNetworkChange: (type: string, value: number) => void;
}
```

#### 5. Sistemas Operacionais
```typescript
interface OperatingSystemsProps {
  windowsServer2022: number;
  windows10Pro: number;
  ubuntuServer: number;
  centosStream: number;
  debian12: number;
  rockyLinux: number;
  onOSChange: (os: string, value: number) => void;
}
```

#### 6. Serviços Adicionais
```typescript
interface AdditionalServicesProps {
  backupPerGb: number;
  additionalIp: number;
  snapshotCost: number;
  vpnSiteToSiteCost: number;
  onServiceChange: (service: string, value: number) => void;
}
```

## Data Models

### Pricing Configuration State
```typescript
interface PricingConfig {
  // Comissões
  commissionTable: CommissionEntry[];
  
  // Recursos de Computação
  vcpuWindows: number;
  vcpuLinux: number;
  ramCost: number;
  
  // Armazenamento
  hddSas: number;
  ssdPerformance: number;
  nvme: number;
  
  // Rede
  network1Gbps: number;
  network10Gbps: number;
  
  // Sistemas Operacionais
  windowsServer2022: number;
  windows10Pro: number;
  ubuntuServer: number;
  centosStream: number;
  debian12: number;
  rockyLinux: number;
  
  // Serviços Adicionais
  backupPerGb: number;
  additionalIp: number;
  snapshotCost: number;
  vpnSiteToSiteCost: number;
}

interface CommissionEntry {
  months: number;
  commission: number;
}
```

## Error Handling

### Validation Rules
1. **Numeric Validation**: Todos os campos devem aceitar apenas números positivos
2. **Decimal Precision**: Permitir até 2 casas decimais
3. **Required Fields**: Todos os campos são obrigatórios (não podem estar vazios)
4. **Range Validation**: Comissões devem estar entre 0% e 100%

### Error Messages
- "Valor deve ser um número positivo"
- "Comissão deve estar entre 0% e 100%"
- "Campo obrigatório"
- "Erro ao salvar configurações"

## Testing Strategy

### Unit Tests
1. **Component Rendering**: Verificar se a nova aba é renderizada corretamente
2. **Permission Checks**: Verificar se a aba só aparece para admin/diretor
3. **State Management**: Verificar se as mudanças de preço são refletidas no estado
4. **Validation**: Verificar se a validação de campos funciona

### Integration Tests
1. **Tab Navigation**: Verificar se a navegação entre abas funciona
2. **Data Persistence**: Verificar se os dados são salvos corretamente
3. **Cross-Component**: Verificar se os preços são usados corretamente nos cálculos

### Visual Tests
1. **Consistency**: Comparar com outros componentes calculadores
2. **Responsive**: Verificar em diferentes tamanhos de tela
3. **Print Behavior**: Verificar se não aparece no print (classe no-print)

## Implementation Notes

### Migration Strategy
1. **Phase 1**: Criar nova aba "Tabela de Preços"
2. **Phase 2**: Mover tabela de comissões das configurações
3. **Phase 3**: Adicionar tabelas de recursos organizadas
4. **Phase 4**: Implementar funcionalidade de salvar
5. **Phase 5**: Testes e ajustes finais

### Performance Considerations
- Usar `useMemo` para cálculos pesados
- Debounce para inputs de preços
- Lazy loading se necessário

### Accessibility
- Labels apropriados para screen readers
- Navegação por teclado
- Contraste adequado
- Feedback visual para ações