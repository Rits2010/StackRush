// Security utilities for StackRush frontend

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export const sanitizeHTML = (html: string): string => {
  // Remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:text\/html/gi, '')
    .replace(/<iframe\b[^>]*>/gi, '')
    .replace(/<\/iframe>/gi, '')
    .replace(/<object\b[^>]*>/gi, '')
    .replace(/<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/<applet\b[^>]*>/gi, '')
    .replace(/<\/applet>/gi, '');
};

/**
 * Sanitizes CSS content to prevent CSS injection attacks
 */
export const sanitizeCSS = (css: string): string => {
  // Remove dangerous CSS properties and values
  return css
    .replace(/expression\s*\(/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/url\s*\(\s*["']?javascript:/gi, '')
    .replace(/@import/gi, '')
    .replace(/behavior\s*:/gi, '')
    .replace(/binding\s*:/gi, '')
    .replace(/-moz-binding/gi, '')
    .replace(/position\s*:\s*fixed/gi, 'position: relative')
    .replace(/position\s*:\s*absolute/gi, 'position: relative');
};

/**
 * Sanitizes JavaScript code for safe execution
 */
export const sanitizeJavaScript = (js: string): string => {
  // List of dangerous patterns to block
  const dangerousPatterns = [
    /document\.write/gi,
    /document\.writeln/gi,
    /window\.location/gi,
    /location\.href/gi,
    /location\.replace/gi,
    /location\.assign/gi,
    /window\.open/gi,
    /XMLHttpRequest/gi,
    /fetch\s*\(/gi,
    /import\s*\(/gi,
    /require\s*\(/gi,
    /eval\s*\(/gi,
    /Function\s*\(/gi,
    /setTimeout\s*\(/gi,
    /setInterval\s*\(/gi,
    /alert\s*\(/gi,
    /confirm\s*\(/gi,
    /prompt\s*\(/gi
  ];
  
  let sanitized = js;
  dangerousPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '/* BLOCKED_FOR_SECURITY */');
  });
  
  return sanitized;
};

/**
 * Validates input based on type
 */
export const validateInput = (input: string, type: 'email' | 'username' | 'code' | 'text'): boolean => {
  if (!input || typeof input !== 'string') return false;
  
  switch (type) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) && input.length <= 254;
    case 'username':
      return /^[a-zA-Z0-9_-]{3,20}$/.test(input);
    case 'code':
      return input.length > 0 && input.length < 50000; // Reasonable code size limit
    case 'text':
      return input.length <= 1000; // General text limit
    default:
      return false;
  }
};

/**
 * Escapes HTML entities to prevent XSS
 */
export const escapeHTML = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Content Security Policy header generator
 */
export const getCSPHeader = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Needed for Monaco Editor and WebContainer
    "style-src 'self' 'unsafe-inline'", // Needed for dynamic styles
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' ws: wss:",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');
};

/**
 * Rate limiter for client-side operations
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private limits: Map<string, { count: number; window: number }> = new Map();

  constructor() {
    // Define rate limits for different actions
    this.limits.set('code_execution', { count: 10, window: 60000 }); // 10 per minute
    this.limits.set('submission', { count: 5, window: 60000 }); // 5 per minute
    this.limits.set('search', { count: 30, window: 60000 }); // 30 per minute
    this.limits.set('file_operation', { count: 20, window: 60000 }); // 20 per minute
  }

  canMakeRequest(action: string, userId: string = 'anonymous'): boolean {
    const key = `${action}:${userId}`;
    const limit = this.limits.get(action);
    
    if (!limit) return true;

    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < limit.window);
    
    if (validRequests.length >= limit.count) {
      console.warn(`Rate limit exceeded for action: ${action}`);
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }

  getRemainingRequests(action: string, userId: string = 'anonymous'): number {
    const key = `${action}:${userId}`;
    const limit = this.limits.get(action);
    
    if (!limit) return Infinity;

    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter(time => now - time < limit.window);
    
    return Math.max(0, limit.count - validRequests.length);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Secure token storage utilities
 */
export const secureStorage = {
  setToken: (key: string, token: string): void => {
    try {
      // Validate token format (basic JWT structure check)
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      // Use sessionStorage for better security (cleared on tab close)
      sessionStorage.setItem(key, token);
    } catch (error) {
      console.error('Token storage error:', error);
      throw error;
    }
  },

  getToken: (key: string): string | null => {
    try {
      const token = sessionStorage.getItem(key);
      if (!token) return null;
      
      // Validate token format
      const parts = token.split('.');
      if (parts.length !== 3) {
        sessionStorage.removeItem(key);
        return null;
      }
      
      // Check expiration
      try {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          sessionStorage.removeItem(key);
          return null;
        }
      } catch {
        // If we can't decode, assume it's invalid
        sessionStorage.removeItem(key);
        return null;
      }
      
      return token;
    } catch (error) {
      console.error('Token retrieval error:', error);
      return null;
    }
  },

  removeToken: (key: string): void => {
    sessionStorage.removeItem(key);
  },

  clearAll: (): void => {
    sessionStorage.clear();
  }
};

/**
 * Input sanitization for forms
 */
export const sanitizeFormInput = (input: string, maxLength: number = 1000): string => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Generates a secure random string for CSRF tokens
 */
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Validates CSRF token
 */
export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  if (!token || !storedToken) return false;
  return token === storedToken;
};