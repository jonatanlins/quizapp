import type React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 13, mass: 0.8 },
  });

  const starRotate = interpolate(frame, [0, 45], [0, 90]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#f8f7f2',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Avenir Next', 'Helvetica Neue', sans-serif",
      }}
    >
      {/* Background Orbits */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          border: '1px solid #e7e3dc',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 380,
          height: 380,
          borderRadius: '50%',
          border: '1px dashed #d9d2ea',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Floating stars */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 120,
          fontSize: 32,
          color: '#9581bd',
          transform: `rotate(${starRotate}deg)`,
        }}
      >
        ✳
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 90,
          right: 140,
          fontSize: 28,
          color: '#d6a17b',
        }}
      >
        ✦
      </div>

      {/* Center Outro Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          zIndex: 2,
          opacity: entrance,
          transform: `scale(${interpolate(entrance, [0, 1], [0.92, 1])})`,
        }}
      >
        {/* Brand Mark */}
        <div
          style={{
            width: 56,
            height: 56,
            backgroundColor: '#282622',
            borderRadius: 16,
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            position: 'relative',
            fontSize: 36,
            fontWeight: 800,
            marginBottom: 16,
            boxShadow: '0 8px 24px rgba(40,38,34,0.18)',
          }}
        >
          <span style={{ position: 'relative', top: -2 }}>q</span>
          <i
            style={{
              position: 'absolute',
              width: 10,
              height: 10,
              backgroundColor: '#d3c2ff',
              borderRadius: '50%',
              right: -2,
              top: -2,
            }}
          />
        </div>

        {/* Brand Name */}
        <h1
          style={{
            fontSize: 48,
            fontWeight: 800,
            letterSpacing: '-2px',
            color: '#24221f',
            margin: '0 0 8px',
          }}
        >
          quiz<span style={{ fontWeight: 400 }}>app</span>
          <span style={{ color: '#a58ee2' }}>.</span>
        </h1>

        <p
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontStyle: 'italic',
            fontSize: 22,
            color: '#69665f',
            margin: '0 0 24px',
          }}
        >
          Keep asking. Keep learning.
        </p>

        {/* Feature Pills */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 26 }}>
          {['6 AI Topics', 'Learn & Quiz Modes', 'Daily UTC Challenge', 'Live Leaderboard'].map(
            (tag) => (
              <span
                key={tag}
                style={{
                  backgroundColor: '#fffefa',
                  border: '1px solid #dcd7ea',
                  borderRadius: 20,
                  padding: '6px 14px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#493e5b',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
              >
                {tag}
              </span>
            )
          )}
        </div>

        {/* Footer text */}
        <div
          style={{
            fontSize: 10,
            letterSpacing: '0.12em',
            fontWeight: 800,
            color: '#8a857d',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          MADE FOR CURIOUS MINDS <span style={{ color: '#9c8abe', fontSize: 14 }}>✳</span>
        </div>
      </div>
    </div>
  );
};
