import React from 'react';
import * as THREE from 'three';
import {interpolate, Easing} from 'remotion';
import {ToonPart, FlatPart, canvasTexture, FONT_BLACK, FONT_TYPE, INK, rand} from '../lib/toon';
import {WavingFlag, HandProp} from '../props';
import {Hero, WorldProp, secToLocal, type SetProps} from './common';
import {TexGround, useTiled, KModel, Foliage} from '../lib/assets';

import type {Vec3} from '../types';

/* ------------------------------------------------------------------ */
/* Shared pieces                                                        */
/* ------------------------------------------------------------------ */
export const ChocolateEggSmall: React.FC<{position: Vec3; scale?: number}> = ({position, scale = 0.12}) => (
  <group position={position} scale={scale}>
    <EggMesh />
  </group>
);

export const eggFoil = () =>
  canvasTexture('egg-foil', 512, 512, (ctx, w, h) => {
    const bands = ['#ae1c28', '#ffffff', '#21468b'];
    for (let i = 0; i < 9; i++) {
      ctx.fillStyle = bands[i % 3];
      ctx.fillRect(0, (i * h) / 9, w, h / 9 + 1);
    }
    // foil crinkles
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    for (let i = 0; i < 60; i++) {
      const x = rand(i) * w;
      const y = rand(i + 99) * h;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 30 * (rand(i + 3) - 0.5), y + 30 * (rand(i + 7) - 0.5));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });

/** Egg profile for LatheGeometry (height 1, max radius ~0.38). */
export const eggProfile = (() => {
  const pts: THREE.Vector2[] = [];
  const N = 28;
  for (let i = 0; i <= N; i++) {
    const t = i / N; // 0 bottom -> 1 top
    const y = t;
    const r = 0.38 * Math.sin(Math.PI * t) * (1 - 0.18 * t) + 0.0001;
    pts.push(new THREE.Vector2(r, y));
  }
  return pts;
})();

export const EggMesh: React.FC<{phiStart?: number; phiLength?: number; inside?: boolean}> = ({phiStart = 0, phiLength = Math.PI * 2, inside}) => (
  <group>
    <ToonPart color="#ffffff" map={eggFoil()} side={THREE.FrontSide}>
      <latheGeometry args={[eggProfile, 40, phiStart, phiLength]} />
    </ToonPart>
    {inside ? (
      <ToonPart color="#5a3218" side={THREE.BackSide} outline={false} scale={0.97}>
        <latheGeometry args={[eggProfile, 40, phiStart, phiLength]} />
      </ToonPart>
    ) : null}
  </group>
);

/* ------------------------------------------------------------------ */
/* OFFICE — general's office with the map-table diorama                 */
/* ------------------------------------------------------------------ */
const islandBlobs: {p: Vec3; s: Vec3; r: number}[] = [
  {p: [-0.75, 0, 1.05], s: [0.42, 0.04, 0.12], r: -0.6}, // Sumatra
  {p: [-0.15, 0, 1.55], s: [0.36, 0.04, 0.07], r: -0.08}, // Java
  {p: [0.05, 0, 1.0], s: [0.28, 0.05, 0.24], r: 0}, // Borneo
  {p: [0.5, 0, 1.15], s: [0.1, 0.04, 0.22], r: 0.3}, // Sulawesi
  {p: [0.85, 0, 1.3], s: [0.24, 0.04, 0.12], r: 0.1}, // Papua
];

