import * as THREE from 'three';
import {canvasTexture, INK} from './toon';

export type Expression = 'neutral' | 'sweat' | 'smug' | 'shock' | 'angry';
export type Mouth = 'closed' | 'open_mid' | 'open_wide';

/**
 * 2D expression sheet painted on a canvas and mapped onto a curved patch on the
 * front of the 3D head. Swapping texture = 0-frame "step" transition.
 */
export const faceTexture = (expression: Expression, mouth: Mouth, mustache: boolean): THREE.CanvasTexture =>
  canvasTexture(`face-${expression}-${mouth}-${mustache ? 1 : 0}`, 512, 512, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
    const cx = w / 2;
    const eyeY = 210;
    const eyeDX = 78;

    const brow = (x: number, y: number, ang: number, len = 70) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang);
      ctx.lineWidth = 20;
      ctx.beginPath();
      ctx.moveTo(-len / 2, 0);
      ctx.lineTo(len / 2, 0);
      ctx.stroke();
      ctx.restore();
    };
    const dotEye = (x: number, ry = 34, rx = 22) => {
      ctx.beginPath();
      ctx.ellipse(x, eyeY, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x + 7, eyeY - 12, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = INK;
    };

    // ---------- eyes + brows ----------
    if (expression === 'neutral') {
      dotEye(cx - eyeDX);
      dotEye(cx + eyeDX);
      brow(cx - eyeDX, eyeY - 70, -0.05);
      brow(cx + eyeDX, eyeY - 70, 0.05);
    } else if (expression === 'smug') {
      // half-lidded: lid line over a cut eye
      for (const s of [-1, 1]) {
        const x = cx + s * eyeDX;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x - 40, eyeY - 4, 80, 60);
        ctx.clip();
        ctx.beginPath();
        ctx.ellipse(x, eyeY, 24, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(x - 34, eyeY - 2);
        ctx.lineTo(x + 34, eyeY - 6);
        ctx.stroke();
      }
      brow(cx - eyeDX, eyeY - 62, 0.12);
      brow(cx + eyeDX, eyeY - 82, -0.28);
    } else if (expression === 'shock') {
      for (const s of [-1, 1]) {
        const x = cx + s * eyeDX;
        ctx.fillStyle = '#ffffff';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.ellipse(x, eyeY, 48, 56, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.arc(x, eyeY + 4, 12, 0, Math.PI * 2);
        ctx.fill();
      }
      brow(cx - eyeDX, eyeY - 100, -0.15);
      brow(cx + eyeDX, eyeY - 100, 0.15);
    } else if (expression === 'sweat') {
      dotEye(cx - eyeDX, 26, 18);
      dotEye(cx + eyeDX, 26, 18);
      brow(cx - eyeDX, eyeY - 66, 0.38);
      brow(cx + eyeDX, eyeY - 66, -0.38);
      // drop on the cheek
      ctx.fillStyle = '#6ec6ff';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(cx + 190, eyeY - 40);
      ctx.quadraticCurveTo(cx + 222, eyeY + 20, cx + 190, eyeY + 32);
      ctx.quadraticCurveTo(cx + 158, eyeY + 20, cx + 190, eyeY - 40);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = INK;
    } else if (expression === 'angry') {
      for (const s of [-1, 1]) {
        const x = cx + s * eyeDX;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x - 40, eyeY - 10 + (s < 0 ? -10 : 14));
        ctx.lineTo(x + 40, eyeY - 10 + (s < 0 ? 14 : -10));
        ctx.lineTo(x + 40, eyeY + 60);
        ctx.lineTo(x - 40, eyeY + 60);
        ctx.closePath();
        ctx.clip();
        ctx.beginPath();
        ctx.ellipse(x, eyeY + 6, 26, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      brow(cx - eyeDX + 6, eyeY - 44, 0.5, 84);
      brow(cx + eyeDX - 6, eyeY - 44, -0.5, 84);
    }

    // ---------- mustache (drawn under the mouth line) ----------
    const mouthY = 350;
    if (mustache) {
      ctx.fillStyle = '#5a3a22';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 8;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(cx, mouthY - 40);
        ctx.bezierCurveTo(cx + s * 50, mouthY - 70, cx + s * 120, mouthY - 50, cx + s * 150, mouthY - 80);
        ctx.bezierCurveTo(cx + s * 130, mouthY - 20, cx + s * 60, mouthY - 10, cx, mouthY - 24);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = INK;
    }

    // ---------- mouth ----------
    ctx.lineWidth = 14;
    if (mouth === 'open_wide' || (mouth === 'closed' && expression === 'shock')) {
      ctx.fillStyle = '#3a0d0d';
      ctx.beginPath();
      ctx.ellipse(cx, mouthY + 16, mouth === 'open_wide' ? 46 : 30, mouth === 'open_wide' ? 52 : 38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e8616b';
      ctx.beginPath();
      ctx.ellipse(cx, mouthY + 44, 26, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (mouth === 'open_mid') {
      ctx.fillStyle = '#3a0d0d';
      ctx.beginPath();
      ctx.ellipse(cx, mouthY + 8, 40, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      if (expression === 'smug') {
        ctx.moveTo(cx - 50, mouthY + 6);
        ctx.quadraticCurveTo(cx + 10, mouthY + 26, cx + 64, mouthY - 16);
      } else if (expression === 'sweat') {
        ctx.moveTo(cx - 50, mouthY + 10);
        ctx.bezierCurveTo(cx - 25, mouthY - 10, cx + 0, mouthY + 30, cx + 25, mouthY + 4);
        ctx.quadraticCurveTo(cx + 40, mouthY - 6, cx + 52, mouthY + 10);
      } else if (expression === 'angry') {
        ctx.moveTo(cx - 46, mouthY + 22);
        ctx.quadraticCurveTo(cx, mouthY - 6, cx + 46, mouthY + 22);
      } else {
        ctx.moveTo(cx - 40, mouthY + 6);
        ctx.quadraticCurveTo(cx, mouthY + 22, cx + 40, mouthY + 6);
      }
      ctx.stroke();
    }
  });

export type EmoteType = 'sweat' | 'anger' | 'exclaim';

/** Billboard emote sprites (sweat drop, anger vein, exclamation). */
export const emoteTexture = (type: EmoteType) =>
  canvasTexture(`emote-${type}`, 256, 256, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 14;
    if (type === 'sweat') {
      ctx.fillStyle = '#7fd3ff';
      ctx.beginPath();
      ctx.moveTo(128, 24);
      ctx.bezierCurveTo(200, 120, 210, 220, 128, 228);
      ctx.bezierCurveTo(46, 220, 56, 120, 128, 24);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(104, 160, 14, 26, 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'anger') {
      ctx.strokeStyle = '#e0262b';
      ctx.lineWidth = 30;
      const arc = (x: number, y: number, r: number) => {
        ctx.beginPath();
        ctx.arc(x, y, r, Math.PI * 0.05, Math.PI * 0.95, true);
        ctx.stroke();
      };
      ctx.save();
      ctx.translate(128, 128);
      for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI) / 2);
        arc(58, 58, 40);
        ctx.restore();
      }
      ctx.restore();
    } else {
      ctx.fillStyle = '#ffd400';
      ctx.beginPath();
      ctx.moveTo(98, 18);
      ctx.lineTo(160, 18);
      ctx.lineTo(146, 160);
      ctx.lineTo(112, 160);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(129, 206, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  });
