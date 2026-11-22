import type * as THREE from 'three';
import {canvasTexture, INK} from '../lib/toon';

/**
 * The T3 expression atlas.
 *
 * Only tier-3 figures use this file: anonymous townspeople, the historical
 * opponents of the message, and the Observer. A T2 figure never reaches this
 * code — its face is a NurFace disc, which has no expression channel at all.
 *
 * Each expression is painted once onto a canvas and cached, so switching
 * expression is a texture swap: a 0-frame step change, never a tween.
 *
 * The opponents (the magistrate, the guard captain) get `smug` and `angry`,
 * but the drawing deliberately avoids caricature: no exaggerated noses, no
 * monstrous features, no ethnic markers. Their arrogance is carried by pose,
 * costume and lighting in the set, not by an ugly face.
 */
export type KahfiExpression =
  | 'neutral'
  | 'smug'
  | 'sweat'
  | 'shock'
  | 'angry'
  | 'awe' /* wonder: brows up, wide soft eyes, mouth slightly open */
  | 'teary' /* moved: glistening lower lids, mouth pressed */
  | 'smile'
  | 'focused'; /* attentive: level brows, narrowed steady eyes */

export type KahfiMouth = 'closed' | 'open_mid' | 'open_wide';

const CX = 256;
const EYE_Y = 212;
const EYE_DX = 76;
const MOUTH_Y = 352;

