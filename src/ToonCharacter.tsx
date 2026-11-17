import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Billboard} from '@react-three/drei';
import {spring} from 'remotion';
import {ToonPart, FlatPart, getToonGradient, clamp01, lerp} from './lib/toon';
import {faceTexture, emoteTexture, type Expression, type Mouth, type EmoteType} from './lib/faces';
import type {CharacterId, Pose, Vec3} from './types';

/* ------------------------------------------------------------------ */
/* Look presets                                                         */
/* ------------------------------------------------------------------ */
type Hat = 'cap' | 'peci' | 'fieldcap' | 'helmet' | 'crown' | 'none';
interface Look {
  body: string;
  limb: string;
  hand: string;
  boot: string;
  hat: Hat;
  hatColor: string;
  hatBand?: string;
  mustache?: boolean;
  medals?: boolean;
  sash?: string;
  scale: number;
}

export const LOOKS: Record<Exclude<CharacterId, 'none'>, Look> = {
  general: {body: '#efe6cf', limb: '#efe6cf', hand: '#ffffff', boot: '#2b211b', hat: 'cap', hatColor: '#efe6cf', hatBand: '#f28c28', mustache: true, medals: true, sash: '#f28c28', scale: 1},
  officer: {body: '#c9b27c', limb: '#c9b27c', hand: '#ffffff', boot: '#2b211b', hat: 'cap', hatColor: '#c9b27c', hatBand: '#7a5c2e', mustache: false, scale: 1},
  bima: {body: '#b5452f', limb: '#e9dcc5', hand: '#ffffff', boot: '#5b3b26', hat: 'peci', hatColor: '#1b1b1b', scale: 0.72},
  jp_general: {body: '#6f7444', limb: '#6f7444', hand: '#fafafa', boot: '#2a2418', hat: 'fieldcap', hatColor: '#6f7444', hatBand: '#d8b23a', scale: 1},
  jp_soldier: {body: '#7c7f4c', limb: '#7c7f4c', hand: '#fafafa', boot: '#2a2418', hat: 'helmet', hatColor: '#5e6236', scale: 0.95},
  sapper: {body: '#7f8a5a', limb: '#7f8a5a', hand: '#ffffff', boot: '#2b211b', hat: 'helmet', hatColor: '#4e5a3a', scale: 0.95},
  king: {body: '#d9a62b', limb: '#7a2f8f', hand: '#ffffff', boot: '#3a2a12', hat: 'crown', hatColor: '#ffcf3a', scale: 1},
  official: {body: '#2f3f6e', limb: '#2f3f6e', hand: '#ffffff', boot: '#1b1b1b', hat: 'cap', hatColor: '#2f3f6e', hatBand: '#f28c28', mustache: true, scale: 1},
};

/* ------------------------------------------------------------------ */
/* Rig constants (character local space, feet at y=0, facing +Z)        */
/* "right" = the character's anatomical right = -X.                     */
/* ------------------------------------------------------------------ */
const SHOULDER_R = new THREE.Vector3(-0.31, 1.3, 0.02);
const SHOULDER_L = new THREE.Vector3(0.31, 1.3, 0.02);
const HIP_R = new THREE.Vector3(-0.15, 0.56, 0);
const HIP_L = new THREE.Vector3(0.15, 0.56, 0);
const HEAD_Y = 1.88;
const HEAD_R = 0.42;

type Targets = {rh: Vec3; lh: Vec3; rf: Vec3; lf: Vec3; lean: number; bob: number; headPitch: number; rootY: number};

const REST: Targets = {
  rh: [-0.5, 0.74, 0.06],
  lh: [0.5, 0.74, 0.06],
  rf: [-0.17, 0.07, 0.03],
  lf: [0.17, 0.07, 0.03],
  lean: 0,
  bob: 0,
  headPitch: 0,
  rootY: 0,
};

