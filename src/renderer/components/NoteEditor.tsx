import { useState, useEffect } from "react";
import { Note } from "../views/Home";
import * as marked from 'marked'
// Note Editor Component with Split View for Live Preview
type NoteEditorProps = {
    note: Note;
    onUpdateNote: (note: Note) => void;
  };
  
export function NoteEditor({ note, onUpdateNote }: NoteEditorProps) {
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
        {/* implement the editor panel preview panel stuff here with a tabbed system */}
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
  
  