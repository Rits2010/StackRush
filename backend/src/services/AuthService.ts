import crypto from 'crypto';
import { User, IUser } from '../models/User';
import { JwtService, TokenPair } from '../utils/jwt';
import { logger } from '../utils/logger';

export interface RegisterDto {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginDto {
  identifier: string; // email or username
  password: string;
}

export interface AuthResponse {
  user: Partial<IUser>;
  tokens: TokenPair;
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(userData: RegisterDto): Promise<IUser> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { email: userData.email.toLowerCase() },
          { username: userData.username }
        ]
      });

      if (existingUser) {
        if (existingUser.email === userData.email.toLowerCase()) {
          throw new Error('Email already registered');
        } else {
          throw new Error('Username already taken');
        }
      }

      // Generate email verification token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');

      // Create new user
      const user = new User({
        email: userData.email.toLowerCase(),
        username: userData.username,
        password: userData.password,
        profile: {
          firstName: userData.firstName,
          lastName: userData.lastName,
        },
        emailVerificationToken,
      });

      await user.save();

      logger.info('User registered successfully', {
        userId: user._id,
        email: user.email,
        username: user.username,
      });

      // TODO: Send verification email
      // await EmailService.sendVerificationEmail(user.email, emailVerificationToken);

      return user;
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user with email/username and password
   */
  static async login(credentials: LoginDto): Promise<AuthResponse> {
    try {
      // Find user by email or username
      const user = await (User as any).findForAuth(credentials.identifier);

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if account is locked
      if (user.isLocked()) {
        throw new Error('Account temporarily locked due to too many failed login attempts');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(credentials.password);

      if (!isPasswordValid) {
        // Increment login attempts
        await user.incLoginAttempts();
        throw new Error('Invalid credentials');
      }

      // Reset login attempts on successful login
      if (user.loginAttempts > 0) {
        await user.updateOne({
          $unset: { loginAttempts: 1, lockUntil: 1 }
        });
      }

      // Update last active date
      await user.updateOne({
        'stats.lastActiveDate': new Date()
      });

      // Generate tokens
      const tokens = await JwtService.generateTokenPair({
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        roles: user.roles,
      });

      logger.info('User logged in successfully', {
        userId: user._id,
        email: user.email,
        username: user.username,
      });

      // Return user without sensitive data
      const userResponse = user.toJSON();
      delete userResponse.password;

      return {
        user: userResponse,
        tokens,
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify refresh token
      const { id } = await JwtService.verifyRefreshToken(refreshToken);

      // Get user from database
      const user = await User.findById(id);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Generate new token pair
      const tokens = await JwtService.generateTokenPair({
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        roles: user.roles,
      });

      // Revoke old refresh token
      await JwtService.revokeRefreshToken(id, refreshToken);

      logger.info('Token refreshed successfully', {
        userId: user._id,
      });

      return tokens;
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Logout user by revoking refresh token
   */
  static async logout(userId: string, refreshToken: string): Promise<void> {
    try {
      await JwtService.revokeRefreshToken(userId, refreshToken);
      
      logger.info('User logged out successfully', {
        userId,
      });
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  static async forgotPassword(email: string): Promise<void> {
    try {
      const user = await User.findOne({ 
        email: email.toLowerCase(),
        isActive: true 
      });

      if (!user) {
        // Don't reveal if email exists or not
        logger.warn('Password reset requested for non-existent email', { email });
        return;
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Save reset token to user
      await user.updateOne({
        passwordResetToken: resetToken,
        passwordResetExpires: resetTokenExpiry,
      });

      // Token stored in database only

      logger.info('Password reset requested', {
        userId: user._id,
        email: user.email,
      });

      // TODO: Send password reset email
      // await EmailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      logger.error('Forgot password error:', error);
      throw error;
    }
  }

  /**
   * Reset password using reset token
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Find user and verify token (database validation only)
      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() },
        isActive: true,
      }).select('+passwordResetToken +passwordResetExpires');

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      // Update password and clear reset token
      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      
      await user.save();

      // Token removed from database

      // Revoke all refresh tokens for security (stateless mode)
      await JwtService.revokeAllRefreshTokens(user._id.toString());

      logger.info('Password reset successfully', {
        userId: user._id,
        email: user.email,
      });
    } catch (error) {
      logger.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Verify email address
   */
  static async verifyEmail(token: string): Promise<void> {
    try {
      const user = await User.findOne({
        emailVerificationToken: token,
        isActive: true,
      }).select('+emailVerificationToken');

      if (!user) {
        throw new Error('Invalid verification token');
      }

      // Update user as verified
      user.emailVerified = true;
      user.emailVerificationToken = undefined;
      
      await user.save();

      logger.info('Email verified successfully', {
        userId: user._id,
        email: user.email,
      });
    } catch (error) {
      logger.error('Email verification error:', error);
      throw error;
    }
  }

  /**
   * Change password for authenticated user
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await User.findById(userId).select('+password');

      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Revoke all refresh tokens for security
      await JwtService.revokeAllRefreshTokens(userId);

      logger.info('Password changed successfully', {
        userId: user._id,
      });
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }
}