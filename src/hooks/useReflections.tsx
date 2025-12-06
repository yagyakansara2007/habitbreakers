import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface DailyReflection {
  id: string;
  user_id: string;
  reflection_date: string;
  mood: string | null;
  gratitude: string | null;
  wins: string | null;
  challenges: string | null;
  tomorrow_goals: string | null;
  ai_motivation: string | null;
  ai_tips: string | null;
  created_at: string;
  updated_at: string;
}

export function useReflections() {
  const { user } = useAuth();
  const [todayReflection, setTodayReflection] = useState<DailyReflection | null>(null);
  const [reflections, setReflections] = useState<DailyReflection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodayReflection = async () => {
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_reflections')
      .select('*')
      .eq('reflection_date', today)
      .maybeSingle();
    
    if (error) {
      console.error(error);
    } else {
      setTodayReflection(data);
    }
  };

  const fetchReflections = async (limit = 7) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('daily_reflections')
      .select('*')
      .order('reflection_date', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error(error);
    } else {
      setReflections(data || []);
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchTodayReflection(), fetchReflections()]).finally(() => {
        setLoading(false);
      });
    }
  }, [user]);

  const saveReflection = async (reflection: Partial<DailyReflection>) => {
    if (!user) return { error: new Error('Not authenticated') };
    
    const today = new Date().toISOString().split('T')[0];
    
    if (todayReflection) {
      // Update existing
      const { data, error } = await supabase
        .from('daily_reflections')
        .update(reflection)
        .eq('id', todayReflection.id)
        .select()
        .single();
      
      if (error) {
        toast.error('Failed to save reflection');
        return { error };
      }
      
      setTodayReflection(data);
      toast.success('Reflection saved!');
      return { error: null, data };
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('daily_reflections')
        .insert({
          ...reflection,
          user_id: user.id,
          reflection_date: today
        })
        .select()
        .single();
      
      if (error) {
        toast.error('Failed to save reflection');
        return { error };
      }
      
      setTodayReflection(data);
      setReflections(prev => [data, ...prev.slice(0, 6)]);
      toast.success('Reflection saved!');
      return { error: null, data };
    }
  };

  return {
    todayReflection,
    reflections,
    loading,
    saveReflection,
    refetch: () => Promise.all([fetchTodayReflection(), fetchReflections()])
  };
}
