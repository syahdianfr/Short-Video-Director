import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useAudioData, visualizeAudio} from '@remotion/media-utils';
import {beatAt} from './storyBeats';
import {CameraController, WHIP_FRAMES} from './CameraController';
import {Lighting, ColorBackground} from './Lighting';
import {Sky, type SkyId} from './lib/assets';
import {ScreenText} from './ScreenText';
import {SubtitleOverlay} from './SubtitleOverlay';
import type {Mouth} from './lib/faces';
import type {SetId} from './types';
import type {SetProps} from './sets/common';
import {OfficeSet, BellSet, GlobeSet, StudioSet} from './sets/OfficeSets';
import {TreasureSet, CrowdSet, VerandaSet, SeaSet, ShipClockSet, BeachSet, BikeParadeSet} from './sets/WorldSetsA';
import {BridgeSet, RiverSet, BeachChairSet, BandungSet, HangarSet, BomberWindowSet, FlagpolesSet, EggSet, FinaleSet} from './sets/WorldSetsB';
import {JavaMapSet, ArchipelagoSet} from './sets/MapSets';

const SETS: Record<SetId, React.FC<SetProps>> = {
  office: OfficeSet,
  bell: BellSet,
  treasure: TreasureSet,
  crowd: CrowdSet,
  veranda: VerandaSet,
  globe: GlobeSet,
  sea: SeaSet,
  ship_clock: ShipClockSet,
  beach: BeachSet,
  bike_parade: BikeParadeSet,
  bridge: BridgeSet,
  river: RiverSet,
  beach_chair: BeachChairSet,
  java_map: JavaMapSet,
  bandung: BandungSet,
  hangar: HangarSet,
  bomber_window: BomberWindowSet,
  pen_stamp: HangarSet,
  flagpoles: FlagpolesSet,
  studio: StudioSet,
  archipelago: ArchipelagoSet,
  egg: EggSet,
  finale: FinaleSet,
};

/** HDRI sky per exterior set (Poly Haven, see public/assets/CREDITS.md). Interiors use a flat mood colour. */
const SET_SKY: Partial<Record<SetId, {sky: SkyId; rot?: number}>> = {
  treasure: {sky: 'golden', rot: 0.3},
  crowd: {sky: 'day', rot: 0.6},
  veranda: {sky: 'day', rot: 2.2},
  sea: {sky: 'night', rot: 1.2},
  beach: {sky: 'night', rot: 2.0},
  bike_parade: {sky: 'day', rot: 1.0},
  bridge: {sky: 'crisis', rot: 0.8},
  river: {sky: 'crisis', rot: 2.4},
  beach_chair: {sky: 'crisis', rot: 1.6},
  bandung: {sky: 'crisis', rot: 0.2},
  bomber_window: {sky: 'crisis', rot: 0},
  flagpoles: {sky: 'day', rot: 0.4},
  finale: {sky: 'dawn', rot: 3.6},
};

const VO = staticFile('vo.mp3');
const SFX = staticFile('sfx.wav');

/** VO amplitude → mouth shape (closed / open_mid / open_wide). */
const useMouth = (frame: number, fps: number): Mouth => {
  const audio = useAudioData(VO);
  if (!audio) return 'closed';
  const bins = visualizeAudio({fps, frame, audioData: audio, numberOfSamples: 32, smoothing: true});
  const voice = (bins[1] + bins[2] + bins[3] + bins[4] + bins[5]) / 5;
  if (voice > 0.12) return 'open_wide';
  if (voice > 0.04) return 'open_mid';
  return 'closed';
};

export type MainProps = {showSubtitles?: boolean; withSfx?: boolean};

export const Main: React.FC<MainProps> = ({showSubtitles = false, withSfx = true}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const sec = frame / fps;
  const beat = beatAt(sec);
  const startF = Math.round(beat.startSec * fps);
  const localFrame = frame - startF;
  const mouth = useMouth(frame, fps);
  const SetComp = SETS[beat.set];

  const whipBlur =
    beat.camera.transition === 'whip' && localFrame < WHIP_FRAMES
      ? interpolate(localFrame, [0, WHIP_FRAMES], [14, 0], {extrapolateRight: 'clamp'})
      : 0;
  const flash = beat.flash ? interpolate(localFrame, [0, 4], [0.9, 0], {extrapolateRight: 'clamp'}) : 0;

  const setProps: SetProps = {beat, frame, localFrame, fps, mouth};

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <AbsoluteFill style={{filter: whipBlur ? `blur(${whipBlur}px)` : undefined}}>
        <ThreeCanvas width={width} height={height} camera={{fov: 35, near: 0.05, far: 400, position: [0, 1.6, 5]}} gl={{antialias: true}}>
          <Lighting mood={beat.lightingMood} />
          {SET_SKY[beat.set] ? (
            <Sky sky={SET_SKY[beat.set]!.sky} rotation={SET_SKY[beat.set]!.rot ?? 0} />
          ) : (
            <ColorBackground mood={beat.lightingMood} />
          )}
          <CameraController beat={beat} frame={frame} fps={fps} />
          <SetComp key={beat.set} {...setProps} />
        </ThreeCanvas>
      </AbsoluteFill>

      {/* vignette grade */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)'}} />

      <ScreenText beat={beat} frame={frame} fps={fps} />

      {flash > 0 ? <AbsoluteFill style={{backgroundColor: '#fff', opacity: flash}} /> : null}

      {showSubtitles ? <SubtitleOverlay /> : null}

      <Audio src={VO} />
      {withSfx ? <Audio src={SFX} /> : null}
    </AbsoluteFill>
  );
};
