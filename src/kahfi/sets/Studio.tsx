import React, {useMemo} from 'react';
import * as THREE from 'three';
import {ToonPart, FlatPart} from '../../lib/toon';
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
