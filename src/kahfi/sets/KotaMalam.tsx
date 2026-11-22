import React from 'react';
import {ToonPart, FlatPart, rand} from '../../lib/toon';
import {NUR_CORE} from '../lighting';
import {Actors, Ground, Batu, DebuCahaya, Bintang, type KahfiSetProps} from './common';

/**
 * The three night locations of Act 2.
 *
 * They share a vocabulary: mud brick laid in uneven courses, one warm torch
 * against the deep night blue, and a floor that catches just enough light to
 * read. Nothing here is lit brightly — the point of the act is that the city
 * has become dangerous after dark.
 */

/** A wall built from slightly irregular brick courses, so it is not a flat slab. */
const DindingBata: React.FC<{
  w: number;
  h: number;
  d: number;
  position: [number, number, number];
  rotationY?: number;
  seed?: number;
  color?: string;
}> = ({w, h, d, position, rotationY = 0, seed = 0, color = '#8B7E6A'}) => {
  const courses = Math.max(3, Math.round(h / 0.42));
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <ToonPart color={color} position={[0, h / 2, 0]} outline={0.04}>
        <boxGeometry args={[w, h, d]} />
      </ToonPart>
      {/* course lines: thin slabs standing slightly proud of the face */}
      {Array.from({length: courses}).map((_, i) => {
        const y = (i + 0.5) * (h / courses);
        const jut = 0.012 + rand(seed + i) * 0.016;
        return (
          <ToonPart
            key={i}
            color={rand(seed + i * 3) > 0.5 ? '#9A8C76' : '#7E7260'}
            position={[(rand(seed + i * 7) - 0.5) * 0.1, y, d / 2 + jut / 2]}
            outline={0.015}
          >
            <boxGeometry args={[w * (0.9 + rand(seed + i * 5) * 0.1), h / courses - 0.06, jut]} />
          </ToonPart>
        );
      })}
    </group>
  );
};

