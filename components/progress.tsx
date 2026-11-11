'use client';

import { GraduationCap } from 'lucide-react';
import { useState } from 'react';
import type { Result } from '@/lib/client/api';
import { useQuiz } from '@/lib/client/store';
import { Empty } from './shared';
import { categoryName } from './types';

function ProgressStats({ history }: { history: Result[] }) {
  const totalCorrect = history.reduce((sum, r) => sum + r.score, 0);

  return (
    <div className="progress-summary">
      <div>
        <span>QUIZZES COMPLETED</span>
        <strong>{history.length}</strong>
      </div>
      <div>
        <span>CORRECT ANSWERS</span>
        <strong>{totalCorrect}</strong>
      </div>
      <div>
        <span>LATEST SCORE</span>
        <strong>{history[0].percentage}%</strong>
      </div>
    </div>
  );
}

function ProgressChart({ history }: { history: Result[] }) {
  const recent = [...history].slice(0, 12).reverse();

  return (
    <section className="chart-section">
      <div className="section-heading">
        <div>
          <h2>
            Progress over time<span>.</span>
          </h2>
          <p>Your most recent attempts, oldest to newest.</p>
        </div>
      </div>
      <div className="chart" aria-label="Quiz score history">
        {recent.map((r, i) => (
          <div className="chart-column" key={r.sessionId}>
            <span>{r.percentage}%</span>
            <div className="chart-bar-wrap">
              <div className="chart-bar" style={{ height: `${Math.max(r.percentage, 3)}%` }} />
            </div>
            <small>{i + 1}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function HistoryRow({
  result,
  isReviewOpen,
  onToggleReview,
}: {
  result: Result;
  isReviewOpen: boolean;
  onToggleReview: () => void;
}) {
  const formattedDate = new Date(result.completedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="history-row">
      <div>
        <strong>
          {categoryName(result.categoryId)}
          {result.dailyDate ? ` · ${result.dailyDate} UTC` : ''}
        </strong>
        <span>
          {formattedDate} · {result.learnMode ? 'Learn mode' : 'Quiz mode'}
        </span>
      </div>
      <b>{result.score}/5</b>
      <button className="text-button" onClick={onToggleReview}>
        {isReviewOpen ? 'Hide review' : 'Review'}
      </button>
      {isReviewOpen && (
        <div className="history-review">
          {result.missed.length ? (
            result.missed.map((m) => (
              <div key={m.questionId}>
                <strong>{m.prompt}</strong>
                <p>Correct: {m.options.find((o) => o.id === m.correctOptionId)?.text}</p>
                <p>{m.explanation}</p>
              </div>
            ))
          ) : (
            <p>No missed questions. Nice work!</p>
          )}
        </div>
      )}
    </div>
  );
}

export function Progress() {
  const { history, clearHistory } = useQuiz();
  const [reviewId, setReviewId] = useState<string | null>(null);

  if (!history.length) {
    return (
      <div className="page-shell">
        <div className="page-title">
          <div>
            <span className="section-kicker">YOUR LEARNING JOURNEY</span>
            <h1>
              Look how far you’ve come<span>.</span>
            </h1>
            <p>Every attempt counts. Here’s your progress, one quiz at a time.</p>
          </div>
          <div className="title-icon">
            <GraduationCap size={35} />
          </div>
        </div>
        <Empty title="A fresh page">
          Your completed quizzes and progress will show up here. Pick a topic to get started.
        </Empty>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="page-title">
        <div>
          <span className="section-kicker">YOUR LEARNING JOURNEY</span>
          <h1>
            Look how far you’ve come<span>.</span>
          </h1>
          <p>Every attempt counts. Here’s your progress, one quiz at a time.</p>
        </div>
        <div className="title-icon">
          <GraduationCap size={35} />
        </div>
      </div>

      <ProgressStats history={history} />
      <ProgressChart history={history} />

      <section className="history">
        <div className="history-head">
          <div>
            <h2>
              Attempt history<span>.</span>
            </h2>
            <p>Your quizzes, all in one place.</p>
          </div>
          <button className="text-button" onClick={clearHistory}>
            Clear history
          </button>
        </div>
        {history.map((r) => (
          <HistoryRow
            key={r.sessionId}
            result={r}
            isReviewOpen={reviewId === r.sessionId}
            onToggleReview={() => setReviewId(reviewId === r.sessionId ? null : r.sessionId)}
          />
        ))}
      </section>
    </div>
  );
}