/** Pose library. t = seconds in beat, a = 0..1 action progress (spring). */
const poseTargets = (pose: Pose, t: number, a: number, seed: number): Targets => {
  const s = Math.sin;
  const breathe = s(t * 2.4 + seed) * 0.012;
  const base: Targets = {...REST, rh: [...REST.rh], lh: [...REST.lh], bob: breathe};
  switch (pose) {
    case 'idle':
      return base;
    case 'look_up':
      return {...base, headPitch: -0.45};
    case 'polish':
      return {
        ...base,
        rh: [0.1 + 0.07 * s(t * 14), 1.24 + 0.05 * Math.cos(t * 14), 0.44],
        lh: [0.46, 0.86, 0.14],
        lean: -0.04,
      };
    case 'flag_up':
      return {
        ...base,
        rh: [-0.42 + 0.12 * s(t * 16), 2.6, 0.18],
        lh: [0.2, 1.32, 0.42],
        lean: 0.06,
        headPitch: -0.1,
      };
    case 'plant':
      return {...base, rh: [lerp(-0.4, -0.2, a), lerp(1.55, 1.0, a), lerp(0.4, 0.8, a)], lh: [0.46, 0.86, 0.14], lean: 0.12 * a};
    case 'toast':
      return {...base, rh: [-0.32 + 0.1 * a, 1.7 + 0.06 * s(t * 9), 0.48], lh: [0.46, 0.86, 0.14], lean: -0.05 + 0.03 * s(t * 9), bob: 0.03 * Math.abs(s(t * 9))};
    case 'read':
      return {...base, rh: [-0.3, 1.18, 0.55], lh: [0.3, 1.18, 0.55], lean: -0.03};
    case 'hold_paper':
      return {...base, rh: [-0.18, 1.62, 0.6], lh: [0.42, 0.9, 0.2]};
    case 'sweep':
      return {...base, rh: [-0.1 + 0.15 * s(t * 5), 1.12, 0.38], lh: [0.08 + 0.15 * s(t * 5), 0.82, 0.42], lean: 0.12, headPitch: 0.1};
    case 'ride': {
      const p = t * 9 + seed;
      return {
        ...base,
        rh: [-0.24, 0.98, 0.55],
        lh: [0.24, 0.98, 0.55],
        rf: [-0.18, 0.28 + 0.14 * s(p), 0.3 + 0.14 * Math.cos(p)],
        lf: [0.18, 0.28 - 0.14 * s(p), 0.3 - 0.14 * Math.cos(p)],
        lean: 0.18,
        bob: 0.02 * s(p * 2),
      };
    }
    case 'carry_overhead':
      return {...base, rh: [-0.34, 2.42, 0.08], lh: [0.34, 2.42, 0.08], bob: 0.04 * s(t * 7 + seed), lean: 0.02};
    case 'plunger':
      return {...base, rh: [-0.1, lerp(1.25, 0.72, a), 0.55], lh: [0.1, lerp(1.25, 0.72, a), 0.55], lean: 0.2 * a, bob: -0.12 * a};
    case 'squished':
      return {
        ...base,
        rh: [-0.6 - 0.1 * s(t * 20), 1.9 + 0.2 * s(t * 18), 0.3],
        lh: [0.6 + 0.1 * s(t * 21), 1.9 + 0.2 * Math.cos(t * 19), 0.3],
        rf: [-0.2, 0.5 + 0.1 * s(t * 15), 0.6],
        lf: [0.2, 0.5 - 0.1 * s(t * 15), 0.6],
        lean: -0.25,
      };
    case 'slam':
      return {...base, rh: [lerp(-0.34, -0.18, a), lerp(2.35, 0.98, a), lerp(0.2, 0.78, a)], lh: [0.46, 0.86, 0.14], lean: 0.18 * a};
    case 'sit':
      return {...base, rf: [-0.18, 0.06, 0.62], lf: [0.18, 0.06, 0.62], rh: [-0.28, 1.0, 0.55], lh: [0.28, 1.0, 0.55]};
    case 'shrug':
      return {...base, rh: [-0.68, 1.2 + 0.05 * s(t * 4), 0.3], lh: [0.68, 1.2 + 0.05 * s(t * 4), 0.3], bob: 0.03 * s(t * 4)};
    case 'arms_up':
      return {...base, rh: [-0.3, 2.42, 0.02], lh: [0.3, 2.42, 0.02], bob: -0.03 + 0.02 * s(t * 6 + seed)};
    case 'walk': {
      const p = t * 8 + seed;
      return {
        ...base,
        rf: [-0.17, 0.07 + Math.max(0, 0.14 * s(p)), 0.03 + 0.24 * s(p)],
        lf: [0.17, 0.07 + Math.max(0, -0.14 * s(p)), 0.03 - 0.24 * s(p)],
        rh: [-0.48, 0.8, 0.06 - 0.25 * s(p)],
        lh: [0.48, 0.8, 0.06 + 0.25 * s(p)],
        bob: 0.04 * Math.abs(s(p)),
      };
    }
    case 'raise_flag':
      return {...base, rh: [-0.34, 2.3 + 0.04 * s(t * 6), 0.2], lh: [-0.2, 1.55, 0.28], lean: -0.05, headPitch: -0.25};
    case 'point':
      return {...base, rh: [-0.28, 1.5, 0.85], lh: [0.46, 0.86, 0.14], lean: 0.05};
    default:
      return base;
  }
};

