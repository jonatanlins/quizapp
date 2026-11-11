import { randomUUID } from 'node:crypto';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ApiError, api, type Session } from '../lib/client/api';
import { useQuiz } from '../lib/client/store';

const initial = useQuiz.getState();
const id = randomUUID(),
  optionId = randomUUID();
const base = {
  id,
  categoryId: 'daily',
  dailyDate: '2026-11-03',
  username: 'Ada',
  learnMode: false,
  progress: { current: 1, total: 5 },
  createdAt: '2026-11-03T00:00:00Z',
};
const question = { id: 'q', prompt: 'Question?', options: [{ id: optionId, text: 'A' }] };
const ready: Session = { ...base, state: 'question_ready', question };
const feedback: Session = {
  ...base,
  state: 'feedback',
  question,
  feedback: {
    questionId: 'q',
    selectedOptionId: optionId,
    correctOptionId: optionId,
    correct: true,
    explanation: 'Yes',
    prompt: 'Question?',
    options: question.options,
  },
};
const completed: Session = {
  ...base,
  state: 'completed',
  results: {
    sessionId: id,
    categoryId: 'daily',
    dailyDate: '2026-11-03',
    username: 'Ada',
    learnMode: false,
    score: 5,
    total: 5,
    percentage: 100,
    completedAt: '2026-11-03T00:01:00Z',
    message: 'Excellent',
    missed: [],
  },
};
let data: Map<string, string>;
beforeEach(() => {
  data = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
  });
  useQuiz.setState({ ...initial, userId: randomUUID(), hydrated: true }, true);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  useQuiz.setState(initial, true);
});
it('persists preferences, loads categories and leaderboard, and exposes errors', async () => {
  const categories = vi.spyOn(api, 'categories').mockResolvedValue({ categories: [] });
  const leaderboard = vi.spyOn(api, 'leaderboard').mockResolvedValue({ standard: [], learn: [] });
  useQuiz.getState().setName(' Ada ');
  useQuiz.getState().setLearn(true);
  useQuiz.getState().setChaos('after');
  expect(JSON.parse(data.get('quizapp:v1')!).username).toBe(' Ada ');
  expect(useQuiz.getState().learnMode).toBe(true);
  expect(useQuiz.getState().chaos).toBe('after');
  await useQuiz.getState().loadCategories();
  await useQuiz.getState().loadBoard();
  expect(categories).toHaveBeenCalled();
  expect(leaderboard).toHaveBeenCalled();
  categories.mockRejectedValue(new Error('categories offline'));
  leaderboard.mockRejectedValue(new Error('board offline'));
  await useQuiz.getState().loadCategories();
  await useQuiz.getState().loadBoard();
  expect(useQuiz.getState().categoriesError).toBe('categories offline');
  expect(useQuiz.getState().boardError).toBe('board offline');
});
it('starts a daily session, advances, records one result and resets', async () => {
  vi.spyOn(api, 'start').mockResolvedValue({ token: 'secret', session: ready });
  vi.spyOn(api, 'advance').mockResolvedValue(completed);
  useQuiz.getState().setName(' Ada ');
  await useQuiz.getState().start('daily');
  expect(useQuiz.getState().active?.id).toBe(id);
  expect(useQuiz.getState().session?.dailyDate).toBe('2026-11-03');
  useQuiz.setState({ session: feedback });
  await useQuiz.getState().advance();
  expect(useQuiz.getState().history).toHaveLength(1);
  useQuiz.setState({ session: feedback });
  await useQuiz.getState().advance();
  expect(useQuiz.getState().history).toHaveLength(1);
  useQuiz.getState().clearHistory();
  expect(useQuiz.getState().history).toEqual([]);
  expect(useQuiz.getState().active).toBeNull();
  useQuiz.getState().reset();
  useQuiz.getState().resetStorage();
  expect(useQuiz.getState().username).toBe('');
});
it('hydrates stored preferences, handles invalid storage and recovers conflicts and expiration', async () => {
  vi.spyOn(api, 'categories').mockResolvedValue({ categories: [] });
  const session = vi.spyOn(api, 'session').mockResolvedValue(feedback);
  vi.spyOn(api, 'answer').mockRejectedValue(new ApiError('conflict', 'INVALID_STATE', 409));
  const saved = {
    userId: randomUUID(),
    username: 'Ada',
    learnMode: true,
    active: { id, token: 'secret' },
    pending: { kind: 'answer', key: randomUUID(), payload: { questionId: 'q', optionId } },
    history: [],
  };
  data.set('quizapp:v1', JSON.stringify(saved));
  useQuiz.setState({ hydrated: false });
  useQuiz.getState().hydrate();
  await vi.waitFor(() => expect(useQuiz.getState().session?.state).toBe('feedback'));
  expect(useQuiz.getState().pending).toBeNull();
  session.mockRejectedValue(new ApiError('expired', 'SESSION_NOT_FOUND', 404));
  await useQuiz.getState().recover();
  expect(useQuiz.getState().expired).toBe(true);
  data.set('quizapp:v1', 'not JSON');
  useQuiz.setState({ hydrated: false, active: null, pending: null });
  useQuiz.getState().hydrate();
  expect(useQuiz.getState().storageError).toMatch(/invalid data/);
});
it('rejects missing names and pending requests without starting another quiz', async () => {
  const start = vi.spyOn(api, 'start');
  await useQuiz.getState().start('daily');
  expect(useQuiz.getState().error).toMatch(/username/);
  expect(start).not.toHaveBeenCalled();
  useQuiz.setState({ username: 'Ada', pending: { kind: 'advance', questionId: 'q' } });
  await useQuiz.getState().start('daily');
  expect(useQuiz.getState().error).toMatch(/previous request/);
});

