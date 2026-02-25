import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SessionContext = createContext();

export const GUEST_LIMIT = 20;

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guestMode, setGuestMode] = useState(false);

  // Decode JWT to extract user info
  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Check if token is expired
  const isTokenExpired = (token) => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    return expirationTime < currentTime;
  };

  // Load session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    if (token && !isTokenExpired(token)) {
      const decoded = decodeToken(token);
      if (decoded) {
        setSession({
          token,
          user: {
            id: decoded.sub,
            email: decoded.email,
            first_name: decoded.first_name || '',
            last_name: decoded.last_name || '',
            dob: decoded.dob || null,
          }
        });
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        localStorage.removeItem('access_token');
      }
    } else {
      localStorage.removeItem('access_token');
    }
    
    setLoading(false);
  }, []);

  // Login function
  const login = (token) => {
    const decoded = decodeToken(token);

    if (!decoded) {
      console.error('Invalid token');
      return;
    }

    localStorage.setItem('access_token', token);
    setGuestMode(false);

    setSession({
      token,
      user: {
        id: decoded.sub,
        email: decoded.email,
        first_name: decoded.first_name || '',
        last_name: decoded.last_name || '',
        dob: decoded.dob || null,
      }
    });

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('access_token');
    delete axios.defaults.headers.common['Authorization'];
    setSession(null);
    window.location.href = '/';
  };

  // Get auth token
  const getToken = () => {
    return localStorage.getItem('access_token');
  };

  // Enter guest mode — seeds localStorage keys on first visit
  const enterGuestMode = () => {
    if (!localStorage.getItem('guest_session_id')) {
      localStorage.setItem('guest_session_id', String(Math.floor(Math.random() * 900000) + 100000));
    }
    if (!localStorage.getItem('guest_interaction_count')) {
      localStorage.setItem('guest_interaction_count', '0');
    }
    setGuestMode(true);
  };

  const getGuestInteractionCount = () => {
    return parseInt(localStorage.getItem('guest_interaction_count') || '0');
  };

  const incrementGuestInteraction = () => {
    const next = getGuestInteractionCount() + 1;
    localStorage.setItem('guest_interaction_count', String(next));
    return next;
  };

  const value = {
    session,
    loading,
    login,
    logout,
    getToken,
    guestMode,
    enterGuestMode,
    getGuestInteractionCount,
    incrementGuestInteraction,
    GUEST_LIMIT,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};