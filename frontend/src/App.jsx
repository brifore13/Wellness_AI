import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSession } from './contexts/SessionContext';

import Chat from './pages/Chat';
import DailyCheckin from './pages/DailyCheckin';
import Dashboard from './pages/Dashboard';
import WellnessPriorities from './pages/WellnessPriorities';
import ChatHistory from './pages/ChatHistory';
import Home from './pages/Home'

// Protected Route Component
// allowGuest: if true, unauthenticated users can also access this route
const ProtectedRoute = ({ children, allowGuest = false }) => {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session && !allowGuest) {
    return <Navigate to="/chat" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Default: redirect root to chat */}
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
          <ProtectedRoute allowGuest>
            <DailyCheckin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowGuest>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/wellness-priorities"
        element={
          <ProtectedRoute allowGuest>
            <WellnessPriorities />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat-history"
        element={
          <ProtectedRoute allowGuest>
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