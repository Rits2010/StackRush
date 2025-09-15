import { TestCase, TestResult } from '../types/challenge';

// Visual regression testing
export interface VisualTestConfig {
  selector?: string;
  viewport: { width: number; height: number };
  threshold: number; // Pixel difference threshold
  ignoreRegions?: Array<{ x: number; y: number; width: number; height: number }>;
}

export interface AccessibilityTestConfig {
  level: 'A' | 'AA' | 'AAA';
  rules: string[];
  ignoreRules?: string[];
}

export interface PerformanceTestConfig {
  metrics: ('FCP' | 'LCP' | 'CLS' | 'FID' | 'TTFB')[];
  thresholds: Record<string, number>;
}

export class FrontendValidator {
  private iframe: HTMLIFrameElement | null = null;

  constructor() {
    this.setupTestEnvironment();
  }

  private setupTestEnvironment(): void {
    // Create a hidden iframe for testing
    this.iframe = document.createElement('iframe');
    this.iframe.style.position = 'absolute';
    this.iframe.style.left = '-9999px';
    this.iframe.style.width = '1200px';
    this.iframe.style.height = '800px';
    this.iframe.sandbox = 'allow-scripts allow-same-origin';
    document.body.appendChild(this.iframe);
  }

  async runVisualRegressionTest(
    htmlCode: string,
    cssCode: string,
    jsCode: string,
    testCase: TestCase
  ): Promise<TestResult> {
    if (!this.iframe) {
      throw new Error('Test environment not initialized');
    }

    try {
      // Load content into iframe
      await this.loadContentIntoIframe(htmlCode, cssCode, jsCode);
      
      const config = testCase.validationRules[0]?.criteria as VisualTestConfig;
      const doc = this.iframe.contentDocument;
      
      if (!doc) {
        throw new Error('Cannot access iframe document');
      }

      // Check for required elements and styles
      const validationResults = await this.validateVisualElements(doc, config);
      
      return {
        testCaseId: testCase.id,
        passed: validationResults.passed,
        actualOutput: validationResults.details,
        feedback: validationResults.feedback,
        performance: {
          executionTime: validationResults.executionTime,
          memoryUsage: 0,
          cpuUsage: 0
        }
      };

    } catch (error) {
      return {
        testCaseId: testCase.id,
        passed: false,
        error: error instanceof Error ? error.message : 'Visual test failed',
        performance: {
          executionTime: 0,
          memoryUsage: 0,
          cpuUsage: 0
        }
      };
    }
  }

  async runAccessibilityTest(
    htmlCode: string,
    cssCode: string,
    jsCode: string,
    testCase: TestCase
  ): Promise<TestResult> {
    if (!this.iframe) {
      throw new Error('Test environment not initialized');
    }

    try {
      await this.loadContentIntoIframe(htmlCode, cssCode, jsCode);
      
      const config = testCase.validationRules[0]?.criteria as AccessibilityTestConfig;
      const doc = this.iframe.contentDocument;
      
      if (!doc) {
        throw new Error('Cannot access iframe document');
      }

      const accessibilityResults = await this.validateAccessibility(doc, config);
      
      return {
        testCaseId: testCase.id,
        passed: accessibilityResults.passed,
        actualOutput: accessibilityResults.violations,
        feedback: accessibilityResults.feedback,
        performance: {
          executionTime: accessibilityResults.executionTime,
          memoryUsage: 0,
          cpuUsage: 0
        }
      };

    } catch (error) {
      return {
        testCaseId: testCase.id,
        passed: false,
        error: error instanceof Error ? error.message : 'Accessibility test failed',
        performance: {
          executionTime: 0,
          memoryUsage: 0,
          cpuUsage: 0
        }
      };
    }
  }

  async runPerformanceTest(
    htmlCode: string,
    cssCode: string,
    jsCode: string,
    testCase: TestCase
  ): Promise<TestResult> {
    if (!this.iframe) {
      throw new Error('Test environment not initialized');
    }

    try {
      const startTime = performance.now();
      
      await this.loadContentIntoIframe(htmlCode, cssCode, jsCode);
      
      const config = testCase.validationRules[0]?.criteria as PerformanceTestConfig;
      const performanceResults = await this.measurePerformance(config);
      
      const executionTime = performance.now() - startTime;
      
      return {
        testCaseId: testCase.id,
        passed: performanceResults.passed,
        actualOutput: performanceResults.metrics,
        feedback: performanceResults.feedback,
        performance: {
          executionTime,
          memoryUsage: performanceResults.memoryUsage,
          cpuUsage: 0
        }
      };

    } catch (error) {
      return {
        testCaseId: testCase.id,
        passed: false,
        error: error instanceof Error ? error.message : 'Performance test failed',
        performance: {
          executionTime: 0,
          memoryUsage: 0,
          cpuUsage: 0
        }
      };
    }
  }

