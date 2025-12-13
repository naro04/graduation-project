const fs = require('fs');
const path = require('path');
const pool = require('../connection'); // اتصال قاعدة البيانات

const rundummyData = async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'dummy_data.sql')).toString();

    console.log("Running seed...");
    await pool.query(sql);

    console.log("data completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error running dummy data:", err);
    process.exit(1);
  }
};

rundummyData();

// Delete all tabels
// & "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d graduation_project_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

//create all tables again
//& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d graduation_project_db -f "C:\Users\PC\Desktop\graduation-project\backend\database\data\schema.sql"

//Run dummy data sql
//& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d graduation_project_db -f "C:\Users\PC\Desktop\graduation-project\backend\database\data\dummy_data.sql"
