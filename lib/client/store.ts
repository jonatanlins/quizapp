import { z } from 'zod';
import { create } from 'zustand';
import {
  ApiError,
  api,
  type Category,
  type Chaos,
  type Leaderboard,
  type Result,
  resultSchema,
  type Session,
  type StartPayload,
} from './api';

const KEY = 'quizapp:v1';
type Pending =
  | { kind: 'start'; key: string; payload: StartPayload }
  | { kind: 'answer'; key: string; payload: { questionId: string; optionId: string } }
  | { kind: 'advance'; questionId: string };
type Stored = {
  userId: string;
  username: string;
  learnMode: boolean;
  active: { id: string; token: string } | null;
  pending: Pending | null;
  history: Result[];
};
const uuid = z.string().uuid();
const pendingSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('start'),
    key: uuid,
    payload: z.object({
      categoryId: z.string(),
      userId: uuid,
      username: z.string(),
      learnMode: z.boolean(),
    }),
  }),
  z.object({
    kind: z.literal('answer'),
    key: uuid,
    payload: z.object({ questionId: z.string(), optionId: uuid }),
  }),
  z.object({ kind: z.literal('advance'), questionId: z.string() }),
]);
const storedSchema = z.object({
  userId: uuid,
  username: z.string(),
  learnMode: z.boolean(),
  active: z.object({ id: uuid, token: z.string() }).nullable(),
  pending: pendingSchema.nullable(),
  history: z.array(resultSchema),
});
const initial = (): Stored => ({
  userId: crypto.randomUUID(),
  username: '',
  learnMode: false,
  active: null,
  pending: null,
  history: [],
});
let lock = false;
let syncRequested = false;
type State = Stored & {
  hydrated: boolean;
  storageError: string | null;
  chaos: Chaos;
  categories: Category[] | null;
  categoriesLoading: boolean;
  categoriesError: string | null;
  board: Leaderboard | null;
  boardLoading: boolean;
  boardError: string | null;
  session: Session | null;
  busy: boolean;
  error: string | null;
  expired: boolean;
  hydrate: () => void;
  sync: () => void;
  setName: (name: string) => void;
  setLearn: (value: boolean) => void;
  setChaos: (value: Chaos) => void;
  loadCategories: () => Promise<void>;
  loadBoard: () => Promise<void>;
  start: (categoryId: string) => Promise<void>;
  answer: (optionId: string) => Promise<void>;
  advance: () => Promise<void>;
  recover: () => Promise<void>;
  reset: () => void;
  clearHistory: () => void;
  resetStorage: () => void;
};
const errorText = (e: unknown) =>
  e instanceof Error ? e.message : 'Something went wrong. Please try again.';
