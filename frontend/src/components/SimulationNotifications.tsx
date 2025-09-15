import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, AlertTriangle, Clock, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useScenarioSimulation } from '../hooks/useScenarioSimulation';

interface SimulationNotificationsProps {
  challengeId: string;
  duration?: number;
  className?: string;
}

export const SimulationNotifications: React.FC<SimulationNotificationsProps> = ({
  challengeId,
  duration = 30,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showStartPrompt, setShowStartPrompt] = useState(true);

  const simulation = useScenarioSimulation({
    challengeId,
    duration,
    autoStart: false,
    onEvent: (event, data) => {
      // Auto-expand when new events arrive
      if (event.includes('received') || event.includes('triggered') || event.includes('proposed')) {
        setIsExpanded(true);
      }
    }
  });

  const totalNotifications = simulation.messages.length + 
                            simulation.requirementChanges.length + 
                            simulation.interruptions.length;

  const hasUrgentItems = simulation.messages.some(m => m.priority === 'urgent') ||
                        simulation.interruptions.some(i => i.priority === 'high');

  useEffect(() => {
    if (simulation.isActive) {
      setShowStartPrompt(false);
    }
  }, [simulation.isActive]);

  if (!challengeId) return null;

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      {/* <div 
        className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Bell className={`h-4 w-4 ${hasUrgentItems ? 'text-red-500' : 'text-blue-500'}`} />
              {totalNotifications > 0 && (
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {totalNotifications > 9 ? '9+' : totalNotifications}
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Workplace Simulation
            </span>
            {simulation.status && simulation.isActive && (
              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="h-3 w-3" />
                <span>{simulation.formatTime(simulation.status.remainingTime)}</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {!simulation.isActive && showStartPrompt && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  simulation.start();
                }}
                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
              >
                Start
              </button>
            )}
            {simulation.isActive && (
              <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <div 
                  className="bg-blue-500 h-1 rounded-full transition-all duration-1000"
                  style={{ width: `${(simulation.status?.progress || 0) * 100}%` }}
                />
              </div>
            )}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </div> */}

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-3 space-y-3 max-h-80 overflow-y-auto">
          {/* Control Buttons */}
          {!simulation.isActive ? (
            <div className="flex space-x-2">
              <button
                onClick={simulation.start}
                className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
              >
                Start Simulation
              </button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={simulation.stop}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Stop
              </button>
              {simulation.status && (
                <div className="flex-1 text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
                  Progress: {Math.round((simulation.status.progress || 0) * 100)}%
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          {simulation.messages.map((message) => (
            <div
              key={message.id}
              className={`p-2 rounded border text-sm ${simulation.getPriorityColor(message.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <MessageSquare className="h-3 w-3" />
                    <span className="font-medium text-xs">{message.from}</span>
                    <span className={`text-xs px-1 py-0.5 rounded ${simulation.getPriorityColor(message.priority)}`}>
                      {message.priority}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed">{message.message}</p>
                </div>
                <button
                  onClick={() => simulation.handleMessage(message.id)}
                  className="ml-2 p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}

          {/* Requirement Changes */}
          {simulation.requirementChanges.map((change) => (
            <div
              key={change.id}
              className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <AlertTriangle className="h-3 w-3 text-yellow-600" />
                    <span className="font-medium text-xs text-yellow-800 dark:text-yellow-200">
                      Requirement Change
                    </span>
                    <span className="text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-1 py-0.5 rounded">
                      {change.impact}
                    </span>
                  </div>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-1">
                    {change.description}
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    +{change.timeToImplement}min • {change.stakeholder}
                  </p>
                </div>
                <div className="flex space-x-1 ml-2">
                  <button
                    onClick={() => simulation.handleRequirementChange(change.id, true)}
                    className="px-2 py-0.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => simulation.handleRequirementChange(change.id, false)}
                    className="px-2 py-0.5 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                  >
                    ✗
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Interruptions */}
          {simulation.interruptions.map((interruption) => (
            <div
              key={interruption.id}
              className={`p-2 rounded border text-sm ${simulation.getPriorityColor(interruption.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Bell className="h-3 w-3" />
                    <span className="font-medium text-xs">{interruption.title}</span>
                    <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-1 py-0.5 rounded">
                      {interruption.type}
                    </span>
                  </div>
                  <p className="text-xs mb-1">{interruption.description}</p>
                  <p className="text-xs text-gray-500">
                    {Math.floor(interruption.duration / 60)}min
                  </p>
                </div>
                <div className="flex space-x-1 ml-2">
                  <button
                    onClick={() => simulation.handleInterruption(interruption.id, 'handle')}
                    className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  >
                    Handle
                  </button>
                  {interruption.canDefer && (
                    <button
                      onClick={() => simulation.handleInterruption(interruption.id, 'defer')}
                      className="px-1 py-0.5 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                    >
                      Later
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {!simulation.isActive && totalNotifications === 0 && (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <Bell className="h-6 w-6 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Start simulation for realistic workplace events</p>
            </div>
          )}

          {simulation.isActive && totalNotifications === 0 && (
            <div className="text-center py-2 text-gray-500 dark:text-gray-400">
              <p className="text-xs">Simulation active • Events will appear here</p>
            </div>
          )}

          {/* Stats Summary */}
          {simulation.summary && simulation.isActive && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {simulation.summary.responseRate}%
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">Response</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {simulation.summary.adaptabilityScore}%
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">Adapt</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {simulation.summary.focusScore}%
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">Focus</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimulationNotifications;