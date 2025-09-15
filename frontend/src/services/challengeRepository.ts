import { Challenge, ChallengeType, ScenarioTemplate } from '../types/challenge';

export class ChallengeRepository {
  // Scenario templates for different industries
  static scenarioTemplates = {
    ecommerce: {
      id: 'ecommerce',
      name: 'E-commerce Platform',
      description: 'Online retail and marketplace scenarios',
      industry: 'Retail Technology',
      commonStakeholders: ['Product Manager', 'UX Designer', 'Marketing Team', 'Customer Support'],
      typicalConstraints: ['High traffic periods', 'Mobile-first design', 'Performance requirements', 'SEO optimization'],
      businessMetrics: ['Conversion rate', 'Page load time', 'Cart abandonment', 'Revenue per visitor']
    },
    healthcare: {
      id: 'healthcare',
      name: 'Healthcare Systems',
      description: 'Medical and patient care technology scenarios',
      industry: 'Healthcare Technology',
      commonStakeholders: ['Medical Staff', 'Compliance Officer', 'IT Security', 'Patient Advocates'],
      typicalConstraints: ['HIPAA compliance', 'Accessibility requirements', 'Data security', 'Uptime requirements'],
      businessMetrics: ['Patient satisfaction', 'System uptime', 'Compliance score', 'Response time']
    },
    fintech: {
      id: 'fintech',
      name: 'Financial Technology',
      description: 'Banking and financial service scenarios',
      industry: 'Financial Services',
      commonStakeholders: ['Risk Management', 'Compliance Team', 'Security Team', 'Customer Success'],
      typicalConstraints: ['Regulatory compliance', 'Security requirements', 'Real-time processing', 'Audit trails'],
      businessMetrics: ['Transaction volume', 'Processing time', 'Security incidents', 'Customer trust score']
    },
    education: {
      id: 'education',
      name: 'Educational Technology',
      description: 'Learning and academic platform scenarios',
      industry: 'Education Technology',
      commonStakeholders: ['Educators', 'Students', 'Academic Administration', 'IT Support'],
      typicalConstraints: ['Accessibility compliance', 'Multi-device support', 'Offline capabilities', 'Data privacy'],
      businessMetrics: ['Student engagement', 'Learning outcomes', 'Platform adoption', 'Content completion']
    }
  };

