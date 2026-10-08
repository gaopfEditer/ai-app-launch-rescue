export default function NoteList({ notes, onDelete }) {
  if (!notes) return null;
  return (
    <ul className="note-list">
      {notes.map((n) => (
        <li key={n.id}>
          <strong>{n.title}</strong>
          <div dangerouslySetInnerHTML={{ __html: n.body }} />
          <button onClick={() => onDelete(n.id)}>🗑</button>
        </li>
      ))}
    </ul>
  );
}
