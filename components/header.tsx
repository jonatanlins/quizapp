'use client';

import { ChaosBar } from './chaos-bar';
import type { Tab } from './types';

export function Header({ tab, change }: { tab: Tab; change: (tab: Tab) => void }) {
  return (
    <>
      <ChaosBar />
      <header className="header">
        <div className="header-inner">
          <button className="brand" onClick={() => change('explore')} aria-label="QuizApp home">
            <span className="brand-mark">
              <span>q</span>
              <i />
            </span>
            <span>
              quiz<span className="brand-light">app</span>
              <b>.</b>
            </span>
          </button>
          <nav aria-label="Main navigation">
            <button
              className={tab === 'explore' ? 'nav-active' : ''}
              onClick={() => change('explore')}
            >
              Explore
            </button>
            <button
              className={tab === 'progress' ? 'nav-active' : ''}
              onClick={() => change('progress')}
            >
              My progress
            </button>
            <button
              className={tab === 'leaderboard' ? 'nav-active' : ''}
              onClick={() => change('leaderboard')}
            >
              Leaderboard
            </button>
          </nav>
          <div className="header-note">
            <span className="tiny-dot" /> A LITTLE SMARTER, EVERY DAY
          </div>
        </div>
      </header>
    </>
  );
}
