// Teste do fluxo completo de autenticação

async function testAuthFlow() {
  console.log('🧪 Testando fluxo completo de autenticação...\n');

  try {
    // 1. Teste de login
    console.log('1. Testando login...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Login bem-sucedido');
      console.log('   Token recebido:', loginData.token.substring(0, 50) + '...');
      
      // 2. Teste da API /auth/me
      console.log('\n2. Testando /api/auth/me...');
      const meResponse = await fetch('http://localhost:3000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json',
        }
      });

      const meData = await meResponse.json();
      
      if (meResponse.ok) {
        console.log('✅ /api/auth/me funcionando');
        console.log('   Usuário:', meData.user.name, `(${meData.user.role})`);
      } else {
        console.log('❌ Erro em /api/auth/me:', meData.error);
        console.log('   Status:', meResponse.status);
      }

      // 3. Teste de token inválido
      console.log('\n3. Testando token inválido...');
      const invalidResponse = await fetch('http://localhost:3000/api/auth/me', {
        headers: {
          'Authorization': 'Bearer invalid-token',
          'Content-Type': 'application/json',
        }
      });

      if (invalidResponse.status === 401) {
        console.log('✅ Token inválido rejeitado corretamente');
      } else {
        console.log('❌ Token inválido não foi rejeitado');
      }

    } else {
      console.log('❌ Erro no login:', loginData.error);
      console.log('   Status:', loginResponse.status);
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  }
}

// Executar teste
testAuthFlow();