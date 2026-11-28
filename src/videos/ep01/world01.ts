// Episode 1 film world: "Tanda kiamat yang bentuknya gedung tinggi" (77.8 s VO, 1.15x). One three.js world with
// three places (desert, the early Masjid Nabawi, a modern city), posed per frame from the shot list below. Every shot
// is timed to the word timings in episodes/01-gedung-tinggi/words.json (visual beats land 0-3 frames before words).
// Adab (SKILL.md): the Prophet ﷺ is only the camera's seated point of view; companions only as traces (sandals, a
// murmur); Jibril only as light (a doorway filling with light, a pool of light on the floor, soft shafts, a rising
// column) that never takes a human or winged shape. Only ordinary, unnamed people are drawn.
// Look sources: sky colours sampled from Poly Haven HDRIs (CC0), painted textures from Poly Haven diffuse maps (CC0),
// Kenney Nature Kit palms/rocks (CC0); towers, houses, tent, mosques and goats are built here in code.
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { staticFile } from "remotion";
import { kitClone, Kit } from "./build";
import { TONE, CHAR, twoTone, untone } from "./shade";
import { LIGHTS, LightPreset } from "./lights";
import { NOINK } from "./ink";
import { Pool, Actor } from "./cast";
import { Pen } from "./toon";
import { CLOUD_GOLD } from "./paint";
import { Goat, COATS } from "./goat";
import { tower, mudHouse, tent, cloudCard, smallMosque, streetLamp, lightColumn, allGlass, add, rnd, tileUV } from "./props";
import { drawShepherd, drawYouthUp, drawYouthDown, townMan, townWoman, drawTown } from "./people";
import T from "./timing.json";
import type { HostedWorld } from "./Stage";

export const FPS = T.fps;
export const TOTAL = T.total;
type V3 = [number, number, number];
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
const glide = (x: number) => { const u = clamp01(x); return u * u * u * (u * (6 * u - 15) + 10); };
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const lerp3 = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];

// ---------------- light presets ----------------
export const DESERT_DAY: LightPreset = {
  ...LIGHTS.day, az: 140, el: 50,
  lit: [1.6, 1.46, 1.22], shade: [0.5, 0.42, 0.46], lift: [0.05, 0.04, 0.07],
  charTint: [1.0, 0.95, 0.88], top: "#3f7fd0", hor: "#d9d6cf", fog: "#e2d6c2", fogNear: 60, fogFar: 900,
  sunCol: "#fff1d8", sunI: 3.0, actorShadow: true,
};
export const MOSQUE_DAY: LightPreset = { ...DESERT_DAY, az: 200, el: 58, fogNear: 200, fogFar: 1200 };
export const CAMP_GOLDEN: LightPreset = { ...LIGHTS.golden, az: 35, el: 9, fogNear: 80, fogFar: 900, actorShadow: true, charTint: [1.0, 0.84, 0.68],
  lit: [1.45, 0.86, 0.5], shade: [0.32, 0.24, 0.32], lift: [0.06, 0.04, 0.08] };
export const CITY_DAY: LightPreset = { ...DESERT_DAY, az: 125, el: 38, fogNear: 250, fogFar: 2400, shade: [0.46, 0.44, 0.54] };
export const NIGHT: LightPreset = {
  ...LIGHTS.day, az: 120, el: 28,
  lit: [0.42, 0.46, 0.68], shade: [0.13, 0.13, 0.24], lift: [0.02, 0.02, 0.06], lambert: 0.3,
  charTint: [0.62, 0.66, 0.86], charShade: 0.8, fog: "#1c2238", fogNear: 200, fogFar: 1800, sunCol: "#a8b8ff", sunI: 1.0, actorShadow: false,
};

// ---------------- assets ----------------
const KENNEY = ["tree_palm", "tree_palmBend", "tree_palmTall", "tree_palmDetailedTall", "tree_palmShort",
  "rock_largeB", "rock_smallA", "rock_smallB", "stone_largeA", "plant_bushSmall", "pot_large", "campfire_stones", "campfire_logs", "log"];
const RECOLOR: Record<string, string> = { stone: "#c99f74", dirt: "#b08a5e", woodBark: "#7a5a3e", wood: "#8a6440", woodDark: "#5e4630", leafsDark: "#4f7d3a" };
const loadKit = async (): Promise<Kit> => {
  const loader = new GLTFLoader();
  const list = await Promise.all(KENNEY.map((n) => loader.loadAsync(staticFile(`ep01/kenney/${n}.glb`)).then((g) => [n, g.scene] as const).catch(() => [n, null] as const)));
  const kit: Kit = {};
  for (const [n, s] of list) if (s) {
    s.traverse((o) => { const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined; if (m && RECOLOR[m.name]) m.color = new THREE.Color(RECOLOR[m.name]); });
    kit[n] = s;
  }
  return kit;
};
const loadImg = (url: string) => new Promise<HTMLImageElement>((ok, no) => { const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => ok(i); i.onerror = no; i.src = url; });

