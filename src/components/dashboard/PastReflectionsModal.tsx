import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useReflections, DailyReflection } from '@/hooks/useReflections';
import { History, Heart, Trophy, Mountain, Target, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

const MOOD_MAP: Record<string, { emoji: string; label: string }> = {
  great: { emoji: '😊', label: 'Great' },
  good: { emoji: '🙂', label: 'Good' },
  okay: { emoji: '😐', label: 'Okay' },
  low: { emoji: '😔', label: 'Low' },
  tough: { emoji: '😫', label: 'Tough' },
};

interface ReflectionCardProps {
  reflection: DailyReflection;
}

function ReflectionCard({ reflection }: ReflectionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const moodInfo = reflection.mood ? MOOD_MAP[reflection.mood] : null;

  return (
    <div className="bg-muted/50 rounded-2xl p-4 border border-border">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-foreground">
              {format(new Date(reflection.reflection_date), 'EEEE, MMM d, yyyy')}
            </span>
          </div>
          {moodInfo && (
            <span className="text-xl" title={moodInfo.label}>
              {moodInfo.emoji}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </div>

      {expanded && (
        <div className="mt-4 space-y-4 animate-fade-in">
          {reflection.gratitude && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                🙏 Gratitude
              </div>
              <p className="text-sm text-foreground pl-6">{reflection.gratitude}</p>
            </div>
          )}

          {reflection.wins && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Wins
              </div>
              <p className="text-sm text-foreground pl-6">{reflection.wins}</p>
            </div>
          )}

          {reflection.challenges && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Mountain className="w-4 h-4 text-orange-500" />
                Challenges
              </div>
              <p className="text-sm text-foreground pl-6">{reflection.challenges}</p>
            </div>
          )}

          {reflection.tomorrow_goals && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Target className="w-4 h-4 text-primary" />
                Goals
              </div>
              <p className="text-sm text-foreground pl-6">{reflection.tomorrow_goals}</p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

interface PastReflectionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PastReflectionsModal({ open, onOpenChange }: PastReflectionsModalProps) {
  const { reflections, loading, refetch } = useReflections();

  // Refetch when modal opens
  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Past Reflections
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : reflections.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No reflections yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start journaling your daily thoughts!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {reflections.map(reflection => (
                <ReflectionCard key={reflection.id} reflection={reflection} />
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
