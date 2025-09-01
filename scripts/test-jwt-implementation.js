// Teste da nova implementação JWT compatível com Edge Runtime

const JWT_SECRET = 'test-secret-key-for-testing';

// Implementação de teste das funções JWT
async function generateToken(payload) {
  const tokenPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  };
  
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(tokenPayload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = await signHMAC(data, JWT_SECRET);
  
  return `${data}.${signature}`;
}

async function verifyToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [encodedHeader, encodedPayload, signature] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;
    
    // Verificar assinatura
    const expectedSignature = await signHMAC(data, JWT_SECRET);
    if (signature !== expectedSignature) return null;
    
    // Decodificar payload
    const payload = JSON.parse(atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/')));
    
    // Verificar expiração
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload;
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return null;
  }
}

async function signHMAC(data, secret) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const signatureArray = new Uint8Array(signature);
  
  return btoa(String.fromCharCode(...signatureArray))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

// Testes
async function runTests() {
  console.log('🧪 Testando implementação JWT...\n');

  try {
    // Teste 1: Gerar token
    console.log('1. Testando geração de token...');
    const testPayload = {
      userId: '123',
      email: 'test@example.com',
      role: 'user'
    };
    
    const token = await generateToken(testPayload);
    console.log('✅ Token gerado:', token.substring(0, 50) + '...');
    
    // Teste 2: Verificar token válido
    console.log('\n2. Testando verificação de token válido...');
    const verifiedPayload = await verifyToken(token);
    
    if (verifiedPayload) {
      console.log('✅ Token verificado com sucesso');
      console.log('   - userId:', verifiedPayload.userId);
      console.log('   - email:', verifiedPayload.email);
      console.log('   - role:', verifiedPayload.role);
      console.log('   - iat:', new Date(verifiedPayload.iat * 1000).toISOString());
      console.log('   - exp:', new Date(verifiedPayload.exp * 1000).toISOString());
    } else {
      console.log('❌ Falha na verificação do token');
    }
    
    // Teste 3: Token inválido
    console.log('\n3. Testando token inválido...');
    const invalidToken = token + 'invalid';
    const invalidResult = await verifyToken(invalidToken);
    
    if (invalidResult === null) {
      console.log('✅ Token inválido rejeitado corretamente');
    } else {
      console.log('❌ Token inválido foi aceito (erro!)');
    }
    
    // Teste 4: Token malformado
    console.log('\n4. Testando token malformado...');
    const malformedToken = 'invalid.token';
    const malformedResult = await verifyToken(malformedToken);
    
    if (malformedResult === null) {
      console.log('✅ Token malformado rejeitado corretamente');
    } else {
      console.log('❌ Token malformado foi aceito (erro!)');
    }
    
    // Teste 5: Compatibilidade com diferentes payloads
    console.log('\n5. Testando diferentes tipos de payload...');
    const adminPayload = {
      userId: '456',
      email: 'admin@example.com',
      role: 'admin',
      password_change_required: false
    };
    
    const adminToken = await generateToken(adminPayload);
    const adminVerified = await verifyToken(adminToken);
    
    if (adminVerified && adminVerified.role === 'admin') {
      console.log('✅ Payload de admin processado corretamente');
    } else {
      console.log('❌ Falha no processamento do payload de admin');
    }
    
    console.log('\n🎉 Todos os testes concluídos!');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  }
}

// Executar testes
runTests();