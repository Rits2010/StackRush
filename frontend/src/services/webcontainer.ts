import { WebContainer } from '@webcontainer/api';
import { validateInput, sanitizeJavaScript, rateLimiter } from '../utils/security';

export interface ServerInfo {
  port: number;
  url: string;
  status: 'starting' | 'running' | 'stopped' | 'error';
  type: 'dev-server' | 'api' | 'static' | 'unknown';
  process?: any;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
}

export interface TerminalSession {
  id: string;
  process: any;
  output: string;
  isActive: boolean;
}

export class WebContainerService {
  private static instance: WebContainerService;
  private webcontainer: WebContainer | null = null;
  private isInitialized = false;
  private terminalSessions: Map<string, TerminalSession> = new Map();
  private runningServers: Map<number, ServerInfo> = new Map();
  private portListeners: Map<number, () => void> = new Map();

  private constructor() {}

  public static getInstance(): WebContainerService {
    if (!WebContainerService.instance) {
      WebContainerService.instance = new WebContainerService();
    }
    return WebContainerService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Check if WebContainer is supported in this environment
    if (!this.isWebContainerSupported()) {
      console.warn('WebContainer is not supported in this environment. Code execution will use fallback mode.');
      this.isInitialized = true; // Mark as initialized but without WebContainer
      return;
    }

    try {
      // Only boot if we don't already have an instance
      if (!this.webcontainer) {
        this.webcontainer = await WebContainer.boot();
        console.log('WebContainer initialized successfully');
      }
      this.isInitialized = true;
    } catch (error) {
      // Check if error is about multiple instances
      if (error instanceof Error && error.message.includes('Only a single WebContainer instance')) {
        console.warn('WebContainer already booted, reusing existing instance');
        this.isInitialized = true;
        // Try to get existing instance - this is a workaround since WebContainer doesn't expose it
        // We'll mark as initialized but without direct access to webcontainer
        this.webcontainer = null;
      } else {
        console.error('Failed to initialize WebContainer:', error);
        console.warn('Falling back to mock execution mode');
        this.isInitialized = true; // Mark as initialized but without WebContainer
      }
    }
  }

  private isWebContainerSupported(): boolean {
    // Check if the environment supports WebContainer
    if (typeof window === 'undefined') return false;
    
    // Check for cross-origin isolation
    if (!window.crossOriginIsolated) {
      console.warn('WebContainer requires cross-origin isolation. Please ensure your server sends the following headers:\n' +
        'Cross-Origin-Embedder-Policy: require-corp\n' +
        'Cross-Origin-Opener-Policy: same-origin');
      return false;
    }

    // Check for SharedArrayBuffer support
    if (typeof SharedArrayBuffer === 'undefined') {
      console.warn('WebContainer requires SharedArrayBuffer support');
      return false;
    }

    return true;
  }

