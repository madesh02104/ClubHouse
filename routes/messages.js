const express = require("express");
const router = express.Router();
const pool = require("../db/pool");

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

router.get("/", async (req, res) => {
  try {
    const messages = await pool.query(`
      SELECT m.*, u.username 
      FROM messages m
      LEFT JOIN users u ON m.user_id = u.id
      ORDER BY m.created_at DESC
    `);

    res.render("messages", { messages: messages.rows, user: req.user });
  } catch (err) {
    console.error("Failed to fetch messages:", err);
    res.render("messages", {
      messages: [],
      user: req.user,
      error: "Failed to load messages.",
    });
  }
});

router.get("/new", isAuthenticated, (req, res) => {
  res.render("newMessage", { user: req.user });
});

router.post("/new", isAuthenticated, async (req, res) => {
  const { title, text } = req.body;

  try {
    const query =
      "INSERT INTO messages (title, content, user_id) VALUES ($1, $2, $3)";
    await pool.query(query, [title, text, req.user.id]);
    res.redirect("/messages");
  } catch (err) {
    console.error("Failed to create message:", err);
    res.redirect("/messages");
  }
});

router.post("/:id/delete", isAuthenticated, async (req, res) => {
  const messageId = req.params.id;

  try {
    const query = "DELETE FROM messages WHERE id = $1 AND user_id = $2";
    await pool.query(query, [messageId, req.user.id]);

    const referer = req.get("Referer");
    if (referer && referer.includes("/messages")) {
      res.redirect("/messages");
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.error("Failed to delete message:", err);
    res.redirect("/");
  }
});

module.exports = router;
