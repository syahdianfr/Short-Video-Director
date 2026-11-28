// Episode 1 cast (2.5D cards drawn with toon.ts). Only ordinary, unnamed people: a barefoot shepherd, a young man of
// today (the narrator's stand-in), and city passers-by (men; women in hijab and long dresses). Nobody here is a
// prophet, a member of his family or a companion.
import { Pen, bodyFront, Outfit, INK } from "./toon";

export const SHEPHERD: Outfit = { jacket: "#b89a74", pants: "#6a5440", boots: "#c99067", dress: "#c4aa82", robe: true, belt: "#6b4f33", skin: "#c99067",
  hat: "imama", cap: "#e9dfc9", beard: "#2a1d16", moustache: "#2a1d16" };
export const drawShepherd = (p: Pen) => bodyFront(p, SHEPHERD, { mode: "stand", expr: "calm", seed: 11, facing: 1, look: 0.3, light: -2.4, prop: "staff" });

export const YOUTH: Outfit = { jacket: "#3f7a66", pants: "#2f3442", boots: "#ece7de", hat: "hair", hair: "#1b1412", skin: "#d6a27c", belt: null };
/** looking up at the towers: eyes open, head tipped a little back */
export const drawYouthUp = (p: Pen) => {
  bodyFront(p, YOUTH, { mode: "stand", expr: "calm", seed: 23, facing: 0, look: 0, light: -2.4, headTilt: -6 });
  bag(p, false);
};
/** looking down at the prayer mat rolled in his bag: eyes closed, head bowed */
export const drawYouthDown = (p: Pen) => {
  bodyFront(p, YOUTH, { mode: "stand", expr: "calm", seed: 23, facing: 0, look: 0, light: -2.4, headTilt: 7, blink: 1 }); // eyes closed: reflective
  bag(p, true);
};
/** cross-body bag on the left hip with a rolled prayer mat (sajadah) in it; `show` pulls the roll a little out */
const bag = (p: Pen, show: boolean) => {
  p.band([[372, 452], [255, 700]], "#3b3f4a", 10, 2.5);                                   // strap
  p.poly([[205, 660], [300, 660], [304, 760], [201, 760]], "#4a4f5c", 6);                   // bag
  const top = show ? 560 : 600;
  p.poly([[214, top], [292, top - 14], [296, 672], [218, 684]], "#8c2f3a", 6);              // rolled sajadah
  for (let i = 0; i < 4; i++) p.stroke([[220 + i * 4, top + 14 + i * 22], [292 - i * 2, top + i * 22]], 4, "#d9b36a"); // woven border lines
  p.ell(255, top - 4, 40, 12, "#a23a46", 5);                                                // the roll's end
  p.arc(255, top - 4, 22, 6, 0, 360, 3, "#d9b36a");
  p.stroke([[300, 690], [300, 735]], 4, INK);                                               // buckle
};

const MEN_SHIRTS = ["#4a6fa5", "#8a4b3a", "#e8e2d6", "#5b7b4c", "#3d3f4a", "#b07a3a"];
const WOMEN_HIJAB = ["#4f5d7a", "#7a4f5f", "#2f3a3f", "#8a6f52", "#5f7a6a", "#c9b9a6"];
const WOMEN_DRESS = ["#3e4a62", "#6b4552", "#2c3236", "#7b6350", "#4f665a", "#a8957f"];
const SKINS = ["#d6a27c", "#c99067", "#e8c2a0", "#b97f5a"];
export const townMan = (v: number): Outfit => ({ jacket: MEN_SHIRTS[v % 6], pants: v % 2 ? "#2f3442" : "#5a5248", boots: "#2a2522", hat: "hair", hair: "#1b1412", skin: SKINS[v % 4],
  ...(v % 3 === 0 ? { beard: "#1b1412" } : {}) });
export const townWoman = (v: number): Outfit => ({ jacket: WOMEN_DRESS[v % 6], pants: WOMEN_DRESS[v % 6], boots: "#2a2522", dress: WOMEN_DRESS[v % 6], robe: true,
  hat: "hijab", cap: WOMEN_HIJAB[v % 6], skin: SKINS[(v + 1) % 4] });
export const drawTown = (o: Outfit, seed: number, phase: number) => (p: Pen) =>
  bodyFront(p, o, { mode: o.robe ? "stand" : "stroll", phase, expr: "calm", seed, facing: (seed % 3) - 1 as -1 | 0 | 1, light: -2.4 });
