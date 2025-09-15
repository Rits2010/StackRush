import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { TestCase, TeamMessage } from '../types/simulation';
import { type } from 'os';

// Helper functions moved to top to avoid hoisting issues
export const getInitialCode = (type: string): { html: string; css: string; js: string } => {
    if (type === 'dsa') {
    return {
      html: `<h1>Two Sum</h1>
<p>Check the console for test results.</p>`,
      css: `body { font-family: sans-serif; }`,
      js: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Your solution here
    
}`
    };
  } else if (type === 'bug-fix') {
    return {
      html: `<h1>Authentication Bug</h1>
<p>Check the console for test results.</p>`,
      css: `body { font-family: sans-serif; }`,
      js: `// Fix the authentication bug
// The issue is in the email validation

function validateEmail(email) {
    // Current buggy implementation
    const regex = new RegExp("^[a-zA-Z0-9@.]+$");
    return regex.test(email);
}

function authenticateUser(email, password) {
    if (!validateEmail(email)) {
        throw new Error("Invalid email format");
    }
    // Authentication logic here...
    return { success: true, user: { email } };
}

// Test the function
console.log(authenticateUser("user+test@example.com", "password"));`
    };
  } else { // feature
    return {
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Dashboard</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="root"></div>
    <script src="script.js"></script>
</body>
</html>`,
      css: `body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: #f0f2f5;
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.dashboard {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    width: 80%;
    max-width: 900px;
}

.loading {
    font-size: 1.5rem;
    color: #555;
}`,
      js: `import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './style.css';

function UserDashboard() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        // Fetch user data
        fetchUserData();
    }, []);
    
    const fetchUserData = async () => {
        try {
            // API call implementation needed
            // Mocking data for now
            setTimeout(() => {
                setUser({ name: 'Alex Doe' });
                setStats({ followers: 1250, projects: 12, tasks: 4 });
                setLoading(false);
            }, 1500);
        } catch (error) { 
            console.error('Error fetching user data:', error);
        }
    };
    
    if (loading) {
        return <div className="loading">Loading...</div>;
    }
    
    return (
        <div className="dashboard">
            <h1>Welcome, {user.name}</h1>
            <div className="stats-grid">
                <div className="stat-card">Followers: {stats.followers}</div>
                <div className="stat-card">Projects: {stats.projects}</div>
                <div className="stat-card">Open Tasks: {stats.tasks}</div>
            </div>
        </div>
    );
}

ReactDOM.render(<UserDashboard />, document.getElementById('root'));`
    };
  }
};

export const getInitialTestCases = (type: string): TestCase[] => {
  if (type === 'dsa') {
    return [
      { input: 'nums = [2,7,11,15], target = 9', expected: '[0,1]', status: 'pending' as const },
      { input: 'nums = [3,2,4], target = 6', expected: '[1,2]', status: 'pending' as const },
      { input: 'nums = [3,3], target = 6', expected: '[0,1]', status: 'pending' as const }
    ];
  } else if (type === 'bug-fix') {
    return [
      { input: 'validateEmail("user+test@example.com")', expected: 'true', status: 'pending' as const },
      { input: 'validateEmail("user.name@example.com")', expected: 'true', status: 'pending' as const },
      { input: 'validateEmail("invalid-email")', expected: 'false', status: 'pending' as const }
    ];
  } else { // feature
    return [
      { description: 'Dashboard loads without errors', status: 'pending' as const },
      { description: 'User stats display correctly', status: 'pending' as const },
      { description: 'Mobile responsive design', status: 'pending' as const },
      { description: 'API integration works', status: 'pending' as const }
    ];
  }
};

export const getInitialMessages = (type: string): TeamMessage[] => {
  if (type === 'bug-fix') {
    return [
      { 
        id: 1, 
        sender: 'Sarah (QA)', 
        message: 'Hey! The login bug is affecting 30% of users. Priority is critical 🚨', 
        time: '09:15', 
        type: 'urgent' as const 
      },
      { 
        id: 2, 
        sender: 'Mike (Manager)', 
        message: 'Client is asking for ETA on the fix. How long do you need?', 
        time: '09:18', 
        type: 'urgent' as const 
      },
      { 
        id: 3, 
        sender: 'DevOps', 
        message: 'Production logs show 500 errors spiking. Need this fixed ASAP!', 
        time: '09:20', 
        type: 'urgent' as const 
      }
    ];
  } else if (type === 'feature') {
    return [
      { 
        id: 1, 
        sender: 'Alex (PM)', 
        message: 'Dashboard mockups are ready. Check Figma for latest designs 🎨', 
        time: '09:10', 
        type: 'info' as const 
      },
      { 
        id: 2, 
        sender: 'Jordan (Backend)', 
        message: 'API endpoints are deployed. Documentation in Slack thread', 
        time: '09:12', 
        type: 'info' as const 
      },
      { 
        id: 3, 
        sender: 'Sam (Designer)', 
        message: 'Can we make the stats cards more prominent? Client feedback', 
        time: '09:20', 
        type: 'info' as const 
      },
      { 
        id: 4, 
        sender: 'QA Team', 
        message: 'Please ensure mobile responsiveness. Testing on various devices', 
        time: '09:25', 
        type: 'info' as const 
      }
    ];
  }
  return [];
};

export const useSimulation = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // const type = searchParams.get('type') || 'dsa';
  const challengeType = searchParams.get('type') || 'dsa';

  // State
  const [isRunning] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(
    challengeType === 'dsa' ? 15 * 60 : challengeType === 'bug-fix' ? 30 * 60 : 60 * 60
  );
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [activeFile, setActiveFile] = useState('index.html');
  const [buildLogs] = useState<string[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);

  // Initialize code and test cases
  useEffect(() => {
    const { html, css, js } = getInitialCode(challengeType);
    setHtmlCode(html);
    setCssCode(css);
    setJsCode(js);
    setTestCases(getInitialTestCases(challengeType));
  }, [challengeType]);

  const handleTimeUp = useCallback(() => {
    navigate(`/portal/challenge-complete/${id}?success=false&score=0&time=00:00&reason=timeout`);
  }, [id, navigate]);

  // Timer effect
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isRunning, timeRemaining, handleTimeUp]);

  const handleSubmit = useCallback(() => {
    // This is a simplified submission logic.
    // In a real scenario, you'd run tests against the code.
    const score = Math.round((timeRemaining / (15 * 60)) * 100);
    navigate(`/portal/challenge-complete/${id}?success=true&score=${score}`);
  }, [id, navigate, timeRemaining]);

  return {
    htmlCode,
    setHtmlCode,
    cssCode,
    setCssCode,
    jsCode,
    setJsCode,
    timeRemaining,
    isRunning,
    testCases,
    buildLogs,
    handleSubmit,
    challengeType,
    id,
    activeFile,
    setActiveFile,
  };
};
