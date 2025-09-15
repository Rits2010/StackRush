import { TestCase, TestResult } from '../types/challenge';
import { databaseSandbox, DatabaseConfig } from './databaseSandbox';

export interface APITestConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  authentication?: {
    type: 'bearer' | 'basic' | 'api-key';
    credentials: Record<string, string>;
  };
}

export interface APIEndpoint {
  method: string;
  path: string;
  description: string;
  parameters?: Parameter[];
  requestBody?: RequestBodySchema;
  responses: ResponseSchema[];
}

export interface Parameter {
  name: string;
  in: 'query' | 'path' | 'header';
  required: boolean;
  type: string;
  description?: string;
}

export interface RequestBodySchema {
  contentType: string;
  schema: any;
  required: boolean;
}

export interface ResponseSchema {
  statusCode: number;
  description: string;
  schema?: any;
  headers?: Record<string, string>;
}

export interface APITestResult extends TestResult {
  request?: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: any;
  };
  response?: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: any;
    timing: {
      total: number;
      dns?: number;
      connect?: number;
      send?: number;
      wait?: number;
      receive?: number;
    };
  };
  validationErrors?: string[];
}

export class APIValidator {
  private config: APITestConfig;
  private databaseId: string | null = null;

  constructor(config: APITestConfig) {
    this.config = config;
  }

  async initializeDatabase(challengeId: string, dbConfig: DatabaseConfig): Promise<void> {
    this.databaseId = databaseSandbox.createDatabase(challengeId, dbConfig);
  }

  async runIntegrationTest(
    userCode: string,
    testCase: TestCase
  ): Promise<APITestResult> {
    const startTime = performance.now();

    try {
      // Start the user's API server (simulated)
      const serverInfo = await this.startUserServer(userCode);
      
      // Execute the API test
      const testInput = testCase.input as {
        method: string;
        endpoint: string;
        headers?: Record<string, string>;
        body?: any;
        expectedStatus?: number;
        expectedBody?: any;
      };

      const result = await this.executeAPIRequest(testInput);
      
      // Validate the response
      const validation = await this.validateAPIResponse(result, testCase);
      
      const executionTime = performance.now() - startTime;

      return {
        testCaseId: testCase.id,
        passed: validation.passed,
        actualOutput: result.response,
        request: result.request,
        response: result.response,
        validationErrors: validation.errors,
        feedback: validation.feedback,
        performance: {
          executionTime,
          memoryUsage: 0,
          cpuUsage: 0
        }
      };

    } catch (error) {
      const executionTime = performance.now() - startTime;
      
      return {
        testCaseId: testCase.id,
        passed: false,
        error: error instanceof Error ? error.message : 'API test failed',
        performance: {
          executionTime,
          memoryUsage: 0,
          cpuUsage: 0
        }
      };
    }
  }

  async runSecurityTest(
    userCode: string,
    testCase: TestCase
  ): Promise<APITestResult> {
    const startTime = performance.now();

    try {
      // Security-focused test cases
      const securityTests = [
        this.testSQLInjection(testCase),
        this.testXSSPrevention(testCase),
        this.testAuthenticationBypass(testCase),
        this.testRateLimiting(testCase),
        this.testInputValidation(testCase)
      ];

      const results = await Promise.all(securityTests);
      const allPassed = results.every(r => r.passed);
      const allErrors = results.flatMap(r => r.errors || []);

      const executionTime = performance.now() - startTime;

      return {
        testCaseId: testCase.id,
        passed: allPassed,
        actualOutput: {
          securityTests: results.map(r => ({
            name: r.testName,
            passed: r.passed,
            details: r.details
          }))
        },
        validationErrors: allErrors,
        feedback: allPassed 
          ? 'All security tests passed' 
          : `Security vulnerabilities found: ${allErrors.join(', ')}`,
        performance: {
          executionTime,
          memoryUsage: 0,
          cpuUsage: 0
        }
      };

    } catch (error) {
      const executionTime = performance.now() - startTime;
      
      return {
        testCaseId: testCase.id,
        passed: false,
        error: error instanceof Error ? error.message : 'Security test failed',
        performance: {
          executionTime,
          memoryUsage: 0,
          cpuUsage: 0
        }
      };
    }
  }