  private async loadContentIntoIframe(
    htmlCode: string,
    cssCode: string,
    jsCode: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.iframe) {
        reject(new Error('Iframe not available'));
        return;
      }

      const doc = this.iframe.contentDocument;
      if (!doc) {
        reject(new Error('Cannot access iframe document'));
        return;
      }

      const fullHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test</title>
          <style>
            ${cssCode}
          </style>
        </head>
        <body>
          ${htmlCode}
          <script>
            try {
              ${jsCode}
              parent.postMessage({ type: 'loaded' }, '*');
            } catch (error) {
              parent.postMessage({ type: 'error', message: error.message }, '*');
            }
          </script>
        </body>
        </html>
      `;

      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'loaded') {
          window.removeEventListener('message', handleMessage);
          resolve();
        } else if (event.data.type === 'error') {
          window.removeEventListener('message', handleMessage);
          reject(new Error(event.data.message));
        }
      };

      window.addEventListener('message', handleMessage);

      doc.open();
      doc.write(fullHTML);
      doc.close();

      // Fallback timeout
      setTimeout(() => {
        window.removeEventListener('message', handleMessage);
        resolve();
      }, 2000);
    });
  }

  private async validateVisualElements(
    doc: Document,
    config: VisualTestConfig
  ): Promise<{
    passed: boolean;
    details: any;
    feedback: string;
    executionTime: number;
  }> {
    const startTime = performance.now();
    const results: any = {};
    let passed = true;
    const issues: string[] = [];

    try {
      // Check CSS Grid layout
      if (config.selector) {
        const element = doc.querySelector(config.selector);
        if (!element) {
          passed = false;
          issues.push(`Element with selector "${config.selector}" not found`);
        } else {
          const computedStyle = doc.defaultView?.getComputedStyle(element);
          if (computedStyle) {
            results.display = computedStyle.display;
            results.gridTemplateColumns = computedStyle.gridTemplateColumns;
            
            // Validate grid layout
            if (config.selector.includes('gallery-grid')) {
              if (computedStyle.display !== 'grid') {
                passed = false;
                issues.push('Gallery should use CSS Grid layout (display: grid)');
              }
              
              if (!computedStyle.gridTemplateColumns.includes('repeat')) {
                passed = false;
                issues.push('Gallery should use responsive grid columns');
              }
            }
          }
        }
      }

      // Check responsive design
      const mediaQueries = this.extractMediaQueries(doc);
      results.mediaQueries = mediaQueries;
      
      if (mediaQueries.length === 0) {
        passed = false;
        issues.push('No responsive design media queries found');
      }

      // Check for proper image handling
      const images = doc.querySelectorAll('img');
      const imageIssues: string[] = [];
      
      images.forEach((img, index) => {
        if (!img.alt) {
          imageIssues.push(`Image ${index + 1} missing alt attribute`);
        }
        
        const style = doc.defaultView?.getComputedStyle(img);
        if (style && style.objectFit !== 'cover' && style.objectFit !== 'contain') {
          imageIssues.push(`Image ${index + 1} should use object-fit for proper scaling`);
        }
      });

      if (imageIssues.length > 0) {
        passed = false;
        issues.push(...imageIssues);
      }

      results.imageCount = images.length;
      results.issues = issues;

    } catch (error) {
      passed = false;
      issues.push(`Validation error: ${error}`);
    }

    const executionTime = performance.now() - startTime;

    return {
      passed,
      details: results,
      feedback: passed 
        ? 'Visual validation passed successfully' 
        : `Visual validation failed: ${issues.join(', ')}`,
      executionTime
    };
  }

  private async validateAccessibility(
    doc: Document,
    config: AccessibilityTestConfig
  ): Promise<{
    passed: boolean;
    violations: any[];
    feedback: string;
    executionTime: number;
  }> {
    const startTime = performance.now();
    const violations: any[] = [];
    let passed = true;

    try {
      // Check for alt text on images
      if (config.rules.includes('img-alt')) {
        const images = doc.querySelectorAll('img');
        images.forEach((img, index) => {
          if (!img.alt || img.alt.trim() === '') {
            violations.push({
              rule: 'img-alt',
              element: `img[${index}]`,
              message: 'Image missing descriptive alt text',
              severity: 'error'
            });
            passed = false;
          }
        });
      }

      // Check for proper heading hierarchy
      if (config.rules.includes('heading-hierarchy')) {
        const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let lastLevel = 0;
        
        headings.forEach((heading, index) => {
          const level = parseInt(heading.tagName.charAt(1));
          if (index === 0 && level !== 1) {
            violations.push({
              rule: 'heading-hierarchy',
              element: heading.tagName.toLowerCase(),
              message: 'Page should start with h1',
              severity: 'error'
            });
            passed = false;
          } else if (level > lastLevel + 1) {
            violations.push({
              rule: 'heading-hierarchy',
              element: heading.tagName.toLowerCase(),
              message: 'Heading levels should not skip',
              severity: 'warning'
            });
            if (config.level === 'AA' || config.level === 'AAA') {
              passed = false;
            }
          }
          lastLevel = level;
        });
      }

      // Check for keyboard navigation
      if (config.rules.includes('keyboard-navigation')) {
        const interactiveElements = doc.querySelectorAll(
          'button, a, input, select, textarea, [tabindex]'
        );
        
        interactiveElements.forEach((element, index) => {
          const tabIndex = element.getAttribute('tabindex');
          
          // Check for keyboard traps (tabindex > 0)
          if (tabIndex && parseInt(tabIndex) > 0) {
            violations.push({
              rule: 'keyboard-navigation',
              element: element.tagName.toLowerCase(),
              message: 'Avoid positive tabindex values',
              severity: 'warning'
            });
          }

          // Check for focus indicators
          const style = doc.defaultView?.getComputedStyle(element, ':focus');
          if (style && style.outline === 'none' && !style.boxShadow.includes('inset')) {
            violations.push({
              rule: 'keyboard-navigation',
              element: element.tagName.toLowerCase(),
              message: 'Interactive element should have visible focus indicator',
              severity: 'error'
            });
            passed = false;
          }
        });
      }

      // Check color contrast
      if (config.rules.includes('color-contrast')) {
        const textElements = doc.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button');
        
        textElements.forEach((element) => {
          const style = doc.defaultView?.getComputedStyle(element);
          if (style) {
            const contrast = this.calculateColorContrast(
              style.color,
              style.backgroundColor
            );
            
            const requiredRatio = config.level === 'AAA' ? 7 : 4.5;
            
            if (contrast < requiredRatio) {
              violations.push({
                rule: 'color-contrast',
                element: element.tagName.toLowerCase(),
                message: `Color contrast ratio ${contrast.toFixed(2)} is below required ${requiredRatio}`,
                severity: 'error'
              });
              passed = false;
            }
          }
        });
      }

      // Check for proper form labels
      if (config.rules.includes('form-labels')) {
        const inputs = doc.querySelectorAll('input, select, textarea');
        
        inputs.forEach((input, index) => {
          const id = input.id;
          const ariaLabel = input.getAttribute('aria-label');
          const ariaLabelledBy = input.getAttribute('aria-labelledby');
          
          if (id) {
            const label = doc.querySelector(`label[for="${id}"]`);
            if (!label && !ariaLabel && !ariaLabelledBy) {
              violations.push({
                rule: 'form-labels',
                element: `${input.tagName.toLowerCase()}[${index}]`,
                message: 'Form input missing associated label',
                severity: 'error'
              });
              passed = false;
            }
          } else if (!ariaLabel && !ariaLabelledBy) {
            violations.push({
              rule: 'form-labels',
              element: `${input.tagName.toLowerCase()}[${index}]`,
              message: 'Form input missing label or aria-label',
              severity: 'error'
            });
            passed = false;
          }
        });
      }

    } catch (error) {
      violations.push({
        rule: 'general',
        element: 'document',
        message: `Accessibility validation error: ${error}`,
        severity: 'error'
      });
      passed = false;
    }

    const executionTime = performance.now() - startTime;

    return {
      passed,
      violations,
      feedback: passed 
        ? `Accessibility validation passed (WCAG ${config.level})` 
        : `Found ${violations.length} accessibility issues`,
      executionTime
    };
  }

  private async measurePerformance(
    config: PerformanceTestConfig
  ): Promise<{
    passed: boolean;
    metrics: Record<string, number>;
    feedback: string;
    memoryUsage: number;
  }> {
    const metrics: Record<string, number> = {};
    let passed = true;
    const issues: string[] = [];

    try {
      // Measure load time
      const loadTime = performance.now();
      metrics.loadTime = loadTime;

      if (config.thresholds.loadTime && loadTime > config.thresholds.loadTime) {
        passed = false;
        issues.push(`Load time ${loadTime.toFixed(2)}ms exceeds threshold ${config.thresholds.loadTime}ms`);
      }

      // Measure memory usage
      let memoryUsage = 0;
      if ((performance as any).memory) {
        memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
        metrics.memoryUsage = memoryUsage;

        if (config.thresholds.memoryUsage && memoryUsage > config.thresholds.memoryUsage) {
          passed = false;
          issues.push(`Memory usage ${memoryUsage.toFixed(2)}MB exceeds threshold ${config.thresholds.memoryUsage}MB`);
        }
      }

      // Check for performance anti-patterns in the iframe
      if (this.iframe?.contentDocument) {
        const doc = this.iframe.contentDocument;
        
        // Count DOM elements
        const elementCount = doc.querySelectorAll('*').length;
        metrics.elementCount = elementCount;
        
        if (elementCount > 1000) {
          issues.push(`High DOM element count: ${elementCount}`);
        }

        // Check for inline styles (performance anti-pattern)
        const elementsWithInlineStyles = doc.querySelectorAll('[style]').length;
        metrics.inlineStyles = elementsWithInlineStyles;
        
        if (elementsWithInlineStyles > 10) {
          issues.push(`Too many inline styles: ${elementsWithInlineStyles}`);
        }

        // Check for unoptimized images
        const images = doc.querySelectorAll('img');
        let unoptimizedImages = 0;
        
        images.forEach((img) => {
          if (img.src && !img.src.includes('w=') && !img.src.includes('width=')) {
            unoptimizedImages++;
          }
        });
        
        metrics.unoptimizedImages = unoptimizedImages;
        
        if (unoptimizedImages > 0) {
          issues.push(`${unoptimizedImages} images without size optimization`);
        }
      }

    } catch (error) {
      passed = false;
      issues.push(`Performance measurement error: ${error}`);
    }

    return {
      passed,
      metrics,
      feedback: passed 
        ? 'Performance validation passed' 
        : `Performance issues: ${issues.join(', ')}`,
      memoryUsage: metrics.memoryUsage || 0
    };
  }

  private extractMediaQueries(doc: Document): string[] {
    const mediaQueries: string[] = [];
    
    try {
      const styleSheets = doc.styleSheets;
      
      for (let i = 0; i < styleSheets.length; i++) {
        try {
          const sheet = styleSheets[i] as CSSStyleSheet;
          const rules = sheet.cssRules || sheet.rules;
          
          for (let j = 0; j < rules.length; j++) {
            const rule = rules[j];
            if (rule instanceof CSSMediaRule) {
              mediaQueries.push(rule.conditionText || rule.media.mediaText);
            }
          }
        } catch (e) {
          // Skip inaccessible stylesheets (CORS)
          continue;
        }
      }
    } catch (error) {
      console.warn('Could not extract media queries:', error);
    }
    
    return mediaQueries;
  }

  private calculateColorContrast(foreground: string, background: string): number {
    // Simplified color contrast calculation
    // In a real implementation, you'd use a proper color contrast library
    
    const getLuminance = (color: string): number => {
      // Convert color to RGB and calculate relative luminance
      // This is a simplified version
      const rgb = this.parseColor(color);
      if (!rgb) return 0.5; // Default middle luminance
      
      const [r, g, b] = rgb.map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  private parseColor(color: string): [number, number, number] | null {
    // Simple color parsing - in a real implementation, use a proper color library
    const rgb = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgb) {
      return [parseInt(rgb[1]), parseInt(rgb[2]), parseInt(rgb[3])];
    }
    
    // Handle hex colors
    const hex = color.match(/^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (hex) {
      return [
        parseInt(hex[1], 16),
        parseInt(hex[2], 16),
        parseInt(hex[3], 16)
      ];
    }
    
    return null;
  }

  cleanup(): void {
    if (this.iframe) {
      document.body.removeChild(this.iframe);
      this.iframe = null;
    }
  }
}

// Export singleton instance
export const frontendValidator = new FrontendValidator();