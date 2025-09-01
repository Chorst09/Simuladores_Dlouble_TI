# Implementation Plan

- [x] 1. Atualizar tipos e interfaces para suportar desconto de diretor
  - Adicionar interface DirectorDiscountData no arquivo de tipos
  - Estender interface Proposal para incluir campo directorDiscount
  - Criar tipos para validação e estados do desconto
  - _Requirements: 2.1, 2.2, 5.4_

- [x] 2. Criar componente DirectorDiscount reutilizável
  - Implementar componente DirectorDiscount em src/components/calculators/shared/
  - Adicionar validação de entrada para valores de desconto
  - Implementar lógica de cálculo do desconto
  - Adicionar confirmação para descontos acima de 100%
  - Criar testes unitários para o componente
  - _Requirements: 1.1, 1.4, 1.5, 4.1, 4.2, 5.1, 5.2, 5.3, 5.5_

- [x] 3. Integrar DirectorDiscount no RadioInternetCalculator
  - Importar e renderizar componente condicionalmente para userRole === 'diretor'
  - Adicionar estados para gerenciar desconto de diretor
  - Implementar lógica de recálculo do total com desconto
  - Atualizar função de salvamento para incluir dados do desconto
  - Atualizar carregamento de propostas para restaurar desconto aplicado
  - _Requirements: 1.1, 1.2, 1.4, 2.1, 2.2, 2.3, 3.1, 4.3_

- [x] 4. Integrar DirectorDiscount no FiberLinkCalculator
  - Importar e renderizar componente condicionalmente para userRole === 'diretor'
  - Adicionar estados para gerenciar desconto de diretor
  - Implementar lógica de recálculo do total com desconto
  - Atualizar função de salvamento para incluir dados do desconto
  - Atualizar carregamento de propostas para restaurar desconto aplicado
  - _Requirements: 1.1, 1.2, 1.4, 2.1, 2.2, 2.3, 3.2, 4.3_

- [x] 5. Integrar DirectorDiscount no DoubleRadioFibraCalculator
  - Importar e renderizar componente condicionalmente para userRole === 'diretor'
  - Adicionar estados para gerenciar desconto de diretor
  - Implementar lógica de recálculo do total com desconto
  - Atualizar função de salvamento para incluir dados do desconto
  - Atualizar carregamento de propostas para restaurar desconto aplicado
  - _Requirements: 1.1, 1.2, 1.4, 2.1, 2.2, 2.3, 3.3, 4.3_

- [x] 6. Integrar DirectorDiscount no PABXSIPCalculator
  - Importar e renderizar componente condicionalmente para userRole === 'diretor'
  - Adicionar estados para gerenciar desconto de diretor
  - Implementar lógica de recálculo do total com desconto
  - Atualizar função de salvamento para incluir dados do desconto
  - Atualizar carregamento de propostas para restaurar desconto aplicado
  - _Requirements: 1.1, 1.2, 1.4, 2.1, 2.2, 2.3, 3.4, 4.3_

- [x] 7. Integrar DirectorDiscount no MaquinasVirtuaisCalculator
  - Importar e renderizar componente condicionalmente para userRole === 'diretor'
  - Adicionar estados para gerenciar desconto de diretor
  - Implementar lógica de recálculo do total com desconto
  - Atualizar função de salvamento para incluir dados do desconto
  - Atualizar carregamento de propostas para restaurar desconto aplicado
  - _Requirements: 1.1, 1.2, 1.4, 2.1, 2.2, 2.3, 3.5, 4.3_

- [x] 8. Atualizar componente ProposalViewer para exibir desconto de diretor
  - Modificar ProposalViewer para mostrar informações do desconto de diretor
  - Adicionar seção específica para desconto de diretoria
  - Exibir valor original e valor com desconto aplicado
  - Mostrar detalhes do desconto (quem aplicou, quando, motivo)
  - _Requirements: 2.4, 4.2, 4.3_

- [x] 9. Atualizar API de propostas para suportar desconto de diretor
  - Modificar endpoint PUT /api/proposals/[id] para salvar dados do desconto
  - Atualizar endpoint GET /api/proposals para retornar dados do desconto
  - Adicionar validação no backend para dados do desconto de diretor
  - Testar persistência e recuperação dos dados do desconto
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 10. Criar testes de integração para funcionalidade completa
  - Escrever testes para verificar renderização condicional em todas as calculadoras
  - Testar fluxo completo de aplicação e salvamento do desconto
  - Verificar que usuários não-diretores não têm acesso ao campo
  - Testar carregamento de propostas com desconto aplicado
  - Validar cálculos corretos em diferentes cenários
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_