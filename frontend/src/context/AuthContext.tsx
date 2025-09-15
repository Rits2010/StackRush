import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, usersApi } from '../services/api';
import { getErrorMessage, isApiError } from '../services/errorHandler';
import type { User, LoginCredentials, RegisterData, LoginResponse, RegisterResponse } from '../types/api';

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<void>;
  signup: (userData: RegisterData) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  clearError: () => void;
  clearSuccessMessage: () => void;
  clearErrorOnPageChange: () => void; // New method for page navigation cleanup
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearError = () => setError(null);
  const clearSuccessMessage = () => setSuccessMessage(null);
  const clearErrorOnPageChange = () => {
    // Clear error and success messages when navigating between auth pages
    setError(null);
    setSuccessMessage(null);
    setIsLoading(false);
  };

  useEffect(() => {
    // Check if user is logged in by validating stored tokens
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (accessToken && refreshToken) {
        try {
          // Try to get current user profile to validate token
          const userData = await usersApi.getProfile();
          setUser(userData);
        } catch (error) {
          // If token validation fails, clear stored tokens
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          console.log('Token validation failed:', error);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const credentials: LoginCredentials = { identifier, password };
      const response: LoginResponse = await authApi.login(credentials);
      
      // Store tokens
      localStorage.setItem('accessToken', response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);
      
      // Set user data
      setUser(response.user);
      
      // Clear any previous errors on successful login
      setError(null);
      
    } catch (error: any) {
      console.error('Login error details:', error);
      
      // Get user-friendly error message
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      
      // Re-throw to let components handle it if needed
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: RegisterData): Promise<RegisterResponse> => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response: RegisterResponse = await authApi.register(userData);
      
      // Set success message from the API response
      setSuccessMessage(response.message || 'Registration successful! Please check your email to verify your account.');
      
      // Don't set user or tokens for registration since email verification is required
      // User will need to verify email and then login
      
      // Return the response so components can handle it
      return response;
      
    } catch (error: any) {
      console.error('Registration error details:', error);
      
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      
      // Re-throw to let components handle it if needed
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        // Call logout API to invalidate tokens on server
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      // Even if logout API fails, continue with local cleanup
      console.log('Logout API call failed:', error);
    } finally {
      // Clear local state and storage
      setUser(null);
      setError(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      isLoading, 
      error, 
      successMessage,
      clearError,
      clearSuccessMessage,
      clearErrorOnPageChange
    }}>
      {children}
    </AuthContext.Provider>
  );
};