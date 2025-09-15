import React, { useState, useEffect, useCallback } from 'react';
import { 
  Globe, RefreshCw, ArrowLeft, ArrowRight, Home, Lock, 
  ExternalLink, RotateCcw, Maximize2, Minimize2, Settings,
  AlertCircle, Loader2, Monitor, Smartphone, Tablet,
  Wifi, WifiOff, Search, X
} from 'lucide-react';
import { ProfessionalButton } from './ui/ProfessionalButton';
import { ProfessionalCard } from './ui/ProfessionalCard';

interface BrowserPreviewProps {
  webContainerUrl?: string;
  fallbackContent?: string;
  isLoading?: boolean;
  error?: string;
  className?: string;
  onRefresh?: () => void;
  onPortChange?: (port: number) => void;
}

interface DetectedPort {
  port: number;
  status: 'active' | 'inactive' | 'loading';
  type: 'http' | 'https' | 'dev-server' | 'api';
  name?: string;
  description?: string;
}

export const BrowserPreview: React.FC<BrowserPreviewProps> = ({
  webContainerUrl,
  fallbackContent,
  isLoading = false,
  error,
  className = '',
  onRefresh,
  onPortChange
}) => {
  const [currentUrl, setCurrentUrl] = useState(webContainerUrl || 'http://localhost:3000');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [detectedPorts, setDetectedPorts] = useState<DetectedPort[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showDevTools, setShowDevTools] = useState(false);

  // Update current URL when webContainerUrl changes
  useEffect(() => {
    if (webContainerUrl) {
      setCurrentUrl(webContainerUrl);
    }
  }, [webContainerUrl]);

  // Scan for available ports from WebContainer
  const scanForPorts = useCallback(async () => {
    setIsScanning(true);
    
    // Common development ports to check
    const commonPorts = [
      { port: 5173, name: 'Vite Dev Server', description: 'Vite development server' },
      { port: 3000, name: 'Development Server', description: 'Main dev server' },
      { port: 3001, name: 'API Server', description: 'Backend API' },
      { port: 4000, name: 'GraphQL Server', description: 'GraphQL endpoint' },
      { port: 5000, name: 'Express Server', description: 'Express.js server' },
      { port: 8080, name: 'HTTP Server', description: 'HTTP file server' },
      { port: 8000, name: 'Python Server', description: 'Python HTTP server' },
      { port: 9000, name: 'Node Server', description: 'Node.js server' }
    ];

    const detected: DetectedPort[] = [];

    // First, try to detect from the current URL
    if (webContainerUrl) {
      try {
        const url = new URL(webContainerUrl);
        const urlPort = parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80);
        const portInfo = commonPorts.find(p => p.port === urlPort) || {
          port: urlPort,
          name: `Server :${urlPort}`,
          description: 'Running server'
        };
        
        detected.push({
          port: urlPort,
          status: 'active',
          type: 'dev-server',
          name: portInfo.name,
          description: portInfo.description
        });
      } catch (error) {
        console.error('Failed to parse WebContainer URL:', error);
      }
    }

    // Add other common ports as potentially available
    for (const portInfo of commonPorts) {
      // Skip if already detected from URL
      if (detected.find(d => d.port === portInfo.port)) continue;
      
      // For WebContainer, we'll mark common dev ports as potentially active
      const isLikelyActive = portInfo.port === 5173 || portInfo.port === 3000;
      
      detected.push({
        port: portInfo.port,
        status: isLikelyActive ? 'active' : 'inactive',
        type: portInfo.port === 3000 || portInfo.port === 5173 ? 'dev-server' : 
              portInfo.port === 3001 || portInfo.port === 4000 ? 'api' : 'http',
        name: portInfo.name,
        description: portInfo.description
      });
    }

    setDetectedPorts(detected);
    setIsScanning(false);
  }, [webContainerUrl]);

  // Scan for ports on component mount
  useEffect(() => {
    scanForPorts();
  }, [scanForPorts]);

  // Handle URL change
  const handleUrlChange = (newUrl: string) => {
    setCurrentUrl(newUrl);
    
    // Extract port from URL and notify parent
    try {
      const url = new URL(newUrl);
      const port = parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80);
      if (onPortChange) {
        onPortChange(port);
      }
    } catch (error) {
      console.error('Invalid URL:', error);
    }
  };

  // Handle port selection
  const handlePortSelect = (port: number) => {
    const newUrl = `http://localhost:${port}`;
    handleUrlChange(newUrl);
  };

  // Get device frame styles
  const getDeviceStyles = () => {
    switch (deviceView) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      default:
        return { width: '100%', height: '100%' };
    }
  };

  // Get status color for ports
  const getPortStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'loading': return 'text-yellow-500';
      default: return 'text-gray-400';
    }
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Preview Error</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <ProfessionalButton onClick={onRefresh} variant="primary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </ProfessionalButton>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading preview...</p>
        </div>
      );
    }

    if (webContainerUrl) {
      return (
        <iframe
          src={currentUrl}
          className="w-full h-full border-0 bg-white dark:bg-gray-900"
          title="Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          onLoad={() => setIsOnline(true)}
          onError={() => setIsOnline(false)}
        />
      );
    }

    if (fallbackContent) {
      return (
        <iframe
          srcDoc={fallbackContent}
          className="w-full h-full border-0 bg-white dark:bg-gray-900"
          title="Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Globe className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Preview Available</h3>
        <p className="text-gray-600 dark:text-gray-400">Start a development server to see your application</p>
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {/* Browser Chrome */}
      <div className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 p-3">
        {/* Top Row - Controls */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {/* Window Controls */}
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center space-x-1 ml-4">
              <button 
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Back"
              >
                <ArrowLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>
              <button 
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Forward"
              >
                <ArrowRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>
              <button 
                onClick={onRefresh}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>
              <button 
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Home"
              >
                <Home className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Device View Toggle */}
            <div className="flex items-center space-x-1 bg-gray-200 dark:bg-gray-600 rounded-md p-1">
              <button
                onClick={() => setDeviceView('desktop')}
                className={`p-1 rounded ${deviceView === 'desktop' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                title="Desktop View"
              >
                <Monitor className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={() => setDeviceView('tablet')}
                className={`p-1 rounded ${deviceView === 'tablet' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                title="Tablet View"
              >
                <Tablet className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>
              <button
                onClick={() => setDeviceView('mobile')}
                className={`p-1 rounded ${deviceView === 'mobile' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`}
                title="Mobile View"
              >
                <Smartphone className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              ) : (
                <Maximize2 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {/* Dev Tools Toggle */}
            <button
              onClick={() => setShowDevTools(!showDevTools)}
              className={`p-1 rounded transition-colors ${
                showDevTools 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
              }`}
              title="Developer Tools"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Address Bar */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <Lock className="h-4 w-4 text-green-500 ml-1" />
          </div>
          
          <div className="flex-1 flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1">
            <input
              type="text"
              value={currentUrl}
              onChange={(e) => setCurrentUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleUrlChange(currentUrl)}
              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white outline-none"
              placeholder="Enter URL or localhost:port"
            />
            <button
              onClick={() => handleUrlChange(currentUrl)}
              className="ml-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Search className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          <button
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Open in new tab"
            onClick={() => window.open(currentUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Port Detection Panel */}
        {showDevTools && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Available Ports</h4>
              <button
                onClick={scanForPorts}
                disabled={isScanning}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
              >
                {isScanning ? 'Scanning...' : 'Refresh'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {detectedPorts.map((port) => (
                <button
                  key={port.port}
                  onClick={() => handlePortSelect(port.port)}
                  className={`text-left p-2 rounded border transition-colors ${
                    currentUrl.includes(`:${port.port}`)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      :{port.port}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${getPortStatusColor(port.status)}`}></div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{port.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preview Content */}
      <div 
        className={`bg-gray-100 dark:bg-gray-900 flex items-center justify-center transition-all duration-300 ${
          isFullscreen ? 'fixed inset-0 z-50' : ''
        }`}
        style={{ 
          height: isFullscreen ? '100vh' : '500px',
          paddingTop: isFullscreen ? '0' : '0'
        }}
      >
        <div 
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-lg transition-all duration-300"
          style={getDeviceStyles()}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default BrowserPreview;