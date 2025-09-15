import { TestCase, TestResult, ExecutionResult } from '../types/challenge';

export interface DSAExecutionConfig {
  timeLimit: number; // milliseconds
  memoryLimit: number; // MB
  language: 'javascript' | 'python' | 'java' | 'cpp';
}

export interface ComplexityAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  actualTime: number;
  actualMemory: number;
  efficiency: 'optimal' | 'good' | 'poor';
}

export class DSAExecutor {
  private config: DSAExecutionConfig;

  constructor(config: DSAExecutionConfig) {
    this.config = config;
  }

  async executeCode(code: string, testCase: TestCase): Promise<TestResult> {
    const startTime = performance.now();
    
    try {
      // Execute the algorithm
      const executionResult = await this.runAlgorithm(code, testCase.input);
      
      if (!executionResult.success) {
        return {
          testCaseId: testCase.id,
          passed: false,
          error: executionResult.error,
          performance: executionResult.performance
        };
      }

      // Validate correctness
      const isCorrect = this.validateOutput(executionResult.output, testCase.expectedOutput);
      
      // Analyze complexity
      const complexityAnalysis = this.analyzeComplexity(code, testCase.input, executionResult.performance!);
      
      const executionTime = performance.now() - startTime;

      return {
        testCaseId: testCase.id,
        passed: isCorrect && complexityAnalysis.efficiency !== 'poor',
        actualOutput: executionResult.output,
        feedback: this.generateFeedback(isCorrect, complexityAnalysis),
        performance: {
          executionTime,
          memoryUsage: executionResult.performance?.memoryUsage || 0,
          cpuUsage: 0
        }
      };

    } catch (error) {
      return {
        testCaseId: testCase.id,
        passed: false,
        error: error instanceof Error ? error.message : 'Execution failed',
        performance: {
          executionTime: performance.now() - startTime,
          memoryUsage: 0,
          cpuUsage: 0
        }
      };
    }
  }

