import { Challenge, ChallengeType, ExecutionResult, TestResult } from '../types/challenge';

export interface EnvironmentCapabilities {
  hasPreview: boolean;
  hasApiTesting: boolean;
  hasCodeExecution: boolean;
  hasDatabase: boolean;
  supportedLanguages: string[];
  maxExecutionTime: number;
  maxMemoryUsage: number;
}

export class ChallengeEnvironmentManager {
  private static environments: Map<ChallengeType, EnvironmentCapabilities> = new Map([
    ['frontend', {
      hasPreview: true,
      hasApiTesting: false,
      hasCodeExecution: true,
      hasDatabase: false,
      supportedLanguages: ['html', 'css', 'javascript', 'typescript', 'react'],
      maxExecutionTime: 10000,
      maxMemoryUsage: 512
    }],
    ['backend-api', {
      hasPreview: false,
      hasApiTesting: true,
      hasCodeExecution: true,
      hasDatabase: true,
      supportedLanguages: ['javascript', 'typescript', 'python', 'java'],
      maxExecutionTime: 30000,
      maxMemoryUsage: 1024
    }],
    ['dsa', {
      hasPreview: false,
      hasApiTesting: false,
      hasCodeExecution: true,
      hasDatabase: false,
      supportedLanguages: ['javascript', 'python', 'java', 'cpp'],
      maxExecutionTime: 5000,
      maxMemoryUsage: 256
    }]
  ]);

  static getEnvironmentCapabilities(type: ChallengeType): EnvironmentCapabilities {
    const capabilities = this.environments.get(type);
    if (!capabilities) {
      throw new Error(`Unsupported challenge type: ${type}`);
    }
    return capabilities;
  }

  static validateChallengeEnvironment(challenge: Challenge): boolean {
    const capabilities = this.getEnvironmentCapabilities(challenge.type);
    
    // Check if required features are supported
    if (challenge.type === 'frontend' && !capabilities.hasPreview) {
      return false;
    }
    
    if (challenge.type === 'backend-api' && (!capabilities.hasApiTesting || !capabilities.hasDatabase)) {
      return false;
    }
    
    if (challenge.type === 'dsa' && !capabilities.hasCodeExecution) {
      return false;
    }
    
    // Check language support
    const requiredLanguage = challenge.implementation.environment.runtime;
    if (!capabilities.supportedLanguages.includes(requiredLanguage)) {
      return false;
    }
    
    return true;
  }

  static getExecutionEnvironment(challenge: Challenge): ExecutionEnvironment {
    const capabilities = this.getEnvironmentCapabilities(challenge.type);
    
    switch (challenge.type) {
      case 'frontend':
        return new FrontendExecutionEnvironment(challenge, capabilities);
      case 'backend-api':
        return new BackendExecutionEnvironment(challenge, capabilities);
      case 'dsa':
        return new DSAExecutionEnvironment(challenge, capabilities);
      default:
        throw new Error(`Unsupported challenge type: ${challenge.type}`);
    }
  }
}

export abstract class ExecutionEnvironment {
  protected challenge: Challenge;
  protected capabilities: EnvironmentCapabilities;

  constructor(challenge: Challenge, capabilities: EnvironmentCapabilities) {
    this.challenge = challenge;
    this.capabilities = capabilities;
  }

  abstract initialize(): Promise<void>;
  abstract executeCode(code: string, language: string): Promise<ExecutionResult>;
  abstract runTests(code: string): Promise<TestResult[]>;
  abstract cleanup(): Promise<void>;

  protected validateExecution(code: string, language: string): void {
    if (!this.capabilities.supportedLanguages.includes(language)) {
      throw new Error(`Language ${language} not supported in this environment`);
    }

    if (code.length > 100000) { // 100KB limit
      throw new Error('Code size exceeds maximum limit');
    }
  }

  protected createSafeExecutionContext(): any {
    // Create a sandboxed execution context
    return {
      console: {
        log: (...args: any[]) => console.log('[USER]', ...args),
        error: (...args: any[]) => console.error('[USER]', ...args),
        warn: (...args: any[]) => console.warn('[USER]', ...args)
      },
      setTimeout: (fn: Function, delay: number) => {
        if (delay > this.capabilities.maxExecutionTime) {
          throw new Error('Timeout exceeds maximum allowed time');
        }
        return setTimeout(fn, Math.min(delay, this.capabilities.maxExecutionTime));
      },
      // Disable dangerous globals
      eval: undefined,
      Function: undefined,
      require: undefined,
      process: undefined,
      global: undefined,
      window: undefined
    };
  }
}

