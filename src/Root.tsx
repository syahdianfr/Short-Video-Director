import React from 'react';
import {Composition} from 'remotion';
import {SetupCheck} from './SetupCheck';
import {Main, type MainProps} from './Composition';
import {FPS, END_SEC} from './storyBeats';
import {KahfiMain, type KahfiProps} from './kahfi/Composition';
import {END_SEC as KAHFI_END_SEC, FPS as KAHFI_FPS} from './kahfi/beats';

export const WIDTH = 1080;
export const HEIGHT = 1920;
/** 61.87 s (VO 61.67 s + 0.2 s hard cut) → frames 0..1856. */
export const DURATION_FRAMES = Math.round(END_SEC * FPS) + 1;

/** 83.844 s (VO 83.644 s + 0.2 s hard cut) → frames 0..2515. */
export const KAHFI_DURATION_FRAMES = Math.round(KAHFI_END_SEC * KAHFI_FPS) + 1;

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
      {/**
       * Ashabul Kahfi #1 — "Pemuda yang Ditidurkan 309 Tahun di dalam Gua".
       *
       * 83.844 s: the locked voice over runs 83.644 s and the last 0.2 s is
       * picture only, where the hard cut back to frame 0 closes the loop.
       * 2516 frames at 30 fps, animated on ones.
       */}
      <Composition
        id="AshabulKahfi1"
        component={KahfiMain}
        durationInFrames={KAHFI_DURATION_FRAMES}
        fps={KAHFI_FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{withAudio: true} satisfies KahfiProps}
      />

      {/* Smoke test: proves Remotion + React Three Fiber + toon shading + outlines render. */}
      <Composition id="SetupCheck" component={SetupCheck} durationInFrames={90} fps={FPS} width={WIDTH} height={HEIGHT} />
    </>
  );
};
