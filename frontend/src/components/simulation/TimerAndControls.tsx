import { Play, Pause, RotateCcw, Send, Clock } from 'lucide-react';
import { ProfessionalButton } from '../ui/ProfessionalButton';

interface TimerAndControlsProps {
  timeRemaining: number;
  isRunning: boolean;
  onStartPause: () => void;
  onReset: () => void;
  onSubmit: () => void;
}

export const TimerAndControls = ({
  timeRemaining,
  isRunning,
  onStartPause,
  onReset,
  onSubmit,
}: TimerAndControlsProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <Clock className="h-5 w-5 text-white" />
        </div>
        <div>
          <div 
            className={`font-mono text-2xl font-bold ${
              timeRemaining < 300 ? 'text-red-500' : 'text-slate-900 dark:text-white'
            }`}
          >
            {formatTime(timeRemaining)}
          </div>
          <div className="text-xs text-gray-500">Time Remaining</div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <ProfessionalButton
          variant="outline"
          size="sm"
          icon={isRunning ? Pause : Play}
          onClick={onStartPause}
        >
          {isRunning ? 'Pause' : 'Resume'}
        </ProfessionalButton>
        
        <ProfessionalButton
          variant="outline"
          size="sm"
          icon={RotateCcw}
          onClick={onReset}
        >
          Reset
        </ProfessionalButton>
        
        <ProfessionalButton
          variant="primary"
          size="sm"
          icon={Send}
          onClick={onSubmit}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Submit
        </ProfessionalButton>
      </div>
    </div>
  );
};
