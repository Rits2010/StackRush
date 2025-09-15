import { ArrowLeft, Maximize2, Minimize2, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChallengeHeaderProps {
  title: string;
  mode: string;
  type: string;
  isFullscreen: boolean;
  soundEnabled: boolean;
  onFullscreenToggle: () => void;
  onSoundToggle: () => void;
}

export const ChallengeHeader = ({
  title,
  mode,
  type,
  isFullscreen,
  soundEnabled,
  onFullscreenToggle,
  onSoundToggle,
}: ChallengeHeaderProps) => {
  const navigate = useNavigate();

  if (isFullscreen) return null;

  return (
    <div className="p-6 border-b border-slate-200 border-opacity-50 dark:border-slate-700 dark:border-opacity-50 bg-white bg-opacity-95 dark:bg-slate-900 dark:bg-opacity-95 backdrop-blur-xl shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/portal/challenges')}
          className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors duration-200 font-medium group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
          Exit Simulation
        </button>

        <div className="flex items-center space-x-4">
          <div className="text-slate-900 dark:text-white font-bold text-lg">{title}</div>
          <div className="text-slate-600 dark:text-slate-400 font-medium">Mode: {mode}</div>
          <div className="text-slate-600 dark:text-slate-400 font-medium">Type: {type.toUpperCase()}</div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onSoundToggle}
            className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:bg-opacity-50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          >
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>
          <button
            onClick={onFullscreenToggle}
            className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:bg-opacity-50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
