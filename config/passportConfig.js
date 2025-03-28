const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const pool = require("../db/pool");

function initializePassport() {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const userResult = await pool.query(
          "SELECT * FROM users WHERE username = $1",
          [username]
        );
        const user = userResult.rows[0];

        if (!user) {
          return done(null, false, { message: "No user with that username." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Password incorrect." });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id, done) => {
    try {
      const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
        id,
      ]);
      const user = userResult.rows[0];
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}

module.exports = initializePassport;
