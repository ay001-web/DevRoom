import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Axios default
axios.defaults.baseURL = process.env.REACT_APP_API_URL || '';

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [token,   setToken]   = useState(localStorage.getItem('dr_token'));

  // Set auth header on every request if token exists
  useEffect(() => {
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    else delete axios.defaults.headers.common['Authorization'];
  }, [token]);

  // Restore session on page refresh
  useEffect(() => {
    const restore = async () => {
      const saved = localStorage.getItem('dr_token');
      if (!saved) { setLoading(false); return; }
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${saved}`;
        const { data } = await axios.get('/api/auth/me');
        setUser(data.user);
        setToken(saved);
      } catch {
        localStorage.removeItem('dr_token');
        localStorage.removeItem('dr_user');
        delete axios.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const saveSession = (token, user) => {
    setToken(token);
    setUser(user);
    localStorage.setItem('dr_token', token);
    localStorage.setItem('dr_user', JSON.stringify(user));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const register = async (name, email, password) => {
    const { data } = await axios.post('/api/auth/register', { name, email, password });
    saveSession(data.token, data.user);
    toast.success(`Welcome, ${data.user.name}! 🎉`);
    return data.user;
  };

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    saveSession(data.token, data.user);
    toast.success(`Welcome back, ${data.user.name}! 👋`);
    return data.user;
  };

  const googleLogin = async (credential) => {
    const { data } = await axios.post('/api/auth/google', { credential });
    saveSession(data.token, data.user);
    toast.success(`Welcome, ${data.user.name}! 🎉`);
    return data.user;
  };

  const logout = async () => {
    try { await axios.post('/api/auth/logout'); } catch {}
    setUser(null);
    setToken(null);
    localStorage.removeItem('dr_token');
    localStorage.removeItem('dr_user');
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  const updateProfile = async (data) => {
    const res = await axios.put('/api/auth/profile', data);
    setUser(res.data.user);
    localStorage.setItem('dr_user', JSON.stringify(res.data.user));
    toast.success('Profile updated!');
    return res.data.user;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, googleLogin, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
