import React, {useMemo} from 'react';
import * as THREE from 'three';
import {ToonPart, FlatPart, rand} from '../../lib/toon';
import {ChibiCharacter, Anjing} from '../character';
import {groundColor, MOTE_COOL, MOTE_WARM} from '../lighting';
import type {KahfiExpression, KahfiMouth} from '../faces';
import type {KahfiBeat, KahfiPropId, Vec3} from '../types';

export interface KahfiSetProps {
  beat: KahfiBeat;
  /** Absolute frame. Every deterministic offset is derived from this. */
  frame: number;
  /** Frames since the beat started. */
  localFrame: number;
  fps: number;
  /** VO-driven mouth. Only reaches the Observer; the rig gates the rest. */
  mouth: KahfiMouth;
}

export const secToLocal = (p: KahfiSetProps, sec: number) => Math.round((sec - p.beat.startSec) * p.fps);

/* ------------------------------------------------------------------ */
/* Hand props                                                          */
/* ------------------------------------------------------------------ */
export const KahfiProp: React.FC<{item: KahfiPropId; frame: number}> = ({item, frame}) => {
  switch (item) {
    case 'kantong_perak': {
      /* Leather pouch: a small lathe body with a drawstring neck. */
      const geo = useMemo(() => {
        const pts = [
          new THREE.Vector2(0.001, 0.0),
          new THREE.Vector2(0.09, 0.03),
          new THREE.Vector2(0.11, 0.1),
          new THREE.Vector2(0.07, 0.17),
          new THREE.Vector2(0.04, 0.2),
          new THREE.Vector2(0.035, 0.22),
        ];
        return new THREE.LatheGeometry(pts, 16);
      }, []);
      return (
        <group position={[0, -0.14, 0.04]}>
          <ToonPart geometry={geo} color="#6B4423" outline={0.018} />
          <ToonPart color="#3F2A16" position={[0, 0.21, 0]} rotation={[Math.PI / 2, 0, 0]} outline={0.012}>
            <torusGeometry args={[0.04, 0.012, 6, 14]} />
          </ToonPart>
        </group>
      );
    }
    case 'buku_catatan':
      return (
        <group position={[0.02, -0.06, 0.06]} rotation={[0.3, 0, 0.1]}>
          <ToonPart color="#F8FAFC" outline={0.014}>
            <boxGeometry args={[0.17, 0.02, 0.22]} />
          </ToonPart>
          <ToonPart color="#334155" position={[0, -0.016, 0]} outline={0.012}>
            <boxGeometry args={[0.175, 0.016, 0.225]} />
          </ToonPart>
          <ToonPart color="#F59E0B" position={[0.1, 0.03, -0.04]} rotation={[0, 0, -0.5]} outline={0.01}>
            <cylinderGeometry args={[0.009, 0.009, 0.2, 8]} />
          </ToonPart>
        </group>
      );
    case 'mangkuk_bara': {
      /* Clay bowl. The embers themselves are drawn by the studio set so they
         can glow and spark independently of the hand. */
      const geo = useMemo(() => {
        const pts = [
          new THREE.Vector2(0.001, 0.0),
          new THREE.Vector2(0.1, 0.01),
          new THREE.Vector2(0.15, 0.06),
          new THREE.Vector2(0.17, 0.13),
          new THREE.Vector2(0.155, 0.135),
          new THREE.Vector2(0.135, 0.07),
          new THREE.Vector2(0.09, 0.02),
        ];
        return new THREE.LatheGeometry(pts, 22);
      }, []);
      return (
        <group position={[0, -0.04, 0.1]}>
          <ToonPart geometry={geo} color="#8C5A3C" outline={0.018} />
          <Bara frame={frame} position={[0, 0.1, 0]} scale={0.8} />
        </group>
      );
    }
    case 'tombak':
      return (
        <group position={[0, -0.5, 0.02]} rotation={[0.08, 0, 0]}>
          <ToonPart color="#6B4423" outline={0.016}>
            <cylinderGeometry args={[0.022, 0.024, 2.1, 10]} />
          </ToonPart>
          <ToonPart color="#9CA3AF" position={[0, 1.18, 0]} outline={0.014}>
            <coneGeometry args={[0.055, 0.3, 10]} />
          </ToonPart>
        </group>
      );
    case 'perisai':
      return (
        <group position={[0.04, -0.02, 0.06]} rotation={[0, 0.3, 0]}>
          <ToonPart color="#6B4423" outline={0.018}>
            <cylinderGeometry args={[0.34, 0.34, 0.045, 22]} />
          </ToonPart>
          <ToonPart color="#9CA3AF" position={[0, 0.03, 0]} outline={0.012}>
            <sphereGeometry args={[0.07, 12, 8]} />
          </ToonPart>
        </group>
      );
    case 'obor': {
      const flick = 0.85 + 0.15 * Math.sin(frame * 0.7) + 0.08 * (rand(frame * 3.1) - 0.5);
      return (
        <group position={[0, -0.3, 0.04]}>
          <ToonPart color="#5C4033" outline={0.016}>
            <cylinderGeometry args={[0.025, 0.03, 0.8, 10]} />
          </ToonPart>
          <ToonPart color="#F97316" emissive="#F97316" emissiveIntensity={1.4} position={[0, 0.5, 0]} scale={[1, flick, 1]} outline={false}>
            <coneGeometry args={[0.1, 0.3, 10]} />
          </ToonPart>
          <pointLight color="#F97316" intensity={3.4 * flick} distance={7} decay={2} position={[0, 0.55, 0]} />
        </group>
      );
    }
    case 'lentera':
      return (
        <group position={[0, -0.26, 0.04]}>
          <ToonPart color="#8A6A3A" outline={0.014}>
            <cylinderGeometry args={[0.09, 0.1, 0.18, 10]} />
          </ToonPart>
          <ToonPart color="#FDE68A" emissive="#F59E0B" emissiveIntensity={1.1} position={[0, 0.14, 0]} outline={false}>
            <sphereGeometry args={[0.09, 12, 10]} />
          </ToonPart>
          <pointLight color="#FDBA74" intensity={1.6} distance={5} decay={2} position={[0, 0.14, 0]} />
        </group>
      );
    default:
      return null;
  }
};

