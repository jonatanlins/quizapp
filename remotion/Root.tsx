import React from 'react';
import { Composition } from 'remotion';
import { QuizVideo } from './QuizVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="QuizAppDemo"
      component={QuizVideo}
      durationInFrames={375}
      fps={30}
      width={1280}
      height={720}
    />
  );
};
