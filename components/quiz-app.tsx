'use client';

import { ArrowLeft, CircleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useQuiz } from '@/lib/client/store';
import { Explore } from './explore';
import { Header } from './header';
import { Leaderboard } from './leaderboard';
import { Progress } from './progress';
import { Quiz } from './quiz';
import { Loading } from './shared';
import type { Tab } from './types';

export default function QuizApp() {
  const s = useQuiz();
  const hydrate = useQuiz((state) => state.hydrate);
  const [tab, setTab] = useState<Tab>('explore');

  useEffect(() => {
    hydrate();
    const listener = (e: StorageEvent) => {
      if (e.key === 'quizapp:v1') useQuiz.getState().sync();
    };
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }, [hydrate]);

  const change = (next: Tab) => setTab(next);
  const showQuiz =
    tab === 'explore' && (!!s.session || !!s.pending || (!!s.active && !s.expired) || s.busy);

  return (
    <>
      <Header tab={tab} change={change} />
      {s.storageError && (
        <div className="storage-warning" role="alert">
          <CircleAlert size={17} />
          <span>{s.storageError}</span>
          <button onClick={s.resetStorage} disabled={s.busy}>
            Reset saved data
          </button>
        </div>
      )}
      <main>
        {!s.hydrated ? (
          <Loading text="Getting things ready..." />
        ) : tab === 'progress' ? (
          <Progress />
        ) : tab === 'leaderboard' ? (
          <Leaderboard />
        ) : showQuiz || s.expired ? (
          <>
            {s.session && s.session.state !== 'completed' && (
              <div className="back-row">
                <button onClick={() => change('progress')}>
                  <ArrowLeft size={15} /> Your progress
                </button>
                <span>Your quiz is saved as you go.</span>
              </div>
            )}
            <Quiz />
          </>
        ) : (
          <Explore />
        )}
      </main>
      <footer>
        <div>
          <span className="footer-brand">
            quizapp<span>.</span>
          </span>
          <p>Keep asking. Keep learning.</p>
        </div>
        <span>
          MADE FOR CURIOUS MINDS <span className="footer-star">✳</span>
        </span>
      </footer>
    </>
  );
}
