const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Cloudinary-style image subdocument
const ImageSchema = new Schema({
  url: String,
  filename: String,
});

const ProfessorSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  department: String,
  university: String,

  image: {
    type: ImageSchema,
    default: {
      url: '/images/default-professor.jpg', // local fallback image
      filename: 'default-professor',
    },
  },

  averageRating: {
    type: Number,
    default: 0,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Professor", ProfessorSchema);
