require('dotenv').config();
const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const path       = require('path');
const connectDB  = require('./config/db');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true },
  pingTimeout: 60000,
});

connectDB();
app.set('io', io);

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// API Routes
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/rooms',   require('./routes/rooms'));
app.use('/api/execute', require('./routes/execute'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', uptime: process.uptime() }));

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'))
  );
}

// Socket.io
require('./socket/socketHandler')(io);

const PORT = process.env.PORT || 5000;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('\n');
    console.log('  ❌ PORT ' + PORT + ' IS ALREADY IN USE');
    console.log('  ─────────────────────────────────────────');
    console.log('  Another process is using this port.');
    console.log('  Fix it by running ONE of these commands:\n');
    console.log('  Windows:');
    console.log('    taskkill /F /IM node.exe\n');
    console.log('  Mac/Linux:');
    console.log('    lsof -ti:' + PORT + ' | xargs kill -9\n');
    console.log('  Then run: npm run dev');
    console.log('  ─────────────────────────────────────────\n');
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log('\n');
  console.log('  ██████╗ ███████╗██╗   ██╗██████╗  ██████╗  ██████╗ ███╗   ███╗');
  console.log('  ██╔══██╗██╔════╝██║   ██║██╔══██╗██╔═══██╗██╔═══██╗████╗ ████║');
  console.log('  ██║  ██║█████╗  ██║   ██║██████╔╝██║   ██║██║   ██║██╔████╔██║');
  console.log('  ██║  ██║██╔══╝  ╚██╗ ██╔╝██╔══██╗██║   ██║██║   ██║██║╚██╔╝██║');
  console.log('  ██████╔╝███████╗ ╚████╔╝ ██║  ██║╚██████╔╝╚██████╔╝██║ ╚═╝ ██║');
  console.log('  ╚═════╝ ╚══════╝  ╚═══╝  ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝     ╚═╝');
  console.log('\n  🚀 Collaborative Code Editor — Real-time');
  console.log(`  🌐 Backend:  http://localhost:${PORT}/api`);
  console.log(`  📡 Socket:   ws://localhost:${PORT}`);
  console.log('  ─────────────────────────────────────────');
  console.log('  Routes:');
  console.log('    POST /api/auth/register  — Sign up');
  console.log('    POST /api/auth/login     — Sign in');
  console.log('    GET  /api/rooms          — All rooms');
  console.log('    POST /api/rooms          — Create room');
  console.log('    POST /api/execute        — Run code');
  console.log('  ─────────────────────────────────────────\n');
});
