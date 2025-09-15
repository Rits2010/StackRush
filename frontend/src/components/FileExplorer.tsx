import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  File, 
  Folder, 
  FolderOpen,
  FileText,
  Code,
  Settings,
  Package,
  Image,
  Database
} from 'lucide-react';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  content?: string;
  language?: string;
  isReadOnly?: boolean;
}

interface FileExplorerProps {
  files: FileNode[];
  onFileSelect: (file: FileNode) => void;
  selectedFile?: string;
  className?: string;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  onFileSelect,
  selectedFile,
  className = ''
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/', '/src']));

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (fileName: string, isFolder: boolean, isOpen: boolean = false) => {
    if (isFolder) {
      return isOpen ? <FolderOpen className="w-4 h-4 text-blue-500" /> : <Folder className="w-4 h-4 text-blue-600" />;
    }

    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <Code className="w-4 h-4 text-yellow-500" />;
      case 'json':
        return <Settings className="w-4 h-4 text-green-500" />;
      case 'css':
      case 'scss':
      case 'sass':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'html':
        return <FileText className="w-4 h-4 text-orange-500" />;
      case 'md':
        return <FileText className="w-4 h-4 text-gray-600" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <Image className="w-4 h-4 text-purple-500" />;
      case 'sql':
        return <Database className="w-4 h-4 text-blue-600" />;
      default:
        if (fileName === 'package.json') {
          return <Package className="w-4 h-4 text-red-500" />;
        }
        return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderFileNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFile === node.path;
    const paddingLeft = depth * 16 + 8;

    return (
      <div key={node.path}>
        <div
          className={`flex items-center gap-2 py-1 px-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
            isSelected ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
          }`}
          style={{ paddingLeft }}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(node.path);
            } else {
              onFileSelect(node);
            }
          }}
        >
          {node.type === 'folder' && (
            <div className="w-4 h-4 flex items-center justify-center">
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-gray-500" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-500" />
              )}
            </div>
          )}
          
          {node.type === 'file' && <div className="w-4" />}
          
          {getFileIcon(node.name, node.type === 'folder', isExpanded)}
          
          <span className="text-sm font-medium truncate">
            {node.name}
          </span>
          
          {node.isReadOnly && (
            <span className="ml-auto text-xs text-gray-500 bg-gray-200 dark:bg-gray-600 px-1 rounded">
              readonly
            </span>
          )}
        </div>
        
        {node.type === 'folder' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderFileNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Project Files</h3>
      </div>
      <div className="overflow-y-auto">
        {files.map(file => renderFileNode(file))}
      </div>
    </div>
  );
};

