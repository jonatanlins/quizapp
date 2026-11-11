'use client';

import { ArrowRight, CheckCircle2, CircleAlert, LoaderCircle, Sparkles, X } from 'lucide-react';
import { useQuiz } from '@/lib/client/store';
import type { Feedback, Option } from '@/lib/types';
import { Results } from './results';
import { ErrorBox, Loading } from './shared';
import { categoryName } from './types';

function OptionButton({
  option,
  index,
  feedback,
  disabled,
  onSelect,
}: {
  option: Option;
  index: number;
  feedback: Feedback | null;
  disabled: boolean;
  onSelect: () => void;
}) {
  const correct = feedback?.correctOptionId === option.id;
  const selectedWrong = feedback && !feedback.correct && feedback.selectedOptionId === option.id;

  return (
    <button
      className={`option ${correct ? 'correct' : ''} ${selectedWrong ? 'incorrect' : ''}`}
      disabled={disabled}
      onClick={onSelect}
    >
      <span className="option-letter">{String.fromCharCode(65 + index)}</span>
      <span>{option.text}</span>
      {correct && <CheckCircle2 size={20} />}
      {selectedWrong && <X size={20} />}
    </button>
  );
}

function FeedbackPanel({
  feedback,
  isLastQuestion,
  disabled,
  onAdvance,
}: {
  feedback: Feedback;
  isLastQuestion: boolean;
  disabled: boolean;
  onAdvance: () => void;
}) {
  return (
    <div className={`feedback ${feedback.correct ? 'right' : 'wrong'}`}>
      <div className="feedback-title">
        {feedback.correct ? <CheckCircle2 size={21} /> : <CircleAlert size={21} />}
        <strong>{feedback.correct ? 'That’s right!' : 'Not quite — and that’s okay.'}</strong>
      </div>
      <p>{feedback.explanation}</p>
      <button className="primary" disabled={disabled} onClick={onAdvance}>
        {isLastQuestion ? 'See my results' : 'Next question'} <ArrowRight size={17} />
      </button>
    </div>
  );
}

export function Quiz() {
  const s = useQuiz();
  const session = s.session;

  if (s.expired) {
    return (
      <div className="quiz-shell">
        <ErrorBox text={s.error ?? 'This session is no longer available.'} />
        <button className="secondary" onClick={s.reset}>
          Start a new quiz
        </button>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="quiz-shell">
        {s.busy ? (
          <Loading text="Getting your quiz ready..." />
        ) : s.error ? (
          <ErrorBox text={s.error} retry={() => void s.recover()} />
        ) : (
          <Loading text="Restoring your quiz..." />
        )}
      </div>
    );
  }

  if (session.state === 'completed') return <Results result={session.results} />;

  const isFeedback = session.state === 'feedback';
  const feedback = isFeedback ? session.feedback : null;
  const isLastQuestion = session.progress.current === 5;

  return (
    <div className={`quiz-shell ${session.dailyDate ? 'daily-quiz' : ''}`}>
      <div className="quiz-breadcrumb">
        <span>
          {categoryName(session.categoryId)}
          {session.dailyDate ? ` · ${session.dailyDate} UTC` : ''}
        </span>
        <span>/</span>
        <span>{session.learnMode ? 'Learn mode' : 'Quiz mode'}</span>
      </div>

      <div className="quiz-header">
        <div>
          <p className="quiz-counter">
            QUESTION {session.progress.current} OF {session.progress.total}
          </p>
          <h1>
            Let’s find out<span>.</span>
          </h1>
        </div>
        <div className="progress-count">
          <strong>{String(session.progress.current).padStart(2, '0')}</strong>
          <span> / 05</span>
        </div>
      </div>

      <div
        className="progress-track"
        aria-label={`Question ${session.progress.current} of ${session.progress.total}`}
      >
        <div
          style={{ transform: `scaleX(${session.progress.current / session.progress.total})` }}
        />
      </div>

      <div className="question-panel">
        <div className="question-heading">
          <span className="question-mark">?</span>
          <h2>{session.question.prompt}</h2>
        </div>

        {session.question.learnNote && (
          <div className="learn-note">
            <Sparkles size={19} />
            <div>
              <strong>A little context</strong>
              <p>{session.question.learnNote}</p>
            </div>
          </div>
        )}

        <div className="options">
          {session.question.options.map((option, i) => (
            <OptionButton
              key={option.id}
              option={option}
              index={i}
              feedback={feedback}
              disabled={s.busy || !!s.pending || isFeedback}
              onSelect={() => void s.answer(option.id)}
            />
          ))}
        </div>

        {s.busy && (
          <div className="inline-loading" role="status">
            <LoaderCircle className="spin" size={16} />{' '}
            {s.pending?.kind === 'answer'
              ? 'Checking your answer...'
              : 'Picking up where you left off...'}
          </div>
        )}

        {s.error && <ErrorBox text={s.error} retry={() => void s.recover()} />}

        {feedback && (
          <FeedbackPanel
            feedback={feedback}
            isLastQuestion={isLastQuestion}
            disabled={s.busy || !!s.pending}
            onAdvance={() => void s.advance()}
          />
        )}
      </div>

      <p className="quiz-hint">One question at a time. You’ve got this.</p>
    </div>
  );
}
