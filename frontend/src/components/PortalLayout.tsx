import React, { ReactNode } from 'react';
import PortalSidebar from './PortalSidebar';

interface PortalLayoutProps {
  children: ReactNode;
  className?: string;
}

const PortalLayout: React.FC<PortalLayoutProps> = ({ children, className = '' }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <PortalSidebar />
      {/* Main content area with fixed positioning to avoid sidebar overlap */}
      <div
        className={`transition-all duration-300 py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 ${className}`}
        style={{ marginLeft: 'var(--sidebar-width, 18rem)' }}
      >
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PortalLayout;