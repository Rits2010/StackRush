import { useState, useEffect, useCallback } from 'react';
import { WebContainerService, ExecutionResult, ServerInfo } from '../services/webcontainer';

interface PreviewOptions {
  autoRefresh?: boolean;
  refreshDelay?: number;
}

interface ProjectFiles {
  [path: string]: string;
}

export const useWebContainer = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [runningServers, setRunningServers] = useState<ServerInfo[]>([]);

  const webcontainerService = WebContainerService.getInstance();

  useEffect(() => {
    const initializeWebContainer = async () => {
      try {
        await webcontainerService.initialize();
        setIsInitialized(true);
        setError(null);
      } catch (err) {
        // Don't treat initialization failure as a blocking error
        // The service will handle fallback mode internally
        console.warn('WebContainer initialization failed, using fallback mode:', err);
        setIsInitialized(true); // Still mark as initialized to allow fallback execution
        setError(null); // Clear error since fallback mode is available
      }
    };

    initializeWebContainer();

    return () => {
      webcontainerService.cleanup();
    };
  }, []);

  const executeCode = useCallback(async (
    code: string, 
    language: 'javascript' | 'typescript' = 'javascript',
    testCases?: any[]
  ): Promise<ExecutionResult | null> => {
    if (!isInitialized) {
      setError('WebContainer not initialized');
      return null;
    }

    setIsExecuting(true);
    setError(null);

    try {
      let result: ExecutionResult;
      
      if (language === 'typescript') {
        result = await webcontainerService.executeTypeScript(code, testCases);
      } else {
        result = await webcontainerService.executeJavaScript(code, testCases);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Execution failed';
      setError(errorMessage);
      return {
        success: false,
        output: '',
        error: errorMessage,
        executionTime: 0
      };
    } finally {
      setIsExecuting(false);
    }
  }, [isInitialized, webcontainerService]);

  const runCommand = useCallback(async (command: string): Promise<string> => {
    if (!isInitialized) {
      throw new Error('WebContainer not initialized');
    }

    try {
      // Execute command and return the full terminal output
      const result = await webcontainerService.executeTerminalCommand('main', command);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Command execution failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isInitialized, webcontainerService]);

  const getTerminalOutput = useCallback((): string => {
    if (!isInitialized) {
      return '';
    }
    return webcontainerService.getTerminalOutput('main');
  }, [isInitialized, webcontainerService]);

  const sendTerminalInput = useCallback(async (input: string): Promise<void> => {
    if (!isInitialized) {
      throw new Error('WebContainer not initialized');
    }

    try {
      await webcontainerService.sendTerminalInput('main', input);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send input';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isInitialized, webcontainerService]);

  const createTerminalSession = useCallback(async (sessionId?: string): Promise<boolean> => {
    if (!isInitialized) {
      throw new Error('WebContainer not initialized');
    }

    try {
      const session = await webcontainerService.createTerminalSession(sessionId || 'main');
      return session !== null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create terminal session';
      setError(errorMessage);
      return false;
    }
  }, [isInitialized, webcontainerService]);

  const writeFile = useCallback(async (filename: string, content: string): Promise<void> => {
    if (!isInitialized) {
      throw new Error('WebContainer not initialized');
    }

    try {
      await webcontainerService.writeFile(filename, content);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'File write failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isInitialized, webcontainerService]);

  const readFile = useCallback(async (filename: string): Promise<string> => {
    if (!isInitialized) {
      throw new Error('WebContainer not initialized');
    }

    try {
      return await webcontainerService.readFile(filename);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'File read failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isInitialized, webcontainerService]);

  const getPreviewUrl = useCallback(async (preferredPort?: number): Promise<string> => {
    if (!isInitialized) {
      throw new Error('WebContainer not initialized');
    }

    try {
      console.log(`🔍 Getting preview URL${preferredPort ? ` for port ${preferredPort}` : ''}...`);
      
      const url = await webcontainerService.getPreviewUrl(preferredPort);
      console.log('✅ Preview URL retrieved:', url);
      
      setPreviewUrl(url);
      
      // Update running servers list
      const servers = webcontainerService.getRunningServers();
      console.log('📊 Running servers:', servers);
      setRunningServers(servers);
      
      return url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Preview URL generation failed';
      console.error('❌ Preview URL generation failed:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isInitialized, webcontainerService]);

  const createFrontendProject = useCallback(async (
    htmlCode: string,
    cssCode: string,
    jsCode: string,
    options: PreviewOptions = {}
  ): Promise<string> => {
    if (!isInitialized) {
      throw new Error('WebContainer not initialized');
    }

    setIsBuilding(true);
    setError(null);

    try {
      // Create project files with proper structure
      const files: ProjectFiles = {
        'index.html': htmlCode,
        'src/style.css': cssCode,
        'src/script.js': jsCode,
        'package.json': JSON.stringify({
          name: 'frontend-preview',
          version: '1.0.0',
          type: 'module',
          scripts: {
            start: 'npx http-server -p 3000 -c-1',
            dev: 'npx http-server -p 3000 -c-1',
            build: 'echo "Build completed"'
          },
          devDependencies: {
            'http-server': '^14.1.1'
          }
        }, null, 2),
        'README.md': '# Frontend Preview\n\nThis is a live code runner project.\n\n## Commands\n- `npm start` - Start development server\n- `npm install` - Install dependencies'
      };

      // Write files to WebContainer
      for (const [path, content] of Object.entries(files)) {
        await webcontainerService.writeFile(path, content);
      }

      // Auto-install dependencies
      console.log('Installing dependencies...');
      await webcontainerService.executeTerminalCommand('main', 'npm install');
      
      // Start the development server
      console.log('Starting development server...');
      await webcontainerService.executeTerminalCommand('main', 'npm start &');
      
      // Wait for server to start
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get preview URL
      const url = await webcontainerService.getPreviewUrl();
      setPreviewUrl(url);
      
      return url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Frontend project creation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsBuilding(false);
    }
  }, [isInitialized, webcontainerService]);

  const createReactProject = useCallback(async (
    componentCode: string,
    cssCode?: string
  ): Promise<string> => {
    if (!isInitialized) {
      throw new Error('WebContainer not initialized');
    }

    setIsBuilding(true);
    setError(null);

    try {
      // Create React project structure
      const files: ProjectFiles = {
        'package.json': JSON.stringify({
          name: 'react-preview',
          version: '1.0.0',
          scripts: {
            start: 'vite --host',
            build: 'vite build',
            preview: 'vite preview --host'
          },
          dependencies: {
            'react': '^18.2.0',
            'react-dom': '^18.2.0'
          },
          devDependencies: {
            '@vitejs/plugin-react': '^4.0.0',
            'vite': '^4.4.0'
          }
        }, null, 2),
        'vite.config.js': `
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000
  }
})
`,
        'index.html': `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>React Preview</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
`,
        'src/main.jsx': `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
${cssCode ? "import './App.css'" : ''}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`,
        'src/App.jsx': componentCode
      };

      if (cssCode) {
        files['src/App.css'] = cssCode;
      }

      // Write files to WebContainer
      for (const [path, content] of Object.entries(files)) {
        await webcontainerService.writeFile(path, content);
      }

      // Install dependencies and start dev server
      await webcontainerService.executeTerminalCommand('main', 'npm install');
      await webcontainerService.executeTerminalCommand('main', 'npm start');

      // Get preview URL
      const url = await webcontainerService.getPreviewUrl();
      setPreviewUrl(url);
      
      return url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'React project creation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsBuilding(false);
    }
  }, [isInitialized, webcontainerService]);

  const updateProjectFiles = useCallback(async (
    files: ProjectFiles
  ): Promise<void> => {
    if (!isInitialized) {
      throw new Error('WebContainer not initialized');
    }

    try {
      // Update files in WebContainer
      for (const [path, content] of Object.entries(files)) {
        await webcontainerService.writeFile(path, content);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'File update failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isInitialized, webcontainerService]);

  const installPackages = useCallback(async (
    packages: string[]
  ): Promise<void> => {
    if (!isInitialized) {
      throw new Error('WebContainer not initialized');
    }

    try {
      const installCommand = `npm install ${packages.join(' ')}`;
      await webcontainerService.executeTerminalCommand('main', installCommand);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Package installation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isInitialized, webcontainerService]);

  const startPreviewServer = useCallback(async (port: number = 3000): Promise<string> => {
    if (!isInitialized) {
      throw new Error('WebContainer not initialized');
    }

    setIsBuilding(true);
    setError(null);

    try {
      const url = await webcontainerService.startPreviewServer(port);
      setPreviewUrl(url);
      
      // Update running servers list
      const servers = webcontainerService.getRunningServers();
      setRunningServers(servers);
      
      return url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start preview server';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsBuilding(false);
    }
  }, [isInitialized, webcontainerService]);

  const stopPreviewServer = useCallback(async (port: number): Promise<boolean> => {
    if (!isInitialized) {
      throw new Error('WebContainer not initialized');
    }

    try {
      const success = await webcontainerService.stopServer(port);
      
      // Update running servers list
      const servers = webcontainerService.getRunningServers();
      setRunningServers(servers);
      
      // If we stopped the current preview server, clear the URL
      if (success && previewUrl?.includes(`:${port}`)) {
        setPreviewUrl(null);
      }
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop preview server';
      setError(errorMessage);
      return false;
    }
  }, [isInitialized, webcontainerService, previewUrl]);

  const detectRunningPorts = useCallback(async (): Promise<number[]> => {
    if (!isInitialized) {
      return [];
    }

    try {
      const ports = await webcontainerService.detectRunningPorts();
      
      // Update running servers list
      const servers = webcontainerService.getRunningServers();
      setRunningServers(servers);
      
      return ports;
    } catch (err) {
      console.error('Failed to detect running ports:', err);
      return [];
    }
  }, [isInitialized, webcontainerService]);

  // Periodically check for running servers
  useEffect(() => {
    if (!isInitialized) return;

    const checkServers = () => {
      const servers = webcontainerService.getRunningServers();
      setRunningServers(servers);
    };

    // Check immediately
    checkServers();

    // Then check every 5 seconds
    const interval = setInterval(checkServers, 5000);

    return () => clearInterval(interval);
  }, [isInitialized, webcontainerService]);

  return {
    webContainer: webcontainerService,
    isLoading: !isInitialized,
    isInitialized,
    isExecuting,
    isBuilding,
    error,
    previewUrl,
    runningServers,
    executeCode,
    runCommand,
    getTerminalOutput,
    sendTerminalInput,
    createTerminalSession,
    writeFile,
    readFile,
    getPreviewUrl,
    startPreviewServer,
    stopPreviewServer,
    detectRunningPorts,
    createFrontendProject,
    createReactProject,
    updateProjectFiles,
    installPackages
  };
};