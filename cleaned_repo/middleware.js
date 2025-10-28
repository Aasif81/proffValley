const Review = require("./models/review");

// 🔹 Check if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

// 🔹 Check if user is an Admin
module.exports.isAdmin = (req, res, next) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) {
    req.flash("error", "You must be an admin to do that!");
    return res.redirect("/login");
  }
  next();
};

// 🔹 Check if user is the author of a review
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You don’t have permission to do that!");
    return res.redirect(`/professors/${id}`);
  }
  next();
};

module.exports.isReviewAuthorOrAdmin = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId).populate("author");
  if (!review) {
    req.flash("error", "Review not found");
    return res.redirect(`/professors/${id}`);
  }

  // If current user is not the author AND not an admin
  if (!review.author._id.equals(req.user._id) && !req.user.isAdmin) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/professors/${id}`);
  }

  next();
};

