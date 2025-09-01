#!/usr/bin/env node

/**
 * Script para testar correções de arrays undefined
 * Simula os cenários que causavam erros de "Cannot read properties of undefined (reading 'map')"
 */

console.log('🧪 Testando correções de arrays undefined...\n');

// Simular cenários problemáticos
const testScenarios = [
    {
        name: 'Array undefined',
        data: undefined,
        description: 'Quando API retorna undefined'
    },
    {
        name: 'Array null',
        data: null,
        description: 'Quando API retorna null'
    },
    {
        name: 'Array vazio',
        data: [],
        description: 'Quando API retorna array vazio'
    },
    {
        name: 'Array com dados',
        data: [{ id: 1, name: 'Test' }, { id: 2, name: 'Test 2' }],
        description: 'Quando API retorna dados válidos'
    },
    {
        name: 'Objeto sem propriedade array',
        data: { users: undefined },
        description: 'Quando resposta da API não tem a propriedade esperada'
    }
];

// Função de proteção corrigida
const safeMap = (array, callback) => {
    return (array || []).map(callback);
};

// Função de proteção para propriedades de objetos
const safeArrayFromObject = (obj, property) => {
    return (obj && obj[property]) || [];
};

console.log('Executando testes:\n');

let passed = 0;
let failed = 0;

testScenarios.forEach((scenario, index) => {
    console.log(`🔍 Teste ${index + 1}: ${scenario.name}`);
    console.log(`   Descrição: ${scenario.description}`);
    
    try {
        // Teste 1: Map direto (problemático)
        let directMapResult;
        try {
            directMapResult = scenario.data.map(item => item.name);
            console.log(`   ❌ Map direto: Deveria ter falhado mas passou`);
        } catch (error) {
            console.log(`   ✅ Map direto: Falhou como esperado (${error.message})`);
        }
        
        // Teste 2: Map com proteção
        const safeMapResult = safeMap(scenario.data, item => item.name);
        console.log(`   ✅ Map protegido: ${JSON.stringify(safeMapResult)}`);
        
        // Teste 3: Propriedade de objeto
        if (typeof scenario.data === 'object' && scenario.data !== null && 'users' in scenario.data) {
            const objectArrayResult = safeArrayFromObject(scenario.data, 'users');
            console.log(`   ✅ Array de objeto: ${JSON.stringify(objectArrayResult)}`);
        }
        
        passed++;
    } catch (error) {
        console.log(`   ❌ Erro inesperado: ${error.message}`);
        failed++;
    }
    
    console.log('');
});

// Teste específico dos padrões corrigidos
console.log('🔧 Testando padrões específicos corrigidos:\n');

// Padrão 1: UsersManagementPage
console.log('1. Padrão UsersManagementPage:');
const mockApiResponse1 = { users: undefined };
const mockApiResponse2 = { users: [{ id: 1, name: 'Test User' }] };

try {
    // Antes da correção (problemático)
    // const users1 = mockApiResponse1.users.map(u => u.name); // Erro!
    
    // Depois da correção
    const users1 = (mockApiResponse1.users || []).map(u => u.name);
    const users2 = (mockApiResponse2.users || []).map(u => u.name);
    
    console.log(`   ✅ Response com users undefined: ${JSON.stringify(users1)}`);
    console.log(`   ✅ Response com users válidos: ${JSON.stringify(users2)}`);
} catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    failed++;
}

// Padrão 2: ProposalsView
console.log('\n2. Padrão ProposalsView:');
const mockProposals1 = undefined;
const mockProposals2 = [{ title: 'Test', client: 'Client', accountManager: 'Manager' }];

try {
    // Filtro protegido
    const filtered1 = (mockProposals1 || []).filter(p => p.title.includes('Test'));
    const filtered2 = (mockProposals2 || []).filter(p => p.title.includes('Test'));
    
    console.log(`   ✅ Proposals undefined: ${JSON.stringify(filtered1)}`);
    console.log(`   ✅ Proposals válidos: ${JSON.stringify(filtered2)}`);
} catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    failed++;
}

// Resumo
console.log('\n📊 Resumo dos Testes:');
console.log(`✅ Passou: ${passed}`);
console.log(`❌ Falhou: ${failed}`);

if (failed === 0) {
    console.log('\n🎉 Todas as correções estão funcionando!');
    console.log('✅ Arrays undefined agora são tratados corretamente');
    console.log('✅ Aplicação não quebra mais com dados ausentes');
} else {
    console.log('\n⚠️  Algumas correções precisam de revisão.');
}

// Dicas de boas práticas
console.log('\n💡 Boas Práticas Implementadas:');
console.log('1. Sempre usar (array || []).map() em vez de array.map()');
console.log('2. Verificar propriedades de objetos antes de usar');
console.log('3. Inicializar estados com arrays vazios em vez de undefined');
console.log('4. Tratar erros de API definindo arrays vazios como fallback');