  // Frontend Challenges
  static frontendChallenges: Challenge[] = [
    {
      id: 'fe-001',
      title: 'E-commerce Product Gallery Crisis',
      type: 'frontend',
      difficulty: 'Medium',
      timeLimit: '45 mins',
      distractionLevel: 'High',
      description: 'Fix the broken product gallery before Black Friday launch. Images aren\'t loading properly and the mobile layout is completely broken.',
      scenario: {
        background: 'Black Friday is in 6 hours and the product gallery is completely broken. Images aren\'t loading, the mobile layout is broken, and customers can\'t see product details properly.',
        stakeholders: ['Product Manager (Sarah)', 'UX Designer (Mike)', 'QA Team (Lisa)', 'Marketing Director (James)'],
        businessContext: 'Revenue impact of $50K per hour if not fixed. Black Friday represents 30% of annual revenue.',
        constraints: ['Must work on mobile devices', 'Performance budget: 3s load time', 'Support for 10,000+ concurrent users', 'Accessibility compliance required']
      },
      implementation: {
        startingFiles: [
          {
            path: 'src/components/ProductGallery.jsx',
            language: 'javascript',
            content: `import React, { useState, useEffect } from 'react';
import './ProductGallery.css';

const ProductGallery = ({ products }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // BUG: Images not loading properly
  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    });
  };

  useEffect(() => {
    // BUG: Not handling loading state properly
    setLoading(false);
  }, [products]);

  return (
    <div className="product-gallery">
      <div className="gallery-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            {/* BUG: Missing alt text and error handling */}
            <img src={product.image} />
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="price">\${product.price}</p>
              <button onClick={() => setSelectedProduct(product)}>
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {selectedProduct && (
        <div className="product-modal">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setSelectedProduct(null)}>×</button>
            <img src={selectedProduct.image} alt={selectedProduct.name} />
            <div className="product-details">
              <h2>{selectedProduct.name}</h2>
              <p className="description">{selectedProduct.description}</p>
              <p className="price">\${selectedProduct.price}</p>
              <button className="add-to-cart">Add to Cart</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGallery;`
          },
          {
            path: 'src/components/ProductGallery.css',
            language: 'css',
            content: `.product-gallery {
  padding: 20px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.product-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-info {
  padding: 15px;
}

.product-info h3 {
  margin: 0 0 10px 0;
  font-size: 1.2em;
}

.price {
  font-size: 1.5em;
  font-weight: bold;
  color: #e74c3c;
  margin: 10px 0;
}

.product-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

/* BUG: Missing mobile responsiveness */
@media (max-width: 768px) {
  /* Mobile styles missing */
}`
          },
          {
            path: 'src/App.jsx',
            language: 'javascript',
            content: `import React from 'react';
import ProductGallery from './components/ProductGallery';

const sampleProducts = [
  {
    id: 1,
    name: 'Wireless Headphones',
    price: 99.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
    description: 'High-quality wireless headphones with noise cancellation.'
  },
  {
    id: 2,
    name: 'Smart Watch',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
    description: 'Feature-rich smartwatch with health monitoring.'
  },
  {
    id: 3,
    name: 'Laptop Stand',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300',
    description: 'Ergonomic laptop stand for better posture.'
  },
  {
    id: 4,
    name: 'Bluetooth Speaker',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300',
    description: 'Portable Bluetooth speaker with excellent sound quality.'
  }
];

function App() {
  return (
    <div className="App">
      <header>
        <h1>TechStore - Black Friday Sale!</h1>
      </header>
      <ProductGallery products={sampleProducts} />
    </div>
  );
}

export default App;`
          }
        ],
        dependencies: ['react', 'react-dom'],
        environment: {
          type: 'frontend',
          runtime: 'browser',
          dependencies: ['react', 'react-dom'],
          ports: [3000]
        }
      },
      testing: {
        testCases: [
          {
            id: 'fe-001-tc-001',
            type: 'visual',
            description: 'Product gallery should display correctly on desktop',
            input: { viewport: 'desktop', products: 'sampleProducts' },
            expectedOutput: { layout: 'grid', columns: 'auto-fill', responsive: true },
            validationRules: [
              {
                type: 'pattern-match',
                criteria: { selector: '.gallery-grid', property: 'display', value: 'grid' },
                errorMessage: 'Gallery should use CSS Grid layout'
              }
            ],
            metadata: { timeout: 5000, retries: 2, criticality: 'high' }
          },
          {
            id: 'fe-001-tc-002',
            type: 'accessibility',
            description: 'All images should have proper alt text',
            input: { checkAccessibility: true },
            expectedOutput: { altTextPresent: true, ariaLabels: true },
            validationRules: [
              {
                type: 'accessibility-check',
                criteria: { rule: 'img-alt', level: 'AA' },
                errorMessage: 'All images must have descriptive alt text'
              }
            ],
            metadata: { timeout: 3000, retries: 1, criticality: 'high' }
          },
          {
            id: 'fe-001-tc-003',
            type: 'performance',
            description: 'Page should load within 3 seconds',
            input: { measurePerformance: true },
            expectedOutput: { loadTime: '<3000ms', imageOptimization: true },
            validationRules: [
              {
                type: 'performance-threshold',
                criteria: { metric: 'loadTime', threshold: 3000 },
                errorMessage: 'Page load time exceeds 3 second requirement'
              }
            ],
            metadata: { timeout: 10000, retries: 3, criticality: 'high' }
          }
        ],
        validationRules: [
          {
            type: 'pattern-match',
            criteria: { responsive: true, accessibility: true, performance: true },
            errorMessage: 'Solution must meet all requirements'
          }
        ],
        performanceCriteria: {
          maxExecutionTime: 3000,
          maxMemoryUsage: 50,
          minThroughput: 100
        }
      },
      metadata: {
        estimatedTime: 45,
        realWorldContext: 'E-commerce platforms must handle high traffic during sales events while maintaining performance and accessibility.',
        learningObjectives: [
          'Responsive web design implementation',
          'Image optimization and lazy loading',
          'Accessibility compliance (WCAG 2.1)',
          'Performance optimization techniques',
          'Error handling in React components'
        ],
        tags: ['React', 'CSS Grid', 'Responsive Design', 'Accessibility', 'Performance'],
        rating: 4.6,
        completions: 892,
        xp: 120,
        teamSize: 'Team (5)',
        distractionTypes: ['Extreme QA Pressure', 'High Client Calls', 'Medium Slack'],
        focusRating: 3.8,
        popularity: 88
      }
    },
    {
      id: 'fe-002',
      title: 'Healthcare Dashboard Accessibility Audit',
      type: 'frontend',
      difficulty: 'Hard',
      timeLimit: '60 mins',
      distractionLevel: 'Medium',
      description: 'Fix critical accessibility violations in the patient dashboard before the compliance audit tomorrow.',
      scenario: {
        background: 'The healthcare dashboard failed its accessibility audit with multiple WCAG 2.1 AA violations. The compliance team needs this fixed before tomorrow\'s regulatory review.',
        stakeholders: ['Compliance Officer (Dr. Smith)', 'Medical Staff (Nurses)', 'IT Security (Tom)', 'Patient Advocates (Maria)'],
        businessContext: 'Risk of $500K regulatory fines and potential lawsuit from disability rights groups. Patient safety is at risk.',
        constraints: ['WCAG 2.1 AA compliance required', 'Screen reader compatibility', 'Keyboard navigation support', 'High contrast mode support']
      },
      implementation: {
        startingFiles: [
          {
            path: 'src/components/PatientDashboard.jsx',
            language: 'javascript',
            content: `import React, { useState } from 'react';
import './PatientDashboard.css';

const PatientDashboard = ({ patient, vitals, medications }) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="dashboard">
      {/* ACCESSIBILITY ISSUE: Missing main landmark */}
      <div className="dashboard-header">
        <h1>Patient Dashboard</h1>
        {/* ACCESSIBILITY ISSUE: Missing alt text */}
        <img src="/patient-avatar.jpg" className="patient-avatar" />
      </div>

      {/* ACCESSIBILITY ISSUE: Not keyboard accessible */}
      <div className="tab-navigation">
        <div 
          className={\`tab \${activeTab === 'overview' ? 'active' : ''}\`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </div>
        <div 
          className={\`tab \${activeTab === 'vitals' ? 'active' : ''}\`}
          onClick={() => setActiveTab('vitals')}
        >
          Vitals
        </div>
        <div 
          className={\`tab \${activeTab === 'medications' ? 'active' : ''}\`}
          onClick={() => setActiveTab('medications')}
        >
          Medications
        </div>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-panel">
            <h2>Patient Information</h2>
            {/* ACCESSIBILITY ISSUE: Poor color contrast */}
            <p className="patient-id">ID: {patient.id}</p>
            <p className="patient-name">Name: {patient.name}</p>
            <p className="patient-age">Age: {patient.age}</p>
            
            {/* ACCESSIBILITY ISSUE: Missing form labels */}
            <div className="quick-actions">
              <input type="text" placeholder="Search records..." />
              <button>Search</button>
            </div>
          </div>
        )}

        {activeTab === 'vitals' && (
          <div className="vitals-panel">
            <h2>Vital Signs</h2>
            {/* ACCESSIBILITY ISSUE: Data table without proper headers */}
            <table className="vitals-table">
              <tr>
                <td>Blood Pressure</td>
                <td className="critical">{vitals.bloodPressure}</td>
              </tr>
              <tr>
                <td>Heart Rate</td>
                <td>{vitals.heartRate}</td>
              </tr>
              <tr>
                <td>Temperature</td>
                <td>{vitals.temperature}</td>
              </tr>
            </table>
          </div>
        )}

        {activeTab === 'medications' && (
          <div className="medications-panel">
            <h2>Current Medications</h2>
            {/* ACCESSIBILITY ISSUE: Missing semantic structure */}
            <div className="medication-list">
              {medications.map(med => (
                <div key={med.id} className="medication-item">
                  <span className="med-name">{med.name}</span>
                  <span className="med-dosage">{med.dosage}</span>
                  {/* ACCESSIBILITY ISSUE: Button without accessible name */}
                  <button className="edit-btn">✏️</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ACCESSIBILITY ISSUE: Modal without focus management */}
      <div className="emergency-alert" style={{display: 'none'}}>
        <div className="alert-content">
          <h3>Emergency Alert</h3>
          <p>Critical vital signs detected!</p>
          <button>Acknowledge</button>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;`
          }
        ],
        dependencies: ['react', 'react-dom'],
        environment: {
          type: 'frontend',
          runtime: 'browser',
          dependencies: ['react', 'react-dom'],
          ports: [3000]
        }
      },
      testing: {
        testCases: [
          {
            id: 'fe-002-tc-001',
            type: 'accessibility',
            description: 'All interactive elements should be keyboard accessible',
            input: { testKeyboardNavigation: true },
            expectedOutput: { keyboardAccessible: true, focusVisible: true },
            validationRules: [
              {
                type: 'accessibility-check',
                criteria: { rule: 'keyboard-navigation', level: 'AA' },
                errorMessage: 'All interactive elements must be keyboard accessible'
              }
            ],
            metadata: { timeout: 5000, retries: 2, criticality: 'high' }
          },
          {
            id: 'fe-002-tc-002',
            type: 'accessibility',
            description: 'Color contrast should meet WCAG 2.1 AA standards',
            input: { checkColorContrast: true },
            expectedOutput: { contrastRatio: '>=4.5:1' },
            validationRules: [
              {
                type: 'accessibility-check',
                criteria: { rule: 'color-contrast', level: 'AA', ratio: 4.5 },
                errorMessage: 'Color contrast must meet WCAG 2.1 AA standards (4.5:1)'
              }
            ],
            metadata: { timeout: 3000, retries: 1, criticality: 'high' }
          }
        ],
        validationRules: [
          {
            type: 'accessibility-check',
            criteria: { wcagLevel: 'AA', version: '2.1' },
            errorMessage: 'Solution must meet WCAG 2.1 AA compliance'
          }
        ]
      },
      metadata: {
        estimatedTime: 60,
        realWorldContext: 'Healthcare applications must meet strict accessibility standards to ensure all patients and medical staff can use the system effectively.',
        learningObjectives: [
          'WCAG 2.1 AA compliance implementation',
          'Keyboard navigation patterns',
          'Screen reader compatibility',
          'Semantic HTML structure',
          'Focus management in React'
        ],
        tags: ['Accessibility', 'WCAG', 'Healthcare', 'Compliance', 'React'],
        rating: 4.9,
        completions: 456,
        xp: 200,
        teamSize: 'Team (8)',
        distractionTypes: ['Extreme Scope Changes', 'High System Outages', 'High Team Coordination'],
        focusRating: 3.2,
        popularity: 92
      }
    }
  ];

