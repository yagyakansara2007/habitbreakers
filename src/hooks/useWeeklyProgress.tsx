import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { startOfWeek, endOfWeek, format, subDays, eachDayOfInterval } from 'date-fns';

export interface DayProgress {
  date: string;
  dayName: string;
  completed: number;
  total: number;
  percentage: number;
}

export interface WeeklyStats {
  totalCompleted: number;
  totalPossible: number;
  consistencyScore: number;
  bestDay: string;
  worstDay: string;
  improvementPercent: number;
}

export function useWeeklyProgress() {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState<DayProgress[]>([]);
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeeklyProgress = async () => {
    if (!user) return;

    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    
    // Fetch habits
    const { data: habits } = await supabase
      .from('habits')
      .select('id')
      .eq('is_active', true);
    
    const habitCount = habits?.length || 0;
    
    // Fetch completions for this week
    const { data: completions } = await supabase
      .from('habit_completions')
      .select('*')
      .gte('completed_at', weekStart.toISOString())
      .lte('completed_at', weekEnd.toISOString());
    
    // Build daily progress
    const days = eachDayOfInterval({ start: weekStart, end: today });
    const dailyProgress: DayProgress[] = days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayCompletions = completions?.filter(c => 
        format(new Date(c.completed_at), 'yyyy-MM-dd') === dateStr
      ) || [];
      
      return {
        date: dateStr,
        dayName: format(date, 'EEE'),
        completed: dayCompletions.length,
        total: habitCount,
        percentage: habitCount > 0 ? Math.round((dayCompletions.length / habitCount) * 100) : 0
      };
    });
    
    setWeeklyData(dailyProgress);
    
    // Calculate stats
    const totalCompleted = dailyProgress.reduce((sum, d) => sum + d.completed, 0);
    const totalPossible = dailyProgress.reduce((sum, d) => sum + d.total, 0);
    const consistencyScore = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
    
    const sortedDays = [...dailyProgress].sort((a, b) => b.percentage - a.percentage);
    const bestDay = sortedDays[0]?.dayName || '-';
    const worstDay = sortedDays[sortedDays.length - 1]?.dayName || '-';
    
    // Fetch last week's completions for comparison
    const lastWeekStart = subDays(weekStart, 7);
    const lastWeekEnd = subDays(weekStart, 1);
    
    const { data: lastWeekCompletions } = await supabase
      .from('habit_completions')
      .select('*')
      .gte('completed_at', lastWeekStart.toISOString())
      .lte('completed_at', lastWeekEnd.toISOString());
    
    const lastWeekTotal = lastWeekCompletions?.length || 0;
    const improvementPercent = lastWeekTotal > 0 
      ? Math.round(((totalCompleted - lastWeekTotal) / lastWeekTotal) * 100)
      : 0;
    
    setStats({
      totalCompleted,
      totalPossible,
      consistencyScore,
      bestDay,
      worstDay,
      improvementPercent
    });
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchWeeklyProgress().finally(() => setLoading(false));
    }
  }, [user]);

  return {
    weeklyData,
    stats,
    loading,
    refetch: fetchWeeklyProgress
  };
}
