// ===============================
// API RESPONSE TYPES
// ===============================

// Base API response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
  error?: {
    code: string;
    message: string;
    details?: any[];
    timestamp: string;
    path: string;
  };
}

// Pagination interface
export interface PaginationData<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ===============================
// USER TYPES
// ===============================
export interface User {
  _id: string;
  email: string;
  username: string;
  profile: UserProfile;
  stats: UserStats;
  preferences: UserPreferences;
  roles: ('user' | 'admin' | 'moderator')[];
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
}

export interface UserStats {
  level: number;
  xp: number;
  totalChallenges: number;
  completedChallenges: number;
  streak: number;
  lastActiveDate: string;
  completionRate?: number;
  averageScore?: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: {
    email: boolean;
    push: boolean;
    achievements: boolean;
    challenges: boolean;
  };
  privacy: {
    profilePublic: boolean;
    showStats: boolean;
    showActivity: boolean;
  };
}

// ===============================
// AUTHENTICATION TYPES
// ===============================
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    username: string;
    emailVerified: boolean;
  };
  message: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginCredentials {
  identifier: string; // Email or username
  password: string;
}

// ===============================
// CHALLENGE TYPES
// ===============================
export type ChallengeType = 'dsa' | 'bug-fix' | 'feature';
export type ChallengeDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface Challenge {
  _id: string;
  title: string;
  slug: string;
  description: string;
  type: ChallengeType;
  difficulty: ChallengeDifficulty;
  category: string;
  tags: string[];
  timeLimit: number;
  content: ChallengeContent;
  code: ChallengeCode;
  scenario?: ChallengeScenario;
  stats: ChallengeStats;
  author: {
    _id: string;
    username: string;
    profile?: UserProfile;
  };
  isPublic: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeContent {
  problemStatement: string;
  constraints?: string;
  examples: ChallengeExample[];
  hints?: string[];
  solution?: string;
  solutionExplanation?: string;
}

export interface ChallengeExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ChallengeCode {
  starterCode?: {
    javascript?: string;
    typescript?: string;
    python?: string;
    java?: string;
    cpp?: string;
  };
  testCases: TestCase[];
  validationRules?: ValidationRules;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  weight: number;
}

export interface ValidationRules {
  timeComplexity?: string;
  spaceComplexity?: string;
  forbiddenKeywords?: string[];
  requiredKeywords?: string[];
}

export interface ChallengeScenario {
  background: string;
  role: string;
  company: string;
  urgency: 'low' | 'medium' | 'high';
  distractions?: Distraction[];
}

export interface Distraction {
  type: string;
  frequency: string;
  content: string;
}

export interface ChallengeStats {
  totalAttempts: number;
  successfulAttempts: number;
  averageTime: number;
  averageScore: number;
  popularityScore: number;
  completionRate?: number;
  difficultyRating?: number;
}

// ===============================
// SUBMISSION TYPES
// ===============================
export type SubmissionLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'cpp';
export type SubmissionStatus = 'pending' | 'completed' | 'failed' | 'timeout';
export type SimulationMode = 'standard' | 'interview' | 'zen';
export type DistractionLevel = 'low' | 'medium' | 'high';

export interface Submission {
  _id: string;
  user: string;
  challenge: string | Challenge;
  code: string;
  language: SubmissionLanguage;
  execution: SubmissionExecution;
  simulation?: SubmissionSimulation;
  metadata: SubmissionMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionExecution {
  status: SubmissionStatus;
  score?: number;
  totalTests?: number;
  passedTests?: number;
  executionTime?: number;
  memoryUsage?: number;
  output?: string;
  error?: string;
  testResults?: TestResult[];
  executedInBrowser: boolean;
  browserEnvironment?: string;
}

export interface TestResult {
  testCase: string;
  passed: boolean;
  actualOutput?: string;
  executionTime?: number;
  error?: string;
}

export interface SubmissionSimulation {
  mode: SimulationMode;
  distractionLevel: DistractionLevel;
}

export interface SubmissionMetadata {
  ipAddress?: string;
  userAgent?: string;
  submittedAt: string;
  isCompleted: boolean;
}

// ===============================
// ACHIEVEMENT TYPES
// ===============================
export type AchievementCategory = 'beginner' | 'performance' | 'consistency' | 'social';
export type AchievementType = 'challenge_count' | 'streak' | 'score' | 'time' | 'special';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  _id: string;
  name: string;
  description: string;
  icon?: string;
  category: AchievementCategory;
  criteria: AchievementCriteria;
  rewards: AchievementRewards;
  rarity: AchievementRarity;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AchievementCriteria {
  type: AchievementType;
  target: number;
  conditions?: any;
}

export interface AchievementRewards {
  xp: number;
  badge?: string;
  title?: string;
}

export interface UserAchievement {
  _id: string;
  user: string;
  achievement: Achievement;
  unlockedAt: string;
}

// ===============================
// NOTIFICATION TYPES
// ===============================
export type NotificationType = 'achievement' | 'challenge' | 'social' | 'system';
export type NotificationPriority = 'low' | 'medium' | 'high';
export type NotificationChannel = 'email' | 'push';

export interface Notification {
  _id: string;
  recipient: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  status: NotificationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationStatus {
  isRead: boolean;
  isDelivered: boolean;
  deliveredAt?: string;
}

// ===============================
// COMMUNITY TYPES (Phase 3)
// ===============================
export type PostCategory = 'discussion' | 'help' | 'showcase' | 'tips' | 'news' | 'code-share';

export interface CommunityPost {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    username: string;
    profile?: UserProfile;
  };
  category: PostCategory;
  tags: string[];
  interactions: PostInteractions;
  createdAt: string;
  updatedAt: string;
}

export interface PostInteractions {
  likes: number;
  views: number;
  comments: number;
}

// ===============================
// TEMPLATE TYPES (Phase 4)
// ===============================
export type TemplateCategory = 'algorithm' | 'data-structure' | 'web-dev' | 'mobile' | 'backend' | 'devops';
export type TemplateFramework = 'React' | 'Next.js' | 'Node.js' | 'Vue' | 'Angular' | 'Express' | 'Vanilla';
export type TemplateDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type TemplateLanguage = 'javascript' | 'typescript' | 'html' | 'css' | 'react' | 'vue' | 'angular';

export interface Template {
  _id: string;
  title: string;
  description: string;
  author: {
    _id: string;
    username: string;
    profile?: UserProfile;
  };
  code: TemplateCode;
  metadata: TemplateMetadata;
  stats: TemplateStats;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateCode {
  htmlCode?: string;
  cssCode?: string;
  jsCode?: string;
  language: TemplateLanguage;
  framework: TemplateFramework;
}

export interface TemplateMetadata {
  category: TemplateCategory;
  difficulty: TemplateDifficulty;
  tags: string[];
}

export interface TemplateStats {
  stars: number;
  downloads: number;
  forks: number;
}

// ===============================
// LEARNING TYPES (Phase 5)
// ===============================
export interface LearningPlaylist {
  _id: string;
  title: string;
  description: string;
  instructor: {
    _id: string;
    username: string;
    profile?: UserProfile;
  };
  metadata: PlaylistMetadata;
  stats: PlaylistStats;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistMetadata {
  category: string;
  difficulty: TemplateDifficulty;
  duration: number; // in minutes
  lessonCount: number;
}

export interface PlaylistStats {
  enrollments: number;
  completions: number;
  rating: number;
}

// ===============================
// SYSTEM TYPES
// ===============================
export interface HealthCheck {
  status: 'OK' | 'ERROR';
  timestamp: string;
  uptime: number;
  environment: string;
}

export interface ApiInfo {
  message: string;
  version: string;
  timestamp: string;
  endpoints: Record<string, string>;
}

// ===============================
// QUERY PARAMETER TYPES
// ===============================
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ChallengeFilters extends PaginationParams {
  search?: string;
  type?: ChallengeType;
  difficulty?: ChallengeDifficulty;
  category?: string;
  tags?: string[];
  timeLimit?: number;
  author?: string;
}

export interface UserFilters extends PaginationParams {
  search?: string;
  level?: number;
  minXp?: number;
  maxXp?: number;
  roles?: string[];
  isActive?: boolean;
  emailVerified?: boolean;
}

export interface SubmissionFilters extends PaginationParams {
  challenge?: string;
  language?: SubmissionLanguage;
  status?: SubmissionStatus;
  minScore?: number;
  maxScore?: number;
}

export interface NotificationFilters extends PaginationParams {
  type?: NotificationType;
  priority?: NotificationPriority;
  isRead?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

// ===============================
// ERROR TYPES
// ===============================
export interface ApiError {
  code: string;
  message: string;
  details?: any[];
  timestamp: string;
  path: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value: any;
}

// ===============================
// DASHBOARD TYPES
// ===============================
export interface DashboardData {
  profile: UserProfile;
  stats: UserStats;
  recentActivity: RecentActivity[];
  streak: number;
  rank: number;
  focusRating: number;
  focusAnalysis: FocusAnalysis;
  codingStats: CodingStats;
  weeklyStats: WeeklyStats;
}

export interface RecentActivity {
  id: string;
  title: string;
  type: 'dsa' | 'bug-fix' | 'feature';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completedAt: string;
  score: number;
  xp: number;
  timeSpent: string;
  distractionLevel: 'low' | 'medium' | 'high';
}

export interface FocusAnalysis {
  averageFocus: number;
  bestStreak: number;
  distractionResistance: 'Poor' | 'Fair' | 'Good' | 'Excellent';
}

export interface CodingStats {
  linesOfCode: number;
  bugsFixed: number;
  codeQuality: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D' | 'F';
}

export interface WeeklyStats {
  xpGained: number;
  challengesCompleted: number;
  rankChange: number;
}

// ===============================
// REQUEST BODY TYPES
// ===============================
export interface CreateChallengeRequest {
  title: string;
  description: string;
  type: ChallengeType;
  difficulty: ChallengeDifficulty;
  category: string;
  tags: string[];
  timeLimit?: number;
  content: ChallengeContent;
  code: ChallengeCode;
  scenario?: ChallengeScenario;
  isPublic?: boolean;
}

export interface CreateSubmissionRequest {
  challengeId: string;
  code: string;
  language: SubmissionLanguage;
  simulation?: SubmissionSimulation;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
  };
}

export interface ProcessExecutionResultsRequest {
  status: SubmissionStatus;
  score?: number;
  totalTests?: number;
  passedTests?: number;
  executionTime?: number;
  memoryUsage?: number;
  output?: string;
  error?: string;
  testResults?: TestResult[];
  browserEnvironment?: string;
}

export interface CreateAchievementRequest {
  name: string;
  description: string;
  icon?: string;
  category: AchievementCategory;
  criteria: AchievementCriteria;
  rewards?: AchievementRewards;
  rarity?: AchievementRarity;
  isActive?: boolean;
}