const fs = require('fs');
const path = require('path');
const pool = require('../connection');

const refreshDb = async () => {
    try {
        console.log("🔄 Resetting database...");

        // 1. Drop and Recreate Schema (Clear all tables)
        console.log("🔥 Dropping Schema...");
        await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

        // 2. Run Schema
        console.log("🏗️  Building Schema...");
        const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql')).toString();
        await pool.query(schemaSql);

        // 3. Run Dummy Data
        console.log("🌱 Seeding Data...");
        const dummySql = fs.readFileSync(path.join(__dirname, 'dummy_data.sql')).toString();
        await pool.query(dummySql);

        console.log("✅ Database refreshed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error refreshing database:", err);
        process.exit(1);
    }
};

refreshDb();
