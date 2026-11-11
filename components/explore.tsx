'use client';

import { ArrowRight, Check, Sparkles } from 'lucide-react';
import type { Category } from '@/lib/client/api';
import { useQuiz } from '@/lib/client/store';
import { CategoryCard } from './category-card';
import { DailyChallenge } from './daily-challenge';
import { Empty, ErrorBox, Loading } from './shared';

function HeroBanner() {
  return (
    <section className="hero">
      <div className="hero-main">
        <div className="hero-chip">
          <Sparkles size={14} /> A SMALL QUIZ. A BIGGER PICTURE.
        </div>
        <h1>
          Curiosity looks
          <br />
          <em>good on you.</em>
        </h1>
        <p>
          Big ideas are easier to understand one question at a time. Pick a topic, test what you
          know, and learn something along the way.
        </p>
        <a className="primary hero-cta" href="#topics">
          Explore the quizzes <ArrowRight size={18} />
        </a>
        <div className="hero-foot">
          <span className="avatar-stack">
            <i>Q</i>
            <i>A</i>
            <i>✦</i>
          </span>
          <span>Made for the endlessly curious.</span>
        </div>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="art-orbit orbit-one" />
        <div className="art-orbit orbit-two" />
        <div className="art-star star-one">✳</div>
        <div className="art-star star-two">✦</div>
        <div className="art-sheet">
          <div className="art-sheet-top">
            <span>YOUR DAILY DOSE OF</span>
            <span>✳</span>
          </div>
          <div className="art-word">
            aha<span>!</span>
          </div>
          <div className="art-sheet-line" />
          <div className="art-sheet-bottom">
            <span>LEARN SOMETHING NEW</span>
            <span>↗</span>
          </div>
        </div>
        <div className="art-tag">
          <Check size={15} /> LITTLE WINS ADD UP
        </div>
      </div>
    </section>
  );
}

function PreferencesForm({
  username,
  learnMode,
  onNameChange,
  onLearnChange,
}: {
  username: string;
  learnMode: boolean;
  onNameChange: (name: string) => void;
  onLearnChange: (learn: boolean) => void;
}) {
  return (
    <section className="setup" aria-label="Quiz preferences">
      <div>
        <h2>Make it yours.</h2>
        <p>A name and a little curiosity are all you need.</p>
      </div>
      <div className="setup-fields">
        <label className="name-field">
          <span>YOUR USERNAME</span>
          <input
            value={username}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="What should we call you?"
            maxLength={40}
          />
        </label>
        <label className="learn-control">
          <span>
            <strong>Learn mode</strong>
            <small>Get a hint before each question</small>
          </span>
          <input
            type="checkbox"
            checked={learnMode}
            onChange={(e) => onLearnChange(e.target.checked)}
          />
          <span className="switch" />
        </label>
      </div>
    </section>
  );
}

function TopicsSection({
  categories,
  loading,
  error,
  disabled,
  onStart,
  onRetry,
}: {
  categories: Category[] | null;
  loading: boolean;
  error: string | null;
  disabled: boolean;
  onStart: (id: string) => void;
  onRetry: () => void;
}) {
  return (
    <section className="topics" id="topics">
      <div className="section-heading">
        <div>
          <span className="section-kicker">A PLACE TO BEGIN</span>
          <h2>
            Pick your rabbit hole<span>.</span>
          </h2>
          <p>Choose a topic and let’s see what you know.</p>
        </div>
        <span className="topic-count">{categories?.length ?? '—'} TOPICS TO EXPLORE</span>
      </div>
      {loading && !categories ? (
        <Loading text="Finding your quizzes..." />
      ) : error ? (
        <ErrorBox text={error} retry={onRetry} />
      ) : categories?.length ? (
        <div className="category-grid">
          {categories.map((c) => (
            <CategoryCard
              key={c.id}
              category={c}
              onStart={() => onStart(c.id)}
              disabled={disabled}
            />
          ))}
        </div>
      ) : (
        <Empty title="No topics just yet">Check back later for quizzes to explore.</Empty>
      )}
    </section>
  );
}

export function Explore() {
  const s = useQuiz();

  return (
    <>
      <HeroBanner />
      <PreferencesForm
        username={s.username}
        learnMode={s.learnMode}
        onNameChange={s.setName}
        onLearnChange={s.setLearn}
      />
      <DailyChallenge />
      <TopicsSection
        categories={s.categories}
        loading={s.categoriesLoading}
        error={s.categoriesError}
        disabled={s.busy || !!s.pending}
        onStart={(id) => void s.start(id)}
        onRetry={() => void s.loadCategories()}
      />
      {s.error && !s.session && (
        <ErrorBox text={s.error} retry={s.pending ? () => void s.recover() : undefined} />
      )}
    </>
  );
}
