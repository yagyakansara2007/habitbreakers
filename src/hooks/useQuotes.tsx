import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Quote {
  id: string;
  user_id: string;
  content: string;
  mood: string | null;
  created_at: string;
  updated_at: string;
}

export function useQuotes() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('user_quotes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(error);
    } else {
      setQuotes(data || []);
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchQuotes().finally(() => setLoading(false));
    }
  }, [user]);

  const addQuote = async (content: string, mood?: string) => {
    if (!user) return { error: new Error('Not authenticated') };
    
    const { data, error } = await supabase
      .from('user_quotes')
      .insert({
        user_id: user.id,
        content,
        mood
      })
      .select()
      .single();
    
    if (error) {
      toast.error('Failed to save quote');
      return { error };
    }
    
    setQuotes(prev => [data, ...prev]);
    toast.success('Quote saved!');
    return { error: null, data };
  };

  const updateQuote = async (id: string, content: string, mood?: string) => {
    const { error } = await supabase
      .from('user_quotes')
      .update({ content, mood })
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to update quote');
      return { error };
    }
    
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, content, mood: mood || q.mood } : q));
    toast.success('Quote updated!');
    return { error: null };
  };

  const deleteQuote = async (id: string) => {
    const { error } = await supabase
      .from('user_quotes')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast.error('Failed to delete quote');
      return { error };
    }
    
    setQuotes(prev => prev.filter(q => q.id !== id));
    toast.success('Quote deleted');
    return { error: null };
  };

  return {
    quotes,
    loading,
    addQuote,
    updateQuote,
    deleteQuote,
    refetch: fetchQuotes
  };
}
