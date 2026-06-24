// routes/auth.js
const express = require('express');
const r = express.Router();
const { register, login, googleAuth, getMe, updateProfile, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
r.post('/register', register);
r.post('/login',    login);
r.post('/google',   googleAuth);
r.get('/me',        protect, getMe);
r.put('/profile',   protect, updateProfile);
r.post('/logout',   protect, logout);
module.exports = r;
