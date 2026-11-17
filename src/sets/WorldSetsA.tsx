import React, {useMemo} from 'react';
import * as THREE from 'three';
import {interpolate, Easing} from 'remotion';
import {ToonPart, FlatPart, canvasTexture, FONT_BLACK, FONT_TYPE, INK, rand, getToonGradient, Ink} from '../lib/toon';
import {WavingFlag, Bicycle, HandProp} from '../props';
import {ToonCharacter} from '../ToonCharacter';
import {Hero, Ground, Palm, Tree, Fireball, secToLocal, heroProps, type SetProps} from './common';
import type {Vec3} from '../types';

/* ------------------------------------------------------------------ */
/* TREASURE — spice, oil and rubber pour into a chest                   */
/* ------------------------------------------------------------------ */
export const TreasureSet: React.FC<SetProps> = (p) => {
  const sec = p.frame / p.fps;
  const groups: {t0: number; kind: 'spice' | 'oil' | 'rubber'}[] = [
    {t0: 9.0, kind: 'spice'},
    {t0: 9.65, kind: 'oil'},
    {t0: 10.1, kind: 'rubber'},
  ];
  return (
    <group>
      <FlatPart color="#f3d9a0" position={[0, 2, -3]}>
        <planeGeometry args={[14, 10]} />
      </FlatPart>
      <Ground color="#c9a46a" />
      {/* chest */}
      <ToonPart color="#7a4a22" position={[0, 0.3, 0]}>
        <boxGeometry args={[1.3, 0.6, 0.8]} />
      </ToonPart>
      <ToonPart color="#d4a73a" position={[0, 0.3, 0.41]} outline={0.015}>
        <boxGeometry args={[1.32, 0.08, 0.02]} />
      </ToonPart>
      <ToonPart color="#d4a73a" position={[0, 0.45, 0.42]} outline={0.015}>
        <boxGeometry args={[0.16, 0.18, 0.03]} />
      </ToonPart>
      <group position={[0, 0.6, -0.4]} rotation={[-1.9, 0, 0]}>
        <ToonPart color="#8a5428" position={[0, 0.4, 0]}>
          <boxGeometry args={[1.3, 0.8, 0.1]} />
        </ToonPart>
      </group>
      {/* gold glow inside */}
      <ToonPart color="#ffd34d" emissive="#c98a00" emissiveIntensity={0.4} position={[0, 0.58, 0]} outline={false}>
        <boxGeometry args={[1.2, 0.04, 0.7]} />
      </ToonPart>
      {groups.map((g, gi) =>
        Array.from({length: 6}).map((_, i) => {
          const t0 = g.t0 + i * 0.07;
          const dt = sec - t0;
          if (dt < 0) return null;
          const y = 3.4 - 9 * dt * dt;
          if (y < 0.55) return null;
          const x = (rand(gi * 10 + i) - 0.5) * 0.9;
          const z = (rand(gi * 10 + i + 5) - 0.5) * 0.4;
          const rot = dt * 8 + i;
          if (g.kind === 'spice')
            return (
              <ToonPart key={`${gi}-${i}`} color="#8b5a2b" position={[x, y, z]} rotation={[rot, rot * 0.7, 0]} scale={[1, 0.8, 1]} outline={0.015}>
                <sphereGeometry args={[0.09, 12, 10]} />
              </ToonPart>
            );
          if (g.kind === 'oil')
            return (
              <group key={`${gi}-${i}`} position={[x, y, z]}>
                <ToonPart color="#1a1a1a" outline={0.015}>
                  <sphereGeometry args={[0.08, 12, 10]} />
                </ToonPart>
                <ToonPart color="#1a1a1a" position={[0, 0.1, 0]} outline={0.015}>
                  <coneGeometry args={[0.07, 0.14, 12]} />
                </ToonPart>
              </group>
            );
          return (
            <ToonPart key={`${gi}-${i}`} color="#efe3c2" position={[x, y, z]} rotation={[rot, 0, rot]} outline={0.015}>
              <torusGeometry args={[0.07, 0.035, 8, 16]} />
            </ToonPart>
          );
        }),
      )}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* CROWD — seventy million under one tiny flag                          */
/* ------------------------------------------------------------------ */
const CROWD_N = 900;
const Crowd: React.FC = () => {
  const {bodies, heads} = useMemo(() => {
    const gradient = getToonGradient();
    const bodyGeo = new THREE.CapsuleGeometry(0.3, 0.45, 4, 10);
    const headGeo = new THREE.SphereGeometry(0.33, 12, 10);
    const bm = new THREE.MeshToonMaterial({gradientMap: gradient});
    const hm = new THREE.MeshToonMaterial({gradientMap: gradient, color: '#ffffff'});
    const b = new THREE.InstancedMesh(bodyGeo, bm, CROWD_N);
    const h = new THREE.InstancedMesh(headGeo, hm, CROWD_N);
    const palette = ['#b5452f', '#2f6f8f', '#d9a62b', '#4f8a3a', '#8a3a6f', '#e2763a', '#3a4f8a', '#c9b27c'];
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    for (let i = 0; i < CROWD_N; i++) {
      // fan out from the camera toward the hill
      const z = 2.2 - Math.pow(rand(i * 3.1), 0.8) * 14;
      const halfW = 2 + (2.2 - z) * 0.75;
      const x = (rand(i * 7.7) - 0.5) * 2 * halfW;
      const s = 0.6 + rand(i * 1.3) * 0.2;
      m.makeScale(s, s, s).setPosition(x, 0.55 * s, z);
      b.setMatrixAt(i, m);
      c.set(palette[i % palette.length]);
      b.setColorAt(i, c);
      m.makeScale(s, s, s).setPosition(x, 1.3 * s, z);
      h.setMatrixAt(i, m);
    }
    b.instanceMatrix.needsUpdate = true;
    if (b.instanceColor) b.instanceColor.needsUpdate = true;
    h.instanceMatrix.needsUpdate = true;
    b.frustumCulled = false;
    h.frustumCulled = false;
    return {bodies: b, heads: h};
  }, []);
  return (
    <>
      <primitive object={bodies}>
        <Ink thickness={0.03} />
      </primitive>
      <primitive object={heads}>
        <Ink thickness={0.03} />
      </primitive>
    </>
  );
};

export const CrowdSet: React.FC<SetProps> = (p) => {
  const t = p.frame / p.fps;
  return (
    <group>
      <Ground color="#79b851" />
      {/* the hill + tiny flag */}
      <ToonPart color="#6aa648" position={[0, -0.4, -14]} scale={[3.4, 1.6, 2.6]}>
        <sphereGeometry args={[1, 24, 16]} />
      </ToonPart>
      <ToonPart color="#555" position={[0, 2.1, -14]} outline={0.02}>
        <cylinderGeometry args={[0.03, 0.03, 2.0, 8]} />
      </ToonPart>
      <WavingFlag kind="dutch" width={0.42} height={0.28} t={t} amp={0.03} position={[0.02, 2.95, -14]} />
      {Array.from({length: 10}).map((_, i) => (
        <Palm key={i} position={[(i - 4.5) * 4 + rand(i) * 2, 0, -20 - rand(i + 3) * 6]} scale={1.4} seed={i} t={t} />
      ))}
      <Crowd />
      <Hero p={p} position={[0.6, 0, 4]} rotationY={Math.PI} />
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* VERANDA — gin, laughter, a sleeping cat                              */
/* ------------------------------------------------------------------ */
const tileTexture = () =>
  canvasTexture('tiles', 512, 512, (ctx, w, h) => {
    const n = 8;
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        ctx.fillStyle = (x + y) % 2 ? '#e9e2d0' : '#b9583c';
        ctx.fillRect((x * w) / n, (y * h) / n, w / n, h / n);
      }
  });
const ginLabel = () =>
  canvasTexture('gin-label', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#f4ecd6';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.font = `900 54px ${FONT_BLACK}`;
    ctx.fillText('GIN', w / 2, 70);
    ctx.font = `bold 30px ${FONT_TYPE}`;
    ctx.fillText('AGED', w / 2, 130);
    ctx.fillStyle = '#ae1c28';
    ctx.font = `900 50px ${FONT_BLACK}`;
    ctx.fillText('350', w / 2, 185);
    ctx.fillStyle = INK;
    ctx.font = `bold 30px ${FONT_TYPE}`;
    ctx.fillText('YEARS', w / 2, 228);
  });

const Cat: React.FC<{position: Vec3; t: number}> = ({position, t}) => {
  const breathe = 1 + 0.04 * Math.sin(t * 2.2);
  return (
    <group position={position} rotation={[0, 0.6, 0]}>
      <ToonPart color="#e8964a" position={[0, 0.16, 0]} scale={[1.4, 0.7 * breathe, 0.9]}>
        <sphereGeometry args={[0.22, 16, 12]} />
      </ToonPart>
      <ToonPart color="#e8964a" position={[0.3, 0.16, 0.05]}>
        <sphereGeometry args={[0.13, 16, 12]} />
      </ToonPart>
      {[-0.06, 0.06].map((z, i) => (
        <ToonPart key={i} color="#e8964a" position={[0.33, 0.29, 0.05 + z]} outline={0.012}>
          <coneGeometry args={[0.04, 0.08, 6]} />
        </ToonPart>
      ))}
      <ToonPart color="#e8964a" position={[-0.32, 0.08, 0.1]} rotation={[Math.PI / 2, 0, 0.4]} outline={0.015}>
        <torusGeometry args={[0.12, 0.03, 8, 16, Math.PI * 1.2]} />
      </ToonPart>
    </group>
  );
};

export const VerandaSet: React.FC<SetProps> = (p) => {
  const {beat, localFrame, fps, frame} = p;
  const t = frame / fps;
  const isPaper = beat.id === 'S10_newspaper';
  const laughMouth = (k: number) => (Math.floor((localFrame + k * 3) / 4) % 2 ? 'open_wide' : 'open_mid');
  const laughing = (frame / fps) > 15.2;
  const glass = <HandProp item="gin_glass" t={t} />;

  const generalPos: Vec3 = [-0.85, 0, 0.35];
  const officerAPos: Vec3 = [0.9, 0, 0.2];
  const officerBPos: Vec3 = [0.05, 0, -0.85];
  const bimaPos: Vec3 = [2.3, 0, -2.0];

  return (
    <group>
      {/* floor */}
      <ToonPart color="#ffffff" map={tileTexture()} rotation={[-Math.PI / 2, 0, 0]} outline={false}>
        <planeGeometry args={[12, 10]} />
      </ToonPart>
      {/* garden beyond */}
      <Ground color="#6fb24c" y={-0.02} />
      <FlatPart color="#9fd8f5" position={[0, 6, -18]}>
        <planeGeometry args={[60, 20]} />
      </FlatPart>
      {Array.from({length: 7}).map((_, i) => (
        <Palm key={i} position={[(i - 3) * 2.6, 0, -6.5 - rand(i) * 3]} scale={1.1} seed={i} t={t} />
      ))}
      {/* columns + railing + roof edge */}
      {[-3.5, -1.2, 1.2, 3.5].map((x) => (
        <ToonPart key={x} color="#ffffff" position={[x, 1.7, -3.2]}>
          <cylinderGeometry args={[0.16, 0.2, 3.4, 16]} />
        </ToonPart>
      ))}
      <ToonPart color="#ffffff" position={[0, 0.55, -3.2]}>
        <boxGeometry args={[8, 0.08, 0.1]} />
      </ToonPart>
      {Array.from({length: 26}).map((_, i) => (
        <ToonPart key={i} color="#ffffff" position={[-3.9 + i * 0.31, 0.28, -3.2]} outline={0.015}>
          <boxGeometry args={[0.05, 0.5, 0.05]} />
        </ToonPart>
      ))}
      <ToonPart color="#3f6b4a" position={[0, 3.5, -3.0]}>
        <boxGeometry args={[9, 0.3, 0.6]} />
      </ToonPart>
      {/* bima's bicycle parked (easter egg #6) */}
      <Bicycle position={[-2.8, 0, -2.5]} rotation={[0, 0.25, 0]} />
      {/* table + gin bottle */}
      <ToonPart color="#7a4a2a" position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.06, 28]} />
      </ToonPart>
      <ToonPart color="#7a4a2a" position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.06, 0.1, 0.72, 10]} />
      </ToonPart>
      <group position={[0.12, 0.75, 0.12]}>
        <ToonPart color="#8fd18f" transparent opacity={0.85} position={[0, 0.17, 0]}>
          <cylinderGeometry args={[0.08, 0.09, 0.34, 14]} />
        </ToonPart>
        <ToonPart color="#8fd18f" position={[0, 0.4, 0]} outline={0.012}>
          <cylinderGeometry args={[0.03, 0.05, 0.14, 10]} />
        </ToonPart>
        <FlatPart map={ginLabel()} position={[0.0, 0.17, 0.092]}>
          <planeGeometry args={[0.13, 0.13]} />
        </FlatPart>
      </group>
      <Cat position={[-1.9, 0, 1.3]} t={t} />

      {/* the general */}
      {beat.character.who === 'general' ? (
        <Hero p={p} position={generalPos} rotationY={0.75} lookAt={[0, 1.7, 0]} />
      ) : (
        <ToonCharacter
          who="general"
          position={generalPos}
          rotationY={0.75}
          pose="toast"
          expression="smug"
          mouth={laughMouth(0)}
          localFrame={localFrame + 60}
          fps={fps}
          lookAt={officerAPos}
          rightHandItem={glass}
        />
      )}
      {/* officer A (the newspaper reader) */}
      {isPaper ? (
        <Hero p={p} position={officerAPos} rotationY={-0.6} />
      ) : (
        <ToonCharacter
          who="officer"
          position={officerAPos}
          rotationY={-0.6}
          pose="toast"
          expression="smug"
          mouth={laughing ? laughMouth(1) : 'closed'}
          localFrame={localFrame}
          fps={fps}
          seed={1.3}
          lookAt={[0, 1.7, 0]}
          rightHandItem={glass}
        />
      )}
      {/* officer B */}
      <ToonCharacter
        who="officer"
        position={officerBPos}
        rotationY={0.1}
        pose="toast"
        expression="smug"
        mouth={laughing || isPaper ? laughMouth(2) : 'closed'}
        localFrame={localFrame + 20}
        fps={fps}
        seed={2.1}
        lookAt={[0, 1.7, 1]}
        rightHandItem={glass}
      />
      {/* Bima sweeping in the back, unimpressed */}
      <ToonCharacter
        who="bima"
        position={bimaPos}
        rotationY={-0.5}
        pose="sweep"
        expression="neutral"
        localFrame={localFrame + 40}
        fps={fps}
        seed={3}
        lookAt={isPaper ? officerAPos : [2.6, 0, 0]}
        rightHandItem={<HandProp item="broom" t={t} />}
      />
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* SEA — Battle of the Java Sea at night                                */
/* ------------------------------------------------------------------ */
const Ship: React.FC<{position: Vec3; rotY?: number; sink?: number; flash?: number; color?: string}> = ({
  position,
  rotY = 0,
  sink = 0,
  flash = 0,
  color = '#5d6b7a',
}) => (
  <group position={[position[0], position[1] - sink * 1.6, position[2]]} rotation={[sink * 0.35, rotY, sink * 0.5]}>
    <ToonPart color={color} position={[0, 0.3, 0]} scale={[1, 1, 1]}>
      <boxGeometry args={[4.2, 0.7, 0.9]} />
    </ToonPart>
    <ToonPart color={color} position={[2.3, 0.3, 0]} rotation={[0, 0, 0]} scale={[1, 1, 0.9]}>
      <coneGeometry args={[0.45, 0.8, 4, 1]} />
    </ToonPart>
    <ToonPart color="#7d8b99" position={[-0.2, 0.95, 0]}>
      <boxGeometry args={[1.6, 0.6, 0.6]} />
    </ToonPart>
    <ToonPart color="#7d8b99" position={[0.1, 1.5, 0]}>
      <boxGeometry args={[0.6, 0.5, 0.45]} />
    </ToonPart>
    {[-0.7, -0.2].map((x, i) => (
      <ToonPart key={i} color="#3d4650" position={[x, 1.55, 0]}>
        <cylinderGeometry args={[0.13, 0.15, 0.7, 10]} />
      </ToonPart>
    ))}
    <ToonPart color="#3d4650" position={[1.3, 0.85, 0]} rotation={[0, 0, -1.3]}>
      <cylinderGeometry args={[0.05, 0.05, 1.0, 8]} />
    </ToonPart>
    {flash > 0 ? (
      <ToonPart color="#fff1a8" emissive="#ffb000" emissiveIntensity={1} position={[1.85, 0.95, 0]} scale={0.25 + flash * 0.5} outline={false}>
        <icosahedronGeometry args={[1, 0]} />
      </ToonPart>
    ) : null}
  </group>
);

