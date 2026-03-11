import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaCommentDots, FaCalendar, FaUser, FaBars, FaHistory, FaHeartbeat } from 'react-icons/fa';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/chat',                icon: FaCommentDots, label: 'Chat' },
    { path: '/daily-checkin',       icon: FaCalendar,    label: 'Daily Check-In' },
    { path: '/settings',            icon: FaUser,        label: 'Settings' },
    { path: '/chat-history',        icon: FaHistory,     label: 'Chat History' },
    { path: '/wellness-priorities', icon: FaBars,        label: 'Wellness Priorities' },
  ];

  return (
    <div
      className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out border-r border-wa-accent/20 ${
        isExpanded ? 'w-56' : 'w-20'
      }`}
      style={{ backgroundColor: 'rgba(46,61,74,0.95)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
    >
      {/* Logo row */}
      <div className="flex items-center px-4 py-[18px] border-b border-wa-accent/20">
        {/* Icon — toggles expand/collapse */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-wa-accent/20 border border-wa-accent-lt/25 hover:bg-wa-accent/30 transition-colors duration-150"
        >
          <FaHeartbeat size={16} className="text-wa-accent-lt" />
        </button>

        {/* Label — navigates home when expanded */}
        {isExpanded && (
          <button
            onClick={() => navigate('/')}
            className="ml-3 text-[15px] font-semibold text-wa-text tracking-tight hover:text-wa-accent-lt transition-colors duration-150 bg-transparent border-none cursor-pointer"
          >
            Wellness AI
          </button>
        )}

        {/* Collapse/expand toggle when collapsed */}
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="sr-only"
          />
        )}
      </div>

      {/* Expand toggle strip — click anywhere on sidebar body to expand when collapsed */}
      {!isExpanded && (
        <div
          className="absolute inset-0 top-[61px] cursor-pointer"
          onClick={() => setIsExpanded(true)}
        />
      )}

      {/* Nav items */}
      <nav className="mt-4 px-3 relative z-10">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => {}}
                  className={`flex items-center p-3 rounded-xl transition-all duration-150 ${
                    active
                      ? 'bg-wa-accent/20 text-wa-accent-lt border border-wa-accent-lt/20'
                      : 'text-wa-dim hover:bg-wa-accent/10 hover:text-wa-text border border-transparent'
                  }`}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {isExpanded && (
                    <span className="ml-3 text-sm font-medium">{item.label}</span>
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
