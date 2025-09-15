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

    // Enhanced challenges with proper file structures and package.json
    const enhancedChallenges = [
      // Frontend Challenge with Complete Project Structure
      {
        title: 'E-commerce Product Gallery Crisis',
        slug: 'ecommerce-product-gallery-crisis',
        description: 'Black Friday is tomorrow and the product gallery is broken. Fix the responsive layout and implement image lazy loading.',
        type: 'feature',
        difficulty: 'Medium',
        category: 'Frontend',
        tags: ['react', 'responsive-design', 'performance', 'css'],
        timeLimit: 45,
        content: {
          problemStatement: 'The e-commerce product gallery is not displaying correctly on mobile devices and images are loading slowly. You need to fix the responsive layout and implement lazy loading for better performance.',
          constraints: 'Must work on mobile devices (320px+), implement lazy loading, maintain existing design aesthetic',
          examples: [
            {
              input: 'Product gallery on mobile device',
              output: 'Responsive grid layout with lazy-loaded images',
              explanation: 'Gallery should adapt to screen size and load images only when needed'
            }
          ],
          hints: [
            'Use CSS Grid or Flexbox for responsive layout',
            'Implement Intersection Observer API for lazy loading',
            'Consider using CSS media queries for different screen sizes'
          ]
        },

        code: {
          starterCode: {
            javascript: `// Fix the ProductGallery component
// 1. Make the grid responsive for mobile devices  
// 2. Implement lazy loading for images
// 3. Add proper loading states

import React, { useState, useEffect } from 'react';
import './ProductGallery.css';

const products = [
  { id: 1, name: 'Wireless Headphones', price: 99.99, image: 'https://picsum.photos/300/300?random=1', category: 'Electronics' },
  { id: 2, name: 'Smart Watch', price: 199.99, image: 'https://picsum.photos/300/300?random=2', category: 'Electronics' },
  { id: 3, name: 'Laptop Backpack', price: 49.99, image: 'https://picsum.photos/300/300?random=3', category: 'Accessories' },
  { id: 4, name: 'Bluetooth Speaker', price: 79.99, image: 'https://picsum.photos/300/300?random=4', category: 'Electronics' },
];

// BROKEN: This component has responsive and performance issues
const ProductGallery = () => {
  const [filter, setFilter] = useState('All');
  
  const categories = ['All', ...new Set(products.map(p => p.category))];
  const filteredProducts = filter === 'All' ? products : products.filter(p => p.category === filter);

  return (
    <div className="product-gallery">
      <div className="filter-bar">
        {categories.map(category => (
          <button 
            key={category}
            className={\`filter-btn \${filter === category ? 'active' : ''}\`}
            onClick={() => setFilter(category)}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* TODO: Fix this grid layout for mobile responsiveness */}
      <div className="products-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            {/* TODO: Implement lazy loading for this image */}
            <img src={product.image} alt={product.name} />
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="price">\${product.price}</p>
              <button className="add-to-cart">Add to Cart</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;`
          },
          testCases: [
            {
              input: 'Mobile viewport (320px width)',
              expectedOutput: 'Responsive grid with 1-2 columns',
              isHidden: false,
              weight: 1
            },
            {
              input: 'Image lazy loading test',
              expectedOutput: 'Images load only when in viewport',
              isHidden: false,
              weight: 1
            }
          ],
          validationRules: {
            forbiddenKeywords: [],
            requiredKeywords: ['grid-template-columns', 'IntersectionObserver']
          }
        },
        scenario: {
          background: 'Black Friday is tomorrow and the product gallery is broken on mobile devices. The marketing team is panicking because 70% of traffic comes from mobile. Images are loading slowly, causing high bounce rates.',
          stakeholders: ['Marketing Manager', 'UX Designer', 'Product Manager', 'QA Team'],
          businessContext: 'Revenue impact of $50K per hour if not fixed. Mobile conversion rate dropped 40%.',
          constraints: ['Must work on mobile (320px+)', 'Performance budget: 3s load time', 'Maintain existing design aesthetic'],
          distractions: [
            {
              type: 'urgent',
              frequency: 'high',
              content: 'Marketing Manager: "How long until this is fixed? We\'re losing customers!"'
            },
            {
              type: 'meeting',
              frequency: 'medium',
              content: 'Emergency stakeholder meeting called for status update'
            }
          ]
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

      // Backend API Challenge with Complete Project Structure
      {
        title: 'Payment Processing System Outage',
        slug: 'payment-processing-system-outage',
        description: 'Payment API is returning 500 errors during peak hours. Fix the database connection issues and implement proper error handling.',
        type: 'feature',
        difficulty: 'Hard',
        category: 'Backend',
        tags: ['nodejs', 'express', 'mongodb', 'error-handling', 'payments'],
        timeLimit: 60,
        content: {
          problemStatement: 'The payment processing API is failing during peak hours with database connection timeouts and unhandled promise rejections. You need to fix the connection pooling and implement proper error handling.',
          constraints: 'Zero downtime deployment required, PCI compliance must be maintained, handle 1000+ concurrent requests',
          examples: [
            {
              input: 'POST /api/payments with valid payment data',
              output: 'Successful payment processing with proper error handling',
              explanation: 'API should handle high load and database issues gracefully'
            }
          ],
          hints: [
            'Implement connection pooling for MongoDB',
            'Add proper error handling middleware',
            'Use circuit breaker pattern for external services'
          ]
        },

        code: {
          starterCode: {
            javascript: `// Fix the payment processing system
// 1. Add proper database connection pooling
// 2. Implement comprehensive error handling  
// 3. Add input validation and security measures

const express = require('express');
const mongoose = require('mongoose');

// BROKEN: No connection pooling, causing timeouts under load
const connectDB = async () => {
  try {
    // TODO: Add proper connection pooling options
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// BROKEN: No proper error handling, causing 500 errors
const processPayment = async (req, res) => {
  // TODO: Add input validation
  const { amount, currency, paymentMethod, customerInfo } = req.body;
  
  // BROKEN: No try-catch, unhandled promise rejections
  const payment = new Payment({
    amount,
    currency, 
    paymentMethod,
    customerInfo,
    status: 'pending'
  });
  
  const savedPayment = await payment.save();
  
  // BROKEN: External service call without error handling
  const result = await paymentService.processPayment(savedPayment);
  
  res.json(result);
};

module.exports = { connectDB, processPayment };`
          },
          testCases: [
            {
              input: 'High concurrent load (1000 requests)',
              expectedOutput: 'All requests handled without timeouts',
              isHidden: false,
              weight: 1
            },
            {
              input: 'Invalid payment data',
              expectedOutput: 'Proper validation error response',
              isHidden: false,
              weight: 1
            }
          ],
          validationRules: {
            forbiddenKeywords: [],
            requiredKeywords: ['maxPoolSize', 'try', 'catch', 'validation']
          }
        },
        apiEndpoint: '/api/payments/process',
        method: 'POST',
        samplePayload: {
          amount: 99.99,
          currency: 'USD',
          paymentMethod: 'card',
          cardToken: 'tok_visa_4242',
          customerInfo: {
            email: 'customer@example.com',
            name: 'John Doe'
          }
        },
        scenario: {
          background: 'Payment API is returning 500 errors during peak hours. Lost transactions worth $25K in last hour. Database connections are timing out and unhandled promise rejections are crashing the server.',
          stakeholders: ['Finance Team', 'Customer Support', 'DevOps', 'Security Team'],
          businessContext: 'Critical revenue impact. Customer trust at risk. Compliance audit next week.',
          constraints: ['Zero downtime deployment', 'PCI compliance required', 'Handle 1000+ concurrent requests'],
          distractions: [
            {
              type: 'urgent',
              frequency: 'high',
              content: 'Finance Team: "We\'re losing $500 per minute! When will this be fixed?"'
            },
            {
              type: 'alert',
              frequency: 'medium',
              content: 'DevOps Alert: Database CPU at 95%, connection pool exhausted'
            }
          ]
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

      // DSA Challenge with Real-World Context
      {
        title: 'Real-time Analytics Query Optimization',
        slug: 'realtime-analytics-query-optimization',
        description: 'Dashboard queries are timing out during business hours. Optimize the data processing algorithm to handle 10M+ records efficiently.',
        type: 'dsa',
        difficulty: 'Hard',
        category: 'Algorithms',
        tags: ['algorithms', 'optimization', 'data-structures', 'performance'],
        timeLimit: 60,
        content: {
          problemStatement: 'The executive dashboard is timing out when processing large datasets. You need to optimize the analytics query algorithm to handle 10M+ records with sub-second response time.',
          constraints: 'Sub-second response time required, handle 10M+ records, memory usage under 512MB',
          examples: [
            {
              input: 'Array of 10M user activity records with timestamps and metrics',
              output: 'Aggregated analytics data grouped by time periods',
              explanation: 'Algorithm should efficiently process large datasets and return aggregated results'
            }
          ],
          hints: [
            'Consider using efficient data structures like heaps or trees',
            'Think about time complexity - can you achieve O(n log n) or better?',
            'Memory optimization is crucial for large datasets'
          ]
        },

        code: {
          starterCode: {
            javascript: `// Optimize this analytics algorithm for 10M+ records
// Current implementation: O(n²) - TIMES OUT on large datasets
// Target: O(n log n) or better with sub-second response time

// SLOW ALGORITHM - Optimize this for 10M+ records!
class AnalyticsProcessor {
  constructor() {
    this.data = [];
  }
  
  // BROKEN: O(n²) complexity - times out on large datasets
  processUserActivity(records) {
    const result = {};
    
    // Group by hour - INEFFICIENT nested loops
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const hour = new Date(record.timestamp).getHours();
      
      if (!result[hour]) {
        result[hour] = {
          totalUsers: 0,
          totalRevenue: 0,
          averageSessionTime: 0
        };
      }
      
      // SLOW: Linear search for each record
      let userExists = false;
      for (let j = 0; j < this.data.length; j++) {
        if (this.data[j].userId === record.userId && 
            new Date(this.data[j].timestamp).getHours() === hour) {
          userExists = true;
          break;
        }
      }
      
      if (!userExists) {
        result[hour].totalUsers++;
      }
      
      result[hour].totalRevenue += record.revenue || 0;
    }
    
    return result;
  }
  
  // TODO: Optimize this method
  getTopPerformingHours(records, limit = 5) {
    const hourlyData = this.processUserActivity(records);
    
    // SLOW: Inefficient sorting
    const sortedHours = Object.entries(hourlyData)
      .sort((a, b) => b[1].totalRevenue - a[1].totalRevenue)
      .slice(0, limit);
      
    return sortedHours;
  }
}

module.exports = AnalyticsProcessor;`
          },
          testCases: [
            {
              input: '10M user activity records',
              expectedOutput: 'Processed in under 1 second',
              isHidden: false,
              weight: 1
            },
            {
              input: 'Memory usage test with large dataset',
              expectedOutput: 'Memory usage under 512MB',
              isHidden: false,
              weight: 1
            }
          ],
          validationRules: {
            forbiddenKeywords: ['nested loops', 'O(n²)'],
            requiredKeywords: ['Map', 'efficient', 'optimization']
          }
        },
        scenario: {
          background: 'Executive dashboard queries are timing out during business hours. The CEO needs real-time analytics for board meetings, but queries take 30+ seconds with current algorithm. Data volume has grown to 10M+ records.',
          stakeholders: ['Data Team', 'Business Intelligence', 'Infrastructure Team', 'Executive Team'],
          businessContext: 'Executive reports delayed, impacting critical business decisions. Board meeting tomorrow needs real-time data.',
          constraints: ['Sub-second response time required', 'Handle 10M+ records', 'Memory usage under 512MB'],
          distractions: [
            {
              type: 'urgent',
              frequency: 'high',
              content: 'CEO: "I need these analytics for the board meeting tomorrow. This is blocking critical decisions!"'
            },
            {
              type: 'alert',
              frequency: 'medium',
              content: 'Infrastructure Alert: Database queries consuming excessive CPU resources'
            }
          ]
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

    // Insert enhanced challenges
    for (const challengeData of enhancedChallenges) {
      const existingChallenge = await Challenge.findOne({ title: challengeData.title });
      if (existingChallenge) {
        console.log(`Challenge "${challengeData.title}" already exists, updating...`);
        await Challenge.findOneAndUpdate({ title: challengeData.title }, challengeData);
        console.log(`Updated challenge: ${challengeData.title}`);
      } else {
        const challenge = new Challenge(challengeData);
        await challenge.save();
        console.log(`Created challenge: ${challenge.title}`);
      }
    }

    console.log('All enhanced challenges created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding enhanced challenges:', error);
    process.exit(1);
  }
});