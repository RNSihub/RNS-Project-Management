import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  User, 
  Calendar, 
  CheckSquare, 
  MessageCircle, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Grid,
  Clock,
  Bell,
  Award,
  BarChart2
} from 'lucide-react';

const Sidebar = ({ user, onLogout }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [greeting, setGreeting] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Dynamic greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    let currentGreeting = 'Good evening';
    
    if (hour >= 5 && hour < 12) {
      currentGreeting = 'Good morning';
    } else if (hour >= 12 && hour < 18) {
      currentGreeting = 'Good afternoon';
    }
    
    setGreeting(currentGreeting);
  }, []);

  // Get user initials
  const getUserInitials = (name) => {
    return name 
      ? name.split(' ')
          .map(word => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : 'UN';
  };

  // Determine if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Navigation menu items with updated icons and structure
  const menuItems = [
    { 
      icon: <Home size={20} />, 
      label: 'Dashboard', 
      path: '/dashboard',
      category: 'Main'
    },
    { 
      icon: <Grid size={20} />, 
      label: 'Projects', 
      path: '/projects',
      category: 'Workspace'
    },
    { 
      icon: <Calendar size={20} />, 
      label: 'Attendance', 
      path: '/attendance',
      category: 'Workspace'
    },
    { 
      icon: <CheckSquare size={20} />, 
      label: 'To-Do', 
      path: '/todo',
      category: 'Productivity'
    },
    { 
      icon: <Clock size={20} />, 
      label: 'Time Tracking', 
      path: '/time-tracking',
      category: 'Productivity'
    },
    { 
      icon: <MessageCircle size={20} />, 
      label: 'Communication', 
      path: '/chat',
      category: 'Collaboration'
    },
    
    
  ];

  // Group menu items by category
  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <div 
      className={`
        fixed left-0 top-0 bottom-0 bg-gradient-to-b from-white to-blue-50 
        shadow-2xl transition-all duration-300 overflow-hidden
        ${isExpanded ? 'w-64' : 'w-20'}
        flex flex-col
      `}
    >
      {/* Sidebar Toggle Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-4 -right-1 bg-white shadow-md rounded-full p-2 z-50 hover:bg-blue-50 transition"
      >
        {isExpanded ? <ChevronLeft size={25} /> : <ChevronRight size={25}/>}
      </button>

      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
        <div 
          className={`
            w-12 h-12 rounded-full flex items-center justify-center 
            ${user?.profilePicture ? 'p-0' : 'bg-blue-500 text-white'}
            shadow-md
          `}
        >
          {user?.profilePicture ? (
            <img 
              src={user.profilePicture} 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover" 
            />
          ) : (
            <span className="font-bold">{getUserInitials(user?.username)}</span>
          )}
        </div>
        
        {isExpanded && (
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {user?.username || 'User'}
            </p>
            <p className="text-xs text-gray-500">
              {greeting}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-grow pt-4 overflow-y-auto custom-scrollbar">
        {Object.entries(groupedMenuItems).map(([category, items]) => (
          <div key={category} className="mb-4">
            {isExpanded && (
              <p className="px-4 text-xs font-bold text-gray-400 uppercase mb-2">
                {category}
              </p>
            )}
            <ul>
              {items.map((item, index) => (
                <li key={index} className="mb-1">
                  <Link 
                    to={item.path} 
                    className={`
                      flex items-center p-3 mx-2 rounded-md transition-all 
                      ${isActive(item.path) 
                        ? 'bg-blue-100 text-blue-600 shadow-md' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-blue-500'}
                      group
                    `}
                  >
                    <span className={`mr-3 ${isActive(item.path) ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'}`}>
                      {item.icon}
                    </span>
                    {isExpanded && <span className="text-sm">{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Section - Settings and Logout */}
      <div className="border-t border-gray-200 p-4">
        <Link 
          to="/profile" 
          className={`
            flex items-center p-3 rounded-md mb-2 
            text-gray-600 hover:bg-gray-100 hover:text-blue-600
            group
          `}
        >
          <User size={20} className={`mr-3 text-gray-400 group-hover:text-blue-500`} />
          {isExpanded && 'Profile'}
        </Link>

        <Link 
          to="/settings" 
          className={`
            flex items-center p-3 rounded-md mb-2 
            text-gray-600 hover:bg-gray-100 hover:text-blue-600
            group
          `}
        >
          <Settings size={20} className={`mr-3 text-gray-400 group-hover:text-blue-500`} />
          {isExpanded && 'Settings'}
        </Link>
        
        <button 
          onClick={() => {
            onLogout();
            navigate('/');
          }}
          className={`
            w-full flex items-center p-3 rounded-md 
            text-red-600 hover:bg-red-50
            group
          `}
        >
          <LogOut size={20} className="mr-3 text-red-400 group-hover:text-red-600" />
          {isExpanded && 'Logout'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;