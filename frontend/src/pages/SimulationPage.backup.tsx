import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Play, RotateCcw, Send, MessageSquare, Bug, GitBranch,
  Clock, Zap, TrendingDown, TrendingUp, AlertTriangle, Phone,
  Users, Target, Code, CheckCircle, XCircle,
  ArrowLeft, Maximize2, Minimize2, Volume2, VolumeX, Settings,
  HelpCircle, X, ChevronRight, Activity, Database, Server,
  Wifi, Monitor, BarChart3, Calendar, FileText, Star,
  Terminal, Globe, Shield, Cpu, HardDrive, Network, Zap as Lightning,
  MessageCircle, Briefcase, Home, Building, Plus, User, LucideIcon,
  File, Folder, FolderOpen, Play as PlayIcon, Terminal as TerminalIcon
} from 'lucide-react';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import { IDELayout } from '../components/IDELayout';
import { APITester } from '../components/APITester';


import { useTheme } from '../context/ThemeContext';
import { useWebContainer } from '../hooks/useWebContainer';
import { useChallenge } from '../hooks/useChallenge';
import { challengesApi } from '../services/api';
import { FrontendPreview } from '../components/FrontendPreview';

// Define types for our test results and other interfaces
interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
  error?: string;
}

// Updated Challenge interface to match API structure
interface Challenge {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  description: string;
  type: 'dsa' | 'bug-fix' | 'feature';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  tags: string[];
  timeLimit: number;
  content: {
    problemStatement: string;
    constraints?: string;
    examples: Array<{
      input: string;
      output: string;
      explanation?: string;
    }>;
    hints?: string[];
    solution?: string;
  };
  code: {
    starterCode?: {
      javascript?: string;
      typescript?: string;
    };
    testCases: Array<{
      input: string;
      expectedOutput: string;
      isHidden: boolean;
      weight: number;
    }>;
    validationRules?: {
      forbiddenKeywords?: string[];
      requiredKeywords?: string[];
    };
  };
  scenario?: {
    background: string;
    role: string;
    company: string;
    urgency: 'low' | 'medium' | 'high';
    distractions?: Array<{
      type: string;
      frequency: string;
      content: string;
    }>;
  };
  stats: {
    totalAttempts: number;
    successfulAttempts: number;
    averageTime: number;
    averageScore: number;
    popularityScore: number;
  };
  [key: string]: any; // Allow additional properties
}

interface NewsItem {
  id: number;
  type: 'positive' | 'neutral' | 'negative';
  message: string;
  time: string;
}

// TeamMessage interface with all required properties
interface TeamMessage {
  id: number | string;
  sender: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'urgent';
  timestamp: string;
  time: string; // Formatted time string for display
}

// Enhanced Distraction interface
interface EnhancedDistraction {
  id?: number;
  type: string;
  message: string;
  content?: string;
  icon?: LucideIcon;
  color?: string;
  actions?: string[];
  timestamp?: string;
}

// Type for distraction
interface Distraction {
  type: string;
  message: string;
  content?: string;
  icon?: LucideIcon;
  color?: string;
  actions?: string[];
}

// Enhanced Bug interface
interface Bug {
  id: number;
  message: string;
  title?: string;
  description?: string;
  severity?: string;
  reporter?: string;
}


// Type for team message
interface TeamMessage {
  id: string | number;
  sender: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'urgent';
  timestamp: string;
  time: string;
}

// Add this interface for file structure
interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
}

const SimulationPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const mode = searchParams.get('mode') || 'standard';
  const challengeType = searchParams.get('type') || 'dsa';
  
  // Challenge state
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(3600); // 60 minutes
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [focusLevel, setFocusLevel] = useState<number>(100);

  // UI State
  const [showTeamChat, setShowTeamChat] = useState<boolean>(false);
  const [showSeniorHelp, setShowSeniorHelp] = useState<boolean>(false);
  // Senior help chat state
  const [seniorMessages, setSeniorMessages] = useState<Array<{
    id: number;
    sender: 'user' | 'senior';
    message: string;
    time: string;
  }>>([{
    id: 1,
    sender: 'senior',
    message: "Hey! I'm here to help. What are you working on? Feel free to ask about algorithms, debugging, or any technical challenges you're facing. 👨‍💻",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }]);
  const [isWaitingForSenior, setIsWaitingForSenior] = useState(false);
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [showDistraction, setShowDistraction] = useState<Distraction | null>(null);

  // Panels
  const [showJiraPanel, setShowJiraPanel] = useState<boolean>(false);
  const [showDeployPanel, setShowDeployPanel] = useState<boolean>(false);

  // Messages
  const [teamMessages, setTeamMessages] = useState<TeamMessage[]>([]);
  const [distractions, setDistractions] = useState<EnhancedDistraction[]>([]);
  const [bugs, setBugs] = useState<Bug[]>([]);

  // Jira state
  const [jiraStatus, setJiraStatus] = useState<string>('In Progress');
  const [jiraComments, setJiraComments] = useState<Array<{ id: number, user: string, text: string, time: string }>>([]);
  const [newComment, setNewComment] = useState<string>('');

  // Deployment state
  const [deploymentStatus, setDeploymentStatus] = useState<string>('idle');
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [deploymentHistory, setDeploymentHistory] = useState<Array<{
    id: string;
    status: 'success' | 'failed' | 'pending';
    time: string;
    commit: string;
    author: string;
  }>>([]);

  // System state
  const [systemHealth, setSystemHealth] = useState({
    api: 100,
    database: 100,
    cache: 100,
    build: 100,
  });

  // Game state
  const [mentorRequests, setMentorRequests] = useState<number>(3);
  const [managerMood, setManagerMood] = useState<number>(75);
  const [clientMood, setClientMood] = useState<number>(75);

  // Safe challenge access with proper type assertion
  const safeChallenge: Challenge = {
    id: '1',
    _id: '1',
    title: 'Challenge Title',
    slug: 'challenge-title',
    description: 'Challenge description goes here...',
    difficulty: 'Medium',
    type: 'dsa',
    category: 'algorithms',
    tags: ['array', 'sorting'],
    timeLimit: 30,
    content: {
      problemStatement: 'Solve the problem',
      examples: []
    },
    code: {
      starterCode: {
        javascript: '// Your code here'
      },
      testCases: []
    },
    stats: {
      totalAttempts: 0,
      successfulAttempts: 0,
      averageTime: 0,
      averageScore: 0,
      popularityScore: 0
    }
  };

  // Helper functions defined first
  const getInitialCode = useCallback((): string => {
    // Fallback to default templates based on challengeType only
    if (challengeType === 'dsa') {
      return '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Your solution here\n    \n}';
    } else if (challengeType === 'bug-fix') {
      return '// Fix the authentication bug\n// The issue is in the email validation\n\nfunction validateEmail(email) {\n    // Current buggy implementation\n    const regex = new RegExp("^[a-zA-Z0-9@.]+$");\n    return regex.test(email);\n}\n\nfunction authenticateUser(email, password) {\n    if (!validateEmail(email)) {\n        throw new Error("Invalid email format");\n    }\n    // Authentication logic here...\n    return { success: true, user: { email } };\n}\n\n// Test the function\nconsole.log(authenticateUser("user+test@example.com", "password"));';
    } else {
      return 'import React, { useState, useEffect } from \'react\';\nimport \'./UserDashboard.css\';\n\nfunction UserDashboard() {\n    const [user, setUser] = useState(null);\n    const [stats, setStats] = useState({});\n    const [loading, setLoading] = useState(true);\n    \n    useEffect(() => {\n        // Fetch user data\n        fetchUserData();\n    }, []);\n    \n    const fetchUserData = async () => {\n        try {\n            // API call implementation needed\n            setLoading(false);\n        } catch (error) {\n            console.error(\'Error fetching user data:\', error);\n        }\n    };\n    \n    if (loading) {\n        return <div className="loading">Loading...</div>;\n    }\n    \n    return (\n        <div className="dashboard">\n            <h1>User Dashboard</h1>\n            {/* Implementation needed */}\n        </div>\n    );\n}\n\nexport default UserDashboard;';
    }
  }, [challengeType]); // Removed challenge from dependencies to prevent circular dependency

  // Route protection
  useEffect(() => {
    if (!id || !mode || !challengeType) {
      navigate('/portal/challenge/' + (id || '1'));
      return;
    }
  }, [id, mode, challengeType, navigate]);

  // Additional state variables
  const distractionFrequency = searchParams.get('distractionLevel') || 'medium';
  const [newChatMessage, setNewChatMessage] = useState('');
  const [companyNews] = useState<NewsItem[]>([
    { id: 1, type: 'positive', message: 'New client signed! Team morale +5', time: '09:10' },
    { id: 2, type: 'neutral', message: 'Coffee machine maintenance at 2 PM', time: '09:05' }
  ]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // Callback functions - moved here to be defined before use
  const addTeamMessage = useCallback((
    sender: string,
    message: string,
    msgType: 'info' | 'warning' | 'error' | 'success' | 'urgent' = 'info'
  ) => {
    const now = new Date();
    const newMessage: TeamMessage = {
      id: Date.now().toString(),
      sender,
      message,
      type: msgType,
      timestamp: now.toISOString(),
      time: now.toLocaleTimeString()
    };

    setTeamMessages(prev => [...prev, newMessage]);
  }, []);

  const triggerRandomDistraction = useCallback(() => {
    // Enhanced distraction types with icons and actions
    const distractionTypes = [
      {
        type: 'call',
        message: 'Incoming call from manager',
        content: 'Your manager is calling for a quick status update on the project. This could be important.',
        icon: Phone,
        color: 'text-orange-500',
        actions: ['Answer', 'Decline']
      },
      {
        type: 'meeting',
        message: 'Urgent team sync meeting',
        content: 'The team lead has called for an emergency sync meeting starting in 2 minutes. All developers required.',
        icon: Users,
        color: 'text-blue-500',
        actions: ['Join Meeting', 'Skip (Mark as Sick)']
      },
      {
        type: 'alert',
        message: 'Production system alert',
        content: 'Critical alert: Production API response time has increased by 300%. Database performance degraded.',
        icon: AlertTriangle,
        color: 'text-red-500',
        actions: ['Investigate', 'Continue Working']
      },
      {
        type: 'question',
        message: 'Teammate needs help',
        content: 'Sarah from the frontend team is stuck on a React component issue and needs your expertise.',
        icon: MessageSquare,
        color: 'text-green-500',
        actions: ['Help Now', 'Help Later']
      },
      {
        type: 'email',
        message: 'Urgent client email',
        content: 'Client has sent a high-priority email about changing requirements. Needs immediate attention.',
        icon: MessageCircle,
        color: 'text-purple-500',
        actions: ['Read Email', 'Check Later']
      }
    ];

    const randomDistraction = distractionTypes[Math.floor(Math.random() * distractionTypes.length)];
    setShowDistraction(randomDistraction);

    // Add a team message about the distraction
    addTeamMessage('System', `🚨 ${randomDistraction.message}`, 'warning');

    // Add to distractions list for tracking
    const newDistraction: EnhancedDistraction = {
      id: Date.now(),
      type: randomDistraction.type,
      message: randomDistraction.message,
      timestamp: new Date().toLocaleTimeString(),
      icon: randomDistraction.icon,
      color: randomDistraction.color
    };
    setDistractions(prev => [...prev, newDistraction]);
  }, [addTeamMessage]);

  // Load challenge data from backend
  useEffect(() => {
    const loadChallenge = async () => {
      if (!id) return;
      
      try {
        // Fetch challenge from backend API
        const response = await challengesApi.getChallengeById(id);
        const challengeData = response; // API response already contains the data
        
        // Transform API challenge to match our interface
        const transformedChallenge: Challenge = {
          id: challengeData._id,
          _id: challengeData._id,
          title: challengeData.title,
          slug: challengeData.slug,
          description: challengeData.description,
          type: challengeData.type,
          difficulty: challengeData.difficulty,
          category: challengeData.category,
          tags: challengeData.tags || [],
          timeLimit: challengeData.timeLimit,
          content: {
            problemStatement: challengeData.content?.problemStatement || '',
            constraints: challengeData.content?.constraints,
            examples: challengeData.content?.examples || [],
            hints: challengeData.content?.hints || [],
            solution: challengeData.content?.solution
          },
          code: {
            starterCode: challengeData.code?.starterCode,
            testCases: challengeData.code?.testCases || [],
            validationRules: challengeData.code?.validationRules
          },
          scenario: challengeData.scenario,
          stats: {
            totalAttempts: challengeData.stats?.totalAttempts || 0,
            successfulAttempts: challengeData.stats?.successfulAttempts || 0,
            averageTime: challengeData.stats?.averageTime || 0,
            averageScore: challengeData.stats?.averageScore || 0,
            popularityScore: challengeData.stats?.popularityScore || 0
          }
        };
        
        setChallenge(transformedChallenge);
        
        // Set initial code from challenge starter code
        const initialCode = challengeData.code?.starterCode?.javascript || transformedChallenge.code?.starterCode?.javascript || '// Starter code not available';
        setCode(initialCode);
        
        // Set time limit from challenge
        if (challengeData.timeLimit) {
          setTimeRemaining(challengeData.timeLimit * 60); // Convert minutes to seconds
        }
      } catch (error) {
        console.error('Failed to load challenge:', error);
        // Fallback to safe challenge
        setChallenge(safeChallenge);
        // Use the safe challenge's starter code directly
        setCode(safeChallenge.code?.starterCode?.javascript || '// Starter code not available');
      }
    };
    
    loadChallenge();
  }, [id]); // Removed getInitialCode from dependencies to prevent infinite loop

  // Auto npm install when package.json changes
  useEffect(() => {
    if (!challenge) return;
    
    // Check if we have a WebContainer instance and install dependencies
    const checkAndInstallDependencies = async () => {
      try {
        // This would be implemented in the WebContainer service
        console.log('Checking for dependencies to install...');
        // The WebContainer service will automatically install dependencies when package.json is written
      } catch (error) {
        console.error('Error checking/installing dependencies:', error);
      }
    };
    
    checkAndInstallDependencies();
  }, [challenge]);
  
  // Initialize team messages based on challenge scenario
  useEffect(() => {
    if (challenge?.scenario?.distractions) {
      const initialMessages = challenge.scenario.distractions.map((distraction, index) => ({
        id: index + 1,
        sender: 'System',
        message: distraction.content,
        time: new Date().toLocaleTimeString(),
        type: 'info' as const,
        timestamp: new Date().toISOString()
      }));
      setTeamMessages(initialMessages);
    }
  }, [challenge]);
  
  // Handle when time is up
  const handleTimeUp = useCallback(() => {
    navigate(`/portal/challenge-complete/${id}?success=false&score=0&time=00:00&reason=timeout`);
  }, [id, navigate]);

  // Timer countdown effect
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleTimeUp();
    }
  }, [timeRemaining, handleTimeUp]);

  // Distraction triggering logic based on challenge scenario data
  useEffect(() => {
    // Only set up distractions if we have scenario data and not in zen mode
    if (!challenge?.scenario?.distractions || mode === 'zen') return;

    // Clear any existing intervals
    const distractionIntervals: NodeJS.Timeout[] = [];

    // Set up distraction intervals based on challenge scenario
    challenge.scenario.distractions.forEach((distraction) => {
      let intervalTime = 0;
      
      // Convert frequency to actual time intervals
      switch (distraction.frequency) {
        case 'low':
          intervalTime = 180000; // 3 minutes
          break;
        case 'medium':
          intervalTime = 120000; // 2 minutes
          break;
        case 'high':
          intervalTime = 60000; // 1 minute
          break;
        default:
          intervalTime = 120000; // default to medium
      }

      // Create interval for this distraction
      const interval = setInterval(() => {
        // Only trigger distractions if not in zen mode and time remaining > 5 minutes
        if (mode !== 'zen' && timeRemaining > 300) {
          triggerRandomDistraction();
        }
      }, intervalTime);

      distractionIntervals.push(interval);
    });

    // Cleanup function to clear all intervals when component unmounts or dependencies change
    return () => {
      distractionIntervals.forEach(interval => clearInterval(interval));
    };
  }, [challenge, mode, timeRemaining, triggerRandomDistraction]);

  // Helper function for initial messages based on challenge scenario
  function getInitialMessages(): TeamMessage[] {
    if (challenge?.scenario?.distractions) {
      return challenge.scenario.distractions.map((distraction, index) => ({
        id: index + 1,
        sender: 'System',
        message: distraction.content,
        time: new Date().toLocaleTimeString(),
        type: 'info' as const,
        timestamp: new Date().toISOString()
      }));
    }
    
    // Fallback to original logic
    if (challengeType === 'dsa') {
      return [];
    } else if (challengeType === 'bug-fix') {
      return [
        { id: 1, sender: 'Sarah (QA)', message: 'Hey! The login bug is affecting 30% of users. Priority is critical 🚨', time: '09:15', type: 'urgent', timestamp: new Date().toISOString() },
        { id: 2, sender: 'Mike (Manager)', message: 'Client is asking for ETA on the fix. How long do you need?', time: '09:18', type: 'urgent', timestamp: new Date().toISOString() },
        { id: 3, sender: 'DevOps', message: 'Production logs show 500 errors spiking. Need this fixed ASAP!', time: '09:20', type: 'urgent', timestamp: new Date().toISOString() }
      ];
    } else {
      return [
        { id: 1, sender: 'Alex (PM)', message: 'Dashboard mockups are ready. Check Figma for latest designs 🎨', time: '09:10', type: 'info', timestamp: new Date().toISOString() },
        { id: 2, sender: 'Jordan (Backend)', message: 'API endpoints are deployed. Documentation in team chat', time: '09:12', type: 'info', timestamp: new Date().toISOString() },
        { id: 3, sender: 'Sam (Designer)', message: 'Can we make the stats cards more prominent? Client feedback', time: '09:20', type: 'info', timestamp: new Date().toISOString() },
        { id: 4, sender: 'QA Team', message: 'Please ensure mobile responsiveness. Testing on various devices', time: '09:25', type: 'info', timestamp: new Date().toISOString() }
      ];
    }
  }

  // Chat enhancement state
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [onlineUsers] = useState([
    { name: 'Alex (PM)', status: 'online' },
    { name: 'Sarah (QA)', status: 'online' },
    { name: 'Mike (Manager)', status: 'away' },
    { name: 'Jordan (Backend)', status: 'online' },
    { name: 'Sam (Designer)', status: 'online' }
  ]);
// Define types for our test results and other interfaces
interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
  error?: string;
}

// Updated Challenge interface to match API structure
interface Challenge {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  description: string;
  type: 'dsa' | 'bug-fix' | 'feature';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  tags: string[];
  timeLimit: number;
  content: {
    problemStatement: string;
    constraints?: string;
    examples: Array<{
      input: string;
      output: string;
      explanation?: string;
    }>;
    hints?: string[];
    solution?: string;
  };
  code: {
    starterCode?: {
      javascript?: string;
      typescript?: string;
    };
    testCases: Array<{
      input: string;
      expectedOutput: string;
      isHidden: boolean;
      weight: number;
    }>;
    validationRules?: {
      forbiddenKeywords?: string[];
      requiredKeywords?: string[];
    };
  };
  scenario?: {
    background: string;
    role: string;
    company: string;
    urgency: 'low' | 'medium' | 'high';
    distractions?: Array<{
      type: string;
      frequency: string;
      content: string;
    }>;
  };
  stats: {
    totalAttempts: number;
    successfulAttempts: number;
    averageTime: number;
    averageScore: number;
    popularityScore: number;
  };
  [key: string]: any; // Allow additional properties
}

interface NewsItem {
  id: number;
  type: 'positive' | 'neutral' | 'negative';
  message: string;
  time: string;
}

// TeamMessage interface with all required properties
interface TeamMessage {
  id: number | string;
  sender: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'urgent';
  timestamp: string;
  time: string; // Formatted time string for display
}

// Enhanced Distraction interface
interface EnhancedDistraction {
  id?: number;
  type: string;
  message: string;
  content?: string;
  icon?: LucideIcon;
  color?: string;
  actions?: string[];
  timestamp?: string;
}

// Type for distraction
interface Distraction {
  type: string;
  message: string;
  content?: string;
  icon?: LucideIcon;
  color?: string;
  actions?: string[];
}

// Enhanced Bug interface
interface Bug {
  id: number;
  message: string;
  title?: string;
  description?: string;
  severity?: string;
  reporter?: string;
}


// Type for team message
interface TeamMessage {
  id: string | number;
  sender: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'urgent';
  timestamp: string;
  time: string;
}

// Add this interface for file structure
interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
}

const SimulationPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const mode = searchParams.get('mode') || 'standard';
  const challengeType = searchParams.get('type') || 'dsa';
  
  // Challenge state
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(3600); // 60 minutes
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [focusLevel, setFocusLevel] = useState<number>(100);

  // UI State
  const [showTeamChat, setShowTeamChat] = useState<boolean>(false);
  const [showSeniorHelp, setShowSeniorHelp] = useState<boolean>(false);
  // Senior help chat state
  const [seniorMessages, setSeniorMessages] = useState<Array<{
    id: number;
    sender: 'user' | 'senior';
    message: string;
    time: string;
  }>>([{
    id: 1,
    sender: 'senior',
    message: "Hey! I'm here to help. What are you working on? Feel free to ask about algorithms, debugging, or any technical challenges you're facing. 👨‍💻",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }]);
  const [isWaitingForSenior, setIsWaitingForSenior] = useState(false);
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [showDistraction, setShowDistraction] = useState<Distraction | null>(null);

  // Panels
  const [showJiraPanel, setShowJiraPanel] = useState<boolean>(false);
  const [showDeployPanel, setShowDeployPanel] = useState<boolean>(false);

  // Messages
  const [teamMessages, setTeamMessages] = useState<TeamMessage[]>([]);
  const [distractions, setDistractions] = useState<EnhancedDistraction[]>([]);
  const [bugs, setBugs] = useState<Bug[]>([]);

  // Jira state
  const [jiraStatus, setJiraStatus] = useState<string>('In Progress');
  const [jiraComments, setJiraComments] = useState<Array<{ id: number, user: string, text: string, time: string }>>([]);
  const [newComment, setNewComment] = useState<string>('');

  // Deployment state
  const [deploymentStatus, setDeploymentStatus] = useState<string>('idle');
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [deploymentHistory, setDeploymentHistory] = useState<Array<{
    id: string;
    status: 'success' | 'failed' | 'pending';
    time: string;
    commit: string;
    author: string;
  }>>([]);

  // System state
  const [systemHealth, setSystemHealth] = useState({
    api: 100,
    database: 100,
    cache: 100,
    build: 100,
  });

  // Game state
  const [mentorRequests, setMentorRequests] = useState<number>(3);
  const [managerMood, setManagerMood] = useState<number>(75);
  const [clientMood, setClientMood] = useState<number>(75);

  // Safe challenge access with proper type assertion
  const safeChallenge: Challenge = {
    id: '1',
    _id: '1',
    title: 'Challenge Title',
    slug: 'challenge-title',
    description: 'Challenge description goes here...',
    difficulty: 'Medium',
    type: 'dsa',
    category: 'algorithms',
    tags: ['array', 'sorting'],
    timeLimit: 30,
    content: {
      problemStatement: 'Solve the problem',
      examples: []
    },
    code: {
      starterCode: {
        javascript: '// Your code here'
      },
      testCases: []
    },
    stats: {
      totalAttempts: 0,
      successfulAttempts: 0,
      averageTime: 0,
      averageScore: 0,
      popularityScore: 0
    }
  };

  // Helper functions defined first
  const getInitialCode = useCallback((): string => {
    // Fallback to default templates based on challengeType only
    if (challengeType === 'dsa') {
      return '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Your solution here\n    \n}';
    } else if (challengeType === 'bug-fix') {
      return '// Fix the authentication bug\n// The issue is in the email validation\n\nfunction validateEmail(email) {\n    // Current buggy implementation\n    const regex = new RegExp("^[a-zA-Z0-9@.]+$");\n    return regex.test(email);\n}\n\nfunction authenticateUser(email, password) {\n    if (!validateEmail(email)) {\n        throw new Error("Invalid email format");\n    }\n    // Authentication logic here...\n    return { success: true, user: { email } };\n}\n\n// Test the function\nconsole.log(authenticateUser("user+test@example.com", "password"));';
    } else {
      return 'import React, { useState, useEffect } from \'react\';\nimport \'./UserDashboard.css\';\n\nfunction UserDashboard() {\n    const [user, setUser] = useState(null);\n    const [stats, setStats] = useState({});\n    const [loading, setLoading] = useState(true);\n    \n    useEffect(() => {\n        // Fetch user data\n        fetchUserData();\n    }, []);\n    \n    const fetchUserData = async () => {\n        try {\n            // API call implementation needed\n            setLoading(false);\n        } catch (error) {\n            console.error(\'Error fetching user data:\', error);\n        }\n    };\n    \n    if (loading) {\n        return <div className="loading">Loading...</div>;\n    }\n    \n    return (\n        <div className="dashboard">\n            <h1>User Dashboard</h1>\n            {/* Implementation needed */}\n        </div>\n    );\n}\n\nexport default UserDashboard;';
    }
  }, [challengeType]); // Removed challenge from dependencies to prevent circular dependency

  // Route protection
  useEffect(() => {
    if (!id || !mode || !challengeType) {
      navigate('/portal/challenge/' + (id || '1'));
      return;
    }
  }, [id, mode, challengeType, navigate]);

  // Additional state variables
  const distractionFrequency = searchParams.get('distractionLevel') || 'medium';
  const [newChatMessage, setNewChatMessage] = useState('');
  const [companyNews] = useState<NewsItem[]>([
    { id: 1, type: 'positive', message: 'New client signed! Team morale +5', time: '09:10' },
    { id: 2, type: 'neutral', message: 'Coffee machine maintenance at 2 PM', time: '09:05' }
  ]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // Callback functions - moved here to be defined before use
  const addTeamMessage = useCallback((
    sender: string,
    message: string,
    msgType: 'info' | 'warning' | 'error' | 'success' | 'urgent' = 'info'
  ) => {
    const now = new Date();
    const newMessage: TeamMessage = {
      id: Date.now().toString(),
      sender,
      message,
      type: msgType,
      timestamp: now.toISOString(),
      time: now.toLocaleTimeString()
    };

    setTeamMessages(prev => [...prev, newMessage]);
  }, []);

  const triggerRandomDistraction = useCallback(() => {
    // Enhanced distraction types with icons and actions
    const distractionTypes = [
      {
        type: 'call',
        message: 'Incoming call from manager',
        content: 'Your manager is calling for a quick status update on the project. This could be important.',
        icon: Phone,
        color: 'text-orange-500',
        actions: ['Answer', 'Decline']
      },
      {
        type: 'meeting',
        message: 'Urgent team sync meeting',
        content: 'The team lead has called for an emergency sync meeting starting in 2 minutes. All developers required.',
        icon: Users,
        color: 'text-blue-500',
        actions: ['Join Meeting', 'Skip (Mark as Sick)']
      },
      {
        type: 'alert',
        message: 'Production system alert',
        content: 'Critical alert: Production API response time has increased by 300%. Database performance degraded.',
        icon: AlertTriangle,
        color: 'text-red-500',
        actions: ['Investigate', 'Continue Working']
      },
      {
        type: 'question',
        message: 'Teammate needs help',
        content: 'Sarah from the frontend team is stuck on a React component issue and needs your expertise.',
        icon: MessageSquare,
        color: 'text-green-500',
        actions: ['Help Now', 'Help Later']
      },
      {
        type: 'email',
        message: 'Urgent client email',
        content: 'Client has sent a high-priority email about changing requirements. Needs immediate attention.',
        icon: MessageCircle,
        color: 'text-purple-500',
        actions: ['Read Email', 'Check Later']
      }
    ];

    const randomDistraction = distractionTypes[Math.floor(Math.random() * distractionTypes.length)];
    setShowDistraction(randomDistraction);

    // Add a team message about the distraction
    addTeamMessage('System', `🚨 ${randomDistraction.message}`, 'warning');

    // Add to distractions list for tracking
    const newDistraction: EnhancedDistraction = {
      id: Date.now(),
      type: randomDistraction.type,
      message: randomDistraction.message,
      timestamp: new Date().toLocaleTimeString(),
      icon: randomDistraction.icon,
      color: randomDistraction.color
    };
    setDistractions(prev => [...prev, newDistraction]);
  }, [addTeamMessage]);

  // Load challenge data from backend
  useEffect(() => {
    const loadChallenge = async () => {
      if (!id) return;
      
      try {
        // Fetch challenge from backend API
        const response = await challengesApi.getChallengeById(id);
        const challengeData = response; // API response already contains the data
        
        // Transform API challenge to match our interface
        const transformedChallenge: Challenge = {
          id: challengeData._id,
          _id: challengeData._id,
          title: challengeData.title,
          slug: challengeData.slug,
          description: challengeData.description,
          type: challengeData.type,
          difficulty: challengeData.difficulty,
          category: challengeData.category,
          tags: challengeData.tags || [],
          timeLimit: challengeData.timeLimit,
          content: {
            problemStatement: challengeData.content?.problemStatement || '',
            constraints: challengeData.content?.constraints,
            examples: challengeData.content?.examples || [],
            hints: challengeData.content?.hints || [],
            solution: challengeData.content?.solution
          },
          code: {
            starterCode: challengeData.code?.starterCode,
            testCases: challengeData.code?.testCases || [],
            validationRules: challengeData.code?.validationRules
          },
          scenario: challengeData.scenario,
          stats: {
            totalAttempts: challengeData.stats?.totalAttempts || 0,
            successfulAttempts: challengeData.stats?.successfulAttempts || 0,
            averageTime: challengeData.stats?.averageTime || 0,
            averageScore: challengeData.stats?.averageScore || 0,
            popularityScore: challengeData.stats?.popularityScore || 0
          }
        };
        
        setChallenge(transformedChallenge);
        
        // Set initial code from challenge starter code
        const initialCode = challengeData.code?.starterCode?.javascript || transformedChallenge.code?.starterCode?.javascript || '// Starter code not available';
        setCode(initialCode);
        
        // Set time limit from challenge
        if (challengeData.timeLimit) {
          setTimeRemaining(challengeData.timeLimit * 60); // Convert minutes to seconds
        }
      } catch (error) {
        console.error('Failed to load challenge:', error);
        // Fallback to safe challenge
        setChallenge(safeChallenge);
        // Use the safe challenge's starter code directly
        setCode(safeChallenge.code?.starterCode?.javascript || '// Starter code not available');
      }
    };
    
    loadChallenge();
  }, [id]); // Removed getInitialCode from dependencies to prevent infinite loop

  // Auto npm install when package.json changes
  useEffect(() => {
    if (!challenge) return;
    
    // Check if we have a WebContainer instance and install dependencies
    const checkAndInstallDependencies = async () => {
      try {
        // This would be implemented in the WebContainer service
        console.log('Checking for dependencies to install...');
        // The WebContainer service will automatically install dependencies when package.json is written
      } catch (error) {
        console.error('Error checking/installing dependencies:', error);
      }
    };
    
    checkAndInstallDependencies();
  }, [challenge]);
  
  // Initialize team messages based on challenge scenario
  useEffect(() => {
    if (challenge?.scenario?.distractions) {
      const initialMessages = challenge.scenario.distractions.map((distraction, index) => ({
        id: index + 1,
        sender: 'System',
        message: distraction.content,
        time: new Date().toLocaleTimeString(),
        type: 'info' as const,
        timestamp: new Date().toISOString()
      }));
      setTeamMessages(initialMessages);
    }
  }, [challenge]);
  
  // Handle when time is up
  const handleTimeUp = useCallback(() => {
    navigate(`/portal/challenge-complete/${id}?success=false&score=0&time=00:00&reason=timeout`);
  }, [id, navigate]);

  // Timer countdown effect
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleTimeUp();
    }
  }, [timeRemaining, handleTimeUp]);

  // Distraction triggering logic based on challenge scenario data
  useEffect(() => {
    // Only set up distractions if we have scenario data and not in zen mode
    if (!challenge?.scenario?.distractions || mode === 'zen') return;

    // Clear any existing intervals
    const distractionIntervals: NodeJS.Timeout[] = [];

    // Set up distraction intervals based on challenge scenario
    challenge.scenario.distractions.forEach((distraction: { type: string; frequency: string; content: string; }) => {
      let intervalTime = 0;
      
      // Convert frequency to actual time intervals
      switch (distraction.frequency) {
        case 'low':
          intervalTime = 180000; // 3 minutes
          break;
        case 'medium':
          intervalTime = 120000; // 2 minutes
          break;
        case 'high':
          intervalTime = 60000; // 1 minute
          break;
        default:
          intervalTime = 120000; // default to medium
      }

      // Create interval for this distraction
      const interval = setInterval(() => {
        // Only trigger distractions if not in zen mode and time remaining > 5 minutes
        if (mode !== 'zen' && timeRemaining > 300) {
          triggerRandomDistraction();
        }
      }, intervalTime);

      distractionIntervals.push(interval);
    });

    // Cleanup function to clear all intervals when component unmounts or dependencies change
    return () => {
      distractionIntervals.forEach(interval => clearInterval(interval));
    };
  }, [challenge, mode, timeRemaining, triggerRandomDistraction]);

  // Helper function for initial messages based on challenge scenario
  function getInitialMessages(): TeamMessage[] {
    if (challenge?.scenario?.distractions) {
      return challenge.scenario.distractions.map((distraction, index) => ({
        id: index + 1,
        sender: 'System',
        message: distraction.content,
        time: new Date().toLocaleTimeString(),
        type: 'info' as const,
        timestamp: new Date().toISOString()
      }));
    }
    
    // Fallback to original logic
    if (challengeType === 'dsa') {
      return [];
    } else if (challengeType === 'bug-fix') {
      return [
        { id: 1, sender: 'Sarah (QA)', message: 'Hey! The login bug is affecting 30% of users. Priority is critical 🚨', time: '09:15', type: 'urgent', timestamp: new Date().toISOString() },
        { id: 2, sender: 'Mike (Manager)', message: 'Client is asking for ETA on the fix. How long do you need?', time: '09:18', type: 'urgent', timestamp: new Date().toISOString() },
        { id: 3, sender: 'DevOps', message: 'Production logs show 500 errors spiking. Need this fixed ASAP!', time: '09:20', type: 'urgent', timestamp: new Date().toISOString() }
      ];
    } else {
      return [
        { id: 1, sender: 'Alex (PM)', message: 'Dashboard mockups are ready. Check Figma for latest designs 🎨', time: '09:10', type: 'info', timestamp: new Date().toISOString() },
        { id: 2, sender: 'Jordan (Backend)', message: 'API endpoints are deployed. Documentation in team chat', time: '09:12', type: 'info', timestamp: new Date().toISOString() },
        { id: 3, sender: 'Sam (Designer)', message: 'Can we make the stats cards more prominent? Client feedback', time: '09:20', type: 'info', timestamp: new Date().toISOString() },
        { id: 4, sender: 'QA Team', message: 'Please ensure mobile responsiveness. Testing on various devices', time: '09:25', type: 'info', timestamp: new Date().toISOString() }
      ];
    }
  }

  // Chat enhancement state
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [onlineUsers] = useState([
    { name: 'Alex (PM)', status: 'online' },
    { name: 'Sarah (QA)', status: 'online' },
    { name: 'Mike (Manager)', status: 'away' },
    { name: 'Jordan (Backend)', status: 'online' },
    { name: 'Sam (Designer)', status: 'online' }
</original_code>```

```
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Play, RotateCcw, Send, MessageSquare, Bug, GitBranch,
  Clock, Zap, TrendingDown, TrendingUp, AlertTriangle, Phone,
  Users, Target, Code, CheckCircle, XCircle,
  ArrowLeft, Maximize2, Minimize2, Volume2, VolumeX, Settings,
  HelpCircle, X, ChevronRight, Activity, Database, Server,
  Wifi, Monitor, BarChart3, Calendar, FileText, Star,
  Terminal, Globe, Shield, Cpu, HardDrive, Network, Zap as Lightning,
  MessageCircle, Briefcase, Home, Building, Plus, User, LucideIcon,
  File, Folder, FolderOpen, Play as PlayIcon, Terminal as TerminalIcon
} from 'lucide-react';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import { IDELayout } from '../components/IDELayout';
import { APITester } from '../components/APITester';


import { useTheme } from '../context/ThemeContext';
import { useWebContainer } from '../hooks/useWebContainer';
import { useChallenge } from '../hooks/useChallenge';
import { challengesApi } from '../services/api';
import { FrontendPreview } from '../components/FrontendPreview';

// Define types for our test results and other interfaces
interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
  error?: string;
}

