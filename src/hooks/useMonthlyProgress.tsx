import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { subDays, format, eachDayOfInterval, startOfDay } from 'date-fns';

export interface MonthlyStats {
  totalCompleted: number;
  totalPossible: number;
  consistencyScore: number;
  totalHours: number;
  topHabits: { title: string; count: number }[];
  dropRateHabits: { title: string; dropPercent: number }[];
  weeklyScores: number[];
  dailyCompletions: { date: string; count: number }[];
}

export function useMonthlyProgress() {
  const { user } = useAuth();
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMonthlyProgress = async () => {
    if (!user) return;

    const today = startOfDay(new Date());
    const monthStart = subDays(today, 29);

    // Fetch habits
    const { data: habits } = await supabase
      .from('habits')
      .select('id, title')
      .eq('is_active', true);

    const habitMap = new Map(habits?.map(h => [h.id, h.title]) || []);
    const habitCount = habits?.length || 0;

    // Fetch completions for last 30 days
    const { data: completions } = await supabase
      .from('habit_completions')
      .select('*')
      .gte('completed_at', monthStart.toISOString())
      .lte('completed_at', today.toISOString());

    const days = eachDayOfInterval({ start: monthStart, end: today });
    
    // Daily completions for graph
    const dailyCompletions = days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayCompletions = completions?.filter(c =>
        format(new Date(c.completed_at), 'yyyy-MM-dd') === dateStr
      ) || [];
      return { date: dateStr, count: dayCompletions.length };
    });

    // Weekly scores (4 weeks)
    const weeklyScores: number[] = [];
    for (let week = 0; week < 4; week++) {
      const weekStart = subDays(today, (3 - week) * 7 + 6);
      const weekEnd = subDays(today, (3 - week) * 7);
      const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      let weekCompleted = 0;
      let weekPossible = 0;
      
      weekDays.forEach(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayCompletions = completions?.filter(c =>
          format(new Date(c.completed_at), 'yyyy-MM-dd') === dateStr
        ) || [];
        weekCompleted += dayCompletions.length;
        weekPossible += habitCount;
      });
      
      weeklyScores.push(weekPossible > 0 ? Math.round((weekCompleted / weekPossible) * 100) : 0);
    }

    // Top habits
    const habitCompletionCounts: Record<string, number> = {};
    completions?.forEach(c => {
      habitCompletionCounts[c.habit_id] = (habitCompletionCounts[c.habit_id] || 0) + 1;
    });

    const topHabits = Object.entries(habitCompletionCounts)
      .map(([id, count]) => ({ title: habitMap.get(id) || 'Unknown', count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Drop rate habits (habits with fewer completions in last 15 days vs first 15 days)
    const midPoint = subDays(today, 15);
    const dropRateHabits: { title: string; dropPercent: number }[] = [];

    habits?.forEach(habit => {
      const firstHalfCount = completions?.filter(c =>
        c.habit_id === habit.id &&
        new Date(c.completed_at) < midPoint
      ).length || 0;

      const secondHalfCount = completions?.filter(c =>
        c.habit_id === habit.id &&
        new Date(c.completed_at) >= midPoint
      ).length || 0;

      if (firstHalfCount > 0 && secondHalfCount < firstHalfCount) {
        const dropPercent = Math.round(((firstHalfCount - secondHalfCount) / firstHalfCount) * 100);
        if (dropPercent > 20) {
          dropRateHabits.push({ title: habit.title, dropPercent });
        }
      }
    });

    dropRateHabits.sort((a, b) => b.dropPercent - a.dropPercent);

    // Total hours
    const totalMinutes = completions?.reduce((sum, c) => sum + (c.duration_minutes || 0), 0) || 0;
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10;

    // Overall stats
    const totalCompleted = completions?.length || 0;
    const totalPossible = days.length * habitCount;
    const consistencyScore = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    setStats({
      totalCompleted,
      totalPossible,
      consistencyScore,
      totalHours,
      topHabits,
      dropRateHabits,
      weeklyScores,
      dailyCompletions
    });
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchMonthlyProgress().finally(() => setLoading(false));
    }
  }, [user]);

  return {
    stats,
    loading,
    refetch: fetchMonthlyProgress
  };
}
