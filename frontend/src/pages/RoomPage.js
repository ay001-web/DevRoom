import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlay, FiUsers, FiMessageSquare, FiSettings, FiCopy,
  FiArrowLeft, FiMaximize2, FiMinimize2, FiTrash2, FiShare2
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const LANGUAGES = ['javascript','python','java','cpp','c','typescript','go','rust','php','ruby'];
const LANG_MONACO = { javascript:'javascript', python:'python', java:'java', cpp:'cpp', c:'c', typescript:'typescript', go:'go', rust:'rust', php:'php', ruby:'ruby' };
const THEMES = ['vs-dark','light','hc-black'];

function UserAvatar({ user, size = 28, color }) {
  return (
    <div title={user.name}
      style={{ width:`${size}px`, height:`${size}px`, borderRadius:'50%', background:color||'var(--purple)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:`${size*0.4}px`, fontWeight:'700', color:'#fff', flexShrink:0, border:'2px solid var(--bg2)' }}>
      {user.avatar
        ? <img src={user.avatar} alt={user.name} style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }}/>
        : user.name?.[0]?.toUpperCase()}
    </div>
  );
}

function ChatPanel({ messages, onSend, roomId, socket }) {
  const [text, setText] = useState('');
  const { user } = useAuth();
  const bottomRef = useRef();
  const [typing, setTyping] = useState('');
  const typingTimer = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  useEffect(() => {
    if (!socket) return;
    const handle = (data) => { setTyping(`${data.name} is typing...`); clearTimeout(typingTimer.current); typingTimer.current = setTimeout(() => setTyping(''), 2000); };
    socket.on('typing:start', handle);
    return () => socket.off('typing:start', handle);
  }, [socket]);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
    socket?.emit('typing:stop', { roomId });
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    socket?.emit('typing:start', { roomId });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socket?.emit('typing:stop', { roomId }), 1500);
  };

  const timeStr = (d) => new Date(d).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ flex:1, overflowY:'auto', padding:'12px', display:'flex', flexDirection:'column', gap:'10px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign:'center', padding:'40px 16px', color:'var(--text3)', fontSize:'13px' }}>
            <FiMessageSquare size={28} style={{ marginBottom:'8px', display:'block', margin:'0 auto 8px' }}/>
            No messages yet. Say hello! 👋
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.user?.toString() === user?._id?.toString() || msg.name === user?.name;
          return (
            <div key={i} style={{ display:'flex', gap:'8px', flexDirection: isMe ? 'row-reverse' : 'row' }}>
              {!isMe && <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:'var(--purple)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'700', color:'#fff', flexShrink:0 }}>{msg.name?.[0]}</div>}
              <div style={{ maxWidth:'75%' }}>
                {!isMe && <div style={{ fontSize:'11px', color:'var(--text3)', marginBottom:'3px' }}>{msg.name}</div>}
                <div style={{ padding:'8px 12px', borderRadius: isMe ? '12px 12px 4px 12px' : '12px 12px 12px 4px', background: isMe ? 'var(--purple)' : 'var(--bg3)', fontSize:'13px', lineHeight:'1.5', wordBreak:'break-word' }}>
                  {msg.text}
                </div>
                <div style={{ fontSize:'10px', color:'var(--text3)', marginTop:'3px', textAlign: isMe ? 'right' : 'left' }}>
                  {timeStr(msg.time || new Date())}
                </div>
              </div>
            </div>
          );
        })}
        {typing && <div style={{ fontSize:'11px', color:'var(--text3)', fontStyle:'italic' }}>{typing}</div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{ padding:'10px', borderTop:'1px solid var(--border)', display:'flex', gap:'8px' }}>
        <input className="input" placeholder="Type a message..." value={text}
          onChange={handleTyping} onKeyDown={e => e.key === 'Enter' && handleSend()}
          style={{ fontSize:'13px', padding:'8px 12px' }}/>
        <button className="btn btn-primary btn-sm" onClick={handleSend} style={{ flexShrink:0 }}>Send</button>
      </div>
    </div>
  );
}

function OutputPanel({ output, loading }) {
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      <div style={{ padding:'8px 14px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'8px' }}>
        <span style={{ fontSize:'11px', fontWeight:'600', color:'var(--text2)', textTransform:'uppercase', letterSpacing:'0.5px' }}>Output</span>
        {loading && <div className="spinner" style={{ width:'12px', height:'12px' }}/>}
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'14px', fontFamily:'JetBrains Mono', fontSize:'12px', lineHeight:'1.7', whiteSpace:'pre-wrap', wordBreak:'break-word', color: output?.includes('Error') || output?.includes('error') ? 'var(--red)' : 'var(--green2)' }}>
        {loading ? 'Running code...' : output || <span style={{ color:'var(--text3)' }}>Press ▶ Run to execute code</span>}
      </div>
    </div>
  );
}

