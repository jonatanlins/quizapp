import { ApiError, apiResponseSchema, uuidSchema } from '@/lib/types';
import {
  handleAdvanceSession,
  handleAnswerSession,
  handleCategories,
  handleGetSession,
  handleLeaderboard,
  handleStartSession,
  json,
} from './handlers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ path: string[] }> };

async function dispatch(method: string, path: string[], request: Request): Promise<unknown> {
  const [segment1, segment2, segment3] = path;

  if (method === 'GET' && path.length === 1 && segment1 === 'categories') {
    return handleCategories();
  }
  if (method === 'GET' && path.length === 1 && segment1 === 'leaderboard') {
    return handleLeaderboard();
  }
  if (method === 'POST' && path.length === 1 && segment1 === 'sessions') {
    return handleStartSession(request);
  }
  if (segment1 === 'sessions' && segment2 && uuidSchema.safeParse(segment2).success) {
    if (method === 'GET' && path.length === 2) {
      return handleGetSession(request, segment2);
    }
    if (method === 'POST' && path.length === 3 && segment3 === 'answers') {
      return handleAnswerSession(request, segment2);
    }
    if (method === 'POST' && path.length === 3 && segment3 === 'advance') {
      return handleAdvanceSession(request, segment2);
    }
  }

  throw new ApiError(404, 'NOT_FOUND', 'Endpoint not found.');
}

async function handle(request: Request, context: Context) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  try {
    const { path } = await context.params;
    const chaos =
      process.env.NODE_ENV !== 'production' ? request.headers.get('X-Quiz-Chaos') : null;

    if (chaos === 'before') {
      throw new ApiError(503, 'SIMULATED_FAILURE', 'Simulated failure before processing.');
    }

    const result = await dispatch(request.method, path, request);

    if (chaos === 'after') {
      throw new ApiError(
        503,
        'SIMULATED_RESPONSE_LOSS',
        'Simulated response loss after processing; reconcile before retrying.'
      );
    }

    return json(apiResponseSchema.parse(result));
  } catch (error) {
    if (error instanceof ApiError) {
      return json({ error: { code: error.code, message: error.message } }, error.status);
    }
    console.error('Quiz API error', error);
    return json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } },
      500
    );
  }
}

export const GET = handle;
export const POST = handle;
