/**
 * External CC0 assets (see public/assets/CREDITS.md):
 *  - Poly Haven HDRIs → tonemapped equirect sky panoramas (public/assets/sky)
 *  - Poly Haven PBR diffuse textures (public/assets/textures)
 *  - Kenney Nature / Furniture / Survival kit GLB models (public/assets/models)
 *
 * Every GLB is re-shaded with the house MeshToonMaterial (2-step gradient) and
 * gets drei <Outlines>, so imported models match the cel-shaded rig.
 */
import React, {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {useGLTF, useTexture} from '@react-three/drei';
import {staticFile} from 'remotion';
import {getToonGradient, Ink, rand} from './toon';
import type {Vec3} from '../types';

/* ------------------------------------------------------------------ */
/* Sky (HDRI-derived panoramas)                                         */
/* ------------------------------------------------------------------ */
export const SKIES = {
  day: 'assets/sky/kloofendal_43d_clear_puresky.jpg',
  golden: 'assets/sky/qwantani_late_afternoon_puresky.jpg',
  sunset: 'assets/sky/qwantani_sunset_puresky.jpg',
  crisis: 'assets/sky/crisis_red.jpg',
  night: 'assets/sky/night_blue.jpg',
  dawn: 'assets/sky/kiara_1_dawn.jpg',
} as const;
export type SkyId = keyof typeof SKIES;

export const Sky: React.FC<{sky: SkyId; rotation?: number; intensity?: number}> = ({sky, rotation = 0, intensity = 1}) => {
  const tex = useTexture(staticFile(SKIES[sky]));
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    scene.background = tex;
    scene.backgroundRotation.set(0, rotation, 0);
    scene.backgroundIntensity = intensity;
  });
  return null;
};

/* ------------------------------------------------------------------ */
/* Tiled PBR diffuse textures                                           */
/* ------------------------------------------------------------------ */
export const TEX = {
  grass: 'assets/textures/leafy_grass_diff_1k.jpg',
  sand: 'assets/textures/sandy_gravel_diff_1k.jpg',
  gravel: 'assets/textures/rocky_gravel_diff_1k.jpg',
  planks: 'assets/textures/wooden_rough_planks_diff_1k.jpg',
  brick: 'assets/textures/sandstone_brick_wall_01_diff_1k.jpg',
  rust: 'assets/textures/metal_grate_rusty_diff_1k.jpg',
  leaves: 'assets/textures/forest_leaves_02_diff_1k.jpg',
} as const;
export type TexId = keyof typeof TEX;

const tiledCache = new Map<string, THREE.Texture>();
export const useTiled = (id: TexId, rx: number, ry = rx): THREE.Texture => {
  const base = useTexture(staticFile(TEX[id]));
  const key = `${id}-${rx}-${ry}`;
  const hit = tiledCache.get(key);
  if (hit) return hit;
  const t = base.clone();
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  tiledCache.set(key, t);
  return t;
};

/** Textured toon ground plane (PBR diffuse as albedo, tinted to the palette). */
export const TexGround: React.FC<{tex: TexId; color?: string; size?: number; repeat?: number; y?: number; position?: Vec3; width?: number; depth?: number}> = ({
  tex,
  color = '#ffffff',
  size = 80,
  repeat = 40,
  y = 0,
  position,
  width,
  depth,
}) => {
  const map = useTiled(tex, repeat, depth && width ? (repeat * depth) / width : repeat);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position ?? [0, y, 0]}>
      {width && depth ? <planeGeometry args={[width, depth]} /> : <circleGeometry args={[size, 64]} />}
      <meshToonMaterial color={color} map={map} gradientMap={getToonGradient()} />
    </mesh>
  );
};

