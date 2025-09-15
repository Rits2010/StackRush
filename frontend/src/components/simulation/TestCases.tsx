import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { ProfessionalCard } from '../ui/ProfessionalCard';
import { TestCase } from '../../types/simulation';

interface TestCasesProps {
  testCases: TestCase[];
  type: 'dsa' | 'bug-fix' | 'feature';
}

export const TestCases = ({ testCases, type }: TestCasesProps) => {
  const [showTestCases, setShowTestCases] = useState(false);

  return (
    <ProfessionalCard className="p-6 mb-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
          <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-2">
            <CheckCircle className="h-3 w-3 text-white" />
          </div>
          Test Cases
        </h3>
        <button
          onClick={() => setShowTestCases(!showTestCases)}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
        >
          {showTestCases ? 'Hide' : 'Show'}
        </button>
      </div>

      {showTestCases && (
        <div className="space-y-3">
          {testCases.map((test, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg border ${
                test.status === 'passed' 
                  ? 'bg-green-500 bg-opacity-10 border-green-500 border-opacity-30' 
                  : test.status === 'failed' 
                    ? 'bg-red-500 bg-opacity-10 border-red-500 border-opacity-30' 
                    : 'bg-slate-100 dark:bg-slate-800 dark:bg-opacity-30 border-slate-200 dark:border-slate-600 dark:border-opacity-30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-900 dark:text-white text-sm font-medium">
                  Test {index + 1}
                </span>
                <div 
                  className={`w-3 h-3 rounded-full ${
                    test.status === 'passed' 
                      ? 'bg-green-500' 
                      : test.status === 'failed' 
                        ? 'bg-red-500' 
                        : 'bg-slate-400'
                  }`}
                />
              </div>
              
              {type === 'dsa' && test.input && test.expected && (
                <>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                    Input: {test.input}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Expected: {test.expected}
                  </div>
                </>
              )}
              
              {type === 'bug-fix' && test.input && test.expected && (
                <>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                    Test: {test.input}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Expected: {test.expected}
                  </div>
                </>
              )}
              
              {type === 'feature' && test.description && (
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {test.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </ProfessionalCard>
  );
};
