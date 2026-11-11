'use client';

import { GraduationCap } from 'lucide-react';
import { useState } from 'react';
import type { Result } from '@/lib/client/api';
import { useQuiz } from '@/lib/client/store';
import { Empty } from './shared';
import { categoryName } from './types';

export function Progress() {
  const { history, clearHistory } = useQuiz();
  const [review, setReview] = useState<Result | null>(null);
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
      {!history.length ? (
        <Empty title="A fresh page">
          Your completed quizzes and progress will show up here. Pick a topic to get started.
        </Empty>
      ) : (
        <>
          <div className="progress-summary">
            <div>
              <span>QUIZZES COMPLETED</span>
              <strong>{history.length}</strong>
            </div>
            <div>
              <span>CORRECT ANSWERS</span>
              <strong>{history.reduce((n, r) => n + r.score, 0)}</strong>
            </div>
            <div>
              <span>LATEST SCORE</span>
              <strong>{history[0].percentage}%</strong>
            </div>
          </div>
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
              {[...history]
                .slice(0, 12)
                .reverse()
                .map((r, i) => (
                  <div className="chart-column" key={r.sessionId}>
                    <span>{r.percentage}%</span>
                    <div className="chart-bar-wrap">
                      <div
                        className="chart-bar"
                        style={{ height: `${Math.max(r.percentage, 3)}%` }}
                      />
                    </div>
                    <small>{i + 1}</small>
                  </div>
                ))}
            </div>
          </section>
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
              <div className="history-row" key={r.sessionId}>
                <div>
                  <strong>
                    {categoryName(r.categoryId)}
                    {r.dailyDate ? ` · ${r.dailyDate} UTC` : ''}
                  </strong>
                  <span>
                    {new Date(r.completedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    · {r.learnMode ? 'Learn mode' : 'Quiz mode'}
                  </span>
                </div>
                <b>{r.score}/5</b>
                <button
                  className="text-button"
                  onClick={() => setReview(review?.sessionId === r.sessionId ? null : r)}
                >
                  {' '}
                  {review?.sessionId === r.sessionId ? 'Hide review' : 'Review'}{' '}
                </button>
                {review?.sessionId === r.sessionId && (
                  <div className="history-review">
                    {r.missed.length ? (
                      r.missed.map((m) => (
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
            ))}
          </section>
        </>
      )}
    </div>
  );
}
