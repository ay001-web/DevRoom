const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  password:   { type: String },
  avatar:     { type: String },
  googleId:   { type: String },
  bio:        { type: String, default: '' },
  skills:     [{ type: String }],
  github:     { type: String, default: '' },
  roomsCreated:   { type: Number, default: 0 },
  roomsJoined:    { type: Number, default: 0 },
  totalSessions:  { type: Number, default: 0 },
  isOnline:   { type: Boolean, default: false },
  lastSeen:   { type: Date, default: Date.now },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function(entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
