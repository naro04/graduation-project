const app = require("./app");
const PORT = app.get("port");
const pool = require('./connection');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database error:', err);
  } else {
    console.log('✅ DB Time:', res.rows[0]);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});