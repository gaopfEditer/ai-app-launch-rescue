import { FormEvent, useState } from 'react';

type Props = {
  onCreate: (title: string, body: string) => Promise<void>;
};

export function NoteForm({ onCreate }: Props) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onCreate(title.trim(), body.trim());
      setTitle('');
      setBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save note');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="note-form" onSubmit={(e) => void handleSubmit(e)} aria-label="Add note">
      <label htmlFor="note-title">Title</label>
      <input id="note-title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
      <label htmlFor="note-body">Notes</label>
      <textarea id="note-body" value={body} onChange={(e) => setBody(e.target.value)} required rows={4} maxLength={10000} />
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn primary" disabled={busy}>
        {busy ? 'Saving…' : 'Add note'}
      </button>
    </form>
  );
}
