const express = require('express');
const router = express.Router({ mergeParams: true });
const professors = require('../controllers/professors');
const multer = require('multer');
const { storage } = require('../utils/cloudinary');
const upload = multer({ storage });
const Review = require('../models/review');
const Professor = require('../models/professor');
const { isLoggedIn,isAdmin } = require('../middleware');



// 🔍 Live search API (JSON)
router.get('/search/live', async (req, res) => {
  try {
    const query = req.query.q || "";
    const professors = await Professor.find({
      $or: [
        { name: new RegExp(query, "i") },
        { department: new RegExp(query, "i") }
      ]
    }).limit(5); // limit for speed
    res.json(professors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// All professors
// All professors (with search functionality)
router.get('/', async (req, res) => {
  const { q } = req.query;

  let professors;
  if (q && q.trim() !== "") {
    // Case-insensitive search by name or department
    professors = await Professor.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { department: { $regex: q, $options: "i" } }
      ]
    });
  } else {
    professors = await Professor.find({});
  }

  res.render('professors/index', { professors, query: q });
});

// New professor form (Admin only)
router.get('/new', isAdmin, professors.renderNewForm);

// 🧠 Create new professor (with image upload)
router.post('/', isAdmin, upload.single('image'), professors.createProfessor);

// ✅ SHOW single professor
router.get('/:id', professors.showProfessor);

// Edit professor form (Admin only)
router.get('/:id/edit', isAdmin, professors.renderEditForm);

// Update professor (Admin only)
router.put('/:id', isAdmin, professors.updateProfessor);

// Delete professor (Admin only)
router.delete('/:id', isAdmin, professors.deleteProfessor);



// ✅ Create review (and prevent duplicate reviews)
router.post('/:id/reviews', isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const { body, attendance, grading, fypSupport } = req.body.review;

    // Check if the user already reviewed this professor
    const existingReview = await Review.findOne({ author: req.user._id, professor: id });
    if (existingReview) {
      req.flash('error', 'You have already reviewed this professor.');
      return res.redirect(`/professors/${id}`);
    }

    // Create a new review
    const review = new Review({
      body,
      attendance: Number(attendance),
      grading: Number(grading),
      fypSupport: Number(fypSupport),
      author: req.user._id,
      professor: id
    });

    await review.save();

    // Attach review to professor
    const professor = await Professor.findById(id);
    professor.reviews.push(review);
    await professor.save();

    // Recalculate averages
    const updatedProfessor = await Professor.findById(id).populate('reviews');
    const totalReviews = updatedProfessor.reviews.length;

    const attendanceAvg = updatedProfessor.reviews.reduce((sum, r) => sum + (r.attendance || 0), 0) / totalReviews;
    const gradingAvg = updatedProfessor.reviews.reduce((sum, r) => sum + (r.grading || 0), 0) / totalReviews;
    const fypAvg = updatedProfessor.reviews.reduce((sum, r) => sum + (r.fypSupport || 0), 0) / totalReviews;
    const overallAvg = (attendanceAvg + gradingAvg + fypAvg) / 3;

    updatedProfessor.averageRating = overallAvg;
    await updatedProfessor.save();

    req.flash('success', 'Successfully added your review!');
    res.redirect(`/professors/${id}`);

  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong while adding the review.');
    res.redirect('back');
  }
});



module.exports = router;
