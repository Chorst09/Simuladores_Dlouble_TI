# Requirements Document

## Introduction

Este documento define os requisitos para atualizar as tabelas de preços do componente PABX/SIP, incluindo a renomeação da tabela existente e a criação de novas tabelas de preços para os planos Essencial e Profissional.

## Requirements

### Requirement 1

**User Story:** Como um administrador do sistema, eu quero que a tabela de preços PABX seja renomeada para "PABX - Standard", para que eu possa distinguir entre diferentes tipos de planos.

#### Acceptance Criteria

1. WHEN o usuário acessa a seção "Lista de Preços" no componente PABX/SIP THEN a tabela atual "PABX" deve aparecer com o nome "PABX - Standard"
2. WHEN o sistema renderiza a tabela THEN o título deve ser exibido como "PABX - Standard" em vez de apenas "PABX"

### Requirement 2

**User Story:** Como um administrador do sistema, eu quero criar uma nova tabela de preços chamada "Plano Essencial" com opções para 24 e 36 meses, para que eu possa oferecer diferentes opções de preços aos clientes.

#### Acceptance Criteria

1. WHEN o usuário acessa a seção "Lista de Preços" THEN deve existir uma nova tabela chamada "Plano Essencial"
2. WHEN a tabela "Plano Essencial" é exibida THEN deve conter duas seções: "24 MESES" e "36 MESES"
3. WHEN a seção "24 MESES" é exibida THEN deve conter:
   - Tabela "ESSENCIAL Ilimitado" com colunas "Valores com Equipamento (Aluguel + Assinatura)" e "Valores sem Equipamento (Assinatura)"
   - Tabela "ESSENCIAL Tarifado" com colunas "Valores com Equipamento (Aluguel + Franquia)" e "Valores sem Equipamento (Assinatura + Franquia)"
4. WHEN a seção "36 MESES" é exibida THEN deve conter:
   - Tabela "ESSENCIAL Ilimitado" com colunas "Valores com Equipamento (Aluguel + Assinatura)" e "Valores sem Equipamento (Assinatura)"
   - Tabela "ESSENCIAL Tarifado" com colunas "Valores com Equipamento (Aluguel + Franquia)" e "Valores sem Equipamento (Assinatura + Franquia)"
5. WHEN as tabelas são exibidas THEN devem conter as seguintes faixas de ramais:
   - 2 a 9 ramais
   - 10 a 19 ramais
   - 20 a 49 ramais
   - 50 a 99 ramais
   - 100 a 199 ramais
   - + de 200 ramais

### Requirement 3

**User Story:** Como um administrador do sistema, eu quero que a tabela "Plano Essencial" contenha os valores específicos conforme definido nas imagens de referência, para que os preços sejam exibidos corretamente.

#### Acceptance Criteria

1. WHEN a tabela "ESSENCIAL Ilimitado - 24 MESES" é exibida THEN deve conter os seguintes valores:
   - 2 a 9 ramais: Com Equipamento R$ 84 (35 + 49), Sem Equipamento R$ 75
   - 10 a 19 ramais: Com Equipamento R$ 65 (35 + 30), Sem Equipamento R$ 57
   - 20 a 49 ramais: Com Equipamento R$ 62 (35 + 27), Sem Equipamento R$ 54
   - 50 a 99 ramais: Com Equipamento R$ 59 (35 + 24), Sem Equipamento R$ 52
   - 100 a 199 ramais: Com Equipamento R$ 55 (35 + 20), Sem Equipamento R$ 48
   - + de 200 ramais: Com Equipamento R$ 52 (35 + 17), Sem Equipamento R$ 45

2. WHEN a tabela "ESSENCIAL Tarifado - 24 MESES" é exibida THEN deve conter os seguintes valores:
   - 2 a 9 ramais: Com Equipamento R$ 59 (35 + 24), Sem Equipamento R$ 44 (20 + 24)
   - 10 a 49 ramais: Com Equipamento R$ 49 (35 + 14), Sem Equipamento R$ 34 (20 + 14)
   - 50 a 99 ramais: Com Equipamento R$ 38 (28 + 10), Sem Equipamento R$ 30 (20 + 10)
   - 100 a 199 ramais: Com Equipamento R$ 34 (25 + 9), Sem Equipamento R$ 27 (18 + 9)
   - + de 200 ramais: Com Equipamento R$ 32 (25 + 7), Sem Equipamento R$ 25 (18 + 7)

3. WHEN a tabela "ESSENCIAL Ilimitado - 36 MESES" é exibida THEN deve conter os seguintes valores:
   - 2 a 9 ramais: Com Equipamento R$ 77 (35 + 42), Sem Equipamento R$ 71
   - 10 a 19 ramais: Com Equipamento R$ 59 (35 + 24), Sem Equipamento R$ 53
   - 20 a 49 ramais: Com Equipamento R$ 55 (35 + 20), Sem Equipamento R$ 48
   - 50 a 99 ramais: Com Equipamento R$ 53 (35 + 18), Sem Equipamento R$ 44
   - 100 a 199 ramais: Com Equipamento R$ 48 (35 + 13), Sem Equipamento R$ 40
   - + de 200 ramais: Com Equipamento R$ 45 (35 + 10), Sem Equipamento R$ 38

