export type User = { id: number; email: string };
export type Note = { id: number; title: string; body: string; created_at?: string };

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : 'Request failed');
  }
  return data as T;
}

export const authApi = {
  register: (email: string, password: string) =>
    api<User>('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),
  login: (email: string, password: string) =>
    api<User>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => api<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
};

export const notesApi = {
  list: () => api<Note[]>('/api/notes'),
  create: (title: string, body: string) =>
    api<Note>('/api/notes', { method: 'POST', body: JSON.stringify({ title, body }) }),
  remove: (id: number) => api<{ ok: boolean }>(`/api/notes/${id}`, { method: 'DELETE' }),
  summarize: () => api<{ summary: string; mode: string }>('/api/ai/summarize', { method: 'POST', body: '{}' }),
};
