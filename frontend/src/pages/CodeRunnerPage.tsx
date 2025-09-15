import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Download, Github, ExternalLink, 
  Copy, Eye, Code, Terminal, Loader2, CheckCircle2, 
  AlertCircle, RefreshCw, Maximize2, Minimize2, Play, X
} from 'lucide-react';
import { ProfessionalButton } from '../components/ui/ProfessionalButton';
import { useWebContainer } from '../hooks/useWebContainer';
import { IDELayout } from '../components/IDELayout';

interface CodeRunnerState {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  title: string;
  language: string;
}

// Template generation functions
const getTemplateCode = (templateId: string): CodeRunnerState => {
  const templates: Record<string, CodeRunnerState> = {
    '1': {
      title: 'Modern React Dashboard',
      htmlCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>React Dashboard</title>\n  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>\n  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>\n</head>\n<body>\n  <div id="root"></div>\n</body>\n</html>',
      cssCode: '.dashboard { padding: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }\n.card { background: white; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }',
      jsCode: 'const Dashboard = () => {\n  const [data, setData] = React.useState({ users: 1247, revenue: 45690 });\n  return React.createElement("div", { className: "dashboard" },\n    React.createElement("h1", null, "Dashboard"),\n    React.createElement("div", { className: "card" }, `Users: ${data.users}`)\n  );\n};\nReactDOM.render(React.createElement(Dashboard), document.getElementById("root"));',
      language: 'react'
    },
    '2': {
      title: 'Next.js E-commerce Starter',
      htmlCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>E-commerce Store</title>\n</head>\n<body>\n  <div id="app"></div>\n</body>\n</html>',
      cssCode: '.store { max-width: 1200px; margin: 0 auto; padding: 2rem; }\n.product-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }\n.product-card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; }',
      jsCode: 'const products = [{ id: 1, name: "Product 1", price: "$29.99" }];\nconst Store = () => {\n  return `<div class="store">\n    <h1>My Store</h1>\n    <div class="product-grid">\n      ${products.map(p => `<div class="product-card">${p.name} - ${p.price}</div>`).join("")}\n    </div>\n  </div>`;\n};\ndocument.getElementById("app").innerHTML = Store();',
      language: 'javascript'
    }
  };
  return templates[templateId] || getFrameworkTemplate('React');
};

