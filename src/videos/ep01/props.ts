// Procedural sets for episode 1 (no third-party models): glass towers that pierce the clouds, mud-brick houses, a
// black goat-hair tent, cloud cards, a small modern mosque with a lit lamp, street lamps. All world materials are
// two-tone Lambert (shade.ts) so they share the world's light and ink.
import * as THREE from "three";
import { twoTone } from "./shade";
import { ctex, cloudHD } from "./paint";
import { NOINK } from "./ink";

export const lam = (o: THREE.MeshLambertMaterialParameters) => twoTone(new THREE.MeshLambertMaterial(o));
export const add = (parent: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, cast = true) => {
  const x = new THREE.Mesh(g, m); x.castShadow = cast; x.receiveShadow = true; parent.add(x); return x;
};
export const rnd = (s: number) => { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); };
/** multiply a geometry's uvs so a texture tiles every `su` x `sv` metres on a box of size w x h */
export const tileUV = (g: THREE.BufferGeometry, ku: number, kv: number) => {
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * ku, uv.getY(i) * kv);
  return g;
};
const boxAt = (w: number, h: number, d: number, x: number, y: number, z: number) => { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y + h / 2, z); return g; };

// ---------------- glass towers ----------------
/** curtain-wall texture: one tile = 4 panes wide x 6 floors (12 m x 24 m). Day: blue-teal glass with sky streaks.
 *  Night (emissive map): mostly dark with scattered warm lit windows. */
