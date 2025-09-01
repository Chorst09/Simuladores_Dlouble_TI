# Requirements Document

## Introduction

Este documento define os requisitos para replicar todas as funcionalidades implementadas no MaquinasVirtuaisCalculator para os demais calculadores do sistema: PABXSIPCalculator, FiberLinkCalculator, RadioInternetCalculator e DoubleRadioFibraCalculator. As funcionalidades incluem correção de erros de API, botões de ação (Editar/Deletar), rodadas de negociação com descontos e visualização de propostas em formato PDF.

## Requirements

### Requirement 1

**User Story:** Como usuário do sistema, eu quero que todos os calculadores tenham a mesma funcionalidade de salvamento de propostas sem erros de API, para que eu possa salvar propostas consistentemente em qualquer calculador.

#### Acceptance Criteria

1. WHEN o usuário salva uma proposta em qualquer calculador THEN o sistema SHALL salvar os dados do cliente e gerente de conta corretamente
2. WHEN ocorre um erro na API THEN o sistema SHALL exibir uma mensagem de erro clara e específica
3. IF os dados do cliente ou gerente de conta estão ausentes THEN o sistema SHALL validar e solicitar os dados obrigatórios
4. WHEN a proposta é salva com sucesso THEN o sistema SHALL exibir uma mensagem de confirmação

### Requirement 2

**User Story:** Como usuário do sistema, eu quero ter botões de Editar e Deletar em todas as tabelas de propostas dos calculadores, para que eu possa gerenciar propostas de forma consistente.

#### Acceptance Criteria

1. WHEN o usuário visualiza a tabela de propostas THEN o sistema SHALL exibir botões de Editar e Deletar para cada proposta
2. WHEN o usuário clica no botão Editar THEN o sistema SHALL navegar para a funcionalidade de rodadas de negociação
3. WHEN o usuário clica no botão Deletar THEN o sistema SHALL exibir um modal de confirmação
4. WHEN o usuário confirma a exclusão THEN o sistema SHALL deletar a proposta e atualizar a tabela
5. IF a exclusão falha THEN o sistema SHALL exibir uma mensagem de erro apropriada

### Requirement 3

**User Story:** Como usuário do sistema, eu quero ter funcionalidade de rodadas de negociação com aplicação de descontos em todos os calculadores, para que eu possa negociar propostas de forma padronizada.

#### Acceptance Criteria

1. WHEN o usuário acessa as rodadas de negociação THEN o sistema SHALL exibir o valor inicial da proposta
2. WHEN o usuário aplica um desconto THEN o sistema SHALL calcular e exibir o novo valor
3. WHEN o usuário salva uma rodada de negociação THEN o sistema SHALL armazenar o histórico de descontos
4. WHEN o usuário visualiza o histórico THEN o sistema SHALL mostrar todas as rodadas anteriores
5. IF o desconto é inválido THEN o sistema SHALL exibir uma mensagem de erro de validação

### Requirement 4

**User Story:** Como usuário do sistema, eu quero ter um botão de Visualizar Proposta em todos os calculadores, para que eu possa ver uma prévia formatada em PDF de qualquer proposta.

#### Acceptance Criteria

1. WHEN o usuário clica no botão Visualizar Proposta THEN o sistema SHALL abrir um modal com a proposta formatada
2. WHEN a proposta é exibida THEN o sistema SHALL mostrar todos os detalhes em formato profissional
3. WHEN o usuário quer imprimir THEN o sistema SHALL permitir impressão da proposta
4. WHEN o usuário fecha o modal THEN o sistema SHALL retornar à tabela de propostas
5. IF a proposta não pode ser carregada THEN o sistema SHALL exibir uma mensagem de erro

### Requirement 5

**User Story:** Como desenvolvedor do sistema, eu quero que todos os calculadores tenham a mesma estrutura de dados e interfaces, para que a manutenção seja consistente e eficiente.

#### Acceptance Criteria

1. WHEN um calculador é atualizado THEN o sistema SHALL usar as mesmas interfaces TypeScript
2. WHEN dados são enviados para a API THEN o sistema SHALL usar a mesma estrutura de dados
3. WHEN erros ocorrem THEN o sistema SHALL usar o mesmo padrão de tratamento de erros
4. WHEN componentes são reutilizados THEN o sistema SHALL manter a mesma estrutura de props e estados