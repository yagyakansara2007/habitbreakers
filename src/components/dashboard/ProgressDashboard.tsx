import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WeeklyProgressChart } from './WeeklyProgressChart';
import { WeeklyReport } from './WeeklyReport';
import { MonthlyReport } from './MonthlyReport';
import { DailySuggestionBox } from './DailySuggestionBox';
import { useHabits } from '@/hooks/useHabits';
import { useReflections } from '@/hooks/useReflections';
import { useWeeklyProgress } from '@/hooks/useWeeklyProgress';
import { Calendar, TrendingUp, Target, Flame, BarChart3 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { cn } from '@/lib/utils';

interface ProgressDashboardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProgressDashboard({ open, onOpenChange }: ProgressDashboardProps) {
  const { habits, completedCount, completions } = useHabits();
  const { reflections } = useReflections();
  const { stats } = useWeeklyProgress();

  // Calculate streaks
  const calculateMaxStreak = (): number => {
    if (completions.length === 0) return 0;
    
    const dates = [...new Set(completions.map(c => 
      format(new Date(c.completed_at), 'yyyy-MM-dd')
    ))].sort();
    
    let maxStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]);
      const curr = new Date(dates[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    return maxStreak;
  };

  // Generate calendar data
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDateStatus = (date: Date): 'completed' | 'partial' | 'missed' | 'future' => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const todayStr = format(today, 'yyyy-MM-dd');
    
    if (dateStr > todayStr) return 'future';
    
    const dayCompletions = completions.filter(c => 
      format(new Date(c.completed_at), 'yyyy-MM-dd') === dateStr
    );
    
    if (dayCompletions.length === 0) return 'missed';
    if (dayCompletions.length >= habits.length) return 'completed';
    return 'partial';
  };

  // Mood trend data
  const moodCounts = reflections.reduce((acc, r) => {
    if (r.mood) {
      acc[r.mood] = (acc[r.mood] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            My Progress Dashboard
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto pr-2">
            <TabsContent value="overview" className="space-y-4 mt-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-primary" />
                    <span className="text-3xl font-bold text-foreground">
                      {stats?.consistencyScore || 0}%
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">Weekly Consistency</span>
                </div>

                <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="text-3xl font-bold text-foreground">{calculateMaxStreak()}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Best Streak</span>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span className="text-3xl font-bold text-foreground">
                      {stats?.totalCompleted || 0}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">This Week</span>
                </div>

                <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <span className="text-3xl font-bold text-foreground">{habits.length}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Active Habits</span>
                </div>
              </div>

              {/* Today's Progress */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h4 className="font-medium text-foreground mb-3">Today's Progress</h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${habits.length > 0 ? (completedCount / habits.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <span className="font-semibold text-foreground">{completedCount}/{habits.length}</span>
                </div>
              </div>

              <DailySuggestionBox />
            </TabsContent>

            <TabsContent value="weekly" className="mt-4 space-y-4">
              <WeeklyProgressChart />
              <WeeklyReport />
            </TabsContent>

            <TabsContent value="monthly" className="mt-4">
              <MonthlyReport />
            </TabsContent>

            <TabsContent value="calendar" className="mt-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(today, 'MMMM yyyy')}
                </h4>
                
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                    <div key={day} className="text-xs text-muted-foreground font-medium py-1">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for offset */}
                  {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  
                  {calendarDays.map(date => {
                    const status = getDateStatus(date);
                    return (
                      <div
                        key={date.toISOString()}
                        className={cn(
                          "aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all",
                          status === 'completed' && "bg-green-500 text-white",
                          status === 'partial' && "bg-yellow-500/80 text-white",
                          status === 'missed' && "bg-red-400/30 text-red-600",
                          status === 'future' && "bg-muted text-muted-foreground",
                          format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') && "ring-2 ring-primary"
                        )}
                      >
                        {format(date, 'd')}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-green-500" /> Completed
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-yellow-500" /> Partial
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-red-400/30" /> Missed
                  </span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4 mt-4">
              {/* Mood Trend */}
              <div className="bg-card border border-border rounded-xl p-4">
                <h4 className="font-medium text-foreground mb-3">Mood Trends (Last 7 days)</h4>
                <div className="flex items-end justify-around h-24">
                  {['great', 'good', 'okay', 'low', 'tough'].map(mood => (
                    <div key={mood} className="flex flex-col items-center">
                      <div 
                        className="w-8 bg-primary/50 rounded-t transition-all"
                        style={{ height: `${(moodCounts[mood] || 0) * 20}px` }}
                      />
                      <span className="text-lg mt-1">
                        {mood === 'great' ? '😊' : 
                         mood === 'good' ? '🙂' : 
                         mood === 'okay' ? '😐' : 
                         mood === 'low' ? '😔' : '😫'}
                      </span>
                      <span className="text-xs text-muted-foreground">{moodCounts[mood] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20">
                <h4 className="font-medium text-foreground mb-2">🧠 AI Insights</h4>
                <ul className="space-y-2 text-sm text-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {stats?.bestDay === 'Mon' || stats?.bestDay === 'Tue' 
                      ? "You perform best early in the week. Add challenging habits on these days!"
                      : "Your strongest performance is later in the week. Consider front-loading easier habits."}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {stats?.consistencyScore && stats.consistencyScore >= 70
                      ? "Excellent consistency! Consider adding a new habit to your routine."
                      : "Focus on consistency over intensity. Try habit stacking for better results."}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {Object.keys(moodCounts).includes('low') || Object.keys(moodCounts).includes('tough')
                      ? "On low mood days, switch to 2-minute versions of habits to maintain streaks."
                      : "Your mood has been positive! Use this momentum for habit growth."}
                  </li>
                </ul>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
