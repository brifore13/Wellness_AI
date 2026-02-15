import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import Auth from './Auth';

const Header = () => {
  const { session, loading, logout } = useSession();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <header className="w-full p-4 flex items-center justify-between bg-gray-50">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold text-gray-800 hover:text-gray-600 transition-colors">
            Benny Wellness AI
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
          ) : session ? (
            <>
              <span className="text-gray-700 font-medium">
                {session.user.name}
              </span>
              <Link
                to="/dashboard"
                className="text-blue-600 font-semibold hover:text-blue-800 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={logout}
                className="text-red-600 font-semibold hover:text-red-800 transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="bg-black text-white font-semibold py-2 px-6 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      <Auth isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
};

export default Header;