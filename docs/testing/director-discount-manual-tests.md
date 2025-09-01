# Testes Manuais - Desconto de Diretor

Este documento descreve os testes manuais que devem ser executados para validar a funcionalidade de desconto de diretor em todas as calculadoras.

## Pré-requisitos

1. Usuário com role 'diretor' logado no sistema
2. Banco de dados com a coluna `director_discount` adicionada à tabela `proposals`
3. Aplicação rodando em ambiente de desenvolvimento ou teste

## Testes por Calculadora

### 1. PABXSIPCalculator

#### Teste 1.1: Renderização do Componente
- [ ] Fazer login como diretor
- [ ] Navegar para a calculadora PABX SIP
- [ ] Verificar se o componente "Desconto de Diretor" aparece na aba de calculadora
- [ ] Verificar se o componente NÃO aparece para usuários não-diretores

#### Teste 1.2: Aplicação de Desconto
- [ ] Adicionar um produto à proposta
- [ ] Preencher percentual de desconto (ex: 15%)
- [ ] Preencher motivo do desconto
- [ ] Clicar em "Aplicar Desconto"
- [ ] Verificar se o total é recalculado corretamente
- [ ] Verificar se aparece "Total com Desconto de Diretor"

#### Teste 1.3: Desconto Alto (>100%)
- [ ] Tentar aplicar desconto de 150%
- [ ] Verificar se aparece diálogo de confirmação
- [ ] Confirmar aplicação
- [ ] Verificar se o desconto é aplicado corretamente

#### Teste 1.4: Seção de Vendedor Read-Only
- [ ] Navegar para aba "Rodadas de Negociação"
- [ ] Verificar se a seção de vendedor está marcada como "(Somente leitura)"
- [ ] Verificar se os campos estão desabilitados
- [ ] Verificar se o botão de aplicar desconto não aparece

### 2. RadioInternetCalculator

#### Teste 2.1: Funcionalidade Básica
- [ ] Repetir testes 1.1 a 1.4 para RadioInternetCalculator
- [ ] Verificar se o desconto é aplicado corretamente aos produtos de rádio

#### Teste 2.2: Persistência
- [ ] Aplicar desconto de diretor
- [ ] Salvar proposta
- [ ] Recarregar a página
- [ ] Editar a proposta salva
- [ ] Verificar se o desconto foi carregado corretamente

### 3. FiberLinkCalculator

#### Teste 3.1: Funcionalidade Básica
- [ ] Repetir testes 1.1 a 1.4 para FiberLinkCalculator
- [ ] Verificar se o desconto é aplicado corretamente aos produtos de fibra

### 4. DoubleRadioFibraCalculator

#### Teste 4.1: Funcionalidade Básica
- [ ] Repetir testes 1.1 a 1.4 para DoubleRadioFibraCalculator
- [ ] Verificar se o desconto é aplicado corretamente aos produtos double

### 5. MaquinasVirtuaisCalculator

#### Teste 5.1: Funcionalidade Básica
- [ ] Repetir testes 1.1 a 1.4 para MaquinasVirtuaisCalculator
- [ ] Verificar se o desconto é aplicado corretamente aos produtos de VM

#### Teste 5.2: Aba de Negociações
- [ ] Navegar para aba "Rodadas de Negociação"
- [ ] Verificar se aparece seção "Desconto de Diretor"
- [ ] Aplicar desconto
- [ ] Verificar se aparece no "Resumo dos Descontos Aplicados"

## Testes de Integração

### 6. ProposalViewer

#### Teste 6.1: Visualização de Desconto
- [ ] Criar proposta com desconto de diretor
- [ ] Salvar proposta
- [ ] Visualizar proposta usando ProposalViewer
- [ ] Verificar se aparece seção "Desconto de Diretoria"
- [ ] Verificar se todos os dados do desconto estão corretos:
  - [ ] Percentual
  - [ ] Aplicado por
  - [ ] Data de aplicação
  - [ ] Motivo
  - [ ] Valor original (riscado)
  - [ ] Valor com desconto