// Updated Challenge interface to match API structure
interface Challenge {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  description: string;
  type: 'dsa' | 'bug-fix' | 'feature';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  tags: string[];
  timeLimit: number;
  content: {
    problemStatement: string;
    constraints?: string;
    examples: Array<{
      input: string;
      output: string;
      explanation?: string;
    }>;
    hints?: string[];
    solution?: string;
  };
  code: {
    starterCode?: {
      javascript?: string;
      typescript?: string;
    };
    testCases: Array<{
      input: string;
      expectedOutput: string;
      isHidden: boolean;
      weight: number;
    }>;
    validationRules?: {
      forbiddenKeywords?: string[];
      requiredKeywords?: string[];
    };
  };
  scenario?: {
    background: string;
    role: string;
    company: string;
    urgency: 'low' | 'medium' | 'high';
    distractions?: Array<{
      type: string;
      frequency: string;
      content: string;
    }>;
  };
  stats: {
    totalAttempts: number;
    successfulAttempts: number;
    averageTime: number;
    averageScore: number;
    popularityScore: number;
  };
  [key: string]: any; // Allow additional properties
}

interface NewsItem {
  id: number;
  type: 'positive' | 'neutral' | 'negative';
  message: string;
  time: string;
}

// TeamMessage interface with all required properties
interface TeamMessage {
  id: number | string;
  sender: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'urgent';
  timestamp: string;
  time: string; // Formatted time string for display
}

// Enhanced Distraction interface
interface EnhancedDistraction {
  id?: number;
  type: string;
  message: string;
  content?: string;
  icon?: LucideIcon;
  color?: string;
  actions?: string[];
  timestamp?: string;
}

// Type for distraction
interface Distraction {
  type: string;
  message: string;
  content?: string;
  icon?: LucideIcon;
  color?: string;
  actions?: string[];
}

// Enhanced Bug interface
interface Bug {
  id: number;
  message: string;
  title?: string;
  description?: string;
  severity?: string;
  reporter?: string;
}


// Type for team message
interface TeamMessage {
  id: string | number;
  sender: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'urgent';
  timestamp: string;
  time: string;
}

// Add this interface for file structure
interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
}

const SimulationPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const mode = searchParams.get('mode') || 'standard';
  const challengeType = searchParams.get('type') || 'dsa';
  
  // Challenge state
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(3600); // 60 minutes
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [focusLevel, setFocusLevel] = useState<number>(100);

  // UI State
  const [showTeamChat, setShowTeamChat] = useState<boolean>(false);
  const [showSeniorHelp, setShowSeniorHelp] = useState<boolean>(false);
  // Senior help chat state
  const [seniorMessages, setSeniorMessages] = useState<Array<{
    id: number;
    sender: 'user' | 'senior';
    message: string;
    time: string;
  }>>([{
    id: 1,
    sender: 'senior',
    message: "Hey! I'm here to help. What are you working on? Feel free to ask about algorithms, debugging, or any technical challenges you're facing. 👨‍💻",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }]);
  const [isWaitingForSenior, setIsWaitingForSenior] = useState(false);
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [showDistraction, setShowDistraction] = useState<Distraction | null>(null);

  // Panels
  const [showJiraPanel, setShowJiraPanel] = useState<boolean>(false);
  const [showDeployPanel, setShowDeployPanel] = useState<boolean>(false);

  // Messages
  const [teamMessages, setTeamMessages] = useState<TeamMessage[]>([]);
  const [distractions, setDistractions] = useState<EnhancedDistraction[]>([]);
  const [bugs, setBugs] = useState<Bug[]>([]);

  // Jira state
  const [jiraStatus, setJiraStatus] = useState<string>('In Progress');
  const [jiraComments, setJiraComments] = useState<Array<{ id: number, user: string, text: string, time: string }>>([]);
  const [newComment, setNewComment] = useState<string>('');

  // Deployment state
  const [deploymentStatus, setDeploymentStatus] = useState<string>('idle');
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [deploymentHistory, setDeploymentHistory] = useState<Array<{
    id: string;
    status: 'success' | 'failed' | 'pending';
    time: string;
    commit: string;
    author: string;
  }>>([]);

  // System state
  const [systemHealth, setSystemHealth] = useState({
    api: 100,
    database: 100,
    cache: 100,
    build: 100,
  });

  // Game state
  const [mentorRequests, setMentorRequests] = useState<number>(3);
  const [managerMood, setManagerMood] = useState<number>(75);
  const [clientMood, setClientMood] = useState<number>(75);

  // Safe challenge access with proper type assertion
  const safeChallenge: Challenge = {
    id: '1',
    _id: '1',
    title: 'Challenge Title',
    slug: 'challenge-title',
    description: 'Challenge description goes here...',
    difficulty: 'Medium',
    type: 'dsa',
    category: 'algorithms',
    tags: ['array', 'sorting'],
    timeLimit: 30,
    content: {
      problemStatement: 'Solve the problem',
      examples: []
    },
    code: {
      starterCode: {
        javascript: '// Your code here'
      },
      testCases: []
    },
    stats: {
      totalAttempts: 0,
      successfulAttempts: 0,
      averageTime: 0,
      averageScore: 0,
      popularityScore: 0
    }
  };

  // Helper functions defined first
  const getInitialCode = useCallback((): string => {
    // Fallback to default templates based on challengeType only
    if (challengeType === 'dsa') {
      return '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Your solution here\n    \n}';
    } else if (challengeType === 'bug-fix') {
      return '// Fix the authentication bug\n// The issue is in the email validation\n\nfunction validateEmail(email) {\n    // Current buggy implementation\n    const regex = new RegExp("^[a-zA-Z0-9@.]+$");\n    return regex.test(email);\n}\n\nfunction authenticateUser(email, password) {\n    if (!validateEmail(email)) {\n        throw new Error("Invalid email format");\n    }\n    // Authentication logic here...\n    return { success: true, user: { email } };\n}\n\n// Test the function\nconsole.log(authenticateUser("user+test@example.com", "password"));';
    } else {
      return 'import React, { useState, useEffect } from \'react\';\nimport \'./UserDashboard.css\';\n\nfunction UserDashboard() {\n    const [user, setUser] = useState(null);\n    const [stats, setStats] = useState({});\n    const [loading, setLoading] = useState(true);\n    \n    useEffect(() => {\n        // Fetch user data\n        fetchUserData();\n    }, []);\n    \n    const fetchUserData = async () => {\n        try {\n            // API call implementation needed\n            setLoading(false);\n        } catch (error) {\n            console.error(\'Error fetching user data:\', error);\n        }\n    };\n    \n    if (loading) {\n        return <div className="loading">Loading...</div>;\n    }\n    \n    return (\n        <div className="dashboard">\n            <h1>User Dashboard</h1>\n            {/* Implementation needed */}\n        </div>\n    );\n}\n\nexport default UserDashboard;';
    }
  }, [challengeType]); // Removed challenge from dependencies to prevent circular dependency

  // Route protection
  useEffect(() => {
    if (!id || !mode || !challengeType) {
      navigate('/portal/challenge/' + (id || '1'));
      return;
    }
  }, [id, mode, challengeType, navigate]);

  // Additional state variables
  const distractionFrequency = searchParams.get('distractionLevel') || 'medium';
  const [newChatMessage, setNewChatMessage] = useState('');
  const [companyNews] = useState<NewsItem[]>([
    { id: 1, type: 'positive', message: 'New client signed! Team morale +5', time: '09:10' },
    { id: 2, type: 'neutral', message: 'Coffee machine maintenance at 2 PM', time: '09:05' }
  ]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // Callback functions - moved here to be defined before use
  const addTeamMessage = useCallback((
    sender: string,
    message: string,
    msgType: 'info' | 'warning' | 'error' | 'success' | 'urgent' = 'info'
  ) => {
    const now = new Date();
    const newMessage: TeamMessage = {
      id: Date.now().toString(),
      sender,
      message,
      type: msgType,
      timestamp: now.toISOString(),
      time: now.toLocaleTimeString()
    };

    setTeamMessages(prev => [...prev, newMessage]);
  }, []);

  const triggerRandomDistraction = useCallback(() => {
    // Enhanced distraction types with icons and actions
    const distractionTypes = [
      {
        type: 'call',
        message: 'Incoming call from manager',
        content: 'Your manager is calling for a quick status update on the project. This could be important.',
        icon: Phone,
        color: 'text-orange-500',
        actions: ['Answer', 'Decline']
      },
      {
        type: 'meeting',
        message: 'Urgent team sync meeting',
        content: 'The team lead has called for an emergency sync meeting starting in 2 minutes. All developers required.',
        icon: Users,
        color: 'text-blue-500',
        actions: ['Join Meeting', 'Skip (Mark as Sick)']
      },
      {
        type: 'alert',
        message: 'Production system alert',
        content: 'Critical alert: Production API response time has increased by 300%. Database performance degraded.',
        icon: AlertTriangle,
        color: 'text-red-500',
        actions: ['Investigate', 'Continue Working']
      },
      {
        type: 'question',
        message: 'Teammate needs help',
        content: 'Sarah from the frontend team is stuck on a React component issue and needs your expertise.',
        icon: MessageSquare,
        color: 'text-green-500',
        actions: ['Help Now', 'Help Later']
      },
      {
        type: 'email',
        message: 'Urgent client email',
        content: 'Client has sent a high-priority email about changing requirements. Needs immediate attention.',
        icon: MessageCircle,
        color: 'text-purple-500',
        actions: ['Read Email', 'Check Later']
      }
    ];

    const randomDistraction = distractionTypes[Math.floor(Math.random() * distractionTypes.length)];
    setShowDistraction(randomDistraction);

    // Add a team message about the distraction
    addTeamMessage('System', `🚨 ${randomDistraction.message}`, 'warning');

    // Add to distractions list for tracking
    const newDistraction: EnhancedDistraction = {
      id: Date.now(),
      type: randomDistraction.type,
      message: randomDistraction.message,
      timestamp: new Date().toLocaleTimeString(),
      icon: randomDistraction.icon,
      color: randomDistraction.color
    };
    setDistractions(prev => [...prev, newDistraction]);
  }, [addTeamMessage]);

  // Load challenge data from backend
  useEffect(() => {
    const loadChallenge = async () => {
      if (!id) return;
      
      try {
        // Fetch challenge from backend API
        const response = await challengesApi.getChallengeById(id);
        const challengeData = response; // API response already contains the data
        
        // Transform API challenge to match our interface
        const transformedChallenge: Challenge = {
          id: challengeData._id,
          _id: challengeData._id,
          title: challengeData.title,
          slug: challengeData.slug,
          description: challengeData.description,
          type: challengeData.type,
          difficulty: challengeData.difficulty,
          category: challengeData.category,
          tags: challengeData.tags || [],
          timeLimit: challengeData.timeLimit,
          content: {
            problemStatement: challengeData.content?.problemStatement || '',
            constraints: challengeData.content?.constraints,
            examples: challengeData.content?.examples || [],
            hints: challengeData.content?.hints || [],
            solution: challengeData.content?.solution
          },
          code: {
            starterCode: challengeData.code?.starterCode,
            testCases: challengeData.code?.testCases || [],
            validationRules: challengeData.code?.validationRules
          },
          scenario: challengeData.scenario,
          stats: {
            totalAttempts: challengeData.stats?.totalAttempts || 0,
            successfulAttempts: challengeData.stats?.successfulAttempts || 0,
            averageTime: challengeData.stats?.averageTime || 0,
            averageScore: challengeData.stats?.averageScore || 0,
            popularityScore: challengeData.stats?.popularityScore || 0
          }
        };
        
        setChallenge(transformedChallenge);
        
        // Set initial code from challenge starter code
        const initialCode = challengeData.code?.starterCode?.javascript || transformedChallenge.code?.starterCode?.javascript || '// Starter code not available';
        setCode(initialCode);
        
        // Set time limit from challenge
        if (challengeData.timeLimit) {
          setTimeRemaining(challengeData.timeLimit * 60); // Convert minutes to seconds
        }
      } catch (error) {
        console.error('Failed to load challenge:', error);
        // Fallback to safe challenge
        setChallenge(safeChallenge);
        // Use the safe challenge's starter code directly
        setCode(safeChallenge.code?.starterCode?.javascript || '// Starter code not available');
      }
    };
    
    loadChallenge();
  }, [id]); // Removed getInitialCode from dependencies to prevent infinite loop

  // Auto npm install when package.json changes
  useEffect(() => {
    if (!challenge) return;
    
    // Check if we have a WebContainer instance and install dependencies
    const checkAndInstallDependencies = async () => {
      try {
        // This would be implemented in the WebContainer service
        console.log('Checking for dependencies to install...');
        // The WebContainer service will automatically install dependencies when package.json is written
      } catch (error) {
        console.error('Error checking/installing dependencies:', error);
      }
    };
    
    checkAndInstallDependencies();
  }, [challenge]);
  
  // Initialize team messages based on challenge scenario
  useEffect(() => {
    if (challenge?.scenario?.distractions) {
      const initialMessages = challenge.scenario.distractions.map((distraction, index) => ({
        id: index + 1,
        sender: 'System',
        message: distraction.content,
        time: new Date().toLocaleTimeString(),
        type: 'info' as const,
        timestamp: new Date().toISOString()
      }));
      setTeamMessages(initialMessages);
    }
  }, [challenge]);
  
  // Handle when time is up
  const handleTimeUp = useCallback(() => {
    navigate(`/portal/challenge-complete/${id}?success=false&score=0&time=00:00&reason=timeout`);
  }, [id, navigate]);

  // Timer countdown effect
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleTimeUp();
    }
  }, [timeRemaining, handleTimeUp]);

  // Distraction triggering logic based on challenge scenario data
  useEffect(() => {
    // Only set up distractions if we have scenario data and not in zen mode
    if (!challenge?.scenario?.distractions || mode === 'zen') return;

    // Clear any existing intervals
    const distractionIntervals: NodeJS.Timeout[] = [];

    // Set up distraction intervals based on challenge scenario
    challenge.scenario.distractions.forEach((distraction: { type: string; frequency: string; content: string; }) => {
      let intervalTime = 0;
      
      // Convert frequency to actual time intervals
      switch (distraction.frequency) {
        case 'low':
          intervalTime = 180000; // 3 minutes
          break;
        case 'medium':
          intervalTime = 120000; // 2 minutes
          break;
        case 'high':
          intervalTime = 60000; // 1 minute
          break;
        default:
          intervalTime = 120000; // default to medium
      }

      // Create interval for this distraction
      const interval = setInterval(() => {
        // Only trigger distractions if not in zen mode and time remaining > 5 minutes
        if (mode !== 'zen' && timeRemaining > 300) {
          triggerRandomDistraction();
        }
      }, intervalTime);

      distractionIntervals.push(interval);
    });

    // Cleanup function to clear all intervals when component unmounts or dependencies change
    return () => {
      distractionIntervals.forEach(interval => clearInterval(interval));
    };
  }, [challenge, mode, timeRemaining, triggerRandomDistraction]);

  // Helper function for initial messages based on challenge scenario
  function getInitialMessages(): TeamMessage[] {
    if (challenge?.scenario?.distractions) {
      return challenge.scenario.distractions.map((distraction, index) => ({
        id: index + 1,
        sender: 'System',
        message: distraction.content,
        time: new Date().toLocaleTimeString(),
        type: 'info' as const,
        timestamp: new Date().toISOString()
      }));
    }
    
    // Fallback to original logic
    if (challengeType === 'dsa') {
      return [];
    } else if (challengeType === 'bug-fix') {
      return [
        { id: 1, sender: 'Sarah (QA)', message: 'Hey! The login bug is affecting 30% of users. Priority is critical 🚨', time: '09:15', type: 'urgent', timestamp: new Date().toISOString() },
        { id: 2, sender: 'Mike (Manager)', message: 'Client is asking for ETA on the fix. How long do you need?', time: '09:18', type: 'urgent', timestamp: new Date().toISOString() },
        { id: 3, sender: 'DevOps', message: 'Production logs show 500 errors spiking. Need this fixed ASAP!', time: '09:20', type: 'urgent', timestamp: new Date().toISOString() }
      ];
    } else {
      return [
        { id: 1, sender: 'Alex (PM)', message: 'Dashboard mockups are ready. Check Figma for latest designs 🎨', time: '09:10', type: 'info', timestamp: new Date().toISOString() },
        { id: 2, sender: 'Jordan (Backend)', message: 'API endpoints are deployed. Documentation in team chat', time: '09:12', type: 'info', timestamp: new Date().toISOString() },
        { id: 3, sender: 'Sam (Designer)', message: 'Can we make the stats cards more prominent? Client feedback', time: '09:20', type: 'info', timestamp: new Date().toISOString() },
        { id: 4, sender: 'QA Team', message: 'Please ensure mobile responsiveness. Testing on various devices', time: '09:25', type: 'info', timestamp: new Date().toISOString() }
      ];
    }
  }

  // Chat enhancement state
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [onlineUsers] = useState([
    { name: 'Alex (PM)', status: 'online' },
    { name: 'Sarah (QA)', status: 'online' },
    { name: 'Mike (Manager)', status: 'away' },
    { name: 'Jordan (Backend)', status: 'online' },
    { name: 'Sam (Designer)', status: 'online' }
</original_code>```

```
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Play, RotateCcw, Send, MessageSquare, Bug, GitBranch,
  Clock, Zap, TrendingDown, TrendingUp, AlertTriangle, Phone,
  Users, Target, Code, CheckCircle, XCircle,
  ArrowLeft, Maximize2, Minimize2, Volume2, VolumeX, Settings,
  HelpCircle, X, ChevronRight, Activity, Database, Server,
  Wifi, Monitor, BarChart3, Calendar, FileText, Star,
  Terminal, Globe, Shield, Cpu, HardDrive, Network, Zap as Lightning,
  MessageCircle, Briefcase, Home, Building, Plus, User, LucideIcon,
  File, Folder, FolderOpen, Play as PlayIcon, Terminal as TerminalIcon
} from 'lucide-react';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import { IDELayout } from '../components/IDELayout';
import { APITester } from '../components/APITester';


import { useTheme } from '../context/ThemeContext';
import { useWebContainer } from '../hooks/useWebContainer';
import { useChallenge } from '../hooks/useChallenge';
import { challengesApi } from '../services/api';
import { FrontendPreview } from '../components/FrontendPreview';

// Define types for our test results and other interfaces
interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
  error?: string;
}

// Updated Challenge interface to match API structure
interface Challenge {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  description: string;
  type: 'dsa' | 'bug-fix' | 'feature';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  tags: string[];
  timeLimit: number;
  content: {
    problemStatement: string;
    constraints?: string;
    examples: Array<{
      input: string;
      output: string;
      explanation?: string;
    }>;
    hints?: string[];
    solution?: string;
  };
  code: {
    starterCode?: {
      javascript?: string;
      typescript?: string;
    };
    testCases: Array<{
      input: string;
      expectedOutput: string;
      isHidden: boolean;
      weight: number;
    }>;
    validationRules?: {
      forbiddenKeywords?: string[];
      requiredKeywords?: string[];
    };
  };
  scenario?: {
    background: string;
    role: string;
    company: string;
    urgency: 'low' | 'medium' | 'high';
    distractions?: Array<{
      type: string;
      frequency: string;
      content: string;
    }>;
  };
  stats: {
    totalAttempts: number;
    successfulAttempts: number;
    averageTime: number;
    averageScore: number;
    popularityScore: number;
  };
  [key: string]: any; // Allow additional properties
}

interface NewsItem {
  id: number;
  type: 'positive' | 'neutral' | 'negative';
  message: string;
  time: string;
}

// TeamMessage interface with all required properties
interface TeamMessage {
  id: number | string;
  sender: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'urgent';
  timestamp: string;
  time: string; // Formatted time string for display
}

// Enhanced Distraction interface
interface EnhancedDistraction {
  id?: number;
  type: string;
  message: string;
  content?: string;
  icon?: LucideIcon;
  color?: string;
  actions?: string[];
  timestamp?: string;
}

// Type for distraction
interface Distraction {
  type: string;
  message: string;
  content?: string;
  icon?: LucideIcon;
  color?: string;
  actions?: string[];
}

// Enhanced Bug interface
interface Bug {
  id: number;
  message: string;
  title?: string;
  description?: string;
  severity?: string;
  reporter?: string;
}


// Type for team message
interface TeamMessage {
  id: string | number;
  sender: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'urgent';
  timestamp: string;
  time: string;
}

// Add this interface for file structure
interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
}

const SimulationPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const mode = searchParams.get('mode') || 'standard';
  const challengeType = searchParams.get('type') || 'dsa';
  
  // Challenge state
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(3600); // 60 minutes
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [focusLevel, setFocusLevel] = useState<number>(100);

  // UI State
  const [showTeamChat, setShowTeamChat] = useState<boolean>(false);
  const [showSeniorHelp, setShowSeniorHelp] = useState<boolean>(false);
  // Senior help chat state
  const [seniorMessages, setSeniorMessages] = useState<Array<{
    id: number;
    sender: 'user' | 'senior';
    message: string;
    time: string;
  }>>([{
    id: 1,
    sender: 'senior',
    message: "Hey! I'm here to help. What are you working on? Feel free to ask about algorithms, debugging, or any technical challenges you're facing. 👨‍💻",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }]);
  const [isWaitingForSenior, setIsWaitingForSenior] = useState(false);
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [showDistraction, setShowDistraction] = useState<Distraction | null>(null);

  // Panels
  const [showJiraPanel, setShowJiraPanel] = useState<boolean>(false);
  const [showDeployPanel, setShowDeployPanel] = useState<boolean>(false);

  // Messages
  const [teamMessages, setTeamMessages] = useState<TeamMessage[]>([]);
  const [distractions, setDistractions] = useState<EnhancedDistraction[]>([]);
  const [bugs, setBugs] = useState<Bug[]>([]);

  // Jira state
  const [jiraStatus, setJiraStatus] = useState<string>('In Progress');
  const [jiraComments, setJiraComments] = useState<Array<{ id: number, user: string, text: string, time: string }>>([]);
  const [newComment, setNewComment] = useState<string>('');

  // Deployment state
  const [deploymentStatus, setDeploymentStatus] = useState<string>('idle');
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [deploymentHistory, setDeploymentHistory] = useState<Array<{
    id: string;
    status: 'success' | 'failed' | 'pending';
    time: string;
    commit: string;
    author: string;
  }>>([]);

  // System state
  const [systemHealth, setSystemHealth] = useState({
    api: 100,
    database: 100,
    cache: 100,
    build: 100,
  });

  // Game state
  const [mentorRequests, setMentorRequests] = useState<number>(3);
  const [managerMood, setManagerMood] = useState<number>(75);
  const [clientMood, setClientMood] = useState<number>(75);

  // Safe challenge access with proper type assertion
  const safeChallenge: Challenge = {
    id: '1',
    _id: '1',
    title: 'Challenge Title',
    slug: 'challenge-title',
    description: 'Challenge description goes here...',
    difficulty: 'Medium',
    type: 'dsa',
    category: 'algorithms',
    tags: ['array', 'sorting'],
    timeLimit: 30,
    content: {
      problemStatement: 'Solve the problem',
      examples: []
    },
    code: {
      starterCode: {
        javascript: '// Your code here'
      },
      testCases: []
    },
    stats: {
      totalAttempts: 0,
      successfulAttempts: 0,
      averageTime: 0,
      averageScore: 0,
      popularityScore: 0
    }
  };

  // Helper functions defined first
  const getInitialCode = useCallback((): string => {
    // Fallback to default templates based on challengeType only
    if (challengeType === 'dsa') {
      return '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Your solution here\n    \n}';
    } else if (challengeType === 'bug-fix') {
      return '// Fix the authentication bug\n// The issue is in the email validation\n\nfunction validateEmail(email) {\n    // Current buggy implementation\n    const regex = new RegExp("^[a-zA-Z0-9@.]+$");\n    return regex.test(email);\n}\n\nfunction authenticateUser(email, password) {\n    if (!validateEmail(email)) {\n        throw new Error("Invalid email format");\n    }\n    // Authentication logic here...\n    return { success: true, user: { email } };\n}\n\n// Test the function\nconsole.log(authenticateUser("user+test@example.com", "password"));';
    } else {
      return 'import React, { useState, useEffect } from \'react\';\nimport \'./UserDashboard.css\';\n\nfunction UserDashboard() {\n    const [user, setUser] = useState(null);\n    const [stats, setStats] = useState({});\n    const [loading, setLoading] = useState(true);\n    \n    useEffect(() => {\n        // Fetch user data\n        fetchUserData();\n    }, []);\n    \n    const fetchUserData = async () => {\n        try {\n            // API call implementation needed\n            setLoading(false);\n        } catch (error) {\n            console.error(\'Error fetching user data:\', error);\n        }\n    };\n    \n    if (loading) {\n        return <div className="loading">Loading...</div>;\n    }\n    \n    return (\n        <div className="dashboard">\n            <h1>User Dashboard</h1>\n            {/* Implementation needed */}\n        </div>\n    );\n}\n\nexport default UserDashboard;';
    }
  }, [challengeType]); // Removed challenge from dependencies to prevent circular dependency

  // Route protection
  useEffect(() => {
    if (!id || !mode || !challengeType) {
      navigate('/portal/challenge/' + (id || '1'));
      return;
    }
  }, [id, mode, challengeType, navigate]);

  // Additional state variables
  const distractionFrequency = searchParams.get('distractionLevel') || 'medium';
  const [newChatMessage, setNewChatMessage] = useState('');
  const [companyNews] = useState<NewsItem[]>([
    { id: 1, type: 'positive', message: 'New client signed! Team morale +5', time: '09:10' },
    { id: 2, type: 'neutral', message: 'Coffee machine maintenance at 2 PM', time: '09:05' }
  ]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // Callback functions - moved here to be defined before use
  const addTeamMessage = useCallback((
    sender: string,
    message: string,
    msgType: 'info' | 'warning' | 'error' | 'success' | 'urgent' = 'info'
  ) => {
    const now = new Date();
    const newMessage: TeamMessage = {
      id: Date.now().toString(),
      sender,
      message,
      type: msgType,
      timestamp: now.toISOString(),
      time: now.toLocaleTimeString()
    };

    setTeamMessages(prev => [...prev, newMessage]);
  }, []);

  const triggerRandomDistraction = useCallback(() => {
    // Enhanced distraction types with icons and actions
    const distractionTypes = [
      {
        type: 'call',
        message: 'Incoming call from manager',
        content: 'Your manager is calling for a quick status update on the project. This could be important.',
        icon: Phone,
        color: 'text-orange-500',
        actions: ['Answer', 'Decline']
      },
      {
        type: 'meeting',
        message: 'Urgent team sync meeting',
        content: 'The team lead has called for an emergency sync meeting starting in 2 minutes. All developers required.',
        icon: Users,
        color: 'text-blue-500',
        actions: ['Join Meeting', 'Skip (Mark as Sick)']
      },
      {
        type: 'alert',
        message: 'Production system alert',
        content: 'Critical alert: Production API response time has increased by 300%. Database performance degraded.',
        icon: AlertTriangle,
        color: 'text-red-500',
        actions: ['Investigate', 'Continue Working']
      },
      {
        type: 'question',
        message: 'Teammate needs help',
        content: 'Sarah from the frontend team is stuck on a React component issue and needs your expertise.',
        icon: MessageSquare,
        color: 'text-green-500',
        actions: ['Help Now', 'Help Later']
      },
      {
        type: 'email',
        message: 'Urgent client email',
        content: 'Client has sent a high-priority email about changing requirements. Needs immediate attention.',
        icon: MessageCircle,
        color: 'text-purple-500',
        actions: ['Read Email', 'Check Later']
      }
    ];

    const randomDistraction = distractionTypes[Math.floor(Math.random() * distractionTypes.length)];
    setShowDistraction(randomDistraction);

    // Add a team message about the distraction
    addTeamMessage('System', `🚨 ${randomDistraction.message}`, 'warning');

    // Add to distractions list for tracking
    const newDistraction: EnhancedDistraction = {
      id: Date.now(),
      type: randomDistraction.type,
      message: randomDistraction.message,
      timestamp: new Date().toLocaleTimeString(),
      icon: randomDistraction.icon,
      color: randomDistraction.color
    };
    setDistractions(prev => [...prev, newDistraction]);
  }, [addTeamMessage]);

  // Load challenge data from backend
  useEffect(() => {
    const loadChallenge = async () => {
      if (!id) return;
      
      try {
        // Fetch challenge from backend API
        const response = await challengesApi.getChallengeById(id);
        const challengeData = response; // API response already contains the data
        
        // Transform API challenge to match our interface
        const transformedChallenge: Challenge = {
          id: challengeData._id,
          _id: challengeData._id,
          title: challengeData.title,
          slug: challengeData.slug,
          description: challengeData.description,
          type: challengeData.type,
          difficulty: challengeData.difficulty,
          category: challengeData.category,
          tags: challengeData.tags || [],
          timeLimit: challengeData.timeLimit,
          content: {
            problemStatement: challengeData.content?.problemStatement || '',
            constraints: challengeData.content?.constraints,
            examples: challengeData.content?.examples || [],
            hints: challengeData.content?.hints || [],
            solution: challengeData.content?.solution
          },
          code: {
            starterCode: challengeData.code?.starterCode,
            testCases: challengeData.code?.testCases || [],
            validationRules: challengeData.code?.validationRules
          },
          scenario: challengeData.scenario,
          stats: {
            totalAttempts: challengeData.stats?.totalAttempts || 0,
            successfulAttempts: challengeData.stats?.successfulAttempts || 0,
            averageTime: challengeData.stats?.averageTime || 0,
            averageScore: challengeData.stats?.averageScore || 0,
            popularityScore: challengeData.stats?.popularityScore || 0
          }
        };
        
        setChallenge(transformedChallenge);
        
        // Set initial code from challenge starter code
        const initialCode = challengeData.code?.starterCode?.javascript || transformedChallenge.code?.starterCode?.javascript || '// Starter code not available';
        setCode(initialCode);
        
        // Set time limit from challenge
        if (challengeData.timeLimit) {
          setTimeRemaining(challengeData.timeLimit * 60); // Convert minutes to seconds
        }
      } catch (error) {
        console.error('Failed to load challenge:', error);
        // Fallback to safe challenge
        setChallenge(safeChallenge);
        // Use the safe challenge's starter code directly
        setCode(safeChallenge.code?.starterCode?.javascript || '// Starter code not available');
      }
    };
    
    loadChallenge();
  }, [id]); // Removed getInitialCode from dependencies to prevent infinite loop

  // Auto npm install when package.json changes
  useEffect(() => {
    if (!challenge) return;
    
    // Check if we have a WebContainer instance and install dependencies
    const checkAndInstallDependencies = async () => {
      try {
        // This would be implemented in the WebContainer service
        console.log('Checking for dependencies to install...');
        // The WebContainer service will automatically install dependencies when package.json is written
      } catch (error) {
        console.error('Error checking/installing dependencies:', error);
      }
    };
    
    checkAndInstallDependencies();
  }, [challenge]);
  
  // Initialize team messages based on challenge scenario
  useEffect(() => {
    if (challenge?.scenario?.distractions) {
      const initialMessages = challenge.scenario.distractions.map((distraction, index) => ({
        id: index + 1,
        sender: 'System',
        message: distraction.content,
        time: new Date().toLocaleTimeString(),
        type: 'info' as const,
        timestamp: new Date().toISOString()
      }));
      setTeamMessages(initialMessages);
    }
  }, [challenge]);
  
  // Handle when time is up
  const handleTimeUp = useCallback(() => {
    navigate(`/portal/challenge-complete/${id}?success=false&score=0&time=00:00&reason=timeout`);
  }, [id, navigate]);

  // Timer countdown effect
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleTimeUp();
    }
  }, [timeRemaining, handleTimeUp]);

  // Distraction triggering logic based on challenge scenario data
  useEffect(() => {
    // Only set up distractions if we have scenario data and not in zen mode
    if (!challenge?.scenario?.distractions || mode === 'zen') return;

    // Clear any existing intervals
    const distractionIntervals: NodeJS.Timeout[] = [];

    // Set up distraction intervals based on challenge scenario
    challenge.scenario.distractions.forEach((distraction: { type: string; frequency: string; content: string; }) => {
      let intervalTime = 0;
      
      // Convert frequency to actual time intervals
      switch (distraction.frequency) {
        case 'low':
          intervalTime = 180000; // 3 minutes
          break;
        case 'medium':
          intervalTime = 120000; // 2 minutes
          break;
        case 'high':
          intervalTime = 60000; // 1 minute
          break;
        default:
          intervalTime = 120000; // default to medium
      }

      // Create interval for this distraction
      const interval = setInterval(() => {
        // Only trigger distractions if not in zen mode and time remaining > 5 minutes
        if (mode !== 'zen' && timeRemaining > 300) {
          triggerRandomDistraction();
        }
      }, intervalTime);

      distractionIntervals.push(interval);
    });

    // Cleanup function to clear all intervals when component unmounts or dependencies change
    return () => {
      distractionIntervals.forEach(interval => clearInterval(interval));
    };
  }, [challenge, mode, timeRemaining, triggerRandomDistraction]);

  // Helper function for initial messages based on challenge scenario
  function getInitialMessages(): TeamMessage[] {
    if (challenge?.scenario?.distractions) {
      return challenge.scenario.distractions.map((distraction, index) => ({
        id: index + 1,
        sender: 'System',
        message: distraction.content,
        time: new Date().toLocaleTimeString(),
        type: 'info' as const,
        timestamp: new Date().toISOString()
      }));
    }
    
    // Fallback to original logic
    if (challengeType === 'dsa') {
      return [];
    } else if (challengeType === 'bug-fix') {
      return [
        { id: 1, sender: 'Sarah (QA)', message: 'Hey! The login bug is affecting 30% of users. Priority is critical 🚨', time: '09:15', type: 'urgent', timestamp: new Date().toISOString() },
        { id: 2, sender: 'Mike (Manager)', message: 'Client is asking for ETA on the fix. How long do you need?', time: '09:18', type: 'urgent', timestamp: new Date().toISOString() },
        { id: 3, sender: 'DevOps', message: 'Production logs show 500 errors spiking. Need this fixed ASAP!', time: '09:20', type: 'urgent', timestamp: new Date().toISOString() }
      ];
    } else {
      return [
        { id: 1, sender: 'Alex (PM)', message: 'Dashboard mockups are ready. Check Figma for latest designs 🎨', time: '09:10', type: 'info', timestamp: new Date().toISOString() },
        { id: 2, sender: 'Jordan (Backend)', message: 'API endpoints are deployed. Documentation in team chat', time: '09:12', type: 'info', timestamp: new Date().toISOString() },
        { id: 3, sender: 'Sam (Designer)', message: 'Can we make the stats cards more prominent? Client feedback', time: '09:20', type: 'info', timestamp: new Date().toISOString() },
        { id: 4, sender: 'QA Team', message: 'Please ensure mobile responsiveness. Testing on various devices', time: '09:25', type: 'info', timestamp: new Date().toISOString() }
      ];
    }
  }

  // Chat enhancement state
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [onlineUsers] = useState([
    { name: 'Alex (PM)', status: 'online' },
    { name: 'Sarah (QA)', status: 'online' },
    { name: 'Mike (Manager)', status: 'away' },
    { name: 'Jordan (Backend)', status: 'online' },
    { name: 'Sam (Designer)', status: 'online' }
</original_code>```

```
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Play, RotateCcw, Send, MessageSquare, Bug, GitBranch,
  Clock, Zap, TrendingDown, TrendingUp, AlertTriangle, Phone,
  Users, Target, Code, CheckCircle, XCircle,
  ArrowLeft, Maximize2, Minimize2, Volume2, VolumeX, Settings,
  HelpCircle, X, ChevronRight, Activity, Database, Server,
  Wifi, Monitor, BarChart3, Calendar, FileText, Star,
  Terminal, Globe, Shield, Cpu, HardDrive, Network, Zap as Lightning,
  MessageCircle, Briefcase, Home, Building, Plus, User, LucideIcon,
  File, Folder, FolderOpen, Play as PlayIcon, Terminal as TerminalIcon
} from 'lucide-react';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import { IDELayout } from '../components/IDELayout';
import { APITester } from '../components/APITester';


import { useTheme } from '../context/ThemeContext';
import { useWebContainer } from '../hooks/useWebContainer';
import { useChallenge } from '../hooks/useChallenge';
import { challengesApi } from '../services/api';
import { FrontendPreview } from '../components/FrontendPreview';

// Define types for our test results and other interfaces
interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
  error?: string;
}

// Updated Challenge interface to match API structure
interface Challenge {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  description: string;
  type: 'dsa' | 'bug-fix' | 'feature';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  tags: string[];
  timeLimit: number;
  content: {
    problemStatement: string;
    constraints?: string;
    examples: Array<{
      input: string;
      output: string;
      explanation?: string;
    }>;
    hints?: string[];
    solution?: string;
  };
  code: {
    starterCode?: {
      javascript?: string;
      typescript?: string;
    };
    testCases: Array<{
      input: string;
      expectedOutput: string;
      isHidden: boolean;
      weight: number;
    }>;
    validationRules?: {
      forbiddenKeywords?: string[];
      requiredKeywords?: string[];
    };
  };
  scenario?: {
    background: string;
    role: string;
    company: string;
    urgency: 'low' | 'medium' | 'high';
    distractions?: Array<{
      type: string;
      frequency: string;
      content: string;
    }>;
  };
  stats: {
    totalAttempts: number;
    successfulAttempts: number;
    averageTime: number;
    averageScore: number;
    popularityScore: number;
  };
  [key: string]: any; // Allow additional properties
}

interface NewsItem {
  id: number;
  type: 'positive' | 'neutral' | 'negative';
  message: string;
  time: string;
}

// TeamMessage interface with all required properties
interface TeamMessage {
  id: number | string;
  sender: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'urgent';
  timestamp: string;
  time: string; // Formatted time string for display
}

// Enhanced Distraction interface
interface EnhancedDistraction {
  id?: number;
  type: string;
  message: string;
  content?: string;
  icon?: LucideIcon;
  color?: string;
  actions?: string[];
  timestamp?: string;
}

// Type for distraction
interface Distraction {
  type: string;
  message: string;
  content?: string;
  icon?: LucideIcon;
  color?: string;
  actions?: string[];
}

// Enhanced Bug interface
interface Bug {
  id: number;
  message: string;
  title?: string;
  description?: string;
  severity?: string;
  reporter?: string;
}


// Type for team message
interface TeamMessage {
  id: string | number;
  sender: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'urgent';
  timestamp: string;
  time: string;
}

// Add this interface for file structure
interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
}

const SimulationPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const mode = searchParams.get('mode') || 'standard';
  const challengeType = searchParams.get('type') || 'dsa';
  
  // Challenge state
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(3600); // 60 minutes
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [focusLevel, setFocusLevel] = useState<number>(100);

  // UI State
  const [showTeamChat, setShowTeamChat] = useState<boolean>(false);
  const [showSeniorHelp, setShowSeniorHelp] = useState<boolean>(false);
  // Senior help chat state
  const [seniorMessages, setSeniorMessages] = useState<Array<{
    id: number;
    sender: 'user' | 'senior';
    message: string;
    time: string;
  }>>([{
    id: 1,
    sender: 'senior',
    message: "Hey! I'm here to help. What are you working on? Feel free to ask about algorithms, debugging, or any technical challenges you're facing. 👨‍💻",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }]);
  const [isWaitingForSenior, setIsWaitingForSenior] = useState(false);
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [showDistraction, setShowDistraction] = useState<Distraction | null>(null);

  // Panels
  const [showJiraPanel, setShowJiraPanel] = useState<boolean>(false);
  const [showDeployPanel, setShowDeployPanel] = useState<boolean>(false);

  // Messages
  const [teamMessages, setTeamMessages] = useState<TeamMessage[]>([]);
  const [distractions, setDistractions] = useState<EnhancedDistraction[]>([]);
  const [bugs, setBugs] = useState<Bug[]>([]);

  // Jira state
  const [jiraStatus, setJiraStatus] = useState<string>('In Progress');
  const [jiraComments, setJiraComments] = useState<Array<{ id: number, user: string, text: string, time: string }>>([]);
  const [newComment, setNewComment] = useState<string>('');

  // Deployment state
  const [deploymentStatus, setDeploymentStatus] = useState<string>('idle');
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [deploymentHistory, setDeploymentHistory] = useState<Array<{
    id: string;
    status: 'success' | 'failed' | 'pending';
    time: string;
    commit: string;
    author: string;
  }>>([]);

  // System state
  const [systemHealth, setSystemHealth] = useState({
    api: 100,
    database: 100,
    cache: 100,
    build: 100,
  });

  // Game state
  const [mentorRequests, setMentorRequests] = useState<number>(3);
  const [managerMood, setManagerMood] = useState<number>(75);
  const [clientMood, setClientMood] = useState<number>(75);

  // Safe challenge access with proper type assertion
  const safeChallenge: Challenge = {
    id: '1',
    _id: '1',
    title: 'Challenge Title',
    slug: 'challenge-title',
    description: 'Challenge description goes here...',
    difficulty: 'Medium',
    type: 'dsa',
    category: 'algorithms',
    tags: ['array', 'sorting'],
    timeLimit: 30,
    content: {
      problemStatement: 'Solve the problem',
      examples: []
    },
    code: {
      starterCode: {
        javascript: '// Your code here'
      },
      testCases: []
    },
    stats: {
      totalAttempts: 0,
      successfulAttempts: 0,
      averageTime: 0,
      averageScore: 0,
      popularityScore: 0
    }
  };

  // Helper functions defined first
  const getInitialCode = useCallback((): string => {
    // Fallback to default templates based on challengeType only
    if (challengeType === 'dsa') {
      return '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Your solution here\n    \n}';
    } else if (challengeType === 'bug-fix') {
      return '// Fix the authentication bug\n// The issue is in the email validation\n\nfunction validateEmail(email) {\n    // Current buggy implementation\n    const regex = new RegExp("^[a-zA-Z0-9@.]+$");\n    return regex.test(email);\n}\n\nfunction authenticateUser(email, password) {\n    if (!validateEmail(email)) {\n        throw new Error("Invalid email format");\n    }\n    // Authentication logic here...\n    return { success: true, user: { email } };\n}\n\n// Test the function\nconsole.log(authenticateUser("user+test@example.com", "password"));';
    } else {
      return 'import React, { useState, useEffect } from \'react\';\nimport \'./UserDashboard.css\';\n\nfunction UserDashboard() {\n    const [user, setUser] = useState(null);\n    const [stats, setStats] = useState({});\n    const [loading, setLoading] = useState(true);\n    \n    useEffect(() => {\n        // Fetch user data\n        fetchUserData();\n    }, []);\n    \n    const fetchUserData = async () => {\n        try {\n            // API call implementation needed\n            setLoading(false);\n        } catch (error) {\n            console.error(\'Error fetching user data:\', error);\n        }\n    };\n    \n    if (loading) {\n        return <div className="loading">Loading...</div>;\n    }\n    \n    return (\n        <div className="dashboard">\n            <h1>User Dashboard</h1>\n            {/* Implementation needed */}\n        </div>\n    );\n}\n\nexport default UserDashboard;';
    }
  }, [challengeType]); // Removed challenge from dependencies to prevent circular dependency

  // Route protection
  useEffect(() => {
    if (!id || !mode || !challengeType) {
      navigate('/portal/challenge/' + (id || '1'));
      return;
    }
  }, [id, mode, challengeType, navigate]);

  // Additional state variables
  const distractionFrequency = searchParams.get('distractionLevel') || 'medium';
  const [newChatMessage, setNewChatMessage] = useState('');
  const [companyNews] = useState<NewsItem[]>([
    { id: 1, type: 'positive', message: 'New client signed! Team morale +5', time: '09:10' },
    { id: 2, type: 'neutral', message: 'Coffee machine maintenance at 2 PM', time: '09:05' }
  ]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // Callback functions - moved here to be defined before use
  const addTeamMessage = useCallback((
    sender: string,
    message: string,
    msgType: 'info' | 'warning' | 'error' | 'success' | 'urgent' = 'info'
  ) => {
    const now = new Date();
    const newMessage: TeamMessage = {
      id: Date.now().toString(),
      sender,
      message,
      type: msgType,
      timestamp: now.toISOString(),
      time: now.toLocaleTimeString()
    };

    setTeamMessages(prev => [...prev, newMessage]);
  }, []);

  const triggerRandomDistraction = useCallback(() => {
    // Enhanced distraction types with icons and actions
    const distractionTypes = [
      {
        type: 'call',
        message: 'Incoming call from manager',
        content: 'Your manager is calling for a quick status update on the project. This could be important.',
        icon: Phone,
        color: 'text-orange-500',
        actions: ['Answer', 'Decline']
      },
      {
        type: 'meeting',
        message: 'Urgent team sync meeting',
        content: 'The team lead has called for an emergency sync meeting starting in 2 minutes. All developers required.',
        icon: Users,
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Play, RotateCcw, Send, MessageSquare, Bug, GitBranch,
  Clock, Zap, TrendingDown, TrendingUp, AlertTriangle, Phone,
  Users, Target, Code, CheckCircle, XCircle,
  ArrowLeft, Maximize2, Minimize2, Volume2, VolumeX, Settings,
  HelpCircle, X, ChevronRight, Activity, Database, Server,
  Wifi, Monitor, BarChart3, Calendar, FileText, Star,
  Terminal, Globe, Shield, Cpu, HardDrive, Network, Zap as Lightning,
  MessageCircle, Briefcase, Home, Building, Plus, User, LucideIcon,
  File, Folder, FolderOpen, Play as PlayIcon, Terminal as TerminalIcon
} from 'lucide-react';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import { IDELayout } from '../components/IDELayout';
import { APITester } from '../components/APITester';


import { useTheme } from '../context/ThemeContext';
import { useWebContainer } from '../hooks/useWebContainer';
import { useChallenge } from '../hooks/useChallenge';
import { challengesApi } from '../services/api';
import { FrontendPreview } from '../components/FrontendPreview';

// Define types for our test results and other interfaces
interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
  error?: string;
}

// Updated Challenge interface to match API structure
interface Challenge {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  description: string;
  type: 'dsa' | 'bug-fix' | 'feature';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  tags: string[];
  timeLimit: number;
  content: {
    problemStatement: string;
    constraints?: string;
    examples: Array<{
      input: string;
      output: string;
      explanation?: string;
    }>;
    hints?: string[];
    solution?: string;
  };
  code: {
    starterCode?: {
      javascript?: string;
      typescript?: string;
    };
    testCases: Array<{
      input: string;
      expectedOutput: string;
      isHidden: boolean;
      weight: number;
    }>;
    validationRules?: {
      forbiddenKeywords?: string[];
      requiredKeywords?: string[];
    };
  };
  scenario?: {
    background: string;
    role: string;
    company: string;
    urgency: 'low' | 'medium' | 'high';
    distractions?: Array<{
      type: string;
      frequency: string;
      content: string;
    }>;
  };
  stats: {
    totalAttempts: number;
    successfulAttempts: number;
    averageTime: number;
    averageScore: number;
    popularityScore: number;
  };
  [key: string]: any; // Allow additional properties
}

interface NewsItem {
  id: number;
  type: 'positive' | 'neutral' | 'negative';
  message: string;
  time: string;
}

// TeamMessage interface with all required properties
interface TeamMessage {
  id: number | string;
  sender: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'urgent';
  timestamp: string;
  time: string; // Formatted time string for display
}

// Enhanced Distraction interface
interface EnhancedDistraction {
  id?: number;
  type: string;
  message: string;
  content?: string;
  icon?: LucideIcon;
  color?: string;
  actions?: string[];
  timestamp?: string;
}

// Type for distraction
interface Distraction {
  type: string;
  message: string;
  content?: string;
  icon?: LucideIcon;
  color?: string;
  actions?: string[];
}

// Enhanced Bug interface
interface Bug {
  id: number;
  message: string;
  title?: string;
  description?: string;
  severity?: string;
  reporter?: string;
}

// Add this interface for file structure
interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
}

const SimulationPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const mode = searchParams.get('mode') || 'standard';
  const challengeType = searchParams.get('type') || 'dsa';
  
  // Challenge state
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(3600); // 60 minutes
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [focusLevel, setFocusLevel] = useState<number>(100);

  // UI State
  const [showTeamChat, setShowTeamChat] = useState<boolean>(false);
  const [showSeniorHelp, setShowSeniorHelp] = useState<boolean>(false);
  // Senior help chat state
  const [seniorMessages, setSeniorMessages] = useState<Array<{
    id: number;
    sender: 'user' | 'senior';
    message: string;
    time: string;
  }>>([{
    id: 1,
    sender: 'senior',
    message: "Hey! I'm here to help. What are you working on? Feel free to ask about algorithms, debugging, or any technical challenges you're facing. 👨‍💻",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }]);
  const [isWaitingForSenior, setIsWaitingForSenior] = useState(false);
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [showDistraction, setShowDistraction] = useState<Distraction | null>(null);

  // Panels
  const [showJiraPanel, setShowJiraPanel] = useState<boolean>(false);
  const [showDeployPanel, setShowDeployPanel] = useState<boolean>(false);

  // Messages
  const [teamMessages, setTeamMessages] = useState<TeamMessage[]>([]);
  const [distractions, setDistractions] = useState<EnhancedDistraction[]>([]);
  const [bugs, setBugs] = useState<Bug[]>([]);

  // Jira state
  const [jiraStatus, setJiraStatus] = useState<string>('In Progress');
  const [jiraComments, setJiraComments] = useState<Array<{ id: number, user: string, text: string, time: string }>>([]);
  const [newComment, setNewComment] = useState<string>('');

  // Deployment state
  const [deploymentStatus, setDeploymentStatus] = useState<string>('idle');
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [deploymentHistory, setDeploymentHistory] = useState<Array<{
    id: string;
    status: 'success' | 'failed' | 'pending';
    time: string;
    commit: string;
    author: string;
  }>>([]);

  // System state
  const [systemHealth, setSystemHealth] = useState({
    api: 100,
    database: 100,
    cache: 100,
    build: 100,
  });

  // Game state
  const [mentorRequests, setMentorRequests] = useState<number>(3);
  const [managerMood, setManagerMood] = useState<number>(75);
  const [clientMood, setClientMood] = useState<number>(75);

  // Safe challenge access with proper type assertion
  const safeChallenge: Challenge = {
    id: '1',
    _id: '1',
    title: 'Challenge Title',
    slug: 'challenge-title',
    description: 'Challenge description goes here...',
    difficulty: 'Medium',
    type: 'dsa',
    category: 'algorithms',
    tags: ['array', 'sorting'],
    timeLimit: 30,
    content: {
      problemStatement: 'Solve the problem',
      examples: []
    },
    code: {
      starterCode: {
        javascript: '// Your code here'
      },
      testCases: []
    },
    stats: {
      totalAttempts: 0,
      successfulAttempts: 0,
      averageTime: 0,
      averageScore: 0,
      popularityScore: 0
    }
  };

  // Helper functions defined first
  const getInitialCode = useCallback((): string => {
    // Fallback to default templates based on challengeType only
    if (challengeType === 'dsa') {
      return '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Your solution here\n    \n}';
    } else if (challengeType === 'bug-fix') {
      return '// Fix the authentication bug\n// The issue is in the email validation\n\nfunction validateEmail(email) {\n    // Current buggy implementation\n    const regex = new RegExp("^[a-zA-Z0-9@.]+$");\n    return regex.test(email);\n}\n\nfunction authenticateUser(email, password) {\n    if (!validateEmail(email)) {\n        throw new Error("Invalid email format");\n    }\n    // Authentication logic here...\n    return { success: true, user: { email } };\n}\n\n// Test the function\nconsole.log(authenticateUser("user+test@example.com", "password"));';
    } else {
      return 'import React, { useState, useEffect } from \'react\';\nimport \'./UserDashboard.css\';\n\nfunction UserDashboard() {\n    const [user, setUser] = useState(null);\n    const [stats, setStats] = useState({});\n    const [loading, setLoading] = useState(true);\n    \n    useEffect(() => {\n        // Fetch user data\n        fetchUserData();\n    }, []);\n    \n    const fetchUserData = async () => {\n        try {\n            // API call implementation needed\n            setLoading(false);\n        } catch (error) {\n            console.error(\'Error fetching user data:\', error);\n        }\n    };\n    \n    if (loading) {\n        return <div className="loading">Loading...</div>;\n    }\n    \n    return (\n        <div className="dashboard">\n            <h1>User Dashboard</h1>\n            {/* Implementation needed */}\n        </div>\n    );\n}\n\nexport default UserDashboard;';
    }
  }, [challengeType]); // Removed challenge from dependencies to prevent circular dependency

  // Route protection
  useEffect(() => {
    if (!id || !mode || !challengeType) {
      navigate('/portal/challenge/' + (id || '1'));
      return;
    }
  }, [id, mode, challengeType, navigate]);

  // Additional state variables
  const distractionFrequency = searchParams.get('distractionLevel') || 'medium';
  const [newChatMessage, setNewChatMessage] = useState('');
  const [companyNews] = useState<NewsItem[]>([
    { id: 1, type: 'positive', message: 'New client signed! Team morale +5', time: '09:10' },
    { id: 2, type: 'neutral', message: 'Coffee machine maintenance at 2 PM', time: '09:05' }
  ]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // Callback functions - moved here to be defined before use
  const addTeamMessage = useCallback((
    sender: string,
    message: string,
    msgType: 'info' | 'warning' | 'error' | 'success' | 'urgent' = 'info'
  ) => {
    const now = new Date();
    const newMessage: TeamMessage = {
      id: Date.now().toString(),
      sender,
      message,
      type: msgType,
      timestamp: now.toISOString(),
      time: now.toLocaleTimeString()
    };

    setTeamMessages(prev => [...prev, newMessage]);
  }, []);

  const triggerRandomDistraction = useCallback(() => {
    // Enhanced distraction types with icons and actions
    const distractionTypes = [
      {
        type: 'call',
        message: 'Incoming call from manager',
        content: 'Your manager is calling for a quick status update on the project. This could be important.',
        icon: Phone,
        color: 'text-orange-500',
        actions: ['Answer', 'Decline']
      },
      {
        type: 'meeting',
        message: 'Urgent team sync meeting',
        content: 'The team lead has called for an emergency sync meeting starting in 2 minutes. All developers required.',
        icon: Users,
        color: 'text-blue-500',
        actions: ['Join Meeting', 'Skip (Mark as Sick)']
      },
      {
        type: 'alert',
        message: 'Production system alert',
        content: 'Critical alert: Production API response time has increased by 300%. Database performance degraded.',
        icon: AlertTriangle,
        color: 'text-red-500',
        actions: ['Investigate', 'Continue Working']
      },
      {
        type: 'question',
        message: 'Teammate needs help',
        content: 'Sarah from the frontend team is stuck on a React component issue and needs your expertise.',
        icon: MessageSquare,
        color: 'text-green-500',
        actions: ['Help Now', 'Help Later']
      },
      {
        type: 'email',
        message: 'Urgent client email',
        content: 'Client has sent a high-priority email about changing requirements. Needs immediate attention.',
        icon: MessageCircle,
        color: 'text-purple-500',
        actions: ['Read Email', 'Check Later']
      }
    ];

    const randomDistraction = distractionTypes[Math.floor(Math.random() * distractionTypes.length)];
    setShowDistraction(randomDistraction);

    // Add a team message about the distraction
    addTeamMessage('System', `🚨 ${randomDistraction.message}`, 'warning');

    // Add to distractions list for tracking
    const newDistraction: EnhancedDistraction = {
      id: Date.now(),
      type: randomDistraction.type,
      message: randomDistraction.message,
      timestamp: new Date().toLocaleTimeString(),
      icon: randomDistraction.icon,
      color: randomDistraction.color
    };
    setDistractions(prev => [...prev, newDistraction]);
  }, [addTeamMessage]);

  // Load challenge data from backend
  useEffect(() => {
    const loadChallenge = async () => {
      if (!id) return;
      
      try {
        // Fetch challenge from backend API
        const response = await challengesApi.getChallengeById(id);
        const challengeData = response; // API response already contains the data
        
        // Transform API challenge to match our interface
        const transformedChallenge: Challenge = {
          id: challengeData._id,
          _id: challengeData._id,
          title: challengeData.title,
          slug: challengeData.slug,
          description: challengeData.description,
          type: challengeData.type,
          difficulty: challengeData.difficulty,
          category: challengeData.category,
          tags: challengeData.tags || [],
          timeLimit: challengeData.timeLimit,
          content: {
            problemStatement: challengeData.content?.problemStatement || '',
            constraints: challengeData.content?.constraints,
            examples: challengeData.content?.examples || [],
            hints: challengeData.content?.hints || [],
            solution: challengeData.content?.solution
          },
          code: {
            starterCode: challengeData.code?.starterCode,
            testCases: challengeData.code?.testCases || [],
            validationRules: challengeData.code?.validationRules
          },
          scenario: challengeData.scenario,
          stats: {
            totalAttempts: challengeData.stats?.totalAttempts || 0,
            successfulAttempts: challengeData.stats?.successfulAttempts || 0,
            averageTime: challengeData.stats?.averageTime || 0,
            averageScore: challengeData.stats?.averageScore || 0,
            popularityScore: challengeData.stats?.popularityScore || 0
          }
        };
        
        setChallenge(transformedChallenge);
        
        // Set initial code from challenge starter code
        const initialCode = challengeData.code?.starterCode?.javascript || transformedChallenge.code?.starterCode?.javascript || '// Starter code not available';
        setCode(initialCode);
        
        // Set time limit from challenge
        if (challengeData.timeLimit) {
          setTimeRemaining(challengeData.timeLimit * 60); // Convert minutes to seconds
        }
      } catch (error) {
        console.error('Failed to load challenge:', error);
        // Fallback to safe challenge
        setChallenge(safeChallenge);
        // Use the safe challenge's starter code directly
        setCode(safeChallenge.code?.starterCode?.javascript || '// Starter code not available');
      }
    };
    
    loadChallenge();
  }, [id]); // Removed getInitialCode from dependencies to prevent infinite loop

  // Auto npm install when package.json changes
  useEffect(() => {
    if (!challenge) return;
    
    // Check if we have a WebContainer instance and install dependencies
    const checkAndInstallDependencies = async () => {
      try {
        // This would be implemented in the WebContainer service
        console.log('Checking for dependencies to install...');
        // The WebContainer service will automatically install dependencies when package.json is written
      } catch (error) {
        console.error('Error checking/installing dependencies:', error);
      }
    };
    
    checkAndInstallDependencies();
  }, [challenge]);
  
  // Initialize team messages based on challenge scenario
  useEffect(() => {
    if (challenge?.scenario?.distractions) {
      const initialMessages = challenge.scenario.distractions.map((distraction, index) => ({
        id: index + 1,
        sender: 'System',
        message: distraction.content,
        time: new Date().toLocaleTimeString(),
        type: 'info' as const,
        timestamp: new Date().toISOString()
      }));
      setTeamMessages(initialMessages);
    }
  }, [challenge]);
  
  // Handle when time is up
  const handleTimeUp = useCallback(() => {
    navigate(`/portal/challenge-complete/${id}?success=false&score=0&time=00:00&reason=timeout`);
  }, [id, navigate]);

  // Timer countdown effect
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleTimeUp();
    }
  }, [timeRemaining, handleTimeUp]);

  // Distraction triggering logic based on challenge scenario data
  useEffect(() => {
    // Only set up distractions if we have scenario data and not in zen mode
    if (!challenge?.scenario?.distractions || mode === 'zen') return;

    // Clear any existing intervals
    const distractionIntervals: NodeJS.Timeout[] = [];

    // Set up distraction intervals based on challenge scenario
    challenge.scenario.distractions.forEach((distraction: { type: string; frequency: string; content: string; }) => {
      let intervalTime = 0;
      
      // Convert frequency to actual time intervals
      switch (distraction.frequency) {
        case 'low':
          intervalTime = 180000; // 3 minutes
          break;
        case 'medium':
          intervalTime = 120000; // 2 minutes
          break;
        case 'high':
          intervalTime = 60000; // 1 minute
          break;
        default:
          intervalTime = 120000; // default to medium
      }

      // Create interval for this distraction
      const interval = setInterval(() => {
        // Only trigger distractions if not in zen mode and time remaining > 5 minutes
        if (mode !== 'zen' && timeRemaining > 300) {
          triggerRandomDistraction();
        }
      }, intervalTime);

      distractionIntervals.push(interval);
    });

    // Cleanup function to clear all intervals when component unmounts or dependencies change
    return () => {
      distractionIntervals.forEach(interval => clearInterval(interval));
    };
  }, [challenge, mode, timeRemaining, triggerRandomDistraction]);

  // Helper function for initial messages based on challenge scenario
  function getInitialMessages(): TeamMessage[] {
    if (challenge?.scenario?.distractions) {
      return challenge.scenario.distractions.map((distraction, index) => ({
        id: index + 1,
        sender: 'System',
        message: distraction.content,
        time: new Date().toLocaleTimeString(),
        type: 'info' as const,
        timestamp: new Date().toISOString()
      }));
    }
    
    // Fallback to original logic
    if (challengeType === 'dsa') {
      return [];
    } else if (challengeType === 'bug-fix') {
      return [
        { id: 1, sender: 'Sarah (QA)', message: 'Hey! The login bug is affecting 30% of users. Priority is critical 🚨', time: '09:15', type: 'urgent', timestamp: new Date().toISOString() },
        { id: 2, sender: 'Mike (Manager)', message: 'Client is asking for ETA on the fix. How long do you need?', time: '09:18', type: 'urgent', timestamp: new Date().toISOString() },
        { id: 3, sender: 'DevOps', message: 'Production logs show 500 errors spiking. Need this fixed ASAP!', time: '09:20', type: 'urgent', timestamp: new Date().toISOString() }
      ];
    } else {
      return [
        { id: 1, sender: 'Alex (PM)', message: 'Dashboard mockups are ready. Check Figma for latest designs 🎨', time: '09:10', type: 'info', timestamp: new Date().toISOString() },
        { id: 2, sender: 'Jordan (Backend)', message: 'API endpoints are deployed. Documentation in team chat', time: '09:12', type: 'info', timestamp: new Date().toISOString() },
        { id: 3, sender: 'Sam (Designer)', message: 'Can we make the stats cards more prominent? Client feedback', time: '09:20', type: 'info', timestamp: new Date().toISOString() },
        { id: 4, sender: 'QA Team', message: 'Please ensure mobile responsiveness. Testing on various devices', time: '09:25', type: 'info', timestamp: new Date().toISOString() }
      ];
    }
  }

  // Chat enhancement state
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [onlineUsers] = useState([
    { name: 'Alex (PM)', status: 'online' },
    { name: 'Sarah (QA)', status: 'online' },
    { name: 'Mike (Manager)', status: 'away' },
    { name: 'Jordan (Backend)', status: 'online' },
    { name: 'Sam (Designer)', status: 'online' }
</original_code>```

```
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Play, RotateCcw, Send, MessageSquare, Bug, GitBranch,
  Clock, Zap, TrendingDown, TrendingUp, AlertTriangle, Phone,
  Users, Target, Code, CheckCircle, XCircle,
  ArrowLeft, Maximize2, Minimize2, Volume2, VolumeX, Settings,
  HelpCircle, X, ChevronRight, Activity, Database, Server,
  Wifi, Monitor, BarChart3, Calendar, FileText, Star,
  Terminal, Globe, Shield, Cpu, HardDrive, Network, Zap as Lightning,
  MessageCircle, Briefcase, Home, Building, Plus, User, LucideIcon,
  File, Folder, FolderOpen, Play as PlayIcon, Terminal as TerminalIcon
} from 'lucide-react';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import { IDELayout } from '../components/IDELayout';
import { APITester } from '../components/APITester';


import { useTheme } from '../context/ThemeContext';
import { useWebContainer } from '../hooks/useWebContainer';
import { useChallenge } from '../hooks/useChallenge';
import { challengesApi } from '../services/api';
import { FrontendPreview } from '../components/FrontendPreview';

// Define types for our test results and other interfaces
interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
  error?: string;
}

// Updated Challenge interface to match API structure
interface Challenge {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  description: string;
  type: 'dsa' | 'bug-fix' | 'feature';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  tags: string[];
  timeLimit: number;
  content: {
    problemStatement: string;
    constraints?: string;
    examples: Array<{
      input: string;
      output: string;
      explanation?: string;
    }>;
    hints?: string[];
    solution?: string;
  };
  code: {
    starterCode?: {
      javascript?: string;
      typescript?: string;
    };
    testCases: Array<{
      input: string;
      expectedOutput: string;
      isHidden: boolean;
      weight: number;
    }>;
    validationRules?: {
      forbiddenKeywords?: string[];
      requiredKeywords?: string[];
    };
  };
  scenario?: {
    background: string;
    role: string;
    company: string;
    urgency: 'low' | 'medium' | 'high';
    distractions?: Array<{
      type: string;
      frequency: string;
      content: string;
    }>;
  };
  stats: {
    totalAttempts: number;
    successfulAttempts: number;
    averageTime: number;
    averageScore: number;
    popularityScore: number;
  };
  [key: string]: any; // Allow additional properties
}

interface NewsItem {
  id: number;
  type: 'positive' | 'neutral' | 'negative';
  message: string;
  time: string;
}

// TeamMessage interface with all required properties
interface TeamMessage {
  id: number | string;
  sender: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'urgent';
  timestamp: string;
  time: string; // Formatted time string for display
}

// Enhanced Distraction interface
interface EnhancedDistraction {
  id?: number;
  type: string;
  message: string;
  content?: string;
  icon?: LucideIcon;
  color?: string;
  actions?: string[];
  timestamp?: string;
}

// Type for distraction
interface Distraction {
  type: string;
  message: string;
  content?: string;
  icon?: LucideIcon;
  color?: string;
  actions?: string[];
}

// Enhanced Bug interface
interface Bug {
  id: number;
  message: string;
  title?: string;
  description?: string;
  severity?: string;
  reporter?: string;
}


// Type for team message
interface TeamMessage {
  id: string | number;
  sender: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'urgent';
  timestamp: string;
  time: string;
}

// Add this interface for file structure
interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
}

const SimulationPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const mode = searchParams.get('mode') || 'standard';
  const challengeType = searchParams.get('type') || 'dsa';
  
  // Challenge state
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(3600); // 60 minutes
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [focusLevel, setFocusLevel] = useState<number>(100);

  // UI State
  const [showTeamChat, setShowTeamChat] = useState<boolean>(false);
  const [showSeniorHelp, setShowSeniorHelp] = useState<boolean>(false);
  // Senior help chat state
  const [seniorMessages, setSeniorMessages] = useState<Array<{
    id: number;
    sender: 'user' | 'senior';
    message: string;
    time: string;
  }>>([{
    id: 1,
    sender: 'senior',
    message: "Hey! I'm here to help. What are you working on? Feel free to ask about algorithms, debugging, or any technical challenges you're facing. 👨‍💻",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }]);
  const [isWaitingForSenior, setIsWaitingForSenior] = useState(false);
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [showDistraction, setShowDistraction] = useState<Distraction | null>(null);

  // Panels
  const [showJiraPanel, setShowJiraPanel] = useState<boolean>(false);
  const [showDeployPanel, setShowDeployPanel] = useState<boolean>(false);

  // Messages
  const [teamMessages, setTeamMessages] = useState<TeamMessage[]>([]);
  const [distractions, setDistractions] = useState<EnhancedDistraction[]>([]);
  const [bugs, setBugs] = useState<Bug[]>([]);

  // Jira state
  const [jiraStatus, setJiraStatus] = useState<string>('In Progress');
  const [jiraComments, setJiraComments] = useState<Array<{ id: number, user: string, text: string, time: string }>>([]);
  const [newComment, setNewComment] = useState<string>('');

  // Deployment state
  const [deploymentStatus, setDeploymentStatus] = useState<string>('idle');
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [deploymentHistory, setDeploymentHistory] = useState<Array<{
    id: string;
    status: 'success' | 'failed' | 'pending';
    time: string;
    commit: string;
    author: string;
  }>>([]);

  // System state
  const [systemHealth, setSystemHealth] = useState({
    api: 100,
    database: 100,
    cache: 100,
    build: 100,
  });

  // Game state
  const [mentorRequests, setMentorRequests] = useState<number>(3);
  const [managerMood, setManagerMood] = useState<number>(75);
  const [clientMood, setClientMood] = useState<number>(75);

  // Safe challenge access with proper type assertion
  const safeChallenge: Challenge = {
    id: '1',
    _id: '1',
    title: 'Challenge Title',
    slug: 'challenge-title',
    description: 'Challenge description goes here...',
    difficulty: 'Medium',
    type: 'dsa',
    category: 'algorithms',
    tags: ['array', 'sorting'],
    timeLimit: 30,
    content: {
      problemStatement: 'Solve the problem',
      examples: []
    },
    code: {
      starterCode: {
        javascript: '// Your code here'
      },
      testCases: []
    },
    stats: {
      totalAttempts: 0,
      successfulAttempts: 0,
      averageTime: 0,
      averageScore: 0,
      popularityScore: 0
    }
  };

  // Helper functions defined first
  const getInitialCode = useCallback((): string => {
    // Fallback to default templates based on challengeType only
    if (challengeType === 'dsa') {
      return '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Your solution here\n    \n}';
    } else if (challengeType === 'bug-fix') {
      return '// Fix the authentication bug\n// The issue is in the email validation\n\nfunction validateEmail(email) {\n    // Current buggy implementation\n    const regex = new RegExp("^[a-zA-Z0-9@.]+$");\n    return regex.test(email);\n}\n\nfunction authenticateUser(email, password) {\n    if (!validateEmail(email)) {\n        throw new Error("Invalid email format");\n    }\n    // Authentication logic here...\n    return { success: true, user: { email } };\n}\n\n// Test the function\nconsole.log(authenticateUser("user+test@example.com", "password"));';
    } else {
      return 'import React, { useState, useEffect } from \'react\';\nimport \'./UserDashboard.css\';\n\nfunction UserDashboard() {\n    const [user, setUser] = useState(null);\n    const [stats, setStats] = useState({});\n    const [loading, setLoading] = useState(true);\n    \n    useEffect(() => {\n        // Fetch user data\n        fetchUserData();\n    }, []);\n    \n    const fetchUserData = async () => {\n        try {\n            // API call implementation needed\n            setLoading(false);\n        } catch (error) {\n            console.error(\'Error fetching user data:\', error);\n        }\n    };\n    \n    if (loading) {\n        return <div className="loading">Loading...</div>;\n    }\n    \n    return (\n        <div className="dashboard">\n            <h1>User Dashboard</h1>\n            {/* Implementation needed */}\n        </div>\n    );\n}\n\nexport default UserDashboard;';
    }
  }, [challengeType]); // Removed challenge from dependencies to prevent circular dependency

  // Route protection
  useEffect(() => {
    if (!id || !mode || !challengeType) {
      navigate('/portal/challenge/' + (id || '1'));
      return;
    }
  }, [id, mode, challengeType, navigate]);

  // Additional state variables
  const distractionFrequency = searchParams.get('distractionLevel') || 'medium';
  const [newChatMessage, setNewChatMessage] = useState('');
  const [companyNews] = useState<NewsItem[]>([
    { id: 1, type: 'positive', message: 'New client signed! Team morale +5', time: '09:10' },
    { id: 2, type: 'neutral', message: 'Coffee machine maintenance at 2 PM', time: '09:05' }
  ]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // Callback functions - moved here to be defined before use
  const addTeamMessage = useCallback((
    sender: string,
    message: string,
    msgType: 'info' | 'warning' | 'error' | 'success' | 'urgent' = 'info'
  ) => {
    const now = new Date();
    const newMessage: TeamMessage = {
      id: Date.now().toString(),
      sender,
      message,
      type: msgType,
      timestamp: now.toISOString(),
      time: now.toLocaleTimeString()
    };

    setTeamMessages(prev => [...prev, newMessage]);
  }, []);

  const triggerRandomDistraction = useCallback(() => {
    // Enhanced distraction types with icons and actions
    const distractionTypes = [
      {
        type: 'call',
        message: 'Incoming call from manager',
        content: 'Your manager is calling for a quick status update on the project. This could be important.',
        icon: Phone,
        color: 'text-orange-500',
        actions: ['Answer', 'Decline']
      },
      {
        type: 'meeting',
        message: 'Urgent team sync meeting',
        content: 'The team lead has called for an emergency sync meeting starting in 2 minutes. All developers required.',
        icon: Users,
        color: 'text-blue-500',
        actions: ['Join Meeting', 'Skip (Mark as Sick)']
      },
      {
        type: 'alert',
        message: 'Production system alert',
        content: 'Critical alert: Production API response time has increased by 300%. Database performance degraded.',
        icon: AlertTriangle,
        color: 'text-red-500',
        actions: ['Investigate', 'Continue Working']
      },
      {
        type: 'question',
        message: 'Teammate needs help',
        content: 'Sarah from the frontend team is stuck on a React component issue and needs your expertise.',
        icon: MessageSquare,
        color: 'text-green-500',
        actions: ['Help Now', 'Help Later']
      },
      {
        type: 'email',
        message: 'Urgent client email',
        content: 'Client has sent a high-priority email about changing requirements. Needs immediate attention.',
        icon: MessageCircle,
        color: 'text-purple-500',
        actions: ['Read Email', 'Check Later']
      }
    ];

    const randomDistraction = distractionTypes[Math.floor(Math.random() * distractionTypes.length)];
    setShowDistraction(randomDistraction);

    // Add a team message about the distraction
    addTeamMessage('System', `🚨 ${randomDistraction.message}`, 'warning');

    // Add to distractions list for tracking
    const newDistraction: EnhancedDistraction = {
      id: Date.now(),
      type: randomDistraction.type,
      message: randomDistraction.message,
      timestamp: new Date().toLocaleTimeString(),
      icon: randomDistraction.icon,
      color: randomDistraction.color
    };
    setDistractions(prev => [...prev, newDistraction]);
  }, [addTeamMessage]);

  // Load challenge data from backend
  useEffect(() => {
    const loadChallenge = async () => {
      if (!id) return;
      
      try {
        // Fetch challenge from backend API
        const response = await challengesApi.getChallengeById(id);
        const challengeData = response; // API response already contains the data
        
        // Transform API challenge to match our interface
        const transformedChallenge: Challenge = {
          id: challengeData._id,
          _id: challengeData._id,
          title: challengeData.title,
          slug: challengeData.slug,
          description: challengeData.description,
          type: challengeData.type,
          difficulty: challengeData.difficulty,
          category: challengeData.category,
          tags: challengeData.tags || [],
          timeLimit: challengeData.timeLimit,
          content: {
            problemStatement: challengeData.content?.problemStatement || '',
            constraints: challengeData.content?.constraints,
            examples: challengeData.content?.examples || [],
            hints: challengeData.content?.hints || [],
            solution: challengeData.content?.solution
          },
          code: {
            starterCode: challengeData.code?.starterCode,
            testCases: challengeData.code?.testCases || [],
            validationRules: challengeData.code?.validationRules
          },
          scenario: challengeData.scenario,
          stats: {
            totalAttempts: challengeData.stats?.totalAttempts || 0,
            successfulAttempts: challengeData.stats?.successfulAttempts || 0,
            averageTime: challengeData.stats?.averageTime || 0,
            averageScore: challengeData.stats?.averageScore || 0,
            popularityScore: challengeData.stats?.popularityScore || 0
          }
        };
        
        setChallenge(transformedChallenge);
        
        // Set initial code from challenge starter code
        const initialCode = challengeData.code?.starterCode?.javascript || transformedChallenge.code?.starterCode?.javascript || '// Starter code not available';
        setCode(initialCode);
        
        // Set time limit from challenge
        if (challengeData.timeLimit) {
          setTimeRemaining(challengeData.timeLimit * 60); // Convert minutes to seconds
        }
      } catch (error) {
        console.error('Failed to load challenge:', error);
        // Fallback to safe challenge
        setChallenge(safeChallenge);
        // Use the safe challenge's starter code directly
        setCode(safeChallenge.code?.starterCode?.javascript || '// Starter code not available');
      }
    };
    
    loadChallenge();
  }, [id]); // Removed getInitialCode from dependencies to prevent infinite loop

  // Auto npm install when package.json changes
  useEffect(() => {
    if (!challenge) return;
    
    // Check if we have a WebContainer instance and install dependencies
    const checkAndInstallDependencies = async () => {
      try {
        // This would be implemented in the WebContainer service
        console.log('Checking for dependencies to install...');
        // The WebContainer service will automatically install dependencies when package.json is written
      } catch (error) {
        console.error('Error checking/installing dependencies:', error);
      }
    };
    
    checkAndInstallDependencies();
  }, [challenge]);
  
  // Initialize team messages based on challenge scenario
  useEffect(() => {
    if (challenge?.scenario?.distractions) {
      const initialMessages = challenge.scenario.distractions.map((distraction, index) => ({
        id: index + 1,
        sender: 'System',
        message: distraction.content,
        time: new Date().toLocaleTimeString(),
        type: 'info' as const,
        timestamp: new Date().toISOString()
      }));
      setTeamMessages(initialMessages);
    }
  }, [challenge]);
  
  // Handle when time is up
  const handleTimeUp = useCallback(() => {
    navigate(`/portal/challenge-complete/${id}?success=false&score=0&time=00:00&reason=timeout`);
  }, [id, navigate]);

  // Timer countdown effect
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleTimeUp();
    }
  }, [timeRemaining, handleTimeUp]);

  // Distraction triggering logic based on challenge scenario data
  useEffect(() => {
    // Only set up distractions if we have scenario data and not in zen mode
    if (!challenge?.scenario?.distractions || mode === 'zen') return;

    // Clear any existing intervals
    const distractionIntervals: NodeJS.Timeout[] = [];

    // Set up distraction intervals based on challenge scenario
    challenge.scenario.distractions.forEach((distraction: { type: string; frequency: string; content: string; }) => {
      let intervalTime = 0;
      
      // Convert frequency to actual time intervals
      switch (distraction.frequency) {
        case 'low':
          intervalTime = 180000; // 3 minutes
          break;
        case 'medium':
          intervalTime = 120000; // 2 minutes
          break;
        case 'high':
          intervalTime = 60000; // 1 minute
          break;
        default:
          intervalTime = 120000; // default to medium
      }

      // Create interval for this distraction
      const interval = setInterval(() => {
        // Only trigger distractions if not in zen mode and time remaining > 5 minutes
        if (mode !== 'zen' && timeRemaining > 300) {
          triggerRandomDistraction();
        }
      }, intervalTime);

      distractionIntervals.push(interval);
    });

    // Cleanup function to clear all intervals when component unmounts or dependencies change
    return () => {
      distractionIntervals.forEach(interval => clearInterval(interval));
    };
  }, [challenge, mode, timeRemaining, triggerRandomDistraction]);

  // Helper function for initial messages based on challenge scenario
  function getInitialMessages(): TeamMessage[] {
    if (challenge?.scenario?.distractions) {
      return challenge.scenario.distractions.map((distraction, index) => ({
        id: index + 1,
        sender: 'System',
        message: distraction.content,
        time: new Date().toLocaleTimeString(),
        type: 'info' as const,
        timestamp: new Date().toISOString()
      }));
    }
    
    // Fallback to original logic
    if (challengeType === 'dsa') {
      return [];
    } else if (challengeType === 'bug-fix') {
      return [
        { id: 1, sender: 'Sarah (QA)', message: 'Hey! The login bug is affecting 30% of users. Priority is critical 🚨', time: '09:15', type: 'urgent', timestamp: new Date().toISOString() },
        { id: 2, sender: 'Mike (Manager)', message: 'Client is asking for ETA on the fix. How long do you need?', time: '09:18', type: 'urgent', timestamp: new Date().toISOString() },
        { id: 3, sender: 'DevOps', message: 'Production logs show 500 errors spiking. Need this fixed ASAP!', time: '09:20', type: 'urgent', timestamp: new Date().toISOString() }
      ];
    } else {
      return [
        { id: 1, sender: 'Alex (PM)', message: 'Dashboard mockups are ready. Check Figma for latest designs 🎨', time: '09:10', type: 'info', timestamp: new Date().toISOString() },
        { id: 2, sender: 'Jordan (Backend)', message: 'API endpoints are deployed. Documentation in team chat', time: '09:12', type: 'info', timestamp: new Date().toISOString() },
        { id: 3, sender: 'Sam (Designer)', message: 'Can we make the stats cards more prominent? Client feedback', time: '09:20', type: 'info', timestamp: new Date().toISOString() },
        { id: 4, sender: 'QA Team', message: 'Please ensure mobile responsiveness. Testing on various devices', time: '09:25', type: 'info', timestamp: new Date().toISOString() }
      ];
    }
  }

  // Chat enhancement state
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [onlineUsers] = useState([
    { name: 'Alex (PM)', status: 'online' },
    { name: 'Sarah (QA)', status: 'online' },
    { name: 'Mike (Manager)', status: 'away' },
    { name: 'Jordan (Backend)', status: 'online' },
    { name: 'Sam (Designer)', status: 'online' }
</original_code>```

```
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Play, RotateCcw, Send, MessageSquare, Bug, GitBranch,
  Clock, Zap, TrendingDown, TrendingUp, AlertTriangle, Phone,
  Users, Target, Code, CheckCircle, XCircle,
  ArrowLeft, Maximize2, Minimize2, Volume2, VolumeX, Settings,
  HelpCircle, X, ChevronRight, Activity, Database, Server,
  Wifi, Monitor, BarChart3, Calendar, FileText, Star,
  Terminal, Globe, Shield, Cpu, HardDrive, Network, Zap as Lightning,
  MessageCircle, Briefcase, Home, Building, Plus, User, LucideIcon,
  File, Folder, FolderOpen, Play as PlayIcon, Terminal as TerminalIcon
} from 'lucide-react';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import { IDELayout } from '../components/IDELayout';
import { APITester } from '../components/APITester';


import { useTheme } from '../context/ThemeContext';
import { useWebContainer } from '../hooks/useWebContainer';
import { useChallenge } from '../hooks/useChallenge';
import { challengesApi } from '../services/api';
import { FrontendPreview } from '../components/FrontendPreview';

// Define types for our test results and other interfaces
interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
  error?: string;
}