/* ------------------------------------------------------------------ */
/* Bendy limb: CatmullRomCurve3 + TubeGeometry from joint to target.    */
/* ------------------------------------------------------------------ */
const q = (v: number) => Math.round(v * 200) / 200;

const BendyLimb: React.FC<{from: THREE.Vector3; to: THREE.Vector3; bend: THREE.Vector3; radius: number; color: string}> = ({
  from,
  to,
  bend,
  radius,
  color,
}) => {
  const key = [from, to, bend].map((v) => `${q(v.x)},${q(v.y)},${q(v.z)}`).join('|');
  const geo = useMemo(() => {
    const len = from.distanceTo(to);
    const slack = Math.max(0, 0.95 - len) * 0.6 + 0.04;
    const mid = from.clone().lerp(to, 0.5).add(bend.clone().normalize().multiplyScalar(slack));
    const curve = new THREE.CatmullRomCurve3([from.clone(), mid, to.clone()], false, 'centripetal');
    return new THREE.TubeGeometry(curve, 20, radius, 10, false);
  }, [key, radius]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <ToonPart geometry={geo} color={color}>
      {null}
    </ToonPart>
  );
};

/* ------------------------------------------------------------------ */
/* Hats                                                                 */
/* ------------------------------------------------------------------ */
const HatMesh: React.FC<{look: Look}> = ({look}) => {
  const y = HEAD_Y;
  switch (look.hat) {
    case 'cap':
      return (
        <group position={[0, y + 0.3, 0]} rotation={[-0.08, 0, 0]}>
          <ToonPart color={look.hatColor} position={[0, 0.07, 0]}>
            <cylinderGeometry args={[0.44, 0.36, 0.2, 28]} />
          </ToonPart>
          <ToonPart color={look.hatBand ?? '#333'} position={[0, -0.05, 0]} outline={0.02}>
            <cylinderGeometry args={[0.365, 0.365, 0.07, 28]} />
          </ToonPart>
          <ToonPart color="#1d1d1d" position={[0, -0.08, 0.3]} rotation={[0.25, 0, 0]} outline={0.02}>
            <boxGeometry args={[0.42, 0.03, 0.22]} />
          </ToonPart>
        </group>
      );
    case 'peci':
      return (
        <ToonPart color={look.hatColor} position={[0, y + 0.33, -0.02]} scale={[1, 1, 0.82]}>
          <cylinderGeometry args={[0.34, 0.37, 0.24, 28]} />
        </ToonPart>
      );
    case 'fieldcap':
      return (
        <group position={[0, y + 0.29, 0]}>
          <ToonPart color={look.hatColor}>
            <cylinderGeometry args={[0.37, 0.4, 0.22, 28]} />
          </ToonPart>
          <ToonPart color="#3b3b22" position={[0, -0.09, 0.32]} rotation={[0.3, 0, 0]} outline={0.02}>
            <boxGeometry args={[0.4, 0.03, 0.2]} />
          </ToonPart>
          <ToonPart color={look.hatBand ?? '#d8b23a'} position={[0, 0.02, 0.385]} outline={0.015}>
            <sphereGeometry args={[0.05, 12, 12]} />
          </ToonPart>
        </group>
      );
    case 'helmet':
      return (
        <ToonPart color={look.hatColor} position={[0, y + 0.06, 0]}>
          <sphereGeometry args={[0.47, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        </ToonPart>
      );
    case 'crown':
      return (
        <group position={[0, y + 0.36, 0]}>
          <ToonPart color={look.hatColor} emissive="#7a5200" emissiveIntensity={0.2}>
            <cylinderGeometry args={[0.32, 0.3, 0.2, 20, 1, true]} />
          </ToonPart>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ToonPart
              key={i}
              color={look.hatColor}
              position={[Math.sin((i / 6) * Math.PI * 2) * 0.3, 0.16, Math.cos((i / 6) * Math.PI * 2) * 0.3]}
              outline={0.015}
            >
              <coneGeometry args={[0.06, 0.16, 8]} />
            </ToonPart>
          ))}
        </group>
      );
    default:
      return null;
  }
};