/** Wall torch: bracket, flame, and the light it actually casts. */
const OborDinding: React.FC<{position: [number, number, number]; frame: number; seed?: number}> = ({
  position,
  frame,
  seed = 0,
}) => {
  /* Flicker is deterministic: frame in, brightness out. No wall clock. */
  const flick = 0.82 + 0.18 * Math.sin(frame * 0.62 + seed) + 0.09 * (rand(frame * 2.3 + seed) - 0.5);
  return (
    <group position={position}>
      <ToonPart color="#4A3828" position={[0, -0.18, 0.12]} rotation={[0.5, 0, 0]} outline={0.016}>
        <cylinderGeometry args={[0.026, 0.03, 0.4, 8]} />
      </ToonPart>
      <ToonPart color="#F97316" emissive="#F97316" emissiveIntensity={1.5} scale={[1, flick, 1]} outline={false}>
        <coneGeometry args={[0.14, 0.42, 10]} />
      </ToonPart>
      <ToonPart color="#FDE68A" emissive="#FDE68A" emissiveIntensity={1.8} position={[0, -0.04, 0]} scale={[1, flick, 1]} outline={false}>
        <coneGeometry args={[0.07, 0.2, 8]} />
      </ToonPart>
      <pointLight color="#F97316" intensity={6.5 * flick} distance={13} decay={2} position={[0, 0.1, 0.2]} />
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* gang_batu — the narrow stone alley (beat 10)                        */
/* ------------------------------------------------------------------ */
export const GangBatuSet: React.FC<KahfiSetProps> = (p) => {
  const {frame, beat} = p;
  return (
    <group>
      <Ground mood={beat.mood} size={60} />
      {/* worn stone paving down the middle of the alley */}
      <ToonPart color="#6B6150" rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, -2]} outline={false}>
        <planeGeometry args={[3.0, 30]} />
      </ToonPart>
      {Array.from({length: 22}).map((_, i) => (
        <ToonPart
          key={i}
          color={rand(i * 3.7) > 0.5 ? '#766B58' : '#625949'}
          position={[(rand(i * 1.9) - 0.5) * 2.2, 0.02, 3 - i * 1.1]}
          rotation={[-Math.PI / 2, 0, rand(i * 5.1) * 0.4]}
          outline={0.014}
        >
          <boxGeometry args={[0.7 + rand(i * 2.3) * 0.5, 0.5 + rand(i * 4.1) * 0.4, 0.02]} />
        </ToonPart>
      ))}

      {/* the two walls, close enough that the frame feels like a corridor */}
      <DindingBata w={0.7} h={5.2} d={24} position={[-2.0, 0, -4]} seed={11} />
      <DindingBata w={0.7} h={4.6} d={24} position={[2.0, 0, -4]} seed={29} color="#80735F" />

      {/* an arch closing the far end, so the alley has somewhere to lead */}
      <ToonPart color="#6E6252" position={[0, 4.9, -14]} outline={0.04}>
        <boxGeometry args={[4.8, 0.9, 1.0]} />
      </ToonPart>
      <FlatPart color="#0B1020" position={[0, 2.4, -14.1]}>
        <planeGeometry args={[3.4, 4.6]} />
      </FlatPart>

      {/* shuttered windows high on the walls: the city is awake but hiding */}
      {[
        [-1.62, 3.1, -1.5],
        [1.62, 2.8, -5.2],
        [-1.62, 2.6, -8.6],
      ].map((pos, i) => (
        <ToonPart key={i} color="#3A2A1C" position={pos as [number, number, number]} outline={0.02}>
          <boxGeometry args={[0.06, 0.8, 0.62]} />
        </ToonPart>
      ))}

      <OborDinding position={[-1.6, 2.5, 0.4]} frame={frame} seed={1} />
      <OborDinding position={[1.6, 2.4, -6.0]} frame={frame} seed={4} />

      <Bintang frame={frame} n={70} radius={50} />
      <DebuCahaya frame={frame} n={70} area={2.4} height={4} color="#93C5FD" center={[0, 0, -3]} />
      <Actors p={p} handProps={{kepala_pengawal: 'tombak', fadhil: 'buku_catatan'}} />
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* rumah_pintu — the house door leaking Nur (beats 11, 12)             */
/* ------------------------------------------------------------------ */
export const RumahPintuSet: React.FC<KahfiSetProps> = (p) => {
  const {frame, beat} = p;
  /* The door swings a little further open across the two beats. */
  const open = 0.42 + 0.16 * Math.min(1, (frame - beat.startSec * p.fps) / Math.max(1, (beat.endSec - beat.startSec) * p.fps));
  return (
    <group>
      <Ground mood={beat.mood} size={50} />
      <ToonPart color="#6B6150" rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, 1.2]} outline={false}>
        <planeGeometry args={[7, 8]} />
      </ToonPart>

      {/* the house front */}
      <DindingBata w={7.2} h={4.4} d={0.6} position={[0, 0, -2.2]} seed={41} color="#8B7E6A" />
      {/* frond roof edge */}
      {[0, 1, 2, 3, 4].map((i) => (
        <ToonPart key={i} color="#7A6239" position={[-2.6 + i * 1.3, 4.5, -1.95]} rotation={[0.12, 0, 0]} outline={0.022}>
          <boxGeometry args={[1.34, 0.1, 0.9]} />
        </ToonPart>
      ))}

      {/* doorway recess, then the door itself swung ajar */}
      <FlatPart color="#0A0E18" position={[0, 1.42, -1.88]}>
        <planeGeometry args={[1.3, 2.84]} />
      </FlatPart>
      <ToonPart color="#5C4033" position={[0, 1.5, -1.9]} outline={0.03}>
        <boxGeometry args={[1.6, 3.0, 0.14]} scale={[1, 1, 1]} />
      </ToonPart>
      {/* the leaf, hinged on the left */}
      <group position={[-0.62, 0, -1.84]} rotation={[0, open, 0]}>
        <ToonPart color="#6B4423" position={[0.56, 1.42, 0.06]} outline={0.03}>
          <boxGeometry args={[1.14, 2.76, 0.1]} />
        </ToonPart>
        {[0.55, 1.42, 2.3].map((y, i) => (
          <ToonPart key={i} color="#4A2F18" position={[0.56, y, 0.12]} outline={0.014}>
            <boxGeometry args={[1.06, 0.1, 0.03]} />
          </ToonPart>
        ))}
      </group>

      {/**
       * Nur spilling from the gap.
       *
       * This is how the beat shows T2 figures inside without putting the
       * group on screen: the light is theirs, and the number of people it
       * belongs to stays unreadable. It takes NUR_CORE, the real constant,
       * because it really is Nur and not a warm lamp.
       */}
      <FlatPart color={NUR_CORE} position={[0.52, 1.42, -1.8]} transparent opacity={0.9}>
        <planeGeometry args={[0.2, 2.7]} />
      </FlatPart>
      <FlatPart color={NUR_CORE} position={[0.75, 0.02, -0.4]} rotation={[-Math.PI / 2, 0, 0.18]} transparent opacity={0.3}>
        <planeGeometry args={[1.1, 3.0]} />
      </FlatPart>
      <pointLight color={NUR_CORE} intensity={5.5} distance={11} decay={2} position={[0.6, 1.5, -1.5]} />

      {/* a step, two water jars and a basket: lived-in, not a stage flat */}
      <ToonPart color="#7E7260" position={[0, 0.09, -1.35]} outline={0.025}>
        <boxGeometry args={[2.2, 0.18, 0.7]} />
      </ToonPart>
      {[-1.5, 1.45].map((x, i) => (
        <group key={i} position={[x, 0, -1.3]}>
          <ToonPart color="#8C5A3C" position={[0, 0.3, 0]} outline={0.022} scale={[1, 1.15, 1]}>
            <sphereGeometry args={[0.28, 16, 12]} />
          </ToonPart>
          <ToonPart color="#6F452C" position={[0, 0.62, 0]} outline={0.016}>
            <cylinderGeometry args={[0.1, 0.14, 0.14, 12]} />
          </ToonPart>
        </group>
      ))}
      <ToonPart color="#7A5230" position={[2.3, 0.14, -0.9]} outline={0.02}>
        <cylinderGeometry args={[0.26, 0.2, 0.28, 14]} />
      </ToonPart>

      <OborDinding position={[-2.6, 2.4, -1.78]} frame={frame} seed={7} />
      <Batu position={[-3.2, 0.08, 0.9]} scale={0.22} seed={77} color="#6E6252" />
      <Batu position={[3.0, 0.08, 0.4]} scale={0.18} seed={83} color="#6E6252" />

      <Bintang frame={frame} n={90} radius={48} />
      <DebuCahaya frame={frame} n={60} area={3.4} height={3.4} color="#FBEBC4" center={[0.6, 0, -0.8]} />
      <Actors p={p} handProps={{fadhil: 'buku_catatan'}} />
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* gerbang_kota — the heavy city gate (beat 13)                        */
/* ------------------------------------------------------------------ */
export const GerbangKotaSet: React.FC<KahfiSetProps> = (p) => {
  const {frame, beat} = p;
  return (
    <group>
      <Ground mood={beat.mood} size={80} />
      {/* the road out, running away from the city */}
      <ToonPart color="#6B6150" rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, -6]} outline={false}>
        <planeGeometry args={[4.2, 40]} />
      </ToonPart>

      {/* two gate towers */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 3.4, 0, -1.4]}>
          <DindingBata w={2.4} h={6.4} d={2.4} position={[0, 0, 0]} seed={s > 0 ? 51 : 67} color="#80735F" />
          {/* crenellations */}
          {[-0.8, 0, 0.8].map((x, i) => (
            <ToonPart key={i} color="#6E6252" position={[x, 6.6, 0]} outline={0.03}>
              <boxGeometry args={[0.5, 0.5, 2.4]} />
            </ToonPart>
          ))}
        </group>
      ))}
      {/* the beam across the top */}
      <ToonPart color="#6E6252" position={[0, 6.2, -1.4]} outline={0.04}>
        <boxGeometry args={[8.4, 0.9, 2.0]} />
      </ToonPart>

      {/* the gate leaves, standing open */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 2.1, 0, -1.2]} rotation={[0, -s * 0.62, 0]}>
          <ToonPart color="#6B4423" position={[s * 1.0, 2.6, 0]} outline={0.04}>
            <boxGeometry args={[2.1, 5.2, 0.24]} />
          </ToonPart>
          {[0.8, 2.1, 3.4, 4.7].map((y, i) => (
            <ToonPart key={i} color="#4A2F18" position={[s * 1.0, y, 0.15]} outline={0.016}>
              <boxGeometry args={[1.96, 0.16, 0.04]} />
            </ToonPart>
          ))}
          {/* iron studs */}
          {[1.2, 2.6, 4.0].map((y, i) => (
            <ToonPart key={`s${i}`} color="#5A5A5A" position={[s * 1.0, y, 0.2]} outline={0.012}>
              <sphereGeometry args={[0.08, 10, 8]} />
            </ToonPart>
          ))}
        </group>
      ))}

      <OborDinding position={[-2.2, 3.4, -0.2]} frame={frame} seed={13} />
      <OborDinding position={[2.2, 3.4, -0.2]} frame={frame} seed={17} />

      {/* scree and a milestone on the way out, so the road has somewhere to go */}
      {Array.from({length: 9}).map((_, i) => (
        <Batu
          key={i}
          position={[(rand(i * 2.7) - 0.5) * 7, 0.07, -4 - rand(i * 3.3) * 12]}
          scale={0.18 + rand(i * 5.9) * 0.3}
          seed={90 + i * 7}
          color="#6E6252"
        />
      ))}
      <ToonPart color="#7E7260" position={[2.9, 0.42, -7.5]} rotation={[0, 0.3, 0.06]} outline={0.025}>
        <boxGeometry args={[0.34, 0.84, 0.24]} />
      </ToonPart>

      <Bintang frame={frame} n={120} radius={60} />
      <DebuCahaya frame={frame} n={90} area={7} height={4} color="#93C5FD" center={[0, 0, -4]} />
      <Actors p={p} handProps={{fadhil: 'buku_catatan'}} />
    </group>
  );
};