/** Poly Haven diffuse map -> painted texture: blurred, posterised onto the given palette (dark -> light) */
const painted = async (id: string, pal: string[], size = 512, blur = 2) => {
  const img = await loadImg(staticFile(`ep01/tex/${id}/diff.jpg`));
  const cv = document.createElement("canvas"); cv.width = cv.height = size;
  const g = cv.getContext("2d")!;
  g.filter = `blur(${blur}px)`; g.drawImage(img, -8, -8, size + 16, size + 16); g.filter = "none";
  const im = g.getImageData(0, 0, size, size), d = im.data;
  let lo = 1, hi = 0;
  for (let i = 0; i < d.length; i += 4) { const l = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255; lo = Math.min(lo, l); hi = Math.max(hi, l); }
  const cols = pal.map((h) => new THREE.Color(h));
  for (let i = 0; i < d.length; i += 4) {
    const l = ((0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255 - lo) / Math.max(1e-3, hi - lo);
    const c = cols[Math.min(cols.length - 1, Math.floor(l * cols.length))];
    d[i] = Math.round(c.r * 255); d[i + 1] = Math.round(c.g * 255); d[i + 2] = Math.round(c.b * 255);
  }
  g.putImageData(im, 0, 0);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  return t;
};

/** sky stops sampled from an HDRI: mean colour per elevation band (sun excluded), exposed so the horizon sits at `hor` */
const skyFromHDR = async (id: string, hor = 0.78) => {
  const tex = await new RGBELoader().setDataType(THREE.FloatType).loadAsync(staticFile(`ep01/hdri/${id}.hdr`));
  const { width: W, height: H, data } = tex.image as { width: number; height: number; data: Float32Array };
  const band = (deg: number) => {
    const y = Math.round(((90 - deg) / 180) * (H - 1)), vals: number[][] = [];
    for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; vals.push([data[i], data[i + 1], data[i + 2]]); }
    const lum = (c: number[]) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    const med = vals.map(lum).sort((a, b) => a - b)[vals.length >> 1];
    const keep = vals.filter((c) => lum(c) < med * 2.5);
    return [0, 1, 2].map((k) => keep.reduce((s, c) => s + c[k], 0) / Math.max(1, keep.length));
  };
  const stops = [1.5, 4, 9, 17, 42].map(band);
  const l0 = 0.2126 * stops[0][0] + 0.7152 * stops[0][1] + 0.0722 * stops[0][2];
  const k = new THREE.Color().setRGB(hor, hor, hor, THREE.SRGBColorSpace).r / Math.max(1e-4, l0);
  tex.dispose();
  return stops.map((c) => "#" + new THREE.Color().setRGB(Math.min(1, c[0] * k), Math.min(1, c[1] * k), Math.min(1, c[2] * k), THREE.LinearSRGBColorSpace).getHexString());
};
type SkyId = "goegap" | "klippad_sunrise_2" | "qwantani_dusk_2_puresky" | "rogland_moonlit_night";

// ---------------- camera keys ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll?: number };
type Key = [number, V3, V3, number];
/** smootherstep glide between keys (every hold creeps because neighbouring keys differ slightly) */
const keys = (ks: Key[]) => (f: number): Cam => {
  if (f <= ks[0][0]) return { pos: ks[0][1], look: ks[0][2], fov: ks[0][3] };
  for (let i = 0; i < ks.length - 1; i++) {
    const [f0, p0, l0, v0] = ks[i], [f1, p1, l1, v1] = ks[i + 1];
    if (f <= f1) { const u = glide((f - f0) / (f1 - f0)); return { pos: lerp3(p0, p1, u), look: lerp3(l0, l1, u), fov: lerp(v0, v1, u) }; }
  }
  const z = ks[ks.length - 1];
  return { pos: z[1], look: z[2], fov: z[3] };
};

// ---------------- Jibril's light (from timing.json, shared with the footstep sound) ----------------
const DOOR: V3 = [T.door[0], 0, T.door[1]], FRONT: V3 = [T.front[0], 0, T.front[1]];
export const POV = T.pov as V3, POV_NEAR: V3 = [POV[0], POV[1], POV[2] + 0.15];
type Jib = { p: V3; k: number; door: number; near: number; shaft: number; rise: number };
const jibAt = (f: number, mode: "arrive" | "leave"): Jib => {
  if (mode === "arrive") {
    const A = T.arrive, k = smooth((f - A.glow0) / (A.glow1 - A.glow0)), w = smooth((f - A.move0) / (A.move1 - A.move0));
    const p = lerp3(DOOR, FRONT, w);
    return { p, k, door: k * (1 - smooth((f - A.doorFade0) / (A.doorFade1 - A.doorFade0))), near: smooth((-2.5 - p[2]) / 4), shaft: smooth((-5.5 - p[2]) / 2.5), rise: 0 };
  }
  const L = T.leave, w = smooth((f - L.move0) / (L.move1 - L.move0)), p = lerp3(FRONT, DOOR, w);
  const out = 1 - smooth((f - L.rise0) / (L.rise1 - L.rise0));
  return { p, k: out, door: smooth((f - L.glow0) / (L.glow1 - L.glow0)) * (1 - smooth((f - L.rise0 - 10) / 40)), near: smooth((-2.5 - p[2]) / 4),
    shaft: smooth((-5.5 - p[2]) / 2.5), rise: smooth((f - L.rise0) / 20) * (1 - smooth((f - L.rise1) / (L.fade1 - L.rise1))) };
};

