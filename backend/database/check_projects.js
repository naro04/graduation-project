const pool = require('./connection');

async function checkProjects() {
  try {
    const res = await pool.query("SELECT id, name FROM projects WHERE status = 'active'");
    console.log('ACTIVE_PROJECTS:', JSON.stringify(res.rows));
    process.exit(0);
  } catch (err) {
    console.error('❌ Error checking projects:', err);
    process.exit(1);
  }
}

checkProjects();

