import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useQuotes } from '@/hooks/useQuotes';
import { BookOpen, Save, Bookmark, Loader2 } from 'lucide-react';
import { SavedQuotesModal } from './SavedQuotesModal';

const MOODS = [
  { emoji: '😊', label: 'Great', value: 'great' },
  { emoji: '🙂', label: 'Good', value: 'good' },
  { emoji: '😐', label: 'Okay', value: 'okay' },
  { emoji: '😔', label: 'Low', value: 'low' },
];

export function MoodDescriptionBox() {
  const { quotes, addQuote, loading: quotesLoading } = useQuotes();
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [saving, setSaving] = useState(false);
  const [showQuotes, setShowQuotes] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;
    
    setSaving(true);
    await addQuote(content, mood);
    setContent('');
    setMood('');
    setSaving(false);
  };

  const latestQuote = quotes[0];

  return (
    <>
      <Card className="p-5 bg-gradient-to-br from-mint/10 to-teal/10 border-border space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-teal" />
          <h3 className="font-bold text-foreground">Daily Journal</h3>
        </div>

        {/* Mood Selection */}
        <div className="flex gap-2">
          {MOODS.map(m => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              className={`flex-1 p-2 rounded-xl border-2 transition-all ${
                mood === m.value 
                  ? 'border-teal bg-teal/10' 
                  : 'border-border hover:border-teal/50'
              }`}
            >
              <span className="text-xl block text-center">{m.emoji}</span>
            </button>
          ))}
        </div>

        {/* Content Input */}
        <Textarea
          placeholder="Write your thoughts, feelings, or a quote that inspires you..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="bg-background/50 border-border resize-none"
        />

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            onClick={handleSave} 
            disabled={saving || !content.trim()}
            className="flex-1 bg-teal hover:bg-teal/90"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Note
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowQuotes(true)}
            className="gap-2"
          >
            <Bookmark className="w-4 h-4" />
            My Saved Quotes
          </Button>
        </div>

        {/* Latest Quote Preview */}
        {latestQuote && (
          <div className="bg-background/50 rounded-xl p-3 border border-border/50">
            <span className="text-xs text-muted-foreground">Latest entry:</span>
            <p className="text-sm text-foreground line-clamp-2 mt-1">
              "{latestQuote.content}"
            </p>
            <span className="text-xs text-muted-foreground">
              {new Date(latestQuote.created_at).toLocaleDateString()}
            </span>
          </div>
        )}
      </Card>

      <SavedQuotesModal open={showQuotes} onOpenChange={setShowQuotes} />
    </>
  );
}
