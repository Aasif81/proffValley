const User = require("../models/user");

// Render signup form
module.exports.renderSignup = (req, res) => {
  res.render("users/signup");
};

// Handle signup logic
module.exports.signup = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Professor Rating!");
      res.redirect("/");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

// Render login form
module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

// Handle login logic
module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!");
  const redirectUrl = req.session.returnTo || "/";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

// Handle logout logic
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Goodbye! See you soon 👋");
    res.redirect("/");
  });
};