const Splash: React.FC<{position: Vec3; k: number}> = ({position, k}) => {
  if (k <= 0 || k >= 1) return null;
  const h = Math.sin(k * Math.PI) * 2.4;
  return (
    <group position={position}>
      <ToonPart color="#e8f6ff" position={[0, h / 2, 0]} scale={[1 - k * 0.5, 1, 1 - k * 0.5]}>
        <cylinderGeometry args={[0.15, 0.45, h + 0.01, 10]} />
      </ToonPart>
    </group>
  );
};

export const SeaSet: React.FC<SetProps> = (p) => {
  const sec = p.frame / p.fps;
  const t = sec;
  const booms = [22.0, 22.9, 23.45];
  const flashAt = (offset: number) => {
    let f = 0;
    for (const b of booms) {
      const d = sec - (b + offset);
      if (d >= 0 && d < 0.15) f = 1 - d / 0.15;
    }
    return f;
  };
  return (
    <group>
      <FlatPart color="#0d1b3d" position={[0, 20, -80]}>
        <planeGeometry args={[300, 80]} />
      </FlatPart>
      {/* moon + stars */}
      <FlatPart color="#f4f1d0" position={[-14, 16, -70]}>
        <circleGeometry args={[2.4, 32]} />
      </FlatPart>
      {Array.from({length: 40}).map((_, i) => (
        <FlatPart key={i} color="#ffffff" position={[(rand(i) - 0.5) * 120, 8 + rand(i + 1) * 30, -75]}>
          <circleGeometry args={[0.12 + rand(i + 2) * 0.12, 6]} />
        </FlatPart>
      ))}
      {/* ocean */}
      <ToonPart color="#1d3f7a" rotation={[-Math.PI / 2, 0, 0]} outline={false}>
        <planeGeometry args={[300, 300]} />
      </ToonPart>
      {Array.from({length: 40}).map((_, i) => (
        <FlatPart
          key={i}
          color="#4f7fc4"
          position={[(rand(i * 3) - 0.5) * 40 + Math.sin(t + i) * 0.3, 0.02, 8 - rand(i * 5) * 40]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[1.2 + rand(i) * 1.5, 0.08]} />
        </FlatPart>
      ))}
      <Ship position={[-5, 0, -14]} rotY={0.15} flash={flashAt(0)} />
      <Ship position={[3.5, 0, -19]} rotY={-0.25} flash={flashAt(0.2)} color="#56636f" />
      <Ship position={[-1, 0, -26]} rotY={0.3} sink={Math.max(0, Math.min(1, (sec - 22.95) / 1.0))} />
      <Ship position={[8, 0, -30]} rotY={2.9} flash={flashAt(0.1)} color="#4b4f45" />
      <Splash position={[-2.5, 0, -12]} k={(sec - 22.05) / 0.9} />
      <Splash position={[1.5, 0, -16]} k={(sec - 22.95) / 0.9} />
      <Splash position={[-6, 0, -18]} k={(sec - 23.5) / 0.9} />
      <Fireball position={[-1, 1.2, -26]} k={(sec - 22.95) / 0.8} size={1.4} />
      {/* searchlights */}
      {[
        [-5, 2, -14, 0.6],
        [3.5, 2, -19, -0.8],
      ].map(([x, y, z, a], i) => (
        <mesh key={i} position={[x, y + 4, z]} rotation={[0, 0, a + Math.sin(t * 1.3 + i) * 0.4]}>
          <cylinderGeometry args={[1.4, 0.05, 9, 16, 1, true]} />
          <meshBasicMaterial color="#e9f4ff" transparent opacity={0.13} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* SHIP CLOCK — seven hours spin by, water rises                        */
/* ------------------------------------------------------------------ */
const clockFace = () =>
  canvasTexture('clock-face', 512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#f6efdc';
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `900 54px ${FONT_BLACK}`;
    for (let i = 1; i <= 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ctx.fillText(String(i), w / 2 + Math.sin(a) * 190, h / 2 - Math.cos(a) * 190);
    }
    ctx.lineWidth = 14;
    ctx.strokeStyle = INK;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2 - 8, 0, Math.PI * 2);
    ctx.stroke();
  });

export const ShipClockSet: React.FC<SetProps> = (p) => {
  const sec = p.frame / p.fps;
  const spin = interpolate(sec, [23.8, 25.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const minuteA = -spin * Math.PI * 2 * 7;
  const hourA = -(spin * 7 + 2) * (Math.PI / 6);
  const water = interpolate(sec, [24.6, 26.54], [0.2, 2.3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)});
  return (
    <group>
      {/* riveted steel wall */}
      <ToonPart color="#5d6b7a" position={[0, 1.6, -0.1]} outline={false}>
        <boxGeometry args={[6, 5, 0.1]} />
      </ToonPart>
      {Array.from({length: 24}).map((_, i) => (
        <ToonPart key={i} color="#7d8b99" position={[-2.4 + (i % 8) * 0.68, 0.4 + Math.floor(i / 8) * 1.2, -0.03]} outline={0.01}>
          <sphereGeometry args={[0.04, 8, 6]} />
        </ToonPart>
      ))}
      {/* porthole */}
      <group position={[-0.95, 2.2, -0.04]}>
        <ToonPart color="#b38b3a" rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.28, 0.06, 10, 28]} />
        </ToonPart>
        <FlatPart color="#0d1b3d">
          <circleGeometry args={[0.27, 28]} />
        </FlatPart>
      </group>
      {/* clock */}
      <group position={[0, 1.6, 0]}>
        <ToonPart color="#b38b3a" rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.46, 0.46, 0.08, 40]} />
        </ToonPart>
        <FlatPart map={clockFace()} position={[0, 0, 0.045]}>
          <circleGeometry args={[0.41, 40]} />
        </FlatPart>
        <group position={[0, 0, 0.06]} rotation={[0, 0, hourA]}>
          <ToonPart color={INK} position={[0, 0.11, 0]} outline={false}>
            <boxGeometry args={[0.05, 0.24, 0.01]} />
          </ToonPart>
        </group>
        <group position={[0, 0, 0.07]} rotation={[0, 0, minuteA]}>
          <ToonPart color="#ae1c28" position={[0, 0.16, 0]} outline={false}>
            <boxGeometry args={[0.03, 0.34, 0.01]} />
          </ToonPart>
        </group>
        <ToonPart color="#222" position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]} outline={false}>
          <cylinderGeometry args={[0.03, 0.03, 0.02, 12]} />
        </ToonPart>
      </group>
      {/* rising water */}
      <mesh position={[0, water, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 3]} />
        <meshToonMaterial color="#2f6fb5" gradientMap={getToonGradient()} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, water / 2 - 0.02, 0.06]}>
        <planeGeometry args={[8, Math.max(0.01, water)]} />
        <meshBasicMaterial color="#1d4f8f" transparent opacity={0.55} depthWrite={false} />
      </mesh>
      {Array.from({length: 10}).map((_, i) => {
        const y = ((sec * 0.8 + rand(i)) % 1) * water;
        return y < 0.05 ? null : (
          <ToonPart key={i} color="#cfe8ff" position={[(rand(i + 2) - 0.5) * 1.6, y, 0.15]} outline={0.008}>
            <sphereGeometry args={[0.03 + rand(i) * 0.03, 8, 6]} />
          </ToonPart>
        );
      })}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* BEACH — landing boats hit the sand                                   */