// Updated Challenge interface to match API structure
interface Challenge {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  description: string;
  type: 'dsa' | 'bug-fix' | 'feature';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  tags: string[];
  timeLimit: number;
  content: {
    problemStatement: string;
    constraints?: string;
    examples: Array<{
      input: string;
      output: string;
      explanation?: string;
    }>;
    hints?: string[];
    solution?: string;
  };
  code: {
    starterCode?: {
      javascript?: string;
      typescript?: string;
    };
    testCases: Array<{
      input: string;
      expectedOutput: string;
      isHidden: boolean;
      weight: number;
    }>;
    validationRules?: {
      forbiddenKeywords?: string[];
      requiredKeywords?: string[];
    };
  };
  scenario?: {
    background: string;
    role: string;
    company: string;
    urgency: 'low' | 'medium' | 'high';
    distractions?: Array<{
      type: string;
      frequency: string;
      content: string;
    }>;
  };
  stats: {
    totalAttempts: number;
    successfulAttempts: number;
    averageTime: number;
    averageScore: number;
    popularityScore: number;
  };
  [key: string]: any; // Allow additional properties
}

interface NewsItem {
  id: number;
  type: 'positive' | 'neutral' | 'negative';
  message: string;
  time: string;
}

// TeamMessage interface with all required properties
interface TeamMessage {
  id: number | string;
  sender: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'urgent';
  timestamp: string;
  time: string; // Formatted time string for display
}

// Enhanced Distraction interface
interface EnhancedDistraction {
  id?: number;
  type: string;
  message: string;
  content?: string;
  icon?: LucideIcon;
  color?: string;
  actions?: string[];
  timestamp?: string;
}

// Type for distraction
interface Distraction {
  type: string;
  message: string;
  content?: string;
  icon?: LucideIcon;
  color?: string;
  actions?: string[];
}

// Enhanced Bug interface
interface Bug {
  id: number;
  message: string;
  title?: string;
  description?: string;
  severity?: string;
  reporter?: string;
}


// Type for team message
interface TeamMessage {
  id: string | number;
  sender: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'urgent';
  timestamp: string;
  time: string;
}

// Add this interface for file structure
interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
}

const SimulationPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const mode = searchParams.get('mode') || 'standard';
  const challengeType = searchParams.get('type') || 'dsa';
  
  // Challenge state
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(3600); // 60 minutes
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [focusLevel, setFocusLevel] = useState<number>(100);

  // UI State
  const [showTeamChat, setShowTeamChat] = useState<boolean>(false);
  const [showSeniorHelp, setShowSeniorHelp] = useState<boolean>(false);
  // Senior help chat state
  const [seniorMessages, setSeniorMessages] = useState<Array<{
    id: number;
    sender: 'user' | 'senior';
    message: string;
    time: string;
  }>>([{
    id: 1,
    sender: 'senior',
    message: "Hey! I'm here to help. What are you working on? Feel free to ask about algorithms, debugging, or any technical challenges you're facing. 👨‍💻",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }]);
  const [isWaitingForSenior, setIsWaitingForSenior] = useState(false);
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [showDistraction, setShowDistraction] = useState<Distraction | null>(null);

  // Panels
  const [showJiraPanel, setShowJiraPanel] = useState<boolean>(false);
  const [showDeployPanel, setShowDeployPanel] = useState<boolean>(false);

  // Messages
  const [teamMessages, setTeamMessages] = useState<TeamMessage[]>([]);
  const [distractions, setDistractions] = useState<EnhancedDistraction[]>([]);
  const [bugs, setBugs] = useState<Bug[]>([]);

  // Jira state
  const [jiraStatus, setJiraStatus] = useState<string>('In Progress');
  const [jiraComments, setJiraComments] = useState<Array<{ id: number, user: string, text: string, time: string }>>([]);
  const [newComment, setNewComment] = useState<string>('');

  // Deployment state
  const [deploymentStatus, setDeploymentStatus] = useState<string>('idle');
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [deploymentHistory, setDeploymentHistory] = useState<Array<{
    id: string;
    status: 'success' | 'failed' | 'pending';
    time: string;
    commit: string;
    author: string;
  }>>([]);

  // System state
  const [systemHealth, setSystemHealth] = useState({
    api: 100,
    database: 100,
    cache: 100,
    build: 100,
  });

  // Game state
  const [mentorRequests, setMentorRequests] = useState<number>(3);
  const [managerMood, setManagerMood] = useState<number>(75);
  const [clientMood, setClientMood] = useState<number>(75);

  // Safe challenge access with proper type assertion
  const safeChallenge: Challenge = {
    id: '1',
    _id: '1',
    title: 'Challenge Title',
    slug: 'challenge-title',
    description: 'Challenge description goes here...',
    difficulty: 'Medium',
    type: 'dsa',
    category: 'algorithms',
    tags: ['array', 'sorting'],
    timeLimit: 30,
    content: {
      problemStatement: 'Solve the problem',
      examples: []
    },
    code: {
      starterCode: {
        javascript: '// Your code here'
      },
      testCases: []
    },
    stats: {
      totalAttempts: 0,
      successfulAttempts: 0,
      averageTime: 0,
      averageScore: 0,
      popularityScore: 0
    }
  };

  // Helper functions defined first
  const getInitialCode = useCallback((): string => {
    // Fallback to default templates based on challengeType only
    if (challengeType === 'dsa') {
      return '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Your solution here\n    \n}';
    } else if (challengeType === 'bug-fix') {
      return '// Fix the authentication bug\n// The issue is in the email validation\n\nfunction validateEmail(email) {\n    // Current buggy implementation\n    const regex = new RegExp("^[a-zA-Z0-9@.]+$");\n    return regex.test(email);\n}\n\nfunction authenticateUser(email, password) {\n    if (!validateEmail(email)) {\n        throw new Error("Invalid email format");\n    }\n    // Authentication logic here...\n    return { success: true, user: { email } };\n}\n\n// Test the function\nconsole.log(authenticateUser("user+test@example.com", "password"));';
    } else {
      return 'import React, { useState, useEffect } from \'react\';\nimport \'./UserDashboard.css\';\n\nfunction UserDashboard() {\n    const [user, setUser] = useState(null);\n    const [stats, setStats] = useState({});\n    const [loading, setLoading] = useState(true);\n    \n    useEffect(() => {\n        // Fetch user data\n        fetchUserData();\n    }, []);\n    \n    const fetchUserData = async () => {\n        try {\n            // API call implementation needed\n            setLoading(false);\n        } catch (error) {\n            console.error(\'Error fetching user data:\', error);\n        }\n    };\n    \n    if (loading) {\n        return <div className="loading">Loading...</div>;\n    }\n    \n    return (\n        <div className="dashboard">\n            <h1>User Dashboard</h1>\n            {/* Implementation needed */}\n        </div>\n    );\n}\n\nexport default UserDashboard;';
    }
  }, [challengeType]); // Removed challenge from dependencies to prevent circular dependency

  // Route protection
  useEffect(() => {
    if (!id || !mode || !challengeType) {
      navigate('/portal/challenge/' + (id || '1'));
      return;
    }
  }, [id, mode, challengeType, navigate]);

  // Additional state variables
  const distractionFrequency = searchParams.get('distractionLevel') || 'medium';
  const [newChatMessage, setNewChatMessage] = useState('');
  const [companyNews] = useState<NewsItem[]>([
    { id: 1, type: 'positive', message: 'New client signed! Team morale +5', time: '09:10' },
    { id: 2, type: 'neutral', message: 'Coffee machine maintenance at 2 PM', time: '09:05' }
  ]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // Callback functions - moved here to be defined before use
  const addTeamMessage = useCallback((
    sender: string,
    message: string,
    msgType: 'info' | 'warning' | 'error' | 'success' | 'urgent' = 'info'
  ) => {
    const now = new Date();
    const newMessage: TeamMessage = {
      id: Date.now().toString(),
      sender,
      message,
      type: msgType,
      timestamp: now.toISOString(),
      time: now.toLocaleTimeString()
    };

    setTeamMessages(prev => [...prev, newMessage]);
  }, []);

  const triggerRandomDistraction = useCallback(() => {
    // Enhanced distraction types with icons and actions
    const distractionTypes = [
      {
        type: 'call',
        message: 'Incoming call from manager',
        content: 'Your manager is calling for a quick status update on the project. This could be important.',
        icon: Phone,
        color: 'text-orange-500',
        actions: ['Answer', 'Decline']
      },
      {
        type: 'meeting',
        message: 'Urgent team sync meeting',
        content: 'The team lead has called for an emergency sync meeting starting in 2 minutes. All developers required.',
        icon: Users,
        color: 'text-blue-500',
        actions: ['Join Meeting', 'Skip (Mark as Sick)']
      },
      {
        type: 'alert',
        message: 'Production system alert',
        content: 'Critical alert: Production API response time has increased by 300%. Database performance degraded.',
        icon: AlertTriangle,
        color: 'text-red-500',
        actions: ['Investigate', 'Continue Working']
      },
      {
        type: 'question',
        message: 'Teammate needs help',
        content: 'Sarah from the frontend team is stuck on a React component issue and needs your expertise.',
        icon: MessageSquare,
        color: 'text-green-500',
        actions: ['Help Now', 'Help Later']
      },
      {
        type: 'email',
        message: 'Urgent client email',
        content: 'Client has sent a high-priority email about changing requirements. Needs immediate attention.',
        icon: MessageCircle,
        color: 'text-purple-500',
        actions: ['Read Email', 'Check Later']
      }
    ];

    const randomDistraction = distractionTypes[Math.floor(Math.random() * distractionTypes.length)];
    setShowDistraction(randomDistraction);

    // Add a team message about the distraction
    addTeamMessage('System', `🚨 ${randomDistraction.message}`, 'warning');

    // Add to distractions list for tracking
    const newDistraction: EnhancedDistraction = {
      id: Date.now(),
      type: randomDistraction.type,
      message: randomDistraction.message,
      timestamp: new Date().toLocaleTimeString(),
      icon: randomDistraction.icon,
      color: randomDistraction.color
    };
    setDistractions(prev => [...prev, newDistraction]);
  }, [addTeamMessage]);

  // Load challenge data from backend
  useEffect(() => {
    const loadChallenge = async () => {
      if (!id) return;
      
      try {
        // Fetch challenge from backend API
        const response = await challengesApi.getChallengeById(id);
        const challengeData = response; // API response already contains the data
        
        // Transform API challenge to match our interface
        const transformedChallenge: Challenge = {
          id: challengeData._id,
          _id: challengeData._id,
          title: challengeData.title,
          slug: challengeData.slug,
          description: challengeData.description,
          type: challengeData.type,
          difficulty: challengeData.difficulty,
          category: challengeData.category,
          tags: challengeData.tags || [],
          timeLimit: challengeData.timeLimit,
          content: {
            problemStatement: challengeData.content?.problemStatement || '',
            constraints: challengeData.content?.constraints,
            examples: challengeData.content?.examples || [],
            hints: challengeData.content?.hints || [],
            solution: challengeData.content?.solution
          },
          code: {
            starterCode: challengeData.code?.starterCode,
            testCases: challengeData.code?.testCases || [],
            validationRules: challengeData.code?.validationRules
          },
          scenario: challengeData.scenario,
          stats: {
            totalAttempts: challengeData.stats?.totalAttempts || 0,
            successfulAttempts: challengeData.stats?.successfulAttempts || 0,
            averageTime: challengeData.stats?.averageTime || 0,
            averageScore: challengeData.stats?.averageScore || 0,
            popularityScore: challengeData.stats?.popularityScore || 0
          }
        };
        
        setChallenge(transformedChallenge);
        
        // Set initial code from challenge starter code
        const initialCode = challengeData.code?.starterCode?.javascript || transformedChallenge.code?.starterCode?.javascript || '// Starter code not available';
        setCode(initialCode);
        
        // Set time limit from challenge
        if (challengeData.timeLimit) {
          setTimeRemaining(challengeData.timeLimit * 60); // Convert minutes to seconds
        }
      } catch (error) {
        console.error('Failed to load challenge:', error);
        // Fallback to safe challenge
        setChallenge(safeChallenge);
        // Use the safe challenge's starter code directly
        setCode(safeChallenge.code?.starterCode?.javascript || '// Starter code not available');
      }
    };
    
    loadChallenge();
  }, [id]); // Removed getInitialCode from dependencies to prevent infinite loop

  // Auto npm install when package.json changes
  useEffect(() => {
    if (!challenge) return;
    
    // Check if we have a WebContainer instance and install dependencies
    const checkAndInstallDependencies = async () => {
      try {
        // This would be implemented in the WebContainer service
        console.log('Checking for dependencies to install...');
        // The WebContainer service will automatically install dependencies when package.json is written
      } catch (error) {
        console.error('Error checking/installing dependencies:', error);
      }
    };
    
    checkAndInstallDependencies();
  }, [challenge]);
  
  // Initialize team messages based on challenge scenario
  useEffect(() => {
    if (challenge?.scenario?.distractions) {
      const initialMessages = challenge.scenario.distractions.map((distraction, index) => ({
        id: index + 1,
        sender: 'System',
        message: distraction.content,
        time: new Date().toLocaleTimeString(),
        type: 'info' as const,
        timestamp: new Date().toISOString()
      }));
      setTeamMessages(initialMessages);
    }
  }, [challenge]);
  
  // Handle when time is up
  const handleTimeUp = useCallback(() => {
    navigate(`/portal/challenge-complete/${id}?success=false&score=0&time=00:00&reason=timeout`);
  }, [id, navigate]);

  // Timer countdown effect
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleTimeUp();
    }
  }, [timeRemaining, handleTimeUp]);

  // Distraction triggering logic based on challenge scenario data
  useEffect(() => {
    // Only set up distractions if we have scenario data and not in zen mode
    if (!challenge?.scenario?.distractions || mode === 'zen') return;

    // Clear any existing intervals
    const distractionIntervals: NodeJS.Timeout[] = [];

    // Set up distraction intervals based on challenge scenario
    challenge.scenario.distractions.forEach((distraction: { type: string; frequency: string; content: string; }) => {
      let intervalTime = 0;
      
      // Convert frequency to actual time intervals
      switch (distraction.frequency) {
        case 'low':
          intervalTime = 180000; // 3 minutes
          break;
        case 'medium':
          intervalTime = 120000; // 2 minutes
          break;
        case 'high':
          intervalTime = 60000; // 1 minute
          break;
        default:
          intervalTime = 120000; // default to medium
      }

      // Create interval for this distraction
      const interval = setInterval(() => {
        // Only trigger distractions if not in zen mode and time remaining > 5 minutes
        if (mode !== 'zen' && timeRemaining > 300) {
          triggerRandomDistraction();
        }
      }, intervalTime);

      distractionIntervals.push(interval);
    });

    // Cleanup function to clear all intervals when component unmounts or dependencies change
    return () => {
      distractionIntervals.forEach(interval => clearInterval(interval));
    };
  }, [challenge, mode, timeRemaining, triggerRandomDistraction]);

  // Helper function for initial messages based on challenge scenario
  function getInitialMessages(): TeamMessage[] {
    if (challenge?.scenario?.distractions) {
      return challenge.scenario.distractions.map((distraction, index) => ({
        id: index + 1,
        sender: 'System',
        message: distraction.content,
        time: new Date().toLocaleTimeString(),
        type: 'info' as const,
        timestamp: new Date().toISOString()
      }));
    }
    
    // Fallback to original logic
    if (challengeType === 'dsa') {
      return [];
    } else if (challengeType === 'bug-fix') {
      return [
        { id: 1, sender: 'Sarah (QA)', message: 'Hey! The login bug is affecting 30% of users. Priority is critical 🚨', time: '09:15', type: 'urgent', timestamp: new Date().toISOString() },
        { id: 2, sender: 'Mike (Manager)', message: 'Client is asking for ETA on the fix. How long do you need?', time: '09:18', type: 'urgent', timestamp: new Date().toISOString() },
        { id: 3, sender: 'DevOps', message: 'Production logs show 500 errors spiking. Need this fixed ASAP!', time: '09:20', type: 'urgent', timestamp: new Date().toISOString() }
      ];
    } else {
      return [
        { id: 1, sender: 'Alex (PM)', message: 'Dashboard mockups are ready. Check Figma for latest designs 🎨', time: '09:10', type: 'info', timestamp: new Date().toISOString() },
        { id: 2, sender: 'Jordan (Backend)', message: 'API endpoints are deployed. Documentation in team chat', time: '09:12', type: 'info', timestamp: new Date().toISOString() },
        { id: 3, sender: 'Sam (Designer)', message: 'Can we make the stats cards more prominent? Client feedback', time: '09:20', type: 'info', timestamp: new Date().toISOString() },
        { id: 4, sender: 'QA Team', message: 'Please ensure mobile responsiveness. Testing on various devices', time: '09:25', type: 'info', timestamp: new Date().toISOString() }
      ];
    }
  }

  // Chat enhancement state
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [onlineUsers] = useState([
    { name: 'Alex (PM)', status: 'online' },
    { name: 'Sarah (QA)', status: 'online' },
    { name: 'Mike (Manager)', status: 'away' },
    { name: 'Jordan (Backend)', status: 'online' },
    { name: 'Sam (Designer)', status: 'online' }
</original_code>```

```
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Play, RotateCcw, Send, MessageSquare, Bug, GitBranch,
  Clock, Zap, TrendingDown, TrendingUp, AlertTriangle, Phone,
  Users, Target, Code, CheckCircle, XCircle,
  ArrowLeft, Maximize2, Minimize2, Volume2, VolumeX, Settings,
  HelpCircle, X, ChevronRight, Activity, Database, Server,
  Wifi, Monitor, BarChart3, Calendar, FileText, Star,
  Terminal, Globe, Shield, Cpu, HardDrive, Network, Zap as Lightning,
  MessageCircle, Briefcase, Home, Building, Plus, User, LucideIcon,
  File, Folder, FolderOpen, Play as PlayIcon, Terminal as TerminalIcon
} from 'lucide-react';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import { IDELayout } from '../components/IDELayout';
import { APITester } from '../components/APITester';


import { useTheme } from '../context/ThemeContext';
import { useWebContainer } from '../hooks/useWebContainer';
import { useChallenge } from '../hooks/useChallenge';
import { challengesApi } from '../services/api';
import { FrontendPreview } from '../components/FrontendPreview';

// Define types for our test results and other interfaces
interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
  error?: string;
}

// Updated Challenge interface to match API structure
interface Challenge {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  description: string;
  type: 'dsa' | 'bug-fix' | 'feature';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  tags: string[];
  timeLimit: number;
  content: {
    problemStatement: string;
    constraints?: string;
    examples: Array<{
      input: string;
      output: string;
      explanation?: string;
    }>;
    hints?: string[];
    solution?: string;
  };
  code: {
    starterCode?: {
      javascript?: string;
      typescript?: string;
    };
    testCases: Array<{
      input: string;
      expectedOutput: string;
      isHidden: boolean;
      weight: number;
    }>;
    validationRules?: {
      forbiddenKeywords?: string[];
      requiredKeywords?: string[];
    };
  };
  scenario?: {
    background: string;
    role: string;
    company: string;
    urgency: 'low' | 'medium' | 'high';
    distractions?: Array<{
      type: string;
      frequency: string;
      content: string;
    }>;
  };
  stats: {
    totalAttempts: number;
    successfulAttempts: number;
    averageTime: number;
    averageScore: number;
    popularityScore: number;
  };
  [key: string]: any; // Allow additional properties
}

interface NewsItem {
  id: number;
  type: 'positive' | 'neutral' | 'negative';
  message: string;
  time: string;
}

// TeamMessage interface with all required properties
interface TeamMessage {
  id: number | string;
  sender: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'urgent';
  timestamp: string;
  time: string; // Formatted time string for display
}

// Enhanced Distraction interface
interface EnhancedDistraction {
  id?: number;
  type: string;
  message: string;
  content?: string;
  icon?: LucideIcon;
  color?: string;
  actions?: string[];
  timestamp?: string;
}

// Type for distraction
interface Distraction {
  type: string;
  message: string;
  content?: string;
  icon?: LucideIcon;
  color?: string;
  actions?: string[];
}

// Enhanced Bug interface
interface Bug {
  id: number;
  message: string;
  title?: string;
  description?: string;
  severity?: string;
  reporter?: string;
}


// Type for team message
interface TeamMessage {
  id: string | number;
  sender: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'urgent';
  timestamp: string;
  time: string;
}

// Add this interface for file structure
interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
}

const SimulationPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const mode = searchParams.get('mode') || 'standard';
  const challengeType = searchParams.get('type') || 'dsa';
  
  // Challenge state
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(3600); // 60 minutes
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [focusLevel, setFocusLevel] = useState<number>(100);

  // UI State
  const [showTeamChat, setShowTeamChat] = useState<boolean>(false);
  const [showSeniorHelp, setShowSeniorHelp] = useState<boolean>(false);
  // Senior help chat state
  const [seniorMessages, setSeniorMessages] = useState<Array<{
    id: number;
    sender: 'user' | 'senior';
    message: string;
    time: string;
  }>>([{
    id: 1,
    sender: 'senior',
    message: "Hey! I'm here to help. What are you working on? Feel free to ask about algorithms, debugging, or any technical challenges you're facing. 👨‍💻",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }]);
  const [isWaitingForSenior, setIsWaitingForSenior] = useState(false);
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [showDistraction, setShowDistraction] = useState<Distraction | null>(null);

  // Panels
  const [showJiraPanel, setShowJiraPanel] = useState<boolean>(false);
  const [showDeployPanel, setShowDeployPanel] = useState<boolean>(false);

  // Messages
  const [teamMessages, setTeamMessages] = useState<TeamMessage[]>([]);
  const [distractions, setDistractions] = useState<EnhancedDistraction[]>([]);
  const [bugs, setBugs] = useState<Bug[]>([]);

  // Jira state
  const [jiraStatus, setJiraStatus] = useState<string>('In Progress');
  const [jiraComments, setJiraComments] = useState<Array<{ id: number, user: string, text: string, time: string }>>([]);
  const [newComment, setNewComment] = useState<string>('');

  // Deployment state
  const [deploymentStatus, setDeploymentStatus] = useState<string>('idle');
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [deploymentHistory, setDeploymentHistory] = useState<Array<{
    id: string;
    status: 'success' | 'failed' | 'pending';
    time: string;
    commit: string;
    author: string;
  }>>([]);

  // System state
  const [systemHealth, setSystemHealth] = useState({
    api: 100,
    database: 100,
    cache: 100,
    build: 100,
  });

  // Game state
  const [mentorRequests, setMentorRequests] = useState<number>(3);
  const [managerMood, setManagerMood] = useState<number>(75);
  const [clientMood, setClientMood] = useState<number>(75);

  // Safe challenge access with proper type assertion
  const safeChallenge: Challenge = {
    id: '1',
    _id: '1',
    title: 'Challenge Title',
    slug: 'challenge-title',
    description: 'Challenge description goes here...',
    difficulty: 'Medium',
    type: 'dsa',
    category: 'algorithms',
    tags: ['array', 'sorting'],
    timeLimit: 30,
    content: {
      problemStatement: 'Solve the problem',
      examples: []
    },
    code: {
      starterCode: {
        javascript: '// Your code here'
      },
      testCases: []
    },
    stats: {
      totalAttempts: 0,
      successfulAttempts: 0,
      averageTime: 0,
      averageScore: 0,
      popularityScore: 0
    }
  };

  // Helper functions defined first
  const getInitialCode = useCallback((): string => {
    // Fallback to default templates based on challengeType only
    if (challengeType === 'dsa') {
      return '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Your solution here\n    \n}';
    } else if (challengeType === 'bug-fix') {
      return '// Fix the authentication bug\n// The issue is in the email validation\n\nfunction validateEmail(email) {\n    // Current buggy implementation\n    const regex = new RegExp("^[a-zA-Z0-9@.]+$");\n    return regex.test(email);\n}\n\nfunction authenticateUser(email, password) {\n    if (!validateEmail(email)) {\n        throw new Error("Invalid email format");\n    }\n    // Authentication logic here...\n    return { success: true, user: { email } };\n}\n\n// Test the function\nconsole.log(authenticateUser("user+test@example.com", "password"));';
    } else {
      return 'import React, { useState, useEffect } from \'react\';\nimport \'./UserDashboard.css\';\n\nfunction UserDashboard() {\n    const [user, setUser] = useState(null);\n    const [stats, setStats] = useState({});\n    const [loading, setLoading] = useState(true);\n    \n    useEffect(() => {\n        // Fetch user data\n        fetchUserData();\n    }, []);\n    \n    const fetchUserData = async () => {\n        try {\n            // API call implementation needed\n            setLoading(false);\n        } catch (error) {\n            console.error(\'Error fetching user data:\', error);\n        }\n    };\n    \n    if (loading) {\n        return <div className="loading">Loading...</div>;\n    }\n    \n    return (\n        <div className="dashboard">\n            <h1>User Dashboard</h1>\n            {/* Implementation needed */}\n        </div>\n    );\n}\n\nexport default UserDashboard;';
    }
  }, [challengeType]); // Removed challenge from dependencies to prevent circular dependency

  // Route protection
  useEffect(() => {
    if (!id || !mode || !challengeType) {
      navigate('/portal/challenge/' + (id || '1'));
      return;
    }
  }, [id, mode, challengeType, navigate]);

  // Additional state variables
  const distractionFrequency = searchParams.get('distractionLevel') || 'medium';
  const [newChatMessage, setNewChatMessage] = useState('');
  const [companyNews] = useState<NewsItem[]>([
    { id: 1, type: 'positive', message: 'New client signed! Team morale +5', time: '09:10' },
    { id: 2, type: 'neutral', message: 'Coffee machine maintenance at 2 PM', time: '09:05' }
  ]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // Callback functions - moved here to be defined before use
  const addTeamMessage = useCallback((
    sender: string,
    message: string,
    msgType: 'info' | 'warning' | 'error' | 'success' | 'urgent' = 'info'
  ) => {
    const now = new Date();
    const newMessage: TeamMessage = {
      id: Date.now().toString(),
      sender,
      message,
      type: msgType,
      timestamp: now.toISOString(),
      time: now.toLocaleTimeString()
    };

    setTeamMessages(prev => [...prev, newMessage]);
  }, []);

  const triggerRandomDistraction = useCallback(() => {
    // Enhanced distraction types with icons and actions
    const distractionTypes = [
      {
        type: 'call',
        message: 'Incoming call from manager',
        content: 'Your manager is calling for a quick status update on the project. This could be important.',
        icon: Phone,
        color: 'text-orange-500',
        actions: ['Answer', 'Decline']
      },
      {
        type: 'meeting',
        message: 'Urgent team sync meeting',
        content: 'The team lead has called for an emergency sync meeting starting in 2 minutes. All developers required.',
        icon: Users,
        color: 'text-blue-500',
        actions: ['Join Meeting', 'Skip (Mark as Sick)']
      },
      {
        type: 'alert',
        message: 'Production system alert',
        content: 'Critical alert: Production API response time has increased by 300%. Database performance degraded.',
        icon: AlertTriangle,
        color: 'text-red-500',
        actions: ['Investigate', 'Continue Working']
      },
      {
        type: 'question',
        message: 'Teammate needs help',
        content: 'Sarah from the frontend team is stuck on a React component issue and needs your expertise.',
        icon: MessageSquare,
        color: 'text-green-500',
        actions: ['Help Now', 'Help Later']
      },
      {
        type: 'email',
        message: 'Urgent client email',
        content: 'Client has sent a high-priority email about changing requirements. Needs immediate attention.',
        icon: MessageCircle,
        color: 'text-purple-500',
        actions: ['Read Email', 'Check Later']
      }
    ];

    const randomDistraction = distractionTypes[Math.floor(Math.random() * distractionTypes.length)];
    setShowDistraction(randomDistraction);

    // Add a team message about the distraction
    addTeamMessage('System', `🚨 ${randomDistraction.message}`, 'warning');

    // Add to distractions list for tracking
    const newDistraction: EnhancedDistraction = {
      id: Date.now(),
      type: randomDistraction.type,
      message: randomDistraction.message,
      timestamp: new Date().toLocaleTimeString(),
      icon: randomDistraction.icon,
      color: randomDistraction.color
    };
    setDistractions(prev => [...prev, newDistraction]);
  }, [addTeamMessage]);

  // Load challenge data from backend
  useEffect(() => {
    const loadChallenge = async () => {
      if (!id) return;
      
      try {
        // Fetch challenge from backend API
        const response = await challengesApi.getChallengeById(id);
        const challengeData = response; // API response already contains the data
        
        // Transform API challenge to match our interface
        const transformedChallenge: Challenge = {
          id: challengeData._id,
          _id: challengeData._id,
          title: challengeData.title,
          slug: challengeData.slug,
          description: challengeData.description,
          type: challengeData.type,
          difficulty: challengeData.difficulty,
          category: challengeData.category,
          tags: challengeData.tags || [],
          timeLimit: challengeData.timeLimit,
          content: {
            problemStatement: challengeData.content?.problemStatement || '',
            constraints: challengeData.content?.constraints,
            examples: challengeData.content?.examples || [],
            hints: challengeData.content?.hints || [],
            solution: challengeData.content?.solution
          },
          code: {
            starterCode: challengeData.code?.starterCode,
            testCases: challengeData.code?.testCases || [],
            validationRules: challengeData.code?.validationRules
          },
          scenario: challengeData.scenario,
          stats: {
            totalAttempts: challengeData.stats?.totalAttempts || 0,
            successfulAttempts: challengeData.stats?.successfulAttempts || 0,
            averageTime: challengeData.stats?.averageTime || 0,
            averageScore: challengeData.stats?.averageScore || 0,
            popularityScore: challengeData.stats?.popularityScore || 0
          }
        };
        
        setChallenge(transformedChallenge);
        
        // Set initial code from challenge starter code
        const initialCode = challengeData.code?.starterCode?.javascript || transformedChallenge.code?.starterCode?.javascript || '// Starter code not available';
        setCode(initialCode);
        
        // Set time limit from challenge
        if (challengeData.timeLimit) {
          setTimeRemaining(challengeData.timeLimit * 60); // Convert minutes to seconds
        }
      } catch (error) {
        console.error('Failed to load challenge:', error);
        // Fallback to safe challenge
        setChallenge(safeChallenge);
        // Use the safe challenge's starter code directly
        setCode(safeChallenge.code?.starterCode?.javascript || '// Starter code not available');
      }
    };
    
    loadChallenge();
  }, [id]); // Removed getInitialCode from dependencies to prevent infinite loop

  // Auto npm install when package.json changes
  useEffect(() => {
    if (!challenge) return;
    
    // Check if we have a WebContainer instance and install dependencies
    const checkAndInstallDependencies = async () => {
      try {
        // This would be implemented in the WebContainer service
        console.log('Checking for dependencies to install...');
        // The WebContainer service will automatically install dependencies when package.json is written
      } catch (error) {
        console.error('Error checking/installing dependencies:', error);
      }
    };
    
    checkAndInstallDependencies();
  }, [challenge]);
  
  // Initialize team messages based on challenge scenario
  useEffect(() => {
    if (challenge?.scenario?.distractions) {
      const initialMessages = challenge.scenario.distractions.map((distraction, index) => ({
        id: index + 1,
        sender: 'System',
        message: distraction.content,
        time: new Date().toLocaleTimeString(),
        type: 'info' as const,
        timestamp: new Date().toISOString()
      }));
      setTeamMessages(initialMessages);
    }
  }, [challenge]);
  
  // Handle when time is up
  const handleTimeUp = useCallback(() => {
    navigate(`/portal/challenge-complete/${id}?success=false&score=0&time=00:00&reason=timeout`);
  }, [id, navigate]);

  // Timer countdown effect
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleTimeUp();
    }
  }, [timeRemaining, handleTimeUp]);

  // Distraction triggering logic based on challenge scenario data
  useEffect(() => {
    // Only set up distractions if we have scenario data and not in zen mode
    if (!challenge?.scenario?.distractions || mode === 'zen') return;

    // Clear any existing intervals
    const distractionIntervals: NodeJS.Timeout[] = [];

    // Set up distraction intervals based on challenge scenario
    challenge.scenario.distractions.forEach((distraction: { type: string; frequency: string; content: string; }) => {
      let intervalTime = 0;
      
      // Convert frequency to actual time intervals
      switch (distraction.frequency) {
        case 'low':
          intervalTime = 180000; // 3 minutes
          break;
        case 'medium':
          intervalTime = 120000; // 2 minutes
          break;
        case 'high':
          intervalTime = 60000; // 1 minute
          break;
        default:
          intervalTime = 120000; // default to medium
      }

      // Create interval for this distraction
      const interval = setInterval(() => {
        // Only trigger distractions if not in zen mode and time remaining > 5 minutes
        if (mode !== 'zen' && timeRemaining > 300) {
          triggerRandomDistraction();
        }
      }, intervalTime);

      distractionIntervals.push(interval);
    });

    // Cleanup function to clear all intervals when component unmounts or dependencies change
    return () => {
      distractionIntervals.forEach(interval => clearInterval(interval));
    };
  }, [challenge, mode, timeRemaining, triggerRandomDistraction]);

  // Helper function for initial messages based on challenge scenario
  function getInitialMessages(): TeamMessage[] {
    if (challenge?.scenario?.distractions) {
      return challenge.scenario.distractions.map((distraction, index) => ({
        id: index + 1,
        sender: 'System',
        message: distraction.content,
        time: new Date().toLocaleTimeString(),
        type: 'info' as const,
        timestamp: new Date().toISOString()
      }));
    }
    
    // Fallback to original logic
    if (challengeType === 'dsa') {
      return [];
    } else if (challengeType === 'bug-fix') {
      return [
        { id: 1, sender: 'Sarah (QA)', message: 'Hey! The login bug is affecting 30% of users. Priority is critical 🚨', time: '09:15', type: 'urgent', timestamp: new Date().toISOString() },
        { id: 2, sender: 'Mike (Manager)', message: 'Client is asking for ETA on the fix. How long do you need?', time: '09:18', type: 'urgent', timestamp: new Date().toISOString() },
        { id: 3, sender: 'DevOps', message: 'Production logs show 500 errors spiking. Need this fixed ASAP!', time: '09:20', type: 'urgent', timestamp: new Date().toISOString() }
      ];
    } else {
      return [
        { id: 1, sender: 'Alex (PM)', message: 'Dashboard mockups are ready. Check Figma for latest designs 🎨', time: '09:10', type: 'info', timestamp: new Date().toISOString() },
        { id: 2, sender: 'Jordan (Backend)', message: 'API endpoints are deployed. Documentation in team chat', time: '09:12', type: 'info', timestamp: new Date().toISOString() },
        { id: 3, sender: 'Sam (Designer)', message: 'Can we make the stats cards more prominent? Client feedback', time: '09:20', type: 'info', timestamp: new Date().toISOString() },
        { id: 4, sender: 'QA Team', message: 'Please ensure mobile responsiveness. Testing on various devices', time: '09:25', type: 'info', timestamp: new Date().toISOString() }
      ];
    }
  }

  // Chat enhancement state
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [onlineUsers] = useState([
    { name: 'Alex (PM)', status: 'online' },
    { name: 'Sarah (QA)', status: 'online' },
    { name: 'Mike (Manager)', status: 'away' },
    { name: 'Jordan (Backend)', status: 'online' },
    { name: 'Sam (Designer)', status: 'online' }
</original_code>```

```
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Play, RotateCcw, Send, MessageSquare, Bug, GitBranch,
  Clock, Zap, TrendingDown, TrendingUp, AlertTriangle, Phone,
  Users, Target, Code, CheckCircle, XCircle,
  ArrowLeft, Maximize2, Minimize2, Volume2, VolumeX, Settings,
  HelpCircle, X, ChevronRight, Activity, Database, Server,
  Wifi, Monitor, BarChart3, Calendar, FileText, Star,
  Terminal, Globe, Shield, Cpu, HardDrive, Network, Zap as Lightning,
  MessageCircle, Briefcase, Home, Building, Plus, User, LucideIcon,
  File, Folder, FolderOpen, Play as PlayIcon, Terminal as TerminalIcon
} from 'lucide-react';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import { IDELayout } from '../components/IDELayout';
import { APITester } from '../components/APITester';


import { useTheme } from '../context/ThemeContext';
import { useWebContainer } from '../hooks/useWebContainer';
import { useChallenge } from '../hooks/useChallenge';
import { challengesApi } from '../services/api';
import { FrontendPreview } from '../components/FrontendPreview';

// Define types for our test results and other interfaces
interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
  error?: string;
}

// Updated Challenge interface to match API structure
interface Challenge {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  description: string;
  type: 'dsa' | 'bug-fix' | 'feature';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  tags: string[];
  timeLimit: number;
  content: {
    problemStatement: string;
    constraints?: string;
    examples: Array<{
      input: string;
      output: string;
      explanation?: string;
    }>;
    hints?: string[];
    solution?: string;
  };
  code: {
    starterCode?: {
      javascript?: string;
      typescript?: string;
    };
    testCases: Array<{
      input: string;
      expectedOutput: string;
      isHidden: boolean;
      weight: number;
    }>;
    validationRules?: {
      forbiddenKeywords?: string[];
      requiredKeywords?: string[];
    };
  };
  scenario?: {
    background: string;
    role: string;
    company: string;
    urgency: 'low' | 'medium' | 'high';
    distractions?: Array<{
      type: string;
      frequency: string;
      content: string;
    }>;
  };
  stats: {
    totalAttempts: number;
    successfulAttempts: number;
    averageTime: number;
    averageScore: number;
    popularityScore: number;
  };
  [key: string]: any; // Allow additional properties
}

interface NewsItem {
  id: number;
  type: 'positive' | 'neutral' | 'negative';
  message: string;
  time: string;
}

// TeamMessage interface with all required properties
interface TeamMessage {
  id: number | string;
  sender: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'urgent';
  timestamp: string;
  time: string; // Formatted time string for display
}

// Enhanced Distraction interface
interface EnhancedDistraction {
  id?: number;
  type: string;
  message: string;
  content?: string;
  icon?: LucideIcon;
  color?: string;
  actions?: string[];
  timestamp?: string;
}

// Type for distraction
interface Distraction {
  type: string;
  message: string;
  content?: string;
  icon?: LucideIcon;
  color?: string;
  actions?: string[];
}

// Enhanced Bug interface
interface Bug {
  id: number;
  message: string;
  title?: string;
  description?: string;
  severity?: string;
  reporter?: string;
}


// Type for team message
interface TeamMessage {
  id: string | number;
  sender: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'urgent';
  timestamp: string;
  time: string;
}

// Add this interface for file structure
interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
}

const SimulationPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const mode = searchParams.get('mode') || 'standard';
  const challengeType = searchParams.get('type') || 'dsa';
  
  // Challenge state
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(3600); // 60 minutes
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [focusLevel, setFocusLevel] = useState<number>(100);

  // UI State
  const [showTeamChat, setShowTeamChat] = useState<boolean>(false);
  const [showSeniorHelp, setShowSeniorHelp] = useState<boolean>(false);
  // Senior help chat state
  const [seniorMessages, setSeniorMessages] = useState<Array<{
    id: number;
    sender: 'user' | 'senior';
    message: string;
    time: string;
  }>>([{
    id: 1,
    sender: 'senior',
    message: "Hey! I'm here to help. What are you working on? Feel free to ask about algorithms, debugging, or any technical challenges you're facing. 👨‍💻",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }]);
  const [isWaitingForSenior, setIsWaitingForSenior] = useState(false);
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [showDistraction, setShowDistraction] = useState<Distraction | null>(null);

  // Panels
  const [showJiraPanel, setShowJiraPanel] = useState<boolean>(false);
  const [showDeployPanel, setShowDeployPanel] = useState<boolean>(false);

  // Messages
  const [teamMessages, setTeamMessages] = useState<TeamMessage[]>([]);
  const [distractions, setDistractions] = useState<EnhancedDistraction[]>([]);
  const [bugs, setBugs] = useState<Bug[]>([]);

  // Jira state
  const [jiraStatus, setJiraStatus] = useState<string>('In Progress');
  const [jiraComments, setJiraComments] = useState<Array<{ id: number, user: string, text: string, time: string }>>([]);
  const [newComment, setNewComment] = useState<string>('');

  // Deployment state
  const [deploymentStatus, setDeploymentStatus] = useState<string>('idle');
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [deploymentHistory, setDeploymentHistory] = useState<Array<{
    id: string;
    status: 'success' | 'failed' | 'pending';
    time: string;
    commit: string;
    author: string;
  }>>([]);

  // System state
  const [systemHealth, setSystemHealth] = useState({
    api: 100,
    database: 100,
    cache: 100,
    build: 100,
  });

  // Game state
  const [mentorRequests, setMentorRequests] = useState<number>(3);
  const [managerMood, setManagerMood] = useState<number>(75);
  const [clientMood, setClientMood] = useState<number>(75);

  // Safe challenge access with proper type assertion
  const safeChallenge: Challenge = {
    id: '1',
    _id: '1',
    title: 'Challenge Title',
    slug: 'challenge-title',
    description: 'Challenge description goes here...',
    difficulty: 'Medium',
    type: 'dsa',
    category: 'algorithms',
    tags: ['array', 'sorting'],
    timeLimit: 30,
    content: {
      problemStatement: 'Solve the problem',
      examples: []
    },
    code: {
      starterCode: {
        javascript: '// Your code here'
      },
      testCases: []
    },
    stats: {
      totalAttempts: 0,
      successfulAttempts: 0,
      averageTime: 0,
      averageScore: 0,
      popularityScore: 0
    }
  };

  // Helper functions defined first
  const getInitialCode = useCallback((): string => {
    // Fallback to default templates based on challengeType only
    if (challengeType === 'dsa') {
      return '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Your solution here\n    \n}';
    } else if (challengeType === 'bug-fix') {
      return '// Fix the authentication bug\n// The issue is in the email validation\n\nfunction validateEmail(email) {\n    // Current buggy implementation\n    const regex = new RegExp("^[a-zA-Z0-9@.]+$");\n    return regex.test(email);\n}\n\nfunction authenticateUser(email, password) {\n    if (!validateEmail(email)) {\n        throw new Error("Invalid email format");\n    }\n    // Authentication logic here...\n    return { success: true, user: { email } };\n}\n\n// Test the function\nconsole.log(authenticateUser("user+test@example.com", "password"));';
    } else {
      return 'import React, { useState, useEffect } from \'react\';\nimport \'./UserDashboard.css\';\n\nfunction UserDashboard() {\n    const [user, setUser] = useState(null);\n    const [stats, setStats] = useState({});\n    const [loading, setLoading] = useState(true);\n    \n    useEffect(() => {\n        // Fetch user data\n        fetchUserData();\n    }, []);\n    \n    const fetchUserData = async () => {\n        try {\n            // API call implementation needed\n            setLoading(false);\n        } catch (error) {\n            console.error(\'Error fetching user data:\', error);\n        }\n    };\n    \n    if (loading) {\n        return <div className="loading">Loading...</div>;\n    }\n    \n    return (\n        <div className="dashboard">\n            <h1>User Dashboard</h1>\n            {/* Implementation needed */}\n        </div>\n    );\n}\n\nexport default UserDashboard;';
    }
  }, [challengeType]); // Removed challenge from dependencies to prevent circular dependency

  // Route protection
  useEffect(() => {
    if (!id || !mode || !challengeType) {
      navigate('/portal/challenge/' + (id || '1'));
      return;
    }
  }, [id, mode, challengeType, navigate]);

  // Additional state variables
  const distractionFrequency = searchParams.get('distractionLevel') || 'medium';
  const [newChatMessage, setNewChatMessage] = useState('');
  const [companyNews] = useState<NewsItem[]>([
    { id: 1, type: 'positive', message: 'New client signed! Team morale +5', time: '09:10' },
    { id: 2, type: 'neutral', message: 'Coffee machine maintenance at 2 PM', time: '09:05' }
  ]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // Callback functions - moved here to be defined before use
  const addTeamMessage = useCallback((
    sender: string,
    message: string,
    msgType: 'info' | 'warning' | 'error' | 'success' | 'urgent' = 'info'
  ) => {
    const now = new Date();
    const newMessage: TeamMessage = {
      id: Date.now().toString(),
      sender,
      message,
      type: msgType,
      timestamp: now.toISOString(),
      time: now.toLocaleTimeString()
    };

    setTeamMessages(prev => [...prev, newMessage]);
  }, []);

  const triggerRandomDistraction = useCallback(() => {
    // Enhanced distraction types with icons and actions
    const distractionTypes = [
      {
        type: 'call',
        message: 'Incoming call from manager',
        content: 'Your manager is calling for a quick status update on the project. This could be important.',
        icon: Phone,
        color: 'text-orange-500',
        actions: ['Answer', 'Decline']
      },
      {
        type: 'meeting',
        message: 'Urgent team sync meeting',
        content: 'The team lead has called for an emergency sync meeting starting in 2 minutes. All developers required.',
        icon: Users,
        color: 'text-blue-500',
        actions: ['Join Meeting', 'Skip (Mark as Sick)']
      },
      {
        type: 'alert',
        message: 'Production system alert',
        content: 'Critical alert: Production API response time has increased by 300%. Database performance degraded.',
        icon: AlertTriangle,
        color: 'text-red-500',
        actions: ['Investigate', 'Continue Working']
      },
      {
        type: 'question',
        message: 'Teammate needs help',
        content: 'Sarah from the frontend team is stuck on a React component issue and needs your expertise.',
        icon: MessageSquare,
        color: 'text-green-500',
        actions: ['Help Now', 'Help Later']
      },
      {
        type: 'email',
        message: 'Urgent client email',
        content: 'Client has sent a high-priority email about changing requirements. Needs immediate attention.',
        icon: MessageCircle,
        color: 'text-purple-500',
        actions: ['Read Email', 'Check Later']
      }
    ];

    const randomDistraction = distractionTypes[Math.floor(Math.random() * distractionTypes.length)];
    setShowDistraction(randomDistraction);

    // Add a team message about the distraction
    addTeamMessage('System', `🚨 ${randomDistraction.message}`, 'warning');

    // Add to distractions list for tracking
    const newDistraction: EnhancedDistraction = {
      id: Date.now(),
      type: randomDistraction.type,
      message: randomDistraction.message,
      timestamp: new Date().toLocaleTimeString(),
      icon: randomDistraction.icon,
      color: randomDistraction.color
    };
    setDistractions(prev => [...prev, newDistraction]);
  }, [addTeamMessage]);

  // Load challenge data from backend
  useEffect(() => {
    const loadChallenge = async () => {
      if (!id) return;
      
      try {
        // Fetch challenge from backend API
        const response = await challengesApi.getChallengeById(id);
        const challengeData = response; // API response already contains the data
        
        // Transform API challenge to match our interface
        const transformedChallenge: Challenge = {
          id: challengeData._id,
          _id: challengeData._id,
          title: challengeData.title,
          slug: challengeData.slug,
          description: challengeData.description,
          type: challengeData.type,
          difficulty: challengeData.difficulty,
          category: challengeData.category,
          tags: challengeData.tags || [],
          timeLimit: challengeData.timeLimit,
          content: {
            problemStatement: challengeData.content?.problemStatement || '',
            constraints: challengeData.content?.constraints,
            examples: challengeData.content?.examples || [],
            hints: challengeData.content?.hints || [],
            solution: challengeData.content?.solution
          },
          code: {
            starterCode: challengeData.code?.starterCode,
            testCases: challengeData.code?.testCases || [],
            validationRules: challengeData.code?.validationRules
          },
          scenario: challengeData.scenario,
          stats: {
            totalAttempts: challengeData.stats?.totalAttempts || 0,
            successfulAttempts: challengeData.stats?.successfulAttempts || 0,
            averageTime: challengeData.stats?.averageTime || 0,
            averageScore: challengeData.stats?.averageScore || 0,
            popularityScore: challengeData.stats?.popularityScore || 0
          }
        };
        
        setChallenge(transformedChallenge);
        
        // Set initial code from challenge starter code
        const initialCode = challengeData.code?.starterCode?.javascript || transformedChallenge.code?.starterCode?.javascript || '// Starter code not available';
        setCode(initialCode);
        
        // Set time limit from challenge
        if (challengeData.timeLimit) {
          setTimeRemaining(challengeData.timeLimit * 60); // Convert minutes to seconds
        }
      } catch (error) {
        console.error('Failed to load challenge:', error);
        // Fallback to safe challenge
        setChallenge(safeChallenge);
        // Use the safe challenge's starter code directly
        setCode(safeChallenge.code?.starterCode?.javascript || '// Starter code not available');
      }
    };
    
    loadChallenge();
  }, [id]); // Removed getInitialCode from dependencies to prevent infinite loop

  // Auto npm install when package.json changes
  useEffect(() => {
    if (!challenge) return;
    
    // Check if we have a WebContainer instance and install dependencies
    const checkAndInstallDependencies = async () => {
      try {
        // This would be implemented in the WebContainer service
        console.log('Checking for dependencies to install...');
        // The WebContainer service will automatically install dependencies when package.json is written
      } catch (error) {
        console.error('Error checking/installing dependencies:', error);
      }
    };
    
    checkAndInstallDependencies();
  }, [challenge]);
  
  // Initialize team messages based on challenge scenario
  useEffect(() => {
    if (challenge?.scenario?.distractions) {
      const initialMessages = challenge.scenario.distractions.map((distraction, index) => ({
        id: index + 1,
        sender: 'System',
        message: distraction.content,
        time: new Date().toLocaleTimeString(),
        type: 'info' as const,
        timestamp: new Date().toISOString()
      }));
      setTeamMessages(initialMessages);
    }
  }, [challenge]);
  
  // Handle when time is up
  const handleTimeUp = useCallback(() => {
    navigate(`/portal/challenge-complete/${id}?success=false&score=0&time=00:00&reason=timeout`);
  }, [id, navigate]);

  // Timer countdown effect
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleTimeUp();
    }
  }, [timeRemaining, handleTimeUp]);

  // Distraction triggering logic based on challenge scenario data
  useEffect(() => {
    // Only set up distractions if we have scenario data and not in zen mode
    if (!challenge?.scenario?.distractions || mode === 'zen') return;

    // Clear any existing intervals
    const distractionIntervals: NodeJS.Timeout[] = [];

    // Set up distraction intervals based on challenge scenario
    challenge.scenario.distractions.forEach((distraction: { type: string; frequency: string; content: string; }) => {
      let intervalTime = 0;
      
      // Convert frequency to actual time intervals
      switch (distraction.frequency) {
        case 'low':
          intervalTime = 180000; // 3 minutes
          break;
        case 'medium':
          intervalTime = 120000; // 2 minutes
          break;
        case 'high':
          intervalTime = 60000; // 1 minute
          break;
        default:
          intervalTime = 120000; // default to medium
      }

      // Create interval for this distraction
      const interval = setInterval(() => {
        // Only trigger distractions if not in zen mode and time remaining > 5 minutes
        if (mode !== 'zen' && timeRemaining > 300) {
          triggerRandomDistraction();
        }
      }, intervalTime);

      distractionIntervals.push(interval);
    });

    // Cleanup function to clear all intervals when component unmounts or dependencies change
    return () => {
      distractionIntervals.forEach(interval => clearInterval(interval));
    };
  }, [challenge, mode, timeRemaining, triggerRandomDistraction]);

  // Helper function for initial messages based on challenge scenario
  function getInitialMessages(): TeamMessage[] {
    if (challenge?.scenario?.distractions) {
      return challenge.scenario.distractions.map((distraction, index) => ({
        id: index + 1,
        sender: 'System',
        message: distraction.content,
        time: new Date().toLocaleTimeString(),
        type: 'info' as const,
        timestamp: new Date().toISOString()
      }));
    }
    
    // Fallback to original logic
    if (challengeType === 'dsa') {
      return [];
    } else if (challengeType === 'bug-fix') {
      return [
        { id: 1, sender: 'Sarah (QA)', message: 'Hey! The login bug is affecting 30% of users. Priority is critical 🚨', time: '09:15', type: 'urgent', timestamp: new Date().toISOString() },
        { id: 2, sender: 'Mike (Manager)', message: 'Client is asking for ETA on the fix. How long do you need?', time: '09:18', type: 'urgent', timestamp: new Date().toISOString() },
        { id: 3, sender: 'DevOps', message: 'Production logs show 500 errors spiking. Need this fixed ASAP!', time: '09:20', type: 'urgent', timestamp: new Date().toISOString() }
      ];
    } else {
      return [
        { id: 1, sender: 'Alex (PM)', message: 'Dashboard mockups are ready. Check Figma for latest designs 🎨', time: '09:10', type: 'info', timestamp: new Date().toISOString() },
        { id: 2, sender: 'Jordan (Backend)', message: 'API endpoints are deployed. Documentation in team chat', time: '09:12', type: 'info', timestamp: new Date().toISOString() },
        { id: 3, sender: 'Sam (Designer)', message: 'Can we make the stats cards more prominent? Client feedback', time: '09:20', type: 'info', timestamp: new Date().toISOString() },
        { id: 4, sender: 'QA Team', message: 'Please ensure mobile responsiveness. Testing on various devices', time: '09:25', type: 'info', timestamp: new Date().toISOString() }
      ];
    }
  }

  // Chat enhancement state
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [onlineUsers] = useState([
    { name: 'Alex (PM)', status: 'online' },
    { name: 'Sarah (QA)', status: 'online' },
    { name: 'Mike (Manager)', status: 'away' },
    { name: 'Jordan (Backend)', status: 'online' },
    { name: 'Sam (Designer)', status: 'online' }
</original_code>```

```
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Play, RotateCcw, Send, MessageSquare, Bug, GitBranch,
  Clock, Zap, TrendingDown, TrendingUp, AlertTriangle, Phone,
  Users, Target, Code, CheckCircle, XCircle,
  ArrowLeft, Maximize2, Minimize2, Volume2, VolumeX, Settings,
  HelpCircle, X, ChevronRight, Activity, Database, Server,
  Wifi, Monitor, BarChart3, Calendar, FileText, Star,
  Terminal, Globe, Shield, Cpu, HardDrive, Network, Zap as Lightning,
  MessageCircle, Briefcase, Home, Building, Plus, User, LucideIcon,
  File, Folder, FolderOpen, Play as PlayIcon, Terminal as TerminalIcon
} from 'lucide-react';
import { ProfessionalCard } from '../components/ui/ProfessionalCard';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import { IDELayout } from '../components/IDELayout';
import { APITester } from '../components/APITester';


import { useTheme } from '../context/ThemeContext';
import { useWebContainer } from '../hooks/useWebContainer';
import { useChallenge } from '../hooks/useChallenge';
import { challengesApi } from '../services/api';
import { FrontendPreview } from '../components/FrontendPreview';

// Define types for our test results and other interfaces
interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
  error?: string;
}

