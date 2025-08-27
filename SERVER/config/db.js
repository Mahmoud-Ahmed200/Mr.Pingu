const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = pool;


pool
  .connect()
  .then((client) => {
    console.log("✅ Database connected successfully");
    client.release(); // release back to pool
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err.stack);
    console.error(err);
  });

module.exports = pool;
