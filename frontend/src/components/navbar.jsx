import React, { useState, useEffect, useRef } from 'react';
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
  BarChart2,
  Bot,
  FileText,
  Mic,
  Headphones,
  FileSearch,
  Globe,
  Edit3,
  Zap,
  Briefcase,
  ChevronDown,
  ArrowDown,
  MoreHorizontal,
  FileSearch2,
  FileSearchIcon,
  Mail
} from 'lucide-react';

const Sidebar = ({ user, onLogout }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showMoreHint, setShowMoreHint] = useState(true);
  const [visibleCategories, setVisibleCategories] = useState(['Main', 'Workspace', 'Productivity', 'Collaboration']);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const navRef = useRef(null);
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

  // Hide the hint after some time
  useEffect(() => {
    if (showMoreHint) {
      const timer = setTimeout(() => {
        setShowMoreHint(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showMoreHint]);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current && navRef.current.scrollTop > 150) {
        setShowMoreHint(false);
      }
    };

    const navElement = navRef.current;
    if (navElement) {
      navElement.addEventListener('scroll', handleScroll);
      return () => navElement.removeEventListener('scroll', handleScroll);
    }
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

  // Toggle show all categories
  const toggleShowAllCategories = () => {
    setShowAllCategories(!showAllCategories);
    setShowMoreHint(false);
    
    // Scroll to the newly revealed categories after a brief delay
    if (!showAllCategories) {
      setTimeout(() => {
        navRef.current?.scrollTo({
          top: navRef.current.scrollHeight / 2,
          behavior: 'smooth'
        });
      }, 100);
    }
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
      icon: <Briefcase size={20} />, 
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
    { 
      icon: <Bot size={20} />, 
      label: 'Chatbot', 
      path: '/chatbot',
      category: 'AI Assistant'
    },
    { 
      icon: <FileText size={20} />, 
      label: 'Content Generation', 
      path: '/content-generation',
      category: 'AI Assistant'
    },
    { 
      icon: <FileText size={20} />, 
      label: 'MOM Creator', 
      path: '/daily-scrum-report',
      category: 'Main Tools'
    },
    { 
      icon: <FileSearch2 size={20} />, 
      label: 'Daily Report Creator', 
      path: '/daily-report',
      category: 'Main Tools'
    },
    { 
      icon: <Mail size={20} />, 
      label: 'Mail Drafter', 
      path: '/mail-drafter',
      category: 'Main Tools'
    },
    { 
      icon: <Headphones size={20} />, 
      label: 'Text to Speech', 
      path: '/text-to-speech',
      category: 'Text Tools'
    },
    { 
      icon: <Mic size={20} />, 
      label: 'Speech to Text', 
      path: '/speech-to-text',
      category: 'Text Tools'
    },
    { 
      icon: <FileSearch size={20} />, 
      label: 'Text Summarization', 
      path: '/text-summarization',
      category: 'Text Tools'
    },
    { 
      icon: <Globe size={20} />, 
      label: 'Text Translation', 
      path: '/text-translation',
      category: 'Text Tools'
    },
    { 
      icon: <Edit3 size={20} />, 
      label: 'Text Correction', 
      path: '/text-correction',
      category: 'Text Tools'
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

  // Get categories to show based on toggle state
  const categoriesToShow = showAllCategories 
    ? Object.keys(groupedMenuItems) 
    : visibleCategories;

  return (
    <div 
      className={`
        fixed left-0 top-0 bottom-0 bg-gradient-to-b from-blue-50 to-indigo-50 
        shadow-2xl transition-all duration-300 overflow-hidden
        ${isExpanded ? 'w-64' : 'w-20'}
        flex flex-col
      `}
    >
      {/* Sidebar Toggle Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-4 -right-1 bg-white shadow-md rounded-full p-2 z-50 hover:bg-blue-50 transition-all duration-300 hover:scale-110"
        style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(180deg)' }}
      >
        <ChevronLeft size={25} className="transition-transform duration-300" />
      </button>

      {/* User Profile Section */}
      <div className="p-4 border-b border-indigo-100 flex items-center space-x-3">
        <div 
          className={`
            w-12 h-12 rounded-full flex items-center justify-center 
            ${user?.profilePicture ? 'p-0' : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'}
            shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105
            ring-2 ring-indigo-100
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
          <div className="transition-opacity duration-300">
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
      <nav 
        className="flex-grow pt-4 overflow-y-auto custom-scrollbar relative"
        ref={navRef}
      >
        {Object.entries(groupedMenuItems)
          .filter(([category]) => categoriesToShow.includes(category))
          .map(([category, items]) => (
            <div key={category} className="mb-4">
              {isExpanded && (
                <p className="px-4 text-xs font-bold text-indigo-400 uppercase mb-2 transition-all duration-300">
                  {category}
                </p>
              )}
              <ul>
                {items.map((item, index) => (
                  <li 
                    key={index} 
                    className="mb-1"
                    onMouseEnter={() => setHoveredItem(`${category}-${index}`)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <Link 
                      to={item.path} 
                      className={`
                        flex items-center p-3 mx-2 rounded-md transition-all duration-300
                        ${isActive(item.path) 
                          ? 'bg-indigo-100 text-indigo-600 shadow-lg translate-x-1' 
                          : 'text-gray-600 hover:bg-blue-50 hover:text-indigo-500 hover:translate-x-1'}
                        group relative overflow-hidden
                      `}
                    >
                      <span 
                        className={`
                          mr-3 transition-all duration-300 relative z-10
                          ${isActive(item.path) 
                            ? 'text-indigo-600 scale-110' 
                            : 'text-gray-400 group-hover:text-indigo-500 group-hover:scale-110'}
                          ${hoveredItem === `${category}-${index}` ? 'animate-pulse' : ''}
                        `}
                      >
                        {item.icon}
                      </span>
                      {isExpanded && (
                        <span 
                          className={`
                            text-sm transition-all duration-300 relative z-10
                            ${hoveredItem === `${category}-${index}` ? 'font-medium' : ''}
                          `}
                        >
                          {item.label}
                        </span>
                      )}
                      
                      {/* Hover effect background */}
                      <span className={`
                        absolute inset-0 bg-gradient-to-r from-transparent via-indigo-50 to-transparent 
                        transform translate-x-full group-hover:translate-x-0 transition-transform duration-500
                        opacity-60
                      `}></span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        {/* Show More Button - Only visible when there are hidden categories */}
        {Object.keys(groupedMenuItems).length > visibleCategories.length && (
          <div className="relative px-4 py-2">
            <button
              onClick={toggleShowAllCategories}
              className={`
                w-full flex items-center justify-center py-2 rounded-md bg-gradient-to-r from-indigo-50 to-blue-50
                text-indigo-600 hover:shadow-md transition-all duration-300 border border-indigo-100
                group hover:bg-gradient-to-r hover:from-indigo-100 hover:to-blue-100
              `}
            >
              <span className="text-sm mr-2">{showAllCategories ? 'Show Less' : 'Show More'}</span>
              <ChevronDown 
                size={18} 
                className={`
                  transform transition-transform duration-300 group-hover:translate-y-1
                  ${showAllCategories ? 'rotate-180' : 'animate-bounce'}
                `}
              />
            </button>

            {/* Swipe down hint animation */}
            {showMoreHint && !showAllCategories && (
              <div className="absolute left-0 right-0 flex justify-center mt-2">
                <div className="flex flex-col items-center animate-pulse text-indigo-400">
                  <ArrowDown size={20} className="animate-bounce" />
                  <p className="text-xs">Swipe for more features</p>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Bottom Section - Settings and Logout */}
      <div className="border-t border-indigo-100 p-4 bg-gradient-to-b from-transparent to-indigo-50">
        <Link 
          to="/profile" 
          className={`
            flex items-center p-3 rounded-md mb-2 
            text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 transition-all duration-300
            group hover:translate-x-1 relative overflow-hidden
          `}
          onMouseEnter={() => setHoveredItem('profile')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <User 
            size={20} 
            className={`
              mr-3 text-gray-400 group-hover:text-indigo-500 transition-all duration-300 group-hover:scale-110
              ${hoveredItem === 'profile' ? 'animate-pulse' : ''}
            `} 
          />
          {isExpanded && (
            <span className={`text-sm ${hoveredItem === 'profile' ? 'font-medium' : ''}`}>
              Profile
            </span>
          )}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-50 to-transparent 
            transform translate-x-full group-hover:translate-x-0 transition-transform duration-500
            opacity-60"></span>
        </Link>

        <Link 
          to="/settings" 
          className={`
            flex items-center p-3 rounded-md mb-2 
            text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 transition-all duration-300
            group hover:translate-x-1 relative overflow-hidden
          `}
          onMouseEnter={() => setHoveredItem('settings')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Settings 
            size={20} 
            className={`
              mr-3 text-gray-400 group-hover:text-indigo-500 transition-all duration-300 group-hover:scale-110
              ${hoveredItem === 'settings' ? 'animate-pulse' : ''}
            `} 
          />
          {isExpanded && (
            <span className={`text-sm ${hoveredItem === 'settings' ? 'font-medium' : ''}`}>
              Settings
            </span>
          )}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-50 to-transparent 
            transform translate-x-full group-hover:translate-x-0 transition-transform duration-500
            opacity-60"></span>
        </Link>
        
        <button 
          onClick={() => {
            onLogout();
            navigate('/');
          }}
          className={`
            w-full flex items-center p-3 rounded-md 
            text-red-600 hover:bg-red-50 transition-all duration-300
            group hover:translate-x-1 relative overflow-hidden
          `}
          onMouseEnter={() => setHoveredItem('logout')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <LogOut 
            size={20} 
            className={`
              mr-3 text-red-400 group-hover:text-red-600 transition-all duration-300 group-hover:scale-110
              ${hoveredItem === 'logout' ? 'animate-pulse' : ''}
            `} 
          />
          {isExpanded && (
            <span className={`text-sm ${hoveredItem === 'logout' ? 'font-medium' : ''}`}>
              Logout
            </span>
          )}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-red-50 to-transparent 
            transform translate-x-full group-hover:translate-x-0 transition-transform duration-500
            opacity-60"></span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;