  async runPerformanceTest(
    userCode: string,
    testCase: TestCase
  ): Promise<APITestResult> {
    const startTime = performance.now();

    try {
      const performanceConfig = testCase.validationRules[0]?.criteria as {
        maxResponseTime: number;
        concurrentRequests: number;
        requestsPerSecond: number;
      };

      // Run load test
      const loadTestResult = await this.runLoadTest(testCase, performanceConfig);
      
      const executionTime = performance.now() - startTime;

      return {
        testCaseId: testCase.id,
        passed: loadTestResult.passed,
        actualOutput: loadTestResult.metrics,
        feedback: loadTestResult.feedback,
        performance: {
          executionTime,
          memoryUsage: 0,
          cpuUsage: 0
        }
      };

    } catch (error) {
      const executionTime = performance.now() - startTime;
      
      return {
        testCaseId: testCase.id,
        passed: false,
        error: error instanceof Error ? error.message : 'Performance test failed',
        performance: {
          executionTime,
          memoryUsage: 0,
          cpuUsage: 0
        }
      };
    }
  }

  private async startUserServer(userCode: string): Promise<{ port: number; pid: string }> {
    // In a real implementation, this would start the user's server in a container
    // For now, we'll simulate it
    return {
      port: 3001,
      pid: crypto.randomUUID()
    };
  }

