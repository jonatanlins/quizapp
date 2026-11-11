import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'vitest';
import { ApiError, api, sessionSchema } from '../lib/client/api';
import { useQuiz } from '../lib/client/store';

test('pending answers persist before sending, lock rapid clicks, and replay the same key after response loss', async () => {
  const memory = new Map<string, string>();
  const storage = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: (key: string) => {
      memory.delete(key);
    },
    clear: () => memory.clear(),
    key: (i: number) => [...memory.keys()][i] ?? null,
    get length() {
      return memory.size;
    },
  };
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
  const id = randomUUID();
  const optionId = randomUUID();
  const ready = sessionSchema.parse({
    id,
    categoryId: 'ai-fundamentals',
    username: 'Ada',
    learnMode: false,
    state: 'question_ready',
    progress: { current: 1, total: 5 },
    createdAt: new Date().toISOString(),
    question: { id: 'q1', prompt: 'Question?', options: [{ id: optionId, text: 'Answer' }] },
  });
  const feedback = sessionSchema.parse({
    ...ready,
    state: 'feedback',
    feedback: {
      questionId: 'q1',
      selectedOptionId: optionId,
      correctOptionId: optionId,
      correct: true,
      explanation: 'Explanation',
      prompt: 'Question?',
      options: [{ id: optionId, text: 'Answer' }],
    },
  });
  const original = { answer: api.answer, session: api.session };
  let sends = 0;
  let firstKey = '';
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  try {
    useQuiz.setState({
      ...useQuiz.getState(),
      hydrated: true,
      userId: randomUUID(),
      username: 'Ada',
      learnMode: false,
      active: { id, token: 'token' },
      pending: null,
      history: [],
      session: ready,
      chaos: 'off',
      busy: false,
      error: null,
      storageError: null,
    });
    api.answer = async (_id, _token, payload, key) => {
      sends++;
      const raw = memory.get('quizapp:v1');
      assert.ok(raw);
      const persisted = JSON.parse(raw);
      assert.equal(persisted.pending.key, key);
      assert.deepEqual(persisted.pending.payload, payload);
      if (sends === 1) {
        firstKey = key;
        await gate;
        throw new ApiError('Lost response');
      }
      assert.equal(key, firstKey);
      return feedback;
    };
    api.session = async () => feedback;
    const first = useQuiz.getState().answer(optionId);
    const second = useQuiz.getState().answer(optionId);
    assert.equal(sends, 1);
    release();
    await Promise.all([first, second]);
    assert.equal(useQuiz.getState().pending?.kind, 'answer');
    assert.match(useQuiz.getState().error ?? '', /Lost response/);
    // Simulate a new client instance restoring only serialized state.
    const rawSaved = memory.get('quizapp:v1');
    assert.ok(rawSaved);
    const saved = JSON.parse(rawSaved);
    useQuiz.setState({ ...saved, session: null, busy: false, error: null });
    await useQuiz.getState().recover();
    assert.equal(sends, 2);
    assert.equal(useQuiz.getState().pending, null);
    assert.equal(useQuiz.getState().session?.state, 'feedback');
    // A failed write must never allow a later retry to send an unpersisted operation.
    const pending = {
      kind: 'answer' as const,
      key: randomUUID(),
      payload: { questionId: 'q1', optionId },
    };
    useQuiz.setState({ pending, session: ready });
    storage.setItem = () => {
      throw new Error('quota');
    };
    await useQuiz.getState().recover();
    assert.equal(sends, 2);
    assert.match(useQuiz.getState().error ?? '', /Enable browser storage/);
    storage.setItem = (key, value) => {
      memory.set(key, value);
    };
    storage.setItem('quizapp:v1', JSON.stringify({ ...saved, active: null, pending: null }));
    useQuiz.getState().sync();
    assert.equal(useQuiz.getState().active, null);
    assert.equal(useQuiz.getState().session, null);
  } finally {
    api.answer = original.answer;
    api.session = original.session;
  }
});
