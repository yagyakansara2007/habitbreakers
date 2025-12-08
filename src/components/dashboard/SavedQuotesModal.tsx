import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useQuotes, Quote } from '@/hooks/useQuotes';
import { Pencil, Trash2, Eye, Save, X, Search } from 'lucide-react';
import { format } from 'date-fns';

interface SavedQuotesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SavedQuotesModal({ open, onOpenChange }: SavedQuotesModalProps) {
  const { quotes, updateQuote, deleteQuote, loading } = useQuotes();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleEdit = (quote: Quote) => {
    setEditingId(quote.id);
    setEditContent(quote.content);
    setViewingId(null);
  };

  const handleSaveEdit = async (id: string) => {
    await updateQuote(id, editContent);
    setEditingId(null);
    setEditContent('');
  };

  const handleDelete = async (id: string) => {
    await deleteQuote(id);
    setViewingId(null);
    setEditingId(null);
  };

  const filteredQuotes = quotes.filter(q => 
    q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (q.mood && q.mood.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const viewingQuote = quotes.find(q => q.id === viewingId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📝 My Saved Quotes & Notes
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search quotes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* View Mode */}
        {viewingQuote && !editingId && (
          <div className="bg-muted/50 rounded-xl p-4 space-y-3 animate-fade-in">
            <p className="text-foreground whitespace-pre-wrap">{viewingQuote.content}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{format(new Date(viewingQuote.created_at), 'MMMM d, yyyy - h:mm a')}</span>
              {viewingQuote.mood && <span className="capitalize">Mood: {viewingQuote.mood}</span>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(viewingQuote)}>
                <Pencil className="w-3 h-3 mr-1" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(viewingQuote.id)}>
                <Trash2 className="w-3 h-3 mr-1" /> Delete
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setViewingId(null)}>
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Edit Mode */}
        {editingId && (
          <div className="space-y-3 animate-fade-in">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleSaveEdit(editingId)}>
                <Save className="w-3 h-3 mr-1" /> Save
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                <X className="w-3 h-3 mr-1" /> Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Quotes List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {loading ? (
            <div className="text-center text-muted-foreground py-8">Loading...</div>
          ) : filteredQuotes.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {searchQuery ? 'No quotes match your search' : 'No saved quotes yet'}
            </div>
          ) : (
            filteredQuotes.map((quote) => (
              <div
                key={quote.id}
                className={`p-3 rounded-xl border transition-all ${
                  viewingId === quote.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50 bg-background'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground line-clamp-2">
                      "{quote.content}"
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(quote.created_at), 'MMM d, yyyy - h:mm a')}
                      {quote.mood && ` • ${quote.mood}`}
                    </span>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setViewingId(quote.id)}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleEdit(quote)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => handleDelete(quote.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
