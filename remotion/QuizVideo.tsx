import type React from 'react';
import { interpolate, Sequence, useCurrentFrame } from 'remotion';
import { Cursor } from './components/Cursor';
import { HeroScene } from './scenes/HeroScene';
import { OutroScene } from './scenes/OutroScene';
import { QuizScene } from './scenes/QuizScene';
import { ResultsScene } from './scenes/ResultsScene';

export const QuizVideo: React.FC = () => {
  const frame = useCurrentFrame();

  // Username typing calculation (frames 20 - 45)
  const fullUsername = 'Alex';
  let typedUsername = '';
  if (frame >= 22 && frame < 28) typedUsername = 'A';
  else if (frame >= 28 && frame < 34) typedUsername = 'Al';
  else if (frame >= 34 && frame < 40) typedUsername = 'Ale';
  else if (frame >= 40) typedUsername = fullUsername;

  // Learn Mode checked state (toggles at frame 68)
  const learnModeChecked = frame >= 68;

  // Topic card hover and click
  const hoveredCard = frame >= 105 && frame < 140 ? 'agents' : undefined;
  const selectedCard = frame >= 128 && frame < 140 ? 'agents' : undefined;

  // Quiz state
  const isAnswered = frame >= 195;
  const nextButtonHovered = frame >= 225 && frame < 248;
  const nextButtonClicked = frame >= 238 && frame < 248;

  // Cursor coordinates interpolation across the video
  let cursorX = 1100;
  let cursorY = 650;
  let clicking = false;
  let cursorVisible = true;

  if (frame < 140) {
    // Hero & Topics Scene
    cursorVisible = frame > 10;
    if (frame <= 45) {
      cursorX = interpolate(frame, [10, 30], [980, 720], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      cursorY = interpolate(frame, [10, 30], [550, 350], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
    } else if (frame <= 72) {
      cursorX = interpolate(frame, [45, 66], [720, 955], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      cursorY = interpolate(frame, [45, 66], [350, 345], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      if (frame >= 66 && frame <= 72) {
        clicking = true;
      }
    } else if (frame <= 140) {
      cursorX = interpolate(frame, [72, 115], [955, 980], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      cursorY = interpolate(frame, [72, 115], [345, 490], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      if (frame >= 128 && frame <= 136) {
        clicking = true;
      }
    }
  } else if (frame < 250) {
    // Quiz Scene
    cursorVisible = true;
    if (frame < 192) {
      cursorX = interpolate(frame, [145, 185], [980, 420], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      cursorY = interpolate(frame, [145, 185], [490, 435], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
    } else if (frame < 215) {
      cursorX = 420;
      cursorY = 435;
      if (frame >= 192 && frame <= 200) {
        clicking = true;
      }
    } else {
      cursorX = interpolate(frame, [215, 235], [420, 335], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      cursorY = interpolate(frame, [215, 235], [435, 595], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      if (frame >= 236 && frame <= 244) {
        clicking = true;
      }
    }
  } else if (frame < 325) {
    // Results Scene
    cursorVisible = frame < 290;
    cursorX = interpolate(frame, [250, 280], [335, 480], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    cursorY = interpolate(frame, [250, 280], [595, 340], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  } else {
    // Outro Scene
    cursorVisible = false;
  }

  return (
    <div
      style={{
        position: 'relative',
        width: 1280,
        height: 720,
        backgroundColor: '#f8f7f2',
        overflow: 'hidden',
      }}
    >
      {/* Scene 1: Hero & Topic Picker (0 - 140 frames) */}
      <Sequence from={0} durationInFrames={140}>
        <HeroScene
          learnModeChecked={learnModeChecked}
          usernameText={typedUsername}
          hoveredCard={hoveredCard}
          selectedCard={selectedCard}
        />
      </Sequence>

      {/* Scene 2: Interactive Quiz & Learn Mode (140 - 250 frames) */}
      <Sequence from={140} durationInFrames={110}>
        <QuizScene
          selectedOption={frame >= 185 ? 'a' : undefined}
          isAnswered={isAnswered}
          isCorrect={true}
          nextButtonHovered={nextButtonHovered}
          nextButtonClicked={nextButtonClicked}
        />
      </Sequence>

      {/* Scene 3: Results & Leaderboard (250 - 325 frames) */}
      <Sequence from={250} durationInFrames={75}>
        <ResultsScene />
      </Sequence>

      {/* Scene 4: Outro Branding (325 - 375 frames) */}
      <Sequence from={325} durationInFrames={50}>
        <OutroScene />
      </Sequence>

      {/* Global Interactive Cursor */}
      <Cursor x={cursorX} y={cursorY} clicking={clicking} visible={cursorVisible} />
    </div>
  );
};
