import { ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import type React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { HeaderBar } from '../components/HeaderBar';

export const ResultsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8 },
  });

  const discScale = spring({
    frame: Math.max(0, frame - 5),
    fps,
    config: { damping: 12, mass: 0.7 },
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
      <HeaderBar activeTab="progress" />

      {/* Main Results Shell */}
      <div
        style={{
          maxWidth: 820,
          width: '100%',
          margin: '0 auto',
          padding: '24px 32px 30px',
          display: 'flex',
          flexDirection: 'column',
          opacity: entrance,
          transform: `translateY(${interpolate(entrance, [0, 1], [24, 0])}px)`,
        }}
      >
        {/* Results Top Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            backgroundColor: '#fffefa',
            border: '1px solid #e8e5de',
            borderRadius: 12,
            padding: '24px 32px',
            boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
          }}
        >
          <div>
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: '0.11em',
                color: '#777168',
              }}
            >
              QUIZ COMPLETE · AUTONOMOUS AGENTS
            </span>
            <h1
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 42,
                fontWeight: 400,
                letterSpacing: '-0.03em',
                margin: '8px 0 6px',
                color: '#24221f',
              }}
            >
              Look at you go<span style={{ color: '#a38bd3' }}>.</span>
            </h1>
            <p
              style={{ color: '#777269', fontSize: 13, lineHeight: 1.5, margin: 0, maxWidth: 380 }}
            >
              Flawless run! You mastered agent loops, tool use, and reasoning patterns.
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: '#292824',
                  color: '#fff',
                  borderRadius: 6,
                  padding: '9px 14px',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                <span>Take it again</span>
                <RotateCcw size={13} />
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: 'transparent',
                  color: '#24221f',
                  border: '1px solid #d0cec6',
                  borderRadius: 6,
                  padding: '9px 14px',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                <span>Explore more topics</span>
                <ArrowRight size={13} />
              </div>
            </div>
          </div>

          {/* Score Disc */}
          <div
            style={{
              width: 140,
              height: 140,
              flexShrink: 0,
              backgroundColor: '#e6dff4',
              borderRadius: '50%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(138,114,188,0.2)',
              transform: `scale(${discScale})`,
            }}
          >
            <span
              style={{
                fontSize: 8,
                letterSpacing: '0.1em',
                fontWeight: 800,
                color: '#6b5e78',
              }}
            >
              YOUR SCORE
            </span>
            <div
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 48,
                lineHeight: 1,
                color: '#24221f',
                margin: '2px 0',
              }}
            >
              5<span style={{ fontSize: 20, color: '#8e8099' }}>/5</span>
            </div>
            <span
              style={{
                fontSize: 8,
                letterSpacing: '0.08em',
                fontWeight: 800,
                color: '#554763',
              }}
            >
              100% CORRECT
            </span>
          </div>
        </div>

        {/* Mini Leaderboard preview snippet */}
        <div
          style={{
            marginTop: 18,
            backgroundColor: '#fffefa',
            border: '1px solid #e8e5de',
            borderRadius: 10,
            padding: '14px 20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Trophy size={16} color="#d4a338" />
              <strong style={{ fontSize: 12, color: '#24221f' }}>Leaderboard Highlight</strong>
            </div>
            <span style={{ fontSize: 10, color: '#856cb4', fontWeight: 700 }}>
              Updated instantly
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              backgroundColor: '#f9f7fc',
              border: '1px solid #e6dff4',
              borderRadius: 6,
              padding: '8px 14px',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 800, color: '#856cb4' }}>#1</span>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: '#e9e1f5',
                display: 'grid',
                placeItems: 'center',
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 14,
                fontWeight: 700,
                color: '#5e4c7e',
              }}
            >
              A
            </div>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: 12, color: '#24221f' }}>Alex</strong>
              <span style={{ fontSize: 10, color: '#777', marginLeft: 8 }}>
                Learn Mode · 100% accuracy
              </span>
            </div>
            <span
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 18,
                fontWeight: 700,
                color: '#292824',
              }}
            >
              5 pts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
