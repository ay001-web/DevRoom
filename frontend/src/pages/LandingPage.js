import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCode, FiUsers, FiZap, FiPlay, FiGlobe, FiLock } from 'react-icons/fi';

const LANGS = ['JavaScript','Python','Java','C++','TypeScript','Go','Rust','PHP','Ruby'];
const FEATURES = [
  { icon: <FiCode size={22}/>, title: 'Real-time Code Sync', desc: 'Multiple users edit the same file simultaneously. Changes appear instantly for everyone in the room.' },
  { icon: <FiPlay size={22}/>, title: 'Run Code Instantly', desc: 'Execute code in 10+ languages directly from the browser. See output in real time.' },
  { icon: <FiUsers size={22}/>, title: 'Live Chat', desc: 'Built-in chat for every room. Discuss, explain, and collaborate without leaving the editor.' },
  { icon: <FiZap size={22}/>, title: 'Monaco Editor', desc: 'The same editor that powers VS Code — syntax highlighting, autocomplete, multi-cursor.' },
  { icon: <FiGlobe size={22}/>, title: 'Public Rooms', desc: 'Browse and join public coding rooms. Practice DSA, solve problems together.' },
  { icon: <FiLock size={22}/>, title: 'Private Rooms', desc: 'Create password-protected rooms for your team or interview sessions.' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg0)', overflowX:'hidden' }}>

      {/* Navbar */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 48px', borderBottom:'1px solid var(--border)', position:'sticky', top:0, background:'rgba(10,10,15,0.9)', backdropFilter:'blur(12px)', zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'32px', height:'32px', background:'var(--purple)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <FiCode color="#fff" size={18}/>
          </div>
          <span style={{ fontWeight:700, fontSize:'18px', letterSpacing:'-0.3px' }}>DevRoom</span>
        </div>
        <div style={{ display:'flex', gap:'12px' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/auth')}>Sign In</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/auth?tab=register')}>Get Started Free</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign:'center', padding:'100px 24px 80px', position:'relative' }}>
        {/* Background glow */}
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-60%)', width:'600px', height:'400px', background:'radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)', pointerEvents:'none' }}/>

        <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>
          <div className="badge badge-purple" style={{ marginBottom:'20px', fontSize:'12px' }}>
            ✨ Real-time Collaborative Coding
          </div>
          <h1 style={{ fontSize:'clamp(40px,6vw,72px)', fontWeight:800, lineHeight:1.1, letterSpacing:'-2px', marginBottom:'20px' }}>
            Code Together,<br/>
            <span className="gradient-text">Ship Faster</span>
          </h1>
          <p style={{ fontSize:'18px', color:'var(--text2)', maxWidth:'520px', margin:'0 auto 40px', lineHeight:1.7 }}>
            A real-time collaborative code editor. Create rooms, invite teammates, write and run code together — all in the browser.
          </p>
          <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/auth?tab=register')}>
              <FiPlay size={16}/> Start Coding Free
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/auth')}>
              <FiUsers size={16}/> Browse Rooms
            </button>
          </div>
        </motion.div>

        {/* Language pills */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4, duration:0.6 }}
          style={{ display:'flex', gap:'8px', justifyContent:'center', flexWrap:'wrap', marginTop:'48px' }}>
          {LANGS.map(lang => (
            <span key={lang} className="badge badge-gray" style={{ fontSize:'12px', padding:'5px 14px' }}>{lang}</span>
          ))}
        </motion.div>
      </section>

      {/* Editor Preview */}
      <section style={{ padding:'0 24px 80px', maxWidth:'1000px', margin:'0 auto' }}>
        <motion.div initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
          style={{ background:'var(--bg2)', border:'1px solid var(--border2)', borderRadius:'16px', overflow:'hidden', boxShadow:'0 40px 80px rgba(0,0,0,0.5)' }}>
          {/* Editor header */}
          <div style={{ display:'flex', alignItems:'center', padding:'12px 16px', background:'var(--bg3)', borderBottom:'1px solid var(--border)', gap:'8px' }}>
            <div style={{ width:'12px', height:'12px', borderRadius:'50%', background:'#ef4444' }}/>
            <div style={{ width:'12px', height:'12px', borderRadius:'50%', background:'#f59e0b' }}/>
            <div style={{ width:'12px', height:'12px', borderRadius:'50%', background:'#10b981' }}/>
            <span style={{ marginLeft:'12px', fontSize:'12px', color:'var(--text3)', fontFamily:'JetBrains Mono' }}>main.js — DevRoom</span>
            <div style={{ marginLeft:'auto', display:'flex', gap:'6px' }}>
              {['Vijesh','Ayush','Priya'].map((n,i) => (
                <div key={n} className="avatar" style={{ width:'24px', height:'24px', fontSize:'10px', marginLeft:i>0?'-8px':'0', border:'2px solid var(--bg3)' }}>
                  {n[0]}
                </div>
              ))}
              <span style={{ fontSize:'11px', color:'var(--green)', marginLeft:'6px', display:'flex', alignItems:'center', gap:'4px' }}>
                <div className="online-dot" style={{ width:'6px', height:'6px' }}/> 3 online
              </span>
            </div>
          </div>
          {/* Code preview */}
          <div style={{ padding:'24px', fontFamily:'JetBrains Mono', fontSize:'13px', lineHeight:'1.8', overflowX:'auto' }}>
            <div><span style={{ color:'#569cd6' }}>function</span> <span style={{ color:'#dcdcaa' }}>twoSum</span><span style={{ color:'var(--text1)' }}>(nums, target) {'{'}</span></div>
            <div style={{ paddingLeft:'20px' }}><span style={{ color:'#569cd6' }}>const</span> <span style={{ color:'#9cdcfe' }}>map</span> <span style={{ color:'var(--text1)' }}>= </span><span style={{ color:'#569cd6' }}>new</span> <span style={{ color:'#4ec9b0' }}>Map</span><span style={{ color:'var(--text1)' }}>();</span></div>
            <div style={{ paddingLeft:'20px' }}><span style={{ color:'#c586c0' }}>for</span> <span style={{ color:'var(--text1)' }}>(</span><span style={{ color:'#569cd6' }}>let</span> <span style={{ color:'#9cdcfe' }}>i</span> <span style={{ color:'var(--text1)' }}>= 0; i &lt; nums.length; i++) {'{'}</span></div>
            <div style={{ paddingLeft:'40px' }}><span style={{ color:'#569cd6' }}>const</span> <span style={{ color:'#9cdcfe' }}>comp</span> <span style={{ color:'var(--text1)' }}>= target - nums[i];</span></div>
            <div style={{ paddingLeft:'40px' }}><span style={{ color:'#c586c0' }}>if</span> <span style={{ color:'var(--text1)' }}>(map.has(comp)) </span><span style={{ color:'#c586c0' }}>return</span> <span style={{ color:'var(--text1)' }}>[map.get(comp), i];</span></div>
            <div style={{ paddingLeft:'40px' }}><span style={{ color:'var(--text1)' }}>map.set(nums[i], i);</span></div>
            <div style={{ paddingLeft:'20px' }}><span style={{ color:'var(--text1)' }}>{'}'}</span></div>
            <div><span style={{ color:'var(--text1)' }}>{'}'}</span></div>
            <div style={{ marginTop:'8px', color:'#6a9955' }}>{'// Output: [0, 1]'}</div>
            {/* Cursor */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', marginTop:'8px', background:'rgba(124,58,237,0.1)', padding:'3px 10px', borderRadius:'4px', border:'1px solid rgba(124,58,237,0.2)' }}>
              <div style={{ width:'2px', height:'14px', background:'var(--purple)', animation:'blink 1s step-end infinite' }}/>
              <span style={{ fontSize:'11px', color:'var(--purple2)' }}>Ayush is typing...</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ padding:'40px 24px 80px', maxWidth:'1100px', margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:'48px' }}>
          <h2 style={{ fontSize:'36px', fontWeight:'800', letterSpacing:'-1px', marginBottom:'12px' }}>Everything you need to <span className="gradient-text">code together</span></h2>
          <p style={{ color:'var(--text2)', fontSize:'16px' }}>Built for developers, by developers</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'16px' }}>
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} transition={{ delay:i*0.08, duration:0.4 }}
              className="card" style={{ cursor:'default' }}>
              <div style={{ width:'44px', height:'44px', background:'rgba(124,58,237,0.12)', border:'1px solid rgba(124,58,237,0.2)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--purple2)', marginBottom:'14px' }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize:'15px', fontWeight:'600', marginBottom:'8px' }}>{f.title}</h3>
              <p style={{ color:'var(--text2)', fontSize:'13px', lineHeight:'1.7' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign:'center', padding:'60px 24px 80px' }}>
        <div className="card" style={{ maxWidth:'560px', margin:'0 auto', padding:'48px', background:'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(59,130,246,0.08))' }}>
          <h2 style={{ fontSize:'32px', fontWeight:'800', marginBottom:'12px', letterSpacing:'-1px' }}>Ready to start coding?</h2>
          <p style={{ color:'var(--text2)', marginBottom:'28px' }}>Create your free account and start your first room in under 60 seconds.</p>
          <button className="btn btn-primary btn-lg w-full" onClick={() => navigate('/auth?tab=register')}>
            Create Free Account →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign:'center', padding:'24px', borderTop:'1px solid var(--border)', color:'var(--text3)', fontSize:'12px' }}>
        © 2024 DevRoom — Built with MERN + Socket.io
      </footer>

      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </div>
  );
}
