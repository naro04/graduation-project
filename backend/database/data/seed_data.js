const fs = require('fs');
const path = require('path');
const pool = require('../connection');

const seedData = async () => {
    try {
        console.log("🌱 Seeding Data...");
        
        const dummySql = fs.readFileSync(path.join(__dirname, 'dummy_data.sql')).toString();
        await pool.query(dummySql);

        console.log("✅ Data seeded successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error seeding data:", err.message);
        process.exit(1);
    }
};

seedData();
