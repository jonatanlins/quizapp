// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RootLayout from '../app/layout';
import Home from '../app/page';
import { CategoryCard } from '../components/category-card';
import { DailyChallenge } from '../components/daily-challenge';
import { Explore } from '../components/explore';
import { Header } from '../components/header';
import { Leaderboard } from '../components/leaderboard';
import { Progress } from '../components/progress';
import { Quiz } from '../components/quiz';
import QuizApp from '../components/quiz-app';
import { Results } from '../components/results';
import { Empty, ErrorBox, Loading } from '../components/shared';
import { categoryName } from '../components/types';
import type { Result, Session } from '../lib/client/api';
import { useQuiz } from '../lib/client/store';

const original = useQuiz.getState();
const id = 'd03f73b6-bd4c-43bb-b2cc-48ac59ee0e51';
const option = { id: '4b529660-4c49-4b5c-a815-b0e9c7376bf0', text: 'An answer' };
const wrong = { id: '5de17606-9477-46eb-a38b-31133979a0c5', text: 'Not this answer' };
const feedback = {
  questionId: 'q1',
  selectedOptionId: wrong.id,
  correctOptionId: option.id,
  correct: false,
  explanation: 'An explanation',
  prompt: 'A question?',
  options: [option, wrong],
};
const result: Result = {
  sessionId: id,
  categoryId: 'daily',
  dailyDate: '2026-11-03',
  username: 'Ada',
  learnMode: false,
  score: 4,
  total: 5,
  percentage: 80,
  completedAt: '2026-11-03T12:00:00Z',
  message: 'Excellent work!',
  missed: [feedback],
};
const base = {
  id,
  categoryId: 'daily',
  dailyDate: '2026-11-03',
  username: 'Ada',
  learnMode: true,
  progress: { current: 1, total: 5 },
  createdAt: '2026-11-03T12:00:00Z',
};
const ready: Session = {
  ...base,
  state: 'question_ready',
  question: {
    id: 'q1',
    prompt: 'A question?',
    options: [option, wrong],
    learnNote: 'A helpful note',
  },
};
const answered: Session = { ...base, state: 'feedback', question: ready.question, feedback };
const category = {
  id: 'ai-fundamentals',
  name: 'AI Fundamentals',
  description: 'Core concepts.',
  questionCount: 10,
};
const start = vi.fn(async (_category: string) => {}),
  answer = vi.fn(async (_option: string) => {}),
  advance = vi.fn(async () => {}),
  recover = vi.fn(async () => {}),
  reset = vi.fn(),
  setChaos = vi.fn(),
  setName = vi.fn(),
  setLearn = vi.fn(),
  clearHistory = vi.fn(),
  loadBoard = vi.fn(async () => {}),
  loadCategories = vi.fn(async () => {}),
  hydrate = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  useQuiz.setState({
    ...original,
    hydrated: true,
    categories: [category],
    categoriesLoading: false,
    username: 'Ada',
    session: null,
    active: null,
    pending: null,
    error: null,
    storageError: null,
    busy: false,
    expired: false,
    history: [],
    board: null,
    chaos: 'off',
    start,
    answer,
    advance,
    recover,
    reset,
    setChaos,
    setName,
    setLearn,
    clearHistory,
    loadBoard,
    loadCategories,
    hydrate,
  });
});
afterEach(() => {
  cleanup();
  useQuiz.setState(original, true);
});

