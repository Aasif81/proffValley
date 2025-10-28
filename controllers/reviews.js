const Professor = require("../models/professor");
const Review = require("../models/review");

// Create Review
module.exports.createReview = async (req, res) => {
  const professor = await Professor.findById(req.params.id);

const { body, attendance, grading, fypSupport } = req.body.review;
const review = new Review({
  body: body || "", // optional
  attendance: Number(attendance),
  grading: Number(grading),
  fypSupport: Number(fypSupport),
  author: req.user._id
});


  professor.reviews.push(review);

  // Save both
  await review.save();
  await professor.save();

  // Recalculate averages
  const allReviews = await Review.find({ _id: { $in: professor.reviews } });

  if (allReviews.length > 0) {
    const attendanceAvg =
      allReviews.reduce((acc, r) => acc + r.attendance, 0) / allReviews.length;
    const gradingAvg =
      allReviews.reduce((acc, r) => acc + r.grading, 0) / allReviews.length;
    const fypAvg =
      allReviews.reduce((acc, r) => acc + r.fypSupport, 0) / allReviews.length;

    // Optional: overall average of 3 categories
    const overallAvg = (attendanceAvg + gradingAvg + fypAvg) / 3;

    professor.attendanceAvg = attendanceAvg.toFixed(1);
    professor.gradingAvg = gradingAvg.toFixed(1);
    professor.fypAvg = fypAvg.toFixed(1);
    professor.averageRating = overallAvg.toFixed(1);
    professor.totalRatings = allReviews.length;

    await professor.save();
  }

  req.flash("success", "Successfully added a review!");
  res.redirect(`/professors/${professor._id}`);
};

// Delete Review
module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Professor.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  const professor = await Professor.findById(id).populate("reviews");

  if (professor.reviews.length > 0) {
    const attendanceAvg =
      professor.reviews.reduce((acc, r) => acc + r.attendance, 0) /
      professor.reviews.length;
    const gradingAvg =
      professor.reviews.reduce((acc, r) => acc + r.grading, 0) /
      professor.reviews.length;
    const fypAvg =
      professor.reviews.reduce((acc, r) => acc + r.fypSupport, 0) /
      professor.reviews.length;

    const overallAvg = (attendanceAvg + gradingAvg + fypAvg) / 3;

professor.attendanceAvg = Number(attendanceAvg.toFixed(1));
professor.gradingAvg = Number(gradingAvg.toFixed(1));
professor.fypAvg = Number(fypAvg.toFixed(1));
professor.averageRating = Number(overallAvg.toFixed(1));
professor.totalRatings = professor.reviews.length;

  } else {
    professor.attendanceAvg = 0;
    professor.gradingAvg = 0;
    professor.fypAvg = 0;
    professor.averageRating = 0;
    professor.totalRatings = 0;
  }

  await professor.save();

  req.flash("success", "Successfully deleted review!");
  res.redirect(`/professors/${id}`);
};
// Render Edit Review Form
module.exports.renderEditForm = async (req, res) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "Review not found!");
    return res.redirect(`/professors/${id}`);
  }
  res.render("reviews/edit", { professorId: id, review });
};

// Update Review
module.exports.updateReview = async (req, res) => {
  const { id, reviewId } = req.params;
  const { body, attendance, grading, fypSupport } = req.body.review;

  const review = await Review.findByIdAndUpdate(
    reviewId,
    {
      body,
      attendance: Number(attendance),
      grading: Number(grading),
      fypSupport: Number(fypSupport),
    },
    { new: true }
  );

  // Recalculate averages after update
  const professor = await Professor.findById(id).populate("reviews");
  if (professor.reviews.length > 0) {
    const attendanceAvg =
      professor.reviews.reduce((acc, r) => acc + r.attendance, 0) / professor.reviews.length;
    const gradingAvg =
      professor.reviews.reduce((acc, r) => acc + r.grading, 0) / professor.reviews.length;
    const fypAvg =
      professor.reviews.reduce((acc, r) => acc + r.fypSupport, 0) / professor.reviews.length;
    const overallAvg = (attendanceAvg + gradingAvg + fypAvg) / 3;

    professor.attendanceAvg = attendanceAvg.toFixed(1);
    professor.gradingAvg = gradingAvg.toFixed(1);
    professor.fypAvg = fypAvg.toFixed(1);
    professor.averageRating = overallAvg.toFixed(1);
  }

  await professor.save();

  req.flash("success", "Successfully updated your review!");
  res.redirect(`/professors/${id}`);
};

