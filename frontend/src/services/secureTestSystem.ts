import { TestCase, TestResult, ValidationRule } from '../types/challenge';

// Crypto utilities for test case encryption
class CryptoUtils {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12;

  static async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  static async encryptData(data: string, key: CryptoKey): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

    const encrypted = await crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
      },
      key,
      dataBuffer
    );

    return { encrypted, iv };
  }

  static async decryptData(encryptedData: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<string> {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
      },
      key,
      encryptedData
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  static async exportKey(key: CryptoKey): Promise<ArrayBuffer> {
    return await crypto.subtle.exportKey('raw', key);
  }

  static async importKey(keyData: ArrayBuffer): Promise<CryptoKey> {
    return await crypto.subtle.importKey(
      'raw',
      keyData,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }
}

// Encrypted test case storage
interface EncryptedTestCase {
  id: string;
  challengeId: string;
  encryptedData: ArrayBuffer;
  iv: Uint8Array;
  metadata: {
    type: string;
    description: string;
    criticality: string;
    createdAt: Date;
    lastAccessed?: Date;
  };
}

interface AccessLog {
  id: string;
  testCaseId: string;
  challengeId: string;
  action: 'encrypt' | 'decrypt' | 'access' | 'validate';
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  success: boolean;
  error?: string;
}

export class SecureTestStorage {
  private static instance: SecureTestStorage;
  private encryptionKey: CryptoKey | null = null;
  private encryptedTestCases: Map<string, EncryptedTestCase> = new Map();
  private accessLogs: AccessLog[] = [];
  private keyRotationInterval: number = 24 * 60 * 60 * 1000; // 24 hours
  private lastKeyRotation: Date = new Date();

  private constructor() {
    this.initializeEncryption();
    this.setupKeyRotation();
  }

  static getInstance(): SecureTestStorage {
    if (!SecureTestStorage.instance) {
      SecureTestStorage.instance = new SecureTestStorage();
    }
    return SecureTestStorage.instance;
  }

  private async initializeEncryption(): Promise<void> {
    try {
      // In a real implementation, this would load from secure storage
      this.encryptionKey = await CryptoUtils.generateKey();
      this.logAccess('system', 'system', 'encrypt', true);
    } catch (error) {
      this.logAccess('system', 'system', 'encrypt', false, error instanceof Error ? error.message : 'Unknown error');
      throw new Error('Failed to initialize encryption system');
    }
  }

  private setupKeyRotation(): void {
    setInterval(async () => {
      await this.rotateEncryptionKey();
    }, this.keyRotationInterval);
  }

  private async rotateEncryptionKey(): Promise<void> {
    try {
      const oldKey = this.encryptionKey;
      const newKey = await CryptoUtils.generateKey();

      // Re-encrypt all test cases with new key
      if (oldKey) {
        for (const [id, encryptedTestCase] of this.encryptedTestCases) {
          const decryptedData = await CryptoUtils.decryptData(
            encryptedTestCase.encryptedData,
            oldKey,
            encryptedTestCase.iv
          );

          const { encrypted, iv } = await CryptoUtils.encryptData(decryptedData, newKey);
          
          this.encryptedTestCases.set(id, {
            ...encryptedTestCase,
            encryptedData: encrypted,
            iv
          });
        }
      }

      this.encryptionKey = newKey;
      this.lastKeyRotation = new Date();
      this.logAccess('system', 'system', 'encrypt', true, 'Key rotation completed');
    } catch (error) {
      this.logAccess('system', 'system', 'encrypt', false, `Key rotation failed: ${error}`);
    }
  }

  async storeTestCase(challengeId: string, testCase: TestCase): Promise<void> {
    if (!this.encryptionKey) {
      throw new Error('Encryption system not initialized');
    }

    try {
      const testCaseData = JSON.stringify(testCase);
      const { encrypted, iv } = await CryptoUtils.encryptData(testCaseData, this.encryptionKey);

      const encryptedTestCase: EncryptedTestCase = {
        id: testCase.id,
        challengeId,
        encryptedData: encrypted,
        iv,
        metadata: {
          type: testCase.type,
          description: testCase.description,
          criticality: testCase.metadata.criticality,
          createdAt: new Date()
        }
      };

      this.encryptedTestCases.set(testCase.id, encryptedTestCase);
      this.logAccess(testCase.id, challengeId, 'encrypt', true);
    } catch (error) {
      this.logAccess(testCase.id, challengeId, 'encrypt', false, error instanceof Error ? error.message : 'Unknown error');
      throw new Error('Failed to store encrypted test case');
    }
  }

  async retrieveTestCase(testCaseId: string, challengeId: string): Promise<TestCase | null> {
    if (!this.encryptionKey) {
      throw new Error('Encryption system not initialized');
    }

    const encryptedTestCase = this.encryptedTestCases.get(testCaseId);
    if (!encryptedTestCase || encryptedTestCase.challengeId !== challengeId) {
      this.logAccess(testCaseId, challengeId, 'decrypt', false, 'Test case not found');
      return null;
    }

    try {
      const decryptedData = await CryptoUtils.decryptData(
        encryptedTestCase.encryptedData,
        this.encryptionKey,
        encryptedTestCase.iv
      );

      const testCase: TestCase = JSON.parse(decryptedData);
      
      // Update last accessed time
      encryptedTestCase.metadata.lastAccessed = new Date();
      this.logAccess(testCaseId, challengeId, 'decrypt', true);
      
      return testCase;
    } catch (error) {
      this.logAccess(testCaseId, challengeId, 'decrypt', false, error instanceof Error ? error.message : 'Unknown error');
      throw new Error('Failed to decrypt test case');
    }
  }

  async getTestCasesForChallenge(challengeId: string): Promise<TestCase[]> {
    const testCases: TestCase[] = [];
    
    for (const [id, encryptedTestCase] of this.encryptedTestCases) {
      if (encryptedTestCase.challengeId === challengeId) {
        try {
          const testCase = await this.retrieveTestCase(id, challengeId);
          if (testCase) {
            testCases.push(testCase);
          }
        } catch (error) {
          // Log error but continue with other test cases
          this.logAccess(id, challengeId, 'access', false, error instanceof Error ? error.message : 'Unknown error');
        }
      }
    }

    return testCases;
  }

  getAccessLogs(challengeId?: string, limit: number = 100): AccessLog[] {
    let logs = this.accessLogs;
    
    if (challengeId) {
      logs = logs.filter(log => log.challengeId === challengeId);
    }
    
    return logs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  private logAccess(
    testCaseId: string,
    challengeId: string,
    action: AccessLog['action'],
    success: boolean,
    error?: string,
    userId?: string,
    sessionId?: string
  ): void {
    const log: AccessLog = {
      id: crypto.randomUUID(),
      testCaseId,
      challengeId,
      action,
      timestamp: new Date(),
      userId,
      sessionId,
      success,
      error
    };

    this.accessLogs.push(log);
    
    // Keep only last 10000 logs to prevent memory issues
    if (this.accessLogs.length > 10000) {
      this.accessLogs = this.accessLogs.slice(-5000);
    }
  }

  // Security audit methods
  getSecurityMetrics(): {
    totalTestCases: number;
    totalAccesses: number;
    failedAccesses: number;
    lastKeyRotation: Date;
    encryptionStatus: 'active' | 'inactive';
  } {
    const failedAccesses = this.accessLogs.filter(log => !log.success).length;
    
    return {
      totalTestCases: this.encryptedTestCases.size,
      totalAccesses: this.accessLogs.length,
      failedAccesses,
      lastKeyRotation: this.lastKeyRotation,
      encryptionStatus: this.encryptionKey ? 'active' : 'inactive'
    };
  }

  async validateIntegrity(): Promise<boolean> {
    if (!this.encryptionKey) {
      return false;
    }

    try {
      // Validate that all encrypted test cases can be decrypted
      for (const [id, encryptedTestCase] of this.encryptedTestCases) {
        await CryptoUtils.decryptData(
          encryptedTestCase.encryptedData,
          this.encryptionKey,
          encryptedTestCase.iv
        );
      }
      return true;
    } catch (error) {
      this.logAccess('system', 'system', 'validate', false, error instanceof Error ? error.message : 'Integrity check failed');
      return false;
    }
  }
}

// Test result sanitization
export class TestResultSanitizer {
  static sanitizeTestResult(result: TestResult, testCase: TestCase): TestResult {
    // Remove sensitive test case details from the result
    const sanitized: TestResult = {
      testCaseId: result.testCaseId,
      passed: result.passed,
      performance: result.performance,
      feedback: this.generateSanitizedFeedback(result, testCase)
    };

    // Only include actual output if test passed or if it's safe to show
    if (result.passed || this.isSafeToShowOutput(result, testCase)) {
      sanitized.actualOutput = this.sanitizeOutput(result.actualOutput);
    }

    // Never include the original error message that might contain test case details
    if (result.error && !result.passed) {
      sanitized.error = this.sanitizeError(result.error, testCase);
    }

    return sanitized;
  }

  private static generateSanitizedFeedback(result: TestResult, testCase: TestCase): string {
    if (result.passed) {
      return `✅ ${testCase.description} - Test passed successfully`;
    }

    // Generate helpful feedback without revealing test case details
    const feedbackTemplates = {
      'unit': 'The function output does not match the expected result. Check your logic and edge cases.',
      'integration': 'The API response format or status code is incorrect. Verify your endpoint implementation.',
      'visual': 'The visual output does not match the design requirements. Check your CSS and HTML structure.',
      'performance': 'The code execution time or memory usage exceeds the performance requirements.',
      'accessibility': 'The implementation does not meet accessibility standards. Check for proper ARIA labels and semantic HTML.'
    };

    const baseMessage = feedbackTemplates[testCase.type] || 'The test did not pass. Please review your implementation.';
    
    // Add specific hints based on the validation rules without revealing exact criteria
    if (testCase.validationRules.length > 0) {
      const rule = testCase.validationRules[0];
      switch (rule.type) {
        case 'exact-match':
          return `${baseMessage} Ensure your output format matches exactly what's expected.`;
        case 'pattern-match':
          return `${baseMessage} Check that your implementation follows the required patterns.`;
        case 'performance-threshold':
          return `${baseMessage} Optimize your algorithm for better performance.`;
        case 'accessibility-check':
          return `${baseMessage} Review accessibility guidelines and best practices.`;
        default:
          return baseMessage;
      }
    }

    return baseMessage;
  }

  private static isSafeToShowOutput(result: TestResult, testCase: TestCase): boolean {
    // Only show output for certain types of tests where it's educational
    const safeTypes = ['visual', 'performance'];
    return safeTypes.includes(testCase.type);
  }

  private static sanitizeOutput(output: any): any {
    if (typeof output === 'string') {
      // Remove any potential sensitive information
      return output.replace(/password|token|key|secret/gi, '[REDACTED]');
    }
    
    if (typeof output === 'object' && output !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(output)) {
        if (key.toLowerCase().includes('password') || 
            key.toLowerCase().includes('token') || 
            key.toLowerCase().includes('secret')) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitizeOutput(value);
        }
      }
      return sanitized;
    }
    
    return output;
  }

  private static sanitizeError(error: string, testCase: TestCase): string {
    // Provide generic error messages that don't reveal test case internals
    const genericErrors = {
      'SyntaxError': 'There is a syntax error in your code. Please check your code structure.',
      'TypeError': 'There is a type error in your code. Check your variable types and function calls.',
      'ReferenceError': 'You are referencing an undefined variable or function.',
      'RangeError': 'A value is out of the expected range.',
      'timeout': 'Your code took too long to execute. Consider optimizing your algorithm.',
      'memory': 'Your code used too much memory. Consider optimizing your data structures.'
    };

    // Check for common error types
    for (const [errorType, genericMessage] of Object.entries(genericErrors)) {
      if (error.toLowerCase().includes(errorType.toLowerCase())) {
        return genericMessage;
      }
    }

    // Default generic error message
    return 'An error occurred during test execution. Please review your implementation.';
  }

  static sanitizeTestCaseForDisplay(testCase: TestCase): Partial<TestCase> {
    // Return only safe information about the test case
    return {
      id: testCase.id,
      type: testCase.type,
      description: testCase.description,
      metadata: {
        timeout: testCase.metadata.timeout,
        criticality: testCase.metadata.criticality,
        retries: 0 // Don't reveal retry count
      }
    };
  }
}

