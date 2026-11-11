import { create } from 'zustand';
import { ApiError, api, type Category, type Chaos, type Leaderboard, type Session } from './api';
import {
  initialStored,
  type Pending,
  readStored,
  STORAGE_KEY,
  type Stored,
  storedSchema,
  writeStored,
} from './storage';

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
    const next: Stored = { ...get(), ...patch };
    const success = writeStored(next);
    set({
      ...next,
      storageError: success
        ? null
        : 'Browser storage is unavailable. Progress may not survive a refresh.',
    });
    return success;
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
    if (pending && !save({ pending })) {
      throw new Error(
        'Could not save the pending request. Enable browser storage before retrying.'
      );
    }
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

  const queuePending = async (pending: Pending, errorMsg: string) => {
    if (!save({ pending })) throw new Error(errorMsg);
    await performPending();
  };

  return {
    ...initialStored(),
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
      const { data, error } = readStored();
      if (data) set(data);
      else if (error) set({ storageError: error });
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
        const raw = localStorage.getItem(STORAGE_KEY);
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
        await queuePending(
          {
            kind: 'start',
            key: crypto.randomUUID(),
            payload: { categoryId, userId: s.userId, username, learnMode: s.learnMode },
          },
          'Could not save this request. Enable browser storage to start safely.'
        );
      }),
    answer: async (optionId) =>
      run(async () => {
        const s = get();
        if (s.session?.state !== 'question_ready' || s.pending) return;
        await queuePending(
          {
            kind: 'answer',
            key: crypto.randomUUID(),
            payload: { questionId: s.session.question.id, optionId },
          },
          'Could not save your answer safely. Enable browser storage and try again.'
        );
      }),
    advance: async () =>
      run(async () => {
        const s = get();
        if (s.session?.state !== 'feedback' || s.pending) return;
        await queuePending(
          { kind: 'advance', questionId: s.session.question.id },
          'Could not save your progress safely. Enable browser storage and try again.'
        );
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
      const fresh = initialStored();
      if (writeStored(fresh)) {
        set({ ...fresh, session: null, error: null, expired: false, storageError: null });
      } else {
        set({ storageError: 'Browser storage is unavailable. Enable it to save your progress.' });
      }
    },
  };
});
