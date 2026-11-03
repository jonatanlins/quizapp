import { z } from 'zod';
import { categories } from '@/lib/server/questions';
import { advance, answer, ApiError, getSession, leaderboard, start, view } from '@/lib/server/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const uuid = z.string().uuid();
const startSchema = z.object({ categoryId: z.string().min(1).max(100), userId: uuid, username: z.string().trim().min(1).max(40), learnMode: z.boolean() }).strict();
const answerSchema = z.object({ questionId: z.string().min(1).max(100), optionId: uuid }).strict();
const advanceSchema = z.object({ questionId: z.string().min(1).max(100) }).strict();
const optionSchema = z.object({ id: uuid, text: z.string() }).strict();
const feedbackSchema = z.object({ questionId: z.string(), selectedOptionId: uuid, correctOptionId: uuid, correct: z.boolean(), explanation: z.string(), prompt: z.string(), options: z.array(optionSchema) }).strict();
const resultSchema = z.object({ sessionId: uuid, categoryId: z.string(), username: z.string(), learnMode: z.boolean(), dailyDate: z.string().optional(), score: z.number().int().min(0).max(5), total: z.literal(5), percentage: z.number().min(0).max(100), completedAt: z.string(), message: z.string(), missed: z.array(feedbackSchema) }).strict();
const sessionBase = { id: uuid, categoryId: z.string(), username: z.string(), learnMode: z.boolean(), dailyDate: z.string().optional(), progress: z.object({ current: z.number().int().min(1).max(5), total: z.literal(5) }).strict(), createdAt: z.string() };
const sessionSchema = z.union([
  z.object({ ...sessionBase, state: z.literal('question_ready'), question: z.object({ id: z.string(), prompt: z.string(), options: z.array(optionSchema), learnNote: z.string().optional() }).strict() }).strict(),
  z.object({ ...sessionBase, state: z.literal('feedback'), question: z.object({ id: z.string(), prompt: z.string(), options: z.array(optionSchema), learnNote: z.string().optional() }).strict(), feedback: feedbackSchema }).strict(),
  z.object({ ...sessionBase, state: z.literal('completed'), results: resultSchema }).strict()
]);
const rowSchema = z.object({ userId: uuid, username: z.string(), learnMode: z.boolean(), correct: z.number().int(), attempts: z.number().int(), questions: z.number().int() }).strict();
const responseSchema = z.union([
  z.object({ categories: z.array(z.object({ id: z.string(), name: z.string(), description: z.string(), questionCount: z.number().int() }).strict()) }).strict(),
  z.object({ standard: z.array(rowSchema), learn: z.array(rowSchema) }).strict(),
  z.object({ token: z.string(), session: sessionSchema }).strict(),
  sessionSchema
]);
type Context = { params: Promise<{ path: string[] }> };
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
async function body<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  let raw: unknown; try { raw = await request.json(); } catch { throw new ApiError(400, 'INVALID_JSON', 'Request body must be valid JSON.'); }
  const result = schema.safeParse(raw); if (!result.success) throw new ApiError(400, 'VALIDATION_ERROR', 'Request body is invalid.'); return result.data;
}
function key(request: Request) { const parsed = uuid.safeParse(request.headers.get('Idempotency-Key')); if (!parsed.success) throw new ApiError(400, 'INVALID_IDEMPOTENCY_KEY', 'A UUID Idempotency-Key header is required.'); return parsed.data; }
function token(request: Request) { const header = request.headers.get('Authorization'); return header?.startsWith('Bearer ') ? header.slice(7) : null; }
async function handle(request: Request, context: Context) {
  await new Promise(resolve => setTimeout(resolve, 500));
  try {
    const path = (await context.params).path;
    const chaos = process.env.NODE_ENV !== 'production' ? request.headers.get('X-Quiz-Chaos') : null;
    if (chaos === 'before') throw new ApiError(503, 'SIMULATED_FAILURE', 'Simulated failure before processing.');
    let result: unknown;
    if (request.method === 'GET' && path.length === 1 && path[0] === 'categories') result = { categories };
    else if (request.method === 'GET' && path.length === 1 && path[0] === 'leaderboard') result = leaderboard();
    else if (request.method === 'POST' && path.length === 1 && path[0] === 'sessions') result = start(await body(request, startSchema), key(request));
    else if (path[0] === 'sessions' && path.length >= 2 && uuid.safeParse(path[1]).success) {
      const session = getSession(path[1], token(request));
      if (request.method === 'GET' && path.length === 2) result = view(session);
      else if (request.method === 'POST' && path.length === 3 && path[2] === 'answers') result = answer(session, await body(request, answerSchema), key(request));
      else if (request.method === 'POST' && path.length === 3 && path[2] === 'advance') result = advance(session, (await body(request, advanceSchema)).questionId);
      else throw new ApiError(404, 'NOT_FOUND', 'Endpoint not found.');
    } else throw new ApiError(404, 'NOT_FOUND', 'Endpoint not found.');
    if (chaos === 'after') throw new ApiError(503, 'SIMULATED_RESPONSE_LOSS', 'Simulated response loss after processing; reconcile before retrying.');
    return json(responseSchema.parse(result));
  } catch (error) {
    if (error instanceof ApiError) return json({ error: { code: error.code, message: error.message } }, error.status);
    console.error('Quiz API error', error); return json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } }, 500);
  }
}
export const GET = handle;
export const POST = handle;
