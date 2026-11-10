import { test, vi } from 'vitest';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { categories, questions } from '../lib/server/questions';
import { advance, answer, ApiError, getSession, leaderboard, start, view } from '../lib/server/store';
import { GET, POST } from '../app/api/[...path]/route';

test('three categories contain complete, distinct questions matching their count', () => {
  assert.equal(categories.length, 3);
  for (const category of categories) {
    const bank = questions.filter(q => q.categoryId === category.id);
    assert.equal(bank.length, category.questionCount); assert.ok(bank.length >= 10); assert.equal(new Set(bank.map(q => q.id)).size, category.questionCount);
    for (const q of bank) { assert.equal(q.options.length, 4); assert.equal(new Set(q.options.map(o => o.id)).size, 4); assert.ok(q.options.some(o => o.id === q.correctOptionId)); assert.ok(q.explanation && q.learnNote); }
  }
});

test('session enforces state, idempotency, question privacy and completion scoring', () => {
  const userId = randomUUID(); const input = { categoryId: categories[0].id, userId, username: 'Test', learnMode: false }; const startKey = randomUUID();
  const started = start(input, startKey); assert.deepEqual(start(input, startKey), started);
  assert.throws(() => start({ ...input, username: 'Other' }, startKey), (e: unknown) => e instanceof ApiError && e.code === 'IDEMPOTENCY_CONFLICT');
  assert.throws(() => getSession(started.session.id, 'wrong'), ApiError);
  const session = getSession(started.session.id, started.token); const seen = new Set<string>();
  for (let i = 0; i < 5; i++) {
    const current = view(session); assert.equal(current.state, 'question_ready'); assert.ok('question' in current);
    const q = current.question; seen.add(q.id); assert.equal('correctOptionId' in q, false); assert.equal('explanation' in q, false); assert.equal('learnNote' in q, false);
    assert.throws(() => advance(session, q.id), ApiError);
    const key = randomUUID(); const payload = { questionId: q.id, optionId: q.options[0].id };
    const first = answer(session, payload, key); assert.deepEqual(answer(session, payload, key), first);
    assert.throws(() => answer(session, { ...payload, optionId: q.options[1].id }, key), (e: unknown) => e instanceof ApiError && e.code === 'IDEMPOTENCY_CONFLICT');
    assert.throws(() => answer(session, payload, randomUUID()), (e: unknown) => e instanceof ApiError && e.code === 'INVALID_STATE');
    const next = advance(session, q.id); assert.deepEqual(advance(session, q.id), next);
  }
  assert.equal(seen.size, 5); const complete = view(session); assert.equal(complete.state, 'completed'); assert.ok('results' in complete); assert.equal(complete.results.total, 5);
  const row = leaderboard().standard.find(r => r.userId === userId)!; assert.equal(row.attempts, 1); assert.equal(row.correct, complete.results.score);
  const second = start(input, randomUUID()); const again = getSession(second.session.id, second.token);
  for (let i = 0; i < 5; i++) { const q = again.questions[again.index]; answer(again, { questionId: q.id, optionId: q.correctOptionId }, randomUUID()); advance(again, q.id); }
  const total = leaderboard().standard.find(r => r.userId === userId)!; assert.equal(total.attempts, 2); assert.equal(total.correct, complete.results.score + 5);
});

test('route delay, chaos response loss and session recovery', async () => {
  const context = (path: string[]) => ({ params: Promise.resolve({ path }) });
  const time = Date.now(); const categoryResponse = await GET(new Request('http://localhost/api/categories'), context(['categories']));
  assert.ok(Date.now() - time >= 490); assert.equal(categoryResponse.status, 200); assert.equal(categoryResponse.headers.get('cache-control'), 'no-store');
  const requestKey = randomUUID(); const payload = { categoryId: categories[1].id, userId: randomUUID(), username: 'Ada', learnMode: true };
  const request = (chaos?: string) => new Request('http://localhost/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': requestKey, ...(chaos ? { 'X-Quiz-Chaos': chaos } : {}) }, body: JSON.stringify(payload) });
  assert.equal((await POST(request('after'), context(['sessions']))).status, 503);
  const retried = await POST(request(), context(['sessions'])); assert.equal(retried.status, 200);
  const data = await retried.json(); assert.ok(data.token); assert.ok(data.session.question.learnNote); assert.equal('correctOptionId' in data.session.question, false);
  const auth = { Authorization: `Bearer ${data.token}` }; const id = data.session.id;
  const answerKey = randomUUID(); const selected = { questionId: data.session.question.id, optionId: data.session.question.options[0].id };
  const submit = (chaos?: string) => new Request(`http://localhost/api/sessions/${id}/answers`, { method: 'POST', headers: { ...auth, 'Content-Type': 'application/json', 'Idempotency-Key': answerKey, ...(chaos ? { 'X-Quiz-Chaos': chaos } : {}) }, body: JSON.stringify(selected) });
  assert.equal((await POST(submit('after'), context(['sessions', id, 'answers']))).status, 503);
  const recovered = await GET(new Request(`http://localhost/api/sessions/${id}`, { headers: auth }), context(['sessions', id])); assert.equal(recovered.status, 200); const state = await recovered.json(); assert.equal(state.state, 'feedback');
  const replay = await POST(submit(), context(['sessions', id, 'answers'])); assert.deepEqual(await replay.json(), state);
});