/* ------------------------------------------------------------------ */
/* Kenney GLB models, re-shaded toon + ink                              */
/* ------------------------------------------------------------------ */
export const MODELS = {
  // nature kit
  palm: 'assets/models/nature/tree_palm.glb',
  palmBend: 'assets/models/nature/tree_palmBend.glb',
  palmTall: 'assets/models/nature/tree_palmTall.glb',
  palmShort: 'assets/models/nature/tree_palmShort.glb',
  palmDetailed: 'assets/models/nature/tree_palmDetailedTall.glb',
  tree: 'assets/models/nature/tree_default.glb',
  treeOak: 'assets/models/nature/tree_oak.glb',
  treeFat: 'assets/models/nature/tree_fat.glb',
  bush: 'assets/models/nature/plant_bush.glb',
  bushLarge: 'assets/models/nature/plant_bushLarge.glb',
  bushDetailed: 'assets/models/nature/plant_bushDetailed.glb',
  grass: 'assets/models/nature/grass_large.glb',
  grassLeafs: 'assets/models/nature/grass_leafs.glb',
  rockA: 'assets/models/nature/rock_largeA.glb',
  rockB: 'assets/models/nature/rock_largeB.glb',
  rockSmall: 'assets/models/nature/rock_smallA.glb',
  stone: 'assets/models/nature/stone_largeA.glb',
  cliff: 'assets/models/nature/cliff_large_rock.glb',
  flower: 'assets/models/nature/flower_redA.glb',
  log: 'assets/models/nature/log.glb',
  // furniture kit
  desk: 'assets/models/furniture/desk.glb',
  chairDesk: 'assets/models/furniture/chairDesk.glb',
  chair: 'assets/models/furniture/chair.glb',
  tableRound: 'assets/models/furniture/tableRound.glb',
  table: 'assets/models/furniture/table.glb',
  bookcaseOpen: 'assets/models/furniture/bookcaseOpen.glb',
  bookcaseClosed: 'assets/models/furniture/bookcaseClosed.glb',
  lampTable: 'assets/models/furniture/lampRoundTable.glb',
  lampFloor: 'assets/models/furniture/lampRoundFloor.glb',
  rug: 'assets/models/furniture/rugRectangle.glb',
  rugRound: 'assets/models/furniture/rugRounded.glb',
  pottedPlant: 'assets/models/furniture/pottedPlant.glb',
  books: 'assets/models/furniture/books.glb',
  radio: 'assets/models/furniture/radio.glb',
  coatRack: 'assets/models/furniture/coatRack.glb',
  sideTable: 'assets/models/furniture/sideTable.glb',
  loungeChair: 'assets/models/furniture/loungeChair.glb',
  // survival kit
  crate: 'assets/models/survival/box.glb',
  barrel: 'assets/models/survival/barrel.glb',
  chest: 'assets/models/survival/chest.glb',
} as const;
export type ModelId = keyof typeof MODELS;

type Part = {geometry: THREE.BufferGeometry; matrix: THREE.Matrix4; color: string};
type Prepared = {parts: Part[]; size: THREE.Vector3; center: THREE.Vector3; minY: number};
const prepCache = new Map<string, Prepared>();

const prepare = (id: ModelId, scene: THREE.Object3D): Prepared => {
  const hit = prepCache.get(id);
  if (hit) return hit;
  scene.updateMatrixWorld(true);
  const parts: Part[] = [];
  scene.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    const mat = (Array.isArray(m.material) ? m.material[0] : m.material) as THREE.MeshStandardMaterial;
    // Kenney stores sRGB values in baseColorFactor: read them raw so the palette is not washed out.
    parts.push({geometry: m.geometry, matrix: m.matrixWorld.clone(), color: `#${mat.color ? mat.color.getHexString(THREE.LinearSRGBColorSpace) : 'cccccc'}`});
  });
  const box = new THREE.Box3().setFromObject(scene);
  const prepared = {parts, size: box.getSize(new THREE.Vector3()), center: box.getCenter(new THREE.Vector3()), minY: box.min.y};
  prepCache.set(id, prepared);
  return prepared;
};

export interface KModelProps {
  id: ModelId;
  position?: Vec3;
  rotation?: Vec3;
  /** Uniform scale, or use `height` to fit the model to a target height (world units). */
  scale?: number;
  height?: number;
  /** Ink thickness in world units (compensated for scale). */
  ink?: number | false;
  /** Multiply every material colour (e.g. for night tint). */
  tint?: string;
}

