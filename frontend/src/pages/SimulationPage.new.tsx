import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { 
  Send, X, Users, Code, Globe, Database, Server, Zap, Target, AlertTriangle, 
  Clock, CheckCircle, Shield, XCircle, MessageSquare, GitBranch, MessageCircle,
  Briefcase, RotateCcw, Settings, User, Plus, Bug, Minimize2, Maximize2,
  Volume2, VolumeX, Activity, Check, GitBranch as GitBranchIcon
} from 'lucide-react';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import {
  SimulationState,
  getInitialState,
  TeamMessage,
  Deployment,
  DEFAULT_SYSTEM_HEALTH,
  DEFAULT_CHALLENGE,
  TestResult,
  SlackMessage,
  JiraComment,
  SystemHealth,
  Challenge,
  Distraction
} from '../types/simulation.types';

// Placeholder component for FrontendPreview
const FrontendPreview = ({ content, isLoading, errorMessage }: { 
  content: string; 
  isLoading: boolean; 
  errorMessage: string | null;
}) => {
  if (isLoading) return <div className="flex items-center justify-center h-full">Loading preview...</div>;
  if (errorMessage) return <div className="text-red-500 p-4">{errorMessage}</div>;
  return <div className="h-full bg-white p-4 overflow-auto">{content}</div>;
};

