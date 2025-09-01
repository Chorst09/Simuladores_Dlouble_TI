#!/bin/bash

# Script para executar todos os testes relacionados ao desconto de diretor

echo "🧪 Executando testes do desconto de diretor..."
echo "================================================"

# Executar testes unitários do componente DirectorDiscount
echo "📋 Testando componente DirectorDiscount..."
npm test -- --testPathPattern="DirectorDiscount.test.tsx" --verbose

# Executar testes de integração
echo "🔗 Testando integração entre calculadoras..."
npm test -- --testPathPattern="director-discount.test.tsx" --verbose

# Executar testes da API
echo "🌐 Testando API de propostas com desconto de diretor..."
npm test -- --testPathPattern="proposals-director-discount.test.ts" --verbose

# Executar todos os testes relacionados ao desconto de diretor
echo "🎯 Executando todos os testes relacionados ao desconto de diretor..."
npm test -- --testNamePattern="director|Director" --verbose

# Gerar relatório de cobertura
echo "📊 Gerando relatório de cobertura..."
npm test -- --coverage --testPathPattern="director-discount|DirectorDiscount|proposals-director-discount"

echo "✅ Testes do desconto de diretor concluídos!"
echo "================================================"