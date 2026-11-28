// A low-poly cartoon goat built from primitives (no third-party model, so no licence question). Desert goats of the
// region: long drooping ears, short swept-back horns, a small beard, black / brown / cream coats. Every material is
// two-tone Lambert (shade.ts) so the goat is lit exactly like the world and gets the world's ink lines.
// pose(t) is a pure function of time: a slow walk cycle (diagonal leg pairs) or grazing (head down, small nibble).
import * as THREE from "three";
import { twoTone } from "./shade";

export type GoatCoat = { body: string; patch?: string; horn: string; hoof: string; ear?: string };
export const COATS: GoatCoat[] = [
  { body: "#2b2426", horn: "#c9b48e", hoof: "#1b1517" },                       // black (Arabian black goat)
  { body: "#7a4a2e", patch: "#e9dcc2", horn: "#cdb994", hoof: "#2a1d16" },     // brown with cream
  { body: "#e6dac4", patch: "#8a6244", horn: "#b9a47e", hoof: "#3a2b22" },     // cream with brown
  { body: "#5a3b2b", horn: "#c7b18a", hoof: "#21170f", ear: "#3f281d" },        // dark brown
];

const matCache = new Map<string, THREE.MeshLambertMaterial>();
const mat = (c: string) => {
  let m = matCache.get(c);
  if (!m) { m = twoTone(new THREE.MeshLambertMaterial({ color: c })); matCache.set(c, m); }
  return m;
};
const mesh = (g: THREE.BufferGeometry, c: string) => { const m = new THREE.Mesh(g, mat(c)); m.castShadow = true; m.receiveShadow = true; return m; };
const ell = (rx: number, ry: number, rz: number, seg = 14) => { const g = new THREE.SphereGeometry(1, seg, Math.max(8, seg * 0.6)); g.scale(rx, ry, rz); return g; };

export class Goat {
  root = new THREE.Group();
  private legs: THREE.Group[] = [];
  private neck = new THREE.Group();
  private head = new THREE.Group();
  private tail = new THREE.Group();
  constructor(public coat: GoatCoat, public seed = 1) {
    const c = coat, R = this.root;
    const body = new THREE.Group(); body.position.y = 0.6; R.add(body);
    body.add(mesh(ell(0.48, 0.26, 0.23), c.body));
    if (c.patch) { const p = mesh(ell(0.2, 0.17, 0.235), c.patch); p.position.set(-0.12, -0.04, 0); body.add(p); }
    // legs: pivot at the top, hoof at the bottom (length 0.5)
    for (const [x, z] of [[0.32, 0.12], [0.32, -0.12], [-0.32, 0.12], [-0.32, -0.12]]) {
      const lg = new THREE.Group(); lg.position.set(x, -0.08, z);
      const leg = mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.46, 8), c.body); leg.position.y = -0.23; lg.add(leg);
      const hoof = mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.07, 8), c.hoof); hoof.position.y = -0.48; lg.add(hoof);
      body.add(lg); this.legs.push(lg);
    }
    // neck rises forward from the chest; head at its tip
    this.neck.position.set(0.38, 0.1, 0); body.add(this.neck);
    const nk = mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.38, 10), c.body); nk.rotation.z = -0.75; nk.position.set(0.12, 0.13, 0); this.neck.add(nk);
    this.head.position.set(0.27, 0.27, 0); this.neck.add(this.head);
    const skull = mesh(ell(0.17, 0.12, 0.11), c.body); this.head.add(skull);
    const muzzle = mesh(ell(0.12, 0.08, 0.08), c.patch ?? c.body); muzzle.position.set(0.15, -0.07, 0); this.head.add(muzzle);
    const nose = mesh(ell(0.03, 0.025, 0.05), c.hoof); nose.position.set(0.26, -0.06, 0); this.head.add(nose);
    for (const s of [-1, 1]) {
      const eye = mesh(ell(0.022, 0.022, 0.01, 8), "#140f10"); eye.position.set(0.07, 0.03, s * 0.1); this.head.add(eye);
      // long drooping ear
      const ear = mesh(ell(0.06, 0.16, 0.025, 10), c.ear ?? c.body); ear.position.set(-0.02, -0.08, s * 0.13); ear.rotation.set(s * 0.35, 0, -0.25); this.head.add(ear);
      // horn: a short tube swept back and out
      const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-0.02, 0.09, s * 0.05), new THREE.Vector3(-0.12, 0.22, s * 0.08), new THREE.Vector3(-0.24, 0.17, s * 0.12));
      this.head.add(mesh(new THREE.TubeGeometry(curve, 8, 0.022, 6, false), c.horn));
    }
    const beard = mesh(new THREE.ConeGeometry(0.035, 0.12, 6), c.body); beard.rotation.z = Math.PI; beard.position.set(0.12, -0.17, 0); this.head.add(beard);
    // tail: short and up
    this.tail.position.set(-0.46, 0.12, 0); body.add(this.tail);
    const tl = mesh(new THREE.ConeGeometry(0.04, 0.16, 6), c.body); tl.rotation.z = 0.9; tl.position.set(-0.05, 0.05, 0); this.tail.add(tl);
  }
  /** walk: 0 = still .. 1 = walking; graze: 0 = head up .. 1 = head to the ground */
  pose(t: number, walk: number, graze: number) {
    const ph = t * 2.1 + this.seed * 1.7;
    this.legs.forEach((lg, i) => { const d = i === 0 || i === 3 ? 0 : Math.PI; lg.rotation.z = walk * 0.38 * Math.sin(ph * Math.PI * 2 + d); });
    this.root.children[0].position.y = 0.6 + walk * 0.012 * Math.abs(Math.sin(ph * Math.PI * 2));
    const nibble = graze * 0.05 * Math.sin(t * 9 + this.seed);
    this.neck.rotation.z = -graze * 1.25 + nibble + (1 - graze) * 0.06 * Math.sin(t * 0.7 + this.seed);
    this.head.rotation.z = graze * 0.55;
    this.tail.rotation.z = 0.25 * Math.sin(t * 5 + this.seed * 3) * (0.4 + walk);
  }
}
