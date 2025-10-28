// routes/auth.js
const express = require('express');
const router = express.Router();
const passport = require('passport');

// Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', failureFlash: true }),
  (req, res) => {
    req.flash('success', 'Logged in with Google');
    res.redirect(req.session.returnTo || '/');
  });

// Microsoft (if configured)
router.get('/microsoft', passport.authenticate('azure_ad_oauth2'));

router.get('/microsoft/callback',
  passport.authenticate('azure_ad_oauth2', { failureRedirect: '/login', failureFlash: true }),
  (req, res) => {
    req.flash('success', 'Logged in with Microsoft');
    res.redirect(req.session.returnTo || '/');
  });

module.exports = router;

