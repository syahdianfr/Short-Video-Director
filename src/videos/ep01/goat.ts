// A low-poly cartoon goat built from primitives (no third-party model, so no licence question). Every material is
// two-tone Lambert (shade.ts), so the goat is lit like the world and gets the world's ink lines.
// Readability (v2, after v1 read as "a dog with horns"): the silhouette must say GOAT at a glance:
//   - horns rise from the forehead and sweep back in a long arc (the strongest cue), thick at the base
//   - ears stick out SIDEWAYS, short; never drooping (drooping ears read as a hound)
//   - a narrow wedge head with a straight profile, a clear chin beard
//   - a straight back with a hip bump, a deep chest, a short tail flicked UP
//   - thin legs with a knee and a hock, small split hooves
//   - the black goat carries long hair as a fringe under the belly (the desert black goat)
// pose(t) is a pure function of time: walk (diagonal leg pairs) and graze (head to the ground, nibble).
import * as THREE from "three";
import { twoTone } from "./shade";

export type GoatCoat = { body: string; patch?: string; horn: string; hoof: string; shaggy?: boolean };
export const COATS: GoatCoat[] = [
  { body: "#2b2426", horn: "#cdb890", hoof: "#1b1517", shaggy: true },          // black, long-haired
  { body: "#8a5634", patch: "#efe3c9", horn: "#d2bf98", hoof: "#2a1d16" },      // brown with cream
  { body: "#ece2cd", horn: "#bba67f", hoof: "#3a2b22" },                       // cream
  { body: "#5e3e2c", horn: "#c9b38c", hoof: "#21170f", shaggy: true },          // dark brown, long-haired
];