export default function RoomPage() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { socket, emit, on } = useSocket();

  const [room,     setRoom]     = useState(null);
  const [code,     setCode]     = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output,   setOutput]   = useState('');
  const [messages, setMessages] = useState([]);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [running,  setRunning]  = useState(false);
  const [theme,    setTheme]    = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [sidePanel,setSidePanel]= useState('chat'); // chat | users | settings
  const [showSide, setShowSide] = useState(true);
  const [showOutput, setShowOutput] = useState(true);

  const codeRef    = useRef(code);
  const langRef    = useRef(language);
  codeRef.current  = code;
  langRef.current  = language;

  // Load room from API
  useEffect(() => {
    const load = async () => {
      try {
        const password = searchParams.get('password') || '';
        const url = `/api/rooms/${roomId}${password ? `?password=${password}` : ''}`;
        const { data } = await axios.get(url);
        setRoom(data.room);
        setCode(data.room.code || '');
        setLanguage(data.room.language || 'javascript');
        setMessages(data.room.messages || []);
        setTheme(data.room.theme || 'vs-dark');
        setFontSize(data.room.fontSize || 14);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Room not found');
        navigate('/dashboard');
      } finally { setLoading(false); }
    };
    load();
  }, [roomId]);

  // Socket events
  useEffect(() => {
    if (!socket || !room) return;

    emit('room:join', { roomId });

    const cleanups = [
      on('room:state',     (data) => { setCode(data.code); setLanguage(data.language); setOutput(data.output || ''); setUsers(data.users || []); }),
      on('room:users',     (u)    => setUsers(u)),
      on('room:user_joined', (u)  => toast(`${u.name} joined the room 👋`, { icon:'👋' })),
      on('room:user_left',  (u)   => toast(`${u.name} left`, { icon:'👋' })),
      on('code:update',    (data) => { setCode(data.code); setLanguage(data.language); }),
      on('language:changed',(data)=> { setLanguage(data.language); setCode(data.code); toast(`${data.by} changed language to ${data.language}`); }),
      on('chat:message',   (msg)  => setMessages(p => [...p, msg])),
      on('output:new',     (data) => { setOutput(data.output); toast.success(`${data.from} ran the code`); }),
    ];

    return () => {
      emit('room:leave', { roomId });
      cleanups.forEach(c => c && c());
    };
  }, [socket, room]);

  // Code change handler — debounced emit
  const saveTimer = useRef();
  const handleCodeChange = useCallback((val) => {
    setCode(val || '');
    emit('code:change', { roomId, code: val || '', language: langRef.current });
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      axios.patch(`/api/rooms/${roomId}/code`, { code: val || '', language: langRef.current }).catch(() => {});
    }, 2000);
  }, [roomId]);

  // Language change
  const handleLangChange = (newLang) => {
    setLanguage(newLang);
    emit('language:change', { roomId, language: newLang, code: codeRef.current });
  };

  // Run code
  const runCode = async () => {
    setRunning(true);
    setOutput('');
    setShowOutput(true);
    try {
      const { data } = await axios.post('/api/execute', { code: codeRef.current, language: langRef.current });
      const result = data.mock ? `${data.output}\n\n[${data.note || 'Simulated output'}]` : (data.output + `\n\n[Time: ${data.time} | Memory: ${data.memory} | Status: ${data.status}]`);
      setOutput(result);
      emit('output:update', { roomId, output: result });
    } catch (err) {
      const errMsg = 'Execution failed: ' + (err.response?.data?.message || err.message);
      setOutput(errMsg);
    } finally { setRunning(false); }
  };

  // Chat send
  const handleChatSend = (text) => {
    emit('chat:send', { roomId, text });
  };

  // Copy room link
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Room link copied!');
  };

  if (loading) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'16px' }}>
      <div className="spinner" style={{ width:'32px', height:'32px', borderWidth:'3px' }}/>
      <p style={{ color:'var(--text3)' }}>Loading room...</p>
    </div>
  );

  return (
    <div className="fullscreen" style={{ background:'var(--bg0)' }}>

      {/* Top Bar */}
      <div style={{ display:'flex', alignItems:'center', padding:'0 12px', height:'48px', borderBottom:'1px solid var(--border)', background:'var(--bg1)', gap:'10px', flexShrink:0 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')} style={{ gap:'4px' }}>
          <FiArrowLeft size={14}/> <span style={{ fontSize:'12px' }}>Dashboard</span>
        </button>
        <div style={{ width:'1px', height:'20px', background:'var(--border)' }}/>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <span style={{ fontWeight:'600', fontSize:'14px', maxWidth:'200px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{room?.title}</span>
          <span className="badge badge-purple" style={{ fontSize:'10px' }}>{roomId}</span>
        </div>

        {/* Language selector */}
        <select value={language} onChange={e => handleLangChange(e.target.value)}
          style={{ background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--text1)', padding:'5px 10px', borderRadius:'6px', fontSize:'12px', cursor:'pointer', fontFamily:'JetBrains Mono', outline:'none' }}>
          {LANGUAGES.map(l => <option key={l} value={l} style={{ background:'var(--bg2)' }}>{l}</option>)}
        </select>

        {/* Online users */}
        <div style={{ display:'flex', alignItems:'center', gap:'-4px', marginLeft:'4px' }}>
          {users.slice(0,5).map((u, i) => (
            <div key={u.socketId || i} style={{ marginLeft: i>0 ? '-8px' : '0' }}>
              <div title={u.name} style={{ width:'28px', height:'28px', borderRadius:'50%', background:'var(--purple)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'700', color:'#fff', border:'2px solid var(--bg1)' }}>
                {u.name?.[0]}
              </div>
            </div>
          ))}
          {users.length > 0 && (
            <span style={{ marginLeft:'8px', fontSize:'11px', color:'var(--green)', display:'flex', alignItems:'center', gap:'3px' }}>
              <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--green)', boxShadow:'0 0 6px rgba(16,185,129,0.6)' }}/>
              {users.length} online
            </span>
          )}
        </div>

        {/* Actions */}
        <div style={{ marginLeft:'auto', display:'flex', gap:'6px' }}>
          <button className="btn btn-ghost btn-sm" onClick={copyLink} title="Copy room link"><FiShare2 size={14}/></button>
          <button className="btn btn-green btn-sm" onClick={runCode} disabled={running} style={{ gap:'5px' }}>
            {running ? <><div className="spinner" style={{ width:'12px', height:'12px' }}/> Running</> : <><FiPlay size={13}/> Run</>}
          </button>
          {[
            { id:'chat',    icon:<FiMessageSquare size={14}/>, label:'Chat' },
            { id:'users',   icon:<FiUsers size={14}/>,         label:'Users' },
            { id:'settings',icon:<FiSettings size={14}/>,      label:'Settings' },
          ].map(b => (
            <button key={b.id} className={`btn btn-sm ${sidePanel===b.id && showSide ? 'btn-secondary' : 'btn-ghost'}`}
              onClick={() => { if (sidePanel===b.id) setShowSide(p=>!p); else { setSidePanel(b.id); setShowSide(true); } }}
              style={{ gap:'4px' }}>
              {b.icon} <span style={{ fontSize:'11px' }}>{b.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

        {/* Editor + Output */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
          <div style={{ flex:1, minHeight:0 }}>
            <Editor
              height="100%"
              language={LANG_MONACO[language] || 'javascript'}
              value={code}
              onChange={handleCodeChange}
              theme={theme}
              options={{
                fontSize, minimap:{ enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                cursorBlinking: 'smooth',
                smoothScrolling: true,
                padding: { top: 12 },
                tabSize: 2,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Output */}
          <AnimatePresence>
            {showOutput && (
              <motion.div initial={{ height:0 }} animate={{ height:'180px' }} exit={{ height:0 }}
                style={{ borderTop:'1px solid var(--border)', background:'var(--bg1)', flexShrink:0, overflow:'hidden' }}>
                <div style={{ display:'flex', alignItems:'center', padding:'6px 12px', gap:'8px', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:'11px', color:'var(--text2)', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.5px' }}>Output</span>
                  {running && <div className="spinner" style={{ width:'12px', height:'12px' }}/>}
                  <button onClick={() => setShowOutput(false)} style={{ marginLeft:'auto', background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:'16px', lineHeight:1 }}>×</button>
                </div>
                <div style={{ padding:'12px 14px', fontFamily:'JetBrains Mono', fontSize:'12px', lineHeight:'1.7', whiteSpace:'pre-wrap', overflowY:'auto', height:'138px',
                  color: output?.includes('Error')||output?.includes('error') ? 'var(--red)' : 'var(--green2)' }}>
                  {running ? 'Running...' : output || <span style={{ color:'var(--text3)' }}>Press ▶ Run to execute code</span>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!showOutput && (
            <button onClick={() => setShowOutput(true)} style={{ padding:'5px 12px', background:'var(--bg2)', border:'none', borderTop:'1px solid var(--border)', color:'var(--text3)', fontSize:'11px', cursor:'pointer', textAlign:'left', flexShrink:0 }}>
              ▲ Show Output
            </button>
          )}
        </div>

        {/* Side Panel */}
        <AnimatePresence>
          {showSide && (
            <motion.div initial={{ width:0 }} animate={{ width:'300px' }} exit={{ width:0 }}
              style={{ borderLeft:'1px solid var(--border)', background:'var(--bg1)', overflow:'hidden', display:'flex', flexDirection:'column', flexShrink:0 }}>
              <div style={{ width:'300px', height:'100%', display:'flex', flexDirection:'column' }}>
                {/* Panel header */}
                <div style={{ padding:'10px 14px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
                  <span style={{ fontSize:'12px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.5px', color:'var(--text2)' }}>
                    {sidePanel === 'chat' ? 'Room Chat' : sidePanel === 'users' ? 'Participants' : 'Settings'}
                  </span>
                  <button onClick={() => setShowSide(false)} style={{ background:'none', border:'none', color:'var(--text3)', cursor:'pointer', fontSize:'16px' }}>×</button>
                </div>

                {/* Chat */}
                {sidePanel === 'chat' && (
                  <div style={{ flex:1, overflow:'hidden' }}>
                    <ChatPanel messages={messages} onSend={handleChatSend} roomId={roomId} socket={socket}/>
                  </div>
                )}

                {/* Users */}
                {sidePanel === 'users' && (
                  <div style={{ flex:1, overflowY:'auto', padding:'12px', display:'flex', flexDirection:'column', gap:'8px' }}>
                    {users.length === 0 ? (
                      <div style={{ textAlign:'center', padding:'40px 16px', color:'var(--text3)', fontSize:'13px' }}>
                        <FiUsers size={28} style={{ display:'block', margin:'0 auto 8px', opacity:0.3 }}/>
                        Only you in this room
                      </div>
                    ) : users.map((u, i) => (
                      <div key={u.socketId || i} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px', background:'var(--bg2)', borderRadius:'8px', border:'1px solid var(--border)' }}>
                        <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'var(--purple)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'700', color:'#fff', flexShrink:0 }}>
                          {u.name?.[0]}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:'13px', fontWeight:'500' }}>{u.name} {u.userId === user?._id?.toString() && '(you)'}</div>
                        </div>
                        <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'var(--green)', boxShadow:'0 0 6px rgba(16,185,129,0.5)' }}/>
                      </div>
                    ))}
                    <button className="btn btn-ghost btn-sm w-full" style={{ marginTop:'8px', justifyContent:'center' }} onClick={copyLink}>
                      <FiShare2 size={13}/> Invite to Room
                    </button>
                  </div>
                )}

                {/* Settings */}
                {sidePanel === 'settings' && (
                  <div style={{ flex:1, overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:'16px' }}>
                    <div>
                      <label style={{ fontSize:'11px', color:'var(--text2)', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'8px' }}>Editor Theme</label>
                      {THEMES.map(t => (
                        <button key={t} onClick={() => setTheme(t)}
                          style={{ display:'block', width:'100%', padding:'8px 12px', marginBottom:'4px', border:`1px solid ${theme===t ? 'var(--purple)' : 'var(--border)'}`, borderRadius:'6px', background: theme===t ? 'rgba(124,58,237,0.1)' : 'transparent', color: theme===t ? 'var(--purple2)' : 'var(--text2)', fontSize:'13px', cursor:'pointer', textAlign:'left', fontWeight: theme===t ? '600' : '400' }}>
                          {t}
                        </button>
                      ))}
                    </div>
                    <div>
                      <label style={{ fontSize:'11px', color:'var(--text2)', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'8px' }}>Font Size: {fontSize}px</label>
                      <input type="range" min="11" max="22" value={fontSize} onChange={e => setFontSize(+e.target.value)}
                        style={{ width:'100%', accentColor:'var(--purple)', cursor:'pointer' }}/>
                    </div>
                    <div>
                      <label style={{ fontSize:'11px', color:'var(--text2)', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'8px' }}>Room ID</label>
                      <div style={{ display:'flex', gap:'6px' }}>
                        <div style={{ flex:1, padding:'8px 12px', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'6px', fontFamily:'JetBrains Mono', fontSize:'13px', color:'var(--purple2)' }}>
                          {roomId}
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={copyLink}><FiCopy size={13}/></button>
                      </div>
                    </div>
                    {room?.owner?._id === user?._id && (
                      <div style={{ marginTop:'auto', paddingTop:'16px', borderTop:'1px solid var(--border)' }}>
                        <button className="btn btn-danger w-full" style={{ justifyContent:'center' }}
                          onClick={async () => {
                            if (!window.confirm('Delete this room?')) return;
                            await axios.delete(`/api/rooms/${roomId}`);
                            toast.success('Room deleted'); navigate('/dashboard');
                          }}>
                          <FiTrash2 size={13}/> Delete Room
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
