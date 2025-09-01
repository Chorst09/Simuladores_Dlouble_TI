const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  connectionString: 'postgresql://postgres:password@localhost:5432/nextn_db'
});

async function createMauroUser() {
  try {
    console.log('🔐 Criando usuário mauro@gmail.com...');
    
    // Gerar hash da senha
    const password = 'Comercial2025';
    const passwordHash = await bcrypt.hash(password, 12);
    
    console.log('🔑 Hash da senha gerado:', passwordHash.substring(0, 20) + '...');
    
    // Inserir usuário no banco
    const userId = uuidv4();
    const result = await pool.query(
      `INSERT INTO users (id, email, password_hash, name, role, is_active, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
       RETURNING id, email, name, role`,
      [userId, 'mauro@gmail.com', passwordHash, 'Mauro', 'admin', true]
    );
    
    console.log('✅ Usuário criado com sucesso:', result.rows[0]);
    
    // Testar a senha
    console.log('🧪 Testando a senha...');
    const isValid = await bcrypt.compare(password, passwordHash);
    console.log('✅ Senha válida:', isValid);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
  }
}

createMauroUser();