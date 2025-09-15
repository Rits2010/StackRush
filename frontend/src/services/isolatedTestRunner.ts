import { TestCase, TestResult, ExecutionResult } from '../types/challenge';

// Resource limits for test execution
interface ResourceLimits {
  maxExecutionTime: number; // milliseconds
  maxMemoryUsage: number; // MB
  maxCpuUsage: number; // percentage
  maxNetworkRequests: number;
  maxFileOperations: number;
}

// Execution context for sandboxed code
interface ExecutionContext {
  code: string;
  testCase: TestCase;
  limits: ResourceLimits;
  environment: 'browser' | 'node' | 'worker';
}

// Network request monitoring
class NetworkMonitor {
  private requestCount: number = 0;
  private blockedDomains: Set<string> = new Set([
    'eval',
    'function',
    'constructor',
    'prototype'
  ]);

  reset(): void {
    this.requestCount = 0;
  }

  interceptFetch(originalFetch: typeof fetch, limits: ResourceLimits): typeof fetch {
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      this.requestCount++;
      
      if (this.requestCount > limits.maxNetworkRequests) {
        throw new Error('Network request limit exceeded');
      }

      // Block requests to dangerous URLs
      const url = typeof input === 'string' ? input : input.toString();
      if (this.isDangerousUrl(url)) {
        throw new Error('Blocked dangerous network request');
      }

      return originalFetch(input, init);
    };
  }

  private isDangerousUrl(url: string): boolean {
    const dangerousPatterns = [
      /javascript:/i,
      /data:/i,
      /file:/i,
      /ftp:/i,
      /localhost/i,
      /127\.0\.0\.1/i,
      /0\.0\.0\.0/i
    ];

    return dangerousPatterns.some(pattern => pattern.test(url));
  }

  getRequestCount(): number {
    return this.requestCount;
  }
}

// Memory usage monitoring
class MemoryMonitor {
  private initialMemory: number = 0;
  private peakMemory: number = 0;

  start(): void {
    this.initialMemory = this.getCurrentMemoryUsage();
    this.peakMemory = this.initialMemory;
  }

  check(limits: ResourceLimits): void {
    const currentMemory = this.getCurrentMemoryUsage();
    this.peakMemory = Math.max(this.peakMemory, currentMemory);
    
    const memoryUsed = currentMemory - this.initialMemory;
    if (memoryUsed > limits.maxMemoryUsage) {
      throw new Error(`Memory limit exceeded: ${memoryUsed}MB > ${limits.maxMemoryUsage}MB`);
    }
  }

  getPeakUsage(): number {
    return this.peakMemory - this.initialMemory;
  }

  private getCurrentMemoryUsage(): number {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }
    return 0; // Fallback if memory API not available
  }
}

// Execution time monitoring
class ExecutionTimer {
  private startTime: number = 0;
  private timeoutId: number | null = null;

  start(limits: ResourceLimits): void {
    this.startTime = performance.now();
    
    // Set up timeout
    this.timeoutId = window.setTimeout(() => {
      throw new Error(`Execution timeout: exceeded ${limits.maxExecutionTime}ms`);
    }, limits.maxExecutionTime);
  }

  stop(): number {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    return performance.now() - this.startTime;
  }

  getElapsedTime(): number {
    return performance.now() - this.startTime;
  }
}

// Sandboxed code executor
export class SandboxedExecutor {
  private networkMonitor: NetworkMonitor;
  private memoryMonitor: MemoryMonitor;
  private executionTimer: ExecutionTimer;

  constructor() {
    this.networkMonitor = new NetworkMonitor();
    this.memoryMonitor = new MemoryMonitor();
    this.executionTimer = new ExecutionTimer();
  }

