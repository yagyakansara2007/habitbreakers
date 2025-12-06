import { TrendingUp, Target, Flame, Award } from 'lucide-react';

interface ProgressCardProps {
  completed: number;
  total: number;
}

export function ProgressCard({ completed, total }: ProgressCardProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  const getMessage = () => {
    if (total === 0) return "Add your first habit to get started!";
    if (percentage === 100) return "Perfect day! You're unstoppable! 🎉";
    if (percentage >= 75) return "Almost there! Keep pushing! 💪";
    if (percentage >= 50) return "Great progress! Stay focused! 🎯";
    if (percentage >= 25) return "Good start! Build momentum! 🚀";
    return "Every journey starts with one step! 🌟";
  };

  return (
    <div className="bg-gradient-hero rounded-3xl p-6 text-primary-foreground relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5" />
          <span className="text-sm font-medium opacity-90">Today's Progress</span>
        </div>
        
        {/* Progress Circle */}
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="opacity-20"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * percentage) / 100}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{percentage}%</span>
            </div>
          </div>
          
          <div className="flex-1">
            <p className="text-lg font-semibold mb-1">
              {completed} of {total} habits
            </p>
            <p className="text-sm opacity-80">{getMessage()}</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
          <div className="text-center">
            <Target className="w-5 h-5 mx-auto mb-1 opacity-80" />
            <p className="text-lg font-bold">{total}</p>
            <p className="text-xs opacity-70">Total</p>
          </div>
          <div className="text-center">
            <Flame className="w-5 h-5 mx-auto mb-1 opacity-80" />
            <p className="text-lg font-bold">{completed}</p>
            <p className="text-xs opacity-70">Done</p>
          </div>
          <div className="text-center">
            <Award className="w-5 h-5 mx-auto mb-1 opacity-80" />
            <p className="text-lg font-bold">{total - completed}</p>
            <p className="text-xs opacity-70">Left</p>
          </div>
        </div>
      </div>
    </div>
  );
}
