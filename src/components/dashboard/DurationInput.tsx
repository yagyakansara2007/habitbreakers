import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DurationInputProps {
  habitId: string;
  completionId?: string;
  currentDuration?: number;
  targetMinutes?: number;
  onDurationUpdate?: (minutes: number) => void;
}

export function DurationInput({ 
  habitId, 
  completionId, 
  currentDuration = 0,
  targetMinutes = 30,
  onDurationUpdate 
}: DurationInputProps) {
  const [minutes, setMinutes] = useState(currentDuration.toString());
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    if (!completionId) {
      toast.error('Complete the habit first to log time');
      return;
    }

    setSaving(true);
    const durationValue = parseInt(minutes) || 0;
    
    try {
      const { error } = await supabase
        .from('habit_completions')
        .update({ duration_minutes: durationValue })
        .eq('id', completionId);

      if (error) throw error;
      
      toast.success('Duration saved!');
      onDurationUpdate?.(durationValue);
      setOpen(false);

      // Show contextual feedback
      if (durationValue >= targetMinutes) {
        toast.success('🎉 Great focus! You exceeded your target!');
      } else if (durationValue > 0 && durationValue < targetMinutes / 2) {
        toast('💡 Try a longer session tomorrow for better results');
      }
    } catch (error) {
      console.error('Failed to save duration:', error);
      toast.error('Failed to save duration');
    } finally {
      setSaving(false);
    }
  };

  const progressPercent = targetMinutes > 0 
    ? Math.min(100, Math.round((parseInt(minutes) || 0) / targetMinutes * 100))
    : 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
        >
          <Clock className="w-3 h-3" />
          {currentDuration > 0 ? `${currentDuration} min` : 'Add time'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Clock className="w-4 h-4 text-primary" />
            Time Spent Today
          </div>
          
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="0"
              className="h-9"
              min={0}
              max={999}
            />
            <span className="text-sm text-muted-foreground whitespace-nowrap">min</span>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  progressPercent >= 100 ? 'bg-green-500' :
                  progressPercent >= 50 ? 'bg-primary' : 'bg-orange-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {progressPercent}% of {targetMinutes} min target
            </p>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full"
            size="sm"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-1" />
                Save
              </>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