#### Teste 6.2: Impressão
- [ ] Clicar em "Imprimir" na proposta com desconto
- [ ] Verificar se o desconto aparece corretamente na versão impressa
- [ ] Verificar se os estilos estão aplicados corretamente

### 7. API de Propostas

#### Teste 7.1: Salvamento
- [ ] Aplicar desconto de diretor em uma proposta
- [ ] Salvar proposta
- [ ] Verificar no banco de dados se o campo `director_discount` foi salvo corretamente
- [ ] Verificar se o JSON contém todos os campos obrigatórios

#### Teste 7.2: Carregamento
- [ ] Editar proposta salva com desconto
- [ ] Verificar se o desconto é carregado corretamente
- [ ] Verificar se todos os campos são preenchidos

#### Teste 7.3: Atualização
- [ ] Modificar desconto existente
- [ ] Salvar alterações
- [ ] Verificar se as alterações foram persistidas

#### Teste 7.4: Remoção
- [ ] Remover desconto de proposta existente
- [ ] Salvar alterações
- [ ] Verificar se o campo `director_discount` foi definido como NULL

## Testes de Validação

### 8. Validações de Entrada

#### Teste 8.1: Campos Obrigatórios
- [ ] Tentar aplicar desconto sem preencher percentual
- [ ] Verificar se não permite aplicação
- [ ] Tentar aplicar desconto sem preencher motivo
- [ ] Verificar se não permite aplicação

#### Teste 8.2: Valores Inválidos
- [ ] Tentar aplicar desconto negativo
- [ ] Verificar se não permite ou trata adequadamente
- [ ] Tentar aplicar desconto com caracteres não numéricos
- [ ] Verificar se não permite ou trata adequadamente

### 9. Cálculos

#### Teste 9.1: Precisão dos Cálculos
- [ ] Aplicar desconto de 15% em valor de R$ 1.000,00
- [ ] Verificar se resultado é R$ 850,00
- [ ] Aplicar desconto de 12,5% em valor de R$ 1.234,56
- [ ] Verificar se resultado é R$ 1.080,24

#### Teste 9.2: Valores Decimais
- [ ] Testar com valores que resultam em decimais
- [ ] Verificar se arredondamento está correto
- [ ] Verificar se formatação de moeda está correta

## Testes de Permissão

### 10. Controle de Acesso

#### Teste 10.1: Usuário Não-Diretor
- [ ] Fazer login como 'user' ou 'admin'
- [ ] Verificar se componente DirectorDiscount NÃO aparece
- [ ] Verificar se seção de vendedor está habilitada

#### Teste 10.2: Usuário Não Logado
- [ ] Tentar acessar calculadoras sem login
- [ ] Verificar se redirecionamento funciona corretamente

## Testes de Performance

### 11. Performance

#### Teste 11.1: Carregamento
- [ ] Medir tempo de carregamento das calculadoras
- [ ] Verificar se adição do desconto não impacta performance significativamente

#### Teste 11.2: Responsividade
- [ ] Testar em diferentes tamanhos de tela
- [ ] Verificar se componente DirectorDiscount é responsivo
- [ ] Testar em dispositivos móveis

## Critérios de Aceitação

Para que a funcionalidade seja considerada aprovada, todos os testes acima devem passar com sucesso. Especificamente:

1. ✅ Componente DirectorDiscount renderiza apenas para diretores
2. ✅ Desconto é aplicado corretamente em todas as calculadoras
3. ✅ Seção de vendedor fica read-only para diretores
4. ✅ Dados são persistidos corretamente no banco
5. ✅ ProposalViewer exibe desconto corretamente
6. ✅ Validações funcionam adequadamente
7. ✅ Cálculos estão precisos
8. ✅ Controle de acesso funciona corretamente

## Relatório de Bugs

Use o template abaixo para reportar bugs encontrados:

```
**Título:** [Breve descrição do bug]

**Descrição:** [Descrição detalhada do problema]

**Passos para Reproduzir:**
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

**Resultado Esperado:** [O que deveria acontecer]

**Resultado Atual:** [O que realmente acontece]

**Ambiente:** [Navegador, versão, sistema operacional]

**Severidade:** [Baixa/Média/Alta/Crítica]

**Screenshots:** [Se aplicável]
```