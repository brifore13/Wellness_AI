import React, { useState } from 'react';
import axios from 'axios';
import { useSession } from '../contexts/SessionContext';
import { FaHeartbeat } from 'react-icons/fa';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

const inputClass = `
  w-full px-4 py-3 text-sm rounded-lg border
  bg-wa-bg text-wa-text placeholder-wa-dim/50
  border-wa-accent/30 focus:outline-none focus:border-wa-accent-lt/60
  transition-colors duration-150
`;

const labelClass = "block text-xs font-medium text-wa-dim mb-1.5 uppercase tracking-wide";

const Auth = ({ isOpen, onClose }) => {
  const { login } = useSession();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
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
        : { email, password, first_name: firstName, last_name: lastName, dob };
      const response = await axios.post(`${BACKEND_URL}${endpoint}`, payload);
      if (response.data.access_token) {
        login(response.data.access_token);
        onClose();
        setEmail(''); setPassword(''); setFirstName(''); setLastName(''); setDob('');
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-8 flex flex-col items-center border border-wa-accent/20"
        style={{ backgroundColor: '#2e3d4a', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-wa-dim hover:text-wa-text transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-wa-accent/20 border border-wa-accent-lt/25">
          <FaHeartbeat size={20} className="text-wa-accent-lt" />
        </div>

        <h2 className="text-2xl font-bold text-wa-text mb-1" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}>
          {isLogin ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="text-wa-dim text-xs mb-7 text-center">
          {isLogin ? 'Sign in to continue' : 'Start tracking your performance'}
        </p>

        {/* Error */}
        {error && (
          <div className="w-full px-4 py-2.5 rounded-lg mb-4 text-sm border border-red-400/30 bg-red-400/10 text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {!isLogin && (
            <>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className={labelClass}>First Name</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                    className={inputClass} placeholder="Jane" required />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Last Name</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                    className={inputClass} placeholder="Doe" required />
                </div>
              </div>
              <div>
                <label className={labelClass}>Date of Birth</label>
                <input type="date" value={dob} onChange={e => setDob(e.target.value)}
                  className={inputClass} required />
              </div>
            </>
          )}

          <div>
            <label className={labelClass}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className={inputClass} placeholder="your@email.com" required />
          </div>

          <div>
            <label className={labelClass}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className={inputClass} placeholder="••••••••" required />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-wa-accent hover:bg-wa-accent-lt hover:text-[#1a2530] text-white font-semibold py-3 rounded-lg transition-all duration-150 disabled:opacity-50 mt-2"
          >
            {loading ? 'Loading...' : (isLogin ? 'Sign in' : 'Sign up')}
          </button>
        </form>

        <button
          onClick={() => { setIsLogin(!isLogin); setError(''); }}
          className="mt-5 text-xs text-wa-dim hover:text-wa-accent-lt transition-colors duration-150"
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  );
};

export default Auth;
