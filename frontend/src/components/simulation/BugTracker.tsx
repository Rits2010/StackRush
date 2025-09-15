import { Bug } from 'lucide-react';
import { ProfessionalCard } from '../ui/ProfessionalCard';
import { Bug as BugType } from '../../types/simulation';

interface BugTrackerProps {
  bugs: BugType[];
}

export const BugTracker = ({ bugs }: BugTrackerProps) => (
  <ProfessionalCard className="p-6 mb-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-xl">
    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
      <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mr-2">
        <Bug className="h-3 w-3 text-white" />
      </div>
      Bug Reports ({bugs.length})
    </h3>

    {bugs.length === 0 ? (
      <div className="text-slate-600 dark:text-slate-400 text-sm">No bugs reported yet</div>
    ) : (
      <div className="space-y-3">
        {bugs.map((bug) => (
          <div 
            key={bug.id} 
            className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {bug.title}
              </div>
              <div className="text-red-400 text-xs">
                {bug.severity}
              </div>
            </div>
            <div className="text-slate-700 dark:text-slate-300 text-xs mb-2">
              {bug.description}
            </div>
            <div className="text-slate-600 dark:text-slate-400 text-xs">
              Reporter: {bug.reporter}
            </div>
          </div>
        ))}
      </div>
    )}
  </ProfessionalCard>
);
