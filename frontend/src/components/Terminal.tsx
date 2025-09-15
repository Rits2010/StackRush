import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, Copy, Settings, Package, Play } from 'lucide-react';

interface TerminalProps {
  isOpen: boolean;
  onToggle: () => void;
  webContainer?: any;
  executeCommand: (command: string) => Promise<string>;
  getTerminalOutput: () => string;
  sendInput: (input: string) => Promise<void>;
  className?: string;
  projectPath?: string;
  onPackageInstall?: (packageName: string) => void;
}

export const Terminal: React.FC<TerminalProps> = ({
  isOpen,
  onToggle,
  webContainer,
  executeCommand,
  getTerminalOutput,
  sendInput,
  className = '',
  projectPath = '~',
  onPackageInstall
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [output, setOutput] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [currentDirectory, setCurrentDirectory] = useState(projectPath);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installedPackages, setInstalledPackages] = useState<string[]>([]);

  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Initialize terminal
  useEffect(() => {
    if (isOpen && webContainer) {
      const initialOutput = getTerminalOutput() || 'Welcome to StackRush Terminal\nuser@stackrush:~$ ';
      setOutput(initialOutput);
    }
  }, [isOpen, webContainer, getTerminalOutput]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Focus input when terminal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Update output from WebContainer
  useEffect(() => {
    if (!webContainer) return;

    const interval = setInterval(() => {
      const currentOutput = getTerminalOutput();
      if (currentOutput !== output) {
        setOutput(currentOutput);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [webContainer, output, getTerminalOutput]);

  const handleKeyDown = useCallback(async (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle special keys
    switch (e.key) {
      case 'Enter':
        if (!input.trim()) {
          if (webContainer) {
            try {
              await sendInput('\n');
            } catch (error) {
              console.error('Failed to send newline:', error);
            }
          } else {
            setOutput(prev => prev + '\nuser@stackrush:~$ ');
          }
          return;
        }

        // Add to history
        setHistory(prev => {
          const newHistory = [...prev, input];
          return newHistory.length > 100 ? newHistory.slice(-100) : newHistory;
        });
        setHistoryIndex(-1);

        // Execute command
        setIsExecuting(true);
        try {
          if (webContainer) {
            const result = await executeCommand(input);
            setOutput(result);
          } else {
            // Mock execution for fallback
            setOutput(prev => prev + input + '\n' + mockExecuteCommand(input) + '\nuser@stackrush:~$ ');
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Command failed';
          setOutput(prev => prev + `Error: ${errorMsg}\nuser@stackrush:~$ `);
        }
        setIsExecuting(false);
        setInput('');
        setCursorPosition(0);
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (history.length > 0) {
          const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
          setCursorPosition(history[newIndex].length);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (historyIndex !== -1) {
          const newIndex = historyIndex + 1;
          if (newIndex >= history.length) {
            setHistoryIndex(-1);
            setInput('');
            setCursorPosition(0);
          } else {
            setHistoryIndex(newIndex);
            setInput(history[newIndex]);
            setCursorPosition(history[newIndex].length);
          }
        }
        break;

      case 'ArrowLeft':
        e.preventDefault();
        setCursorPosition(Math.max(0, cursorPosition - 1));
        break;

      case 'ArrowRight':
        e.preventDefault();
        setCursorPosition(Math.min(input.length, cursorPosition + 1));
        break;

      case 'Home':
        e.preventDefault();
        setCursorPosition(0);
        break;

      case 'End':
        e.preventDefault();
        setCursorPosition(input.length);
        break;

      case 'Tab':
        e.preventDefault();
        // Enhanced tab completion
        const commands = [
          'ls', 'cd', 'pwd', 'npm', 'node', 'git', 'cat', 'mkdir', 'touch', 'rm', 'cp', 'mv', 'clear',
          'echo', 'ps', 'top', 'df', 'free', 'which', 'history', 'env', 'whoami', 'chmod', 'chown',
          'grep', 'find', 'sort', 'uniq', 'wc', 'head', 'tail', 'less', 'more', 'vim', 'nano'
        ];
        
        const npmSubcommands = ['install', 'start', 'build', 'test', 'run', 'init', 'update', 'uninstall'];
        const gitSubcommands = ['status', 'add', 'commit', 'push', 'pull', 'clone', 'branch', 'checkout', 'merge', 'log'];
        
        const inputParts = input.split(' ');
        const currentWord = inputParts[inputParts.length - 1];
        
        let matches: string[] = [];
        
        if (inputParts.length === 1) {
          // Complete command names
          matches = commands.filter(cmd => cmd.startsWith(currentWord));
        } else if (inputParts[0] === 'npm' && inputParts.length === 2) {
          // Complete npm subcommands
          matches = npmSubcommands.filter(sub => sub.startsWith(currentWord));
        } else if (inputParts[0] === 'git' && inputParts.length === 2) {
          // Complete git subcommands
          matches = gitSubcommands.filter(sub => sub.startsWith(currentWord));
        } else if (['cd', 'ls', 'cat', 'rm', 'cp', 'mv'].includes(inputParts[0])) {
          // Complete file/directory names
          const files = ['src/', 'public/', 'package.json', 'README.md', 'node_modules/', '.git/', '.gitignore'];
          matches = files.filter(file => file.startsWith(currentWord));
        }
        
        if (matches.length === 1) {
          const newInput = inputParts.slice(0, -1).concat(matches[0]).join(' ') + ' ';
          setInput(newInput);
          setCursorPosition(newInput.length);
        } else if (matches.length > 1) {
          // Show available completions
          const completionList = matches.join('  ');
          setOutput(prev => prev + input + '\n' + completionList + '\nuser@stackrush:~$ ');
        }
        break;

      case 'c':
        if (e.ctrlKey) {
          e.preventDefault();
          // Send interrupt signal
          if (webContainer) {
            try {
              await sendInput('\u0003');
            } catch (error) {
              console.error('Failed to send interrupt:', error);
            }
          }
          setInput('');
          setCursorPosition(0);
          setIsExecuting(false);
        }
        break;

      case 'l':
        if (e.ctrlKey) {
          e.preventDefault();
          if (webContainer) {
            try {
              await executeCommand('clear');
            } catch (error) {
              console.error('Failed to clear terminal:', error);
            }
          } else {
            setOutput('Welcome to StackRush Terminal\nuser@stackrush:~$ ');
          }
        }
        break;

      case 'u':
        if (e.ctrlKey) {
          e.preventDefault();
          setInput('');
          setCursorPosition(0);
        }
        break;

      case 'k':
        if (e.ctrlKey) {
          e.preventDefault();
          setInput(input.substring(0, cursorPosition));
        }
        break;

      default:
        // Handle regular character input
        if (!e.ctrlKey && !e.metaKey && e.key.length === 1) {
          const newInput = input.substring(0, cursorPosition) + e.key + input.substring(cursorPosition);
          setInput(newInput);
          setCursorPosition(cursorPosition + 1);
          e.preventDefault();
        }
        break;
    }
  }, [input, history, historyIndex, cursorPosition, webContainer, executeCommand, sendInput, isExecuting]);

  const mockExecuteCommand = (command: string): string => {
    const cmd = command.trim().split(' ')[0];
    const args = command.trim().split(' ').slice(1);
    
    switch (cmd) {
      case 'ls':
        if (args.includes('-la') || args.includes('-l')) {
          return `total 8
drwxr-xr-x  5 user user  160 Dec 15 10:30 .
drwxr-xr-x  3 user user   96 Dec 15 10:00 ..
-rw-r--r--  1 user user  585 Dec 15 10:30 package.json
-rw-r--r--  1 user user 1024 Dec 15 10:25 README.md
drwxr-xr-x  3 user user   96 Dec 15 10:30 src
drwxr-xr-x  2 user user   64 Dec 15 10:30 public
drwxr-xr-x 50 user user 1600 Dec 15 10:30 node_modules`;
        }
        return 'src/  public/  package.json  README.md  node_modules/';
        
      case 'pwd':
        return '/home/user/workspace';
        
      case 'whoami':
        return 'user';
        
      case 'clear':
        return '';
        
      case 'mkdir':
        if (args.length === 0) return 'mkdir: missing operand';
        return `Directory '${args[0]}' created`;
        
      case 'touch':
        if (args.length === 0) return 'touch: missing file operand';
        return `File '${args[0]}' created`;
        
      case 'cat':
        if (args.length === 0) return 'cat: missing file operand';
        if (args[0] === 'package.json') {
          return `{
  "name": "challenge-project",
  "version": "1.0.0",
  "description": "Challenge project with proper dependencies",
  "main": "src/index.js",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}`;
        }
        return `cat: ${args[0]}: No such file or directory`;
        
      case 'cd':
        if (args.length === 0 || args[0] === '~') return 'Changed to home directory';
        if (args[0] === '..') return 'Changed to parent directory';
        return `Changed to directory: ${args[0]}`;
        
      case 'npm':
        return handleNpmCommand(command, args);
        
      case 'yarn':
        return handleYarnCommand(command, args);
        
      case 'pnpm':
        return handlePnpmCommand(command, args);
        
      case 'node':
        if (command.includes('--version') || command.includes('-v')) {
          return 'v18.17.0';
        }
        if (args.length > 0) {
          return `Executing: node ${args.join(' ')}`;
        }
        return 'Welcome to Node.js v18.17.0.\nType ".help" for more information.';
        
      case 'git':
        if (command.includes('status')) {
          return `On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   src/App.js

no changes added to commit (use "git add ." or "git commit -a")`;
        }
        if (command.includes('log')) {
          return `commit a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0 (HEAD -> main)
Author: Developer <dev@example.com>
Date:   Mon Dec 15 10:30:00 2023 +0000

    Initial commit`;
        }
        if (command.includes('add')) {
          return 'Changes staged for commit';
        }
        return 'Git command executed';
        
      case 'echo':
        return args.join(' ');
        
      case 'ps':
        return `  PID TTY          TIME CMD
 1234 pts/0    00:00:01 bash
 5678 pts/0    00:00:00 node
 9012 pts/0    00:00:00 ps`;
        
      case 'top':
        return `Tasks: 156 total,   1 running, 155 sleeping,   0 stopped,   0 zombie
%Cpu(s):  2.3 us,  1.2 sy,  0.0 ni, 96.2 id,  0.3 wa,  0.0 hi,  0.0 si,  0.0 st
MiB Mem :   8192.0 total,   2048.5 free,   3072.2 used,   3071.3 buff/cache

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 1234 user      20   0  123456   45678   12345 S   1.3   0.6   0:01.23 node`;
        
      case 'df':
        return `Filesystem     1K-blocks    Used Available Use% Mounted on
/dev/sda1       20971520 8388608  12582912  40% /
tmpfs            4194304       0   4194304   0% /dev/shm`;
        
      case 'free':
        return `              total        used        free      shared  buff/cache   available
Mem:        8388608     3145728     2097152      524288     3145728     4718592
Swap:       2097152           0     2097152`;
        
      case 'which':
        if (args.length === 0) return 'which: missing argument';
        const commonCommands = ['node', 'npm', 'git', 'bash', 'ls', 'cat'];
        if (commonCommands.includes(args[0])) {
          return `/usr/bin/${args[0]}`;
        }
        return `which: no ${args[0]} in (/usr/local/bin:/usr/bin:/bin)`;
        
      case 'history':
        return history.slice(-10).map((cmd, i) => `${i + 1}  ${cmd}`).join('\n');
        
      case 'env':
        return `PATH=/usr/local/bin:/usr/bin:/bin
HOME=/home/user
USER=user
SHELL=/bin/bash
NODE_ENV=development
PWD=/home/user/workspace`;
        
      default:
        return command.trim() ? `bash: ${cmd}: command not found` : '';
    }
  };

  const handleNpmCommand = (command: string, args: string[]): string => {
    if (command.includes('--version') || command.includes('-v')) {
      return '9.6.7';
    }
    
    if (command.includes('install') || command.includes('i')) {
      setIsInstalling(true);
      
      // Simulate package installation with realistic output
      const packageName = args.find(arg => !arg.startsWith('-')) || 'dependencies';
      
      setTimeout(() => {
        setIsInstalling(false);
        if (onPackageInstall) {
          onPackageInstall(packageName);
        }
        setInstalledPackages(prev => [...prev, packageName]);
      }, 2000);
      
      return `npm WARN deprecated some-package@1.0.0: This package is deprecated
npm WARN deprecated another-package@2.0.0: Please upgrade to newer version

Installing ${packageName}...

> fsevents@2.3.2 install
> node-gyp rebuild

  SOLINK_MODULE(target) Release/.node
  CXX(target) Release/obj.target/fse/fsevents.o
  SOLINK_MODULE(target) Release/fse.node

added 1247 packages, and audited 1248 packages in 45s

156 packages are looking for funding
  run \`npm fund\` for details

found 0 vulnerabilities

✓ Installation completed successfully!`;
    }
    
    if (command.includes('start')) {
      return `> challenge-project@1.0.0 start
> react-scripts start

Starting the development server...

Compiled successfully!

You can now view challenge-project in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.100:3000

Note that the development build is not optimized.
To create a production build, use npm run build.

webpack compiled with 1 warning`;
    }
    
    if (command.includes('build')) {
      return `> challenge-project@1.0.0 build
> react-scripts build

Creating an optimized production build...
Compiled successfully.

File sizes after gzip:

  46.61 KB  build/static/js/2.8b4c8b4c.chunk.js
  1.62 KB   build/static/js/3.7c3b8b4c.chunk.js
  1.17 KB   build/static/js/runtime-main.8b4c8b4c.js
  596 B     build/static/css/main.8b4c8b4c.css

The project was built assuming it is hosted at /.
You can control this with the homepage field in your package.json.

The build folder is ready to be deployed.`;
    }
    
    if (command.includes('test')) {
      return `> challenge-project@1.0.0 test
> react-scripts test

 PASS  src/App.test.js
  ✓ renders learn react link (23ms)
 PASS  src/components/ProductGallery.test.js
  ✓ renders product gallery (45ms)
  ✓ filters products by category (67ms)
  ✓ implements lazy loading (89ms)

Test Suites: 2 passed, 2 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        2.345s, estimated 3s
Ran all test suites.

Watch Usage
 › Press f to run only failed tests.
 › Press o to only run tests related to changed files.
 › Press q to quit watch mode.
 › Press Enter to trigger a test run.`;
    }
    
    if (command.includes('run')) {
      const script = args[1];
      return `> challenge-project@1.0.0 ${script}
> ${script}

Script "${script}" executed successfully.`;
    }
    
    return 'npm command executed';
  };

  const handleYarnCommand = (command: string, args: string[]): string => {
    if (command.includes('--version') || command.includes('-v')) {
      return '1.22.19';
    }
    
    if (command.includes('install') || command.includes('add')) {
      const packageName = args.find(arg => !arg.startsWith('-')) || 'dependencies';
      return `yarn install v1.22.19
[1/4] 🔍  Resolving packages...
[2/4] 🚚  Fetching packages...
[3/4] 🔗  Linking dependencies...
[4/4] 🔨  Building fresh packages...
success Saved lockfile.
✨  Done in 12.34s.`;
    }
    
    if (command.includes('start')) {
      return `yarn run v1.22.19
$ react-scripts start
Starting the development server...

Compiled successfully!

Local:            http://localhost:3000
On Your Network:  http://192.168.1.100:3000

✨  Done in 15.67s.`;
    }
    
    return 'yarn command executed';
  };

  const handlePnpmCommand = (command: string, args: string[]): string => {
    if (command.includes('--version') || command.includes('-v')) {
      return '8.6.12';
    }
    
    if (command.includes('install') || command.includes('add')) {
      const packageName = args.find(arg => !arg.startsWith('-')) || 'dependencies';
      return `Lockfile is up to date, resolution step is skipped
Packages: +1247
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Progress: resolved 1247, reused 1247, downloaded 0, added 1247, done

dependencies:
+ ${packageName} 1.0.0

Done in 8.9s`;
    }
    
    if (command.includes('start')) {
      return `> challenge-project@1.0.0 start
> react-scripts start

Starting the development server...

Compiled successfully!

Local:            http://localhost:3000
On Your Network:  http://192.168.1.100:3000

Done in 12.3s`;
    }
    
    return 'pnpm command executed';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    setCursorPosition(value.length);
  };

  const handleClear = async () => {
    if (webContainer) {
      try {
        await executeCommand('clear');
      } catch (error) {
        console.error('Failed to clear terminal:', error);
      }
    } else {
      setOutput('Welcome to StackRush Terminal\nuser@stackrush:~$ ');
    }
  };

  const handleCopy = () => {
    const textToCopy = output;
    navigator.clipboard.writeText(textToCopy).catch(console.error);
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`${isMaximized ? 'fixed inset-0 z-50' : 'h-64'} bg-gray-900 text-green-400 font-mono text-sm flex flex-col border-t border-gray-700 ${className}`}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <TerminalIcon className="h-4 w-4" />
          <span className="text-white text-xs font-medium">Terminal</span>
          {isExecuting && (
            <span className="text-yellow-400 text-xs animate-pulse">● Executing</span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={handleCopy}
            className="p-1 text-gray-400 hover:text-white transition-colors rounded"
            title="Copy output"
          >
            <Copy className="h-3 w-3" />
          </button>
          <button
            onClick={handleClear}
            className="p-1 text-gray-400 hover:text-white transition-colors rounded"
            title="Clear terminal"
          >
            <Settings className="h-3 w-3" />
          </button>
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 text-gray-400 hover:text-white transition-colors rounded"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </button>
          <button
            onClick={onToggle}
            className="p-1 text-gray-400 hover:text-white transition-colors rounded"
            title="Close terminal"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="flex-1 flex flex-col overflow-hidden"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Output Area */}
        <div 
          ref={outputRef}
          className="flex-1 p-3 overflow-y-auto font-mono text-xs leading-relaxed select-text"
          style={{ 
            fontFamily: 'JetBrains Mono, Consolas, "Courier New", monospace',
            userSelect: 'text',
            WebkitUserSelect: 'text'
          }}
        >
          <pre className="whitespace-pre-wrap text-green-400 select-text">
            {output}
          </pre>
          
          {/* Package Installation Progress */}
          {isInstalling && (
            <div className="mt-2 p-2 bg-blue-900/20 border border-blue-500/30 rounded">
              <div className="flex items-center gap-2 text-blue-400">
                <Package className="w-4 h-4 animate-pulse" />
                <span>Installing packages...</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
              <div className="mt-1 text-xs text-blue-300">
                This may take a few moments...
              </div>
            </div>
          )}
        </div>

        {/* Input Line */}
        <div className="flex-shrink-0 px-3 pb-3">
          <div className="flex items-center text-green-400">
            <span className="text-green-500 flex-shrink-0">user@stackrush:~$ </span>
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-green-400 outline-none border-none caret-green-400 ml-1"
                placeholder={isExecuting ? "Executing..." : ""}
                disabled={isExecuting}
                autoComplete="off"
                spellCheck={false}
                style={{
                  fontFamily: 'JetBrains Mono, Consolas, "Courier New", monospace',
                  fontSize: '12px'
                }}
              />
              {isExecuting && (
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-yellow-400 animate-pulse">
                  ●
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;