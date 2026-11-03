import { afterEach, expect, it, vi } from 'vitest';
import { api, ApiError } from '../lib/client/api';
const id = 'd03f73b6-bd4c-43bb-b2cc-48ac59ee0e51';
const option = '4b529660-4c49-4b5c-a815-b0e9c7376bf0';
const session = { id, categoryId: 'daily', dailyDate: '2026-11-03', username: 'Ada', learnMode: false, state: 'question_ready', progress: { current: 1, total: 5 }, createdAt: '2026-11-03', question: { id: 'q1', prompt: 'Question', options: [{ id: option, text: 'A' }] } };
const payload = { categoryId: 'daily', userId: id, username: 'Ada', learnMode: false };
afterEach(() => vi.unstubAllGlobals());
it('validates each successful response and sends credentials, idempotency, and chaos headers', async () => {
 const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({ categories: [{ id: 'a', name: 'A', description: 'A', questionCount: 10 }] })).mockResolvedValueOnce(Response.json({ standard: [], learn: [] })).mockResolvedValueOnce(Response.json({ token: 'secret', session })).mockResolvedValueOnce(Response.json(session)).mockResolvedValueOnce(Response.json(session)).mockResolvedValueOnce(Response.json(session)); vi.stubGlobal('fetch', fetchMock);
 expect((await api.categories('off')).categories).toHaveLength(1);
 expect((await api.leaderboard('before')).standard).toEqual([]);
 expect((await api.start(payload, id, 'after')).session.dailyDate).toBe('2026-11-03');
 expect((await api.session(id, 'secret', 'off')).id).toBe(id);
 expect((await api.answer(id, 'secret', { questionId: 'q1', optionId: option }, id, 'off')).id).toBe(id);
 expect((await api.advance(id, 'secret', 'q1', 'off')).id).toBe(id);
 const [url, options] = fetchMock.mock.calls[2]; expect(url).toBe('/api/sessions'); expect(options.headers['Idempotency-Key']).toBe(id); expect(options.headers['X-Quiz-Chaos']).toBe('after'); expect(fetchMock.mock.calls[3][1].headers.Authorization).toBe('Bearer secret');
});
it('surfaces API errors, invalid responses and network failures', async () => {
 const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({ error: { code: 'FAIL', message: 'Try later' } }, { status: 503 })).mockResolvedValueOnce(Response.json({ nonsense: true })).mockResolvedValueOnce(new Response('not json', { status: 500 })).mockRejectedValueOnce(new Error('offline')); vi.stubGlobal('fetch', fetchMock);
 await expect(api.categories('off')).rejects.toMatchObject({ code: 'FAIL', status: 503, message: 'Try later' });
 await expect(api.categories('off')).rejects.toMatchObject({ code: 'INVALID_RESPONSE' });
 await expect(api.categories('off')).rejects.toMatchObject({ code: 'SERVER_ERROR' });
 await expect(api.categories('off')).rejects.toBeInstanceOf(ApiError);
});

it('aborts a request that exceeds the timeout', async () => {
 vi.useFakeTimers();
 try { vi.stubGlobal('fetch', vi.fn((_url, options: RequestInit) => new Promise((_resolve, reject) => options.signal?.addEventListener('abort', () => reject(new Error('aborted')))))); const request = api.categories('off'); const assertion = expect(request).rejects.toBeInstanceOf(ApiError); await vi.advanceTimersByTimeAsync(12000); await assertion; } finally { vi.useRealTimers(); }
});
