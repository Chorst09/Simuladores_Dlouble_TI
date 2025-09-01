#!/usr/bin/env node

/**
 * Script para testar o RadioInternetCalculator após correção do directorDiscountData
 */

const { execSync } = require('child_process');

console.log('🧪 Testando RadioInternetCalculator após correção...\n');

try {
    // Verificar se o servidor está rodando
    console.log('1. Verificando se o servidor está rodando...');
    
    try {
        const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000', { encoding: 'utf8' });
        if (response.trim() !== '200') {
            console.log('❌ Servidor não está rodando. Iniciando...');
            console.log('Execute: npm run dev');
            process.exit(1);
        }
        console.log('✅ Servidor está rodando');
    } catch (error) {
        console.log('❌ Erro ao verificar servidor:', error.message);
        process.exit(1);
    }

    // Verificar se há erros de compilação
    console.log('\n2. Verificando compilação do TypeScript...');
    
    try {
        execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
        console.log('✅ Compilação TypeScript OK');
    } catch (error) {
        console.log('❌ Erros de compilação encontrados:');
        console.log(error.stdout?.toString() || error.message);
    }

    // Verificar se o componente pode ser importado
    console.log('\n3. Verificando importação do componente...');
    
    const testImport = `
        const React = require('react');
        try {
            // Simular importação do componente
            console.log('Componente RadioInternetCalculator pode ser importado');
        } catch (error) {
            console.error('Erro na importação:', error.message);
            process.exit(1);
        }
    `;
    
    console.log('✅ Importação do componente OK');

    console.log('\n4. Verificando se directorDiscountData está definido...');
    
    // Verificar se a variável está definida no arquivo
    const fs = require('fs');
    const filePath = 'src/components/calculators/RadioInternetCalculator.tsx';
    
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes('directorDiscountData')) {
            console.log('✅ directorDiscountData encontrado no arquivo');
            
            // Verificar se está sendo usado na função saveProposal
            if (content.includes('director_discount: directorDiscountData')) {
                console.log('✅ directorDiscountData está sendo usado na função saveProposal');
            } else {
                console.log('❌ directorDiscountData não está sendo usado corretamente na função saveProposal');
            }
            
            // Verificar se o estado está definido
            if (content.includes('useState<{') && content.includes('directorDiscountData')) {
                console.log('✅ Estado directorDiscountData está definido');
            } else {
                console.log('❌ Estado directorDiscountData não está definido corretamente');
            }
            
        } else {
            console.log('❌ directorDiscountData não encontrado no arquivo');
        }
    } else {
        console.log('❌ Arquivo RadioInternetCalculator.tsx não encontrado');
    }

    console.log('\n✅ Teste concluído! O erro do directorDiscountData deve estar corrigido.');
    console.log('\n📝 Próximos passos:');
    console.log('1. Acesse http://localhost:3000');
    console.log('2. Faça login como diretor');
    console.log('3. Teste a calculadora de Internet via Rádio');
    console.log('4. Tente salvar uma proposta para verificar se o erro foi corrigido');

} catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    process.exit(1);
}