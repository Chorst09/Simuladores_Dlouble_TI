const fetch = require('node-fetch');

async function testAuthMe() {
  try {
    console.log('🔐 Fazendo login primeiro...');
    
    // Fazer login
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
    console.log('🔑 Token recebido:', loginData.token.substring(0, 20) + '...');
    
    // Testar /api/auth/me
    console.log('\n🧪 Testando /api/auth/me...');
    
    const meResponse = await fetch('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Cookie': `auth-token=${loginData.token}`,
      },
    });

    console.log('📊 Status da resposta /me:', meResponse.status);
    console.log('📋 Headers da resposta /me:', Object.fromEntries(meResponse.headers.entries()));
    
    const meData = await meResponse.json();
    console.log('📄 Dados da resposta /me:', meData);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testAuthMe();