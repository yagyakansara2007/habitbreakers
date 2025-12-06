import { Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Habit } from '@/hooks/useHabits';
import { Button } from '@/components/ui/button';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

export function HabitCard({ habit, isCompleted, onToggle, onDelete }: HabitCardProps) {
  return (
    <div 
      className={cn(
        "group relative p-4 rounded-2xl border transition-all duration-300",
        isCompleted 
          ? "bg-primary/10 border-primary/30" 
          : "bg-card border-border hover:border-primary/30"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Completion Button */}
        <button
          onClick={onToggle}
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300",
            isCompleted 
              ? "bg-primary text-primary-foreground scale-110" 
              : "bg-muted hover:bg-primary/20"
          )}
        >
          {isCompleted ? <Check className="w-6 h-6" /> : habit.icon}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-semibold text-foreground truncate transition-all",
            isCompleted && "line-through opacity-70"
          )}>
            {habit.title}
          </h3>
          {habit.description && (
            <p className="text-sm text-muted-foreground truncate">
              {habit.description}
            </p>
          )}
          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
            {habit.category}
          </span>
        </div>

        {/* Delete Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Streak indicator */}
      {isCompleted && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-scale-in">
          <span className="text-xs text-primary-foreground">✓</span>
        </div>
      )}
    </div>
  );
}
