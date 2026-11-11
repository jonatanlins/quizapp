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

const CARDS = [
  {
    id: 'fundamentals',
    num: '01 / 06',
    label: 'THE FOUNDATION',
    title: 'AI Fundamentals',
    desc: 'Core concepts behind modern AI systems.',
    bg: '#e8e1f6',
    borderColor: '#b8aec2',
    iconColor: '#554b63',
    Icon: BookOpen,
  },
  {
    id: 'llm',
    num: '02 / 06',
    label: 'THE BUILDING BLOCKS',
    title: 'LLM Applications',
    desc: 'Design and evaluate language-model applications.',
    bg: '#f6e2d5',
    borderColor: '#c9aea0',
    iconColor: '#744c34',
    Icon: Sparkles,
  },
  {
    id: 'agents',
    num: '05 / 06',
    label: 'THE AUTONOMY',
    title: 'Autonomous Agents',
    desc: 'Multi-step agents, planning loops, and tool-using systems.',
    bg: '#dfece0',
    borderColor: '#b2c6b3',
    iconColor: '#365c3b',
    labelColor: '#557257',
    descColor: '#4a604c',
    Icon: Bot,
    hasAction: true,
  },
];

export const HeroScene: React.FC<HeroSceneProps> = ({
  learnModeChecked,
  usernameText,
  hoveredCard,
  selectedCard,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scrollY = interpolate(frame, [65, 110], [0, 240], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

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

      <div
        style={{
          transform: `translateY(-${scrollY}px)`,
          transition: 'transform 0.05s linear',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
        }}
      >
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

          <div
            style={{
              position: 'relative',
              height: 280,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
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
            <div
              style={{ position: 'absolute', top: 20, right: 50, fontSize: 28, color: '#9581bd' }}
            >
              ✳
            </div>
            <div
              style={{ position: 'absolute', bottom: 30, left: 40, fontSize: 20, color: '#d6a17b' }}
            >
              ✦
            </div>

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
                  fontSize: 8,
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  color: '#655778',
                }}
              >
                <span>YOUR DAILY DOSE OF</span>
                <span>✳</span>
              </div>
              <div
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: 54,
                  fontWeight: 400,
                  fontStyle: 'italic',
                  color: '#28242e',
                  lineHeight: 0.9,
                }}
              >
                aha<span style={{ color: '#e69869' }}>!</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 8,
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  color: '#655778',
                  borderTop: '1px solid rgba(101,87,120,0.25)',
                  paddingTop: 8,
                }}
              >
                <span>LEARN SOMETHING NEW</span>
                <span>↗</span>
              </div>
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: 8,
                right: 32,
                backgroundColor: '#fff',
                border: '1px solid #dfddd6',
                borderRadius: 20,
                padding: '6px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 10,
                fontWeight: 700,
                color: '#34553b',
                boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
              }}
            >
              <Check size={14} color="#34553b" /> LITTLE WINS ADD UP
            </div>
          </div>
        </div>

        {/* Setup Section */}
        <div
          style={{
            maxWidth: 1140,
            width: '100%',
            margin: '0 auto',
            padding: '16px 48px',
          }}
        >
          <div
            style={{
              backgroundColor: '#fffefa',
              border: '1px solid #e8e5de',
              borderRadius: 8,
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: 20,
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
                    }}
                  />
                </div>
              </div>

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

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
            }}
          >
            {CARDS.map((card) => {
              const isHovered = hoveredCard === card.id;
              const isSelected = selectedCard === card.id;
              const Icon = card.Icon;

              return (
                <div
                  key={card.id}
                  style={{
                    backgroundColor: card.bg,
                    borderRadius: 6,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 200,
                    border: isHovered ? '2px solid #5a8d62' : '2px solid transparent',
                    transform: isHovered ? 'translateY(-3px)' : 'none',
                    boxShadow: isHovered ? '0 12px 24px rgba(45,85,52,0.15)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        border: `1px solid ${card.borderColor}`,
                        display: 'grid',
                        placeItems: 'center',
                        backgroundColor: isHovered ? '#c8decb' : 'transparent',
                      }}
                    >
                      <Icon size={20} color={card.iconColor} />
                    </div>
                    <span style={{ fontSize: 10, color: '#746e72', fontWeight: 600 }}>
                      {card.num}
                    </span>
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        letterSpacing: '0.11em',
                        color: card.labelColor ?? '#716a76',
                      }}
                    >
                      {card.label}
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
                      {card.title}
                    </h3>
                    <p style={{ fontSize: 11, color: card.descColor ?? '#625d5e', margin: 0 }}>
                      {card.desc}
                    </p>
                  </div>
                  {card.hasAction && (
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
                          backgroundColor: isSelected ? '#5a8d62' : '#292824',
                          color: '#fff',
                          display: 'grid',
                          placeItems: 'center',
                          transform: isSelected ? 'scale(0.92)' : 'none',
                        }}
                      >
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