const glassTex = (seed: number, tint: string) => ctex(`glass_${seed}_${tint}`, 256, 512, (g, r) => {
  g.fillStyle = "#c9d3da"; g.fillRect(0, 0, 256, 512);              // mullions / floor slabs
  const base = new THREE.Color(tint);
  for (let fy = 0; fy < 6; fy++) for (let px = 0; px < 4; px++) {
    const c = base.clone().offsetHSL(0, 0, (r() - 0.5) * 0.06 + (fy / 6) * 0.05);
    const x0 = px * 64 + 5, y0 = fy * 85 + 6, w = 54, h = 72;
    const gr = g.createLinearGradient(x0, y0, x0 + w, y0 + h);
    gr.addColorStop(0, "#" + c.clone().offsetHSL(0, 0, 0.12).getHexString()); gr.addColorStop(1, "#" + c.getHexString());
    g.fillStyle = gr; g.fillRect(x0, y0, w, h);
  }
  g.globalAlpha = 0.25; g.fillStyle = "#ffffff";                        // a diagonal sky reflection
  g.beginPath(); g.moveTo(40 + 60 * r(), 0); g.lineTo(110 + 60 * r(), 0); g.lineTo(0, 300); g.lineTo(0, 200); g.fill(); g.globalAlpha = 1;
});
const nightTex = (seed: number) => ctex(`glassNight_${seed}`, 256, 512, (g, r) => {
  g.fillStyle = "#000000"; g.fillRect(0, 0, 256, 512);
  for (let fy = 0; fy < 6; fy++) for (let px = 0; px < 4; px++) if (r() < 0.38) {
    g.fillStyle = r() < 0.7 ? "#ffcf8a" : "#fff1d6"; g.fillRect(px * 64 + 7, fy * 85 + 10, 50, 64);
  }
});
const TINTS = ["#5d8fb0", "#4f7f9e", "#6aa0b8", "#7f9db4", "#5a86a6"];
const glassMats = new Map<number, THREE.MeshLambertMaterial>();
export const glassMat = (k: number) => {
  let m = glassMats.get(k);
  if (!m) {
    const map = glassTex(k, TINTS[k % TINTS.length]), em = nightTex(k);
    for (const t of [map, em]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
    m = twoTone(new THREE.MeshLambertMaterial({ map, emissive: new THREE.Color("#ffd9a0"), emissiveMap: em, emissiveIntensity: 0 }));
    glassMats.set(k, m);
  }
  return m;
};
export const allGlass = () => [...glassMats.values()];
const concrete = () => lam({ color: "#d9d4cc" });

/** a tower of stacked setback tiers on a podium, with a crown and (sometimes) a spire. Base at y = 0, grows along +y
 *  from its base (scale.y on the returned group; 0..1). */
export const tower = (w: number, d: number, h: number, seed: number) => {
  const g = new THREE.Group(), m = glassMat(seed % 5), c = concrete();
  const tiers = 2 + Math.floor(rnd(seed) * 3);
  let y = 0, tw = w, td = d;
  add(g, boxAt(w * 1.25, 6, d * 1.25, 0, 0, 0), c);                       // podium
  y = 6;
  for (let i = 0; i < tiers; i++) {
    const th = (h - 6) * (i === 0 ? 0.55 : 0.45 / (tiers - 1)) * (i === tiers - 1 ? 0.9 : 1);
    const bg = boxAt(tw, th, td, 0, y, 0); tileUV(bg, tw / 12, th / 24);
    add(g, bg, m);
    add(g, boxAt(tw + 0.6, 0.8, td + 0.6, 0, y + th, 0), c);           // floor band at each setback
    y += th + 0.8; tw *= 0.78; td *= 0.78;
  }
  if (rnd(seed + 3) < 0.6) { const sp = new THREE.CylinderGeometry(0.25, 0.6, h * 0.12, 8); sp.translate(0, y + h * 0.06, 0); add(g, sp, c); }
  else add(g, boxAt(tw * 0.7, 4, td * 0.7, 0, y, 0), c);
  return g;
};

// ---------------- mud-brick houses ----------------
export const mudHouse = (mud: THREE.Material, w: number, d: number, h: number, seed: number) => {
  const g = new THREE.Group(), dark = lam({ color: "#3a2a20" }), wood = lam({ color: "#6e4f34" });
  const b = boxAt(w, h, d, 0, 0, 0); tileUV(b, w / 2.5, h / 2.5); add(g, b, mud);
  for (const [px, pz, pw, pd] of [[0, d / 2 - 0.12, w, 0.24], [0, -d / 2 + 0.12, w, 0.24], [w / 2 - 0.12, 0, 0.24, d], [-w / 2 + 0.12, 0, 0.24, d]])
    { const pg = boxAt(pw, 0.5, pd, px, h, pz); tileUV(pg, Math.max(pw, pd) / 2.5, 0.2); add(g, pg, mud); }   // parapet
  add(g, boxAt(0.9, 1.9, 0.12, (rnd(seed) - 0.5) * w * 0.4, 0, d / 2 + 0.01), dark);                          // door
  for (let i = 0; i < 2; i++) add(g, boxAt(0.5, 0.5, 0.1, (i - 0.5) * w * 0.5, h * 0.62, d / 2 + 0.02), dark); // small windows
  for (let i = 0; i < 3; i++) { const bm = new THREE.CylinderGeometry(0.07, 0.07, 0.7, 6); bm.rotateX(Math.PI / 2); bm.translate((i - 1) * w * 0.3, h - 0.3, d / 2 + 0.3); add(g, bm, wood); } // roof beam ends
  return g;
};

// ---------------- black goat-hair tent ----------------
/** woven strips of goat hair: dark brown / black bands (the Bedouin bayt al-sha'r) */
const tentTex = () => ctex("tentStrips", 256, 256, (g, r) => {
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#2f2724" : "#3e332d"; g.fillRect(0, i * 32, 256, 32); }
  g.globalAlpha = 0.25; for (let i = 0; i < 400; i++) { g.fillStyle = r() < 0.5 ? "#1c1715" : "#56483f"; g.fillRect(r() * 256, r() * 256, 2, 6); } g.globalAlpha = 1;
});
export const tent = () => {
  const g = new THREE.Group(), t = tentTex(); t.wrapS = t.wrapT = THREE.RepeatWrapping;
  const cloth = lam({ map: t, side: THREE.DoubleSide }), pole = lam({ color: "#6e5236" }), rug = lam({ color: "#9a3b2e" });
  // roof: long, low, sagging between three pole lines, open at the front (+z), pegged low at the back
  const W = 7, D = 4.2, roof = new THREE.PlaneGeometry(W, D, 28, 14); roof.rotateX(-Math.PI / 2);
  const p = roof.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), ridge = 1.75 - 0.32 * Math.abs(Math.sin((Math.PI * x) / (W / 3)));
    const fall = z < 0 ? ridge - (ridge - 0.45) * (-z / (D / 2)) ** 1.3 : ridge - (ridge - 1.25) * (z / (D / 2)) ** 1.6;
    p.setY(i, fall);
  }
  roof.computeVertexNormals(); tileUV(roof, 2.5, 1.5);
  add(g, roof, cloth);
  const back = new THREE.PlaneGeometry(W, 0.5); back.translate(0, 0.25, -D / 2); tileUV(back, 2.5, 0.2); add(g, back, cloth);
  for (const x of [-W / 3, 0, W / 3]) { const pg = new THREE.CylinderGeometry(0.04, 0.05, 1.8, 6); pg.translate(x, 0.9, 0); add(g, pg, pole); }
  for (const x of [-W / 2 + 0.2, W / 2 - 0.2]) { const pg = new THREE.CylinderGeometry(0.035, 0.04, 1.3, 6); pg.translate(x, 0.65, D / 2 - 0.1); add(g, pg, pole); }
  const rg = new THREE.PlaneGeometry(2.6, 1.6); rg.rotateX(-Math.PI / 2); rg.translate(0, 0.02, 0.9); add(g, rg, rug, false);
  return g;
};

