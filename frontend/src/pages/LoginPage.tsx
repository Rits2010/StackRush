import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, Mail, Lock, Eye, EyeOff, Github, Chrome, AlertCircle } from 'lucide-react';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import { ProfessionalInput } from '../components/ui/ProfessionalInput';
import { useAuth } from '../context/AuthContext';
import { isValidationError, formatValidationErrors, ERROR_CODES } from '../services/errorHandler';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError, clearErrorOnPageChange } = useAuth();
  const [identifier, setIdentifier] = useState(() => {
    // First try to restore from sessionStorage (for current session persistence)
    const sessionValue = sessionStorage.getItem('login_identifier');
    if (sessionValue) return sessionValue;
    
    // Then try to restore from localStorage if remember me was checked
    const remembered = localStorage.getItem('remembered_identifier');
    const rememberMe = localStorage.getItem('remember_me') === 'true';
    return (rememberMe && remembered) ? remembered : '';
  });
  const [password, setPassword] = useState(() => {
    // Restore from sessionStorage if available (for form persistence)
    return sessionStorage.getItem('login_password') || '';
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('remember_me') === 'true';
  });
  const [errors, setErrors] = useState<{identifier?: string; password?: string; general?: string}>({});
  const [touchedIdentifier, setTouchedIdentifier] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Persist form data to sessionStorage on changes
  useEffect(() => {
    if (identifier) {
      sessionStorage.setItem('login_identifier', identifier);
    } else {
      sessionStorage.removeItem('login_identifier');
    }
  }, [identifier]);

  useEffect(() => {
    if (password) {
      sessionStorage.setItem('login_password', password);
    } else {
      sessionStorage.removeItem('login_password');
    }
  }, [password]);

  // Clear sessionStorage on successful login
  useEffect(() => {
    if (!isLoading && !error && identifier && password) {
      // If not loading and no error, it might be a successful login
      const timer = setTimeout(() => {
        // Clear stored credentials after a short delay
        sessionStorage.removeItem('login_identifier');
        sessionStorage.removeItem('login_password');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, error, identifier, password]);

  // Cleanup function to clear sessionStorage when component unmounts
  useEffect(() => {
    // Clear auth errors when component mounts (when navigating to login page)
    clearErrorOnPageChange();
    
    return () => {
      // Only clear if we're navigating away from login (not due to error)
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        sessionStorage.removeItem('login_identifier');
        sessionStorage.removeItem('login_password');
      }
    };
  }, [clearErrorOnPageChange]);

  const isValidIdentifier = (value: string) => {
    // Accept either valid email or username (3-30 chars, alphanumeric, underscores, hyphens)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    return emailRegex.test(value) || usernameRegex.test(value);
  };

  const validateIdentifierForDisplay = () => {
    if (!touchedIdentifier) return; // don't show errors until blurred once
    if (!identifier) {
      setErrors(prev => ({ ...prev, identifier: 'Email or username is required' }));
    } else if (!isValidIdentifier(identifier)) {
      setErrors(prev => ({ ...prev, identifier: 'Please enter a valid email address or username' }));
    } else {
      setErrors(prev => ({ ...prev, identifier: undefined }));
    }
  };

  useEffect(() => {
    // Only compute form validity; don't set field errors here
    setIsFormValid(isValidIdentifier(identifier) && !!password);
  }, [identifier, password]);

  useEffect(() => {
    validateIdentifierForDisplay();
  }, [identifier, touchedIdentifier]);

  // Clear errors when auth context error changes
  useEffect(() => {
    if (error) {
      if (isValidationError(error)) {
        const fieldErrors = formatValidationErrors(error);
        setErrors(prev => ({ ...prev, ...fieldErrors }));
      } else {
        setErrors(prev => ({ ...prev, general: error }));
      }
    }
  }, [error]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors but keep form data
    setErrors({});
    clearError();
    
    // On submit, validate identifier and show error if needed
    if (!identifier || !isValidIdentifier(identifier)) {
      setTouchedIdentifier(true);
      validateIdentifierForDisplay();
      return;
    }
    
    if (!password) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      return;
    }
    
    try {
      await login(identifier, password);
      
      // Handle remember me functionality
      if (rememberMe) {
        localStorage.setItem('remember_me', 'true');
        // Keep the identifier for next time if remember me is checked
        localStorage.setItem('remembered_identifier', identifier);
      } else {
        localStorage.removeItem('remember_me');
        localStorage.removeItem('remembered_identifier');
      }
      
      // Clear stored credentials on successful login
      sessionStorage.removeItem('login_identifier');
      sessionStorage.removeItem('login_password');
      
      // Only navigate on successful login
      navigate('/portal');
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Form data is automatically preserved via sessionStorage
      // No need to manually restore values
      
      // Error handling is done via the useEffect that listens to auth context error
      
      // Additional safety: if there's no error message set by auth context, 
      // set a generic one to ensure user sees feedback
      setTimeout(() => {
        if (!error && !errors.general) {
          setErrors(prev => ({ 
            ...prev, 
            general: 'Login failed. Please check your credentials and try again.' 
          }));
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 group mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
              <Code2 className="h-7 w-7 text-white" />
            </div>
            <span className="font-black text-2xl text-gray-900 dark:bg-gradient-to-r dark:from-blue-600 dark:to-purple-600 dark:bg-clip-text dark:text-transparent">
              StackRush
            </span>
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ready to face some coding chaos? Log in before Slack explodes again.
          </p>
        </div>

        <ProfessionalCard className="p-8 border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/70 backdrop-blur-md shadow-xl" glow>
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700 dark:text-red-300">{errors.general}</div>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <ProfessionalInput
                label="Email or Username"
                type="text"
                placeholder="Enter your email or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onBlur={() => setTouchedIdentifier(true)}
                icon={Mail}
                required
                error={errors.identifier}
                helper="You can login with either your email address or username."
                autoComplete="username"
              />
            </div>

            <div className="relative">
              <ProfessionalInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                required
                error={errors.password}
                helper="Use your account password. Toggle visibility with the eye icon."
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-9 p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                Forgot password?
              </Link>
            </div>

            <ProfessionalButton
              variant="primary"
              className="w-full"
              loading={isLoading}
              disabled={!isFormValid}
              type="submit"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </ProfessionalButton>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 dark:bg-gray-800 dark:text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <ProfessionalButton variant="outline" icon={Github}>
                GitHub
              </ProfessionalButton>
              <ProfessionalButton variant="outline" icon={Chrome}>
                Google
              </ProfessionalButton>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                Sign up
              </Link>
            </p>
          </div>
        </ProfessionalCard>
      </div>
    </div>
  );
};

export default LoginPage;