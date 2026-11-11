'use client';

import { ArrowRight, Check, RotateCcw } from 'lucide-react';
import type { Result } from '@/lib/client/api';
import { useQuiz } from '@/lib/client/store';
import { Empty, ErrorBox } from './shared';

export function Results({ result }: { result: Result }) {
  const s = useQuiz();
  return (
    <div className={`results-shell ${result.dailyDate ? 'daily-results' : ''}`}>
      <div className="result-top">
        <div>
          <span className="section-kicker">
            {result.dailyDate ? `DAILY CHALLENGE · ${result.dailyDate} UTC` : 'QUIZ COMPLETE'}
          </span>
          <h1>
            Look at you go<span>.</span>
          </h1>
          <p>{result.message} Every question is a step forward.</p>
        </div>
        <div className="score-disc">
          <span>YOUR SCORE</span>
          <strong>
            {result.score}
            <small>/5</small>
          </strong>
          <b>{result.percentage}% CORRECT</b>
        </div>
      </div>
      <div className="result-actions">
        <button
          className="primary"
          disabled={s.busy || !!s.pending}
          onClick={() => {
            s.reset();
            void s.start(result.categoryId);
          }}
        >
          Take it again <RotateCcw size={16} />
        </button>
        <button className="secondary" onClick={s.reset}>
          Explore more topics <ArrowRight size={16} />
        </button>
      </div>
      <section className="review">
        <div className="section-heading">
          <div>
            <span className="section-kicker">THE TAKEAWAYS</span>
            <h2>
              Room to grow<span>.</span>
            </h2>
            <p>Here’s what to remember for next time.</p>
          </div>
        </div>
        {result.missed.length === 0 ? (
          <Empty title="A clean sweep!">You didn’t miss any questions in this quiz.</Empty>
        ) : (
          result.missed.map((item, i) => (
            <article className="missed" key={item.questionId}>
              <span className="missed-number">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{item.prompt}</h3>
                <p className="correct-answer">
                  <Check size={15} />{' '}
                  {item.options.find((o) => o.id === item.correctOptionId)?.text}
                </p>
                <p>{item.explanation}</p>
              </div>
            </article>
          ))
        )}
      </section>
      {s.error && (
        <ErrorBox text={s.error} retry={s.pending ? () => void s.recover() : undefined} />
      )}
    </div>
  );
}
