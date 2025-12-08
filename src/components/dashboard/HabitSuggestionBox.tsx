import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Habit, HabitCompletion } from '@/hooks/useHabits';
import { supabase } from '@/integrations/supabase/client';
import { ThumbsUp, ThumbsDown, Star, ChevronDown, ChevronUp, HelpCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HabitSuggestionBoxProps {
  habit: Habit;
  isCompleted: boolean;
  durationMinutes?: number;
}

interface Suggestion {
  pros: string[];
  cons: string[];
  suggestions: string[];
  streakCount: number;
  weeklyConsistency: number;
}

export function HabitSuggestionBox({ habit, isCompleted, durationMinutes }: HabitSuggestionBoxProps) {
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [helpful, setHelpful] = useState<boolean | null>(null);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      // Fetch last 7 days of completions for this habit
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: completions } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_id', habit.id)
        .gte('completed_at', sevenDaysAgo.toISOString())
        .order('completed_at', { ascending: false });

      const completionCount = completions?.length || 0;
      const weeklyConsistency = Math.round((completionCount / 7) * 100);
      const streakCount = calculateStreak(completions || []);

      // Generate pros/cons based on data
      const pros: string[] = [];
      const cons: string[] = [];
      const suggestions: string[] = [];

      if (isCompleted) {
        pros.push(`Great job completing ${habit.title} today!`);
        if (streakCount > 1) pros.push(`You're on a ${streakCount}-day streak! 🔥`);
        if (weeklyConsistency >= 70) pros.push('Excellent weekly consistency!');
      }

      if (durationMinutes && durationMinutes > 0) {
        if (durationMinutes >= habit.target_count * 10) {
          pros.push(`You spent ${durationMinutes} minutes - above your target!`);
        } else {
          cons.push(`Time spent was less than ideal (${durationMinutes} min)`);
          suggestions.push('Try setting a fixed time block for this habit');
        }
      }

      if (!isCompleted) {
        cons.push(`Haven't completed ${habit.title} yet today`);
        suggestions.push(`Try starting with just 2 minutes of ${habit.title}`);
      }

      if (weeklyConsistency < 50) {
        cons.push(`Weekly consistency is at ${weeklyConsistency}%`);
        suggestions.push('Consider breaking this habit into smaller steps');
      }

      // Always add some helpful suggestions
      if (suggestions.length === 0) {
        suggestions.push('Keep up the momentum!');
        suggestions.push(`Challenge: Add 5 extra minutes to ${habit.title} today`);
      }

      setSuggestion({
        pros,
        cons,
        suggestions,
        streakCount,
        weeklyConsistency
      });
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (completions: HabitCompletion[]): number => {
    if (completions.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasCompletion = completions.some(c => 
        c.completed_at.split('T')[0] === dateStr
      );
      
      if (hasCompletion) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  };

  useEffect(() => {
    fetchSuggestions();
  }, [habit.id, isCompleted, durationMinutes]);

  if (loading) {
    return (
      <Card className="p-3 bg-muted/50 animate-pulse">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Analyzing...</span>
        </div>
      </Card>
    );
  }

  if (!suggestion) return null;

  return (
    <Card className="p-4 bg-gradient-to-br from-background to-muted/30 border-border/50 space-y-3">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{habit.icon}</span>
          <div>
            <h4 className="font-medium text-foreground">{habit.title}</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>🔥 {suggestion.streakCount} day streak</span>
              <span>•</span>
              <span>📊 {suggestion.weeklyConsistency}% weekly</span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-muted-foreground"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-500",
            suggestion.weeklyConsistency >= 70 ? "bg-green-500" :
            suggestion.weeklyConsistency >= 40 ? "bg-yellow-500" : "bg-red-400"
          )}
          style={{ width: `${suggestion.weeklyConsistency}%` }}
        />
      </div>

      {expanded && (
        <div className="space-y-4 pt-2 animate-fade-in">
          {/* Pros */}
          {suggestion.pros.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm font-medium">Today's Wins</span>
              </div>
              <ul className="space-y-1 ml-6">
                {suggestion.pros.map((pro, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-green-500">👍</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cons */}
          {suggestion.cons.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-orange-500">
                <ThumbsDown className="w-4 h-4" />
                <span className="text-sm font-medium">Areas to Improve</span>
              </div>
              <ul className="space-y-1 ml-6">
                {suggestion.cons.map((con, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-orange-500">⚠️</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">AI Suggestions</span>
            </div>
            <ul className="space-y-1 ml-6">
              {suggestion.suggestions.map((sug, i) => (
                <li key={i} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-primary">⭐</span>
                  {sug}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-xs text-muted-foreground"
            >
              <HelpCircle className="w-3 h-3 mr-1" />
              Why this suggestion?
            </Button>
            <div className="flex-1" />
            <Button
              variant={helpful === true ? "default" : "ghost"}
              size="sm"
              onClick={() => setHelpful(true)}
              className="text-xs"
            >
              👍 Helpful
            </Button>
            <Button
              variant={helpful === false ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setHelpful(false)}
              className="text-xs"
            >
              👎
            </Button>
          </div>

          {showExplanation && (
            <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              These suggestions are based on your {suggestion.streakCount}-day streak, 
              {suggestion.weeklyConsistency}% weekly consistency, and today's completion status.
              The AI analyzes patterns in your behavior to provide personalized recommendations.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
