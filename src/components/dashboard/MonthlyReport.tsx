import { useMonthlyProgress } from '@/hooks/useMonthlyProgress';
import { Card } from '@/components/ui/card';
import { Calendar, CheckCircle2, Clock, Star, TrendingDown, Target, TrendingUp, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export function MonthlyReport() {
  const { stats, loading } = useMonthlyProgress();

  if (loading || !stats) {
    return (
      <Card className="p-6 bg-card border-border animate-pulse">
        <div className="h-64 bg-muted rounded" />
      </Card>
    );
  }

  // Generate suggested goals
  const suggestedGoals: string[] = [];
  
  if (stats.consistencyScore < 50) {
    suggestedGoals.push("Focus on completing at least 3 habits daily for consistency.");
  } else if (stats.consistencyScore < 75) {
    suggestedGoals.push("Aim for 80% consistency next month.");
  } else {
    suggestedGoals.push("Maintain your excellent consistency and add one new habit.");
  }

  if (stats.dropRateHabits.length > 0) {
    suggestedGoals.push(`Revive "${stats.dropRateHabits[0].title}" by making it simpler or more enjoyable.`);
  }

  if (stats.totalHours < 10) {
    suggestedGoals.push("Increase habit duration gradually - add 5 minutes per habit.");
  }

  suggestedGoals.push("Set a specific reward for achieving your monthly goals.");

  // Weekly comparison data for chart
  const weeklyChartData = stats.weeklyScores.map((score, index) => ({
    week: `Week ${index + 1}`,
    score
  }));

  // Consistency bar visualization
  const consistencyBars = Array.from({ length: 10 }, (_, i) => ({
    filled: i < Math.round(stats.consistencyScore / 10)
  }));

  return (
    <Card className="p-6 bg-card border-border space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg text-foreground">📆 Monthly Report (Last 30 Days)</h3>
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
          <Clock className="w-5 h-5 text-blue-500" />
          <span className="text-foreground">
            <strong>⏱ Total Hours:</strong> {stats.totalHours} hours
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-primary" />
          <span className="text-foreground">
            <strong>🎯 Consistency Score:</strong>{' '}
            <span className={`font-bold ${stats.consistencyScore >= 70 ? 'text-green-500' : stats.consistencyScore >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
              {stats.consistencyScore}%
            </span>
          </span>
        </div>
      </div>

      {/* Consistency Graph (Text-based bars) */}
      <div className="bg-muted/30 rounded-xl p-4">
        <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Consistency Graph
        </h4>
        <div className="flex items-center gap-1">
          {consistencyBars.map((bar, index) => (
            <div
              key={index}
              className={`h-6 flex-1 rounded transition-colors ${
                bar.filled ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Weekly Scores Chart */}
      <div className="bg-muted/30 rounded-xl p-4">
        <h4 className="font-medium text-foreground mb-3">📊 Weekly Scores Merged</h4>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyChartData}>
              <XAxis 
                dataKey="week" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload?.[0]) {
                    return (
                      <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
                        <p className="text-sm font-medium">{payload[0].payload.week}</p>
                        <p className="text-xs text-muted-foreground">Score: {payload[0].value}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="score" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 3 Habits */}
      {stats.topHabits.length > 0 && (
        <div className="bg-green-500/10 rounded-xl p-4">
          <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            Top 3 Habits
          </h4>
          <ul className="space-y-1">
            {stats.topHabits.map((habit, index) => (
              <li key={index} className="text-sm text-foreground flex items-center gap-2">
                <span className={index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-600'}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </span>
                {habit.title} ({habit.count} completions)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Drop Rate Habits */}
      {stats.dropRateHabits.length > 0 && (
        <div className="bg-red-500/10 rounded-xl p-4">
          <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-500" />
            Habits Needing Attention
          </h4>
          <ul className="space-y-1">
            {stats.dropRateHabits.slice(0, 3).map((habit, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="text-red-500">⚠</span>
                {habit.title} (dropped {habit.dropPercent}%)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggested Goals for Next Month */}
      <div className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-xl p-4 border border-primary/20">
        <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Suggested Goals for Next Month
        </h4>
        <ul className="space-y-2">
          {suggestedGoals.map((goal, index) => (
            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-primary">🎯</span>
              {goal}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
