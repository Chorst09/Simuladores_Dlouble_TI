# Design Document

## Overview

Esta funcionalidade expande o sistema de propostas com capacidades avançadas de edição, exclusão e gerenciamento de rodadas de negociação. O sistema permitirá que usuários modifiquem propostas existentes, apliquem descontos personalizados, e mantenham um histórico completo de todas as alterações através de um sistema de versionamento de rodadas.

## Architecture

O sistema seguirá uma arquitetura de versionamento onde cada alteração significativa em uma proposta cria uma nova "rodada de negociação":

```
Proposta Base (Rodada 1)
    ↓ (edição com descontos)
Proposta Rodada 2
    ↓ (mais ajustes)
Proposta Rodada 3
    ...
```

### Fluxo de Dados

```
Frontend (Lista de Propostas)
    ↓ (ação editar/excluir)
Modal de Confirmação/Edição
    ↓ (dados modificados)
API Routes (/api/proposals)
    ↓ (validação e processamento)
Database (proposals + negotiation_rounds)
```

## Components and Interfaces

### 1. Frontend Components

**ProposalActionsButtons.tsx** (Novo componente)
- Botões de Editar e Excluir
- Confirmação de exclusão
- Navegação para modo de edição

**ProposalEditModal.tsx** (Novo componente)
- Interface de edição de produtos
- Aplicação de descontos
- Cálculo automático de totais
- Histórico de rodadas

**NegotiationRoundsHistory.tsx** (Novo componente)
- Visualização do histórico de rodadas
- Comparação entre versões
- Detalhes de cada rodada

### 2. Backend Enhancements

**API Routes Atualizadas:**
- `DELETE /api/proposals/[id]` - Exclusão de propostas
- `PUT /api/proposals/[id]` - Edição com rodadas de negociação
- `GET /api/proposals/[id]/rounds` - Histórico de rodadas

### 3. Database Schema

**Tabela: negotiation_rounds**
```sql
CREATE TABLE negotiation_rounds (
  id SERIAL PRIMARY KEY,
  proposal_id VARCHAR(255) REFERENCES proposals(id),
  round_number INTEGER NOT NULL,
  products JSONB NOT NULL,
  discounts JSONB,
  total_setup DECIMAL(10,2),
  total_monthly DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255),
  notes TEXT
);
```

## Data Models

### Discount Structure
```typescript
interface ProductDiscount {
  productId: string;
  type: 'percentage' | 'fixed';
  value: number;
  reason?: string;
}

interface NegotiationRound {
  id: string;
  proposalId: string;
  roundNumber: number;
  products: ProposalItem[];
  discounts: ProductDiscount[];
  totalSetup: number;
  totalMonthly: number;
  createdAt: string;
  createdBy: string;
  notes?: string;
}
```

### Updated Proposal Interface
```typescript
interface Proposal {
  // ... existing fields
  currentRound: number;
  negotiationRounds: NegotiationRound[];
  lastModified: string;
  modifiedBy: string;
}
```

## Error Handling

### Frontend Error Scenarios
1. **Edição Conflitante**: Verificar se a proposta foi modificada por outro usuário
2. **Validação de Descontos**: Garantir que descontos não excedam limites
3. **Exclusão Restrita**: Verificar se a proposta pode ser excluída
4. **Conectividade**: Lidar com falhas de rede durante operações

### Backend Error Scenarios
1. **Proposta Não Encontrada**: Retornar 404 com mensagem clara
2. **Permissões Insuficientes**: Verificar se usuário pode editar/excluir
3. **Integridade de Dados**: Validar consistência antes de salvar
4. **Concorrência**: Lidar com edições simultâneas

## Testing Strategy

### Unit Tests
- Componentes de edição e exclusão
- Cálculos de desconto
- Validação de dados
- Gerenciamento de estado

### Integration Tests
- Fluxo completo de edição
- Sistema de rodadas de negociação
- Persistência de dados
- Sincronização entre componentes

### User Experience Tests
- Usabilidade dos botões de ação
- Clareza das confirmações
- Performance com muitas rodadas
- Responsividade em diferentes dispositivos

## Implementation Approach

### Phase 1: UI Components
1. Adicionar botões de Editar e Excluir na tabela de propostas
2. Criar modal de confirmação para exclusão
3. Implementar interface de edição de produtos

### Phase 2: Discount System
1. Adicionar campos de desconto na interface de edição
2. Implementar cálculos automáticos de totais
3. Validar limites de desconto

### Phase 3: Negotiation Rounds
1. Implementar sistema de versionamento
2. Criar histórico de rodadas
3. Adicionar comparação entre versões

### Phase 4: Backend Integration
1. Implementar APIs de edição e exclusão
2. Adicionar suporte a rodadas de negociação
3. Implementar validações e controles de acesso

### Phase 5: Testing and Polish
1. Testes abrangentes de todas as funcionalidades
2. Otimização de performance
3. Melhorias de UX baseadas em feedback