4. WHEN a tabela "ESSENCIAL Tarifado - 36 MESES" é exibida THEN deve conter os seguintes valores:
   - 2 a 9 ramais: Com Equipamento R$ 57 (35 + 22), Sem Equipamento R$ 42 (20 + 22)
   - 10 a 49 ramais: Com Equipamento R$ 47 (35 + 12), Sem Equipamento R$ 32 (20 + 12)
   - 50 a 99 ramais: Com Equipamento R$ 36 (28 + 8), Sem Equipamento R$ 28 (20 + 8)
   - 100 a 199 ramais: Com Equipamento R$ 32 (25 + 7), Sem Equipamento R$ 25 (18 + 7)
   - + de 200 ramais: Com Equipamento R$ 30 (25 + 5), Sem Equipamento R$ 23 (18 + 5)

### Requirement 4

**User Story:** Como um administrador do sistema, eu quero criar uma nova tabela de preços chamada "Plano Profissional" com opções para 24 e 36 meses, para que eu possa oferecer planos premium aos clientes.

#### Acceptance Criteria

1. WHEN o usuário acessa a seção "Lista de Preços" THEN deve existir uma nova tabela chamada "Plano Profissional"
2. WHEN a tabela "Plano Profissional" é exibida THEN deve conter duas seções: "24 MESES" e "36 MESES"
3. WHEN as seções são exibidas THEN devem seguir a mesma estrutura do Plano Essencial com tabelas "Ilimitado" e "Tarifado"

### Requirement 5

**User Story:** Como um administrador do sistema, eu quero que a tabela "Plano Profissional" contenha os valores específicos conforme definido nas imagens de referência, para que os preços sejam exibidos corretamente.

#### Acceptance Criteria

1. WHEN a tabela "PROFISSIONAL Ilimitado - 24 MESES" é exibida THEN deve conter os seguintes valores:
   - 2 a 9 ramais: Com Equipamento R$ 104 (35 + 69), Sem Equipamento R$ 95
   - 10 a 19 ramais: Com Equipamento R$ 77 (35 + 42), Sem Equipamento R$ 72
   - 20 a 49 ramais: Com Equipamento R$ 73 (35 + 38), Sem Equipamento R$ 68
   - 50 a 99 ramais: Com Equipamento R$ 69 (35 + 34), Sem Equipamento R$ 66
   - 100 a 199 ramais: Com Equipamento R$ 65 (35 + 30), Sem Equipamento R$ 62
   - + de 200 ramais: Com Equipamento R$ 62 (35 + 27), Sem Equipamento R$ 55

2. WHEN a tabela "PROFISSIONAL Tarifado - 24 MESES" é exibida THEN deve conter os seguintes valores:
   - 2 a 9 ramais: Com Equipamento R$ 79 (35 + 44), Sem Equipamento R$ 64 (20 + 44)
   - 10 a 49 ramais: Com Equipamento R$ 59 (35 + 24), Sem Equipamento R$ 44 (20 + 24)
   - 50 a 99 ramais: Com Equipamento R$ 51 (35 + 16), Sem Equipamento R$ 36 (20 + 16)
   - 100 a 199 ramais: Com Equipamento R$ 39 (25 + 14), Sem Equipamento R$ 32 (18 + 14)
   - + de 200 ramais: Com Equipamento R$ 35 (25 + 10), Sem Equipamento R$ 28 (18 + 10)

3. WHEN a tabela "PROFISSIONAL Ilimitado - 36 MESES" é exibida THEN deve conter os seguintes valores:
   - 2 a 9 ramais: Com Equipamento R$ 97 (35 + 62), Sem Equipamento R$ 91
   - 10 a 19 ramais: Com Equipamento R$ 73 (35 + 38), Sem Equipamento R$ 69
   - 20 a 49 ramais: Com Equipamento R$ 69 (35 + 34), Sem Equipamento R$ 66
   - 50 a 99 ramais: Com Equipamento R$ 65 (35 + 30), Sem Equipamento R$ 63
   - 100 a 199 ramais: Com Equipamento R$ 60 (35 + 25), Sem Equipamento R$ 59
   - + de 200 ramais: Com Equipamento R$ 57 (35 + 22), Sem Equipamento R$ 52

4. WHEN a tabela "PROFISSIONAL Tarifado - 36 MESES" é exibida THEN deve conter os seguintes valores:
   - 2 a 9 ramais: Com Equipamento R$ 75 (35 + 40), Sem Equipamento R$ 60 (20 + 40)
   - 10 a 49 ramais: Com Equipamento R$ 57 (35 + 22), Sem Equipamento R$ 42 (20 + 22)
   - 50 a 99 ramais: Com Equipamento R$ 49 (35 + 14), Sem Equipamento R$ 34 (20 + 14)
   - 100 a 199 ramais: Com Equipamento R$ 37 (25 + 12), Sem Equipamento R$ 30 (18 + 12)
   - + de 200 ramais: Com Equipamento R$ 33 (25 + 8), Sem Equipamento R$ 26 (18 + 8)

### Requirement 6

**User Story:** Como um usuário do sistema, eu quero que as tabelas de preços sejam exibidas de forma organizada e visualmente consistente, para que eu possa facilmente comparar os diferentes planos e preços.

#### Acceptance Criteria

1. WHEN as tabelas são exibidas THEN devem seguir o mesmo padrão visual das tabelas existentes
2. WHEN as tabelas são exibidas THEN devem ter cores de cabeçalho consistentes (azul para os títulos dos períodos)
3. WHEN as tabelas são exibidas THEN devem mostrar claramente a decomposição dos valores (aluguel + assinatura/franquia)
4. WHEN as tabelas são exibidas THEN devem ser responsivas e funcionar em diferentes tamanhos de tela
5. WHEN o usuário visualiza as tabelas THEN deve ser possível editar os valores se tiver permissões de administrador