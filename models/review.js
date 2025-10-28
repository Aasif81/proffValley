const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  body: {
    type: String,
    required: false,
    default: ""
  },
  rating: { // overall rating (optional)
    type: Number,
    min: 1,
    max: 5,
  },
  attendance: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  grading: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  fypSupport: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // ✅ Added: link each review to the professor it belongs to
  professor: {
    type: Schema.Types.ObjectId,
    ref: "Professor",
    required: true,
  },

  // ✅ Added: allow replies to reviews
  replies: [
    {
      author: { type: Schema.Types.ObjectId, ref: "User" },
      body: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],

  // ✅ Added: mark as reported for moderation
  reported: {
    type: Boolean,
    default: false,
  }
},
{ timestamps: true } // adds createdAt & updatedAt
);

// ✅ Enforce one review per (author, professor)
reviewSchema.index({ author: 1, professor: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);

