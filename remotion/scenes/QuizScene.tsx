import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ArrowRight, CheckCircle2, Sparkles, X } from 'lucide-react';
import { HeaderBar } from '../components/HeaderBar';

interface QuizSceneProps {
  selectedOption?: string;
  isAnswered?: boolean;
  isCorrect?: boolean;
  nextButtonHovered?: boolean;
  nextButtonClicked?: boolean;
}

export const QuizScene: React.FC<QuizSceneProps> = ({
  selectedOption,
  isAnswered = false,
  isCorrect = true,
  nextButtonHovered = false,
  nextButtonClicked = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring animation
  const sceneEntrance = spring({
    frame,
    fps,
    config: { damping: 15, mass: 0.9 },
  });

  // Feedback card slide-in animation
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

      {/* Main Quiz Area */}
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
        {/* Breadcrumb */}
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

        {/* Quiz Header */}
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
                fontSize: 34,
                fontWeight: 400,
                margin: '4px 0 0',
                color: '#24221f',
              }}
            >
              Let’s find out<span style={{ color: '#a38bd3' }}>.</span>
            </h1>
          </div>
          <div style={{ fontSize: 13, color: '#a49f96' }}>
            <strong
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 28,
                color: '#292824',
              }}
            >
              01
            </strong>
            <span> / 05</span>
          </div>
        </div>

        {/* Progress Track */}
        <div
          style={{
            height: 4,
            borderRadius: 4,
            backgroundColor: '#e7e3dc',
            overflow: 'hidden',
            width: '100%',
          }}
        >
          <div
            style={{
              height: '100%',
              width: '20%',
              backgroundColor: '#a994d8',
              borderRadius: 4,
            }}
          />
        </div>

        {/* Question Panel */}
        <div
          style={{
            marginTop: 18,
            backgroundColor: '#fffefa',
            border: '1px solid #e8e5de',
            borderRadius: 10,
            padding: '24px 28px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
          }}
        >
          {/* Question Heading */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <span
              style={{
                flex: 'none',
                width: 28,
                height: 28,
                display: 'grid',
                placeItems: 'center',
                backgroundColor: '#e9e1f5',
                borderRadius: '50%',
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 18,
                color: '#705b94',
              }}
            >
              ?
            </span>
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

          {/* Learn Note */}
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
                Autonomous agents alternate between deliberating on the next step and interacting with external tools.
              </p>
            </div>
          </div>

          {/* Options */}
          <div style={{ display: 'grid', gap: 8 }}>
            {/* Option A */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                border: isAnswered
                  ? '1.5px solid #7ba986'
                  : selectedOption === 'a'
                  ? '1.5px solid #8a72bc'
                  : '1px solid #dfddd6',
                borderRadius: 6,
                backgroundColor: isAnswered ? '#eef7ef' : selectedOption === 'a' ? '#fbf9fe' : '#fffefa',
                padding: '10px 14px',
                fontSize: 12,
                color: isAnswered ? '#325e3a' : '#24221f',
                fontWeight: isAnswered ? 600 : 400,
                boxShadow: isAnswered ? '0 2px 8px rgba(50,94,58,0.08)' : 'none',
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  display: 'grid',
                  placeItems: 'center',
                  backgroundColor: isAnswered ? '#d9ecd8' : '#f1f0ea',
                  fontWeight: 700,
                  fontSize: 10,
                  color: isAnswered ? '#254e2c' : '#555',
                  flexShrink: 0,
                }}
              >
                A
              </span>
              <span style={{ flex: 1 }}>
                Interleaving thought generation with action execution and observation retrieval in a loop
              </span>
              {isAnswered && <CheckCircle2 size={18} color="#3b744a" />}
            </div>

            {/* Option B */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                border: '1px solid #dfddd6',
                borderRadius: 6,
                backgroundColor: '#fffefa',
                padding: '10px 14px',
                fontSize: 12,
                color: '#666',
                opacity: isAnswered ? 0.6 : 1,
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  display: 'grid',
                  placeItems: 'center',
                  backgroundColor: '#f1f0ea',
                  fontWeight: 700,
                  fontSize: 10,
                  flexShrink: 0,
                }}
              >
                B
              </span>
              <span style={{ flex: 1 }}>Generating all thoughts upfront before executing any actions</span>
            </div>

            {/* Option C */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                border: '1px solid #dfddd6',
                borderRadius: 6,
                backgroundColor: '#fffefa',
                padding: '10px 14px',
                fontSize: 12,
                color: '#666',
                opacity: isAnswered ? 0.6 : 1,
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  display: 'grid',
                  placeItems: 'center',
                  backgroundColor: '#f1f0ea',
                  fontWeight: 700,
                  fontSize: 10,
                  flexShrink: 0,
                }}
              >
                C
              </span>
              <span style={{ flex: 1 }}>Replacing neural networks with hardcoded symbolic rule engines</span>
            </div>
          </div>

          {/* Feedback Section */}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700 }}>
                <CheckCircle2 size={18} color="#315a39" />
                <span>That’s right!</span>
              </div>
              <p style={{ margin: '6px 0 12px', lineHeight: 1.5, fontSize: 11.5 }}>
                ReAct prompts the model to generate reasoning traces (&apos;Thoughts&apos;) followed by tool
                actions (&apos;Actions&apos;) and environment feedback (&apos;Observations&apos;).
              </p>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: '#292824',
                  color: '#fff',
                  borderRadius: 6,
                  padding: '9px 15px',
                  fontSize: 11,
                  fontWeight: 700,
                  transform: nextButtonClicked ? 'scale(0.95)' : nextButtonHovered ? 'translateY(-1px)' : 'none',
                  boxShadow: nextButtonHovered ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                  cursor: 'pointer',
                }}
              >
                <span>See my results</span>
                <ArrowRight size={14} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
