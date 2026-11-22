import {useEffect, useState} from 'react';
import * as THREE from 'three';
import {continueRender, delayRender, staticFile} from 'remotion';

/**
 * Surface textures, from Poly Haven (CC0).
 *
 * They are NOT used as photographic surfaces. Each one was posterised before
 * it entered the project: contrast pulled down, saturation reduced, brightness
 * lifted, then quantised to four or five tonal steps at 512px. What is left is
 * a pattern, not a second lighting solution, so it multiplies into the toon
 * colour and adds grain without competing with the two-step gradient map that
 * does the actual shading. A raw 4K PBR diffuse here would flatten the cel
 * look, which is why the originals are not shipped.
 *
 * LOADING ORDER MATTERS, and getting it wrong fails silently.
 *
 * The obvious approach — hand a half-loaded THREE.Texture straight to a
 * material and hold the frame with delayRender — renders every textured
 * surface pure black. delayRender only postpones the SCREENSHOT; it does not
 * make React commit again, and without a commit the canvas keeps the frame it
 * already drew, which was drawn while the texture had no image. On screen that
 * looks exactly like a lighting bug: the geometry is there, it is just black.
 *
 * So the images are fetched once, up front, and nothing samples a texture
 * until every one of them has decoded.
 */
/**
 * Only two survive, and only rock.
 *
 * Six were trialled. On flat ground, floors, mud-brick walls and cloth the
 * posterised map was invisible at low strength and turned into mottled dirt at
 * high strength, which stops a flat plane reading as flat. On large rock
 * masses it genuinely helps: a cliff reads as stone instead of a flat shape.
 * So texture is applied to rock and nothing else.
 */
export type KahfiTextureId = 'rock_face_03' | 'rock_boulder_dry';

export const TEXTURE_IDS: KahfiTextureId[] = ['rock_face_03', 'rock_boulder_dry'];

/** Provenance. Every file is CC0, so no attribution is owed; this is a record. */
export const TEXTURE_CREDITS: Record<KahfiTextureId, {source: string; licence: string}> = {
  rock_face_03: {source: 'Poly Haven - Rock Face 03', licence: 'CC0'},
  rock_boulder_dry: {source: 'Poly Haven - Rock Boulder Dry', licence: 'CC0'},
};

/** Decoded source images. Filled once, before anything renders. */
const images = new Map<KahfiTextureId, HTMLImageElement>();
/** Per (id, repeat) THREE.Texture views over those images. */
const views = new Map<string, THREE.Texture>();

let loadStarted = false;
let loadDone = false;
const waiters: (() => void)[] = [];

const startLoading = () => {
  if (loadStarted) return;
  loadStarted = true;
  let left = TEXTURE_IDS.length;
  const settle = () => {
    left -= 1;
    if (left > 0) return;
    loadDone = true;
    waiters.splice(0).forEach((w) => w());
  };
  for (const id of TEXTURE_IDS) {
    const img = new Image();
    img.onload = () => {
      images.set(id, img);
      settle();
    };
    /* A missing file must not hang the render. That surface keeps its flat
       toon colour, which is a perfectly good fallback. */
    img.onerror = settle;
    img.src = staticFile(`kahfi/tex/${id}.jpg`);
  }
};

/**
 * True once every texture has decoded. Holds the frame with delayRender while
 * it waits and triggers a React commit when it flips, so the canvas is drawn
 * for the first time with real images in hand.
 */
export const useTexturesReady = (): boolean => {
  const [ready, setReady] = useState(loadDone);
  useEffect(() => {
    if (loadDone) {
      setReady(true);
      return;
    }
    const handle = delayRender('kahfi textures');
    startLoading();
    waiters.push(() => {
      setReady(true);
      continueRender(handle);
    });
  }, []);
  return ready;
};

/**
 * A tiling view of one texture. `repeat` is in tiles across the surface, so
 * the same stone reads at the right scale on a boulder and on a cliff.
 *
 * Returns null until loading finishes. Every caller hands the result straight
 * to a material, where null simply means "no map" and the flat colour shows.
 */
export const kahfiTexture = (id: KahfiTextureId, repeat = 1): THREE.Texture | null => {
  const img = images.get(id);
  if (!img) return null;
  const key = `${id}@${repeat}`;
  const hit = views.get(key);
  if (hit) return hit;
  const tex = new THREE.Texture(img);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  views.set(key, tex);
  return tex;
};