test('daily sessions share a deterministic UTC date and five-question order', async () => {
  const { dailyQuestions } = await import('../lib/server/questions');
  const date = new Date().toISOString().slice(0, 10);
  const expected = dailyQuestions(date).map(q => q.id);
  assert.equal(new Set(expected).size, 5);
  assert.deepEqual(dailyQuestions(date).map(q => q.id), expected);
  assert.notDeepEqual(dailyQuestions('2000-01-01').map(q => q.id), dailyQuestions('2000-01-02').map(q => q.id));
  const make = () => start({ categoryId: 'daily', userId: randomUUID(), username: 'Daily', learnMode: false }, randomUUID());
  const first = make(), second = make();
  const s1 = getSession(first.session.id, first.token), s2 = getSession(second.session.id, second.token);
  assert.equal(first.session.dailyDate, date);
  assert.deepEqual(s1.questions.map(q => q.id), expected);
  assert.deepEqual(s2.questions.map(q => q.id), expected);
  assert.equal('explanation' in ('question' in first.session ? first.session.question : {}), false);
  // Once started, the selected questions and challenge date remain pinned in the session.
  for (let i = 0; i < 5; i++) { const q = s1.questions[s1.index]; answer(s1, { questionId: q.id, optionId: q.correctOptionId }, randomUUID()); advance(s1, q.id); }
  const completed = view(s1); assert.ok('results' in completed); assert.equal(completed.results.dailyDate, date); assert.ok(leaderboard().standard.length >= 2);
});

test('daily API validates errors, advances safely and keeps answers private', async () => {
  const context = (path: string[]) => ({ params: Promise.resolve({ path }) });
  const payload = { categoryId: 'daily', userId: randomUUID(), username: 'API', learnMode: false };
  const startReq = () => new Request('http://localhost/api/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': randomUUID() }, body: JSON.stringify(payload) });
  const [created, badJson, badInput, noKey, unknown, before] = await Promise.all([
    POST(startReq(), context(['sessions'])),
    POST(new Request('http://localhost/api/sessions', { method: 'POST', body: '{' }), context(['sessions'])),
    POST(new Request('http://localhost/api/sessions', { method: 'POST', body: '{}' }), context(['sessions'])),
    POST(new Request('http://localhost/api/sessions', { method: 'POST', body: JSON.stringify(payload) }), context(['sessions'])),
    GET(new Request('http://localhost/api/missing'), context(['missing'])),
    GET(new Request('http://localhost/api/categories', { headers: { 'X-Quiz-Chaos': 'before' } }), context(['categories'])),
  ]);
  assert.equal(created.status, 200); assert.equal((await badJson.json()).error.code, 'INVALID_JSON'); assert.equal((await badInput.json()).error.code, 'VALIDATION_ERROR'); assert.equal((await noKey.json()).error.code, 'INVALID_IDEMPOTENCY_KEY'); assert.equal(unknown.status, 404); assert.equal(before.status, 503);
  const { token, session } = await created.json(); assert.equal(session.dailyDate, new Date().toISOString().slice(0, 10)); assert.equal('correctOptionId' in session.question, false);
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'Idempotency-Key': randomUUID() };
  const [missing, wrongToken, answerResponse] = await Promise.all([
    GET(new Request('http://localhost/api/sessions/' + session.id + '/missing', { headers }), context(['sessions', session.id, 'missing'])),
    GET(new Request('http://localhost/api/sessions/' + session.id), context(['sessions', session.id])),
    POST(new Request('http://localhost/api/sessions/' + session.id + '/answers', { method: 'POST', headers, body: JSON.stringify({ questionId: session.question.id, optionId: session.question.options[0].id }) }), context(['sessions', session.id, 'answers'])),
  ]);
  assert.equal(missing.status, 404); assert.equal(wrongToken.status, 404); assert.equal(answerResponse.status, 200);
  const next = await POST(new Request('http://localhost/api/sessions/' + session.id + '/advance', { method: 'POST', headers, body: JSON.stringify({ questionId: session.question.id }) }), context(['sessions', session.id, 'advance'])); assert.equal(next.status, 200); assert.equal((await next.json()).progress.current, 2);
});

