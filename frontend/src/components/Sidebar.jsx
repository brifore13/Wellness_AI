import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCommentDots, FaCalendar, FaUser, FaBars, FaHistory } from 'react-icons/fa';
import siteIcon from '../assets/site_icon.png';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/chat', icon: FaCommentDots, label: 'Chat' },
    { path: '/daily-checkin', icon: FaCalendar, label: 'Daily Check-In' },
    { path: '/dashboard', icon: FaUser, label: 'Dashboard' },
    { path: '/chat-history', icon: FaHistory, label: 'Chat History' },
    { path: '/wellness-priorities', icon: FaBars, label: 'Wellness Priorities' }
  ];

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 ease-in-out z-50 ${
        isExpanded ? 'w-64' : 'w-20'
      }`}
    >
      {/* Toggle Button */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center p-4 cursor-pointer hover:bg-gray-100 transition-colors"
      >
        <img src={siteIcon} alt="Site Icon" className="w-12 h-12 flex-shrink-0" />
        {isExpanded && (
          <span className="ml-3 text-xl font-semibold text-gray-800">
            Benny
          </span>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-gray-100 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  <Icon size={24} className="flex-shrink-0" />
                  {isExpanded && (
                    <span className="ml-4 font-medium">
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;