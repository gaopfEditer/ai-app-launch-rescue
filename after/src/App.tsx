import { useCallback, useEffect, useState } from 'react';
import { authApi, notesApi, type Note, type User } from './api';
import { AuthPanel } from './components/AuthPanel';
import { NoteForm } from './components/NoteForm';
import { NoteList } from './components/NoteList';

type LoadState = 'idle' | 'loading' | 'error';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState(false);

  const refreshNotes = useCallback(async () => {
    setLoadState('loading');
    setError(null);
    try {
      const list = await notesApi.list();
      setNotes(list);
      setLoadState('idle');
    } catch (e) {
      setLoadState('error');
      setError(e instanceof Error ? e.message : 'Failed to load notes');
    }
  }, []);

  useEffect(() => {
    if (user) void refreshNotes();
  }, [user, refreshNotes]);

  async function handleAuth(action: 'login' | 'register', email: string, password: string) {
    setError(null);
    const fn = action === 'login' ? authApi.login : authApi.register;
    const u = await fn(email, password);
    setUser(u);
  }

  async function handleLogout() {
    await authApi.logout();
    setUser(null);
    setNotes([]);
    setSummary(null);
  }

  async function handleSummarize() {
    setAiBusy(true);
    setError(null);
    try {
      const { summary: s } = await notesApi.summarize();
      setSummary(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI summarize failed');
    } finally {
      setAiBusy(false);
    }
  }

  return (
    <div className="layout">
      <header className="header">
        <div>
          <p className="eyebrow">Production-ready demo</p>
          <h1>NoteFlow</h1>
          <p className="subtitle">Private notes with server-side AI summarization</p>
        </div>
        {user && (
          <div className="user-bar">
            <span>{user.email}</span>
            <button type="button" className="btn secondary" onClick={() => void handleLogout()}>
              Log out
            </button>
          </div>
        )}
      </header>

      {!user ? (
        <AuthPanel onSubmit={handleAuth} />
      ) : (
        <>
          <section className="panel">
            <div className="panel-head">
              <h2>Your notes</h2>
              <button type="button" className="btn primary" disabled={aiBusy} onClick={() => void handleSummarize()}>
                {aiBusy ? 'Summarizing…' : 'AI summarize'}
              </button>
            </div>
            {summary && (
              <div className="summary" role="status">
                {summary}
              </div>
            )}
            <NoteForm
              onCreate={async (title, body) => {
                const created = await notesApi.create(title, body);
                setNotes((prev) => [created, ...prev]);
              }}
            />
            {loadState === 'loading' && <p className="muted">Loading notes…</p>}
            {loadState === 'error' && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            {loadState === 'idle' && notes.length === 0 && (
              <p className="empty">No notes yet — add your first meeting summary above.</p>
            )}
            {loadState === 'idle' && notes.length > 0 && (
              <NoteList
                notes={notes}
                onDelete={async (id) => {
                  await notesApi.remove(id);
                  setNotes((prev) => prev.filter((n) => n.id !== id));
                }}
              />
            )}
          </section>
        </>
      )}

      {error && user && loadState !== 'error' && (
        <p className="toast error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
