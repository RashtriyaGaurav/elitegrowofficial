const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  userUploads : [],
  
  
});

module.exports = mongoose.model('User', userSchema);