/* ------------------------------------------------------------------ */
/* Character                                                            */
/* ------------------------------------------------------------------ */
export interface ToonCharacterProps {
  who: Exclude<CharacterId, 'none'>;
  position?: Vec3;
  rotationY?: number;
  scale?: number;
  pose: Pose;
  /** Previous pose to spring away from (defaults to idle). */
  fromPose?: Pose;
  expression: Expression;
  mouth?: Mouth;
  /** Look target in the same (set-local) space as `position`. */
  lookAt?: Vec3;
  /** Frames since this beat started. */
  localFrame: number;
  fps: number;
  /** Local frame at which the pose action fires (slam, plunger...). */
  actionFrame?: number;
  emote?: {type: EmoteType; frame: number} | null;
  rightHandItem?: React.ReactNode;
  leftHandItem?: React.ReactNode;
  seed?: number;
  /** Extra body tilt (radians, around Z) e.g. for squish gags. */
  tilt?: number;
}

export const ToonCharacter: React.FC<ToonCharacterProps> = ({
  who,
  position = [0, 0, 0],
  rotationY = 0,
  scale,
  pose,
  fromPose = 'idle',
  expression,
  mouth = 'closed',
  lookAt,
  localFrame,
  fps,
  actionFrame,
  emote,
  rightHandItem,
  leftHandItem,
  seed = 0,
  tilt = 0,
}) => {
  const look = LOOKS[who];
  const s = scale ?? look.scale;
  const t = localFrame / fps;

  // Pose entry: spring from previous pose (anticipation -> overshoot -> settle).
  const enter = spring({frame: localFrame, fps, config: {damping: 13, stiffness: 160, mass: 0.7}});
  const act =
    actionFrame === undefined
      ? enter
      : spring({frame: localFrame - actionFrame, fps, config: {damping: 9, stiffness: 260, mass: 0.5}});

  const A = poseTargets(fromPose, t, 1, seed);
  const B = poseTargets(pose, t, clamp01(act), seed);
  const mix = (a: Vec3, b: Vec3): THREE.Vector3 =>
    new THREE.Vector3(lerp(a[0], b[0], enter), lerp(a[1], b[1], enter), lerp(a[2], b[2], enter));

  const rh = mix(A.rh, B.rh);
  const lh = mix(A.lh, B.lh);
  const rf = mix(A.rf, B.rf);
  const lf = mix(A.lf, B.lf);
  const lean = lerp(A.lean, B.lean, enter);
  const bob = lerp(A.bob, B.bob, enter);
  const headPitchPose = lerp(A.headPitch, B.headPitch, enter);

  // Head look-at -> yaw/pitch in character space.
  let yaw = 0;
  let pitch = headPitchPose;
  if (lookAt) {
    const dx = lookAt[0] - position[0];
    const dz = lookAt[2] - position[2];
    const worldYaw = Math.atan2(dx, dz);
    let rel = worldYaw - rotationY;
    while (rel > Math.PI) rel -= Math.PI * 2;
    while (rel < -Math.PI) rel += Math.PI * 2;
    yaw = Math.max(-0.9, Math.min(0.9, rel));
    const dy = lookAt[1] - (position[1] + HEAD_Y * s);
    pitch += Math.max(-0.5, Math.min(0.45, -Math.atan2(dy, Math.hypot(dx, dz))));
  }
  // Small nod on the beat for life.
  const nod = Math.sin(t * 6 + seed) * 0.03;

  const faceTex = faceTexture(expression, mouth, !!look.mustache);
  const gradient = getToonGradient();

  // Upper body pivots at the hips.
  const upperRot = new THREE.Euler(lean, 0, tilt);
  const toUpper = (v: THREE.Vector3) => v; // hands live in upper-body space

  const emoteScale = emote
    ? spring({frame: localFrame - emote.frame, fps, config: {damping: 11, stiffness: 220, mass: 0.6}})
    : 0;

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={s}>
      {/* contact blob */}
      <FlatPart position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} color="#000000" transparent opacity={0.22}>
        <circleGeometry args={[0.5, 24]} />
      </FlatPart>

      {/* legs (hips -> feet) */}
      <BendyLimb from={HIP_R} to={rf} bend={new THREE.Vector3(0, 0, 1)} radius={0.085} color={look.limb} />
      <BendyLimb from={HIP_L} to={lf} bend={new THREE.Vector3(0, 0, 1)} radius={0.085} color={look.limb} />
      <ToonPart color={look.boot} position={[rf.x, rf.y, rf.z + 0.06]} scale={[1, 0.7, 1.4]} outline={0.025}>
        <sphereGeometry args={[0.11, 16, 12]} />
      </ToonPart>
      <ToonPart color={look.boot} position={[lf.x, lf.y, lf.z + 0.06]} scale={[1, 0.7, 1.4]} outline={0.025}>
        <sphereGeometry args={[0.11, 16, 12]} />
      </ToonPart>

      {/* upper body */}
      <group position={[0, 0.56 + bob, 0]} rotation={upperRot}>
        <group position={[0, -0.56, 0]}>
          {/* torso capsule */}
          <ToonPart color={look.body} position={[0, 1.0, 0]}>
            <capsuleGeometry args={[0.34, 0.4, 8, 24]} />
          </ToonPart>
          {look.sash ? (
            <ToonPart color={look.sash} position={[0, 1.02, 0.02]} rotation={[0, 0, 0.75]} outline={0.015}>
              <torusGeometry args={[0.36, 0.035, 8, 32, Math.PI]} />
            </ToonPart>
          ) : null}
          {look.medals
            ? [0, 1, 2].map((i) => (
                <ToonPart
                  key={i}
                  color="#ffcc33"
                  emissive="#7a5200"
                  emissiveIntensity={0.25}
                  position={[0.1 + i * 0.075, 1.2 - (i % 2) * 0.02, 0.335]}
                  rotation={[Math.PI / 2, 0, 0]}
                  outline={0.012}
                >
                  <cylinderGeometry args={[0.035, 0.035, 0.015, 14]} />
                </ToonPart>
              ))
            : null}
          {/* belt */}
          <ToonPart color="#2b211b" position={[0, 0.72, 0]} outline={0.015}>
            <cylinderGeometry args={[0.345, 0.345, 0.07, 24]} />
          </ToonPart>

          {/* arms (shoulders -> hand targets) */}
          <BendyLimb from={SHOULDER_R} to={toUpper(rh)} bend={new THREE.Vector3(-1, -0.4, -0.6)} radius={0.075} color={look.limb} />
          <BendyLimb from={SHOULDER_L} to={toUpper(lh)} bend={new THREE.Vector3(1, -0.4, -0.6)} radius={0.075} color={look.limb} />
          <ToonPart color={look.hand} position={rh.toArray() as Vec3} outline={0.025}>
            <sphereGeometry args={[0.1, 16, 12]} />
          </ToonPart>
          <ToonPart color={look.hand} position={lh.toArray() as Vec3} outline={0.025}>
            <sphereGeometry args={[0.1, 16, 12]} />
          </ToonPart>

          {/* SOCKETS: props are children of the hand so they can never float or drift. */}
          <group name="rightHandSocket" position={rh.toArray() as Vec3}>
            {rightHandItem}
          </group>
          <group name="leftHandSocket" position={lh.toArray() as Vec3}>
            {leftHandItem}
          </group>

          {/* head */}
          <group position={[0, HEAD_Y - 0.25, 0]} rotation={[pitch + nod, yaw, 0]}>
            <group position={[0, 0.25, 0]}>
              <ToonPart color="#ffffff">
                <sphereGeometry args={[HEAD_R, 40, 28]} />
              </ToonPart>
              {/* face decal: thin curved patch, polygonOffset to avoid z-fighting */}
              <mesh renderOrder={2}>
                <sphereGeometry
                  args={[HEAD_R * 1.004, 32, 24, Math.PI / 2 - 0.95, 1.9, Math.PI / 2 - 0.95, 1.75]}
                />
                <meshToonMaterial
                  map={faceTex}
                  gradientMap={gradient}
                  transparent
                  alphaTest={0.4}
                  polygonOffset
                  polygonOffsetFactor={-2}
                  polygonOffsetUnits={-2}
                />
              </mesh>
              <group position={[0, -HEAD_Y, 0]}>
                <HatMesh look={look} />
              </group>
              {/* ears for readability on profile shots */}
              <ToonPart color="#ffffff" position={[-HEAD_R * 0.98, 0, 0]} outline={0.02}>
                <sphereGeometry args={[0.08, 12, 10]} />
              </ToonPart>
              <ToonPart color="#ffffff" position={[HEAD_R * 0.98, 0, 0]} outline={0.02}>
                <sphereGeometry args={[0.08, 12, 10]} />
              </ToonPart>
            </group>
          </group>

          {/* emote billboard */}
          {emote && emoteScale > 0.001 ? (
            <Billboard position={[0.55, HEAD_Y + 0.5, 0.1]}>
              <mesh scale={0.62 * emoteScale} renderOrder={5}>
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial map={emoteTexture(emote.type)} transparent alphaTest={0.3} toneMapped={false} />
              </mesh>
            </Billboard>
          ) : null}
        </group>
      </group>
    </group>
  );
};
