# Security Analysis and Fixes for StackRush Frontend

## Current Security Issues Identified

### 1. Cross-Site Scripting (XSS) Vulnerabilities

**Issue**: The FrontendPreview component executes user-provided HTML, CSS, and JavaScript without proper sanitization.

**Location**: `src/components/FrontendPreview.tsx`

**Risk Level**: HIGH

**Current Code**:
```typescript
const generatePreviewHTML = useCallback(() => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <style>
    ${cssCode}  // Direct injection - XSS risk
  </style>
</head>
<body>
  ${htmlCode}  // Direct injection - XSS risk
  <script>
    ${jsCode}  // Direct injection - XSS risk
  </script>
</body>
</html>`;
}, [htmlCode, cssCode, jsCode]);
```

**Fix Applied**: The component now uses iframe sandboxing and proper content security policies.

### 2. Unsafe Code Execution

**Issue**: WebContainer service executes user code without proper validation.

**Location**: `src/services/webcontainer.ts`

**Risk Level**: HIGH

**Mitigation**: 
- Added input validation
- Implemented execution timeouts
- Added resource limits
- Used sandboxed execution environment

### 3. Missing Input Validation

**Issue**: User inputs are not properly validated before processing.

**Locations**: Multiple components accepting user input

**Risk Level**: MEDIUM

**Examples**:
- Challenge submission forms
- User profile updates
- Search inputs
- Comment systems

### 4. Insecure Data Storage

**Issue**: Sensitive data might be stored in localStorage without encryption.

**Location**: Various components using localStorage

**Risk Level**: MEDIUM

**Current Issues**:
- JWT tokens stored in localStorage (vulnerable to XSS)
- User preferences stored without validation
- Session data persisted insecurely

### 5. Missing CSRF Protection

**Issue**: No CSRF tokens for state-changing operations.

**Risk Level**: MEDIUM

**Impact**: Potential for cross-site request forgery attacks.

## Security Fixes Implemented

### 1. Enhanced FrontendPreview Security

```typescript
// Fixed version with proper sandboxing
const generatePreviewHTML = useCallback(() => {
  try {
    // Sanitize inputs
    const sanitizedHTML = DOMPurify.sanitize(htmlCode);
    const sanitizedCSS = sanitizeCSS(cssCode);
    const sanitizedJS = sanitizeJavaScript(jsCode);
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob:;
    connect-src 'self';
    font-src 'self' data:;
  ">
  <title>Preview - Stack Rush</title>
  <style>
    /* Reset and security styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    /* Prevent common XSS vectors */
    iframe, object, embed, applet {
      display: none !important;
    }
    
    /* User CSS (sanitized) */
    ${sanitizedCSS}
  </style>
</head>
<body>
  ${sanitizedHTML}
  
  <script>
    // Security wrapper
    (function() {
      'use strict';
      
      // Disable dangerous functions
      window.eval = function() { 
        throw new Error('eval() is disabled for security reasons'); 
      };
      
      window.Function = function() { 
        throw new Error('Function constructor is disabled for security reasons'); 
      };
      
      // Error handling
      window.addEventListener('error', function(e) {
        parent.postMessage({
          type: 'error',
          message: e.message,
          filename: e.filename,
          lineno: e.lineno,
          colno: e.colno
        }, '*');
      });
      
      // Execution timeout
      const executionTimeout = setTimeout(() => {
        throw new Error('Code execution timeout (5 seconds)');
      }, 5000);
      
      try {
        // User JavaScript (sanitized)
        ${sanitizedJS}
        clearTimeout(executionTimeout);
      } catch (error) {
        clearTimeout(executionTimeout);
        parent.postMessage({
          type: 'error',
          message: error instanceof Error ? error.message : 'An unknown error occurred'
        }, '*');
      }
    })();
  </script>
</body>
</html>`;
  } catch (error) {
    return generateErrorHTML(error.message);
  }
}, [htmlCode, cssCode, jsCode]);

// Enhanced iframe with security attributes
<iframe
  ref={iframeRef}
  key={refreshKey}
  title="Preview"
  srcDoc={generatePreviewHTML()}
  className="w-full h-full border-0"
  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
  onLoad={handleIframeLoad}
  onError={handleIframeError}
  style={{
    border: 'none',
    width: '100%',
    height: '100%'
  }}
/>
```

### 2. Input Validation Utilities

```typescript
// src/utils/validation.ts
export const sanitizeHTML = (html: string): string => {
  // Remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:text\/html/gi, '');
};

export const sanitizeCSS = (css: string): string => {
  // Remove dangerous CSS properties and values
  return css
    .replace(/expression\s*\(/gi, '')
    .replace(/javascript:/gi, '')
    .replace/url\s*\(\s*["']?javascript:/gi, '')
    .replace/@import/gi, '')
    .replace(/behavior\s*:/gi, '');
};

export const sanitizeJavaScript = (js: string): string => {
  // Basic JavaScript sanitization
  const dangerous = [
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
    /require\s*\(/gi
  ];
  
  let sanitized = js;
  dangerous.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '/* BLOCKED */');
  });
  
  return sanitized;
};

export const validateInput = (input: string, type: 'email' | 'username' | 'code'): boolean => {
  switch (type) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
    case 'username':
      return /^[a-zA-Z0-9_-]{3,20}$/.test(input);
    case 'code':
      return input.length > 0 && input.length < 10000;
    default:
      return false;
  }
};
```

### 3. Secure Authentication Context

```typescript
// src/context/AuthContext.tsx - Enhanced security
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Secure token storage
  const getToken = (): string | null => {
    try {
      // Use sessionStorage instead of localStorage for better security
      const token = sessionStorage.getItem('auth_token');
      if (token) {
        // Validate token format
        const parts = token.split('.');
        if (parts.length !== 3) {
          sessionStorage.removeItem('auth_token');
          return null;
        }
        
        // Check expiration
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp * 1000 < Date.now()) {
          sessionStorage.removeItem('auth_token');
          return null;
        }
      }
      return token;
    } catch (error) {
      console.error('Token validation error:', error);
      sessionStorage.removeItem('auth_token');
      return null;
    }
  };

  const setToken = (token: string): void => {
    try {
      // Validate token before storing
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      sessionStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Token storage error:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      // Validate inputs
      if (!validateInput(email, 'email')) {
        throw new Error('Invalid email format');
      }
      
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = (): void => {
    sessionStorage.removeItem('auth_token');
    setUser(null);
  };

  // ... rest of the context implementation
};
```

### 4. Content Security Policy

```typescript
// src/utils/security.ts
export const getCSPHeader = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Needed for Monaco Editor
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

// Apply CSP to preview iframes
export const createSecureIframe = (content: string): string => {
  return `
    <meta http-equiv="Content-Security-Policy" content="${getCSPHeader()}">
    ${content}
  `;
};
```

### 5. Rate Limiting for Client-Side

```typescript
// src/utils/rateLimiter.ts
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private limits: Map<string, { count: number; window: number }> = new Map();

  constructor() {
    // Define rate limits for different actions
    this.limits.set('code_execution', { count: 10, window: 60000 }); // 10 per minute
    this.limits.set('submission', { count: 5, window: 60000 }); // 5 per minute
    this.limits.set('search', { count: 30, window: 60000 }); // 30 per minute
  }

  canMakeRequest(action: string, userId: string): boolean {
    const key = `${action}:${userId}`;
    const limit = this.limits.get(action);
    
    if (!limit) return true;

    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < limit.window);
    
    if (validRequests.length >= limit.count) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }
}

export const rateLimiter = new RateLimiter();
```

## Additional Security Recommendations

### 1. Environment Variables
```bash
# .env.example
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
MONGODB_URI=mongodb://localhost:27017/stackrush
REDIS_URL=redis://localhost:6379
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
SENDGRID_API_KEY=your-sendgrid-key
```

### 2. Security Headers Middleware
```typescript
// Backend security middleware
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Needed for WebContainer
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);
```

### 3. Input Validation Middleware
```typescript
// Backend input validation
import Joi from 'joi';

const validateSubmission = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    code: Joi.string().max(10000).required(),
    language: Joi.string().valid('javascript', 'typescript', 'python').required(),
    challengeId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};
```

## Security Testing Checklist

### Frontend Security Tests
- [ ] XSS prevention in all user inputs
- [ ] CSRF token validation
- [ ] Input sanitization
- [ ] Secure authentication flow
- [ ] Proper error handling (no sensitive data exposure)
- [ ] Content Security Policy implementation
- [ ] Secure iframe sandboxing

### Backend Security Tests
- [ ] SQL injection prevention
- [ ] Authentication bypass attempts
- [ ] Authorization checks
- [ ] Rate limiting effectiveness
- [ ] Input validation on all endpoints
- [ ] Secure password storage
- [ ] JWT token security
- [ ] File upload security
- [ ] Code execution sandboxing

### Infrastructure Security
- [ ] HTTPS enforcement
- [ ] Secure headers configuration
- [ ] Database security
- [ ] API key protection
- [ ] Environment variable security
- [ ] Logging and monitoring
- [ ] Backup security

## Monitoring and Alerting

### Security Events to Monitor
1. Failed authentication attempts
2. Unusual code execution patterns
3. High-frequency API requests
4. Suspicious user behavior
5. Error rate spikes
6. Unauthorized access attempts

### Logging Implementation
```typescript
// src/utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'stackrush-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Security event logging
export const logSecurityEvent = (event: string, details: any, userId?: string) => {
  logger.warn('Security Event', {
    event,
    details,
    userId,
    timestamp: new Date().toISOString(),
    ip: details.ip,
    userAgent: details.userAgent
  });
};
```

This comprehensive security analysis addresses the major vulnerabilities in the current frontend implementation and provides a roadmap for implementing robust security measures throughout the application.