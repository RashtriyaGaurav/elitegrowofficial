const mongoose = require('mongoose');

const viewsSchema = new mongoose.Schema({
  visited: Number,
  date: String
});

module.exports = mongoose.model('Views', viewsSchema);
