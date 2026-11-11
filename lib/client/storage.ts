import { z } from 'zod';
import type { Result, StartPayload } from '@/lib/types';
import { resultSchema, uuidSchema } from '@/lib/types';

export const STORAGE_KEY = 'quizapp:v1';

export type Pending =
  | { kind: 'start'; key: string; payload: StartPayload }
  | { kind: 'answer'; key: string; payload: { questionId: string; optionId: string } }
  | { kind: 'advance'; questionId: string };

export type Stored = {
  userId: string;
  username: string;
  learnMode: boolean;
  active: { id: string; token: string } | null;
  pending: Pending | null;
  history: Result[];
};

export const pendingSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('start'),
    key: uuidSchema,
    payload: z.object({
      categoryId: z.string(),
      userId: uuidSchema,
      username: z.string(),
      learnMode: z.boolean(),
    }),
  }),
  z.object({
    kind: z.literal('answer'),
    key: uuidSchema,
    payload: z.object({ questionId: z.string(), optionId: uuidSchema }),
  }),
  z.object({ kind: z.literal('advance'), questionId: z.string() }),
]);

export const storedSchema = z.object({
  userId: uuidSchema,
  username: z.string(),
  learnMode: z.boolean(),
  active: z.object({ id: uuidSchema, token: z.string() }).nullable(),
  pending: pendingSchema.nullable(),
  history: z.array(resultSchema),
});

export const initialStored = (): Stored => ({
  userId: crypto.randomUUID(),
  username: '',
  learnMode: false,
  active: null,
  pending: null,
  history: [],
});

export function readStored(): { data?: Stored; error?: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = storedSchema.safeParse(JSON.parse(raw));
    if (parsed.success) return { data: parsed.data };
    return {
      error:
        'Saved progress is invalid and could not be restored. You can clear it and start again.',
    };
  } catch {
    return {
      error:
        'Browser storage is unavailable or contains invalid data. Progress may not survive a refresh.',
    };
  }
}

export function writeStored(data: Stored): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
