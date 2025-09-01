#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script para corrigir caracteres especiais que causam problemas de parsing JSX
 */

const filePath = 'src/components/calculators/DoubleRadioFibraCalculator.tsx';

console.log('🔧 Corrigindo caracteres especiais no DoubleRadioFibraCalculator...\n');

try {
    // Ler o arquivo
    let content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`📄 Arquivo lido: ${filePath}`);
    console.log(`📏 Tamanho original: ${content.length} caracteres\n`);
    
    // Mapear caracteres problemáticos
    const replacements = [
        // Aspas curvas para aspas retas
        { from: /'/g, to: "'", name: "Aspas curvas simples esquerda" },
        { from: /'/g, to: "'", name: "Aspas curvas simples direita" },
        { from: /"/g, to: '"', name: "Aspas curvas duplas esquerda" },
        { from: /"/g, to: '"', name: "Aspas curvas duplas direita" },
        
        // Outros caracteres especiais comuns
        { from: /–/g, to: '-', name: "En dash" },
        { from: /—/g, to: '-', name: "Em dash" },
        { from: /…/g, to: '...', name: "Ellipsis" },
        
        // Espaços especiais
        { from: /\u00A0/g, to: ' ', name: "Non-breaking space" },
        { from: /\u2009/g, to: ' ', name: "Thin space" },
        { from: /\u200B/g, to: '', name: "Zero-width space" },
    ];
    
    let totalReplacements = 0;
    
    // Aplicar correções
    replacements.forEach(replacement => {
        const matches = content.match(replacement.from);
        if (matches) {
            console.log(`🔄 Corrigindo ${matches.length} ocorrências de: ${replacement.name}`);
            content = content.replace(replacement.from, replacement.to);
            totalReplacements += matches.length;
        }
    });
    
    // Salvar arquivo corrigido
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log(`\n✅ Correções aplicadas:`);
    console.log(`📊 Total de substituições: ${totalReplacements}`);
    console.log(`📏 Tamanho final: ${content.length} caracteres`);
    console.log(`💾 Arquivo salvo: ${filePath}`);
    
    if (totalReplacements > 0) {
        console.log('\n🎉 Caracteres especiais corrigidos com sucesso!');
        console.log('🔍 Recomendação: Execute o TypeScript checker novamente para verificar se os erros foram resolvidos.');
    } else {
        console.log('\n📝 Nenhum caractere especial encontrado para correção.');
    }
    
} catch (error) {
    console.error('❌ Erro ao processar arquivo:', error.message);
    process.exit(1);
}