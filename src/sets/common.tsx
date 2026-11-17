import React from 'react';
import * as THREE from 'three';
import {ToonPart} from '../lib/toon';
import {HandProp} from '../props';
import {KPalm, KModel} from '../lib/assets';
import type {Mouth, EmoteType} from '../lib/faces';
import type {Expression, StoryBeat, Vec3} from '../types';
import {ToonCharacter, type ToonCharacterProps} from '../ToonCharacter';

export interface SetProps {
  beat: StoryBeat;
  /** Absolute frame. */
  frame: number;
  /** Frames since the beat started. */
  localFrame: number;
  fps: number;
  /** VO-driven mouth for lip-synced characters. */
  mouth: Mouth;
}

/** Expression at the current second (instant step-swaps, 0-frame transitions). */
export const expressionAt = (beat: StoryBeat, sec: number): Expression => {
  let e = beat.character.expression;
  for (const s of beat.character.expressionAt ?? []) if (sec >= s.sec) e = s.expression;
  return e;
};

/** Build ToonCharacter props for the beat's hero from StoryBeat.character + propState. */
export const heroProps = (
  p: SetProps,
  overrides: Partial<ToonCharacterProps> = {},
): ToonCharacterProps | null => {
  const {beat, localFrame, fps, frame, mouth} = p;
  const c = beat.character;
  if (c.who === 'none') return null;
  const sec = frame / fps;
  const t = localFrame / fps;
  const prop = beat.propState;
  const item = prop && prop.item !== 'none' ? <HandProp item={prop.item} t={t} /> : null;
  const emote: {type: EmoteType; frame: number} | null = c.emote
    ? {type: c.emote.type, frame: Math.round((c.emote.atSec - beat.startSec) * fps)}
    : null;
  return {
    who: c.who,
    pose: c.pose,
    expression: expressionAt(beat, sec),
    mouth: c.lipSync ? mouth : 'closed',
    lookAt: c.lookAt,
    localFrame,
    fps,
    actionFrame: c.actionAtSec !== undefined ? Math.round((c.actionAtSec - beat.startSec) * fps) : undefined,
    emote,
    rightHandItem: prop?.holder === 'right_hand' ? item : null,
    leftHandItem: prop?.holder === 'left_hand' ? item : null,
    ...overrides,
  };
};

export const Hero: React.FC<{p: SetProps} & Partial<ToonCharacterProps>> = ({p, ...o}) => {
  const props = heroProps(p, o);
  return props ? <ToonCharacter {...props} /> : null;
};

/** World-held prop, interpolated across the beat (holder === 'world'). */
export const WorldProp: React.FC<{p: SetProps; rotation?: Vec3}> = ({p, rotation}) => {
  const prop = p.beat.propState;
  if (!prop || prop.holder !== 'world' || !prop.worldPos) return null;
  const dur = (p.beat.endSec - p.beat.startSec) * p.fps;
  const k = Math.min(1, p.localFrame / Math.max(1, dur));
  const a = new THREE.Vector3(...prop.worldPos);
  const b = new THREE.Vector3(...(prop.worldPosEnd ?? prop.worldPos));
  const pos = a.lerp(b, k).toArray() as Vec3;
  return (
    <group position={pos} rotation={rotation}>
      <HandProp item={prop.item} t={p.localFrame / p.fps} />
    </group>
  );
};

/** Big ground disc. */
export const Ground: React.FC<{color: string; size?: number; y?: number}> = ({color, size = 80, y = 0}) => (
  <ToonPart color={color} rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} outline={false}>
    <circleGeometry args={[size, 48]} />
  </ToonPart>
);

/** Stylised tree — Kenney Nature Kit model. */
export const Tree: React.FC<{position: Vec3; scale?: number; color?: string}> = ({position, scale = 1}) => (
  <KModel id={Math.abs(position[0] * 3 + position[2]) % 2 > 1 ? 'treeOak' : 'tree'} position={position} height={3.6 * scale} ink={0.04} />
);

/** Palm tree for Java/Batavia backgrounds — Kenney Nature Kit model with wind sway. */
export const Palm: React.FC<{position: Vec3; scale?: number; seed?: number; t?: number}> = ({position, scale = 1, seed = 0, t = 0}) => (
  <KPalm position={position} scale={scale} seed={seed} t={t} />
);

/** Fireball / explosion puff (grows then fades by scale). */
export const Fireball: React.FC<{position: Vec3; k: number; size?: number}> = ({position, k, size = 1}) => {
  if (k <= 0 || k >= 1) return null;
  const s = size * (0.3 + 1.2 * Math.sin(Math.min(1, k * 1.3) * Math.PI * 0.5)) * (1 - Math.max(0, k - 0.7) / 0.3);
  return (
    <group position={position}>
      <ToonPart color="#ffb02e" emissive="#ff6a00" emissiveIntensity={0.8} scale={s}>
        <icosahedronGeometry args={[1, 1]} />
      </ToonPart>
      <ToonPart color="#fff1a8" emissive="#ffd000" emissiveIntensity={0.9} scale={s * 0.6} position={[0.2 * s, 0.25 * s, 0.4 * s]} outline={false}>
        <icosahedronGeometry args={[1, 1]} />
      </ToonPart>
      <ToonPart color="#4a4a4a" scale={s * 0.7} position={[-0.3 * s, 0.9 * s, -0.2 * s]}>
        <icosahedronGeometry args={[1, 1]} />
      </ToonPart>
    </group>
  );
};

/** Dust puffs radiating from a point (impact accent). */
export const DustPuff: React.FC<{position: Vec3; k: number; color?: string; n?: number; spread?: number; size?: number}> = ({
  position,
  k,
  color = '#e9e2cf',
  n = 6,
  spread = 0.5,
  size = 1,
}) => {
  if (k <= 0 || k >= 1) return null;
  return (
    <group position={position}>
      {Array.from({length: n}).map((_, i) => {
        const a = (i / n) * Math.PI * 2;
        const r = spread * Math.sqrt(k);
        const s = (0.12 * (1 - k) + 0.02) * size;
        return (
          <ToonPart key={i} color={color} position={[Math.cos(a) * r, 0.05 + k * 0.15, Math.sin(a) * r]} scale={s * 2} outline={0.01}>
            <sphereGeometry args={[1, 10, 8]} />
          </ToonPart>
        );
      })}
    </group>
  );
};

export const secToLocal = (p: SetProps, sec: number) => Math.round((sec - p.beat.startSec) * p.fps);
