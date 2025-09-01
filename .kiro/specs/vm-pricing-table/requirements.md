# Requirements Document

## Introduction

O componente MaquinasVirtuaisCalculator precisa de uma aba específica "Tabela de Preços" para manter consistência com os outros componentes calculadores (FiberLinkCalculator e InternetMANCalculator). Atualmente, o componente só tem "Configurações/Lista de Preços" que mistura configurações gerais com tabelas de preços, enquanto os outros componentes têm abas separadas.

## Requirements

### Requirement 1

**User Story:** Como um administrador, eu quero ter uma aba específica "Tabela de Preços" no MaquinasVirtuaisCalculator, para que eu possa visualizar e editar as tabelas de preços de forma consistente com os outros calculadores.

#### Acceptance Criteria

1. WHEN o usuário for admin ou diretor THEN deve aparecer uma aba "Tabela de Preços" no MaquinasVirtuaisCalculator
2. WHEN o usuário clicar na aba "Tabela de Preços" THEN deve mostrar tabelas editáveis com os preços dos recursos de VM
3. WHEN o usuário editar os preços THEN deve poder salvar as alterações
4. WHEN o usuário salvar THEN deve mostrar uma mensagem de confirmação

### Requirement 2

**User Story:** Como um administrador, eu quero visualizar tabelas de preços organizadas por categoria de recursos, para que eu possa facilmente encontrar e editar os preços específicos.

#### Acceptance Criteria

1. WHEN o usuário acessar a aba "Tabela de Preços" THEN deve ver tabelas separadas por categoria:
   - vCPU (Windows e Linux)
   - RAM
   - Armazenamento (HDD SAS, SSD Performance, NVMe)
   - Rede (1 Gbps, 10 Gbps)
   - Sistemas Operacionais
   - Serviços Adicionais (Backup, IP Adicional, Snapshot, VPN)
2. WHEN o usuário visualizar cada tabela THEN deve ver campos editáveis para os preços
3. WHEN o usuário editar um preço THEN deve aceitar valores decimais

### Requirement 3

**User Story:** Como um administrador, eu quero que a tabela de comissões seja movida da aba "Configurações" para a aba "Tabela de Preços", para que todas as tabelas de preços fiquem organizadas em um local específico.

#### Acceptance Criteria

1. WHEN o usuário acessar a aba "Tabela de Preços" THEN deve ver a tabela de comissões por período
2. WHEN o usuário acessar a aba "Configurações" THEN a tabela de comissões NÃO deve aparecer mais lá
3. WHEN o usuário editar as comissões na nova localização THEN deve funcionar igual a antes
4. WHEN o usuário salvar THEN deve salvar todas as tabelas de preços juntas

### Requirement 4

**User Story:** Como um usuário, eu quero que a interface seja consistente entre todos os calculadores, para que eu tenha uma experiência uniforme ao usar diferentes tipos de calculadoras.

#### Acceptance Criteria

1. WHEN o usuário comparar as abas do MaquinasVirtuaisCalculator com outros calculadores THEN deve ver a mesma estrutura de abas
2. WHEN o usuário acessar a aba "Tabela de Preços" THEN deve ter o mesmo design visual dos outros componentes
3. WHEN o usuário interagir com as tabelas THEN deve ter a mesma experiência de usuário
4. WHEN o usuário salvar THEN deve ter o mesmo feedback visual dos outros componentes