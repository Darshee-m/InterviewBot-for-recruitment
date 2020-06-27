const mongoose = require('mongoose');

const personalitySchema = mongoose.Schema({
    wholeText: String,
    openness: Number,
    conscientiousness: Number,
    extraversion: Number,
    agreeableness: Number,
    neuroticism: Number
});

module.exports = mongoose.model('Personality', personalitySchema);