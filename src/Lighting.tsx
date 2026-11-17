import React from 'react';
import type {LightingMood} from './types';

/** Emotional colour coding: each mood is a full light rig + sky + fog. */
export const MOODS: Record<
  LightingMood,
  {bg: string; ambient: string; ambientI: number; key: string; keyI: number; keyPos: [number, number, number]; rim: string; rimI: number; fog?: [string, number, number]}
> = {
  colonial_day: {bg: '#9fd8f5', ambient: '#fff4e0', ambientI: 1.05, key: '#fff1d0', keyI: 2.5, keyPos: [4, 8, 6], rim: '#bfe6ff', rimI: 0.6},
  night_threat: {bg: '#0d1b3d', ambient: '#5070b8', ambientI: 0.85, key: '#9db8ff', keyI: 1.9, keyPos: [-5, 7, 4], rim: '#4d7cff', rimI: 1.2, fog: ['#0d1b3d', 18, 90]},
  danger_fire: {bg: '#ff7a3a', ambient: '#ffb08a', ambientI: 0.85, key: '#ff7a3a', keyI: 2.6, keyPos: [3, 5, 5], rim: '#ffd27a', rimI: 1.4, fog: ['#ff8a4a', 25, 110]},
  explainer_studio: {bg: '#e7c79a', ambient: '#fff1d6', ambientI: 1.1, key: '#fff2d0', keyI: 2.3, keyPos: [3, 6, 5], rim: '#ffffff', rimI: 0.5},
  dawn_hope: {bg: '#ffd27a', ambient: '#ffe6b5', ambientI: 1.1, key: '#ffd08a', keyI: 2.7, keyPos: [-3, 4, 6], rim: '#fff3c4', rimI: 1.0},
};

export const Lighting: React.FC<{mood: LightingMood}> = ({mood}) => {
  const m = MOODS[mood];
  return (
    <>
      <color attach="background" args={[m.bg]} />
      {m.fog ? <fog attach="fog" args={m.fog} /> : null}
      <ambientLight color={m.ambient} intensity={m.ambientI} />
      <directionalLight color={m.key} intensity={m.keyI} position={m.keyPos} />
      <directionalLight color={m.rim} intensity={m.rimI} position={[-m.keyPos[0], 3, -6]} />
    </>
  );
};
