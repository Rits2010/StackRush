/**
 * Scenario Configuration Service
 * 
 * Manages scenario-specific simulation settings and configurations
 */

import { ScenarioSimulationConfig } from './scenarioSimulation';

export interface ScenarioProfile {
  id: string;
  name: string;
  description: string;
  config: Partial<ScenarioSimulationConfig>;
  tags: string[];
}

export class ScenarioConfigService {
  private static profiles: ScenarioProfile[] = [
    {
      id: 'startup-crunch',
      name: 'Startup Crunch Mode',
      description: 'High-pressure startup environment with frequent interruptions and changing requirements',
      config: {
        interruptionFrequency: 'extreme',
        stakeholderActivity: 'chaotic',
        requirementStability: 'volatile'
      },
      tags: ['high-pressure', 'startup', 'fast-paced']
    },
    {
      id: 'enterprise-stable',
      name: 'Enterprise Environment',
      description: 'Structured corporate environment with moderate interruptions and stable requirements',
      config: {
        interruptionFrequency: 'medium',
        stakeholderActivity: 'normal',
        requirementStability: 'stable'
      },
      tags: ['corporate', 'structured', 'stable']
    },
    {
      id: 'crisis-mode',
      name: 'Production Crisis',
      description: 'Emergency situation with urgent fixes needed and high stakeholder pressure',
      config: {
        interruptionFrequency: 'high',
        stakeholderActivity: 'active',
        requirementStability: 'evolving'
      },
      tags: ['emergency', 'production', 'urgent']
    },
    {
      id: 'focused-development',
      name: 'Focused Development',
      description: 'Ideal development environment with minimal interruptions',
      config: {
        interruptionFrequency: 'low',
        stakeholderActivity: 'minimal',
        requirementStability: 'stable'
      },
      tags: ['focused', 'minimal-interruptions', 'ideal']
    }
  ];

  /**
   * Get all available scenario profiles
   */
  static getProfiles(): ScenarioProfile[] {
    return this.profiles;
  }

  /**
   * Get a specific scenario profile by ID
   */
  static getProfile(id: string): ScenarioProfile | null {
    return this.profiles.find(profile => profile.id === id) || null;
  }

  /**
   * Get scenario configuration for a specific challenge
   */
  static getConfigForChallenge(challengeId: string, duration: number = 30): ScenarioSimulationConfig {
    // Default configuration
    let baseConfig: ScenarioSimulationConfig = {
      challengeId,
      duration,
      interruptionFrequency: 'medium',
      stakeholderActivity: 'normal',
      requirementStability: 'evolving',
      timeConstraints: []
    };

    // Challenge-specific configurations
    const challengeConfigs: Record<string, Partial<ScenarioSimulationConfig>> = {
      'fe-001': { // E-commerce Product Gallery Crisis
        interruptionFrequency: 'high',
        stakeholderActivity: 'active',
        requirementStability: 'volatile',
        timeConstraints: [
          {
            id: 'black-friday-deadline',
            type: 'deadline',
            description: 'Black Friday launch deadline',
            timeRemaining: duration * 0.8, // 80% of total time
            severity: 'critical'
          }
        ]
      },
      'fe-002': { // Healthcare Dashboard Accessibility
        interruptionFrequency: 'medium',
        stakeholderActivity: 'active',
        requirementStability: 'stable',
        timeConstraints: [
          {
            id: 'compliance-audit',
            type: 'deadline',
            description: 'Compliance audit deadline',
            timeRemaining: duration,
            severity: 'warning'
          }
        ]
      },
      'be-001': { // Payment Processing Outage
        interruptionFrequency: 'extreme',
        stakeholderActivity: 'chaotic',
        requirementStability: 'evolving',
        timeConstraints: [
          {
            id: 'revenue-loss',
            type: 'deadline',
            description: 'Stop revenue loss',
            timeRemaining: duration * 0.5, // 50% of total time
            severity: 'critical'
          }
        ]
      },
      'be-002': { // Authentication Microservice
        interruptionFrequency: 'medium',
        stakeholderActivity: 'normal',
        requirementStability: 'evolving',
        timeConstraints: [
          {
            id: 'migration-deadline',
            type: 'deadline',
            description: 'Migration milestone',
            timeRemaining: duration,
            severity: 'warning'
          }
        ]
      },
      'dsa-001': { // Analytics Query Optimization
        interruptionFrequency: 'high',
        stakeholderActivity: 'active',
        requirementStability: 'stable',
        timeConstraints: [
          {
            id: 'business-hours',
            type: 'deadline',
            description: 'Fix before business hours end',
            timeRemaining: duration * 0.7, // 70% of total time
            severity: 'critical'
          }
        ]
      },
      'dsa-002': { // Social Media Feed Algorithm
        interruptionFrequency: 'medium',
        stakeholderActivity: 'active',
        requirementStability: 'evolving',
        timeConstraints: [
          {
            id: 'user-retention',
            type: 'deadline',
            description: 'Improve user retention metrics',
            timeRemaining: duration,
            severity: 'warning'
          }
        ]
      }
    };

    // Apply challenge-specific configuration
    const challengeConfig = challengeConfigs[challengeId];
    if (challengeConfig) {
      baseConfig = { ...baseConfig, ...challengeConfig };
    }

    return baseConfig;
  }

