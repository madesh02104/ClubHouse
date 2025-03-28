const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.getAllMessages = async () => {
  const result = await pool.query(`
    SELECT 
      m.id, 
      m.content, 
      m.title, 
      m.user_id, 
      m.created_at,
      u.username 
    FROM messages m
    LEFT JOIN users u ON m.user_id = u.id
    ORDER BY m.created_at DESC
  `);
  console.log("First message in getAllMessages:", result.rows[0]);
  return result.rows;
};

pool.createMessage = async (content, user_id, title = null) => {
  await pool.query(
    "INSERT INTO messages (content, user_id, title, created_at) VALUES ($1, $2, $3, NOW())",
    [content, user_id, title]
  );
};

pool.deleteMessage = async (id) => {
  await pool.query("DELETE FROM messages WHERE id = $1", [id]);
};

pool.on("error", (err) => {
  console.error("Unexpected error on idle client:", err);
  process.exit(-1);
});

module.exports = pool;
