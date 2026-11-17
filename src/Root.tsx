import React from 'react';
import {Composition} from 'remotion';
import {SetupCheck} from './SetupCheck';
import {Main, type MainProps} from './Composition';
import {FPS, END_SEC} from './storyBeats';

export const WIDTH = 1080;
export const HEIGHT = 1920;
/** 61.87 s (VO 61.67 s + 0.2 s hard cut) → frames 0..1856. */
export const DURATION_FRAMES = Math.round(END_SEC * FPS) + 1;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Main"
        component={Main}
        durationInFrames={DURATION_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{showSubtitles: false, withSfx: true} satisfies MainProps}
      />
      {/* Smoke test: proves Remotion + React Three Fiber + toon shading + outlines render. */}
      <Composition id="SetupCheck" component={SetupCheck} durationInFrames={90} fps={FPS} width={WIDTH} height={HEIGHT} />
    </>
  );
};