it('handles blocked storage, invalid saved data and unavailable sessions', async () => {
  vi.spyOn(api, 'categories').mockRejectedValue('offline');
  useQuiz.setState({ hydrated: false });
  data.set('quizapp:v1', '{}');
  useQuiz.getState().hydrate();
  expect(useQuiz.getState().storageError).toMatch(/invalid/);
  useQuiz.getState().hydrate();
  await useQuiz.getState().loadCategories();
  expect(useQuiz.getState().categoriesError).toMatch(/Something went wrong/);
  data.clear();
  useQuiz.getState().sync();
  data.set('quizapp:v1', '{}');
  useQuiz.getState().sync();
  data.set('quizapp:v1', '{');
  useQuiz.getState().sync();
  expect(useQuiz.getState().storageError).toMatch(/could not be read/);
  useQuiz.setState({ active: null, pending: { kind: 'advance', questionId: 'q' } });
  await useQuiz.getState().recover();
  expect(useQuiz.getState().error).toMatch(/incomplete/);
  vi.stubGlobal('localStorage', {
    getItem: () => {
      throw new Error('denied');
    },
    setItem: () => {
      throw new Error('denied');
    },
  });
  useQuiz.setState({ hydrated: false, active: null, pending: null, username: 'Ada' });
  useQuiz.getState().hydrate();
  expect(useQuiz.getState().storageError).toMatch(/unavailable/);
  await useQuiz.getState().start('daily');
  expect(useQuiz.getState().error).toMatch(/Could not save/);
  useQuiz.setState({ pending: null, session: ready });
  await useQuiz.getState().answer(optionId);
  expect(useQuiz.getState().error).toMatch(/Could not save/);
  useQuiz.setState({ pending: null, session: feedback });
  await useQuiz.getState().advance();
  expect(useQuiz.getState().error).toMatch(/Could not save/);
  useQuiz.setState({ busy: false });
  useQuiz.getState().resetStorage();
  expect(useQuiz.getState().storageError).toMatch(/unavailable/);
});
it('ignores invalid transitions and reconciles a queued cross-tab update', async () => {
  const syncStart = vi.spyOn(api, 'start');
  const session = vi.spyOn(api, 'session').mockResolvedValue(ready);
  useQuiz.setState({ session: null });
  await useQuiz.getState().answer(optionId);
  await useQuiz.getState().advance();
  expect(syncStart).not.toHaveBeenCalled();
  useQuiz.setState({ busy: true });
  useQuiz.getState().reset();
  useQuiz.getState().resetStorage();
  useQuiz.setState({ busy: false });
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  syncStart.mockImplementation(async () => {
    await gate;
    return { token: 'secret', session: ready };
  });
  useQuiz.getState().setName('Ada');
  const started = useQuiz.getState().start('daily');
  useQuiz.getState().sync();
  release();
  await started;
  await vi.waitFor(() => expect(session).toHaveBeenCalled());
});

it('handles recovery without an active session and clearing noncompleted history', async () => {
  await useQuiz.getState().recover();
  expect(useQuiz.getState().busy).toBe(false);
  useQuiz.setState({
    session: ready,
    history: completed.state === 'completed' ? [completed.results] : [],
  });
  useQuiz.getState().clearHistory();
  expect(useQuiz.getState().history).toEqual([]);
  expect(useQuiz.getState().session).toEqual(ready);
});
