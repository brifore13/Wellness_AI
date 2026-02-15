import React, { useState } from 'react';
import siteIcon from '../assets/site_icon.png';
import { useSession } from '../contexts/SessionContext';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

const AuthModal = ({ isOpen, onClose }) => {
  const { login } = useSession();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const payload = isLogin 
        ? { email, password }
        : { email, password, name };

      const response = await axios.post(`${BACKEND_URL}${endpoint}`, payload);

      if (response.data.access_token) {
        login(response.data.access_token);
        onClose();
        // Reset form
        setEmail('');
        setPassword('');
        setName('');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" 
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg flex flex-col items-center" 
        onClick={e => e.stopPropagation()}
      >
        <img src={siteIcon} alt="Logo" className="w-16 h-16 mb-4 rounded-full" />
        <h2 className="text-3xl font-bold mb-2 text-gray-900">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-gray-600 mb-8 text-center text-base">
          {isLogin ? 'Sign in to continue your wellness journey' : 'Start your wellness journey today'}
        </p>

        {error && (
          <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your name"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className="mt-4 text-blue-600 hover:text-blue-800 transition-colors"
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>

        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AuthModal;