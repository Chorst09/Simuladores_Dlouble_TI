#!/usr/bin/env node

/**
 * Script para testar o registro de usuários
 * Identifica problemas com emails duplicados e testa a criação
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// Função para fazer login como admin
async function loginAsAdmin() {
    console.log('🔐 Fazendo login como admin...');
    
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: 'admin@admin.com',
            password: 'admin123'
        }),
    });

    if (!loginResponse.ok) {
        console.log('❌ Falha no login do admin');
        const error = await loginResponse.text();
        console.log('Erro:', error);
        return null;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login do admin realizado com sucesso');
    return loginData.token;
}

// Função para listar usuários existentes
async function listExistingUsers(token) {
    console.log('\n📋 Listando usuários existentes...');
    
    const response = await fetch(`${BASE_URL}/api/users`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        console.log('❌ Erro ao listar usuários');
        return [];
    }

    const data = await response.json();
    const users = data.users || [];
    
    console.log(`📊 Total de usuários: ${users.length}`);
    users.forEach(user => {
        console.log(`   - ${user.email} (${user.name}) - Role: ${user.role}`);
    });
    
    return users;
}

// Função para testar criação de usuário
async function testUserCreation(token, userData) {
    console.log(`\n👤 Testando criação do usuário: ${userData.email}`);
    
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
    });

    const responseData = await response.text();
    let parsedData;
    
    try {
        parsedData = JSON.parse(responseData);
    } catch (e) {
        parsedData = { error: responseData };
    }

    if (response.ok) {
        console.log('✅ Usuário criado com sucesso!');
        console.log(`   ID: ${parsedData.user?.id}`);
        console.log(`   Nome: ${parsedData.user?.name}`);
        console.log(`   Email: ${parsedData.user?.email}`);
        console.log(`   Role: ${parsedData.user?.role}`);
        return true;
    } else {
        console.log(`❌ Erro ${response.status}: ${parsedData.error || 'Erro desconhecido'}`);
        
        if (response.status === 409) {
            console.log('   💡 Este email já existe no sistema');
        } else if (response.status === 401) {
            console.log('   💡 Problema de autenticação - token inválido?');
        } else if (response.status === 403) {
            console.log('   💡 Sem permissão - usuário não é admin?');
        }
        
        return false;
    }
}

// Função principal
async function main() {
    console.log('🧪 Testando registro de usuários...\n');

    try {
        // 1. Fazer login como admin
        const token = await loginAsAdmin();
        if (!token) {
            console.log('❌ Não foi possível obter token de admin');
            return;
        }

        // 2. Listar usuários existentes
        const existingUsers = await listExistingUsers(token);
        const existingEmails = existingUsers.map(u => u.email);

        // 3. Testar criação de usuários
        const testUsers = [
            {
                name: 'Teste Usuario 1',
                email: 'teste1@exemplo.com',
                password: 'senha123',
                role: 'user'
            },
            {
                name: 'Teste Usuario 2',
                email: 'teste2@exemplo.com',
                password: 'senha123',
                role: 'diretor'
            },
            {
                name: 'Admin Teste',
                email: 'admin.teste@exemplo.com',
                password: 'senha123',
                role: 'admin'
            },
            // Testar email duplicado
            {
                name: 'Email Duplicado',
                email: 'admin@admin.com', // Este já existe
                password: 'senha123',
                role: 'user'
            }
        ];

        let successCount = 0;
        let duplicateCount = 0;
        let errorCount = 0;

        for (const userData of testUsers) {
            const isExisting = existingEmails.includes(userData.email);
            
            if (isExisting) {
                console.log(`\n⚠️  Pulando ${userData.email} - já existe no sistema`);
                duplicateCount++;
                continue;
            }

            const success = await testUserCreation(token, userData);
            if (success) {
                successCount++;
            } else {
                errorCount++;
            }
        }

        // 4. Resumo
        console.log('\n📊 Resumo dos Testes:');
        console.log(`✅ Usuários criados: ${successCount}`);
        console.log(`⚠️  Emails duplicados: ${duplicateCount}`);
        console.log(`❌ Erros: ${errorCount}`);

        if (errorCount === 0 && successCount > 0) {
            console.log('\n🎉 Sistema de registro funcionando corretamente!');
        } else if (duplicateCount > 0 && errorCount === 0) {
            console.log('\n💡 Sistema funcionando - emails duplicados são tratados corretamente');
        } else {
            console.log('\n⚠️  Há problemas no sistema de registro que precisam ser investigados');
        }

        // 5. Listar usuários após os testes
        console.log('\n📋 Usuários após os testes:');
        await listExistingUsers(token);

    } catch (error) {
        console.error('❌ Erro durante os testes:', error.message);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main, testUserCreation, listExistingUsers };