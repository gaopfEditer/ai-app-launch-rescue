import { describe, expect, it } from 'vitest';
import { noteSchema, registerSchema } from './validation.js';

describe('validation schemas', () => {
  it('rejects short passwords', () => {
    const parsed = registerSchema.safeParse({ email: 'a@b.com', password: 'short' });
    expect(parsed.success).toBe(false);
  });

  it('accepts valid note', () => {
    const parsed = noteSchema.safeParse({ title: 'Standup', body: 'Shipped auth fix' });
    expect(parsed.success).toBe(true);
  });
});