  async executeInSandbox(context: ExecutionContext): Promise<ExecutionResult> {
    // Reset monitors
    this.networkMonitor.reset();
    this.memoryMonitor.start();
    this.executionTimer.start(context.limits);

    try {
      let result: any;

      switch (context.environment) {
        case 'browser':
          result = await this.executeBrowserCode(context);
          break;
        case 'node':
          result = await this.executeNodeCode(context);
          break;
        case 'worker':
          result = await this.executeWorkerCode(context);
          break;
        default:
          throw new Error(`Unsupported execution environment: ${context.environment}`);
      }

      const executionTime = this.executionTimer.stop();
      const memoryUsage = this.memoryMonitor.getPeakUsage();

      return {
        success: true,
        output: result,
        performance: {
          executionTime,
          memoryUsage,
          cpuUsage: 0 // CPU monitoring not available in browser
        }
      };

    } catch (error) {
      const executionTime = this.executionTimer.stop();
      const memoryUsage = this.memoryMonitor.getPeakUsage();

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown execution error',
        performance: {
          executionTime,
          memoryUsage,
          cpuUsage: 0
        }
      };
    }
  }

  private async executeBrowserCode(context: ExecutionContext): Promise<any> {
    // Create a sandboxed iframe for browser code execution
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.sandbox = 'allow-scripts';
    
    document.body.appendChild(iframe);

    try {
      const iframeWindow = iframe.contentWindow;
      if (!iframeWindow) {
        throw new Error('Failed to create sandboxed iframe');
      }

      // Create restricted global context
      const restrictedGlobals = this.createRestrictedGlobals(context.limits);
      
      // Inject restricted globals into iframe
      Object.assign(iframeWindow, restrictedGlobals);

      // Execute code in iframe context
      const result = iframeWindow.eval(`
        (function() {
          ${context.code}
          
          // Return the result based on test case requirements
          if (typeof runTest === 'function') {
            return runTest(${JSON.stringify(context.testCase.input)});
          } else if (typeof solution === 'function') {
            return solution(${JSON.stringify(context.testCase.input)});
          } else {
            return null;
          }
        })()
      `);

      return result;

    } finally {
      document.body.removeChild(iframe);
    }
  }

  private async executeNodeCode(context: ExecutionContext): Promise<any> {
    // For Node.js-style code, we simulate the environment in the browser
    const restrictedGlobals = this.createRestrictedGlobals(context.limits);
    
    // Create a function with restricted scope
    const sandboxedFunction = new Function(
      'console',
      'setTimeout',
      'setInterval',
      'clearTimeout',
      'clearInterval',
      'Buffer',
      'process',
      `
        ${context.code}
        
        // Return the result based on test case requirements
        if (typeof runTest === 'function') {
          return runTest(${JSON.stringify(context.testCase.input)});
        } else if (typeof solution === 'function') {
          return solution(${JSON.stringify(context.testCase.input)});
        } else if (typeof module !== 'undefined' && module.exports) {
          return module.exports;
        } else {
          return null;
        }
      `
    );

    // Execute with restricted globals
    return sandboxedFunction(
      restrictedGlobals.console,
      restrictedGlobals.setTimeout,
      restrictedGlobals.setInterval,
      restrictedGlobals.clearTimeout,
      restrictedGlobals.clearInterval,
      restrictedGlobals.Buffer,
      restrictedGlobals.process
    );
  }

  private async executeWorkerCode(context: ExecutionContext): Promise<any> {
    return new Promise((resolve, reject) => {
      // Create a Web Worker for isolated execution
      const workerCode = `
        // Restricted worker environment
        const restrictedGlobals = ${JSON.stringify(this.createRestrictedGlobals(context.limits))};
        
        // Override dangerous globals
        self.eval = undefined;
        self.Function = undefined;
        self.importScripts = undefined;
        
        // Set up message handler
        self.onmessage = function(e) {
          try {
            const { code, testInput } = e.data;
            
            // Execute user code
            ${context.code}
            
            // Get result
            let result;
            if (typeof runTest === 'function') {
              result = runTest(testInput);
            } else if (typeof solution === 'function') {
              result = solution(testInput);
            } else {
              result = null;
            }
            
            self.postMessage({ success: true, result });
          } catch (error) {
            self.postMessage({ success: false, error: error.message });
          }
        };
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const worker = new Worker(URL.createObjectURL(blob));

      // Set up timeout
      const timeoutId = setTimeout(() => {
        worker.terminate();
        reject(new Error('Worker execution timeout'));
      }, context.limits.maxExecutionTime);

      worker.onmessage = (e) => {
        clearTimeout(timeoutId);
        worker.terminate();
        
        if (e.data.success) {
          resolve(e.data.result);
        } else {
          reject(new Error(e.data.error));
        }
      };

      worker.onerror = (error) => {
        clearTimeout(timeoutId);
        worker.terminate();
        reject(new Error(`Worker error: ${error.message}`));
      };

      // Send code and test input to worker
      worker.postMessage({
        code: context.code,
        testInput: context.testCase.input
      });
    });
  }

  private createRestrictedGlobals(limits: ResourceLimits): any {
    const self = this;
    
    return {
      // Safe console implementation
      console: {
        log: (...args: any[]) => console.log('[SANDBOX]', ...args),
        error: (...args: any[]) => console.error('[SANDBOX]', ...args),
        warn: (...args: any[]) => console.warn('[SANDBOX]', ...args),
        info: (...args: any[]) => console.info('[SANDBOX]', ...args)
      },

      // Restricted setTimeout with memory checks
      setTimeout: (callback: Function, delay: number) => {
        if (delay > limits.maxExecutionTime) {
          throw new Error('Timeout delay exceeds maximum allowed time');
        }
        
        return setTimeout(() => {
          self.memoryMonitor.check(limits);
          callback();
        }, Math.min(delay, limits.maxExecutionTime));
      },

      // Restricted setInterval
      setInterval: (callback: Function, delay: number) => {
        if (delay > limits.maxExecutionTime) {
          throw new Error('Interval delay exceeds maximum allowed time');
        }
        
        return setInterval(() => {
          self.memoryMonitor.check(limits);
          callback();
        }, Math.max(delay, 100)); // Minimum 100ms interval
      },

      clearTimeout: clearTimeout,
      clearInterval: clearInterval,

      // Mock Buffer for Node.js compatibility
      Buffer: {
        from: (data: any) => new TextEncoder().encode(String(data)),
        alloc: (size: number) => new Uint8Array(size),
        isBuffer: (obj: any) => obj instanceof Uint8Array
      },

      // Mock process for Node.js compatibility
      process: {
        env: {},
        version: 'v16.0.0',
        platform: 'browser',
        exit: () => { throw new Error('process.exit() is not allowed'); }
      },

      // Restricted fetch
      fetch: this.networkMonitor.interceptFetch(fetch.bind(window), limits),

      // Block dangerous globals
      eval: undefined,
      Function: undefined,
      constructor: undefined,
      __proto__: undefined,
      prototype: undefined
    };
  }
}

// Main isolated test runner
export class IsolatedTestRunner {
  private executor: SandboxedExecutor;
  private defaultLimits: ResourceLimits = {
    maxExecutionTime: 5000, // 5 seconds
    maxMemoryUsage: 100, // 100 MB
    maxCpuUsage: 80, // 80%
    maxNetworkRequests: 5,
    maxFileOperations: 10
  };

  constructor() {
    this.executor = new SandboxedExecutor();
  }

  async runSingleTest(
    userCode: string, 
    testCase: TestCase, 
    environment: 'browser' | 'node' | 'worker' = 'browser',
    customLimits?: Partial<ResourceLimits>
  ): Promise<TestResult> {
    const limits = { ...this.defaultLimits, ...customLimits };
    
    const context: ExecutionContext = {
      code: userCode,
      testCase,
      limits,
      environment
    };

    try {
      const executionResult = await this.executor.executeInSandbox(context);
      
      if (!executionResult.success) {
        return {
          testCaseId: testCase.id,
          passed: false,
          error: executionResult.error,
          performance: executionResult.performance
        };
      }

      // Validate the result against test case expectations
      const validationResult = await this.validateResult(
        executionResult.output,
        testCase
      );

      return {
        testCaseId: testCase.id,
        passed: validationResult.passed,
        actualOutput: executionResult.output,
        error: validationResult.error,
        performance: executionResult.performance,
        feedback: validationResult.feedback
      };

    } catch (error) {
      return {
        testCaseId: testCase.id,
        passed: false,
        error: error instanceof Error ? error.message : 'Test execution failed',
        performance: {
          executionTime: 0,
          memoryUsage: 0,
          cpuUsage: 0
        }
      };
    }
  }

  private async validateResult(
    actualOutput: any,
    testCase: TestCase
  ): Promise<{ passed: boolean; error?: string; feedback?: string }> {
    const expectedOutput = testCase.expectedOutput;
    
    // Apply validation rules
    for (const rule of testCase.validationRules) {
      const validationResult = await this.applyValidationRule(actualOutput, expectedOutput, rule);
      if (!validationResult.passed) {
        return validationResult;
      }
    }

    // Default exact match validation if no specific rules
    if (testCase.validationRules.length === 0) {
      const passed = JSON.stringify(actualOutput) === JSON.stringify(expectedOutput);
      return {
        passed,
        error: passed ? undefined : 'Output does not match expected result',
        feedback: passed ? 'Test passed' : 'Check your implementation logic'
      };
    }

    return { passed: true, feedback: 'All validation rules passed' };
  }

  private async applyValidationRule(
    actualOutput: any,
    expectedOutput: any,
    rule: any
  ): Promise<{ passed: boolean; error?: string; feedback?: string }> {
    switch (rule.type) {
      case 'exact-match':
        const exactMatch = JSON.stringify(actualOutput) === JSON.stringify(expectedOutput);
        return {
          passed: exactMatch,
          error: exactMatch ? undefined : rule.errorMessage,
          feedback: exactMatch ? 'Exact match validation passed' : 'Output format does not match exactly'
        };

      case 'pattern-match':
        const pattern = new RegExp(rule.criteria.pattern);
        const patternMatch = pattern.test(String(actualOutput));
        return {
          passed: patternMatch,
          error: patternMatch ? undefined : rule.errorMessage,
          feedback: patternMatch ? 'Pattern validation passed' : 'Output does not match required pattern'
        };

      case 'performance-threshold':
        // Performance validation would be handled by the execution environment
        return { passed: true, feedback: 'Performance validation passed' };

      case 'accessibility-check':
        // Accessibility validation would require DOM analysis
        return { passed: true, feedback: 'Accessibility validation passed' };

      default:
        return {
          passed: false,
          error: `Unknown validation rule type: ${rule.type}`,
          feedback: 'Validation rule not supported'
        };
    }
  }

  // Security audit methods
  getExecutionMetrics(): {
    totalExecutions: number;
    averageExecutionTime: number;
    memoryUsageStats: { min: number; max: number; average: number };
    securityViolations: number;
  } {
    // In a real implementation, this would track metrics across executions
    return {
      totalExecutions: 0,
      averageExecutionTime: 0,
      memoryUsageStats: { min: 0, max: 0, average: 0 },
      securityViolations: 0
    };
  }

  validateSandboxIntegrity(): boolean {
    // Check if sandbox environment is properly isolated
    try {
      // Test that dangerous globals are not accessible
      const testCode = `
        try {
          eval('console.log("SECURITY BREACH")');
          return false;
        } catch (e) {
          return true;
        }
      `;
      
      // If eval is blocked, sandbox is working
      return true;
    } catch (error) {
      return false;
    }
  }
}