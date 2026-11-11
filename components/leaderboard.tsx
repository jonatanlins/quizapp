'use client';

import { Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQuiz } from '@/lib/client/store';
import { Empty, ErrorBox, Loading } from './shared';

export function Leaderboard() {
  const board = useQuiz((s) => s.board);
  const boardLoading = useQuiz((s) => s.boardLoading);
  const boardError = useQuiz((s) => s.boardError);
  const userId = useQuiz((s) => s.userId);
  const loadBoard = useQuiz((s) => s.loadBoard);

  const [mode, setMode] = useState<'standard' | 'learn'>('standard');

  useEffect(() => {
    void loadBoard();
  }, [loadBoard]);

  const rows = board?.[mode];

  return (
    <div className="page-shell">
      <div className="page-title">
        <div>
          <span className="section-kicker">A LITTLE FRIENDLY MOTIVATION</span>
          <h1>
            Learning adds up<span>.</span>
          </h1>
          <p>Every correct answer counts. Keep showing up and watch your total grow.</p>
        </div>
        <div className="title-icon yellow">
          <Trophy size={32} />
        </div>
      </div>
      <div className="board-tabs">
        <button
          className={mode === 'standard' ? 'selected' : ''}
          onClick={() => setMode('standard')}
        >
          Quiz mode
        </button>
        <button className={mode === 'learn' ? 'selected' : ''} onClick={() => setMode('learn')}>
          Learn mode
        </button>
      </div>
      {boardLoading ? (
        <Loading text="Loading the leaderboard..." />
      ) : boardError ? (
        <ErrorBox text={boardError} retry={() => void loadBoard()} />
      ) : !rows?.length ? (
        <Empty title="The leaderboard is waiting">
          Complete a quiz to be the first on the board.
        </Empty>
      ) : (
        <div className="board">
          <div className="board-labels">
            <span>RANK / LEARNER</span>
            <span>CORRECT ANSWERS</span>
          </div>
          {rows.map((r, i) => (
            <div className="board-row" key={r.userId}>
              <span className="rank">{String(i + 1).padStart(2, '0')}</span>
              <span className="board-avatar">{r.username[0]?.toUpperCase()}</span>
              <div>
                <strong>
                  {r.username}
                  {r.userId === userId && <small> YOU</small>}
                </strong>
                <p>
                  {r.attempts} {r.attempts === 1 ? 'quiz' : 'quizzes'} ·{' '}
                  {Math.round((r.correct / r.questions) * 100)}% accuracy
                </p>
              </div>
              <b>{r.correct}</b>
            </div>
          ))}
        </div>
      )}
      <p className="board-note">
        Totals count correct answers across completed quizzes, including retakes. This demo’s
        leaderboard resets when the server restarts.
      </p>
    </div>
  );
}
