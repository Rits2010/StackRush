/**
 * Scenario Simulation Service
 * 
 * Provides realistic workplace scenario simulation including:
 * - Stakeholder message simulation
 * - Requirement changes and constraint modeling
 * - Time pressure and interruption simulation
 */

export interface StakeholderMessage {
  id: string;
  from: string;
  role: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: number;
  requiresResponse?: boolean;
  impact?: 'scope' | 'timeline' | 'requirements' | 'constraints';
}

export interface RequirementChange {
  id: string;
  type: 'addition' | 'modification' | 'removal' | 'clarification';
  description: string;
  impact: 'minor' | 'moderate' | 'major';
  timeToImplement: number; // minutes
  stakeholder: string;
  justification: string;
}

export interface TimeConstraint {
  id: string;
  type: 'deadline' | 'meeting' | 'demo' | 'release';
  description: string;
  timeRemaining: number; // minutes
  severity: 'info' | 'warning' | 'critical';
}

export interface InterruptionEvent {
  id: string;
  type: 'slack' | 'email' | 'meeting' | 'phone' | 'system-alert';
  title: string;
  description: string;
  duration: number; // seconds
  canDefer?: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface ScenarioSimulationConfig {
  challengeId: string;
  duration: number; // total challenge duration in minutes
  interruptionFrequency: 'low' | 'medium' | 'high' | 'extreme';
  stakeholderActivity: 'minimal' | 'normal' | 'active' | 'chaotic';
  requirementStability: 'stable' | 'evolving' | 'volatile';
  timeConstraints: TimeConstraint[];
}

export class ScenarioSimulation {
  private config: ScenarioSimulationConfig;
  private startTime: number;
  private messageQueue: StakeholderMessage[] = [];
  private activeInterruptions: InterruptionEvent[] = [];
  private requirementChanges: RequirementChange[] = [];
  private eventListeners: Map<string, Function[]> = new Map();
  private simulationTimer?: NodeJS.Timeout;
  private isActive = false;

  constructor(config: ScenarioSimulationConfig) {
    this.config = config;
    this.startTime = Date.now();
    this.initializeScenarioEvents();
  }

  /**
   * Start the scenario simulation
   */
  start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    this.startTime = Date.now();
    this.scheduleEvents();
    
    this.emit('simulation:started', {
      config: this.config,
      startTime: this.startTime
    });
  }

  /**
   * Stop the scenario simulation
   */
  stop(): void {
    if (!this.isActive) return;
    
    this.isActive = false;
    if (this.simulationTimer) {
      clearTimeout(this.simulationTimer);
    }
    
    this.emit('simulation:stopped', {
      duration: Date.now() - this.startTime,
      messagesReceived: this.messageQueue.length,
      interruptionsHandled: this.activeInterruptions.length
    });
  }

  /**
   * Get current simulation status
   */
  getStatus() {
    const elapsed = Date.now() - this.startTime;
    const remaining = Math.max(0, (this.config.duration * 60 * 1000) - elapsed);
    
    return {
      isActive: this.isActive,
      elapsedTime: elapsed,
      remainingTime: remaining,
      progress: Math.min(1, elapsed / (this.config.duration * 60 * 1000)),
      pendingMessages: this.messageQueue.filter(m => !m.timestamp || m.timestamp > Date.now()).length,
      activeInterruptions: this.activeInterruptions.length
    };
  }

  /**
   * Get pending stakeholder messages
   */
  getPendingMessages(): StakeholderMessage[] {
    const now = Date.now();
    return this.messageQueue.filter(m => m.timestamp <= now);
  }

  /**
   * Mark a message as read/handled
   */
  markMessageHandled(messageId: string): void {
    const messageIndex = this.messageQueue.findIndex(m => m.id === messageId);
    if (messageIndex >= 0) {
      const message = this.messageQueue[messageIndex];
      this.messageQueue.splice(messageIndex, 1);
      
      this.emit('message:handled', { message });
      
      // Trigger follow-up events based on message handling
      this.handleMessageResponse(message);
    }
  }

  /**
   * Get active requirement changes
   */
  getRequirementChanges(): RequirementChange[] {
    return this.requirementChanges;
  }

