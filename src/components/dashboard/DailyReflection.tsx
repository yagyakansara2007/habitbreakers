import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useReflections } from '@/hooks/useReflections';
import { Sparkles, Heart, Trophy, Mountain, Target, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useHabits } from '@/hooks/useHabits';

const MOODS = [
  { emoji: '😊', label: 'Great', value: 'great' },
  { emoji: '🙂', label: 'Good', value: 'good' },
  { emoji: '😐', label: 'Okay', value: 'okay' },
  { emoji: '😔', label: 'Low', value: 'low' },
  { emoji: '😫', label: 'Tough', value: 'tough' },
];

export function DailyReflection() {
  const { todayReflection, saveReflection, loading: reflectionLoading } = useReflections();
  const { habits, completedCount } = useHabits();
  
  const [mood, setMood] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [wins, setWins] = useState('');
  const [challenges, setChallenges] = useState('');
  const [tomorrowGoals, setTomorrowGoals] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingMotivation, setLoadingMotivation] = useState(false);
  const [motivation, setMotivation] = useState<{
    motivation: string;
    tips: string[];
    encouragement: string;
  } | null>(null);

  useEffect(() => {
    if (todayReflection) {
      setMood(todayReflection.mood || '');
      setGratitude(todayReflection.gratitude || '');
      setWins(todayReflection.wins || '');
      setChallenges(todayReflection.challenges || '');
      setTomorrowGoals(todayReflection.tomorrow_goals || '');
      
      if (todayReflection.ai_motivation) {
        try {
          setMotivation(JSON.parse(todayReflection.ai_motivation));
        } catch {
          setMotivation(null);
        }
      }
    }
  }, [todayReflection]);

  const handleSave = async () => {
    setSaving(true);
    await saveReflection({
      mood,
      gratitude,
      wins,
      challenges,
      tomorrow_goals: tomorrowGoals
    });
    setSaving(false);
  };

  const getMotivation = async () => {
    setLoadingMotivation(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-motivation', {
        body: {
          habits,
          completedToday: completedCount,
          mood,
          reflection: `${wins} ${challenges}`
        }
      });
      
      if (error) throw error;
      
      setMotivation(data);
      
      // Save to reflection
      await saveReflection({
        mood,
        gratitude,
        wins,
        challenges,
        tomorrow_goals: tomorrowGoals,
        ai_motivation: JSON.stringify(data),
        ai_tips: data.tips?.join('\n')
      });
    } catch (error) {
      console.error('Failed to get motivation:', error);
    } finally {
      setLoadingMotivation(false);
    }
  };

  if (reflectionLoading) {
    return (
      <div className="bg-card border border-border rounded-3xl p-6 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="space-y-3">
          <div className="h-20 bg-muted rounded" />
          <div className="h-20 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-3xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Daily Reflection</h2>
        </div>
        <span className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        </span>
      </div>

      {/* Mood Selector */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-pink-500" />
          How are you feeling today?
        </Label>
        <div className="flex gap-2">
          {MOODS.map(m => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                mood === m.value 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span className="text-2xl block text-center mb-1">{m.emoji}</span>
              <span className="text-xs text-muted-foreground block text-center">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Gratitude */}
      <div className="space-y-2">
        <Label htmlFor="gratitude" className="flex items-center gap-2">
          🙏 What are you grateful for today?
        </Label>
        <Textarea
          id="gratitude"
          placeholder="I'm grateful for..."
          value={gratitude}
          onChange={(e) => setGratitude(e.target.value)}
          rows={2}
        />
      </div>

      {/* Wins */}
      <div className="space-y-2">
        <Label htmlFor="wins" className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          Today's wins
        </Label>
        <Textarea
          id="wins"
          placeholder="What went well today?"
          value={wins}
          onChange={(e) => setWins(e.target.value)}
          rows={2}
        />
      </div>

      {/* Challenges */}
      <div className="space-y-2">
        <Label htmlFor="challenges" className="flex items-center gap-2">
          <Mountain className="w-4 h-4 text-orange-500" />
          Challenges faced
        </Label>
        <Textarea
          id="challenges"
          placeholder="What was difficult?"
          value={challenges}
          onChange={(e) => setChallenges(e.target.value)}
          rows={2}
        />
      </div>

      {/* Tomorrow Goals */}
      <div className="space-y-2">
        <Label htmlFor="goals" className="flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Goals for tomorrow
        </Label>
        <Textarea
          id="goals"
          placeholder="What do you want to accomplish tomorrow?"
          value={tomorrowGoals}
          onChange={(e) => setTomorrowGoals(e.target.value)}
          rows={2}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? 'Saving...' : 'Save Reflection'}
        </Button>
        <Button 
          variant="outline" 
          onClick={getMotivation}
          disabled={loadingMotivation}
          className="gap-2"
        >
          {loadingMotivation ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Get Motivation
        </Button>
      </div>

      {/* AI Motivation */}
      {motivation && (
        <div className="mt-6 p-5 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20 space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold">Your Personal Motivation</span>
          </div>
          
          <p className="text-foreground leading-relaxed">
            {motivation.motivation}
          </p>
          
          {motivation.tips && motivation.tips.length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Tips for Success:</span>
              <ul className="space-y-2">
                {motivation.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-primary">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <p className="text-sm text-primary font-medium pt-2 border-t border-primary/20">
            {motivation.encouragement}
          </p>
        </div>
      )}
    </div>
  );
}
