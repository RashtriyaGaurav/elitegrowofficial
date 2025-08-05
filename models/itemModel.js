const mongoose = require('mongoose');
mongoose.connect(`${process.env.MONGODB_URI}/EliteGrow`)

const itemSchema = mongoose.Schema({
    itemImage: Buffer,
    itemName: String,
    itemLink: String,
    clicks: Number,
    itemPath: String,
    createdBy: String,
    createdDate: {
        type: Date,
        default: Date.now
    },
    updatedDate: {
        type: Date,
        default: Date.now
    },
    impressions: Number,
    likes: Number


});

module.exports = mongoose.model('item', itemSchema);