// ---------------- clouds ----------------
export const cloudCard = (seed: number, w: number, pal?: { lit: string; mid: string; shade: string }) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.5), new THREE.MeshBasicMaterial({ map: cloudHD(seed % 4, pal), transparent: true, depthWrite: false, fog: false, color: new THREE.Color(1.05, 1.05, 1.05) }));
  m.scale.set(w, w, 1); m.layers.set(NOINK); m.renderOrder = 2;
  return m;
};

// ---------------- small modern mosque (closing shot) ----------------
export const smallMosque = () => {
  const g = new THREE.Group(), white = lam({ color: "#eeeae2" }), trim = lam({ color: "#c9b48a" }), dome = lam({ color: "#d8d2c4" });
  const win = twoTone(new THREE.MeshLambertMaterial({ color: "#7a5a3c", emissive: new THREE.Color("#ffcf8a"), emissiveIntensity: 0 })); // carved wooden screens, lit at night
  add(g, boxAt(12, 6, 12, 0, 0, 0), white);
  add(g, boxAt(12.6, 0.6, 12.6, 0, 6, 0), trim);
  const dr = new THREE.CylinderGeometry(4, 4, 1.5, 24); dr.translate(0, 7.35, 0); add(g, dr, white);
  const dm = new THREE.SphereGeometry(4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2); dm.translate(0, 8.1, 0); add(g, dm, dome);
  for (const x of [-4, 0, 4]) { const wg = boxAt(1.4, 2.6, 0.1, x, 1.6, 6.03); add(g, wg, win); }
  const mn = new THREE.Group(); mn.position.set(8, 0, 5); g.add(mn);
  const sh = new THREE.CylinderGeometry(0.7, 0.85, 20, 12); sh.translate(0, 10, 0); add(mn, sh, white);
  const bal = new THREE.CylinderGeometry(1.3, 1.1, 0.6, 12); bal.translate(0, 15, 0); add(mn, bal, trim);
  const md = new THREE.SphereGeometry(0.8, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2); md.translate(0, 20, 0); add(mn, md, dome);
  const lamp = new THREE.PointLight("#ffcf8a", 0, 40, 1.4); lamp.position.set(0, 3, 9); g.add(lamp);
  return { g, win, lamp };
};

// ---------------- street lamp ----------------
export const streetLamp = () => {
  const g = new THREE.Group(), metal = lam({ color: "#4a4f57" });
  const post = new THREE.CylinderGeometry(0.08, 0.12, 6, 8); post.translate(0, 3, 0); add(g, post, metal);
  const arm = boxAt(1.2, 0.08, 0.08, 0.6, 5.9, 0); add(g, arm, metal);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.9, 0.7) }));
  bulb.position.set(1.15, 5.75, 0); bulb.layers.set(NOINK); g.add(bulb);
  return { g, bulb };
};

/** soft vertical light column (Jibril's light rising) */
export const lightColumn = () => {
  const t = ctex("jibColumn", 64, 256, (g) => {
    const im = g.createImageData(64, 256);
    for (let y = 0; y < 256; y++) for (let x = 0; x < 64; x++) {
      const i = (y * 64 + x) * 4, a = (1 - Math.abs(x / 63 - 0.5) * 2) ** 2 * (y / 255) ** 0.7;
      im.data[i] = 255; im.data[i + 1] = 250; im.data[i + 2] = 230; im.data[i + 3] = Math.round(255 * a);
    }
    g.putImageData(im, 0, 0);
  });
  const geo = new THREE.PlaneGeometry(1, 1); geo.translate(0, 0.5, 0);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: t, color: new THREE.Color(1.2, 1.15, 1.0), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false }));
  m.layers.set(NOINK); m.renderOrder = 7;
  return m;
};