  /**
   * Accept or reject a requirement change
   */
  handleRequirementChange(changeId: string, accepted: boolean): void {
    const changeIndex = this.requirementChanges.findIndex(c => c.id === changeId);
    if (changeIndex >= 0) {
      const change = this.requirementChanges[changeIndex];
      this.requirementChanges.splice(changeIndex, 1);
      
      this.emit('requirement:changed', { change, accepted });
      
      if (accepted) {
        // Adjust timeline based on change impact
        this.adjustTimeConstraints(change);
      }
    }
  }

  /**
   * Get active interruptions
   */
  getActiveInterruptions(): InterruptionEvent[] {
    return this.activeInterruptions;
  }

  /**
   * Handle an interruption (defer or address immediately)
   */
  handleInterruption(interruptionId: string, action: 'defer' | 'handle'): void {
    const interruptionIndex = this.activeInterruptions.findIndex(i => i.id === interruptionId);
    if (interruptionIndex >= 0) {
      const interruption = this.activeInterruptions[interruptionIndex];
      this.activeInterruptions.splice(interruptionIndex, 1);
      
      this.emit('interruption:handled', { interruption, action });
      
      if (action === 'defer' && interruption.canDefer) {
        // Re-schedule the interruption for later
        this.scheduleInterruption(interruption, 5 + Math.random() * 10); // 5-15 minutes later
      }
    }
  }