  private async executeAPIRequest(testInput: {
    method: string;
    endpoint: string;
    headers?: Record<string, string>;
    body?: any;
  }): Promise<{
    request: any;
    response: any;
  }> {
    const url = `${this.config.baseUrl}${testInput.endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...testInput.headers
    };

    // Add authentication if configured
    if (this.config.authentication) {
      switch (this.config.authentication.type) {
        case 'bearer':
          headers['Authorization'] = `Bearer ${this.config.authentication.credentials.token}`;
          break;
        case 'basic':
          const credentials = btoa(`${this.config.authentication.credentials.username}:${this.config.authentication.credentials.password}`);
          headers['Authorization'] = `Basic ${credentials}`;
          break;
        case 'api-key':
          headers['X-API-Key'] = this.config.authentication.credentials.apiKey;
          break;
      }
    }

    const requestOptions: RequestInit = {
      method: testInput.method,
      headers,
      signal: AbortSignal.timeout(this.config.timeout)
    };

    if (testInput.body && ['POST', 'PUT', 'PATCH'].includes(testInput.method)) {
      requestOptions.body = JSON.stringify(testInput.body);
    }

    const startTime = performance.now();
    
    try {
      const response = await fetch(url, requestOptions);
      const endTime = performance.now();

      let responseBody: any;
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        try {
          responseBody = await response.json();
        } catch (error) {
          responseBody = await response.text();
        }
      } else {
        responseBody = await response.text();
      }

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return {
        request: {
          method: testInput.method,
          url,
          headers,
          body: testInput.body
        },
        response: {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          body: responseBody,
          timing: {
            total: endTime - startTime
          }
        }
      };

    } catch (error) {
      throw new Error(`API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async validateAPIResponse(
    result: { request: any; response: any },
    testCase: TestCase
  ): Promise<{
    passed: boolean;
    errors: string[];
    feedback: string;
  }> {
    const errors: string[] = [];
    const expectedOutput = testCase.expectedOutput as {
      status?: number;
      body?: any;
      headers?: Record<string, string>;
      schema?: any;
    };

    // Validate status code
    if (expectedOutput.status && result.response.status !== expectedOutput.status) {
      errors.push(`Expected status ${expectedOutput.status}, got ${result.response.status}`);
    }

    // Validate response body structure
    if (expectedOutput.body) {
      const bodyValidation = this.validateResponseBody(result.response.body, expectedOutput.body);
      if (!bodyValidation.valid) {
        errors.push(...bodyValidation.errors);
      }
    }

    // Validate response headers
    if (expectedOutput.headers) {
      for (const [headerName, expectedValue] of Object.entries(expectedOutput.headers)) {
        const actualValue = result.response.headers[headerName.toLowerCase()];
        if (actualValue !== expectedValue) {
          errors.push(`Expected header ${headerName}: ${expectedValue}, got: ${actualValue}`);
        }
      }
    }

    // Validate JSON schema if provided
    if (expectedOutput.schema) {
      const schemaValidation = this.validateJSONSchema(result.response.body, expectedOutput.schema);
      if (!schemaValidation.valid) {
        errors.push(...schemaValidation.errors);
      }
    }

    // Apply custom validation rules
    for (const rule of testCase.validationRules) {
      const ruleValidation = await this.applyValidationRule(result, rule);
      if (!ruleValidation.valid) {
        errors.push(ruleValidation.error);
      }
    }

    const passed = errors.length === 0;
    const feedback = passed 
      ? 'API response validation passed'
      : `Validation failed: ${errors.join(', ')}`;

    return { passed, errors, feedback };
  }

  private validateResponseBody(actual: any, expected: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (typeof expected === 'object' && expected !== null) {
      if (typeof actual !== 'object' || actual === null) {
        errors.push('Expected response body to be an object');
        return { valid: false, errors };
      }

      // Check required properties
      for (const [key, value] of Object.entries(expected)) {
        if (!(key in actual)) {
          errors.push(`Missing required property: ${key}`);
        } else if (typeof value === 'object' && value !== null) {
          const nestedValidation = this.validateResponseBody(actual[key], value);
          errors.push(...nestedValidation.errors);
        } else if (actual[key] !== value) {
          errors.push(`Property ${key}: expected ${value}, got ${actual[key]}`);
        }
      }
    } else if (actual !== expected) {
      errors.push(`Expected ${expected}, got ${actual}`);
    }

    return { valid: errors.length === 0, errors };
  }

  private validateJSONSchema(data: any, schema: any): { valid: boolean; errors: string[] } {
    // Simplified JSON schema validation
    const errors: string[] = [];

    if (schema.type) {
      const actualType = Array.isArray(data) ? 'array' : typeof data;
      if (actualType !== schema.type) {
        errors.push(`Expected type ${schema.type}, got ${actualType}`);
      }
    }

    if (schema.properties && typeof data === 'object' && data !== null) {
      for (const [prop, propSchema] of Object.entries(schema.properties)) {
        if (prop in data) {
          const propValidation = this.validateJSONSchema(data[prop], propSchema);
          errors.push(...propValidation.errors.map(err => `${prop}.${err}`));
        }
      }
    }

    if (schema.required && Array.isArray(schema.required)) {
      for (const requiredProp of schema.required) {
        if (!(requiredProp in data)) {
          errors.push(`Missing required property: ${requiredProp}`);
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  private async applyValidationRule(
    result: { request: any; response: any },
    rule: any
  ): Promise<{ valid: boolean; error: string }> {
    switch (rule.type) {
      case 'performance-threshold':
        const responseTime = result.response.timing.total;
        const threshold = rule.criteria.maxResponseTime || 1000;
        return {
          valid: responseTime <= threshold,
          error: `Response time ${responseTime}ms exceeds threshold ${threshold}ms`
        };

      case 'security-check':
        // Check for common security headers
        const securityHeaders = ['x-content-type-options', 'x-frame-options', 'x-xss-protection'];
        const missingHeaders = securityHeaders.filter(header => 
          !result.response.headers[header]
        );
        return {
          valid: missingHeaders.length === 0,
          error: `Missing security headers: ${missingHeaders.join(', ')}`
        };

      case 'data-validation':
        // Check if response contains sensitive data
        const responseStr = JSON.stringify(result.response.body).toLowerCase();
        const sensitivePatterns = ['password', 'secret', 'token', 'key'];
        const foundSensitive = sensitivePatterns.filter(pattern => 
          responseStr.includes(pattern)
        );
        return {
          valid: foundSensitive.length === 0,
          error: `Response contains sensitive data: ${foundSensitive.join(', ')}`
        };

      default:
        return { valid: true, error: '' };
    }
  }

  private async testSQLInjection(testCase: TestCase): Promise<{
    testName: string;
    passed: boolean;
    errors?: string[];
    details: any;
  }> {
    const maliciousInputs = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "1' UNION SELECT * FROM users --",
      "'; INSERT INTO users VALUES ('hacker', 'password'); --"
    ];

    const results = [];
    
    for (const input of maliciousInputs) {
      try {
        const testInput = {
          ...testCase.input,
          body: { ...testCase.input.body, maliciousField: input }
        };
        
        const result = await this.executeAPIRequest(testInput);
        
        // Check if the malicious input was properly handled
        const isVulnerable = result.response.status === 200 && 
                           JSON.stringify(result.response.body).includes('users');
        
        results.push({
          input,
          vulnerable: isVulnerable,
          status: result.response.status
        });
      } catch (error) {
        // Errors are expected for malicious inputs
        results.push({
          input,
          vulnerable: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const vulnerabilities = results.filter(r => r.vulnerable);
    
    return {
      testName: 'SQL Injection Test',
      passed: vulnerabilities.length === 0,
      errors: vulnerabilities.map(v => `SQL injection vulnerability with input: ${v.input}`),
      details: results
    };
  }

  private async testXSSPrevention(testCase: TestCase): Promise<{
    testName: string;
    passed: boolean;
    errors?: string[];
    details: any;
  }> {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '"><script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src="x" onerror="alert(\'XSS\')">'
    ];

    const results = [];
    
    for (const payload of xssPayloads) {
      try {
        const testInput = {
          ...testCase.input,
          body: { ...testCase.input.body, userInput: payload }
        };
        
        const result = await this.executeAPIRequest(testInput);
        
        // Check if the payload was properly escaped/sanitized
        const responseStr = JSON.stringify(result.response.body);
        const isVulnerable = responseStr.includes('<script>') || 
                           responseStr.includes('javascript:') ||
                           responseStr.includes('onerror=');
        
        results.push({
          payload,
          vulnerable: isVulnerable,
          status: result.response.status
        });
      } catch (error) {
        results.push({
          payload,
          vulnerable: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const vulnerabilities = results.filter(r => r.vulnerable);
    
    return {
      testName: 'XSS Prevention Test',
      passed: vulnerabilities.length === 0,
      errors: vulnerabilities.map(v => `XSS vulnerability with payload: ${v.payload}`),
      details: results
    };
  }

  private async testAuthenticationBypass(testCase: TestCase): Promise<{
    testName: string;
    passed: boolean;
    errors?: string[];
    details: any;
  }> {
    // Test accessing protected endpoints without authentication
    const bypassAttempts = [
      { headers: {}, description: 'No authentication' },
      { headers: { 'Authorization': 'Bearer invalid_token' }, description: 'Invalid token' },
      { headers: { 'Authorization': 'Bearer ' }, description: 'Empty token' },
      { headers: { 'Authorization': 'Basic invalid' }, description: 'Invalid basic auth' }
    ];

    const results = [];
    
    for (const attempt of bypassAttempts) {
      try {
        const testInput = {
          ...testCase.input,
          headers: attempt.headers
        };
        
        const result = await this.executeAPIRequest(testInput);
        
        // Protected endpoints should return 401 or 403
        const isSecure = result.response.status === 401 || result.response.status === 403;
        
        results.push({
          attempt: attempt.description,
          secure: isSecure,
          status: result.response.status
        });
      } catch (error) {
        results.push({
          attempt: attempt.description,
          secure: true, // Errors are acceptable for auth failures
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const vulnerabilities = results.filter(r => !r.secure);
    
    return {
      testName: 'Authentication Bypass Test',
      passed: vulnerabilities.length === 0,
      errors: vulnerabilities.map(v => `Authentication bypass: ${v.attempt}`),
      details: results
    };
  }

  private async testRateLimiting(testCase: TestCase): Promise<{
    testName: string;
    passed: boolean;
    errors?: string[];
    details: any;
  }> {
    // Send multiple requests rapidly to test rate limiting
    const requestCount = 20;
    const requests = [];
    
    for (let i = 0; i < requestCount; i++) {
      requests.push(this.executeAPIRequest(testCase.input));
    }

    try {
      const results = await Promise.all(requests);
      const rateLimitedRequests = results.filter(r => r.response.status === 429);
      
      // At least some requests should be rate limited
      const hasRateLimiting = rateLimitedRequests.length > 0;
      
      return {
        testName: 'Rate Limiting Test',
        passed: hasRateLimiting,
        errors: hasRateLimiting ? [] : ['No rate limiting detected'],
        details: {
          totalRequests: requestCount,
          rateLimitedRequests: rateLimitedRequests.length,
          statusCodes: results.map(r => r.response.status)
        }
      };
    } catch (error) {
      return {
        testName: 'Rate Limiting Test',
        passed: false,
        errors: [`Rate limiting test failed: ${error}`],
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  private async testInputValidation(testCase: TestCase): Promise<{
    testName: string;
    passed: boolean;
    errors?: string[];
    details: any;
  }> {
    const invalidInputs = [
      { field: 'email', value: 'invalid-email', expectedStatus: 400 },
      { field: 'amount', value: -1, expectedStatus: 400 },
      { field: 'amount', value: 'not-a-number', expectedStatus: 400 },
      { field: 'required_field', value: null, expectedStatus: 400 },
      { field: 'required_field', value: '', expectedStatus: 400 }
    ];

    const results = [];
    
    for (const invalidInput of invalidInputs) {
      try {
        const testInput = {
          ...testCase.input,
          body: { ...testCase.input.body, [invalidInput.field]: invalidInput.value }
        };
        
        const result = await this.executeAPIRequest(testInput);
        
        const properlyValidated = result.response.status === invalidInput.expectedStatus;
        
        results.push({
          field: invalidInput.field,
          value: invalidInput.value,
          expectedStatus: invalidInput.expectedStatus,
          actualStatus: result.response.status,
          properlyValidated
        });
      } catch (error) {
        results.push({
          field: invalidInput.field,
          value: invalidInput.value,
          properlyValidated: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const validationFailures = results.filter(r => !r.properlyValidated);
    
    return {
      testName: 'Input Validation Test',
      passed: validationFailures.length === 0,
      errors: validationFailures.map(f => `Input validation failed for ${f.field}: ${f.value}`),
      details: results
    };
  }

  private async runLoadTest(
    testCase: TestCase,
    config: { maxResponseTime: number; concurrentRequests: number; requestsPerSecond: number }
  ): Promise<{
    passed: boolean;
    metrics: any;
    feedback: string;
  }> {
    const startTime = Date.now();
    const results: any[] = [];
    
    // Run concurrent requests
    const requests = [];
    for (let i = 0; i < config.concurrentRequests; i++) {
      requests.push(this.executeAPIRequest(testCase.input));
    }

    try {
      const responses = await Promise.all(requests);
      const endTime = Date.now();
      
      const totalTime = endTime - startTime;
      const avgResponseTime = responses.reduce((sum, r) => sum + r.response.timing.total, 0) / responses.length;
      const maxResponseTime = Math.max(...responses.map(r => r.response.timing.total));
      const minResponseTime = Math.min(...responses.map(r => r.response.timing.total));
      const successfulRequests = responses.filter(r => r.response.status < 400).length;
      const actualRPS = (config.concurrentRequests / totalTime) * 1000;

      const metrics = {
        totalRequests: config.concurrentRequests,
        successfulRequests,
        failedRequests: config.concurrentRequests - successfulRequests,
        avgResponseTime,
        maxResponseTime,
        minResponseTime,
        actualRPS,
        totalTime
      };

      const passed = avgResponseTime <= config.maxResponseTime && 
                    actualRPS >= config.requestsPerSecond &&
                    successfulRequests >= config.concurrentRequests * 0.95; // 95% success rate

      const feedback = passed 
        ? `Load test passed: ${successfulRequests}/${config.concurrentRequests} requests successful, avg response time: ${avgResponseTime.toFixed(2)}ms`
        : `Load test failed: avg response time ${avgResponseTime.toFixed(2)}ms (limit: ${config.maxResponseTime}ms), RPS: ${actualRPS.toFixed(2)} (target: ${config.requestsPerSecond})`;

      return { passed, metrics, feedback };

    } catch (error) {
      return {
        passed: false,
        metrics: { error: error instanceof Error ? error.message : 'Unknown error' },
        feedback: `Load test failed: ${error}`
      };
    }
  }

  cleanup(): void {
    if (this.databaseId) {
      databaseSandbox.closeDatabase(this.databaseId);
      this.databaseId = null;
    }
  }
}

// Export factory function
export function createAPIValidator(config: APITestConfig): APIValidator {
  return new APIValidator(config);
}