/* ------------------------------------------------------------------ */
/* Embers. Deterministic: every spark position comes from rand(seed).  */
/* ------------------------------------------------------------------ */
export const Bara: React.FC<{frame: number; position?: Vec3; scale?: number; intensity?: number}> = ({
  frame,
  position = [0, 0, 0],
  scale = 1,
  intensity = 1,
}) => {
  const N = 26;
  /* The glow strengthens as a palm closes over the bowl: 0.6 -> 1.4. */
  const glow = 0.6 + 0.8 * intensity;
  return (
    <group position={position} scale={scale}>
      <ToonPart color="#F97316" emissive="#F97316" emissiveIntensity={glow} outline={false} scale={[1, 0.4, 1]}>
        <sphereGeometry args={[0.13, 14, 10]} />
      </ToonPart>
      {Array.from({length: N}).map((_, i) => {
        /* Each spark runs its own slow loop, offset by a fixed random seed. */
        const life = ((frame * 0.035 + rand(i * 7.3)) % 1 + 1) % 1;
        const a = rand(i * 3.1) * Math.PI * 2;
        const r = 0.03 + rand(i * 5.7) * 0.08;
        const y = life * 0.42;
        const s = 0.014 * (1 - life) * (0.6 + rand(i * 11.3) * 0.8);
        if (s <= 0.0005) return null;
        return (
          <FlatPart
            key={i}
            color="#FDBA74"
            position={[Math.cos(a) * r * (1 + life), y, Math.sin(a) * r * (1 + life)]}
            scale={s * 40}
            transparent
            opacity={1 - life}
          >
            <circleGeometry args={[0.02, 6]} />
          </FlatPart>
        );
      })}
      <pointLight color="#F97316" intensity={2.6 * glow} distance={4.5} decay={2} position={[0, 0.08, 0]} />
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Environment helpers                                                 */
/* ------------------------------------------------------------------ */

export const Ground: React.FC<{mood: KahfiBeat['mood']; size?: number; y?: number}> = ({mood, size = 90, y = 0}) => (
  <ToonPart color={groundColor(mood)} rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} outline={false}>
    <circleGeometry args={[size, 40]} />
  </ToonPart>
);

/** A low-poly boulder. `seed` keeps its shape stable across renders. */
export const Batu: React.FC<{position: Vec3; scale?: number; seed?: number; color?: string}> = ({
  position,
  scale = 1,
  seed = 0,
  color = '#8A7B68',
}) => (
  <ToonPart
    color={color}
    position={position}
    scale={[scale * (0.8 + rand(seed) * 0.5), scale * (0.6 + rand(seed + 1) * 0.5), scale * (0.8 + rand(seed + 2) * 0.5)]}
    rotation={[rand(seed + 3) * 0.6, rand(seed + 4) * 6.28, rand(seed + 5) * 0.6]}
    outline={0.03}
  >
    <icosahedronGeometry args={[1, 0]} />
  </ToonPart>
);

/** Date palm. Fronds sway from the frame, never from delta time. */
export const PohonKurma: React.FC<{position: Vec3; scale?: number; seed?: number; frame: number}> = ({
  position,
  scale = 1,
  seed = 0,
  frame,
}) => (
  <group position={position} scale={scale} rotation={[0, rand(seed) * 6.28, 0.05 * Math.sin(seed)]}>
    {[0, 1, 2, 3, 4].map((i) => (
      <ToonPart key={i} color="#8A6A43" position={[i * 0.035, 0.5 + i * 0.9, 0]} outline={0.022}>
        <cylinderGeometry args={[0.13 - i * 0.012, 0.15 - i * 0.012, 0.95, 8]} />
      </ToonPart>
    ))}
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <group
        key={`f${i}`}
        position={[0.16, 4.6, 0]}
        rotation={[0, (i / 7) * Math.PI * 2, -0.46 + 0.05 * Math.sin(frame * 0.04 + i + seed)]}
      >
        <ToonPart color="#4F7A3A" position={[0.8, 0, 0]} scale={[1, 0.1, 0.3]} outline={0.02}>
          <sphereGeometry args={[0.85, 10, 8]} />
        </ToonPart>
      </group>
    ))}
  </group>
);

