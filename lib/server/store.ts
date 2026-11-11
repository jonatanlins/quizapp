import { randomUUID, timingSafeEqual } from 'node:crypto';
import { categories, dailyQuestions, type Question, questions, shuffled } from './questions';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
  }
}
type Answer = {
  questionId: string;
  selectedOptionId: string;
  correctOptionId: string;
  correct: boolean;
  explanation: string;
  prompt: string;
  options: Question['options'];
};
type Session = {
  id: string;
  token: string;
  userId: string;
  username: string;
  categoryId: string;
  learnMode: boolean;
  dailyDate?: string;
  questions: Question[];
  index: number;
  state: 'question_ready' | 'feedback' | 'completed';
  answers: Answer[];
  createdAt: string;
  completedAt?: string;
  answerKeys: Map<string, { payload: string; response: unknown }>;
};
type Store = {
  sessions: Map<string, Session>;
  starts: Map<string, { payload: string; sessionId: string }>;
};
const globalStore = globalThis as typeof globalThis & { quizAppStore?: Store };
const store: Store = (globalStore.quizAppStore ??= { sessions: new Map(), starts: new Map() });
const fail = (status: number, code: string, message: string): never => {
  throw new ApiError(status, code, message);
};

function publicQuestion(q: Question, learnMode: boolean) {
  return {
    id: q.id,
    prompt: q.prompt,
    options: q.options,
    ...(learnMode ? { learnNote: q.learnNote } : {}),
  };
}
function results(s: Session) {
  const score = s.answers.filter((a) => a.correct).length;
  return {
    sessionId: s.id,
    categoryId: s.categoryId,
    username: s.username,
    learnMode: s.learnMode,
    ...(s.dailyDate ? { dailyDate: s.dailyDate } : {}),
    score,
    total: 5,
    percentage: score * 20,
    completedAt: s.completedAt,
    message:
      score >= 4
        ? 'Excellent work!'
        : score >= 3
          ? 'Good work — keep learning!'
          : 'Keep practicing — every attempt helps!',
    missed: s.answers.filter((a) => !a.correct),
  };
}
export function view(s: Session) {
  const base = {
    id: s.id,
    categoryId: s.categoryId,
    username: s.username,
    learnMode: s.learnMode,
    state: s.state,
    ...(s.dailyDate ? { dailyDate: s.dailyDate } : {}),
    progress: { current: Math.min(s.index + 1, 5), total: 5 },
    createdAt: s.createdAt,
  };
  if (s.state === 'completed') return { ...base, results: results(s) };
  return {
    ...base,
    question: publicQuestion(s.questions[s.index], s.learnMode),
    ...(s.state === 'feedback' ? { feedback: s.answers[s.index] } : {}),
  };
}
export function start(
  input: { categoryId: string; userId: string; username: string; learnMode: boolean },
  key: string
) {
  const payload = JSON.stringify(input);
  const prior = store.starts.get(key);
  if (prior) {
    if (prior.payload !== payload)
      fail(409, 'IDEMPOTENCY_CONFLICT', 'This idempotency key was used for a different request.');
    const s = store.sessions.get(prior.sessionId)!;
    return { token: s.token, session: view(s) };
  }
  if (input.categoryId !== 'daily' && !categories.some((c) => c.id === input.categoryId))
    fail(404, 'CATEGORY_NOT_FOUND', 'Category not found.');
  const dailyDate =
    input.categoryId === 'daily' ? new Date().toISOString().slice(0, 10) : undefined;
  const selected = (
    dailyDate
      ? dailyQuestions(dailyDate)
      : shuffled(questions.filter((q) => q.categoryId === input.categoryId)).slice(0, 5)
  ).map((q) => {
    const options = shuffled(q.options).map((option) => ({
      id: randomUUID(),
      text: option.text,
      correct: option.id === q.correctOptionId,
    }));
    return {
      ...q,
      correctOptionId: options.find((o) => o.correct)!.id,
      options: options.map(({ id, text }) => ({ id, text })),
    };
  });
  const s: Session = {
    id: randomUUID(),
    token: randomUUID() + randomUUID(),
    ...input,
    ...(dailyDate ? { dailyDate } : {}),
    questions: selected,
    index: 0,
    state: 'question_ready',
    answers: [],
    answerKeys: new Map(),
    createdAt: new Date().toISOString(),
  };
  store.sessions.set(s.id, s);
  store.starts.set(key, { payload, sessionId: s.id });
  return { token: s.token, session: view(s) };
}
export function getSession(id: string, token: string | null): Session {
  const s = store.sessions.get(id);
  if (!s || !token) return fail(404, 'SESSION_NOT_FOUND', 'Session not found or expired.');
  const a = Buffer.from(token);
  const b = Buffer.from(s.token);
  if (a.length !== b.length || !timingSafeEqual(a, b))
    return fail(404, 'SESSION_NOT_FOUND', 'Session not found or expired.');
  return s;
}
export function answer(s: Session, input: { questionId: string; optionId: string }, key: string) {
  const payload = JSON.stringify(input);
  const prior = s.answerKeys.get(key);
  if (prior) {
    if (prior.payload !== payload)
      fail(409, 'IDEMPOTENCY_CONFLICT', 'This idempotency key was used for a different answer.');
    return prior.response;
  }
  if (s.state !== 'question_ready' || s.questions[s.index]?.id !== input.questionId)
    fail(409, 'INVALID_STATE', 'This question is not awaiting an answer. Refresh the session.');
  const q = s.questions[s.index];
  if (!q.options.some((o) => o.id === input.optionId))
    fail(400, 'INVALID_OPTION', 'Option does not belong to this question.');
  const a: Answer = {
    questionId: q.id,
    selectedOptionId: input.optionId,
    correctOptionId: q.correctOptionId,
    correct: input.optionId === q.correctOptionId,
    explanation: q.explanation,
    prompt: q.prompt,
    options: q.options,
  };
  s.answers.push(a);
  s.state = 'feedback';
  const response = view(s);
  s.answerKeys.set(key, { payload, response });
  return response;
}
export function advance(s: Session, questionId: string) {
  const previousIndex = s.questions.findIndex((q) => q.id === questionId);
  if (previousIndex < 0) fail(409, 'INVALID_STATE', 'Question does not belong to this session.');
  if (previousIndex < s.index || (s.state === 'completed' && previousIndex === s.index))
    return view(s);
  if (s.state !== 'feedback' || s.questions[s.index].id !== questionId)
    fail(409, 'INVALID_STATE', 'Answer the current question before advancing.');
  if (s.index === 4) {
    s.state = 'completed';
    s.completedAt = new Date().toISOString();
  } else {
    s.index++;
    s.state = 'question_ready';
  }
  return view(s);
}
export function leaderboard() {
  const totals = new Map<
    string,
    {
      userId: string;
      username: string;
      learnMode: boolean;
      correct: number;
      attempts: number;
      questions: number;
    }
  >();
  for (const s of store.sessions.values()) {
    if (s.state !== 'completed') continue;
    const key = `${s.userId}:${s.learnMode}`;
    const row = totals.get(key) ?? {
      userId: s.userId,
      username: s.username,
      learnMode: s.learnMode,
      correct: 0,
      attempts: 0,
      questions: 0,
    };
    row.username = s.username;
    row.correct += s.answers.filter((a) => a.correct).length;
    row.attempts++;
    row.questions += 5;
    totals.set(key, row);
  }
  const rows = [...totals.values()].sort(
    (a, b) =>
      b.correct - a.correct ||
      a.username.localeCompare(b.username) ||
      a.userId.localeCompare(b.userId)
  );
  return { standard: rows.filter((r) => !r.learnMode), learn: rows.filter((r) => r.learnMode) };
}
