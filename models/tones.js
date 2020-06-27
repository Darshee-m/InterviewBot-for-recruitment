const mongoose = require('mongoose');

const toneSchema = mongoose.Schema({
    text: String,
    joy: Number,
    anger: Number,
    analytical: Number,
    fear: Number,
    confident: Number,
    sadness: Number,
    tentative: Number
});

module.exports = mongoose.model('Tone', toneSchema);