  /**
   * Add event listener
   */
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index >= 0) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  /**
   * Initialize scenario-specific events based on challenge type and config
   */
  private initializeScenarioEvents(): void {
    // Generate stakeholder messages based on scenario
    this.generateStakeholderMessages();
    
    // Generate requirement changes based on stability setting
    this.generateRequirementChanges();
    
    // Set up time constraints
    this.setupTimeConstraints();
  }

  /**
   * Schedule events throughout the simulation
   */
  private scheduleEvents(): void {
    const totalDuration = this.config.duration * 60 * 1000; // Convert to milliseconds
    
    // Schedule stakeholder messages
    this.messageQueue.forEach(message => {
      if (message.timestamp > Date.now()) {
        const delay = message.timestamp - Date.now();
        setTimeout(() => {
          if (this.isActive) {
            this.emit('message:received', { message });
          }
        }, delay);
      }
    });

    // Schedule interruptions based on frequency
    this.scheduleInterruptions();
    
    // Schedule requirement changes
    this.scheduleRequirementChanges();
    
    // Set up simulation end timer
    this.simulationTimer = setTimeout(() => {
      this.stop();
    }, totalDuration);
  }

  /**
   * Generate stakeholder messages based on challenge scenario
   */
  private generateStakeholderMessages(): void {
    const scenarios = this.getScenarioTemplates();
    const scenario = scenarios[this.config.challengeId] || scenarios.default;
    
    scenario.messages.forEach((template, index) => {
      const delay = this.calculateMessageDelay(index, template.timing);
      this.messageQueue.push({
        id: `msg-${Date.now()}-${index}`,
        from: template.from,
        role: template.role,
        message: template.message,
        priority: template.priority,
        timestamp: this.startTime + delay,
        requiresResponse: template.requiresResponse,
        impact: template.impact
      });
    });
  }

  /**
   * Generate requirement changes based on stability setting
   */
  private generateRequirementChanges(): void {
    if (this.config.requirementStability === 'stable') return;
    
    const changeCount = this.config.requirementStability === 'volatile' ? 3 : 1;
    
    for (let i = 0; i < changeCount; i++) {
      const change: RequirementChange = {
        id: `req-change-${Date.now()}-${i}`,
        type: this.getRandomChangeType(),
        description: this.generateChangeDescription(),
        impact: this.getRandomImpact(),
        timeToImplement: 5 + Math.random() * 15, // 5-20 minutes
        stakeholder: this.getRandomStakeholder(),
        justification: this.generateJustification()
      };
      
      this.requirementChanges.push(change);
    }
  }

  /**
   * Schedule interruptions based on frequency setting
   */
  private scheduleInterruptions(): void {
    const frequencies = {
      low: 2,
      medium: 4,
      high: 6,
      extreme: 10
    };
    
    const interruptionCount = frequencies[this.config.interruptionFrequency];
    const duration = this.config.duration * 60 * 1000;
    
    for (let i = 0; i < interruptionCount; i++) {
      const delay = Math.random() * duration;
      const interruption = this.generateInterruption();
      
      setTimeout(() => {
        if (this.isActive) {
          this.activeInterruptions.push(interruption);
          this.emit('interruption:triggered', { interruption });
        }
      }, delay);
    }
  }

  /**
   * Generate a random interruption event
   */
  private generateInterruption(): InterruptionEvent {
    const types = ['slack', 'email', 'meeting', 'phone', 'system-alert'];
    const type = types[Math.floor(Math.random() * types.length)] as any;
    
    const templates = {
      slack: {
        title: 'Slack Notification',
        description: 'New message in #general channel',
        duration: 30,
        canDefer: true,
        priority: 'medium' as const
      },
      email: {
        title: 'Email Alert',
        description: 'Urgent email from client',
        duration: 60,
        canDefer: true,
        priority: 'high' as const
      },
      meeting: {
        title: 'Meeting Reminder',
        description: 'Daily standup in 5 minutes',
        duration: 900, // 15 minutes
        canDefer: false,
        priority: 'high' as const
      },
      phone: {
        title: 'Phone Call',
        description: 'Call from support team',
        duration: 180,
        canDefer: true,
        priority: 'medium' as const
      },
      'system-alert': {
        title: 'System Alert',
        description: 'Server monitoring alert',
        duration: 45,
        canDefer: false,
        priority: 'high' as const
      }
    };
    
    const template = templates[type];
    
    return {
      id: `int-${Date.now()}-${Math.random()}`,
      type,
      ...template
    };
  }

  /**
   * Calculate message delay based on timing preference
   */
  private calculateMessageDelay(index: number, timing: 'early' | 'mid' | 'late'): number {
    const totalDuration = this.config.duration * 60 * 1000;
    
    switch (timing) {
      case 'early':
        return Math.random() * (totalDuration * 0.3);
      case 'mid':
        return (totalDuration * 0.3) + Math.random() * (totalDuration * 0.4);
      case 'late':
        return (totalDuration * 0.7) + Math.random() * (totalDuration * 0.3);
      default:
        return Math.random() * totalDuration;
    }
  }

  /**
   * Handle message response and trigger follow-up events
   */
  private handleMessageResponse(message: StakeholderMessage): void {
    // Generate follow-up messages or events based on the original message
    if (message.impact === 'requirements') {
      // Trigger a requirement change
      const change: RequirementChange = {
        id: `follow-up-${Date.now()}`,
        type: 'modification',
        description: 'Updated requirements based on stakeholder feedback',
        impact: 'moderate',
        timeToImplement: 10,
        stakeholder: message.from,
        justification: 'Stakeholder clarification needed'
      };
      
      this.requirementChanges.push(change);
      this.emit('requirement:added', { change });
    }
  }

  /**
   * Adjust time constraints based on requirement changes
   */
  private adjustTimeConstraints(change: RequirementChange): void {
    // Reduce available time based on change impact
    const timeReduction = {
      minor: 2,
      moderate: 5,
      major: 10
    };
    
    const reduction = timeReduction[change.impact] * 60 * 1000; // Convert to milliseconds
    
    this.config.timeConstraints.forEach(constraint => {
      constraint.timeRemaining = Math.max(0, constraint.timeRemaining - reduction / (60 * 1000));
    });
    
    this.emit('timeline:adjusted', { change, reduction });
  }

  /**
   * Schedule interruption for later
   */
  private scheduleInterruption(interruption: InterruptionEvent, delayMinutes: number): void {
    setTimeout(() => {
      if (this.isActive) {
        this.activeInterruptions.push(interruption);
        this.emit('interruption:triggered', { interruption });
      }
    }, delayMinutes * 60 * 1000);
  }

  /**
   * Schedule requirement changes throughout the simulation
   */
  private scheduleRequirementChanges(): void {
    this.requirementChanges.forEach((change, index) => {
      const delay = (index + 1) * (this.config.duration * 60 * 1000) / (this.requirementChanges.length + 1);
      
      setTimeout(() => {
        if (this.isActive) {
          this.emit('requirement:proposed', { change });
        }
      }, delay);
    });
  }

  /**
   * Set up time constraints for the challenge
   */
  private setupTimeConstraints(): void {
    // Add default time constraints if none provided
    if (this.config.timeConstraints.length === 0) {
      this.config.timeConstraints.push({
        id: 'main-deadline',
        type: 'deadline',
        description: 'Challenge completion deadline',
        timeRemaining: this.config.duration,
        severity: 'warning'
      });
    }
  }

  // Helper methods for generating random scenario content
  private getRandomChangeType(): RequirementChange['type'] {
    const types: RequirementChange['type'][] = ['addition', 'modification', 'removal', 'clarification'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private getRandomImpact(): RequirementChange['impact'] {
    const impacts: RequirementChange['impact'][] = ['minor', 'moderate', 'major'];
    return impacts[Math.floor(Math.random() * impacts.length)];
  }

  private getRandomStakeholder(): string {
    const stakeholders = ['Product Manager', 'UX Designer', 'QA Lead', 'Tech Lead', 'Client'];
    return stakeholders[Math.floor(Math.random() * stakeholders.length)];
  }

  private generateChangeDescription(): string {
    const descriptions = [
      'Update the color scheme to match brand guidelines',
      'Add validation for edge case scenarios',
      'Modify API response format for better performance',
      'Include accessibility features for screen readers',
      'Change database schema to support new requirements'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private generateJustification(): string {
    const justifications = [
      'Client feedback from user testing session',
      'Compliance requirements discovered during review',
      'Performance optimization needed for production',
      'Security audit recommendations',
      'Business stakeholder priority change'
    ];
    return justifications[Math.floor(Math.random() * justifications.length)];
  }

  /**
   * Get scenario-specific message templates
   */
  private getScenarioTemplates() {
    return {
      'fe-001': { // E-commerce Product Gallery Crisis
        messages: [
          {
            from: 'Sarah Chen',
            role: 'Product Manager',
            message: 'The gallery is completely broken on mobile! Black Friday traffic is already starting. This is our biggest revenue day.',
            priority: 'urgent' as const,
            timing: 'early' as const,
            requiresResponse: true,
            impact: 'timeline' as const
          },
          {
            from: 'Mike Rodriguez',
            role: 'QA Lead',
            message: 'I\'m seeing issues with image loading on slower connections. Performance is critical here.',
            priority: 'high' as const,
            timing: 'early' as const,
            requiresResponse: false,
            impact: 'requirements' as const
          },
          {
            from: 'Lisa Park',
            role: 'UX Designer',
            message: 'Can we make sure the fix maintains the new design system? The CEO specifically mentioned this.',
            priority: 'medium' as const,
            timing: 'mid' as const,
            requiresResponse: true,
            impact: 'constraints' as const
          }
        ]
      },
      'be-001': { // Payment Processing System Outage
        messages: [
          {
            from: 'David Kim',
            role: 'DevOps Engineer',
            message: 'Payment gateway is throwing 500s. We\'ve lost $25K in the last hour. All hands on deck!',
            priority: 'urgent' as const,
            timing: 'early' as const,
            requiresResponse: true,
            impact: 'timeline' as const
          },
          {
            from: 'Jennifer Walsh',
            role: 'Finance Director',
            message: 'Customer support is getting flooded with calls. How long until this is fixed?',
            priority: 'urgent' as const,
            timing: 'early' as const,
            requiresResponse: true,
            impact: 'scope' as const
          }
        ]
      },
      default: {
        messages: [
          {
            from: 'Team Lead',
            role: 'Technical Lead',
            message: 'How\'s progress on the challenge? Let me know if you need any clarification on requirements.',
            priority: 'medium' as const,
            timing: 'mid' as const,
            requiresResponse: false,
            impact: undefined
          }
        ]
      }
    };
  }
}

/**
 * Factory function to create scenario simulation based on challenge
 */
export function createScenarioSimulation(
  challengeId: string,
  duration: number = 30,
  options: Partial<ScenarioSimulationConfig> = {}
): ScenarioSimulation {
  const config: ScenarioSimulationConfig = {
    challengeId,
    duration,
    interruptionFrequency: options.interruptionFrequency || 'medium',
    stakeholderActivity: options.stakeholderActivity || 'normal',
    requirementStability: options.requirementStability || 'evolving',
    timeConstraints: options.timeConstraints || []
  };

  return new ScenarioSimulation(config);
}