const express = require("express");
const session = require("express-session");
const passport = require("passport");
const dotenv = require("dotenv");
const path = require("path");
const pgSession = require("connect-pg-simple")(session);
const { getAllMessages, createMessage } = require("./db/pool");
const { pool } = require("./db/pool");

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const initializePassport = require("./config/passportConfig");
initializePassport();

app.use(
  session({
    store: new pgSession({
      pool,
      tableName: "session",
    }),
    secret: process.env.SESSION_SECRET || "your-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");

app.use("/", authRoutes);
app.use("/messages", messageRoutes);

app.get("/", async (req, res) => {
  try {
    const pool = require("./db/pool");
    const messagesQuery = await pool.query(`
      SELECT m.*, u.username 
      FROM messages m
      LEFT JOIN users u ON m.user_id = u.id
      ORDER BY m.created_at DESC
    `);

    const messages = messagesQuery.rows;

    if (messages.length > 0) {
      console.log("First message structure:", messages[0]);
    }

    res.render("index", { user: req.user || null, messages });
  } catch (err) {
    console.error(err);
    res.render("index", { user: req.user || null, messages: [] });
  }
});
const PORT = process.env.PORT || 3000;

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception thrown:", err);
  process.exit(1);
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
