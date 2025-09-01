const fetch = require('node-fetch');

async function testFrontendLogin() {
  try {
    console.log('🧪 Testando login como o frontend faria...');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: 'admin@nextn.com.br', 
        password: 'admin123' 
      }),
    });

    console.log('📊 Status da resposta:', response.status);
    console.log('📋 Headers da resposta:', Object.fromEntries(response.headers.entries()));
    
    const contentType = response.headers.get('content-type');
    console.log('📄 Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.log('❌ Resposta não é JSON:', text.substring(0, 200));
      return;
    }
    
    const data = await response.json();
    console.log('✅ Dados da resposta:', data);
    
    if (!response.ok) {
      console.log('❌ Login falhou:', data.error);
    } else {
      console.log('✅ Login bem-sucedido!');
      console.log('👤 Usuário:', data.user);
      console.log('🔑 Token recebido:', data.token ? 'Sim' : 'Não');
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

testFrontendLogin();