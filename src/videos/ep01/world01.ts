// Episode 1 world: "Tanda kiamat yang bentuknya gedung tinggi". Two sets for the look test:
//   desert  - sand dunes, rocks, palms, a black goat-hair tent, a barefoot shepherd (2.5D card) and 3D goats
//   mosque  - the early Masjid Nabawi: mud-brick walls, palm-trunk pillars, palm-frond roof, sand floor
// Adab (SKILL.md): the Prophet ﷺ is only the camera's point of view (seated eye height 1.05 m); companions only as
// traces (sandals at the door); Jibril only as light that never takes a human or winged shape.
// Look sources: sky colours sampled from Poly Haven HDRIs (CC0), painted textures from Poly Haven diffuse maps (CC0),
// Kenney Nature Kit props (CC0). Everything here is a pure function of (shot, frame).
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { staticFile } from "remotion";
import { kitClone, Kit } from "./build";
import { TONE, CHAR, twoTone, untone } from "./shade";
import { LIGHTS, LightPreset } from "./lights";
import { NOINK } from "./ink";
import { Pool, Actor } from "./cast";
import { Pen, bodyFront, Outfit, INK } from "./toon";
import { Goat, COATS } from "./goat";
import type { HostedWorld } from "./Stage";

export const FPS = 30;
type V3 = [number, number, number];
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const smooth = (x: number) => { const u = Math.max(0, Math.min(1, x)); return u * u * (3 - 2 * u); };
const rnd = (s: number) => { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); };

// ---------------- light presets (desert sun: harsh, high, warm lit side, cool violet shade) ----------------
export const DESERT_DAY: LightPreset = {
  ...LIGHTS.day, az: 140, el: 50,
  lit: [1.6, 1.46, 1.22], shade: [0.5, 0.42, 0.46], lift: [0.05, 0.04, 0.07],
  charTint: [1.0, 0.95, 0.88], top: "#3f7fd0", hor: "#d9d6cf", fog: "#e2d6c2", fogNear: 60, fogFar: 900,
  sunCol: "#fff1d8", sunI: 3.0, actorShadow: true,
};
/** inside the mosque portico: the sun is outside, the roof shades the floor; bright courtyard behind */
export const MOSQUE_DAY: LightPreset = { ...DESERT_DAY, az: 200, el: 58, fogNear: 200, fogFar: 1200 };

// ---------------- assets ----------------
const KENNEY = ["tree_palm", "tree_palmBend", "tree_palmTall", "tree_palmDetailedTall", "tree_palmShort", "tent_detailedOpen",
  "rock_largeA", "rock_largeB", "rock_largeC", "rock_smallA", "rock_smallB", "rock_tallA", "stone_largeA", "plant_bushSmall", "pot_large", "campfire_stones"];
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

/** Poly Haven diffuse map -> painted texture: blurred, posterised to `levels` steps on the given palette (dark -> light) */
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
    const k = Math.min(cols.length - 1, Math.floor(l * cols.length)), c = cols[k];
    d[i] = Math.round(c.r * 255); d[i + 1] = Math.round(c.g * 255); d[i + 2] = Math.round(c.b * 255);
  }
  g.putImageData(im, 0, 0);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  return t;
};

/** sky stops sampled from an HDRI: mean colour per elevation band (sun excluded), exposed so the horizon sits at `hor`
 *  luminance on screen. Returns sRGB hex targets for the 5-stop sky shader (stops at 0, 3, 8, 16, 40 deg). */
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

