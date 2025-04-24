import { useState, useEffect } from 'react';
import { Search, Plus, Trash, Save, Edit } from 'lucide-react';
import { NoteViewer } from '../components/NoteViewer';
import { NoteEditor } from '../components/NoteEditor';

export type Note = {
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

