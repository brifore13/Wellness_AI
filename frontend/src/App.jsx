import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSession } from './contexts/SessionContext';

// Pages (we'll create these next)
import Home from './pages/Home';
import Chat from './pages/Chat';
import DailyCheckin from './pages/DailyCheckin';
import Dashboard from './pages/Dashboard';
import WellnessPriorities from './pages/WellnessPriorities';
import ChatHistory from './pages/ChatHistory';

// Protected Route Component
// allowGuest: if true, guests in guest mode can also access this route
const ProtectedRoute = ({ children, allowGuest = false }) => {
  const { session, loading, guestMode } = useSession();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session && !(allowGuest && guestMode)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<Home />} />

      {/* Protected Routes */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute allowGuest>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/daily-checkin"
        element={
          <ProtectedRoute>
            <DailyCheckin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/wellness-priorities"
        element={
          <ProtectedRoute>
            <WellnessPriorities />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat-history"
        element={
          <ProtectedRoute>
            <ChatHistory />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;