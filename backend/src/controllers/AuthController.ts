import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { AuthenticatedRequest, ApiResponse } from '../types';
import { logger } from '../utils/logger';

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body;
      const user = await AuthService.register(userData);

      const response: ApiResponse = {
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            username: user.username,
            emailVerified: user.emailVerified,
          },
        },
        message: 'User registered successfully. Please check your email for verification.',
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Registration error:', error);
      
      let statusCode = 500;
      let code = 'REGISTRATION_ERROR';
      let message = 'Registration failed';

      if (error instanceof Error) {
        if (error.message.includes('Email already registered')) {
          statusCode = 409;
          code = 'EMAIL_EXISTS';
          message = 'Email already registered';
        } else if (error.message.includes('Username already taken')) {
          statusCode = 409;
          code = 'USERNAME_EXISTS';
          message = 'Username already taken';
        }
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code,
          message,
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const credentials = req.body;
      const authResponse = await AuthService.login(credentials);

      const response: ApiResponse = {
        success: true,
        data: authResponse,
        message: 'Login successful',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Login error:', error);
      
      let statusCode = 401;
      let code = 'LOGIN_ERROR';
      let message = 'Login failed';

      if (error instanceof Error) {
        if (error.message.includes('Invalid credentials')) {
          code = 'INVALID_CREDENTIALS';
          message = 'Invalid email/username or password';
        } else if (error.message.includes('Account temporarily locked')) {
          code = 'ACCOUNT_LOCKED';
          message = 'Account temporarily locked due to too many failed login attempts';
        }
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code,
          message,
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const tokens = await AuthService.refreshToken(refreshToken);

      const response: ApiResponse = {
        success: true,
        data: { tokens },
        message: 'Token refreshed successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Token refresh error:', error);
      
      let code = 'TOKEN_REFRESH_ERROR';
      let message = 'Token refresh failed';

      if (error instanceof Error) {
        if (error.message.includes('expired')) {
          code = 'REFRESH_TOKEN_EXPIRED';
          message = 'Refresh token expired';
        } else if (error.message.includes('Invalid') || error.message.includes('not found')) {
          code = 'INVALID_REFRESH_TOKEN';
          message = 'Invalid refresh token';
        }
      }

      res.status(401).json({
        success: false,
        error: {
          code,
          message,
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }
  }

  /**
   * Logout user
   */
  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const userId = req.user!.id;

      await AuthService.logout(userId, refreshToken);

      const response: ApiResponse = {
        success: true,
        message: 'Logout successful',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Logout error:', error);
      
      // Even if logout fails, we should return success to the client
      const response: ApiResponse = {
        success: true,
        message: 'Logout successful',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    }
  }

  /**
   * Request password reset
   */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      await AuthService.forgotPassword(email);

      // Always return success to prevent email enumeration
      const response: ApiResponse = {
        success: true,
        message: 'If the email exists, a password reset link has been sent.',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Forgot password error:', error);
      
      // Always return success to prevent email enumeration
      const response: ApiResponse = {
        success: true,
        message: 'If the email exists, a password reset link has been sent.',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;
      await AuthService.resetPassword(token, password);

      const response: ApiResponse = {
        success: true,
        message: 'Password reset successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Reset password error:', error);
      
      let code = 'RESET_PASSWORD_ERROR';
      let message = 'Password reset failed';

      if (error instanceof Error) {
        if (error.message.includes('Invalid or expired')) {
          code = 'INVALID_RESET_TOKEN';
          message = 'Invalid or expired reset token';
        }
      }

      res.status(400).json({
        success: false,
        error: {
          code,
          message,
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }
  }

  /**
   * Verify email address
   */
  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      await AuthService.verifyEmail(token);

      const response: ApiResponse = {
        success: true,
        message: 'Email verified successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Email verification error:', error);
      
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_VERIFICATION_TOKEN',
          message: 'Invalid verification token',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }
  }

  /**
   * Change password for authenticated user
   */
  static async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.id;

      await AuthService.changePassword(userId, currentPassword, newPassword);

      const response: ApiResponse = {
        success: true,
        message: 'Password changed successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Change password error:', error);
      
      let statusCode = 500;
      let code = 'CHANGE_PASSWORD_ERROR';
      let message = 'Password change failed';

      if (error instanceof Error) {
        if (error.message.includes('Current password is incorrect')) {
          statusCode = 400;
          code = 'INCORRECT_CURRENT_PASSWORD';
          message = 'Current password is incorrect';
        } else if (error.message.includes('User not found')) {
          statusCode = 404;
          code = 'USER_NOT_FOUND';
          message = 'User not found';
        }
      }

      res.status(statusCode).json({
        success: false,
        error: {
          code,
          message,
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
    }
  }
}