export const OfficeSet: React.FC<SetProps> = (p) => {
  const {beat, localFrame, fps, frame} = p;
  const t = frame / fps;
  const isEyes = beat.id === 'S22_general_eyes';
  // eyes darting: alternate look targets every 7 frames
  const dart: Vec3 = Math.floor(localFrame / 7) % 2 === 0 ? [0.9, 1.95, 2.5] : [-0.9, 1.85, 2.5];

  // medal pops off on the white-flag beat
  const medalK = beat.id === 'S04_white_flag' ? Math.max(0, (localFrame - secToLocal(p, 4.12)) / fps) : -1;
  const medalPos: Vec3 = [0.25 + medalK * 1.2, 1.2 + medalK * 2.4 - medalK * medalK * 6, 0.34 + medalK * 1.1];

  return (
    <group>
      {/* floor + walls */}
      <TexGround tex="planks" color="#d8a070" width={14} depth={14} repeat={6} position={[0, 0, 0]} />
      <KModel id="rug" position={[0, 0.01, 0.3]} scale={2.4} />
      <KModel id="bookcaseClosed" position={[-3.4, 0, -2.25]} scale={3.2} />
      <KModel id="bookcaseOpen" position={[-2.4, 0, -2.25]} scale={3.2} />
      <KModel id="coatRack" position={[3.5, 0, -1.8]} scale={2.8} />
      <KModel id="pottedPlant" position={[2.6, 0, -2.0]} height={1.5} />
      <KModel id="lampFloor" position={[-1.7, 0, -1.6]} scale={2.8} />
      <ToonPart color="#efe2c0" position={[0, 2.5, -2.6]} outline={false}>
        <boxGeometry args={[14, 5, 0.2]} />
      </ToonPart>
      <ToonPart color="#7a4a2a" position={[0, 0.25, -2.48]}>
        <boxGeometry args={[14, 0.5, 0.06]} />
      </ToonPart>
      {/* window with tropical light */}
      <group position={[-1.9, 2.4, -2.48]}>
        <FlatPart color="#bfe8ff">
          <planeGeometry args={[1.5, 1.9]} />
        </FlatPart>
        {[
          [0, 0.98, 1.6, 0.08],
          [0, -0.98, 1.6, 0.08],
          [0.78, 0, 0.08, 2.0],
          [-0.78, 0, 0.08, 2.0],
          [0, 0, 0.06, 1.9],
          [0, 0.2, 1.5, 0.06],
        ].map(([x, y, w, h], i) => (
          <ToonPart key={i} color="#ffffff" position={[x, y, 0.03]}>
            <boxGeometry args={[w, h, 0.06]} />
          </ToonPart>
        ))}
      </group>
      {/* Dutch flag on the wall */}
      <group position={[1.3, 3.2, -2.45]}>
        <ToonPart color="#6b4a2a" position={[0, -0.4, 0]} rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 1.6, 8]} />
        </ToonPart>
        <WavingFlag kind="dutch" width={1.0} height={0.66} t={t} amp={0.02} speed={2} position={[0.03, 0.05, 0.05]} />
      </group>
      {/* portrait frame */}
      <group position={[2.6, 2.6, -2.45]}>
        <ToonPart color="#c49a3a">
          <boxGeometry args={[0.9, 1.1, 0.06]} />
        </ToonPart>
        <FlatPart color="#3d5a4a" position={[0, 0, 0.035]}>
          <planeGeometry args={[0.72, 0.92]} />
        </FlatPart>
      </group>

      {/* map table diorama in front of the general */}
      <group position={[0, 0, 0]}>
        <ToonPart color="#5a3a22" position={[0, 0.45, 1.25]}>
          <boxGeometry args={[2.3, 0.9, 1.1]} />
        </ToonPart>
        <ToonPart color="#3f8fc9" position={[0, 0.905, 1.25]} outline={0.02}>
          <boxGeometry args={[2.15, 0.02, 0.98]} />
        </ToonPart>
        {islandBlobs.map((b, i) => (
          <ToonPart key={i} color="#6fbf4a" position={[b.p[0], 0.925, b.p[2]]} rotation={[0, b.r, 0]} scale={b.s} outline={0.015}>
            <sphereGeometry args={[1, 16, 8]} />
          </ToonPart>
        ))}
        {/* easter egg #3: the chocolate egg already sits on the table */}
        <ChocolateEggSmall position={[0.92, 0.915, 1.62]} />
        {/* brass lamp */}
        <group position={[-0.95, 0.92, 1.6]}>
          <ToonPart color="#c49a3a" position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.02, 0.06, 0.4, 8]} />
          </ToonPart>
          <ToonPart color="#2d6b3a" position={[0, 0.45, 0]}>
            <coneGeometry args={[0.16, 0.18, 12, 1, true]} />
          </ToonPart>
        </group>
      </group>

      <WorldProp p={p} />

      {/* the general */}
      <Hero p={p} position={[0, 0, 0]} lookAt={isEyes ? dart : beat.character.lookAt} />

      {medalK > 0 && medalK < 1.2 ? (
        <group position={medalPos} rotation={[medalK * 12, medalK * 7, 0]}>
          <HandProp item="medal" t={0} />
        </group>
      ) : null}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* BELL — extreme close-up of a bicycle bell being thumbed              */
