import { ArrowRight, BookOpen, Bot, Check, Sparkles } from 'lucide-react';
import type React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { HeaderBar } from '../components/HeaderBar';

interface HeroSceneProps {
  learnModeChecked: boolean;
  usernameText: string;
  hoveredCard?: string;
  selectedCard?: string;
}

export const HeroScene: React.FC<HeroSceneProps> = ({
  learnModeChecked,
  usernameText,
  hoveredCard,
  selectedCard,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scroll offset to pan smoothly from hero to topics
  const scrollY = interpolate(frame, [65, 110], [0, 240], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Hero entrance animation
  const heroEntrance = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8 },
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

      {/* Main scrollable body container */}
      <div
        style={{
          transform: `translateY(-${scrollY}px)`,
          transition: 'transform 0.05s linear',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        }}
      >
        {/* Hero Section */}
        <div
          style={{
            maxWidth: 1140,
            width: '100%',
            margin: '0 auto',
            padding: '36px 48px 24px',
            display: 'grid',
            gridTemplateColumns: '1.2fr 0.8fr',
            gap: 32,
            alignItems: 'center',
            opacity: heroEntrance,
          }}
        >
          {/* Left Hero Content */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                border: '1px solid #ddd8e9',
                borderRadius: 30,
                backgroundColor: '#f1edfa',
                padding: '6px 12px',
                color: '#625675',
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: '0.09em',
              }}
            >
              <Sparkles size={13} color="#7f66a8" /> A SMALL QUIZ. A BIGGER PICTURE.
            </div>

            <h1
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 52,
                fontWeight: 400,
                lineHeight: 1.05,
                letterSpacing: '-0.035em',
                margin: '18px 0 14px',
                color: '#24221f',
              }}
            >
              Curiosity looks
              <br />
              <em style={{ color: '#8b73bd', fontStyle: 'italic' }}>good on you.</em>
            </h1>

            <p
              style={{
                color: '#68655e',
                fontSize: 14,
                lineHeight: 1.6,
                maxWidth: 440,
                margin: 0,
              }}
            >
              Big ideas are easier to understand one question at a time. Pick a topic, test what you
              know, and learn something along the way.
            </p>

            <div
              style={{
                marginTop: 22,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: 11,
                color: '#767269',
              }}
            >
              <div style={{ display: 'flex' }}>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    backgroundColor: '#edc0a6',
                    color: '#53463b',
                    fontWeight: 'bold',
                    fontSize: 9,
                    display: 'grid',
                    placeItems: 'center',
                    border: '2px solid #f8f7f2',
                  }}
                >
                  Q
                </span>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    backgroundColor: '#c9c3e9',
                    color: '#423758',
                    fontWeight: 'bold',
                    fontSize: 9,
                    display: 'grid',
                    placeItems: 'center',
                    border: '2px solid #f8f7f2',
                    marginLeft: -4,
                  }}
                >
                  A
                </span>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    backgroundColor: '#c5dbc7',
                    color: '#344e36',
                    fontWeight: 'bold',
                    fontSize: 9,
                    display: 'grid',
                    placeItems: 'center',
                    border: '2px solid #f8f7f2',
                    marginLeft: -4,
                  }}
                >
                  ✦
                </span>
              </div>
              <span>Made for the endlessly curious.</span>
            </div>
          </div>

          {/* Right Hero Art Card */}
          <div
            style={{
              position: 'relative',
              height: 250,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            {/* Orbits */}
            <div
              style={{
                position: 'absolute',
                width: 240,
                height: 240,
                border: '1px solid #dfddd5',
                borderRadius: '50%',
              }}
            />
            <div
              style={{
                position: 'absolute',
                width: 190,
                height: 190,
                border: '1px dashed #dfddd5',
                borderRadius: '50%',
              }}
            />

            {/* Stars */}
            <div
              style={{
                position: 'absolute',
                top: 20,
                right: 50,
                fontSize: 28,
                color: '#9581bd',
              }}
            >
              ✳
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: 30,
                left: 40,
                fontSize: 20,
                color: '#d6a17b',
              }}
            >
              ✦
            </div>

            {/* Lilac sheet */}
            <div
              style={{
                width: 190,
                height: 190,
                backgroundColor: '#ddd5f4',
                transform: 'rotate(-7deg)',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 16px 30px rgba(62,54,74,0.12)',
                borderRadius: 4,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 8,
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: '#493e5a',
                }}
              >
                <span>YOUR DAILY DOSE OF</span>
                <span style={{ fontSize: 16 }}>✳</span>
              </div>
              <div
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontStyle: 'italic',
                  fontSize: 68,
                  lineHeight: 0.8,
                  color: '#352e40',
                  letterSpacing: '-0.07em',
                  marginLeft: 4,
                }}
              >
                aha<span style={{ color: '#8b73bd' }}>!</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 8,
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  color: '#493e5a',
                }}
              >
                <span>LEARN SOMETHING NEW</span>
                <span style={{ fontSize: 14 }}>↗</span>
              </div>
            </div>

            {/* Art tag */}
            <div
              style={{
                position: 'absolute',
                bottom: 18,
                right: 32,
                backgroundColor: '#fffefa',
                borderRadius: 5,
                padding: '8px 12px',
                boxShadow: '0 6px 18px rgba(57,52,47,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: '0.06em',
                color: '#292824',
              }}
            >
              <Check size={14} color="#5c986c" /> LITTLE WINS ADD UP
            </div>
          </div>
        </div>

        {/* Setup preferences banner */}
        <div
          style={{
            borderTop: '1px solid #e5e3dc',
            borderBottom: '1px solid #e5e3dc',
            backgroundColor: '#fffefa',
            padding: '18px 48px',
          }}
        >
          <div
            style={{
              maxWidth: 1140,
              margin: '0 auto',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: 22,
                  letterSpacing: '-0.02em',
                  margin: 0,
                  color: '#24221f',
                }}
              >
                Make it yours.
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#69665f' }}>
                A name and a little curiosity are all you need.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
              {/* Username Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 200 }}>
                <span
                  style={{
                    fontSize: 9,
                    letterSpacing: '0.11em',
                    fontWeight: 800,
                    color: '#777168',
                  }}
                >
                  YOUR USERNAME
                </span>
                <div
                  style={{
                    borderBottom: '1.5px solid #bbb8ae',
                    paddingBottom: 4,
                    fontSize: 14,
                    color: '#24221f',
                    minHeight: 22,
                    fontWeight: 600,
                  }}
                >
                  {usernameText}
                  <span
                    style={{
                      borderRight: '2px solid #8a6dd5',
                      marginLeft: 2,
                      animation: 'blink 1s infinite',
                    }}
                  />
                </div>
              </div>

              {/* Learn Mode Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div>
                  <strong style={{ fontSize: 12, display: 'block', color: '#24221f' }}>
                    Learn mode
                  </strong>
                  <small style={{ fontSize: 10, color: '#77736b' }}>
                    Get a hint before each question
                  </small>
                </div>

                <div
                  style={{
                    width: 36,
                    height: 20,
                    borderRadius: 20,
                    backgroundColor: learnModeChecked ? '#8a72bc' : '#d9d6cd',
                    position: 'relative',
                    transition: 'background-color 0.2s',
                    boxShadow: learnModeChecked ? '0 0 8px rgba(138,114,188,0.4)' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      position: 'absolute',
                      top: 3,
                      left: learnModeChecked ? 19 : 3,
                      transition: 'left 0.2s',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Topics Section */}
        <div style={{ maxWidth: 1140, width: '100%', margin: '0 auto', padding: '36px 48px 60px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: 20,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 9,
                  letterSpacing: '0.11em',
                  fontWeight: 800,
                  color: '#777168',
                }}
              >
                A PLACE TO BEGIN
              </span>
              <h2
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: 32,
                  letterSpacing: '-0.03em',
                  margin: '4px 0 0',
                  color: '#24221f',
                }}
              >
                Pick your rabbit hole<span style={{ color: '#a38bd3' }}>.</span>
              </h2>
            </div>
            <span
              style={{
                fontSize: 9,
                letterSpacing: '0.1em',
                fontWeight: 800,
                color: '#8a867d',
              }}
            >
              6 TOPICS TO EXPLORE
            </span>
          </div>

          {/* Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
            }}
          >
            {/* Card 1 */}
            <div
              style={{
                backgroundColor: '#e8e1f6',
                borderRadius: 6,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 200,
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    border: '1px solid #b8aec2',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <BookOpen size={20} color="#554b63" />
                </div>
                <span style={{ fontSize: 10, color: '#746e72', fontWeight: 600 }}>01 / 06</span>
              </div>
              <div style={{ marginTop: 20 }}>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: '0.11em',
                    color: '#716a76',
                  }}
                >
                  THE FOUNDATION
                </span>
                <h3
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontSize: 21,
                    letterSpacing: '-0.02em',
                    margin: '6px 0',
                    color: '#24221f',
                  }}
                >
                  AI Fundamentals
                </h3>
                <p style={{ fontSize: 11, color: '#625d5e', margin: 0 }}>
                  Core concepts behind modern AI systems.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div
              style={{
                backgroundColor: '#f6e2d5',
                borderRadius: 6,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 200,
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    border: '1px solid #c9aea0',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Sparkles size={20} color="#744c34" />
                </div>
                <span style={{ fontSize: 10, color: '#746e72', fontWeight: 600 }}>02 / 06</span>
              </div>
              <div style={{ marginTop: 20 }}>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: '0.11em',
                    color: '#716a76',
                  }}
                >
                  THE BUILDING BLOCKS
                </span>
                <h3
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontSize: 21,
                    letterSpacing: '-0.02em',
                    margin: '6px 0',
                    color: '#24221f',
                  }}
                >
                  LLM Applications
                </h3>
                <p style={{ fontSize: 11, color: '#625d5e', margin: 0 }}>
                  Design and evaluate language-model applications.
                </p>
              </div>
            </div>

            {/* Card 3: Autonomous Agents (Hovered & Clicked) */}
            <div
              style={{
                backgroundColor: '#dfece0',
                borderRadius: 6,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 200,
                border: hoveredCard === 'agents' ? '2px solid #5a8d62' : '2px solid transparent',
                transform: hoveredCard === 'agents' ? 'translateY(-3px)' : 'none',
                boxShadow: hoveredCard === 'agents' ? '0 12px 24px rgba(45,85,52,0.15)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    border: '1px solid #b2c6b3',
                    display: 'grid',
                    placeItems: 'center',
                    backgroundColor: hoveredCard === 'agents' ? '#c8decb' : 'transparent',
                  }}
                >
                  <Bot size={20} color="#365c3b" />
                </div>
                <span style={{ fontSize: 10, color: '#746e72', fontWeight: 600 }}>05 / 06</span>
              </div>
              <div style={{ marginTop: 20 }}>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: '0.11em',
                    color: '#557257',
                  }}
                >
                  THE AUTONOMY
                </span>
                <h3
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontSize: 21,
                    letterSpacing: '-0.02em',
                    margin: '6px 0',
                    color: '#24221f',
                  }}
                >
                  Autonomous Agents
                </h3>
                <p style={{ fontSize: 11, color: '#4a604c', margin: 0 }}>
                  Multi-step agents, planning loops, and tool-using systems.
                </p>
              </div>
              <div
                style={{
                  marginTop: 'auto',
                  paddingTop: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 11, color: '#536955' }}>5 questions · ~3 min</span>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: selectedCard === 'agents' ? '#5a8d62' : '#292824',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    transform: selectedCard === 'agents' ? 'scale(0.92)' : 'none',
                  }}
                >
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
