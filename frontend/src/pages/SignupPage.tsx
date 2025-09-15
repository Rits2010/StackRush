import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, MapPin, Briefcase, Code, Target, Check, AlertCircle, CheckCircle } from 'lucide-react';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import { ProfessionalInput, ProfessionalSelect } from '../components/ui/ProfessionalInput';
import { useAuth } from '../context/AuthContext';
import { isValidationError, formatValidationErrors } from '../services/errorHandler';
import type { RegisterData } from '../types/api';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, isLoading, error, successMessage, clearError, clearSuccessMessage, clearErrorOnPageChange } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Required API fields (Step 1)
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    
    // Step 2: Professional Info
    experience: '',
    persona: '',
    currentRole: '',
    company: '',
    location: '',
    
    // Step 3: Technical Skills
    programmingLanguages: [],
    frameworks: [],
    databases: [],
    tools: [],
    yearsOfExperience: '',
    
    // Step 4: Goals & Preferences
    goals: [],
    challengeTypes: [],
    availableTime: '',
    learningStyle: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Clear auth errors when component mounts (when navigating to signup page)
  useEffect(() => {
    clearErrorOnPageChange();
  }, [clearErrorOnPageChange]);

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

  // Handle success message display
  useEffect(() => {
    if (successMessage) {
      // Clear any existing errors when success message appears
      setErrors({});
    }
  }, [successMessage]);

  const handleSignup = React.useCallback(async (e: React.SyntheticEvent) => {
    e.preventDefault();
    
  // Clear previous errors and success messages
    setErrors({});
    clearError();
    clearSuccessMessage();
    
    try {
      // Submit when on the last step (4)
      if (currentStep === 4) {
        // Map form data to API RegisterData format
        const registerData: RegisterData = {
          email: formData.email,
          username: formData.username,
          password: formData.password,
          firstName: formData.firstName || undefined,
          lastName: formData.lastName || undefined,
        };
        
        const response = await signup(registerData);
        
        // Registration successful - don't navigate to portal
        // Success message will be handled by the UI component
        // User needs to verify email before they can login
        
        return;
      }
      // If not on the last step, validate and move forward like Next
      if (currentStep < 4) {
        if (currentStep === 1) {
          const isEmailValid = !validateField('email', formData.email);
          const isUsernameValid = !validateField('username', formData.username);
          const isPasswordValid = !validateField('password', formData.password);
          const isConfirmPasswordValid = !validateField('confirmPassword', formData.confirmPassword);
          if (!isEmailValid || !isUsernameValid || !isPasswordValid || !isConfirmPasswordValid) {
            setTouched({ 
              email: true, 
              username: true, 
              password: true, 
              confirmPassword: true,
              firstName: true,
              lastName: true 
            });
            return;
          }
        }
        setCurrentStep(prev => Math.min(prev + 1, 4));
      }
    } catch (error: any) {
      console.error('Signup failed:', error);
      // Error is handled by useEffect listening to auth context error
    }
  }, [currentStep, formData, navigate, signup, clearError]);

  const updateFormData = React.useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // If the field has been touched, validate it on change
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: error || ''
      }));
    }
  }, [touched]);

  const updateArrayField = React.useCallback((field: string, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field as keyof typeof prev] as string[]), value]
        : (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
    }));
  }, []);

  const canProceed = React.useCallback((): boolean => {
    switch (currentStep) {
      case 1:
        return !!(
          formData.firstName && 
          formData.lastName && 
          formData.email && 
          formData.username && 
          formData.password && 
          formData.confirmPassword
        );
      case 2:
        return !!(formData.experience && formData.persona && formData.currentRole);
      case 3:
        // Require at least 1 language and 1 framework; databases optional
        return formData.programmingLanguages.length > 0 && formData.frameworks.length > 0;
      case 4:
        return formData.goals.length > 0 && formData.challengeTypes.length > 0;
      default:
        return false;
    }
  }, [currentStep, formData]);

  const validateField = (field: string, value: string): string => {
    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) return 'Email is required';
      if (!emailRegex.test(value)) return 'Please enter a valid email address';
    } else if (field === 'username') {
      const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
      if (!value) return 'Username is required';
      if (!usernameRegex.test(value)) return 'Username must be 3-30 characters, alphanumeric, underscores, and hyphens only';
    } else if (field === 'password') {
      if (!value) return 'Password is required';
      const hasLen = value.length >= 8;
      const hasLower = /[a-z]/.test(value);
      const hasUpper = /[A-Z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
      if (!(hasLen && hasLower && hasUpper && hasNumber && hasSpecial)) {
        return 'Password must be at least 8 characters and include 1 lowercase, 1 uppercase, 1 number, and 1 special character';
      }
    } else if (field === 'confirmPassword') {
      if (value !== formData.password) return 'Passwords do not match';
    }
    return '';
  };

  // Strict validity check for enabling Next on step 1 (does not set errors)
  const isStep1Valid = React.useCallback(() => {
    const firstNameOk = !!formData.firstName?.trim();
    const lastNameOk = !!formData.lastName?.trim();
    const emailOk = validateField('email', formData.email) === '';
    const usernameOk = validateField('username', formData.username) === '';
    const passwordOk = validateField('password', formData.password) === '';
    const confirmOk = validateField('confirmPassword', formData.confirmPassword) === '';
    return firstNameOk && lastNameOk && emailOk && usernameOk && passwordOk && confirmOk;
  }, [formData]);

  const validateCurrentStep = React.useCallback(() => {
    if (currentStep === 1) {
      return isStep1Valid();
    }
    return canProceed();
  }, [currentStep, isStep1Valid, canProceed]);

  // Update form validity when relevant dependencies change
  useEffect(() => {
    setIsFormValid(validateCurrentStep());
  }, [validateCurrentStep]);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate the field that was just blurred
    const validationFields = ['email', 'username', 'password', 'confirmPassword'];
    if (validationFields.includes(field)) {
      const error = validateField(field, formData[field as keyof typeof formData] as string);
      setErrors(prev => ({
        ...prev,
        [field]: error || ''
      }));
    }
  };

  const nextStep = React.useCallback(() => {
    // Only validate and proceed if not on the last step (4)
    if (currentStep < 4) {
      if (currentStep === 1) {
        // Mark all fields as touched to show all errors
        const newTouched = {
          firstName: true,
          lastName: true,
          email: true,
          username: true,
          password: true,
          confirmPassword: true
        };
        setTouched(newTouched);
        
        // Validate all fields
        const isEmailValid = !validateField('email', formData.email);
        const isUsernameValid = !validateField('username', formData.username);
        const isPasswordValid = !validateField('password', formData.password);
        const isConfirmPasswordValid = !validateField('confirmPassword', formData.confirmPassword);
        
        if (!isEmailValid || !isUsernameValid || !isPasswordValid || !isConfirmPasswordValid) {
          return; // Don't proceed if any validation fails
        }
      }

      setCurrentStep(Math.min(currentStep + 1, 4));
    }
  }, [currentStep, formData]);

  const prevStep = React.useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const renderStep = (): JSX.Element | null => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mt-2">
              <div className={`text-xs font-medium ${currentStep <= 1 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                Step 1
              </div>
            </div>
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Let's Get Started</h1>
              <p className="text-gray-600 dark:text-gray-400">Create your account to begin your coding journey</p>
            </div>

            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700 dark:text-red-300">{errors.general}</div>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm text-green-700 dark:text-green-300 font-medium">
                    Registration Successful!
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    {successMessage}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                    You can now{' '}
                    <Link to="/login" className="font-medium underline hover:no-underline">
                      sign in to your account
                    </Link>
                    {' '}once you've verified your email.
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProfessionalInput
                label="First Name"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={(e) => updateFormData('firstName', e.target.value)}
                icon={User}
                required
                error={touched.firstName ? errors.firstName : ''}
              />

              <ProfessionalInput
                label="Last Name"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={(e) => updateFormData('lastName', e.target.value)}
                icon={User}
                required
                error={touched.lastName ? errors.lastName : ''}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <ProfessionalInput
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  icon={Mail}
                  error={touched.email ? errors.email : ''}
                  helper="We'll use this to send important updates."
                  required
                />
              </div>

              <div>
                <ProfessionalInput
                  label="Username"
                  placeholder="Choose a unique username"
                  value={formData.username}
                  onChange={(e) => updateFormData('username', e.target.value)}
                  onBlur={() => handleBlur('username')}
                  icon={User}
                  error={touched.username ? errors.username : ''}
                  helper="3-30 characters, letters, numbers, underscore, hyphen only."
                  required
                />
              </div>
            </div>

            <div className="relative">
              <ProfessionalInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                icon={Lock}
                error={touched.password ? errors.password : ''}
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                }
              />
              <div className="mt-2">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Must include:</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                  <li className={`flex items-center ${formData.password.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <Check className="h-4 w-4 mr-1" /> At least 8 characters
                  </li>
                  <li className={`flex items-center ${/[a-z]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <Check className="h-4 w-4 mr-1" /> 1 lowercase letter
                  </li>
                  <li className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <Check className="h-4 w-4 mr-1" /> 1 uppercase letter
                  </li>
                  <li className={`flex items-center ${/[0-9]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <Check className="h-4 w-4 mr-1" /> 1 number
                  </li>
                  <li className={`flex items-center ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <Check className="h-4 w-4 mr-1" /> 1 special character
                  </li>
                </ul>
              </div>
            </div>

            <div className="relative">
              <ProfessionalInput
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                icon={Lock}
                error={touched.confirmPassword ? errors.confirmPassword : ''}
                helper="Re-enter your password to confirm."
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                }
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mt-2">
              <div className={`text-xs font-medium ${currentStep <= 2 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                Step 2
              </div>
            </div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Professional Background</h2>
              <p className="text-gray-600 dark:text-gray-400">Tell us about your current role and experience</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <ProfessionalSelect
                  label="Experience Level"
                  value={formData.experience}
                  onChange={(e) => updateFormData('experience', e.target.value)}
                  options={[
                    { value: 'student', label: 'Student' },
                    { value: 'junior', label: 'Junior Developer (0-2 years)' },
                    { value: 'mid', label: 'Mid-level Developer (2-5 years)' },
                    { value: 'senior', label: 'Senior Developer (5+ years)' },
                    { value: 'lead', label: 'Lead/Principal Developer' }
                  ]}
                  placeholder="Select your experience level"
                  required
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">We use this to tailor challenge difficulty.</p>
              </div>
              <div>
                <ProfessionalSelect
                  label="Developer Persona"
                  value={formData.persona}
                  onChange={(e) => updateFormData('persona', e.target.value)}
                  options={[
                    { value: 'startup', label: 'Startup Developer' },
                    { value: 'corporate', label: 'Corporate Engineer' },
                    { value: 'freelancer', label: 'Freelancer' },
                    { value: 'student', label: 'College Student' },
                    { value: 'remote', label: 'Remote Worker' }
                  ]}
                  placeholder="Choose your persona"
                  required
                />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Helps us personalize content and tips.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProfessionalInput
                label="Current Role"
                placeholder="e.g., Frontend Developer, Full Stack Engineer"
                value={formData.currentRole}
                onChange={(e) => updateFormData('currentRole', e.target.value)}
                icon={Briefcase}
                required
              />
              <ProfessionalInput
                label="Company (Optional)"
                placeholder="Where do you currently work?"
                value={formData.company}
                onChange={(e) => updateFormData('company', e.target.value)}
                icon={Briefcase}
              />
            </div>

            <ProfessionalInput
              label="Location (Optional)"
              placeholder="e.g., San Francisco, CA"
              value={formData.location}
              onChange={(e) => updateFormData('location', e.target.value)}
              icon={MapPin}
              helper="We may adapt scenarios based on your region/timezone."
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mt-2">
              <div className={`text-xs font-medium ${currentStep <= 3 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                Step 3
              </div>
            </div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Technical Skills</h2>
              <p className="text-gray-600 dark:text-gray-400">Help us understand your technical background</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Programming Languages *
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{`(${formData.programmingLanguages.length} selected)`}</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {['JavaScript', 'Python', 'Java', 'C++', 'TypeScript', 'Go', 'Rust', 'PHP', 'C#', 'Swift', 'Kotlin', 'Ruby'].map((lang) => (
                  <label key={lang} className="cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.programmingLanguages.includes(lang)}
                      onChange={(e) => updateArrayField('programmingLanguages', lang, e.target.checked)}
                      className="peer sr-only"
                    />
                    <span className="block w-full px-3 py-2 rounded-lg border text-sm text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600">
                      {lang}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Select at least one.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Frameworks & Libraries *
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{`(${formData.frameworks.length} selected)`}</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {['React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'Rails', 'Next.js', 'Svelte'].map((framework) => (
                  <label key={framework} className="cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.frameworks.includes(framework)}
                      onChange={(e) => updateArrayField('frameworks', framework, e.target.checked)}
                      className="peer sr-only"
                    />
                    <span className="block w-full px-3 py-2 rounded-lg border text-sm text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600">
                      {framework}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Select at least one.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Databases <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(optional)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'Cassandra', 'DynamoDB'].map((db) => (
                  <label key={db} className="cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.databases.includes(db)}
                      onChange={(e) => updateArrayField('databases', db, e.target.checked)}
                      className="peer sr-only"
                    />
                    <span className="block w-full px-3 py-2 rounded-lg border text-sm text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600">
                      {db}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mt-2">
              <div className={`text-xs font-medium ${currentStep <= 4 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                Step 4
              </div>
            </div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Goals & Learning Style</h2>
              <p className="text-gray-600 dark:text-gray-400">Help us personalize your coding journey</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                What are your main goals? *
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{`(${formData.goals.length} selected)`}</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Improve interview skills',
                  'Learn new technologies',
                  'Practice problem solving',
                  'Build portfolio projects',
                  'Prepare for job change',
                  'Enhance debugging skills',
                  'Master algorithms & data structures',
                  'Improve code quality'
                ].map((goal) => (
                  <label key={goal} className="cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.goals.includes(goal)}
                      onChange={(e) => updateArrayField('goals', goal, e.target.checked)}
                      className="peer sr-only"
                    />
                    <span className="block w-full px-3 py-2 rounded-lg border text-sm text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600">
                      {goal}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Preferred Challenge Types *
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{`(${formData.challengeTypes.length} selected)`}</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Data Structures & Algorithms',
                  'Bug Fixing Challenges',
                  'Feature Development',
                  'System Design',
                  'Code Review Practice',
                  'Performance Optimization'
                ].map((type) => (
                  <label key={type} className="cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.challengeTypes.includes(type)}
                      onChange={(e) => updateArrayField('challengeTypes', type, e.target.checked)}
                      className="peer sr-only"
                    />
                    <span className="block w-full px-3 py-2 rounded-lg border text-sm text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600">
                      {type}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <ProfessionalSelect
              label="Learning Style"
              value={formData.learningStyle}
              onChange={(e) => updateFormData('learningStyle', e.target.value)}
              options={[
                { value: 'hands-on', label: 'Hands-on Practice' },
                { value: 'guided', label: 'Guided Learning' },
                { value: 'challenge', label: 'Challenge-based' },
                { value: 'collaborative', label: 'Collaborative Learning' }
              ]}
              placeholder="How do you prefer to learn?"
            />
          </div>
        );

      case 5:
        return null;
      default:
        return null;
    }
  };
  const stepContent = renderStep();
  const steps = [
    { id: 1, label: 'Account', icon: User },
    { id: 2, label: 'Profile', icon: Briefcase },
    { id: 3, label: 'Skills', icon: Code },
    { id: 4, label: 'Goals', icon: Target },
  ];
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 group mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg group-hover:scale-110 transition-transform duration-200">
              <Code className="h-7 w-7 text-white" />
            </div>
            <span className="font-black text-2xl text-gray-900 dark:bg-gradient-to-r dark:from-blue-600 dark:to-purple-600 dark:bg-clip-text dark:text-transparent">
              StackRush
            </span>
          </Link>
        </div>
        {/* Progress Stepper */}
        <div className="mb-8">
          <div className="relative px-2">
            {/* <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 rounded-full bg-gray-200 dark:bg-gray-700" /> */}
            <div
              className="absolute left-4 top-1/2 -translate-y-1/2 h-1 rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: progress <= 0 ? '0' : `calc(${progress}% - 1rem)` }}
            />
            <ol className="relative z-10 grid grid-cols-4 gap-2">
              {steps.map((s) => {
                const Icon = s.icon;
                const isComplete = s.id < currentStep;
                const isCurrent = s.id === currentStep;
                return (
                  <li key={s.id} className="flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border transition-colors duration-200 ${
                        isComplete
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : isCurrent
                          ? 'bg-blue-50 border-blue-600 text-blue-600 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400'
                          : 'bg-gray-200 border-gray-200 text-gray-600 dark:bg-gray-700 dark:border-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {isComplete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <div className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300">{s.label}</div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <ProfessionalCard className="p-8">
          <form onSubmit={handleSignup} className="space-y-6">
            {stepContent}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {currentStep > 1 ? (
                <ProfessionalButton
                  variant="outline"
                  onClick={prevStep}
                >
                  Previous
                </ProfessionalButton>
              ) : (
                <div></div>
              )}
              
              {currentStep < 4 ? (
                <ProfessionalButton
                  variant="primary"
                  onClick={nextStep}
                  disabled={!isFormValid}
                >
                  Next Step
                </ProfessionalButton>
              ) : (
                <ProfessionalButton
                  variant="primary"
                  className="w-full"
                  loading={isLoading}
                  type="submit"
                  disabled={!isFormValid}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </ProfessionalButton>
              )}
            </div>
          </form>

          {currentStep === 1 && (
            <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                Sign in
              </Link>
            </p>
            </div>
          )}
        </ProfessionalCard>
      </div>
    </div>
  );
};

export default SignupPage;