export const useQuiz = create<State>((set, get) => {
  const save = (patch: Partial<Stored>): boolean => {
    const s = get();
    const next: Stored = {
      userId: s.userId,
      username: s.username,
      learnMode: s.learnMode,
      active: s.active,
      pending: s.pending,
      history: s.history,
      ...patch,
    };
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      set({ ...next, storageError: null });
      return true;
    } catch {
      set({
        ...next,
        storageError: 'Browser storage is unavailable. Progress may not survive a refresh.',
      });
      return false;
    }
  };
  const accept = (session: Session, active?: Stored['active']) => {
    const history =
      session.state === 'completed'
        ? [session.results, ...get().history.filter((r) => r.sessionId !== session.id)]
        : get().history;
    save({ ...(active !== undefined ? { active } : {}), pending: null, history });
    set({ session, error: null, expired: false });
  };
  const run = async (operation: () => Promise<void>) => {
    if (lock) return;
    lock = true;
    set({ busy: true, error: null });
    try {
      await operation();
    } catch (e) {
      const expired = e instanceof ApiError && e.code === 'SESSION_NOT_FOUND';
      set({
        error: expired
          ? 'This session is no longer available. The demo server may have restarted.'
          : errorText(e),
        expired,
      });
    } finally {
      lock = false;
      set({ busy: false });
      if (syncRequested) {
        syncRequested = false;
        get().sync();
      }
    }
  };
  const performPending = async () => {
    const { pending, active, chaos } = get();
    if (pending && !save({ pending }))
      throw new Error(
        'Could not save the pending request. Enable browser storage before retrying.'
      );
    if (!pending) {
      if (active) accept(await api.session(active.id, active.token, chaos));
      return;
    }
    if (pending.kind === 'start') {
      const response = await api.start(pending.payload, pending.key, chaos);
      accept(response.session, { id: response.session.id, token: response.token });
      return;
    }
    if (!active) throw new Error('The saved session is incomplete. Start a new quiz.');
    try {
      const result =
        pending.kind === 'answer'
          ? await api.answer(active.id, active.token, pending.payload, pending.key, chaos)
          : await api.advance(active.id, active.token, pending.questionId, chaos);
      // Another tab may have advanced since an idempotent answer was first accepted.
      if (pending.kind === 'answer') accept(await api.session(active.id, active.token, chaos));
      else accept(result);
    } catch (e) {
      if (e instanceof ApiError && e.code === 'INVALID_STATE') {
        accept(await api.session(active.id, active.token, chaos));
        return;
      }
      throw e;
    }
  };
  return {
    ...initial(),
    hydrated: false,
    storageError: null,
    chaos: 'off',
    categories: null,
    categoriesLoading: false,
    categoriesError: null,
    board: null,
    boardLoading: false,
    boardError: null,
    session: null,
    busy: false,
    error: null,
    expired: false,
    hydrate: () => {
      if (get().hydrated) return;
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
          const data = storedSchema.safeParse(JSON.parse(raw));
          if (data.success) set(data.data);
          else
            set({
              storageError:
                'Saved progress is invalid and could not be restored. You can clear it and start again.',
            });
        }
      } catch {
        set({
          storageError:
            'Browser storage is unavailable or contains invalid data. Progress may not survive a refresh.',
        });
      }
      set({ hydrated: true });
      void get().loadCategories();
      if (get().active || get().pending) void get().recover();
    },
    sync: () => {
      if (lock) {
        syncRequested = true;
        return;
      }
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return;
        const data = storedSchema.safeParse(JSON.parse(raw));
        if (data.success) {
          const current = get().session;
          const keepSession = !!data.data.active && current?.id === data.data.active.id;
          set({
            ...data.data,
            ...(!keepSession ? { session: null, error: null, expired: false } : {}),
          });
          if (data.data.active || data.data.pending) void get().recover();
        }
      } catch {
        set({ storageError: 'Saved progress could not be read.' });
      }
    },
    setName: (username) => {
      save({ username: username.slice(0, 40) });
    },
    setLearn: (learnMode) => {
      save({ learnMode });
    },
    setChaos: (chaos) => set({ chaos }),
    loadCategories: async () => {
      set({ categoriesLoading: true, categoriesError: null });
      try {
        set({ categories: (await api.categories(get().chaos)).categories });
      } catch (e) {
        set({ categoriesError: errorText(e) });
      } finally {
        set({ categoriesLoading: false });
      }
    },
    loadBoard: async () => {
      set({ boardLoading: true, boardError: null });
      try {
        set({ board: await api.leaderboard(get().chaos) });
      } catch (e) {
        set({ boardError: errorText(e) });
      } finally {
        set({ boardLoading: false });
      }
    },
    start: async (categoryId) =>
      run(async () => {
        const s = get();
        const username = s.username.trim();
        if (!username) throw new Error('Enter a username to start.');
        if (s.pending) throw new Error('Finish recovering the previous request first.');
        const pending: Pending = {
          kind: 'start',
          key: crypto.randomUUID(),
          payload: { categoryId, userId: s.userId, username, learnMode: s.learnMode },
        };
        if (!save({ pending }))
          throw new Error('Could not save this request. Enable browser storage to start safely.');
        await performPending();
      }),
    answer: async (optionId) =>
      run(async () => {
        const s = get();
        if (!s.session || s.session.state !== 'question_ready' || s.pending) return;
        const pending: Pending = {
          kind: 'answer',
          key: crypto.randomUUID(),
          payload: { questionId: s.session.question.id, optionId },
        };
        if (!save({ pending }))
          throw new Error(
            'Could not save your answer safely. Enable browser storage and try again.'
          );
        await performPending();
      }),
    advance: async () =>
      run(async () => {
        const s = get();
        if (!s.session || s.session.state !== 'feedback' || s.pending) return;
        const pending: Pending = { kind: 'advance', questionId: s.session.question.id };
        if (!save({ pending }))
          throw new Error(
            'Could not save your progress safely. Enable browser storage and try again.'
          );
        await performPending();
      }),
    recover: async () => run(performPending),
    reset: () => {
      if (get().busy) return;
      save({ active: null, pending: null });
      set({ session: null, error: null, expired: false });
    },
    clearHistory: () => {
      const completed = get().session?.state === 'completed';
      save({ history: [], ...(completed ? { active: null } : {}) });
      if (completed) set({ session: null });
    },
    resetStorage: () => {
      if (get().busy) return;
      const fresh = initial();
      try {
        localStorage.setItem(KEY, JSON.stringify(fresh));
        set({ ...fresh, session: null, error: null, expired: false, storageError: null });
      } catch {
        set({ storageError: 'Browser storage is unavailable. Enable it to save your progress.' });
      }
    },
  };
});
