const pool = require('./connection');

async function seedProjects() {
  try {
    console.log('Seeding projects...');
    await pool.query(`
      INSERT INTO projects (name, description, status)
      VALUES 
        ('HR System Development', 'Building the new HR management system', 'active'),
        ('Employee Wellness Program', 'Initiatives to improve employee well-being', 'active'),
        ('Field Operations Expansion', 'Expanding activities in new regions', 'active')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log('✅ Projects seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding projects:', err);
    process.exit(1);
  }
}

seedProjects();

