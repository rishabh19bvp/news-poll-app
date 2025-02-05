const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
    title: { type: String, unique: true }, // Ensure titles are unique
    description: String,
    imageUrl: String,
    content: String,
    url: String
}, { timestamps: true });

module.exports = mongoose.model('News', NewsSchema);