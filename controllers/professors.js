const Professor = require("../models/professor");
const Review = require("../models/review");

// Show all professors
module.exports.index = async (req, res) => {
  try {
    const { q, department, minRating, maxRating, sort } = req.query;
    const query = {};

    // 🔍 Name or Department search
    if (q) {
      query.$or = [
        { name: new RegExp(q, 'i') },
        { department: new RegExp(q, 'i') }
      ];
    }

    // 🎓 Department filter (if dropdown used)
    if (department) {
      query.department = new RegExp(department, 'i');
    }

    // ⭐ Rating range filter
    if (minRating || maxRating) {
      query.averageRating = {};
      if (minRating) query.averageRating.$gte = Number(minRating);
      if (maxRating) query.averageRating.$lte = Number(maxRating);
    }

    // 📊 Sorting options
    let sortOption = {};
    if (sort === 'highest') sortOption = { averageRating: -1 };
    else if (sort === 'most') sortOption = { totalRatings: -1 };
    else if (sort === 'alphabetical') sortOption = { name: 1 };

    const professors = await Professor.find(query).sort(sortOption);

    res.render('professors/index', {
      professors,
      query: q || '',
      department: department || '',
      minRating: minRating || '',
      maxRating: maxRating || '',
      sort: sort || ''
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong while fetching professors.');
    res.redirect('/');
  }
};


// Render new form
module.exports.renderNewForm = (req, res) => {
  res.render("professors/new");
};
// Create new professor
module.exports.createProfessor = async (req, res) => {
  try {
    const { name, department } = req.body.professor;

    const professor = new Professor({
      name,
      department,
      author: req.user._id
    });

    if (req.file) {
      // Cloudinary upload success case
      professor.image = {
        url: req.file.path,
        filename: req.file.filename
      };
    } else {
      // Fallback when no image uploaded
      professor.image = {
        url: '/images/default-professor.jpg',
        filename: 'default-professor'
      };
    }

    await professor.save();
    req.flash("success", "Successfully added a new professor!");
    res.redirect(`/professors/${professor._id}`);
  } catch (e) {
    console.log(e);
    req.flash("error", e.message);
    res.redirect("/professors");
  }
};

// Show one professor (with averages)
module.exports.showProfessor = async (req, res) => {
  const professor = await Professor.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("author");

  if (!professor) {
    req.flash("error", "Cannot find that professor!");
    return res.redirect("/professors");
  }

  const totalReviews = professor.reviews.length;
  let attendanceAvg = 0;
  let gradingAvg = 0;
  let fypAvg = 0;
  let overallAvg = 0;

  if (totalReviews > 0) {
    attendanceAvg =
      professor.reviews.reduce((sum, r) => sum + (r.attendance || 0), 0) /
      totalReviews;
    gradingAvg =
      professor.reviews.reduce((sum, r) => sum + (r.grading || 0), 0) /
      totalReviews;
    fypAvg =
      professor.reviews.reduce((sum, r) => sum + (r.fypSupport || 0), 0) /
      totalReviews;

    // 🔹 Calculate and save overall average
    overallAvg = (attendanceAvg + gradingAvg + fypAvg) / 3;
    professor.averageRating = overallAvg;
    await professor.save();
  }

  res.render("professors/show", {
    professor,
    attendanceAvg,
    gradingAvg,
    fypAvg,
    currentUser: req.user,
  });
};

// Render edit form
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const professor = await Professor.findById(id);
  if (!professor) {
    req.flash("error", "Cannot find that professor!");
    return res.redirect("/professors");
  }
  res.render("professors/edit", { professor });
};

// Update professor
module.exports.updateProfessor = async (req, res) => {
  const { id } = req.params;
  const professor = await Professor.findByIdAndUpdate(id, {
    ...req.body.professor,
  });
  req.flash("success", "Successfully updated professor details!");
  res.redirect(`/professors/${professor._id}`);
};

// Delete professor
module.exports.deleteProfessor = async (req, res) => {
  const { id } = req.params;
  await Professor.findByIdAndDelete(id);
  req.flash("success", "Professor deleted!");
  res.redirect("/professors");
};


