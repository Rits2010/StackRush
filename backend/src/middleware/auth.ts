import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { JwtService } from '../utils/jwt';
import { User } from '../models/User';
import { AuthenticatedRequest, RequestUser } from '../types';
import { logger } from '../utils/logger';

/**
 * Authentication middleware to verify JWT tokens
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = JwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'MISSING_TOKEN',
          message: 'Access token is required',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
      return;
    }

    // Verify the token
    const decoded = JwtService.verifyAccessToken(token);
    
    // Log the decoded user ID for debugging
    logger.debug('Decoded user ID from token:', decoded.id);

    // Get user from database to ensure they still exist and are active
    const user = await User.findById(decoded.id);
    
    // Log the result of the database query
    logger.debug('Database query result for user:', { 
      userId: decoded.id, 
      userFound: !!user, 
      userActive: user?.isActive 
    });
    
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_USER',
          message: 'User not found or inactive',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
      return;
    }

    // Create a plain object with only the necessary user properties
    const { _id, email, username, roles, ...rest } = user.toObject();
    req.user = {
      id: _id.toString(),
      _id,
      email,
      username,
      roles,
      ...rest
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    let code = 'AUTH_ERROR';
    let message = 'Authentication failed';

    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        code = 'TOKEN_EXPIRED';
        message = 'Access token expired';
      } else if (error.message.includes('invalid')) {
        code = 'INVALID_TOKEN';
        message = 'Invalid access token';
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
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = JwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      return next();
    }

    const decoded = JwtService.verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-password');

    if (user) {
      // Create a plain object with only the necessary user properties
      const { _id, email, username, roles, ...rest } = user.toObject();
      req.user = {
        id: _id.toString(),
        _id,
        email,
        username,
        roles,
        ...rest
      };
    }

    next();
  } catch (error) {
    // For optional auth, we don't fail on token errors
    next();
  }
};

/**
 * Authorization middleware to check user roles
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
      return;
    }

    const hasPermission = req.user.roles.some(role => allowedRoles.includes(role));

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Insufficient permissions to access this resource',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
      return;
    }

    next();
  };
};

/**
 * Rate limiting middleware for authentication endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || '5'), // 5 attempts per window
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_AUTH_ATTEMPTS',
      message: 'Too many authentication attempts, please try again later',
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests
  skipSuccessfulRequests: true,
  // Custom key generator to use IP + user identifier if available
  keyGenerator: (req: Request) => {
    const identifier = req.body?.email || req.body?.username || req.ip;
    return `auth_${identifier}`;
  },
});

/**
 * Rate limiting middleware for password reset endpoints
 */
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_RESET_ATTEMPTS',
      message: 'Too many password reset attempts, please try again later',
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return `reset_${req.body?.email || req.ip}`;
  },
});

/**
 * Middleware to check if user owns the resource or is admin
 */
export const checkOwnership = (userIdParam: string = 'id') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
      return;
    }

    const resourceUserId = req.params[userIdParam];
    const isOwner = req.user.id === resourceUserId;
    const isAdmin = req.user.roles.includes('admin');

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'Access denied to this resource',
          timestamp: new Date().toISOString(),
          path: req.path,
        },
      });
      return;
    }

    next();
  };
};