import React, { useState } from 'react';
import { FaUserCircle, FaEnvelope, FaCalendarAlt } from 'react-icons/fa';
import { useSession } from '../contexts/SessionContext';
import Sidebar from '../components/Sidebar';
import Auth from '../components/Auth';

const gridBg = {
  backgroundImage: 'linear-gradient(rgba(136,189,242,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(136,189,242,0.04) 1px, transparent 1px)',
  backgroundSize: '48px 48px',
};

const ProfileRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 py-4 border-b border-wa-accent/15 last:border-0">
    <Icon size={16} className="text-wa-dim flex-shrink-0" />
    <div>
      <p className="text-[10px] uppercase tracking-widest text-wa-dim/60 mb-0.5">{label}</p>
      <p className="text-sm text-wa-text">{value}</p>
    </div>
  </div>
);

function Dashboard() {
  const { session, logout, guestMode } = useSession();
  const [showAuth, setShowAuth] = useState(false);

  const formatDob = (dob) => {
    if (!dob) return '—';
    return new Date(dob + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="flex h-screen bg-wa-bg" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div className="fixed inset-0 pointer-events-none z-0" style={gridBg} />
      <Sidebar />

      <div className="flex-1 ml-20 overflow-y-auto p-6 relative z-10">
        <div className="max-w-xl mx-auto pt-4">

          <h1 className="text-3xl font-bold text-wa-text mb-8" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}>
            Settings
          </h1>

          {/* Profile card */}
          <div
            className="rounded-2xl p-6 mb-4 border border-wa-accent/20"
            style={{ backgroundColor: 'rgba(46,61,74,0.8)' }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-widest text-wa-dim mb-4">
              Profile
            </h2>
            <ProfileRow icon={FaUserCircle} label="First Name" value={guestMode ? 'Guest' : session.user.first_name} />
            <ProfileRow icon={FaUserCircle} label="Last Name"  value={guestMode ? '—' : session.user.last_name} />
            <ProfileRow icon={FaCalendarAlt} label="Date of Birth" value={guestMode ? '—' : formatDob(session.user.dob)} />
            <ProfileRow icon={FaEnvelope} label="Email" value={guestMode ? 'Not signed in' : session.user.email} />
          </div>

          {/* Account card */}
          <div
            className="rounded-2xl p-6 border border-wa-accent/20"
            style={{ backgroundColor: 'rgba(46,61,74,0.8)' }}
          >
            <h2 className="text-xs font-semibold uppercase tracking-widest text-wa-dim mb-4">
              Account
            </h2>
            <div className="flex items-center justify-between">
              {guestMode ? (
                <>
                  <div>
                    <p className="text-sm font-medium text-wa-text">Create an account</p>
                    <p className="text-xs text-wa-dim mt-0.5">Sign up to save your data and unlock all features.</p>
                  </div>
                  <button
                    onClick={() => setShowAuth(true)}
                    className="bg-wa-accent hover:bg-wa-accent-lt hover:text-[#1a2530] text-white text-sm font-semibold py-2 px-5 rounded-lg transition-all duration-150"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm font-medium text-wa-text">Log out</p>
                    <p className="text-xs text-wa-dim mt-0.5">You will be returned to the home page.</p>
                  </div>
                  <button
                    onClick={logout}
                    className="text-sm font-semibold py-2 px-5 rounded-lg transition-all duration-150 border border-red-400/30 text-red-400 hover:bg-red-400/10"
                  >
                    Log out
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      <Auth isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
}

export default Dashboard;