// ---------------- shots ----------------
type Place = "desert" | "mosque" | "city";
type Dof = { cInf: number; focus?: (f: number) => V3 };
export type ShotDef = {
  id: number; a: number; b: number; place: Place; light: LightPreset; sky: SkyId; grade: "day" | "golden"; cam: (f: number) => Cam; dof: Dof;
  xf?: number; camp?: boolean; towers?: "far" | "grow"; goats?: "graze" | "walk" | "none"; shepherd?: V3; jib?: "arrive" | "leave" | "settled";
  crowd?: boolean; youth?: "up" | "down"; night?: boolean;
};
const SH: V3 = [0, 0, 0];
// Adab rule from QA: no person is on screen while the narration names the Prophet ﷺ or says "beliau", so nobody can
// be taken for him; the shepherd's face first appears on "Engkau akan melihat orang-orang...", and the young man only on
// "Apa yang sudah kamu siapkan" (the "kamu" is the viewer), never during "ada orang yang nanya langsung ke Nabi ﷺ".
const DEFS: Omit<ShotDef, "id">[] = [
  // 0.00-3.37  "Empat belas abad lalu, Nabi Muhammad ﷺ menyebut"  the empty desert, wind over the dunes (nobody shown)
  { a: 0, b: 101, place: "desert", light: DESERT_DAY, sky: "goegap", grade: "day", goats: "none",
    cam: keys([[0, [7, 2.4, 18], [0, 1.4, -40], 44], [101, [5.2, 1.9, 13.5], [0, 1.2, -40], 44]]), dof: { cInf: 0 } },
  // 3.37-5.73  "satu tanda kiamat yang bentuknya..."  bare feet on the sand among the goats (no face)
  { a: 101, b: 172, place: "desert", light: DESERT_DAY, sky: "goegap", grade: "day", goats: "graze", shepherd: SH, xf: 8,
    cam: keys([[101, [0.62, 0.3, 1.35], [0.05, 0.15, 0], 36], [172, [0.7, 0.33, 1.55], [0.05, 0.2, 0], 36]]), dof: { cInf: 10, focus: () => [0, 0.12, 0] } },
  // 5.73-6.87  "gedung tinggi"  towers through the clouds, seen from the sand
  { a: 172, b: 206, place: "desert", light: DESERT_DAY, sky: "goegap", grade: "day", towers: "far", goats: "none",
    cam: keys([[172, [0, 0.8, 8], [0, 150, -300], 52], [206, [0, 0.8, 6], [0, 160, -300], 50]]), dof: { cInf: 0 } },
  // 6.87-9.57  "Ceritanya di Madinah. Para sahabat lagi duduk di masjid"  over the north wall into the courtyard
  { a: 206, b: 287, place: "mosque", light: MOSQUE_DAY, sky: "goegap", grade: "day", xf: 8,
    cam: keys([[206, [4, 9.5, 36], [1.2, 0.5, 6], 44], [287, [2.6, 7.2, 26], [0.8, 0.4, -2], 48]]), dof: { cInf: 0 } },
  // 9.57-25.0  "tiba-tiba datang ... Engkau benar."  POV: the doorway fills with light, it crosses and settles in front
  { a: 287, b: 750, place: "mosque", light: MOSQUE_DAY, sky: "goegap", grade: "day", jib: "arrive", xf: 8,
    cam: keys([[287, POV, [1.3, 1.65, 14], 58], [420, POV, [1.3, 1.6, 14], 58], [565, POV, [0.9, 0.45, -6.5], 58], [750, POV_NEAR, [0.9, 0.45, -6.5], 56]]),
    dof: { cInf: 6, focus: (f) => jibAt(f, "arrive").p } },
  // 25.0-27.6  "Para sahabat heran ..."  traces of the companions: the row of sandals by the door
  { a: 750, b: 828, place: "mosque", light: MOSQUE_DAY, sky: "goegap", grade: "day", jib: "settled",
    cam: keys([[750, [-1.9, 0.75, 11.6], [0.6, 0.02, 14], 40], [828, [-1.3, 0.72, 11.8], [1.1, 0.02, 14], 40]]), dof: { cInf: 8, focus: () => [0.4, 0.04, 14] } },
  // 27.6-36.3  "Lalu dia nanya, kapan kiamat? ... Salah satu jawaban beliau, artinya:"  the sky over Madinah
  { a: 828, b: 1090, place: "mosque", light: MOSQUE_DAY, sky: "goegap", grade: "day", jib: "settled", xf: 8,
    cam: keys([[828, [-2.5, 1.6, 6], [-9, 6, 24], 50], [1090, [-2.7, 1.6, 6.4], [-9, 19, 24], 52]]), dof: { cInf: 0 } },
  // 36.3-39.2  hadith quote: "Engkau akan melihat orang-orang yang tak beralas kaki"  the shepherd; down to the feet on "kaki"
  { a: 1090, b: 1176, place: "desert", light: DESERT_DAY, sky: "goegap", grade: "day", goats: "graze", shepherd: SH, xf: 10,
    cam: keys([[1090, [1.9, 1.25, 4.6], [0.1, 1.2, 0], 40], [1135, [1.6, 1.22, 3.9], [0.05, 1.15, 0], 40], [1162, [1.0, 0.55, 2.3], [0, 0.18, 0], 40], [1176, [0.98, 0.54, 2.25], [0, 0.17, 0], 40]]),
    dof: { cInf: 10, focus: (f) => lerp3([0, 1.2, 0], [0, 0.15, 0], smooth((f - 1135) / 27)) } },
  // 39.2-41.9  "tak berpakaian, miskin, para penggembala kambing"  the flock walks past the shepherd
  { a: 1176, b: 1257, place: "desert", light: DESERT_DAY, sky: "goegap", grade: "day", goats: "walk", shepherd: SH, xf: 6,
    cam: keys([[1176, [6, 1.5, 5], [0, 0.9, -1], 42], [1257, [4.6, 1.5, 6.2], [-1, 0.9, -1], 42]]), dof: { cInf: 6, focus: () => [0, 1, 0] } },
  // 41.9-44.1  "berlomba-lomba meninggikan bangunan"  houses, then towers race each other up on the horizon
  { a: 1257, b: 1323, place: "desert", light: DESERT_DAY, sky: "goegap", grade: "day", towers: "grow", goats: "graze", shepherd: [-1.2, 0, 1.2],
    cam: keys([[1257, [2.4, 1.0, 5.2], [-6, 24, -180], 48], [1323, [2.3, 1.0, 4.8], [-6, 34, -180], 48]]), dof: { cInf: 0 } },
  // 44.1-50.0  "Setelah laki-laki itu pergi ... Itu Jibril ... agama kalian."  POV: the light goes out and rises
  { a: 1323, b: 1500, place: "mosque", light: MOSQUE_DAY, sky: "goegap", grade: "day", jib: "leave", xf: 6,
    cam: keys([[1323, POV_NEAR, [0.9, 0.45, -6.5], 56], [1350, POV_NEAR, [0.9, 0.47, -6.5], 56], [1420, POV, [1.3, 1.65, 14], 58], [1480, POV, [1.45, 7.5, 14], 60], [1500, POV, [1.45, 7.8, 14], 60]]),
    dof: { cInf: 6, focus: (f) => jibAt(f, "leave").p } },
  // 50.0-54.3  "Coba bayangin gurun waktu itu ... rumahnya kemah."  a nomad camp at golden hour
  { a: 1500, b: 1629, place: "desert", light: CAMP_GOLDEN, sky: "klippad_sunrise_2", grade: "golden", camp: true, goats: "graze", shepherd: [0.3, 0, -1.2], xf: 10,
    cam: keys([[1500, [4.4, 1.6, 6.2], [-1.6, 1.0, -4], 40], [1629, [3.5, 1.5, 5.0], [-1.7, 1.0, -4], 40]]), dof: { cInf: 8, focus: () => [0, 1, -3] } },
  // 54.3-56.8  "Sekarang, gedung saling susul nembus awan."  the city, looking up through the clouds
  { a: 1629, b: 1704, place: "city", light: CITY_DAY, sky: "goegap", grade: "day", xf: 8,
    cam: keys([[1629, [0, 1.7, 0], [30, 150, -60], 62], [1704, [0, 1.7, 0], [6, 165, -72], 62]]), dof: { cInf: 0 } },
  // 56.8-64.85 "Ibnu Hajar ... saling pamer bangunan."  street level with passers-by; tilt up the towers at the end
  { a: 1704, b: 1946, place: "city", light: CITY_DAY, sky: "goegap", grade: "day", crowd: true,
    cam: keys([[1704, [4.2, 1.6, 14.5], [0, 2, 0], 42], [1890, [3.2, 1.6, 11.8], [0, 2.2, 0], 42], [1946, [3.1, 1.6, 11.5], [-5, 70, -60], 52]]),
    dof: { cInf: 6, focus: (f) => (f < 1890 ? [1, 1.4, 2] : [-5, 60, -60]) } },
  // 64.85-70.6 "Di hadits lain, ada orang yang nanya langsung ke Nabi ﷺ ... Beliau balik nanya,"  the small mosque among
  // the towers, nobody shown
  { a: 1946, b: 2117, place: "city", light: CITY_DAY, sky: "goegap", grade: "day", xf: 8,
    cam: keys([[1946, [0.8, 1.7, 17], [0, 9, -20], 44], [2117, [0.5, 1.65, 13], [0, 8, -20], 44]]), dof: { cInf: 0 } },
  // 70.6-72.4  "Apa yang sudah kamu siapkan untuknya?"  the young man of today closes his eyes over the prayer mat
  { a: 2117, b: 2172, place: "city", light: CITY_DAY, sky: "goegap", grade: "day", youth: "down",
    cam: keys([[2117, [0.3, 1.32, 5.7], [0, 1.12, 4], 36], [2172, [0.24, 1.3, 5.45], [0, 1.08, 4], 36]]), dof: { cInf: 12, focus: () => [0, 1.2, 4] } },
  // 72.4-78.4  "Gedungnya boleh terus naik ... bekal kamu udah sampai mana?"  night; down from the towers to a small mosque
  { a: 2172, b: TOTAL, place: "city", light: NIGHT, sky: "rogland_moonlit_night", grade: "day", night: true, xf: 12,
    cam: keys([[2172, [10, 62, 32], [0, 72, -60], 50], [2320, [6, 6, 27], [0, 5, -20], 46], [TOTAL, [5.8, 5.8, 26.4], [0, 5, -20], 46]]), dof: { cInf: 0 } },
];
export const SHOTS: ShotDef[] = DEFS.map((d, i) => ({ ...d, id: i + 1 }));
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const shotById = (id: number) => SHOTS[id - 1];
/** layers at frame f: the base shot, plus the next one fading in during its crossfade (`xf` frames centred on its start) */
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = s.xf;
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