const matCache = new Map<string, THREE.MeshLambertMaterial>();
const mat = (c: string) => {
  let m = matCache.get(c);
  if (!m) { m = twoTone(new THREE.MeshLambertMaterial({ color: c })); matCache.set(c, m); }
  return m;
};
const mesh = (g: THREE.BufferGeometry, c: string) => { const m = new THREE.Mesh(g, mat(c)); m.castShadow = true; m.receiveShadow = true; return m; };
const ell = (rx: number, ry: number, rz: number, seg = 14) => { const g = new THREE.SphereGeometry(1, seg, Math.max(8, Math.round(seg * 0.6))); g.scale(rx, ry, rz); return g; };
/** a limb segment from a to b (local coordinates of its parent), radius r0 at a and r1 at b */
const seg = (a: THREE.Vector3, b: THREE.Vector3, r0: number, r1: number, c: string) => {
  const d = b.clone().sub(a), g = new THREE.CylinderGeometry(r1, r0, d.length(), 8);
  const m = mesh(g, c);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return m;
};
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export class Goat {
  root = new THREE.Group();
  private body = new THREE.Group();
  private legs: THREE.Group[] = [];
  private neck = new THREE.Group();
  private head = new THREE.Group();
  private tail = new THREE.Group();
  constructor(public coat: GoatCoat, public seed = 1) {
    const c = coat;
    this.body.position.y = 0.54; this.root.add(this.body);
    const B = this.body;
    // barrel: deep chest in front, straight back, a hip bump behind
    B.add(mesh(ell(0.4, 0.23, 0.2), c.body));
    const chest = mesh(ell(0.21, 0.24, 0.19), c.body); chest.position.set(0.22, -0.02, 0); B.add(chest);
    const hip = mesh(ell(0.18, 0.22, 0.18), c.body); hip.position.set(-0.26, 0.03, 0); B.add(hip);
    if (c.patch) { const p = mesh(ell(0.14, 0.13, 0.175), c.patch); p.position.set(0.02, 0.0, 0); B.add(p); }
    if (c.shaggy) for (let i = 0; i < 7; i++) { // long hair under the belly
      const fr = mesh(new THREE.ConeGeometry(0.06, 0.16, 5), c.body); fr.rotation.z = Math.PI; fr.position.set(-0.3 + i * 0.1, -0.2, (i % 2 ? 1 : -1) * 0.06); B.add(fr);
    }
    // legs: hip/shoulder pivot; thigh, shin with a knee bend, cannon bone, split hoof
    for (const [x, z, front] of [[0.27, 0.1, 1], [0.27, -0.1, 1], [-0.28, 0.1, 0], [-0.28, -0.1, 0]] as const) {
      const lg = new THREE.Group(); lg.position.set(x, -0.06, z); B.add(lg); this.legs.push(lg);
      const knee = front ? v(0.0, -0.24, 0) : v(-0.05, -0.21, 0), hock = front ? v(0.01, -0.37, 0) : v(-0.025, -0.34, 0), foot = v(0.0, -0.5, 0);
      lg.add(seg(v(0, 0, 0), knee, 0.075, 0.042, c.body));
      lg.add(seg(knee, hock, 0.04, 0.034, c.body));
      lg.add(seg(hock, foot, 0.032, 0.03, c.body));
      for (const s of [-1, 1]) { const h = mesh(ell(0.022, 0.026, 0.016, 8), c.hoof); h.position.set(0.012, -0.512, s * 0.015); lg.add(h); }
    }
    // neck: slim, rising up from the chest (head held up, not pushed forward)
    this.neck.position.set(0.3, 0.08, 0); B.add(this.neck);
    this.neck.add(seg(v(0, 0, 0), v(0.12, 0.3, 0), 0.11, 0.075, c.body));
    this.head.position.set(0.13, 0.33, 0); this.neck.add(this.head);
    const H = this.head;
    // wedge head: forehead block narrowing to a slim muzzle, straight profile
    const skull = mesh(ell(0.11, 0.1, 0.085), c.body); H.add(skull);
    const face = seg(v(0.04, -0.02, 0), v(0.22, -0.1, 0), 0.075, 0.045, c.patch && c.body !== "#ece2cd" ? c.patch : c.body); H.add(face);
    const nose = mesh(ell(0.035, 0.03, 0.04, 8), c.hoof); nose.position.set(0.235, -0.105, 0); H.add(nose);
    for (const s of [-1, 1]) {
      const eye = mesh(ell(0.018, 0.016, 0.01, 8), "#f1d27a"); eye.position.set(0.06, 0.025, s * 0.078); H.add(eye);
      const pupil = mesh(ell(0.014, 0.005, 0.004, 6), "#120d0e"); pupil.position.set(0.064, 0.025, s * 0.087); H.add(pupil); // goats: horizontal slit
      // ears straight out to the side, a little down; short
      const ear = mesh(ell(0.085, 0.028, 0.04, 10), c.body); ear.position.set(-0.03, 0.03, s * 0.12); ear.rotation.set(s * -0.25, s * 0.9, -0.15); H.add(ear);
      // horns: from the forehead, up and back in a long arc, thick at the base
      const curve = new THREE.CatmullRomCurve3([v(0.02, 0.08, s * 0.035), v(0.0, 0.15, s * 0.045), v(-0.05, 0.2, s * 0.055), v(-0.12, 0.2, s * 0.065), v(-0.16, 0.16, s * 0.07)]);
      const tube = new THREE.TubeGeometry(curve, 16, 0.026, 8, false);
      const pa = tube.attributes.position as THREE.BufferAttribute; // taper the horn toward its tip
      const ring = 9;
      for (let i = 0; i < pa.count; i++) {
        const k = Math.floor(i / ring) / 16, cp = curve.getPoint(Math.min(1, k)), tp = 1 - 0.75 * k;
        pa.setXYZ(i, cp.x + (pa.getX(i) - cp.x) * tp, cp.y + (pa.getY(i) - cp.y) * tp, cp.z + (pa.getZ(i) - cp.z) * tp);
      }
      tube.computeVertexNormals();
      H.add(mesh(tube, c.horn));
    }
    const beard = mesh(new THREE.ConeGeometry(0.035, 0.16, 6), c.body === "#ece2cd" ? "#d8ccb3" : c.body);
    beard.rotation.z = Math.PI + 0.25; beard.position.set(0.17, -0.2, 0); H.add(beard);
    // tail: short, flicked up
    this.tail.position.set(-0.42, 0.14, 0); B.add(this.tail);
    const tl = mesh(new THREE.ConeGeometry(0.035, 0.13, 6), c.body); tl.rotation.z = 0.5; tl.position.set(-0.02, 0.06, 0); this.tail.add(tl);
  }
  /** walk: 0 = still .. 1 = walking; graze: 0 = head up .. 1 = head to the ground */
  pose(t: number, walk: number, graze: number) {
    const ph = t * 2.1 + this.seed * 1.7;
    this.legs.forEach((lg, i) => { const d = i === 0 || i === 3 ? 0 : Math.PI; lg.rotation.z = walk * 0.32 * Math.sin(ph * Math.PI * 2 + d); });
    this.body.position.y = 0.54 + walk * 0.01 * Math.abs(Math.sin(ph * Math.PI * 2));
    const nibble = graze * 0.05 * Math.sin(t * 9 + this.seed);
    this.neck.rotation.z = -graze * 1.55 + nibble + (1 - graze) * 0.05 * Math.sin(t * 0.7 + this.seed);
    this.head.rotation.z = -graze * 0.2;
    this.tail.rotation.z = 0.2 * Math.sin(t * 5 + this.seed * 3) * (0.4 + walk);
  }
}
