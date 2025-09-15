const http = require('http');

function loginUser(callback) {
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
      try {
        const response = JSON.parse(responseData);
        if (response.success && response.data && response.data.tokens) {
          console.log('Login successful!');
          callback(null, response.data.tokens.accessToken, response.data.user._id);
        } else {
          callback(new Error('Login failed: ' + responseData));
        }
      } catch (e) {
        callback(new Error('Error parsing login response: ' + e.message));
      }
    });
  });

  req.on('error', (error) => {
    callback(new Error('Login Error: ' + error.message));
  });

  req.write(data);
  req.end();
}

function createLearningPlaylists(accessToken, userId) {
  const playlists = [
    {
      title: 'React Fundamentals Bootcamp',
      description: 'Master React from scratch with hands-on projects and real-world examples.',
      instructor: userId,
      metadata: {
        category: 'programming',
        difficulty: 'Beginner',
        duration: 480, // 8 hours
        lessonCount: 24
      },
      stats: {
        enrollments: 0,
        completions: 0,
        rating: 4.8
      }
    },
    {
      title: 'Full-Stack JavaScript Developer',
      description: 'Complete journey from frontend to backend using modern JavaScript.',
      instructor: userId,
      metadata: {
        category: 'programming',
        difficulty: 'Intermediate',
        duration: 720, // 12 hours
        lessonCount: 48
      },
      stats: {
        enrollments: 0,
        completions: 0,
        rating: 4.9
      }
    },
    {
      title: 'Advanced TypeScript Patterns',
      description: 'Learn advanced TypeScript patterns and best practices for large-scale applications.',
      instructor: userId,
      metadata: {
        category: 'programming',
        difficulty: 'Advanced',
        duration: 360, // 6 hours
        lessonCount: 18
      },
      stats: {
        enrollments: 0,
        completions: 0,
        rating: 4.7
      }
    }
  ];

  console.log('Creating learning playlists...');
  
  let completed = 0;
  playlists.forEach((playlist, index) => {
    const data = JSON.stringify(playlist);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/learning/playlists',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        completed++;
        console.log(`Playlist ${index + 1} response:`, responseData);
        if (completed === playlists.length) {
          console.log('All playlists created!');
          createTemplates(accessToken, userId);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`Error creating playlist ${index + 1}:`, error.message);
      completed++;
      if (completed === playlists.length) {
        console.log('Finished with errors.');
        createTemplates(accessToken, userId);
      }
    });

    req.write(data);
    req.end();
  });
}

function createTemplates(accessToken, userId) {
  const templates = [
    {
      title: 'Modern React Dashboard',
      description: 'Clean admin dashboard with React, Tailwind CSS, and Chart.js',
      author: userId,
      code: {
        htmlCode: '<div class="dashboard">React Dashboard Template</div>',
        cssCode: '.dashboard { padding: 20px; }',
        jsCode: 'function Dashboard() { return <div>Dashboard</div>; }',
        language: 'react',
        framework: 'React'
      },
      metadata: {
        category: 'web-dev',
        difficulty: 'Intermediate',
        tags: ['Dashboard', 'Charts', 'Responsive']
      },
      stats: {
        stars: 0,
        downloads: 0,
        forks: 0
      }
    },
    {
      title: 'Next.js E-commerce Starter',
      description: 'Complete e-commerce solution with payments and admin panel',
      author: userId,
      code: {
        htmlCode: '<div class="ecommerce">Next.js E-commerce Template</div>',
        cssCode: '.ecommerce { padding: 20px; }',
        jsCode: 'function Ecommerce() { return <div>E-commerce</div>; }',
        language: 'typescript',
        framework: 'Next.js'
      },
      metadata: {
        category: 'web-dev',
        difficulty: 'Advanced',
        tags: ['E-commerce', 'Stripe', 'Authentication']
      },
      stats: {
        stars: 0,
        downloads: 0,
        forks: 0
      }
    }
  ];

  console.log('Creating templates...');
  
  let completed = 0;
  templates.forEach((template, index) => {
    const data = JSON.stringify(template);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/templates',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        completed++;
        console.log(`Template ${index + 1} response:`, responseData);
        if (completed === templates.length) {
          console.log('All templates created!');
        }
      });
    });

    req.on('error', (error) => {
      console.error(`Error creating template ${index + 1}:`, error.message);
      completed++;
      if (completed === templates.length) {
        console.log('Finished with errors.');
      }
    });

    req.write(data);
    req.end();
  });
}

// Run the seeding process
console.log('Starting learning and template seeding process...');
loginUser((error, accessToken, userId) => {
  if (error) {
    console.error('Failed to login:', error.message);
    return;
  }
  
  console.log('Logged in successfully!');
  console.log('User ID:', userId);
  createLearningPlaylists(accessToken, userId);
});