/** A Kenney model, bottom-centred on its origin, re-shaded with the house toon material. */
export const KModel: React.FC<KModelProps> = ({id, position = [0, 0, 0], rotation = [0, 0, 0], scale, height, ink = 0.03, tint}) => {
  const {scene} = useGLTF(staticFile(MODELS[id]), false);
  const prep = prepare(id, scene);
  const s = height ? height / Math.max(prep.size.y, 1e-3) : scale ?? 1;
  const gradient = getToonGradient();
  const tintColor = useMemo(() => (tint ? new THREE.Color(tint) : null), [tint]);
  return (
    <group position={position} rotation={rotation} scale={s}>
      <group position={[-prep.center.x, -prep.minY, -prep.center.z]}>
        {prep.parts.map((p, i) => {
          const c = new THREE.Color(p.color);
          if (tintColor) c.multiply(tintColor);
          return (
            <mesh key={i} geometry={p.geometry} matrix={p.matrix} matrixAutoUpdate={false}>
              <meshToonMaterial color={c} gradientMap={gradient} />
              {ink ? <Ink thickness={ink / s} /> : null}
            </mesh>
          );
        })}
      </group>
    </group>
  );
};

Object.values(MODELS).forEach((m) => useGLTF.preload(staticFile(m), false));
Object.values(SKIES).forEach((u) => useTexture.preload(staticFile(u)));
Object.values(TEX).forEach((u) => useTexture.preload(staticFile(u)));

/* ------------------------------------------------------------------ */
/* Scatter helpers (deterministic)                                      */
/* ------------------------------------------------------------------ */
const PALMS: ModelId[] = ['palm', 'palmBend', 'palmTall', 'palmDetailed', 'palmShort'];

/** Kenney palm with a gentle wind sway. Height ~5.5 m at scale 1. */
export const KPalm: React.FC<{position: Vec3; scale?: number; seed?: number; t?: number}> = ({position, scale = 1, seed = 0, t = 0}) => {
  const id = PALMS[Math.abs(Math.floor(seed * 7.3)) % PALMS.length];
  return (
    <group position={position} rotation={[0.02 * Math.sin(t * 1.4 + seed), seed * 2.1, 0.03 * Math.sin(t * 1.1 + seed * 3)]}>
      <KModel id={id} height={5.4 * scale} ink={0.04} />
    </group>
  );
};

/** Bushes, grass tufts, rocks and flowers scattered in an annulus / box, avoiding a clear zone. */
export const Foliage: React.FC<{
  n: number;
  seed?: number;
  area: [number, number, number, number]; // xMin, xMax, zMin, zMax
  clear?: [number, number, number, number];
  kinds?: ModelId[];
  scale?: number;
  tint?: string;
}> = ({n, seed = 1, area, clear, kinds = ['bush', 'grass', 'bushLarge', 'grassLeafs', 'rockSmall', 'flower', 'bushDetailed'], scale = 1, tint}) => {
  const items: React.ReactNode[] = [];
  let k = 0;
  for (let i = 0; items.length < n && i < n * 6; i++) {
    const x = area[0] + rand(seed * 31 + i * 3.7) * (area[1] - area[0]);
    const z = area[2] + rand(seed * 17 + i * 5.3) * (area[3] - area[2]);
    if (clear && x > clear[0] && x < clear[1] && z > clear[2] && z < clear[3]) continue;
    const id = kinds[Math.floor(rand(seed + i * 9.1) * kinds.length)];
    const sc = (0.8 + rand(seed + i * 2.2) * 0.7) * scale;
    const base = id.startsWith('rock') ? 2.2 : id === 'flower' ? 2.4 : 3.2;
    items.push(<KModel key={k++} id={id} position={[x, 0, z]} rotation={[0, rand(i + seed) * 6.28, 0]} scale={base * sc} ink={0.025} tint={tint} />);
  }
  return <group>{items}</group>;
};
