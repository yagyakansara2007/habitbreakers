import { useWeeklyProgress } from '@/hooks/useWeeklyProgress';
import { useHabits } from '@/hooks/useHabits';
import { Card } from '@/components/ui/card';
import { Calendar, CheckCircle2, Star, AlertTriangle, Flame, Target, TrendingUp } from 'lucide-react';

export function WeeklyReport() {
  const { weeklyData, stats, loading } = useWeeklyProgress();
  const { habits, completions } = useHabits();

  if (loading || !stats) {
    return (
      <Card className="p-6 bg-card border-border animate-pulse">
        <div className="h-48 bg-muted rounded" />
      </Card>
    );
  }

  // Calculate best and worst habits
  const habitCompletions: Record<string, number> = {};
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  completions
    .filter(c => new Date(c.completed_at) >= weekAgo)
    .forEach(c => {
      habitCompletions[c.habit_id] = (habitCompletions[c.habit_id] || 0) + 1;
    });

  const habitsWithCount = habits.map(h => ({
    ...h,
    completionCount: habitCompletions[h.id] || 0
  }));

  const strongestHabit = habitsWithCount.sort((a, b) => b.completionCount - a.completionCount)[0];
  const weakestHabit = habitsWithCount.sort((a, b) => a.completionCount - b.completionCount)[0];

  // Calculate streak (consecutive days with at least one completion)
  const sortedDays = [...weeklyData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  let streakDays = 0;
  for (const day of sortedDays) {
    if (day.completed > 0) {
      streakDays++;
    } else {
      break;
    }
  }

  // Calculate overall score
  const overallScore = stats.consistencyScore;

  // Generate improvement tips
  const tips: string[] = [];
  if (stats.consistencyScore < 50) {
    tips.push("Start with just 2-minute versions of habits to build momentum.");
  }
  if (weakestHabit && weakestHabit.completionCount < 3) {
    tips.push(`Focus on "${weakestHabit.title}" - consider making it easier or linking to an existing routine.`);
  }
  if (stats.worstDay) {
    tips.push(`${stats.worstDay} is your weakest day. Try scheduling reminders or preparing the night before.`);
  }
  if (streakDays >= 5) {
    tips.push("Excellent streak! Consider adding a new micro-habit to your routine.");
  }

  return (
    <Card className="p-6 bg-card border-border space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg text-foreground">📅 Weekly Report (Last 7 Days)</h3>
      </div>

      {/* Main Stats */}
      <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-foreground">
            <strong>✔ Total Completed:</strong> {stats.totalCompleted} / {stats.totalPossible}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Star className="w-5 h-5 text-yellow-500" />
          <span className="text-foreground">
            <strong>⭐ Strongest Habit:</strong> {strongestHabit?.icon} {strongestHabit?.title || 'N/A'} ({strongestHabit?.completionCount || 0} times)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <span className="text-foreground">
            <strong>⚠ Weakest Habit:</strong> {weakestHabit?.icon} {weakestHabit?.title || 'N/A'} ({weakestHabit?.completionCount || 0} times)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Flame className="w-5 h-5 text-red-500" />
          <span className="text-foreground">
            <strong>🔥 Streak:</strong> {streakDays} days
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-primary" />
          <span className="text-foreground">
            <strong>🎯 Overall Score:</strong>{' '}
            <span className={`font-bold ${overallScore >= 70 ? 'text-green-500' : overallScore >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
              {overallScore}/100
            </span>
          </span>
        </div>
      </div>

      {/* Improvement Tips */}
      {tips.length > 0 && (
        <div className="bg-muted/50 rounded-xl p-4">
          <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Improvement Tips for Next Week
          </h4>
          <ul className="space-y-2">
            {tips.map((tip, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
