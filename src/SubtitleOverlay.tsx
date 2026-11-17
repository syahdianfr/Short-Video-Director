import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import words from './data/words.json';

/**
 * Optional word-synced captions built from the VO forced-alignment.
 * The final subtitles are supplied by the editor, so this is OFF by default
 * (Main's `showSubtitles` prop). It also documents the subtitle SAFE ZONE:
 * y = 1180–1520 px is kept free of on-screen labels in every shot.
 */
export const SUBTITLE_SAFE_ZONE = {top: 1180, bottom: 1520};

type W = {w: string; s: number; e: number};
const WORDS = words as W[];

// chunk into 3-word groups, breaking early on long pauses
const CHUNKS: W[][] = (() => {
  const out: W[][] = [];
  let cur: W[] = [];
  WORDS.forEach((w, i) => {
    const prev = WORDS[i - 1];
    if (cur.length >= 3 || (prev && w.s - prev.e > 0.25 && cur.length)) {
      out.push(cur);
      cur = [];
    }
    cur.push(w);
  });
  if (cur.length) out.push(cur);
  return out;
})();

export const SubtitleOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sec = frame / fps;
  const chunk = CHUNKS.find((c) => sec >= c[0].s - 0.05 && sec < c[c.length - 1].e + 0.15);
  if (!chunk) return null;
  const pop = spring({frame: frame - Math.round(chunk[0].s * fps), fps, config: {damping: 12, stiffness: 240, mass: 0.5}});
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center'}}>
      <div
        style={{
          position: 'absolute',
          top: SUBTITLE_SAFE_ZONE.top + 90,
          width: 940,
          textAlign: 'center',
          transform: `scale(${0.85 + 0.15 * pop})`,
          fontFamily: '"Inter Display Black", "Inter Black", Inter, sans-serif',
          fontWeight: 900,
          fontSize: 88,
          lineHeight: 1.05,
          letterSpacing: -1,
          color: '#ffffff',
          WebkitTextStroke: '10px #111',
          paintOrder: 'stroke fill',
          textTransform: 'uppercase',
        }}
      >
        {chunk.map((w, i) => {
          const active = sec >= w.s && sec < w.e + 0.05;
          return (
            <span key={i} style={{color: active ? '#ffd400' : '#ffffff', marginRight: 22}}>
              {w.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
