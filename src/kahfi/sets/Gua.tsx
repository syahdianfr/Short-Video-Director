import React, {useMemo} from 'react';
import * as THREE from 'three';
import {ToonPart, FlatPart, rand} from '../../lib/toon';
import {Actors, Ground, Batu, PohonKurma, DebuCahaya, Bintang, type KahfiSetProps} from './common';
import {MOTE_WARM} from '../lighting';

/**
 * CONTINUITY CONSTANT — do not change without updating Part 2.
 *
 * The cave mouth faces north-east, written here as a yaw in radians. Part 2
 * depends on it: the sun must be seen leaning away from the opening at both
 * sunrise and sunset, which is the detail QS. Al-Kahf: 17 describes. If this
 * value moves, that shot stops being true.
 */
export const CAVE_MOUTH_YAW = -0.42;

/** The hillside ridge the path climbs. Low-poly, fixed seeds. */
const Bukit: React.FC<{frame: number; palms?: boolean}> = ({frame, palms = false}) => {
  const rocks = useMemo(
    () =>
      Array.from({length: 34}).map((_, i) => {
        const a = rand(i * 1.9) * Math.PI * 2;
        const r = 4.5 + rand(i * 3.7) * 20;
        return {
          pos: [Math.cos(a) * r, rand(i * 5.1) * 0.3, Math.sin(a) * r - 3] as [number, number, number],
          scale: 0.4 + rand(i * 7.3) * 1.9,
          seed: i * 29,
        };
      }),
    [],
  );
  /* Three ridge masses behind the action, so the horizon is not a flat line. */
  const ridges: {pos: [number, number, number]; s: [number, number, number]}[] = [
    {pos: [-14, -1.2, -24], s: [16, 5.0, 10]},
    {pos: [10, -1.6, -30], s: [20, 6.4, 12]},
    {pos: [26, -1.0, -18], s: [12, 4.2, 9]},
  ];
  return (
    <group>
      {ridges.map((rg, i) => (
        <ToonPart key={i} color="#6E6252" position={rg.pos} scale={rg.s} rotation={[0, rand(i * 11) * 3, 0]} outline={0.04}>
          <icosahedronGeometry args={[1, 0]} />
        </ToonPart>
      ))}
      {rocks.map((r, i) => (
        <Batu key={i} position={r.pos} scale={r.scale} seed={r.seed} />
      ))}
      {palms
        ? [-9.0, 11.5].map((x, i) => (
            <PohonKurma key={`p${i}`} position={[x, 0, -9 - i * 3]} scale={0.8} seed={i * 23} frame={frame} />
          ))
        : null}
    </group>
  );
};

/**
 * The cave mass with a mouth cut into it.
 *
 * Built as a rock shell plus a dark interior shell: the opening is the gap
 * between them, so no CSG is needed and the silhouette stays clean toon.
 */
const MassaGua: React.FC<{inside: boolean}> = ({inside}) => (
  <group rotation={[0, CAVE_MOUTH_YAW, 0]}>
    {/* outer rock face */}
    <ToonPart color="#776A5A" position={[0, 1.6, -4.4]} scale={[7.0, 4.4, 4.0]} outline={0.045}>
      <icosahedronGeometry args={[1, 1]} />
    </ToonPart>
    <ToonPart color="#6B5F50" position={[-4.2, 1.0, -2.6]} scale={[2.6, 2.8, 2.4]} rotation={[0, 0.6, 0.1]} outline={0.04}>
      <icosahedronGeometry args={[1, 0]} />
    </ToonPart>
    <ToonPart color="#6B5F50" position={[4.4, 1.1, -2.4]} scale={[2.8, 3.0, 2.3]} rotation={[0, -0.5, -0.1]} outline={0.04}>
      <icosahedronGeometry args={[1, 0]} />
    </ToonPart>
    {/* lintel above the opening */}
    <ToonPart color="#7E7161" position={[0, 3.5, -1.5]} scale={[3.4, 1.1, 1.6]} rotation={[0.12, 0, 0.04]} outline={0.04}>
      <icosahedronGeometry args={[1, 0]} />
    </ToonPart>
    {/* the dark throat of the cave: unlit, so it stays black in every mood */}
    <FlatPart color="#0B0F18" position={[0, 1.35, -2.1]} scale={[1, 1, 1]}>
      <circleGeometry args={[1.55, 22]} />
    </FlatPart>
    {inside ? null : (
      <>
        {/* loose scree at the sill */}
        {Array.from({length: 11}).map((_, i) => (
          <Batu key={i} position={[(rand(i * 2.3) - 0.5) * 3.4, 0.05, -0.4 + rand(i * 4.7) * 1.2]} scale={0.16 + rand(i * 6.1) * 0.28} seed={i * 31} color="#7E7161" />
        ))}
      </>
    )}
  </group>
);