// Helper function to create project structure based on actual challenge data
export const createChallengeProjectStructure = (challengeData: any): FileNode[] => {
  const category = challengeData.category?.toLowerCase();
  const starterCode = challengeData.code?.starterCode?.javascript || '// Starter code not available';
  
  if (category === 'backend') {
    return [
      {
        name: 'src',
        type: 'folder',
        path: '/src',
        children: [
          {
            name: 'controllers',
            type: 'folder',
            path: '/src/controllers',
            children: [
              {
                name: 'paymentController.js',
                type: 'file',
                path: '/src/controllers/paymentController.js',
                language: 'javascript',
                content: starterCode
              }
            ]
          },
          {
            name: 'models',
            type: 'folder',
            path: '/src/models',
            children: [
              {
                name: 'Payment.js',
                type: 'file',
                path: '/src/models/Payment.js',
                language: 'javascript',
                content: `const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['card', 'bank', 'wallet']
  },
  customerInfo: {
    email: String,
    name: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Payment', paymentSchema);`
              }
            ]
          },
          {
            name: 'services',
            type: 'folder',
            path: '/src/services',
            children: [
              {
                name: 'paymentService.js',
                type: 'file',
                path: '/src/services/paymentService.js',
                language: 'javascript',
                content: `// Payment service for external API calls
class PaymentService {
  async processPayment(paymentData) {
    // Simulate external payment processor
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          resolve({
            id: 'pay_' + Math.random().toString(36).substr(2, 9),
            status: 'completed',
            transactionId: 'txn_' + Date.now()
          });
        } else {
          reject(new Error('Payment processor unavailable'));
        }
      }, 1000);
    });
  }
}

module.exports = new PaymentService();`
              }
            ]
          },
          {
            name: 'app.js',
            type: 'file',
            path: '/src/app.js',
            language: 'javascript',
            content: `const express = require('express');
const { connectDB, processPayment } = require('./controllers/paymentController');

const app = express();

// Middleware
app.use(express.json());

// Connect to database
connectDB();

// Routes
app.post('/api/payments/process', processPayment);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});

module.exports = app;`
          }
        ]
      },
      {
        name: 'tests',
        type: 'folder',
        path: '/tests',
        children: [
          {
            name: 'payment.test.js',
            type: 'file',
            path: '/tests/payment.test.js',
            language: 'javascript',
            content: `const request = require('supertest');
const app = require('../src/app');

describe('Payment API', () => {
  test('should process valid payment', async () => {
    const paymentData = {
      amount: 99.99,
      currency: 'USD',
      paymentMethod: 'card',
      customerInfo: {
        email: 'test@example.com',
        name: 'Test User'
      }
    };

    const response = await request(app)
      .post('/api/payments/process')
      .send(paymentData)
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body.status).toBe('completed');
  });

  test('should handle invalid payment data', async () => {
    const invalidData = {
      amount: -10, // Invalid amount
      currency: 'USD'
    };

    await request(app)
      .post('/api/payments/process')
      .send(invalidData)
      .expect(400);
  });
});`,
            isReadOnly: true
          }
        ]
      },
      {
        name: 'package.json',
        type: 'file',
        path: '/package.json',
        language: 'json',
        content: JSON.stringify({
          name: 'payment-processing-system',
          version: '1.0.0',
          description: challengeData.description,
          main: 'src/app.js',
          scripts: {
            start: 'node src/app.js',
            dev: 'nodemon src/app.js',
            test: 'jest'
          },
          dependencies: {
            express: '^4.18.0',
            mongoose: '^7.0.0'
          },
          devDependencies: {
            jest: '^29.0.0',
            supertest: '^6.0.0',
            nodemon: '^2.0.0'
          }
        }, null, 2),
        isReadOnly: true
      },
      {
        name: 'README.md',
        type: 'file',
        path: '/README.md',
        language: 'markdown',
        content: `# ${challengeData.title}

${challengeData.description}

## Problem Statement
${challengeData.content?.problemStatement || 'Fix the payment processing system issues.'}

## Constraints
${challengeData.content?.constraints || 'Handle high load and maintain PCI compliance.'}

## Getting Started
\`\`\`bash
npm install
npm start
\`\`\`

## Testing
\`\`\`bash
npm test
\`\`\``,
        isReadOnly: true
      }
    ];
  } else if (category === 'frontend') {
    return [
      {
        name: 'src',
        type: 'folder',
        path: '/src',
        children: [
          {
            name: 'components',
            type: 'folder',
            path: '/src/components',
            children: [
              {
                name: 'ProductGallery.jsx',
                type: 'file',
                path: '/src/components/ProductGallery.jsx',
                language: 'javascript',
                content: starterCode
              }
            ]
          },
          {
            name: 'styles',
            type: 'folder',
            path: '/src/styles',
            children: [
              {
                name: 'ProductGallery.css',
                type: 'file',
                path: '/src/styles/ProductGallery.css',
                language: 'css',
                content: `/* Product Gallery Styles - NEEDS FIXING FOR MOBILE */
.product-gallery {
  padding: 20px;
}

.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.filter-btn.active {
  background: #007bff;
  color: white;
}

/* BROKEN: This grid doesn't work on mobile */
.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* Fixed columns - breaks on mobile */
  gap: 20px;
}

.product-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.product-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  /* TODO: Add lazy loading */
}

.product-info h3 {
  margin: 10px 0 5px;
  font-size: 16px;
}

.price {
  font-weight: bold;
  color: #007bff;
  margin-bottom: 10px;
}

.add-to-cart {
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

/* TODO: Add responsive breakpoints */`
              }
            ]
          },
          {
            name: 'App.jsx',
            type: 'file',
            path: '/src/App.jsx',
            language: 'javascript',
            content: `import React from 'react';
import ProductGallery from './components/ProductGallery';
import './styles/ProductGallery.css';

function App() {
  return (
    <div className="App">
      <header>
        <h1>E-commerce Product Gallery</h1>
        <p>Black Friday Sale - Fix the mobile layout!</p>
      </header>
      <main>
        <ProductGallery />
      </main>
    </div>
  );
}

export default App;`
          }
        ]
      },
      {
        name: 'public',
        type: 'folder',
        path: '/public',
        children: [
          {
            name: 'index.html',
            type: 'file',
            path: '/public/index.html',
            language: 'html',
            content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${challengeData.title}</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>`,
            isReadOnly: true
          }
        ]
      },
      {
        name: 'package.json',
        type: 'file',
        path: '/package.json',
        language: 'json',
        content: JSON.stringify({
          name: 'ecommerce-gallery-challenge',
          version: '1.0.0',
          description: challengeData.description,
          dependencies: {
            'react': '^18.0.0',
            'react-dom': '^18.0.0',
            'react-scripts': '^5.0.0'
          },
          scripts: {
            start: 'react-scripts start',
            build: 'react-scripts build',
            test: 'react-scripts test'
          }
        }, null, 2),
        isReadOnly: true
      }
    ];
  } else {
    // DSA challenge
    return [
      {
        name: 'src',
        type: 'folder',
        path: '/src',
        children: [
          {
            name: 'solution.js',
            type: 'file',
            path: '/src/solution.js',
            language: 'javascript',
            content: starterCode
          }
        ]
      },
      {
        name: 'tests',
        type: 'folder',
        path: '/tests',
        children: [
          {
            name: 'solution.test.js',
            type: 'file',
            path: '/tests/solution.test.js',
            language: 'javascript',
            content: `// Test cases for the algorithm
const solution = require('../src/solution');

describe('Algorithm Tests', () => {
  test('should handle basic case', () => {
    // Test implementation based on challenge
    expect(solution([1, 2, 3], 5)).toBeDefined();
  });
  
  test('should handle edge cases', () => {
    expect(solution([], 0)).toBeDefined();
  });
});`,
            isReadOnly: true
          }
        ]
      }
    ];
  }
};

// Helper function to create default project structure
export const createDefaultProjectStructure = (challengeType: string): FileNode[] => {
  if (challengeType === 'frontend') {
    return [
      {
        name: 'src',
        type: 'folder',
        path: '/src',
        children: [
          {
            name: 'components',
            type: 'folder',
            path: '/src/components',
            children: [
              {
                name: 'ProductGallery.jsx',
                type: 'file',
                path: '/src/components/ProductGallery.jsx',
                language: 'javascript',
                content: '// Main component file'
              }
            ]
          },
          {
            name: 'styles',
            type: 'folder',
            path: '/src/styles',
            children: [
              {
                name: 'ProductGallery.css',
                type: 'file',
                path: '/src/styles/ProductGallery.css',
                language: 'css',
                content: '/* Component styles */'
              }
            ]
          },
          {
            name: 'App.jsx',
            type: 'file',
            path: '/src/App.jsx',
            language: 'javascript',
            content: '// Main App component'
          },
          {
            name: 'index.js',
            type: 'file',
            path: '/src/index.js',
            language: 'javascript',
            content: '// Entry point'
          }
        ]
      },
      {
        name: 'public',
        type: 'folder',
        path: '/public',
        children: [
          {
            name: 'index.html',
            type: 'file',
            path: '/public/index.html',
            language: 'html',
            content: '<!DOCTYPE html>...',
            isReadOnly: true
          }
        ]
      },
      {
        name: 'package.json',
        type: 'file',
        path: '/package.json',
        language: 'json',
        content: JSON.stringify({
          name: 'ecommerce-gallery',
          version: '1.0.0',
          dependencies: {
            'react': '^18.0.0',
            'react-dom': '^18.0.0'
          }
        }, null, 2),
        isReadOnly: true
      },
      {
        name: 'README.md',
        type: 'file',
        path: '/README.md',
        language: 'markdown',
        content: '# E-commerce Product Gallery\n\nFix the responsive layout and implement lazy loading.',
        isReadOnly: true
      }
    ];
  } else if (challengeType === 'backend') {
    return [
      {
        name: 'src',
        type: 'folder',
        path: '/src',
        children: [
          {
            name: 'controllers',
            type: 'folder',
            path: '/src/controllers',
            children: [
              {
                name: 'paymentController.js',
                type: 'file',
                path: '/src/controllers/paymentController.js',
                language: 'javascript',
                content: '// Payment controller'
              }
            ]
          },
          {
            name: 'models',
            type: 'folder',
            path: '/src/models',
            children: [
              {
                name: 'Payment.js',
                type: 'file',
                path: '/src/models/Payment.js',
                language: 'javascript',
                content: '// Payment model'
              }
            ]
          },
          {
            name: 'routes',
            type: 'folder',
            path: '/src/routes',
            children: [
              {
                name: 'payments.js',
                type: 'file',
                path: '/src/routes/payments.js',
                language: 'javascript',
                content: '// Payment routes'
              }
            ]
          },
          {
            name: 'app.js',
            type: 'file',
            path: '/src/app.js',
            language: 'javascript',
            content: '// Express app setup'
          }
        ]
      },
      {
        name: 'tests',
        type: 'folder',
        path: '/tests',
        children: [
          {
            name: 'payment.test.js',
            type: 'file',
            path: '/tests/payment.test.js',
            language: 'javascript',
            content: '// Payment API tests',
            isReadOnly: true
          }
        ]
      },
      {
        name: 'package.json',
        type: 'file',
        path: '/package.json',
        language: 'json',
        content: JSON.stringify({
          name: 'payment-api',
          version: '1.0.0',
          dependencies: {
            'express': '^4.18.0',
            'mongoose': '^7.0.0'
          }
        }, null, 2),
        isReadOnly: true
      }
    ];
  } else {
    // DSA challenge
    return [
      {
        name: 'src',
        type: 'folder',
        path: '/src',
        children: [
          {
            name: 'solution.js',
            type: 'file',
            path: '/src/solution.js',
            language: 'javascript',
            content: '// Your solution here'
          }
        ]
      },
      {
        name: 'tests',
        type: 'folder',
        path: '/tests',
        children: [
          {
            name: 'solution.test.js',
            type: 'file',
            path: '/tests/solution.test.js',
            language: 'javascript',
            content: '// Test cases',
            isReadOnly: true
          }
        ]
      },
      {
        name: 'README.md',
        type: 'file',
        path: '/README.md',
        language: 'markdown',
        content: '# Algorithm Challenge\n\nImplement the required algorithm.',
        isReadOnly: true
      }
    ];
  }
};