describe('reusable quiz components', () => {
  it('renders shared loading, error and empty states with recovery', () => {
    const retry = vi.fn();
    render(
      <>
        <Loading text="Loading" />
        <ErrorBox text="Offline" retry={retry} />
        <Empty title="Nothing here">Try a quiz.</Empty>
      </>
    );
    expect(screen.getByRole('status').textContent).toContain('Loading');
    expect(screen.getByRole('alert').textContent).toContain('Offline');
    fireEvent.click(screen.getByText('Try again'));
    expect(retry).toHaveBeenCalledOnce();
    expect(screen.getByText('Nothing here')).toBeTruthy();
  });
  it('changes navigation and chaos settings', () => {
    const change = vi.fn();
    render(<Header tab="explore" change={change} />);
    fireEvent.change(screen.getByLabelText('All systems normal'), { target: { value: 'after' } });
    expect(setChaos).toHaveBeenCalledWith('after');
    fireEvent.click(screen.getByText('My progress'));
    expect(change).toHaveBeenCalledWith('progress');
    fireEvent.click(screen.getByText('Explore'));
    fireEvent.click(screen.getByText('Leaderboard'));
    expect(change).toHaveBeenCalledWith('leaderboard');
    fireEvent.click(screen.getByLabelText('QuizApp home'));
    expect(change).toHaveBeenCalledWith('explore');
  });
  it('starts a selected category and the daily challenge', () => {
    const onStart = vi.fn();
    render(
      <>
        <CategoryCard category={category} onStart={onStart} disabled={false} />
        <DailyChallenge />
      </>
    );
    fireEvent.click(screen.getByLabelText('Start AI Fundamentals'));
    expect(onStart).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByText('Take the daily challenge'));
    expect(start).toHaveBeenCalledWith('daily');
  });
  it('shows browsing content and updates preferences', () => {
    render(<Explore />);
    fireEvent.change(screen.getByLabelText('YOUR USERNAME'), { target: { value: 'Grace' } });
    expect(setName).toHaveBeenCalledWith('Grace');
    fireEvent.click(screen.getByRole('checkbox'));
    expect(setLearn).toHaveBeenCalledWith(true);
    fireEvent.click(screen.getByLabelText('Start AI Fundamentals'));
    expect(start).toHaveBeenCalledWith(category.id);
  });
  it('shows loading, retry, and empty browsing states', () => {
    useQuiz.setState({ categories: null, categoriesLoading: true });
    const { rerender } = render(<Explore />);
    expect(screen.getByText('Finding your quizzes...')).toBeTruthy();
    useQuiz.setState({ categoriesLoading: false, categoriesError: 'Offline' });
    rerender(<Explore />);
    fireEvent.click(screen.getByText('Try again'));
    expect(loadCategories).toHaveBeenCalled();
    useQuiz.setState({ categories: [], categoriesError: null });
    rerender(<Explore />);
    expect(screen.getByText('No topics just yet')).toBeTruthy();
  });
  it('submits exactly the selected answer and shows the daily learning note', () => {
    useQuiz.setState({ session: ready });
    render(<Quiz />);
    expect(screen.getByText('A helpful note')).toBeTruthy();
    expect(screen.getByText(/Daily Challenge · 2026-11-03/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /An answer/ }));
    expect(answer).toHaveBeenCalledWith(option.id);
  });
  it('shows feedback, prevents another answer, and advances', () => {
    useQuiz.setState({ session: answered });
    render(<Quiz />);
    expect(screen.getByText('An explanation')).toBeTruthy();
    expect((screen.getByRole('button', { name: /An answer/ }) as HTMLButtonElement).disabled).toBe(
      true
    );
    fireEvent.click(screen.getByText('Next question'));
    expect(advance).toHaveBeenCalledOnce();
  });
  it('shows loading, recoverable errors and expired session recovery', () => {
    useQuiz.setState({ session: null, busy: true });
    const { rerender } = render(<Quiz />);
    expect(screen.getByText('Getting your quiz ready...')).toBeTruthy();
    useQuiz.setState({ busy: false, error: 'Offline' });
    rerender(<Quiz />);
    fireEvent.click(screen.getByText('Try again'));
    expect(recover).toHaveBeenCalledOnce();
    useQuiz.setState({ expired: true });
    rerender(<Quiz />);
    fireEvent.click(screen.getByText('Start a new quiz'));
    expect(reset).toHaveBeenCalledOnce();
  });
  it('renders results, missed answers and retakes', () => {
    render(<Results result={result} />);
    expect(screen.getByText(/DAILY CHALLENGE · 2026-11-03/)).toBeTruthy();
    expect(screen.getByText('An explanation')).toBeTruthy();
    fireEvent.click(screen.getByText('Take it again'));
    expect(reset).toHaveBeenCalled();
    expect(start).toHaveBeenCalledWith('daily');
    fireEvent.click(screen.getByText('Explore more topics'));
    expect(reset).toHaveBeenCalledTimes(2);
  });
  it('renders a perfect result without missed questions', () => {
    render(<Results result={{ ...result, missed: [] }} />);
    expect(screen.getByText('A clean sweep!')).toBeTruthy();
  });
  it('renders history, chart, review and clearing', () => {
    useQuiz.setState({ history: [result] });
    render(<Progress />);
    expect(screen.getByText(/Daily Challenge · 2026-11-03/)).toBeTruthy();
    expect(screen.getByLabelText('Quiz score history')).toBeTruthy();
    fireEvent.click(screen.getByText('Review'));
    expect(screen.getByText('An explanation')).toBeTruthy();
    fireEvent.click(screen.getByText('Hide review'));
    fireEvent.click(screen.getByText('Clear history'));
    expect(clearHistory).toHaveBeenCalledOnce();
  });
  it('shows an empty progress state', () => {
    render(<Progress />);
    expect(screen.getByText('A fresh page')).toBeTruthy();
  });
  it('loads leaderboard, switches modes and handles empty and error states', () => {
    useQuiz.setState({
      userId: id,
      board: {
        standard: [
          { userId: id, username: 'Ada', learnMode: false, correct: 7, attempts: 2, questions: 10 },
        ],
        learn: [],
      },
    });
    const { rerender } = render(<Leaderboard />);
    expect(loadBoard).toHaveBeenCalled();
    expect(screen.getByText('Ada')).toBeTruthy();
    fireEvent.click(screen.getByText('Learn mode'));
    expect(screen.getByText('The leaderboard is waiting')).toBeTruthy();
    fireEvent.click(screen.getByText('Quiz mode'));
    useQuiz.setState({ boardError: 'Offline', boardLoading: false });
    rerender(<Leaderboard />);
    fireEvent.click(screen.getByText('Try again'));
    expect(loadBoard).toHaveBeenCalledTimes(2);
  });
  it('renders the Next.js page and root layout', () => {
    expect(
      renderToStaticMarkup(
        <RootLayout>
          <span>Child</span>
        </RootLayout>
      )
    ).toContain('Child');
    expect(renderToStaticMarkup(<Home />)).toContain('quiz');
  });
  it('runs recovery actions from explore, quiz feedback and results', () => {
    const pending = { kind: 'advance' as const, questionId: 'q1' };
    useQuiz.setState({ error: 'Offline', pending });
    const { rerender } = render(<Explore />);
    fireEvent.click(screen.getByText('Try again'));
    useQuiz.setState({ session: answered });
    rerender(<Quiz />);
    fireEvent.click(screen.getByText('Try again'));
    rerender(<Results result={result} />);
    fireEvent.click(screen.getByText('Try again'));
    expect(recover).toHaveBeenCalledTimes(3);
  });
  it('responds to cross-tab storage updates and the quiz back link', () => {
    const sync = vi.fn();
    useQuiz.setState({ session: ready, active: { id, token: 'secret' }, sync });
    render(<QuizApp />);
    window.dispatchEvent(new StorageEvent('storage', { key: 'quizapp:v1' }));
    expect(sync).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByText('Your progress'));
    expect(screen.getByText('A fresh page')).toBeTruthy();
  });
  it('renders the app shell and navigates to progress', () => {
    render(<QuizApp />);
    expect(hydrate).toHaveBeenCalled();
    fireEvent.click(screen.getByText('My progress'));
    expect(screen.getByText('A fresh page')).toBeTruthy();
  });
});

