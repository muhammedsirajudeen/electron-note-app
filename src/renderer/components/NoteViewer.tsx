import { Note } from "../views/Home";
import * as marked from 'marked';

// Note Viewer Component
type NoteViewerProps = {
    note: Note;
  };
  
export function NoteViewer({ note }: NoteViewerProps) {
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