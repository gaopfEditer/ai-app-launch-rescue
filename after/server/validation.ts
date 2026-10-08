import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

export const loginSchema = registerSchema;

export const noteSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
});

export const summarizeSchema = z.object({
  noteIds: z.array(z.number().int().positive()).max(50).optional(),
});