  // Backend API Challenges
  static backendChallenges: Challenge[] = [
    {
      id: 'be-001',
      title: 'Payment Processing System Outage',
      type: 'backend-api',
      difficulty: 'Hard',
      timeLimit: '60 mins',
      distractionLevel: 'Extreme',
      description: 'Critical payment API is returning 500 errors during peak shopping hours. Revenue is bleeding at $25K per hour.',
      scenario: {
        background: 'The payment processing API started returning 500 errors 30 minutes ago during peak shopping hours. Customers can\'t complete purchases and support is flooded with complaints.',
        stakeholders: ['Finance Team (CFO)', 'Customer Support (Manager)', 'DevOps (Lead)', 'Business Operations (VP)'],
        businessContext: 'Lost transactions worth $25K in the last hour. Black Friday weekend represents 40% of quarterly revenue.',
        constraints: ['Zero downtime deployment required', 'PCI compliance must be maintained', 'Support 1000+ concurrent transactions', 'Response time <200ms']
      },
      implementation: {
        startingFiles: [
          {
            path: 'src/routes/payments.js',
            language: 'javascript',
            content: `const express = require('express');
const router = express.Router();
const PaymentService = require('../services/PaymentService');
const { validatePayment } = require('../middleware/validation');

// BUG: Missing error handling and input validation
router.post('/process', async (req, res) => {
  try {
    const { amount, cardNumber, expiryDate, cvv, customerEmail } = req.body;
    
    // BUG: No input validation
    const result = await PaymentService.processPayment({
      amount,
      cardNumber,
      expiryDate,
      cvv,
      customerEmail
    });
    
    // BUG: Exposing sensitive data in response
    res.json(result);
  } catch (error) {
    // BUG: Poor error handling
    res.status(500).json({ error: error.message });
  }
});

// BUG: Missing rate limiting
router.get('/status/:transactionId', async (req, res) => {
  const { transactionId } = req.params;
  
  try {
    const status = await PaymentService.getTransactionStatus(transactionId);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Transaction not found' });
  }
});

// BUG: No authentication on refund endpoint
router.post('/refund', async (req, res) => {
  const { transactionId, amount, reason } = req.body;
  
  try {
    const refund = await PaymentService.processRefund(transactionId, amount, reason);
    res.json(refund);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;`
          },
          {
            path: 'src/services/PaymentService.js',
            language: 'javascript',
            content: `const crypto = require('crypto');
const db = require('../config/database');

class PaymentService {
  static async processPayment(paymentData) {
    // BUG: No connection pool management
    const connection = await db.getConnection();
    
    try {
      // BUG: SQL injection vulnerability
      const query = \`
        INSERT INTO transactions (amount, card_number, customer_email, status, created_at)
        VALUES ('\${paymentData.amount}', '\${paymentData.cardNumber}', '\${paymentData.customerEmail}', 'pending', NOW())
      \`;
      
      const result = await connection.execute(query);
      
      // BUG: Simulating payment gateway call without proper error handling
      const gatewayResponse = await this.callPaymentGateway(paymentData);
      
      if (gatewayResponse.success) {
        await connection.execute(\`UPDATE transactions SET status = 'completed' WHERE id = \${result.insertId}\`);
        return {
          transactionId: result.insertId,
          status: 'completed',
          // BUG: Returning sensitive data
          cardNumber: paymentData.cardNumber,
          amount: paymentData.amount
        };
      } else {
        throw new Error('Payment gateway error');
      }
    } catch (error) {
      // BUG: Not rolling back transaction
      throw error;
    } finally {
      connection.release();
    }
  }

  static async callPaymentGateway(paymentData) {
    // BUG: No timeout handling
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // BUG: Random failures not handled properly
        if (Math.random() > 0.7) {
          resolve({ success: true, gatewayTransactionId: crypto.randomUUID() });
        } else {
          reject(new Error('Gateway timeout'));
        }
      }, Math.random() * 5000); // Random delay up to 5 seconds
    });
  }

  static async getTransactionStatus(transactionId) {
    const connection = await db.getConnection();
    
    try {
      // BUG: SQL injection vulnerability
      const query = \`SELECT * FROM transactions WHERE id = '\${transactionId}'\`;
      const [rows] = await connection.execute(query);
      
      if (rows.length === 0) {
        throw new Error('Transaction not found');
      }
      
      return rows[0];
    } finally {
      connection.release();
    }
  }

  static async processRefund(transactionId, amount, reason) {
    // BUG: No validation of refund eligibility
    const connection = await db.getConnection();
    
    try {
      const refundId = crypto.randomUUID();
      
      // BUG: Not checking if transaction exists or is refundable
      const query = \`
        INSERT INTO refunds (id, transaction_id, amount, reason, status, created_at)
        VALUES ('\${refundId}', '\${transactionId}', '\${amount}', '\${reason}', 'completed', NOW())
      \`;
      
      await connection.execute(query);
      
      return {
        refundId,
        status: 'completed',
        amount
      };
    } finally {
      connection.release();
    }
  }
}

module.exports = PaymentService;`
          },
          {
            path: 'src/middleware/validation.js',
            language: 'javascript',
            content: `const Joi = require('joi');

const paymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  cardNumber: Joi.string().creditCard().required(),
  expiryDate: Joi.string().pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/).required(),
  cvv: Joi.string().length(3).pattern(/^[0-9]+$/).required(),
  customerEmail: Joi.string().email().required()
});

const validatePayment = (req, res, next) => {
  const { error } = paymentSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map(detail => detail.message)
    });
  }
  
  next();
};

module.exports = {
  validatePayment
};`
          }
        ],
        dependencies: ['express', 'joi', 'mysql2', 'crypto'],
        environment: {
          type: 'backend-api',
          runtime: 'node',
          dependencies: ['express', 'joi', 'mysql2', 'crypto'],
          ports: [3001],
          database: {
            type: 'mysql',
            seedData: [
              {
                table: 'transactions',
                data: [
                  { id: 1, amount: 99.99, customer_email: 'test@example.com', status: 'completed' },
                  { id: 2, amount: 149.99, customer_email: 'user@example.com', status: 'pending' }
                ]
              }
            ]
          }
        }
      },
      testing: {
        testCases: [
          {
            id: 'be-001-tc-001',
            type: 'integration',
            description: 'Payment processing should handle valid requests',
            input: {
              method: 'POST',
              endpoint: '/api/payments/process',
              body: {
                amount: 99.99,
                cardNumber: '4111111111111111',
                expiryDate: '12/25',
                cvv: '123',
                customerEmail: 'test@example.com'
              }
            },
            expectedOutput: {
              status: 200,
              body: { transactionId: 'string', status: 'completed' }
            },
            validationRules: [
              {
                type: 'exact-match',
                criteria: { statusCode: 200, responseStructure: true },
                errorMessage: 'Payment processing should return 200 with transaction details'
              }
            ],
            metadata: { timeout: 10000, retries: 2, criticality: 'high' }
          },
          {
            id: 'be-001-tc-002',
            type: 'unit',
            description: 'Should prevent SQL injection attacks',
            input: {
              method: 'POST',
              endpoint: '/api/payments/process',
              body: {
                amount: "99.99'; DROP TABLE transactions; --",
                cardNumber: '4111111111111111',
                expiryDate: '12/25',
                cvv: '123',
                customerEmail: 'test@example.com'
              }
            },
            expectedOutput: {
              status: 400,
              body: { error: 'Validation failed' }
            },
            validationRules: [
              {
                type: 'exact-match',
                criteria: { statusCode: 400, securityValidation: true },
                errorMessage: 'Should reject malicious input and prevent SQL injection'
              }
            ],
            metadata: { timeout: 5000, retries: 1, criticality: 'high' }
          }
        ],
        validationRules: [
          {
            type: 'performance-threshold',
            criteria: { responseTime: 200, securityCompliance: true },
            errorMessage: 'API must be secure and performant'
          }
        ],
        performanceCriteria: {
          maxExecutionTime: 200,
          maxMemoryUsage: 100,
          minThroughput: 1000
        }
      },
      metadata: {
        estimatedTime: 60,
        realWorldContext: 'Payment systems are critical infrastructure that must handle high loads while maintaining security and compliance.',
        learningObjectives: [
          'API security best practices',
          'SQL injection prevention',
          'Error handling and logging',
          'Database transaction management',
          'PCI compliance requirements'
        ],
        tags: ['Node.js', 'Express', 'Security', 'Database', 'Payments'],
        rating: 4.8,
        completions: 734,
        xp: 150,
        teamSize: 'Team (4)',
        distractionTypes: ['High Documentation Changes', 'Medium Rate Limits', 'High Support Tickets'],
        focusRating: 3.6,
        popularity: 90
      }
    }
  ];

