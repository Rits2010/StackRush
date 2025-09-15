import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Monitor, Smartphone, Tablet, RotateCcw, ExternalLink, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { ProfessionalCard } from './ui/ProfessionalCard';
import { cn } from '../lib/utils';
import { sanitizeHTML, sanitizeCSS, sanitizeJavaScript, getCSPHeader, rateLimiter } from '../utils/security';

export type ViewportType = 'desktop' | 'tablet' | 'mobile';

interface FrontendPreviewProps {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  autoRefresh?: boolean;
  onError?: (error: string) => void;
  onLoad?: () => void;
  className?: string;
}

interface ViewportConfig {
  name: string;
  width: number;
  height: number;
  icon: React.ComponentType<{ className?: string }>;
}

const viewportConfigs: Record<ViewportType, ViewportConfig> = {
  desktop: {
    name: 'Desktop',
    width: 1200,
    height: 800,
    icon: Monitor
  },
  tablet: {
    name: 'Tablet',
    width: 768,
    height: 1024,
    icon: Tablet
  },
  mobile: {
    name: 'Mobile',
    width: 375,
    height: 667,
    icon: Smartphone
  }
};

export const FrontendPreview: React.FC<FrontendPreviewProps> = ({
  htmlCode,
  cssCode,
  jsCode,
  autoRefresh = true,
  onError,
  onLoad,
  className = ''
}) => {
  const [currentViewport, setCurrentViewport] = useState<ViewportType>('desktop');
  const [isLoading, setIsLoading] = useState(true);
  const [previewVisible, setPreviewVisible] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Debounced refresh function
  const debouncedRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    
    refreshTimeoutRef.current = setTimeout(() => {
      setRefreshKey(prev => prev + 1);
    }, 500); // 500ms debounce
  }, []);

  // Auto-refresh when code changes
  useEffect(() => {
    if (autoRefresh) {
      debouncedRefresh();
    }
  }, [htmlCode, cssCode, jsCode, autoRefresh, debouncedRefresh]);

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    setError(null);
    if (onLoad) onLoad();
  }, [onLoad]);

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    const errorMsg = 'Failed to load preview. Please check your code for errors.';
    setError(errorMsg);
    if (onError) onError(errorMsg);
  }, [onError]);

  // Generate preview HTML with security measures
  const generatePreviewHTML = useCallback(() => {
    try {
      // Rate limiting check
      if (!rateLimiter.canMakeRequest('preview_generation', 'user')) {
        throw new Error('Too many preview requests. Please wait a moment.');
      }

      // Sanitize inputs
      const sanitizedHTML = sanitizeHTML(htmlCode);
      const sanitizedCSS = sanitizeCSS(cssCode);
      const sanitizedJS = sanitizeJavaScript(jsCode);
      
      return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="${getCSPHeader()}">
  <title>Preview - Stack Rush</title>
  <style>
    /* Reset styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #fff;
      padding: 1rem;
    }
    
    /* Security: Prevent common XSS vectors */
    iframe, object, embed, applet {
      display: none !important;
    }
    
    /* Prevent position fixed/absolute for security */
    * {
      position: relative !important;
    }
    
    /* Error boundary styling */
    .error-boundary {
      padding: 1rem;
      background-color: #fef2f2;
      color: #dc2626;
      border-left: 4px solid #dc2626;
      margin: 1rem 0;
      border-radius: 0.25rem;
    }
    
    /* Loading state */
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      background-color: #f8fafc;
    }
    
    .spinner {
      animation: spin 1s linear infinite;
      color: #3b82f6;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    /* User CSS (sanitized) */
    ${sanitizedCSS}
  </style>
</head>
<body>
  ${sanitizedHTML}
  
  <script>
    // Security wrapper
    (function() {
      'use strict';
      
      // Disable dangerous functions
      window.eval = function() { 
        throw new Error('eval() is disabled for security reasons'); 
      };
      
      window.Function = function() { 
        throw new Error('Function constructor is disabled for security reasons'); 
      };
      
      // Override setTimeout and setInterval with limits
      const originalSetTimeout = window.setTimeout;
      const originalSetInterval = window.setInterval;
      
      window.setTimeout = function(fn, delay) {
        if (delay < 10) delay = 10; // Minimum 10ms delay
        return originalSetTimeout(fn, Math.min(delay, 5000)); // Maximum 5s delay
      };
      
      window.setInterval = function(fn, delay) {
        if (delay < 100) delay = 100; // Minimum 100ms interval
        return originalSetInterval(fn, Math.min(delay, 5000)); // Maximum 5s interval
      };
      
      // Error handling
      window.addEventListener('error', function(e) {
        parent.postMessage({
          type: 'error',
          message: e.message,
          filename: e.filename,
          lineno: e.lineno,
          colno: e.colno
        }, '*');
      });
      
      window.addEventListener('unhandledrejection', function(e) {
        parent.postMessage({
          type: 'error',
          message: e.reason?.message || 'Unhandled promise rejection'
        }, '*');
      });
      
      // Notify parent when loaded
      window.addEventListener('load', function() {
        parent.postMessage({ type: 'loaded' }, '*');
      });
      
      // Execution timeout
      const executionTimeout = setTimeout(() => {
        throw new Error('Code execution timeout (10 seconds)');
      }, 10000);
      
      try {
        // User JavaScript (sanitized)
        ${sanitizedJS}
        clearTimeout(executionTimeout);
      } catch (error) {
        clearTimeout(executionTimeout);
        parent.postMessage({
          type: 'error',
          message: error instanceof Error ? error.message : 'An unknown error occurred'
        }, '*');
      }
    })();
  </script>
</body>
</html>`;
    } catch (error) {
      return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview - Stack Rush</title>
  <style>
    /* Reset styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #fff;
      padding: 1rem;
    }
    
    /* Error boundary styling */
    .error-boundary {
      padding: 1rem;
      background-color: #fef2f2;
      color: #dc2626;
      border-left: 4px solid #dc2626;
      margin: 1rem 0;
      border-radius: 0.25rem;
    }
  </style>
</head>
<body>
  <div class="error-boundary">
    <h2>Error generating preview</h2>
    <p>${error.message}</p>
  </div>
</body>
</html>`;
    }
  }, [htmlCode, cssCode, jsCode]);

  // Update iframe content
  useEffect(() => {
    if (iframeRef.current && previewVisible) {
      setIsLoading(true);
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument;
      
      if (doc) {
        doc.open();
        doc.write(generatePreviewHTML());
        doc.close();
      }
    }
  }, [generatePreviewHTML, refreshKey, previewVisible]);

  const currentConfig = viewportConfigs[currentViewport];

  return (
    <div className={cn("overflow-hidden bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-2">
        <div className="flex items-center space-x-2">
          {Object.entries(viewportConfigs).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setCurrentViewport(key as ViewportType)}
                className={cn(
                  "p-2 rounded-md flex items-center space-x-1 text-sm font-medium transition-colors",
                  currentViewport === key
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                )}
                title={config.name}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{config.name}</span>
              </button>
            );
          })}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setPreviewVisible(!previewVisible)}
            className={cn(
              "p-2 rounded-md flex items-center space-x-1 text-sm font-medium transition-colors",
              "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
            )}
            title={previewVisible ? 'Hide Preview' : 'Show Preview'}
          >
            {previewVisible ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span className="hidden sm:inline">Hide</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Show</span>
              </>
            )}
          </button>
          <button
            onClick={() => {
              setIsLoading(true);
              setRefreshKey(prev => prev + 1);
            }}
            className={cn(
              "p-2 rounded-md flex items-center space-x-1 text-sm font-medium transition-colors",
              "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
            title="Refresh Preview"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <a
            href={`data:text/html;charset=utf-8,${encodeURIComponent(generatePreviewHTML())}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "p-2 rounded-md flex items-center space-x-1 text-sm font-medium transition-colors",
              "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
            )}
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">New Tab</span>
          </a>
        </div>
      </div>

      {/* Preview Container */}
      <div 
        className={cn(
          "relative bg-white dark:bg-gray-900 p-4 flex justify-center items-center overflow-auto",
          "transition-all duration-200"
        )}
        style={{
          minHeight: '500px',
          maxHeight: 'calc(100vh - 180px)'
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10">
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading preview...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="w-full p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Preview Error</h4>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {previewVisible ? (
          <div 
            className={cn(
              "bg-white shadow-lg rounded-md overflow-hidden border border-gray-200 dark:border-gray-700",
              "transition-all duration-200"
            )}
            style={{
              width: viewportConfigs[currentViewport].width * 0.8 + 'px',
              height: viewportConfigs[currentViewport].height * 0.8 + 'px',
              maxWidth: '100%',
              maxHeight: '100%',
              transform: 'scale(0.9)',
              transformOrigin: 'top center'
            }}
          >
            <iframe
              ref={iframeRef}
              key={refreshKey}
              title="Preview"
              srcDoc={generatePreviewHTML()}
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-forms allow-modals"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              style={{
                border: 'none',
                width: '100%',
                height: '100%'
              }}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Preview Hidden</p>
              <p className="text-sm">Click the eye icon to show the preview</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>
            {currentConfig.width} × {currentConfig.height}px
          </span>
          <div className="flex items-center space-x-4">
            <span className={`flex items-center space-x-1 ${autoRefresh ? 'text-green-600 dark:text-green-400' : ''}`}>
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span>Auto-refresh {autoRefresh ? 'ON' : 'OFF'}</span>
            </span>
            {isLoading && (
              <span className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span>Updating...</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrontendPreview;