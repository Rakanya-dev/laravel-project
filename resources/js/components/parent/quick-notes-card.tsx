import { useState } from 'react';
import { Plus, Edit, X, Save, StickyNote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Note {
  id: number;
  text: string;
  date: string;
}

interface QuickNotesCardProps {
  notes: Note[];
  onAdd: (text: string) => void;
  onEdit: (id: number, text: string) => void;
  onDelete: (id: number) => void;
}

export function QuickNotesCard({ notes, onAdd, onEdit, onDelete }: QuickNotesCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  const handleAdd = () => {
    if (!newNote.trim()) return;
    onAdd(newNote);
    setNewNote('');
    setIsAdding(false);
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditingText(note.text);
  };

  const saveEdit = () => {
    if (!editingText.trim() || editingId === null) return;
    onEdit(editingId, editingText);
    setEditingId(null);
    setEditingText('');
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <StickyNote className="size-5 text-blue-500" /> Quick Notes
          </CardTitle>
          {!isAdding && (
            <Button size="sm" onClick={() => setIsAdding(true)} className="gap-1 h-8 bg-blue-600 hover:bg-blue-700">
              <Plus className="size-3.5" /> Add
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 overflow-y-auto max-h-[400px]">
        {isAdding && (
          <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-3 animate-in fade-in slide-in-from-top-2">
            <Textarea
              placeholder="Write a new note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[80px] bg-white"
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={() => setIsAdding(false)} className="h-8">Cancel</Button>
              <Button size="sm" onClick={handleAdd} className="h-8 bg-blue-600 hover:bg-blue-700">Save Note</Button>
            </div>
          </div>
        )}

        {notes.length === 0 && !isAdding ? (
          <div className="py-8 text-center text-neutral-500 border-2 border-dashed border-neutral-100 rounded-lg">
            <p>No notes yet.</p>
            <p className="text-xs mt-1">Keep track of important details here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="group relative rounded-lg border-l-4 border-l-amber-400 bg-amber-50/50 p-4 transition-all hover:bg-amber-50">
                {editingId === note.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="min-h-[80px] bg-white"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7 px-2">Cancel</Button>
                      <Button size="sm" onClick={saveEdit} className="h-7 bg-amber-500 hover:bg-amber-600 text-white">Save</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-800 leading-relaxed">{note.text}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-neutral-400">
                        {new Date(note.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-neutral-400 hover:text-blue-600" onClick={() => startEdit(note)}>
                          <Edit className="size-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-neutral-400 hover:text-red-600" onClick={() => onDelete(note.id)}>
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
