import { useState } from 'react';

export default function NoteForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onAdd({ title, body });
        setTitle('');
        setBody('');
      }}
      className="note-form"
    >
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Notes" />
      <button type="submit">+</button>
    </form>
  );
}
