import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import type React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { HeaderBar } from '../components/HeaderBar';

interface QuizSceneProps {
  selectedOption?: string;
  isAnswered?: boolean;
  isCorrect?: boolean;
  nextButtonHovered?: boolean;
  nextButtonClicked?: boolean;
}

const OPTIONS = [
  {
    letter: 'A',
    key: 'a',
    text: 'Interleaving thought generation with action execution and observation retrieval in a loop',
    isCorrectOption: true,
  },
  {
    letter: 'B',
    key: 'b',
    text: 'Generating all thoughts upfront before executing any actions',
    isCorrectOption: false,
  },
  {
    letter: 'C',
    key: 'c',
    text: 'Replacing neural networks with hardcoded symbolic rule engines',
    isCorrectOption: false,
  },
];

export const QuizScene: React.FC<QuizSceneProps> = ({
  selectedOption,
  isAnswered = false,
  isCorrect: _isCorrect = true,
  nextButtonHovered = false,
  nextButtonClicked = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sceneEntrance = spring({
    frame,
    fps,
    config: { damping: 15, mass: 0.9 },
  });

  const feedbackEntrance = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { damping: 14, mass: 0.7 },
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#f8f7f2',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: "'Avenir Next', 'Helvetica Neue', sans-serif",
      }}
    >
      <HeaderBar activeTab="explore" />

      <div
        style={{
          maxWidth: 820,
          width: '100%',
          margin: '0 auto',
          padding: '24px 32px 40px',
          display: 'flex',
          flexDirection: 'column',
          opacity: sceneEntrance,
          transform: `translateY(${interpolate(sceneEntrance, [0, 1], [20, 0])}px)`,
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 8,
            fontSize: 11,
            fontWeight: 700,
            color: '#827a8d',
            alignItems: 'center',
          }}
        >
          <span>Autonomous Agents</span>
          <span style={{ color: '#c1bcb4' }}>/</span>
          <span style={{ color: '#6549bd' }}>Learn mode</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            margin: '14px 0 12px',
          }}
        >
          <div>
            <p
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.1em',
                color: '#77716b',
                margin: 0,
              }}
            >
              QUESTION 01 OF 05
            </p>
            <h1
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 32,
                letterSpacing: '-0.025em',
                margin: '2px 0 0',
                color: '#24221f',
              }}
            >
              Let’s find out<span style={{ color: '#a38bd3' }}>.</span>
            </h1>
          </div>
          <div style={{ fontSize: 13, color: '#777168' }}>
            <strong style={{ fontSize: 24, color: '#24221f' }}>01</strong> / 05
          </div>
        </div>

        <div
          style={{
            height: 4,
            backgroundColor: '#e7e5dc',
            borderRadius: 2,
            marginBottom: 20,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: '20%',
              backgroundColor: '#8a72bc',
              borderRadius: 2,
            }}
          />
        </div>

        <div
          style={{
            backgroundColor: '#fffefa',
            border: '1px solid #e8e5de',
            borderRadius: 10,
            padding: '24px 28px',
            boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                backgroundColor: '#f1edf9',
                color: '#725a9f',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 800,
                fontSize: 14,
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              ?
            </div>
            <h2
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 20,
                lineHeight: 1.3,
                letterSpacing: '-0.02em',
                margin: '2px 0 16px',
                color: '#24221f',
              }}
            >
              What is the core idea behind the ReAct (Reasoning and Acting) prompting framework?
            </h2>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 10,
              backgroundColor: '#f1edf9',
              color: '#54466d',
              padding: '12px 14px',
              borderRadius: 6,
              marginBottom: 16,
              fontSize: 12,
              border: '1px solid #dfd7ee',
            }}
          >
            <Sparkles size={16} color="#755ba3" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <strong style={{ display: 'block', fontSize: 11, letterSpacing: '0.04em' }}>
                A little context
              </strong>
              <p style={{ margin: '3px 0 0', lineHeight: 1.4, color: '#54466d' }}>
                Autonomous agents alternate between deliberating on the next step and interacting
                with external tools.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            {OPTIONS.map((opt) => {
              const isSelected = selectedOption === opt.key;
              const isThisCorrect = opt.isCorrectOption;

              const border =
                isAnswered && isThisCorrect
                  ? '1.5px solid #7ba986'
                  : isSelected
                    ? '1.5px solid #8a72bc'
                    : '1px solid #dfddd6';

              const bg =
                isAnswered && isThisCorrect ? '#eef7ef' : isSelected ? '#fbf9fe' : '#fffefa';

              const color = isAnswered && isThisCorrect ? '#325e3a' : '#24221f';
              const opacity = isAnswered && !isThisCorrect ? 0.6 : 1;

              return (
                <div
                  key={opt.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    border,
                    borderRadius: 6,
                    backgroundColor: bg,
                    padding: '10px 14px',
                    fontSize: 12,
                    color,
                    fontWeight: isAnswered && isThisCorrect ? 600 : 400,
                    opacity,
                    boxShadow:
                      isAnswered && isThisCorrect ? '0 2px 8px rgba(50,94,58,0.08)' : 'none',
                  }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 4,
                      display: 'grid',
                      placeItems: 'center',
                      backgroundColor: isAnswered && isThisCorrect ? '#d9ecd8' : '#f1f0ea',
                      fontWeight: 700,
                      fontSize: 10,
                      color: isAnswered && isThisCorrect ? '#254e2c' : '#555',
                      flexShrink: 0,
                    }}
                  >
                    {opt.letter}
                  </span>
                  <span style={{ flex: 1 }}>{opt.text}</span>
                  {isAnswered && isThisCorrect && <CheckCircle2 size={18} color="#3b744a" />}
                </div>
              );
            })}
          </div>

          {isAnswered && (
            <div
              style={{
                marginTop: 14,
                padding: '14px 18px',
                borderRadius: 7,
                fontSize: 12,
                backgroundColor: '#e8f2e8',
                color: '#315a39',
                border: '1px solid #c9dec9',
                opacity: feedbackEntrance,
                transform: `translateY(${interpolate(feedbackEntrance, [0, 1], [10, 0])}px)`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                <CheckCircle2 size={16} color="#315a39" /> That’s right!
              </div>
              <p style={{ margin: '4px 0 12px', lineHeight: 1.45 }}>
                ReAct explicitly synergizes action execution with reasoning traces, enabling an
                agent to dynamically create, maintain, and adjust plans of action while interacting
                with external tools.
              </p>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: '#292824',
                  color: '#fff',
                  borderRadius: 6,
                  padding: '8px 14px',
                  fontWeight: 600,
                  fontSize: 11,
                  transform: nextButtonClicked
                    ? 'scale(0.96)'
                    : nextButtonHovered
                      ? 'translateY(-1px)'
                      : 'none',
                  boxShadow: nextButtonHovered ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                  transition: 'all 0.1s ease',
                }}
              >
                <span>Next question</span>
                <ArrowRight size={14} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
