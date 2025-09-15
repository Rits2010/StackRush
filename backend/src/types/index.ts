import { Request } from 'express';
import { Document, ObjectId } from 'mongoose';

// Simplified user type for request context
export interface RequestUser {
  id: string;
  _id: ObjectId;
  email: string;
  username: string;
  roles: string[];
  [key: string]: any; // Allow additional properties
}

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: RequestUser;
}

// Common API response interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
}

export interface PaginatedResult<T> {
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

// Common query interfaces
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface FilterQuery extends PaginationQuery {
  search?: string;
  category?: string;
  difficulty?: string;
  tags?: string[];
  status?: string;
}

// User related interfaces
export interface UserStats {
  level: number;
  xp: number;
  totalChallenges: number;
  completedChallenges: number;
  streak: number;
  lastActiveDate: Date;
  completionRate: number;
  averageScore: number;
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

// Challenge related interfaces
export interface ChallengeFilters extends FilterQuery {
  type?: 'dsa' | 'bug-fix' | 'feature';
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  timeLimit?: number;
  author?: string;
}

export interface ChallengeStats {
  totalAttempts: number;
  successfulAttempts: number;
  averageTime?: number;
  averageScore?: number;
  popularityScore: number;
  difficultyRating: number;
  completionRate: number;
}

// Submission related interfaces
export interface SubmissionFilters extends FilterQuery {
  challenge?: string;
  language?: string;
  status?: 'pending' | 'completed' | 'failed' | 'timeout';
  minScore?: number;
  maxScore?: number;
}

export interface ExecutionResults {
  status: 'completed' | 'failed' | 'timeout';
  totalTests: number;
  passedTests: number;
  executionTime: number;
  memoryUsage: number;
  output?: string;
  error?: string;
  testResults: Array<{
    testCase: string;
    passed: boolean;
    actualOutput?: string;
    executionTime?: number;
    error?: string;
  }>;
  browserEnvironment?: string;
}

// Achievement related interfaces
export interface AchievementCriteria {
  type: 'challenge_count' | 'streak' | 'score' | 'time' | 'special';
  target: number;
  conditions?: Record<string, any>;
}

export interface AchievementRewards {
  xp: number;
  badge?: string;
  title?: string;
}

// Notification interfaces
export interface NotificationData {
  type: 'achievement' | 'challenge' | 'social' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  recipient: string;
}

// Focus session interfaces
export interface FocusSessionFilters extends FilterQuery {
  challenge?: string;
  environment?: 'zen' | 'standard' | 'interview';
  minFocusScore?: number;
  maxFocusScore?: number;
}

// Database document interfaces
export interface BaseDocument extends Document {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}