import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Code2, Menu, X, Trophy, Users } from 'lucide-react';
import { ProfessionalButton } from './ui/ProfessionalButton';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const PublicNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: Code2 },
    { path: '/public-challenges', label: 'Challenges', icon: Trophy },
    { path: '/public-leaderboard', label: 'Leaderboard', icon: Users },
  ];

  // Helper function to get user initials
  const getUserInitials = () => {
    if (user?.profile?.firstName && user?.profile?.lastName) {
      return `${user.profile.firstName.charAt(0)}${user.profile.lastName.charAt(0)}`.toUpperCase();
    }
    return user?.username?.charAt(0)?.toUpperCase() || 'U';
  };

  // Helper function to get display name
  const getDisplayName = () => {
    if (user?.profile?.firstName && user?.profile?.lastName) {
      return `${user.profile.firstName} ${user.profile.lastName}`;
    }
    return user?.username || 'User';
  };

  const handleStartCode = () => {
    if (user) {
      navigate('/portal');
    } else {
      navigate('/login');
    }
  };
  return (
    <nav className="glass-effect border-b border-gray-700/50 sticky top-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Code2 className="h-6 w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
            </div>
            <span className="font-black text-xl text-gray-900 dark:bg-gradient-to-r dark:from-blue-600 dark:to-purple-600 dark:bg-clip-text dark:text-transparent">
              StackRush
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive(path)
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/25'
                    : 'text-gray-900 hover:text-white hover:bg-gray-700/50 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
            
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <ProfessionalButton 
                variant="primary" 
                size="sm"
                onClick={handleStartCode}
              >
                Start Code
              </ProfessionalButton>
              
              {user ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {getUserInitials()}
                  </div>
                  <span className="text-gray-900 dark:text-white font-medium">{getDisplayName()}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/login">
                    <ProfessionalButton variant="outline" size="sm">
                      Login
                    </ProfessionalButton>
                  </Link>
                  <Link to="/signup">
                    <ProfessionalButton variant="secondary" size="sm">
                      Sign Up
                    </ProfessionalButton>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-200"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 glass-effect rounded-2xl mt-2 border border-gray-700/50 shadow-xl">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 ${
                    isActive(path)
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                <ThemeToggle />
                <ThemeToggle />
                <ProfessionalButton 
                  variant="primary" 
                  className="w-full"
                  onClick={() => {handleStartCode(); setIsOpen(false);}}
                >
                  Start Code
                </ProfessionalButton>
                {!user && (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <ProfessionalButton variant="outline" className="w-full">
                        Login
                      </ProfessionalButton>
                    </Link>
                    <Link to="/signup" onClick={() => setIsOpen(false)}>
                      <ProfessionalButton variant="secondary" className="w-full">
                        Sign Up
                      </ProfessionalButton>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default PublicNavbar;