import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Pages
import LandingPage   from './pages/LandingPage';
import AuthPage      from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import RoomPage      from './pages/RoomPage';
import ProfilePage   from './pages/ProfilePage';

// Protected Route
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'16px' }}>
      <div className="spinner" style={{ width:'32px', height:'32px', borderWidth:'3px' }}></div>
      <p style={{ color:'var(--text3)', fontSize:'13px' }}>Loading DevRoom...</p>
    </div>
  );
  return user ? children : <Navigate to="/auth" replace />;
}

// Public Route - redirect if logged in
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: 'var(--bg3)', color: 'var(--text1)', border: '1px solid var(--border2)', fontSize: '13px' },
              success: { iconTheme: { primary: 'var(--green)', secondary: 'var(--bg3)' } },
              error:   { iconTheme: { primary: 'var(--red)',   secondary: 'var(--bg3)' } },
            }}
          />
          <Routes>
            <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
            <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/room/:roomId" element={<PrivateRoute><RoomPage /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
