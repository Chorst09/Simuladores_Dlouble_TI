const fetch = require('node-fetch');

async function testCreateDiretor() {
  try {
    console.log('🔐 Fazendo login como admin...');
    
    // Fazer login como admin
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: 'mauro@gmail.com', 
        password: 'Comercial2025' 
      }),
    });

    const loginData = await loginResponse.json();
    console.log('✅ Login bem-sucedido:', loginData.message);
    
    // Testar criação de usuário diretor
    console.log('\n👤 Criando usuário diretor...');
    
    const createResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`,
        'Cookie': `auth-token=${loginData.token}`,
      },
      body: JSON.stringify({
        email: 'teste.diretor@doubletelecom.com.br',
        password: 'senha123',
        name: 'Teste Diretor',
        role: 'diretor'
      }),
    });

    console.log('📊 Status da resposta:', createResponse.status);
    
    const createData = await createResponse.json();
    console.log('📄 Dados da resposta:', createData);
    
    if (createResponse.ok) {
      console.log('✅ Usuário diretor criado com sucesso!');
    } else {
      console.log('❌ Erro ao criar usuário:', createData.error);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testCreateDiretor();