  private async runAlgorithm(code: string, input: any): Promise<ExecutionResult> {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    try {
      // Create execution context
      const context = this.createExecutionContext();
      
      // Prepare the code for execution
      const executableCode = this.prepareCode(code, input);
      
      // Execute with timeout
      const result = await this.executeWithTimeout(executableCode, context);
      
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
      const executionTime = performance.now() - startTime;
      const memoryUsage = this.getMemoryUsage() - startMemory;

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        performance: {
          executionTime,
          memoryUsage,
          cpuUsage: 0
        }
      };
    }
  }

  private createExecutionContext(): any {
    return {
      console: {
        log: (...args: any[]) => console.log('[DSA]', ...args),
        error: (...args: any[]) => console.error('[DSA]', ...args)
      },
      Math: Math,
      Array: Array,
      Object: Object,
      JSON: JSON,
      // Block dangerous operations
      eval: undefined,
      Function: undefined,
      setTimeout: undefined,
      setInterval: undefined,
      require: undefined,
      process: undefined,
      global: undefined,
      window: undefined
    };
  }

  private prepareCode(code: string, input: any): string {
    // Wrap user code to handle different algorithm patterns
    return `
      (function() {
        ${code}
        
        // Try different function patterns
        if (typeof solution === 'function') {
          return solution(${JSON.stringify(input)});
        }
        
        if (typeof solve === 'function') {
          return solve(${JSON.stringify(input)});
        }
        
        if (typeof algorithm === 'function') {
          return algorithm(${JSON.stringify(input)});
        }
        
        // For class-based solutions
        if (typeof AnalyticsEngine === 'function') {
          const engine = new AnalyticsEngine();
          if (typeof engine.getDailyActiveUsers === 'function') {
            const testData = ${JSON.stringify(input.records || [])};
            engine.loadData(testData);
            return engine.getDailyActiveUsers('${input.startDate || '2024-01-01'}', '${input.endDate || '2024-01-02'}');
          }
        }
        
        throw new Error('No valid solution function found. Please define a function named "solution", "solve", "algorithm", or a class with appropriate methods.');
      })()
    `;
  }

  private async executeWithTimeout(code: string, context: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Execution timeout: exceeded ${this.config.timeLimit}ms`));
      }, this.config.timeLimit);

      try {
        // Create function with restricted context
        const func = new Function(...Object.keys(context), `return ${code}`);
        const result = func(...Object.values(context));
        
        clearTimeout(timeoutId);
        resolve(result);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  private validateOutput(actual: any, expected: any): boolean {
    // Deep equality check
    return JSON.stringify(actual) === JSON.stringify(expected);
  }

  private analyzeComplexity(code: string, input: any, performance: any): ComplexityAnalysis {
    const inputSize = this.estimateInputSize(input);
    const executionTime = performance.executionTime;
    const memoryUsage = performance.memoryUsage;

    // Analyze time complexity based on execution time vs input size
    let timeComplexity = 'O(?)';
    let efficiency: 'optimal' | 'good' | 'poor' = 'good';

    if (inputSize > 0) {
      const timePerElement = executionTime / inputSize;
      
      if (timePerElement < 0.001) {
        timeComplexity = 'O(1) or O(log n)';
        efficiency = 'optimal';
      } else if (timePerElement < 0.01) {
        timeComplexity = 'O(n)';
        efficiency = 'optimal';
      } else if (timePerElement < 0.1) {
        timeComplexity = 'O(n log n)';
        efficiency = 'good';
      } else if (timePerElement < 1) {
        timeComplexity = 'O(n²)';
        efficiency = 'poor';
      } else {
        timeComplexity = 'O(n³) or worse';
        efficiency = 'poor';
      }
    }

    // Analyze space complexity based on memory usage
    let spaceComplexity = 'O(?)';
    if (memoryUsage < 1) {
      spaceComplexity = 'O(1)';
    } else if (memoryUsage < inputSize * 0.1) {
      spaceComplexity = 'O(log n)';
    } else if (memoryUsage < inputSize * 2) {
      spaceComplexity = 'O(n)';
    } else {
      spaceComplexity = 'O(n²) or worse';
    }

    // Check for common algorithmic patterns in code
    const codeAnalysis = this.analyzeCodePatterns(code);
    if (codeAnalysis.timeComplexity) {
      timeComplexity = codeAnalysis.timeComplexity;
    }

    return {
      timeComplexity,
      spaceComplexity,
      actualTime: executionTime,
      actualMemory: memoryUsage,
      efficiency
    };
  }

  private analyzeCodePatterns(code: string): { timeComplexity?: string; spaceComplexity?: string } {
    const analysis: { timeComplexity?: string; spaceComplexity?: string } = {};

    // Look for nested loops
    const nestedLoopPattern = /for\s*\([^}]*\{[^}]*for\s*\(/g;
    if (nestedLoopPattern.test(code)) {
      analysis.timeComplexity = 'O(n²)';
    }

    // Look for single loops
    const singleLoopPattern = /for\s*\(|while\s*\(|\.forEach\(|\.map\(|\.filter\(/g;
    const loopMatches = code.match(singleLoopPattern);
    if (loopMatches && loopMatches.length === 1 && !nestedLoopPattern.test(code)) {
      analysis.timeComplexity = 'O(n)';
    }

    // Look for recursive patterns
    if (code.includes('function') && code.match(/(\w+)\s*\([^)]*\)\s*\{[^}]*\1\s*\(/)) {
      analysis.timeComplexity = 'O(2^n) or O(n!)';
    }

    // Look for sorting
    if (code.includes('.sort(') || code.includes('sort ')) {
      analysis.timeComplexity = 'O(n log n)';
    }

    // Look for hash table usage
    if (code.includes('Map') || code.includes('Set') || code.includes('{}')) {
      analysis.spaceComplexity = 'O(n)';
    }

    return analysis;
  }

  private estimateInputSize(input: any): number {
    if (Array.isArray(input)) {
      return input.length;
    }
    
    if (typeof input === 'object' && input !== null) {
      if (input.records && Array.isArray(input.records)) {
        return input.records.length;
      }
      
      if (input.nums && Array.isArray(input.nums)) {
        return input.nums.length;
      }
      
      return Object.keys(input).length;
    }
    
    if (typeof input === 'string') {
      return input.length;
    }
    
    return 1;
  }

  private generateFeedback(isCorrect: boolean, complexity: ComplexityAnalysis): string {
    if (!isCorrect) {
      return 'Solution produces incorrect output. Please check your algorithm logic.';
    }

    const feedback = [`✅ Correct output! Time: ${complexity.timeComplexity}, Space: ${complexity.spaceComplexity}`];

    switch (complexity.efficiency) {
      case 'optimal':
        feedback.push('🚀 Excellent performance! Your algorithm is highly efficient.');
        break;
      case 'good':
        feedback.push('👍 Good performance. Consider optimizing further if possible.');
        break;
      case 'poor':
        feedback.push('⚠️ Performance could be improved. Consider using more efficient algorithms or data structures.');
        break;
    }

    if (complexity.actualTime > 1000) {
      feedback.push(`⏱️ Execution took ${complexity.actualTime.toFixed(2)}ms. Try to optimize for better performance.`);
    }

    if (complexity.actualMemory > 10) {
      feedback.push(`💾 Memory usage: ${complexity.actualMemory.toFixed(2)}MB. Consider optimizing space complexity.`);
    }

    return feedback.join(' ');
  }

  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
    }
    return 0;
  }

  // Run multiple test cases for comprehensive validation
  async runTestSuite(code: string, testCases: TestCase[]): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    for (const testCase of testCases) {
      const result = await this.executeCode(code, testCase);
      results.push(result);
      
      // Stop on first failure for efficiency
      if (!result.passed && testCase.metadata.criticality === 'high') {
        break;
      }
    }
    
    return results;
  }

  // Performance benchmarking
  async benchmarkAlgorithm(code: string, inputSizes: number[]): Promise<{
    inputSize: number;
    executionTime: number;
    memoryUsage: number;
  }[]> {
    const benchmarks = [];
    
    for (const size of inputSizes) {
      const testInput = this.generateTestInput(size);
      const startTime = performance.now();
      const startMemory = this.getMemoryUsage();
      
      try {
        await this.runAlgorithm(code, testInput);
        const executionTime = performance.now() - startTime;
        const memoryUsage = this.getMemoryUsage() - startMemory;
        
        benchmarks.push({
          inputSize: size,
          executionTime,
          memoryUsage
        });
      } catch (error) {
        // Skip failed benchmarks
        continue;
      }
    }
    
    return benchmarks;
  }

  private generateTestInput(size: number): any {
    // Generate test input based on size
    const nums = Array.from({ length: size }, (_, i) => Math.floor(Math.random() * 1000));
    return { nums, target: nums[0] + nums[1] }; // Simple two-sum style input
  }
}

// Factory function
export function createDSAExecutor(config: DSAExecutionConfig): DSAExecutor {
  return new DSAExecutor(config);
}