# Requirements Document

## Introduction

Esta funcionalidade adiciona suporte aos planos PABX Premium no calculador PABX/SIP, permitindo que os usuários selecionem entre diferentes modalidades de planos (Standard e Premium) e, quando Premium for selecionado, escolham entre os planos Essencial e Professional, cada um com opções ilimitado e tarifado.

## Requirements

### Requirement 1

**User Story:** Como um usuário do calculador PABX/SIP, eu quero selecionar entre modalidades PABX Standard e PABX Premium, para que eu possa escolher o tipo de plano mais adequado às minhas necessidades.

#### Acceptance Criteria

1. WHEN o usuário acessa o calculador PABX/SIP THEN o sistema SHALL exibir opções de modalidade: "PABX Standard" e "PABX Premium"
2. WHEN o usuário seleciona "PABX Standard" THEN o sistema SHALL carregar os valores da tabela pabx standard em List Price
3. WHEN o usuário seleciona "PABX Premium" THEN o sistema SHALL exibir as opções de planos Premium disponíveis

### Requirement 2

**User Story:** Como um usuário que selecionou PABX Premium, eu quero escolher entre os planos Essencial e Professional, para que eu possa selecionar o nível de serviço apropriado.

#### Acceptance Criteria

1. WHEN o usuário seleciona modalidade "PABX Premium" THEN o sistema SHALL exibir opções de plano: "Essencial" e "Professional"
2. WHEN nenhum plano Premium estiver selecionado THEN o sistema SHALL exibir uma mensagem indicando que é necessário selecionar um plano
3. IF um plano Premium for selecionado THEN o sistema SHALL habilitar as opções de cobrança

### Requirement 3

**User Story:** Como um usuário que selecionou um plano Premium, eu quero escolher entre modalidades ilimitado e tarifado, para que eu possa selecionar o modelo de cobrança mais adequado.

#### Acceptance Criteria

1. WHEN o usuário seleciona um plano Premium (Essencial ou Professional) THEN o sistema SHALL exibir opções de cobrança: "Ilimitado" e "Tarifado"
2. WHEN o usuário seleciona "Ilimitado" THEN o sistema SHALL aplicar preços fixos mensais para o plano selecionado
3. WHEN o usuário seleciona "Tarifado" THEN o sistema SHALL aplicar preços baseados em consumo para o plano selecionado

### Requirement 4

**User Story:** Como um usuário, eu quero que os preços sejam calculados automaticamente baseados na modalidade e plano selecionados, para que eu possa ver os custos corretos imediatamente.

#### Acceptance Criteria

1. WHEN o usuário seleciona PABX Standard THEN o sistema SHALL buscar preços da tabela "pabx standard" em List Price
2. WHEN o usuário seleciona PABX Premium com plano Essencial Ilimitado THEN o sistema SHALL aplicar os preços específicos deste plano
3. WHEN o usuário seleciona PABX Premium com plano Essencial Tarifado THEN o sistema SHALL aplicar os preços específicos deste plano
4. WHEN o usuário seleciona PABX Premium com plano Professional Ilimitado THEN o sistema SHALL aplicar os preços específicos deste plano
5. WHEN o usuário seleciona PABX Premium com plano Professional Tarifado THEN o sistema SHALL aplicar os preços específicos deste plano
6. WHEN qualquer seleção for alterada THEN o sistema SHALL recalcular automaticamente todos os valores

### Requirement 5

**User Story:** Como um usuário, eu quero que a interface seja clara e intuitiva para navegar entre as diferentes opções de modalidade e planos, para que eu possa fazer seleções facilmente.

#### Acceptance Criteria

1. WHEN o usuário visualiza as opções THEN o sistema SHALL apresentar uma hierarquia clara: Modalidade > Plano > Tipo de Cobrança
2. WHEN uma modalidade for selecionada THEN o sistema SHALL destacar visualmente a seleção ativa
3. WHEN opções dependentes não estiverem disponíveis THEN o sistema SHALL desabilitá-las visualmente
4. IF o usuário tentar calcular sem selecionar todas as opções necessárias THEN o sistema SHALL exibir mensagens de validação claras