const getFrameworkTemplate = (framework: string): CodeRunnerState => {
  const templates: Record<string, CodeRunnerState> = {
    'React': {
      title: 'React App',
      htmlCode: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>React App</title>\n  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>\n  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>\n</head>\n<body>\n  <div id="root"></div>\n</body>\n</html>',
      cssCode: 'body {\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;\n  margin: 0;\n  padding: 20px;\n  background: #f5f5f5;\n}\n\n.app {\n  max-width: 800px;\n  margin: 0 auto;\n  padding: 2rem;\n  background: white;\n  border-radius: 8px;\n  box-shadow: 0 2px 10px rgba(0,0,0,0.1);\n}\n\n.counter {\n  text-align: center;\n}\n\nbutton {\n  background: #007bff;\n  color: white;\n  border: none;\n  padding: 10px 20px;\n  margin: 0 5px;\n  border-radius: 4px;\n  cursor: pointer;\n}\n\nbutton:hover {\n  background: #0056b3;\n}',
      jsCode: 'const { useState } = React;\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n\n  return React.createElement("div", { className: "counter" },\n    React.createElement("h1", null, "React Counter"),\n    React.createElement("p", null, `Count: ${count}`),\n    React.createElement("div", null,\n      React.createElement("button", {\n        onClick: () => setCount(count - 1)\n      }, "-"),\n      React.createElement("button", {\n        onClick: () => setCount(count + 1)\n      }, "+")\n    )\n  );\n}\n\nfunction App() {\n  return React.createElement("div", { className: "app" },\n    React.createElement("h1", null, "Welcome to React!"),\n    React.createElement(Counter)\n  );\n}\n\nReactDOM.render(React.createElement(App), document.getElementById("root"));',
      language: 'react'
    },
    'Next.js': {
      title: 'Next.js App',
      htmlCode: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Next.js Style App</title>\n</head>\n<body>\n  <div id="app"></div>\n</body>\n</html>',
      cssCode: '* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: "Inter", sans-serif;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  min-height: 100vh;\n}\n\n.container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 2rem;\n}\n\n.hero {\n  text-align: center;\n  color: white;\n  margin-bottom: 3rem;\n}\n\n.hero h1 {\n  font-size: 3rem;\n  margin-bottom: 1rem;\n}\n\n.features {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  gap: 2rem;\n}\n\n.feature-card {\n  background: white;\n  padding: 2rem;\n  border-radius: 12px;\n  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\n  transition: transform 0.2s;\n}\n\n.feature-card:hover {\n  transform: translateY(-4px);\n}',
      jsCode: 'const features = [\n  { title: "Fast Refresh", description: "Instant feedback for your changes" },\n  { title: "Zero Config", description: "Automatic compilation and bundling" },\n  { title: "Hybrid Rendering", description: "SSG and SSR out of the box" }\n];\n\nfunction FeatureCard({ title, description }) {\n  return `\n    <div class="feature-card">\n      <h3>${title}</h3>\n      <p>${description}</p>\n    </div>\n  `;\n}\n\nfunction App() {\n  return `\n    <div class="container">\n      <div class="hero">\n        <h1>Welcome to Next.js</h1>\n        <p>The React Framework for Production</p>\n      </div>\n      <div class="features">\n        ${features.map(feature => FeatureCard(feature)).join("")}\n      </div>\n    </div>\n  `;\n}\n\ndocument.getElementById("app").innerHTML = App();',
      language: 'javascript'
    },
    'Node.js': {
      title: 'Node.js API Server',
      htmlCode: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Node.js API Demo</title>\n</head>\n<body>\n  <div id="app">\n    <h1>Node.js API Server</h1>\n    <div id="api-demo">\n      <h2>API Endpoints:</h2>\n      <ul>\n        <li>GET /api/users - Get all users</li>\n        <li>GET /api/health - Health check</li>\n        <li>POST /api/users - Create user</li>\n      </ul>\n    </div>\n    <div id="output"></div>\n  </div>\n</body>\n</html>',
      cssCode: 'body {\n  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;\n  background: #1e1e1e;\n  color: #d4d4d4;\n  padding: 20px;\n  line-height: 1.6;\n}\n\n#app {\n  max-width: 800px;\n  margin: 0 auto;\n}\n\nh1 {\n  color: #569cd6;\n  border-bottom: 2px solid #569cd6;\n  padding-bottom: 10px;\n}\n\n#api-demo {\n  background: #2d2d30;\n  padding: 20px;\n  border-radius: 8px;\n  margin: 20px 0;\n}\n\nul {\n  list-style: none;\n  padding: 0;\n}\n\nli {\n  background: #3c3c3c;\n  margin: 10px 0;\n  padding: 10px;\n  border-radius: 4px;\n  border-left: 4px solid #4ec9b0;\n}\n\n#output {\n  background: #0f0f0f;\n  padding: 15px;\n  border-radius: 4px;\n  border: 1px solid #333;\n  white-space: pre-wrap;\n  font-family: monospace;\n}',
      jsCode: '// Node.js Express Server Simulation\n\nconst express = {\n  Router: () => ({\n    get: (path, handler) => console.log(`GET ${path} route registered`),\n    post: (path, handler) => console.log(`POST ${path} route registered`)\n  })\n};\n\n// Mock database\nconst users = [\n  { id: 1, name: "John Doe", email: "john@example.com" },\n  { id: 2, name: "Jane Smith", email: "jane@example.com" }\n];\n\n// API Routes\nfunction setupRoutes() {\n  const router = express.Router();\n  \n  // GET /api/users\n  router.get("/api/users", (req, res) => {\n    return { status: 200, data: users };\n  });\n  \n  // GET /api/health\n  router.get("/api/health", (req, res) => {\n    return { status: 200, message: "Server is healthy" };\n  });\n  \n  // POST /api/users\n  router.post("/api/users", (req, res) => {\n    const newUser = { id: users.length + 1, ...req.body };\n    users.push(newUser);\n    return { status: 201, data: newUser };\n  });\n  \n  return router;\n}\n\n// Server startup\nfunction startServer() {\n  const router = setupRoutes();\n  \n  console.log("🚀 Node.js Server Started");\n  console.log("📍 Server running on http://localhost:3000");\n  console.log("\n📋 Available Routes:");\n  console.log("GET  /api/users");\n  console.log("GET  /api/health");\n  console.log("POST /api/users");\n  \n  // Simulate API responses\n  console.log("\n🧪 Testing API endpoints:");\n  \n  setTimeout(() => {\n    console.log("\n→ GET /api/users");\n    console.log(JSON.stringify({ status: 200, data: users }, null, 2));\n  }, 1000);\n  \n  setTimeout(() => {\n    console.log("\n→ GET /api/health");\n    console.log(JSON.stringify({ status: 200, message: "Server is healthy" }, null, 2));\n  }, 2000);\n}\n\n// Start the server\nstartServer();\n\n// Update output in the page\nsetTimeout(() => {\n  const output = document.getElementById("output");\n  if (output) {\n    output.textContent = `Server Status: Running\nUsers in database: ${users.length}\nLast updated: ${new Date().toLocaleTimeString()}`;\n  }\n}, 500);',
      language: 'javascript'
    },
    'Vue': {
      title: 'Vue.js App',
      htmlCode: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Vue.js App</title>\n  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>\n</head>\n<body>\n  <div id="app"></div>\n</body>\n</html>',
      cssCode: 'body {\n  font-family: "Avenir", Helvetica, Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n  background: #f8f9fa;\n}\n\n.app {\n  max-width: 600px;\n  margin: 0 auto;\n  background: white;\n  padding: 2rem;\n  border-radius: 12px;\n  box-shadow: 0 2px 12px rgba(0,0,0,0.1);\n}\n\n.todo-item {\n  display: flex;\n  align-items: center;\n  padding: 10px;\n  border-bottom: 1px solid #eee;\n}\n\n.todo-item input[type="checkbox"] {\n  margin-right: 10px;\n}\n\n.completed {\n  text-decoration: line-through;\n  opacity: 0.6;\n}\n\ninput[type="text"] {\n  flex: 1;\n  padding: 10px;\n  border: 1px solid #ddd;\n  border-radius: 4px;\n  margin-right: 10px;\n}\n\nbutton {\n  background: #42b883;\n  color: white;\n  border: none;\n  padding: 10px 20px;\n  border-radius: 4px;\n  cursor: pointer;\n}\n\nbutton:hover {\n  background: #369870;\n}',
      jsCode: 'const { createApp, ref, computed } = Vue;\n\ncreateApp({\n  setup() {\n    const todos = ref([\n      { id: 1, text: "Learn Vue.js", completed: false },\n      { id: 2, text: "Build awesome apps", completed: false }\n    ]);\n    \n    const newTodo = ref("");\n    \n    const addTodo = () => {\n      if (newTodo.value.trim()) {\n        todos.value.push({\n          id: Date.now(),\n          text: newTodo.value,\n          completed: false\n        });\n        newTodo.value = "";\n      }\n    };\n    \n    const toggleTodo = (id) => {\n      const todo = todos.value.find(t => t.id === id);\n      if (todo) {\n        todo.completed = !todo.completed;\n      }\n    };\n    \n    const completedCount = computed(() => {\n      return todos.value.filter(t => t.completed).length;\n    });\n    \n    return {\n      todos,\n      newTodo,\n      addTodo,\n      toggleTodo,\n      completedCount\n    };\n  },\n  \n  template: `\n    <div class="app">\n      <h1>Vue Todo App</h1>\n      \n      <div style="margin-bottom: 20px;">\n        <input \n          v-model="newTodo" \n          @keyup.enter="addTodo"\n          type="text" \n          placeholder="Add a new todo..."\n        >\n        <button @click="addTodo">Add</button>\n      </div>\n      \n      <div v-for="todo in todos" :key="todo.id" class="todo-item">\n        <input \n          type="checkbox" \n          :checked="todo.completed"\n          @change="toggleTodo(todo.id)"\n        >\n        <span :class="{ completed: todo.completed }">\n          {{ todo.text }}\n        </span>\n      </div>\n      \n      <p style="margin-top: 20px; color: #666;">\n        {{ completedCount }} of {{ todos.length }} completed\n      </p>\n    </div>\n  `\n}).mount("#app");',
      language: 'javascript'
    },
    'Vanilla JS': {
      title: 'Vanilla JavaScript App',
      htmlCode: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Vanilla JS App</title>\n</head>\n<body>\n  <div id="app">\n    <header>\n      <h1>Weather Dashboard</h1>\n    </header>\n    \n    <main>\n      <div class="weather-card">\n        <h2 id="city">New York</h2>\n        <div class="temperature">\n          <span id="temp">22</span>°C\n        </div>\n        <p id="description">Partly Cloudy</p>\n        <div class="details">\n          <div class="detail">\n            <span>Humidity</span>\n            <span id="humidity">65%</span>\n          </div>\n          <div class="detail">\n            <span>Wind</span>\n            <span id="wind">12 km/h</span>\n          </div>\n        </div>\n      </div>\n      \n      <button id="refreshBtn">Refresh Weather</button>\n    </main>\n  </div>\n</body>\n</html>',
      cssCode: 'body {\n  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;\n  margin: 0;\n  padding: 0;\n  background: linear-gradient(135deg, #74b9ff, #0984e3);\n  min-height: 100vh;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n#app {\n  text-align: center;\n  color: white;\n}\n\nheader h1 {\n  font-size: 2.5rem;\n  margin-bottom: 2rem;\n  text-shadow: 0 2px 4px rgba(0,0,0,0.3);\n}\n\n.weather-card {\n  background: rgba(255, 255, 255, 0.1);\n  backdrop-filter: blur(10px);\n  border-radius: 20px;\n  padding: 3rem;\n  margin: 2rem auto;\n  max-width: 400px;\n  border: 1px solid rgba(255, 255, 255, 0.2);\n}\n\n#city {\n  font-size: 1.8rem;\n  margin-bottom: 1rem;\n}\n\n.temperature {\n  font-size: 4rem;\n  font-weight: bold;\n  margin: 1rem 0;\n}\n\n#description {\n  font-size: 1.2rem;\n  opacity: 0.9;\n  margin-bottom: 2rem;\n}\n\n.details {\n  display: flex;\n  justify-content: space-around;\n  margin-top: 2rem;\n}\n\n.detail {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n}\n\n.detail span:first-child {\n  opacity: 0.8;\n  font-size: 0.9rem;\n}\n\n.detail span:last-child {\n  font-weight: bold;\n  font-size: 1.1rem;\n}\n\n#refreshBtn {\n  background: rgba(255, 255, 255, 0.2);\n  border: 1px solid rgba(255, 255, 255, 0.3);\n  color: white;\n  padding: 12px 30px;\n  border-radius: 25px;\n  font-size: 1rem;\n  cursor: pointer;\n  transition: all 0.3s ease;\n}\n\n#refreshBtn:hover {\n  background: rgba(255, 255, 255, 0.3);\n  transform: translateY(-2px);\n}',
      jsCode: '// Weather data simulation\nconst cities = ["New York", "London", "Tokyo", "Paris", "Sydney"];\nconst descriptions = ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Clear"];\n\nclass WeatherApp {\n  constructor() {\n    this.init();\n  }\n  \n  init() {\n    this.bindEvents();\n    this.updateWeather();\n    this.startAutoRefresh();\n  }\n  \n  bindEvents() {\n    const refreshBtn = document.getElementById("refreshBtn");\n    refreshBtn.addEventListener("click", () => this.updateWeather());\n  }\n  \n  generateRandomWeather() {\n    return {\n      city: cities[Math.floor(Math.random() * cities.length)],\n      temperature: Math.floor(Math.random() * 30) + 5,\n      description: descriptions[Math.floor(Math.random() * descriptions.length)],\n      humidity: Math.floor(Math.random() * 40) + 40,\n      wind: Math.floor(Math.random() * 20) + 5\n    };\n  }\n  \n  updateWeather() {\n    const weather = this.generateRandomWeather();\n    \n    // Add loading animation\n    this.showLoading();\n    \n    setTimeout(() => {\n      document.getElementById("city").textContent = weather.city;\n      document.getElementById("temp").textContent = weather.temperature;\n      document.getElementById("description").textContent = weather.description;\n      document.getElementById("humidity").textContent = weather.humidity + "%";\n      document.getElementById("wind").textContent = weather.wind + " km/h";\n      \n      this.hideLoading();\n    }, 800);\n  }\n  \n  showLoading() {\n    const card = document.querySelector(".weather-card");\n    card.style.opacity = "0.6";\n    \n    const refreshBtn = document.getElementById("refreshBtn");\n    refreshBtn.textContent = "Loading...";\n    refreshBtn.disabled = true;\n  }\n  \n  hideLoading() {\n    const card = document.querySelector(".weather-card");\n    card.style.opacity = "1";\n    \n    const refreshBtn = document.getElementById("refreshBtn");\n    refreshBtn.textContent = "Refresh Weather";\n    refreshBtn.disabled = false;\n  }\n  \n  startAutoRefresh() {\n    setInterval(() => {\n      this.updateWeather();\n    }, 30000); // Auto refresh every 30 seconds\n  }\n}\n\n// Initialize the app when DOM is loaded\ndocument.addEventListener("DOMContentLoaded", () => {\n  new WeatherApp();\n});\n\n// Initialize immediately if DOM is already loaded\nif (document.readyState === "loading") {\n  document.addEventListener("DOMContentLoaded", () => new WeatherApp());\n} else {\n  new WeatherApp();\n}',
      language: 'javascript'
    }
  };
  return templates[framework] || templates['React'];
};

