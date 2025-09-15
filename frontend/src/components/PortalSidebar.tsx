import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, Trophy, Code, Settings, User, BookOpen, Target, 
  Users, Award, Calendar, TrendingUp, Zap, Bug, Briefcase,
  ChevronLeft, ChevronRight, Home, Play, Clock, Star, MessageSquare,
  GraduationCap
} from 'lucide-react';
import { Tooltip } from './ui/Tooltip';

const PortalSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Initialize from localStorage or default to false
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-collapse on mobile
      if (mobile && !isCollapsed) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isCollapsed]);

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Expose sidebar width via CSS variable for dynamic content margin
  useEffect(() => {
    const width = isMobile ? '0rem' : (isCollapsed ? '5rem' : '18rem'); // w-20 => 5rem, w-72 => 18rem
    document.documentElement.style.setProperty('--sidebar-width', width);
  }, [isCollapsed, isMobile]);

  const isActive = (path: string) => location.pathname === path;

  const sidebarSections = [
    {
      title: 'Main',
      items: [
        { path: '/portal', label: 'Dashboard', icon: BarChart3, description: 'Overview & Stats' },
        { path: '/portal/challenges', label: 'Challenges', icon: Code, description: 'Coding Challenges' },
        { path: '/portal/leaderboard', label: 'Leaderboard', icon: Trophy, description: 'Rankings & Competition' },
        { path: '/portal/simulation', label: 'Live Coding', icon: Play, description: 'Real-time Practice' },
      ]
    },
    {
      title: 'Progress',
      items: [
        { path: '/portal/achievements', label: 'Achievements', icon: Award, description: 'Badges & Rewards' },
        { path: '/portal/analytics', label: 'Analytics', icon: TrendingUp, description: 'Performance Insights' },
        { path: '/portal/history', label: 'History', icon: Clock, description: 'Past Challenges' },
        { path: '/portal/streak', label: 'Streak', icon: Zap, description: 'Daily Progress' },
      ]
    },
    {
      title: 'Learning',
      items: [
        { path: '/portal/learning', label: 'Learning Hub', icon: GraduationCap, description: 'Playlists & Templates' },
        { path: '/portal/code-reviews', label: 'Code Reviews', icon: Bug, description: 'Peer Reviews' },
        { path: '/portal/reviews', label: 'Reviews', icon: MessageSquare, description: 'User Reviews' },
        { path: '/portal/community', label: 'Community', icon: Users, description: 'Connect & Share' },
        { path: '/portal/templates', label: 'Templates', icon: BookOpen, description: 'Code Templates' },
        { path: '/portal/practice', label: 'Practice', icon: Target, description: 'Skill Building' },
      ]
    },
    {
      title: 'Career',
      items: [
        { path: '/portal/career', label: 'Career Path', icon: Briefcase, description: 'Role Progression' },
        { path: '/portal/interviews', label: 'Interviews', icon: Star, description: 'Interview Prep' },
        { path: '/portal/schedule', label: 'Schedule', icon: Calendar, description: 'Study Planning' },
      ]
    },
    {
      title: 'Account',
      items: [
        { path: '/portal/profile', label: 'Profile', icon: User, description: 'Personal Info' },
        { path: '/portal/settings', label: 'Settings', icon: Settings, description: 'Preferences' },
      ]
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      {/* Fixed sidebar that doesn't scroll with content */}
      <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] backdrop-blur-xl border-r transition-all duration-300 z-40 flex flex-col ${
        isCollapsed ? 'w-20' : 'w-72'
      } ${isMobile && !isCollapsed ? 'shadow-2xl' : ''}`} 
      style={{ backgroundColor: 'var(--color-sidebar-bg)', borderColor: 'var(--color-border)' }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Portal</h2>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Developer Dashboard</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Navigation with scrollable content area */}
      <div className="flex-1 overflow-y-auto py-6 sidebar-scroll smooth-scroll min-h-0">
        <div className="space-y-8">
          {sidebarSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {!isCollapsed && (
                <div className="px-6 mb-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                    {section.title}
                  </h3>
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const linkContent = (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center mx-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                      }`}
                      style={!isActive(item.path) ? { color: 'var(--color-text-secondary)' } : {}}
                    >
                      <item.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} ${
                        isActive(item.path) ? 'text-white' : ''
                      }`} />
                      {!isCollapsed && (
                        <div className="flex-1">
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs opacity-75">
                            {item.description}
                          </div>
                        </div>
                      )}
                    </Link>
                  );

                  return isCollapsed ? (
                    <Tooltip key={item.path} content={`${item.label} - ${item.description}`} position="right">
                      {linkContent}
                    </Tooltip>
                  ) : linkContent;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
        {!isCollapsed ? (
          <div className="text-center">
            <div className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>Need Help?</div>
            <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium">
              Contact Support
            </button>
          </div>
        ) : (
          <div className="text-center">
            <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all duration-200" style={{ color: 'var(--color-text-secondary)' }}>
              <Home className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default PortalSidebar;