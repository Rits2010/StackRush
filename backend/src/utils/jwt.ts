import jwt from 'jsonwebtoken';
import { logger } from './logger';

export interface JwtPayload {
  id: string;
  email: string;
  username: string;
  roles: string[];
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class JwtService {
  /**
   * Get required environment variable with validation
   */
  private static getRequiredEnvVar(name: string): string {
    const value = process.env[name];
    if (!value || value.trim() === '') {
      throw new Error(`Missing required environment variable: ${name}. Please check your .env file.`);
    }
    return value;
  }

  /**
   * Get JWT secrets (lazy-loaded to ensure environment variables are loaded)
   */
  private static get ACCESS_TOKEN_SECRET(): string {
    return this.getRequiredEnvVar('JWT_SECRET');
  }

  private static get REFRESH_TOKEN_SECRET(): string {
    return this.getRequiredEnvVar('REFRESH_TOKEN_SECRET');
  }

  private static get ACCESS_TOKEN_EXPIRES_IN(): string {
    return process.env.JWT_EXPIRES_IN || '15m';
  }

  private static get REFRESH_TOKEN_EXPIRES_IN(): string {
    return process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
  }

  /**
   * Generate access and refresh token pair
   */
  static async generateTokenPair(payload: JwtPayload): Promise<TokenPair> {
    try {
      // Validate that secrets are available before generating tokens
      if (!this.ACCESS_TOKEN_SECRET) {
        throw new Error('JWT_SECRET environment variable is not set');
      }
      if (!this.REFRESH_TOKEN_SECRET) {
        throw new Error('REFRESH_TOKEN_SECRET environment variable is not set');
      }

      const accessToken = jwt.sign(
        payload as object,
        this.ACCESS_TOKEN_SECRET,
        {
          expiresIn: this.ACCESS_TOKEN_EXPIRES_IN,
          issuer: 'stackrush-api',
          audience: 'stackrush-client'
        } as jwt.SignOptions
      );

      const refreshToken = jwt.sign(
        { id: payload.id, tokenType: 'refresh' } as object,
        this.REFRESH_TOKEN_SECRET,
        {
          expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
          issuer: 'stackrush-api',
          audience: 'stackrush-client'
        } as jwt.SignOptions
      );

      // Tokens are stateless - no server-side storage needed

      return { accessToken, refreshToken };
    } catch (error) {
      logger.error('Error generating token pair:', error);
      if (error instanceof Error) {
        if (error.message.includes('secretOrPrivateKey must have a value')) {
          throw new Error('JWT configuration error: Missing JWT secrets. Please check your .env file.');
        }
        if (error.message.includes('environment variable')) {
          throw error; // Re-throw environment variable errors as-is
        }
      }
      throw new Error('Token generation failed');
    }
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.ACCESS_TOKEN_SECRET, {
        issuer: 'stackrush-api',
        audience: 'stackrush-client'
      }) as JwtPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      }
      throw new Error('Token verification failed');
    }
  }

  /**
   * Verify refresh token
   */
  static async verifyRefreshToken(token: string): Promise<{ id: string }> {
    try {
      const decoded = jwt.verify(token, this.REFRESH_TOKEN_SECRET, {
        issuer: 'stackrush-api',
        audience: 'stackrush-client'
      }) as any;

      if (decoded.tokenType !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return { id: decoded.id };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      }
      throw error;
    }
  }

  /**
   * Revoke refresh token (stateless - no server-side action needed)
   */
  static async revokeRefreshToken(userId: string, token: string): Promise<void> {
    try {
      logger.info('Token revocation requested (stateless mode)', { userId });
    } catch (error) {
      logger.error('Error revoking refresh token:', error);
      throw new Error('Token revocation failed');
    }
  }

  /**
   * Revoke all refresh tokens for a user (stateless - no server-side action needed)
   */
  static async revokeAllRefreshTokens(userId: string): Promise<void> {
    try {
      logger.info('All tokens revocation requested (stateless mode)', { userId });
    } catch (error) {
      logger.error('Error revoking all refresh tokens:', error);
      throw new Error('Token revocation failed');
    }
  }

  /**
   * Parse expiration string to seconds
   */
  private static parseExpirationToSeconds(expiration: string): number {
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error('Invalid expiration format');
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 60 * 60 * 24;
      default: throw new Error('Invalid expiration unit');
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}