import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, Play, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { SecureTestRunner, TestResultSanitizer } from '../services/secureTestSystem';
import { TestCase, TestResult } from '../types/challenge';

interface TestCasesProps {
  challengeId: string;
  challengeType: 'frontend' | 'backend-api' | 'dsa';
  userCode: string;
  onTestComplete?: (results: TestResult[]) => void;
  onAllTestsPassed?: () => void;
  className?: string;
}

interface TestCaseDisplay {
  id: string;
  type: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  result?: TestResult;
  feedback?: string;
}

export const TestCases: React.FC<TestCasesProps> = ({
  challengeId,
  challengeType,
  userCode,
  onTestComplete,
  onAllTestsPassed,
  className = ''
}) => {
  const [testCases, setTestCases] = useState<TestCaseDisplay[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [progress, setProgress] = useState(0);
  const [secureTestRunner] = useState(() => new SecureTestRunner());

  // Load test case information (sanitized) when component mounts
  useEffect(() => {
    const loadTestCases = async () => {
      try {
        const testCaseInfo = await secureTestRunner.getTestCaseInfo(challengeId);
        const displayCases: TestCaseDisplay[] = testCaseInfo.map((info, index) => ({
          id: info.id || `test-${index}`,
          type: info.type || 'unit',
          description: info.description || `Test Case ${index + 1}`,
          status: 'pending'
        }));
        setTestCases(displayCases);
      } catch (error) {
        console.error('Failed to load test cases:', error);
        // Fallback to basic test cases if secure loading fails
        setTestCases(getBasicTestCases(challengeType));
      }
    };

    loadTestCases();
  }, [challengeId, challengeType, secureTestRunner]);

  // Fallback test cases for when secure system is not available
  const getBasicTestCases = (type: string): TestCaseDisplay[] => {
    switch (type) {
      case 'dsa':
        return [
          { id: 'dsa-1', type: 'unit', description: 'Basic functionality test', status: 'pending' },
          { id: 'dsa-2', type: 'unit', description: 'Edge case handling', status: 'pending' },
          { id: 'dsa-3', type: 'performance', description: 'Performance requirements', status: 'pending' }
        ];
      case 'frontend':
        return [
          { id: 'fe-1', type: 'visual', description: 'Visual layout validation', status: 'pending' },
          { id: 'fe-2', type: 'accessibility', description: 'Accessibility compliance', status: 'pending' },
          { id: 'fe-3', type: 'integration', description: 'Interactive functionality', status: 'pending' }
        ];
      case 'backend-api':
        return [
          { id: 'be-1', type: 'integration', description: 'API endpoint functionality', status: 'pending' },
          { id: 'be-2', type: 'integration', description: 'Response format validation', status: 'pending' },
          { id: 'be-3', type: 'performance', description: 'Response time requirements', status: 'pending' }
        ];
      default:
        return [];
    }
  };

  // Run all tests
  const runTests = useCallback(async () => {
    if (!userCode.trim() || isRunning) return;

    setIsRunning(true);
    setProgress(0);

    // Reset all test statuses
    setTestCases(prev => prev.map(test => ({ ...test, status: 'pending', result: undefined, feedback: undefined })));

    try {
      // Create a mock execution environment for now
      // In a real implementation, this would use WebContainer or similar
      const executionEnvironment = {
        runSingleTest: async (code: string, testCase: TestCase): Promise<TestResult> => {
          // Simulate test execution delay
          await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
          
          // Mock test result based on code quality
          const hasBasicStructure = code.includes('function') || code.includes('const') || code.includes('class');
          const isComplete = code.length > 50;
          const passed = hasBasicStructure && isComplete && Math.random() > 0.3; // 70% pass rate for demo
          
          return {
            testCaseId: testCase.id,
            passed,
            actualOutput: passed ? 'Expected output' : 'Incorrect output',
            performance: {
              executionTime: Math.random() * 100,
              memoryUsage: Math.random() * 1024
            },
            feedback: passed ? 'Test passed successfully' : 'Test failed - check your implementation'
          };
        }
      };

      // Run tests sequentially with progress updates
      const results: TestResult[] = [];
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        
        // Update status to running
        setTestCases(prev => prev.map(test => 
          test.id === testCase.id ? { ...test, status: 'running' } : test
        ));

        try {
          // For demo purposes, create a mock TestCase object
          const mockTestCase: TestCase = {
            id: testCase.id,
            type: testCase.type as any,
            description: testCase.description,
            input: {},
            expectedOutput: {},
            validationRules: [],
            metadata: {
              timeout: 5000,
              retries: 1,
              criticality: 'medium'
            }
          };

          const result = await executionEnvironment.runSingleTest(userCode, mockTestCase);
          const sanitizedResult = TestResultSanitizer.sanitizeTestResult(result, mockTestCase);
          
          results.push(sanitizedResult);

          // Update test case with result
          setTestCases(prev => prev.map(test => 
            test.id === testCase.id ? {
              ...test,
              status: sanitizedResult.passed ? 'passed' : 'failed',
              result: sanitizedResult,
              feedback: sanitizedResult.feedback
            } : test
          ));

        } catch (error) {
          // Handle test execution error
          setTestCases(prev => prev.map(test => 
            test.id === testCase.id ? {
              ...test,
              status: 'failed',
              feedback: 'Test execution failed'
            } : test
          ));
        }

        // Update progress
        setProgress(((i + 1) / testCases.length) * 100);
      }

      // Check if all tests passed
      const allPassed = results.every(result => result.passed);
      if (allPassed && onAllTestsPassed) {
        onAllTestsPassed();
      }

      if (onTestComplete) {
        onTestComplete(results);
      }

    } catch (error) {
      console.error('Test execution failed:', error);
      // Mark all tests as failed
      setTestCases(prev => prev.map(test => ({
        ...test,
        status: 'failed',
        feedback: 'Test system error'
      })));
    } finally {
      setIsRunning(false);
      setProgress(100);
    }
  }, [userCode, testCases, isRunning, onTestComplete, onAllTestsPassed]);

  // Auto-run tests when code changes (debounced)
  useEffect(() => {
    if (!userCode.trim()) return;

    const timeoutId = setTimeout(() => {
      runTests();
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [userCode, runTests]);

  const getStatusIcon = (status: TestCaseDisplay['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-slate-400" />;
    }
  };

  const getStatusColor = (status: TestCaseDisplay['status']) => {
    switch (status) {
      case 'passed':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'failed':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'running':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      default:
        return 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700';
    }
  };

  const passedTests = testCases.filter(test => test.status === 'passed').length;
  const totalTests = testCases.length;

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Test Cases
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {passedTests}/{totalTests} passed
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showDetails ? 'Hide' : 'Show'} Details</span>
          </button>
          
          <button
            onClick={runTests}
            disabled={isRunning || !userCode.trim()}
            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Play className="h-4 w-4" />
            <span>{isRunning ? 'Running...' : 'Run Tests'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Running tests... {Math.round(progress)}%
          </p>
        </div>
      )}

      {/* Test Cases List */}
      <div className="p-4 space-y-3">
        {testCases.map((testCase, index) => (
          <div
            key={testCase.id}
            className={`p-3 rounded-lg border transition-all duration-200 ${getStatusColor(testCase.status)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(testCase.status)}
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Test {index + 1}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {testCase.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  testCase.type === 'performance' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                  testCase.type === 'visual' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                  testCase.type === 'accessibility' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {testCase.type}
                </span>
              </div>
            </div>

            {/* Detailed feedback */}
            {showDetails && testCase.feedback && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {testCase.feedback}
                </p>
                
                {testCase.result?.performance && (
                  <div className="mt-2 flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-500">
                    <span>⏱️ {testCase.result.performance.executionTime.toFixed(2)}ms</span>
                    <span>💾 {(testCase.result.performance.memoryUsage / 1024).toFixed(2)}KB</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      {totalTests > 0 && (
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {passedTests === totalTests ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              )}
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {passedTests === totalTests ? 'All tests passed!' : `${passedTests}/${totalTests} tests passed`}
              </span>
            </div>
            
            {passedTests < totalTests && (
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Fix failing tests to complete the challenge
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};