import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiCode, FiPlus, FiUsers, FiLogOut, FiSearch,
  FiLock, FiGlobe, FiClock, FiUser, FiZap, FiGrid
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const LANGUAGES = ['all','javascript','python','java','cpp','typescript','go','rust','php','ruby'];
const LANG_COLORS = { javascript:'#f7df1e', python:'#3776ab', java:'#ed8b00', cpp:'#00599c', typescript:'#3178c6', go:'#00add8', rust:'#dea584' };

function Navbar({ user, logout }) {
  const navigate = useNavigate();
  return (
    <nav style={{ display:'flex', alignItems:'center', padding:'14px 24px', borderBottom:'1px solid var(--border)', background:'var(--bg1)', position:'sticky', top:0, zIndex:50 }}>
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginRight:'auto' }}>
        <div style={{ width:'28px', height:'28px', background:'var(--purple)', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <FiCode color="#fff" size={15}/>
        </div>
        <span style={{ fontWeight:700, fontSize:'16px' }}>DevRoom</span>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/profile')} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
          <div className="avatar" style={{ width:'24px', height:'24px', fontSize:'10px' }}>{user?.name?.[0]}</div>
          {user?.name}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={logout} style={{ color:'var(--red)' }}>
          <FiLogOut size={14}/>
        </button>
      </div>
    </nav>
  );
}

function CreateRoomModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ title:'', language:'javascript', isPrivate:false, password:'', tags:'' });
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(p => ({ ...p, [k]:v }));

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Room title required'); return; }
    setLoading(true);
    try {
      const { data } = await axios.post('/api/rooms', {
        title: form.title.trim(),
        language: form.language,
        isPrivate: form.isPrivate,
        password: form.isPrivate ? form.password : undefined,
        tags: form.tags.split(',').map(t=>t.trim()).filter(Boolean),
      });
      toast.success('Room created!');
      onCreate(data.room);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create room');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:'24px' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale:0.9, opacity:0 }} animate={{ scale:1, opacity:1 }}
        style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'16px', padding:'28px', width:'100%', maxWidth:'440px' }}>
        <h2 style={{ fontSize:'18px', fontWeight:'700', marginBottom:'20px' }}>Create New Room</h2>
        <form onSubmit={handleCreate} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <div>
            <label style={{ fontSize:'12px', color:'var(--text2)', marginBottom:'6px', display:'block', fontWeight:'500' }}>Room Title *</label>
            <input className="input" placeholder="e.g. JavaScript Interview Prep" value={form.title} onChange={e => set('title', e.target.value)} required/>
          </div>
          <div>
            <label style={{ fontSize:'12px', color:'var(--text2)', marginBottom:'6px', display:'block', fontWeight:'500' }}>Language</label>
            <select className="input" value={form.language} onChange={e => set('language', e.target.value)}
              style={{ cursor:'pointer' }}>
              {LANGUAGES.filter(l => l !== 'all').map(l => (
                <option key={l} value={l} style={{ background:'var(--bg2)' }}>{l.charAt(0).toUpperCase()+l.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize:'12px', color:'var(--text2)', marginBottom:'6px', display:'block', fontWeight:'500' }}>Tags (comma separated)</label>
            <input className="input" placeholder="dsa, practice, interview" value={form.tags} onChange={e => set('tags', e.target.value)}/>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', background:'var(--bg3)', borderRadius:'8px', border:'1px solid var(--border)' }}>
            <input type="checkbox" id="private" checked={form.isPrivate} onChange={e => set('isPrivate', e.target.checked)}
              style={{ width:'16px', height:'16px', accentColor:'var(--purple)', cursor:'pointer' }}/>
            <label htmlFor="private" style={{ fontSize:'13px', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}>
              <FiLock size={13} color="var(--text2)"/> Private Room (password protected)
            </label>
          </div>
          {form.isPrivate && (
            <input className="input" type="text" placeholder="Room password" value={form.password} onChange={e => set('password', e.target.value)}/>
          )}
          <div style={{ display:'flex', gap:'10px', marginTop:'4px' }}>
            <button type="button" className="btn btn-ghost" style={{ flex:1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex:2, justifyContent:'center' }} disabled={loading}>
              {loading ? <><div className="spinner" style={{ width:'14px', height:'14px' }}/> Creating...</> : <><FiPlus size={14}/> Create Room</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function RoomCard({ room, onJoin }) {
  const langColor = LANG_COLORS[room.language] || 'var(--purple2)';
  const online = room.participants?.filter(p => p.isOnline).length || 0;
  const timeAgo = (date) => {
    const m = Math.floor((Date.now() - new Date(date)) / 60000);
    if (m < 1) return 'just now'; if (m < 60) return `${m}m ago`;
    const h = Math.floor(m/60); if (h < 24) return `${h}h ago`;
    return `${Math.floor(h/24)}d ago`;
  };

  return (
    <motion.div whileHover={{ y:-3 }} transition={{ duration:0.15 }}
      onClick={() => onJoin(room)}
      className="card card-hover"
      style={{ cursor:'pointer', position:'relative', overflow:'hidden' }}>
      {/* Top accent */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:`linear-gradient(90deg, ${langColor}80, transparent)` }}/>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'10px' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
            {room.isPrivate
              ? <span className="badge badge-amber"><FiLock size={10}/> Private</span>
              : <span className="badge badge-green"><FiGlobe size={10}/> Public</span>}
            <span style={{ fontSize:'12px', color:langColor, fontWeight:'600', fontFamily:'JetBrains Mono' }}>
              {room.language}
            </span>
          </div>
          <h3 style={{ fontSize:'14px', fontWeight:'600', lineHeight:1.3 }}>{room.title}</h3>
        </div>
        {online > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:'4px', background:'rgba(16,185,129,0.1)', padding:'4px 8px', borderRadius:'6px', flexShrink:0 }}>
            <div className="online-dot" style={{ width:'6px', height:'6px' }}/>
            <span style={{ fontSize:'11px', color:'var(--green)', fontWeight:'600' }}>{online} live</span>
          </div>
        )}
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'-4px' }}>
          {room.participants?.slice(0,4).map((p,i) => (
            <div key={p._id} className="avatar" style={{ width:'24px', height:'24px', fontSize:'10px', marginLeft: i>0?'-6px':'0', border:'2px solid var(--bg2)' }}>
              {p.avatar ? <img src={p.avatar} alt="" style={{ width:'100%', borderRadius:'50%' }}/> : p.name?.[0]}
            </div>
          ))}
          <span style={{ marginLeft:'8px', fontSize:'11px', color:'var(--text3)' }}>
            {room.participants?.length || 0} members
          </span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'4px', color:'var(--text3)', fontSize:'11px' }}>
          <FiClock size={11}/> {timeAgo(room.lastActivity || room.createdAt)}
        </div>
      </div>

      {room.tags?.length > 0 && (
        <div style={{ display:'flex', gap:'4px', flexWrap:'wrap', marginTop:'10px' }}>
          {room.tags.slice(0,3).map(tag => (
            <span key={tag} className="badge badge-gray" style={{ fontSize:'10px' }}>#{tag}</span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user, logout }  = useAuth();
  const navigate = useNavigate();
  const [rooms,    setRooms]    = useState([]);
  const [myRooms,  setMyRooms]  = useState([]);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [langFilter, setLangFilter] = useState('all');
  const [tab,      setTab]      = useState('browse'); // browse | my
  const [showCreate, setShowCreate] = useState(false);
  const [joinPassword, setJoinPassword] = useState({ show:false, room:null, val:'' });

  const loadRooms = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)              params.search = search;
      if (langFilter !== 'all') params.lang   = langFilter;
      const [r1, r2, r3] = await Promise.all([
        axios.get('/api/rooms', { params }),
        axios.get('/api/rooms/my'),
        axios.get('/api/rooms/stats'),
      ]);
      setRooms(r1.data.rooms || []);
      setMyRooms(r2.data.rooms || []);
      setStats(r3.data.stats);
    } catch (err) {
      toast.error('Failed to load rooms');
    } finally { setLoading(false); }
  }, [search, langFilter]);

  useEffect(() => { loadRooms(); }, [loadRooms]);

  const handleJoin = async (room) => {
    if (room.isPrivate && room.password) {
      setJoinPassword({ show:true, room, val:'' });
      return;
    }
    navigate(`/room/${room.roomId}`);
  };

  const handleJoinPrivate = async () => {
    try {
      await axios.get(`/api/rooms/${joinPassword.room.roomId}?password=${joinPassword.val}`);
      navigate(`/room/${joinPassword.room.roomId}?password=${joinPassword.val}`);
      setJoinPassword({ show:false, room:null, val:'' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Wrong password');
    }
  };

  const displayRooms = tab === 'browse' ? rooms : myRooms;

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg0)' }}>
      <Navbar user={user} logout={logout}/>

      <div style={{ maxWidth:'1200px', margin:'0 auto', padding:'28px 24px' }}>

        {/* Stats */}
        {stats && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px,1fr))', gap:'12px', marginBottom:'28px' }}>
            {[
              { label:'Total Rooms', value: stats.totalRooms, icon:<FiGrid size={18}/>, color:'var(--purple2)' },
              { label:'My Rooms',    value: stats.myRooms,    icon:<FiCode size={18}/>, color:'var(--blue2)' },
              { label:'Total Users', value: stats.totalUsers,  icon:<FiUsers size={18}/>, color:'var(--green2)' },
              { label:'Online Now',  value: stats.onlineUsers, icon:<FiZap size={18}/>,  color:'var(--amber)' },
            ].map(s => (
              <div key={s.label} className="card" style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                <div style={{ color:s.color, opacity:0.8 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize:'22px', fontWeight:'700', color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:'11px', color:'var(--text3)', marginTop:'1px' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px', flexWrap:'wrap', gap:'12px' }}>
          <div>
            <h1 style={{ fontSize:'22px', fontWeight:'700' }}>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
            <p style={{ color:'var(--text2)', fontSize:'13px', marginTop:'2px' }}>Pick a room and start coding together</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <FiPlus size={15}/> New Room
          </button>
        </div>

        {/* Tabs + Search + Filter */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px', flexWrap:'wrap' }}>
          <div style={{ display:'flex', background:'var(--bg2)', padding:'3px', borderRadius:'8px', border:'1px solid var(--border)' }}>
            {[['browse','Browse'],['my','My Rooms']].map(([t,l]) => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding:'6px 16px', border:'none', borderRadius:'6px', fontSize:'13px', fontWeight:'600', cursor:'pointer', transition:'all 0.2s',
                  background: tab===t ? 'var(--purple)' : 'transparent',
                  color: tab===t ? '#fff' : 'var(--text2)' }}>
                {l}
              </button>
            ))}
          </div>
          <div style={{ position:'relative', flex:'1', maxWidth:'280px' }}>
            <FiSearch size={14} style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }}/>
            <input className="input" placeholder="Search rooms..." value={search}
              onChange={e => setSearch(e.target.value)} style={{ paddingLeft:'32px', height:'36px' }}/>
          </div>
          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
            {LANGUAGES.slice(0,6).map(l => (
              <button key={l} onClick={() => setLangFilter(l)}
                style={{ padding:'5px 12px', border:`1px solid ${langFilter===l ? 'var(--purple)' : 'var(--border)'}`,
                  borderRadius:'6px', fontSize:'11px', fontWeight:'600', cursor:'pointer', transition:'all 0.2s',
                  background: langFilter===l ? 'rgba(124,58,237,0.15)' : 'transparent',
                  color: langFilter===l ? 'var(--purple2)' : 'var(--text3)' }}>
                {l === 'all' ? 'All' : l}
              </button>
            ))}
          </div>
        </div>

        {/* Rooms Grid */}
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:'14px' }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="card skeleton" style={{ height:'140px' }}/>
            ))}
          </div>
        ) : displayRooms.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px', color:'var(--text3)' }}>
            <FiCode size={40} style={{ marginBottom:'12px', opacity:0.3 }}/>
            <p style={{ fontSize:'15px' }}>{tab === 'my' ? "You haven't created any rooms yet" : 'No rooms found'}</p>
            <button className="btn btn-primary" style={{ marginTop:'16px' }} onClick={() => setShowCreate(true)}>
              <FiPlus size={14}/> Create First Room
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:'14px' }}>
            {displayRooms.map((room, i) => (
              <motion.div key={room._id} initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}>
                <RoomCard room={room} onJoin={handleJoin}/>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onCreate={(room) => { setShowCreate(false); navigate(`/room/${room.roomId}`); }}
        />
      )}

      {/* Join Private Room Modal */}
      {joinPassword.show && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}>
          <motion.div initial={{ scale:0.9 }} animate={{ scale:1 }}
            style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'12px', padding:'24px', width:'320px' }}>
            <h3 style={{ marginBottom:'6px', display:'flex', alignItems:'center', gap:'8px' }}><FiLock size={16}/> Private Room</h3>
            <p style={{ color:'var(--text2)', fontSize:'13px', marginBottom:'16px' }}>Enter the room password to join</p>
            <input className="input" type="password" placeholder="Room password" value={joinPassword.val}
              onChange={e => setJoinPassword(p => ({ ...p, val:e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleJoinPrivate()}
              autoFocus style={{ marginBottom:'12px' }}/>
            <div style={{ display:'flex', gap:'8px' }}>
              <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => setJoinPassword({ show:false, room:null, val:'' })}>Cancel</button>
              <button className="btn btn-primary" style={{ flex:2, justifyContent:'center' }} onClick={handleJoinPrivate}>Join Room</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
