
const express = require("express");
const router = express.Router({ mergeParams: true });
const reviews = require("../controllers/reviews");
const { isLoggedIn, isReviewAuthor,isReviewAuthorOrAdmin } = require("../middleware");

router.post("/", isLoggedIn, reviews.createReview);
router.delete("/:reviewId", isLoggedIn, isReviewAuthorOrAdmin, reviews.deleteReview);

router.get("/:reviewId/edit", isLoggedIn, isReviewAuthorOrAdmin, reviews.renderEditForm);
router.put("/:reviewId", isLoggedIn, isReviewAuthorOrAdmin, reviews.updateReview);


module.exports = router;