test('unexpected route errors return a sanitized response', async () => {
  const original = console.error; console.error = () => {};
  try { const rejected = Promise.reject(new Error('secret')); void rejected.catch(() => {}); const response = await GET(new Request('http://localhost/api/categories'), { params: rejected }); assert.equal(response.status, 500); assert.equal((await response.json()).error.code, 'INTERNAL_ERROR'); } finally { console.error = original; }
});


test('daily session keeps its original challenge across UTC midnight', () => {
  vi.useFakeTimers();
  try {
    vi.setSystemTime(new Date('2026-11-03T23:59:59.000Z'));
    const first = start({ categoryId: 'daily', userId: randomUUID(), username: 'Midnight', learnMode: false }, randomUUID());
    const session = getSession(first.session.id, first.token); const questionIds = session.questions.map(q => q.id);
    vi.setSystemTime(new Date('2026-11-04T00:00:01.000Z'));
    assert.equal(view(session).dailyDate, '2026-11-03'); assert.deepEqual(session.questions.map(q => q.id), questionIds);
    const next = start({ categoryId: 'daily', userId: randomUUID(), username: 'Midnight', learnMode: false }, randomUUID());
    assert.equal(next.session.dailyDate, '2026-11-04'); assert.notDeepEqual(getSession(next.session.id, next.token).questions.map(q => q.id), questionIds);
  } finally { vi.useRealTimers(); }
});

test('daily hash ties are ordered by question ID', async () => {
  const { compareRankedQuestions } = await import('../lib/server/questions');
  assert.ok(compareRankedQuestions({ id: 'a', rank: 'same' }, { id: 'b', rank: 'same' }) < 0);
});
test('server rejects unknown categories, questions, and options, and reports intermediate scores', () => {
  assert.throws(() => start({ categoryId: 'missing', userId: randomUUID(), username: 'Test', learnMode: false }, randomUUID()), ApiError);
  const created = start({ categoryId: 'daily', userId: randomUUID(), username: 'Test', learnMode: false }, randomUUID()); const s = getSession(created.session.id, created.token);
  assert.throws(() => advance(s, 'missing'), ApiError); assert.throws(() => answer(s, { questionId: s.questions[0].id, optionId: randomUUID() }, randomUUID()), ApiError);
  for (let i = 0; i < 5; i++) { const q = s.questions[i]; const chosen = i < 3 ? q.correctOptionId : q.options.find(o => o.id !== q.correctOptionId)!.id; answer(s, { questionId: q.id, optionId: chosen }, randomUUID()); advance(s, q.id); }
  const finished = view(s); assert.ok('results' in finished); assert.equal(finished.results.message, 'Good work — keep learning!');
});
test('leaderboard breaks ties for users with the same name', () => {
  for (let i = 0; i < 2; i++) { const created = start({ categoryId: 'daily', userId: randomUUID(), username: 'Tied', learnMode: true }, randomUUID()); const s = getSession(created.session.id, created.token); for (let j = 0; j < 5; j++) { const q = s.questions[j]; answer(s, { questionId: q.id, optionId: q.correctOptionId }, randomUUID()); advance(s, q.id); } }
  assert.equal(leaderboard().learn.filter(r => r.username === 'Tied').length, 2);
});
test('leaderboard route is available and production ignores chaos headers', async () => {
  vi.stubEnv('NODE_ENV', 'production');
  try { const response = await GET(new Request('http://localhost/api/leaderboard', { headers: { 'X-Quiz-Chaos': 'before' } }), { params: Promise.resolve({ path: ['leaderboard'] }) }); assert.equal(response.status, 200); assert.ok(Array.isArray((await response.json()).standard)); } finally { vi.unstubAllEnvs(); }
});
