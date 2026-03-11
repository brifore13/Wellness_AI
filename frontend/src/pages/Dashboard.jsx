import React, { useState } from 'react';
import { FaUserCircle, FaEnvelope, FaCalendarAlt, FaPencilAlt, FaCheck, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { useSession } from '../contexts/SessionContext';
import Sidebar from '../components/Sidebar';
import Auth from '../components/Auth';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

const gridBg = {
  backgroundImage: 'linear-gradient(rgba(136,189,242,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(136,189,242,0.04) 1px, transparent 1px)',
  backgroundSize: '48px 48px',
};

const formatDob = (dob) => {
  if (!dob) return '—';
  return new Date(dob + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// ── Inline editable row ───────────────────────────────────────
const EditableRow = ({ icon: Icon, label, value, fieldKey, inputType = 'text', onSave }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(fieldKey, draft);
    setSaving(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(value || '');
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b border-wa-accent/15 last:border-0">
      <Icon size={15} className="text-wa-dim flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-wa-dim/60 mb-1">{label}</p>
        {editing ? (
          <input
            type={inputType}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            autoFocus
            className="w-full bg-wa-bg border border-wa-accent-lt/40 rounded-lg px-3 py-1.5 text-sm text-wa-text focus:outline-none focus:border-wa-accent-lt/70 transition-colors"
          />
        ) : (
          <p className="text-sm text-wa-text truncate">
            {inputType === 'date' ? formatDob(value) : (value || '—')}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {editing ? (
          <>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-wa-accent/20 border border-wa-accent-lt/25 hover:bg-wa-accent/40 transition-colors disabled:opacity-50"
            >
              <FaCheck size={11} className="text-wa-accent-lt" />
            </button>
            <button
              onClick={handleCancel}
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-wa-bg border border-wa-accent/20 hover:border-wa-accent/40 transition-colors"
            >
              <FaTimes size={11} className="text-wa-dim" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center border border-transparent hover:border-wa-accent/30 hover:bg-wa-accent/10 transition-all duration-150"
          >
            <FaPencilAlt size={11} className="text-wa-dim/50 hover:text-wa-dim" />
          </button>
        )}
      </div>
    </div>
  );
};

// ── Dashboard ─────────────────────────────────────────────────
function Dashboard() {
  const { session, logout, guestMode, login } = useSession();
  const [showAuth, setShowAuth] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const handleSave = async (field, value) => {
    setSaveError('');
    setSaveSuccess('');
    try {
      const response = await axios.patch(
        `${BACKEND_URL}/api/auth/profile`,
        { [field]: value },
        { headers: { Authorization: `Bearer ${session.token}` } }
      );
      // Re-login with fresh token to update session context
      login(response.data.access_token);
      setSaveSuccess('Saved');
      setTimeout(() => setSaveSuccess(''), 2000);
    } catch (err) {
      setSaveError(err.response?.data?.detail || 'Failed to save. Please try again.');
      setTimeout(() => setSaveError(''), 3000);
    }
  };

  return (
    <div className="flex h-screen bg-wa-bg" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div className="fixed inset-0 pointer-events-none z-0" style={gridBg} />
      <Sidebar />

      <div className="flex-1 ml-20 overflow-y-auto p-6 relative z-10">
        <div className="max-w-xl mx-auto pt-4">

          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-wa-text" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}>
              Settings
            </h1>
            {saveSuccess && (
              <span className="text-xs text-wa-accent-lt flex items-center gap-1.5">
                <FaCheck size={10} /> {saveSuccess}
              </span>
            )}
            {saveError && (
              <span className="text-xs text-red-400">{saveError}</span>
            )}
          </div>

          {/* Profile card */}
          <div
            className="rounded-2xl px-6 pt-5 pb-2 mb-4 border border-wa-accent/20"
            style={{ backgroundColor: 'rgba(46,61,74,0.8)' }}
          >
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-wa-dim mb-2">
              Profile
            </h2>

            {guestMode ? (
              <div className="py-4 space-y-4">
                {[
                  { icon: FaUserCircle, label: 'First Name', value: 'Guest' },
                  { icon: FaUserCircle, label: 'Last Name',  value: '—' },
                  { icon: FaCalendarAlt, label: 'Date of Birth', value: '—' },
                  { icon: FaEnvelope,   label: 'Email',      value: 'Not signed in' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-4 py-2 border-b border-wa-accent/15 last:border-0">
                    <Icon size={15} className="text-wa-dim flex-shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-wa-dim/60 mb-1">{label}</p>
                      <p className="text-sm text-wa-dim">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <EditableRow icon={FaUserCircle}  label="First Name"    fieldKey="first_name" value={session.user.first_name} onSave={handleSave} />
                <EditableRow icon={FaUserCircle}  label="Last Name"     fieldKey="last_name"  value={session.user.last_name}  onSave={handleSave} />
                <EditableRow icon={FaCalendarAlt} label="Date of Birth" fieldKey="dob"        value={session.user.dob}        onSave={handleSave} inputType="date" />
                {/* Email read-only — changing email needs verification flow */}
                <div className="flex items-center gap-4 py-4">
                  <FaEnvelope size={15} className="text-wa-dim flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-widest text-wa-dim/60 mb-1">Email</p>
                    <p className="text-sm text-wa-text">{session.user.email}</p>
                  </div>
                  <span className="text-[10px] text-wa-dim/40 border border-wa-accent/15 px-2 py-0.5 rounded-full">
                    read only
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Account card */}
          <div
            className="rounded-2xl p-6 border border-wa-accent/20"
            style={{ backgroundColor: 'rgba(46,61,74,0.8)' }}
          >
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-wa-dim mb-4">
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
