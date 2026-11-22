import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useAudioData, visualizeAudio} from '@remotion/media-utils';
import {beatAt} from './beats';
import {KahfiCamera, WHIP_FRAMES, kahfiCameraAt} from './camera';
import {KahfiLighting} from './lighting';
import {AyatCardView, LabelView, LoopGrade, SeriesBadge} from './Overlay';
import type {KahfiMouth} from './faces';
import type {KahfiSetId} from './types';
import type {KahfiSetProps} from './sets/common';
import {useTexturesReady} from './textures';
import {KotaPasarSet, KuilTanggaSet} from './sets/Kota';
import {InteriorGuaSet, LanskapBukitSet, LerengBukitSet, MulutGuaSet} from './sets/Gua';
import {StudioSet} from './sets/Studio';
import {GangBatuSet, GerbangKotaSet, RumahPintuSet} from './sets/KotaMalam';

/** Set registry. All ten locations are built. */
const SETS: Record<KahfiSetId, React.FC<KahfiSetProps>> = {
  kota_pasar: KotaPasarSet,
  kuil_tangga: KuilTanggaSet,
  lereng_bukit: LerengBukitSet,
  mulut_gua: MulutGuaSet,
  interior_gua: InteriorGuaSet,
  lanskap_bukit: LanskapBukitSet,
  studio: StudioSet,
  gang_batu: GangBatuSet,
  rumah_pintu: RumahPintuSet,
  gerbang_kota: GerbangKotaSet,
};

/**
 * AUDIO LOCK
 *
 * `master.mp3` is the mix that plays: the recorded voice over with 30 layers
 * of real-recording SFX, measured at -14.9 LUFS.
 *
 * `vo.mp3` is the clean voice over, and it is NEVER played. It exists only so
 * the Observer's mouth can be driven by speech amplitude. Analysing the master
 * instead would make the mouth move on a door creak or a coin drop.
 */
const MASTER = staticFile('kahfi/master.mp3');
const VO_STEM = staticFile('kahfi/vo.mp3');

/** Speech amplitude from the clean stem, mapped to three mouth shapes. */
const useMouth = (frame: number, fps: number): KahfiMouth => {
  const audio = useAudioData(VO_STEM);
  if (!audio) return 'closed';
  const bins = visualizeAudio({fps, frame, audioData: audio, numberOfSamples: 32, smoothing: true});
  const voice = (bins[1] + bins[2] + bins[3] + bins[4] + bins[5]) / 5;
  if (voice > 0.16) return 'open_wide';
  if (voice > 0.06) return 'open_mid';
  return 'closed';
};

export type KahfiProps = {withAudio?: boolean};

export const KahfiMain: React.FC<KahfiProps> = ({withAudio = true}) => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();
  const sec = frame / fps;
  const beat = beatAt(sec);
  const cam = kahfiCameraAt(beat, frame, fps);
  const mouth = useMouth(frame, fps);
  /* The 3D scene waits for the textures. Mounting it earlier draws every
     mapped surface black and never redraws it. See textures.ts. */
  const texturesReady = useTexturesReady();
  const SetComp = SETS[beat.set];

  const localFrame = frame - Math.round(beat.startSec * fps);
  const sinceSegment = frame - cam.segStartFrame;

  /* Motion blur on a whip, measured from the segment that started it, so a
     sub-cut whip blurs too. */
  const whipBlur =
    cam.transition === 'whip' && sinceSegment < WHIP_FRAMES
      ? interpolate(sinceSegment, [0, WHIP_FRAMES], [14, 0], {extrapolateRight: 'clamp'})
      : 0;

  const setProps: KahfiSetProps = {beat, frame, localFrame, fps, mouth};

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <AbsoluteFill style={{filter: whipBlur ? `blur(${whipBlur}px)` : undefined}}>
        <ThreeCanvas
          width={width}
          height={height}
          camera={{fov: 38, near: 0.05, far: 400, position: [0, 1.7, 5]}}
          gl={{antialias: true}}
        >
          <KahfiLighting mood={beat.mood} />
          <KahfiCamera beat={beat} frame={frame} fps={fps} />
          {/* keyed on the set id so a location change remounts cleanly */}
          {texturesReady ? <SetComp key={beat.set} {...setProps} /> : null}
        </ThreeCanvas>
      </AbsoluteFill>

      {/* vignette: pulls the eye to centre on a 9:16 frame */}
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 54%, rgba(0,0,0,0.4) 100%)', pointerEvents: 'none'}}
      />

      <LabelView beat={beat} frame={frame} fps={fps} />
      <AyatCardView beat={beat} frame={frame} fps={fps} />
      <SeriesBadge frame={frame} durationInFrames={durationInFrames} />
      <LoopGrade frame={frame} durationInFrames={durationInFrames} />

      {withAudio ? <Audio src={MASTER} /> : null}
    </AbsoluteFill>
  );
};
