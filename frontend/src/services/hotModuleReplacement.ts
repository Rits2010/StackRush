// Hot Module Replacement (HMR) system for frontend challenges
export interface HMRModule {
  id: string;
  type: 'html' | 'css' | 'javascript' | 'react';
  content: string;
  dependencies: string[];
  lastModified: number;
}

export interface HMRUpdate {
  moduleId: string;
  type: 'update' | 'add' | 'remove';
  content?: string;
  timestamp: number;
}

export class HotModuleReplacementSystem {
  private modules: Map<string, HMRModule> = new Map();
  private subscribers: Map<string, Set<(update: HMRUpdate) => void>> = new Map();
  private updateQueue: HMRUpdate[] = [];
  private isProcessing = false;
  private debounceTimeout: NodeJS.Timeout | null = null;

  // Register a module for HMR
  registerModule(module: HMRModule): void {
    const existingModule = this.modules.get(module.id);
    
    if (existingModule && existingModule.content === module.content) {
      return; // No changes, skip update
    }

    this.modules.set(module.id, module);
    
    const update: HMRUpdate = {
      moduleId: module.id,
      type: existingModule ? 'update' : 'add',
      content: module.content,
      timestamp: Date.now()
    };

    this.queueUpdate(update);
  }

  // Update module content
  updateModule(moduleId: string, content: string): void {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    if (module.content === content) {
      return; // No changes
    }

    const updatedModule: HMRModule = {
      ...module,
      content,
      lastModified: Date.now()
    };

    this.modules.set(moduleId, updatedModule);

    const update: HMRUpdate = {
      moduleId,
      type: 'update',
      content,
      timestamp: Date.now()
    };

    this.queueUpdate(update);
  }

  // Remove a module
  removeModule(moduleId: string): void {
    if (!this.modules.has(moduleId)) {
      return;
    }

    this.modules.delete(moduleId);
    this.subscribers.delete(moduleId);

    const update: HMRUpdate = {
      moduleId,
      type: 'remove',
      timestamp: Date.now()
    };

    this.queueUpdate(update);
  }

