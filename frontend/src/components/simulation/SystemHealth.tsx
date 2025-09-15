import { Activity } from 'lucide-react';
import { ProfessionalCard } from '../ui/ProfessionalCard';
import { SystemHealth as SystemHealthType } from '../../types/simulation';

interface SystemHealthProps {
  systemHealth: SystemHealthType;
}

export const SystemHealth = ({ systemHealth }: SystemHealthProps) => (
  <ProfessionalCard className="p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-xl">
    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
      <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-2">
        <Activity className="h-3 w-3 text-white" />
      </div>
      System Health
    </h3>

    <div className="space-y-3">
      {Object.entries(systemHealth).map(([system, health]) => (
        <div key={system} className="flex items-center justify-between">
          <span className="text-slate-700 dark:text-slate-300 capitalize font-medium">
            {system}
          </span>
          <div className="flex items-center space-x-2">
            <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  health >= 90 
                    ? 'bg-green-500' 
                    : health >= 70 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                }`}
                style={{ width: `${health}%` }}
              />
            </div>
            <span className="text-slate-900 dark:text-white text-sm font-bold">
              {health}%
            </span>
          </div>
        </div>
      ))}
    </div>
  </ProfessionalCard>
);
