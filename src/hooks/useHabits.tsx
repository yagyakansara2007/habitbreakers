import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  frequency: string;
  target_count: number;
  reminder_time: string | null;
  color: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  user_id: string;
  completed_at: string;
  notes: string | null;
  count: number;
}

export function useHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Failed to load habits');
      console.error(error);
    } else {
      setHabits(data || []);
    }
  };

  const fetchTodayCompletions = async () => {
    if (!user) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data, error } = await supabase
      .from('habit_completions')
      .select('*')
      .gte('completed_at', today.toISOString());
    
    if (error) {
      console.error(error);
    } else {
      setCompletions(data || []);
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([fetchHabits(), fetchTodayCompletions()]).finally(() => {
        setLoading(false);
      });
    }
  }, [user]);

  const addHabit = async (habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: new Error('Not authenticated') };
    
    const { data, error } = await supabase
      .from('habits')
      .insert({
        ...habit,
        user_id: user.id
      })
      .select()
      .single();
    
    if (error) {
      toast.error('Failed to add habit');
      return { error };
    }
    
    setHabits(prev => [data, ...prev]);
    toast.success('Habit added!');
    return { error: null, data };
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    const { error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to update habit');
      return { error };
    }
    
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
    toast.success('Habit updated!');
    return { error: null };
  };

  const deleteHabit = async (id: string) => {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to delete habit');
      return { error };
    }
    
    setHabits(prev => prev.filter(h => h.id !== id));
    toast.success('Habit deleted');
    return { error: null };
  };

  const toggleCompletion = async (habitId: string) => {
    if (!user) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingCompletion = completions.find(
      c => c.habit_id === habitId && new Date(c.completed_at) >= today
    );
    
    if (existingCompletion) {
      // Remove completion
      const { error } = await supabase
        .from('habit_completions')
        .delete()
        .eq('id', existingCompletion.id);
      
      if (!error) {
        setCompletions(prev => prev.filter(c => c.id !== existingCompletion.id));
        toast.success('Completion removed');
      }
    } else {
      // Add completion
      const { data, error } = await supabase
        .from('habit_completions')
        .insert({
          habit_id: habitId,
          user_id: user.id
        })
        .select()
        .single();
      
      if (!error && data) {
        setCompletions(prev => [...prev, data]);
        toast.success('Habit completed! 🎉');
      }
    }
  };

  const isCompletedToday = (habitId: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return completions.some(
      c => c.habit_id === habitId && new Date(c.completed_at) >= today
    );
  };

  const completedCount = habits.filter(h => isCompletedToday(h.id)).length;

  return {
    habits,
    completions,
    loading,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
    isCompletedToday,
    completedCount,
    refetch: () => Promise.all([fetchHabits(), fetchTodayCompletions()])
  };
}
