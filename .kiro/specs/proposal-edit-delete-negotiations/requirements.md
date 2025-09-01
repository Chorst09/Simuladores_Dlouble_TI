# Requirements Document

## Introduction

Esta funcionalidade adiciona capacidades avançadas de gerenciamento de propostas, permitindo que usuários editem propostas existentes, apliquem descontos através de rodadas de negociação, e excluam propostas quando necessário. O sistema deve manter um histórico completo das negociações e alterações realizadas.

## Requirements

### Requirement 1

**User Story:** Como um usuário, eu quero editar uma proposta existente para modificar produtos e aplicar descontos, para que eu possa ajustar a proposta durante o processo de negociação com o cliente.

#### Acceptance Criteria

1. WHEN um usuário clica no botão "Editar" ao lado de uma proposta THEN o sistema SHALL abrir a proposta em modo de edição
2. WHEN a proposta está em modo de edição THEN o sistema SHALL permitir modificar produtos, quantidades e aplicar descontos
3. WHEN o usuário salva as alterações THEN o sistema SHALL criar uma nova rodada de negociação
4. WHEN uma nova rodada é criada THEN o sistema SHALL manter o histórico da rodada anterior

### Requirement 2

**User Story:** Como um usuário, eu quero excluir propostas que não são mais necessárias, para que eu possa manter minha lista de propostas organizada.

#### Acceptance Criteria

1. WHEN um usuário clica no botão "Excluir" ao lado de uma proposta THEN o sistema SHALL solicitar confirmação
2. WHEN o usuário confirma a exclusão THEN o sistema SHALL remover a proposta permanentemente
3. WHEN a exclusão é bem-sucedida THEN o sistema SHALL atualizar a lista de propostas
4. WHEN a exclusão falha THEN o sistema SHALL exibir uma mensagem de erro explicativa

### Requirement 3

**User Story:** Como um usuário, eu quero aplicar descontos em produtos durante a edição da proposta, para que eu possa negociar preços com o cliente.

#### Acceptance Criteria

1. WHEN estou editando uma proposta THEN o sistema SHALL permitir aplicar descontos percentuais ou valores fixos em produtos individuais
2. WHEN um desconto é aplicado THEN o sistema SHALL recalcular automaticamente os totais
3. WHEN salvo a proposta com descontos THEN o sistema SHALL registrar os descontos na rodada de negociação
4. WHEN visualizo o histórico THEN o sistema SHALL mostrar todos os descontos aplicados por rodada

### Requirement 4

**User Story:** Como um usuário, eu quero visualizar o histórico de rodadas de negociação de uma proposta, para que eu possa acompanhar todas as alterações e descontos aplicados.

#### Acceptance Criteria

1. WHEN visualizo uma proposta THEN o sistema SHALL mostrar o número da rodada atual
2. WHEN acesso o histórico de negociações THEN o sistema SHALL listar todas as rodadas com suas alterações
3. WHEN comparo rodadas THEN o sistema SHALL destacar as diferenças entre versões
4. WHEN uma rodada é selecionada THEN o sistema SHALL mostrar os detalhes completos daquela versão

### Requirement 5

**User Story:** Como um desenvolvedor, eu quero que o sistema mantenha integridade dos dados durante edições e exclusões, para que não haja perda de informações importantes.

#### Acceptance Criteria

1. WHEN uma proposta é editada THEN o sistema SHALL validar todos os dados antes de salvar
2. WHEN uma exclusão é solicitada THEN o sistema SHALL verificar se a proposta pode ser excluída
3. WHEN ocorre um erro durante a operação THEN o sistema SHALL reverter todas as alterações
4. WHEN dados são salvos THEN o sistema SHALL manter consistência entre todas as tabelas relacionadas