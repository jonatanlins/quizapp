import { z } from 'zod';
import {
  type AnswerPayload,
  ApiError,
  type Category,
  type Chaos,
  categoriesSchema,
  type Leaderboard,
  leaderboardSchema,
  type Result,
  resultSchema,
  type Session,
  type StartPayload,
  type StartResponse,
  sessionSchema,
  startResponseSchema,
} from '@/lib/types';

export {
  ApiError,
  type Category,
  type Chaos,
  categoriesSchema,
  type Leaderboard,
  leaderboardSchema,
  type Result,
  resultSchema,
  type Session,
  type StartPayload,
  sessionSchema,
};

const errorResponseSchema = z.object({
  error: z.object({ code: z.string(), message: z.string() }),
});

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
      const parsed = errorResponseSchema.safeParse(data);
      throw new ApiError(
        parsed.success ? parsed.data.error.message : 'The server could not complete the request.',
        parsed.success ? parsed.data.error.code : 'SERVER_ERROR',
        response.status
      );
    }

    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      throw new ApiError('The server returned an unexpected response.', 'INVALID_RESPONSE');
    }
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
  start: (payload: StartPayload, key: string, chaos: Chaos): Promise<StartResponse> =>
    request('sessions', startResponseSchema, chaos, { method: 'POST', body: payload, key }),
  session: (id: string, token: string, chaos: Chaos) =>
    request(`sessions/${id}`, sessionSchema, chaos, { token }),
  answer: (id: string, token: string, payload: AnswerPayload, key: string, chaos: Chaos) =>
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
