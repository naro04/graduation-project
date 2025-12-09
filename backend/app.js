const express = require("express");
const app = express();

// ===== Middleware =====
app.use(express.json()); // عشان نقرأ JSON من body

// ===== Test Route =====
app.get("/", (req, res) => {
  res.json({ message: "HR Backend App is running ✅" });
});

// ===== Port =====
const PORT = 5000;
app.set("port", PORT);

module.exports = app;
