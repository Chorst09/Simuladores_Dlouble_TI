const fetch = require('node-fetch');

// Função para fazer login e obter token
async function getAuthToken() {
    try {
        const response = await fetch('http://localhost:3002/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@nextn.com.br',
                password: 'admin123'
            })
        });

        if (!response.ok) {
            throw new Error(`Login failed: ${response.status}`);
        }

        const data = await response.json();
        return data.token;
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        return null;
    }
}

// Teste de dados extremos
async function testEdgeCases() {
    console.log('🧪 Testando casos extremos...\n');

    const token = await getAuthToken();
    if (!token) {
        console.log('❌ Não foi possível obter token de autenticação');
        return;
    }

    // Teste 1: Dados muito grandes
    console.log('🧪 Testando: Dados muito grandes');
    try {
        const largeData = {
            client_data: {
                name: 'A'.repeat(1000), // Nome muito longo
                email: 'cliente@teste.com',
                phone: '11999999999'
            },
            account_manager_data: {
                name: 'Gerente Teste',
                email: 'gerente@teste.com',
                phone: '11888888888'
            },
            products: Array(100).fill(0).map((_, i) => ({ // 100 produtos
                id: `prod-${i}`,
                name: `Produto ${i}`,
                description: 'B'.repeat(500), // Descrição longa
                unitPrice: 100,
                setup: 50,
                monthly: 100,
                quantity: 1
            })),
            total_setup: 5000,
            total_monthly: 10000,
            type: 'test'
        };

        const response = await fetch('http://localhost:3002/api/proposals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(largeData)
        });

        console.log(`Status: ${response.status}`);
        if (response.status === 201) {
            console.log('✅ Dados grandes aceitos');
        } else {
            const errorData = await response.json();
            console.log('❌ Dados grandes rejeitados:', errorData.error);
        }
    } catch (error) {
        console.error('❌ Erro ao testar dados grandes:', error.message);
    }

    // Teste 2: Caracteres especiais
    console.log('\n🧪 Testando: Caracteres especiais');
    try {
        const specialCharsData = {
            client_data: {
                name: 'Cliente Ção & Ñoño <script>alert("xss")</script>',
                email: 'cliente+test@teste.com.br',
                phone: '+55 (11) 99999-9999'
            },
            account_manager_data: {
                name: 'Gerente Ação',
                email: 'gerente@teste.com',
                phone: '11888888888'
            },
            products: [{
                id: 'prod-special',
                name: 'Produto "Especial" & Único',
                description: 'Descrição com acentos: ção, não, coração',
                unitPrice: 100.99,
                setup: 50.50,
                monthly: 100.99,
                quantity: 1
            }],
            total_setup: 50.50,
            total_monthly: 100.99,
            type: 'test'
        };

        const response = await fetch('http://localhost:3002/api/proposals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(specialCharsData)
        });

        console.log(`Status: ${response.status}`);
        if (response.status === 201) {
            console.log('✅ Caracteres especiais aceitos');
        } else {
            const errorData = await response.json();
            console.log('❌ Caracteres especiais rejeitados:', errorData.error);
        }
    } catch (error) {
        console.error('❌ Erro ao testar caracteres especiais:', error.message);
    }

    // Teste 3: Valores numéricos extremos
    console.log('\n🧪 Testando: Valores numéricos extremos');
    try {
        const extremeValuesData = {
            client_data: {
                name: 'Cliente Teste',
                email: 'cliente@teste.com',
                phone: '11999999999'
            },
            account_manager_data: {
                name: 'Gerente Teste',
                email: 'gerente@teste.com',
                phone: '11888888888'
            },
            products: [{
                id: 'prod-extreme',
                name: 'Produto Extremo',
                description: 'Produto com valores extremos',
                unitPrice: 999999999.99,
                setup: 0,
                monthly: 999999999.99,
                quantity: 1
            }],
            total_setup: 0,
            total_monthly: 999999999.99,
            type: 'test'
        };

        const response = await fetch('http://localhost:3002/api/proposals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(extremeValuesData)
        });

        console.log(`Status: ${response.status}`);
        if (response.status === 201) {
            console.log('✅ Valores extremos aceitos');
        } else {
            const errorData = await response.json();
            console.log('❌ Valores extremos rejeitados:', errorData.error);
        }
    } catch (error) {
        console.error('❌ Erro ao testar valores extremos:', error.message);
    }

    console.log('\n🎉 Testes de casos extremos concluídos!');
}

testEdgeCases().catch(console.error);