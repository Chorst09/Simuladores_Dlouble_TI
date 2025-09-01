// Debug da implementação JWT

const JWT_SECRET = 'test-secret-key';

// Implementação das funções JWT (copiada do auth.ts)
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
    console.log('🔍 Verificando token:', token.substring(0, 50) + '...');
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('❌ Token não tem 3 partes');
      return null;
    }
    
    const [encodedHeader, encodedPayload, signature] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;
    
    console.log('📝 Partes do token:');
    console.log('   Header:', encodedHeader);
    console.log('   Payload:', encodedPayload);
    console.log('   Signature:', signature);
    
    // Verificar assinatura
    const expectedSignature = await signHMAC(data, JWT_SECRET);
    console.log('🔐 Assinatura esperada:', expectedSignature);
    console.log('🔐 Assinatura recebida:', signature);
    
    if (signature !== expectedSignature) {
      console.log('❌ Assinatura inválida');
      return null;
    }
    
    // Decodificar payload
    const payload = JSON.parse(atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/')));
    console.log('📦 Payload decodificado:', payload);
    
    // Verificar expiração
    const now = Math.floor(Date.now() / 1000);
    console.log('⏰ Timestamp atual:', now);
    console.log('⏰ Token expira em:', payload.exp);
    console.log('⏰ Token válido por:', payload.exp - now, 'segundos');
    
    if (payload.exp && payload.exp < now) {
      console.log('❌ Token expirado');
      return null;
    }
    
    console.log('✅ Token válido');
    return payload;
  } catch (error) {
    console.log('❌ Erro ao verificar token:', error.message);
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

async function debugJWT() {
  console.log('🔧 Debug da implementação JWT\n');

  // 1. Gerar token
  console.log('1. Gerando token...');
  const payload = {
    userId: '123',
    email: 'test@example.com',
    role: 'admin'
  };
  
  const token = await generateToken(payload);
  console.log('✅ Token gerado:', token);
  
  // 2. Verificar token imediatamente
  console.log('\n2. Verificando token imediatamente...');
  const verified = await verifyToken(token);
  
  if (verified) {
    console.log('✅ Verificação bem-sucedida');
  } else {
    console.log('❌ Falha na verificação');
  }
  
  // 3. Testar token com expiração curta
  console.log('\n3. Testando token com expiração curta...');
  const shortPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) - 1 // Expirado há 1 segundo
  };
  
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(shortPayload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = await signHMAC(data, JWT_SECRET);
  const expiredToken = `${data}.${signature}`;
  
  console.log('🕐 Token expirado gerado');
  const expiredResult = await verifyToken(expiredToken);
  
  if (expiredResult === null) {
    console.log('✅ Token expirado rejeitado corretamente');
  } else {
    console.log('❌ Token expirado foi aceito (erro!)');
  }
}

debugJWT();