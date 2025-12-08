import { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Habit } from '@/hooks/useHabits';
import { Button } from '@/components/ui/button';
import { DurationInput } from './DurationInput';
import { HabitSuggestionBox } from './HabitSuggestionBox';

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  completionId?: string;
  onToggle: () => void;
  onDelete: () => void;
}

export function HabitCard({ habit, isCompleted, completionId, onToggle, onDelete }: HabitCardProps) {
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <div className="space-y-2">
      <div 
        className={cn(
          "group relative p-4 rounded-2xl border transition-all duration-300",
          isCompleted 
            ? "bg-primary/10 border-primary/30" 
            : "bg-card border-border hover:border-primary/30"
        )}
      >
        <div className="flex items-center gap-4">
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

          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-semibold text-foreground truncate transition-all",
              isCompleted && "line-through opacity-70"
            )}>
              {habit.title}
            </h3>
            {habit.description && (
              <p className="text-sm text-muted-foreground truncate">{habit.description}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                {habit.category}
              </span>
              <DurationInput
                habitId={habit.id}
                completionId={completionId}
                currentDuration={durationMinutes}
                targetMinutes={habit.target_count * 10}
                onDurationUpdate={setDurationMinutes}
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {isCompleted && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-scale-in">
            <span className="text-xs text-primary-foreground">✓</span>
          </div>
        )}
      </div>

      {/* Expandable Suggestion Box */}
      <button 
        onClick={() => setShowSuggestions(!showSuggestions)}
        className="text-xs text-primary hover:underline ml-4"
      >
        {showSuggestions ? 'Hide suggestions' : 'View AI suggestions'}
      </button>
      
      {showSuggestions && (
        <HabitSuggestionBox 
          habit={habit} 
          isCompleted={isCompleted}
          durationMinutes={durationMinutes}
        />
      )}
    </div>
  );
}
