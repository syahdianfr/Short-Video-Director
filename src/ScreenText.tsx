import React from 'react';
import {AbsoluteFill, interpolate, spring, Easing} from 'remotion';
import type {StoryBeat} from './types';

const BLACK = '"Inter Display Black", "Inter Black", Inter, sans-serif';
const TYPE = '"Courier 10 Pitch", "Courier New", FreeMono, monospace';

/** Kinetic on-screen labels (not subtitles). Always placed in the top third, clear of the subtitle zone. */
export const ScreenText: React.FC<{beat: StoryBeat; frame: number; fps: number}> = ({beat, frame, fps}) => {
  const st = beat.screenText;
  if (!st) return null;
  const at = Math.round((st.atSec ?? beat.startSec) * fps);
  const lf = frame - at;
  if (lf < 0) return null;
  const pop = spring({frame: lf, fps, config: {damping: 11, stiffness: 220, mass: 0.6}});

  let body: React.ReactNode = null;
  if (st.style === 'typewriter') {
    const n = Math.min(st.text.length, Math.floor(lf / 1.5) + 1);
    const caret = Math.floor(lf / 8) % 2 === 0;
    body = (
      <div
        style={{
          fontFamily: TYPE,
          fontWeight: 700,
          fontSize: st.text.length > 22 ? 46 : 62,
          color: '#1b1b1b',
          background: '#f6efdc',
          border: '6px solid #111',
          borderRadius: 10,
          padding: '18px 30px',
          boxShadow: '10px 10px 0 #111',
          maxWidth: 960,
          textAlign: 'center',
        }}
      >
        {st.text.slice(0, n)}
        <span style={{opacity: caret && n < st.text.length + 1 ? 1 : 0}}>▌</span>
      </div>
    );
  } else if (st.style === 'stamp') {
    const s = interpolate(pop, [0, 1], [2.4, 1]);
    body = (
      <div
        style={{
          fontFamily: BLACK,
          fontWeight: 900,
          fontSize: 120,
          color: '#d91e18',
          border: '12px solid #d91e18',
          borderRadius: 18,
          padding: '6px 34px',
          transform: `rotate(-8deg) scale(${s})`,
          opacity: interpolate(lf, [0, 3], [0, 0.95], {extrapolateRight: 'clamp'}),
          background: 'rgba(255,255,255,0.82)',
          letterSpacing: 2,
        }}
      >
        {st.text}
      </div>
    );
  } else if (st.style === 'label') {
    const y = interpolate(pop, [0, 1], [-60, 0]);
    body = (
      <div
        style={{
          fontFamily: BLACK,
          fontWeight: 900,
          fontSize: st.text.length > 24 ? 50 : 66,
          color: '#111',
          background: '#ffd400',
          border: '6px solid #111',
          borderRadius: 999,
          padding: '14px 40px',
          transform: `translateY(${y}px) scale(${0.7 + 0.3 * pop})`,
          boxShadow: '8px 8px 0 #111',
          maxWidth: 980,
          textAlign: 'center',
        }}
      >
        {st.text}
      </div>
    );
  } else {
    // counter
    let text = st.text;
    let flipScale = 1;
    if (st.textAfter && st.flipAtSec !== undefined) {
      const ff = frame - Math.round(st.flipAtSec * fps);
      if (ff >= 0) text = st.textAfter;
      flipScale = ff >= -3 && ff < 4 ? Math.abs(ff) / 4 : 1;
    } else {
      const num = parseInt(st.text.replace(/[^0-9]/g, ''), 10);
      if (!Number.isNaN(num)) {
        const k = interpolate(lf, [0, fps * 1.1], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
        text = Math.round(num * k).toLocaleString('en-US');
      }
    }
    body = (
      <div
        style={{
          fontFamily: BLACK,
          fontWeight: 900,
          fontSize: 150,
          color: '#ffffff',
          WebkitTextStroke: '12px #111',
          paintOrder: 'stroke fill',
          transform: `scale(${0.8 + 0.2 * pop}) scaleY(${flipScale})`,
          letterSpacing: -2,
          textShadow: '10px 10px 0 #111',
        }}
      >
        {text}
      </div>
    );
  }

  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 210}}>
      {body}
    </AbsoluteFill>
  );
};