it('covers alternate category, daily name error and navigation variants', () => {
  const change = vi.fn();
  useQuiz.setState({ username: '', error: 'Enter a username to start.', chaos: 'after' });
  const { rerender } = render(
    <>
      <Header tab="leaderboard" change={change} />
      <DailyChallenge />
      <CategoryCard
        category={{ id: 'other', name: 'Other', description: '', questionCount: 10 }}
        onStart={() => {}}
        disabled
      />
    </>
  );
  expect(screen.getByText('Simulation active')).toBeTruthy();
  expect(screen.getByText('Enter your username above to start.')).toBeTruthy();
  vi.stubEnv('NODE_ENV', 'production');
  rerender(<Header tab="leaderboard" change={change} />);
  expect(screen.getByText('Available in development')).toBeTruthy();
  vi.unstubAllEnvs();
});
it('covers quiz success, final question, ordinary mode and busy states', () => {
  const correctFeedback = { ...feedback, selectedOptionId: option.id, correct: true };
  const ordinary: Session = {
    ...answered,
    dailyDate: undefined,
    learnMode: false,
    progress: { current: 5, total: 5 },
    feedback: correctFeedback,
  };
  useQuiz.setState({
    session: ordinary,
    busy: true,
    pending: { kind: 'answer', key: id, payload: { questionId: 'q1', optionId: option.id } },
  });
  const { rerender } = render(<Quiz />);
  expect(screen.getByText('That’s right!')).toBeTruthy();
  expect(screen.getByText('See my results')).toBeTruthy();
  expect(screen.getByText('Checking your answer...')).toBeTruthy();
  useQuiz.setState({ pending: { kind: 'advance', questionId: 'q1' } });
  rerender(<Quiz />);
  expect(screen.getByText('Picking up where you left off...')).toBeTruthy();
  useQuiz.setState({
    session: { ...base, state: 'completed', results: result },
    busy: false,
    pending: null,
  });
  rerender(<Quiz />);
  expect(screen.getByRole('heading', { name: 'Look at you go.' })).toBeTruthy();
});
it('covers ordinary results, progress variants and leaderboard loading', () => {
  const standardResult = {
    ...result,
    dailyDate: undefined,
    categoryId: 'ai-fundamentals',
    learnMode: true,
    missed: [],
  };
  useQuiz.setState({ history: [standardResult], boardLoading: true });
  const { rerender } = render(<Progress />);
  expect(screen.getByText(/AI Fundamentals/)).toBeTruthy();
  fireEvent.click(screen.getByText('Review'));
  expect(screen.getByText(/No missed questions/)).toBeTruthy();
  rerender(<Results result={standardResult} />);
  expect(screen.getByText('QUIZ COMPLETE')).toBeTruthy();
  rerender(<Leaderboard />);
  expect(screen.getByText('Loading the leaderboard...')).toBeTruthy();
  useQuiz.setState({
    boardLoading: false,
    board: {
      standard: [
        { userId: id, username: 'Ada', learnMode: false, correct: 1, attempts: 1, questions: 5 },
      ],
      learn: [],
    },
  });
  rerender(<Leaderboard />);
  expect(screen.getByText(/1 quiz/)).toBeTruthy();
});
it('covers app loading, storage errors and the leaderboard tab', () => {
  useQuiz.setState({ hydrated: false });
  const { rerender } = render(<QuizApp />);
  expect(screen.getByText('Getting things ready...')).toBeTruthy();
  const resetStorage = vi.fn();
  useQuiz.setState({ hydrated: true, storageError: 'Cannot save', resetStorage });
  rerender(<QuizApp />);
  fireEvent.click(screen.getByText('Reset saved data'));
  expect(resetStorage).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByText('Leaderboard'));
  expect(screen.getByRole('heading', { name: 'Learning adds up.' })).toBeTruthy();
  window.dispatchEvent(new StorageEvent('storage', { key: 'another-key' }));
});

it('covers no-retry errors and unknown category display', () => {
  expect(categoryName('unknown')).toBe('unknown');
  useQuiz.setState({ error: 'Offline', pending: null });
  const { rerender } = render(<Explore />);
  expect(screen.getByText('Offline')).toBeTruthy();
  rerender(<Results result={result} />);
  expect(screen.getByText('Offline')).toBeTruthy();
  useQuiz.setState({ expired: true, error: null, session: null });
  rerender(<Quiz />);
  expect(screen.getByText('This session is no longer available.')).toBeTruthy();
  useQuiz.setState({ expired: false });
  rerender(<Quiz />);
  expect(screen.getByText('Restoring your quiz...')).toBeTruthy();
});
it('covers an expired stored session at the app level', () => {
  useQuiz.setState({
    active: { id, token: 'secret' },
    expired: true,
    session: null,
    pending: null,
  });
  render(<QuizApp />);
  expect(screen.getByText('Start a new quiz')).toBeTruthy();
});
