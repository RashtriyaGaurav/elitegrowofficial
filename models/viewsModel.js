const mongoose = require('mongoose');

const viewsSchema = new mongoose.Schema({
  visited: Number,
  date: String,
  deviceInfo: {
    userAgent: String,
    platform: String,
    language: String,
    cpuClass: String || 'Unknown',
    deviceMemory: String || 'Unknown',
    hardwareConcurrency: String || 'Unknown'
  }

});

module.exports = mongoose.model('Views', viewsSchema);
