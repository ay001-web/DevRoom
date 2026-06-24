import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCode, FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [params]    = useSearchParams();
  const [tab,setTab]= useState(params.get('tab') === 'register' ? 'register' : 'login');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [form, setForm] = useState({ name:'', email:'', password:'' });

  const { login, register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.name.trim()) { toast.error('Name is required'); setLoading(false); return; }
        if (form.password.length < 6) { toast.error('Password min 6 characters'); setLoading(false); return; }
        await register(form.name, form.email, form.password);
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Google Sign In
  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (res) => {
        try {
          await googleLogin(res.credential);
          navigate('/dashboard');
        } catch { toast.error('Google sign-in failed'); }
      }
    });
    window.google.accounts.id.renderButton(
      document.getElementById('google-btn'),
      { theme: 'filled_black', size: 'large', width: 340, text: 'signin_with' }
    );
  }, [tab]);

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg0)', padding:'24px', position:'relative' }}>
      {/* Background */}
      <div style={{ position:'fixed', top:'30%', left:'50%', transform:'translate(-50%,-50%)', width:'500px', height:'400px', background:'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)', pointerEvents:'none' }}/>

      {/* Back button */}
      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}
        style={{ position:'absolute', top:'24px', left:'24px', display:'flex', alignItems:'center', gap:'6px' }}>
        <FiArrowLeft size={14}/> Back
      </button>

      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
        style={{ width:'100%', maxWidth:'380px' }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'32px' }}>
          <div style={{ width:'48px', height:'48px', background:'var(--purple)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
            <FiCode color="#fff" size={24}/>
          </div>
          <h1 style={{ fontSize:'24px', fontWeight:'800', letterSpacing:'-0.5px', marginBottom:'4px' }}>DevRoom</h1>
          <p style={{ color:'var(--text2)', fontSize:'13px' }}>
            {tab === 'login' ? 'Welcome back! Sign in to continue' : 'Create your free account'}
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{ display:'flex', background:'var(--bg2)', padding:'4px', borderRadius:'10px', marginBottom:'24px', border:'1px solid var(--border)' }}>
          {['login','register'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex:1, padding:'8px', border:'none', borderRadius:'7px', fontSize:'13px', fontWeight:'600', cursor:'pointer', transition:'all 0.2s',
                background: tab === t ? 'var(--purple)' : 'transparent',
                color: tab === t ? '#fff' : 'var(--text2)' }}>
              {t === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          <AnimatePresence>
            {tab === 'register' && (
              <motion.div key="name" initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}>
                <label style={{ display:'block', fontSize:'12px', color:'var(--text2)', marginBottom:'6px', fontWeight:'500' }}>Full Name</label>
                <div style={{ position:'relative' }}>
                  <FiUser size={15} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }}/>
                  <input className="input" type="text" placeholder="Vijesh Kumar" value={form.name}
                    onChange={e => set('name', e.target.value)} style={{ paddingLeft:'38px' }}/>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label style={{ display:'block', fontSize:'12px', color:'var(--text2)', marginBottom:'6px', fontWeight:'500' }}>Email Address</label>
            <div style={{ position:'relative' }}>
              <FiMail size={15} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }}/>
              <input className="input" type="email" placeholder="you@example.com" value={form.email}
                onChange={e => set('email', e.target.value)} required style={{ paddingLeft:'38px' }}/>
            </div>
          </div>

          <div>
            <label style={{ display:'block', fontSize:'12px', color:'var(--text2)', marginBottom:'6px', fontWeight:'500' }}>Password</label>
            <div style={{ position:'relative' }}>
              <FiLock size={15} style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }}/>
              <input className="input" type={showPass ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password}
                onChange={e => set('password', e.target.value)} required style={{ paddingLeft:'38px', paddingRight:'40px' }}/>
              <button type="button" onClick={() => setShowPass(p => !p)}
                style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text3)', cursor:'pointer', display:'flex' }}>
                {showPass ? <FiEyeOff size={15}/> : <FiEye size={15}/>}
              </button>
            </div>
          </div>

          <button className="btn btn-primary w-full" type="submit" disabled={loading}
            style={{ marginTop:'4px', padding:'12px', fontSize:'14px', justifyContent:'center' }}>
            {loading ? <><div className="spinner" style={{ width:'16px', height:'16px' }}/> {tab === 'login' ? 'Signing in...' : 'Creating account...'}</> : tab === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>
        </form>

        {/* Divider */}
        <div className="divider" style={{ margin:'20px 0' }}>or continue with</div>

        {/* Google Button */}
        <div id="google-btn" style={{ display:'flex', justifyContent:'center' }}></div>
        {!process.env.REACT_APP_GOOGLE_CLIENT_ID && (
          <p style={{ textAlign:'center', fontSize:'11px', color:'var(--text3)', marginTop:'8px' }}>
            Add REACT_APP_GOOGLE_CLIENT_ID in frontend/.env for Google sign-in
          </p>
        )}

        {/* Demo credentials */}
        <div style={{ marginTop:'20px', padding:'12px', background:'rgba(124,58,237,0.06)', border:'1px solid rgba(124,58,237,0.15)', borderRadius:'8px' }}>
          <p style={{ fontSize:'11px', color:'var(--text3)', marginBottom:'6px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.5px' }}>Demo Account</p>
          <p style={{ fontSize:'12px', color:'var(--text2)', fontFamily:'JetBrains Mono' }}>vijesh@devroom.com / password123</p>
        </div>
      </motion.div>

      {/* Google GSI Script */}
      <script src="https://accounts.google.com/gsi/client" async defer></script>
    </div>
  );
}
