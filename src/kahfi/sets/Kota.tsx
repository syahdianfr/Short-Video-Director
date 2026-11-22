import React, {useMemo} from 'react';
import * as THREE from 'three';
import {ToonPart, rand} from '../../lib/toon';
import {Actors, Ground, PohonKurma, DebuCahaya, type KahfiSetProps} from './common';

/* ------------------------------------------------------------------ */
/* Shared city pieces                                                  */
/* ------------------------------------------------------------------ */

/** Mud-brick house with a palm-frond roof. */
const Rumah: React.FC<{position: [number, number, number]; seed: number; scale?: number}> = ({position, seed, scale = 1}) => {
  const w = 1.6 + rand(seed) * 1.1;
  const h = 1.5 + rand(seed + 1) * 0.9;
  const d = 1.5 + rand(seed + 2) * 1.0;
  return (
    <group position={position} rotation={[0, rand(seed + 3) * 0.7 - 0.35, 0]} scale={scale}>
      <ToonPart color={rand(seed + 4) > 0.5 ? '#C2A178' : '#AE8C62'} position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
      </ToonPart>
      {/* frond roof: thin slabs laid across */}
      {[0, 1, 2, 3].map((i) => (
        <ToonPart key={i} color="#7A6239" position={[0, h + 0.06, -d / 2 + ((i + 0.5) * d) / 4]} outline={0.02}>
          <boxGeometry args={[w * 1.08, 0.07, d / 4.6]} />
        </ToonPart>
      ))}
      {/* a dark doorway so the facade is not a blank block */}
      <ToonPart color="#3A2A1C" position={[0, h * 0.32, d / 2 + 0.01]} outline={0.015}>
        <boxGeometry args={[w * 0.26, h * 0.62, 0.04]} />
      </ToonPart>
    </group>
  );
};

/** Market stall: posts, a cloth canopy that sways, and a counter. */
const Kios: React.FC<{position: [number, number, number]; seed: number; frame: number; rotationY?: number}> = ({
  position,
  seed,
  frame,
  rotationY = 0,
}) => {
  const sway = 0.035 * Math.sin(frame * 0.05 + seed);
  const cloth = ['#B45309', '#9A3412', '#7C2D12', '#A16207'][Math.floor(rand(seed) * 4) % 4];
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {([-0.7, 0.7] as const).map((x) =>
        ([-0.55, 0.55] as const).map((z) => (
          <ToonPart key={`${x}${z}`} color="#6B4423" position={[x, 1.35, z]} outline={0.02}>
            <cylinderGeometry args={[0.05, 0.055, 2.7, 8]} />
          </ToonPart>
        )),
      )}
      <group position={[0, 2.72, 0]} rotation={[sway, 0, sway * 0.6]}>
        <ToonPart color={cloth} outline={0.025}>
          <boxGeometry args={[2.0, 0.06, 1.6]} />
        </ToonPart>
      </group>
      <ToonPart color="#8A6A43" position={[0, 1.02, 0.45]} outline={0.02}>
        <boxGeometry args={[1.6, 0.09, 0.55]} />
      </ToonPart>
      {/* dates in a basket, the kind of detail that rewards a rewatch */}
      <ToonPart color="#7A5230" position={[-0.45, 1.12, 0.45]} outline={0.016}>
        <cylinderGeometry args={[0.16, 0.13, 0.12, 12]} />
      </ToonPart>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <ToonPart
          key={`k${i}`}
          color="#5C3A1E"
          position={[-0.45 + (rand(seed + i) - 0.5) * 0.2, 1.2, 0.45 + (rand(seed + i + 9) - 0.5) * 0.2]}
          scale={[0.6, 1, 0.6]}
          outline={0.01}
        >
          <sphereGeometry args={[0.035, 8, 6]} />
        </ToonPart>
      ))}
    </group>
  );
};

/**
 * A carved stone figure, as a market good and as the temple's centrepiece.
 *
 * Deliberately ABSTRACT: a tapered column with a smooth ovoid head and no
 * features, attributes, symbols or script. It must not resemble the deity of
 * any living religion. The point on screen is "a thing people bowed to",
 * carried by scale and placement, and never by mocking a real object of
 * worship.
 */
