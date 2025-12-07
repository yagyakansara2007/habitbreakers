-- Create habit_templates table
CREATE TABLE public.habit_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  icon TEXT DEFAULT '🎯',
  color TEXT DEFAULT '#8B5CF6',
  habits JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.habit_templates ENABLE ROW LEVEL SECURITY;

-- Templates are public and readable by everyone
CREATE POLICY "Anyone can view templates" 
ON public.habit_templates 
FOR SELECT 
USING (true);

-- Create chat_messages table for AI coach
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own chat messages
CREATE POLICY "Users can view their own messages" 
ON public.chat_messages 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own messages
CREATE POLICY "Users can create their own messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create user_history table for AI memory
CREATE TABLE public.user_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  mood_trend JSONB DEFAULT '[]',
  blockers TEXT[],
  motivation_triggers TEXT[],
  patterns JSONB DEFAULT '{}',
  weekly_summary JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own history
CREATE POLICY "Users can view their own history" 
ON public.user_history 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own history
CREATE POLICY "Users can insert their own history" 
ON public.user_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own history
CREATE POLICY "Users can update their own history" 
ON public.user_history 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_history_updated_at
BEFORE UPDATE ON public.user_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create contact_submissions table
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  request_type TEXT NOT NULL,
  description TEXT NOT NULL,
  details TEXT,
  preferred_reply TEXT DEFAULT 'email',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can insert contact submissions
CREATE POLICY "Anyone can submit contact form" 
ON public.contact_submissions 
FOR INSERT 
WITH CHECK (true);

-- Insert default templates
INSERT INTO public.habit_templates (title, description, category, icon, color, habits) VALUES
('Morning Routine', 'Start your day with energy and intention. Includes wake-up stretches, journaling, and mindful breakfast.', 'wellness', '☀️', '#F59E0B', '[{"title":"Wake up early","description":"Set alarm 30 min earlier"},{"title":"Morning stretch","description":"5 min gentle stretching"},{"title":"Journal","description":"Write 3 things you are grateful for"},{"title":"Healthy breakfast","description":"Prepare nutritious meal"},{"title":"Plan your day","description":"Review calendar and set priorities"}]'),
('Workout & Running', 'Build strength and endurance with structured exercise habits.', 'fitness', '💪', '#EF4444', '[{"title":"Warm up","description":"5 min dynamic stretches"},{"title":"Main workout","description":"30 min exercise routine"},{"title":"Cool down","description":"5 min stretching"},{"title":"Track progress","description":"Log your workout"}]'),
('Meditation & Mindfulness', 'Cultivate calm and focus with daily meditation and breathing exercises.', 'wellness', '🧘', '#8B5CF6', '[{"title":"Morning meditation","description":"10 min guided meditation"},{"title":"Breathing exercise","description":"5 min deep breathing"},{"title":"Gratitude practice","description":"List 3 things to be grateful for"},{"title":"Evening reflection","description":"5 min mindful reflection"}]'),
('Reading & Learning', 'Expand your knowledge daily with reading and note-taking habits.', 'learning', '📚', '#3B82F6', '[{"title":"Read 20 pages","description":"Daily reading goal"},{"title":"Take notes","description":"Summarize key points"},{"title":"Review notes","description":"Review yesterday notes"}]'),
('Productivity & Focus', 'Maximize output with deep work and focused sessions.', 'productivity', '🎯', '#10B981', '[{"title":"Plan top 3 tasks","description":"Identify most important tasks"},{"title":"Deep work session","description":"90 min focused work"},{"title":"Break time","description":"15 min rest"},{"title":"Review progress","description":"Check completed tasks"},{"title":"Prepare tomorrow","description":"Set up for next day"}]'),
('Water & Health', 'Stay hydrated and maintain your health with daily tracking.', 'health', '💧', '#06B6D4', '[{"title":"Morning glass","description":"Drink water on waking"},{"title":"Track water intake","description":"Log 8 glasses daily"},{"title":"Take vitamins","description":"Daily supplements"},{"title":"Health check","description":"Note energy levels"}]'),
('Sleep Improvement', 'Optimize your rest with evening routines and sleep tracking.', 'wellness', '🌙', '#6366F1', '[{"title":"Screen-free hour","description":"No screens 1hr before bed"},{"title":"Evening routine","description":"Prepare for sleep"},{"title":"Bedtime","description":"Consistent sleep time"},{"title":"Track sleep quality","description":"Rate your sleep"}]'),
('Study & Skill Growth', 'Level up with structured study sessions and practice.', 'learning', '🎓', '#14B8A6', '[{"title":"Study session","description":"45 min focused learning"},{"title":"Practice skills","description":"30 min hands-on practice"},{"title":"Review material","description":"Spaced repetition review"},{"title":"Track progress","description":"Note improvements"}]'),
('Personal Development', 'Become your best self with reflection and goal setting.', 'growth', '❤️', '#EC4899', '[{"title":"Morning affirmations","description":"Positive self-talk"},{"title":"Goal review","description":"Check progress on goals"},{"title":"Learn something new","description":"Daily learning habit"},{"title":"Self-reflection","description":"Evening journaling"},{"title":"Celebrate wins","description":"Acknowledge achievements"}]');