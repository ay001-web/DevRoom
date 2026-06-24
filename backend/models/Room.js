const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const messageSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:    String,
  avatar:  String,
  text:    String,
  time:    { type: Date, default: Date.now },
});

const roomSchema = new mongoose.Schema({
  roomId:   { type: String, default: () => uuidv4().slice(0, 8).toUpperCase(), unique: true },
  title:    { type: String, required: true, trim: true },
  language: { type: String, default: 'javascript' },
  code:     { type: String, default: '// Welcome to DevRoom!\n// Start coding together...\n\nconsole.log("Hello, World!");' },
  owner:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [messageSchema],
  isPrivate:  { type: Boolean, default: false },
  password:   { type: String },
  maxUsers:   { type: Number, default: 10 },
  isActive:   { type: Boolean, default: true },
  lastActivity: { type: Date, default: Date.now },
  output:     { type: String, default: '' },
  theme:      { type: String, default: 'vs-dark' },
  fontSize:   { type: Number, default: 14 },
  tags:       [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