/* ------------------------------------------------------------------ */
/* lereng_bukit — the hillside path                                    */
/* ------------------------------------------------------------------ */
export const LerengBukitSet: React.FC<KahfiSetProps> = (p) => {
  const {frame, beat} = p;
  const night = beat.mood === 'biru_malam';
  return (
    <group>
      <Ground mood={beat.mood} />
      {/* the path: a lighter strip of trodden ground */}
      <ToonPart color="#8C7D68" rotation={[-Math.PI / 2, 0.0, 0.22]} position={[0, 0.016, -2]} outline={false}>
        <planeGeometry args={[2.0, 34]} />
      </ToonPart>
      <Bukit frame={frame} palms={!night} />
      {night ? <Bintang frame={frame} /> : null}
      <DebuCahaya frame={frame} n={110} area={7} height={3.2} color={night ? '#93C5FD' : '#FDE68A'} />
      <Actors p={p} handProps={{fadhil: 'buku_catatan'}} />
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* mulut_gua — the cave mouth, seen from outside                       */
/* ------------------------------------------------------------------ */
export const MulutGuaSet: React.FC<KahfiSetProps> = (p) => {
  const {frame, beat} = p;
  const night = beat.mood === 'biru_malam' || beat.mood === 'merah_krisis';
  /* In the crisis beat a pursuing torch is visible far off, never a blow. */
  const showTorch = beat.mood === 'merah_krisis';
  const flick = 0.8 + 0.2 * Math.sin(frame * 0.8) + 0.1 * (rand(frame * 2.7) - 0.5);
  return (
    <group>
      <Ground mood={beat.mood} />
      <ToonPart color="#8C7D68" rotation={[-Math.PI / 2, 0, 0.22]} position={[0, 0.016, 2.6]} outline={false}>
        <planeGeometry args={[1.9, 22]} />
      </ToonPart>
      <MassaGua inside={false} />
      <Bukit frame={frame} palms={false} />
      {night ? <Bintang frame={frame} n={120} /> : null}

      {showTorch ? (
        <group position={[7.5, 0.9, 8.0]}>
          <ToonPart color="#F97316" emissive="#F97316" emissiveIntensity={1.6} scale={[1, flick, 1]} outline={false}>
            <coneGeometry args={[0.16, 0.5, 10]} />
          </ToonPart>
          <pointLight color="#F97316" intensity={9} distance={22} decay={2} />
        </group>
      ) : null}

      <DebuCahaya frame={frame} n={80} area={6} height={3.4} color={night ? '#FCA5A5' : '#FDE68A'} />
      <Actors p={p} handProps={{fadhil: 'buku_catatan'}} />
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* interior_gua — inside the cave                                      */
/* ------------------------------------------------------------------ */
export const InteriorGuaSet: React.FC<KahfiSetProps> = (p) => {
  const {frame, beat} = p;
  /* The shell is modelled from inside: BackSide so we see its interior walls. */
  const shell = useMemo(() => new THREE.SphereGeometry(6.4, 28, 20), []);
  const dawn = beat.mood === 'fajar_keemasan';
  return (
    <group>
      {/* cave walls */}
      <ToonPart geometry={shell} color="#2F3747" side={THREE.BackSide} outline={false} position={[0, 1.2, 0]} scale={[1, 0.62, 1]} />
      {/* sandy floor */}
      <ToonPart color="#4A4234" rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} outline={false}>
        <circleGeometry args={[6.2, 30]} />
      </ToonPart>
      {/**
       * Ceiling slabs, so the space does not read as a plain dome.
       *
       * They are pushed out to the walls and kept above y = 4.0 on purpose:
       * beat 18 cranes down the centre of the cave from y = 5 to y = 3, and
       * anything hanging over the middle puts a rock between the camera and
       * the praying figures. That is exactly what happened the first time.
       */}
      {[
        [-3.1, 4.3, -2.2],
        [3.2, 4.5, 0.6],
        [0.4, 4.6, 3.4],
      ].map((pos, i) => (
        <ToonPart key={i} color="#3A4354" position={pos as [number, number, number]} scale={[2.2, 0.6, 1.9]} rotation={[0.1, rand(i * 7) * 3, 0.06]} outline={0.035}>
          <icosahedronGeometry args={[1, 0]} />
        </ToonPart>
      ))}
      {/* boulders that break the group's silhouette, so the youths cannot be counted */}
      <Batu position={[-1.5, 0.2, -1.5]} scale={0.8} seed={61} color="#3F4859" />
      <Batu position={[1.7, 0.18, -1.3]} scale={0.7} seed={67} color="#3F4859" />
      <Batu position={[0.1, 0.14, 2.4]} scale={0.55} seed={71} color="#3F4859" />

      {/* the mouth, seen from within: a bright opening toward +Z */}
      <group rotation={[0, CAVE_MOUTH_YAW, 0]}>
        <FlatPart color={dawn ? '#FEF08A' : '#6E8FD8'} position={[0, 1.5, 4.9]} rotation={[0, Math.PI, 0]} transparent opacity={dawn ? 0.95 : 0.5}>
          <circleGeometry args={[1.5, 22]} />
        </FlatPart>
        {/* light spilling from the opening onto the floor */}
        <FlatPart
          color={dawn ? '#FEF08A' : '#93C5FD'}
          position={[0, 0.02, 3.0]}
          rotation={[-Math.PI / 2, 0, 0]}
          transparent
          opacity={dawn ? 0.5 : 0.18}
        >
          <circleGeometry args={[2.0, 20]} />
        </FlatPart>
        <pointLight color={dawn ? '#FEF08A' : '#93C5FD'} intensity={dawn ? 7 : 2.2} distance={14} decay={2} position={[0, 1.6, 4.4]} />
      </group>

      {/* motes catching the Nur: the only thing that makes the dark readable */}
      <DebuCahaya frame={frame} n={120} area={3.4} height={3.0} color={MOTE_WARM} center={[0, 0, 0]} />
      <Actors p={p} handProps={{fadhil: 'buku_catatan'}} />
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* lanskap_bukit — the wide landscape for the closing time-lapse       */
/* ------------------------------------------------------------------ */
export const LanskapBukitSet: React.FC<KahfiSetProps> = (p) => {
  const {frame, beat} = p;
  /**
   * Deterministic time-lapse: the sun's arc is a pure function of the frame,
   * so "centuries passing" costs one interpolation and renders identically
   * every time. Beat 26 runs 76.662 s -> 79.484 s.
   */
  const t0 = beat.startSec * p.fps;
  const span = Math.max(1, (beat.endSec - beat.startSec) * p.fps);
  const k = Math.min(1, Math.max(0, (frame - t0) / span));
  const sunA = k * Math.PI;
  const sunPos: [number, number, number] = [Math.cos(sunA) * 34, Math.sin(sunA) * 20 + 2, -26];

  return (
    <group>
      <Ground mood={beat.mood} size={120} />
      <Bukit frame={frame} palms />
      <MassaGua inside={false} />
      {/* the sun disc itself, unlit so it stays a flat bright shape */}
      <FlatPart color="#FEF08A" position={sunPos} scale={1}>
        <circleGeometry args={[2.4, 26]} />
      </FlatPart>
      <directionalLight color="#FEF08A" intensity={1.2 + 1.2 * Math.sin(sunA)} position={sunPos} />
      {/* stars fade in as the arc passes overhead and the sky drops */}
      {k > 0.62 ? <Bintang frame={frame} n={150} radius={70} /> : null}
      <DebuCahaya frame={frame} n={60} area={14} height={6} color="#FDE68A" />
      <Actors p={p} handProps={{fadhil: 'buku_catatan'}} />
    </group>
  );
};