export class FrontendExecutionEnvironment extends ExecutionEnvironment {
  private previewFrame: HTMLIFrameElement | null = null;
  private previewContainer: HTMLElement | null = null;

  async initialize(): Promise<void> {
    // Set up preview iframe for frontend challenges
    this.previewContainer = document.createElement('div');
    this.previewContainer.className = 'frontend-preview-container';
    
    this.previewFrame = document.createElement('iframe');
    this.previewFrame.className = 'frontend-preview-frame';
    this.previewFrame.sandbox = 'allow-scripts allow-same-origin';
    this.previewFrame.style.width = '100%';
    this.previewFrame.style.height = '100%';
    this.previewFrame.style.border = 'none';
    
    this.previewContainer.appendChild(this.previewFrame);
  }

  async executeCode(code: string, language: string): Promise<ExecutionResult> {
    this.validateExecution(code, language);

    try {
      const startTime = performance.now();
      
      if (language === 'html' || language === 'react') {
        await this.renderInPreview(code, language);
      } else if (language === 'javascript' || language === 'typescript') {
        await this.executeJavaScript(code);
      }
      
      const executionTime = performance.now() - startTime;
      
      return {
        success: true,
        performance: {
          executionTime,
          memoryUsage: this.estimateMemoryUsage(),
          cpuUsage: 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async runTests(code: string): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    for (const testCase of this.challenge.testing.testCases) {
      try {
        const startTime = performance.now();
        
        let passed = false;
        let actualOutput: any = null;
        
        if (testCase.type === 'visual') {
          passed = await this.runVisualTest(code, testCase);
        } else if (testCase.type === 'accessibility') {
          passed = await this.runAccessibilityTest(code, testCase);
        } else if (testCase.type === 'performance') {
          const perfResult = await this.runPerformanceTest(code, testCase);
          passed = perfResult.passed;
          actualOutput = perfResult.metrics;
        }
        
        const executionTime = performance.now() - startTime;
        
        results.push({
          testCaseId: testCase.id,
          passed,
          actualOutput,
          performance: {
            executionTime,
            memoryUsage: this.estimateMemoryUsage()
          },
          feedback: passed ? 'Test passed' : 'Test failed - check implementation'
        });
      } catch (error) {
        results.push({
          testCaseId: testCase.id,
          passed: false,
          error: error instanceof Error ? error.message : 'Test execution failed',
          performance: {
            executionTime: 0,
            memoryUsage: 0
          }
        });
      }
    }
    
    return results;
  }

  async cleanup(): Promise<void> {
    if (this.previewFrame) {
      this.previewFrame.remove();
      this.previewFrame = null;
    }
    if (this.previewContainer) {
      this.previewContainer.remove();
      this.previewContainer = null;
    }
  }

  getPreviewContainer(): HTMLElement | null {
    return this.previewContainer;
  }

  private async renderInPreview(code: string, language: string): Promise<void> {
    if (!this.previewFrame) {
      throw new Error('Preview frame not initialized');
    }

    const doc = this.previewFrame.contentDocument;
    if (!doc) {
      throw new Error('Cannot access preview frame document');
    }

    if (language === 'html') {
      doc.open();
      doc.write(code);
      doc.close();
    } else if (language === 'react') {
      // For React components, we'd need to set up a React environment
      // This is a simplified version
      const htmlWrapper = `
        <!DOCTYPE html>
        <html>
        <head>
          <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            ${code}
          </script>
        </body>
        </html>
      `;
      doc.open();
      doc.write(htmlWrapper);
      doc.close();
    }
  }

  private async executeJavaScript(code: string): Promise<void> {
    const context = this.createSafeExecutionContext();
    
    // Create a function with the safe context
    const wrappedCode = `
      (function(console, setTimeout) {
        ${code}
      })(context.console, context.setTimeout);
    `;
    
    // Execute in a try-catch to handle errors
    try {
      eval(wrappedCode);
    } catch (error) {
      throw new Error(`JavaScript execution error: ${error}`);
    }
  }

  private async runVisualTest(code: string, testCase: any): Promise<boolean> {
    // Simplified visual testing - in a real implementation, this would use
    // tools like Puppeteer or Playwright for visual regression testing
    if (!this.previewFrame) return false;
    
    const doc = this.previewFrame.contentDocument;
    if (!doc) return false;
    
    // Check for basic DOM structure based on test criteria
    const criteria = testCase.validationRules[0]?.criteria;
    if (criteria?.selector) {
      const element = doc.querySelector(criteria.selector);
      if (!element) return false;
      
      if (criteria.property && criteria.value) {
        const computedStyle = this.previewFrame.contentWindow?.getComputedStyle(element);
        return computedStyle?.getPropertyValue(criteria.property) === criteria.value;
      }
    }
    
    return true;
  }

  private async runAccessibilityTest(code: string, testCase: any): Promise<boolean> {
    // Simplified accessibility testing
    if (!this.previewFrame) return false;
    
    const doc = this.previewFrame.contentDocument;
    if (!doc) return false;
    
    const criteria = testCase.validationRules[0]?.criteria;
    
    if (criteria?.rule === 'img-alt') {
      const images = doc.querySelectorAll('img');
      for (const img of images) {
        if (!img.getAttribute('alt')) {
          return false;
        }
      }
    }
    
    if (criteria?.rule === 'keyboard-navigation') {
      const interactiveElements = doc.querySelectorAll('button, a, input, select, textarea');
      for (const element of interactiveElements) {
        if (!element.hasAttribute('tabindex') && element.tagName.toLowerCase() !== 'button' && element.tagName.toLowerCase() !== 'a') {
          // Check if element is naturally focusable or has tabindex
          const tabIndex = element.getAttribute('tabindex');
          if (tabIndex === '-1') return false;
        }
      }
    }
    
    return true;
  }

  private async runPerformanceTest(code: string, testCase: any): Promise<{ passed: boolean; metrics: any }> {
    const startTime = performance.now();
    
    try {
      await this.executeCode(code, 'javascript');
      const loadTime = performance.now() - startTime;
      
      const criteria = testCase.validationRules[0]?.criteria;
      const threshold = criteria?.threshold || 3000;
      
      return {
        passed: loadTime < threshold,
        metrics: {
          loadTime,
          threshold
        }
      };
    } catch (error) {
      return {
        passed: false,
        metrics: {
          error: error instanceof Error ? error.message : 'Performance test failed'
        }
      };
    }
  }

  private estimateMemoryUsage(): number {
    // Simplified memory usage estimation
    if (this.previewFrame?.contentDocument) {
      const elements = this.previewFrame.contentDocument.querySelectorAll('*');
      return elements.length * 0.1; // Rough estimate: 0.1KB per element
    }
    return 0;
  }
}

export class BackendExecutionEnvironment extends ExecutionEnvironment {
  private apiServer: any = null;
  private database: any = null;

  async initialize(): Promise<void> {
    // Initialize API testing environment and database
    await this.setupDatabase();
    await this.setupApiServer();
  }

  async executeCode(code: string, language: string): Promise<ExecutionResult> {
    this.validateExecution(code, language);

    try {
      const startTime = performance.now();
      
      // For backend code, we'd typically start a server and test endpoints
      // This is a simplified implementation
      const result = await this.executeServerCode(code, language);
      
      const executionTime = performance.now() - startTime;
      
      return {
        success: true,
        output: result,
        performance: {
          executionTime,
          memoryUsage: this.estimateMemoryUsage(),
          cpuUsage: 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async runTests(code: string): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    for (const testCase of this.challenge.testing.testCases) {
      try {
        const startTime = performance.now();
        
        let passed = false;
        let actualOutput: any = null;
        
        if (testCase.type === 'integration') {
          const result = await this.runIntegrationTest(code, testCase);
          passed = result.passed;
          actualOutput = result.response;
        } else if (testCase.type === 'unit') {
          passed = await this.runUnitTest(code, testCase);
        }
        
        const executionTime = performance.now() - startTime;
        
        results.push({
          testCaseId: testCase.id,
          passed,
          actualOutput,
          performance: {
            executionTime,
            memoryUsage: this.estimateMemoryUsage()
          },
          feedback: passed ? 'Test passed' : 'Test failed - check API implementation'
        });
      } catch (error) {
        results.push({
          testCaseId: testCase.id,
          passed: false,
          error: error instanceof Error ? error.message : 'Test execution failed',
          performance: {
            executionTime: 0,
            memoryUsage: 0
          }
        });
      }
    }
    
    return results;
  }

  async cleanup(): Promise<void> {
    if (this.apiServer) {
      // Stop API server
      this.apiServer = null;
    }
    if (this.database) {
      // Close database connections
      this.database = null;
    }
  }

  private async setupDatabase(): Promise<void> {
    // Set up isolated database for the challenge
    const dbConfig = this.challenge.implementation.environment.database;
    if (dbConfig) {
      // In a real implementation, this would create an isolated database instance
      this.database = {
        type: dbConfig.type,
        connected: true,
        seedData: dbConfig.seedData || []
      };
    }
  }

  private async setupApiServer(): Promise<void> {
    // Set up API server for testing
    this.apiServer = {
      running: false,
      port: this.challenge.implementation.environment.ports?.[0] || 3001
    };
  }

  private async executeServerCode(code: string, language: string): Promise<any> {
    // Simplified server code execution
    // In a real implementation, this would start the server in a container
    const context = this.createSafeExecutionContext();
    
    try {
      // Mock execution result
      return {
        serverStarted: true,
        port: this.apiServer?.port,
        endpoints: this.extractEndpoints(code)
      };
    } catch (error) {
      throw new Error(`Server execution error: ${error}`);
    }
  }

  private extractEndpoints(code: string): string[] {
    // Simple regex to extract API endpoints from Express-style code
    const endpointRegex = /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
    const endpoints: string[] = [];
    let match;
    
    while ((match = endpointRegex.exec(code)) !== null) {
      endpoints.push(`${match[1].toUpperCase()} ${match[2]}`);
    }
    
    return endpoints;
  }

  private async runIntegrationTest(code: string, testCase: any): Promise<{ passed: boolean; response?: any }> {
    // Simplified integration test
    const input = testCase.input;
    const expected = testCase.expectedOutput;
    
    try {
      // Mock API call
      const response = await this.mockApiCall(input.method, input.endpoint, input.body);
      
      const passed = response.status === expected.status;
      
      return {
        passed,
        response
      };
    } catch (error) {
      return {
        passed: false,
        response: { error: error instanceof Error ? error.message : 'API call failed' }
      };
    }
  }

  private async runUnitTest(code: string, testCase: any): Promise<boolean> {
    // Simplified unit test - check for security vulnerabilities
    const input = testCase.input;
    
    if (input.body && typeof input.body.amount === 'string' && input.body.amount.includes('DROP TABLE')) {
      // Check if code properly validates input to prevent SQL injection
      return code.includes('Joi.') || code.includes('validate') || code.includes('sanitize');
    }
    
    return true;
  }

  private async mockApiCall(method: string, endpoint: string, body?: any): Promise<any> {
    // Mock API response based on the endpoint and method
    if (method === 'POST' && endpoint.includes('/payments/process')) {
      if (body && body.amount && body.cardNumber) {
        return {
          status: 200,
          body: {
            transactionId: 'mock_transaction_123',
            status: 'completed'
          }
        };
      } else {
        return {
          status: 400,
          body: {
            error: 'Validation failed'
          }
        };
      }
    }
    
    return {
      status: 404,
      body: {
        error: 'Endpoint not found'
      }
    };
  }

  private estimateMemoryUsage(): number {
    // Simplified memory usage estimation for backend
    return 50; // Mock value in MB
  }
}

export class DSAExecutionEnvironment extends ExecutionEnvironment {
  async initialize(): Promise<void> {
    // DSA environment doesn't need special setup
  }

  async executeCode(code: string, language: string): Promise<ExecutionResult> {
    this.validateExecution(code, language);

    try {
      const startTime = performance.now();
      const startMemory = this.getMemoryUsage();
      
      const result = await this.executeAlgorithm(code, language);
      
      const executionTime = performance.now() - startTime;
      const memoryUsage = this.getMemoryUsage() - startMemory;
      
      return {
        success: true,
        output: result,
        performance: {
          executionTime,
          memoryUsage,
          cpuUsage: 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async runTests(code: string): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    for (const testCase of this.challenge.testing.testCases) {
      try {
        const startTime = performance.now();
        const startMemory = this.getMemoryUsage();
        
        const result = await this.runAlgorithmTest(code, testCase);
        
        const executionTime = performance.now() - startTime;
        const memoryUsage = this.getMemoryUsage() - startMemory;
        
        results.push({
          testCaseId: testCase.id,
          passed: result.passed,
          actualOutput: result.output,
          performance: {
            executionTime,
            memoryUsage
          },
          feedback: result.passed ? 'Test passed' : result.feedback || 'Test failed'
        });
      } catch (error) {
        results.push({
          testCaseId: testCase.id,
          passed: false,
          error: error instanceof Error ? error.message : 'Test execution failed',
          performance: {
            executionTime: 0,
            memoryUsage: 0
          }
        });
      }
    }
    
    return results;
  }

  async cleanup(): Promise<void> {
    // DSA environment doesn't need cleanup
  }

  private async executeAlgorithm(code: string, language: string): Promise<any> {
    const context = this.createSafeExecutionContext();
    
    if (language === 'javascript') {
      try {
        // Execute the algorithm code
        const result = eval(`
          (function() {
            ${code}
            // Return the main function or class for testing
            if (typeof AnalyticsEngine !== 'undefined') return AnalyticsEngine;
            if (typeof solution !== 'undefined') return solution;
            return null;
          })()
        `);
        
        return result;
      } catch (error) {
        throw new Error(`Algorithm execution error: ${error}`);
      }
    }
    
    throw new Error(`Language ${language} not supported for DSA challenges`);
  }

  private async runAlgorithmTest(code: string, testCase: any): Promise<{ passed: boolean; output?: any; feedback?: string }> {
    try {
      const algorithm = await this.executeAlgorithm(code, 'javascript');
      
      if (testCase.type === 'performance') {
        return this.runPerformanceTest(algorithm, testCase);
      } else if (testCase.type === 'unit') {
        return this.runCorrectnessTest(algorithm, testCase);
      }
      
      return { passed: false, feedback: 'Unknown test type' };
    } catch (error) {
      return {
        passed: false,
        feedback: error instanceof Error ? error.message : 'Test execution failed'
      };
    }
  }

  private runPerformanceTest(algorithm: any, testCase: any): { passed: boolean; output?: any; feedback?: string } {
    const input = testCase.input;
    const expected = testCase.expectedOutput;
    
    try {
      const startTime = performance.now();
      
      // For analytics engine test
      if (algorithm && typeof algorithm === 'function') {
        const engine = new algorithm();
        const testData = this.generateTestData(input.recordCount || 1000000);
        engine.loadData(testData);
        
        const result = engine.getDailyActiveUsers(
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          new Date()
        );
        
        const executionTime = performance.now() - startTime;
        const passed = executionTime < (expected.executionTime || 1000);
        
        return {
          passed,
          output: { executionTime, resultSize: Object.keys(result).length },
          feedback: passed ? 'Performance test passed' : `Execution time ${executionTime}ms exceeds limit`
        };
      }
      
      return { passed: false, feedback: 'Algorithm not found or invalid' };
    } catch (error) {
      return {
        passed: false,
        feedback: error instanceof Error ? error.message : 'Performance test failed'
      };
    }
  }

  private runCorrectnessTest(algorithm: any, testCase: any): { passed: boolean; output?: any; feedback?: string } {
    const input = testCase.input;
    const expected = testCase.expectedOutput;
    
    try {
      if (algorithm && typeof algorithm === 'function') {
        const engine = new algorithm();
        engine.loadData(input.records);
        
        const result = engine.getDailyActiveUsers(input.startDate, input.endDate);
        
        // Compare result with expected output
        const passed = JSON.stringify(result) === JSON.stringify(expected);
        
        return {
          passed,
          output: result,
          feedback: passed ? 'Correctness test passed' : 'Output does not match expected result'
        };
      }
      
      return { passed: false, feedback: 'Algorithm not found or invalid' };
    } catch (error) {
      return {
        passed: false,
        feedback: error instanceof Error ? error.message : 'Correctness test failed'
      };
    }
  }

  private generateTestData(count: number): any[] {
    const data = [];
    const userIds = Array.from({length: Math.min(count / 100, 1000)}, (_, i) => `user_${i}`);
    
    for (let i = 0; i < count; i++) {
      const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      data.push({
        userId: userIds[Math.floor(Math.random() * userIds.length)],
        timestamp: timestamp.toISOString(),
        action: 'login'
      });
    }
    
    return data;
  }

  private getMemoryUsage(): number {
    // Simplified memory usage estimation
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }
}