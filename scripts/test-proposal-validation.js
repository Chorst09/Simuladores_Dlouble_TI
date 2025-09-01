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

// Função para testar endpoint com autenticação
async function testProposalEndpoint(description, data, expectedStatus) {
    console.log(`\n🧪 Testando: ${description}`);
    
    const token = await getAuthToken();
    if (!token) {
        console.log('❌ Não foi possível obter token de autenticação');
        return;
    }

    try {
        const response = await fetch('http://localhost:3002/api/proposals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const responseData = await response.json();
        
        if (response.status === expectedStatus) {
            console.log(`✅ Status correto: ${response.status}`);
        } else {
            console.log(`❌ Status incorreto: esperado ${expectedStatus}, recebido ${response.status}`);
        }
        
        console.log('Resposta:', JSON.stringify(responseData, null, 2));
        
    } catch (error) {
        console.error('❌ Erro na requisição:', error.message);
    }
}

async function runTests() {
    console.log('🧪 Testando validação de propostas com autenticação...\n');

    // Teste 1: Dados válidos
    await testProposalEndpoint('Dados válidos', {
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
            id: 'prod-1',
            name: 'Produto Teste',
            description: 'Descrição do produto',
            unitPrice: 100,
            setup: 50,
            monthly: 100,
            quantity: 1
        }],
        total_setup: 50,
        total_monthly: 100,
        type: 'test'
    }, 201);

    // Teste 2: Sem client_data
    await testProposalEndpoint('Sem client_data', {
        account_manager_data: {
            name: 'Gerente Teste',
            email: 'gerente@teste.com',
            phone: '11888888888'
        },
        products: [],
        total_setup: 0,
        total_monthly: 0
    }, 400);

    // Teste 3: Sem products
    await testProposalEndpoint('Sem products', {
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
        total_setup: 0,
        total_monthly: 0
    }, 400);

    // Teste 4: Email inválido
    await testProposalEndpoint('Email inválido', {
        client_data: {
            name: 'Cliente Teste',
            email: 'email-invalido',
            phone: '11999999999'
        },
        account_manager_data: {
            name: 'Gerente Teste',
            email: 'gerente@teste.com',
            phone: '11888888888'
        },
        products: [{
            id: 'prod-1',
            name: 'Produto Teste',
            description: 'Descrição do produto',
            unitPrice: 100,
            setup: 50,
            monthly: 100,
            quantity: 1
        }],
        total_setup: 50,
        total_monthly: 100
    }, 400);

    console.log('\n🎉 Testes de validação concluídos!');
}

runTests().catch(console.error);