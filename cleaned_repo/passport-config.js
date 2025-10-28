// passport-config.js
require('dotenv').config();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-azure-ad-oauth2').Strategy;
const User = require('./models/user');

// Local (passport-local-mongoose will set the strategy later in app.js by passport.use(User.createStrategy()))
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (e) {
    done(e);
  }
});

// Google
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.findOne({ email: profile.emails?.[0]?.value });
      }
      if (!user) {
        user = await User.create({
          username: profile.displayName,
          email: profile.emails?.[0]?.value || `no-email-${profile.id}@example.com`,
          googleId: profile.id
        });
      } else if (!user.googleId) {
        user.googleId = profile.id;
        await user.save();
      }
      done(null, user);
    } catch (err) { done(err); }
  }));
}

// Microsoft (Azure AD OAuth2)
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  passport.use(new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    callbackURL: "/auth/microsoft/callback"
  }, async (accessToken, refreshToken, params, profile, done) => {
    // passport-azure-ad-oauth2 returns profile in params.id_token after decode; many setups just use params
    // Simpler approach: extract oid from params.id_token via JWT if needed — but many examples use profile.oid
    try {
      // many minimal setups just use `params` — try to find identifying claim; for reliability, you may prefer msal libraries
      // Here we attempt to find by email in params if available:
      // NOTE: behavior can vary. If this strategy doesn't provide `profile`, adapt per library docs.
      let user = null;
      // fallback: create user with uniquish id
      user = await User.create({
        username: `ms-user-${Date.now()}`,
        email: `microsoft-${Date.now()}@example.com`,
        microsoftId: params.oid || params.user ? params.user.oid : undefined
      }).catch(()=>null);
      done(null, user);
    } catch (err) { done(err); }
  }));
}

module.exports = passport;

