import type { z } from 'zod';
import { categories } from '@/lib/server/questions';
import { advance, answer, getSession, leaderboard, start, view } from '@/lib/server/store';
import {
  type AdvancePayload,
  type AnswerPayload,
  ApiError,
  advancePayloadSchema,
  answerPayloadSchema,
  type StartPayload,
  startPayloadSchema,
  uuidSchema,
} from '@/lib/types';

export const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function parseBody<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new ApiError(400, 'INVALID_JSON', 'Request body must be valid JSON.');
  }
  const result = schema.safeParse(raw);
  if (!result.success) throw new ApiError(400, 'VALIDATION_ERROR', 'Request body is invalid.');
  return result.data;
}

export function extractKey(request: Request): string {
  const parsed = uuidSchema.safeParse(request.headers.get('Idempotency-Key'));
  if (!parsed.success) {
    throw new ApiError(
      400,
      'INVALID_IDEMPOTENCY_KEY',
      'A UUID Idempotency-Key header is required.'
    );
  }
  return parsed.data;
}

export function extractToken(request: Request): string | null {
  const header = request.headers.get('Authorization');
  return header?.startsWith('Bearer ') ? header.slice(7) : null;
}

export async function handleStartSession(request: Request) {
  const payload: StartPayload = await parseBody(request, startPayloadSchema);
  return start(payload, extractKey(request));
}

export function handleGetSession(request: Request, sessionId: string) {
  const session = getSession(sessionId, extractToken(request));
  return view(session);
}

export async function handleAnswerSession(request: Request, sessionId: string) {
  const payload: AnswerPayload = await parseBody(request, answerPayloadSchema);
  const session = getSession(sessionId, extractToken(request));
  return answer(session, payload, extractKey(request));
}

export async function handleAdvanceSession(request: Request, sessionId: string) {
  const payload: AdvancePayload = await parseBody(request, advancePayloadSchema);
  const session = getSession(sessionId, extractToken(request));
  return advance(session, payload.questionId);
}

export function handleCategories() {
  return { categories };
}

export function handleLeaderboard() {
  return leaderboard();
}
