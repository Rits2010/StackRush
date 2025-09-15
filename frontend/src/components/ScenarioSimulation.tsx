import React, { useState, useEffect, useCallback } from 'react';
import { 
  ScenarioSimulation, 
  StakeholderMessage, 
  RequirementChange, 
  InterruptionEvent,
  createScenarioSimulation 
} from '../services/scenarioSimulation';
import { Bell, Clock, AlertTriangle, MessageSquare, X, CheckCircle, XCircle } from 'lucide-react';

interface ScenarioSimulationProps {
  challengeId: string;
  duration: number;
  onSimulationEvent?: (event: string, data: any) => void;
}

export const ScenarioSimulationPanel: React.FC<ScenarioSimulationProps> = ({
  challengeId,
  duration,
  onSimulationEvent
}) => {
  const [simulation, setSimulation] = useState<ScenarioSimulation | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState<StakeholderMessage[]>([]);
  const [requirementChanges, setRequirementChanges] = useState<RequirementChange[]>([]);
  const [interruptions, setInterruptions] = useState<InterruptionEvent[]>([]);
  const [simulationStatus, setSimulationStatus] = useState<any>(null);

  // Initialize simulation
  useEffect(() => {
    const sim = createScenarioSimulation(challengeId, duration, {
      interruptionFrequency: 'medium',
      stakeholderActivity: 'normal',
      requirementStability: 'evolving'
    });

    // Set up event listeners
    sim.on('simulation:started', (data) => {
      setIsActive(true);
      onSimulationEvent?.('simulation:started', data);
    });

    sim.on('simulation:stopped', (data) => {
      setIsActive(false);
      onSimulationEvent?.('simulation:stopped', data);
    });

    sim.on('message:received', (data) => {
      setMessages(prev => [...prev, data.message]);
      onSimulationEvent?.('message:received', data);
    });

    sim.on('requirement:proposed', (data) => {
      setRequirementChanges(prev => [...prev, data.change]);
      onSimulationEvent?.('requirement:proposed', data);
    });

    sim.on('interruption:triggered', (data) => {
      setInterruptions(prev => [...prev, data.interruption]);
      onSimulationEvent?.('interruption:triggered', data);
    });

    setSimulation(sim);

    return () => {
      sim.stop();
    };
  }, [challengeId, duration, onSimulationEvent]);

  // Update simulation status periodically
  useEffect(() => {
    if (!simulation || !isActive) return;

    const interval = setInterval(() => {
      setSimulationStatus(simulation.getStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, [simulation, isActive]);

  const handleStartSimulation = useCallback(() => {
    simulation?.start();
  }, [simulation]);

  const handleStopSimulation = useCallback(() => {
    simulation?.stop();
  }, [simulation]);

  const handleMessageAction = useCallback((messageId: string) => {
    simulation?.markMessageHandled(messageId);
    setMessages(prev => prev.filter(m => m.id !== messageId));
  }, [simulation]);

  const handleRequirementChange = useCallback((changeId: string, accepted: boolean) => {
    simulation?.handleRequirementChange(changeId, accepted);
    setRequirementChanges(prev => prev.filter(c => c.id !== changeId));
  }, [simulation]);

  const handleInterruption = useCallback((interruptionId: string, action: 'defer' | 'handle') => {
    simulation?.handleInterruption(interruptionId, action);
    setInterruptions(prev => prev.filter(i => i.id !== interruptionId));
  }, [simulation]);

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!simulation) return null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Workplace Simulation
            </h3>
          </div>
          <div className="flex items-center space-x-3">
            {simulationStatus && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>{formatTime(simulationStatus.remainingTime)}</span>
              </div>
            )}
            {!isActive ? (
              <button
                onClick={handleStartSimulation}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
              >
                Start Simulation
              </button>
            ) : (
              <button
                onClick={handleStopSimulation}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
              >
                Stop Simulation
              </button>
            )}
          </div>
        </div>
        
        {simulationStatus && isActive && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${simulationStatus.progress * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Stakeholder Messages */}
        {messages.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages ({messages.length})
            </h4>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg border ${getPriorityColor(message.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium">{message.from}</span>
                      <span className="text-xs text-gray-500">({message.role})</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(message.priority)}`}>
                        {message.priority}
                      </span>
                    </div>
                    <p className="text-sm">{message.message}</p>
                  </div>
                  <button
                    onClick={() => handleMessageAction(message.id)}
                    className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Requirement Changes */}
        {requirementChanges.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Requirement Changes ({requirementChanges.length})
            </h4>
            {requirementChanges.map((change) => (
              <div
                key={change.id}
                className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        {change.type.charAt(0).toUpperCase() + change.type.slice(1)}
                      </span>
                      <span className="text-xs text-yellow-600 dark:text-yellow-400">
                        by {change.stakeholder}
                      </span>
                      <span className="text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded">
                        {change.impact} impact
                      </span>
                    </div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                      {change.description}
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                      Estimated time: {change.timeToImplement} minutes
                    </p>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => handleRequirementChange(change.id, true)}
                      className="p-1 text-green-600 hover:text-green-700 transition-colors"
                      title="Accept change"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRequirementChange(change.id, false)}
                      className="p-1 text-red-600 hover:text-red-700 transition-colors"
                      title="Reject change"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Interruptions */}
        {interruptions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Interruptions ({interruptions.length})
            </h4>
            {interruptions.map((interruption) => (
              <div
                key={interruption.id}
                className={`p-3 rounded-lg border ${getPriorityColor(interruption.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium">{interruption.title}</span>
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                        {interruption.type}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{interruption.description}</p>
                    <p className="text-xs text-gray-500">
                      Duration: {Math.floor(interruption.duration / 60)} minutes
                    </p>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => handleInterruption(interruption.id, 'handle')}
                      className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                    >
                      Handle Now
                    </button>
                    {interruption.canDefer && (
                      <button
                        onClick={() => handleInterruption(interruption.id, 'defer')}
                        className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                      >
                        Defer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isActive && messages.length === 0 && requirementChanges.length === 0 && interruptions.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Start the simulation to experience realistic workplace scenarios</p>
          </div>
        )}

        {isActive && messages.length === 0 && requirementChanges.length === 0 && interruptions.length === 0 && (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <p className="text-sm">Simulation running... Events will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScenarioSimulationPanel;