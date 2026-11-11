import { z } from 'zod';

const option = z.object({ id: z.string().uuid(), text: z.string() });
const feedback = z.object({
  questionId: z.string(),
  selectedOptionId: z.string().uuid(),
  correctOptionId: z.string().uuid(),
  correct: z.boolean(),
  explanation: z.string(),
  prompt: z.string(),
  options: z.array(option),
});
export const resultSchema = z.object({
  sessionId: z.string().uuid(),
  categoryId: z.string(),
  username: z.string(),
  learnMode: z.boolean(),
  dailyDate: z.string().optional(),
  score: z.number(),
  total: z.number(),
  percentage: z.number(),
  completedAt: z.string(),
  message: z.string(),
  missed: z.array(feedback),
});
const common = {
  id: z.string().uuid(),
  categoryId: z.string(),
  username: z.string(),
  learnMode: z.boolean(),
  dailyDate: z.string().optional(),
  progress: z.object({ current: z.number(), total: z.number() }),
  createdAt: z.string(),
};
const question = z.object({
  id: z.string(),
  prompt: z.string(),
  options: z.array(option),
  learnNote: z.string().optional(),
});
export const sessionSchema = z.discriminatedUnion('state', [
  z.object({ ...common, state: z.literal('question_ready'), question }),
  z.object({ ...common, state: z.literal('feedback'), question, feedback }),
  z.object({ ...common, state: z.literal('completed'), results: resultSchema }),
]);
export const categoriesSchema = z.object({
  categories: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      questionCount: z.number(),
    })
  ),
});
const row = z.object({
  userId: z.string(),
  username: z.string(),
  learnMode: z.boolean(),
  correct: z.number(),
  attempts: z.number(),
  questions: z.number(),
});
export const leaderboardSchema = z.object({ standard: z.array(row), learn: z.array(row) });
const startSchema = z.object({ token: z.string(), session: sessionSchema });
export type Session = z.infer<typeof sessionSchema>;
export type Result = z.infer<typeof resultSchema>;
export type Category = z.infer<typeof categoriesSchema>['categories'][number];
export type Leaderboard = z.infer<typeof leaderboardSchema>;
export type Chaos = 'off' | 'before' | 'after';
export type StartPayload = {
  categoryId: string;
  userId: string;
  username: string;
  learnMode: boolean;
};
export class ApiError extends Error {
  constructor(
    message: string,
    public code = 'NETWORK_ERROR',
    public status = 0
  ) {
    super(message);
  }
}
async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  chaos: Chaos,
  options: { method?: 'POST'; token?: string; key?: string; body?: unknown } = {}
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`/api/${path}`, {
      method: options.method ?? 'GET',
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...(options.key ? { 'Idempotency-Key': options.key } : {}),
        ...(chaos !== 'off' ? { 'X-Quiz-Chaos': chaos } : {}),
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const parsed = z
        .object({ error: z.object({ code: z.string(), message: z.string() }) })
        .safeParse(data);
      throw new ApiError(
        parsed.success ? parsed.data.error.message : 'The server could not complete the request.',
        parsed.success ? parsed.data.error.code : 'SERVER_ERROR',
        response.status
      );
    }
    const parsed = schema.safeParse(data);
    if (!parsed.success)
      throw new ApiError('The server returned an unexpected response.', 'INVALID_RESPONSE');
    return parsed.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Could not reach the server. Check your connection and try again.');
  } finally {
    clearTimeout(timer);
  }
}
export const api = {
  categories: (chaos: Chaos) => request('categories', categoriesSchema, chaos),
  leaderboard: (chaos: Chaos) => request('leaderboard', leaderboardSchema, chaos),
  start: (payload: StartPayload, key: string, chaos: Chaos) =>
    request('sessions', startSchema, chaos, { method: 'POST', body: payload, key }),
  session: (id: string, token: string, chaos: Chaos) =>
    request(`sessions/${id}`, sessionSchema, chaos, { token }),
  answer: (
    id: string,
    token: string,
    payload: { questionId: string; optionId: string },
    key: string,
    chaos: Chaos
  ) =>
    request(`sessions/${id}/answers`, sessionSchema, chaos, {
      method: 'POST',
      token,
      key,
      body: payload,
    }),
  advance: (id: string, token: string, questionId: string, chaos: Chaos) =>
    request(`sessions/${id}/advance`, sessionSchema, chaos, {
      method: 'POST',
      token,
      body: { questionId },
    }),
};
