# Requirements Document

## Introduction

Esta funcionalidade implementará um sistema de "Nova Proposta" no calculador PABX/SIP que permitirá aos usuários preencher dados do cliente e dados do gerente de contas antes de prosseguir para a calculadora. O sistema deve apresentar um formulário estruturado em duas seções principais, seguindo o design mostrado na referência visual.

## Requirements

### Requirement 1

**User Story:** Como um usuário do sistema PABX/SIP, eu quero clicar em "Nova Proposta" para abrir um formulário de dados, para que eu possa registrar informações do cliente e gerente antes de fazer cálculos.

#### Acceptance Criteria

1. WHEN o usuário acessa o calculador PABX/SIP THEN o sistema SHALL exibir um botão ou opção "Nova Proposta"
2. WHEN o usuário clica em "Nova Proposta" THEN o sistema SHALL abrir um formulário modal ou página dedicada
3. WHEN o formulário é aberto THEN o sistema SHALL exibir o título "Nova Proposta" 
4. WHEN o formulário é aberto THEN o sistema SHALL exibir o subtítulo "Preencha os dados do cliente e gerente de contas"
5. WHEN o formulário é exibido THEN o sistema SHALL organizar os campos em duas seções distintas

### Requirement 2

**User Story:** Como um usuário preenchendo uma nova proposta, eu quero inserir dados do cliente, para que as informações do cliente sejam registradas na proposta.

#### Acceptance Criteria

1. WHEN o formulário é exibido THEN o sistema SHALL mostrar uma seção "Dados do Cliente"
2. WHEN na seção de dados do cliente THEN o sistema SHALL exibir campo "Nome do Cliente" como obrigatório
3. WHEN na seção de dados do cliente THEN o sistema SHALL exibir campo "Nome do Projeto" como obrigatório
4. WHEN na seção de dados do cliente THEN o sistema SHALL exibir campo "Email do Cliente" como obrigatório
5. WHEN na seção de dados do cliente THEN o sistema SHALL exibir campo "Telefone do Cliente" como opcional
6. WHEN o usuário preenche os campos THEN o sistema SHALL validar formato de email
7. WHEN o usuário preenche telefone THEN o sistema SHALL aceitar formato brasileiro de telefone

### Requirement 3

**User Story:** Como um usuário preenchendo uma nova proposta, eu quero inserir dados do gerente de contas, para que as informações do responsável pela venda sejam registradas.

#### Acceptance Criteria

1. WHEN o formulário é exibido THEN o sistema SHALL mostrar uma seção "Dados do Gerente de Contas"
2. WHEN na seção de gerente THEN o sistema SHALL exibir campo "Nome do Gerente" como obrigatório
3. WHEN na seção de gerente THEN o sistema SHALL exibir campo "Email do Gerente" como obrigatório  
4. WHEN na seção de gerente THEN o sistema SHALL exibir campo "Telefone do Gerente" como opcional
5. WHEN o usuário preenche email do gerente THEN o sistema SHALL validar formato de email
6. WHEN o usuário preenche telefone do gerente THEN o sistema SHALL aceitar formato brasileiro de telefone

### Requirement 4

**User Story:** Como um usuário que preencheu os dados da proposta, eu quero navegar para a calculadora, para que eu possa prosseguir com os cálculos usando os dados inseridos.

#### Acceptance Criteria

1. WHEN o formulário é exibido THEN o sistema SHALL mostrar um botão "Voltar" no canto inferior esquerdo
2. WHEN o formulário é exibido THEN o sistema SHALL mostrar um botão "Continuar para Calculadora" no canto inferior direito
3. WHEN o usuário clica em "Voltar" THEN o sistema SHALL retornar à tela anterior sem salvar dados
4. WHEN o usuário clica em "Continuar para Calculadora" THEN o sistema SHALL validar todos os campos obrigatórios
5. WHEN a validação é bem-sucedida THEN o sistema SHALL salvar os dados da proposta
6. WHEN os dados são salvos THEN o sistema SHALL navegar para a calculadora PABX/SIP
7. WHEN há erros de validação THEN o sistema SHALL exibir mensagens de erro específicas para cada campo

### Requirement 5

**User Story:** Como um usuário do sistema, eu quero que os dados da proposta sejam mantidos durante o uso da calculadora, para que as informações preenchidas sejam utilizadas nos cálculos e relatórios.

#### Acceptance Criteria

1. WHEN o usuário prossegue para a calculadora THEN o sistema SHALL manter os dados da proposta em memória
2. WHEN a calculadora é carregada THEN o sistema SHALL exibir os dados do cliente e gerente em local apropriado
3. WHEN cálculos são realizados THEN o sistema SHALL associar os resultados aos dados da proposta
4. WHEN relatórios são gerados THEN o sistema SHALL incluir dados do cliente e gerente
5. WHEN o usuário navega entre seções THEN o sistema SHALL preservar os dados da proposta

### Requirement 6

**User Story:** Como um usuário do sistema, eu quero que a interface do formulário seja intuitiva e responsiva, para que eu possa preencher dados facilmente em qualquer dispositivo.

#### Acceptance Criteria

1. WHEN o formulário é exibido THEN o sistema SHALL usar design consistente com o resto da aplicação
2. WHEN campos são focalizados THEN o sistema SHALL destacar visualmente o campo ativo
3. WHEN há placeholders THEN o sistema SHALL exibir exemplos apropriados para cada campo
4. WHEN o formulário é acessado em mobile THEN o sistema SHALL adaptar o layout para telas menores
5. WHEN há erros THEN o sistema SHALL exibir mensagens de erro próximas aos campos relevantes
6. WHEN o usuário navega por teclado THEN o sistema SHALL permitir navegação sequencial entre campos