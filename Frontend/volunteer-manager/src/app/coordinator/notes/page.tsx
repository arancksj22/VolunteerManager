'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StickyNote, Plus, Search, Tag, Pin, Trash2, Edit, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { notesApi, Note } from '@/lib/api';
import { createBrowserClient } from '@supabase/ssr';
import { formatRelativeTime } from '@/lib/utils';

export default function NotesPage() {
  const queryClient = useQueryClient();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [coordinatorEmail, setCoordinatorEmail] = useState<string>('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTags, setNewNoteTags] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Get coordinator email
  useEffect(() => {
    const getEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setCoordinatorEmail(user.email);
      }
    };
    getEmail();
  }, [supabase]);

  // Fetch notes
  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes', coordinatorEmail, selectedTag],
    queryFn: () => notesApi.getAll(coordinatorEmail, selectedTag || undefined),
    enabled: !!coordinatorEmail,
  });

  // Fetch all tags
  const { data: tagsData } = useQuery({
    queryKey: ['notes-tags', coordinatorEmail],
    queryFn: () => notesApi.getTags(coordinatorEmail),
    enabled: !!coordinatorEmail,
  });

  // Filter notes by search
  const filteredNotes = notes?.filter(note =>
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: { content: string; tags: string[] }) =>
      notesApi.create(coordinatorEmail, data.content, data.tags),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['notes-tags'] });
      toast.success('Note created');
      setNewNoteContent('');
      setNewNoteTags('');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: { noteId: string; content?: string; tags?: string[]; pinned?: boolean }) =>
      notesApi.update(data.noteId, data.content, data.tags, data.pinned),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['notes-tags'] });
      toast.success('Note updated');
      setEditingNote(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (noteId: string) => notesApi.delete(noteId, coordinatorEmail),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['notes-tags'] });
      toast.success('Note deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleCreate = () => {
    if (!newNoteContent.trim()) {
      toast.error('Note content is required');
      return;
    }

    const tags = newNoteTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    createMutation.mutate({ content: newNoteContent, tags });
  };

  const handleUpdate = (note: Note) => {
    if (!note.content.trim()) {
      toast.error('Note content is required');
      return;
    }

    updateMutation.mutate({
      noteId: note.id,
      content: note.content,
      tags: note.tags,
    });
  };

  const handleTogglePin = (note: Note) => {
    updateMutation.mutate({
      noteId: note.id,
      pinned: !note.pinned,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <StickyNote className="h-8 w-8 text-purple-600" />
          Quick Notes
        </h1>
        <p className="text-muted-foreground mt-1">
          Capture volunteer context, meeting notes, and important reminders
        </p>
      </div>

      {/* Create Note Card */}
      <Card className="border-purple-200 shadow-sm">
        <CardHeader className="bg-purple-50/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5 text-purple-600" />
            Create New Note
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Textarea
              placeholder="Write your note here... (e.g., 'Sarah mentioned interest in shelter work', 'Follow up with Mark about fostering')"
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              rows={3}
              className="resize-none focus:border-purple-300 focus:ring-purple-200"
            />
          </div>
          <div className="flex gap-3">
            <Input
              placeholder="Tags (comma-separated, e.g., follow-up, urgent, idea)"
              value={newNoteTags}
              onChange={(e) => setNewNoteTags(e.target.value)}
              className="flex-1 focus:border-purple-300 focus:ring-purple-200"
            />
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending || !newNoteContent.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <div className="flex gap-3 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 focus:border-purple-300 focus:ring-purple-200"
          />
        </div>
        {selectedTag && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedTag(null)}
            className="text-purple-600 border-purple-300 hover:bg-purple-50"
          >
            <X className="h-4 w-4 mr-1" />
            Clear Filter
          </Button>
        )}
      </div>

      {/* Tag Filters */}
      {tagsData?.tags && tagsData.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
            <Tag className="h-4 w-4" />
            Tags:
          </span>
          {tagsData.tags.map(tag => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                selectedTag === tag
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'border-purple-300 text-purple-700 hover:bg-purple-50'
              }`}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading notes...</p>
            </CardContent>
          </Card>
        ) : filteredNotes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <StickyNote className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">
                {searchQuery || selectedTag ? 'No matching notes found' : 'No notes yet. Create your first note above!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotes.map((note) => (
            <Card
              key={note.id}
              className={`transition-all hover:shadow-md ${
                note.pinned ? 'border-purple-300 bg-purple-50/30' : ''
              }`}
            >
              <CardContent className="pt-6">
                {editingNote?.id === note.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editingNote.content}
                      onChange={(e) =>
                        setEditingNote({ ...editingNote, content: e.target.value })
                      }
                      rows={3}
                      className="resize-none focus:border-purple-300 focus:ring-purple-200"
                    />
                    <Input
                      value={editingNote.tags.join(', ')}
                      onChange={(e) =>
                        setEditingNote({
                          ...editingNote,
                          tags: e.target.value.split(',').map(t => t.trim()).filter(t => t),
                        })
                      }
                      placeholder="Tags (comma-separated)"
                      className="focus:border-purple-300 focus:ring-purple-200"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdate(editingNote)}
                        disabled={updateMutation.isPending}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingNote(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <p className="text-sm whitespace-pre-wrap flex-1">{note.content}</p>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleTogglePin(note)}
                          className={note.pinned ? 'text-purple-600' : 'text-muted-foreground'}
                        >
                          <Pin className={`h-4 w-4 ${note.pinned ? 'fill-purple-600' : ''}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingNote(note)}
                          className="text-muted-foreground hover:text-purple-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(note.id)}
                          disabled={deleteMutation.isPending}
                          className="text-muted-foreground hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex gap-2 flex-wrap">
                        {note.tags.map((tag, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-xs border-purple-200 text-purple-700 bg-purple-50"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(note.created_at)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats Footer */}
      {filteredNotes.length > 0 && (
        <Card className="border-purple-200 bg-purple-50/30">
          <CardContent className="py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-900 font-medium">
                {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
                {selectedTag && ` with tag "${selectedTag}"`}
              </span>
              <span className="text-purple-700">
                {filteredNotes.filter(n => n.pinned).length} pinned
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
