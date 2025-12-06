import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useHabits } from '@/hooks/useHabits';
import { HabitCard } from '@/components/dashboard/HabitCard';
import { AddHabitDialog } from '@/components/dashboard/AddHabitDialog';
import { ProgressCard } from '@/components/dashboard/ProgressCard';
import { DailyReflection } from '@/components/dashboard/DailyReflection';
import { Button } from '@/components/ui/button';
import { LogOut, Plus, Sparkles } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { habits, loading: habitsLoading, toggleCompletion, deleteHabit, isCompletedToday, completedCount } = useHabits();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">H</span>
            </div>
            <div>
              <h1 className="font-bold text-xl text-foreground">HabitFlow</h1>
              <p className="text-sm text-muted-foreground">Welcome back! 👋</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <AddHabitDialog />
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Habits */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Card */}
            <ProgressCard completed={completedCount} total={habits.length} />

            {/* Habits List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">Today's Habits</h2>
                <span className="text-sm text-muted-foreground">
                  {completedCount}/{habits.length} completed
                </span>
              </div>

              {habitsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-card rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : habits.length === 0 ? (
                <div className="bg-card border border-dashed border-border rounded-3xl p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">No habits yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start building better habits today!
                  </p>
                  <AddHabitDialog>
                    <Button variant="hero">Create Your First Habit</Button>
                  </AddHabitDialog>
                </div>
              ) : (
                <div className="space-y-3">
                  {habits.map(habit => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      isCompleted={isCompletedToday(habit.id)}
                      onToggle={() => toggleCompletion(habit.id)}
                      onDelete={() => deleteHabit(habit.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Reflection */}
          <div className="space-y-6">
            <DailyReflection />
          </div>
        </div>
      </main>
    </div>
  );
}
