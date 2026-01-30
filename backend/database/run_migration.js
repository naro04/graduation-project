const pool = require('./connection');

async function runMigration() {
  try {
    console.log('Running migration...');
    await pool.query(`
      ALTER TABLE activities ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id);
      ALTER TABLE activities ADD COLUMN IF NOT EXISTS images TEXT[];
    `);
    console.log('✅ Migration successful');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigration();

