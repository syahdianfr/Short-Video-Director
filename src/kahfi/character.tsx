import React, {useMemo} from 'react';
import * as THREE from 'three';
import {spring} from 'remotion';
import {ToonPart, FlatPart, getToonGradient, clamp01, lerp} from '../lib/toon';
import {kahfiFaceTexture, type KahfiExpression, type KahfiMouth} from './faces';
import {NurFace} from './NurFace';
import {TIER, LIP_SYNC_ALLOWED, type KahfiCharId, type KahfiPose, type Vec3} from './types';

/* ------------------------------------------------------------------ */
/* Rig constants. Character-local space: feet at y=0, facing +Z.       */
/* "right" is the character's anatomical right, which is -X.           */
/*                                                                     */
/* Head diameter 0.72, body (feet to chin) 1.87 => head:body = 1:2.6,  */
/* inside the 1:2.5 - 1:3 chibi range the series bible fixes.          */
/* ------------------------------------------------------------------ */
export const HEAD_R = 0.36;
export const HEAD_Y = 2.23;
const SHOULDER_Y = 1.72;
const HIP_Y = 0.86;
const SHOULDER_R = new THREE.Vector3(-0.27, SHOULDER_Y, 0.02);
const SHOULDER_L = new THREE.Vector3(0.27, SHOULDER_Y, 0.02);
const HIP_R = new THREE.Vector3(-0.13, HIP_Y, 0);
const HIP_L = new THREE.Vector3(0.13, HIP_Y, 0);

type Headwear = 'imamah' | 'kopiah_rajut' | 'kain_kepala' | 'helm_ringan' | 'mahkota_laurel' | 'none';

interface KahfiLook {
  /** Inner robe (gamis / thobe / tunic). */
  gamis: string;
  /** Outer open robe. Omit for characters who wear none. */
  jubah?: string;
  skin: string;
  sandal: string;
  belt?: string;
  headwear: Headwear;
  headwearColor: string;
  headwearAccent?: string;
  beard?: boolean;
  /** Overall scale. The youngest youth and the Observer read slightly smaller. */
  scale: number;
}

/**
 * Character palette, fixed by the series bible. These values are continuity:
 * they must be identical in Part 2 and Part 3.
 *
 * Skin tones vary by origin without caricature. The opponents are NOT given
 * uglier faces or exaggerated features — their arrogance is carried by the
 * purple robe, the gold trim, the low camera angle and the hard gold key light.
 */
export const LOOKS_KAHFI: Record<Exclude<KahfiCharId, 'none'>, KahfiLook> = {
  /* ---- T2: the youths of the cave. Faces are always Nur. ---- */
  pemuda_tegak: {gamis: '#E8DCC8', jubah: '#8B6F47', skin: '#C68642', sandal: '#5C4033', belt: '#5C4033', headwear: 'imamah', headwearColor: '#E8DCC8', scale: 1},
  pemuda_muda: {gamis: '#6B7A4F', skin: '#A9714B', sandal: '#5C4033', headwear: 'kain_kepala', headwearColor: '#8A9A7A', scale: 0.92},
  /* Faded indigo, lifted from the series bible's #4A5A6B. The original read
     as near-black against the saturated gold of the hook, where this character
     carries the opening shot. Same hue, enough value to survive the key. */
  pemuda_berbekal: {gamis: '#7C8DA2', jubah: '#5E6E82', skin: '#8D5524', sandal: '#5C4033', belt: '#6B4423', headwear: 'imamah', headwearColor: '#7C8DA2', scale: 1.02},
  figuran_kahfi: {gamis: '#D6CCB8', skin: '#A9714B', sandal: '#5C4033', headwear: 'kain_kepala', headwearColor: '#C2B9A4', scale: 0.97},

  /* ---- T3: anonymous opponents and townspeople ---- */
  pembesar_kota: {gamis: '#3B0764', jubah: '#581C87', skin: '#C68642', sandal: '#2A1B3D', belt: '#F59E0B', headwear: 'mahkota_laurel', headwearColor: '#F59E0B', beard: true, scale: 1.04},
  kepala_pengawal: {gamis: '#4B5563', skin: '#A9714B', sandal: '#1F2937', belt: '#1F2937', headwear: 'helm_ringan', headwearColor: '#9CA3AF', beard: true, scale: 1.02},
  pedagang_patung: {gamis: '#92400E', skin: '#C68642', sandal: '#5C4033', belt: '#78350F', headwear: 'kain_kepala', headwearColor: '#78350F', beard: true, scale: 0.98},
  warga_kota: {gamis: '#7C2D12', skin: '#A9714B', sandal: '#5C4033', headwear: 'kain_kepala', headwearColor: '#57534E', scale: 0.98},

  /* ---- T3: the Observer. Present-day, santri-styled, chibi. ---- */
  fadhil: {gamis: '#F8FAFC', skin: '#C68642', sandal: '#334155', headwear: 'kopiah_rajut', headwearColor: '#64748B', scale: 0.9},

  /* ---- Animal. Handled by its own component; this entry keeps the map total. ---- */
  anjing: {gamis: '#B5894F', skin: '#B5894F', sandal: '#8A6A3A', headwear: 'none', headwearColor: '#B5894F', scale: 1},
};

