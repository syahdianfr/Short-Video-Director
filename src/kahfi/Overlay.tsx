import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import type {KahfiBeat} from './types';
import {NUR_CORE, UI_PARCHMENT} from './lighting';

const SERIES_TITLE = 'Ashabul Kahfi';
const PART = 1;
const PARTS = 3;

/**
 * The series badge.
 *
 * Sits at y = 268 px, i.e. below the top 250 px, so the platform's own UI
 * never covers it. Opacity 0.7 for the whole film. On the last 30 frames it
 * becomes "Bersambung - 2/3" with nothing but a cross-fade: the rule is "no
 * excessive animation", and a badge that slides or scales would compete with
 * the closing line.
 */
export const SeriesBadge: React.FC<{frame: number; durationInFrames: number}> = ({frame, durationInFrames}) => {
  const flipAt = durationInFrames - 30;
  const k = frame < flipAt ? 0 : interpolate(frame, [flipAt, flipAt + 15], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const base: React.CSSProperties = {
    position: 'absolute',
    top: 268,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: '"Inter", system-ui, sans-serif',
    fontSize: 30,
    fontWeight: 600,
    letterSpacing: 1.6,
    color: UI_PARCHMENT,
    textShadow: '0 2px 10px rgba(0,0,0,0.55)',
  };

  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity: 0.7}}>
      <div style={{...base, opacity: 1 - k}}>{`${SERIES_TITLE} · ${PART}/${PARTS}`}</div>
      <div style={{...base, opacity: k}}>{`Bersambung · ${PART + 1}/${PARTS}`}</div>
    </AbsoluteFill>
  );
};

/**
 * A Quran quotation card.
 *
 * Every constraint below is an adab rule, not a layout preference:
 *  - the text is STATIC. No typewriter, no stamp, no scale, no slide. It is
 *    opacity-only, and even that is a 6-frame fade so it is never a transition
 *    effect carrying the cut.
 *  - the reference always travels with the meaning, as "QS. Al-Kahf: 14".
 *  - it sits in the lower third of the FRAME, as an overlay. It is never a 3D
 *    object placed on the ground, near a floor, or near anyone's feet.
 *  - beats that carry one are forbidden from having camera shake; beats.ts
 *    throws at import time if that is ever violated.
 */
export const AyatCardView: React.FC<{beat: KahfiBeat; frame: number; fps: number}> = ({beat, frame, fps}) => {
  if (!beat.ayat) return null;
  const startF = beat.startSec * fps;
  const endF = beat.endSec * fps;
  const o = Math.min(
    interpolate(frame, [startF, startF + 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
    interpolate(frame, [endF - 6, endF], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
  );

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: 72,
          right: 72,
          bottom: 430,
          opacity: o,
          padding: '30px 34px',
          borderRadius: 20,
          background: 'rgba(12,16,26,0.56)',
          borderLeft: `5px solid ${NUR_CORE}`,
        }}
      >
        <div
          style={{
            fontFamily: '"Spectral", Georgia, serif',
            fontSize: 44,
            lineHeight: 1.38,
            color: UI_PARCHMENT,
            textWrap: 'balance',
          }}
        >
          {`"${beat.ayat.terjemahan}"`}
        </div>
        <div
          style={{
            marginTop: 16,
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: 1.2,
            color: '#FDE68A',
          }}
        >
          {beat.ayat.rujukan}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** A small diegetic label (a place, a detail). Never used for a verse. */
export const LabelView: React.FC<{beat: KahfiBeat; frame: number; fps: number}> = ({beat, frame, fps}) => {
  if (!beat.label) return null;
  const startF = beat.startSec * fps;
  const o = interpolate(frame, [startF, startF + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: 72,
          bottom: 330,
          opacity: o * 0.9,
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 26,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: UI_PARCHMENT,
          textShadow: '0 2px 8px rgba(0,0,0,0.6)',
        }}
      >
        {beat.label}
      </div>
    </AbsoluteFill>
  );
};

/**
 * The loop grade.
 *
 * Over the last 12 frames the picture is washed toward the opening gold
 * (#F59E0B), so the hard cut from the final frame back to frame 0 lands on a
 * matching colour as well as a matching camera.
 */
export const LoopGrade: React.FC<{frame: number; durationInFrames: number}> = ({frame, durationInFrames}) => {
  const k = interpolate(frame, [durationInFrames - 12, durationInFrames - 1], [0, 0.34], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (k <= 0) return null;
  return <AbsoluteFill style={{backgroundColor: '#F59E0B', opacity: k, mixBlendMode: 'soft-light', pointerEvents: 'none'}} />;
};