// Updated Challenge interface to match API structure
interface Challenge {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  description: string;
  type: 'dsa' | 'bug-fix' | 'feature';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  tags: string[];
  timeLimit: number;
  content: {
    problemStatement: string;
    constraints?: string;
    examples: Array<{
      input: string;
      output: string;
      explanation?: string;
    }>;
    hints?: string[];
    solution?: string;
  };
  code: {
    starterCode?: {
      javascript?: string;
      typescript?: string;
    };
    testCases: Array<{
      input: string;
      expectedOutput: string;
      isHidden: boolean;
      weight: number;
    }>;
    validationRules?: {
      forbiddenKeywords?: string[];
      requiredKeywords?: string[];
    };
  };
  scenario?: {
    background: string;
    role: string;
    company: string;
    urgency: 'low' | 'medium' | 'high';
    distractions?: Array<{
      type: string;
      frequency: string;
      content: string;
    }>;
  };
  stats: {
    totalAttempts: number;
    successfulAttempts: number;
    averageTime: number;
    averageScore: number;
    popularityScore: number;
  };
  [key: string]: any; // Allow additional properties
}

interface NewsItem {
  id: number;
  type: 'positive' | 'neutral' | 'negative';
  message: string;
  time: string;
}

// TeamMessage interface with all required properties
interface TeamMessage {
  id: number | string;
  sender: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'urgent';
  timestamp: string;
  time: string; // Formatted time string for display
}

// Enhanced Distraction interface
interface EnhancedDistraction {
  id?: number;
  type: string;
  message: string;
  content?: string;
  icon?: LucideIcon;
  color?: string;
  actions?: string[];
  timestamp?: string;
}

// Type for distraction
interface Distraction {
  type: string;
  message: string;
  content?: string;
  icon?: LucideIcon;
  color?: string;
  actions?: string[];
}

// Enhanced Bug interface
interface Bug {
  id: number;
  message: string;
  title?: string;
  description?: string;
  severity?: string;
  reporter?: string;
}


// Type for team message
interface TeamMessage {
  id: string | number;
  sender: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'urgent';
  timestamp: string;
  time: string;
}

// Add this interface for file structure
interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  isOpen?: boolean;
}

const SimulationPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const mode = searchParams.get('mode') || 'standard';
  const challengeType = searchParams.get('type') || 'dsa';
  
  // Challenge state
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(3600); // 60 minutes
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [focusLevel, setFocusLevel] = useState<number>(100);

  // UI State
  const [showTeamChat, setShowTeamChat] = useState<boolean>(false);
  const [showSeniorHelp, setShowSeniorHelp] = useState<boolean>(false);
  // Senior help chat state
  const [seniorMessages, setSeniorMessages] = useState<Array<{
    id: number;
    sender: 'user' | 'senior';
    message: string;
    time: string;
  }>>([{
    id: 1,
    sender: 'senior',
    message: "Hey! I'm here to help. What are you working on? Feel free to ask about algorithms, debugging, or any technical challenges you're facing. 👨‍💻",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }]);
  const [isWaitingForSenior, setIsWaitingForSenior] = useState(false);
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [showDistraction, setShowDistraction] = useState<Distraction | null>(null);

  // Panels
  const [showJiraPanel, setShowJiraPanel] = useState<boolean>(false);
  const [showDeployPanel, setShowDeployPanel] = useState<boolean>(false);

  // Messages
  const [teamMessages, setTeamMessages] = useState<TeamMessage[]>([]);
  const [distractions, setDistractions] = useState<EnhancedDistraction[]>([]);
  const [bugs, setBugs] = useState<Bug[]>([]);

  // Jira state
  const [jiraStatus, setJiraStatus] = useState<string>('In Progress');
  const [jiraComments, setJiraComments] = useState<Array<{ id: number, user: string, text: string, time: string }>>([]);
  const [newComment, setNewComment] = useState<string>('');

  // Deployment state
  const [deploymentStatus, setDeploymentStatus] = useState<string>('idle');
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [deploymentHistory, setDeploymentHistory] = useState<Array<{
    id: string;
    status: 'success' | 'failed' | 'pending';
    time: string;
    commit: string;
    author: string;
  }>>([]);

  // System state
  const [systemHealth, setSystemHealth] = useState({
    api: 100,
    database: 100,
    cache: 100,
    build: 100,
  });

  // Game state
  const [mentorRequests, setMentorRequests] = useState<number>(3);
  const [managerMood, setManagerMood] = useState<number>(75);
  const [clientMood, setClientMood] = useState<number>(75);

  // Safe challenge access with proper type assertion
  const safeChallenge: Challenge = {
    id: '1',
    _id: '1',
    title: 'Challenge Title',
    slug: 'challenge-title',
    description: 'Challenge description goes here...',
    difficulty: 'Medium',
    type: 'dsa',
    category: 'algorithms',
    tags: ['array', 'sorting'],
    timeLimit: 30,
    content: {
      problemStatement: 'Solve the problem',
      examples: []
    },
    code: {
      starterCode: {
        javascript: '// Your code here'
      },
      testCases: []
    },
    stats: {
      totalAttempts: 0,
      successfulAttempts: 0,
      averageTime: 0,
      averageScore: 0,
      popularityScore: 0
    }
  };

  // Helper functions defined first
  const getInitialCode = useCallback((): string => {
    // Fallback to default templates based on challengeType only
    if (challengeType === 'dsa') {
      return '/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Your solution here\n    \n}';
    } else if (challengeType === 'bug-fix') {
      return '// Fix the authentication bug\n// The issue is in the email validation\n\nfunction validateEmail(email) {\n    // Current buggy implementation\n    const regex = new RegExp("^[a-zA-Z0-9@.]+$");\n    return regex.test(email);\n}\n\nfunction authenticateUser(email, password) {\n    if (!validateEmail(email)) {\n        throw new Error("Invalid email format");\n    }\n    // Authentication logic here...\n    return { success: true, user: { email } };\n}\n\n// Test the function\nconsole.log(authenticateUser("user+test@example.com", "password"));';
    } else {
      return 'import React, { useState, useEffect } from \'react\';\nimport \'./UserDashboard.css\';\n\nfunction UserDashboard() {\n    const [user, setUser] = useState(null);\n    const [stats, setStats] = useState({});\n    const [loading, setLoading] = useState(true);\n    \n    useEffect(() => {\n        // Fetch user data\n        fetchUserData();\n    }, []);\n    \n    const fetchUserData = async () => {\n        try {\n            // API call implementation needed\n            setLoading(false);\n        } catch (error) {\n            console.error(\'Error fetching user data:\', error);\n        }\n    };\n    \n    if (loading) {\n        return <div className="loading">Loading...</div>;\n    }\n    \n    return (\n        <div className="dashboard">\n            <h1>User Dashboard</h1>\n            {/* Implementation needed */}\n        </div>\n    );\n}\n\nexport default UserDashboard;';
    }
  }, [challengeType]); // Removed challenge from dependencies to prevent circular dependency

  // Route protection
  useEffect(() => {
    if (!id || !mode || !challengeType) {
      navigate('/portal/challenge/' + (id || '1'));
      return;
    }
  }, [id, mode, challengeType, navigate]);

  // Additional state variables
  const distractionFrequency = searchParams.get('distractionLevel') || 'medium';
  const [newChatMessage, setNewChatMessage] = useState('');
  const [companyNews] = useState<NewsItem[]>([
    { id: 1, type: 'positive', message: 'New client signed! Team morale +5', time: '09:10' },
    { id: 2, type: 'neutral', message: 'Coffee machine maintenance at 2 PM', time: '09:05' }
  ]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // Callback functions - moved here to be defined before use
  const addTeamMessage = useCallback((
    sender: string,
    message: string,
    msgType: 'info' | 'warning' | 'error' | 'success' | 'urgent' = 'info'
  ) => {
    const now = new Date();
    const newMessage: TeamMessage = {
      id: Date.now().toString(),
      sender,
      message,
      type: msgType,
      timestamp: now.toISOString(),
      time: now.toLocaleTimeString()
    };

    setTeamMessages(prev => [...prev, newMessage]);
  }, []);

  const triggerRandomDistraction = useCallback(() => {
    // Enhanced distraction types with icons and actions
    const distractionTypes = [
      {
        type: 'call',
        message: 'Incoming call from manager',
        content: 'Your manager is calling for a quick status update on the project. This could be important.',
        icon: Phone,
        color: 'text-orange-500',
        actions: ['Answer', 'Decline']
      },
      {
        type: 'meeting',
        message: 'Urgent team sync meeting',
        content: 'The team lead has called for an emergency sync meeting starting in 2 minutes. All developers required.',
        icon: Users,
        color: 'text-blue-500',
        actions: ['Join Meeting', 'Skip (Mark as Sick)']
      },
      {
        type: 'alert',
        message: 'Production system alert',
        content: 'Critical alert: Production API response time has increased by 300%. Database performance degraded.',
        icon: AlertTriangle,
        color: 'text-red-500',
        actions: ['Investigate', 'Continue Working']
      },
      {
        type: 'question',
        message: 'Teammate needs help',
        content: 'Sarah from the frontend team is stuck on a React component issue and needs your expertise.',
        icon: MessageSquare,
        color: 'text-green-500',
        actions: ['Help Now', 'Help Later']
      },
      {
        type: 'email',
        message: 'Urgent client email',
        content: 'Client has sent a high-priority email about changing requirements. Needs immediate attention.',
        icon: MessageCircle,
        color: 'text-purple-500',
        actions: ['Read Email', 'Check Later']
      }
    ];

    const randomDistraction = distractionTypes[Math.floor(Math.random() * distractionTypes.length)];
    setShowDistraction(randomDistraction);

    // Add a team message about the distraction
    addTeamMessage('System', `🚨 ${randomDistraction.message}`, 'warning');

    // Add to distractions list for tracking
    const newDistraction: EnhancedDistraction = {
      id: Date.now(),
      type: randomDistraction.type,
      message: randomDistraction.message,
      timestamp: new Date().toLocaleTimeString(),
      icon: randomDistraction.icon,
      color: randomDistraction.color
    };
    setDistractions(prev => [...prev, newDistraction]);
  }, [addTeamMessage]);

  // Load challenge data from backend
  useEffect(() => {
    const loadChallenge = async () => {
      if (!id) return;
      
      try {
        // Fetch challenge from backend API
        const response = await challengesApi.getChallengeById(id);
        const challengeData = response; // API response already contains the data
        
        // Transform API challenge to match our interface
        const transformedChallenge: Challenge = {
          id: challengeData._id,
          _id: challengeData._id,
          title: challengeData.title,
          slug: challengeData.slug,
          description: challengeData.description,
          type: challengeData.type,
          difficulty: challengeData.difficulty,
          category: challengeData.category,
          tags: challengeData.tags || [],
          timeLimit: challengeData.timeLimit,
          content: {
            problemStatement: challengeData.content?.problemStatement || '',
            constraints: challengeData.content?.constraints,
            examples: challengeData.content?.examples || [],
            hints: challengeData.content?.hints || [],
            solution: challengeData.content?.solution
          },
          code: {
            starterCode: challengeData.code?.starterCode,
            testCases: challengeData.code?.testCases || [],
            validationRules: challengeData.code?.validationRules
          },
          scenario: challengeData.scenario,
          stats: {
            totalAttempts: challengeData.stats?.totalAttempts || 0,
            successfulAttempts: challengeData.stats?.successfulAttempts || 0,
            averageTime: challengeData.stats?.averageTime || 0,
            averageScore: challengeData.stats?.averageScore || 0,
            popularityScore: challengeData.stats?.popularityScore || 0
          }
        };
        
        setChallenge(transformedChallenge);
        
        // Set initial code from challenge starter code
        const initialCode = challengeData.code?.starterCode?.javascript || transformedChallenge.code?.starterCode?.javascript || '// Starter code not available';
        setCode(initialCode);
        
        // Set time limit from challenge
        if (challengeData.timeLimit) {
          setTimeRemaining(challengeData.timeLimit * 60); // Convert minutes to seconds
        }
      } catch (error) {
        console.error('Failed to load challenge:', error);
        // Fallback to safe challenge
        setChallenge(safeChallenge);
        // Use the safe challenge's starter code directly
        setCode(safeChallenge.code?.starterCode?.javascript || '// Starter code not available');
      }
    };
    
    loadChallenge();
  }, [id]); // Removed getInitialCode from dependencies to prevent infinite loop

  // Auto npm install when package.json changes
  useEffect(() => {
    if (!challenge) return;
    
    // Check if we have a WebContainer instance and install dependencies
    const checkAndInstallDependencies = async () => {
      try {
        // This would be implemented in the WebContainer service
        console.log('Checking for dependencies to install...');
        // The WebContainer service will automatically install dependencies when package.json is written
      } catch (error) {
        console.error('Error checking/installing dependencies:', error);
      }
    };
    
    checkAndInstallDependencies();
  }, [challenge]);
  
  // Initialize team messages based on challenge scenario
  useEffect(() => {
    if (challenge?.scenario?.distractions) {
      const initialMessages = challenge.scenario.distractions.map((distraction, index) => ({
        id: index + 1,
        sender: 'System',
        message: distraction.content,
        time: new Date().toLocaleTimeString(),
        type: 'info' as const,
        timestamp: new Date().toISOString()
      }));
      setTeamMessages(initialMessages);
    }
  }, [challenge]);
  
  // Handle when time is up
  const handleTimeUp = useCallback(() => {
    navigate(`/portal/challenge-complete/${id}?success=false&score=0&time=00:00&reason=timeout`);
  }, [id, navigate]);

  // Timer countdown effect
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleTimeUp();
    }
  }, [timeRemaining, handleTimeUp]);

  // Distraction triggering logic based on challenge scenario data
  useEffect(() => {
    // Only set up distractions if we have scenario data and not in zen mode
    if (!challenge?.scenario?.distractions || mode === 'zen') return;

    // Clear any existing intervals
    const distractionIntervals: NodeJS.Timeout[] = [];

    // Set up distraction intervals based on challenge scenario
    challenge.scenario.distractions.forEach((distraction: { type: string; frequency: string; content: string; }) => {
      let intervalTime = 0;
      
      // Convert frequency to actual time intervals
      switch (distraction.frequency) {
        case 'low':
          intervalTime = 180000; // 3 minutes
          break;
        case 'medium':
          intervalTime = 120000; // 2 minutes
          break;
        case 'high':
          intervalTime = 60000; // 1 minute
          break;
        default:
          intervalTime = 120000; // default to medium
      }

      // Create interval for this distraction
      const interval = setInterval(() => {
        // Only trigger distractions if not in zen mode and time remaining > 5 minutes
        if (mode !== 'zen' && timeRemaining > 300) {
          triggerRandomDistraction();
        }
      }, intervalTime);

      distractionIntervals.push(interval);
    });

    // Cleanup function to clear all intervals when component unmounts or dependencies change
    return () => {
      distractionIntervals.forEach(interval => clearInterval(interval));
    };
  }, [challenge, mode, timeRemaining, triggerRandomDistraction]);

  // Helper function for initial messages based on challenge scenario
  function getInitialMessages(): TeamMessage[] {
    if (challenge?.scenario?.distractions) {
      return challenge.scenario.distractions.map((distraction, index) => ({
        id: index + 1,
        sender: 'System',
        message: distraction.content,
        time: new Date().toLocaleTimeString(),
        type: 'info' as const,
        timestamp: new Date().toISOString()
      }));
    }
    
    // Fallback to original logic
    if (challengeType === 'dsa') {
      return [];
    } else if (challengeType === 'bug-fix') {
      return [
        { id: 1, sender: 'Sarah (QA)', message: 'Hey! The login bug is affecting 30% of users. Priority is critical 🚨', time: '09:15', type: 'urgent', timestamp: new Date().toISOString() },
        { id: 2, sender: 'Mike (Manager)', message: 'Client is asking for ETA on the fix. How long do you need?', time: '09:18', type: 'urgent', timestamp: new Date().toISOString() },
        { id: 3, sender: 'DevOps', message: 'Production logs show 500 errors spiking. Need this fixed ASAP!', time: '09:20', type: 'urgent', timestamp: new Date().toISOString() }
      ];
    } else {
      return [
        { id: 1, sender: 'Alex (PM)', message: 'Dashboard mockups are ready. Check Figma for latest designs 🎨', time: '09:10', type: 'info', timestamp: new Date().toISOString() },
        { id: 2, sender: 'Jordan (Backend)', message: 'API endpoints are deployed. Documentation in team chat', time: '09:12', type: 'info', timestamp: new Date().toISOString() },
        { id: 3, sender: 'Sam (Designer)', message: 'Can we make the stats cards more prominent? Client feedback', time: '09:20', type: 'info', timestamp: new Date().toISOString() },
        { id: 4, sender: 'QA Team', message: 'Please ensure mobile responsiveness. Testing on various devices', time: '09:25', type: 'info', timestamp: new Date().toISOString() }
      ];
    }
  }

  // Chat enhancement state
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [onlineUsers] = useState([
    { name: 'Alex (PM)', status: 'online' },
    { name: 'Sarah (QA)', status: 'online' },
    { name: 'Mike (Manager)', status: 'away' },
    { name: 'Jordan (Backend)', status: 'online' },
    { name: 'Sam (Designer)', status: 'online' }
  ]);

  // Auto-response system
  const autoResponses = [
    { sender: 'Alex (PM)', responses: ['Thanks for the update!', 'Looks good to me', 'Can you check the requirements again?', 'Client is happy with the progress'] },
    { sender: 'Sarah (QA)', responses: ['Found a few edge cases', 'Tests are passing now', 'Need to verify mobile compatibility', 'Let me run some more tests'] },
    { sender: 'Jordan (Backend)', responses: ['API is ready', 'Database updated', 'Migration script deployed', 'Performance looking good'] },
    { sender: 'Sam (Designer)', responses: ['Updated the mockups', 'Color scheme approved', 'Mobile designs ready', 'Accessibility guidelines met'] }
  ];

  // Auto-respond to user messages
  const triggerAutoResponse = useCallback(() => {
    if (Math.random() > 0.7) { // 30% chance of auto-response
      const responders = autoResponses[Math.floor(Math.random() * autoResponses.length)];
      const response = responders.responses[Math.floor(Math.random() * responders.responses.length)];
      
      // Show typing indicator first
      setIsTyping(responders.sender);
      
      setTimeout(() => {
        setIsTyping(null);
        const newMessage: TeamMessage = {
          id: Date.now().toString(),
          sender: responders.sender,
          message: response,
          type: 'info',
          timestamp: new Date().toISOString(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setTeamMessages(prev => [...prev, newMessage]);
      }, 1000 + Math.random() * 2000); // 1-3 seconds typing delay
    }
  }, []);

  const startDeployment = useCallback((deployType: string) => {
    if (!challenge) return;

    // Add a new deployment to the history
    const newDeployment = {
      id: Date.now().toString(),
      status: 'pending' as const,
      time: 'Just now',
      commit: `${deployType}: ${challenge?.title || safeChallenge.title}`,
      author: 'You'
    };

    setDeploymentHistory(prev => [newDeployment, ...prev]);

    // Simulate deployment progress
    setTimeout(() => {
      setDeploymentHistory(prev => {
        const newHistory = [...prev];
        const index = newHistory.findIndex(d => d.status === 'pending');
        if (index !== -1) {
          // First update the pending deployment to success
          const updatedDeployment = {
            ...newHistory[index],
            status: 'success' as const,
            time: 'Just now',
            commit: `${deployType}: ${challenge?.title || safeChallenge.title}`,
            author: 'You'
          };
          newHistory[index] = updatedDeployment;

          // Add team messages
          addTeamMessage('DevOps Bot', 'Deployment successful! ✅', 'success');
          addTeamMessage('Manager', 'Great job on the deployment!', 'info');
        }
        return newHistory;
      });

      // Simulate a failed deployment after a delay
      setTimeout(() => {
        const failedDeployment = {
          id: Date.now().toString(),
          status: 'failed' as const,
          time: 'Just now',
          commit: `${deployType}: ${challenge?.title || safeChallenge.title}`,
          author: 'You'
        };
        setDeploymentHistory(prev => [failedDeployment, ...prev]);
        addTeamMessage('DevOps Bot', 'Deployment failed! ❌ Tests are not passing. Please fix the issues before deploying.', 'urgent');
        addTeamMessage('Manager', 'The deployment failed again. This is affecting our timeline. Please prioritize fixing this.', 'urgent');
      }, 1000);
    }, 2000);
  }, [challenge, addTeamMessage]);

  // Handle reset challenge
  const handleReset = useCallback(() => {
    setCode(getInitialCode());
    setTestResults([]);
    setTimeRemaining(3600); // Reset to 60 minutes
    setFocusLevel(100);
    setTeamMessages([]);
    setBugs([]);
    setJiraComments([]);
    setDeploymentHistory([]);
    setSystemHealth({ api: 100, database: 100, cache: 100, build: 100 });
    setManagerMood(75);
    setClientMood(75);
    setMentorRequests(3);
  }, [getInitialCode]);

  // Handle challenge submission
  const handleSubmit = useCallback(async () => {
    if (!code.trim()) {
      alert('Please write some code before submitting!');
      return;
    }

    setIsRunning(true);
    
    try {
      // Simulate running tests
      const mockTestResults: TestResult[] = [
        { name: 'Basic functionality', passed: true, message: 'Test passed successfully' },
        { name: 'Edge cases', passed: Math.random() > 0.3, message: Math.random() > 0.3 ? 'Test passed' : 'Failed on empty input' },
        { name: 'Performance', passed: Math.random() > 0.4, message: Math.random() > 0.4 ? 'Efficient solution' : 'Time limit exceeded' }
      ];
      
      setTestResults(mockTestResults);
      
      // Calculate score based on test results
      const passedTests = mockTestResults.filter(test => test.passed).length;
      const totalTests = mockTestResults.length;
      const testScore = (passedTests / totalTests) * 100;
      
      // Factor in time and focus for final score
      const timeBonus = Math.max(0, (timeRemaining / 3600) * 20); // Up to 20 points for time
      const focusBonus = Math.max(0, (focusLevel / 100) * 10); // Up to 10 points for focus
      const finalScore = Math.min(100, Math.round(testScore + timeBonus + focusBonus));
      
      const success = passedTests === totalTests;
      const timeUsed = 3600 - timeRemaining;
      const formattedTime = formatTime(timeUsed);
      
      // Navigate to completion page with results
      setTimeout(() => {
        navigate(`/portal/challenge-complete/${id}?success=${success}&score=${finalScore}&time=${formattedTime}&tests=${passedTests}/${totalTests}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error running tests:', error);
      setTestResults([
        { name: 'Code execution', passed: false, error: 'Failed to execute code. Please check for syntax errors.' }
      ]);
    } finally {
      setIsRunning(false);
    }
  }, [code, timeRemaining, focusLevel, id, navigate]);

  // Mark as used to prevent lint warnings
  const _unusedHandlers = { handleTimeUp, startDeployment };

  const handleMentorRequest = () => {
    if (mentorRequests > 0 && userQuestion.trim()) {
      setMentorRequests(prev => prev - 1);
      
      // Add user message to chat
      const userMessage = {
        id: Date.now(),
        sender: 'user' as const,
        message: userQuestion,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setSeniorMessages(prev => [...prev, userMessage]);
      
      // Show typing indicator
      setIsWaitingForSenior(true);
      
      // Penalty for asking for help - reduces focus and time
      setFocusLevel(prev => Math.max(0, prev - 5));
      setTimeRemaining(prev => Math.max(0, prev - 120)); // Lose 2 minutes

      const seniorResponses = [
        "Great question! Let me think about this...",
        "I can help with that! What specific part are you stuck on?",
        "Try breaking down the problem into smaller steps. What's your current approach?",
        "Have you considered using a different data structure? Sometimes a Map or Set can simplify things.",
        "The error suggests you might have an off-by-one issue. Check your loop conditions.",
        "Remember to handle edge cases - what happens with empty inputs?",
        "Look at the problem constraints again. Are you handling all the edge cases?",
        "Try console.log to debug step by step. What values are you getting?",
        "That's a common pattern! Here's how I'd approach it...",
        "Good thinking! You're on the right track. Try this approach...",
        "I'm in a meeting right now, but check the documentation for that API endpoint.",
        "Sorry, I'm swamped with my own deadlines. Try Stack Overflow? 😅",
        "Let me help you debug this. Can you share more context?",
        "That's an interesting challenge! Here's what I'd suggest..."
      ];

      // Simulate senior typing and responding
      setTimeout(() => {
        const randomResponse = seniorResponses[Math.floor(Math.random() * seniorResponses.length)];
        const seniorResponse = {
          id: Date.now() + 1,
          sender: 'senior' as const,
          message: randomResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setSeniorMessages(prev => [...prev, seniorResponse]);
        setIsWaitingForSenior(false);
        setUserQuestion(''); // Clear the question after response
      }, 1500 + Math.random() * 2000); // 1.5-3.5 seconds response time
      
    } else if (mentorRequests === 0) {
      alert('No more mentor requests available!');
    } else {
      alert('Please type your question before asking for help!');
    }
  };

  // Handle distraction action
  const handleDistractionAction = useCallback((action: string): void => {
    setShowDistraction(null);

    // Impact focus and time based on action
    if (action === 'Answer' || action === 'Join Meeting') {
      setFocusLevel(prev => Math.max(0, prev - 15));
      setTimeRemaining(prev => Math.max(0, prev - 300)); // Lose 5 minutes
      addTeamMessage('System', 'You spent 5 minutes on ' + action.toLowerCase(), 'warning');
    } else if (action === 'Decline' || action === 'Skip (Mark as Sick)') {
      setManagerMood(prev => Math.max(0, prev - 10));
      setFocusLevel(prev => Math.max(0, prev - 5)); // Small penalty for declining
      setTimeRemaining(prev => Math.max(0, prev - 30)); // Lose 30 seconds for distraction
    } else if (action === 'Investigate') {
      setFocusLevel(prev => Math.max(0, prev - 20));
      setTimeRemaining(prev => Math.max(0, prev - 600)); // Lose 10 minutes for investigation
      addTeamMessage('System', 'You spent 10 minutes investigating the system alert', 'warning');
    } else if (action === 'Continue Working') {
      setFocusLevel(prev => Math.max(0, prev - 2)); // Minimal penalty for ignoring
      setTimeRemaining(prev => Math.max(0, prev - 15)); // Lose 15 seconds for distraction
    }
  }, [addTeamMessage]);

  const getMoodColor = (mood: number): string => {
    if (mood > 75) return 'text-green-500';
    if (mood > 50) return 'text-yellow-500';
    if (mood > 25) return 'text-orange-500';
    return 'text-red-500';
  };

  const getMoodBg = (mood: number): string => {
    if (mood > 75) return 'bg-green-100';
    if (mood > 50) return 'bg-yellow-100';
    if (mood > 25) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={'min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 flex flex-col ' + (isFullscreen ? 'fixed inset-0 z-50 overflow-hidden' : 'pb-8')}>
      {!isFullscreen && (
        <div className="p-4 border-b border-slate-200/30 dark:border-slate-700/30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-xl">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <button
              onClick={() => navigate('/portal/challenges')}
              className="flex items-center px-4 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-all duration-300 font-medium group border border-slate-200/50 dark:border-slate-700/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              Exit Simulation
            </button>

            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-slate-900 dark:text-white font-bold text-xl">{safeChallenge.title}</div>
                <div className="flex items-center justify-center space-x-4 mt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                    <Code className="h-3 w-3 mr-1" />
                    {mode}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                    <Target className="h-3 w-3 mr-1" />
                    {safeChallenge.category || challengeType.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-3 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50"
                title={soundEnabled ? 'Disable Sound' : 'Enable Sound'}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-3 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar - Task Panel */}
        <div className="w-72 bg-white/70 dark:bg-slate-900/70 border-r border-slate-200/30 dark:border-slate-700/30 p-4 overflow-y-auto backdrop-blur-2xl flex-shrink-0 shadow-xl">
          <ProfessionalCard className="p-6 mb-4 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-slate-800/90 dark:to-slate-900/90 shadow-2xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <Target className="h-4 w-4 text-white" />
              </div>
              Task Details
            </h3>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">Status</div>
                <div className={'px-4 py-2 rounded-xl text-sm font-semibold border-2 ' + (
                  jiraStatus === 'In Progress' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700' :
                    jiraStatus === 'Code Review' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700' :
                      'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-700'
                )}>
                  {jiraStatus}
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">Priority</div>
                <div className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 ${challengeType === 'bug-fix' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700' :
                  challengeType === 'feature' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-700' :
                    'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700'
                  }`}>
                  {challengeType === 'bug-fix' ? 'Critical' : challengeType === 'feature' ? 'High' : 'Medium'}
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">Story Points</div>
                <div className="px-4 py-2 rounded-xl text-sm font-semibold bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-2 border-purple-200 dark:border-purple-700">
                  {challengeType === 'dsa' ? '2 Points' : challengeType === 'bug-fix' ? '3 Points' : '8 Points'}
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-2 font-medium">Time Remaining</div>
                <div className={`px-4 py-3 rounded-xl text-lg font-bold border-2 ${timeRemaining < 300 ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700' :
                  'bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700'
                  }`}>
                  <Clock className="h-4 w-4 inline mr-2" />
                  {formatTime(timeRemaining)}
                </div>
              </div>
            </div>
          </ProfessionalCard>



          {/* Bug Tracker */}
          <ProfessionalCard className="p-6 mb-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
              <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center mr-2">
                <Bug className="h-3 w-3 text-white" />
              </div>
              Bug Reports ({bugs.length})
            </h3>

            {bugs.length === 0 ? (
              <div className="text-slate-600 dark:text-slate-400 text-sm">No bugs reported yet</div>
            ) : (
              <div className="space-y-3">
                {bugs.map((bug) => (
                  <div key={bug.id} className="p-3 rounded-lg bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30">
                    <div className="font-medium text-red-400 text-sm mb-1">{bug.title}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">{bug.description}</div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-red-400">Severity: {bug.severity}</span>
                      <span className="text-slate-500">By: {bug.reporter}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ProfessionalCard>
          
              {/* System Dashboard - Conditional based on challenge type */}
              <ProfessionalCard className="p-4 bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-800/95 dark:to-slate-900/95 shadow-xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  {challengeType === 'dsa' ? 'Performance' : challengeType === 'bug-fix' ? 'Debug Status' : 'System Health'}
                </h3>

                {/* Team Performance Metrics */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                    <Users className="h-3 w-3 mr-2 text-blue-500" />
                    TEAM METRICS
                  </h4>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-2 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                            <Briefcase className="h-2 w-2 text-white" />
                          </div>
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Manager</span>
                        </div>
                        <span className={`text-xs font-bold ${getMoodColor(managerMood)}`}>{Math.floor(managerMood)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${getMoodBg(managerMood)} transition-all duration-500`} style={{ width: `${managerMood}%` }}></div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-2 rounded-lg border border-purple-200/50 dark:border-purple-700/50">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                            <Users className="h-2 w-2 text-white" />
                          </div>
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Client</span>
                        </div>
                        <span className={`text-xs font-bold ${getMoodColor(clientMood)}`}>{Math.floor(clientMood)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${getMoodBg(clientMood)} transition-all duration-500`} style={{ width: `${clientMood}%` }}></div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-2 rounded-lg border border-green-200/50 dark:border-green-700/50">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <Target className="h-2 w-2 text-white" />
                          </div>
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Focus</span>
                        </div>
                        <span className={`text-xs font-bold ${getMoodColor(focusLevel)}`}>{Math.floor(focusLevel)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${getMoodBg(focusLevel)} transition-all duration-500`} style={{ width: `${focusLevel}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Challenge-specific metrics */}
                {challengeType === 'dsa' && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center">
                      <Code className="h-3 w-3 mr-2 text-purple-500" />
                      ALGORITHM METRICS
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-xs font-bold text-purple-600 dark:text-purple-400">O(n)</div>
                        <div className="text-xs text-slate-500">Complexity</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-xs font-bold text-green-600 dark:text-green-400">85%</div>
                        <div className="text-xs text-slate-500">Efficiency</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <span className="text-slate-600 dark:text-slate-400">Distractions</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{distractions.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded">
                    <span className="text-slate-600 dark:text-slate-400">Issues</span>
                    <span className="font-bold text-red-600 dark:text-red-400">{bugs.length}</span>
                  </div>
                </div>
              </ProfessionalCard>
            





        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Top Controls */}
          <div className="p-4 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/30 dark:border-slate-700/30 backdrop-blur-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleReset}
                    className="flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border border-slate-400/20"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Challenge
                  </button>
                  
                  {/* Zen Mode Indicator */}
                  {mode === 'zen' && (
                    <div className="flex items-center px-3 py-2 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-300/30 dark:border-green-600/30">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">Zen Mode Active</span>
                    </div>
                  )}
                  
                  {/* Timer Display */}
                  <div className={`flex items-center px-4 py-2 rounded-xl font-semibold border-2 shadow-lg ${
                    timeRemaining < 300 ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700' :
                    timeRemaining < 600 ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-700' :
                    'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-700'
                  }`}>
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-lg font-mono">{formatTime(timeRemaining)}</span>
                  </div>
                </div>

                <div className="px-4 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 text-sm font-medium border border-slate-200/50 dark:border-slate-700/50">
                  {safeChallenge.description}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Quick Actions moved here */}
                {challengeType !== 'dsa' && (
                  <>
                    <button
                      onClick={() => setShowTeamChat(true)}
                      className="flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl relative border border-blue-400/20"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Team Chat
                      {teamMessages.filter(m => m.type === 'urgent').length > 0 && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                          {teamMessages.filter(m => m.type === 'urgent').length}
                        </div>
                      )}
                    </button>

                    <button
                      onClick={() => setShowJiraPanel(true)}
                      className="flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border border-indigo-400/20"
                    >
                      <GitBranch className="h-4 w-4 mr-2" />
                      JIRA
                    </button>

                    <button
                      onClick={() => setShowDeployPanel(true)}
                      className="flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl relative border border-green-400/20"
                    >
                      <Server className="h-4 w-4 mr-2" />
                      Deploy
                      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-lg ${deploymentStatus === 'success' ? 'bg-green-400' :
                        deploymentStatus === 'failed' ? 'bg-red-400' :
                          deploymentStatus === 'building' ? 'bg-yellow-400 animate-pulse' :
                            'bg-gray-400'
                        }`}></div>
                    </button>
                  </>
                )}

                <button
                  onClick={() => setShowSeniorHelp(true)}
                  className="flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl relative border border-amber-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={mentorRequests === 0}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Get Help
                  {mentorRequests > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-lg">
                      {mentorRequests}
                    </div>
                  )}
                </button>



                {/* Preview/API Tester Toggle */}
                {challengeType === 'feature' && (
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={`flex items-center px-4 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border ${showPreview
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-blue-400/20'
                      : 'bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 border-slate-200/50 dark:border-slate-700/50'
                      }`}
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </button>
                )}

                {challengeType === 'bug-fix' && (
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={`flex items-center px-4 py-2 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border ${showPreview
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-orange-400/20'
                      : 'bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 border-slate-200/50 dark:border-slate-700/50'
                      }`}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    {showPreview ? 'Hide API Test' : 'Show API Test'}
                  </button>
                )}

                <ProfessionalButton
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium px-6 py-2"
                  disabled={!isRunning}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit
                </ProfessionalButton>
              </div>
            </div>
          </div>

          {/* Code Editor and Preview */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex flex-1 min-h-0">
              {/* Code Editor */}
              <div className={`${showPreview && (challengeType === 'feature' || challengeType === 'bug-fix') ? 'w-1/2' : 'flex-1'} flex flex-col min-h-0`}>
                <IDELayout
                  initialCode={code}
                  onCodeChange={setCode}
                  language={challengeType === 'dsa' ? 'javascript' : challengeType === 'bug-fix' ? 'javascript' : challengeType === 'feature' ? 'html' : 'javascript'}
                  challengeType={challengeType}
                  showPreview={showPreview && challengeType === 'feature'}
                  challengeId={id}
                  challengeDuration={challengeType === 'dsa' ? 15 : challengeType === 'bug-fix' ? 30 : 60}
                  challengeData={challenge} // Pass the challenge data to IDELayout
                />
              </div>

              {/* Preview Panel for Frontend */}
              {showPreview && challengeType === 'feature' && (
                <div className="w-1/2 border-l border-slate-200/30 dark:border-slate-700/30 bg-white/80 dark:bg-slate-900/80 flex flex-col backdrop-blur-xl">
                  <div className="p-4 border-b border-slate-200/30 dark:border-slate-700/30 bg-gradient-to-r from-slate-50/80 to-blue-50/80 dark:from-slate-800/80 dark:to-slate-900/80">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                      <Globe className="h-5 w-5 mr-2 text-blue-500" />
                      Live Preview
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Real-time preview of your React component</p>
                  </div>
                  <div className="flex-1">
                    <div className="w-full h-full">
                      <FrontendPreview
                        htmlCode={code}
                        cssCode=""
                        jsCode=""
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* API Testing Panel for Bug Fix */}
              {showPreview && challengeType === 'bug-fix' && (
                <div className="w-1/2 border-l border-slate-200/30 dark:border-slate-700/30 bg-white/80 dark:bg-slate-900/80 flex flex-col backdrop-blur-xl">
                  <div className="p-4 border-b border-slate-200/30 dark:border-slate-700/30 bg-gradient-to-r from-slate-50/80 to-orange-50/80 dark:from-slate-800/80 dark:to-slate-900/80">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                      <Database className="h-5 w-5 mr-2 text-orange-500" />
                      API Tester
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Test your bug fixes with real API calls</p>
                  </div>
                  <div className="flex-1 p-4">
                    <APITester
                      baseUrl="http://localhost:3000"
                      endpoints={[]}
                      challengeData={challenge}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Conditional Content */}
          
        </div>
      </div>

      {/* Distraction Notifications - Positioned below header */}
      <div className="fixed top-24 right-4 space-y-2 z-50">
        {distractions.map((distraction) => (
          <div
            key={distraction.id}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-lg max-w-sm animate-slide-in-right"
          >
            <div className="flex items-center space-x-3">
              {distraction.icon && (
                <distraction.icon className={`h-5 w-5 ${distraction.color || 'text-gray-500'}`} />
              )}
              <div className="flex-1">
                <div className="font-medium text-slate-900 dark:text-white text-sm">{distraction.message}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">{distraction.timestamp}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Team Chat Modal - Modern Chat App Design */}
      {showTeamChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[700px] flex overflow-hidden">
            {/* Chat Sidebar */}
            <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-900 dark:text-white">DevTeam Workspace</h3>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">You</span>
                </div>
              </div>

              {/* Channels */}
              <div className="flex-1 p-4">
                <div className="mb-4">
                  <h4 className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-2">CHANNELS</h4>
                  <div className="space-y-1">
                    <div className="flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded text-sm text-blue-600 dark:text-blue-400">
                      <span className="mr-2">#</span>
                      <span>dev-team</span>
                      <div className="ml-auto w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                    <div className="flex items-center px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm cursor-pointer">
                      <span className="mr-2">#</span>
                      <span>general</span>
                    </div>
                    <div className="flex items-center px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm cursor-pointer">
                      <span className="mr-2">#</span>
                      <span>random</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-2">ONLINE NOW ({onlineUsers.filter(u => u.status === 'online').length})</h4>
                  <div className="space-y-1">
                    <div className="flex items-center px-2 py-1 text-blue-600 dark:text-blue-400 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      <span>You</span>
                    </div>
                    {onlineUsers.map((user, index) => (
                      <div key={index} className="flex items-center px-2 py-1 text-gray-600 dark:text-gray-400 text-sm">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          user.status === 'online' ? 'bg-green-400' : 
                          user.status === 'away' ? 'bg-yellow-400' : 'bg-gray-400'
                        }`}></div>
                        <span>{user.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white"># dev-team</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{teamMessages.length} messages • 5 members</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTeamChat(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-white dark:bg-gray-900">
                <div className="space-y-4">
                  {teamMessages.map((message, index) => (
                    <div key={message.id} className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${message.sender.includes('Alex') ? 'bg-blue-500' :
                        message.sender.includes('Sarah') ? 'bg-purple-500' :
                          message.sender.includes('Mike') ? 'bg-orange-500' :
                            message.sender.includes('Jordan') ? 'bg-green-500' :
                              message.sender.includes('Sam') ? 'bg-pink-500' :
                                message.sender.includes('QA') ? 'bg-red-500' :
                                  message.sender.includes('You') ? 'bg-indigo-500' :
                                    'bg-gray-500'
                        }`}>
                        {message.sender.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">{message.sender}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{message.time}</span>
                          {message.type === 'urgent' && (
                            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full font-medium">
                              Urgent
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-800 dark:text-gray-200 break-words">
                          {message.message}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        isTyping.includes('Alex') ? 'bg-blue-500' :
                        isTyping.includes('Sarah') ? 'bg-purple-500' :
                        isTyping.includes('Jordan') ? 'bg-green-500' :
                        isTyping.includes('Sam') ? 'bg-pink-500' :
                        'bg-gray-500'
                      }`}>
                        {isTyping.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">{isTyping}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">typing...</span>
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newChatMessage}
                      onChange={(e) => setNewChatMessage(e.target.value)}
                      placeholder="Message #dev-team"
                      className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newChatMessage.trim()) {
                          const newMessage = {
                            id: Date.now(),
                            sender: 'You',
                            message: newChatMessage,
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            type: 'info' as const,
                            timestamp: new Date().toISOString()
                          };
                          setTeamMessages(prev => [...prev, newMessage]);
                          setNewChatMessage('');
                          triggerAutoResponse(); // Trigger potential auto-response
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (newChatMessage.trim()) {
                          const newMessage = {
                            id: Date.now(),
                            sender: 'You',
                            message: newChatMessage,
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            type: 'info' as const,
                            timestamp: new Date().toISOString()
                          };
                          setTeamMessages(prev => [...prev, newMessage]);
                          setNewChatMessage('');
                          triggerAutoResponse(); // Trigger potential auto-response
                        }
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Senior Help Modal */}
      {showSeniorHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl w-[450px] h-[400px] flex flex-col overflow-hidden border border-gray-200">
            {/* Chat header */}
            <div className="bg-blue-600 px-4 py-3 flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">Senior Developer</h3>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <p className="text-blue-100 text-xs">Available for help</p>
                </div>
              </div>
              <button
                onClick={() => setShowSeniorHelp(false)}
                className="text-white hover:bg-blue-700 rounded p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
              {seniorMessages.map((message) => (
                <div key={message.id} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    message.sender === 'senior' ? 'bg-blue-500' : 'bg-indigo-500'
                  }`}>
                    {message.sender === 'senior' ? 'SD' : 'Y'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">
                        {message.sender === 'senior' ? 'Senior Developer' : 'You'}
                      </span>
                      <span className="text-xs text-gray-500">{message.time}</span>
                    </div>
                    <div className={`p-3 rounded-lg text-sm border ${
                      message.sender === 'senior' 
                        ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-500' 
                        : 'bg-white text-gray-800 border-gray-200'
                    }`}>
                      {message.message}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing indicator for senior */}
              {isWaitingForSenior && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    SD
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">Senior Developer</span>
                      <span className="text-xs text-gray-500">typing...</span>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg border-l-4 border-blue-500">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat input */}
            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    className="w-full bg-gray-100 rounded-lg px-4 py-2 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ask your question here..."
                    rows={2}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleMentorRequest();
                      }
                    }}
                    disabled={isWaitingForSenior}
                  />
                </div>
                <ProfessionalButton
                  onClick={handleMentorRequest}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2"
                  disabled={isWaitingForSenior || !userQuestion.trim()}
                >
                  {isWaitingForSenior ? 'Waiting...' : 'Ask'}
                </ProfessionalButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* JIRA Panel Modal - Enhanced Authentic JIRA Design */}
      {showJiraPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-7xl h-[850px] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* JIRA Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-6 py-4 flex items-center justify-between shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
                  <GitBranch className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">JIRA Software</h3>
                  <p className="text-blue-100 text-sm flex items-center space-x-2">
                    <span>Sprint 23</span>
                    <span>•</span>
                    <span>Development Team</span>
                    <span>•</span>
                    <span className="bg-blue-500 px-2 py-1 rounded-full text-xs">5 issues</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-sm rounded-lg transition-colors shadow-md">
                  <Plus className="h-4 w-4 mr-1 inline" />
                  Create Issue
                </button>
                <button className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors">
                  <Settings className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowJiraPanel(false)}
                  className="text-blue-100 hover:text-white transition-colors p-2 rounded-lg hover:bg-blue-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Enhanced Sidebar */}
              <div className="w-72 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                {/* Sprint Info */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-4 rounded-lg border border-green-200 dark:border-green-700">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-green-800 dark:text-green-300">Sprint 23</h4>
                      <span className="px-2 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs rounded-full font-medium">Active</span>
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-400 space-y-1 mb-3">
                      <div className="flex justify-between">
                        <span>Started:</span>
                        <span className="font-medium">Nov 15, 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ends:</span>
                        <span className="font-medium">Nov 29, 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Progress:</span>
                        <span className="font-bold">60%</span>
                      </div>
                    </div>
                    <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Quick Filters */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">QUICK FILTERS</h4>
                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-between text-left text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-colors">
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        My Issues
                      </span>
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs px-2 py-1 rounded-full">2</span>
                    </button>
                    <button className="w-full flex items-center justify-between text-left text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-colors">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Recently Updated
                      </span>
                      <span className="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 text-xs px-2 py-1 rounded-full">3</span>
                    </button>
                    <button className="w-full flex items-center justify-between text-left text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-colors">
                      <span className="flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        High Priority
                      </span>
                      <span className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 text-xs px-2 py-1 rounded-full">1</span>
                    </button>
                  </div>
                </div>

                {/* Team Members */}
                <div className="p-4 flex-1">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">TEAM MEMBERS</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">Y</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">You</div>
                        <div className="text-xs text-gray-500">Developer</div>
                      </div>
                      <div className="w-2 h-2 bg-green-400 rounded-full" title="Online"></div>
                    </div>
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">PM</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">Product Manager</div>
                        <div className="text-xs text-gray-500">Manager</div>
                      </div>
                      <div className="w-2 h-2 bg-green-400 rounded-full" title="Online"></div>
                    </div>
                    <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">QA</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">QA Lead</div>
                        <div className="text-xs text-gray-500">Tester</div>
                      </div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full" title="Away"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col">
                {/* Kanban Board Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sprint Board</h2>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">3 issues</span>
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">Create Issue</button>
                    </div>
                  </div>
                </div>

                {/* Kanban Columns */}
                <div className="flex-1 p-4 overflow-x-auto">
                  <div className="flex space-x-4 h-full min-w-max">
                    {/* To Do Column */}
                    <div className="w-80 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">TO DO</h3>
                        <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded">1</span>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xs text-blue-600 font-medium">TASK-124</span>
                            <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded">High</span>
                          </div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Setup CI/CD Pipeline</h4>
                          <div className="flex items-center justify-between">
                            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">PM</span>
                            </div>
                            <span className="text-xs text-gray-500">3 SP</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* In Progress Column */}
                    <div className="w-80 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-blue-700 dark:text-blue-300">IN PROGRESS</h3>
                        <span className="bg-blue-200 dark:bg-blue-800 text-blue-600 dark:text-blue-400 text-xs px-2 py-1 rounded">1</span>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border-l-4 border-blue-500 shadow-sm">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xs text-blue-600 font-medium">TASK-125</span>
                            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded">Critical</span>
                          </div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">{challenge?.title || safeChallenge.title}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{challenge?.description || safeChallenge.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">Y</span>
                            </div>
                            <span className="text-xs text-gray-500">{challengeType === 'dsa' ? '2' : challengeType === 'bug-fix' ? '3' : '8'} SP</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Code Review Column */}
                    <div className="w-80 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-yellow-700 dark:text-yellow-300">CODE REVIEW</h3>
                        <span className="bg-yellow-200 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-400 text-xs px-2 py-1 rounded">0</span>
                      </div>
                      <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-8">
                        No items in review
                      </div>
                    </div>

                    {/* Done Column */}
                    <div className="w-80 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-green-700 dark:text-green-300">DONE</h3>
                        <span className="bg-green-200 dark:bg-green-800 text-green-600 dark:text-green-400 text-xs px-2 py-1 rounded">1</span>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border-l-4 border-green-500 shadow-sm opacity-75">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-xs text-green-600 font-medium">TASK-123</span>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Database Migration</h4>
                          <div className="flex items-center justify-between">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">DB</span>
                            </div>
                            <span className="text-xs text-gray-500">5 SP</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Activity</h4>
              <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                {jiraComments.map((comment) => (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">{comment.user.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm text-gray-900 dark:text-white">{comment.user}</span>
                        <span className="text-xs text-gray-500">{comment.time}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newComment.trim()) {
                      setJiraComments(prev => [...prev, {
                        id: Date.now(),
                        user: 'You',
                        text: newComment,
                        time: 'Just now'
                      }]);
                      setNewComment('');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (newComment.trim()) {
                      setJiraComments(prev => [...prev, {
                        id: Date.now(),
                        user: 'You',
                        text: newComment,
                        time: 'Just now'
                      }]);
                      setNewComment('');
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deploy Panel Modal - CI/CD Pipeline Design */}
      {showDeployPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-6xl h-[700px] flex flex-col overflow-hidden">
            {/* Pipeline Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <Server className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">CI/CD Pipeline</h3>
                  <p className="text-green-100 text-sm">Production Deployment • Branch: main</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeployPanel(false)}
                className="text-green-100 hover:text-white transition-colors p-2 rounded hover:bg-green-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Pipeline Stages */}
              <div className="flex-1 p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pipeline Stages</h2>
                  <p className="text-gray-600 dark:text-gray-400">Automated deployment pipeline for production environment</p>
                </div>

                {/* Pipeline Visualization */}
                <div className="space-y-4">
                  {/* Stage 1: Build */}
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${deploymentStatus === 'success' || deploymentStatus === 'building' ? 'bg-green-500' : 'bg-gray-400'
                      }`}>
                      {deploymentStatus === 'success' || deploymentStatus === 'building' ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : (
                        <Code className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Build & Test</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Compile code, run unit tests, generate artifacts</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${deploymentStatus === 'success' || deploymentStatus === 'building' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                      {deploymentStatus === 'success' || deploymentStatus === 'building' ? 'Passed' : 'Pending'}
                    </div>
                  </div>

                  {/* Stage 2: Security Scan */}
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${deploymentStatus === 'success' || deploymentStatus === 'building' ? 'bg-blue-500' : 'bg-gray-400'
                      }`}>
                      {deploymentStatus === 'success' || deploymentStatus === 'building' ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : (
                        <Shield className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Security Scan</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Vulnerability assessment, dependency check</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${deploymentStatus === 'success' || deploymentStatus === 'building' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                      {deploymentStatus === 'success' || deploymentStatus === 'building' ? 'Passed' : 'Pending'}
                    </div>
                  </div>

                  {/* Stage 3: Deploy */}
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${deploymentStatus === 'success' ? 'bg-green-500' :
                      deploymentStatus === 'building' ? 'bg-yellow-500' :
                        deploymentStatus === 'failed' ? 'bg-red-500' : 'bg-gray-400'
                      }`}>
                      {deploymentStatus === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : deploymentStatus === 'building' ? (
                        <Clock className="h-5 w-5 text-white animate-spin" />
                      ) : deploymentStatus === 'failed' ? (
                        <XCircle className="h-5 w-5 text-white" />
                      ) : (
                        <Server className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Deploy to Production</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Rolling deployment, health checks, monitoring</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${deploymentStatus === 'success' ? 'bg-green-100 text-green-800' :
                      deploymentStatus === 'building' ? 'bg-yellow-100 text-yellow-800' :
                        deploymentStatus === 'failed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                      {deploymentStatus === 'building' ? 'In Progress' : deploymentStatus || 'Pending'}
                    </div>
                  </div>
                </div>

                {/* Deploy Button */}
                <div className="mt-6">
                  <button
                    onClick={() => {
                      if (deploymentStatus !== 'building') {
                        setDeploymentStatus('building');
                        setBuildLogs(['Starting build process...', 'Installing dependencies...']);

                        setTimeout(() => {
                          setBuildLogs(prev => [...prev, 'Running tests...']);
                          setTimeout(() => {
                            const hasBasicStructure = code.includes('function') || code.includes('const') || code.includes('class');
                            const isComplete = code.length > 100;
                            const testsPass = hasBasicStructure && isComplete;

                            if (testsPass) {
                              setBuildLogs(prev => [...prev, 'Tests passed ✓', 'Building application...', 'Deployment successful ✓']);
                              setDeploymentStatus('success');
                              setManagerMood(prev => Math.min(100, prev + 10));
                              setClientMood(prev => Math.min(100, prev + 5));
                              addTeamMessage('DevOps Bot', 'Deployment successful! 🚀 Application is now live.', 'success');
                            } else {
                              setBuildLogs(prev => [...prev, 'Tests failed ✗', 'Build failed due to test failures']);
                              setDeploymentStatus('failed');
                              setManagerMood(prev => Math.max(0, prev - 20));
                              setClientMood(prev => Math.max(0, prev - 15));
                              addTeamMessage('DevOps Bot', 'Deployment failed! ❌ Tests are not passing.', 'error');
                            }
                          }, 3000);
                        }, 2000);
                      }
                    }}
                    disabled={deploymentStatus === 'building'}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {deploymentStatus === 'building' ? (
                      <>
                        <Clock className="h-5 w-5 animate-spin" />
                        <span>Deploying...</span>
                      </>
                    ) : (
                      <>
                        <Server className="h-5 w-5" />
                        <span>Deploy to Production</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Sidebar - Logs & History */}
              <div className="w-80 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
                {/* Build Logs */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Build Logs</h3>
                  <div className="bg-black text-green-400 p-3 rounded font-mono text-xs h-48 overflow-y-auto">
                    {buildLogs.length > 0 ? (
                      buildLogs.map((log, index) => (
                        <div key={index} className="mb-1">
                          <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500">No logs available. Click deploy to start...</div>
                    )}
                  </div>
                </div>

                {/* Deployment History */}
                <div className="flex-1 p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Recent Deployments</h3>
                  <div className="space-y-2">
                    {deploymentHistory.map((deployment) => (
                      <div key={deployment.id} className="p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm text-gray-900 dark:text-white">{deployment.commit}</span>
                          <div className={`w-2 h-2 rounded-full ${deployment.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">by {deployment.author}</span>
                          <span className="text-xs text-gray-500">{deployment.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Distraction Modal */}
      {showDistraction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              {showDistraction.icon && (
                <showDistraction.icon className={`h-6 w-6 ${showDistraction.color || 'text-gray-500'}`} />
              )}
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{showDistraction.message}</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{showDistraction.content}</p>
            <div className="flex space-x-3">
              {showDistraction.actions?.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleDistractionAction(action)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${index === 0
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300'
                    }`}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationPage;