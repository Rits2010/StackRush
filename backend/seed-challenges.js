const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stackrush');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');

  // Import the Challenge model
  const Challenge = require('./dist/models/Challenge').Challenge;
  const User = require('./dist/models/User').User;

  try {
    // Find the admin user
    const user = await User.findOne({ username: 'admin' });
    if (!user) {
      console.log('Admin user not found. Please create an admin user first.');
      process.exit(1);
    }

    console.log('Found user:', user.username, user._id);

    // Sample challenges data
    const challenges = [
      // DSA Challenges (3)
      {
        title: 'Two Sum',
        slug: 'two-sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        type: 'dsa',
        difficulty: 'Easy',
        category: 'Algorithms',
        tags: ['array', 'hash-table'],
        timeLimit: 30,
        content: {
          problemStatement: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
          constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.',
          examples: [
            {
              input: 'nums = [2,7,11,15], target = 9',
              output: '[0,1]',
              explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
            }
          ],
          hints: ['A really brute force way would be to search for every pair. What is the time complexity?', 'Use a hash table to store the values and their indices.']
        },
        code: {
          starterCode: {
            javascript: 'function twoSum(nums, target) {\n  // Your code here\n  return [];\n}'
          },
          testCases: [
            {
              input: '[2,7,11,15], 9',
              expectedOutput: '[0,1]',
              isHidden: false,
              weight: 1
            },
            {
              input: '[3,2,4], 6',
              expectedOutput: '[1,2]',
              isHidden: false,
              weight: 1
            }
          ],
          validationRules: {
            forbiddenKeywords: [],
            requiredKeywords: []
          }
        },
        scenario: {
          background: 'You are working on a legacy codebase where you need to implement a function to find two numbers that sum to a target value.',
          role: 'Software Engineer',
          company: 'TechCorp',
          urgency: 'medium'
        },
        stats: {
          totalAttempts: 0,
          successfulAttempts: 0,
          averageTime: 0,
          averageScore: 0,
          popularityScore: 0
        },
        author: user._id,
        isPublic: true,
        isActive: true
      },
      {
        title: 'Binary Tree Traversal',
        slug: 'binary-tree-traversal',
        description: 'Implement in-order, pre-order, and post-order traversal for a binary tree',
        type: 'dsa',
        difficulty: 'Medium',
        category: 'Data Structures',
        tags: ['tree', 'recursion', 'traversal'],
        timeLimit: 45,
        content: {
          problemStatement: 'Given the root of a binary tree, return the inorder traversal of its nodes\' values.',
          constraints: 'The number of nodes in the tree is in the range [0, 100].\n-100 <= Node.val <= 100',
          examples: [
            {
              input: 'root = [1,null,2,3]',
              output: '[1,3,2]',
              explanation: 'Inorder traversal visits left subtree, root, then right subtree.'
            }
          ],
          hints: ['Consider using recursion for a clean solution.', 'Think about the order of visiting nodes.']
        },
        code: {
          starterCode: {
            javascript: 'function inorderTraversal(root) {\n  // Your code here\n  return [];\n}'
          },
          testCases: [
            {
              input: '[1,null,2,3]',
              expectedOutput: '[1,3,2]',
              isHidden: false,
              weight: 1
            },
            {
              input: '[]',
              expectedOutput: '[]',
              isHidden: false,
              weight: 1
            }
          ],
          validationRules: {
            forbiddenKeywords: [],
            requiredKeywords: ['recursion']
          }
        },
        scenario: {
          background: 'You are implementing tree traversal algorithms for a new data visualization tool.',
          role: 'Backend Developer',
          company: 'DataViz Inc',
          urgency: 'medium'
        },
        stats: {
          totalAttempts: 0,
          successfulAttempts: 0,
          averageTime: 0,
          averageScore: 0,
          popularityScore: 0
        },
        author: user._id,
        isPublic: true,
        isActive: true
      },
      {
        title: 'LRU Cache Implementation',
        slug: 'lru-cache-implementation',
        description: 'Design and implement a data structure for Least Recently Used (LRU) cache',
        type: 'dsa',
        difficulty: 'Hard',
        category: 'Data Structures',
        tags: ['linked-list', 'hash-map', 'design'],
        timeLimit: 60,
        content: {
          problemStatement: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with get and put methods.',
          constraints: '1 <= capacity <= 3000\n0 <= key <= 10^4\n0 <= value <= 10^5\nAt most 2 * 10^5 calls will be made to get and put.',
          examples: [
            {
              input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]',
              output: '[null, null, null, 1, null, -1, null, -1, 3, 4]',
              explanation: 'LRU cache operations demonstrating eviction policy.'
            }
          ],
          hints: ['Use a combination of hash map and doubly linked list.', 'Think about how to maintain order of usage efficiently.']
        },
        code: {
          starterCode: {
            javascript: 'class LRUCache {\n  constructor(capacity) {\n    // Your code here\n  }\n\n  get(key) {\n    // Your code here\n  }\n\n  put(key, value) {\n    // Your code here\n  }\n}'
          },
          testCases: [
            {
              input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]',
              expectedOutput: '[null, null, null, 1, null, -1, null, -1, 3, 4]',
              isHidden: false,
              weight: 1
            }
          ],
          validationRules: {
            forbiddenKeywords: [],
            requiredKeywords: ['class']
          }
        },
        scenario: {
          background: 'You are optimizing a web application\'s performance by implementing an efficient caching mechanism.',
          role: 'Senior Backend Engineer',
          company: 'WebScale Solutions',
          urgency: 'high'
        },
        stats: {
          totalAttempts: 0,
          successfulAttempts: 0,
          averageTime: 0,
          averageScore: 0,
          popularityScore: 0
        },
        author: user._id,
        isPublic: true,
        isActive: true
      },
      // Frontend React Tasks (2)
      {
        title: 'React Component Optimization',
        slug: 'react-component-optimization',
        description: 'Optimize a React component for better performance using memoization and useCallback',
        type: 'feature',
        difficulty: 'Medium',
        category: 'Frontend',
        tags: ['react', 'performance', 'optimization'],
        timeLimit: 40,
        content: {
          problemStatement: 'The UserList component is re-rendering unnecessarily when parent state changes. Optimize it using React.memo and useCallback to prevent unnecessary re-renders.',
          constraints: 'Do not change the component structure. Only add optimization techniques.',
          examples: [
            {
              input: 'Parent component re-renders but UserList props remain the same',
              output: 'UserList should not re-render unnecessarily',
              explanation: 'Use React.memo to prevent re-renders when props haven\'t changed.'
            }
          ],
          hints: ['Wrap the component with React.memo.', 'Use useCallback for event handlers.']
        },
        code: {
          starterCode: {
            javascript: 'import React, { useState } from \'react\';\n\n// Optimize this component\nconst UserList = ({ users, onUserClick }) => {\n  return (\n    <div>\n      {users.map(user => (\n        <div key={user.id} onClick={() => onUserClick(user)}>\n          {user.name}\n        </div>\n      ))}\n    </div>\n  );\n};\n\nconst ParentComponent = () => {\n  const [users, setUsers] = useState([\n    { id: 1, name: \'John\' },\n    { id: 2, name: \'Jane\' }\n  ]);\n  \n  const [count, setCount] = useState(0);\n  \n  const handleUserClick = (user) => {\n    console.log(\'User clicked:\', user);\n  };\n  \n  return (\n    <div>\n      <button onClick={() => setCount(count + 1)}>Count: {count}</button>\n      <UserList users={users} onUserClick={handleUserClick} />\n    </div>\n  );\n};'
          },
          testCases: [
            {
              input: 'Parent component re-renders but UserList props remain the same',
              expectedOutput: 'UserList should not re-render unnecessarily',
              isHidden: false,
              weight: 1
            }
          ],
          validationRules: {
            forbiddenKeywords: [],
            requiredKeywords: ['React.memo', 'useCallback']
          }
        },
        scenario: {
          background: 'A dashboard application is experiencing performance issues due to unnecessary component re-renders.',
          role: 'Frontend Developer',
          company: 'Dashboard Inc',
          urgency: 'medium'
        },
        stats: {
          totalAttempts: 0,
          successfulAttempts: 0,
          averageTime: 0,
          averageScore: 0,
          popularityScore: 0
        },
        author: user._id,
        isPublic: true,
        isActive: true
      },
      {
        title: 'React Form Validation',
        slug: 'react-form-validation',
        description: 'Implement form validation for a user registration form using React hooks',
        type: 'feature',
        difficulty: 'Medium',
        category: 'Frontend',
        tags: ['react', 'form', 'validation'],
        timeLimit: 35,
        content: {
          problemStatement: 'Implement form validation for a user registration form with fields for name, email, and password. Show appropriate error messages and disable submit button when form is invalid.',
          constraints: 'Use React hooks (useState, useEffect). Validate on blur and on submit.',
          examples: [
            {
              input: 'Empty name field',
              output: 'Error message: "Name is required"',
              explanation: 'Form should validate each field and show appropriate error messages.'
            }
          ],
          hints: ['Use useState for form state and errors.', 'Validate fields on blur and submit.']
        },
        code: {
          starterCode: {
            javascript: 'import React, { useState } from \'react\';\n\nconst RegistrationForm = () => {\n  const [formData, setFormData] = useState({\n    name: \'\',\n    email: \'\',\n    password: \'\'\n  });\n  \n  const [errors, setErrors] = useState({});\n  \n  const handleChange = (e) => {\n    const { name, value } = e.target;\n    setFormData(prev => ({\n      ...prev,\n      [name]: value\n    }));\n  };\n  \n  const handleSubmit = (e) => {\n    e.preventDefault();\n    // Add validation here\n    console.log(\'Form submitted:\', formData);\n  };\n  \n  return (\n    <form onSubmit={handleSubmit}>\n      <div>\n        <input\n          type="text"\n          name="name"\n          placeholder="Name"\n          value={formData.name}\n          onChange={handleChange}\n        />\n        {errors.name && <span>{errors.name}</span>}\n      </div>\n      \n      <div>\n        <input\n          type="email"\n          name="email"\n          placeholder="Email"\n          value={formData.email}\n          onChange={handleChange}\n        />\n        {errors.email && <span>{errors.email}</span>}\n      </div>\n      \n      <div>\n        <input\n          type="password"\n          name="password"\n          placeholder="Password"\n          value={formData.password}\n          onChange={handleChange}\n        />\n        {errors.password && <span>{errors.password}</span>}\n      </div>\n      \n      <button type="submit">Register</button>\n    </form>\n  );\n};'
          },
          testCases: [
            {
              input: 'Empty name field',
              expectedOutput: 'Error message: "Name is required"',
              isHidden: false,
              weight: 1
            }
          ],
          validationRules: {
            forbiddenKeywords: [],
            requiredKeywords: ['useState', 'validation']
          }
        },
        scenario: {
          background: 'You are building a user registration system for a new SaaS product.',
          role: 'Frontend Developer',
          company: 'SaaS Startup',
          urgency: 'medium'
        },
        stats: {
          totalAttempts: 0,
          successfulAttempts: 0,
          averageTime: 0,
          averageScore: 0,
          popularityScore: 0
        },
        author: user._id,
        isPublic: true,
        isActive: true
      },
      // Backend Node/Express Tasks (2)
      {
        title: 'REST API Error Handling',
        slug: 'rest-api-error-handling',
        description: 'Implement comprehensive error handling middleware for a Node.js Express API',
        type: 'feature',
        difficulty: 'Medium',
        category: 'Backend',
        tags: ['nodejs', 'express', 'error-handling'],
        timeLimit: 40,
        content: {
          problemStatement: 'Implement error handling middleware that catches all errors, logs them, and returns consistent error responses to clients.',
          constraints: 'Use Express middleware pattern. Handle both operational and programming errors.',
          examples: [
            {
              input: 'Route throws an error',
              output: 'Consistent JSON error response with status code',
              explanation: 'Error middleware should catch errors and return standardized responses.'
            }
          ],
          hints: ['Create middleware that catches errors with 4 parameters.', 'Differentiate between operational and programming errors.']
        },
        code: {
          starterCode: {
            javascript: 'const express = require(\'express\');\nconst app = express();\n\n// Add error handling middleware here\n\napp.get(\'/error\', (req, res) => {\n  throw new Error(\'Something went wrong!\');\n});\n\napp.listen(3000, () => {\n  console.log(\'Server running on port 3000\');\n});'
          },
          testCases: [
            {
              input: 'Route throws an error',
              expectedOutput: 'Consistent JSON error response with status code',
              isHidden: false,
              weight: 1
            }
          ],
          validationRules: {
            forbiddenKeywords: [],
            requiredKeywords: ['middleware', 'next']
          }
        },
        scenario: {
          background: 'A production API is returning inconsistent error responses, making debugging difficult for clients.',
          role: 'Backend Developer',
          company: 'API Services Inc',
          urgency: 'high'
        },
        stats: {
          totalAttempts: 0,
          successfulAttempts: 0,
          averageTime: 0,
          averageScore: 0,
          popularityScore: 0
        },
        author: user._id,
        isPublic: true,
        isActive: true
      },
      {
        title: 'Database Connection Pooling',
        slug: 'database-connection-pooling',
        description: 'Implement database connection pooling for a Node.js application using MongoDB',
        type: 'feature',
        difficulty: 'Hard',
        category: 'Backend',
        tags: ['nodejs', 'mongodb', 'database'],
        timeLimit: 50,
        content: {
          problemStatement: 'Implement connection pooling for MongoDB to improve database performance and resource utilization.',
          constraints: 'Use the MongoDB Node.js driver. Configure appropriate pool size.',
          examples: [
            {
              input: 'Multiple concurrent database requests',
              output: 'Efficiently managed database connections',
              explanation: 'Connection pooling should reuse connections to avoid overhead.'
            }
          ],
          hints: ['Use MongoClient with connection pool options.', 'Configure maxPoolSize appropriately.']
        },
        code: {
          starterCode: {
            javascript: 'const { MongoClient } = require(\'mongodb\');\n\n// Implement connection pooling here\n\nasync function connectToDatabase() {\n  // Add connection pooling implementation\n}\n\n// Example usage\nasync function getUsers() {\n  const client = await connectToDatabase();\n  const db = client.db(\'myapp\');\n  return await db.collection(\'users\').find({}).toArray();\n}'
          },
          testCases: [
            {
              input: 'Multiple concurrent database requests',
              expectedOutput: 'Efficiently managed database connections',
              isHidden: false,
              weight: 1
            }
          ],
          validationRules: {
            forbiddenKeywords: [],
            requiredKeywords: ['MongoClient', 'maxPoolSize']
          }
        },
        scenario: {
          background: 'A high-traffic application is experiencing database connection bottlenecks during peak hours.',
          role: 'Senior Backend Engineer',
          company: 'HighTraffic Co',
          urgency: 'high'
        },
        stats: {
          totalAttempts: 0,
          successfulAttempts: 0,
          averageTime: 0,
          averageScore: 0,
          popularityScore: 0
        },
        author: user._id,
        isPublic: true,
        isActive: true
      },
      // Bug Fixes (3)
      {
        title: 'React State Update Bug',
        slug: 'react-state-update-bug',
        description: 'Fix a bug where React state is not updating correctly due to stale closure',
        type: 'bug-fix',
        difficulty: 'Medium',
        category: 'Frontend',
        tags: ['react', 'hooks', 'bug'],
        timeLimit: 30,
        content: {
          problemStatement: 'The counter component is not updating correctly when the increment value changes. Fix the stale closure issue.',
          constraints: 'Use React hooks correctly. Do not change the component structure.',
          examples: [
            {
              input: 'Increment value changes from 1 to 5, then click increment button',
              output: 'Counter should increment by 5, not 1',
              explanation: 'The useEffect creates a stale closure with the initial increment value.'
            }
          ],
          hints: ['The issue is with how the increment value is captured in useEffect.', 'Consider using useRef or including increment in dependency array.']
        },
        code: {
          starterCode: {
            javascript: 'import React, { useState, useEffect } from \'react\';\n\nconst Counter = () => {\n  const [count, setCount] = useState(0);\n  const [increment, setIncrement] = useState(1);\n  \n  useEffect(() => {\n    const interval = setInterval(() => {\n      setCount(c => c + increment); // Bug: increment is captured in closure\n    }, 1000);\n    \n    return () => clearInterval(interval);\n  }, []); // Bug: missing increment in dependency array\n  \n  return (\n    <div>\n      <p>Count: {count}</p>\n      <input \n        type="number" \n        value={increment} \n        onChange={(e) => setIncrement(Number(e.target.value))} \n      />\n      <p>Increment by: {increment}</p>\n    </div>\n  );\n};'
          },
          testCases: [
            {
              input: 'Increment value changes from 1 to 5, then click increment button',
              expectedOutput: 'Counter should increment by 5, not 1',
              isHidden: false,
              weight: 1
            }
          ],
          validationRules: {
            forbiddenKeywords: [],
            requiredKeywords: ['useRef', 'useEffect']
          }
        },
        scenario: {
          background: 'A timer component in a productivity app is not updating correctly when the user changes settings.',
          role: 'Frontend Developer',
          company: 'Productivity App Co',
          urgency: 'medium'
        },
        stats: {
          totalAttempts: 0,
          successfulAttempts: 0,
          averageTime: 0,
          averageScore: 0,
          popularityScore: 0
        },
        author: user._id,
        isPublic: true,
        isActive: true
      },
      {
        title: 'Express Middleware Bug',
        slug: 'express-middleware-bug',
        description: 'Fix a bug in Express middleware that is not passing control to the next middleware',
        type: 'bug-fix',
        difficulty: 'Easy',
        category: 'Backend',
        tags: ['express', 'middleware', 'bug'],
        timeLimit: 25,
        content: {
          problemStatement: 'The authentication middleware is not calling next(), causing requests to hang. Fix the middleware to properly pass control.',
          constraints: 'Do not change the authentication logic. Only fix the middleware flow.',
          examples: [
            {
              input: 'Request with valid token',
              output: 'Request should proceed to next middleware/handler',
              explanation: 'Middleware must call next() to pass control to the next handler.'
            }
          ],
          hints: ['Check if next() is being called in all code paths.', 'Make sure next() is called after authentication logic.']
        },
        code: {
          starterCode: {
            javascript: 'const express = require(\'express\');\nconst app = express();\n\n// Bug: Middleware not calling next()\nconst authMiddleware = (req, res, next) => {\n  const token = req.headers.authorization;\n  \n  if (!token) {\n    return res.status(401).json({ error: \'No token provided\' });\n  }\n  \n  // Simulate token validation\n  if (token !== \'valid-token\') {\n    return res.status(401).json({ error: \'Invalid token\' });\n  }\n  \n  req.user = { id: 1, username: \'testuser\' };\n  // Bug: Missing next() call here\n};\n\napp.use(authMiddleware);\n\napp.get(\'/protected\', (req, res) => {\n  res.json({ message: \'This is protected data\', user: req.user });\n});'
          },
          testCases: [
            {
              input: 'Request with valid token',
              expectedOutput: 'Request should proceed to next middleware/handler',
              isHidden: false,
              weight: 1
            }
          ],
          validationRules: {
            forbiddenKeywords: [],
            requiredKeywords: ['next']
          }
        },
        scenario: {
          background: 'An API endpoint is not responding to requests with valid authentication tokens.',
          role: 'Backend Developer',
          company: 'API Services Inc',
          urgency: 'high'
        },
        stats: {
          totalAttempts: 0,
          successfulAttempts: 0,
          averageTime: 0,
          averageScore: 0,
          popularityScore: 0
        },
        author: user._id,
        isPublic: true,
        isActive: true
      },
      {
        title: 'Async/Await Promise Bug',
        slug: 'async-await-promise-bug',
        description: 'Fix a bug where async/await is not properly handling Promise rejections',
        type: 'bug-fix',
        difficulty: 'Medium',
        category: 'Backend',
        tags: ['nodejs', 'async-await', 'bug'],
        timeLimit: 35,
        content: {
          problemStatement: 'The data fetching function is not properly handling errors from async operations. Fix the error handling.',
          constraints: 'Use async/await pattern. Handle both success and error cases.',
          examples: [
            {
              input: 'API call returns an error',
              output: 'Error should be caught and handled gracefully',
              explanation: 'Missing try/catch block around await operations.'
            }
          ],
          hints: ['Wrap await operations in try/catch blocks.', 'Handle both success and error cases properly.']
        },
        code: {
          starterCode: {
            javascript: 'const fetch = require(\'node-fetch\');\n\n// Bug: Missing error handling\nasync function fetchUserData(userId) {\n  // Bug: No try/catch around await\n  const response = await fetch(`https://api.example.com/users/${userId}`);\n  const userData = await response.json();\n  return userData;\n}\n\n// Usage\nasync function displayUser(userId) {\n  // Bug: No error handling\n  const user = await fetchUserData(userId);\n  console.log(\'User:\', user);\n}\n\n// This will crash if the API call fails\ndisplayUser(123);'
          },
          testCases: [
            {
              input: 'API call returns an error',
              expectedOutput: 'Error should be caught and handled gracefully',
              isHidden: false,
              weight: 1
            }
          ],
          validationRules: {
            forbiddenKeywords: [],
            requiredKeywords: ['try', 'catch']
          }
        },
        scenario: {
          background: 'A data processing service is crashing when external APIs are unavailable.',
          role: 'Backend Developer',
          company: 'Data Processing Inc',
          urgency: 'high'
        },
        stats: {
          totalAttempts: 0,
          successfulAttempts: 0,
          averageTime: 0,
          averageScore: 0,
          popularityScore: 0
        },
        author: user._id,
        isPublic: true,
        isActive: true
      }
    ];

    // Insert challenges
    for (const challengeData of challenges) {
      const existingChallenge = await Challenge.findOne({ title: challengeData.title });
      if (existingChallenge) {
        console.log(`Challenge "${challengeData.title}" already exists, skipping...`);
        continue;
      }

      const challenge = new Challenge(challengeData);
      await challenge.save();
      console.log(`Created challenge: ${challenge.title}`);
    }

    console.log('All challenges created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding challenges:', error);
    process.exit(1);
  }
});