const PatungAbstrak: React.FC<{position: [number, number, number]; scale?: number; seed?: number}> = ({
  position,
  scale = 1,
  seed = 0,
}) => {
  const geo = useMemo(() => {
    const pts = [
      new THREE.Vector2(0.001, 0),
      new THREE.Vector2(0.42, 0.04),
      new THREE.Vector2(0.4, 0.12),
      new THREE.Vector2(0.3, 0.3),
      new THREE.Vector2(0.26, 0.75),
      new THREE.Vector2(0.3, 1.1),
      new THREE.Vector2(0.24, 1.3),
      new THREE.Vector2(0.14, 1.38),
    ];
    return new THREE.LatheGeometry(pts, 20);
  }, []);
  return (
    <group position={position} scale={scale} rotation={[0, rand(seed) * 6.28, 0]}>
      <ToonPart geometry={geo} color="#9A8C76" />
      <ToonPart color="#9A8C76" position={[0, 1.54, 0]} scale={[1, 1.25, 0.92]}>
        <sphereGeometry args={[0.19, 20, 14]} />
      </ToonPart>
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* kota_pasar — the market of the idol-worshipping city                */
/* ------------------------------------------------------------------ */
export const KotaPasarSet: React.FC<KahfiSetProps> = (p) => {
  const {frame, beat} = p;
  const mood = beat.mood;

  /* Stall and house layout. Fixed seeds, so the city is the same city in
     every beat and in every later part of the series. */
  const kios = useMemo(
    () =>
      /**
       * Two rows of stalls flanking an open corridor down the middle.
       *
       * The gap matters: most city beats put the camera at z = 3-5 looking
       * toward z = 0, so any stall left standing in that lane crosses the
       * subject and the frame reads as scaffolding instead of a market.
       */
      Array.from({length: 10}).map((_, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const k = Math.floor(i / 2);
        return {
          pos: [side * (3.6 + rand(i * 3.3) * 0.7), 0, 2.2 - k * 2.9 + (rand(i * 7.1) - 0.5) * 0.4] as [number, number, number],
          rot: -side * (0.35 + rand(i * 2.1) * 0.3),
          seed: 100 + i * 13,
        };
      }),
    [],
  );
  const rumah = useMemo(
    () =>
      Array.from({length: 22}).map((_, i) => {
        const ring = 9 + rand(i * 5.9) * 16;
        const a = (i / 22) * Math.PI * 2 + rand(i * 1.7) * 0.25;
        return {
          pos: [Math.cos(a) * ring, 0, Math.sin(a) * ring - 4] as [number, number, number],
          seed: 300 + i * 17,
          scale: 0.9 + rand(i * 2.3) * 0.8,
        };
      }),
    [],
  );

  return (
    <group>
      <Ground mood={mood} />
      {/* paved market floor, slightly darker than the open ground */}
      <ToonPart color="#B08A5A" rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, -1]} outline={false}>
        <circleGeometry args={[9.5, 28]} />
      </ToonPart>

      {kios.map((k, i) => (
        <Kios key={i} position={k.pos} rotationY={k.rot} seed={k.seed} frame={frame} />
      ))}

      {/* idols for sale on the carver's bench, and one being worked on */}
      <PatungAbstrak position={[3.9, 1.08, 1.9]} scale={0.3} seed={4} />
      <PatungAbstrak position={[4.2, 1.08, 1.75]} scale={0.26} seed={9} />
      <PatungAbstrak position={[4.6, 0, 0.9]} scale={0.7} seed={14} />

      {/* a large one on a plinth at the far end of the square */}
      <ToonPart color="#8A7B68" position={[0, 0.3, -7.6]} outline={0.035}>
        <boxGeometry args={[2.2, 0.6, 2.2]} />
      </ToonPart>
      <PatungAbstrak position={[0, 0.6, -7.6]} scale={2.1} seed={21} />

      {rumah.map((r, i) => (
        <Rumah key={i} position={r.pos} seed={r.seed} scale={r.scale} />
      ))}

      {[-7.5, 7.8, -11.2, 12.0].map((x, i) => (
        <PohonKurma key={i} position={[x, 0, -6 - i * 2.4]} scale={0.85 + rand(i * 3.1) * 0.3} seed={i * 11} frame={frame} />
      ))}

      {/* gold hour haze, so the "city at its peak" reads as light, not geometry */}
      <DebuCahaya frame={frame} n={70} area={9} height={5} color="#FDE68A" center={[0, 0, -1]} />

      <Actors p={p} handProps={{pemuda_berbekal: 'kantong_perak', fadhil: 'buku_catatan'}} />
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* kuil_tangga — the temple steps                                      */
/* ------------------------------------------------------------------ */
export const KuilTanggaSet: React.FC<KahfiSetProps> = (p) => {
  const {frame, beat} = p;
  const STEPS = 7;
  return (
    <group>
      <Ground mood={beat.mood} />

      {/* the flight of steps the magistrate stands on */}
      {Array.from({length: STEPS}).map((_, i) => (
        <ToonPart key={i} color={i % 2 ? '#B9A88E' : '#C6B59A'} position={[0, 0.16 + i * 0.32, -i * 0.62]} outline={0.03}>
          <boxGeometry args={[7.2 - i * 0.22, 0.32, 0.72]} />
        </ToonPart>
      ))}
      {/* forecourt above the steps */}
      <ToonPart color="#C6B59A" position={[0, 2.26, -6.0]} outline={0.03}>
        <boxGeometry args={[6.0, 0.3, 5.0]} />
      </ToonPart>

      {/* fluted columns: classical in feel, not a reconstruction of a real
          building. Instanced placement from a fixed layout. */}
      {[-2.1, -0.7, 0.7, 2.1].map((x, i) => (
        <group key={i} position={[x, 2.4, -6.6]}>
          <ToonPart color="#D4C7AE" position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.24, 0.27, 3.0, 14]} />
          </ToonPart>
          <ToonPart color="#C0B094" position={[0, 3.08, 0]} outline={0.025}>
            <boxGeometry args={[0.66, 0.2, 0.66]} />
          </ToonPart>
          <ToonPart color="#C0B094" position={[0, 0.04, 0]} outline={0.025}>
            <boxGeometry args={[0.66, 0.16, 0.66]} />
          </ToonPart>
        </group>
      ))}
      {/* architrave */}
      <ToonPart color="#CFC0A4" position={[0, 5.6, -6.6]} outline={0.03}>
        <boxGeometry args={[5.4, 0.42, 1.0]} />
      </ToonPart>

      {/* brazier pair: the warm accent in the dusk palette */}
      {[-2.6, 2.6].map((x, i) => (
        <group key={`b${i}`} position={[x, 0, 1.0]}>
          <ToonPart color="#6B4423" position={[0, 0.5, 0]} outline={0.025}>
            <cylinderGeometry args={[0.16, 0.1, 1.0, 10]} />
          </ToonPart>
          <ToonPart color="#8A7B68" position={[0, 1.06, 0]} outline={0.025}>
            <cylinderGeometry args={[0.34, 0.22, 0.2, 14]} />
          </ToonPart>
          <ToonPart
            color="#F97316"
            emissive="#F97316"
            emissiveIntensity={1.3}
            position={[0, 1.24, 0]}
            scale={[1, 0.85 + 0.18 * Math.sin(frame * 0.6 + i * 2), 1]}
            outline={false}
          >
            <coneGeometry args={[0.2, 0.44, 10]} />
          </ToonPart>
          <pointLight color="#F97316" intensity={3.0} distance={9} decay={2} position={[0, 1.3, 0]} />
        </group>
      ))}

      <DebuCahaya frame={frame} n={46} area={6} height={4} color="#FDBA74" />
      <Actors p={p} handProps={{kepala_pengawal: 'tombak', fadhil: 'buku_catatan'}} />
    </group>
  );
};