/** Floating dust motes. Positions come from rand(seed), so renders match. */
export const DebuCahaya: React.FC<{frame: number; n?: number; area?: number; height?: number; color?: string; center?: Vec3}> = ({
  frame,
  n = 90,
  area = 7,
  height = 4,
  color = MOTE_WARM,
  center = [0, 0, 0],
}) => (
  <group position={center}>
    {Array.from({length: n}).map((_, i) => {
      const drift = ((frame * 0.004 + rand(i * 2.7)) % 1 + 1) % 1;
      const x = (rand(i * 1.3) - 0.5) * area * 2;
      const z = (rand(i * 1.9) - 0.5) * area * 2;
      const y = 0.2 + drift * height;
      const s = 0.012 + rand(i * 4.1) * 0.016;
      return (
        <FlatPart key={i} color={color} position={[x, y, z]} scale={s * 30} transparent opacity={0.3 + 0.4 * (1 - drift)}>
          <circleGeometry args={[0.02, 5]} />
        </FlatPart>
      );
    })}
  </group>
);

/** Stars, used in the night and the closing time-lapse. */
export const Bintang: React.FC<{frame: number; n?: number; radius?: number}> = ({frame, n = 170, radius = 60}) => (
  <group>
    {Array.from({length: n}).map((_, i) => {
      const a = rand(i * 1.7) * Math.PI * 2;
      const e = 0.12 + rand(i * 2.3) * 1.2;
      const twinkle = 0.45 + 0.55 * Math.abs(Math.sin(frame * 0.02 + rand(i * 5.1) * 6.28));
      return (
        <FlatPart
          key={i}
          color={MOTE_COOL}
          position={[Math.cos(a) * Math.cos(e) * radius, Math.sin(e) * radius, Math.sin(a) * Math.cos(e) * radius]}
          scale={0.22 + rand(i * 3.7) * 0.3}
          transparent
          opacity={twinkle}
        >
          <circleGeometry args={[0.6, 5]} />
        </FlatPart>
      );
    })}
  </group>
);

/* ------------------------------------------------------------------ */
/* Actors: turn the beat's actor list into rigs.                       */
/* ------------------------------------------------------------------ */

/** The expression in force at this second, after any 0-frame swaps. */
const expressionNow = (a: KahfiBeat['actors'][number], sec: number): KahfiExpression => {
  let e = a.expression ?? 'neutral';
  for (const s of a.expressionAt ?? []) if (sec >= s.sec) e = s.expression ?? e;
  return e as KahfiExpression;
};

/**
 * Renders every actor the beat declares.
 *
 * The adab tier is NOT decided here — it is decided inside the rig, from the
 * character id. A set cannot accidentally give a T2 figure a face, because a
 * set has no way to ask for one.
 */
export const Actors: React.FC<{p: KahfiSetProps; handProps?: Partial<Record<string, KahfiPropId>>}> = ({p, handProps = {}}) => {
  const {beat, frame, localFrame, fps, mouth} = p;
  const sec = frame / fps;
  return (
    <>
      {beat.actors.map((a, i) => {
        if (a.who === 'anjing') {
          return (
            <Anjing
              key={`${beat.n}-${i}-anjing`}
              position={a.position}
              rotationY={a.rotationY}
              scale={a.scale}
              frame={frame}
              walking={a.pose === 'berjalan_mantap' || a.pose === 'berlari_tergesa'}
              seed={a.seed ?? i}
            />
          );
        }
        const item = handProps[a.who];
        return (
          <ChibiCharacter
            key={`${beat.n}-${i}-${a.who}`}
            who={a.who}
            position={a.position}
            rotationY={a.rotationY}
            scale={a.scale}
            pose={a.pose}
            fromPose={a.fromPose}
            expression={expressionNow(a, sec)}
            mouth={mouth}
            lipSync={a.lipSync}
            lookAt={a.lookAt}
            frame={frame}
            localFrame={localFrame}
            fps={fps}
            seed={a.seed ?? i}
            rightHandItem={item ? <KahfiProp item={item} frame={frame} /> : null}
          />
        );
      })}
    </>
  );
};
