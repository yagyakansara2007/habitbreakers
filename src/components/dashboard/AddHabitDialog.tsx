import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';

const CATEGORIES = [
  'health', 'fitness', 'mindfulness', 'productivity', 
  'learning', 'creativity', 'social', 'general'
];

const ICONS = ['🎯', '💪', '🧘', '📚', '🏃', '💧', '🍎', '😴', '✍️', '🎨'];

const COLORS = [
  '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', 
  '#3B82F6', '#6366F1', '#EF4444', '#14B8A6'
];

interface AddHabitDialogProps {
  children?: React.ReactNode;
}

export function AddHabitDialog({ children }: AddHabitDialogProps) {
  const { addHabit } = useHabits();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [icon, setIcon] = useState('🎯');
  const [color, setColor] = useState('#8B5CF6');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setLoading(true);
    const { error } = await addHabit({
      title: title.trim(),
      description: description.trim() || null,
      category,
      icon,
      color,
      frequency: 'daily',
      target_count: 1,
      reminder_time: null,
      is_active: true
    });
    
    setLoading(false);
    
    if (!error) {
      setOpen(false);
      setTitle('');
      setDescription('');
      setCategory('general');
      setIcon('🎯');
      setColor('#8B5CF6');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="hero" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Habit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Habit</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Habit Name</Label>
            <Input
              id="title"
              placeholder="e.g., Morning Meditation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="What does this habit involve?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat} className="capitalize">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 text-xl rounded-lg border-2 transition-all ${
                    icon === i 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-primary' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <Button type="submit" variant="hero" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Habit'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
