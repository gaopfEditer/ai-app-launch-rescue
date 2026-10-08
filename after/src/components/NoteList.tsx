import type { Note } from '../api';

type Props = {
  notes: Note[];
  onDelete: (id: number) => Promise<void>;
};

export function NoteList({ notes, onDelete }: Props) {
  return (
    <ul className="note-list">
      {notes.map((note) => (
        <li key={note.id}>
          <article>
            <header>
              <h3>{note.title}</h3>
              <button
                type="button"
                className="btn secondary"
                aria-label={`Delete note ${note.title}`}
                onClick={() => void onDelete(note.id)}
              >
                Delete
              </button>
            </header>
            <p>{note.body}</p>
          </article>
        </li>
      ))}
    </ul>
  );
}
