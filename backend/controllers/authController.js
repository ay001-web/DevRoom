const User = require('../models/User');
const jwt  = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const sendToken = (user, status, res) => {
  res.status(status).json({
    success: true,
    token: signToken(user._id),
    user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar, github: user.github, bio: user.bio, skills: user.skills, roomsCreated: user.roomsCreated }
  });
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields required' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password min 6 characters' });
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password });
    sendToken(user, 201, res);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    await User.findByIdAndUpdate(user._id, { isOnline: true });
    sendToken(user, 200, res);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/auth/google
exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'No credential' });
    const ticket = await client.verifyIdToken({
      idToken: credential, audience: process.env.GOOGLE_CLIENT_ID
    });
    const { sub: googleId, email, name, picture } = ticket.getPayload();
    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (!user) user = await User.create({ name, email, googleId, avatar: picture });
    else if (!user.googleId) { user.googleId = googleId; user.avatar = picture; await user.save(); }
    await User.findByIdAndUpdate(user._id, { isOnline: true });
    sendToken(user, 200, res);
  } catch (err) { res.status(401).json({ message: 'Google auth failed: ' + err.message }); }
};

// GET /api/auth/me
exports.getMe = async (req, res) => res.json({ success: true, user: req.user });

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, github, skills } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id, { name, bio, github, skills }, { new: true }
    ).select('-password');
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { isOnline: false, lastSeen: new Date() });
  res.json({ success: true });
};
