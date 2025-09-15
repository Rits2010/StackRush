import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, XCircle, Clock, Trophy, AlertCircle } from 'lucide-react';

interface TestCase {
  id: string;
  name: string;
  input: any;
  expected: any;
  weight: number;
  isHidden?: boolean;
}

interface TestResult {
  testId: string;
  passed: boolean;
  actualOutput?: any;
  executionTime?: number;
  error?: string;
  score: number;
}

interface TestCasesPanelProps {
  testCases: TestCase[];
  code: string;
  onTestComplete: (results: TestResult[], totalScore: number) => void;
  isRunning: boolean;
  timeRemaining: number;
  focusLevel: number;
}

export const TestCasesPanel: React.FC<TestCasesPanelProps> = ({
  testCases,
  code,
  onTestComplete,
  isRunning,
  timeRemaining,
  focusLevel
}) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<number>(-1);
  const [totalScore, setTotalScore] = useState<number>(0);

  const runTests = async () => {
    if (!code.trim()) {
      alert('Please write some code before running tests!');
      return;
    }

    setResults([]);
    setCurrentTest(0);
    
    const testResults: TestResult[] = [];
    let score = 0;

    for (let i = 0; i < testCases.length; i++) {
      setCurrentTest(i);
      const testCase = testCases[i];
      
      // Simulate test execution delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      
      try {
        const result = await executeTest(testCase, code);
        testResults.push(result);
        
        if (result.passed) {
          score += result.score;
        }
        
        setResults([...testResults]);
      } catch (error) {
        const errorResult: TestResult = {
          testId: testCase.id,
          passed: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          score: 0
        };
        testResults.push(errorResult);
        setResults([...testResults]);
      }
    }

    // Calculate final score with time and focus bonuses
    const baseScore = score;
    const timeBonus = Math.max(0, (timeRemaining / 3600) * 20); // Up to 20 points for time
    const focusBonus = Math.max(0, (focusLevel / 100) * 10); // Up to 10 points for focus
    const finalScore = Math.min(100, Math.round(baseScore + timeBonus + focusBonus));
    
    setTotalScore(finalScore);
    setCurrentTest(-1);
    onTestComplete(testResults, finalScore);
  };

  const executeTest = async (testCase: TestCase, userCode: string): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      // Simulate different test scenarios based on test case
      const passed = simulateTestExecution(testCase, userCode);
      const executionTime = Date.now() - startTime;
      
      return {
        testId: testCase.id,
        passed,
        actualOutput: passed ? testCase.expected : 'Incorrect output',
        executionTime,
        score: passed ? testCase.weight * 20 : 0 // Each test worth up to 20 points based on weight
      };
    } catch (error) {
      return {
        testId: testCase.id,
        passed: false,
        error: error instanceof Error ? error.message : 'Execution error',
        executionTime: Date.now() - startTime,
        score: 0
      };
    }
  };

  const simulateTestExecution = (testCase: TestCase, userCode: string): boolean => {
    // Simple simulation logic - in real implementation, this would execute actual code
    const codeQuality = analyzeCode(userCode);
    const testComplexity = testCase.weight;
    
    // Higher chance of passing for better code and simpler tests
    const passChance = (codeQuality * 0.7) + ((1 - testComplexity) * 0.3);
    return Math.random() < passChance;
  };

  const analyzeCode = (code: string): number => {
    let quality = 0.5; // Base quality
    
    // Check for common good practices
    if (code.includes('function') || code.includes('=>')) quality += 0.1;
    if (code.includes('return')) quality += 0.1;
    if (code.includes('if') || code.includes('for') || code.includes('while')) quality += 0.1;
    if (code.includes('try') || code.includes('catch')) quality += 0.1;
    if (code.length > 100) quality += 0.1; // Some implementation effort
    if (code.includes('//') || code.includes('/*')) quality += 0.05; // Comments
    
    // Penalize empty or minimal code
    if (code.trim().length < 50) quality -= 0.3;
    if (!code.includes('return')) quality -= 0.2;
    
    return Math.max(0, Math.min(1, quality));
  };

  const getTestIcon = (testId: string) => {
    const result = results.find(r => r.testId === testId);
    const isCurrentTest = testCases.findIndex(tc => tc.id === testId) === currentTest;
    
    if (isCurrentTest) {
      return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    }
    
    if (!result) {
      return <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />;
    }
    
    return result.passed ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Test Cases</h3>
          <button
            onClick={runTests}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-md transition-colors"
          >
            {isRunning ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isRunning ? 'Running...' : 'Run Tests'}
          </button>
        </div>
        
        {/* Score Display */}
        {results.length > 0 && (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className={`font-semibold ${getScoreColor(totalScore)}`}>
                Score: {totalScore}/100
              </span>
            </div>
            <div className="text-gray-500">
              Passed: {results.filter(r => r.passed).length}/{results.length}
            </div>
          </div>
        )}
      </div>

      {/* Test Cases List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {testCases.map((testCase, index) => {
          const result = results.find(r => r.testId === testCase.id);
          const isCurrentTest = index === currentTest;
          
          return (
            <div
              key={testCase.id}
              className={`p-3 border rounded-lg transition-colors ${
                isCurrentTest 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : result?.passed 
                    ? 'border-green-200 bg-green-50 dark:bg-green-900/20'
                    : result && !result.passed
                      ? 'border-red-200 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTestIcon(testCase.id)}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {testCase.name}
                  </span>
                  {testCase.isHidden && (
                    <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                      Hidden
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Weight: {testCase.weight}
                </div>
              </div>
              
              {/* Test Details */}
              {!testCase.isHidden && (
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Input:</span>
                    <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono overflow-x-auto">
                      {typeof testCase.input === 'string' ? testCase.input : JSON.stringify(testCase.input, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Expected:</span>
                    <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono overflow-x-auto">
                      {typeof testCase.expected === 'string' ? testCase.expected : JSON.stringify(testCase.expected, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              {/* Test Result */}
              {result && (
                <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                        {result.passed ? 'PASSED' : 'FAILED'}
                      </span>
                      {result.executionTime && (
                        <span className="flex items-center gap-1 text-gray-500">
                          <Clock className="w-3 h-3" />
                          {result.executionTime}ms
                        </span>
                      )}
                    </div>
                    <span className={`font-semibold ${getScoreColor(result.score)}`}>
                      +{result.score} pts
                    </span>
                  </div>
                  
                  {result.error && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                      <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs font-medium mb-1">
                        <AlertCircle className="w-3 h-3" />
                        Error
                      </div>
                      <pre className="text-xs text-red-700 dark:text-red-300 font-mono">
                        {result.error}
                      </pre>
                    </div>
                  )}
                  
                  {result.actualOutput && !result.passed && (
                    <div className="mt-2">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Actual Output:</span>
                      <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono overflow-x-auto">
                        {typeof result.actualOutput === 'string' ? result.actualOutput : JSON.stringify(result.actualOutput, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Footer Info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <p>• Test cases are immutable and cannot be modified</p>
          <p>• Score is calculated based on passed tests, time remaining, and focus level</p>
          <p>• Hidden test cases will only show pass/fail status</p>
        </div>
      </div>
    </div>
  );
};