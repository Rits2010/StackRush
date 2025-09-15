import React, { useState, useEffect } from 'react';
import { Play, Clock, Zap, Users, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { Modal } from './ui/Modal';
import { ProfessionalButton } from './ui/ProfessionalButton';

interface Challenge {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  timeLimit: string;
  distractionLevel: string;
  description: string;
  teamSize?: string;
  xp?: number;
}

interface ChallengeStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
  challenge: Challenge;
  selectedMode: string;
  modes: Array<{
    id: string;
    name: string;
    description: string;
    multiplier: number;
    features: string[];
  }>;
}

export const ChallengeStartModal: React.FC<ChallengeStartModalProps> = ({
  isOpen,
  onClose,
  onStart,
  challenge,
  selectedMode,
  modes
}) => {
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isReady, setIsReady] = useState(false);

  const currentMode = modes.find(mode => mode.id === selectedMode);

  useEffect(() => {
    if (isCountingDown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isCountingDown && countdown === 0) {
      onStart();
      setIsCountingDown(false);
      setCountdown(3);
    }
  }, [isCountingDown, countdown, onStart]);

  const handleStart = () => {
    setIsCountingDown(true);
  };

  const handleClose = () => {
    setIsCountingDown(false);
    setCountdown(3);
    setIsReady(false);
    onClose();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'Hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DSA': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Bug Fix': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Feature': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  if (isCountingDown) {
    return (
      <Modal isOpen={isOpen} onClose={() => {}} closeOnBackdrop={false} showCloseButton={false} size="md">
        <div className="p-12 text-center">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <span className="text-4xl font-bold text-white">{countdown}</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Get Ready!
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Challenge starting in {countdown} second{countdown !== 1 ? 's' : ''}...
            </p>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
              💡 Remember: Focus on the problem, manage distractions, and code under pressure!
            </p>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title="Start Challenge"
      size="lg"
      closeOnBackdrop={false}
    >
      <div className="p-6">
        {/* Challenge Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getTypeColor(challenge.type)}`}>
              {challenge.type}
            </span>
            <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getDifficultyColor(challenge.difficulty)}`}>
              {challenge.difficulty}
            </span>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {challenge.title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {challenge.description}
          </p>
        </div>

        {/* Challenge Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
            <Clock className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <div className="text-sm font-bold text-gray-900 dark:text-white">{challenge.timeLimit}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Time Limit</div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
            <Zap className="h-6 w-6 text-orange-500 mx-auto mb-2" />
            <div className="text-sm font-bold text-gray-900 dark:text-white">{challenge.distractionLevel}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Chaos Level</div>
          </div>
          
          {challenge.teamSize && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
              <Users className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-sm font-bold text-gray-900 dark:text-white">{challenge.teamSize}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Team Size</div>
            </div>
          )}
          
          {challenge.xp && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
              <Target className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <div className="text-sm font-bold text-gray-900 dark:text-white">+{challenge.xp}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">XP Reward</div>
            </div>
          )}
        </div>

        {/* Selected Mode */}
        {currentMode && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Selected Mode</h4>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-semibold text-blue-900 dark:text-blue-100">{currentMode.name}</h5>
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm bg-blue-100 dark:bg-blue-800/50 px-2 py-1 rounded">
                  {currentMode.multiplier}x XP
                </span>
              </div>
              <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">{currentMode.description}</p>
              <div className="flex flex-wrap gap-2">
                {currentMode.features.map((feature, index) => (
                  <span key={index} className="text-xs bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Rules & Expectations */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Rules & Expectations</h4>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Complete all test cases</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Your solution must pass all provided test cases to succeed</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Handle realistic distractions</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Stay focused while dealing with workplace interruptions</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Submit before time runs out</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Complete and submit your solution within the time limit</div>
              </div>
            </div>
          </div>
        </div>



        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <ProfessionalButton
            variant="secondary"
            onClick={handleClose}
            disabled={isCountingDown}
          >
            Cancel
          </ProfessionalButton>
          
          <ProfessionalButton
            variant="primary"
            onClick={handleStart}
            icon={Play}
            iconPosition="right"
            disabled={isCountingDown}
          >
            Start Challenge
          </ProfessionalButton>
        </div>
      </div>
    </Modal>
  );
};