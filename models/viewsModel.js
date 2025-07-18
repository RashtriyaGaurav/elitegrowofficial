const mongoose = require('mongoose');

const viewsSchema = new mongoose.Schema({
  email: { type: String, default:  '' },
  visited: Number,
  date: String
});

module.exports = mongoose.model('Views', viewsSchema);
