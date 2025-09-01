const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:password@localhost:5432/nextn_db'
});

async function testLogin() {
  try {
    console.log('🧪 Testando login com credenciais...');
    
    // Buscar usuário admin
    const result = await pool.query(
      'SELECT id, email, password_hash, name, role, is_active FROM users WHERE email = $1',
      ['admin@nextn.com.br']
    );

    if (result.rows.length === 0) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    const user = result.rows[0];
    console.log('👤 Usuário encontrado:', {
      email: user.email,
      name: user.name,
      role: user.role,
      is_active: user.is_active,
      hash_preview: user.password_hash.substring(0, 20) + '...'
    });

    // Testar senha
    const password = 'admin123';
    console.log('🔐 Testando senha:', password);
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log('✅ Senha válida:', isValid);

    if (!isValid) {
      console.log('❌ Senha inválida! Vamos testar outras possibilidades...');
      
      // Testar outras senhas possíveis
      const testPasswords = ['admin', 'password', '123456', 'admin123'];
      for (const testPass of testPasswords) {
        const testResult = await bcrypt.compare(testPass, user.password_hash);
        console.log(`🔍 Testando "${testPass}":`, testResult);
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
  }
}

testLogin();