export const kahfiFaceTexture = (expression: KahfiExpression, mouth: KahfiMouth, beard: boolean): THREE.CanvasTexture =>
  canvasTexture(`kahfi-face-${expression}-${mouth}-${beard ? 1 : 0}`, 512, 512, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;

    const brow = (x: number, y: number, ang: number, len = 68, lw = 19) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang);
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(-len / 2, 0);
      ctx.lineTo(len / 2, 0);
      ctx.stroke();
      ctx.restore();
    };

    const dotEye = (x: number, rx = 21, ry = 33, shine = true) => {
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.ellipse(x, EYE_Y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      if (shine) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x + 7, EYE_Y - 12, 6.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = INK;
    };

    /** An eye cut off by a lid line, used for smug / focused. */
    const lidEye = (x: number, lidY: number, ry = 28) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x - 42, lidY, 84, 70);
      ctx.clip();
      ctx.beginPath();
      ctx.ellipse(x, EYE_Y, 23, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.lineWidth = 13;
      ctx.beginPath();
      ctx.moveTo(x - 34, lidY + 1);
      ctx.lineTo(x + 34, lidY - 3);
      ctx.stroke();
    };

    /* ---------------- eyes and brows ---------------- */
    if (expression === 'neutral') {
      dotEye(CX - EYE_DX);
      dotEye(CX + EYE_DX);
      brow(CX - EYE_DX, EYE_Y - 70, -0.05);
      brow(CX + EYE_DX, EYE_Y - 70, 0.05);
    } else if (expression === 'smile') {
      /* happy arcs rather than dots */
      ctx.lineWidth = 18;
      for (const s of [-1, 1]) {
        const x = CX + s * EYE_DX;
        ctx.beginPath();
        ctx.arc(x, EYE_Y + 14, 28, Math.PI * 1.12, Math.PI * 1.88);
        ctx.stroke();
      }
      brow(CX - EYE_DX, EYE_Y - 72, -0.1);
      brow(CX + EYE_DX, EYE_Y - 72, 0.1);
    } else if (expression === 'smug') {
      lidEye(CX - EYE_DX, EYE_Y - 4);
      lidEye(CX + EYE_DX, EYE_Y - 4);
      brow(CX - EYE_DX, EYE_Y - 62, 0.12);
      brow(CX + EYE_DX, EYE_Y - 82, -0.26);
    } else if (expression === 'focused') {
      lidEye(CX - EYE_DX, EYE_Y - 12, 30);
      lidEye(CX + EYE_DX, EYE_Y - 12, 30);
      brow(CX - EYE_DX, EYE_Y - 66, 0.04, 72, 20);
      brow(CX + EYE_DX, EYE_Y - 66, -0.04, 72, 20);
    } else if (expression === 'shock') {
      for (const s of [-1, 1]) {
        const x = CX + s * EYE_DX;
        ctx.fillStyle = '#ffffff';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.ellipse(x, EYE_Y, 46, 54, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.arc(x, EYE_Y + 4, 11, 0, Math.PI * 2);
        ctx.fill();
      }
      brow(CX - EYE_DX, EYE_Y - 98, -0.14);
      brow(CX + EYE_DX, EYE_Y - 98, 0.14);
    } else if (expression === 'awe') {
      /* wonder: large soft eyes, brows lifted high and level */
      for (const s of [-1, 1]) {
        const x = CX + s * EYE_DX;
        ctx.fillStyle = '#ffffff';
        ctx.lineWidth = 11;
        ctx.beginPath();
        ctx.ellipse(x, EYE_Y, 38, 44, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.ellipse(x, EYE_Y + 2, 19, 24, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x + 8, EYE_Y - 10, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = INK;
      }
      brow(CX - EYE_DX, EYE_Y - 92, -0.22, 66);
      brow(CX + EYE_DX, EYE_Y - 92, 0.22, 66);
    } else if (expression === 'sweat') {
      dotEye(CX - EYE_DX, 18, 26, false);
      dotEye(CX + EYE_DX, 18, 26, false);
      brow(CX - EYE_DX, EYE_Y - 64, 0.36);
      brow(CX + EYE_DX, EYE_Y - 64, -0.36);
      /* a drop on the cheek */
      ctx.fillStyle = '#6ec6ff';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(CX + 182, EYE_Y - 42);
      ctx.quadraticCurveTo(CX + 214, EYE_Y + 18, CX + 182, EYE_Y + 30);
      ctx.quadraticCurveTo(CX + 150, EYE_Y + 18, CX + 182, EYE_Y - 42);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = INK;
    } else if (expression === 'teary') {
      /* moved, not crying out: lower lids hold a glint */
      for (const s of [-1, 1]) {
        const x = CX + s * EYE_DX;
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.ellipse(x, EYE_Y - 2, 21, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#bfe8ff';
        ctx.beginPath();
        ctx.ellipse(x, EYE_Y + 22, 24, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x + 7, EYE_Y - 12, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = INK;
      }
      brow(CX - EYE_DX, EYE_Y - 78, -0.3, 64);
      brow(CX + EYE_DX, EYE_Y - 78, 0.3, 64);
    } else if (expression === 'angry') {
      for (const s of [-1, 1]) {
        const x = CX + s * EYE_DX;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x - 40, EYE_Y - 10 + (s < 0 ? -10 : 14));
        ctx.lineTo(x + 40, EYE_Y - 10 + (s < 0 ? 14 : -10));
        ctx.lineTo(x + 40, EYE_Y + 58);
        ctx.lineTo(x - 40, EYE_Y + 58);
        ctx.closePath();
        ctx.clip();
        ctx.beginPath();
        ctx.ellipse(x, EYE_Y + 6, 25, 29, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      brow(CX - EYE_DX + 6, EYE_Y - 44, 0.48, 82);
      brow(CX + EYE_DX - 6, EYE_Y - 44, -0.48, 82);
    }

    /* ---------------- beard (drawn under the mouth) ---------------- */
    if (beard) {
      ctx.fillStyle = '#4a3425';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(CX - 118, MOUTH_Y - 46);
      ctx.bezierCurveTo(CX - 128, MOUTH_Y + 96, CX, MOUTH_Y + 150, CX, MOUTH_Y + 150);
      ctx.bezierCurveTo(CX, MOUTH_Y + 150, CX + 128, MOUTH_Y + 96, CX + 118, MOUTH_Y - 46);
      ctx.bezierCurveTo(CX + 60, MOUTH_Y + 6, CX - 60, MOUTH_Y + 6, CX - 118, MOUTH_Y - 46);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.strokeStyle = INK;
    }

    /* ---------------- mouth ---------------- */
    ctx.lineWidth = 13;
    if (mouth === 'open_wide' || (mouth === 'closed' && expression === 'shock')) {
      ctx.fillStyle = '#3a0d0d';
      ctx.beginPath();
      ctx.ellipse(CX, MOUTH_Y + 14, mouth === 'open_wide' ? 42 : 27, mouth === 'open_wide' ? 48 : 34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#d4606a';
      ctx.beginPath();
      ctx.ellipse(CX, MOUTH_Y + 40, 23, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = INK;
    } else if (mouth === 'open_mid') {
      ctx.fillStyle = '#3a0d0d';
      ctx.beginPath();
      ctx.ellipse(CX, MOUTH_Y + 8, 36, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = INK;
    } else if (expression === 'awe') {
      /* small open "oh" even when the mouth channel says closed */
      ctx.fillStyle = '#3a0d0d';
      ctx.beginPath();
      ctx.ellipse(CX, MOUTH_Y + 10, 20, 24, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = INK;
    } else {
      ctx.beginPath();
      if (expression === 'smug') {
        ctx.moveTo(CX - 48, MOUTH_Y + 6);
        ctx.quadraticCurveTo(CX + 10, MOUTH_Y + 24, CX + 62, MOUTH_Y - 16);
      } else if (expression === 'smile') {
        ctx.moveTo(CX - 54, MOUTH_Y - 6);
        ctx.quadraticCurveTo(CX, MOUTH_Y + 40, CX + 54, MOUTH_Y - 6);
      } else if (expression === 'sweat') {
        ctx.moveTo(CX - 48, MOUTH_Y + 10);
        ctx.bezierCurveTo(CX - 24, MOUTH_Y - 10, CX, MOUTH_Y + 28, CX + 24, MOUTH_Y + 4);
        ctx.quadraticCurveTo(CX + 38, MOUTH_Y - 6, CX + 50, MOUTH_Y + 10);
      } else if (expression === 'angry') {
        ctx.moveTo(CX - 44, MOUTH_Y + 20);
        ctx.quadraticCurveTo(CX, MOUTH_Y - 6, CX + 44, MOUTH_Y + 20);
      } else if (expression === 'teary') {
        /* pressed flat: holding it in */
        ctx.moveTo(CX - 42, MOUTH_Y + 8);
        ctx.lineTo(CX + 42, MOUTH_Y + 8);
      } else if (expression === 'focused') {
        ctx.moveTo(CX - 38, MOUTH_Y + 8);
        ctx.quadraticCurveTo(CX, MOUTH_Y + 14, CX + 38, MOUTH_Y + 8);
      } else {
        ctx.moveTo(CX - 38, MOUTH_Y + 6);
        ctx.quadraticCurveTo(CX, MOUTH_Y + 20, CX + 38, MOUTH_Y + 6);
      }
      ctx.stroke();
    }
  });