// Main secure test runner
export class SecureTestRunner {
  private storage: SecureTestStorage;
  private sanitizer: typeof TestResultSanitizer;

  constructor() {
    this.storage = SecureTestStorage.getInstance();
    this.sanitizer = TestResultSanitizer;
  }

  async initializeTestsForChallenge(challengeId: string, testCases: TestCase[]): Promise<void> {
    // Store all test cases securely
    for (const testCase of testCases) {
      await this.storage.storeTestCase(challengeId, testCase);
    }
  }

  async runSecureTests(challengeId: string, userCode: string, executionEnvironment: any): Promise<TestResult[]> {
    const testCases = await this.storage.getTestCasesForChallenge(challengeId);
    const results: TestResult[] = [];

    for (const testCase of testCases) {
      try {
        // Run the test in the execution environment
        const rawResult = await executionEnvironment.runSingleTest(userCode, testCase);
        
        // Sanitize the result before returning
        const sanitizedResult = this.sanitizer.sanitizeTestResult(rawResult, testCase);
        results.push(sanitizedResult);
        
      } catch (error) {
        // Even errors are sanitized
        const errorResult: TestResult = {
          testCaseId: testCase.id,
          passed: false,
          error: this.sanitizer.sanitizeError(
            error instanceof Error ? error.message : 'Unknown error',
            testCase
          ),
          performance: {
            executionTime: 0,
            memoryUsage: 0
          }
        };
        
        results.push(errorResult);
      }
    }

    return results;
  }

  async getTestCaseInfo(challengeId: string): Promise<Partial<TestCase>[]> {
    const testCases = await this.storage.getTestCasesForChallenge(challengeId);
    return testCases.map(testCase => this.sanitizer.sanitizeTestCaseForDisplay(testCase));
  }

  getSecurityAudit(): any {
    return this.storage.getSecurityMetrics();
  }

  async validateSystemIntegrity(): Promise<boolean> {
    return await this.storage.validateIntegrity();
  }
}