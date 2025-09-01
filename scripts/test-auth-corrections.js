#!/usr/bin/env node

/**
 * Script para testar as correções do sistema de autenticação
 */

const fs = require('fs');

console.log('🧪 Testando correções do sistema de autenticação...\n');

// Verificar se as funções estão exportadas corretamente no auth.ts
console.log('1. Verificando exportações do auth.ts...');

const authContent = fs.readFileSync('src/lib/auth.ts', 'utf8');

const requiredExports = [
  'ErrorResponses',
  'requireAuthEnhanced',
  'validateResourceAccess',
  'checkOwnership',
  'logAccessAttempt'
];

let allExportsFound = true;

requiredExports.forEach(exportName => {
  if (authContent.includes(`export ${exportName}`) || authContent.includes(`export const ${exportName}`) || authContent.includes(`export async function ${exportName}`)) {
    console.log(`✅ ${exportName} encontrado`);
  } else {
    console.log(`❌ ${exportName} NÃO encontrado`);
    allExportsFound = false;
  }
});

if (allExportsFound) {
  console.log('✅ Todas as exportações necessárias estão presentes');
} else {
  console.log('❌ Algumas exportações estão faltando');
}

// Verificar se as importações estão corretas nos arquivos de API
console.log('\n2. Verificando importações nos arquivos de API...');

const apiFiles = [
  'src/app/api/users/route.ts',
  'src/app/api/users/[id]/route.ts',
  'src/app/api/proposals/route.ts',
  'src/app/api/proposals/[id]/route.ts'
];

apiFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('ErrorResponses') && content.includes('requireAuthEnhanced')) {
      console.log(`✅ ${filePath} - importações corretas`);
    } else {
      console.log(`❌ ${filePath} - importações incorretas ou faltando`);
    }
  } else {
    console.log(`❌ ${filePath} - arquivo não encontrado`);
  }
});

// Verificar se o directorDiscountData foi corrigido
console.log('\n3. Verificando correção do directorDiscountData...');

const radioCalculatorPath = 'src/components/calculators/RadioInternetCalculator.tsx';
if (fs.existsSync(radioCalculatorPath)) {
  const content = fs.readFileSync(radioCalculatorPath, 'utf8');
  
  if (content.includes('const [directorDiscountData, setDirectorDiscountData]')) {
    console.log('✅ Estado directorDiscountData definido');
  } else {
    console.log('❌ Estado directorDiscountData não encontrado');
  }
  
  if (content.includes('director_discount: directorDiscountData')) {
    console.log('✅ directorDiscountData usado na função saveProposal');
  } else {
    console.log('❌ directorDiscountData não usado corretamente');
  }
} else {
  console.log('❌ RadioInternetCalculator.tsx não encontrado');
}

console.log('\n4. Verificando estrutura da tabela access_logs...');

const migrationPath = 'database/migrations/create_access_logs_table.sql';
if (fs.existsSync(migrationPath)) {
  console.log('✅ Migração da tabela access_logs encontrada');
} else {
  console.log('❌ Migração da tabela access_logs não encontrada');
}

console.log('\n✅ Verificação concluída!');
console.log('\n📝 Próximos passos para testar:');
console.log('1. Execute: npm run dev');
console.log('2. Teste o login como diretor');
console.log('3. Teste a calculadora de Internet via Rádio');
console.log('4. Verifique se não há mais erros de directorDiscountData');
console.log('5. Teste as APIs de usuários e propostas com diferentes roles');