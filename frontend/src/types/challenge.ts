export type ChallengeType = 'frontend' | 'backend-api' | 'dsa';
export type ChallengeDifficulty = 'Easy' | 'Medium' | 'Hard';
export type TestCaseType = 'unit' | 'integration' | 'visual' | 'performance';
export type ValidationRuleType = 'exact-match' | 'pattern-match' | 'performance-threshold' | 'accessibility-check';
export type TestCriticality = 'high' | 'medium' | 'low';

export interface ChallengeScenario {
  background: string;
  stakeholders: string[];
  businessContext: string;
  constraints: string[];
}

export interface FileStructure {
  path: string;
  content: string;
  language: string;
  readOnly?: boolean;
}

export interface EnvironmentConfig {
  type: ChallengeType;
  runtime: string;
  dependencies: string[];
  ports?: number[];
  database?: {
    type: 'mongodb' | 'postgresql' | 'mysql' | 'sqlite';
    seedData?: any[];
  };
}

export interface ValidationRule {
  type: ValidationRuleType;
  criteria: any;
  errorMessage: string;
}

export interface TestCase {
  id: string;
  type: TestCaseType;
  description: string;
  input: any;
  expectedOutput: any;
  validationRules: ValidationRule[];
  metadata: {
    timeout: number;
    retries: number;
    criticality: TestCriticality;
  };
}

export interface PerformanceCriteria {
  maxExecutionTime: number;
  maxMemoryUsage: number;
  minThroughput?: number;
  maxLatency?: number;
}

export interface ChallengeMetadata {
  estimatedTime: number;
  realWorldContext: string;
  learningObjectives: string[];
  tags: string[];
  rating: number;
  completions: number;
  xp: number;
  teamSize: string;
  distractionTypes: string[];
  focusRating: number;
  popularity: number;
}

export interface Challenge {
  id: string;
  title: string;
  type: ChallengeType;
  difficulty: ChallengeDifficulty;
  timeLimit: string;
  distractionLevel: string;
  description: string;
  scenario: ChallengeScenario;
  implementation: {
    startingFiles: FileStructure[];
    dependencies: string[];
    environment: EnvironmentConfig;
  };
  testing: {
    testCases: TestCase[];
    validationRules: ValidationRule[];
    performanceCriteria?: PerformanceCriteria;
  };
  metadata: ChallengeMetadata;
}

// Frontend-specific interfaces
export interface FrontendEnvironment {
  previewPane: {
    viewports: ('desktop' | 'tablet' | 'mobile')[];
    autoRefresh: boolean;
    securitySandbox: boolean;
  };
  codeEditor: {
    language: 'html' | 'css' | 'javascript' | 'typescript' | 'react';
    linting: boolean;
    autoComplete: boolean;
  };
  testing: {
    visualRegression: boolean;
    accessibilityCheck: boolean;
    performanceAudit: boolean;
  };
}

// Backend API-specific interfaces
export interface RequestBuilder {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: Record<string, string>;
  body?: any;
}

export interface ResponseInspector {
  status: number;
  headers: Record<string, string>;
  body: any;
  timing: {
    total: number;
    dns: number;
    connect: number;
    send: number;
    wait: number;
    receive: number;
  };
}

export interface BackendEnvironment {
  apiClient: {
    requestBuilder: RequestBuilder;
    responseInspector: ResponseInspector;
    authenticationSupport: boolean;
  };
  database: {
    type: 'mongodb' | 'postgresql' | 'mysql' | 'sqlite';
    seedData: any[];
    isolationLevel: 'challenge' | 'user';
  };
  testing: {
    integrationTests: boolean;
    loadTesting: boolean;
    securityScanning: boolean;
  };
}

// DSA-specific interfaces
export interface DSAEnvironment {
  executor: {
    languages: ('javascript' | 'python' | 'java' | 'cpp')[];
    timeLimit: number;
    memoryLimit: number;
  };
  validator: {
    correctnessTests: TestCase[];
    performanceTests: PerformanceTest[];
    edgeCaseGeneration: boolean;
  };
  analysis: {
    complexityMeasurement: boolean;
    codeQualityMetrics: boolean;
    optimizationSuggestions: boolean;
  };
}

export interface PerformanceTest {
  id: string;
  description: string;
  inputSize: number;
  expectedComplexity: {
    time: string;
    space: string;
  };
  timeout: number;
}

// Secure test system interfaces
export interface SecureTestSystem {
  storage: {
    encryption: 'AES-256';
    keyRotation: boolean;
    accessLogging: boolean;
  };
  execution: {
    containerIsolation: boolean;
    networkRestrictions: boolean;
    resourceLimits: ResourceLimits;
  };
  feedback: {
    sanitizedResults: boolean;
    hintGeneration: boolean;
    progressTracking: boolean;
  };
}

export interface ResourceLimits {
  maxCpuUsage: number;
  maxMemoryUsage: number;
  maxExecutionTime: number;
  maxNetworkRequests: number;
}

// Scenario system interfaces
export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  urgency: 'low' | 'medium' | 'high';
}

export interface Change {
  id: string;
  type: 'requirement' | 'constraint' | 'scope';
  description: string;
  impact: string;
  timestamp: Date;
}

export interface TimeConstraint {
  id: string;
  description: string;
  deadline: Date;
  penalty: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  criteria: string[];
  reward: number;
}

export interface Feedback {
  id: string;
  type: 'positive' | 'negative' | 'neutral';
  message: string;
  source: string;
  timestamp: Date;
}

export interface ScenarioTemplate {
  id: string;
  name: string;
  description: string;
  industry: string;
  commonStakeholders: string[];
  typicalConstraints: string[];
  businessMetrics: string[];
}

export interface ScenarioSystem {
  templates: {
    ecommerce: ScenarioTemplate;
    healthcare: ScenarioTemplate;
    fintech: ScenarioTemplate;
    education: ScenarioTemplate;
  };
  simulation: {
    stakeholderMessages: Message[];
    requirementChanges: Change[];
    timeConstraints: TimeConstraint[];
  };
  progression: {
    milestones: Milestone[];
    feedback: Feedback[];
    realWorldMapping: string[];
  };
}

// Execution result interfaces
export interface ExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  performance?: {
    executionTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  testResults?: TestResult[];
}

export interface TestResult {
  testCaseId: string;
  passed: boolean;
  actualOutput?: any;
  error?: string;
  performance?: {
    executionTime: number;
    memoryUsage: number;
  };
  feedback?: string;
}