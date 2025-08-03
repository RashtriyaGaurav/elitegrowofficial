const mongoose = require('mongoose');

const activeUserSchema = new mongoose.Schema({
  count: Number,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ActiveUser', activeUserSchema);
