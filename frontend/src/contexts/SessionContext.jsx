import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SessionContext = createContext();

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
            name: decoded.name || decoded.email.split('@')[0]
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
    
    setSession({
      token,
      user: {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name || decoded.email.split('@')[0]
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

  const value = {
    session,
    loading,
    login,
    logout,
    getToken
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};