// ---------------- shots (look test) ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll?: number };
export type ShotDef = { id: number; a: number; b: number; set: "desert" | "mosque"; light: LightPreset; grade: "day" | "golden"; cam: (f: number) => Cam; cInf: number; focus?: V3 };
const lerp3 = (a: V3, b: V3, u: number): V3 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
export const POV: V3 = [0.9, 1.05, -10.5]; // the seated place the camera stands for (under the portico, facing the north door)
export const SHOTS: ShotDef[] = [
  // 1: shepherd with goats on the open desert (hadith quote beat); slow push-in
  { id: 1, a: 0, b: 90, set: "desert", light: DESERT_DAY, grade: "day", cInf: 10, focus: [0, 1.5, 0],
    cam: (f) => { const u = smooth(f / 90); return { pos: lerp3([1.9, 1.25, 4.6], [1.7, 1.22, 4.1], u), look: [0.1, 1.2, 0], fov: 40 }; } },
  // 2: POV in the portico: Jibril's light appears at the north door across the sunlit courtyard
  { id: 2, a: 90, b: 180, set: "mosque", light: MOSQUE_DAY, grade: "day", cInf: 0,
    cam: (f) => { const u = smooth((f - 90) / 90); return { pos: POV, look: lerp3([1.3, 1.7, 14], [1.4, 1.6, 14], u), fov: 58 }; } },
  // 3: POV: the light has come close and settled right in front of the seated place
  { id: 3, a: 180, b: 270, set: "mosque", light: MOSQUE_DAY, grade: "day", cInf: 8, focus: [0.9, 0.95, -8.7],
    cam: (f) => { const u = smooth((f - 180) / 90); return { pos: lerp3(POV, [0.9, 1.05, -10.35], u), look: [0.9, 0.45, -6.5], fov: 58 }; } },
  // 4 (check only): goats seen side-on, close, sharp
  { id: 4, a: 270, b: 300, set: "desert", light: DESERT_DAY, grade: "day", cInf: 0,
    cam: () => ({ pos: [-0.6, 0.9, 1.6], look: [-0.6, 0.55, -2.2], fov: 40 }) },
];
export const TOTAL = SHOTS[SHOTS.length - 1].b;
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];

/** where Jibril's light is at frame f (shots 2-3): from the north door across the courtyard to the seated place */
const lightPath = (f: number): V3 => {
  if (f < 180) { const u = smooth((f - 100) / 80); return lerp3([1.5, 0, 14.4], [1.5, 0, 11.5], u); }
  return [0.9, 0, -8.6];
};

// ---------------- characters ----------------
const SHEPHERD: Outfit = { jacket: "#b89a74", pants: "#6a5440", boots: "#c99067", dress: "#c4aa82", robe: true, belt: "#6b4f33", skin: "#c99067",
  hat: "imama", cap: "#e9dfc9", beard: "#2a1d16", moustache: "#2a1d16" };
const drawShepherd = (p: Pen) => bodyFront(p, SHEPHERD, { mode: "stand", expr: "calm", seed: 11, facing: 1, look: 0.3, light: -2.4, prop: "staff" });

// ---------------- the world ----------------
const lam = (o: THREE.MeshLambertMaterialParameters) => twoTone(new THREE.MeshLambertMaterial(o));
const add = (parent: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, cast = true) => { const x = new THREE.Mesh(g, m); x.castShadow = cast; x.receiveShadow = true; parent.add(x); return x; };
const box = (w: number, h: number, d: number, x: number, y: number, z: number) => { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y + h / 2, z); return g; };

type Assets = { kit: Kit; sand: THREE.Texture; mud: THREE.Texture; bark: THREE.Texture; thatch: THREE.Texture; sky: Record<string, string[]> };

