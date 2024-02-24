// /app/models/userModel.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  // Add more fields as needed
});

module.exports = mongoose.model('User', userSchema);
