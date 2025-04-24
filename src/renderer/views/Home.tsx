import { useState, useEffect } from 'react';
import { Search, Plus, Trash, Save, Edit } from 'lucide-react';
import * as marked from 'marked';

type Note = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

// Main App Component
export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const openNotesDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('NotesDB', 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('notes')) {
          db.createObjectStore('notes', { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  };

  const loadNotes = async (): Promise<void> => {
    try {
      const db = await openNotesDB();
      const transaction = db.transaction(['notes'], 'readonly');
      const store = transaction.objectStore('notes');
      const request = store.getAll();

      request.onsuccess = (event) => {
        setNotes((event.target as IDBRequest<Note[]>).result);
      };
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const saveNotesToDB = async (notesToSave: Note[]): Promise<void> => {
    try {
      const db = await openNotesDB();
      const transaction = db.transaction(['notes'], 'readwrite');
      const store = transaction.objectStore('notes');

      store.clear();
      notesToSave.forEach((note) => {
        store.add(note);
      });
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now(),
      title: 'Untitled Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setNotes([newNote, ...notes]);
    setActiveNote(newNote);
    setIsEditing(true);
  };

  const updateNote = (updatedNote: Note) => {
    const updatedNotes = notes.map((note) =>
      note.id === updatedNote.id
        ? { ...updatedNote, updatedAt: new Date().toISOString() }
        : note,
    );
    setNotes(updatedNotes);
    setActiveNote(updatedNote);
  };

  const deleteNote = (noteId: number) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this note?',
    );
    if (confirmDelete) {
      const filteredNotes = notes.filter((note) => note.id !== noteId);
      setNotes(filteredNotes);
      if (activeNote && activeNote.id === noteId) {
        setActiveNote(filteredNotes[0] || null);
        setIsEditing(false);
      }
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    if (notes.length > 0) {
      saveNotesToDB(notes);
    }
  }, [notes]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col md:block hidden">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Notes App</h1>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search notes..."
              className="bg-transparent border-none w-full focus:outline-none ml-2 text-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="p-4 border-b border-gray-200">
          <button
            className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
            onClick={createNewNote}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </button>
        </div>

        <div className="overflow-y-auto flex-grow">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`p-4 border-b border-gray-200 cursor-pointer ${
                  activeNote && activeNote.id === note.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => {
                  setActiveNote(note);
                  setIsEditing(false);
                }}
              >
                <h3 className="font-medium text-gray-800 truncate">{note.title}</h3>
                <p className="text-sm text-gray-500 truncate mt-1">{note.content}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(note.updatedAt).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">No notes found</div>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Button */}
      <div className="md:hidden fixed top-4 left-4 z-10">
        <button 
          className="bg-white p-2 rounded-full shadow-md"
          onClick={() => {
            const sidebar = document.querySelector('.mobile-sidebar');
            sidebar?.classList.toggle('hidden');
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Sidebar */}
      <div className="mobile-sidebar hidden fixed inset-0 z-20 bg-white md:hidden w-64 h-screen">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Notes App</h1>
          <button 
            className="p-2"
            onClick={() => {
              const sidebar = document.querySelector('.mobile-sidebar');
              sidebar?.classList.add('hidden');
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search notes..."
              className="bg-transparent border-none w-full focus:outline-none ml-2 text-gray-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="p-4 border-b border-gray-200">
          <button
            className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
            onClick={() => {
              createNewNote();
              const sidebar = document.querySelector('.mobile-sidebar');
              sidebar?.classList.add('hidden');
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </button>
        </div>

        <div className="overflow-y-auto flex-grow">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`p-4 border-b border-gray-200 cursor-pointer ${
                  activeNote && activeNote.id === note.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => {
                  setActiveNote(note);
                  setIsEditing(false);
                  const sidebar = document.querySelector('.mobile-sidebar');
                  sidebar?.classList.add('hidden');
                }}
              >
                <h3 className="font-medium text-gray-800 truncate">{note.title}</h3>
                <p className="text-sm text-gray-500 truncate mt-1">{note.content}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(note.updatedAt).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">No notes found</div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col">
        {activeNote ? (
          <>
            <div className="border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">{activeNote.title}</h2>
              <div className="flex space-x-2">
                {isEditing ? (
                  <button
                    className="p-2 rounded-md hover:bg-gray-100"
                    onClick={() => setIsEditing(false)}
                  >
                    <Save className="h-5 w-5 text-gray-600" />
                  </button>
                ) : (
                  <button
                    className="p-2 rounded-md hover:bg-gray-100"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-5 w-5 text-gray-600" />
                  </button>
                )}
                <button
                  className="p-2 rounded-md hover:bg-gray-100 text-red-600"
                  onClick={() => deleteNote(activeNote.id)}
                >
                  <Trash className="h-5 w-5" />
                </button>
              </div>
            </div>

            {isEditing ? (
              <NoteEditor note={activeNote} onUpdateNote={updateNote} />
            ) : (
              <NoteViewer note={activeNote} />
            )}
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p>Select a note or create a new one</p>
              <button
                className="mt-4 inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                onClick={createNewNote}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Note Editor Component with Split View for Live Preview
type NoteEditorProps = {
  note: Note;
  onUpdateNote: (note: Note) => void;
};

function NoteEditor({ note, onUpdateNote }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setContent(value);
    onUpdateNote({
      ...note,
      content: value,
    });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setTitle(value);
    onUpdateNote({
      ...note,
      title: value,
    });
  };

  return (
    <div className="flex-grow flex flex-col md:flex-row">
      {/* Editor Panel */}
      <div className="flex-1 p-4 overflow-auto">
        <input
          type="text"
          className="w-full text-xl font-semibold mb-4 p-2 border border-gray-300 rounded-md"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note Title"
        />
        <textarea
          className="w-full h-full p-2 border border-gray-300 rounded-md font-mono resize-none"
          value={content}
          onChange={handleContentChange}
          placeholder="Write your note here using Markdown..."
        />
      </div>
      
      {/* Preview Panel */}
      <div style={{
  position: "absolute",
  right: 10,
  minHeight: "40vh",
  width: "300px",
  backgroundColor: "white",
  border: "1px solid rgba(0, 0, 0, 0.15)",
  borderRadius: "10px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  padding: "16px",
  overflowY: "auto",
  maxHeight: "80vh",
  zIndex: 100,
  transition: "all 0.2s ease-in-out"
}}>
  <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #eaeaea",
    paddingBottom: "10px",
    marginBottom: "12px"
  }}>
    <h3 style={{
      fontSize: "14px",
      fontWeight: 600,
      color: "#4b5563",
      margin: 0
    }}>Preview</h3>
    <button style={{
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "#9ca3af",
      padding: "4px"
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </div>
  <div style={{
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#374151"
  }} dangerouslySetInnerHTML={{ __html: marked.marked(content) }} />
</div>
    </div>
  );
}

// Note Viewer Component
type NoteViewerProps = {
  note: Note;
};

function NoteViewer({ note }: NoteViewerProps) {
  return (
    <div className="flex-grow p-6 overflow-auto">
      <div
        className="prose max-w-full"
        dangerouslySetInnerHTML={{
          __html: marked.marked(note.content),
        }}
      />
    </div>
  );
}