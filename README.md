# 🚀 DevRoom — Real-time Collaborative Code Editor

> A full-stack MERN application where multiple developers write and run code together in real-time. Think Google Docs, but for code.

---

## ⚡ Quick Start (Get it running in 5 minutes)

```bash
# 1. Install everything
npm run setup

# 2. Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit backend/.env — set MONGO_URI

# 3. Seed demo data
npm run seed

# 4. Run both frontend + backend together
npm run dev
```

Open **http://localhost:3000**

**Demo login:** `vijesh@devroom.com` / `password123`

---

## 📁 Project Structure (What goes where)

```
devroom/
├── backend/                    ← Node.js + Express API
│   ├── models/                 ← MongoDB schemas (data shape)
│   │   ├── User.js             ← User accounts
│   │   ├── Room.js             ← Coding rooms
│   │   └── Session.js          ← Activity tracking
│   ├── controllers/            ← Business logic (the "what happens")
│   │   ├── authController.js   ← Login/Register/Google OAuth
│   │   ├── roomController.js   ← Create/Join/Delete rooms
│   │   └── executeController.js ← Run code via Judge0
│   ├── routes/                 ← URL endpoints (the "where")
│   ├── middleware/auth.js      ← JWT token verification
│   ├── socket/socketHandler.js ← Real-time events (THE CORE FEATURE)
│   ├── server.js               ← App entry point
│   └── seed.js                 ← Demo data generator
│
├── frontend/                   ← React app
│   └── src/
│       ├── context/            ← Global state (no Redux needed)
│       │   ├── AuthContext.js  ← Who is logged in
│       │   └── SocketContext.js← WebSocket connection
│       ├── pages/               ← Full page components
│       │   ├── LandingPage.js  ← Marketing page (not logged in)
│       │   ├── AuthPage.js     ← Login/Register form
│       │   ├── DashboardPage.js← Browse/Create rooms
│       │   ├── RoomPage.js     ← THE MAIN EDITOR (most complex)
│       │   └── ProfilePage.js  ← User profile
│       ├── App.js              ← Routing setup
│       └── index.css           ← All styles
```

---

## 🧠 How This Project Works (Explain to Interviewer)

### The Core Concept — Real-time Sync

```
User A types code  →  Socket.io  →  Server  →  Socket.io  →  User B sees it instantly
```

This happens via **WebSockets** (Socket.io library), NOT regular HTTP requests.

**Why not HTTP?** HTTP is request-response — client asks, server answers, connection closes.
**WebSockets** keep a connection OPEN — server can push data to client anytime, instantly.

---

### Data Flow — Step by Step

**1. User joins a room:**
```javascript
// Frontend (RoomPage.js)
emit('room:join', { roomId });

// Backend (socketHandler.js)
socket.on('room:join', async ({ roomId }) => {
  socket.join(roomId);  // Socket.io "room" — like a chat group
  // Send current code state to this user
});
```

**2. User types code:**
```javascript
// Frontend — every keystroke
onChange={(val) => {
  setCode(val);
  emit('code:change', { roomId, code: val });  // Send to server
}}

// Backend — broadcast to everyone EXCEPT sender
socket.on('code:change', ({ roomId, code }) => {
  socket.to(roomId).emit('code:update', { code });  // .to() = everyone in room except me
});

// Other users' frontend — receive update
on('code:update', (data) => setCode(data.code));
```

**3. Code is saved to MongoDB** (so it persists after refresh):
```javascript
// Debounced — only saves every 2 seconds, not every keystroke
setTimeout(() => {
  axios.patch(`/api/rooms/${roomId}/code`, { code });
}, 2000);
```

---

## 🎓 Concepts You'll Master (Interview Gold)

