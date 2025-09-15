import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ScenarioSimulation, 
  StakeholderMessage, 
  RequirementChange, 
  InterruptionEvent,
  createScenarioSimulation,
  ScenarioSimulationConfig 
} from '../services/scenarioSimulation';
import { ScenarioConfigService } from '../services/scenarioConfig';

interface UseScenarioSimulationOptions {
  challengeId: string;
  duration?: number;
  autoStart?: boolean;
  config?: Partial<ScenarioSimulationConfig>;
  onEvent?: (event: string, data: any) => void;
}

interface ScenarioSimulationState {
  isActive: boolean;
  messages: StakeholderMessage[];
  requirementChanges: RequirementChange[];
  interruptions: InterruptionEvent[];
  status: {
    elapsedTime: number;
    remainingTime: number;
    progress: number;
    pendingMessages: number;
    activeInterruptions: number;
  } | null;
  stats: {
    messagesHandled: number;
    changesAccepted: number;
    changesRejected: number;
    interruptionsHandled: number;
    interruptionsDeferred: number;
  };
}

export function useScenarioSimulation(options: UseScenarioSimulationOptions) {
  const simulationRef = useRef<ScenarioSimulation | null>(null);
  const [state, setState] = useState<ScenarioSimulationState>({
    isActive: false,
    messages: [],
    requirementChanges: [],
    interruptions: [],
    status: null,
    stats: {
      messagesHandled: 0,
      changesAccepted: 0,
      changesRejected: 0,
      interruptionsHandled: 0,
      interruptionsDeferred: 0
    }
  });

  // Initialize simulation
  useEffect(() => {
    // Get scenario configuration from service
    const scenarioConfig = options.config || 
      ScenarioConfigService.getConfigForChallenge(options.challengeId, options.duration || 30);
    
    const simulation = createScenarioSimulation(
      options.challengeId,
      options.duration || 30,
      scenarioConfig
    );

    simulationRef.current = simulation;

    // Set up event listeners
    const eventHandlers = {
      'simulation:started': (data: any) => {
        setState(prev => ({ ...prev, isActive: true }));
        options.onEvent?.('simulation:started', data);
      },

      'simulation:stopped': (data: any) => {
        setState(prev => ({ ...prev, isActive: false }));
        options.onEvent?.('simulation:stopped', data);
      },

      'message:received': (data: { message: StakeholderMessage }) => {
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, data.message]
        }));
        options.onEvent?.('message:received', data);
      },

      'message:handled': (data: { message: StakeholderMessage }) => {
        setState(prev => ({
          ...prev,
          messages: prev.messages.filter(m => m.id !== data.message.id),
          stats: {
            ...prev.stats,
            messagesHandled: prev.stats.messagesHandled + 1
          }
        }));
        options.onEvent?.('message:handled', data);
      },

      'requirement:proposed': (data: { change: RequirementChange }) => {
        setState(prev => ({
          ...prev,
          requirementChanges: [...prev.requirementChanges, data.change]
        }));
        options.onEvent?.('requirement:proposed', data);
      },

      'requirement:changed': (data: { change: RequirementChange; accepted: boolean }) => {
        setState(prev => ({
          ...prev,
          requirementChanges: prev.requirementChanges.filter(c => c.id !== data.change.id),
          stats: {
            ...prev.stats,
            changesAccepted: data.accepted ? prev.stats.changesAccepted + 1 : prev.stats.changesAccepted,
            changesRejected: !data.accepted ? prev.stats.changesRejected + 1 : prev.stats.changesRejected
          }
        }));
        options.onEvent?.('requirement:changed', data);
      },

      'interruption:triggered': (data: { interruption: InterruptionEvent }) => {
        setState(prev => ({
          ...prev,
          interruptions: [...prev.interruptions, data.interruption]
        }));
        options.onEvent?.('interruption:triggered', data);
      },

      'interruption:handled': (data: { interruption: InterruptionEvent; action: 'defer' | 'handle' }) => {
        setState(prev => ({
          ...prev,
          interruptions: prev.interruptions.filter(i => i.id !== data.interruption.id),
          stats: {
            ...prev.stats,
            interruptionsHandled: data.action === 'handle' ? prev.stats.interruptionsHandled + 1 : prev.stats.interruptionsHandled,
            interruptionsDeferred: data.action === 'defer' ? prev.stats.interruptionsDeferred + 1 : prev.stats.interruptionsDeferred
          }
        }));
        options.onEvent?.('interruption:handled', data);
      },

      'timeline:adjusted': (data: any) => {
        options.onEvent?.('timeline:adjusted', data);
      }
    };

    // Register event handlers
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      simulation.on(event, handler);
    });

    // Auto-start if requested
    if (options.autoStart) {
      simulation.start();
    }

    // Cleanup on unmount
    return () => {
      simulation.stop();
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        simulation.off(event, handler);
      });
    };
  }, [options.challengeId, options.duration, options.autoStart]);

  // Update status periodically when active
  useEffect(() => {
    if (!simulationRef.current || !state.isActive) return;

    const interval = setInterval(() => {
      const status = simulationRef.current?.getStatus();
      if (status) {
        setState(prev => ({ ...prev, status }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isActive]);

  // Control functions
  const start = useCallback(() => {
    simulationRef.current?.start();
  }, []);

  const stop = useCallback(() => {
    simulationRef.current?.stop();
  }, []);

  const handleMessage = useCallback((messageId: string) => {
    simulationRef.current?.markMessageHandled(messageId);
  }, []);

  const handleRequirementChange = useCallback((changeId: string, accepted: boolean) => {
    simulationRef.current?.handleRequirementChange(changeId, accepted);
  }, []);

  const handleInterruption = useCallback((interruptionId: string, action: 'defer' | 'handle') => {
    simulationRef.current?.handleInterruption(interruptionId, action);
  }, []);

  const getSimulationSummary = useCallback(() => {
    if (!state.status) return null;

    const totalEvents = state.stats.messagesHandled + 
                       state.stats.changesAccepted + 
                       state.stats.changesRejected + 
                       state.stats.interruptionsHandled + 
                       state.stats.interruptionsDeferred;

    const responseRate = state.stats.messagesHandled / Math.max(1, state.stats.messagesHandled + state.messages.length);
    const adaptabilityScore = (state.stats.changesAccepted + state.stats.interruptionsHandled) / Math.max(1, totalEvents);
    const focusScore = 1 - (state.stats.interruptionsHandled / Math.max(1, state.stats.interruptionsHandled + state.stats.interruptionsDeferred));

    return {
      totalEvents,
      responseRate: Math.round(responseRate * 100),
      adaptabilityScore: Math.round(adaptabilityScore * 100),
      focusScore: Math.round(focusScore * 100),
      timeUtilization: Math.round(state.status.progress * 100),
      stats: state.stats
    };
  }, [state.status, state.stats, state.messages.length]);

  return {
    // State
    isActive: state.isActive,
    messages: state.messages,
    requirementChanges: state.requirementChanges,
    interruptions: state.interruptions,
    status: state.status,
    stats: state.stats,

    // Actions
    start,
    stop,
    handleMessage,
    handleRequirementChange,
    handleInterruption,

    // Computed values
    summary: getSimulationSummary(),

    // Utility functions
    formatTime: (milliseconds: number) => {
      const minutes = Math.floor(milliseconds / 60000);
      const seconds = Math.floor((milliseconds % 60000) / 1000);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },

    getPriorityColor: (priority: string) => {
      switch (priority) {
        case 'urgent': return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800';
        case 'high': return 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800';
        case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800';
        case 'low': return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800';
        default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700';
      }
    }
  };
}

export default useScenarioSimulation;