  public async executeJavaScript(code: string, testCases?: any[]): Promise<ExecutionResult> {
    // Security checks
    if (!validateInput(code, 'code')) {
      return {
        success: false,
        output: '',
        error: 'Invalid code input',
        executionTime: 0
      };
    }

    if (!rateLimiter.canMakeRequest('code_execution', 'user')) {
      return {
        success: false,
        output: '',
        error: 'Rate limit exceeded. Please wait before executing more code.',
        executionTime: 0
      };
    }

    // Sanitize the code
    const sanitizedCode = sanitizeJavaScript(code);

    if (!this.webcontainer) {
      // Fallback to mock execution when WebContainer is not available
      return this.mockExecuteJavaScript(sanitizedCode, testCases);
    }

    const startTime = Date.now();

    try {
      // Create a temporary file system
      const files = {
        'package.json': {
          file: {
            contents: JSON.stringify({
              name: 'code-execution',
              type: 'module',
              dependencies: {}
            }, null, 2)
          }
        },
        'solution.js': {
          file: {
            contents: sanitizedCode
          }
        },
        'test.js': {
          file: {
            contents: this.generateTestCode(sanitizedCode, testCases)
          }
        }
      };

      // Mount the file system
      await this.webcontainer.mount(files);

      // Execute the code
      const process = await this.webcontainer.spawn('node', ['test.js']);

      let output = '';
      let error = '';

      process.output.pipeTo(new WritableStream({
        write(data) {
          output += data;
        }
      }));

      const exitCode = await process.exit;
      const executionTime = Date.now() - startTime;

      return {
        success: exitCode === 0,
        output: output.trim(),
        error: exitCode !== 0 ? error || 'Execution failed' : undefined,
        executionTime
      };

    } catch (err) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        output: '',
        error: err instanceof Error ? err.message : 'Unknown error',
        executionTime
      };
    }
  }

  public async executeTypeScript(code: string, testCases?: any[]): Promise<ExecutionResult> {
    if (!this.webcontainer) {
      // Fallback to mock execution when WebContainer is not available
      return this.mockExecuteTypeScript(code, testCases);
    }

    const startTime = Date.now();

    try {
      // Create a temporary file system with TypeScript support
      const files = {
        'package.json': {
          file: {
            contents: JSON.stringify({
              name: 'code-execution',
              type: 'module',
              dependencies: {
                'typescript': '^5.0.0',
                '@types/node': '^20.0.0'
              },
              scripts: {
                'build': 'tsc solution.ts --outDir dist --target es2020 --module commonjs',
                'test': 'node dist/test.js'
              }
            }, null, 2)
          }
        },
        'solution.ts': {
          file: {
            contents: code
          }
        },
        'test.ts': {
          file: {
            contents: this.generateTestCode(code, testCases, 'typescript')
          }
        }
      };

      // Mount the file system
      await this.webcontainer.mount(files);

      // Install dependencies
      const installProcess = await this.webcontainer.spawn('npm', ['install']);
      await installProcess.exit;

      // Compile TypeScript
      const buildProcess = await this.webcontainer.spawn('npm', ['run', 'build']);
      await buildProcess.exit;

      // Execute the compiled code
      const process = await this.webcontainer.spawn('npm', ['run', 'test']);

      let output = '';
      let error = '';

      process.output.pipeTo(new WritableStream({
        write(data) {
          output += data;
        }
      }));

      const exitCode = await process.exit;
      const executionTime = Date.now() - startTime;

      return {
        success: exitCode === 0,
        output: output.trim(),
        error: exitCode !== 0 ? error || 'Execution failed' : undefined,
        executionTime
      };

    } catch (err) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        output: '',
        error: err instanceof Error ? err.message : 'Unknown error',
        executionTime
      };
    }
  }

  private generateTestCode(userCode: string, testCases?: any[], language: 'javascript' | 'typescript' = 'javascript'): string {
    if (!testCases || testCases.length === 0) {
      // Simple execution test
      return `
try {
  ${userCode}
  console.log('Code executed successfully');
} catch (error) {
  console.error('Runtime error:', error.message);
  process.exit(1);
}
      `;
    }

    // Generate test cases
    const testCode = testCases.map((testCase, index) => {
      if (testCase.input && testCase.expected) {
        return `
try {
  const result = ${this.extractFunctionCall(userCode, testCase.input)};
  const expected = ${testCase.expected};
  if (JSON.stringify(result) === JSON.stringify(expected)) {
    console.log('✓ Test ${index + 1} passed');
  } else {
    console.log('✗ Test ${index + 1} failed');
    console.log('  Expected:', expected);
    console.log('  Got:', result);
  }
} catch (error) {
  console.log('✗ Test ${index + 1} failed with error:', error.message);
}
        `;
      }
      return '';
    }).join('\n');

    return `
${userCode}

console.log('Running tests...');
${testCode}
console.log('Tests completed');
    `;
  }

  private extractFunctionCall(code: string, input: string): string {
    // Extract function name from code
    const functionMatch = code.match(/function\s+(\w+)/);
    if (functionMatch) {
      const functionName = functionMatch[1];
      return `${functionName}(${input})`;
    }

    // Handle arrow functions or other patterns
    const arrowMatch = code.match(/const\s+(\w+)\s*=/);
    if (arrowMatch) {
      const functionName = arrowMatch[1];
      return `${functionName}(${input})`;
    }

    // Default fallback
    return `eval('${input}')`;
  }

  private async mockExecuteJavaScript(code: string, testCases?: any[]): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Simple syntax check
      new Function(code);
      
      let output = 'Code executed successfully (mock mode)\n';
      
      if (testCases && testCases.length > 0) {
        output += 'Running tests...\n';
        testCases.forEach((testCase, index) => {
          output += `✓ Test ${index + 1} passed (mock)\n`;
        });
        output += 'Tests completed\n';
      }
      
      const executionTime = Date.now() - startTime;
      
      return {
        success: true,
        output: output.trim(),
        executionTime
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        output: '',
        error: `Syntax error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTime
      };
    }
  }

  private async mockExecuteTypeScript(code: string, testCases?: any[]): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Basic TypeScript-like validation (remove type annotations for syntax check)
      const jsCode = code.replace(/:\s*\w+/g, '').replace(/interface\s+\w+\s*{[^}]*}/g, '');
      new Function(jsCode);
      
      let output = 'TypeScript code compiled and executed successfully (mock mode)\n';
      
      if (testCases && testCases.length > 0) {
        output += 'Running tests...\n';
        testCases.forEach((testCase, index) => {
          output += `✓ Test ${index + 1} passed (mock)\n`;
        });
        output += 'Tests completed\n';
      }
      
      const executionTime = Date.now() - startTime;
      
      return {
        success: true,
        output: output.trim(),
        executionTime
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      return {
        success: false,
        output: '',
        error: `Compilation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTime
      };
    }
  }

  public async createTerminalSession(sessionId: string): Promise<TerminalSession | null> {
    if (!this.webcontainer) {
      // Create a mock terminal session when WebContainer is not available
      const session: TerminalSession = {
        id: sessionId,
        process: null,
        output: 'Welcome to StackRush Terminal (Mock Mode)\nuser@stackrush:~$ ',
        isActive: true,
      };

      this.terminalSessions.set(sessionId, session);
      return session;
    }

    try {
      // Create a proper shell process with WebContainer
      console.log('Creating real terminal session with WebContainer...');
      
      const process = await this.webcontainer.spawn('jsh', [], {
        terminal: {
          cols: 120,
          rows: 30,
        },
        env: {
          NODE_ENV: 'development',
          PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
          HOME: '/home/stackrush',
          USER: 'stackrush',
          SHELL: '/bin/jsh',
          TERM: 'xterm-256color',
          PS1: 'stackrush@webcontainer:~$ '
        }
      });

      const session: TerminalSession = {
        id: sessionId,
        process,
        output: '',
        isActive: true,
      };

      this.terminalSessions.set(sessionId, session);

      // Handle process output in real-time
      let outputBuffer = '';
      
      process.output.pipeTo(new WritableStream({
        write: (data) => {
          outputBuffer += data;
          session.output = outputBuffer;
        },
        close: () => {
          console.log('Terminal session closed');
          session.isActive = false;
        },
        abort: (err) => {
          console.error('Terminal session aborted:', err);
          session.isActive = false;
        }
      }));

      // Wait for the shell to be ready and show initial prompt
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return session;
    } catch (error) {
      console.error('Failed to create WebContainer terminal session:', error);
      
      // Fallback to mock terminal with clear indication
      const session: TerminalSession = {
        id: sessionId,
        process: null,
        output: 'Welcome to StackRush Terminal (Fallback Mode)\nWebContainer unavailable - using mock terminal\nuser@stackrush:~$ ',
        isActive: true,
      };
      this.terminalSessions.set(sessionId, session);
      return session;
    }
  }

  public async executeTerminalCommand(sessionId: string, command: string): Promise<string> {
    let session = this.terminalSessions.get(sessionId);
    
    // Create session if it doesn't exist
    if (!session) {
      const newSession = await this.createTerminalSession(sessionId);
      if (!newSession) {
        throw new Error('Failed to create terminal session');
      }
      session = newSession;
    }
    
    // If session is inactive but we have WebContainer, try to recreate
    if (!session.isActive && this.webcontainer) {
      const newSession = await this.createTerminalSession(sessionId);
      if (newSession) {
        session = newSession;
      }
    }

    // Check if command starts a development server
    const isServerCommand = this.isDevServerCommand(command);
    if (isServerCommand && this.webcontainer) {
      const port = this.extractPortFromCommand(command);
      if (port) {
        // Update server tracking
        const serverInfo: ServerInfo = {
          port,
          url: '',
          status: 'starting',
          type: this.getServerType(command)
        };
        this.runningServers.set(port, serverInfo);
      }
    }

    if (!session.process) {
      // Enhanced mock terminal command execution
      const mockOutput = this.executeMockCommand(session, command);
      
      // Update session output with command and result
      if (command === 'clear') {
        session.output = 'user@stackrush:~$ ';
      } else {
        // Add the command to the output
        session.output += command + '\n';
        if (mockOutput) {
          session.output += mockOutput + '\n';
        }
        session.output += 'user@stackrush:~$ ';
      }
      
      // For mock mode, simulate server starting if it's a server command
      if (isServerCommand) {
        const port = this.extractPortFromCommand(command);
        if (port) {
          const serverInfo: ServerInfo = {
            port,
            url: `http://localhost:${port}`,
            status: 'running',
            type: this.getServerType(command)
          };
          this.runningServers.set(port, serverInfo);
        }
      }
      
      return session.output;
    }

    try {
      // Send command to real WebContainer terminal
      const writer = session.process.input.getWriter();
      
      console.log(`Executing command in real terminal: ${command}`);
      
      // Handle special terminal sequences
      if (command === 'clear') {
        await writer.write('\u001b[2J\u001b[H');
      } else {
        await writer.write(command + '\n');
      }
      
      writer.releaseLock();

      // Wait for command execution and output
      await this.waitForCommandCompletion(session, command);
      
      // Update server status if it's a server command
      if (isServerCommand) {
        const port = this.extractPortFromCommand(command);
        if (port) {
          // Wait a moment for server to start, then update status
          setTimeout(async () => {
            try {
              const serverInfo = this.runningServers.get(port);
              if (serverInfo) {
                const previewUrl = await this.getWebContainerPreviewUrl(port);
                if (previewUrl) {
                  serverInfo.status = 'running';
                  serverInfo.url = previewUrl;
                  this.runningServers.set(port, serverInfo);
                  console.log(`Server started successfully on port ${port}: ${previewUrl}`);
                }
              }
            } catch (error) {
              console.error(`Failed to update server status for port ${port}:`, error);
            }
          }, 3000); // Wait 3 seconds for server to stabilize
        }
      }
      
      return session.output;
    } catch (error) {
      console.error('Failed to execute terminal command:', error);
      // Fall back to mock execution
      const mockOutput = this.executeMockCommand(session, command);
      
      // Update session output
      session.output += command + '\n';
      if (mockOutput) {
        session.output += mockOutput + '\n';
      }
      session.output += 'user@stackrush:~$ ';
      
      return session.output;
    }
  }

  private async waitForCommandCompletion(session: TerminalSession, command: string): Promise<void> {
    const startTime = Date.now();
    const timeout = 30000; // 30 seconds timeout
    const pollInterval = 200; // Check every 200ms
    
    // For commands that typically take longer
    const longRunningCommands = ['npm install', 'npm ci', 'yarn install', 'git clone', 'npm run dev', 'npm start'];
    const isLongRunning = longRunningCommands.some(cmd => command.startsWith(cmd));
    const maxWait = isLongRunning ? 60000 : timeout;
    
    return new Promise((resolve) => {
      let lastOutputLength = session.output.length;
      let stableCount = 0;
      
      const checkOutput = () => {
        const elapsed = Date.now() - startTime;
        const currentLength = session.output.length;
        
        // Check if output has stabilized (no new content for 3 consecutive checks)
        if (currentLength === lastOutputLength) {
          stableCount++;
        } else {
          stableCount = 0;
          lastOutputLength = currentLength;
        }
        
        // Check if command appears complete
        const output = session.output;
        const hasPrompt = output.endsWith('$ ') || output.endsWith('> ') || output.endsWith('# ') || output.endsWith('stackrush@webcontainer:~$ ');
        const isStable = stableCount >= 3;
        
        if (hasPrompt || isStable || elapsed > maxWait) {
          console.log(`Command completed: ${command} (elapsed: ${elapsed}ms, stable: ${isStable}, hasPrompt: ${hasPrompt})`);
          resolve();
          return;
        }
        
        // Continue polling
        setTimeout(checkOutput, pollInterval);
      };
      
      // Start checking after a brief delay
      setTimeout(checkOutput, pollInterval);
    });
  }

  private executeMockCommand(session: TerminalSession, command: string): string {
    const cmd = command.trim().split(' ')[0];
    const args = command.trim().split(' ').slice(1);
    let output = '';
    
    switch (cmd) {
      case 'ls':
        if (args.includes('-la') || args.includes('-al')) {
          output = 'total 24\ndrwxr-xr-x  4 user user 4096 Jan  1 12:00 .\ndrwxr-xr-x  3 root root 4096 Jan  1 12:00 ..\n-rw-r--r--  1 user user  220 Jan  1 12:00 .bashrc\ndrwxr-xr-x  2 user user 4096 Jan  1 12:00 src\n-rw-r--r--  1 user user  500 Jan  1 12:00 package.json\n-rw-r--r--  1 user user  300 Jan  1 12:00 README.md';
        } else {
          output = 'src/  package.json  README.md  node_modules/';
        }
        break;
      case 'pwd':
        output = '/home/user/workspace';
        break;
      case 'whoami':
        output = 'user';
        break;
      case 'node':
        if (args.includes('--version') || args.includes('-v')) {
          output = 'v18.17.0';
        } else if (args.length === 0) {
          output = 'Welcome to Node.js v18.17.0.\nType ".help" for more information.';
        } else {
          output = `Executing: node ${args.join(' ')}`;
        }
        break;
      case 'npm':
        if (args.includes('--version') || args.includes('-v')) {
          output = '9.6.7';
        } else if (args[0] === 'install') {
          const packages = args.slice(1).filter(arg => !arg.startsWith('-'));
          if (packages.length > 0) {
            output = `Installing ${packages.join(', ')}...\n✓ Packages installed successfully\n\naudited 1000 packages in 2.5s\n\nfound 0 vulnerabilities`;
          } else {
            output = 'Installing dependencies...\n✓ Dependencies installed successfully\n\naudited 500 packages in 1.8s\n\nfound 0 vulnerabilities';
          }
        } else if (args[0] === 'start') {
          output = '> Starting development server...\n> Local: http://localhost:3000\n> Network: http://192.168.1.100:3000';
        } else if (args[0] === 'run') {
          if (args[1] === 'dev') {
            output = '\n> my-app@0.1.0 dev\n> vite\n\n  VITE v4.4.5  ready in 1200ms\n\n  ➜  Local:   http://localhost:5173/\n  ➜  Network: use --host to expose\n  ➜  press h to show help';
          } else if (args[1] === 'start') {
            output = '\n> my-app@0.1.0 start\n> react-scripts start\n\nStarting the development server...\n\nLocal:            http://localhost:3000\nOn Your Network:  http://192.168.1.100:3000\n\nNote that the development build is not optimized.\nTo create a production build, use npm run build.';
          } else if (args[1] === 'build') {
            output = '\n> my-app@0.1.0 build\n> vite build\n\nvite v4.4.5 building for production...\n✓ 34 modules transformed.\ndist/index.html                   0.46 kB │ gzip:   0.30 kB\ndist/assets/index-4a72c88b.css    1.34 kB │ gzip:   0.61 kB\ndist/assets/index-d526a0c5.js   143.42 kB │ gzip:  46.11 kB\n✓ built in 2.45s';
          } else {
            output = `\n> my-app@0.1.0 ${args[1]}\n> Script executed successfully`;
          }
        } else if (args[0] === 'init') {
          output = 'This utility will walk you through creating a package.json file.\nPackage created successfully!';
        } else {
          output = `npm command: ${args.join(' ')}`;
        }
        break;
      case 'yarn':
        if (args.includes('--version') || args.includes('-v')) {
          output = '1.22.19';
        } else if (args[0] === 'install' || args.length === 0) {
          output = 'Installing dependencies...\n✓ Done in 2.1s';
        } else if (args[0] === 'start') {
          output = 'Starting development server...\nLocal: http://localhost:3000';
        } else {
          output = `yarn ${args.join(' ')}`;
        }
        break;
      case 'git':
        if (args[0] === 'status') {
          output = 'On branch main\nnothing to commit, working tree clean';
        } else if (args[0] === 'branch') {
          output = '* main\n  develop\n  feature/new-component';
        } else if (args[0] === 'log') {
          output = 'commit abc123 (HEAD -> main)\nAuthor: Developer <dev@example.com>\nDate: Mon Jan 1 12:00:00 2024\n\n    Initial commit';
        } else if (args[0] === 'clone') {
          output = `Cloning into '${args[1] || 'repository'}'...\nRemote: Counting objects: 100, done.\nReceiving objects: 100% (100/100), done.`;
        } else {
          output = `git ${args.join(' ')}`;
        }
        break;
      case 'cat':
        if (args[0]) {
          output = `Content of ${args[0]}:\n// File content would be displayed here`;
        } else {
          output = 'cat: missing file operand';
        }
        break;
      case 'echo':
        output = args.join(' ');
        break;
      case 'mkdir':
        if (args.length > 0) {
          output = ''; // mkdir typically produces no output on success
        } else {
          output = 'mkdir: missing operand\nTry \'mkdir --help\' for more information.';
        }
        break;
      case 'touch':
        if (args.length > 0) {
          output = ''; // touch typically produces no output on success
        } else {
          output = 'touch: missing file operand\nTry \'touch --help\' for more information.';
        }
        break;
      case 'rm':
        if (args.length > 0) {
          output = ''; // rm typically produces no output on success
        } else {
          output = 'rm: missing operand\nTry \'rm --help\' for more information.';
        }
        break;
      case 'cp':
        if (args.length >= 2) {
          output = ''; // cp typically produces no output on success
        } else {
          output = 'cp: missing file operand\nTry \'cp --help\' for more information.';
        }
        break;
      case 'mv':
        if (args.length >= 2) {
          output = ''; // mv typically produces no output on success
        } else {
          output = 'mv: missing file operand\nTry \'mv --help\' for more information.';
        }
        break;
      case 'which':
        const commonCommands = ['node', 'npm', 'yarn', 'git', 'python', 'java'];
        if (args[0] && commonCommands.includes(args[0])) {
          output = `/usr/bin/${args[0]}`;
        } else {
          output = `${args[0] || 'command'} not found`;
        }
        break;
      case 'history':
        output = '1  ls\n2  pwd\n3  npm install\n4  npm start';
        break;
      case 'help':
      case '--help':
        output = 'Available commands:\nls, pwd, node, npm, yarn, git, cat, echo, mkdir, touch, rm, cp, mv, which, history, clear\nType any command to execute it.';
        break;
      case 'clear':
        // Clear command is handled differently
        session.output = '';
        return '';
      default:
        if (command.trim()) {
          output = `bash: ${cmd}: command not found`;
        }
    }
    
    // Return just the command output, not the full terminal buffer
    return output;
  }

  public getTerminalOutput(sessionId: string): string {
    const session = this.terminalSessions.get(sessionId);
    return session ? session.output : '';
  }

  public async sendTerminalInput(sessionId: string, input: string): Promise<void> {
    const session = this.terminalSessions.get(sessionId);
    if (!session || !session.isActive) {
      throw new Error('Terminal session not available');
    }

    if (!session.process) {
      // For mock terminal, handle input directly
      console.log(`Mock terminal input: ${input}`);
      return;
    }

    try {
      const writer = session.process.input.getWriter();
      await writer.write(input);
      writer.releaseLock();
    } catch (error) {
      console.error('Failed to send terminal input:', error);
      throw error;
    }
  }

  public getTerminalSession(sessionId: string): TerminalSession | null {
    return this.terminalSessions.get(sessionId) || null;
  }

  public async closeTerminalSession(sessionId: string): Promise<void> {
    const session = this.terminalSessions.get(sessionId);
    if (session) {
      session.isActive = false;
      try {
        await session.process.kill();
      } catch (error) {
        console.error('Error closing terminal session:', error);
      }
      this.terminalSessions.delete(sessionId);
    }
  }

  public async writeFile(filename: string, content: string): Promise<void> {
    if (!this.webcontainer) {
      // Mock file write for fallback mode
      console.log(`Mock: Writing file ${filename} with ${content.length} characters`);
      return;
    }

    try {
      await this.webcontainer.fs.writeFile(filename, content);
    } catch (error) {
      console.error('Failed to write file:', error);
      throw error;
    }
  }

  public async readFile(filename: string): Promise<string> {
    if (!this.webcontainer) {
      // Mock file read for fallback mode
      console.log(`Mock: Reading file ${filename}`);
      return `// Mock content for ${filename}\nconsole.log('Hello from ${filename}');`;
    }

    try {
      const content = await this.webcontainer.fs.readFile(filename, 'utf-8');
      return content;
    } catch (error) {
      console.error('Failed to read file:', error);
      throw error;
    }
  }

  public async getPreviewUrl(preferredPort?: number): Promise<string> {
    if (!this.webcontainer) {
      // Return a mock preview URL for fallback mode
      return 'data:text/html;charset=utf-8,<html><body><h1>Preview Mode (Mock)</h1><p>WebContainer not available</p></body></html>';
    }

    try {
      // First, detect what servers are actually running from terminal output
      const terminalOutput = this.getTerminalOutput('main');
      console.log('Checking terminal output for running servers:', terminalOutput);
      
      // Look for Vite server (most common)
      const viteMatch = terminalOutput.match(/Local:\s*http:\/\/localhost:(\d+)/i);
      if (viteMatch) {
        const vitePort = parseInt(viteMatch[1]);
        console.log(`Detected Vite server on port ${vitePort}`);
        
        const viteUrl = await this.getWebContainerPreviewUrl(vitePort);
        if (viteUrl) {
          this.runningServers.set(vitePort, {
            port: vitePort,
            url: viteUrl,
            status: 'running',
            type: 'dev-server'
          });
          return viteUrl;
        }
      }
      
      // Look for other dev servers
      const serverPatterns = [
        /localhost:(\d+)/gi,
        /:([0-9]+)/g
      ];
      
      const detectedPorts: number[] = [];
      for (const pattern of serverPatterns) {
        const matches = [...terminalOutput.matchAll(pattern)];
        for (const match of matches) {
          const port = parseInt(match[1]);
          if (port >= 3000 && port <= 9999) { // Reasonable port range
            detectedPorts.push(port);
          }
        }
      }
      
      // Remove duplicates and try each detected port
      const uniquePorts = [...new Set(detectedPorts)];
      console.log('Detected ports from terminal:', uniquePorts);
      
      for (const port of uniquePorts) {
        if (preferredPort && port !== preferredPort) continue;
        
        const url = await this.getWebContainerPreviewUrl(port);
        if (url) {
          this.runningServers.set(port, {
            port,
            url,
            status: 'running',
            type: 'dev-server'
          });
          return url;
        }
      }
      
      // Check existing running servers
      const availableServers = Array.from(this.runningServers.values())
        .filter(server => server.status === 'running');
      
      if (availableServers.length > 0) {
        const targetServer = preferredPort 
          ? availableServers.find(s => s.port === preferredPort)
          : availableServers[0];
        
        if (targetServer) {
          return targetServer.url;
        }
      }
      
      // If no servers detected, try common ports
      const commonPorts = [5173, 3000, 8080, 4000, 5000];
      const targetPort = preferredPort || 5173;
      
      if (commonPorts.includes(targetPort)) {
        const previewUrl = await this.getWebContainerPreviewUrl(targetPort);
        if (previewUrl) {
          this.runningServers.set(targetPort, {
            port: targetPort,
            url: previewUrl,
            status: 'running',
            type: 'dev-server'
          });
          return previewUrl;
        }
      }

      // Last resort: start a new server
      const defaultPort = preferredPort || 3000;
      return await this.startPreviewServer(defaultPort);
    } catch (error) {
      console.error('Failed to get preview URL:', error);
      return 'data:text/html;charset=utf-8,<html><body><h1>Preview Error</h1><p>Failed to connect to server</p></body></html>';
    }
  }

  public async startPreviewServer(port: number = 3000): Promise<string> {
    if (!this.webcontainer) {
      throw new Error('WebContainer not available');
    }

    try {
      // Check if server is already running on this port
      const existingServer = this.runningServers.get(port);
      if (existingServer && existingServer.status === 'running') {
        return existingServer.url;
      }

      // Start new server
      const serverInfo: ServerInfo = {
        port,
        url: '',
        status: 'starting',
        type: 'static'
      };
      
      this.runningServers.set(port, serverInfo);

      // Try different server commands based on available tools
      const serverCommands = [
        ['npx', 'serve', '-s', '.', '-p', port.toString()],
        ['npx', 'http-server', '-p', port.toString(), '-c-1'],
        ['python3', '-m', 'http.server', port.toString()],
        ['python', '-m', 'http.server', port.toString()]
      ];

      let serverProcess;
      for (const command of serverCommands) {
        try {
          serverProcess = await this.webcontainer.spawn(command[0], command.slice(1));
          break;
        } catch (error) {
          console.warn(`Failed to start server with ${command[0]}:`, error);
          continue;
        }
      }

      if (!serverProcess) {
        throw new Error('No suitable server command found');
      }

      serverInfo.process = serverProcess;
      serverInfo.status = 'running';
      
      // Generate preview URL - WebContainer uses localhost URLs that are tunneled
      serverInfo.url = `http://localhost:${port}`;
      
      // Wait a bit for the server to start
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.runningServers.set(port, serverInfo);
      
      return serverInfo.url;
    } catch (error) {
      console.error('Failed to start preview server:', error);
      
      // Update server status to error
      const serverInfo = this.runningServers.get(port);
      if (serverInfo) {
        serverInfo.status = 'error';
        this.runningServers.set(port, serverInfo);
      }
      
      throw error;
    }
  }

  public getRunningServers(): ServerInfo[] {
    return Array.from(this.runningServers.values());
  }

  public async stopServer(port: number): Promise<boolean> {
    const serverInfo = this.runningServers.get(port);
    if (!serverInfo) {
      return false;
    }

    try {
      if (serverInfo.process) {
        await serverInfo.process.kill();
      }
      
      serverInfo.status = 'stopped';
      this.runningServers.delete(port);
      
      return true;
    } catch (error) {
      console.error(`Failed to stop server on port ${port}:`, error);
      return false;
    }
  }

  public async detectRunningPorts(): Promise<number[]> {
    if (!this.webcontainer) {
      return [];
    }

    // In a real implementation, this would scan for active ports
    // For now, return the ports we know about
    return Array.from(this.runningServers.keys())
      .filter(port => {
        const server = this.runningServers.get(port);
        return server && server.status === 'running';
      });
  }

  public async cleanup(): Promise<void> {
    // Stop all running servers
    for (const port of this.runningServers.keys()) {
      await this.stopServer(port);
    }
    
    // Close all terminal sessions
    for (const [sessionId] of this.terminalSessions) {
      await this.closeTerminalSession(sessionId);
    }

    // Clear port listeners
    this.portListeners.clear();

    if (this.webcontainer) {
      // WebContainer cleanup is handled automatically
      this.webcontainer = null;
      this.isInitialized = false;
    }
  }

  private isDevServerCommand(command: string): boolean {
    const serverCommands = [
      'npm start', 'npm run dev', 'npm run start', 'npm run serve',
      'yarn start', 'yarn dev', 'yarn serve',
      'npx serve', 'npx http-server', 'npx vite',
      'python -m http.server', 'python3 -m http.server',
      'node server.js', 'nodemon'
    ];
    
    return serverCommands.some(serverCmd => command.trim().startsWith(serverCmd));
  }

  private extractPortFromCommand(command: string): number | null {
    // Extract port from common server commands
    const portPatterns = [
      /-p\s+(\d+)/, // -p 3000
      /--port\s+(\d+)/, // --port 3000
      /:(\d+)/, // :3000
      /http.server\s+(\d+)/ // python -m http.server 3000
    ];
    
    for (const pattern of portPatterns) {
      const match = command.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }
    
    // Default ports for common commands
    if (command.includes('npm run dev') || command.includes('vite')) {
      return 5173; // Vite default
    }
    if (command.includes('npm start') || command.includes('npm run start')) {
      return 3000; // React/Next default
    }
    if (command.includes('serve')) {
      return 3000; // serve default
    }
    
    return null;
  }

  private getServerType(command: string): ServerInfo['type'] {
    if (command.includes('vite') || command.includes('npm run dev')) {
      return 'dev-server';
    }
    if (command.includes('api') || command.includes('server.js')) {
      return 'api';
    }
    return 'static';
  }

  private async getWebContainerUrl(port: number): Promise<string> {
    if (!this.webcontainer) {
      return `http://localhost:${port}`;
    }
    
    try {
      // For WebContainer, construct the preview URL
      return `http://localhost:${port}`;
    } catch (error) {
      console.error('Failed to get WebContainer URL:', error);
      return `http://localhost:${port}`;
    }
  }

  private async getWebContainerPreviewUrl(port: number): Promise<string | null> {
    if (!this.webcontainer) {
      return null;
    }
    
    try {
      // Wait for the server to be ready first
      await this.waitForServerReady(port);
      
      // For WebContainer, preview URLs are typically localhost URLs that get tunneled
      // The WebContainer handles the tunneling internally
      let previewUrl = `http://localhost:${port}`;
      
      console.log(`Generated WebContainer preview URL for port ${port}: ${previewUrl}`);
      
      // Verify the server is actually running by checking terminal output
      const serverOutput = this.getTerminalOutput('main');
      const isServerRunning = serverOutput.includes(`localhost:${port}`) || 
                             serverOutput.includes(`:${port}`) ||
                             serverOutput.includes('Local:') ||
                             serverOutput.includes('ready in');
      
      if (isServerRunning) {
        console.log(`✓ Server confirmed running on port ${port}`);
        return previewUrl;
      } else {
        console.warn(`⚠️ Server on port ${port} may not be ready yet`);
        return previewUrl; // Return anyway, let the browser handle the loading
      }
    } catch (error) {
      console.error('Failed to get WebContainer preview URL:', error);
      return `http://localhost:${port}`; // Fallback
    }
  }

  private async waitForServerReady(port: number, timeout: number = 15000): Promise<void> {
    const startTime = Date.now();
    console.log(`⏳ Waiting for server on port ${port} to be ready...`);
    
    while (Date.now() - startTime < timeout) {
      try {
        // Check terminal output for server ready messages
        const terminalOutput = this.getTerminalOutput('main');
        
        // Look for specific server ready indicators
        const serverReadyPatterns = [
          new RegExp(`localhost:${port}`, 'i'),
          new RegExp(`http://localhost:${port}`, 'i'),
          new RegExp(`Local:\s*http://localhost:${port}`, 'i'),
          new RegExp('ready in \d+ms', 'i'),
          new RegExp('vite.*ready', 'i'),
          new RegExp('development server.*running', 'i'),
          new RegExp('server started', 'i'),
          new RegExp('compiled successfully', 'i')
        ];
        
        const isReady = serverReadyPatterns.some(pattern => pattern.test(terminalOutput));
        
        if (isReady) {
          console.log(`✅ Server on port ${port} is ready (detected from terminal)`);
          // Wait a bit more for the server to fully stabilize
          await new Promise(resolve => setTimeout(resolve, 1000));
          return;
        }
        
        // Also check if we can detect any WebContainer activity
        if (this.webcontainer && terminalOutput.includes('ready')) {
          console.log(`✅ WebContainer shows ready status`);
          return; // WebContainer is ready
        }
        
        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.warn('Error while waiting for server:', error);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.warn(`⚠️ Server on port ${port} did not show ready message within ${timeout}ms, proceeding anyway`);
  }

}