/* ------------------------------------------------------------------ */
/* Pose library                                                        */
/* ------------------------------------------------------------------ */
interface Targets {
  /** Hand targets, character-local. */
  rh: Vec3;
  lh: Vec3;
  /** Foot targets. */
  rf: Vec3;
  lf: Vec3;
  /** Forward lean of the upper body, radians. */
  lean: number;
  /** Vertical bob of the upper body. */
  bob: number;
  /** Extra head pitch, radians. Positive looks down. */
  headPitch: number;
  /** Chin lift, applied on top of headPitch. Negative lifts the chin. */
  rootY: number;
  /**
   * Pitch of the WHOLE body around X, radians. Negative reclines backward.
   * `lean` only bends the torso at the hips, which is not enough for a figure
   * that lies down or prostrates: without this the body folds forward at the
   * waist and reads as collapsing face-first.
   */
  tilt?: number;
  /** Walk phase driver: 0 disables the gait, >0 is frames per step. */
  stepFrames?: number;
}

const REST: Targets = {
  rh: [-0.42, 1.08, 0.1],
  lh: [0.42, 1.08, 0.1],
  rf: [-0.14, 0.07, 0.03],
  lf: [0.14, 0.07, 0.03],
  lean: 0,
  bob: 0,
  headPitch: 0,
  rootY: 0,
};

/**
 * The nine body-language presets, plus a few character-specific actions.
 *
 * For a T2 figure this is the ONLY emotional channel there is: no face, no
 * mouth. So each preset has to read unambiguously in silhouette.
 *
 * `t` is seconds into the beat, `a` is 0..1 action progress from a spring.
 */
