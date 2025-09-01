# Implementation Plan

- [x] 1. Criar estrutura de dados para planos Premium
  - Adicionar interface TypeScript para PremiumPlanPricing
  - Implementar objeto premiumPlanPrices com todos os preços dos planos
  - Adicionar novos estados para premiumPlan e premiumBillingType
  - _Requirements: 1.1, 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 2. Implementar componente PlanModalitySelector
  - Criar componente para seleção entre Standard e Premium
  - Implementar radio buttons com labels apropriados
  - Adicionar validação e tratamento de mudanças de estado
  - Integrar componente na interface principal do calculador
  - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.2_

- [x] 3. Implementar componente PremiumPlanSelector
  - Criar componente para seleção entre Essencial e Professional
  - Implementar lógica de visibilidade condicional (apenas quando Premium selecionado)
  - Adicionar radio buttons com descrições dos planos
  - Implementar reset de seleções quando modalidade muda
  - _Requirements: 2.1, 2.2, 2.3, 5.1, 5.3_

- [x] 4. Implementar componente BillingTypeSelector
  - Criar componente para seleção entre Ilimitado e Tarifado
  - Implementar lógica de visibilidade condicional (apenas quando plano Premium selecionado)
  - Adicionar radio buttons com descrições dos tipos de cobrança
  - Implementar validação de seleção obrigatória
  - _Requirements: 3.1, 3.2, 3.3, 5.1, 5.4_

- [x] 5. Modificar função calculatePABX para suportar planos Premium
  - Atualizar lógica de cálculo para verificar modalidade selecionada
  - Implementar seleção de preços baseada em modalidade/plano/tipo
  - Adicionar tratamento para valores "a combinar" (500+ ramais)
  - Manter compatibilidade com cálculos Standard existentes
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 6. Implementar validações e tratamento de erros
  - Adicionar validação para seleção completa de modalidade/plano/tipo
  - Implementar mensagens de erro específicas para cada caso
  - Adicionar indicadores visuais para seleções obrigatórias
  - Implementar tratamento para preços não disponíveis
  - _Requirements: 5.4, 2.2, 3.1_

- [x] 7. Atualizar interface do usuário com novos seletores
  - Integrar todos os componentes na interface principal
  - Implementar layout responsivo para os novos seletores
  - Adicionar estilos consistentes com o design existente
  - Implementar hierarquia visual clara (Modalidade → Plano → Tipo)
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 8. Implementar persistência de dados Premium em propostas
  - Modificar estrutura ProposalItem para incluir informações de modalidade/plano
  - Atualizar função saveProposal para salvar configurações Premium
  - Implementar carregamento de propostas com configurações Premium
  - Garantir compatibilidade com propostas Standard existentes
  - _Requirements: 4.6, 1.2, 1.3_

- [x] 9. Criar testes unitários para componentes Premium
  - Escrever testes para PlanModalitySelector
  - Escrever testes para PremiumPlanSelector
  - Escrever testes para BillingTypeSelector
  - Testar lógica de cálculo com diferentes combinações de planos
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [x] 10. Implementar funcionalidade de edição de preços Premium
  - Adicionar interface de edição para preços dos planos Premium
  - Implementar salvamento local dos preços editados
  - Adicionar validação para valores editados
  - Integrar com sistema de edição existente
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_