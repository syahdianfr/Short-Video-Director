import React from 'react';
import {Composition} from 'remotion';
import {SetupCheck} from './SetupCheck';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const DURATION_FRAMES = 1710; // 57.0 s

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Smoke test: proves Remotion + React Three Fiber + toon shading + outlines render. */}
      <Composition
        id="SetupCheck"
        component={SetupCheck}
        durationInFrames={90}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      {/* "Main" (1710 frames) is registered in stage 2, once the VO is in and storyBeats.ts exists. */}
    </>
  );
};
