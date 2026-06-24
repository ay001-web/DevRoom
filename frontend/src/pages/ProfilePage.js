import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiGithub, FiEdit2, FiSave, FiCode, FiUsers, FiZap } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SKILL_OPTIONS = ['React','Node.js','MongoDB','Express','JavaScript','TypeScript','Python','Java','C++','Go','Rust','SQL','Docker','AWS'];

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name:   user?.name   || '',
    bio:    user?.bio    || '',
    github: user?.github || '',
    skills: user?.skills || [],
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toggleSkill = (skill) => {
    set('skills', form.skills.includes(skill)
      ? form.skills.filter(s => s !== skill)
      : [...form.skills, skill]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile(form);
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setLoading(false); }
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg0)', padding:'24px' }}>
      <div style={{ maxWidth:'680px', margin:'0 auto' }}>

        {/* Back */}
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')} style={{ marginBottom:'24px', gap:'6px' }}>
          <FiArrowLeft size={14}/> Dashboard
        </button>

        {/* Profile Card */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="card" style={{ marginBottom:'16px', position:'relative', overflow:'hidden' }}>
          {/* Purple gradient top */}
          <div style={{ position:'absolute', top:0, left:0, right:0, height:'80px', background:'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.08))', pointerEvents:'none' }}/>

          <div style={{ display:'flex', alignItems:'flex-start', gap:'20px', position:'relative' }}>
            {/* Avatar */}
            <div style={{ width:'72px', height:'72px', borderRadius:'50%', background:'linear-gradient(135deg, var(--purple), var(--blue))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'26px', fontWeight:'800', color:'#fff', flexShrink:0, border:'3px solid var(--bg2)', marginTop:'8px' }}>
              {user?.avatar
                ? <img src={user.avatar} alt="" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }}/>
                : initials}
            </div>

            <div style={{ flex:1 }}>
              {editing ? (
                <input className="input" value={form.name} onChange={e => set('name', e.target.value)}
                  style={{ fontSize:'20px', fontWeight:'700', marginBottom:'8px', padding:'6px 10px' }}/>
              ) : (
                <h1 style={{ fontSize:'22px', fontWeight:'700', marginBottom:'4px' }}>{user?.name}</h1>
              )}
              <p style={{ fontSize:'13px', color:'var(--text3)', marginBottom:'8px' }}>{user?.email}</p>
              {user?.googleId && <span className="badge badge-blue" style={{ fontSize:'11px' }}>Google Account</span>}
            </div>

            <div style={{ display:'flex', gap:'8px' }}>
              {editing ? (
                <>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                  <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={loading}>
                    {loading ? <div className="spinner" style={{ width:'12px', height:'12px' }}/> : <><FiSave size={12}/> Save</>}
                  </button>
                </>
              ) : (
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
                  <FiEdit2 size={13}/> Edit
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginTop:'20px', paddingTop:'20px', borderTop:'1px solid var(--border)' }}>
            {[
              { label:'Rooms Created', value: user?.roomsCreated || 0, icon:<FiCode size={16}/>, color:'var(--purple2)' },
              { label:'Rooms Joined',  value: user?.roomsJoined  || 0, icon:<FiUsers size={16}/>, color:'var(--blue2)' },
              { label:'Sessions',      value: user?.totalSessions || 0, icon:<FiZap size={16}/>,  color:'var(--green2)' },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center', padding:'12px', background:'var(--bg3)', borderRadius:'8px', border:'1px solid var(--border)' }}>
                <div style={{ color:s.color, marginBottom:'4px', display:'flex', justifyContent:'center' }}>{s.icon}</div>
                <div style={{ fontSize:'22px', fontWeight:'700', color:s.color }}>{s.value}</div>
                <div style={{ fontSize:'11px', color:'var(--text3)', marginTop:'2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bio */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="card" style={{ marginBottom:'16px' }}>
          <h3 style={{ fontSize:'13px', fontWeight:'600', color:'var(--text2)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'12px' }}>Bio</h3>
          {editing ? (
            <textarea className="input" value={form.bio} onChange={e => set('bio', e.target.value)}
              placeholder="Tell others about yourself..."
              style={{ minHeight:'80px', resize:'vertical', lineHeight:'1.6' }}/>
          ) : (
            <p style={{ color: user?.bio ? 'var(--text1)' : 'var(--text3)', fontSize:'14px', lineHeight:'1.7' }}>
              {user?.bio || 'No bio yet. Click Edit to add one.'}
            </p>
          )}
        </motion.div>

        {/* GitHub */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }} className="card" style={{ marginBottom:'16px' }}>
          <h3 style={{ fontSize:'13px', fontWeight:'600', color:'var(--text2)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'12px' }}>
            <FiGithub size={13} style={{ marginRight:'6px' }}/> GitHub
          </h3>
          {editing ? (
            <input className="input" value={form.github} onChange={e => set('github', e.target.value)}
              placeholder="https://github.com/yourusername"/>
          ) : user?.github ? (
            <a href={user.github} target="_blank" rel="noreferrer"
              style={{ color:'var(--purple2)', fontSize:'14px', display:'flex', alignItems:'center', gap:'6px' }}>
              <FiGithub size={14}/> {user.github}
            </a>
          ) : (
            <p style={{ color:'var(--text3)', fontSize:'14px' }}>No GitHub linked yet.</p>
          )}
        </motion.div>

        {/* Skills */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }} className="card" style={{ marginBottom:'24px' }}>
          <h3 style={{ fontSize:'13px', fontWeight:'600', color:'var(--text2)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'12px' }}>Skills</h3>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
            {editing ? SKILL_OPTIONS.map(skill => (
              <button key={skill} onClick={() => toggleSkill(skill)}
                style={{ padding:'5px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:'600', cursor:'pointer', transition:'all 0.15s', border:`1px solid ${form.skills.includes(skill) ? 'var(--purple)' : 'var(--border)'}`,
                  background: form.skills.includes(skill) ? 'rgba(124,58,237,0.15)' : 'transparent',
                  color:       form.skills.includes(skill) ? 'var(--purple2)'         : 'var(--text3)' }}>
                {skill}
              </button>
            )) : user?.skills?.length ? user.skills.map(s => (
              <span key={s} className="badge badge-purple" style={{ fontSize:'12px', padding:'5px 14px' }}>{s}</span>
            )) : (
              <p style={{ color:'var(--text3)', fontSize:'14px' }}>No skills added yet.</p>
            )}
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }} className="card">
          <h3 style={{ fontSize:'13px', fontWeight:'600', color:'var(--red)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'12px' }}>Account</h3>
          <button className="btn btn-danger" onClick={logout} style={{ justifyContent:'center' }}>
            Sign Out
          </button>
        </motion.div>

      </div>
    </div>
  );
}
