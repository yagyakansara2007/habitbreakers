import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface TemplateHabit {
  title: string;
  description: string;
}

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  habits: TemplateHabit[];
}

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('habit_templates')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedTemplates = data?.map(t => ({
        ...t,
        habits: typeof t.habits === 'string' ? JSON.parse(t.habits) : t.habits
      })) || [];

      setTemplates(formattedTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const useTemplate = async (template: Template) => {
    if (!user) {
      toast.error('Please sign in to use templates');
      return false;
    }

    try {
      const habitsToInsert = template.habits.map((habit: TemplateHabit) => ({
        user_id: user.id,
        title: habit.title,
        description: habit.description,
        category: template.category,
        icon: template.icon,
        color: template.color,
      }));

      const { error } = await supabase
        .from('habits')
        .insert(habitsToInsert);

      if (error) throw error;

      toast.success(`Added ${template.habits.length} habits from "${template.title}" template!`);
      return true;
    } catch (error) {
      console.error('Error using template:', error);
      toast.error('Failed to add template habits');
      return false;
    }
  };

  return { templates, loading, useTemplate };
}