const poseTargets = (pose: KahfiPose, t: number, a: number, seed: number): Targets => {
  const s = Math.sin;
  const breathe = s(t * 2.2 + seed) * 0.013;
  const base: Targets = {...REST, rh: [...REST.rh] as Vec3, lh: [...REST.lh] as Vec3, bob: breathe};

  switch (pose) {
    case 'idle':
      return base;

    /* chest up, chin slightly raised, shoulders open */
    case 'tegar':
      return {...base, rh: [-0.46, 1.04, 0.06], lh: [0.46, 1.04, 0.06], lean: -0.07, rootY: -0.11, bob: breathe * 0.6};

    /* head slightly lowered, one hand on the chest */
    case 'tawadhu':
      return {...base, rh: [-0.12, 1.42, 0.3], lh: [0.4, 1.0, 0.08], lean: 0.05, headPitch: 0.2};

    /* both palms raised and open in front of the chest */
    case 'berdoa':
      return {
        ...base,
        rh: [-0.2, 1.46 + 0.012 * s(t * 1.8 + seed), 0.42],
        lh: [0.2, 1.46 + 0.012 * s(t * 1.8 + seed + 1), 0.42],
        lean: 0.04,
        headPitch: 0.26,
      };

    /* forehead, hands, knees and toes down; back level */
    case 'sujud':
      return {
        ...base,
        rh: [-0.3, 0.1, 0.72],
        lh: [0.3, 0.1, 0.72],
        rf: [-0.14, 0.06, -0.3],
        lf: [0.14, 0.06, -0.3],
        tilt: 0.9,
        lean: 0.4,
        bob: -0.78,
        headPitch: 0.35,
      };

    /* both hands offering forward, torso slightly ahead */
    case 'memberi':
      return {...base, rh: [-0.3, 1.2, 0.68], lh: [0.3, 1.2, 0.68], lean: 0.1, headPitch: 0.12};

    case 'menahan_sakit':
      return {...base, rh: [-0.34, 0.92, 0.1], lh: [0.34, 0.92, 0.1], lean: 0.14, headPitch: 0.34, bob: -0.05};

    case 'memeluk':
      return {...base, rh: [-0.1, 1.24, 0.46], lh: [0.1, 1.24, 0.46], lean: 0.06};

    case 'berjalan_mantap': {
      const p = (t * 30 * Math.PI * 2) / 18 + seed; /* 18 frames per step */
      return {
        ...base,
        stepFrames: 18,
        rf: [-0.14, 0.07 + Math.max(0, 0.11 * s(p)), 0.03 + 0.2 * s(p)],
        lf: [0.14, 0.07 + Math.max(0, -0.11 * s(p)), 0.03 - 0.2 * s(p)],
        rh: [-0.42, 1.06, 0.1 - 0.2 * s(p)],
        lh: [0.42, 1.06, 0.1 + 0.2 * s(p)],
        bob: 0.035 * Math.abs(s(p)),
        lean: -0.02,
      };
    }

    case 'berlari_tergesa': {
      const p = (t * 30 * Math.PI * 2) / 11 + seed; /* 11 frames per step */
      return {
        ...base,
        stepFrames: 11,
        rf: [-0.14, 0.09 + Math.max(0, 0.2 * s(p)), 0.05 + 0.3 * s(p)],
        lf: [0.14, 0.09 + Math.max(0, -0.2 * s(p)), 0.05 - 0.3 * s(p)],
        rh: [-0.4, 1.14, 0.12 - 0.34 * s(p)],
        lh: [0.4, 1.14, 0.12 + 0.34 * s(p)],
        bob: 0.055 * Math.abs(s(p)),
        lean: 0.21,
      };
    }

    /* Settled back against the cave wall: the sleep at the end of Part 1.
       Reclining is a NEGATIVE tilt of the whole body; `lean` alone would
       fold the figure forward at the waist. Legs come forward, the head
       tips back, and the breathing slows right down. */
    case 'merebah':
      return {
        ...base,
        /* Hands fall into the lap and the knees come up: a body that has
           given out sitting against a wall. Spread limbs read as collapse,
           which is the wrong note for the beat — they are asleep, safe. */
        rh: [-0.28, 0.74, 0.36],
        lh: [0.28, 0.74, 0.3],
        rf: [-0.17, 0.26, 0.88],
        lf: [0.17, 0.23, 0.78],
        tilt: -0.46,
        lean: 0.24,
        bob: -0.44 + 0.007 * s(t * 1.1 + seed),
        /* Chin down on the chest, not thrown back. */
        headPitch: 0.3,
      };

    case 'berjongkok':
      return {...base, rh: [-0.26, 0.6, 0.3], lh: [0.3, 0.52, 0.12], rf: [-0.16, 0.07, 0.24], lf: [0.16, 0.07, 0.24], bob: -0.48, lean: 0.18, headPitch: 0.1};

    case 'menunjuk_satu':
      return {...base, rh: [-0.24, 2.06, 0.18], lh: [0.42, 1.02, 0.06], lean: -0.06, rootY: -0.08};

    case 'memahat':
      return {
        ...base,
        rh: [-0.06 + 0.05 * s(t * 13), 1.0 + 0.04 * Math.cos(t * 13), 0.52],
        lh: [0.2, 0.9, 0.56],
        lean: 0.16,
        headPitch: 0.26,
      };

    case 'menancap':
      return {...base, rh: [lerp(-0.34, -0.22, a), lerp(1.7, 1.1, a), lerp(0.3, 0.46, a)], lh: [0.42, 1.0, 0.08], lean: 0.1 * a};

    case 'memegang_mangkuk':
      return {...base, rh: [-0.2, 1.22, 0.5], lh: [0.2, 1.22, 0.5], lean: 0.03, headPitch: 0.14};

    case 'menaungi':
      return {...base, rh: [-0.16, 1.2, 0.5], lh: [0.14, 1.52, 0.46], lean: 0.05, headPitch: 0.2};

    default:
      return base;
  }
};

