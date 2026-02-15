import React from 'react';
import { FaUserCircle, FaEnvelope } from 'react-icons/fa';
import { useSession } from '../contexts/SessionContext';
import Sidebar from '../components/Sidebar';

function Dashboard() {
  const { session, logout } = useSession();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 ml-20 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">
            User Settings
          </h1>
          
          {/* Profile Information */}
          <div className="bg-white p-8 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b pb-4">
              Profile Information
            </h2>
            <div className="space-y-6">
              <div className="flex items-center">
                <FaUserCircle className="text-gray-400 mr-4" size={24} />
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Full Name
                  </label>
                  <p className="text-lg text-gray-900">{session.user.name}</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="text-gray-400 mr-4" size={24} />
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Email Address
                  </label>
                  <p className="text-lg text-gray-900">{session.user.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b pb-4">
              Account
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">Log Out</p>
                <p className="text-sm text-gray-500">
                  You will be returned to the home page.
                </p>
              </div>
              <button 
                onClick={logout}
                className="bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;