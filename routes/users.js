const express = require("express");
const passport = require("passport");
const router = express.Router();
const users = require("../controllers/users");

// Signup Routes
router.get("/signup", users.renderSignup);
router.post("/signup", users.signup);

// Login Routes
router.get("/login", users.renderLogin);
router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  users.login
);

// ✅ Google OAuth Login
router.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", failureFlash: true }),
  (req, res) => {
    req.flash("success", `Welcome back, ${req.user.username || "User"}!`);
    res.redirect("/professors");
  }
);

// ✅ Microsoft OAuth Login
router.get("/auth/microsoft",
  passport.authenticate("microsoft", { scope: ["user.read"] })
);

router.get("/auth/microsoft/callback",
  passport.authenticate("microsoft", { failureRedirect: "/login", failureFlash: true }),
  (req, res) => {
    req.flash("success", `Welcome back, ${req.user.username || "User"}!`);
    res.redirect("/professors");
  }
);

// Logout Route
router.get("/logout", users.logout);

module.exports = router;

