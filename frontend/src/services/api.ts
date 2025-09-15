import axios, { AxiosResponse } from 'axios';
import type {
  ApiResponse,
  PaginationData,
  User,
  UserProfile,
  UserPreferences,
  AuthTokens,
  LoginResponse,
  RegisterResponse,
  RegisterData,
  LoginCredentials,
  Challenge,
  ChallengeFilters,
  CreateChallengeRequest,
  ChallengeStats,
  Submission,
  CreateSubmissionRequest,
  ProcessExecutionResultsRequest,
  SubmissionFilters,
  Achievement,
  CreateAchievementRequest,
  UserAchievement,
  Notification,
  NotificationFilters,
  CommunityPost,
  PostCategory,
  Template,
  TemplateCategory,
  TemplateFramework,
  TemplateDifficulty,
  LearningPlaylist,
  HealthCheck,
  ApiInfo,
  DashboardData,
} from '../types/api';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance with base URL and common headers
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config;
    
    // Skip token refresh for auth endpoints (login, register, etc.)
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                          originalRequest.url?.includes('/auth/register') ||
                          originalRequest.url?.includes('/auth/refresh') ||
                          originalRequest.url?.includes('/auth/forgot-password') ||
                          originalRequest.url?.includes('/auth/reset-password');
    
    // If error is 401 and we haven't tried to refresh yet, and it's not an auth endpoint
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');
        
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
        localStorage.setItem('accessToken', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        
        // Update the auth header and retry the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens but don't redirect immediately
        // Let the auth context handle the redirect properly
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        // Only redirect if we're not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle API requests
const handleApiRequest = async <T>(request: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> => {
  try {
    const response = await request;
    if (response.data.success) {
      return response.data.data as T;
    } else {
      // Create a proper error object with API error details
      const apiError = new Error(response.data.error?.message || 'API request failed');
      (apiError as any).code = response.data.error?.code;
      (apiError as any).details = response.data.error?.details;
      (apiError as any).status = response.status;
      throw apiError;
    }
  } catch (error: any) {
    // Preserve the original error structure if it's an axios error
    if (error.response?.data?.error) {
      const apiError = new Error(error.response.data.error.message || 'API request failed');
      (apiError as any).code = error.response.data.error.code;
      (apiError as any).details = error.response.data.error.details;
      (apiError as any).status = error.response.status;
      (apiError as any).response = error.response;
      throw apiError;
    }
    
    // For network/other errors, preserve the original error
    throw error;
  }
};

// ===============================
// AUTHENTICATION API
// ===============================
export const authApi = {
  // User registration
  register: (userData: RegisterData) => 
    handleApiRequest<RegisterResponse>(api.post('/auth/register', userData)),

  // User login
  login: (credentials: LoginCredentials) => 
    handleApiRequest<LoginResponse>(api.post('/auth/login', credentials)),

  // Refresh access token
  refreshToken: (refreshToken: string) => 
    handleApiRequest<AuthTokens>(api.post('/auth/refresh', { refreshToken })),

  // Logout user
  logout: (refreshToken: string) => 
    handleApiRequest<void>(api.post('/auth/logout', { refreshToken })),

  // Request password reset email
  forgotPassword: (email: string) => 
    handleApiRequest<void>(api.post('/auth/forgot-password', { email })),

  // Reset password using reset token
  resetPassword: (token: string, password: string) => 
    handleApiRequest<void>(api.post('/auth/reset-password', { token, password })),

  // Verify email address
  verifyEmail: (token: string) => 
    handleApiRequest<void>(api.post('/auth/verify-email', { token })),

  // Change password for authenticated user
  changePassword: (currentPassword: string, newPassword: string) => 
    handleApiRequest<void>(api.post('/auth/change-password', { currentPassword, newPassword })),
};

// ===============================
// USERS API
// ===============================
export const usersApi = {
  // Get current user profile
  getProfile: () => handleApiRequest<User>(api.get('/users/profile')),

  // Update current user profile
  updateProfile: (profile: UserProfile) => 
    handleApiRequest<User>(api.put('/users/profile', { profile })),

  // Update user preferences
  updatePreferences: (preferences: UserPreferences) => 
    handleApiRequest<void>(api.put('/users/preferences', preferences)),

  // Get user by ID
  getUserById: (id: string) => 
    handleApiRequest<User>(api.get(`/users/${id}`)),

  // Get user by username
  getUserByUsername: (username: string) => 
    handleApiRequest<User>(api.get(`/users/username/${username}`)),

  // Get user statistics
  getUserStats: (id: string) => 
    handleApiRequest<any>(api.get(`/users/${id}/stats`)),

  // Get comprehensive user dashboard data
  getDashboard: () => 
    handleApiRequest<DashboardData>(api.get('/users/dashboard')),

  // Get platform statistics
  getPlatformStats: () => 
    handleApiRequest<any>(api.get('/users/stats')),

  // Get leaderboard
  getLeaderboard: (params?: {
    type?: 'xp' | 'level' | 'streak' | 'completed';
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    return handleApiRequest<User[]>(api.get(`/users/leaderboard?${queryParams}`));
  },

  // Get users list (Admin only)
  getUsers: (params?: any) => {
    const queryParams = new URLSearchParams(params as any).toString();
    return handleApiRequest<PaginationData<User>>(api.get(`/users?${queryParams}`));
  },

  // Delete current user account
  deleteAccount: () => handleApiRequest<void>(api.delete('/users/account')),
};

// ===============================
// CHALLENGES API
// ===============================
export const challengesApi = {
  // Get challenges with filters and pagination
  getChallenges: (params?: ChallengeFilters) => {
    // Ensure numeric parameters are properly typed as numbers
    const processedParams: any = {};
    
    // Handle pagination parameters
    if (params?.page !== undefined) {
      processedParams.page = typeof params.page === 'number' ? params.page : Number(params.page);
    }
    if (params?.limit !== undefined) {
      processedParams.limit = typeof params.limit === 'number' ? params.limit : Number(params.limit);
    }
    
    // Handle sorting parameters
    if (params?.sort) processedParams.sort = params.sort;
    if (params?.order) processedParams.order = params.order;
    
    // Handle filter parameters
    if (params?.search) processedParams.search = params.search;
    if (params?.type) processedParams.type = params.type;
    if (params?.difficulty) processedParams.difficulty = params.difficulty;
    if (params?.category) processedParams.category = params.category;
    if (params?.tags) processedParams.tags = params.tags;
    if (params?.timeLimit !== undefined) processedParams.timeLimit = params.timeLimit;
    if (params?.author) processedParams.author = params.author;
    
    const queryParams = new URLSearchParams(processedParams).toString();
    return handleApiRequest<PaginationData<Challenge>>(api.get(`/challenges?${queryParams}`));
  },

  // Get challenge by ID
  getChallengeById: (id: string) => 
    handleApiRequest<Challenge>(api.get(`/challenges/${id}`)),

  // Get challenge by slug
  getChallengeBySlug: (slug: string) => 
    handleApiRequest<Challenge>(api.get(`/challenges/slug/${slug}`)),

  // Create new challenge (Admin/Moderator only)
  createChallenge: (challengeData: CreateChallengeRequest) => 
    handleApiRequest<Challenge>(api.post('/challenges', challengeData)),

  // Update challenge (Author/Admin only)
  updateChallenge: (id: string, challengeData: Partial<CreateChallengeRequest>) => 
    handleApiRequest<Challenge>(api.put(`/challenges/${id}`, challengeData)),

  // Delete challenge (Author/Admin only)
  deleteChallenge: (id: string) => 
    handleApiRequest<void>(api.delete(`/challenges/${id}`)),

  // Get challenge statistics
  getChallengeStats: (id: string) => 
    handleApiRequest<ChallengeStats>(api.get(`/challenges/${id}/stats`)),

  // Start challenge session
  startChallengeSession: (id: string) => 
    handleApiRequest<any>(api.post(`/challenges/${id}/start`)),

  // Get popular challenges
  getPopularChallenges: (limit?: number) => {
    const queryParams = limit ? `?limit=${limit}` : '';
    return handleApiRequest<Challenge[]>(api.get(`/challenges/popular${queryParams}`));
  },

  // Get challenges by category
  getChallengesByCategory: () => 
    handleApiRequest<Record<string, number>>(api.get('/challenges/categories')),
};

// ===============================
// SUBMISSIONS API
// ===============================
export const submissionsApi = {
  // Create new code submission
  createSubmission: (data: CreateSubmissionRequest) => 
    handleApiRequest<Submission>(api.post('/submissions', data)),

  // Process execution results from frontend
  processExecutionResults: (id: string, results: ProcessExecutionResultsRequest) => 
    handleApiRequest<Submission>(api.post(`/submissions/${id}/results`, results)),

  // Get user submissions with pagination and filters
  getUserSubmissions: (params?: SubmissionFilters) => {
    const queryParams = new URLSearchParams(params as any).toString();
    return handleApiRequest<PaginationData<Submission>>(api.get(`/submissions?${queryParams}`));
  },

  // Get user submission statistics
  getUserSubmissionStats: () => 
    handleApiRequest<any>(api.get('/submissions/stats/user')),
};

// ===============================
// ACHIEVEMENTS API
// ===============================
export const achievementsApi = {
  // Get all active achievements
  getAllAchievements: () => 
    handleApiRequest<Achievement[]>(api.get('/achievements')),

  // Get achievement by ID
  getAchievement: (id: string) => 
    handleApiRequest<Achievement>(api.get(`/achievements/${id}`)),

  // Get current user's achievements
  getUserAchievements: () => 
    handleApiRequest<UserAchievement[]>(api.get('/achievements/user/me')),

  // Check for new achievements
  checkForNewAchievements: () => 
    handleApiRequest<any>(api.post('/achievements/check')),

  // Create new achievement (Admin only)
  createAchievement: (data: CreateAchievementRequest) => 
    handleApiRequest<Achievement>(api.post('/achievements', data)),

  // Update achievement (Admin only)
  updateAchievement: (id: string, data: Partial<CreateAchievementRequest>) => 
    handleApiRequest<Achievement>(api.put(`/achievements/${id}`, data)),

  // Delete achievement (Admin only)
  deleteAchievement: (id: string) => 
    handleApiRequest<void>(api.delete(`/achievements/${id}`)),
};

// ===============================
// NOTIFICATIONS API
// ===============================
export const notificationsApi = {
  // Get user notifications with pagination and filters
  getUserNotifications: (params?: NotificationFilters) => {
    const queryParams = new URLSearchParams(params as any).toString();
    return handleApiRequest<PaginationData<Notification>>(api.get(`/notifications?${queryParams}`));
  },

  // Get count of unread notifications
  getUnreadCount: () => 
    handleApiRequest<{ count: number }>(api.get('/notifications/unread/count')),

  // Mark notification as read
  markAsRead: (id: string) => 
    handleApiRequest<void>(api.patch(`/notifications/${id}/read`)),

  // Mark all notifications as read
  markAllAsRead: () => 
    handleApiRequest<void>(api.patch('/notifications/read-all')),

  // Delete a notification
  deleteNotification: (id: string) => 
    handleApiRequest<void>(api.delete(`/notifications/${id}`)),

  // Get notifications by type
  getByType: (type: 'achievement' | 'challenge' | 'social' | 'system', limit?: number) => {
    const queryParams = limit ? `?limit=${limit}` : '';
    return handleApiRequest<Notification[]>(api.get(`/notifications/type/${type}${queryParams}`));
  },
};

// ===============================
// COMMUNITY API (Phase 3 - Planned)
// ===============================
export const communityApi = {
  // Get all community posts
  getAllPosts: (params?: {
    page?: number;
    limit?: number;
    category?: PostCategory;
    tags?: string[];
    search?: string;
  }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    return handleApiRequest<PaginationData<CommunityPost>>(api.get(`/community/posts?${queryParams}`));
  },

  // Create new community post
  createPost: (data: {
    title: string;
    content: string;
    category: PostCategory;
    tags?: string[];
  }) => handleApiRequest<CommunityPost>(api.post('/community/posts', data)),
};

// ===============================
// TEMPLATES API (Phase 4 - Planned)
// ===============================
export const templatesApi = {
  // Get all templates
  getAllTemplates: (params?: {
    page?: number;
    limit?: number;
    category?: TemplateCategory;
    framework?: TemplateFramework;
    difficulty?: TemplateDifficulty;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    return handleApiRequest<PaginationData<Template>>(api.get(`/templates?${queryParams}`));
  },

  // Create new template
  createTemplate: (data: any) => 
    handleApiRequest<Template>(api.post('/templates', data)),
};

// ===============================
// LEARNING API (Phase 5 - Planned)
// ===============================
export const learningApi = {
  // Get all learning playlists
  getAllPlaylists: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    difficulty?: TemplateDifficulty;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    return handleApiRequest<PaginationData<LearningPlaylist>>(api.get(`/learning/playlists?${queryParams}`));
  },

  // Enroll in a learning playlist
  enrollInPlaylist: (id: string) => 
    handleApiRequest<void>(api.post(`/learning/playlists/${id}/enroll`)),
};

// ===============================
// SYSTEM API
// ===============================
export const systemApi = {
  // Health check endpoint
  healthCheck: () => 
    handleApiRequest<HealthCheck>(api.get('/health')),

  // API information
  apiInfo: () => 
    handleApiRequest<ApiInfo>(api.get('/api')),
};

// Export types and interfaces from the api types file
export type {
  ApiResponse,
  PaginationData,
  User,
  UserProfile,
  UserStats,
  UserPreferences,
  AuthTokens,
  LoginResponse,
  Challenge,
  ChallengeType,
  ChallengeDifficulty,
  Submission,
  Achievement,
  Notification,
  CommunityPost,
  Template,
  LearningPlaylist,
} from '../types/api';

// Export the base api instance in case it's needed
export default api;