  /**
   * Get recommended scenario profile for a challenge type
   */
  static getRecommendedProfile(challengeType: string): ScenarioProfile {
    switch (challengeType) {
      case 'frontend':
        return this.getProfile('enterprise-stable') || this.profiles[0];
      case 'backend-api':
        return this.getProfile('crisis-mode') || this.profiles[0];
      case 'dsa':
        return this.getProfile('focused-development') || this.profiles[0];
      default:
        return this.profiles[1]; // Default to enterprise-stable
    }
  }

  /**
   * Create custom scenario configuration
   */
  static createCustomConfig(
    challengeId: string,
    duration: number,
    options: {
      difficulty?: 'easy' | 'medium' | 'hard' | 'extreme';
      focus?: 'interruptions' | 'requirements' | 'time-pressure' | 'balanced';
      environment?: 'startup' | 'enterprise' | 'agency' | 'freelance';
    }
  ): ScenarioSimulationConfig {
    const baseConfig = this.getConfigForChallenge(challengeId, duration);

    // Adjust based on difficulty
    if (options.difficulty) {
      const difficultyMappings = {
        easy: {
          interruptionFrequency: 'low' as const,
          stakeholderActivity: 'minimal' as const,
          requirementStability: 'stable' as const
        },
        medium: {
          interruptionFrequency: 'medium' as const,
          stakeholderActivity: 'normal' as const,
          requirementStability: 'evolving' as const
        },
        hard: {
          interruptionFrequency: 'high' as const,
          stakeholderActivity: 'active' as const,
          requirementStability: 'volatile' as const
        },
        extreme: {
          interruptionFrequency: 'extreme' as const,
          stakeholderActivity: 'chaotic' as const,
          requirementStability: 'volatile' as const
        }
      };

      Object.assign(baseConfig, difficultyMappings[options.difficulty]);
    }

    // Adjust based on focus area
    if (options.focus) {
      switch (options.focus) {
        case 'interruptions':
          baseConfig.interruptionFrequency = 'extreme';
          break;
        case 'requirements':
          baseConfig.requirementStability = 'volatile';
          baseConfig.stakeholderActivity = 'chaotic';
          break;
        case 'time-pressure':
          baseConfig.timeConstraints = baseConfig.timeConstraints.map(constraint => ({
            ...constraint,
            timeRemaining: constraint.timeRemaining * 0.6, // Reduce time by 40%
            severity: 'critical' as const
          }));
          break;
        case 'balanced':
          // Keep default balanced settings
          break;
      }
    }

    // Adjust based on environment
    if (options.environment) {
      const environmentMappings = {
        startup: {
          interruptionFrequency: 'high' as const,
          stakeholderActivity: 'active' as const,
          requirementStability: 'volatile' as const
        },
        enterprise: {
          interruptionFrequency: 'medium' as const,
          stakeholderActivity: 'normal' as const,
          requirementStability: 'stable' as const
        },
        agency: {
          interruptionFrequency: 'high' as const,
          stakeholderActivity: 'chaotic' as const,
          requirementStability: 'evolving' as const
        },
        freelance: {
          interruptionFrequency: 'low' as const,
          stakeholderActivity: 'minimal' as const,
          requirementStability: 'stable' as const
        }
      };

      Object.assign(baseConfig, environmentMappings[options.environment]);
    }

    return baseConfig;
  }

  /**
   * Validate scenario configuration
   */
  static validateConfig(config: ScenarioSimulationConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.challengeId) {
      errors.push('Challenge ID is required');
    }

    if (config.duration <= 0) {
      errors.push('Duration must be greater than 0');
    }

    if (config.duration > 180) {
      errors.push('Duration cannot exceed 180 minutes');
    }

    const validFrequencies = ['low', 'medium', 'high', 'extreme'];
    if (!validFrequencies.includes(config.interruptionFrequency)) {
      errors.push('Invalid interruption frequency');
    }

    const validActivities = ['minimal', 'normal', 'active', 'chaotic'];
    if (!validActivities.includes(config.stakeholderActivity)) {
      errors.push('Invalid stakeholder activity level');
    }

    const validStabilities = ['stable', 'evolving', 'volatile'];
    if (!validStabilities.includes(config.requirementStability)) {
      errors.push('Invalid requirement stability level');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default ScenarioConfigService;