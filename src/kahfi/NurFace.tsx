import React from 'react';
import * as THREE from 'three';
import {Billboard} from '@react-three/drei';
import {canvasTexture} from '../lib/toon';
import {NUR_CORE, NUR_HALO} from './lighting';

/**
 * The Nur face of a T2 figure.
 *
 * Contract — all four points are adab requirements, not styling choices:
 *
 *  1. The disc radius is 1.2x the head radius, so it covers the whole front
 *     of the head rather than sitting inside its silhouette.
 *  2. It lives inside <Billboard>, so it always squarely faces the camera.
 *     That is what makes a profile or three-quarter shot safe: there is no
 *     angle from which a face line, an eye, a nose or a mouth can appear.
 *  3. It is pushed 1.05x the head radius toward the camera, which puts it
 *     OUTSIDE the head sphere. This is load-bearing: at any offset smaller
 *     than the radius the disc sits inside the sphere and the lit skin draws
 *     in front of it, which is an adab failure, not a cosmetic one.
 *  4. The material is unlit (MeshBasicMaterial), `toneMapped={false}` and
 *     `fog={false}`. Without the last two, the deep night blue and crisis
 *     red moods would wash the Nur out, and the figure would read as a
 *     faceless shadow instead of a lit one.
 *
 * There is no expression atlas and no lip-sync here, by construction and not
 * by convention: this component simply has nowhere to put them.
 *
 * The pulse is driven by the frame, never by delta time, so two renders of
 * the same frame are identical.
 */

const haloTexture = () =>
  canvasTexture('nur-halo', 256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    /* Bright core falling to nothing: an additive glow with no hard edge. */
    g.addColorStop(0.0, 'rgba(255,251,235,1)');
    g.addColorStop(0.32, 'rgba(254,243,199,0.78)');
    g.addColorStop(0.62, 'rgba(254,243,199,0.26)');
    g.addColorStop(1.0, 'rgba(254,243,199,0)');
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

export interface NurFaceProps {
  /** Head radius in character-local units. */
  headRadius: number;
  /** Absolute frame. Drives the pulse deterministically. */
  frame: number;
  /** Per-figure phase offset so a group of T2 figures does not pulse in unison. */
  seed?: number;
}

export const NurFace: React.FC<NurFaceProps> = ({headRadius, frame, seed = 0}) => {
  const halo = haloTexture();
  /* Deterministic breathing pulse, exactly as the series bible fixes it. */
  const pulse = 0.9 + 0.1 * Math.sin(frame * 0.08 + seed);
  const r = headRadius * 1.2;
  /* Outside the sphere, not inside it. See point 3 above. */
  const forward = headRadius * 1.05;

  return (
    <Billboard>
      {/* Halo: additive, behind the core, never writes depth so it cannot
          punch a hole in the set behind the character. */}
      <mesh position={[0, 0, forward - 0.004]} scale={pulse} renderOrder={8}>
        <planeGeometry args={[r * 2.4, r * 2.4]} />
        <meshBasicMaterial
          map={halo}
          color={NUR_HALO}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
          fog={false}
        />
      </mesh>

      {/* Core disc: the face itself. Opaque, depth-writing, so it reliably
          occludes the head sphere from every angle. No outline: an ink line
          around the Nur would read as a drawn face edge. */}
      <mesh position={[0, 0, forward]} scale={pulse} renderOrder={9}>
        <circleGeometry args={[r, 48]} />
        <meshBasicMaterial color={NUR_CORE} toneMapped={false} fog={false} />
      </mesh>

      {/* The Nur has to LIGHT the scene, not just appear in it. An unlit
          material emits nothing, so inside the cave — where the design makes
          these faces the only source — the room would stay black and the
          figures would read as shadows. This lamp is what makes the mood
          `nur_gua` true rather than merely named. */}
      <pointLight color={NUR_CORE} intensity={1.5 * pulse} distance={6.5} decay={2} position={[0, 0, forward * 0.5]} />
    </Billboard>
  );
};