/* ------------------------------------------------------------------ */
/* Bendy limb: a tapering tube from joint to target.                   */
/* ------------------------------------------------------------------ */
const q = (v: number) => Math.round(v * 200) / 200;

const Limb: React.FC<{from: THREE.Vector3; to: THREE.Vector3; bend: THREE.Vector3; radius: number; color: string}> = ({
  from,
  to,
  bend,
  radius,
  color,
}) => {
  const key = [from, to, bend].map((v) => `${q(v.x)},${q(v.y)},${q(v.z)}`).join('|') + `|${radius}`;
  const geo = useMemo(() => {
    const len = from.distanceTo(to);
    const slack = Math.max(0, 0.8 - len) * 0.55 + 0.035;
    const mid = from.clone().lerp(to, 0.5).add(bend.clone().normalize().multiplyScalar(slack));
    const curve = new THREE.CatmullRomCurve3([from.clone(), mid, to.clone()], false, 'centripetal');
    return new THREE.TubeGeometry(curve, 16, radius, 8, false);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return <ToonPart geometry={geo} color={color} />;
};

/* ------------------------------------------------------------------ */
/* Robes. LatheGeometry profiles that widen toward the hem.            */
/* ------------------------------------------------------------------ */

/** Inner robe: shoulders down to the ankle, flaring out. */
const gamisGeometry = (() => {
  let cached: THREE.LatheGeometry | null = null;
  return () => {
    if (cached) return cached;
    /* Points ascend in y. LatheGeometry winds its faces from the point order,
       so a descending profile turns the normals inward and the robe renders
       black however it is lit. */
    const pts = [
      new THREE.Vector2(0.47, 0.12),
      new THREE.Vector2(0.49, 0.14),
      new THREE.Vector2(0.45, 0.34),
      new THREE.Vector2(0.38, 0.72),
      new THREE.Vector2(0.33, 1.1),
      new THREE.Vector2(0.3, 1.45),
      new THREE.Vector2(0.26, SHOULDER_Y + 0.02),
      new THREE.Vector2(0.001, SHOULDER_Y + 0.08),
    ];
    cached = new THREE.LatheGeometry(pts, 28);
    return cached;
  };
})();

/** Outer robe: an open mantle, so it reads as a second layer in silhouette. */
const jubahGeometry = (() => {
  let cached: THREE.LatheGeometry | null = null;
  return () => {
    if (cached) return cached;
    const pts = [
      new THREE.Vector2(0.55, 0.28),
      new THREE.Vector2(0.53, 0.36),
      new THREE.Vector2(0.46, 0.7),
      new THREE.Vector2(0.4, 1.1),
      new THREE.Vector2(0.36, 1.5),
      new THREE.Vector2(0.3, SHOULDER_Y + 0.06),
    ];
    /* thetaStart / thetaLength leave the front open */
    cached = new THREE.LatheGeometry(pts, 24, Math.PI * 0.22, Math.PI * 1.56);
    return cached;
  };
})();

/** The hem skirt, swayed separately so it lags the body: delayed secondary motion. */
const hemGeometry = (() => {
  let cached: THREE.LatheGeometry | null = null;
  return () => {
    if (cached) return cached;
    const pts = [
      new THREE.Vector2(0.5, 0.08),
      new THREE.Vector2(0.52, 0.1),
      new THREE.Vector2(0.5, 0.2),
      new THREE.Vector2(0.45, 0.34),
    ];
    cached = new THREE.LatheGeometry(pts, 28);
    return cached;
  };
})();

/* ------------------------------------------------------------------ */
/* Headwear                                                            */
/* ------------------------------------------------------------------ */
const Headgear: React.FC<{look: KahfiLook; phase: number}> = ({look, phase}) => {
  switch (look.headwear) {
    case 'imamah': {
      /* Stacked torus wraps, plus a tail that lags the walk cycle by 1.0 rad. */
      const tailSway = Math.sin(phase - 1.0) * 0.1;
      const tailGeo = (() => {
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.18, HEAD_Y + 0.3, -0.2),
          new THREE.Vector3(0.3 + tailSway, HEAD_Y - 0.14, -0.3),
          new THREE.Vector3(0.26 + tailSway * 1.8, HEAD_Y - 0.56, -0.26),
        ]);
        return new THREE.TubeGeometry(curve, 14, 0.055, 8, false);
      })();
      return (
        <group>
          {/* The wraps sit ON TOP of the head, not around it. A turban that
              wrapped the brow would cross in front of the Nur disc on any low
              angle and read as a smear across the light. */}
          <ToonPart color={look.headwearColor} position={[0, HEAD_Y + 0.3, -0.03]} rotation={[Math.PI / 2, 0, 0.12]}>
            <torusGeometry args={[0.235, 0.085, 10, 26]} />
          </ToonPart>
          <ToonPart color={look.headwearColor} position={[0, HEAD_Y + 0.43, -0.04]} rotation={[Math.PI / 2, 0, -0.1]} outline={0.025}>
            <torusGeometry args={[0.185, 0.075, 10, 24]} />
          </ToonPart>
          <ToonPart geometry={tailGeo} color={look.headwearColor} outline={0.025} />
        </group>
      );
    }
    case 'kopiah_rajut':
      return (
        <ToonPart color={look.headwearColor} position={[0, HEAD_Y + 0.26, -0.01]} scale={[1, 1, 0.9]}>
          <cylinderGeometry args={[0.28, 0.31, 0.2, 24]} />
        </ToonPart>
      );
    case 'kain_kepala': {
      /* A simple head cloth: an open lathe hood falling to the shoulders. */
      const geo = (() => {
        const pts = [
          new THREE.Vector2(0.4, HEAD_Y - 0.4),
          new THREE.Vector2(0.42, HEAD_Y - 0.34),
          new THREE.Vector2(0.38, HEAD_Y - 0.02),
          new THREE.Vector2(0.26, HEAD_Y + 0.26),
          new THREE.Vector2(0.02, HEAD_Y + 0.38),
        ];
        return new THREE.LatheGeometry(pts, 24, Math.PI * 0.3, Math.PI * 1.4);
      })();
      return <ToonPart geometry={geo} color={look.headwearColor} />;
    }
    case 'helm_ringan':
      return (
        <ToonPart color={look.headwearColor} position={[0, HEAD_Y + 0.02, 0]}>
          <sphereGeometry args={[HEAD_R * 1.1, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
        </ToonPart>
      );
    case 'mahkota_laurel':
      return (
        <group position={[0, HEAD_Y + 0.26, 0]}>
          <ToonPart color={look.headwearColor} emissive="#7A5200" emissiveIntensity={0.18} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.3, 0.035, 8, 26]} />
          </ToonPart>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <ToonPart
                key={i}
                color={look.headwearColor}
                position={[Math.sin(a) * 0.3, 0.05, Math.cos(a) * 0.3]}
                rotation={[0.5, a, 0]}
                outline={0.012}
                scale={[1, 1, 0.4]}
              >
                <sphereGeometry args={[0.055, 10, 8]} />
              </ToonPart>
            );
          })}
        </group>
      );
    default:
      return null;
  }
};

