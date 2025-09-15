import React from 'react';
import PortalSidebar from '../components/PortalSidebar';

const StreakPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <PortalSidebar />
      <div
        className="transition-all duration-300 py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-gray-900"
        style={{ marginLeft: 'var(--sidebar-width, 18rem)' }}
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Streak</h1>
          <p className="text-gray-600 dark:text-gray-300">Maintain your daily progress. Coming soon.</p>
        </div>
      </div>
    </div>
  );
};

export default StreakPage;
