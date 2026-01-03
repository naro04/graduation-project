const fs = require('fs');
const path = require('path');
const pool = require('../connection');

const buildSchema = async () => {
    try {
        console.log("Building Schema (tables only)...");
        
        const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql')).toString();
        await pool.query(schemaSql);

        console.log("Schema built successfully!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Error building schema:", err.message);
        process.exit(1);
    }
};

buildSchema();
