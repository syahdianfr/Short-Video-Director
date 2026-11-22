import React from 'react';
import type {KahfiMood} from './types';

/**
 * Nur — the light of a T2 face, and the only light that may stand for the
 * presence of a T1 figure. It is never used for an antagonist, for a power
 * effect, or for anything magical.
 *
 * These two values are referenced by NurFace and by nothing else. Grep for
 * them before shipping: any other owner is an adab defect.
 */
export const NUR_CORE = '#FFF7D6';
export const NUR_HALO = '#FEF3C7';
/** Reserved for an off-frame T1 presence. Unused in Part 1 — no T1 figure appears. */
export const NUR_PRESENCE = '#FFFBEB';

/**
 * Derived tokens. These exist so that grepping for NUR_CORE / NUR_HALO /
 * NUR_PRESENCE returns ONLY genuine Nur usage and the adab audit stays
 * trustworthy. Stars, dust and on-screen text are none of the things the
 * rule forbids, but sharing a hex with the Nur made the grep useless.
 */
/** Dust motes catching the Nur inside the cave. Allowed: it IS the Nur, scattered. */
export const MOTE_WARM = '#FBEBC4';
/** Cool motes and stars at night. Nothing to do with the Nur. */
export const MOTE_COOL = '#EDF3FF';
/** Parchment white for on-screen text. UI, not light in the world. */
export const UI_PARCHMENT = '#FDF8EC';

interface MoodRig {
  /** Sky / clear colour. */
  bg: string;
  ambient: string;
  ambientI: number;
  key: string;
  keyI: number;
  keyPos: [number, number, number];
  /** Rim light, placed opposite the key. */
  rim: string;
  rimI: number;
  /** [colour, near, far]. Nur materials opt out of fog, so it never dims a face. */
  fog?: [string, number, number];
  /** Warm point light standing in for a torch or an ember bowl. */
  fire?: {color: string; intensity: number; pos: [number, number, number]};
  /** Ground colour used by the sets that draw their own floor. */
  ground: string;
}

/**
 * The series' fixed emotional palette. Seven moods from the bible, plus
 * `fajar_awal` which is a transitional half-step into `fajar_keemasan`
 * (used on the two beats where the reveal turns, before full dawn).
 *
 * `emas_keras` deliberately avoids #FDE68A: that value sits too close to
 * NUR_CORE and would read as reverence on an antagonist.
 */
export const KAHFI_MOODS: Record<KahfiMood, MoodRig> = {
  emas_keras: {
    bg: '#F59E0B',
    ambient: '#FFE9BC',
    ambientI: 0.78,
    key: '#FFD48A',
    keyI: 3.1,
    keyPos: [5, 9, 5],
    rim: '#B45309',
    rimI: 0.9,
    fog: ['#B45309', 16, 64],
    ground: '#C98B3A',
  },
  senja_jingga: {
    bg: '#EA580C',
    ambient: '#FDBA74',
    ambientI: 0.82,
    key: '#FB923C',
    keyI: 2.1,
    keyPos: [4, 5, 6],
    rim: '#7C2D12',
    rimI: 1.0,
    fog: ['#7C2D12', 14, 58],
    ground: '#9A4B1B',
  },
  biru_malam: {
    bg: '#0F172A',
    ambient: '#1E3A8A',
    ambientI: 0.5,
    key: '#6E8FD8',
    keyI: 0.75,
    keyPos: [-5, 8, 3],
    rim: '#3B82F6',
    rimI: 0.55,
    fog: ['#0F172A', 8, 44],
    ground: '#162238',
  },
  merah_krisis: {
    bg: '#7F1D1D',
    ambient: '#7F1D1D',
    ambientI: 0.34,
    key: '#DC2626',
    keyI: 1.0,
    keyPos: [2, 4, 5],
    rim: '#F97316',
    rimI: 0.9,
    fog: ['#4C0D0D', 6, 34],
    fire: {color: '#F97316', intensity: 5.5, pos: [2.2, 1.3, 2.6]},
    ground: '#3F1212',
  },
  /** Inside the cave: the Nur faces are the only real source. */
  nur_gua: {
    bg: '#1E293B',
    ambient: '#334155',
    ambientI: 0.3,
    key: '#8FA3C8',
    keyI: 0.28,
    keyPos: [0, 5, 4],
    rim: '#1E293B',
    rimI: 0.2,
    fog: ['#121A2B', 7, 30],
    ground: '#2A3447',
  },
  studio_bersih: {
    bg: '#E2E8F0',
    ambient: '#FFFFFF',
    ambientI: 1.6,
    key: '#FFFFFF',
    keyI: 1.1,
    keyPos: [3, 6, 5],
    rim: '#CBD5E1',
    rimI: 0.5,
    /* No fog: the analogy room is deliberately flat and clean. */
    ground: '#D6DEE9',
  },
  fajar_awal: {
    bg: '#334155',
    ambient: '#64748B',
    ambientI: 0.7,
    key: '#FDBA74',
    keyI: 1.3,
    keyPos: [-4, 4, 5],
    rim: '#F97316',
    rimI: 0.7,
    fog: ['#334155', 14, 70],
    ground: '#44506B',
  },
  fajar_keemasan: {
    bg: '#F97316',
    ambient: '#FEF08A',
    ambientI: 1.0,
    key: '#FEF08A',
    keyI: 2.4,
    keyPos: [-4, 5, 6],
    rim: '#FDBA74',
    rimI: 1.1,
    fog: ['#F97316', 22, 96],
    ground: '#B4601F',
  },
};

export const groundColor = (mood: KahfiMood) => KAHFI_MOODS[mood].ground;

export const KahfiLighting: React.FC<{mood: KahfiMood}> = ({mood}) => {
  const m = KAHFI_MOODS[mood];
  return (
    <>
      <color attach="background" args={[m.bg]} />
      {m.fog ? <fog attach="fog" args={m.fog} /> : null}
      <ambientLight color={m.ambient} intensity={m.ambientI} />
      <directionalLight color={m.key} intensity={m.keyI} position={m.keyPos} />
      <directionalLight color={m.rim} intensity={m.rimI} position={[-m.keyPos[0], 3, -6]} />
      {m.fire ? <pointLight color={m.fire.color} intensity={m.fire.intensity} distance={14} decay={2} position={m.fire.pos} /> : null}
    </>
  );
};