/* ------------------------------------------------------------------ */
export const BellSet: React.FC<SetProps> = (p) => {
  const {localFrame, fps} = p;
  const press = secToLocal(p, 3.3);
  const thumbK = interpolate(localFrame, [press - 6, press, press + 4, press + 9], [0, 1, 1, 0.3], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const ring = Math.max(0, localFrame - press);
  const wobble = ring > 0 ? Math.sin(ring * 2.2) * 0.12 * Math.exp(-ring / 10) : 0;
  return (
    <group>
      {/* soft olive "bokeh" background */}
      {Array.from({length: 14}).map((_, i) => (
        <FlatPart
          key={i}
          color={i % 3 === 0 ? '#9aa36a' : '#6f7a45'}
          transparent
          opacity={0.55}
          position={[(rand(i) - 0.5) * 6, 0.4 + rand(i + 4) * 2.4, -3 - rand(i + 9) * 2]}
        >
          <circleGeometry args={[0.25 + rand(i + 2) * 0.35, 24]} />
        </FlatPart>
      ))}
      <FlatPart color="#55603a" position={[0, 1, -6]}>
        <planeGeometry args={[30, 20]} />
      </FlatPart>
      {/* handlebar */}
      <ToonPart color="#2a2a2a" position={[0, 1.0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 1.4, 12]} />
      </ToonPart>
      <ToonPart color="#3b2a1a" position={[0.55, 1.0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.045, 0.3, 12]} />
      </ToonPart>
      {/* bell */}
      <group position={[0.1, 1.035, 0]} rotation={[0, 0, wobble]} scale={1.8}>
        <ToonPart color="#dcdcdc" emissive="#555" emissiveIntensity={0.15}>
          <sphereGeometry args={[0.07, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </ToonPart>
        <ToonPart color="#bbbbbb" position={[0, 0.075, 0]} outline={0.01}>
          <sphereGeometry args={[0.012, 8, 8]} />
        </ToonPart>
        {/* lever */}
        <ToonPart color="#9a9a9a" position={[0.07, 0.0, 0.05]} rotation={[0, -0.6, -0.4 * thumbK]} outline={0.008}>
          <boxGeometry args={[0.07, 0.01, 0.02]} />
        </ToonPart>
      </group>
      {/* gloved thumb */}
      <group position={[0.24 - 0.05 * thumbK, 1.07 - 0.02 * thumbK, 0.09]} rotation={[0, 0, 0.4]}>
        <ToonPart color="#f4f4f0" scale={[1.6, 0.8, 0.9]}>
          <sphereGeometry args={[0.05, 16, 12]} />
        </ToonPart>
        <ToonPart color="#f4f4f0" position={[0.12, -0.04, 0]} scale={[1.2, 1, 1]}>
          <sphereGeometry args={[0.07, 16, 12]} />
        </ToonPart>
      </group>
      {/* "ring" accent lines */}
      {ring > 0 && ring < 14
        ? [0, 1, 2].map((i) => (
            <FlatPart
              key={i}
              color={INK}
              position={[0.1 + Math.cos(0.6 + i * 0.6) * (0.13 + ring * 0.006), 1.08 + Math.sin(0.6 + i * 0.6) * (0.13 + ring * 0.006), 0.02]}
              rotation={[0, 0, 0.6 + i * 0.6]}
            >
              <planeGeometry args={[0.05, 0.008]} />
            </FlatPart>
          ))
        : null}
      {/* touch of motion so it never freezes */}
      <group rotation={[0, 0, Math.sin(localFrame / fps) * 0.001]} />
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* GLOBE — the boot comes down on the Netherlands                       */
/* ------------------------------------------------------------------ */
const globeTexture = () =>
  canvasTexture('globe', 1024, 512, (ctx, w, h) => {
    ctx.fillStyle = '#3f8fc9';
    ctx.fillRect(0, 0, w, h);
    // UV u=0.25 faces +Z (camera). Europe around there, latitude 52N -> v ~ 0.21.
    const blob = (pts: [number, number][], color: string) => {
      ctx.fillStyle = color;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      ctx.beginPath();
      pts.forEach(([u, v], i) => (i ? ctx.lineTo(u * w, v * h) : ctx.moveTo(u * w, v * h)));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };
    blob(
      [
        [0.18, 0.12],
        [0.33, 0.1],
        [0.36, 0.22],
        [0.33, 0.33],
        [0.27, 0.35],
        [0.24, 0.3],
        [0.2, 0.33],
        [0.17, 0.27],
        [0.19, 0.2],
      ],
      '#8cc66d',
    ); // Europe
    blob(
      [
        [0.2, 0.36],
        [0.36, 0.36],
        [0.38, 0.6],
        [0.3, 0.8],
        [0.24, 0.62],
        [0.19, 0.48],
      ],
      '#d9c27a',
    ); // Africa
    blob(
      [
        [0.06, 0.16],
        [0.1, 0.17],
        [0.11, 0.24],
        [0.07, 0.25],
      ],
      '#8cc66d',
    ); // UK-ish
    // Netherlands highlight
    ctx.fillStyle = '#f28c28';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0.245 * w, 0.205 * h, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = `900 22px ${FONT_BLACK}`;
    ctx.fillText('NL', 0.245 * w - 13, 0.205 * h - 22);
    blob(
      [
        [0.42, 0.1],
        [0.75, 0.08],
        [0.8, 0.3],
        [0.62, 0.42],
        [0.48, 0.34],
      ],
      '#8cc66d',
    ); // Asia
    blob(
      [
        [0.62, 0.5],
        [0.72, 0.48],
        [0.74, 0.53],
        [0.64, 0.55],
      ],
      '#8cc66d',
    ); // Indies
  });

export const GlobeSet: React.FC<SetProps> = (p) => {
  const {localFrame, fps, frame} = p;
  const land = secToLocal(p, 19.45);
  const drop = interpolate(localFrame, [land - 9, land], [3.6, 1.95], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.quad),
  });
  const squash = localFrame >= land ? 1 - 0.12 * Math.exp(-(localFrame - land) / 6) : 1;
  const spin = -0.15 + Math.min(localFrame, land) * 0.004;
  return (
    <group>
      <FlatPart color="#efe2c0" position={[0, 2, -2]}>
        <planeGeometry args={[12, 8]} />
      </FlatPart>
      <ToonPart color="#5a3a22" position={[0, 0.4, 0]}>
        <boxGeometry args={[2.6, 0.8, 1.4]} />
      </ToonPart>
      <KModel id="books" position={[-0.85, 0.8, 0.15]} scale={2.4} rotation={[0, 0.3, 0]} />
      <KModel id="radio" position={[0.9, 0.8, -0.1]} scale={2.2} rotation={[0, -0.4, 0]} />
      <ToonPart color="#c49a3a" position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.22, 0.3, 0.1, 20]} />
      </ToonPart>
      <ToonPart color="#c49a3a" position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
      </ToonPart>
      <group position={[0, 1.42, 0]} scale={[1, squash, 1]}>
        <ToonPart color="#ffffff" map={globeTexture()} rotation={[0.25, spin, 0]}>
          <sphereGeometry args={[0.5, 48, 32]} />
        </ToonPart>
      </group>
      <ToonPart color="#c49a3a" position={[0, 1.42, 0]} rotation={[0.25, 0, 0]} outline={0.015}>
        <torusGeometry args={[0.56, 0.015, 8, 48, Math.PI]} />
      </ToonPart>
      {/* the boot (no insignia) */}
      <group position={[0.02, drop, 0.28]} rotation={[0.35, 0, 0]}>
        <ToonPart color="#1c1c1c" position={[0, 0.55, -0.05]}>
          <boxGeometry args={[0.34, 0.9, 0.34]} />
        </ToonPart>
        <ToonPart color="#1c1c1c" position={[0, 0.05, 0.12]}>
          <boxGeometry args={[0.36, 0.22, 0.62]} />
        </ToonPart>
        <ToonPart color="#333" position={[0, -0.08, 0.12]} outline={0.015}>
          <boxGeometry args={[0.38, 0.06, 0.66]} />
        </ToonPart>
      </group>
      <group visible={frame >= 0} />
      {/* idle creep */}
      <group rotation={[0, (localFrame / fps) * 0.001, 0]} />
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* STUDIO — projector + timeline ("You see…")                           */
/* ------------------------------------------------------------------ */
const timelineTexture = () =>
  canvasTexture('timeline', 1024, 576, (ctx, w, h) => {
    ctx.fillStyle = '#f7ecd2';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.font = `900 54px ${FONT_BLACK}`;
    ctx.fillText('"350 YEARS"?', w / 2, 90);
    // bar
    const x0 = 90;
    const x1 = w - 90;
    const y = 260;
    ctx.fillStyle = '#cfc5ad';
    ctx.fillRect(x0, y - 22, x1 - x0, 44);
    const yr = (Y: number) => x0 + ((Y - 1596) / (1942 - 1596)) * (x1 - x0);
    // actual control grows late
    const segs: [number, number, string][] = [
      [1602, 1680, '#e6b25a'],
      [1680, 1830, '#e08a3a'],
      [1830, 1904, '#d0602a'],
      [1904, 1942, '#ae1c28'],
    ];
    segs.forEach(([a, b, c]) => {
      ctx.fillStyle = c;
      const hh = a < 1830 ? 18 : a < 1904 ? 30 : 44;
      ctx.fillRect(yr(a), y - hh / 2, yr(b) - yr(a), hh);
    });
    ctx.strokeStyle = INK;
    ctx.lineWidth = 5;
    ctx.strokeRect(x0, y - 22, x1 - x0, 44);
    ctx.font = `bold 36px ${FONT_TYPE}`;
    ctx.fillStyle = INK;
    ctx.fillText('1596', x0 + 20, y + 80);
    ctx.fillText('1942', x1 - 20, y + 80);
    ctx.font = `bold 26px ${FONT_TYPE}`;
    const notes: [number, string][] = [
      [1640, 'trading posts'],
      [1830, 'Java'],
      [1904, 'Aceh'],
    ];
    notes.forEach(([Y, txt], i) => {
      const x = yr(Y);
      ctx.fillRect(x - 2, y + 26, 4, 30 + i * 0);
      ctx.fillText(txt, x, y + 150 + (i % 2) * 40);
    });
    ctx.fillStyle = '#ae1c28';
    ctx.font = `900 40px ${FONT_BLACK}`;
    ctx.fillText('FULL CONTROL ≈ 40 YEARS', w / 2, h - 50);
  });

const beamLen = (a: Vec3, b: Vec3) => new THREE.Vector3(...a).distanceTo(new THREE.Vector3(...b));
/** Cylinder transform whose +Y (wide end) points at `to` from `from`. */
export const beamTransform = (from: Vec3, to: Vec3) => {
  const A = new THREE.Vector3(...from);
  const B = new THREE.Vector3(...to);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
  return {position: A.clone().lerp(B, 0.5).toArray() as Vec3, quaternion};
};

export const StudioSet: React.FC<SetProps> = (p) => {
  const {frame, fps} = p;
  const t = frame / fps;
  return (
    <group>
      <FlatPart color="#d9b98a" position={[0, 3, -3]}>
        <planeGeometry args={[20, 12]} />
      </FlatPart>
      <TexGround tex="planks" color="#e0b080" width={20} depth={20} repeat={8} position={[0, 0, 0]} />
      <KModel id="bookcaseOpen" position={[-2.7, 0, -2.4]} scale={3.2} />
      <KModel id="pottedPlant" position={[2.4, 0, -2.2]} height={1.5} />
      <KModel id="sideTable" position={[-2.4, 0, 0.6]} scale={2.4} rotation={[0, 0.5, 0]} />
      <KModel id="radio" position={[-2.45, 0.92, 0.6]} scale={2.0} rotation={[0, 0.5, 0]} />
      {/* screen */}
      <group position={[0.35, 2.0, -1.9]}>
        <ToonPart color="#333" position={[0, 0, -0.03]}>
          <boxGeometry args={[2.5, 1.5, 0.04]} />
        </ToonPart>
        <FlatPart map={timelineTexture()}>
          <planeGeometry args={[2.4, 1.35]} />
        </FlatPart>
      </group>
      {/* projector with spinning reels */}
      <group position={[1.4, 1.0, 1.4]} rotation={[0, 0.45, 0]}>
        <ToonPart color="#3b3b3b">
          <boxGeometry args={[0.5, 0.35, 0.6]} />
        </ToonPart>
        <ToonPart color="#222" position={[0, 0, -0.38]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.11, 0.18, 16]} />
        </ToonPart>
        {[-0.16, 0.2].map((z, i) => (
          <ToonPart key={i} color="#555" position={[0, 0.36, z]} rotation={[t * 6 * (i ? 1 : -1), 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.18, 0.18, 0.04, 6]} />
          </ToonPart>
        ))}
        <ToonPart color="#2a2a2a" position={[0, -0.45, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.6, 8]} />
        </ToonPart>
      </group>
      {/* light beam */}
      <mesh {...beamTransform([1.25, 1.0, 1.05], [0.35, 2.0, -1.85])}>
        <cylinderGeometry args={[0.75, 0.06, beamLen([1.25, 1.0, 1.05], [0.35, 2.0, -1.85]), 24, 1, true]} />
        <meshBasicMaterial color="#fff4c2" transparent opacity={0.12} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <Hero p={p} position={[-1.15, 0, -0.5]} rotationY={0.25} />
    </group>
  );
};
