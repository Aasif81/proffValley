require('dotenv').config();
const express = require("express");

const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const userRoutes = require("./routes/users");
const professorRoutes = require("./routes/professors");
const reviewRoutes = require("./routes/reviews");

const app = express();
const methodOverride = require("method-override");

// MongoDB Connection
const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/professor-rating";

mongoose.connect(dbUrl)
  .then(() => console.log("✅ Database connected:", dbUrl))
  .catch(err => console.error("❌ Connection error:", err));


// EJS Setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname, "public")));

// Session Config
const sessionConfig = {
  secret: "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

// Passport Setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware for flash & currentUser (must be after passport.session)
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Routes
app.use("/professors", professorRoutes);
app.use("/professors/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

// Default home route
app.get("/", (req, res) => {
  res.render("users/home");
});

// ✅ Added for Google & Microsoft login START
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);
require("./passport-config"); // ensures Google/Microsoft strategies are registered
// ✅ Added for Google & Microsoft login END

// Start server
app.listen(3000, () => {
  console.log("Serving on port 3000");
});






