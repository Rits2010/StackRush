const http = require('http');

function registerUser() {
  const data = JSON.stringify({
    email: 'admin@example.com',
    username: 'admin',
    password: 'Admin123!',
    firstName: 'Admin',
    lastName: 'User'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', responseData);
      
      // Try to login after registration
      loginUser();
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error.message);
  });

  req.write(data);
  req.end();
}

function loginUser() {
  const data = JSON.stringify({
    identifier: 'admin',
    password: 'Admin123!'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('Login Response:', responseData);
      
      try {
        const response = JSON.parse(responseData);
        if (response.success && response.data && response.data.tokens) {
          console.log('Access Token:', response.data.tokens.accessToken);
          console.log('User ID:', response.data.user._id);
          
          // Assign admin role to the user (this would normally be done manually or through a setup process)
          // For now, we'll just try to create challenges and see if we can make it work
          createSampleChallenges(response.data.tokens.accessToken, response.data.user._id);
        }
      } catch (e) {
        console.error('Error parsing login response:', e.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Login Error:', error.message);
  });

  req.write(data);
  req.end();
}

function createSampleChallenges(accessToken, userId) {
  const challenges = [
    {
      title: 'Two Sum',
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
          javascript: 'function twoSum(nums, target) {\n  // Your code here\n}'
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
        ]
      },
      scenario: {
        background: 'You are working on a legacy codebase where you need to implement a function to find two numbers that sum to a target value.',
        role: 'Software Engineer',
        company: 'TechCorp',
        urgency: 'medium'
      },
      isPublic: true
    },
    {
      title: 'Login Bug Fix',
      description: 'Fix the authentication bug in the login system',
      type: 'bug-fix',
      difficulty: 'Medium',
      category: 'Web Development',
      tags: ['authentication', 'security'],
      timeLimit: 45,
      content: {
        problemStatement: 'The login system is not working correctly. Users are unable to log in even with correct credentials. Investigate and fix the issue.',
        constraints: 'Do not modify the database schema. Fix only the authentication logic.',
        examples: [
          {
            input: 'Valid username and password',
            output: 'Successful login',
            explanation: 'User should be able to log in with correct credentials'
          }
        ],
        hints: ['Check the password comparison logic', 'Verify the database query']
      },
      code: {
        starterCode: {
          javascript: '// Login controller code with bug\nfunction login(req, res) {\n  // Implementation with bug\n}'
        },
        testCases: [
          {
            input: 'Valid credentials',
            expectedOutput: 'Login successful',
            isHidden: false,
            weight: 1
          }
        ]
      },
      scenario: {
        background: 'The company just launched a new product but users are reporting login issues. You need to fix this immediately.',
        role: 'Backend Developer',
        company: 'StartupXYZ',
        urgency: 'high'
      },
      isPublic: true
    }
  ];

  // Let's first try to create a challenge with admin role
  // We'll need to manually update the user in the database to have admin role
  console.log('Please manually assign admin role to the user in the database, then run the challenge creation script.');
  console.log('User ID:', userId);
  
  // For now, let's just check if we can get the challenges (which should work even without admin role)
  getChallenges(accessToken);
}

function getChallenges(accessToken) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/challenges',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  };

  const req = http.request(options, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('Get Challenges Response:', responseData);
    });
  });

  req.on('error', (error) => {
    console.error('Get Challenges Error:', error.message);
  });

  req.end();
}

// Start the process
registerUser();