// ---------------- the world ----------------
type Assets = { kit: Kit; sand: THREE.Texture; mud: THREE.Texture; bark: THREE.Texture; thatch: THREE.Texture; paving: THREE.Texture; sky: Record<SkyId, string[]> };
type GoatSpot = { g: Goat; x: number; z: number; yaw: number; walk: number; graze: number };

class Ep01World {
  root = new THREE.Group();
  private desert = new THREE.Group(); private camp = new THREE.Group(); private farTowers = new THREE.Group();
  private mosque = new THREE.Group(); private city = new THREE.Group(); private cityClouds = new THREE.Group(); private desertClouds = new THREE.Group();
  private sun = new THREE.DirectionalLight("#fff1d8", 3);
  private hemi = new THREE.HemisphereLight("#cfe6ff", "#8a6a50", 0.5);
  private skyMat: THREE.ShaderMaterial; private sky: THREE.Mesh;
  private fog = new THREE.Fog("#e2d6c2", 60, 900);
  private pool = new Pool(); private actors: Actor[] = [];
  private goats: GoatSpot[] = []; private campGoats: GoatSpot[] = [];
  private grow: { o: THREE.Object3D; t0: number; dur: number }[] = [];
  private jib: { pool: THREE.Mesh; door: THREE.Mesh; shafts: THREE.Mesh[]; light: THREE.PointLight; column: THREE.Mesh };
  private dust: THREE.Points;
  private night: { mosque?: ReturnType<typeof smallMosque>; lamps?: ReturnType<typeof streetLamp>[]; fire?: THREE.PointLight } = {};

  constructor(private A: Assets) {
    const R = this.root;
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() }, c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el)); c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el)); c = mix(c, c4, smoothstep(e.z, e.w, el)); gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(2600, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.sky, this.sun, this.sun.target, this.hemi, this.desert, this.mosque, this.city);
    this.desert.add(this.camp, this.farTowers, this.desertClouds);
    this.city.add(this.cityClouds);
    this.buildDesert(); this.buildCamp(); this.buildFarTowers(); this.buildMosque(); this.buildCity();
    // ---- Jibril: light only ----
    const grad = (w: number, h: number, fn: (x: number, y: number) => number) => {
      const cv = document.createElement("canvas"); cv.width = w; cv.height = h; const g = cv.getContext("2d")!, im = g.createImageData(w, h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4, a = clamp01(fn(x / (w - 1), y / (h - 1))); im.data[i] = im.data[i + 1] = 255; im.data[i + 2] = 240; im.data[i + 3] = Math.round(255 * a); }
      g.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
    };
    const add2 = (map: THREE.Texture, col: [number, number, number]) => new THREE.MeshBasicMaterial({ map, color: new THREE.Color(...col), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
    const poolG = new THREE.PlaneGeometry(1, 1); poolG.rotateX(-Math.PI / 2);
    const pool = new THREE.Mesh(poolG, add2(grad(256, 256, (x, y) => (1 - Math.hypot((x - 0.5) * 2, (y - 0.5) * 2)) ** 1.6), [1.5, 1.4, 1.15]));
    const shaftTex = grad(64, 256, (x, y) => (1 - Math.abs(x - 0.5) * 2) ** 2 * Math.sin(Math.PI * Math.min(1, y * 1.15)) ** 1.5);
    const shafts = [-0.22, -0.05, 0.12, 0.26].map((dx, i) => {
      const g = new THREE.PlaneGeometry(0.16 + 0.1 * rnd(i + 40), 2.4); g.translate(0, 1.2, 0); g.rotateZ(0.16);
      const m = new THREE.Mesh(g, add2(shaftTex, [0.42, 0.4, 0.32])); m.userData.dx = dx; m.userData.dz = 0.25 * (rnd(i + 50) - 0.5); return m;
    });
    const doorTex = grad(128, 128, (x, y) => { const dx = Math.max(0, Math.abs(x - 0.5) * 2 - 0.5) / 0.5; return (1 - dx) ** 2 * (0.3 + 0.7 * Math.min(1, (1 - y) * 1.6)); });
    const door = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.0), add2(doorTex, [1.1, 1.05, 0.9]));
    door.position.set(DOOR[0], 1.2, 14.6); door.rotation.y = Math.PI;
    const column = lightColumn();
    for (const m of [pool, door, ...shafts]) { m.layers.set(NOINK); m.renderOrder = 6; this.mosque.add(m); }
    this.mosque.add(column);
    const pl = new THREE.PointLight("#fff4dc", 0, 7, 1.6); this.mosque.add(pl);
    this.jib = { pool, door, shafts, light: pl, column };
    const n = 500, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) pos.set([-6 + 16 * rnd(i + 1), 0.3 + 3 * rnd(i + 7), -14 + 10 * rnd(i + 13)], i * 3);
    const dg = new THREE.BufferGeometry(); dg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const dot = document.createElement("canvas"); dot.width = dot.height = 32; { const g = dot.getContext("2d")!; const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); }
    this.dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: "#fff2d0", map: new THREE.CanvasTexture(dot), size: 0.03, transparent: true, opacity: 0.55, depthWrite: false }));
    this.dust.layers.set(NOINK); this.mosque.add(this.dust);
  }

  // ---------------- places ----------------
  private place(parent: THREE.Object3D, name: string, x: number, z: number, h: number, yaw = 0) {
    const o = kitClone(this.A.kit, name, h); if (!o) return;
    o.position.set(x, 0, z); o.rotation.y = yaw;
    o.traverse((m) => { if ((m as THREE.Mesh).isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    parent.add(o);
  }
  private flock(parent: THREE.Object3D, spots: [number, number, number, number, number][], out: GoatSpot[], seed: number) {
    spots.forEach(([x, z, yaw, walk, graze], i) => {
      const gt = new Goat(COATS[(i + seed) % COATS.length], i + 1 + seed);
      gt.root.position.set(x, 0, z); gt.root.rotation.y = yaw; gt.root.scale.setScalar(0.95 + 0.12 * rnd(i + 2 + seed));
      parent.add(gt.root); out.push({ g: gt, x, z, yaw, walk, graze });
    });
  }
  private buildDesert() {
    const D = this.desert, A = this.A, lam = (o: THREE.MeshLambertMaterialParameters) => twoTone(new THREE.MeshLambertMaterial(o));
    const g = new THREE.PlaneGeometry(1400, 1400, 220, 220); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z);
      const dune = 3.2 * Math.sin(x * 0.021 + Math.sin(z * 0.013) * 2.1) * Math.sin(z * 0.017 + 0.6) + 1.6 * Math.sin(x * 0.047 + z * 0.031)
        + (r > 120 ? (r - 120) * 0.035 * (1 + Math.sin(Math.atan2(z, x) * 5)) : 0);
      const flat = smooth((r - 10) / 40) * (1 - 0.85 * smooth(1 - Math.hypot(x / 60, (z + 210) / 70))); // flatter ground where the towers stand
      p.setY(i, dune * flat - 0.05);
    }
    g.computeVertexNormals(); tileUV(g, 1400 / 7, 1400 / 7);
    add(D, g, lam({ map: A.sand }), false);
    for (const [n, x, z, h, y] of [["rock_smallA", -5.5, -6, 0.5, 0.4],       ["rock_smallB", -2.8, 3.4, 0.3, 1]] as [string, number, number, number, number][])
      this.place(D, n, x, z, h, y);
    for (const [n, x, z, h] of [["tree_palmTall", -16, -38, 11], ["tree_palm", -10, -42, 8], ["tree_palmBend", -21, -44, 9], ["tree_palmDetailedTall", -4, -47, 12], ["tree_palmShort", -13, -35, 5]] as [string, number, number, number][])
      this.place(D, n, x, z, h, x * 0.3);
    for (let i = 0; i < 9; i++) {
      const a = -2.2 + i * 0.42, d = 420 + 60 * rnd(i), cg = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      cg.scale(110 + 60 * rnd(i + 3), 22 + 18 * rnd(i + 5), 45); cg.rotateY(-a + Math.PI / 2); cg.translate(Math.cos(a) * d, -2, Math.sin(a) * d);
      add(D, cg, lam({ color: "#d6a874" }), false);
    }
    this.flock(D, [[-1.7, -0.4, 0.5, 0, 1], [1.6, -1.3, 2.6, 0.3, 0.3], [-0.7, -2.8, -0.9, 0.5, 0.8], [3.2, -3.2, 3.6, 0, 1], [-3.6, -2.4, 1.2, 0.2, 0.6], [2.4, 1.9, -2.4, 0, 0.9]], this.goats, 0);
  }
  private buildCamp() {
    const C = this.camp, tt = tent(); tt.position.set(-4.5, 0, -6.5); tt.rotation.y = 0.35; C.add(tt);
    this.place(C, "campfire_stones", -1.2, -3.2, 0.3); this.place(C, "campfire_logs", -1.2, -3.2, 0.35, 1.0);
    this.place(C, "log", 0.4, -4.4, 0.3, 0.6);
    const fire = new THREE.PointLight("#ffa04a", 0, 9, 1.8); fire.position.set(-1.2, 0.6, -3.2); C.add(fire);
    this.night.fire = fire;
    this.flock(C, [[-6.5, -3.0, 0.8, 0, 1], [2.8, -5.5, 2.2, 0, 0.7], [-3.0, -1.0, -0.6, 0, 0.9]], this.campGoats, 3);
  }
  private buildFarTowers() {
    const F = this.farTowers, mud = twoTone(new THREE.MeshLambertMaterial({ map: this.A.mud }));
    // nearer: mud-brick houses (they rise first); further: glass towers racing each other up
    const houses: [number, number, number, number, number][] = [[-30, -90, 8, 7, 5], [-16, -96, 7, 8, 7], [-2, -92, 9, 7, 6], [14, -98, 8, 8, 8], [-40, -104, 7, 6, 6], [26, -94, 7, 7, 5]];
    houses.forEach(([x, z, w, d, h], i) => { const o = mudHouse(mud, w, d, h, i); o.position.set(x, 0, z); F.add(o); this.grow.push({ o, t0: 1258 + i * 2, dur: 14 }); });
    const towers: [number, number, number, number, number][] = [[-45, -210, 24, 24, 220], [-10, -230, 28, 26, 330], [25, -205, 22, 22, 260], [55, -240, 26, 24, 410], [-75, -250, 22, 22, 180], [5, -280, 30, 30, 460], [85, -270, 22, 22, 240]];
    towers.forEach(([x, z, w, d, h], i) => { const o = tower(w, d, h, i + 2); o.position.set(x, 0, z); F.add(o); this.grow.push({ o, t0: 1268 + [0, 6, 3, 14, 9, 20, 11][i], dur: [26, 34, 30, 32, 24, 36, 28][i] }); });
    for (let i = 0; i < 12; i++) {
      const c = cloudCard(i, 140 + 80 * rnd(i + 9)); c.position.set(-160 + 320 * rnd(i + 1), 150 + 70 * rnd(i + 4), -180 - 140 * rnd(i + 7));
      this.desertClouds.add(c);
    }
  }
  private buildMosque() {
    const M = this.mosque, A = this.A, lam = (o: THREE.MeshLambertMaterialParameters) => twoTone(new THREE.MeshLambertMaterial(o));
    const X0 = -17.5, X1 = 17.5, Z0 = -15, Z1 = 15, H = 3.0, Tk = 0.7;
    const mud = lam({ map: A.mud }), sandM = lam({ map: A.sand }), bark = lam({ map: A.bark }), frond = lam({ map: A.thatch, side: THREE.DoubleSide }), footing = lam({ color: "#9c8a72" });
    const sandG = new THREE.PlaneGeometry(400, 400); sandG.rotateX(-Math.PI / 2); tileUV(sandG, 400 / 6, 400 / 6); add(M, sandG, sandM, false);
    const wall = (x0: number, z0: number, x1: number, z1: number, gaps: [number, number][] = []) => {
      const len = Math.hypot(x1 - x0, z1 - z0), dx = (x1 - x0) / len, dz = (z1 - z0) / len, rot = -Math.atan2(dz, dx);
      let s = 0;
      const cuts = [...gaps.map(([c, w]) => [c - w / 2, c + w / 2]), [len, len]].sort((a, b) => a[0] - b[0]);
      for (const [g0, g1] of cuts) {
        if (g0 - s > 0.05) {
          const w = g0 - s, cx = x0 + dx * (s + w / 2), cz = z0 + dz * (s + w / 2);
          const gm = new THREE.BoxGeometry(w, H, Tk); gm.rotateY(rot); gm.translate(cx, H / 2, cz); tileUV(gm, w / 2.5, H / 2.5); add(M, gm, mud);
          const fg = new THREE.BoxGeometry(w, 0.35, Tk + 0.12); fg.rotateY(rot); fg.translate(cx, 0.175, cz); add(M, fg, footing);
        }
        if (g1 < len) {
          const cx = x0 + dx * (g0 + g1) / 2, cz = z0 + dz * (g0 + g1) / 2, lg = new THREE.BoxGeometry(g1 - g0 + 0.6, 0.22, Tk * 0.8);
          lg.rotateY(rot); lg.translate(cx, 2.35, cz); add(M, lg, bark);
          const top = new THREE.BoxGeometry(g1 - g0, H - 2.46, Tk); top.rotateY(rot); top.translate(cx, 2.46 + (H - 2.46) / 2, cz); add(M, top, mud);
        }
        s = g1;
      }
    };
    wall(X0, Z0, X1, Z0); wall(X0, Z1, X1, Z1, [[19, 1.6]]); wall(X1, Z0, X1, Z1, [[18, 1.6]]); wall(X0, Z0, X0, Z1, [[18, 1.6]]);
    const pz = [-13, -10.2, -7.4], px = Array.from({ length: 11 }, (_, i) => -15 + i * 3);
    for (const z of pz) for (const x of px) { const cg = new THREE.CylinderGeometry(0.17, 0.2, H + 0.1, 9); cg.translate(x, (H + 0.1) / 2, z); tileUV(cg, 1.2, 2.5); add(M, cg, bark); }
    const box = (w: number, h: number, d: number, x: number, y: number, z: number) => { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y + h / 2, z); return g; };
    for (const z of pz) add(M, box(X1 - X0, 0.2, 0.22, 0, H, z), bark);
    for (const x of px) add(M, box(0.14, 0.12, 7.6, x, H + 0.2, -10.3), bark);
    for (let i = 0; i < 26; i++) { const rg = new THREE.PlaneGeometry(X1 - X0, 0.26); rg.rotateX(-Math.PI / 2); rg.translate(0, H + 0.33 + 0.02 * (i % 2), -14.4 + i * 0.29); tileUV(rg, 12, 0.12); add(M, rg, frond); }
    // traces of the companions: a row of sandals by the north door, inside
    const leather = ["#6b4a2e", "#7d5534", "#5a3d26", "#8a6040"];
    for (let i = 0; i < 9; i++) for (const sd of [-1, 1]) {
      const sg = new THREE.CylinderGeometry(0.055, 0.05, 0.02, 10); sg.scale(1, 1, 2.4);
      sg.translate(-2.4 + i * 0.62 + sd * 0.07 + 0.05 * rnd(i * 3), 0.01, 14.0 - 0.06 * rnd(i) + sd * 0.02);
      add(M, sg, lam({ color: leather[i % 4] }), false);
      const st = new THREE.TorusGeometry(0.035, 0.008, 4, 10, Math.PI); st.rotateX(-Math.PI / 2); st.translate(-2.4 + i * 0.62 + sd * 0.07 + 0.05 * rnd(i * 3), 0.025, 13.97 - 0.06 * rnd(i) + sd * 0.02);
      add(M, st, lam({ color: "#4a3220" }), false);
    }
    const jar = kitClone(A.kit, "pot_large", 0.7); if (jar) { jar.position.set(-6.5, 0, -14.1); M.add(jar); }
    for (const [n, x, z, h] of [["tree_palmTall", -9, 24, 13], ["tree_palm", 12, 29, 10], ["tree_palmDetailedTall", 16, 21, 14], ["tree_palmBend", -20, 20, 11], ["tree_palmTall", 25, 5, 12]] as [string, number, number, number][])
      this.place(M, n, x, z, h, x);
  }
  private buildCity() {
    const C = this.city, lam = (o: THREE.MeshLambertMaterialParameters) => twoTone(new THREE.MeshLambertMaterial(o));
    const g = new THREE.PlaneGeometry(3000, 3000); g.rotateX(-Math.PI / 2); tileUV(g, 3000 / 4, 3000 / 4);
    add(C, g, lam({ map: this.A.paving }), false);
    // towers ring the plaza (none in the camera paths), tallest behind the small mosque
    const T: [number, number, number, number, number][] = [
      [-38, -60, 26, 24, 260], [-6, -95, 30, 30, 420], [32, -70, 24, 24, 330], [62, -40, 22, 26, 210], [-70, -28, 24, 22, 190], [80, -110, 28, 26, 380],
      [-95, -120, 26, 26, 300], [20, -160, 30, 30, 520], [-50, -170, 24, 24, 360], [110, -30, 20, 20, 160], [-120, 10, 22, 22, 150], [60, 40, 22, 22, 140],
      [-60, 60, 24, 24, 170], [130, 60, 26, 26, 200]];
    T.forEach(([x, z, w, d, h], i) => { const o = tower(w, d, h, i + 7); o.position.set(x, 0, z); o.rotation.y = (rnd(i + 30) - 0.5) * 0.3; C.add(o); });
    const sm = smallMosque(); sm.g.position.set(0, 0, -20); C.add(sm.g);
    const lamps = [[-6, 8], [6, 8], [-6, -6], [6, -6]].map(([x, z], i) => { const l = streetLamp(); l.g.position.set(x, 0, z); l.g.rotation.y = x < 0 ? 0 : Math.PI; C.add(l.g); return l; });
    this.night.mosque = sm; this.night.lamps = lamps;
    // low planters and benches along the plaza
    for (let i = 0; i < 6; i++) { const pg = new THREE.BoxGeometry(2.4, 0.5, 0.6); pg.translate(-9 + (i % 2) * 18, 0.25, -4 + Math.floor(i / 2) * 9); add(C, pg, lam({ color: "#bfb7aa" })); }
    for (let i = 0; i < 18; i++) {
      const c = cloudCard(i + 3, 160 + 90 * rnd(i + 19)); const a = rnd(i + 2) * Math.PI * 2, r = 60 + 220 * rnd(i + 5);
      c.position.set(Math.cos(a) * r, 120 + 70 * rnd(i + 11), -40 + Math.sin(a) * r - 60); this.cityClouds.add(c);
    }
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }

  update(f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene, shotId?: number) {
    const s = shotId ? shotById(shotId) : shotAt(f), t = f / FPS, L = s.light, c = s.cam(f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); if (c.roll) cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.1; cam.far = 5000; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    cam.layers.enable(NOINK);
    this.desert.visible = s.place === "desert"; this.mosque.visible = s.place === "mosque"; this.city.visible = s.place === "city";
    this.camp.visible = !!s.camp; this.farTowers.visible = !!s.towers; this.desertClouds.visible = !!s.towers;
    for (const gs of this.goats) gs.g.root.visible = s.place === "desert" && !s.camp && s.goats !== "none" && s.towers !== "far";
    // ---- light rig: camera-relative sun frozen per shot ----
    const c0 = s.cam(s.a), fx = c0.look[0] - c0.pos[0], fz = c0.look[2] - c0.pos[2], n = Math.hypot(fx, fz) || 1;
    const az = THREE.MathUtils.degToRad(L.az), el = THREE.MathUtils.degToRad(L.el), ux = fx / n, uz = fz / n;
    const sunDir = V((ux * Math.cos(az) - uz * Math.sin(az)) * Math.cos(el), Math.sin(el), (uz * Math.cos(az) + ux * Math.sin(az)) * Math.cos(el)).normalize();
    const focus = V(...c.look);
    const city = s.place === "city", Rr = city ? 110 : s.place === "mosque" ? 26 : s.towers ? 60 : 30;
    const shadowAt = s.place === "mosque" ? V(0, 0, 0) : city ? V(0, 0, -20) : V(c.pos[0] * 0.5, 0, c.pos[2] * 0.5);
    this.sun.position.copy(shadowAt).addScaledVector(sunDir, city ? 700 : 200); this.sun.target.position.copy(shadowAt);
    const sc = this.sun.shadow.camera; sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = city ? 100 : 50; sc.far = city ? 1600 : 400; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(0.03, 0.02, 0); TONE.uSat.value = 1.05;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    const stops = this.A.sky[s.sky], su = this.skyMat.uniforms;
    stops.forEach((h, i) => untone(h, su["c" + i].value));
    su.e.value.set(...[3, 8, 16, 40].map((d) => THREE.MathUtils.degToRad(d)) as [number, number, number, number]);
    this.sky.position.copy(cam.position);
    untone(s.night ? "#1c2238" : stops[0], this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar;
    scene.fog = this.fog; scene.background = null;
    // ---- night: lit windows, lamps, the small mosque ----
    const nightK = s.night ? 1 : 0;
    for (const m of allGlass()) m.emissiveIntensity = nightK * 1.1;
    if (this.night?.mosque) { this.night.mosque.win.emissiveIntensity = nightK * 1.6; this.night.mosque.lamp.intensity = nightK * 30; }
    for (const l of this.night?.lamps ?? []) { l.bulb.visible = !!s.night; (l.bulb.material as THREE.MeshBasicMaterial).color.setScalar(s.night ? 3 : 1); }
    if (this.night?.fire) this.night.fire.intensity = s.camp ? 2.5 + 0.6 * Math.sin(t * 13) * Math.sin(t * 7.3) : 0;
    // ---- growth (shot 9): houses then towers rise out of the sand ----
    for (const gr of this.grow) {
      const u = s.towers === "grow" ? glide((f - gr.t0) / gr.dur) : 1;
      gr.o.scale.y = Math.max(0.002, u); gr.o.visible = u > 0.002;
    }
    for (const cl of [...this.desertClouds.children, ...this.cityClouds.children]) cl.lookAt(cam.position.x, cl.position.y, cam.position.z);
    // ---- goats ----
    if (s.place === "desert") {
      const list = s.camp ? this.campGoats : this.goats;
      for (const gs of list) {
        const walking = s.goats === "walk";
        const dx = walking ? 0.45 * (t - s.a / FPS) : 0, yaw = walking ? 0.25 : gs.yaw;
        gs.g.root.rotation.y = yaw;
        gs.g.root.position.set(gs.x + (walking ? Math.cos(yaw) * dx - 3 : 0), 0, gs.z - (walking ? Math.sin(yaw) * dx : 0));
        gs.g.pose(t, walking ? 1 : gs.walk, walking ? 0 : gs.graze);
      }
    }
    // ---- people (2.5D cards) ----
    type P = { key: string; draw: (p: Pen) => void; x: number; z: number; sc: number; res?: number };
    const people: P[] = [];
    if (s.shepherd && s.place === "desert") people.push({ key: "shepherd", draw: drawShepherd, x: s.shepherd[0], z: s.shepherd[2], sc: 0.8, res: 2 });
    if (s.youth) people.push({ key: "youth_" + s.youth, draw: s.youth === "up" ? drawYouthUp : drawYouthDown, x: 0, z: 4, sc: 0.8, res: 2 });
    if (s.crowd) for (let i = 0; i < 14; i++) {
      const woman = i % 3 === 1, dir = i % 2 ? 1 : -1, speed = 1.0 + 0.3 * rnd(i + 70);
      const x = ((-9 + 18 * rnd(i + 80) + dir * speed * (t - 56.8)) % 20 + 40) % 20 - 10, z = -2 + 9 * rnd(i + 90);
      const o = woman ? townWoman(i) : townMan(i), ph = (t * 1.7 + rnd(i + 3)) % 1;
      people.push({ key: `town_${i}_${woman ? 0 : Math.floor(ph * 8)}`, draw: drawTown(o, 30 + i, Math.floor(ph * 8) / 8), x, z, sc: 0.78 + 0.06 * rnd(i + 5), res: 1 });
    }
    let ai = 0;
    for (const pp of people) {
      const a = this.actor(ai++), r = pp.res ?? 1;
      a.r = this.pool.req(pp.key, 600 * r, 1000 * r, r, pp.draw);
      a.mesh.visible = true; a.mesh.position.set(pp.x, 0, pp.z);
      a.mesh.rotation.set(0, Math.atan2(cam.position.x - pp.x, cam.position.z - pp.z), 0);
      a.mesh.scale.setScalar(pp.sc); a.mesh.castShadow = L.actorShadow;
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    this.pool.flush();
    for (let i = 0; i < ai; i++) this.actors[i].bind();
    // ---- Jibril's light (mosque POV shots) ----
    const on = s.place === "mosque" && !!s.jib;
    for (const m of [this.jib.pool, this.jib.door, this.jib.column, ...this.jib.shafts]) m.visible = on;
    this.jib.light.intensity = 0;
    if (on) {
      const J: Jib = s.jib === "settled" ? { p: FRONT, k: 1, door: 0, near: 1, shaft: 1, rise: 0 } : jibAt(f, s.jib === "arrive" ? "arrive" : "leave");
      const p = J.p, k = J.k, nn = J.near, sp = 1.6;
      this.jib.door.visible = J.door > 0.001; (this.jib.door.material as THREE.MeshBasicMaterial).opacity = J.door;
      this.jib.pool.visible = k > 0.001;
      this.jib.pool.position.set(p[0], 0.02, p[2] - 1.6 * sp * (1 - nn));
      this.jib.pool.scale.set(Math.max(0.001, k * lerp(2.6 / sp, 1.5, nn)), 1, Math.max(0.001, k * lerp(6 / sp, 1.7, nn)));
      const yaw = Math.atan2(cam.position.x - p[0], cam.position.z - p[2]);
      this.jib.shafts.forEach((m, i) => {
        m.position.set(p[0] + m.userData.dx * Math.cos(yaw), 0, p[2] - m.userData.dx * Math.sin(yaw) + m.userData.dz);
        m.rotation.set(0, yaw, 0);
        m.visible = J.shaft * k > 0.001; (m.material as THREE.MeshBasicMaterial).opacity = J.shaft * k * (0.6 + 0.4 * Math.sin(t * 1.3 + i * 1.7) ** 2);
      });
      // the rising column above the door (leaving): grows upward and fades into the sky
      this.jib.column.visible = J.rise > 0.001;
      if (J.rise > 0.001) {
        const L2 = T.leave, h = 4 + 60 * smooth((f - L2.rise0) / (L2.rise1 - L2.rise0));
        this.jib.column.position.set(DOOR[0], 0.5, 15.6); this.jib.column.scale.set(2.2, h, 1);
        this.jib.column.rotation.set(0, Math.atan2(cam.position.x - DOOR[0], cam.position.z - 15.6), 0);
        (this.jib.column.material as THREE.MeshBasicMaterial).opacity = J.rise * 0.8;
      }
      this.jib.light.position.set(p[0], 0.6, p[2]); this.jib.light.intensity = lerp(5, 3, nn) * k;
      (this.dust.material as THREE.PointsMaterial).opacity = 0.35 + 0.3 * Math.sin(t * 0.7) ** 2;
      this.dust.rotation.y = t * 0.01;
    }
    return focus;
  }
}

export const makeEp01 = async (): Promise<HostedWorld> => {
  const [kit, sand, mud, bark, thatch, paving, goegap, klippad, dusk, night] = await Promise.all([
    loadKit(),
    painted("sand_01", ["#c9a46e", "#d8b47c", "#e2c28a", "#ebcf9a", "#f2dcaa"], 512, 3),
    painted("brown_mud_dry", ["#b48d67", "#c29b73", "#cfa97f", "#d9b68b"], 512, 4),
    painted("palm_bark", ["#8a6a4a", "#a07c57", "#b38e66", "#c4a078"], 512, 1),
    painted("thatch_roof_angled", ["#6f5a36", "#8a7344", "#a48b55", "#bba266"], 512, 1),
    painted("sandstone_blocks_05", ["#a9a296", "#bab3a7", "#c9c2b6", "#d6d0c4"], 512, 1),
    skyFromHDR("goegap"), skyFromHDR("klippad_sunrise_2", 0.8), skyFromHDR("qwantani_dusk_2_puresky", 0.62), skyFromHDR("rogland_moonlit_night", 0.22),
  ]);
  const w = new Ep01World({ kit, sand, mud, bark, thatch, paving, sky: { goegap, klippad_sunrise_2: klippad, qwantani_dusk_2_puresky: dusk, rogland_moonlit_night: night } });
  return {
    root: w.root,
    update: (f, cam, scene, shot) => w.update(f, cam, scene, shot),
    dof: (f, shot) => { const s = shot ? shotById(shot) : shotAt(f); return { cInf: s.dof.cInf, focus: s.dof.focus ? V(...s.dof.focus(f)) : undefined }; },
    grade: (f, shot) => (shot ? shotById(shot) : shotAt(f)).grade,
  };
};
// keep the golden cloud palette import used (camp shots could switch cloud colours later)
void CLOUD_GOLD;