// Utility functions
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const SimulationPage: React.FC = () => {
  // Hooks and route params
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  
  // Get challenge type from URL params or use default
  const challengeType = searchParams.get('type') || 'dsa';
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const codeEditorRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const deploymentLogsEndRef = useRef<HTMLDivElement>(null);
  
  // Local UI state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTeamChat, setShowTeamChat] = useState(false);
  const [showDeployPanel, setShowDeployPanel] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  // Main simulation state - single source of truth
  const [simulationState, setSimulationState] = useState<SimulationState>(() => getInitialState(challengeType));
  
  // Destructure state for easier access
  const {
    activeActivity,
    challenge = DEFAULT_CHALLENGE,
    isLoading = false,
    error = null,
    testResults = [],
    deploymentStatus = 'idle',
    deploymentLogs = [],
    deploymentHistory = [],
    showDeploymentLogs = false,
    systemHealth = DEFAULT_SYSTEM_HEALTH,
    timeRemaining = 0,
    isTimerRunning = false,
    focusLevel = 100,
    stressLevel = 0,
    energyLevel = 100,
    distractions = [],
    isMuted = false,
    code = '',
    showHint = false,
    currentHintIndex = 0,
    isChallengeComplete = false,
    teamMessages = [],
    slackMessages = [],
    jiraComments = [],
    newMessage = ''
  } = simulationState;

  // State update helpers
  const updateState = useCallback((updates: Partial<SimulationState>) => {
    setSimulationState(prev => ({ ...prev, ...updates }));
  }, []);
  
  const updateTeamMessages = useCallback((message: Omit<TeamMessage, 'id' | 'timestamp'>) => {
    const newMessage: TeamMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    setSimulationState(prev => ({
      ...prev,
      teamMessages: [...prev.teamMessages, newMessage]
    }));
  }, []);
  
  // Handle code submission
  const handleSubmitCode = useCallback(() => {
    // Simulate test results
    const testResults: TestResult[] = [
      { id: '1', name: 'Test Case 1', passed: true, output: '✓ Passed' },
      { id: '2', name: 'Test Case 2', passed: true, output: '✓ Passed' },
      { 
        id: '3', 
        name: 'Test Case 3', 
        passed: false, 
        output: '✗ Failed: Expected [1, 2], got [1, 2, 3]' 
      }
    ];
    
    updateState({ 
      testResults,
      isChallengeComplete: testResults.every(t => t.passed)
    });
  }, [code]);
  
  // Memoized values
  const formattedTime = useMemo(() => formatTime(timeRemaining), [timeRemaining]);
  
  // Handle distraction action
  const handleDistractionAction = useCallback((action: string, distractionId: string) => {
    setSimulationState(prev => ({
      ...prev,
      distractions: prev.distractions.filter(d => d.id !== distractionId)
    }));
  }, []);
  
  // Handle deployment
  const handleDeploy = useCallback((environment: 'staging' | 'production') => {
    const newDeployment: Deployment = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      environment,
      status: 'in-progress',
      logs: [`Starting deployment to ${environment}...`]
    };
    
    updateState({ 
      deploymentStatus: 'in-progress',
      deploymentLogs: [...newDeployment.logs],
      deploymentHistory: [newDeployment, ...deploymentHistory]
    });
    
    // Simulate deployment
    setTimeout(() => {
      const isSuccess = Math.random() > 0.5;
      const status = isSuccess ? 'success' : 'failed';
      const logMessage = isSuccess 
        ? `✓ Successfully deployed to ${environment}`
        : `✗ Deployment to ${environment} failed`;
      
      updateState({
        deploymentStatus: status,
        deploymentLogs: [...deploymentLogs, logMessage],
        deploymentHistory: [
          {
            ...newDeployment,
            status,
            logs: [...newDeployment.logs, logMessage]
          },
          ...deploymentHistory.slice(1)
        ]
      });
    }, 3000);
  }, [deploymentHistory, deploymentLogs]);

  // Render the component
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 overflow-hidden' : 'pb-8'}`}>
      {/* System Health Bar */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-3 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${systemHealth.status === 'healthy' ? 'bg-green-500' : systemHealth.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                System: {systemHealth.status.charAt(0).toUpperCase() + systemHealth.status.slice(1)}
              </span>
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Time Remaining: {formattedTime}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => updateState({ isMuted: !isMuted })}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <button 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 py-6">
        {/* Challenge Header */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {challenge.title}
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                {challenge.description}
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 rounded-full">
                  {challenge.difficulty}
                </span>
                <span className="text-slate-500 dark:text-slate-400">
                  {challenge.points} points
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => setShowTeamChat(true)}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
              >
                <Users className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setShowDeployPanel(true)}
                className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 transition-colors"
              >
                <GitBranch className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Problem Description */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Problem Statement</h2>
            <div className="prose dark:prose-invert max-w-none">
              {challenge.problemStatement}
            </div>
            
            <h3 className="text-md font-semibold text-slate-900 dark:text-white mt-6 mb-3">Examples</h3>
            <div className="space-y-4">
              {challenge.examples.map((example, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <p className="font-medium text-slate-900 dark:text-white mb-1">Example {i + 1}:</p>
                  <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-sm overflow-x-auto">
                    <code className="text-slate-800 dark:text-slate-200">
                      {JSON.stringify(example.input, null, 2)}
                    </code>
                  </pre>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Output:</p>
                  <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-sm overflow-x-auto">
                    <code className="text-slate-800 dark:text-slate-200">
                      {JSON.stringify(example.output, null, 2)}
                    </code>
                  </pre>
                </div>
              ))}
            </div>
          </div>
          
          {/* Code Editor */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Code className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    solution.{challenge.language || 'js'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-xs px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
                  >
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </button>
                  <button 
                    onClick={handleSubmitCode}
                    className="text-xs px-3 py-1 rounded-md bg-green-100 hover:bg-green-200 dark:bg-green-900/50 dark:hover:bg-green-800/50 text-green-700 dark:text-green-300 transition-colors flex items-center"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Submit Code
                  </button>
                </div>
              </div>
              
              {showPreview ? (
                <div className="h-96 bg-white dark:bg-slate-900 p-4 overflow-auto">
                  <FrontendPreview 
                    content={code} 
                    isLoading={false} 
                    errorMessage={null} 
                  />
                </div>
              ) : (
                <textarea
                  ref={codeEditorRef}
                  value={code}
                  onChange={(e) => updateState({ code: e.target.value })}
                  className="w-full h-96 font-mono text-sm p-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none resize-none"
                  spellCheck="false"
                />
              )}
            </div>
            
            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Test Results
                  </h3>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {testResults.map((test) => (
                    <div key={test.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {test.passed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm font-medium text-slate-900 dark:text-white">
                            {test.name}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          test.passed 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                        }`}>
                          {test.passed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                      {test.output && (
                        <pre className="mt-2 text-xs bg-slate-50 dark:bg-slate-800 p-2 rounded overflow-x-auto">
                          <code className={test.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                            {test.output}
                          </code>
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Team Chat Modal */}
      {showTeamChat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Team Chat</h2>
              <button 
                onClick={() => setShowTeamChat(false)}
                className="text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {teamMessages.length > 0 ? (
                teamMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${
                      message.sender === 'You' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-none'
                    }`}>
                      <div className="text-xs font-medium mb-1">{message.sender}</div>
                      <div className="text-sm">{message.content}</div>
                      <div className="text-xs opacity-70 mt-1 text-right">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-500 dark:text-slate-400 py-8">
                  <MessageCircle className="h-10 w-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newMessage.trim()) {
                    updateTeamMessages({
                      sender: 'You',
                      content: newMessage,
                      avatar: user?.photoURL || ''
                    });
                    updateState({ newMessage: '' });
                  }
                }}
                className="flex space-x-2"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => updateState({ newMessage: e.target.value })}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors flex items-center justify-center"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Deploy Panel Modal */}
      {showDeployPanel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Deployment Center</h2>
              <button 
                onClick={() => setShowDeployPanel(false)}
                className="text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Staging */}
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-slate-900 dark:text-white">Staging</h3>
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
                      Development
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    Deploy the latest changes to the staging environment for testing.
                  </p>
                  <button
                    onClick={() => handleDeploy('staging')}
                    disabled={deploymentStatus === 'in-progress'}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deploymentStatus === 'in-progress' ? 'Deploying...' : 'Deploy to Staging'}
                  </button>
                </div>
                
                {/* Production */}
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-slate-900 dark:text-white">Production</h3>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                      Live
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    Deploy the latest changes to the production environment.
                  </p>
                  <button
                    onClick={() => handleDeploy('production')}
                    disabled={deploymentStatus === 'in-progress'}
                    className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deploymentStatus === 'in-progress' ? 'Deploying...' : 'Deploy to Production'}
                  </button>
                </div>
              </div>
              
              {/* Deployment Logs */}
              <div className="mt-8">
                <h3 className="text-md font-medium text-slate-900 dark:text-white mb-4">Deployment Logs</h3>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
                  {deploymentLogs.length > 0 ? (
                    <div className="space-y-1">
                      {deploymentLogs.map((log, i) => (
                        <div key={i} className="flex items-start">
                          <span className="text-slate-500 dark:text-slate-400 mr-2">$</span>
                          <span className="text-slate-900 dark:text-slate-200">{log}</span>
                        </div>
                      ))}
                      <div ref={deploymentLogsEndRef} />
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400">No deployment logs available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Distraction Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-40">
        {distractions.map((distraction) => (
          <div 
            key={distraction.id}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden w-80"
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {distraction.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {distraction.message}
                  </p>
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => handleDistractionAction('dismiss', distraction.id)}
                      className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded transition-colors"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleDistractionAction('handle', distraction.id)}
                      className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 rounded transition-colors"
                    >
                      Handle
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => handleDistractionAction('dismiss', distraction.id)}
                  className="text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimulationPage;
