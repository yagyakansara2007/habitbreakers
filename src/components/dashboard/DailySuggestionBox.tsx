import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useHabits } from '@/hooks/useHabits';
import { useReflections } from '@/hooks/useReflections';
import { Lightbulb, RefreshCw, Zap, Target, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const DAILY_TIPS = [
  "Start your day with your hardest habit",
  "Set a specific time for each habit",
  "Stack habits on existing routines",
  "Celebrate small wins loudly",
  "Track your progress visually",
  "Don't break the chain mindset",
  "Environment design matters",
  "Start ridiculously small"
];

const CHALLENGES = [
  "Add 5 extra minutes to your main habit",
  "Complete all habits before noon",
  "Do a 2-minute version of a skipped habit",
  "Share your progress with someone",
  "Try habit stacking today",
  "Review and adjust one habit"
];

export function DailySuggestionBox() {
  const { habits, completedCount } = useHabits();
  const { todayReflection } = useReflections();
  const [suggestions, setSuggestions] = useState<{
    motivation: string;
    tip: string;
    challenge: string;
    psychologyTip: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const generateSuggestions = async () => {
    setLoading(true);
    
    try {
      const mood = todayReflection?.mood || 'okay';
      const completionRate = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;
      
      // Generate contextual motivation
      let motivation = "";
      if (completionRate >= 80) {
        motivation = "🔥 You're on fire today! Keep this momentum going!";
      } else if (completionRate >= 50) {
        motivation = "💪 Good progress! Push through the remaining habits!";
      } else if (completionRate > 0) {
        motivation = "🌱 Every step counts. You've started, now keep going!";
      } else {
        motivation = "✨ Today is a new opportunity. Start with just one habit!";
      }

      // Mood-based adjustments
      if (mood === 'low' || mood === 'tough') {
        motivation = "💚 It's okay to have tough days. Try a tiny 2-minute version of your easiest habit.";
      }

      // Random tip and challenge
      const tip = DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)];
      const challenge = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
      
      // Psychology-based tip
      const psychologyTips = [
        "Your brain creates habits through repetition. Each completion strengthens the neural pathway.",
        "Habit stacking uses existing brain patterns to anchor new behaviors.",
        "Visual cues trigger automatic behaviors. Place habit reminders where you'll see them.",
        "Rewards release dopamine, making your brain want to repeat the behavior.",
        "Identity-based habits last longer. Say 'I am a runner' not 'I want to run'."
      ];
      const psychologyTip = psychologyTips[Math.floor(Math.random() * psychologyTips.length)];

      setSuggestions({
        motivation,
        tip,
        challenge,
        psychologyTip
      });
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate on mount if not already done
  if (!suggestions && !loading) {
    generateSuggestions();
  }

  return (
    <Card className="p-5 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">Daily Suggestions</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={generateSuggestions}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </div>

      {suggestions && (
        <div className="space-y-4 animate-fade-in">
          {/* Daily Motivation */}
          <div className="bg-background/50 rounded-xl p-4 border border-border/50">
            <p className="text-foreground font-medium">{suggestions.motivation}</p>
          </div>

          {/* Improvement Tip */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Target className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium">IMPROVEMENT TIP</span>
              <p className="text-sm text-foreground">{suggestions.tip}</p>
            </div>
          </div>

          {/* Daily Challenge */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium">TODAY'S CHALLENGE</span>
              <p className="text-sm text-foreground">{suggestions.challenge}</p>
            </div>
          </div>

          {/* Psychology Insight */}
          <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
            <span className="text-xs text-primary font-medium">🧠 PSYCHOLOGY INSIGHT</span>
            <p className="text-sm text-foreground mt-1">{suggestions.psychologyTip}</p>
          </div>
        </div>
      )}
    </Card>
  );
}
