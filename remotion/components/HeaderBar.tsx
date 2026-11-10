import React from 'react';
import { Activity, ChevronDown } from 'lucide-react';

interface HeaderBarProps {
  activeTab?: 'explore' | 'progress' | 'leaderboard';
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ activeTab = 'explore' }) => {
  return (
    <div style={{ width: '100%', flexShrink: 0 }}>
      {/* Top Chaos Bar */}
      <div
        style={{
          backgroundColor: '#292824',
          color: '#ffffff',
          fontSize: 11,
          fontFamily: "'Avenir Next', 'Helvetica Neue', sans-serif",
          padding: '6px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #3d3b36',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Activity size={14} color="#f5aa86" />
          <strong style={{ fontSize: 11, color: '#f8f7f2', letterSpacing: '-0.2px' }}>Chaos bar</strong>
          <span style={{ color: '#c4c0b8', fontSize: 11 }}>Test how the app handles errors</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: '#a6dfb4',
              display: 'inline-block',
            }}
          />
          <span style={{ color: '#d2cfc8', fontSize: 11 }}>All systems normal</span>
          <div
            style={{
              backgroundColor: '#393833',
              border: '1px solid #6d6963',
              borderRadius: 5,
              padding: '3px 10px',
              fontSize: 11,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: '#fff',
            }}
          >
            <span>No errors</span>
            <ChevronDown size={12} color="#bbb" />
          </div>
        </div>
      </div>

      {/* Main App Header */}
      <header
        style={{
          borderBottom: '1px solid #e5e3dc',
          backgroundColor: '#fffefa',
          padding: '0 48px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: "'Avenir Next', 'Helvetica Neue', sans-serif",
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 60 }}>
          {/* Brand */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: '-1px',
              color: '#24221f',
            }}
          >
            <span
              style={{
                width: 26,
                height: 26,
                backgroundColor: '#282622',
                borderRadius: 7,
                color: '#fff',
                display: 'grid',
                placeItems: 'center',
                position: 'relative',
                fontSize: 17,
                fontWeight: 800,
              }}
            >
              <span style={{ position: 'relative', top: -1 }}>q</span>
              <i
                style={{
                  position: 'absolute',
                  width: 5,
                  height: 5,
                  backgroundColor: '#d3c2ff',
                  borderRadius: '50%',
                  right: -1,
                  top: -1,
                }}
              />
            </span>
            <span>
              quiz<span style={{ fontWeight: 400 }}>app</span>
              <b style={{ color: '#a58ee2' }}>.</b>
            </span>
          </div>

          {/* Navigation */}
          <nav style={{ display: 'flex', gap: 28, height: 64, alignItems: 'center' }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: activeTab === 'explore' ? '#25231f' : '#77746d',
                borderBottom: activeTab === 'explore' ? '2px solid #25231f' : '2px solid transparent',
                padding: '22px 0 20px',
              }}
            >
              Explore
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: activeTab === 'progress' ? '#25231f' : '#77746d',
                borderBottom: activeTab === 'progress' ? '2px solid #25231f' : '2px solid transparent',
                padding: '22px 0 20px',
              }}
            >
              My progress
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: activeTab === 'leaderboard' ? '#25231f' : '#77746d',
                borderBottom: activeTab === 'leaderboard' ? '2px solid #25231f' : '2px solid transparent',
                padding: '22px 0 20px',
              }}
            >
              Leaderboard
            </span>
          </nav>
        </div>

        {/* Header Right Note */}
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: '#77746d',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: '#95cfa2',
              display: 'inline-block',
            }}
          />
          A LITTLE SMARTER, EVERY DAY
        </div>
      </header>
    </div>
  );
};
