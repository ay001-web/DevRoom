const Room    = require('../models/Room');
const User    = require('../models/User');
const Session = require('../models/Session');

// POST /api/rooms — create room
exports.createRoom = async (req, res) => {
  try {
    const { title, language, isPrivate, password, tags } = req.body;
    if (!title) return res.status(400).json({ message: 'Title required' });

    const room = await Room.create({
      title, language: language || 'javascript',
      owner: req.user._id, isPrivate: isPrivate || false,
      password, tags: tags || [],
      participants: [req.user._id],
      code: getStarterCode(language || 'javascript'),
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { roomsCreated: 1 } });

    const populated = await room.populate('owner', 'name avatar');
    res.status(201).json({ success: true, room: populated });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/rooms — all public rooms
exports.getRooms = async (req, res) => {
  try {
    const { lang, search } = req.query;
    const filter = { isPrivate: false, isActive: true };
    if (lang && lang !== 'all') filter.language = lang;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const rooms = await Room.find(filter)
      .populate('owner', 'name avatar')
      .populate('participants', 'name avatar isOnline')
      .sort('-lastActivity')
      .limit(20);

    res.json({ success: true, rooms });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/rooms/my — my rooms
exports.getMyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      $or: [{ owner: req.user._id }, { participants: req.user._id }]
    })
      .populate('owner', 'name avatar')
      .populate('participants', 'name avatar isOnline')
      .sort('-lastActivity')
      .limit(20);
    res.json({ success: true, rooms });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/rooms/:roomId — get single room
exports.getRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId })
      .populate('owner', 'name avatar')
      .populate('participants', 'name avatar isOnline')
      .populate('messages.user', 'name avatar');

    if (!room) return res.status(404).json({ message: 'Room not found' });

    // Password check
    if (room.isPrivate && room.password) {
      const { password } = req.query;
      if (!password || password !== room.password)
        return res.status(403).json({ message: 'Wrong password', requiresPassword: true });
    }

    // Add to participants
    if (!room.participants.find(p => p._id.toString() === req.user._id.toString())) {
      room.participants.push(req.user._id);
      await room.save();
      await User.findByIdAndUpdate(req.user._id, { $inc: { roomsJoined: 1 } });
    }

    room.lastActivity = new Date();
    await room.save();

    res.json({ success: true, room });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PATCH /api/rooms/:roomId/code — save code
exports.updateCode = async (req, res) => {
  try {
    const { code, language } = req.body;
    const room = await Room.findOneAndUpdate(
      { roomId: req.params.roomId },
      { code, language, lastActivity: new Date() },
      { new: true }
    );
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ success: true, room });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// DELETE /api/rooms/:roomId — delete room (owner only)
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (room.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only owner can delete' });
    await room.deleteOne();
    res.json({ success: true, message: 'Room deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/rooms/stats — dashboard stats
exports.getStats = async (req, res) => {
  try {
    const totalRooms   = await Room.countDocuments({ isActive: true });
    const myRooms      = await Room.countDocuments({ owner: req.user._id });
    const totalUsers   = await User.countDocuments();
    const onlineUsers  = await User.countDocuments({ isOnline: true });
    const recentRooms  = await Room.find({ isPrivate: false, isActive: true })
      .populate('owner', 'name avatar')
      .sort('-createdAt').limit(5);

    res.json({ success: true, stats: { totalRooms, myRooms, totalUsers, onlineUsers, recentRooms } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Helper — starter code per language
function getStarterCode(lang) {
  const starters = {
    javascript: `// 🚀 DevRoom - JavaScript\nconsole.log("Hello, World!");\n\n// Write your code here...\nfunction solution() {\n  \n}\n\nsolution();`,
    python:     `# 🚀 DevRoom - Python\nprint("Hello, World!")\n\n# Write your code here...\ndef solution():\n    pass\n\nsolution()`,
    java:       `// 🚀 DevRoom - Java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
    cpp:        `// 🚀 DevRoom - C++\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
    c:          `// 🚀 DevRoom - C\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`,
    typescript: `// 🚀 DevRoom - TypeScript\nconst greeting: string = "Hello, World!";\nconsole.log(greeting);\n\nfunction solution(n: number): number {\n    return n;\n}`,
    go:         `// 🚀 DevRoom - Go\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}`,
    rust:       `// 🚀 DevRoom - Rust\nfn main() {\n    println!("Hello, World!");\n}`,
    php:        `<?php\n// 🚀 DevRoom - PHP\necho "Hello, World!\\n";\n\nfunction solution() {\n    \n}\n\nsolution();`,
    ruby:       `# 🚀 DevRoom - Ruby\nputs "Hello, World!"\n\ndef solution\n  \nend\n\nsolution`,
  };
  return starters[lang] || starters.javascript;
}