/* ------------------------------------------------------------------ */
const LandingBoat: React.FC<{position: Vec3; ramp: number; children?: React.ReactNode}> = ({position, ramp, children}) => (
  <group position={position}>
    <ToonPart color="#6c7259" position={[0, 0.35, 0]}>
      <boxGeometry args={[1.8, 0.8, 3.2]} />
    </ToonPart>
    <ToonPart color="#565b46" position={[0, 0.76, 0]} outline={false}>
      <boxGeometry args={[1.6, 0.04, 3.0]} />
    </ToonPart>
    <group position={[0, 0.0, 1.6]} rotation={[ramp * 1.3, 0, 0]}>
      <ToonPart color="#7a8064" position={[0, 0.45, 0]}>
        <boxGeometry args={[1.8, 0.9, 0.1]} />
      </ToonPart>
    </group>
    {children}
  </group>
);

export const BeachSet: React.FC<SetProps> = (p) => {
  const sec = p.frame / p.fps;
  const hit = 27.74;
  const zLead = interpolate(sec, [26.54, hit], [-10, -1.6], {extrapolateRight: 'clamp', easing: Easing.out(Easing.quad)});
  const ramp = interpolate(sec, [hit + 0.15, hit + 0.55], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bounce});
  const hero = heroProps(p);
  return (
    <group>
      <FlatPart color="#3a4f7a" position={[0, 10, -60]}>
        <planeGeometry args={[200, 40]} />
      </FlatPart>
      <FlatPart color="#f2b880" position={[0, 2, -59]}>
        <planeGeometry args={[200, 4]} />
      </FlatPart>
      <ToonPart color="#2c5a8f" rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, -30]} outline={false}>
        <planeGeometry args={[200, 60]} />
      </ToonPart>
      <ToonPart color="#e3c58e" rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 10]} outline={false}>
        <planeGeometry args={[200, 22]} />
      </ToonPart>
      {Array.from({length: 6}).map((_, i) => (
        <FlatPart key={i} color="#e9f4ff" position={[(i - 2.5) * 3 + Math.sin(sec * 2 + i) * 0.4, 0.01, -0.9 + Math.sin(sec * 1.5 + i) * 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.2, 0.12]} />
        </FlatPart>
      ))}
      <Palm position={[5, 0, 3]} scale={1.3} seed={1} t={sec} />
      <Palm position={[-4.5, 0, 5]} scale={1.2} seed={2} t={sec} />
      <LandingBoat position={[0, 0, zLead]} ramp={ramp}>
        {hero ? <ToonCharacter {...hero} position={[0, 0.3, 0.6]} rotationY={0} /> : null}
        {[-0.45, 0.45].map((x, i) => (
          <ToonCharacter key={i} who="jp_soldier" pose="idle" expression="neutral" position={[x, 0.3, -0.5]} localFrame={p.localFrame + i * 9} fps={p.fps} seed={i + 4} />
        ))}
      </LandingBoat>
      <LandingBoat position={[-3.2, 0, zLead - 3]} ramp={0} />
      <LandingBoat position={[3.4, 0, zLead - 5]} ramp={0} />
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* BIKE PARADE — ground-level, wheels rolling past the lens             */
/* ------------------------------------------------------------------ */
export const BikeParadeSet: React.FC<SetProps> = (p) => {
  const {localFrame, fps} = p;
  const t = localFrame / fps;
  const riders = [
    {lane: 0.0, x0: -3.2, v: 3.2},
    {lane: -1.3, x0: -1.0, v: 3.0},
    {lane: 0.4, x0: -6.5, v: 3.4},
    {lane: -2.6, x0: 0.6, v: 2.8},
    {lane: -1.0, x0: -5.0, v: 3.1},
    {lane: -3.8, x0: -2.4, v: 2.9},
  ];
  return (
    <group>
      <FlatPart color="#9fd8f5" position={[0, 6, -30]}>
        <planeGeometry args={[120, 30]} />
      </FlatPart>
      <Ground color="#79b851" />
      <ToonPart color="#c9a46a" rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -1.6]} outline={false}>
        <planeGeometry args={[80, 6]} />
      </ToonPart>
      {Array.from({length: 9}).map((_, i) => (
        <Palm key={i} position={[(i - 4) * 4 + 1, 0, -7 - rand(i) * 3]} scale={1.1} seed={i} t={t} />
      ))}
      {riders.map((r, i) => {
        const x = r.x0 + r.v * t;
        const props = i === 0 ? heroProps(p) : null;
        return (
          <group key={i} position={[x, 0, r.lane]}>
            <Bicycle wheelSpin={(r.v * t) / 0.34} />
            {props ? (
              <ToonCharacter {...props} position={[-0.2, 0.15, 0]} rotationY={Math.PI / 2} />
            ) : (
              <ToonCharacter
                who="jp_soldier"
                pose="ride"
                expression="neutral"
                position={[-0.2, 0.15, 0]}
                rotationY={Math.PI / 2}
                localFrame={localFrame + 30}
                fps={fps}
                seed={i * 1.7}
              />
            )}
          </group>
        );
      })}
    </group>
  );
};
