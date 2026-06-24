import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }) {
  const { token, user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token || !user) {
      if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; }
      setConnected(false);
      return;
    }

    const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected:', socketRef.current.id);
      setConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('🔴 Socket disconnected');
      setConnected(false);
    });

    socketRef.current.on('connect_error', (err) => {
      console.warn('Socket error:', err.message);
      setConnected(false);
    });

    return () => {
      if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; }
    };
  }, [token, user]);

  const emit = (event, data) => {
    if (socketRef.current?.connected) socketRef.current.emit(event, data);
  };

  const on = (event, cb) => {
    socketRef.current?.on(event, cb);
    return () => socketRef.current?.off(event, cb);
  };

  const off = (event, cb) => socketRef.current?.off(event, cb);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, emit, on, off }}>
      {children}
    </SocketContext.Provider>
  );
}
