const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  room:       { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  joinedAt:   { type: Date, default: Date.now },
  leftAt:     { type: Date },
  duration:   { type: Number, default: 0 }, // seconds
  linesWritten: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
