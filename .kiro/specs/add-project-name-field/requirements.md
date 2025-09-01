# Requirements Document

## Introduction

Esta funcionalidade visa padronizar todas as calculadoras do sistema para incluir um campo obrigatório de "Nome do Projeto" nos formulários de dados do cliente. Atualmente, algumas calculadoras já possuem este campo através do `ClientManagerForm`, mas outras calculadoras como `VMCalculator.tsx` ainda não implementaram esta funcionalidade.

## Requirements

### Requirement 1

**User Story:** Como um usuário do sistema, eu quero que todas as calculadoras tenham um campo obrigatório de "Nome do Projeto" no formulário de dados do cliente, para que eu possa identificar e organizar melhor minhas propostas por projeto.

#### Acceptance Criteria

1. WHEN o usuário acessa qualquer calculadora THEN o sistema SHALL exibir um formulário de dados do cliente que inclui o campo "Nome do Projeto"
2. WHEN o usuário tenta continuar sem preencher o campo "Nome do Projeto" THEN o sistema SHALL exibir uma mensagem de erro indicando que o campo é obrigatório
3. WHEN o usuário preenche o campo "Nome do Projeto" THEN o sistema SHALL salvar esta informação junto com os dados da proposta
4. WHEN o usuário visualiza uma proposta salva THEN o sistema SHALL exibir o nome do projeto associado à proposta

### Requirement 2

**User Story:** Como desenvolvedor, eu quero que todas as calculadoras utilizem o componente `ClientManagerForm` padronizado, para que haja consistência na interface e funcionalidade entre todas as calculadoras.

#### Acceptance Criteria

1. WHEN uma calculadora é carregada THEN o sistema SHALL utilizar o componente `ClientManagerForm` para coleta de dados do cliente
2. WHEN o `ClientManagerForm` é renderizado THEN o sistema SHALL incluir todos os campos padrão: nome do cliente, nome do projeto, email, telefone
3. WHEN os dados são salvos THEN o sistema SHALL incluir o campo `projectName` na interface `ClientData`
4. WHEN uma calculadora existente é migrada THEN o sistema SHALL manter a compatibilidade com propostas existentes

### Requirement 3

**User Story:** Como usuário, eu quero que o campo "Nome do Projeto" seja validado adequadamente, para que eu não possa criar propostas sem esta informação essencial.

#### Acceptance Criteria

1. WHEN o usuário deixa o campo "Nome do Projeto" vazio THEN o sistema SHALL marcar o campo como inválido visualmente
2. WHEN o usuário tenta submeter o formulário com campo vazio THEN o sistema SHALL impedir o envio e exibir mensagem de erro
3. WHEN o usuário preenche o campo corretamente THEN o sistema SHALL remover qualquer indicação de erro
4. WHEN o formulário é validado THEN o sistema SHALL verificar que o campo não contém apenas espaços em branco