class Ep01World {
  root = new THREE.Group();
  private desert = new THREE.Group();
  private mosque = new THREE.Group();
  private sun = new THREE.DirectionalLight("#fff1d8", 3);
  private hemi = new THREE.HemisphereLight("#cfe6ff", "#8a6a50", 0.5);
  private skyMat: THREE.ShaderMaterial; private sky: THREE.Mesh;
  private fog = new THREE.Fog("#e2d6c2", 60, 900);
  private pool = new Pool();
  private shepherd: Actor;
  private goats: { g: Goat; x: number; z: number; yaw: number; walk: number; graze: number }[] = [];
  private jib: { pool: THREE.Mesh; door: THREE.Mesh; shafts: THREE.Mesh[]; light: THREE.PointLight };
  private dust: THREE.Points;

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
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1300, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.sky, this.sun, this.sun.target, this.hemi, this.desert, this.mosque);
    this.buildDesert();
    this.buildMosque();
    this.shepherd = new Actor(this.desert);
    // Jibril: light only, never a figure, never an orb. A pool of light on the floor where he is, a few thin shafts of
    // light falling onto it from above (uneven widths and spacing, so they never add up to a body), and the doorway
    // glowing when he enters. Additive and bright enough to bloom softly.
    const grad = (w: number, h: number, fn: (x: number, y: number) => number) => {
      const cv = document.createElement("canvas"); cv.width = w; cv.height = h; const g = cv.getContext("2d")!, im = g.createImageData(w, h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4, a = Math.max(0, Math.min(1, fn(x / (w - 1), y / (h - 1)))); im.data[i] = im.data[i + 1] = 255; im.data[i + 2] = 240; im.data[i + 3] = Math.round(255 * a); }
      g.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
    };
    const add2 = (map: THREE.Texture, col: [number, number, number]) => new THREE.MeshBasicMaterial({ map, color: new THREE.Color(...col), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
    const poolTex = grad(256, 256, (x, y) => { const r = Math.hypot((x - 0.5) * 2, (y - 0.5) * 2); return (1 - r) ** 1.6; });
    const poolG = new THREE.PlaneGeometry(1, 1); poolG.rotateX(-Math.PI / 2);
    const pool = new THREE.Mesh(poolG, add2(poolTex, [1.5, 1.4, 1.15]));
    // soft shafts: widest and brightest where they land in the pool, fading out well below the roof
    const shaftTex = grad(64, 256, (x, y) => (1 - Math.abs(x - 0.5) * 2) ** 2 * Math.sin(Math.PI * Math.min(1, y * 1.15)) ** 1.5);
    const shafts = [-0.22, -0.05, 0.12, 0.26].map((dx, i) => {
      const g = new THREE.PlaneGeometry(0.16 + 0.1 * rnd(i + 40), 2.4); g.translate(0, 1.2, 0); g.rotateZ(0.16);
      const m = new THREE.Mesh(g, add2(shaftTex, [0.42, 0.4, 0.32])); m.userData.dx = dx; m.userData.dz = 0.25 * (rnd(i + 50) - 0.5); return m;
    });
    // the doorway fills with light and glows onto the wall face around it
    const doorTex = grad(128, 128, (x, y) => { const dx = Math.max(0, Math.abs(x - 0.5) * 2 - 0.5) / 0.5; return (1 - dx) ** 2 * (0.3 + 0.7 * Math.min(1, (1 - y) * 1.6)); });
    const door = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.0), add2(doorTex, [1.1, 1.05, 0.9]));
    door.position.set(1.5, 1.2, 14.6); door.rotation.y = Math.PI;
    for (const m of [pool, door, ...shafts]) { m.layers.set(NOINK); m.renderOrder = 6; this.mosque.add(m); }
    const pl = new THREE.PointLight("#fff4dc", 0, 7, 1.6); this.mosque.add(pl);
    this.jib = { pool, door, shafts, light: pl };
    // dust motes floating in the portico air (lit by the light)
    const n = 500, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) pos.set([-6 + 16 * rnd(i + 1), 0.3 + 3 * rnd(i + 7), -14 + 10 * rnd(i + 13)], i * 3);
    const dg = new THREE.BufferGeometry(); dg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const dot = document.createElement("canvas"); dot.width = dot.height = 32; { const g = dot.getContext("2d")!; const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); }
    this.dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: "#fff2d0", map: new THREE.CanvasTexture(dot), size: 0.03, transparent: true, opacity: 0.55, depthWrite: false }));
    this.dust.layers.set(NOINK); this.mosque.add(this.dust);
  }

  private buildDesert() {
    const D = this.desert, A = this.A;
    // dunes: a big displaced plane; flattened where the shepherd stands
    const g = new THREE.PlaneGeometry(1400, 1400, 220, 220); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z);
      const dune = 3.2 * Math.sin(x * 0.021 + Math.sin(z * 0.013) * 2.1) * Math.sin(z * 0.017 + 0.6) + 1.6 * Math.sin(x * 0.047 + z * 0.031)
        + (r > 120 ? (r - 120) * 0.035 * (1 + Math.sin(Math.atan2(z, x) * 5)) : 0);
      p.setY(i, dune * smooth((r - 10) / 40) - 0.05);
    }
    g.computeVertexNormals();
    const uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 1400 / 7, uv.getY(i) * 1400 / 7);
    add(D, g, lam({ map: A.sand }), false);
    const place = (name: string, x: number, z: number, h: number, yaw = 0) => {
      const o = kitClone(A.kit, name, h); if (!o) return;
      o.position.set(x, 0, z); o.rotation.y = yaw;
      o.traverse((m) => { if ((m as THREE.Mesh).isMesh) { m.castShadow = true; m.receiveShadow = true; } });
      D.add(o);
    };
    // rocks around the grazing ground; an oasis of palms and a goat-hair tent behind
    for (const [n, x, z, h, y] of [["rock_smallA", -5.5, -6, 0.5, 0.4], ["rock_largeB", 7, -11, 3.0, 2], ["rock_smallA", 3.5, 2.5, 0.35, 0],
      ["rock_smallB", -2.8, 3.4, 0.3, 1], ["stone_largeA", 9, -3, 0.9, 0.5], ["plant_bushSmall", -3.6, -2.5, 0.6, 0], ["plant_bushSmall", 5.2, -4.8, 0.7, 2]] as [string, number, number, number, number][])
      place(n, x, z, h, y);
    for (const [n, x, z, h] of [["tree_palmTall", -16, -38, 11], ["tree_palm", -10, -42, 8], ["tree_palmBend", -21, -44, 9], ["tree_palmDetailedTall", -4, -47, 12], ["tree_palmShort", -13, -35, 5]] as [string, number, number, number][])
      place(n, x, z, h, x * 0.3);
    const tent = null as THREE.Object3D | null; // the Kenney tent reads as a roofed hut: left out
    if (tent) {
      tent.traverse((m) => { const mm = m as THREE.Mesh; if (mm.isMesh) { mm.material = lam({ color: "#3a302c" }); mm.castShadow = mm.receiveShadow = true; } });
      tent.position.set(-11, 0, -30); tent.rotation.y = 0.5; D.add(tent);
    }
    // far ridges (fogged)
    for (let i = 0; i < 9; i++) {
      const a = -2.2 + i * 0.42, d = 420 + 60 * rnd(i), cg = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      cg.scale(110 + 60 * rnd(i + 3), 22 + 18 * rnd(i + 5), 45); cg.rotateY(-a + Math.PI / 2); cg.translate(Math.cos(a) * d, -2, Math.sin(a) * d);
      add(D, cg, lam({ color: "#d6a874" }), false);
    }
    // goats: a small flock grazing and wandering around the shepherd
    const spots: [number, number, number, number, number][] = [[-1.7, -0.4, 0.5, 0, 1], [1.6, -1.3, 2.6, 0.3, 0.3], [-0.7, -2.8, -0.9, 0.5, 0.8], [3.2, -3.2, 3.6, 0, 1], [-3.6, -2.4, 1.2, 0.2, 0.6], [2.4, 1.9, -2.4, 0, 0.9]];
    spots.forEach(([x, z, yaw, walk, graze], i) => {
      const gt = new Goat(COATS[i % COATS.length], i + 1);
      gt.root.position.set(x, 0, z); gt.root.rotation.y = yaw; gt.root.scale.setScalar(0.95 + 0.12 * rnd(i + 2));
      D.add(gt.root); this.goats.push({ g: gt, x, z, yaw, walk, graze });
    });
  }

  private buildMosque() {
    const M = this.mosque, A = this.A;
    // early Masjid Nabawi (approximate; sources in SCRIPT.md for review): ~35 x 30 m enclosure of mud brick on a low
    // stone footing, a portico of palm-trunk pillars roofed with palm fronds on the qibla side, sand floor, doors.
    const X0 = -17.5, X1 = 17.5, Z0 = -15, Z1 = 15, H = 3.0, T = 0.7;
    const mud = lam({ map: A.mud }), sandM = lam({ map: A.sand }), bark = lam({ map: A.bark }), frond = lam({ map: A.thatch, side: THREE.DoubleSide }), footing = lam({ color: "#9c8a72" });
    const sandG = new THREE.PlaneGeometry(300, 300); sandG.rotateX(-Math.PI / 2);
    const suv = sandG.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < suv.count; i++) suv.setXY(i, suv.getX(i) * 300 / 6, suv.getY(i) * 300 / 6);
    add(M, sandG, sandM, false);
    const wall = (x0: number, z0: number, x1: number, z1: number, gaps: [number, number][] = []) => {
      const len = Math.hypot(x1 - x0, z1 - z0), dx = (x1 - x0) / len, dz = (z1 - z0) / len;
      let s = 0;
      const cuts = [...gaps.map(([c, w]) => [c - w / 2, c + w / 2]), [len, len]].sort((a, b) => a[0] - b[0]);
      for (const [g0, g1] of cuts) {
        if (g0 - s > 0.05) {
          const w = g0 - s, cx = x0 + dx * (s + w / 2), cz = z0 + dz * (s + w / 2);
          const gm = new THREE.BoxGeometry(w, H, T); gm.rotateY(-Math.atan2(dz, dx)); gm.translate(cx, H / 2, cz);
          const uv = gm.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 2.5, uv.getY(i) * H / 2.5);
          add(M, gm, mud);
          const fg = new THREE.BoxGeometry(w, 0.35, T + 0.12); fg.rotateY(-Math.atan2(dz, dx)); fg.translate(cx, 0.175, cz); add(M, fg, footing);
        }
        if (g1 < len) { // door lintel of palm wood over the gap
          const cx = x0 + dx * (g0 + g1) / 2, cz = z0 + dz * (g0 + g1) / 2, lg = new THREE.BoxGeometry(g1 - g0 + 0.6, 0.22, T * 0.8);
          lg.rotateY(-Math.atan2(dz, dx)); lg.translate(cx, 2.35, cz); add(M, lg, bark);
          const top = new THREE.BoxGeometry(g1 - g0, H - 2.46, T); top.rotateY(-Math.atan2(dz, dx)); top.translate(cx, 2.46 + (H - 2.46) / 2, cz); add(M, top, mud);
        }
        s = g1;
      }
    };
    wall(X0, Z0, X1, Z0);                       // qibla wall (south)
    wall(X0, Z1, X1, Z1, [[19, 1.6]]);          // north wall with a door (x = 1.5)
    wall(X1, Z0, X1, Z1, [[18, 1.6]]);          // east wall with a door
    wall(X0, Z0, X0, Z1, [[18, 1.6]]);          // west wall with a door
    // portico (zulla) on the qibla side: 3 rows of palm-trunk pillars, beams, a frond roof with small gaps
    const pz = [-13, -10.2, -7.4], px = Array.from({ length: 11 }, (_, i) => -15 + i * 3);
    for (const z of pz) for (const x of px) {
      const cg = new THREE.CylinderGeometry(0.17, 0.2, H + 0.1, 9); cg.translate(x, (H + 0.1) / 2, z);
      const uv = cg.attributes.uv as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 1.2, uv.getY(i) * 2.5);
      add(M, cg, bark);
    }
    for (const z of pz) add(M, box(X1 - X0, 0.2, 0.22, 0, H, z), bark);
    for (const x of px) add(M, box(0.14, 0.12, 7.6, x, H + 0.2, -10.3), bark);
    // frond roof: overlapping strips with narrow gaps (light leaks through in thin bars)
    for (let i = 0; i < 26; i++) {
      const z = -14.4 + i * 0.29, rg = new THREE.PlaneGeometry(X1 - X0, 0.26); rg.rotateX(-Math.PI / 2); rg.translate(0, H + 0.33 + 0.02 * (i % 2), z);
      const uv = rg.attributes.uv as THREE.BufferAttribute; for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * 12, uv.getY(k) * 0.12);
      add(M, rg, frond);
    }
    // traces of the companions: a row of sandals by the north door (inside), nobody shown
    const leather = ["#6b4a2e", "#7d5534", "#5a3d26", "#8a6040"];
    for (let i = 0; i < 9; i++) for (const s of [-1, 1]) {
      const sg = new THREE.CylinderGeometry(0.055, 0.05, 0.02, 10); sg.scale(1, 1, 2.4);
      sg.translate(-2.4 + i * 0.62 + s * 0.07 + 0.05 * rnd(i * 3), 0.01, 14.0 - 0.06 * rnd(i) + s * 0.02);
      add(M, sg, lam({ color: leather[i % 4] }), false);
    }
    // a water jar and a bowl in a corner of the portico
    const jar = kitClone(A.kit, "pot_large", 0.7); if (jar) { jar.position.set(-6.5, 0, -14.1); M.add(jar); }
    // palms outside the walls (seen over them)
    for (const [n, x, z, h] of [["tree_palmTall", -9, 24, 13], ["tree_palm", 6, 27, 10], ["tree_palmDetailedTall", 14, 22, 14], ["tree_palmBend", -20, 20, 11], ["tree_palmTall", 25, 5, 12]] as [string, number, number, number][]) {
      const o = kitClone(A.kit, n, h); if (o) { o.position.set(x, 0, z); o.rotation.y = x; o.traverse((m) => { if ((m as THREE.Mesh).isMesh) m.castShadow = true; }); M.add(o); }
    }
  }

  update(f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const s = shotAt(f), t = f / FPS, L = s.light, c = s.cam(f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); if (c.roll) cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.1; cam.far = 2000; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    cam.layers.enable(NOINK);
    this.desert.visible = s.set === "desert"; this.mosque.visible = s.set === "mosque";
    // camera-relative sun, frozen per shot (as in the bridge world)
    const c0 = s.cam(s.a), fx = c0.look[0] - c0.pos[0], fz = c0.look[2] - c0.pos[2], n = Math.hypot(fx, fz) || 1;
    const az = THREE.MathUtils.degToRad(L.az), el = THREE.MathUtils.degToRad(L.el), ux = fx / n, uz = fz / n;
    const sunDir = V((ux * Math.cos(az) - uz * Math.sin(az)) * Math.cos(el), Math.sin(el), (uz * Math.cos(az) + ux * Math.sin(az)) * Math.cos(el)).normalize();
    const focus = V(...c.look);
    const Rr = s.set === "mosque" ? 26 : 30;
    const shadowAt = s.set === "mosque" ? V(0, 0, 0) : focus;
    this.sun.position.copy(shadowAt).addScaledVector(sunDir, 200); this.sun.target.position.copy(shadowAt);
    const sc = this.sun.shadow.camera; sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 50; sc.far = 400; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(0.03, 0.02, 0); TONE.uSat.value = 1.05;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    // sky (HDRI-sampled stops) + fog = horizon colour
    const stops = this.A.sky.goegap, su = this.skyMat.uniforms;
    stops.forEach((h, i) => untone(h, su["c" + i].value));
    su.e.value.set(...[3, 8, 16, 40].map((d) => THREE.MathUtils.degToRad(d)) as [number, number, number, number]);
    this.sky.position.copy(cam.position);
    untone(stops[0], this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar;
    scene.fog = this.fog; scene.background = null;
    // ---- desert: goats + shepherd card ----
    if (s.set === "desert") {
      for (const g of this.goats) g.g.pose(t, g.walk, g.graze);
      const a = this.shepherd;
      a.r = this.pool.req("shepherd", 600, 1000, 1, drawShepherd);
      a.mesh.visible = true; a.mesh.position.set(0, 0, 0);
      a.mesh.rotation.set(0, Math.atan2(cam.position.x, cam.position.z), 0);
      a.mesh.scale.setScalar(0.8); a.mesh.castShadow = true;
      this.pool.flush(); a.bind();
    } else this.shepherd.mesh.visible = false;
    // ---- mosque: Jibril's light ----
    const on = s.set === "mosque";
    for (const m of [this.jib.pool, this.jib.door, ...this.jib.shafts]) m.visible = on;
    if (on) {
      const k = smooth((f - 96) / 30), p = lightPath(f), near = s.id === 3;
      // doorway glows as he enters (shot 2), fades once he is inside
      this.jib.door.visible = !near; (this.jib.door.material as THREE.MeshBasicMaterial).opacity = k;
      // pool: under him when near; at the door it spills into the courtyard toward the camera
      if (near) { this.jib.pool.position.set(p[0], 0.02, p[2]); this.jib.pool.scale.set(1.5 * k, 1, 1.7 * k); }
      else { this.jib.pool.position.set(p[0], 0.02, p[2] - 1.6); this.jib.pool.scale.set(2.6 * k, 1, 6 * k); }
      const yaw = Math.atan2(cam.position.x - p[0], cam.position.z - p[2]);
      this.jib.shafts.forEach((m, i) => {
        m.position.set(p[0] + m.userData.dx * Math.cos(yaw), 0, p[2] - m.userData.dx * Math.sin(yaw) + m.userData.dz);
        m.rotation.set(0, yaw, 0);
        m.visible = near; (m.material as THREE.MeshBasicMaterial).opacity = k * (0.6 + 0.4 * Math.sin(t * 1.3 + i * 1.7) ** 2);
      });
      this.jib.light.position.set(p[0], 0.6, p[2]); this.jib.light.intensity = (near ? 3 : 5) * k;
      (this.dust.material as THREE.PointsMaterial).opacity = 0.35 + 0.3 * Math.sin(t * 0.7) ** 2;
      this.dust.rotation.y = t * 0.01;
    } else this.jib.light.intensity = 0;
    return focus;
  }
}

export const makeEp01 = async (): Promise<HostedWorld> => {
  const [kit, sand, mud, bark, thatch, goegap] = await Promise.all([
    loadKit(),
    painted("sand_01", ["#c9a46e", "#d8b47c", "#e2c28a", "#ebcf9a", "#f2dcaa"], 512, 3),
    painted("brown_mud_dry", ["#b48d67", "#c29b73", "#cfa97f", "#d9b68b"], 512, 4),
    painted("palm_bark", ["#8a6a4a", "#a07c57", "#b38e66", "#c4a078"], 512, 1),
    painted("thatch_roof_angled", ["#6f5a36", "#8a7344", "#a48b55", "#bba266"], 512, 1),
    skyFromHDR("goegap"),
  ]);
  const w = new Ep01World({ kit, sand, mud, bark, thatch, sky: { goegap } });
  return {
    root: w.root,
    update: (f, cam, scene) => w.update(f, cam, scene),
    dof: (f) => { const s = shotAt(f); return { cInf: s.cInf, focus: s.focus ? V(...s.focus) : undefined }; },
    grade: (f) => shotAt(f).grade,
  };
};
