import React, {useMemo} from 'react';
import * as THREE from 'three';
import {ToonPart, FlatPart, canvasTexture, FONT_BLACK, FONT_TYPE, INK, getToonGradient, Ink} from './lib/toon';
import type {PropId} from './types';

/* ------------------------------------------------------------------ */
/* Waving cloth flag (vertex-displaced plane, pure function of time).   */
/* ------------------------------------------------------------------ */
export const flagTexture = (kind: 'dutch' | 'japan' | 'merah_putih' | 'white' | 'marker350') =>
  canvasTexture(`flag-${kind}`, 512, 340, (ctx, w, h) => {
    if (kind === 'dutch') {
      ['#ae1c28', '#ffffff', '#21468b'].forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.fillRect(0, (i * h) / 3, w, h / 3 + 1);
      });
    } else if (kind === 'japan') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#bc002d';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, h * 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === 'merah_putih') {
      ctx.fillStyle = '#e70011';
      ctx.fillRect(0, 0, w, h / 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, h / 2, w, h / 2);
    } else if (kind === 'white') {
      ctx.fillStyle = '#fbfbf6';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#d9d9cf';
      ctx.lineWidth = 10;
      ctx.strokeRect(14, 14, w - 28, h - 28);
    } else {
      // "350" painted over crossed-out smaller numbers (easter egg #2)
      ctx.fillStyle = '#f6efe0';
      ctx.fillRect(0, 0, w, h);
      ctx.font = `bold 64px ${FONT_TYPE}`;
      ctx.fillStyle = '#6b6b6b';
      ctx.textAlign = 'left';
      const olds = ['300', '200', '40?'];
      olds.forEach((t, i) => {
        const x = 30 + i * 160;
        const y = 70 + (i % 2) * 230;
        ctx.fillText(t, x, y);
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(x - 6, y - 22);
        ctx.lineTo(x + 120, y - 18);
        ctx.stroke();
      });
      ctx.fillStyle = '#c0392b';
      ctx.font = `900 200px ${FONT_BLACK}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('350', w / 2, h / 2 + 10);
    }
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, w - 6, h - 6);
  });

export const WavingFlag: React.FC<{
  kind: 'dutch' | 'japan' | 'merah_putih' | 'white' | 'marker350';
  width: number;
  height: number;
  t: number;
  amp?: number;
  speed?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}> = ({kind, width, height, t, amp = 0.08, speed = 7, position, rotation}) => {
  const geo = useMemo(() => new THREE.PlaneGeometry(width, height, 24, 8), [width, height]);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  // deterministic wave: displacement grows away from the pole (x = -width/2).
  for (let i = 0; i < pos.count; i++) {
    const x = (i % 25) / 24; // 0..1 along width
    const yy = Math.floor(i / 25) / 8;
    const px = -width / 2 + x * width;
    const py = height / 2 - yy * height;
    const z = Math.sin(x * 7 - t * speed) * amp * x + Math.sin(yy * 3 + t * speed * 0.6) * amp * 0.25 * x;
    pos.setXYZ(i, px, py - x * x * amp * 0.4, z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geo} position={[width / 2, 0, 0]}>
        <meshToonMaterial map={flagTexture(kind)} gradientMap={getToonGradient()} side={THREE.DoubleSide} />
        <Ink thickness={0.02} />
      </mesh>
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Paper with text (telegram, newspaper, documents)                     */
/* ------------------------------------------------------------------ */
export const paperTexture = (kind: 'telegram' | 'newspaper' | 'document' | 'document_signed') =>
  canvasTexture(`paper-${kind}`, 512, kind === 'newspaper' ? 360 : 640, (ctx, w, h) => {
    ctx.fillStyle = kind === 'telegram' ? '#f3e7c4' : '#f4f1e8';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    if (kind === 'telegram') {
      ctx.font = `bold 40px ${FONT_TYPE}`;
      ctx.fillText('TELEGRAM', w / 2, 70);
      ctx.fillRect(40, 92, w - 80, 4);
      ctx.font = `900 64px ${FONT_BLACK}`;
      ctx.fillStyle = '#b3261e';
      ctx.fillText('NO', w / 2, 230);
      ctx.fillText('REINFORCE-', w / 2, 310);
      ctx.fillText('MENTS', w / 2, 390);
      ctx.fillStyle = INK;
      ctx.font = `bold 30px ${FONT_TYPE}`;
      ctx.fillText('— THE HAGUE (OCCUPIED)', w / 2, 500);
      ctx.fillText('STOP', w / 2, 560);
    } else if (kind === 'newspaper') {
      ctx.font = `bold 30px ${FONT_TYPE}`;
      ctx.fillText('BATAVIA DAILY · 1941', w / 2, 40);
      ctx.fillRect(20, 52, w - 40, 4);
      ctx.font = `900 58px ${FONT_BLACK}`;
      ctx.fillText('JAPANESE PILOTS', w / 2, 125);
      ctx.fillText("CAN'T SEE!", w / 2, 190);
      ctx.fillStyle = '#999';
      for (let i = 0; i < 5; i++) ctx.fillRect(30, 220 + i * 22, w / 2 - 50, 10);
      ctx.fillStyle = INK;
      ctx.font = `bold 24px ${FONT_TYPE}`;
      ctx.textAlign = 'left';
      ctx.fillText('TULIP PRICES', w / 2 + 20, 240);
      ctx.fillText('STABLE', w / 2 + 20, 268);
      ctx.fillStyle = '#999';
      for (let i = 0; i < 3; i++) ctx.fillRect(w / 2 + 20, 290 + i * 20, w / 2 - 50, 9);
    } else {
      ctx.font = `bold 34px ${FONT_TYPE}`;
      ctx.fillText('CAPITULATION', w / 2, 80);
      ctx.fillText('KALIJATI · 8-III-1942', w / 2, 128);
      ctx.fillStyle = '#9a9a9a';
      for (let i = 0; i < 10; i++) ctx.fillRect(50, 180 + i * 30, w - 100 - (i % 3) * 40, 10);
      ctx.fillStyle = INK;
      ctx.fillRect(60, 540, 180, 3);
      ctx.fillRect(w - 240, 540, 180, 3);
      if (kind === 'document_signed') {
        ctx.strokeStyle = '#1a2a7a';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(70, 530);
        ctx.bezierCurveTo(110, 470, 140, 560, 170, 505);
        ctx.bezierCurveTo(190, 470, 210, 545, 235, 515);
        ctx.stroke();
        ctx.strokeStyle = '#c0182a';
        ctx.lineWidth = 9;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(w - 150, 470, 70, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#c0182a';
        ctx.font = `900 30px ${FONT_BLACK}`;
        ctx.fillText('SIGNED', w - 150, 480);
        ctx.globalAlpha = 1;
      }
    }
  });

/* ------------------------------------------------------------------ */
/* Bicycle                                                               */
/* ------------------------------------------------------------------ */
export const Bicycle: React.FC<{wheelSpin?: number; color?: string; position?: [number, number, number]; rotation?: [number, number, number]; scale?: number}> = ({
  wheelSpin = 0,
  color = '#2f3b2a',
  position,
  rotation,
  scale = 1,
}) => {
  const tube = (from: [number, number, number], to: [number, number, number], r = 0.025, c = color, k = 0) => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const mid = a.clone().lerp(b, 0.5);
    const len = a.distanceTo(b);
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    return (
      <ToonPart key={`t${k}`} color={c} position={mid.toArray() as [number, number, number]} quaternion={quat} outline={0.012}>
        <cylinderGeometry args={[r, r, len, 8]} />
      </ToonPart>
    );
  };
  // frame in the X (forward) / Y plane, z = 0
  const W = 0.34; // wheel radius
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {[-0.52, 0.52].map((x, i) => (
        <group key={i} position={[x, W, 0]} rotation={[0, 0, -wheelSpin]}>
          <ToonPart color="#1b1b1b" outline={0.012}>
            <torusGeometry args={[W, 0.035, 8, 28]} />
          </ToonPart>
          {[0, 1, 2].map((k) => (
            <ToonPart key={k} color="#bdbdbd" rotation={[0, 0, (k * Math.PI) / 3]} outline={false}>
              <boxGeometry args={[W * 2, 0.012, 0.012]} />
            </ToonPart>
          ))}
        </group>
      ))}
      {tube([-0.52, W, 0], [-0.05, W + 0.05, 0], 0.025, color, 1)}
      {tube([-0.05, W + 0.05, 0], [-0.15, 0.82, 0], 0.025, color, 2)}
      {tube([-0.15, 0.82, 0], [0.4, 0.82, 0], 0.025, color, 3)}
      {tube([0.4, 0.82, 0], [-0.05, W + 0.05, 0], 0.025, color, 4)}
      {tube([0.52, W, 0], [0.42, 0.95, 0], 0.025, color, 5)}
      {tube([-0.52, W, 0], [-0.15, 0.82, 0], 0.02, color, 6)}
      {/* handlebar */}
      {tube([0.42, 0.98, -0.25], [0.42, 0.98, 0.25], 0.022, '#222', 7)}
      {/* saddle */}
      <ToonPart color="#3a2416" position={[-0.17, 0.88, 0]} outline={0.015}>
        <boxGeometry args={[0.22, 0.05, 0.12]} />
      </ToonPart>
      {/* bell */}
      <ToonPart color="#d8d8d8" position={[0.42, 1.02, 0.15]} outline={0.012}>
        <sphereGeometry args={[0.045, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </ToonPart>
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* Hand-held props. Local origin = grip point (hand socket).            */
/* ------------------------------------------------------------------ */
export const HandProp: React.FC<{item: PropId; t: number}> = ({item, t}) => {
  switch (item) {
    case 'handkerchief':
      return <WavingFlag kind="white" width={0.42} height={0.32} t={t} amp={0.06} speed={10} position={[0.02, 0.05, 0.02]} />;
    case 'marker_350':
      return (
        <group position={[0, -0.08, 0]}>
          <ToonPart color="#6b4a2a" position={[0, 0.3, 0]} outline={0.012}>
            <cylinderGeometry args={[0.018, 0.018, 0.6, 8]} />
          </ToonPart>
          <WavingFlag kind="marker350" width={0.34} height={0.22} t={t} amp={0.02} speed={4} position={[0.015, 0.48, 0]} />
        </group>
      );
    case 'telegram':
      return (
        <FlatPart position={[0.12, 0.05, 0.04]} rotation={[-0.15, 0, 0.05]} map={paperTexture('telegram')}>
          <planeGeometry args={[0.36, 0.45]} />
        </FlatPart>
      );
    case 'gin_glass':
      return (
        <group position={[0, 0.06, 0.04]}>
          <ToonPart color="#cfefff" transparent opacity={0.75} outline={0.012}>
            <cylinderGeometry args={[0.06, 0.045, 0.16, 14]} />
          </ToonPart>
          <ToonPart color="#fff6c8" position={[0, -0.02, 0]} outline={false}>
            <cylinderGeometry args={[0.052, 0.045, 0.09, 14]} />
          </ToonPart>
        </group>
      );
    case 'newspaper':
      return (
        <FlatPart position={[0.3, 0.1, 0.04]} rotation={[-0.1, 0, 0]} map={paperTexture('newspaper')} side={THREE.DoubleSide}>
          <planeGeometry args={[0.8, 0.56]} />
        </FlatPart>
      );
    case 'broom':
      return (
        <group rotation={[0.35, 0, 0.25]}>
          <ToonPart color="#a77c4a" position={[0, -0.3, 0]} outline={0.012}>
            <cylinderGeometry args={[0.02, 0.02, 1.3, 8]} />
          </ToonPart>
          <ToonPart color="#d8b46a" position={[0, -0.98, 0]} outline={0.015}>
            <coneGeometry args={[0.16, 0.3, 10]} />
          </ToonPart>
        </group>
      );
    case 'bicycle':
      // carried overhead: grip at the top tube, wheels upward-ish
      return <Bicycle position={[0.32, -0.75, 0]} rotation={[0, Math.PI / 2, 0]} scale={0.9} />;
    case 'pen':
      return (
        <group rotation={[0.6, 0, 0.2]}>
          <ToonPart color="#1d1d1d" outline={0.01}>
            <cylinderGeometry args={[0.018, 0.018, 0.22, 8]} />
          </ToonPart>
          <ToonPart color="#d4af37" position={[0, -0.13, 0]} rotation={[Math.PI, 0, 0]} outline={0.008}>
            <coneGeometry args={[0.018, 0.05, 8]} />
          </ToonPart>
        </group>
      );
    case 'merah_putih':
      return (
        <group position={[0, -0.6, 0]}>
          <ToonPart color="#8b5a2b" position={[0, 0.95, 0]} outline={0.015}>
            <cylinderGeometry args={[0.025, 0.025, 1.9, 8]} />
          </ToonPart>
          <WavingFlag kind="merah_putih" width={0.95} height={0.63} t={t} amp={0.12} speed={8} position={[0.02, 1.55, 0]} />
        </group>
      );
    case 'medal':
      return (
        <ToonPart color="#ffcc33" rotation={[Math.PI / 2, 0, 0]} outline={0.012}>
          <cylinderGeometry args={[0.035, 0.035, 0.015, 14]} />
        </ToonPart>
      );
    case 'document':
      return (
        <FlatPart rotation={[-Math.PI / 2, 0, 0]} map={paperTexture('document')}>
          <planeGeometry args={[0.32, 0.4]} />
        </FlatPart>
      );
    default:
      return null;
  }
};
