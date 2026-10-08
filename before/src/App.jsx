import { useEffect, useState } from 'react';
import NoteForm from './components/NoteForm';
import NoteList from './components/NoteList';
import { summarizeNote } from './lib/ai';

export default function App() {
  const [notes, setNotes] = useState(null);
  const [summary, setSummary] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/notes')
      .then((r) => r.json())
      .then(setNotes);
  }, []);

  async function addNote(note) {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
    const created = await res.json();
    setNotes((n) => [created, ...(n || [])]);
  }

  async function deleteNote(id) {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    setNotes((n) => n.filter((x) => x.id !== id));
  }

  async function runAi() {
    setBusy(true);
    const blob = (notes || []).map((n) => n.body).join('\n');
    const result = await summarizeNote(blob || 'Empty workspace');
    setSummary(result);
    setBusy(false);
  }

  return (
    <div className="app-shell">
      <header>
        <h1>NoteFlow</h1>
        <p className="tag">Before demo — shared notes, no login</p>
      </header>
      <div className="toolbar">
        <button onClick={runAi} disabled={busy}>
          ✨ AI Summarize All
        </button>
        {summary && <div className="summary-box">{summary}</div>}
      </div>
      <NoteForm onAdd={addNote} />
      <NoteList notes={notes} onDelete={deleteNote} />
    </div>
  );
}
