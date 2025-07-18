const mongoose = require('mongoose');
mongoose.connect(`${process.env.MONGODB_URI}/EliteGrow`)

const itemSchema = mongoose.Schema({
    itemImage: Buffer,
    itemName: String,
    itemLink: String
});

module.exports = mongoose.model('item', itemSchema);