| Concept | Where it's used | What to say in interview |
|---|---|---|
| **WebSockets vs HTTP** | Real-time code sync | "HTTP is request-response, WebSocket keeps a persistent connection for instant updates" |
| **Socket.io Rooms** | Each coding room | "Like grouping sockets so messages only go to people in that specific room" |
| **JWT Authentication** | Login system | "Stateless auth — server doesn't store sessions, just verifies a signed token" |
| **Debouncing** | Code auto-save | "Prevents saving to DB on every keystroke — waits till user pauses typing" |
| **React Context API** | Global state (Auth, Socket) | "Avoids prop drilling — share data across components without passing props manually" |
| **MongoDB Geospatial/Indexing** | Room search | "Used regex search + sorting by lastActivity for fast room discovery" |
| **REST + WebSocket Hybrid** | This whole app | "REST for CRUD operations (create room), WebSocket for real-time events (live typing)" |
| **Optimistic UI** | Chat messages | "Show the message immediately, don't wait for server confirmation" |

---

## 🔑 Get Your Free API Keys

### 1. MongoDB (Database)
**Option A — Local (Recommended, no signup):**
```bash
# Download: https://www.mongodb.com/try/download/community
# Then in .env:
MONGO_URI=mongodb://localhost:27017/devroom
```

**Option B — Atlas (Cloud, free tier):**
1. https://mongodb.com/atlas → Sign up
2. Create free M0 cluster
3. Database Access → Add user
4. Network Access → Allow from anywhere
5. Connect → Copy URI → paste in `.env`

### 2. Judge0 (Code Execution) — Optional but recommended
1. Go to https://rapidapi.com/judge0-official/api/judge0-ce
2. Sign up free → Subscribe to Free plan
3. Copy your API Key
4. Paste in `backend/.env` as `JUDGE0_API_KEY`

> Without this key, code execution shows mock output — app still works for demos.

### 3. Google OAuth — Optional
1. https://console.cloud.google.com
2. APIs & Services → Credentials → Create OAuth Client ID
3. Authorized origins: `http://localhost:3000`
4. Copy Client ID to BOTH `.env` files

---

## 🚀 Deploy for Free (For Your Resume Link)

### Backend → Render.com
1. Push code to GitHub
2. Render.com → New Web Service → Connect repo
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add environment variables from your `.env`

### Frontend → Vercel
1. Vercel.com → New Project → Import GitHub repo
2. Root directory: `frontend`
3. Add environment variable: `REACT_APP_API_URL=https://your-render-url.com`
4. Deploy

### Update CORS
In `backend/server.js`, update `CLIENT_URL` in `.env` to your Vercel URL.

---

## 📝 What To Write On Your Resume

```
DevRoom — Real-time Collaborative Code Editor          [Live Demo] [GitHub]
• Built a full-stack MERN application enabling multiple developers to 
  write, edit, and execute code simultaneously using Socket.io WebSockets
• Implemented JWT authentication with Google OAuth 2.0 integration
• Designed real-time presence system showing live cursors and online users
  across coding rooms using Socket.io room-based broadcasting
• Integrated Judge0 API for multi-language code execution (10+ languages)
• Built with React, Node.js, Express, MongoDB, Socket.io
```

---

## 🐛 Common Issues

| Problem | Fix |
|---|---|
| Socket not connecting | Check `REACT_APP_API_URL` matches backend port |
| MongoDB connection refused | Check MongoDB service is running: `net start MongoDB` (Windows) |
| Google login not working | Verify Client ID matches in BOTH `.env` files + Authorized origins in Google Console |
| Code not syncing between users | Open browser console, check for socket connection errors |
| Judge0 execution fails | Check API key is valid, falls back to mock mode automatically |

---

## 📚 Learning Path (After This Works)

Once deployed, go back and **understand each file slowly**:

1. **Week 1:** `authController.js` + `AuthContext.js` — understand JWT flow completely
2. **Week 2:** `socketHandler.js` + `RoomPage.js` — understand Socket.io events
3. **Week 3:** `roomController.js` — understand MongoDB queries, populate()
4. **Week 4:** Practice explaining the data flow out loud — that's interview prep

---

**Built to learn, built to impress. Good luck! 🚀**