  // Subscribe to module updates
  subscribe(moduleId: string, callback: (update: HMRUpdate) => void): () => void {
    if (!this.subscribers.has(moduleId)) {
      this.subscribers.set(moduleId, new Set());
    }

    this.subscribers.get(moduleId)!.add(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(moduleId);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(moduleId);
        }
      }
    };
  }

  // Subscribe to all updates
  subscribeToAll(callback: (update: HMRUpdate) => void): () => void {
    return this.subscribe('*', callback);
  }

  // Get module by ID
  getModule(moduleId: string): HMRModule | undefined {
    return this.modules.get(moduleId);
  }

  // Get all modules
  getAllModules(): HMRModule[] {
    return Array.from(this.modules.values());
  }

  // Queue an update for processing
  private queueUpdate(update: HMRUpdate): void {
    this.updateQueue.push(update);
    this.scheduleProcessing();
  }

  // Schedule update processing with debouncing
  private scheduleProcessing(): void {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      this.processUpdates();
    }, 100); // 100ms debounce
  }

  // Process queued updates
  private async processUpdates(): Promise<void> {
    if (this.isProcessing || this.updateQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // Group updates by module
      const updatesByModule = new Map<string, HMRUpdate[]>();
      
      for (const update of this.updateQueue) {
        if (!updatesByModule.has(update.moduleId)) {
          updatesByModule.set(update.moduleId, []);
        }
        updatesByModule.get(update.moduleId)!.push(update);
      }

      // Process updates for each module
      for (const [moduleId, updates] of updatesByModule) {
        const latestUpdate = updates[updates.length - 1]; // Get the latest update
        await this.notifySubscribers(moduleId, latestUpdate);
      }

      // Clear the queue
      this.updateQueue = [];
    } finally {
      this.isProcessing = false;
    }
  }

  // Notify subscribers of updates
  private async notifySubscribers(moduleId: string, update: HMRUpdate): Promise<void> {
    // Notify specific module subscribers
    const moduleSubscribers = this.subscribers.get(moduleId);
    if (moduleSubscribers) {
      for (const callback of moduleSubscribers) {
        try {
          callback(update);
        } catch (error) {
          console.error(`HMR subscriber error for module ${moduleId}:`, error);
        }
      }
    }

    // Notify global subscribers
    const globalSubscribers = this.subscribers.get('*');
    if (globalSubscribers) {
      for (const callback of globalSubscribers) {
        try {
          callback(update);
        } catch (error) {
          console.error('HMR global subscriber error:', error);
        }
      }
    }
  }

  // Generate combined output for preview
  generatePreviewContent(): { html: string; css: string; javascript: string } {
    let html = '';
    let css = '';
    let javascript = '';

    // Collect content from all modules
    for (const module of this.modules.values()) {
      switch (module.type) {
        case 'html':
          html += module.content + '\n';
          break;
        case 'css':
          css += module.content + '\n';
          break;
        case 'javascript':
          javascript += module.content + '\n';
          break;
        case 'react':
          // For React components, we need to transform JSX
          javascript += this.transformReactComponent(module.content) + '\n';
          break;
      }
    }

    return { html: html.trim(), css: css.trim(), javascript: javascript.trim() };
  }

  // Transform React component to vanilla JavaScript
  private transformReactComponent(jsxContent: string): string {
    // This is a simplified JSX transformation
    // In a real implementation, you'd use Babel or similar
    try {
      // Basic JSX to React.createElement transformation
      let transformed = jsxContent;
      
      // Transform JSX elements to React.createElement calls
      transformed = transformed.replace(
        /<(\w+)([^>]*?)>(.*?)<\/\1>/gs,
        (match, tagName, attributes, children) => {
          const props = this.parseJSXAttributes(attributes);
          const propsStr = props.length > 0 ? `{${props.join(', ')}}` : 'null';
          const childrenStr = children.trim() ? `"${children.trim()}"` : '';
          return `React.createElement("${tagName}", ${propsStr}${childrenStr ? `, ${childrenStr}` : ''})`;
        }
      );

      // Transform self-closing JSX elements
      transformed = transformed.replace(
        /<(\w+)([^>]*?)\/>/g,
        (match, tagName, attributes) => {
          const props = this.parseJSXAttributes(attributes);
          const propsStr = props.length > 0 ? `{${props.join(', ')}}` : 'null';
          return `React.createElement("${tagName}", ${propsStr})`;
        }
      );

      return transformed;
    } catch (error) {
      console.error('JSX transformation error:', error);
      return `console.error("JSX transformation failed: ${error}");`;
    }
  }

  // Parse JSX attributes
  private parseJSXAttributes(attributesStr: string): string[] {
    const attributes: string[] = [];
    const attrRegex = /(\w+)=(?:{([^}]+)}|"([^"]+)"|'([^']+)')/g;
    let match;

    while ((match = attrRegex.exec(attributesStr)) !== null) {
      const [, name, jsValue, doubleQuotedValue, singleQuotedValue] = match;
      const value = jsValue || `"${doubleQuotedValue || singleQuotedValue}"`;
      attributes.push(`${name}: ${value}`);
    }

    return attributes;
  }

  // Check for circular dependencies
  checkCircularDependencies(): string[] {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const circularDeps: string[] = [];

    const dfs = (moduleId: string, path: string[]): void => {
      if (recursionStack.has(moduleId)) {
        circularDeps.push(`Circular dependency: ${path.join(' -> ')} -> ${moduleId}`);
        return;
      }

      if (visited.has(moduleId)) {
        return;
      }

      visited.add(moduleId);
      recursionStack.add(moduleId);

      const module = this.modules.get(moduleId);
      if (module) {
        for (const dep of module.dependencies) {
          dfs(dep, [...path, moduleId]);
        }
      }

      recursionStack.delete(moduleId);
    };

    for (const moduleId of this.modules.keys()) {
      if (!visited.has(moduleId)) {
        dfs(moduleId, []);
      }
    }

    return circularDeps;
  }

  // Get dependency graph
  getDependencyGraph(): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    
    for (const [moduleId, module] of this.modules) {
      graph.set(moduleId, [...module.dependencies]);
    }

    return graph;
  }

  // Clear all modules and subscribers
  clear(): void {
    this.modules.clear();
    this.subscribers.clear();
    this.updateQueue = [];
    
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }
  }

  // Get system statistics
  getStats(): {
    moduleCount: number;
    subscriberCount: number;
    queuedUpdates: number;
    isProcessing: boolean;
    lastUpdate: number | null;
  } {
    const lastUpdate = this.modules.size > 0 
      ? Math.max(...Array.from(this.modules.values()).map(m => m.lastModified))
      : null;

    return {
      moduleCount: this.modules.size,
      subscriberCount: Array.from(this.subscribers.values()).reduce((sum, set) => sum + set.size, 0),
      queuedUpdates: this.updateQueue.length,
      isProcessing: this.isProcessing,
      lastUpdate
    };
  }
}

// Global HMR instance
export const hmrSystem = new HotModuleReplacementSystem();

// React hook for HMR integration
export function useHMR(moduleId: string, content: string, type: HMRModule['type']) {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  React.useEffect(() => {
    // Register or update module
    hmrSystem.registerModule({
      id: moduleId,
      type,
      content,
      dependencies: [],
      lastModified: Date.now()
    });

    // Subscribe to updates
    const unsubscribe = hmrSystem.subscribe(moduleId, () => {
      forceUpdate();
    });

    return unsubscribe;
  }, [moduleId, content, type]);

  return hmrSystem.getModule(moduleId);
}