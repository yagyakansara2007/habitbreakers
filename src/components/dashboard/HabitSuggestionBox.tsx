import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Habit, HabitCompletion } from '@/hooks/useHabits';
import { supabase } from '@/integrations/supabase/client';
import { ThumbsUp, ThumbsDown, Star, ChevronDown, ChevronUp, HelpCircle, Loader2, Clock, Target, Brain, Zap, TrendingUp, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface HabitSuggestionBoxProps {
  habit: Habit;
  isCompleted: boolean;
  durationMinutes?: number;
}

interface Suggestion {
  pros: { text: string; icon: string }[];
  cons: { text: string; icon: string }[];
  improvementTip: string;
  routineTip: string;
  challenge: string;
  psychologyTip: string;
  streakCount: number;
  weeklyConsistency: number;
  avgDuration: number;
  completedDays: number[];
}

const PSYCHOLOGY_TIPS = [
  "Your brain forms habits through the habit loop: cue → routine → reward. Focus on making your cue obvious!",
  "Habits compound over time. 1% better every day = 37x better in a year.",
  "Attach this habit to an existing routine (habit stacking) to make it stick.",
  "Your identity drives your habits. Say 'I am someone who...' instead of 'I want to...'",
  "Environment design beats willpower. Remove friction for good habits, add friction for bad ones.",
  "Dopamine is released in anticipation of reward. Celebrate small wins to train your brain.",
  "Missing once is an accident. Missing twice is the start of a new habit. Never miss twice!",
  "Focus on systems, not goals. You don't rise to your goals, you fall to your systems."
];

const CHALLENGES = [
  "Add 5 extra minutes today",
  "Do this habit at a different time today",
  "Share your progress with a friend",
  "Add one small variation to make it fun",
  "Complete this before any other habit today",
  "Set a reminder 10 minutes earlier",
  "Track your mood before and after",
  "Combine this with a mindfulness moment"
];

export function HabitSuggestionBox({ habit, isCompleted, durationMinutes }: HabitSuggestionBoxProps) {
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showMoreTips, setShowMoreTips] = useState(false);
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
      
      // Calculate average duration
      const durationsWithValue = (completions || []).filter(c => c.duration_minutes && c.duration_minutes > 0);
      const avgDuration = durationsWithValue.length > 0 
        ? Math.round(durationsWithValue.reduce((sum, c) => sum + (c.duration_minutes || 0), 0) / durationsWithValue.length)
        : 0;

      // Get completed days of week (0-6)
      const completedDays = (completions || []).map(c => new Date(c.completed_at).getDay());

      // Generate detailed pros
      const pros: { text: string; icon: string }[] = [];
      
      if (isCompleted) {
        pros.push({ text: `Great job completing ${habit.title} today!`, icon: '✅' });
      }
      
      if (streakCount >= 3) {
        pros.push({ text: `Amazing ${streakCount}-day streak! You're building momentum!`, icon: '🔥' });
      } else if (streakCount > 0) {
        pros.push({ text: `You're on a ${streakCount}-day streak - keep it going!`, icon: '🔥' });
      }
      
      if (weeklyConsistency >= 85) {
        pros.push({ text: 'Excellent weekly consistency - you\'re crushing it!', icon: '💪' });
      } else if (weeklyConsistency >= 70) {
        pros.push({ text: 'Good weekly rhythm established!', icon: '📈' });
      }
      
      if (durationMinutes && durationMinutes >= 20) {
        pros.push({ text: `You spent ${durationMinutes} min - great focus session!`, icon: '⏱️' });
      } else if (durationMinutes && durationMinutes > 0) {
        pros.push({ text: `${durationMinutes} min logged - every minute counts!`, icon: '⏱️' });
      }

      if (avgDuration > 0 && durationMinutes && durationMinutes > avgDuration) {
        pros.push({ text: `Above your average of ${avgDuration} min - improvement detected!`, icon: '📊' });
      }

      if (isCompleted && new Date().getHours() < 12) {
        pros.push({ text: 'Completed before noon - morning momentum is powerful!', icon: '🌅' });
      }

      // Generate detailed cons
      const cons: { text: string; icon: string }[] = [];
      
      if (!isCompleted) {
        cons.push({ text: `Haven't completed ${habit.title} yet today`, icon: '⏳' });
      }
      
      if (weeklyConsistency < 40) {
        cons.push({ text: `Weekly consistency at ${weeklyConsistency}% - room to improve`, icon: '📉' });
      } else if (weeklyConsistency < 60) {
        cons.push({ text: `Consistency dropped to ${weeklyConsistency}% this week`, icon: '⚠️' });
      }
      
      if (durationMinutes !== undefined && durationMinutes < 5 && durationMinutes > 0) {
        cons.push({ text: 'Very short duration - consider increasing time gradually', icon: '⏱️' });
      }

      if (avgDuration > 0 && durationMinutes !== undefined && durationMinutes < avgDuration * 0.5) {
        cons.push({ text: `Below your usual ${avgDuration} min average`, icon: '📊' });
      }

      // Detect weekend patterns
      const weekendCompletions = completedDays.filter(d => d === 0 || d === 6).length;
      const weekdayCompletions = completedDays.filter(d => d >= 1 && d <= 5).length;
      const today = new Date().getDay();
      
      if (weekendCompletions < weekdayCompletions / 2.5 && (today === 0 || today === 6)) {
        cons.push({ text: 'Weekend pattern detected - you often miss weekends', icon: '📅' });
      }

      if (streakCount === 0 && completionCount > 0) {
        cons.push({ text: 'Streak broken - but you can start fresh today!', icon: '🔄' });
      }

      // Generate AI suggestions
      let improvementTip = '';
      let routineTip = '';
      
      if (!isCompleted) {
        improvementTip = `Start with just 2 minutes of ${habit.title} to build momentum`;
        routineTip = 'Attach this habit right after brushing your teeth or having breakfast';
      } else if (weeklyConsistency < 60) {
        improvementTip = 'Set a specific time each day - consistency beats intensity';
        routineTip = 'Place a visual reminder where you\'ll see it first thing';
      } else if (durationMinutes && durationMinutes < 10) {
        improvementTip = 'Try adding 2-3 extra minutes each day this week';
        routineTip = 'Prepare everything you need the night before to reduce friction';
      } else {
        improvementTip = 'You\'re doing great! Consider making this habit slightly harder';
        routineTip = 'Share your streak with someone to add accountability';
      }

      const challenge = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
      const psychologyTip = PSYCHOLOGY_TIPS[Math.floor(Math.random() * PSYCHOLOGY_TIPS.length)];

      setSuggestion({
        pros,
        cons,
        improvementTip,
        routineTip,
        challenge,
        psychologyTip,
        streakCount,
        weeklyConsistency,
        avgDuration,
        completedDays
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
          <span className="text-sm text-muted-foreground">Analyzing your habit data...</span>
        </div>
      </Card>
    );
  }

  if (!suggestion) return null;

  const consistencyColor = suggestion.weeklyConsistency >= 70 ? 'text-green-500' :
    suggestion.weeklyConsistency >= 40 ? 'text-yellow-500' : 'text-destructive';

  return (
    <Card className="p-4 bg-gradient-to-br from-background to-muted/30 border-border/50 space-y-3 overflow-hidden">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{habit.icon}</div>
          <div>
            <h4 className="font-semibold text-foreground">{habit.title}</h4>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1">
                🔥 <span className="font-medium">{suggestion.streakCount}</span> day streak
              </span>
              <span className={cn("flex items-center gap-1", consistencyColor)}>
                📊 <span className="font-medium">{suggestion.weeklyConsistency}%</span> weekly
              </span>
              {suggestion.avgDuration > 0 && (
                <span className="flex items-center gap-1">
                  ⏱️ <span className="font-medium">{suggestion.avgDuration}</span> min avg
                </span>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-muted-foreground hover:text-foreground"
        >
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </Button>
      </div>

      {/* Visual progress indicators */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Weekly Progress</span>
          <span className={cn("font-medium", consistencyColor)}>{suggestion.weeklyConsistency}%</span>
        </div>
        <Progress 
          value={suggestion.weeklyConsistency} 
          className="h-2"
        />
        
        {/* Day indicators */}
        <div className="flex justify-between px-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => {
            const isCompleted = suggestion.completedDays.includes(idx);
            const isToday = new Date().getDay() === idx;
            return (
              <div 
                key={idx} 
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                  isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background"
                )}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {expanded && (
        <div className="space-y-4 pt-3 animate-fade-in border-t border-border">
          {/* Pros Section */}
          {suggestion.pros.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                  <ThumbsUp className="w-3.5 h-3.5 text-green-500" />
                </div>
                <span className="text-sm font-semibold text-green-600">Today's Wins</span>
              </div>
              <div className="space-y-1.5 ml-8">
                {suggestion.pros.map((pro, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="flex-shrink-0">{pro.icon}</span>
                    <span>{pro.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cons Section */}
          {suggestion.cons.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <ThumbsDown className="w-3.5 h-3.5 text-orange-500" />
                </div>
                <span className="text-sm font-semibold text-orange-500">Areas to Improve</span>
              </div>
              <div className="space-y-1.5 ml-8">
                {suggestion.cons.map((con, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="flex-shrink-0">{con.icon}</span>
                    <span>{con.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Suggestions - 4 Types */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold text-primary">AI Suggestions</span>
            </div>
            
            <div className="grid gap-2 ml-8">
              {/* Improvement Tip */}
              <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-medium text-blue-600 uppercase">Improvement Tip</span>
                  <p className="text-sm text-foreground">{suggestion.improvementTip}</p>
                </div>
              </div>

              {/* Routine Tip */}
              <div className="flex items-start gap-2 p-2 rounded-lg bg-purple-500/5 border border-purple-500/10">
                <Clock className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-medium text-purple-600 uppercase">Routine Optimization</span>
                  <p className="text-sm text-foreground">{suggestion.routineTip}</p>
                </div>
              </div>

              {/* Challenge */}
              <div className="flex items-start gap-2 p-2 rounded-lg bg-orange-500/5 border border-orange-500/10">
                <Zap className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-medium text-orange-600 uppercase">Today's Challenge</span>
                  <p className="text-sm text-foreground">{suggestion.challenge}</p>
                </div>
              </div>

              {/* Psychology Tip - Always show in expanded */}
              <div className="flex items-start gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                <Brain className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-medium text-primary uppercase">🧠 Psychology Insight</span>
                  <p className="text-sm text-foreground">{suggestion.psychologyTip}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Show More Tips */}
          {showMoreTips && (
            <div className="space-y-2 p-3 rounded-lg bg-muted/50 border border-border animate-fade-in">
              <h5 className="text-sm font-medium text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Additional Insights
              </h5>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span>💡</span>
                  <span>Your best day this week was {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][suggestion.completedDays[0] || 0]}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>📈</span>
                  <span>Consistency improves motivation. Aim for 3 days in a row!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🎯</span>
                  <span>Consider tracking your energy levels alongside this habit</span>
                </li>
              </ul>
            </div>
          )}

          {/* Why this suggestion explanation */}
          {showExplanation && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border text-sm text-muted-foreground animate-fade-in">
              <p className="font-medium text-foreground mb-1">Why these suggestions?</p>
              <p>
                These recommendations are based on your <strong>{suggestion.streakCount}-day streak</strong>, 
                <strong> {suggestion.weeklyConsistency}% weekly consistency</strong>, 
                {suggestion.avgDuration > 0 && <> <strong>{suggestion.avgDuration} min average duration</strong>,</>} and 
                today's completion status. The AI analyzes patterns in your behavior (like which days you're most consistent) 
                to provide personalized recommendations that work for your lifestyle.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMoreTips(!showMoreTips)}
              className="text-xs"
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              {showMoreTips ? 'Hide Tips' : 'Show More Tips'}
            </Button>
            
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
              variant={helpful === true ? "default" : "outline"}
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

          {/* Refresh button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchSuggestions}
            className="w-full text-xs text-muted-foreground"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Refresh Suggestions
          </Button>
        </div>
      )}
    </Card>
  );
}
