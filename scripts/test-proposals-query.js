const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/nextn_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function testProposalsQuery() {
  const client = await pool.connect();
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const connectionTest = await client.query('SELECT NOW()');
    console.log('Database connection successful. Current time:', connectionTest.rows[0].now);
    
    // Test proposals table exists
    const tableCheck = await client.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'proposals')"
    );
    
    if (!tableCheck.rows[0].exists) {
      console.error('Error: proposals table does not exist');
      return;
    }
    
    console.log('proposals table exists. Running test query...');
    
    // Test the actual query with PABX_SIP type
    const result = await client.query(
      `SELECT p.*, u.name as user_name, u.email as user_email 
       FROM proposals p 
       LEFT JOIN users u ON p.user_id = u.id
       WHERE p.type = $1 
       ORDER BY p.created_at DESC`,
      ['PABX_SIP']
    );
    
    console.log(`Found ${result.rows.length} proposals of type PABX_SIP`);
    if (result.rows.length > 0) {
      console.log('Sample proposal:', {
        id: result.rows[0].id,
        type: result.rows[0].type,
        status: result.rows[0].status,
        created_at: result.rows[0].created_at
      });
    }
    
  } catch (error) {
    console.error('Error executing query:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testProposalsQuery();
