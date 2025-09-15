// Type Definitions
export type DeploymentStatus = 'idle' | 'deploying' | 'success' | 'failed' | 'pending' | 'building';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type MessageType = 'info' | 'warning' | 'error' | 'success' | 'urgent';
export type DistractionType = 'call' | 'meeting' | 'message' | 'alert' | 'question';
export type TestStatus = 'passed' | 'failed' | 'running' | 'pending';
export type ActivityType = 'coding' | 'debugging' | 'testing' | 'deploying' | 'documentation' | 'meeting';
export type HealthStatus = 'healthy' | 'warning' | 'critical';

export interface TestResult {
  id: string;
  name: string;
  status: TestStatus;
  message?: string;
}

export interface Deployment {
  id: string;
  type: 'staging' | 'production' | 'test';
  status: DeploymentStatus;
  timestamp: string;
  logs: string[];
}

export interface TeamMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  type: MessageType;
  isUser?: boolean;
}

export interface SlackMessage {
  id: string;
  channel: string;
  user: string;
  text: string;
  timestamp: string;
}

export interface JiraComment {
  id: string;
  author: string;
  body: string;
  created: string;
}

export interface SystemHealth {
  cpu: number;
  memory: number;
  network: number;
  status: HealthStatus;
  api: number;
  database: number;
  cache: number;
  build: number;
}

export interface Distraction {
  id: string;
  type: DistractionType;
  title: string;
  message: string;
  timestamp: string;
  actions: string[];
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  category: string;
  mode: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  timeLimit: number;
  requirements: string[];
  starterCode: string;
  solution: string;
  testCases: any[]; // Consider creating a more specific type for test cases
  hints: string[];
}

export interface SimulationState {
  // Core UI state
  activeActivity: ActivityType;
  isSidebarOpen: boolean;
  isMobileView: boolean;
  currentTab: string;
  
  // Challenge & Activity
  challenge: Challenge | null;
  isLoading: boolean;
  error: string | null;
  timeRemaining: number;
  isTimerRunning: boolean;
  showPreview: boolean;
  
  // Test & Deployment
  testResults: TestResult[];
  deploymentStatus: DeploymentStatus;
  deploymentLogs: DeploymentLog[];
  deploymentHistory: Deployment[];
  showDeploymentLogs: boolean;
  
  // Communication
  teamMessages: TeamMessage[];
  slackMessages: Message[];
  jiraComments: Message[];
  newMessage: string;
  
  // System & Build
  systemHealth: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
    status: HealthStatus;
    api: number;
    databaseStatus: number;
    cache: number;
    build: number;
  };
  buildStatus: 'idle' | 'building' | 'success' | 'failed';
  buildProgress: number;
  buildLogs: string[];
  
  // Mood & Focus
  focusLevel: number;
  stressLevel: number;
  managerMood: 'happy' | 'neutral' | 'angry';
  clientMood: 'happy' | 'neutral' | 'angry';
  energyLevel: number;
  
  // Distractions
  distractions: Array<{
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    timestamp: string;
    resolved: boolean;
  }>;
  
  // Code & Hints
  code: string;
  showHint: boolean;
  currentHintIndex: number;
  isChallengeComplete: boolean;
  currentStep: number;
  completedSteps: number[];
  bugs?: Array<{ id: string; description: string; status: 'open' | 'fixed' | 'wontfix' }>;
  slackMessages?: Array<{ id: string; text: string; sender: string; timestamp: string }>;
  jiraComments?: Array<{ id: string; text: string; author: string; timestamp: string }>;
}

// Default system health configuration
export const DEFAULT_SYSTEM_HEALTH: {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  status: HealthStatus;
  api: number;
  databaseStatus: number;
  cache: number;
  build: number;
} = {
  cpu: 30,
  memory: 45,
  disk: 90,
  network: 90,
  status: 'healthy',
  api: 100,
  databaseStatus: 100,
  cache: 100,
  build: 100
};

// Default challenge data
export const DEFAULT_CHALLENGE: Challenge = {
  id: '1',
  title: 'Challenge Title',
  description: 'Challenge description goes here...',
  difficulty: 'medium',
  points: 100,
  timeLimit: 60,
  hints: [
    'This is a hint for the default challenge.',
    'Here\'s another hint to help you out.'
  ],
  solution: '// Default solution code\nfunction solution() {\n  // Your solution here\n}',
  testCases: []
};

// Function to get initial state
export const getInitialState = (): SimulationState => ({
  // Core UI state
  activeActivity: 'coding',
  isSidebarOpen: true,
  isMobileView: false,
  currentTab: 'editor',
  
  // Challenge & Activity state
  challenge: DEFAULT_CHALLENGE,
  isLoading: false,
  error: null,
  timeRemaining: 3600, // 60 minutes in seconds
  isTimerRunning: true,
  showPreview: false,
  
  // Test & Deployment state
  testResults: [],
  deploymentStatus: 'idle',
  deploymentLogs: [],
  deploymentHistory: [],
  showDeploymentLogs: false,
  
  // Communication state
  teamMessages: [],
  slackMessages: [],
  jiraComments: [],
  newMessage: '',
  
  // System & Build state
  systemHealth: { ...DEFAULT_SYSTEM_HEALTH },
  buildStatus: 'idle',
  buildProgress: 0,
  buildLogs: [],
  
  // Mood & Focus state
  focusLevel: 100,
  stressLevel: 0,
  energyLevel: 100,
  managerMood: 75,
  clientMood: 75,
  
  // Distractions
  distractions: [],
  showDistractions: false,
  isMuted: false,
  
  // Challenge specific state
  code: DEFAULT_CHALLENGE.starterCode || '',
  showHint: false,
  currentHintIndex: 0,
  isChallengeComplete: false
});
