const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");
const router = express.Router();
const pool = require("../db/pool");

router.get("/signup", (req, res) => {
  res.render("signup", { user: null });
});

router.post("/signup", async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  if (!username || !password || password !== confirmPassword) {
    return res.render("signup", {
      error: "Invalid input or passwords do not match.",
      user: null,
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = "INSERT INTO users (username, password) VALUES ($1, $2)";
    await pool.query(query, [username, hashedPassword]);

    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.render("signup", {
      error: "Something went wrong!",
      user: null,
    });
  }
});

router.get("/login", (req, res) => {
  res.render("login", { user: null });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  }),
  (req, res) => {
    console.log("Session after login:", req.session);
  }
);

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) console.error(err);
    res.redirect("/");
  });
});

module.exports = router;
