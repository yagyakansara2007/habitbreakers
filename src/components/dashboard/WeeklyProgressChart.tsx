import { useWeeklyProgress } from '@/hooks/useWeeklyProgress';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Target, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WeeklyProgressChart() {
  const { weeklyData, stats, loading, refetch } = useWeeklyProgress();

  if (loading) {
    return (
      <Card className="p-6 bg-card border-border animate-pulse">
        <div className="h-48 bg-muted rounded" />
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg text-foreground">Weekly Progress</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={refetch}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Chart */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData}>
            <XAxis 
              dataKey="dayName" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis hide />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload?.[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
                      <p className="text-sm font-medium">{data.dayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {data.completed}/{data.total} habits ({data.percentage}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="percentage" 
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-2xl font-bold text-foreground">{stats.consistencyScore}%</span>
            </div>
            <span className="text-xs text-muted-foreground">Consistency Score</span>
          </div>

          <div className="bg-muted/50 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              {stats.improvementPercent >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={cn(
                "text-2xl font-bold",
                stats.improvementPercent >= 0 ? "text-green-500" : "text-red-500"
              )}>
                {stats.improvementPercent >= 0 ? '+' : ''}{stats.improvementPercent}%
              </span>
            </div>
            <span className="text-xs text-muted-foreground">vs Last Week</span>
          </div>

          <div className="bg-green-500/10 rounded-xl p-3 text-center">
            <span className="text-lg font-semibold text-green-600">{stats.bestDay}</span>
            <p className="text-xs text-muted-foreground">Best Day</p>
          </div>

          <div className="bg-orange-500/10 rounded-xl p-3 text-center">
            <span className="text-lg font-semibold text-orange-500">{stats.worstDay}</span>
            <p className="text-xs text-muted-foreground">Needs Work</p>
          </div>
        </div>
      )}

      {/* Summary */}
      {stats && (
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-4">
          <h4 className="font-medium text-foreground mb-2">📊 AI Weekly Summary</h4>
          <p className="text-sm text-muted-foreground">
            You completed {stats.totalCompleted} out of {stats.totalPossible} possible habit check-ins.
            {stats.consistencyScore >= 70 
              ? " Excellent consistency! Keep up the great work! 🌟"
              : stats.consistencyScore >= 40
                ? " Good progress! Try to boost your weakest day."
                : " Room for improvement. Start with smaller, easier habits."}
          </p>
        </div>
      )}
    </Card>
  );
}
