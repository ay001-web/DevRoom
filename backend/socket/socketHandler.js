const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const Room = require('../models/Room');

// Track users in each room: roomId -> Set of { socketId, userId, name, avatar }
const roomUsers = new Map();

module.exports = (io) => {

  // Auth middleware for sockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('No token'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = await User.findById(decoded.id).select('-password');
      if (!socket.user) return next(new Error('User not found'));
      next();
    } catch {
      next(new Error('Auth failed'));
    }
  });

  io.on('connection', async (socket) => {
    const user = socket.user;
    console.log(`🔌 ${user.name} connected — ${socket.id}`);

    // Update online status
    await User.findByIdAndUpdate(user._id, { isOnline: true });

    // ── Join Room ─────────────────────────────────────
    socket.on('room:join', async ({ roomId }) => {
      socket.join(roomId);

      // Track user in room
      if (!roomUsers.has(roomId)) roomUsers.set(roomId, new Map());
      roomUsers.get(roomId).set(socket.id, {
        socketId: socket.id,
        userId:   user._id.toString(),
        name:     user.name,
        avatar:   user.avatar,
      });

      // Get current room code from DB
      const room = await Room.findOne({ roomId }).select('code language output');

      // Send current state to joining user
      socket.emit('room:state', {
        code:     room?.code || '',
        language: room?.language || 'javascript',
        output:   room?.output || '',
        users:    [...(roomUsers.get(roomId)?.values() || [])],
      });

      // Tell everyone else this user joined
      socket.to(roomId).emit('room:user_joined', {
        userId: user._id, name: user.name, avatar: user.avatar
      });

      // Send updated user list to all
      io.to(roomId).emit('room:users', [...(roomUsers.get(roomId)?.values() || [])]);

      console.log(`👥 ${user.name} joined room ${roomId}`);
    });

    // ── Code Change (real-time sync) ──────────────────
    socket.on('code:change', async ({ roomId, code, language }) => {
      // Broadcast to everyone else in room (not sender)
      socket.to(roomId).emit('code:update', { code, language, from: user.name });

      // Save to DB (debounced by client — saves every 2 seconds)
      try {
        await Room.findOneAndUpdate({ roomId }, { code, language, lastActivity: new Date() });
      } catch {}
    });

    // ── Cursor position ───────────────────────────────
    socket.on('cursor:move', ({ roomId, position, selection }) => {
      socket.to(roomId).emit('cursor:update', {
        userId: user._id,
        name:   user.name,
        position,
        selection,
        color:  stringToColor(user._id.toString()),
      });
    });

    // ── Chat message ──────────────────────────────────
    socket.on('chat:send', async ({ roomId, text }) => {
      if (!text?.trim()) return;
      const msg = {
        user:   user._id,
        name:   user.name,
        avatar: user.avatar,
        text:   text.trim(),
        time:   new Date(),
      };

      // Save to DB
      try {
        await Room.findOneAndUpdate({ roomId }, { $push: { messages: msg } });
      } catch {}

      // Broadcast to all in room including sender
      io.to(roomId).emit('chat:message', msg);
    });

    // ── Code Output (after execution) ─────────────────
    socket.on('output:update', async ({ roomId, output }) => {
      socket.to(roomId).emit('output:new', { output, from: user.name });
      try {
        await Room.findOneAndUpdate({ roomId }, { output });
      } catch {}
    });

    // ── Typing indicator ──────────────────────────────
    socket.on('typing:start', ({ roomId }) => {
      socket.to(roomId).emit('typing:start', { name: user.name, userId: user._id });
    });
    socket.on('typing:stop', ({ roomId }) => {
      socket.to(roomId).emit('typing:stop', { userId: user._id });
    });

    // ── Language change ───────────────────────────────
    socket.on('language:change', async ({ roomId, language, code }) => {
      io.to(roomId).emit('language:changed', { language, code, by: user.name });
      try {
        await Room.findOneAndUpdate({ roomId }, { language, code });
      } catch {}
    });

    // ── Leave Room ────────────────────────────────────
    socket.on('room:leave', ({ roomId }) => {
      handleLeave(socket, roomId, user, io);
    });

    // ── Disconnect ────────────────────────────────────
    socket.on('disconnect', async () => {
      // Remove from all rooms
      roomUsers.forEach((users, roomId) => {
        if (users.has(socket.id)) {
          handleLeave(socket, roomId, user, io);
        }
      });
      await User.findByIdAndUpdate(user._id, { isOnline: false, lastSeen: new Date() });
      console.log(`🔴 ${user.name} disconnected`);
    });
  });
};

function handleLeave(socket, roomId, user, io) {
  socket.leave(roomId);
  const users = roomUsers.get(roomId);
  if (users) {
    users.delete(socket.id);
    if (users.size === 0) roomUsers.delete(roomId);
    else io.to(roomId).emit('room:users', [...users.values()]);
  }
  socket.to(roomId).emit('room:user_left', { userId: user._id, name: user.name });
}

// Generate consistent color for each user
function stringToColor(str) {
  const colors = ['#e84040','#4a9eff','#2ecc71','#f5a623','#a855f7','#00d4e8','#ff6b6b','#ffd370'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
