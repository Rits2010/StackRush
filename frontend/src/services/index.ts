// ===============================
// MAIN API EXPORTS
// ===============================

// Export all API services
export {
  authApi,
  usersApi,
  challengesApi,
  submissionsApi,
  achievementsApi,
  notificationsApi,
  communityApi,
  templatesApi,
  learningApi,
  systemApi,
} from './api';

// Export error handling utilities
export {
  default as ErrorHandler,
  ApiException,
  ValidationException,
  isApiError,
  isValidationError,
  ERROR_CODES,
  HTTP_STATUS,
  getErrorMessage,
  formatValidationErrors,
  isErrorCode,
  createErrorToast,
  handleGlobalError,
} from './errorHandler';

// Export all type definitions
export type {
  // Base API types
  ApiResponse,
  PaginationData,
  
  // User types
  User,
  UserProfile,
  UserStats,
  UserPreferences,
  
  // Authentication types
  AuthTokens,
  LoginResponse,
  RegisterData,
  LoginCredentials,
  
  // Challenge types
  Challenge,
  ChallengeType,
  ChallengeDifficulty,
  ChallengeContent,
  ChallengeCode,
  ChallengeScenario,
  ChallengeStats,
  ChallengeFilters,
  CreateChallengeRequest,
  
  // Submission types
  Submission,
  SubmissionLanguage,
  SubmissionStatus,
  SimulationMode,
  DistractionLevel,
  CreateSubmissionRequest,
  ProcessExecutionResultsRequest,
  SubmissionFilters,
  
  // Achievement types
  Achievement,
  AchievementCategory,
  AchievementType,
  AchievementRarity,
  UserAchievement,
  CreateAchievementRequest,
  
  // Notification types
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationFilters,
  
  // Community types (Phase 3)
  CommunityPost,
  PostCategory,
  
  // Template types (Phase 4)
  Template,
  TemplateCategory,
  TemplateFramework,
  TemplateDifficulty,
  TemplateLanguage,
  
  // Learning types (Phase 5)
  LearningPlaylist,
  
  // System types
  HealthCheck,
  ApiInfo,
  
  // Error types
  ApiError,
  ValidationError,
  
  // Filter types
  PaginationParams,
  UserFilters,
} from '../types/api';

// Export the default axios instance
export { default as apiClient } from './api';

// ===============================
// CONVENIENCE EXPORTS
// ===============================

// Create convenient grouped exports for easier imports
export const API = {
  auth: () => import('./api').then(m => m.authApi),
  users: () => import('./api').then(m => m.usersApi),
  challenges: () => import('./api').then(m => m.challengesApi),
  submissions: () => import('./api').then(m => m.submissionsApi),
  achievements: () => import('./api').then(m => m.achievementsApi),
  notifications: () => import('./api').then(m => m.notificationsApi),
  community: () => import('./api').then(m => m.communityApi),
  templates: () => import('./api').then(m => m.templatesApi),
  learning: () => import('./api').then(m => m.learningApi),
  system: () => import('./api').then(m => m.systemApi),
};

// Export ready-to-use API hooks (these can be implemented later)
export const useAuth = () => {
  // TODO: Implement auth hook
  console.warn('useAuth hook not yet implemented');
};

export const useUser = () => {
  // TODO: Implement user hook
  console.warn('useUser hook not yet implemented');
};

export const useChallenges = () => {
  // TODO: Implement challenges hook
  console.warn('useChallenges hook not yet implemented');
};

// ===============================
// API DOCUMENTATION REFERENCE
// ===============================

/**
 * API Integration Documentation
 * 
 * This file integrates all the APIs documented in api-documentation.json
 * 
 * IMPLEMENTED APIS:
 * - Authentication API (Complete) - /auth/*
 * - Users API (Complete) - /users/*
 * - Challenges API (Complete) - /challenges/*
 * - Submissions API (Complete) - /submissions/*
 * - Achievements API (Complete) - /achievements/*
 * - Notifications API (Complete) - /notifications/*
 * - System API (Complete) - /health, /api
 * 
 * PLANNED APIS (Phase implementations):
 * - Community API (Phase 3) - /community/*
 * - Templates API (Phase 4) - /templates/*
 * - Learning API (Phase 5) - /learning/*
 * 
 * USAGE EXAMPLES:
 * 
 * // Authentication
 * import { authApi } from './services';
 * const result = await authApi.login({ identifier: 'user@example.com', password: 'password123' });
 * 
 * // Challenges with filters
 * import { challengesApi } from './services';
 * const challenges = await challengesApi.getChallenges({ 
 *   difficulty: 'Medium', 
 *   type: 'dsa', 
 *   page: 1 
 * });
 * 
 * // Error handling
 * import { getErrorMessage, isValidationError } from './services';
 * try {
 *   await authApi.register(userData);
 * } catch (error) {
 *   if (isValidationError(error)) {
 *     const fieldErrors = error.getFieldErrors();
 *     // Handle field-specific errors
 *   } else {
 *     const message = getErrorMessage(error);
 *     // Show user-friendly error message
 *   }
 * }
 * 
 * // Type-safe API calls
 * import type { Challenge, User } from './services';
 * const user: User = await usersApi.getProfile();
 * const challenge: Challenge = await challengesApi.getChallengeById('123');
 */