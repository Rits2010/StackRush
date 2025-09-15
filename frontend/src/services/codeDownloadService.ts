// Code Download Service
// This service handles downloading code in various formats and structures

import JSZip from 'jszip';

interface CodeFile {
  name: string;
  content: string;
  path?: string;
}

interface DownloadOptions {
  format: 'single-file' | 'zip' | 'github-repo';
  includeReadme?: boolean;
  includePackageJson?: boolean;
  includeGitignore?: boolean;
  projectName?: string;
  description?: string;
  author?: string;
}

interface ProjectStructure {
  name: string;
  description: string;
  files: CodeFile[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

class CodeDownloadService {
  /**
   * Download a single file
   */
  static downloadSingleFile(
    filename: string,
    content: string,
    mimeType = 'text/plain'
  ): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Download multiple files as a ZIP archive
   */
  static async downloadAsZip(
    files: CodeFile[],
    zipName: string,
    options: Partial<DownloadOptions> = {}
  ): Promise<void> {
    const zip = new JSZip();

    // Add project files
    files.forEach(file => {
      const filePath = file.path || file.name;
      zip.file(filePath, file.content);
    });

    // Add additional files based on options
    if (options.includeReadme) {
      const readmeContent = this.generateReadme(
        options.projectName || zipName,
        options.description || 'Downloaded from Stack Rush',
        files
      );
      zip.file('README.md', readmeContent);
    }

    if (options.includePackageJson) {
      const packageJsonContent = this.generatePackageJson(
        options.projectName || zipName,
        options.description || '',
        options.author || 'Anonymous'
      );
      zip.file('package.json', packageJsonContent);
    }

    if (options.includeGitignore) {
      const gitignoreContent = this.generateGitignore();
      zip.file('.gitignore', gitignoreContent);
    }

    // Generate and download ZIP
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${zipName}.zip`;
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Download code challenge solution
   */
  static downloadChallengeSolution(
    challengeTitle: string,
    code: string,
    language: string,
    options: Partial<DownloadOptions> = {}
  ): void {
    const fileName = `${challengeTitle.replace(/\\s+/g, '-').toLowerCase()}.${this.getFileExtension(language)}`;
    
    if (options.format === 'zip') {
      const files: CodeFile[] = [
        {
          name: fileName,
          content: code
        }
      ];

      this.downloadAsZip(files, challengeTitle.replace(/\\s+/g, '-').toLowerCase(), {
        ...options,
        includeReadme: true,
        projectName: challengeTitle,
        description: `Solution for ${challengeTitle} challenge`
      });
    } else {
      this.downloadSingleFile(fileName, code);
    }
  }

  /**
   * Download frontend project (HTML, CSS, JS)
   */
  static async downloadFrontendProject(
    projectName: string,
    htmlCode: string,
    cssCode: string,
    jsCode: string,
    options: Partial<DownloadOptions> = {}
  ): Promise<void> {
    const files: CodeFile[] = [];

    // Add HTML file
    if (htmlCode) {
      files.push({
        name: 'index.html',
        content: this.enhanceHtmlWithLinks(htmlCode, cssCode ? 'styles.css' : null, jsCode ? 'script.js' : null)
      });
    }

    // Add CSS file
    if (cssCode) {
      files.push({
        name: 'styles.css',
        content: cssCode
      });
    }

    // Add JavaScript file
    if (jsCode) {
      files.push({
        name: 'script.js',
        content: jsCode
      });
    }

    if (options.format === 'zip') {
      await this.downloadAsZip(files, projectName, {
        ...options,
        includeReadme: true,
        projectName,
        description: options.description || 'Frontend project from Stack Rush'
      });
    } else {
      // Download files individually
      files.forEach(file => {
        this.downloadSingleFile(file.name, file.content);
      });
    }
  }

  /**
   * Download React component
   */
  static async downloadReactComponent(
    componentName: string,
    jsxCode: string,
    cssCode?: string,
    options: Partial<DownloadOptions> = {}
  ): Promise<void> {
    const files: CodeFile[] = [
      {
        name: `${componentName}.jsx`,
        content: jsxCode
      }
    ];

    if (cssCode) {
      files.push({
        name: `${componentName}.css`,
        content: cssCode
      });
    }

    if (options.format === 'zip') {
      await this.downloadAsZip(files, componentName, {
        ...options,
        includeReadme: true,
        includePackageJson: true,
        projectName: componentName,
        description: `React component: ${componentName}`
      });
    } else {
      files.forEach(file => {
        this.downloadSingleFile(file.name, file.content);
      });
    }
  }

  /**
   * Download complete project structure
   */
  static async downloadProject(
    project: ProjectStructure,
    options: Partial<DownloadOptions> = {}
  ): Promise<void> {
    const zip = new JSZip();

    // Create folder structure and add files
    project.files.forEach(file => {
      const filePath = file.path || file.name;
      zip.file(filePath, file.content);
    });

    // Add package.json if dependencies are specified
    if (project.dependencies || project.devDependencies || project.scripts) {
      const packageJson = {
        name: project.name.toLowerCase().replace(/\\s+/g, '-'),
        version: '1.0.0',
        description: project.description,
        main: 'index.js',
        scripts: project.scripts || {
          start: 'node index.js',
          test: 'echo \"Error: no test specified\" && exit 1'
        },
        dependencies: project.dependencies || {},
        devDependencies: project.devDependencies || {},
        author: options.author || 'Anonymous',
        license: 'MIT'
      };
      
      zip.file('package.json', JSON.stringify(packageJson, null, 2));
    }

    // Add README.md
    if (options.includeReadme !== false) {
      const readmeContent = this.generateReadme(
        project.name,
        project.description,
        project.files
      );
      zip.file('README.md', readmeContent);
    }

    // Add .gitignore
    if (options.includeGitignore) {
      zip.file('.gitignore', this.generateGitignore());
    }

    // Download the ZIP
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\\s+/g, '-').toLowerCase()}.zip`;
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Get appropriate file extension for language
   */
  private static getFileExtension(language: string): string {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      csharp: 'cs',
      php: 'php',
      ruby: 'rb',
      go: 'go',
      rust: 'rs',
      swift: 'swift',
      kotlin: 'kt',
      html: 'html',
      css: 'css',
      scss: 'scss',
      sass: 'sass',
      jsx: 'jsx',
      tsx: 'tsx',
      vue: 'vue',
      react: 'jsx'
    };

    return extensions[language.toLowerCase()] || 'txt';
  }

  /**
   * Enhance HTML with proper CSS and JS links
   */
  private static enhanceHtmlWithLinks(
    htmlCode: string,
    cssFile?: string | null,
    jsFile?: string | null
  ): string {
    let enhancedHtml = htmlCode;

    // Add CSS link if not present and CSS file exists
    if (cssFile && !htmlCode.includes('<link') && !htmlCode.includes('stylesheet')) {
      const cssLink = `    <link rel=\"stylesheet\" href=\"${cssFile}\">`;
      enhancedHtml = enhancedHtml.replace('</head>', `${cssLink}\n</head>`);
    }

    // Add JS script if not present and JS file exists
    if (jsFile && !htmlCode.includes('<script')) {
      const jsScript = `    <script src=\"${jsFile}\"></script>`;
      enhancedHtml = enhancedHtml.replace('</body>', `${jsScript}\n</body>`);
    }

    return enhancedHtml;
  }

  /**
   * Generate README.md content
   */
  private static generateReadme(
    projectName: string,
    description: string,
    files: CodeFile[]
  ): string {
    const fileList = files.map(file => `- ${file.name}`).join('\n');
    
    return `# ${projectName}

${description}

## Files

${fileList}

## Usage

1. Download or clone this repository
2. Open the files in your preferred code editor
3. Follow any specific instructions in the code comments

## About

This code was downloaded from Stack Rush - a platform for coding challenges and skill development.

Visit [Stack Rush](https://stackrush.dev) to practice more coding challenges!

## License

MIT License - feel free to use this code for learning and development purposes.
`;
  }

  /**
   * Generate package.json content
   */
  private static generatePackageJson(
    projectName: string,
    description: string,
    author: string
  ): string {
    const packageJson = {
      name: projectName.toLowerCase().replace(/\\s+/g, '-'),
      version: '1.0.0',
      description: description || 'Project downloaded from Stack Rush',
      main: 'index.js',
      scripts: {
        start: 'node index.js',
        dev: 'node index.js',
        test: 'echo \"Error: no test specified\" && exit 1'
      },
      keywords: ['stackrush', 'coding-challenge', 'javascript'],
      author: author,
      license: 'MIT',
      dependencies: {},
      devDependencies: {}
    };

    return JSON.stringify(packageJson, null, 2);
  }

  /**
   * Generate .gitignore content
   */
  private static generateGitignore(): string {
    return `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Grunt intermediate storage
.grunt

# Bower dependency directory
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons
build/Release

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
logs
*.log

# Build directories
dist/
build/
.next/
.nuxt/

# Temporary folders
tmp/
temp/
`;
  }

  /**
   * Create a starter template for different project types
   */
  static createProjectTemplate(
    type: 'react' | 'vanilla-js' | 'node' | 'python',
    projectName: string
  ): ProjectStructure {
    switch (type) {
      case 'react':
        return {
          name: projectName,
          description: 'React project created from Stack Rush',
          files: [
            {
              name: 'src/App.jsx',
              path: 'src/App.jsx',
              content: `import React from 'react';\nimport './App.css';\n\nfunction App() {\n  return (\n    <div className=\"App\">\n      <header className=\"App-header\">\n        <h1>Welcome to ${projectName}</h1>\n        <p>This React app was created from Stack Rush!</p>\n      </header>\n    </div>\n  );\n}\n\nexport default App;`
            },
            {
              name: 'src/App.css',
              path: 'src/App.css',
              content: `.App {\n  text-align: center;\n}\n\n.App-header {\n  background-color: #282c34;\n  padding: 20px;\n  color: white;\n  min-height: 100vh;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n}\n\nh1 {\n  font-size: 2.5rem;\n  margin-bottom: 1rem;\n}\n\np {\n  font-size: 1.2rem;\n}`
            },
            {
              name: 'src/index.js',
              path: 'src/index.js',
              content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nconst root = ReactDOM.createRoot(document.getElementById('root'));\nroot.render(<App />);`
            },
            {
              name: 'public/index.html',
              path: 'public/index.html',
              content: `<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"utf-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n  <title>${projectName}</title>\n</head>\n<body>\n  <noscript>You need to enable JavaScript to run this app.</noscript>\n  <div id=\"root\"></div>\n</body>\n</html>`
            }
          ],
          dependencies: {
            'react': '^18.2.0',
            'react-dom': '^18.2.0'
          },
          devDependencies: {
            '@vitejs/plugin-react': '^4.0.0',
            'vite': '^4.4.0'
          },
          scripts: {
            'dev': 'vite',
            'build': 'vite build',
            'preview': 'vite preview'
          }
        };

      case 'vanilla-js':
        return {
          name: projectName,
          description: 'Vanilla JavaScript project created from Stack Rush',
          files: [
            {
              name: 'index.html',
              content: `<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>${projectName}</title>\n    <link rel=\"stylesheet\" href=\"styles.css\">\n</head>\n<body>\n    <div class=\"container\">\n        <h1>Welcome to ${projectName}</h1>\n        <p>This project was created from Stack Rush!</p>\n        <button id=\"click-me\">Click Me!</button>\n    </div>\n    <script src=\"script.js\"></script>\n</body>\n</html>`
            },
            {
              name: 'styles.css',
              content: `* {\n    margin: 0;\n    padding: 0;\n    box-sizing: border-box;\n}\n\nbody {\n    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n    min-height: 100vh;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n}\n\n.container {\n    background: white;\n    padding: 2rem;\n    border-radius: 10px;\n    box-shadow: 0 10px 30px rgba(0,0,0,0.1);\n    text-align: center;\n}\n\nh1 {\n    color: #333;\n    margin-bottom: 1rem;\n}\n\np {\n    color: #666;\n    margin-bottom: 2rem;\n}\n\nbutton {\n    background: #667eea;\n    color: white;\n    padding: 10px 20px;\n    border: none;\n    border-radius: 5px;\n    cursor: pointer;\n    font-size: 1rem;\n}\n\nbutton:hover {\n    background: #5a6fd8;\n}`
            },
            {
              name: 'script.js',
              content: `// Welcome to ${projectName}!\n// This project was created from Stack Rush\n\ndocument.addEventListener('DOMContentLoaded', function() {\n    const button = document.getElementById('click-me');\n    let clickCount = 0;\n    \n    button.addEventListener('click', function() {\n        clickCount++;\n        button.textContent = \\`Clicked \\${clickCount} times!\\`;\n        \n        if (clickCount === 1) {\n            button.textContent = 'Clicked 1 time!';\n        }\n        \n        // Add some fun effects\n        button.style.transform = 'scale(0.95)';\n        setTimeout(() => {\n            button.style.transform = 'scale(1)';\n        }, 100);\n    });\n    \n    console.log('${projectName} is ready to go!');\n});`
            }
          ]
        };

      case 'node':
        return {
          name: projectName,
          description: 'Node.js project created from Stack Rush',
          files: [
            {
              name: 'index.js',
              content: `// Welcome to ${projectName}!\n// This Node.js project was created from Stack Rush\n\nconst http = require('http');\nconst port = process.env.PORT || 3000;\n\nconst server = http.createServer((req, res) => {\n    res.writeHead(200, { 'Content-Type': 'application/json' });\n    res.end(JSON.stringify({\n        message: 'Welcome to ${projectName}!',\n        timestamp: new Date().toISOString(),\n        status: 'success'\n    }));\n});\n\nserver.listen(port, () => {\n    console.log(\\`${projectName} server running at http://localhost:\\${port}/\\`);\n});`
            },
            {
              name: 'routes/api.js',
              path: 'routes/api.js',
              content: `// API Routes for ${projectName}\n\nconst express = require('express');\nconst router = express.Router();\n\n// GET /api/status\nrouter.get('/status', (req, res) => {\n    res.json({\n        status: 'OK',\n        message: '${projectName} API is running',\n        timestamp: new Date().toISOString()\n    });\n});\n\n// GET /api/hello\nrouter.get('/hello', (req, res) => {\n    const name = req.query.name || 'World';\n    res.json({\n        message: \\`Hello, \\${name}!\\`,\n        from: '${projectName}'\n    });\n});\n\nmodule.exports = router;`
            }
          ],
          dependencies: {
            'express': '^4.18.2'
          },
          scripts: {
            'start': 'node index.js',
            'dev': 'nodemon index.js',
            'test': 'jest'
          }
        };

      case 'python':
        return {
          name: projectName,
          description: 'Python project created from Stack Rush',
          files: [
            {
              name: 'main.py',
              content: `#!/usr/bin/env python3\n\"\"\"\n${projectName}\nPython project created from Stack Rush\n\"\"\"\n\nimport sys\nimport os\nfrom datetime import datetime\n\n\ndef main():\n    \"\"\"Main function for ${projectName}\"\"\"\n    print(f\"Welcome to ${projectName}!\")\n    print(f\"This Python project was created from Stack Rush\")\n    print(f\"Current time: {datetime.now()}\")\n    \n    # Add your code here\n    print(\"\nReady to start coding!\")\n\n\nif __name__ == \"__main__\":\n    main()`
            },
            {
              name: 'requirements.txt',
              content: `# Requirements for ${projectName}\n# Add your Python dependencies here\n\n# Example dependencies:\n# requests>=2.28.0\n# numpy>=1.21.0\n# pandas>=1.3.0`
            },
            {
              name: 'utils/helpers.py',
              path: 'utils/helpers.py',
              content: `\"\"\"\nHelper functions for ${projectName}\n\"\"\"\n\nfrom datetime import datetime\n\n\ndef get_timestamp():\n    \"\"\"Get current timestamp\"\"\"\n    return datetime.now().isoformat()\n\n\ndef log_message(message, level=\"INFO\"):\n    \"\"\"Log a message with timestamp\"\"\"\n    timestamp = get_timestamp()\n    print(f\"[{timestamp}] {level}: {message}\")\n\n\ndef format_response(data, status=\"success\"):\n    \"\"\"Format a standard response\"\"\"\n    return {\n        \"status\": status,\n        \"data\": data,\n        \"timestamp\": get_timestamp()\n    }`
            }
          ]
        };

      default:
        throw new Error(`Unknown project type: ${type}`);
    }
  }
}

export default CodeDownloadService;
export type { CodeFile, DownloadOptions, ProjectStructure };