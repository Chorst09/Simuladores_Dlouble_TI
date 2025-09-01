# Implementation Plan - Nova Proposta PABX/SIP

## Task Overview
Implementar funcionalidade de "Nova Proposta" no calculador PABX/SIP com formulário modal para coleta de dados do cliente e gerente de contas.

- [x] 1. Criar interfaces e tipos TypeScript
  - Definir interface PropostaData com estrutura completa
  - Criar tipos para validação de formulário
  - Definir props dos componentes
  - _Requirements: 1.1, 2.1, 3.1_

- [x] 2. Implementar componente NovaPropostaModal
  - Criar estrutura básica do modal
  - Implementar layout responsivo com duas seções
  - Adicionar estilos seguindo design fornecido
  - Configurar abertura/fechamento do modal
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 6.1_

- [x] 3. Criar formulário de dados do cliente
  - Implementar campos: Nome do Cliente, Nome do Projeto, Email, Telefone
  - Adicionar validação em tempo real
  - Configurar placeholders e labels apropriados
  - Implementar marcação de campos obrigatórios
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 4. Criar formulário de dados do gerente
  - Implementar campos: Nome do Gerente, Email, Telefone
  - Adicionar validação de email e telefone
  - Configurar placeholders e labels apropriados
  - Implementar marcação de campos obrigatórios
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 5. Implementar sistema de validação
  - Criar funções de validação para email e telefone
  - Implementar validação de campos obrigatórios
  - Adicionar mensagens de erro em português
  - Configurar validação em tempo real e on-blur
  - _Requirements: 2.6, 2.7, 3.5, 3.6, 4.7_

- [x] 6. Adicionar botões de navegação
  - Implementar botão "Voltar" com funcionalidade de cancelar
  - Implementar botão "Continuar para Calculadora"
  - Adicionar validação antes de prosseguir
  - Configurar estados de loading e disabled
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 7. Integrar modal ao PABXSIPCalculator
  - Adicionar botão "Nova Proposta" ao calculador
  - Implementar gerenciamento de estado do modal
  - Configurar fluxo de dados entre modal e calculadora
  - Adicionar context ou state management para dados da proposta
  - _Requirements: 1.1, 1.2, 5.1, 5.2_

- [x] 8. Implementar persistência de dados
  - Salvar dados da proposta no estado da aplicação
  - Manter dados durante navegação na calculadora
  - Exibir informações do cliente/projeto na interface
  - Preparar dados para uso em relatórios
  - _Requirements: 4.5, 4.6, 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 9. Adicionar responsividade e acessibilidade
  - Implementar layout responsivo para mobile/tablet
  - Adicionar navegação por teclado
  - Configurar ARIA labels e roles
  - Implementar foco adequado no modal
  - Testar compatibilidade com screen readers
  - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 10. Implementar tratamento de erros
  - Adicionar exibição de erros próxima aos campos
  - Implementar feedback visual para campos inválidos
  - Configurar mensagens de erro específicas
  - Adicionar estados de erro para o formulário completo
  - _Requirements: 4.7, 6.5_

- [ ] 11. Criar testes unitários
  - Testar componente NovaPropostaModal
  - Testar validação de formulários
  - Testar integração com PABXSIPCalculator
  - Testar fluxo de dados e navegação
  - _Requirements: Todos os requisitos_

- [ ] 12. Implementar testes de integração
  - Testar fluxo completo de nova proposta
  - Testar persistência de dados entre componentes
  - Testar comportamento responsivo
  - Testar acessibilidade e navegação por teclado
  - _Requirements: Todos os requisitos_

## Implementation Notes

### Ordem de Desenvolvimento
1. **Fase 1**: Estrutura base (tasks 1-2)
2. **Fase 2**: Formulários e validação (tasks 3-5)
3. **Fase 3**: Navegação e integração (tasks 6-8)
4. **Fase 4**: UX e acessibilidade (tasks 9-10)
5. **Fase 5**: Testes (tasks 11-12)

### Dependências
- Task 2 depende de Task 1
- Tasks 3-4 dependem de Task 2
- Task 5 depende de Tasks 3-4
- Tasks 6-7 dependem de Tasks 1-5
- Task 8 depende de Task 7
- Tasks 9-10 podem ser desenvolvidas em paralelo
- Tasks 11-12 dependem de todas as anteriores

### Considerações Técnicas
- Usar React Hook Form para gerenciamento de formulário
- Implementar modal com portal para melhor controle de z-index
- Usar CSS Modules ou styled-components para estilos
- Implementar debounce para validação em tempo real
- Considerar lazy loading do componente modal

### Critérios de Aceitação
- Modal abre/fecha corretamente
- Todos os campos funcionam conforme especificado
- Validação funciona em tempo real
- Dados persistem corretamente na calculadora
- Interface é responsiva e acessível
- Testes cobrem cenários principais