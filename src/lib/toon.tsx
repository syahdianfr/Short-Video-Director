import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Outlines} from '@react-three/drei';

/** 2-step gradient => hard, "broken" cel shadow. Shared singleton. */
let gradientSingleton: THREE.DataTexture | null = null;
export const getToonGradient = (): THREE.DataTexture => {
  if (gradientSingleton) return gradientSingleton;
  const data = new Uint8Array([110, 110, 110, 255, 255, 255, 255, 255]);
  const tex = new THREE.DataTexture(data, 2, 1, THREE.RGBAFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  gradientSingleton = tex;
  return tex;
};

export const INK = '#111111';
export const OUTLINE = 0.035;

/** The house outline. drei's `screenspace` flag makes `thickness` world units (0.035 m). */
export const Ink: React.FC<{thickness?: number}> = ({thickness = OUTLINE}) => (
  <Outlines thickness={thickness} color={INK} screenspace />
);

type MeshProps = React.ComponentProps<'mesh'>;

/** A toon-shaded, ink-outlined mesh. Pass a geometry element as child. */
export const ToonPart: React.FC<
  MeshProps & {
    color: string;
    outline?: boolean | number;
    map?: THREE.Texture | null;
    emissive?: string;
    emissiveIntensity?: number;
    transparent?: boolean;
    opacity?: number;
    side?: THREE.Side;
  }
> = ({color, outline = true, map, emissive, emissiveIntensity, transparent, opacity, side, children, ...rest}) => {
  const gradient = getToonGradient();
  return (
    <mesh {...rest}>
      {children}
      <meshToonMaterial
        color={color}
        gradientMap={gradient}
        map={map ?? null}
        emissive={emissive ?? '#000000'}
        emissiveIntensity={emissiveIntensity ?? 0}
        transparent={transparent}
        opacity={opacity ?? 1}
        side={side ?? THREE.FrontSide}
      />
      {outline ? <Ink thickness={typeof outline === 'number' ? outline : OUTLINE} /> : null}
    </mesh>
  );
};

/** Flat (unlit) mesh, used for paper/labels/sky cards. */
export const FlatPart: React.FC<
  MeshProps & {color?: string; map?: THREE.Texture | null; transparent?: boolean; opacity?: number; side?: THREE.Side}
> = ({color = '#ffffff', map, transparent, opacity, side, children, ...rest}) => (
  <mesh {...rest}>
    {children}
    <meshBasicMaterial
      color={color}
      map={map ?? null}
      transparent={transparent}
      opacity={opacity ?? 1}
      side={side ?? THREE.FrontSide}
      toneMapped={false}
    />
  </mesh>
);

/* ------------------------------------------------------------------ */
/* Canvas textures (diegetic text, faces, maps). Cached by key.         */
/* ------------------------------------------------------------------ */
const texCache = new Map<string, THREE.CanvasTexture>();

export const canvasTexture = (
  key: string,
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
): THREE.CanvasTexture => {
  const hit = texCache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  texCache.set(key, tex);
  return tex;
};

export const useCanvasTexture = (
  key: string,
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
) => useMemo(() => canvasTexture(key, w, h, draw), [key]); // eslint-disable-line react-hooks/exhaustive-deps

export const FONT_BLACK = '"Inter Display Black", "Inter Black", Inter, "DejaVu Sans", sans-serif';
export const FONT_TYPE = '"Courier 10 Pitch", "Courier New", FreeMono, monospace';

/** Deterministic pseudo-random in [0,1). */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
export const easeInOut = (t: number) => {
  const x = clamp01(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
