# Requirements Document

## Introduction

Esta funcionalidade implementa um sistema de desconto personalizado exclusivo para usuários com função DIRETOR. O desconto permite que a diretoria aplique valores customizados conforme suas decisões estratégicas, proporcionando flexibilidade na precificação final das propostas em todas as calculadoras do sistema.

## Requirements

### Requirement 1

**User Story:** Como diretor, eu quero aplicar descontos personalizados nas propostas, para que eu possa ajustar os preços conforme decisões estratégicas da diretoria.

#### Acceptance Criteria

1. WHEN um usuário com função DIRETOR acessa qualquer calculadora THEN o sistema SHALL exibir um campo de desconto personalizado
2. WHEN um usuário sem função DIRETOR acessa as calculadoras THEN o sistema SHALL NOT exibir o campo de desconto personalizado
3. WHEN o diretor insere um valor de desconto THEN o sistema SHALL aplicar o desconto ao valor total da proposta
4. WHEN o desconto é aplicado THEN o sistema SHALL recalcular automaticamente o valor final
5. WHEN o desconto é maior que 100% THEN o sistema SHALL exibir uma mensagem de validação

### Requirement 2

**User Story:** Como diretor, eu quero que o desconto seja salvo junto com a proposta, para que eu possa manter o histórico das decisões de precificação.

#### Acceptance Criteria

1. WHEN uma proposta com desconto de diretor é salva THEN o sistema SHALL armazenar o valor do desconto aplicado
2. WHEN uma proposta salva é carregada THEN o sistema SHALL exibir o desconto de diretor aplicado anteriormente
3. WHEN o desconto é modificado em uma proposta existente THEN o sistema SHALL atualizar o valor armazenado
4. WHEN a proposta é visualizada THEN o sistema SHALL mostrar claramente o desconto de diretor aplicado

### Requirement 3

**User Story:** Como diretor, eu quero que o desconto seja aplicado de forma consistente em todas as calculadoras, para que eu tenha a mesma funcionalidade independente do tipo de serviço.

#### Acceptance Criteria

1. WHEN o diretor acessa o RadioInternetCalculator THEN o sistema SHALL exibir o campo de desconto personalizado
2. WHEN o diretor acessa o FiberLinkCalculator THEN o sistema SHALL exibir o campo de desconto personalizado
3. WHEN o diretor acessa o DoubleRadioFibraCalculator THEN o sistema SHALL exibir o campo de desconto personalizado
4. WHEN o diretor acessa o PABXSIPCalculator THEN o sistema SHALL exibir o campo de desconto personalizado
5. WHEN o diretor acessa o MaquinasVirtuaisCalculator THEN o sistema SHALL exibir o campo de desconto personalizado
6. WHEN o desconto é aplicado em qualquer calculadora THEN o sistema SHALL usar a mesma lógica de cálculo

### Requirement 4

**User Story:** Como diretor, eu quero que o desconto seja claramente identificado na interface, para que eu possa distingui-lo de outros tipos de desconto.

#### Acceptance Criteria

1. WHEN o campo de desconto é exibido THEN o sistema SHALL identificá-lo claramente como "Desconto Diretoria"
2. WHEN o desconto é aplicado THEN o sistema SHALL mostrar o valor original e o valor com desconto
3. WHEN a proposta é impressa ou exportada THEN o sistema SHALL incluir informações sobre o desconto de diretoria
4. WHEN o desconto está ativo THEN o sistema SHALL destacar visualmente a aplicação do desconto

### Requirement 5

**User Story:** Como sistema, eu preciso validar os valores de desconto inseridos, para que não sejam aplicados valores inválidos que possam comprometer a integridade dos cálculos.

#### Acceptance Criteria

1. WHEN o diretor insere um valor negativo THEN o sistema SHALL exibir mensagem de erro e não aplicar o desconto
2. WHEN o diretor insere um valor não numérico THEN o sistema SHALL exibir mensagem de erro
3. WHEN o diretor insere um valor maior que 100% THEN o sistema SHALL solicitar confirmação antes de aplicar
4. WHEN o campo está vazio THEN o sistema SHALL considerar desconto zero
5. WHEN o valor é válido THEN o sistema SHALL aplicar o desconto imediatamente