/* ------------------------------------------------------------------ */
/* Character                                                           */
/* ------------------------------------------------------------------ */
export interface ChibiCharacterProps {
  who: Exclude<KahfiCharId, 'none'>;
  position?: Vec3;
  rotationY?: number;
  scale?: number;
  pose: KahfiPose;
  fromPose?: KahfiPose;
  /** T3 only. Silently ignored for T2, whose face has no expression channel. */
  expression?: KahfiExpression;
  /** T3 only, and only for characters in LIP_SYNC_ALLOWED. */
  mouth?: KahfiMouth;
  lipSync?: boolean;
  lookAt?: Vec3;
  /** Absolute frame. Drives the Nur pulse and every deterministic offset. */
  frame: number;
  /** Frames since this beat started. Drives pose springs and gait phase. */
  localFrame: number;
  fps: number;
  actionFrame?: number;
  rightHandItem?: React.ReactNode;
  leftHandItem?: React.ReactNode;
  seed?: number;
}

export const ChibiCharacter: React.FC<ChibiCharacterProps> = ({
  who,
  position = [0, 0, 0],
  rotationY = 0,
  scale,
  pose,
  fromPose = 'idle',
  expression = 'neutral',
  mouth = 'closed',
  lipSync = false,
  lookAt,
  frame,
  localFrame,
  fps,
  actionFrame,
  rightHandItem,
  leftHandItem,
  seed = 0,
}) => {
  const look = LOOKS_KAHFI[who];
  const tier = TIER[who];
  const s = scale ?? look.scale;
  const t = localFrame / fps;

  /* ---- ADAB GATE ----------------------------------------------------
     A T2 figure can never be lip-synced and can never carry an
     expression, whatever the beat data asks for. The gate lives here,
     in the rig, so a mistake in the beat table cannot produce a
     forbidden frame. Only the Observer passes.                        */
  const isNur = tier === 'T2';
  const mayLipSync = !isNur && lipSync && LIP_SYNC_ALLOWED.includes(who);
  const effMouth: KahfiMouth = mayLipSync ? mouth : 'closed';

  /* Pose entry spring: anticipation, overshoot, settle. */
  const enter = spring({frame: localFrame, fps, config: {damping: 13, stiffness: 160, mass: 0.7}});
  const act =
    actionFrame === undefined ? enter : spring({frame: localFrame - actionFrame, fps, config: {damping: 9, stiffness: 250, mass: 0.5}});

  const A = poseTargets(fromPose, t, 1, seed);
  const B = poseTargets(pose, t, clamp01(act), seed);
  const mix = (a: Vec3, b: Vec3) => new THREE.Vector3(lerp(a[0], b[0], enter), lerp(a[1], b[1], enter), lerp(a[2], b[2], enter));

  const rh = mix(A.rh, B.rh);
  const lh = mix(A.lh, B.lh);
  const rf = mix(A.rf, B.rf);
  const lf = mix(A.lf, B.lf);
  const lean = lerp(A.lean, B.lean, enter);
  const bob = lerp(A.bob, B.bob, enter);
  const rootY = lerp(A.rootY, B.rootY, enter);
  const tilt = lerp(A.tilt ?? 0, B.tilt ?? 0, enter);
  const headPitchPose = lerp(A.headPitch, B.headPitch, enter);

  /* Gait phase. Robes and the imamah tail lag it, so cloth follows the body. */
  const stepFrames = B.stepFrames ?? 0;
  const phase = stepFrames > 0 ? (localFrame * Math.PI * 2) / stepFrames + seed : seed;
  const hemSway = stepFrames > 0 ? Math.sin(phase - 0.6) * 0.055 : Math.sin(frame * 0.03 + seed) * 0.008;

  /* Head aim. */
  let yaw = 0;
  let pitch = headPitchPose + rootY;
  if (lookAt) {
    const dx = lookAt[0] - position[0];
    const dz = lookAt[2] - position[2];
    let rel = Math.atan2(dx, dz) - rotationY;
    while (rel > Math.PI) rel -= Math.PI * 2;
    while (rel < -Math.PI) rel += Math.PI * 2;
    yaw = Math.max(-0.9, Math.min(0.9, rel));
    const dy = lookAt[1] - (position[1] + HEAD_Y * s);
    pitch += Math.max(-0.5, Math.min(0.45, -Math.atan2(dy, Math.hypot(dx, dz))));
  }
  const nod = Math.sin(t * 5.5 + seed) * 0.022;

  const gradient = getToonGradient();
  const faceTex = isNur ? null : kahfiFaceTexture(expression, effMouth, !!look.beard);

  return (
    <group position={position} rotation={[tilt, rotationY, 0]} scale={s}>
      {/* contact shadow */}
      <FlatPart position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} color="#000000" transparent opacity={0.2}>
        <circleGeometry args={[0.46, 22]} />
      </FlatPart>

      {/* legs. Mostly hidden by the robe; they carry the walk read at the ankles. */}
      <Limb from={HIP_R} to={rf} bend={new THREE.Vector3(0, 0, 1)} radius={0.07} color={look.skin} />
      <Limb from={HIP_L} to={lf} bend={new THREE.Vector3(0, 0, 1)} radius={0.07} color={look.skin} />
      <ToonPart color={look.sandal} position={[rf.x, rf.y - 0.02, rf.z + 0.05]} scale={[1, 0.34, 1.5]} outline={0.02}>
        <sphereGeometry args={[0.1, 14, 10]} />
      </ToonPart>
      <ToonPart color={look.sandal} position={[lf.x, lf.y - 0.02, lf.z + 0.05]} scale={[1, 0.34, 1.5]} outline={0.02}>
        <sphereGeometry args={[0.1, 14, 10]} />
      </ToonPart>

      {/* upper body pivots at the hips */}
      <group position={[0, HIP_Y + bob, 0]} rotation={[lean, 0, 0]}>
        <group position={[0, -HIP_Y, 0]}>
          {/* inner robe */}
          <ToonPart geometry={gamisGeometry()} color={look.gamis} />
          {/* hem, swayed with a delay so the cloth trails the step */}
          <group rotation={[hemSway, 0, hemSway * 0.5]}>
            <ToonPart geometry={hemGeometry()} color={look.gamis} outline={0.028} />
          </group>
          {look.jubah ? <ToonPart geometry={jubahGeometry()} color={look.jubah} /> : null}
          {look.belt ? (
            <ToonPart color={look.belt} position={[0, 1.28, 0]} rotation={[Math.PI / 2, 0, 0]} outline={0.015}>
              <torusGeometry args={[0.305, 0.04, 8, 24]} />
            </ToonPart>
          ) : null}

          {/* arms */}
          <Limb from={SHOULDER_R} to={rh} bend={new THREE.Vector3(-1, -0.4, -0.5)} radius={0.062} color={look.gamis} />
          <Limb from={SHOULDER_L} to={lh} bend={new THREE.Vector3(1, -0.4, -0.5)} radius={0.062} color={look.gamis} />
          <ToonPart color={look.skin} position={rh.toArray() as Vec3} outline={0.022}>
            <sphereGeometry args={[0.085, 14, 10]} />
          </ToonPart>
          <ToonPart color={look.skin} position={lh.toArray() as Vec3} outline={0.022}>
            <sphereGeometry args={[0.085, 14, 10]} />
          </ToonPart>

          {/* hand sockets: props are children of the hand so they cannot drift */}
          <group name="rightHandSocket" position={rh.toArray() as Vec3}>
            {rightHandItem}
          </group>
          <group name="leftHandSocket" position={lh.toArray() as Vec3}>
            {leftHandItem}
          </group>

          {/* head */}
          <group position={[0, HEAD_Y - 0.22, 0]} rotation={[pitch + nod, yaw, 0]}>
            <group position={[0, 0.22, 0]}>
              <ToonPart color={look.skin}>
                <sphereGeometry args={[HEAD_R, 34, 24]} />
              </ToonPart>

              {isNur ? (
                /* T2: the whole front of the head is a disc of light. */
                <NurFace headRadius={HEAD_R} frame={frame} seed={seed} />
              ) : (
                /* T3: a curved face patch, swapped as a whole texture. */
                <mesh renderOrder={2}>
                  <sphereGeometry args={[HEAD_R * 1.005, 28, 20, Math.PI / 2 - 0.95, 1.9, Math.PI / 2 - 0.95, 1.75]} />
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
              )}

              <group position={[0, -HEAD_Y, 0]}>
                <Headgear look={look} phase={phase} />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* The dog. An animal, not a tiered figure: no face atlas, no emotes,  */
/* no name, and never anthropomorphised.                               */
/* ------------------------------------------------------------------ */
export const Anjing: React.FC<{position?: Vec3; rotationY?: number; scale?: number; frame: number; walking?: boolean; seed?: number}> = ({
  position = [0, 0, 0],
  rotationY = 0,
  scale = 1,
  frame,
  walking = false,
  seed = 0,
}) => {
  const look = LOOKS_KAHFI.anjing;
  const p = walking ? (frame * Math.PI * 2) / 12 + seed : seed;
  const legY = (o: number) => (walking ? 0.2 + Math.max(0, 0.07 * Math.sin(p + o)) : 0.2);
  const legZ = (o: number) => (walking ? 0.12 * Math.sin(p + o) : 0);
  const bob = walking ? 0.016 * Math.abs(Math.sin(p * 2)) : 0.006 * Math.sin(frame * 0.05 + seed);

  const tailGeo = useMemo(() => {
    const sway = Math.sin(frame * 0.12 + seed) * 0.1;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.52, -0.36),
      new THREE.Vector3(sway, 0.64, -0.52),
      new THREE.Vector3(sway * 1.6, 0.7, -0.66),
    ]);
    return new THREE.TubeGeometry(curve, 10, 0.035, 6, false);
  }, [frame, seed]);

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <FlatPart position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} color="#000000" transparent opacity={0.18}>
        <circleGeometry args={[0.4, 18]} />
      </FlatPart>
      <group position={[0, bob, 0]}>
        {/* body */}
        <ToonPart color={look.gamis} position={[0, 0.46, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.16, 0.42, 6, 18]} />
        </ToonPart>
        {/* head and muzzle */}
        <group position={[0, 0.56, 0.4]}>
          <ToonPart color={look.gamis}>
            <sphereGeometry args={[0.16, 22, 16]} />
          </ToonPart>
          <ToonPart color={look.sandal} position={[0, -0.03, 0.14]} rotation={[Math.PI / 2, 0, 0]} outline={0.02}>
            <coneGeometry args={[0.08, 0.16, 14]} />
          </ToonPart>
          {/* ears */}
          {[-1, 1].map((sx) => (
            <ToonPart key={sx} color={look.sandal} position={[sx * 0.12, 0.12, -0.02]} rotation={[0, 0, sx * 0.4]} scale={[0.5, 1, 0.3]} outline={0.015}>
              <sphereGeometry args={[0.09, 10, 8]} />
            </ToonPart>
          ))}
          {/* eyes: two plain dots. No expression system. */}
          {[-1, 1].map((sx) => (
            <FlatPart key={sx} color="#1F2937" position={[sx * 0.07, 0.03, 0.145]}>
              <circleGeometry args={[0.022, 10]} />
            </FlatPart>
          ))}
        </group>
        {/* legs */}
        {([
          [-0.11, 0.26, 0],
          [0.11, 0.26, Math.PI],
          [-0.11, -0.24, Math.PI],
          [0.11, -0.24, 0],
        ] as const).map(([x, z, o], i) => (
          <ToonPart key={i} color={look.gamis} position={[x, legY(o), z + legZ(o)]} outline={0.018}>
            <capsuleGeometry args={[0.035, 0.26, 4, 10]} />
          </ToonPart>
        ))}
        <ToonPart geometry={tailGeo} color={look.gamis} outline={0.018} />
      </group>
    </group>
  );
};