const CodeRunnerPage = () => {
  const { postId, templateId } = useParams<{ postId: string; templateId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [currentCode, setCurrentCode] = useState('');
  const [showCommandModal, setShowCommandModal] = useState(false);
  
  // Get framework from URL params for "Start from Scratch"
  const framework = searchParams.get('framework');
  
  // Get code from location state, template, or initialize with defaults
  const [codeState] = useState<CodeRunnerState>(() => {
    const state = location.state as CodeRunnerState;
    
    // If coming from a template URL
    if (templateId) {
      return getTemplateCode(templateId);
    }
    
    // If starting from scratch with a framework
    if (framework) {
      return getFrameworkTemplate(framework);
    }
    
    // Default or from location state
    return state || {
      htmlCode: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Code Runner</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>',
      cssCode: '/* Add your styles here */\nbody {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n}',
      jsCode: '// Add your JavaScript here\nconsole.log("Hello from Code Runner!");',
      title: 'Code Runner',
      language: 'html'
    };
  });

  const {
    createFrontendProject,
    isBuilding,
    previewUrl,
    error: webContainerError,
    executeCode,
    isExecuting
  } = useWebContainer();

  // Initialize current code based on the primary file
  useEffect(() => {
    // Set initial code based on language or default to HTML
    if (codeState.language === 'javascript') {
      setCurrentCode(codeState.jsCode);
    } else if (codeState.language === 'css') {
      setCurrentCode(codeState.cssCode);
    } else {
      setCurrentCode(codeState.htmlCode);
    }
  }, [codeState]);

  const handleCodeChange = (code: string) => {
    setCurrentCode(code);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setExecutionResult(null);

    try {
      // Create and run the frontend project
      const url = await createFrontendProject(
        codeState.htmlCode,
        codeState.cssCode,
        codeState.jsCode
      );
      setExecutionResult(`Project running at: ${url}`);
    } catch (error) {
      console.error('Failed to run code:', error);
      setExecutionResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleShowCommands = () => {
    setShowCommandModal(true);
  };

  const getRunCommands = () => {
    const commands = [];
    if (framework === 'React' || codeState.language === 'react') {
      commands.push('npx create-react-app my-app');
      commands.push('cd my-app');
      commands.push('npm start');
    } else if (framework === 'Next.js') {
      commands.push('npx create-next-app@latest my-app');
      commands.push('cd my-app');
      commands.push('npm run dev');
    } else if (framework === 'Node.js') {
      commands.push('mkdir my-api && cd my-api');
      commands.push('npm init -y');
      commands.push('npm install express');
      commands.push('node server.js');
    } else if (framework === 'Vue') {
      commands.push('npm create vue@latest my-app');
      commands.push('cd my-app');
      commands.push('npm install');
      commands.push('npm run dev');
    } else {
      commands.push('mkdir my-project && cd my-project');
      commands.push('npx http-server -p 3000');
    }
    return commands;
  };

  const handleDownload = () => {
    const zipContent = `<!-- HTML -->\n${codeState.htmlCode}\n\n/* CSS */\n${codeState.cssCode}\n\n// JavaScript\n${codeState.jsCode}`;
    const blob = new Blob([zipContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${codeState.title.replace(/\s+/g, '-').toLowerCase()}-code.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const containerClass = isFullscreen 
    ? 'fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 flex flex-col'
    : 'h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden';

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {codeState.title} - Live Runner
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <ProfessionalButton variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </ProfessionalButton>
              
              <div className="flex items-center space-x-2">
                <ProfessionalButton
                  variant="primary"
                  onClick={handleRunCode}
                  disabled={isRunning || isBuilding}
                >
                  {isRunning || isBuilding ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Run Code
                </ProfessionalButton>
                
                <ProfessionalButton
                  variant="outline"
                  onClick={handleShowCommands}
                >
                  <Terminal className="h-4 w-4 mr-2" />
                  CLI Commands
                </ProfessionalButton>
              </div>

              <ProfessionalButton variant="outline" onClick={toggleFullscreen}>
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </ProfessionalButton>
            </div>
          </div>
        </div>
      </div>

      {/* IDE Layout */}
      <div className="flex-1 min-h-0">
        <IDELayout
          initialCode={currentCode}
          onCodeChange={handleCodeChange}
          language={codeState.language}
          challengeType="code-runner"
          showPreview={true}
          challengeId={postId}
          codeRunnerState={{
            htmlCode: codeState.htmlCode,
            cssCode: codeState.cssCode,
            jsCode: codeState.jsCode
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Language: {codeState.language}</span>
              <span>•</span>
              <span>Lines: {currentCode.split('\n').length}</span>
              <span>•</span>
              <span>Characters: {currentCode.length}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {webContainerError && (
                <div className="flex items-center text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">Error: {webContainerError}</span>
                </div>
              )}
              
              {executionResult && (
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  <span className="text-sm">Success</span>
                </div>
              )}
              
              {(isRunning || isBuilding) && (
                <div className="flex items-center text-blue-600 dark:text-blue-400">
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  <span className="text-sm">
                    {isBuilding ? 'Building...' : 'Running...'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Command Modal */}
      {showCommandModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Command Line Instructions
              </h3>
              <button
                onClick={() => setShowCommandModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                To run this {framework || codeState.language} project locally, follow these commands:
              </p>
              
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm space-y-2">
                {getRunCommands().map((command, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-gray-500">$</span>
                    <code className="flex-1">{command}</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(command);
                      }}
                      className="text-gray-400 hover:text-white transition-colors"
                      title="Copy command"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-blue-500 mt-0.5">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">Prerequisites:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Node.js (v16 or higher) installed</li>
                    <li>npm or yarn package manager</li>
                    <li>Terminal/Command Prompt access</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <ProfessionalButton
                variant="primary"
                onClick={() => setShowCommandModal(false)}
              >
                Close
              </ProfessionalButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeRunnerPage;