import React from 'react';
import {interpolate, Easing} from 'remotion';
import {ToonPart, FlatPart, canvasTexture, FONT_BLACK, FONT_TYPE, INK} from '../lib/toon';
import type {SetProps} from './common';

type Pt = [number, number];
const poly = (ctx: CanvasRenderingContext2D, w: number, h: number, pts: Pt[], fill: string, line = 5) => {
  ctx.fillStyle = fill;
  ctx.strokeStyle = INK;
  ctx.lineWidth = line;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  pts.forEach(([u, v], i) => (i ? ctx.lineTo(u * w, v * h) : ctx.moveTo(u * w, v * h)));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

const paperSea = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
  ctx.fillStyle = '#7cc0e6';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 3;
  for (let y = 30; y < h; y += 46) {
    ctx.beginPath();
    for (let x = 0; x <= w; x += 20) ctx.lineTo(x, y + Math.sin(x / 40) * 4);
    ctx.stroke();
  }
};

/* ------------------------------------------------------------------ */
/* JAVA MAP — red arrows sweep from three landings to Bandung           */
/* ------------------------------------------------------------------ */
const JAVA: Pt[] = [
  [0.03, 0.5], [0.1, 0.46], [0.2, 0.48], [0.3, 0.5], [0.4, 0.52], [0.5, 0.52], [0.6, 0.54], [0.7, 0.56], [0.8, 0.58],
  [0.9, 0.6], [0.97, 0.63], [0.95, 0.7], [0.85, 0.7], [0.75, 0.69], [0.6, 0.68], [0.5, 0.66], [0.4, 0.66], [0.3, 0.66],
  [0.2, 0.64], [0.1, 0.62], [0.04, 0.58],
];
const BANDUNG: Pt = [0.22, 0.6];
const LANDINGS: Pt[] = [
  [0.04, 0.5],
  [0.3, 0.5],
  [0.62, 0.55],
];

const javaTexture = (q: number) =>
  canvasTexture(`java-${q}`, 1024, 512, (ctx, w, h) => {
    paperSea(ctx, w, h);
    poly(ctx, w, h, [[0, 0], [0.08, 0], [0.04, 0.3], [0, 0.36]], '#9bd07a'); // south Sumatra tip
    poly(ctx, w, h, JAVA, '#9bd07a', 7);
    ctx.fillStyle = INK;
    ctx.font = `900 34px ${FONT_BLACK}`;
    ctx.textAlign = 'center';
    ctx.fillText('JAVA', 0.55 * w, 0.62 * h);
    ctx.font = `bold 24px ${FONT_TYPE}`;
    ctx.fillText('BATAVIA', 0.14 * w, 0.43 * h);
    // Bandung star
    ctx.fillStyle = '#ffd400';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 9 : 22;
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      ctx.lineTo(BANDUNG[0] * w + Math.cos(a) * r, BANDUNG[1] * h + Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = `900 26px ${FONT_BLACK}`;
    ctx.fillText('BANDUNG', BANDUNG[0] * w, BANDUNG[1] * h + 46);
    // arrows
    const k = q / 15;
    LANDINGS.forEach(([u, v], i) => {
      const kk = Math.min(1, Math.max(0, k * 1.25 - i * 0.12));
      if (kk <= 0) return;
      const x0 = u * w;
      const y0 = v * h - 40;
      const x1 = BANDUNG[0] * w + (i - 1) * 14;
      const y1 = BANDUNG[1] * h - 12;
      const cx = (x0 + x1) / 2;
      const cy = Math.min(y0, y1) - 60;
      const pt = (t: number): Pt => [
        (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1,
        (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1,
      ];
      ctx.strokeStyle = '#d91e18';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let s = 0; s <= 30; s++) {
        const [x, y] = pt((s / 30) * kk);
        s ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
      const [hx, hy] = pt(kk);
      const [px, py] = pt(Math.max(0, kk - 0.04));
      const ang = Math.atan2(hy - py, hx - px);
      ctx.fillStyle = '#d91e18';
      ctx.beginPath();
      ctx.moveTo(hx + Math.cos(ang) * 26, hy + Math.sin(ang) * 26);
      ctx.lineTo(hx + Math.cos(ang + 2.4) * 22, hy + Math.sin(ang + 2.4) * 22);
      ctx.lineTo(hx + Math.cos(ang - 2.4) * 22, hy + Math.sin(ang - 2.4) * 22);
      ctx.closePath();
      ctx.fill();
      // landing dot
      ctx.fillStyle = '#d91e18';
      ctx.beginPath();
      ctx.arc(x0, y0 + 40, 12, 0, Math.PI * 2);
      ctx.fill();
    });
  });

export const JavaMapSet: React.FC<SetProps> = (p) => {
  const sec = p.frame / p.fps;
  const k = interpolate(sec, [p.beat.startSec, p.beat.endSec - 0.05], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const q = Math.round(k * 15);
  return (
    <group>
      <ToonPart color="#5a3a22" position={[0, -0.06, 0]} outline={false}>
        <boxGeometry args={[12, 0.1, 8]} />
      </ToonPart>
      <FlatPart map={javaTexture(q)} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[4, 2]} />
      </FlatPart>
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* ARCHIPELAGO — Dutch control spreads slowly; Aceh lights up last      */
/* ------------------------------------------------------------------ */
const ISLANDS: {name: string; year: number; pts: Pt[]}[] = [
  {name: 'Maluku', year: 1650, pts: [[0.69, 0.33], [0.72, 0.32], [0.73, 0.38], [0.7, 0.39]]},
  {name: 'Maluku2', year: 1650, pts: [[0.7, 0.48], [0.74, 0.47], [0.74, 0.52], [0.7, 0.53]]},
  {name: 'Java', year: 1830, pts: [[0.21, 0.67], [0.3, 0.68], [0.42, 0.72], [0.42, 0.77], [0.3, 0.75], [0.22, 0.72]]},
  {name: 'Sumatra', year: 1860, pts: [[0.05, 0.2], [0.09, 0.14], [0.12, 0.22], [0.19, 0.42], [0.23, 0.6], [0.2, 0.64], [0.14, 0.5], [0.07, 0.32]]},
  {name: 'Kalimantan', year: 1890, pts: [[0.3, 0.25], [0.4, 0.12], [0.48, 0.15], [0.5, 0.35], [0.45, 0.55], [0.35, 0.55], [0.3, 0.42]]},
  {
    name: 'Sulawesi',
    year: 1905,
    pts: [[0.55, 0.3], [0.6, 0.25], [0.64, 0.27], [0.59, 0.33], [0.58, 0.42], [0.63, 0.45], [0.6, 0.5], [0.56, 0.45], [0.55, 0.58], [0.53, 0.6], [0.53, 0.4]],
  },
  {name: 'Bali', year: 1908, pts: [[0.44, 0.76], [0.6, 0.78], [0.6, 0.81], [0.44, 0.8]]},
  {name: 'Papua', year: 1920, pts: [[0.78, 0.35], [0.86, 0.3], [0.98, 0.4], [0.98, 0.7], [0.9, 0.62], [0.82, 0.5], [0.77, 0.42]]},
];
const ACEH: Pt[] = [[0.02, 0.08], [0.06, 0.06], [0.09, 0.14], [0.05, 0.2], [0.03, 0.18]];

const archTexture = (yearQ: number, pulse: number) =>
  canvasTexture(`arch-${yearQ}-${pulse}`, 2048, 820, (ctx, w, h) => {
    paperSea(ctx, w, h);
    ISLANDS.forEach((isl) => poly(ctx, w, h, isl.pts, yearQ >= isl.year ? '#f28c28' : '#9bd07a', 7));
    const acehDone = yearQ >= 1904;
    poly(ctx, w, h, ACEH, acehDone ? '#d91e18' : '#9bd07a', 7);
    if (acehDone) {
      ctx.strokeStyle = '#d91e18';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(0.055 * w, 0.13 * h, 70 + pulse * 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.font = `900 64px ${FONT_BLACK}`;
      ctx.textAlign = 'left';
      ctx.fillText('ACEH 1904', 0.1 * w, 0.12 * h);
    }
    // year counter, printed in two places so it reads during the whole pan
    ctx.fillStyle = INK;
    ctx.font = `900 120px ${FONT_BLACK}`;
    ctx.textAlign = 'center';
    ctx.fillText(String(yearQ), 0.62 * w, 0.95 * h);
    ctx.fillText(String(yearQ), 0.22 * w, 0.95 * h);
    // legend
    ctx.font = `bold 40px ${FONT_TYPE}`;
    ctx.fillStyle = '#f28c28';
    ctx.fillRect(0.78 * w, 0.08 * h, 50, 40);
    ctx.fillStyle = INK;
    ctx.textAlign = 'left';
    ctx.fillText('= under Dutch control', 0.78 * w + 64, 0.08 * h + 34);
  });

export const ArchipelagoSet: React.FC<SetProps> = (p) => {
  const sec = p.frame / p.fps;
  const year = interpolate(sec, [49.25, 50.6], [1600, 1904], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)});
  const yearQ = Math.round(year / 8) * 8 >= 1904 ? 1904 : Math.round(year / 8) * 8;
  const pulse = yearQ >= 1904 ? Math.floor(p.localFrame / 3) % 3 : 0;
  return (
    <group>
      <ToonPart color="#5a3a22" position={[0, -0.06, 0]} outline={false}>
        <boxGeometry args={[16, 0.1, 9]} />
      </ToonPart>
      <FlatPart map={archTexture(yearQ, pulse)} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[8, 3.2]} />
      </FlatPart>
    </group>
  );
};
