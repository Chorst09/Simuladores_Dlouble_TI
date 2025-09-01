# Implementation Plan

- [x] 1. Preparar estrutura de dados para os novos planos
  - Criar interfaces TypeScript para PricingPlan, PricingTable e PricingRow
  - Definir dados completos para o Plano Essencial (24 e 36 meses)
  - Definir dados completos para o Plano Profissional (24 e 36 meses)
  - Atualizar dados existentes para renomear "PABX" para "PABX - Standard"
  - _Requirements: 1, 2, 3, 4, 5_

- [x] 2. Criar componente PricingTableSection
  - Implementar componente React para renderizar seções de tabelas de preços
  - Adicionar props para título, período e array de tabelas
  - Implementar layout responsivo com cabeçalho azul para períodos
  - Adicionar suporte a múltiplas tabelas (Ilimitado e Tarifado) por seção
  - _Requirements: 2, 4, 6_

- [-] 3. Aprimorar componente PricingTable existente
  - Adicionar suporte para exibir decomposição de valores (ex: "35 + 49")
  - Implementar renderização de valores com e sem equipamento
  - Adicionar suporte para diferentes tipos de colunas (Aluguel+Assinatura, Assinatura+Franquia)
  - Manter compatibilidade com tabelas existentes
  - _Requirements: 3, 5, 6_

- [x] 4. Implementar dados do Plano Essencial - 24 meses
  - Criar tabela ESSENCIAL Ilimitado com valores: 2-9 ramais (R$ 84), 10-19 ramais (R$ 65), 20-49 ramais (R$ 62), 50-99 ramais (R$ 59), 100-199 ramais (R$ 55), +200 ramais (R$ 52)
  - Criar tabela ESSENCIAL Tarifado com valores: 2-9 ramais (R$ 59), 10-49 ramais (R$ 49), 50-99 ramais (R$ 38), 100-199 ramais (R$ 34), +200 ramais (R$ 32)
  - Implementar decomposição correta dos valores conforme especificação
  - _Requirements: 2, 3_

- [x] 5. Implementar dados do Plano Essencial - 36 meses
  - Criar tabela ESSENCIAL Ilimitado com valores: 2-9 ramais (R$ 77), 10-19 ramais (R$ 59), 20-49 ramais (R$ 55), 50-99 ramais (R$ 53), 100-199 ramais (R$ 48), +200 ramais (R$ 45)
  - Criar tabela ESSENCIAL Tarifado com valores: 2-9 ramais (R$ 57), 10-49 ramais (R$ 47), 50-99 ramais (R$ 36), 100-199 ramais (R$ 32), +200 ramais (R$ 30)
  - Implementar decomposição correta dos valores conforme especificação
  - _Requirements: 2, 3_

- [x] 6. Implementar dados do Plano Profissional - 24 meses
  - Criar tabela PROFISSIONAL Ilimitado com valores: 2-9 ramais (R$ 104), 10-19 ramais (R$ 77), 20-49 ramais (R$ 73), 50-99 ramais (R$ 69), 100-199 ramais (R$ 65), +200 ramais (R$ 62)
  - Criar tabela PROFISSIONAL Tarifado com valores: 2-9 ramais (R$ 79), 10-49 ramais (R$ 59), 50-99 ramais (R$ 51), 100-199 ramais (R$ 39), +200 ramais (R$ 35)
  - Implementar decomposição correta dos valores conforme especificação
  - _Requirements: 4, 5_

- [x] 7. Implementar dados do Plano Profissional - 36 meses
  - Criar tabela PROFISSIONAL Ilimitado com valores: 2-9 ramais (R$ 97), 10-19 ramais (R$ 73), 20-49 ramais (R$ 69), 50-99 ramais (R$ 65), 100-199 ramais (R$ 60), +200 ramais (R$ 57)
  - Criar tabela PROFISSIONAL Tarifado com valores: 2-9 ramais (R$ 75), 10-49 ramais (R$ 57), 50-99 ramais (R$ 49), 100-199 ramais (R$ 37), +200 ramais (R$ 33)
  - Implementar decomposição correta dos valores conforme especificação
  - _Requirements: 4, 5_

- [x] 8. Atualizar PABXSIPCalculator para integrar novos planos
  - Localizar seção "Lista de Preços" no componente PABXSIPCalculator
  - Renomear tabela existente de "PABX" para "PABX - Standard"
  - Integrar componente PricingTableSection para Plano Essencial
  - Integrar componente PricingTableSection para Plano Profissional
  - _Requirements: 1, 2, 4, 6_

- [x] 9. Implementar estilos e layout responsivo
  - Aplicar classes CSS consistentes com tabelas existentes
  - Implementar cabeçalhos azuis para períodos (24 MESES, 36 MESES)
  - Adicionar scroll horizontal para tabelas em telas pequenas
  - Garantir contraste adequado e acessibilidade
  - _Requirements: 6_

- [ ] 10. Adicionar funcionalidade de edição (se aplicável)
  - Verificar se tabelas devem ser editáveis para administradores
  - Implementar campos de input para valores editáveis
  - Adicionar validação para valores numéricos positivos
  - Implementar persistência de dados editados
  - _Requirements: 6_

- [ ] 11. Implementar testes unitários
  - Criar testes para interfaces TypeScript e estrutura de dados
  - Testar renderização correta de todos os componentes
  - Testar valores e decomposições de todos os planos
  - Verificar responsividade e acessibilidade
  - _Requirements: 1, 2, 3, 4, 5, 6_

- [ ] 12. Realizar testes de integração
  - Testar integração completa no componente PABXSIPCalculator
  - Verificar que todas as tabelas são exibidas corretamente
  - Testar navegação e interação do usuário
  - Validar que não há regressões nas funcionalidades existentes
  - _Requirements: 1, 2, 3, 4, 5, 6_