  // DSA Challenges
  static dsaChallenges: Challenge[] = [
    {
      id: 'dsa-001',
      title: 'Real-time Analytics Query Optimization',
      type: 'dsa',
      difficulty: 'Hard',
      timeLimit: '45 mins',
      distractionLevel: 'Medium',
      description: 'Dashboard queries are timing out during business hours. Optimize the data processing algorithm to handle 10M+ records efficiently.',
      scenario: {
        background: 'The executive dashboard is timing out during business hours when processing large datasets. Queries that should take seconds are taking minutes, causing delays in critical business decisions.',
        stakeholders: ['Data Team (Lead)', 'Business Intelligence (Manager)', 'Infrastructure (DevOps)', 'Executive Team (C-Suite)'],
        businessContext: 'Executive reports are delayed by 2+ hours, impacting strategic decision making. Real-time analytics are critical for competitive advantage.',
        constraints: ['Sub-second response time required', 'Handle 10M+ records', 'Memory usage <1GB', 'Must work with existing data structure']
      },
      implementation: {
        startingFiles: [
          {
            path: 'src/analytics.js',
            language: 'javascript',
            content: `/**
 * Real-time Analytics Query Optimization Challenge
 * 
 * Problem: The current implementation is too slow for large datasets.
 * You need to optimize the data processing to handle 10M+ records efficiently.
 * 
 * Requirements:
 * 1. Process user activity data in real-time
 * 2. Calculate metrics: daily active users, conversion rates, revenue trends
 * 3. Support filtering by date range, user segments, and product categories
 * 4. Response time must be <1 second for queries on 10M+ records
 * 5. Memory usage must stay under 1GB
 */

class AnalyticsEngine {
  constructor() {
    this.data = [];
    this.indexes = new Map();
  }

  // Load data (this simulates loading from database)
  loadData(records) {
    this.data = records;
    // TODO: Build efficient indexes for fast querying
    this.buildIndexes();
  }

  // OPTIMIZE: This method is too slow for large datasets
  buildIndexes() {
    // Current implementation: O(n) for each query - too slow!
    // Need to build proper indexes for fast lookups
    console.log('Building indexes for', this.data.length, 'records');
  }

  // OPTIMIZE: Calculate Daily Active Users - currently O(n) per query
  getDailyActiveUsers(startDate, endDate) {
    const result = new Map();
    
    // Inefficient: scanning all records for each query
    for (const record of this.data) {
      const date = new Date(record.timestamp).toDateString();
      if (this.isDateInRange(date, startDate, endDate)) {
        if (!result.has(date)) {
          result.set(date, new Set());
        }
        result.get(date).add(record.userId);
      }
    }
    
    // Convert to final format
    const dailyUsers = {};
    for (const [date, users] of result) {
      dailyUsers[date] = users.size;
    }
    
    return dailyUsers;
  }

  // OPTIMIZE: Calculate conversion rates - currently very inefficient
  getConversionRates(startDate, endDate, segment = null) {
    let totalUsers = 0;
    let convertedUsers = 0;
    
    // Inefficient: multiple passes through data
    for (const record of this.data) {
      if (this.isDateInRange(record.timestamp, startDate, endDate)) {
        if (!segment || record.segment === segment) {
          totalUsers++;
          if (record.action === 'purchase') {
            convertedUsers++;
          }
        }
      }
    }
    
    return totalUsers > 0 ? (convertedUsers / totalUsers) * 100 : 0;
  }

  // OPTIMIZE: Revenue trends calculation - needs optimization
  getRevenueTrends(startDate, endDate, groupBy = 'day') {
    const revenue = new Map();
    
    // Inefficient: scanning all records
    for (const record of this.data) {
      if (record.action === 'purchase' && 
          this.isDateInRange(record.timestamp, startDate, endDate)) {
        
        const key = this.getTimeKey(record.timestamp, groupBy);
        revenue.set(key, (revenue.get(key) || 0) + record.amount);
      }
    }
    
    return Object.fromEntries(revenue);
  }

  // OPTIMIZE: User segmentation analysis
  getUserSegmentAnalysis(startDate, endDate) {
    const segments = new Map();
    
    // Inefficient: multiple iterations
    for (const record of this.data) {
      if (this.isDateInRange(record.timestamp, startDate, endDate)) {
        const segment = record.segment || 'unknown';
        if (!segments.has(segment)) {
          segments.set(segment, {
            users: new Set(),
            revenue: 0,
            actions: 0
          });
        }
        
        const segmentData = segments.get(segment);
        segmentData.users.add(record.userId);
        segmentData.actions++;
        if (record.amount) {
          segmentData.revenue += record.amount;
        }
      }
    }
    
    // Convert to final format
    const result = {};
    for (const [segment, data] of segments) {
      result[segment] = {
        userCount: data.users.size,
        totalRevenue: data.revenue,
        totalActions: data.actions,
        avgRevenuePerUser: data.users.size > 0 ? data.revenue / data.users.size : 0
      };
    }
    
    return result;
  }

  // Helper methods
  isDateInRange(timestamp, startDate, endDate) {
    const date = new Date(timestamp);
    return date >= new Date(startDate) && date <= new Date(endDate);
  }

  getTimeKey(timestamp, groupBy) {
    const date = new Date(timestamp);
    switch (groupBy) {
      case 'hour':
        return \`\${date.getFullYear()}-\${date.getMonth() + 1}-\${date.getDate()}-\${date.getHours()}\`;
      case 'day':
        return \`\${date.getFullYear()}-\${date.getMonth() + 1}-\${date.getDate()}\`;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return \`\${weekStart.getFullYear()}-W\${Math.ceil(weekStart.getDate() / 7)}\`;
      case 'month':
        return \`\${date.getFullYear()}-\${date.getMonth() + 1}\`;
      default:
        return date.toDateString();
    }
  }
}

// Test data generator (simulates real user activity data)
function generateTestData(recordCount = 1000000) {
  const data = [];
  const userIds = Array.from({length: recordCount / 100}, (_, i) => \`user_\${i}\`);
  const segments = ['premium', 'standard', 'trial', 'enterprise'];
  const actions = ['view', 'click', 'purchase', 'signup', 'login'];
  
  for (let i = 0; i < recordCount; i++) {
    const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days
    data.push({
      id: i,
      userId: userIds[Math.floor(Math.random() * userIds.length)],
      timestamp: timestamp.toISOString(),
      action: actions[Math.floor(Math.random() * actions.length)],
      segment: segments[Math.floor(Math.random() * segments.length)],
      amount: Math.random() > 0.8 ? Math.round(Math.random() * 1000 * 100) / 100 : 0,
      productId: \`product_\${Math.floor(Math.random() * 1000)}\`,
      sessionId: \`session_\${Math.floor(Math.random() * 100000)}\`
    });
  }
  
  return data;
}

// Performance testing function
function runPerformanceTest() {
  console.log('Starting performance test...');
  
  const engine = new AnalyticsEngine();
  const testData = generateTestData(1000000); // 1M records for testing
  
  console.time('Data Loading');
  engine.loadData(testData);
  console.timeEnd('Data Loading');
  
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
  const endDate = new Date();
  
  console.time('Daily Active Users Query');
  const dau = engine.getDailyActiveUsers(startDate, endDate);
  console.timeEnd('Daily Active Users Query');
  
  console.time('Conversion Rates Query');
  const conversion = engine.getConversionRates(startDate, endDate);
  console.timeEnd('Conversion Rates Query');
  
  console.time('Revenue Trends Query');
  const revenue = engine.getRevenueTrends(startDate, endDate);
  console.timeEnd('Revenue Trends Query');
  
  console.time('User Segment Analysis');
  const segments = engine.getUserSegmentAnalysis(startDate, endDate);
  console.timeEnd('User Segment Analysis');
  
  console.log('Performance test completed');
  return { dau, conversion, revenue, segments };
}

module.exports = { AnalyticsEngine, generateTestData, runPerformanceTest };`
          }
        ],
        dependencies: [],
        environment: {
          type: 'dsa',
          runtime: 'node',
          dependencies: [],
          ports: []
        }
      },
      testing: {
        testCases: [
          {
            id: 'dsa-001-tc-001',
            type: 'performance',
            description: 'Should process 1M records in under 1 second',
            input: { recordCount: 1000000, queryType: 'dailyActiveUsers' },
            expectedOutput: { executionTime: '<1000ms', memoryUsage: '<1GB' },
            validationRules: [
              {
                type: 'performance-threshold',
                criteria: { maxTime: 1000, maxMemory: 1024 },
                errorMessage: 'Query execution must complete within 1 second'
              }
            ],
            metadata: { timeout: 5000, retries: 3, criticality: 'high' }
          },
          {
            id: 'dsa-001-tc-002',
            type: 'unit',
            description: 'Should correctly calculate daily active users',
            input: {
              records: [
                { userId: 'user1', timestamp: '2024-01-01T10:00:00Z', action: 'login' },
                { userId: 'user1', timestamp: '2024-01-01T11:00:00Z', action: 'view' },
                { userId: 'user2', timestamp: '2024-01-01T12:00:00Z', action: 'login' },
                { userId: 'user1', timestamp: '2024-01-02T10:00:00Z', action: 'login' }
              ],
              startDate: '2024-01-01',
              endDate: '2024-01-02'
            },
            expectedOutput: {
              '2024-01-01': 2,
              '2024-01-02': 1
            },
            validationRules: [
              {
                type: 'exact-match',
                criteria: { correctCounting: true, dateGrouping: true },
                errorMessage: 'Daily active users calculation is incorrect'
              }
            ],
            metadata: { timeout: 1000, retries: 1, criticality: 'high' }
          }
        ],
        validationRules: [
          {
            type: 'performance-threshold',
            criteria: { timeComplexity: 'O(log n)', spaceComplexity: 'O(n)' },
            errorMessage: 'Algorithm must be optimized for large datasets'
          }
        ],
        performanceCriteria: {
          maxExecutionTime: 1000,
          maxMemoryUsage: 1024,
          minThroughput: 1000000
        }
      },
      metadata: {
        estimatedTime: 45,
        realWorldContext: 'Real-time analytics systems must process massive datasets efficiently to provide business insights without delays.',
        learningObjectives: [
          'Algorithm optimization techniques',
          'Data structure selection for performance',
          'Time and space complexity analysis',
          'Indexing strategies for fast queries',
          'Memory-efficient data processing'
        ],
        tags: ['Algorithms', 'Performance', 'Data Structures', 'Analytics', 'Optimization'],
        rating: 4.7,
        completions: 623,
        xp: 180,
        teamSize: 'Solo',
        distractionTypes: ['Medium Personal Calls', 'Low Office Noise', 'Medium Social Media'],
        focusRating: 4.0,
        popularity: 78
      }
    }
  ];

  // Get all challenges
  static getAllChallenges(): Challenge[] {
    return [
      ...this.frontendChallenges,
      ...this.backendChallenges,
      ...this.dsaChallenges
    ];
  }

  // Get challenges by type
  static getChallengesByType(type: ChallengeType): Challenge[] {
    switch (type) {
      case 'frontend':
        return this.frontendChallenges;
      case 'backend-api':
        return this.backendChallenges;
      case 'dsa':
        return this.dsaChallenges;
      default:
        return [];
    }
  }

  // Get challenge by ID
  static getChallengeById(id: string): Challenge | undefined {
    return this.getAllChallenges().find(challenge => challenge.id === id);
  }

  // Get challenges by difficulty
  static getChallengesByDifficulty(difficulty: ChallengeDifficulty): Challenge[] {
    return this.getAllChallenges().filter(challenge => challenge.difficulty === difficulty);
  }

  // Get challenges by tags
  static getChallengesByTags(tags: string[]): Challenge[] {
    return this.getAllChallenges().filter(challenge =>
      tags.some(tag => challenge.metadata.tags.includes(tag))
    );
  }
}
