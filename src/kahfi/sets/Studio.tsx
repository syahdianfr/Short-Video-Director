import React, {useMemo} from 'react';
import * as THREE from 'three';
import {ToonPart, FlatPart, rand} from '../../lib/toon';
import {Actors, Bara, type KahfiSetProps} from './common';
import {NUR_CORE} from '../lighting';

/* ------------------------------------------------------------------ */
/* studio — the everyday-object analogy room                           */
/*                                                                     */
/* The only non-historical space in the film. Flat #E2E8F0, no fog, no  */
/* grain: the abstraction is supposed to feel like a clean table, not a */
/* place. The wind is drawn as motion lines rather than a particle      */
/* effect, which keeps the segment cheap and the read instant.          */
/* ------------------------------------------------------------------ */
export const StudioSet: React.FC<KahfiSetProps> = (p) => {
  const {frame, beat} = p;

  /** Beat 24 closes a palm over the embers; the glow rises as it does. */
  const shielding = beat.n >= 24;
  const span = Math.max(1, (beat.endSec - beat.startSec) * p.fps);
  const k = Math.min(1, Math.max(0, (frame - beat.startSec * p.fps) / span));
  const glow = shielding ? k : 0.25;

  /* A curved backdrop so the horizon line disappears, like a photo sweep. */
  const sweep = useMemo(() => {
    const pts = [new THREE.Vector2(9, 0), new THREE.Vector2(9, 3.2), new THREE.Vector2(7.2, 6.4), new THREE.Vector2(4.0, 8.0)];
    return new THREE.LatheGeometry(pts, 36);
  }, []);

  /** Wind, drawn: three slim arcs sliding past, so "angin" reads with no VFX. */
  const windLines = Array.from({length: 3}).map((_, i) => {
    const phase = ((frame * 0.02 + i * 0.33) % 1 + 1) % 1;
    const x = -3.2 + phase * 6.4;
    const y = 1.5 + i * 0.26;
    const fade = Math.sin(phase * Math.PI);
    return {x, y, fade, len: 0.5 + 0.35 * fade};
  });

  return (
    <group>
      {/* floor and sweep, both unlit-flat so the room has no visible corner */}
      <FlatPart color="#D6DEE9" rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[9, 40]} />
      </FlatPart>
      <mesh geometry={sweep} position={[0, 0, 0]}>
        <meshBasicMaterial color="#E2E8F0" side={THREE.BackSide} toneMapped={false} />
      </mesh>

      {/* a soft contact shadow under the subject, the room's only depth cue */}
      <FlatPart color="#9AA7B8" rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0.1]} transparent opacity={0.3}>
        <circleGeometry args={[0.8, 26]} />
      </FlatPart>

      {/* the embers. Beat 23 holds the bowl in hand; beat 24 is the extreme
          close-up, so the bowl is placed in the world and the hand shields it. */}
      {shielding ? (
        <group position={[0, 1.18, 0.34]}>
          <ToonPart color="#8C5A3C" outline={0.018}>
            <cylinderGeometry args={[0.17, 0.11, 0.13, 22]} />
          </ToonPart>
          <Bara frame={frame} position={[0, 0.08, 0]} intensity={glow} />
        </group>
      ) : null}

      {windLines.map((w, i) => (
        <FlatPart
          key={i}
          color="#94A3B8"
          position={[w.x, w.y, 0.9]}
          scale={[w.len, 0.022, 1]}
          transparent
          opacity={0.5 * w.fade}
        >
          <planeGeometry args={[1, 1]} />
        </FlatPart>
      ))}

      <Actors p={p} handProps={{fadhil: shielding ? 'none' : 'mangkuk_bara'}} />
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Staging set for the three locations not yet built:                  */
/* gang_batu, rumah_pintu, gerbang_kota.                               */
/*                                                                     */
/* It is a real, renderable set rather than an empty scene: ground,     */
/* a back wall and two side masses, lit by the beat's own mood. Blocking*/
/* and camera framing can be judged from it, and the adab rules still  */
/* apply because the characters come from the same rig. A small label   */
/* names the set so a still is never mistaken for finished work.       */
/* ------------------------------------------------------------------ */
export const StagingSet: React.FC<KahfiSetProps> = (p) => {
  const {frame, beat} = p;
  const narrow = beat.set === 'gang_batu';
  const gate = beat.set === 'gerbang_kota';

  return (
    <group>
      <ToonPart color="#7A6E5C" rotation={[-Math.PI / 2, 0, 0]} outline={false}>
        <circleGeometry args={[60, 32]} />
      </ToonPart>

      {/* side masses: tight for the alley, open for the gate */}
      {[-1, 1].map((s) => (
        <ToonPart
          key={s}
          color={s < 0 ? '#8B7E6A' : '#80735F'}
          position={[s * (narrow ? 1.5 : 3.4), 1.9, -2.0]}
          scale={[narrow ? 1.0 : 2.2, 3.8, 7.0]}
          outline={0.04}
        >
          <boxGeometry args={[1, 1, 1]} />
        </ToonPart>
      ))}

      {gate ? (
        <>
          {/* heavy wooden gate leaves and a cross beam */}
          {[-1, 1].map((s) => (
            <ToonPart key={s} color="#6B4423" position={[s * 1.25, 1.9, -1.4]} rotation={[0, s * 0.5, 0]} outline={0.04}>
              <boxGeometry args={[2.3, 3.8, 0.22]} />
            </ToonPart>
          ))}
          <ToonPart color="#4A2F18" position={[0, 3.9, -1.4]} outline={0.04}>
            <boxGeometry args={[6.4, 0.5, 0.6]} />
          </ToonPart>
        </>
      ) : (
        /* a doorway that leaks warm light, for the rumah_pintu beats */
        <>
          <ToonPart color="#5C4033" position={[0, 1.4, -1.9]} outline={0.035}>
            <boxGeometry args={[1.2, 2.8, 0.18]} />
          </ToonPart>
          {/* Nur spilling through the door gap: T2 figures are inside. A real
              Nur usage, so it takes the constant, not a copied hex. */}
          <FlatPart color={NUR_CORE} position={[0.68, 1.4, -1.78]} transparent opacity={0.85}>
            <planeGeometry args={[0.16, 2.6]} />
          </FlatPart>
          <pointLight color={NUR_CORE} intensity={2.6} distance={9} decay={2} position={[0.7, 1.5, -1.6]} />
        </>
      )}

      {/* wall torch, so the night palette has one warm anchor */}
      <group position={[narrow ? -1.0 : -2.3, 2.2, 0.4]}>
        <ToonPart color="#F97316" emissive="#F97316" emissiveIntensity={1.4} scale={[1, 0.85 + 0.2 * Math.sin(frame * 0.7), 1]} outline={false}>
          <coneGeometry args={[0.13, 0.4, 10]} />
        </ToonPart>
        <pointLight color="#F97316" intensity={4.2} distance={12} decay={2} />
      </group>

      {Array.from({length: 7}).map((_, i) => (
        <ToonPart
          key={i}
          color="#6E6252"
          position={[(rand(i * 3.1) - 0.5) * 5, 0.08, 1.4 + rand(i * 5.3) * 2.4]}
          scale={0.12 + rand(i * 7.7) * 0.2}
          outline={0.02}
        >
          <icosahedronGeometry args={[1, 0]} />
        </ToonPart>
      ))}

      <Actors p={p} handProps={{kepala_pengawal: 'tombak', fadhil: 'buku_catatan'}} />
    </group>
  );
};
