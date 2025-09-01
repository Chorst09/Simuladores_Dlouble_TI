const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/nextn_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const MIGRATIONS_DIR = path.join(__dirname, '../database/migrations');

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database migration process...');
    
    // 1. Create schema_migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Ensured schema_migrations table exists.');

    // 2. Get applied migrations from the database
    const { rows: appliedMigrations } = await client.query('SELECT version FROM schema_migrations');
    const appliedVersions = new Set(appliedMigrations.map(row => row.version));
    console.log(`🔍 Found ${appliedVersions.size} applied migrations in the database.`);

    // 3. Get available migration files from the filesystem
    const availableFiles = await fs.readdir(MIGRATIONS_DIR);
    const sqlFiles = availableFiles
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort alphabetically to ensure order
    console.log(`📂 Found ${sqlFiles.length} migration files in the directory.`);

    // 4. Determine and apply pending migrations
    let appliedCount = 0;
    for (const file of sqlFiles) {
      if (!appliedVersions.has(file)) {
        console.log(`🔄 Applying migration: ${file}...`);
        
        const filePath = path.join(MIGRATIONS_DIR, file);
        const sql = await fs.readFile(filePath, 'utf-8');
        
        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`✅ Successfully applied ${file}`);
          appliedCount++;
        } catch (error) {
          await client.query('ROLLBACK');
          console.error(`❌ Error applying migration ${file}:`, error);
          throw error; // Stop execution on failure
        }
      }
    }

    if (appliedCount === 0) {
      console.log('✨ Database is already up to date.');
    } else {
      console.log(`🎉 Successfully applied ${appliedCount} new migration(s).`);
    }

  } catch (error) {
    console.error('❌ A critical error occurred during the migration process:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

runMigrations()
  .then(() => {
    console.log('🏁 Migration process finished successfully.');
    pool.end();
    process.exit(0);
  })
  .catch(() => {
    // Error is already logged in the runMigrations function
    pool.end();
    process.exit(1);
  });