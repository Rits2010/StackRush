import React, { useState } from 'react';
import { 
  File, Folder, FolderOpen, Search, Play,
  GitBranch, Settings, X, ChevronRight, ChevronDown,
  FileText, Code, Database, Globe
} from 'lucide-react';
import MonacoEditor from './MonacoEditor';
import Terminal from './Terminal';
import { useWebContainer } from '../hooks/useWebContainer';
import SimulationNotifications from './SimulationNotifications';
import BrowserPreview from './BrowserPreview';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  isOpen?: boolean;
  searchHighlight?: {
    nameMatch: boolean;
    contentMatch: boolean;
    contentPreview?: string;
  };
}

interface IDELayoutProps {
  initialCode: string;
  onCodeChange: (code: string) => void;
  language: string;
  challengeType: string;
  showPreview?: boolean;
  challengeId?: string;
  challengeDuration?: number;
  codeRunnerState?: {
    htmlCode: string;
    cssCode: string;
    jsCode: string;
  };
}

export const IDELayout: React.FC<IDELayoutProps> = ({
  initialCode,
  onCodeChange,
  language,
  challengeType,
  showPreview = false,
  challengeId,
  challengeDuration = 30,
  codeRunnerState
}) => {
  const getInitialFile = () => {
    if (challengeType === 'code-runner') {
      return 'index.html'; // Start with HTML file for code runner
    } else if (challengeType === 'dsa') {
      return 'solution.js';
    } else if (challengeType === 'bug-fix') {
      return 'auth.js';
    } else {
      return 'UserDashboard.tsx';
    }
  };

  const initialFileName = getInitialFile();
  const [selectedFile, setSelectedFile] = useState(initialFileName);
  const [openFiles, setOpenFiles] = useState<string[]>([initialFileName]);
  const [fileContents, setFileContents] = useState<Record<string, string>>(() => {
    if (challengeType === 'code-runner' && codeRunnerState) {
      return {
        'index.html': codeRunnerState.htmlCode,
        'style.css': codeRunnerState.cssCode,
        'script.js': codeRunnerState.jsCode
      };
    }
    return { [initialFileName]: initialCode };
  });
  const [terminalOutput, setTerminalOutput] = useState(() => {
    const isWebContainerSupported = typeof window !== 'undefined' && window.crossOriginIsolated;
    const welcomeMessage = isWebContainerSupported 
      ? 'Welcome to StackRush IDE\nInitializing terminal...\nuser@stackrush:~$ '
      : 'Welcome to StackRush IDE (Mock Mode)\nNote: WebContainer requires cross-origin isolation for full functionality.\nuser@stackrush:~$ ';
    return welcomeMessage;
  });
  const [terminalInput, setTerminalInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isCommandExecuting, setIsCommandExecuting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ filteredNodes: FileNode[], matchCount: number }>({ filteredNodes: [], matchCount: 0 });
  const [isSearching, setIsSearching] = useState(false);
  const [activePanel, setActivePanel] = useState<'explorer' | 'search' | 'git'>('explorer');
  const [searchMode, setSearchMode] = useState<'files' | 'content'>('files');
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [showPreviewPanel, setShowPreviewPanel] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const terminalInputRef = React.useRef<HTMLInputElement>(null);
  const terminalScrollRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  
  const { 
    executeCode, 
    isExecuting,
    webContainer,
    isLoading: webContainerLoading,
    error: webContainerError,
    runCommand,
    getTerminalOutput,
    sendTerminalInput,
    createTerminalSession,
    writeFile,
    readFile: readWebContainerFile,
    getPreviewUrl,
    startPreviewServer,
    stopPreviewServer,
    detectRunningPorts,
    runningServers
  } = useWebContainer();

  // Mock file structure based on challenge type
  const getFileStructure = (): FileNode[] => {
    if (challengeType === 'code-runner' && codeRunnerState) {
      return [
        {
          name: 'src',
          type: 'folder',
          isOpen: true,
          children: [
            { name: 'index.html', type: 'file', content: codeRunnerState.htmlCode },
            { name: 'style.css', type: 'file', content: codeRunnerState.cssCode },
            { name: 'script.js', type: 'file', content: codeRunnerState.jsCode },
            {
              name: 'components',
              type: 'folder',
              children: [
                { name: 'Header.js', type: 'file', content: '// Header component\nfunction Header() {\n  return <h1>Header</h1>;\n}\n\nexport default Header;' },
                { name: 'Footer.js', type: 'file', content: '// Footer component\nfunction Footer() {\n  return <footer>Footer</footer>;\n}\n\nexport default Footer;' }
              ]
            },
            {
              name: 'utils',
              type: 'folder',
              children: [
                { name: 'helpers.js', type: 'file', content: '// Helper functions\nexport function formatDate(date) {\n  return date.toLocaleDateString();\n}\n\nexport function capitalize(str) {\n  return str.charAt(0).toUpperCase() + str.slice(1);\n}' },
                { name: 'api.js', type: 'file', content: '// API utilities\nconst API_BASE = "https://api.example.com";\n\nexport async function fetchData(endpoint) {\n  const response = await fetch(`${API_BASE}/${endpoint}`);\n  return response.json();\n}' }
              ]
            }
          ]
        },
        {
          name: 'public',
          type: 'folder',
          children: [
            { name: 'favicon.ico', type: 'file', content: '<!-- Favicon file -->' },
            { name: 'manifest.json', type: 'file', content: '{\n  "name": "Code Runner App",\n  "version": "1.0.0",\n  "description": "A code runner application"\n}' }
          ]
        },
        {
          name: 'docs',
          type: 'folder',
          children: [
            { name: 'README.md', type: 'file', content: '# Code Runner Project\n\nThis is a live code runner project.\n\n## Getting Started\n\n1. Edit the files in the `src` folder\n2. Click "Run" to see your changes\n3. Use the terminal for package management\n\n## Available Scripts\n\n- `npm start` - Start development server\n- `npm install <package>` - Install packages\n- `npm test` - Run tests' },
            { name: 'CHANGELOG.md', type: 'file', content: '# Changelog\n\n## v1.0.0\n- Initial release\n- Basic HTML, CSS, JS support\n- Live preview functionality\n- Terminal integration' }
          ]
        },
        { name: 'package.json', type: 'file', content: '{\n  "name": "code-runner",\n  "version": "1.0.0",\n  "description": "Live code runner project",\n  "main": "src/index.html",\n  "scripts": {\n    "start": "http-server -p 3000",\n    "dev": "http-server -p 3000",\n    "test": "echo \"No tests specified\""\n  },\n  "dependencies": {},\n  "devDependencies": {}\n}' },
        { name: '.gitignore', type: 'file', content: 'node_modules/\n.env\n*.log\ndist/\nbuild/\n.DS_Store\nThumbs.db' }
      ];
    } else if (challengeType === 'dsa') {
      return [
        {
          name: 'src',
          type: 'folder',
          isOpen: true,
          children: [
            { name: 'solution.js', type: 'file', content: initialCode },
            { name: 'test.js', type: 'file', content: '// Test cases will be here' }
          ]
        },
        { name: 'package.json', type: 'file', content: '{\n  "name": "dsa-challenge"\n}' },
        { name: 'README.md', type: 'file', content: '# DSA Challenge\n\nSolve the problem in solution.js' }
      ];
    } else if (challengeType === 'bug-fix') {
      return [
        {
          name: 'src',
          type: 'folder',
          isOpen: true,
          children: [
            { name: 'auth.js', type: 'file', content: initialCode },
            { name: 'middleware.js', type: 'file', content: '// Middleware code' },
            { name: 'validation.js', type: 'file', content: '// Validation utilities' }
          ]
        },
        {
          name: 'tests',
          type: 'folder',
          isOpen: false,
          children: [
            { name: 'auth.test.js', type: 'file', content: '// Auth tests' },
            { name: 'validation.test.js', type: 'file', content: '// Validation tests' }
          ]
        },
        { name: 'package.json', type: 'file', content: '{\n  "name": "bug-fix-challenge"\n}' }
      ];
    } else {
      return [
        {
          name: 'src',
          type: 'folder',
          isOpen: true,
          children: [
            { name: 'UserDashboard.tsx', type: 'file', content: initialCode },
            { name: 'components', type: 'folder', children: [
              { name: 'StatCard.tsx', type: 'file', content: '// Stat card component' },
              { name: 'ActivityFeed.tsx', type: 'file', content: '// Activity feed component' }
            ]},
            { name: 'hooks', type: 'folder', children: [
              { name: 'useUserData.ts', type: 'file', content: '// User data hook' }
            ]}
          ]
        },
        {
          name: 'public',
          type: 'folder',
          children: [
            { name: 'index.html', type: 'file', content: '<!DOCTYPE html>...' }
          ]
        },
        { name: 'package.json', type: 'file', content: '{\n  "name": "dashboard-feature"\n}' }
      ];
    }
  };

  const [fileStructure, setFileStructure] = useState<FileNode[]>(getFileStructure());

  // Global keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+F or Cmd+F to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setActivePanel('search');
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize terminal session on component mount
  React.useEffect(() => {
    const initTerminal = async () => {
      try {
        if (webContainer) {
          console.log('Initializing real WebContainer terminal...');
          await createTerminalSession('main');
        } else {
          console.log('WebContainer not available, using fallback terminal');
        }
      } catch (error) {
        console.error('Failed to initialize terminal:', error);
      }
    };
    
    initTerminal();
  }, [webContainer, createTerminalSession]);

  // Initialize file contents from file structure on mount
  React.useEffect(() => {
    if (challengeType === 'code-runner' && codeRunnerState) {
      // Ensure file contents are properly initialized for code runner
      const extractFileContents = (nodes: FileNode[], contents: Record<string, string> = {}): Record<string, string> => {
        for (const node of nodes) {
          if (node.type === 'file' && node.content) {
            contents[node.name] = node.content;
          }
          if (node.type === 'folder' && node.children) {
            extractFileContents(node.children, contents);
          }
        }
        return contents;
      };
      
      const allContents = extractFileContents(fileStructure);
      setFileContents(prev => ({ ...prev, ...allContents }));
    }
  }, [challengeType, codeRunnerState, fileStructure]);

  // Auto-refresh preview when file contents change for code runner
  React.useEffect(() => {
    if (challengeType === 'code-runner' && showPreviewPanel && codeRunnerState) {
      const debounceTimer = setTimeout(() => {
        generatePreview();
      }, 800); // Debounce preview updates
      
      return () => clearTimeout(debounceTimer);
    }
  }, [fileContents, challengeType, showPreviewPanel, codeRunnerState]);

  // Auto-scroll terminal to bottom
  React.useEffect(() => {
    const el = terminalScrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [terminalOutput, isTerminalOpen]);

  // Auto-open preview for code runner
  React.useEffect(() => {
    if (challengeType === 'code-runner' && showPreview) {
      setShowPreviewPanel(true);
      setTimeout(() => {
        generatePreview();
      }, 1000); // Give WebContainer time to initialize
    }
  }, [challengeType, showPreview]);

  // Enhanced preview generation that waits for WebContainer
  React.useEffect(() => {
    if (challengeType === 'code-runner' && codeRunnerState && showPreview && webContainer) {
      const timer = setTimeout(() => {
        console.log('🚀 Auto-generating preview for code runner with WebContainer');
        generatePreview();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [challengeType, codeRunnerState, showPreview, webContainer]);

  React.useEffect(() => {
    if (webContainer && initialCode) {
      const fileName = challengeType === 'dsa' ? 'solution.js' : 
                     challengeType === 'bug-fix' ? 'auth.js' : 
                     'index.html';
      
      if (challengeType === 'feature') {
        // For frontend, create a complete HTML file
        const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    ${initialCode}
  </script>
</body>
</html>`;
        writeFile('index.html', htmlContent).catch(console.error);
      } else {
        writeFile(fileName, initialCode).catch(console.error);
      }
    }
  }, [webContainer, initialCode, challengeType, writeFile]);

  // Debounced search effect
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ filteredNodes: [], matchCount: 0 });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      const results = filterFilesBySearch(fileStructure, searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fileStructure]);

  const toggleFolder = (path: string[]) => {
    const updateNode = (nodes: FileNode[], currentPath: string[]): FileNode[] => {
      return nodes.map(node => {
        if (currentPath.length === 1 && node.name === currentPath[0]) {
          return { ...node, isOpen: !node.isOpen };
        } else if (currentPath.length > 1 && node.name === currentPath[0] && node.children) {
          return {
            ...node,
            children: updateNode(node.children, currentPath.slice(1))
          };
        }
        return node;
      });
    };

    setFileStructure(updateNode(fileStructure, path));
  };

  const openFile = (fileName: string, content?: string) => {
    if (!openFiles.includes(fileName)) {
      setOpenFiles(prev => [...prev, fileName]);
    }
    
    // Set content if provided, or try to find it in file structure
    if (content !== undefined) {
      setFileContents(prev => ({ ...prev, [fileName]: content }));
    } else if (!fileContents[fileName]) {
      // Find content from file structure
      const findFileContent = (nodes: FileNode[], targetName: string): string | null => {
        for (const node of nodes) {
          if (node.type === 'file' && node.name === targetName && node.content) {
            return node.content;
          }
          if (node.type === 'folder' && node.children) {
            const found = findFileContent(node.children, targetName);
            if (found) return found;
          }
        }
        return null;
      };
      
      const foundContent = findFileContent(fileStructure, fileName);
      if (foundContent) {
        setFileContents(prev => ({ ...prev, [fileName]: foundContent }));
      }
    }
    
    setSelectedFile(fileName);
  };

  const closeFile = (fileName: string) => {
    if (openFiles.length > 1) {
      const newOpenFiles = openFiles.filter(f => f !== fileName);
      setOpenFiles(newOpenFiles);
      if (selectedFile === fileName) {
        setSelectedFile(newOpenFiles[newOpenFiles.length - 1]);
      }
    }
  };

  const updateFileContent = (fileName: string, content: string) => {
    setFileContents(prev => ({ ...prev, [fileName]: content }));
    if (fileName === selectedFile) {
      onCodeChange(content);
    }
    
    // Update code runner state if applicable
    if (challengeType === 'code-runner' && codeRunnerState) {
      if (fileName === 'index.html') {
        codeRunnerState.htmlCode = content;
      } else if (fileName === 'style.css') {
        codeRunnerState.cssCode = content;
      } else if (fileName === 'script.js') {
        codeRunnerState.jsCode = content;
      }
    }
    
    // For code runner, sync file changes with WebContainer
    if (challengeType === 'code-runner' && webContainer) {
      const filePath = fileName.startsWith('src/') ? fileName : `src/${fileName}`;
      writeFile(filePath, content).catch(console.error);
    }
  };

  const getFileIcon = (fileName: string, isFolder: boolean, isOpen?: boolean) => {
    if (isFolder) {
      return isOpen ? <FolderOpen className="h-4 w-4 text-blue-400" /> : <Folder className="h-4 w-4 text-blue-400" />;
    }
    
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
        return <FileText className="h-4 w-4 text-yellow-400" />;
      case 'ts':
      case 'tsx':
        return <Code className="h-4 w-4 text-blue-400" />;
      case 'json':
        return <Database className="h-4 w-4 text-green-400" />;
      case 'html':
        return <Globe className="h-4 w-4 text-orange-400" />;
      case 'md':
        return <FileText className="h-4 w-4 text-gray-400" />;
      default:
        return <File className="h-4 w-4 text-gray-400" />;
    }
  };

  const filterFilesBySearch = (nodes: FileNode[], query: string): { filteredNodes: FileNode[], matchCount: number } => {
    if (!query.trim()) return { filteredNodes: nodes, matchCount: 0 };
    
    const searchLower = query.toLowerCase();
    let totalMatches = 0;
    
    const filterNode = (node: FileNode): FileNode | null => {
      const nameMatches = searchMode === 'files' ? node.name.toLowerCase().includes(searchLower) : false;
      const contentMatches = searchMode === 'content' && node.content ? 
        node.content.toLowerCase().includes(searchLower) : false;
      
      if (node.type === 'file') {
        if (nameMatches || contentMatches) {
          totalMatches++;
          return {
            ...node,
            searchHighlight: {
              nameMatch: nameMatches,
              contentMatch: contentMatches,
              contentPreview: contentMatches ? getContentPreview(node.content || '', searchLower) : undefined
            }
          };
        }
        return null;
      }
      
      // For folders, check if any children match
      const filteredChildren = node.children?.map(filterNode).filter(Boolean) || [];
      
      if (nameMatches || filteredChildren.length > 0) {
        if (nameMatches) totalMatches++;
        return {
          ...node,
          isOpen: true, // Auto-expand folders with matches
          children: filteredChildren as FileNode[],
          searchHighlight: nameMatches ? { nameMatch: true, contentMatch: false } : undefined
        };
      }
      
      return null;
    };
    
    const filteredNodes = nodes.map(filterNode).filter(Boolean) as FileNode[];
    return { filteredNodes, matchCount: totalMatches };
  };

  const performGlobalSearch = (query: string) => {
    if (!query.trim()) return [];
    
    const results: Array<{
      file: string;
      line: number;
      content: string;
      match: string;
    }> = [];
    
    const searchInNode = (node: FileNode, path: string = '') => {
      const fullPath = path ? `${path}/${node.name}` : node.name;
      
      if (node.type === 'file' && node.content) {
        const lines = node.content.split('\n');
        lines.forEach((line, index) => {
          if (line.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              file: fullPath,
              line: index + 1,
              content: line.trim(),
              match: query
            });
          }
        });
      }
      
      if (node.children) {
        node.children.forEach(child => searchInNode(child, fullPath));
      }
    };
    
    fileStructure.forEach(node => searchInNode(node));
    return results;
  };

  const getContentPreview = (content: string, searchTerm: string): string => {
    const lines = content.split('\n');
    const matchingLines = lines.filter(line => 
      line.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (matchingLines.length === 0) return '';
    
    // Return first matching line with some context, truncated if too long
    const firstMatch = matchingLines[0].trim();
    return firstMatch.length > 50 ? firstMatch.substring(0, 47) + '...' : firstMatch;
  };

  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 px-0.5 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const renderFileTree = (nodes: FileNode[], path: string[] = [], isSearchMode = false) => {
    return nodes.map((node, index) => {
      const currentPath = [...path, node.name];
      const isSelected = selectedFile === node.name;
      const searchHighlight = node.searchHighlight;
      const isHighlighted = searchHighlight && (searchHighlight.nameMatch || searchHighlight.contentMatch);
      
      return (
        <div key={index}>
          <div
            className={`flex flex-col px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer rounded text-sm transition-colors ${
              isSelected ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 
              isHighlighted ? 'bg-yellow-50 dark:bg-yellow-900/20' :
              'text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => {
              if (node.type === 'folder') {
                toggleFolder(currentPath);
              } else {
                openFile(node.name, node.content);
                if (node.content) {
                  updateFileContent(node.name, node.content);
                }
              }
            }}
          >
            <div className="flex items-center space-x-2" style={{ paddingLeft: `${path.length * 16}px` }}>
              {node.type === 'folder' && (
                <button className="p-0.5">
                  {node.isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </button>
              )}
              {getFileIcon(node.name, node.type === 'folder', node.isOpen)}
              <span className="flex-1">
                {isSearchMode && searchQuery ? highlightSearchTerm(node.name, searchQuery) : node.name}
              </span>
              {searchHighlight?.contentMatch && (
                <span className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 px-1 rounded">
                  content
                </span>
              )}
            </div>
            {isSearchMode && searchHighlight?.contentPreview && (
              <div 
                className="text-xs text-gray-500 dark:text-gray-400 mt-1 pl-6 italic"
                style={{ paddingLeft: `${path.length * 16 + 24}px` }}
              >
                {highlightSearchTerm(searchHighlight.contentPreview, searchQuery)}
              </div>
            )}
          </div>
          {node.type === 'folder' && node.isOpen && node.children && (
            <div>
              {renderFileTree(node.children, currentPath, isSearchMode)}
            </div>
          )}
        </div>
      );
    });
  };

  const generatePreview = async () => {
    console.log('🔄 Generating preview for challenge type:', challengeType);
    
    if (!webContainer) {
      console.warn('⚠️ WebContainer not available, using static preview');
      // Fallback to static preview
      if (challengeType === 'code-runner' && codeRunnerState) {
        const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Runner Preview (Static)</title>
    <style>
        ${codeRunnerState.cssCode}
    </style>
</head>
<body>
    ${codeRunnerState.htmlCode.replace(/<!DOCTYPE html>|<html[^>]*>|<\/html>|<head[^>]*>[\s\S]*?<\/head>/gi, '').replace(/<body[^>]*>|<\/body>/gi, '')}
    <script>
        ${codeRunnerState.jsCode}
    </script>
</body>
</html>`;
        setPreviewContent(htmlTemplate);
        setShowPreviewPanel(true);
      }
      return;
    }
    
    if (challengeType === 'feature') {
      try {
        console.log('📱 Generating WebContainer preview for feature challenge...');
        // Get WebContainer preview URL
        const previewUrl = await getPreviewUrl();
        console.log('✅ WebContainer preview URL generated:', previewUrl);
        setPreviewContent(previewUrl);
        setShowPreviewPanel(true);
      } catch (error) {
        console.error('❌ Failed to generate WebContainer preview:', error);
        // Fallback to static preview
        const currentCode = fileContents[selectedFile] || initialCode;
        const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; }
        .dashboard { max-width: 1200px; margin: 0 auto; }
        .dashboard-header { margin-bottom: 20px; }
        .dashboard-content { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .loading { text-align: center; padding: 40px; color: #666; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script>
        ${currentCode}
    </script>
</body>
</html>`;
        setPreviewContent(htmlTemplate);
        setShowPreviewPanel(true);
      }
    } else if (challengeType === 'code-runner' && codeRunnerState) {
      try {
        console.log('🚀 Generating live preview for code runner...');
        
        // First, check if a dev server is already running from terminal output
        const terminalOutput = getTerminalOutput();
        console.log('🔍 Checking terminal output for running servers...');
        
        // Look for Vite server in terminal output
        const viteMatch = terminalOutput.match(/Local:\s*http:\/\/localhost:(\d+)/i);
        if (viteMatch) {
          const vitePort = parseInt(viteMatch[1]);
          console.log(`✨ Found Vite server running on port ${vitePort}`);
          try {
            const previewUrl = await getPreviewUrl(vitePort);
            console.log('✅ Got Vite preview URL:', previewUrl);
            if (previewUrl && (previewUrl.startsWith('http://') || previewUrl.startsWith('https://'))) {
              setPreviewContent(previewUrl);
              setShowPreviewPanel(true);
              return;
            }
          } catch (error) {
            console.warn('⚠️ Failed to get Vite preview URL:', error);
          }
        }
        
        // Try to get preview URL with explicit port detection
        let previewUrl;
        try {
          previewUrl = await getPreviewUrl(5173); // Try Vite port first
          console.log('✅ Got preview URL for port 5173:', previewUrl);
        } catch (error) {
          console.warn('⚠️ Port 5173 not available, trying default...');
          previewUrl = await getPreviewUrl(); // Fallback to auto-detection
          console.log('✅ Got preview URL with auto-detection:', previewUrl);
        }
        
        // Verify the URL looks correct
        if (previewUrl && (previewUrl.startsWith('http://') || previewUrl.startsWith('https://'))) {
          console.log('🌐 Using WebContainer live preview:', previewUrl);
          setPreviewContent(previewUrl);
          setShowPreviewPanel(true);
        } else {
          throw new Error('Invalid preview URL received');
        }
      } catch (error) {
        console.error('❌ Failed to generate live preview, using static fallback:', error);
        // Fallback to static preview for code runner
        const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Runner Preview (Static)</title>
    <style>
        ${codeRunnerState.cssCode}
    </style>
</head>
<body>
    ${codeRunnerState.htmlCode.replace(/<!DOCTYPE html>|<html[^>]*>|<\/html>|<head[^>]*>[\s\S]*?<\/head>/gi, '').replace(/<body[^>]*>|<\/body>/gi, '')}
    <script>
        ${codeRunnerState.jsCode}
    </script>
</body>
</html>`;
        console.log('📄 Using static HTML fallback preview');
        setPreviewContent(htmlTemplate);
        setShowPreviewPanel(true);
      }
    } else {
      console.log('ℹ️ No preview available for this challenge type:', challengeType);
    }
  };

  const runCode = async () => {
    console.log('🏃‍♂️ Running code...');
    
    try {
      const currentCode = fileContents[selectedFile] || initialCode;
      const result = await executeCode(currentCode, language as 'javascript' | 'typescript');
      if (result) {
        console.log('✅ Code execution result:', result);
      }
      
      // Auto-generate preview for React components and code runner
      if (showPreview && (challengeType === 'feature' || challengeType === 'code-runner')) {
        console.log('🎨 Auto-generating preview after code run');
        generatePreview();
      }
    } catch (error) {
      console.error('❌ Code execution failed:', error);
    }
  };



  const getDirectoryListing = (): string => {
    const listFiles = (nodes: FileNode[], prefix = ''): string => {
      return nodes.map(node => {
        if (node.type === 'folder') {
          const folderLine = `${prefix}📁 ${node.name}/`;
          const childrenLines = node.children ? listFiles(node.children, prefix + '  ') : '';
          return folderLine + (childrenLines ? '\n' + childrenLines : '');
        } else {
          return `${prefix}📄 ${node.name}`;
        }
      }).join('\n');
    };
    
    return listFiles(fileStructure);
  };

  // Function to get Monaco language based on file extension
  const getMonacoLanguage = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'html':
      case 'htm':
        return 'html';
      case 'css':
        return 'css';
      case 'scss':
      case 'sass':
        return 'scss';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      case 'py':
        return 'python';
      case 'java':
        return 'java';
      case 'cpp':
      case 'c':
        return 'cpp';
      case 'xml':
        return 'xml';
      case 'yaml':
      case 'yml':
        return 'yaml';
      case 'sql':
        return 'sql';
      case 'sh':
      case 'bash':
        return 'shell';
      default:
        // For code runner, use specific detection
        if (challengeType === 'code-runner') {
          if (fileName.includes('index.html') || fileName.includes('.html')) return 'html';
          if (fileName.includes('style.css') || fileName.includes('.css')) return 'css';
          if (fileName.includes('script.js') || fileName.includes('.js')) return 'javascript';
          // Fallback for unknown files in code runner
          return 'javascript';
        }
        // Default fallback
        return language || 'javascript';
    }
  };

  const displayFiles = activePanel === 'explorer' ? fileStructure : fileStructure;

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex space-x-1">
            <button
              onClick={() => setActivePanel('explorer')}
              className={`p-2 rounded ${activePanel === 'explorer' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <Folder className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActivePanel('search')}
              className={`p-2 rounded ${activePanel === 'search' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActivePanel('git')}
              className={`p-2 rounded ${activePanel === 'git' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              <GitBranch className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto">
          {activePanel === 'explorer' && (
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
                Explorer
              </div>
              {renderFileTree(displayFiles)}
            </div>
          )}
          
          {activePanel === 'search' && (
            <div className="p-3">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Search
              </div>
              
              {/* Search Mode Toggle */}
              <div className="flex mb-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setSearchMode('files')}
                  className={`flex-1 px-3 py-1 text-xs rounded-md transition-colors ${
                    searchMode === 'files' 
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Files
                </button>
                <button
                  onClick={() => setSearchMode('content')}
                  className={`flex-1 px-3 py-1 text-xs rounded-md transition-colors ${
                    searchMode === 'content' 
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Content
                </button>
              </div>
              
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchMode === 'files' ? 'Search files by name...' : 'Search in file contents...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSearchQuery('');
                      setSearchResults({ filteredNodes: [], matchCount: 0 });
                      setIsSearching(false);
                    }
                  }}
                  className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults({ filteredNodes: [], matchCount: 0 });
                      setIsSearching(false);
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              {searchQuery && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {searchMode === 'files' ? 'Files' : 'Results'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {isSearching ? (
                        <span className="flex items-center space-x-1">
                          <div className="animate-spin h-3 w-3 border border-gray-400 border-t-transparent rounded-full"></div>
                          <span>Searching...</span>
                        </span>
                      ) : searchMode === 'content' ? (
                        `${performGlobalSearch(searchQuery).length} matches`
                      ) : (
                        `${searchResults.matchCount} ${searchResults.matchCount === 1 ? 'file' : 'files'}`
                      )}
                    </div>
                  </div>
                  
                  {searchMode === 'files' ? (
                    searchResults.filteredNodes.length > 0 ? (
                      <div className="space-y-1">
                        {renderFileTree(searchResults.filteredNodes, [], true)}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        No files found matching "{searchQuery}"
                      </div>
                    )
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {performGlobalSearch(searchQuery).map((result, index) => (
                        <div 
                          key={index}
                          className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => openFile(result.file)}
                        >
                          <div className="font-medium text-blue-600 dark:text-blue-400 mb-1">
                            {result.file}:{result.line}
                          </div>
                          <div className="text-gray-700 dark:text-gray-300 truncate">
                            {highlightSearchTerm(result.content, searchQuery)}
                          </div>
                        </div>
                      ))}
                      {performGlobalSearch(searchQuery).length === 0 && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                          No content matches found for "{searchQuery}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {!searchQuery && (
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="mb-2 font-medium">Search Tips:</div>
                  <ul className="space-y-1 text-xs">
                    <li>• Files: Search by filename</li>
                    <li>• Content: Search inside files</li>
                    <li>• Use Ctrl+F for quick search</li>
                    <li>• Case insensitive matching</li>
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {activePanel === 'git' && (
            <div className="p-3">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Source Control
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                No changes detected
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Tab Bar */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 flex-shrink-0">
          <div className="flex items-center space-x-1 flex-1 overflow-x-auto">
            {openFiles.map((fileName) => (
              <div 
                key={fileName}
                className={`flex items-center space-x-2 px-3 py-2 text-sm cursor-pointer transition-colors ${
                  selectedFile === fileName 
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                onClick={() => setSelectedFile(fileName)}
              >
                {getFileIcon(fileName, false)}
                <span>{fileName}</span>
                {openFiles.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeFile(fileName);
                    }}
                    className="ml-1 p-0.5 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            {showPreview && (
              <button
                onClick={() => setShowPreviewPanel(!showPreviewPanel)}
                className={`flex items-center space-x-2 px-3 py-1 rounded text-sm transition-colors ${
                  showPreviewPanel 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200'
                }`}
              >
                <Globe className="h-3 w-3" />
                <span>Preview</span>
              </button>
            )}
            
            <button
              onClick={() => setIsTerminalOpen(!isTerminalOpen)}
              className={`flex items-center space-x-2 px-3 py-1 rounded text-sm transition-colors ${
                isTerminalOpen 
                  ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200'
              }`}
            >
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
              </svg>
              <span>{isTerminalOpen ? 'Hide Terminal' : 'Show Terminal'}</span>
            </button>
          </div>
        </div>

        {/* Editor and Preview Container */}
        <div className="flex-1 flex overflow-hidden">
          {/* Editor */}
          <div className={`${showPreviewPanel ? 'w-1/2' : 'flex-1'} overflow-hidden`}>
            <MonacoEditor
              value={fileContents[selectedFile] || initialCode}
              onChange={(value) => updateFileContent(selectedFile, value)}
              language={getMonacoLanguage(selectedFile)}
              theme="vs-dark"
              height="100%"
              fileName={selectedFile}
            />
          </div>
          
          {/* Preview Panel */}
          {showPreviewPanel && (
            <div className="w-1/2 border-l border-gray-200 dark:border-gray-700 flex flex-col">
              <BrowserPreview
                webContainerUrl={previewContent?.startsWith('http') ? previewContent : undefined}
                fallbackContent={!previewContent?.startsWith('http') ? previewContent : undefined}
                isLoading={webContainerLoading}
                error={webContainerError || undefined}
                onRefresh={generatePreview}
                onPortChange={async (port) => {
                  try {
                    const newUrl = await getPreviewUrl(port);
                    setPreviewContent(newUrl);
                  } catch (error) {
                    console.error('Failed to switch port:', error);
                  }
                }}
                className="h-full"
              />
            </div>
          )}
        </div>

        {/* Bottom Panel Container */}
        <div className="flex-shrink-0">

        {/* Terminal Panel - Now using proper Terminal component */}
        <Terminal
          isOpen={isTerminalOpen}
          onToggle={() => setIsTerminalOpen(!isTerminalOpen)}
          webContainer={webContainer}
          executeCommand={runCommand}
          getTerminalOutput={getTerminalOutput}
          sendInput={sendTerminalInput}
        />

        </div>
      </div>
    </div>
  );
};