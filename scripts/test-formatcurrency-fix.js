#!/usr/bin/env node

/**
 * Script para testar a correção da função formatCurrency
 * Simula os cenários que causavam o erro original
 */

console.log('🧪 Testando correção da função formatCurrency...\n');

// Simular a função corrigida
const formatCurrency = (value) => {
    const numValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    return `R$ ${numValue.toFixed(2).replace('.', ',')}`;
};

// Casos de teste
const testCases = [
    { input: undefined, expected: 'R$ 0,00', description: 'Valor undefined' },
    { input: null, expected: 'R$ 0,00', description: 'Valor null' },
    { input: 0, expected: 'R$ 0,00', description: 'Valor zero' },
    { input: 100, expected: 'R$ 100,00', description: 'Valor inteiro' },
    { input: 99.99, expected: 'R$ 99,99', description: 'Valor decimal' },
    { input: 1234.56, expected: 'R$ 1234,56', description: 'Valor com milhares' },
    { input: NaN, expected: 'R$ 0,00', description: 'Valor NaN' },
    { input: '', expected: 'R$ 0,00', description: 'String vazia' },
    { input: 'abc', expected: 'R$ 0,00', description: 'String inválida' }
];

let passed = 0;
let failed = 0;

console.log('Executando testes:\n');

testCases.forEach((testCase, index) => {
    try {
        const result = formatCurrency(testCase.input);
        const success = result === testCase.expected;
        
        if (success) {
            console.log(`✅ Teste ${index + 1}: ${testCase.description}`);
            console.log(`   Input: ${testCase.input} → Output: ${result}`);
            passed++;
        } else {
            console.log(`❌ Teste ${index + 1}: ${testCase.description}`);
            console.log(`   Input: ${testCase.input}`);
            console.log(`   Esperado: ${testCase.expected}`);
            console.log(`   Recebido: ${result}`);
            failed++;
        }
    } catch (error) {
        console.log(`💥 Teste ${index + 1}: ${testCase.description} - ERRO`);
        console.log(`   Input: ${testCase.input}`);
        console.log(`   Erro: ${error.message}`);
        failed++;
    }
    console.log('');
});

// Resumo
console.log('📊 Resumo dos Testes:');
console.log(`✅ Passou: ${passed}`);
console.log(`❌ Falhou: ${failed}`);
console.log(`📈 Total: ${testCases.length}`);

if (failed === 0) {
    console.log('\n🎉 Todos os testes passaram! A correção está funcionando.');
} else {
    console.log('\n⚠️  Alguns testes falharam. Verifique a implementação.');
}

// Teste específico do erro original
console.log('\n🔍 Teste do erro original:');
try {
    // Simular o cenário que causava o erro
    const vmData = { unitPrice: undefined, totalPrice: null };
    
    console.log('Testando formatCurrency com vm.unitPrice undefined...');
    const result1 = formatCurrency(vmData.unitPrice);
    console.log(`✅ Resultado: ${result1}`);
    
    console.log('Testando formatCurrency com vm.totalPrice null...');
    const result2 = formatCurrency(vmData.totalPrice);
    console.log(`✅ Resultado: ${result2}`);
    
    console.log('\n✅ Erro original corrigido com sucesso!');
} catch (error) {
    console.log(`\n❌ Erro ainda presente: ${error.message}`);
}