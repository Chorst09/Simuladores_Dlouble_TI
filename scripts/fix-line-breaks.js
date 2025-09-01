#!/usr/bin/env node

const fs = require('fs');

/**
 * Script para corrigir quebras de linha problemáticas no DoubleRadioFibraCalculator
 */

const filePath = 'src/components/calculators/DoubleRadioFibraCalculator.tsx';

console.log('🔧 Corrigindo quebras de linha no DoubleRadioFibraCalculator...\n');

try {
    // Ler o arquivo
    let content = fs.readFileSync(filePath, 'utf8');
    
    console.log(`📄 Arquivo lido: ${filePath}`);
    console.log(`📏 Tamanho original: ${content.length} caracteres\n`);
    
    // Corrigir quebras de linha problemáticas
    let fixes = 0;
    
    // 1. Corrigir quebras no meio de palavras/tags
    const wordBreakPattern = /(\w+)\s*\n\s*(\w+)/g;
    const wordBreaks = content.match(wordBreakPattern);
    if (wordBreaks) {
        console.log(`🔄 Corrigindo ${wordBreaks.length} quebras no meio de palavras`);
        content = content.replace(wordBreakPattern, '$1$2');
        fixes += wordBreaks.length;
    }
    
    // 2. Corrigir quebras em tags JSX
    const tagBreakPattern = /(<\w+[^>]*)\s*\n\s*([^>]*>)/g;
    const tagBreaks = content.match(tagBreakPattern);
    if (tagBreaks) {
        console.log(`🔄 Corrigindo ${tagBreaks.length} quebras em tags JSX`);
        content = content.replace(tagBreakPattern, '$1 $2');
        fixes += tagBreaks.length;
    }
    
    // 3. Corrigir quebras em propriedades
    const propBreakPattern = /(\w+)=\s*\n\s*{/g;
    const propBreaks = content.match(propBreakPattern);
    if (propBreaks) {
        console.log(`🔄 Corrigindo ${propBreaks.length} quebras em propriedades`);
        content = content.replace(propBreakPattern, '$1={');
        fixes += propBreaks.length;
    }
    
    // 4. Corrigir múltiplas quebras de linha consecutivas
    const multiBreakPattern = /\n{3,}/g;
    const multiBreaks = content.match(multiBreakPattern);
    if (multiBreaks) {
        console.log(`🔄 Corrigindo ${multiBreaks.length} múltiplas quebras consecutivas`);
        content = content.replace(multiBreakPattern, '\n\n');
        fixes += multiBreaks.length;
    }
    
    // 5. Corrigir espaços em branco no final das linhas
    const trailingSpacePattern = / +$/gm;
    const trailingSpaces = content.match(trailingSpacePattern);
    if (trailingSpaces) {
        console.log(`🔄 Removendo ${trailingSpaces.length} espaços em branco no final das linhas`);
        content = content.replace(trailingSpacePattern, '');
        fixes += trailingSpaces.length;
    }
    
    // Salvar arquivo corrigido
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log(`\n✅ Correções aplicadas:`);
    console.log(`📊 Total de correções: ${fixes}`);
    console.log(`📏 Tamanho final: ${content.length} caracteres`);
    console.log(`💾 Arquivo salvo: ${filePath}`);
    
    if (fixes > 0) {
        console.log('\n🎉 Quebras de linha corrigidas com sucesso!');
        console.log('🔍 Recomendação: Execute o TypeScript checker novamente para verificar se os erros foram resolvidos.');
    } else {
        console.log('\n📝 Nenhuma quebra de linha problemática encontrada.');
    }
    
} catch (error) {
    console.error('❌ Erro ao processar arquivo:', error.message);
    process.exit(1);
}