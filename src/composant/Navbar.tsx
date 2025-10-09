import { Link, useLocation } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaCog, FaHome, FaBriefcase, FaComments, FaChartBar } from 'react-icons/fa';
import { useAuthStore } from '@/store/useAuthStore';
import NotificationBell from './NotificationBell';
import { ModeToggle } from '@/components/mode-toggle';
import {useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
   const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/login');
  };

  return (
    <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-100 dark:border-gray-800 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center space-x-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">MS</span>
          </div>
          <span>MiniSocial</span>
        </Link>

        {/* Navigation Links 
        <div className="hidden md:flex items-center space-x-1">
          <Link
            to="/"
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive('/') 
                ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700' 
                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <FaHome className="mr-2" />
            Accueil
          </Link>

          <Link
            to="/offers"
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive('/offers') 
                ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700' 
                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <FaBriefcase className="mr-2" />
            Offres
          </Link>

          <Link
            to="/chat-offers"
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive('/chat-offers') 
                ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700' 
                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <FaComments className="mr-2" />
            Chat
          </Link>

          <Link
            to="/dashboard"
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive('/dashboard') 
                ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700' 
                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <FaChartBar className="mr-2" />
            Dashboard
          </Link>
        </div>*/}

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <ModeToggle />

          {/* Notification Bell */}
          <NotificationBell />

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.name || 'Utilisateur'}
              </span>
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
                
                <div className="p-2">
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-150"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <FaUserCircle className="mr-3 text-gray-400" />
                    Mon Profil
                  </Link>
                  
                  <Link
                    to="/settings"
                    className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-150"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <FaCog className="mr-3 text-gray-400" />
                    Paramètres
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-150"
                  >
                    <FaSignOutAlt className="mr-3" />
                    Se déconnecter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden mt-4 px-6">
        <div className="flex items-center justify-around space-x-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-1">
          <Link
            to="/"
            className={`flex-1 flex flex-col items-center py-2 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
              isActive('/') 
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <FaHome className="mb-1" />
            Accueil
          </Link>

          <Link
            to="/offers"
            className={`flex-1 flex flex-col items-center py-2 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
              isActive('/offers') 
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <FaBriefcase className="mb-1" />
            Offres
          </Link>

          <Link
            to="/chat-offers"
            className={`flex-1 flex flex-col items-center py-2 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
              isActive('/chat-offers') 
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <FaComments className="mb-1" />
            Chat
          </Link>

          <Link
            to="/dashboard"
            className={`flex-1 flex flex-col items-center py-2 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
              isActive('/dashboard') 
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <FaChartBar className="mb-1" />
            Dashboard
          </Link>
        </div>
      </div>

      {/* Backdrop */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
