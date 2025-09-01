#!/usr/bin/env node

/**
 * Script para verificar imports duplicados nos calculadores
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando imports duplicados nos calculadores...\n');

const calculatorFiles = [
    'src/components/calculators/MaquinasVirtuaisCalculator.tsx',
    'src/components/calculators/RadioInternetCalculator.tsx',
    'src/components/calculators/DoubleRadioFibraCalculator.tsx',
    'src/components/calculators/FiberLinkCalculator.tsx',
    'src/components/calculators/PABXSIPCalculator.tsx'
];

let totalIssues = 0;

calculatorFiles.forEach(filePath => {
    console.log(`📁 Verificando: ${filePath}`);
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        // Verificar imports duplicados
        const imports = {};
        const duplicates = [];
        
        lines.forEach((line, index) => {
            if (line.trim().startsWith('import ')) {
                const importMatch = line.match(/import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/);
                if (importMatch) {
                    const [, importedItems, modulePath] = importMatch;
                    const items = importedItems.split(',').map(item => item.trim());
                    
                    items.forEach(item => {
                        const key = `${item}:${modulePath}`;
                        if (imports[key]) {
                            duplicates.push({
                                item,
                                modulePath,
                                lines: [imports[key], index + 1]
                            });
                        } else {
                            imports[key] = index + 1;
                        }
                    });
                }
            }
        });
        
        if (duplicates.length > 0) {
            console.log(`   ❌ Encontrados ${duplicates.length} imports duplicados:`);
            duplicates.forEach(dup => {
                console.log(`      - ${dup.item} de ${dup.modulePath} (linhas ${dup.lines.join(', ')})`);
                totalIssues++;
            });
        } else {
            console.log(`   ✅ Nenhum import duplicado encontrado`);
        }
        
        // Verificar imports do DirectorDiscount especificamente
        const directorDiscountImports = lines.filter(line => 
            line.includes('DirectorDiscount') && line.includes('import')
        );
        
        if (directorDiscountImports.length > 1) {
            console.log(`   ⚠️  Múltiplos imports de DirectorDiscount encontrados:`);
            directorDiscountImports.forEach((line, index) => {
                console.log(`      Linha ${lines.indexOf(line) + 1}: ${line.trim()}`);
            });
        }
        
    } catch (error) {
        console.log(`   ❌ Erro ao ler arquivo: ${error.message}`);
        totalIssues++;
    }
    
    console.log('');
});

// Resumo
console.log('📊 Resumo:');
if (totalIssues === 0) {
    console.log('✅ Nenhum problema de import duplicado encontrado!');
} else {
    console.log(`❌ ${totalIssues} problemas encontrados`);
    console.log('\n💡 Para corrigir:');
    console.log('1. Remover imports duplicados');
    console.log('2. Consolidar imports do mesmo módulo');
    console.log('3. Verificar se todos os imports são necessários');
}

process.exit(totalIssues > 0 ? 1 : 0);