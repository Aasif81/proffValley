// models/user.js
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  isAdmin: { type: Boolean, default: false },
  googleId: String,
  microsoftId: String
});

UserSchema.plugin(passportLocalMongoose); // adds username, hash, salt, authenticate()
module.exports = mongoose.model('User', UserSchema);


