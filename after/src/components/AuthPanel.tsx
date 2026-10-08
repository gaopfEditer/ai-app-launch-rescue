import { FormEvent, useState } from 'react';

type Props = {
  onSubmit: (action: 'login' | 'register', email: string, password: string) => Promise<void>;
};

export function AuthPanel({ onSubmit }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSubmit(mode, email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Auth failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel auth-panel" aria-labelledby="auth-heading">
      <h2 id="auth-heading">{mode === 'login' ? 'Log in' : 'Create account'}</h2>
      <form onSubmit={(e) => void handleSubmit(e)}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="password">Password (min 8 characters)</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn primary" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>
      </form>
      <button type="button" className="link-btn" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Log in'}
      </button>
    </section>
  );
}
