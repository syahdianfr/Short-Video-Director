import React from 'react';
import * as THREE from 'three';
import {interpolate, Easing} from 'remotion';
import {ToonPart, FlatPart, canvasTexture, INK, rand, getToonGradient} from '../lib/toon';
import {WavingFlag, HandProp, Bicycle, paperTexture} from '../props';
import {ToonCharacter} from '../ToonCharacter';
import {Hero, Ground, Palm, Fireball, DustPuff, secToLocal, heroProps, WorldProp, type SetProps} from './common';
import {EggMesh, eggProfile, eggFoil} from './OfficeSets';
import type {Vec3} from '../types';

/* ------------------------------------------------------------------ */
/* Shared river terrain                                                 */
/* ------------------------------------------------------------------ */
const RiverTerrain: React.FC<{t: number}> = ({t}) => (
  <group>
    <FlatPart color="#ffb27a" position={[0, 8, -40]}>
      <planeGeometry args={[160, 40]} />
    </FlatPart>
    {[-1, 1].map((s) => (
      <ToonPart key={s} color="#6f9a45" position={[0, -0.3, s * 6.6]}>
        <boxGeometry args={[80, 0.6, 10]} />
      </ToonPart>
    ))}
    <mesh position={[0, -0.32, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[80, 3.4]} />
      <meshToonMaterial color="#3d7fb5" gradientMap={getToonGradient()} />
    </mesh>
    {Array.from({length: 12}).map((_, i) => (
      <FlatPart key={i} color="#9cc8ee" position={[((i * 3.1 + t * 1.5) % 30) - 15, -0.3, (rand(i) - 0.5) * 2.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.9, 0.05]} />
      </FlatPart>
    ))}
    {Array.from({length: 8}).map((_, i) => (
      <Palm key={i} position={[(i - 4) * 4.5, 0, -6 - rand(i) * 4]} scale={1.2} seed={i} t={t} />
    ))}
  </group>
);

/* ------------------------------------------------------------------ */
/* BRIDGE — the sapper blows it                                         */
/* ------------------------------------------------------------------ */
export const BridgeSet: React.FC<SetProps> = (p) => {
  const sec = p.frame / p.fps;
  const boom = 30.1;
  const k = Math.max(0, sec - boom);
  const pieces = [-1.65, -0.55, 0.55, 1.65];
  const charPos: Vec3 = [1.3, 0, 3.7];
  const rotY = -2.85;
  const fwd: Vec3 = [Math.sin(rotY), 0, Math.cos(rotY)];
  const plungerPos: Vec3 = [charPos[0] + fwd[0] * 0.55, 0, charPos[2] + fwd[2] * 0.55];
  const act = interpolate(sec, [29.95, 30.05], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <group>
      <RiverTerrain t={sec} />
      {/* bridge pillars */}
      {[-1.1, 1.1].map((z) => (
        <ToonPart key={z} color="#8a8a8a" position={[0, -0.1, z]}>
          <boxGeometry args={[0.6, 0.6, 0.4]} />
        </ToonPart>
      ))}
      {pieces.map((z, i) => {
        const dir = z > 0 ? 1 : -1;
        const pos: Vec3 = [rand(i) * k * 2 - k, 0.22 + k * 6 - k * k * 9, z + dir * k * 3.5];
        return (
          <group key={i} position={pos} rotation={[k * 6 * dir, k * 3, k * 4]}>
            <ToonPart color="#8a5a35">
              <boxGeometry args={[1.3, 0.14, 1.1]} />
            </ToonPart>
            <ToonPart color="#6e4526" position={[0.62, 0.25, 0]} outline={0.015}>
              <boxGeometry args={[0.06, 0.4, 1.1]} />
            </ToonPart>
          </group>
        );
      })}
      <Fireball position={[0, 0.6, 0]} k={k / 0.9} size={1.6} />
      {/* plunger box + wire */}
      <group position={plungerPos} rotation={[0, rotY, 0]}>
        <ToonPart color="#7a4a22" position={[0, 0.3, 0]}>
          <boxGeometry args={[0.4, 0.6, 0.3]} />
        </ToonPart>
        <ToonPart color="#333" position={[0, 0.6 + (1 - act) * 0.42, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.5, 8]} />
        </ToonPart>
        <ToonPart color="#333" position={[0, 0.85 + (1 - act) * 0.42 - 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
        </ToonPart>
      </group>
      <Hero p={p} position={charPos} rotationY={rotY} />
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* RIVER — soldiers wade across carrying their bikes overhead           */
/* ------------------------------------------------------------------ */
export const RiverSet: React.FC<SetProps> = (p) => {
  const {localFrame, fps} = p;
  const t = localFrame / fps;
  const sec = p.frame / p.fps;
  const wade = (z0: number, i: number): Vec3 => [i * 1.1 - 1.6, -0.62, z0 - t * 0.9];
  const hero = heroProps(p);
  return (
    <group>
      <RiverTerrain t={sec} />
      {/* broken bridge stumps */}
      {[-1.1, 1.1].map((z) => (
        <ToonPart key={z} color="#555" position={[-3.5, -0.05, z]}>
          <boxGeometry args={[0.6, 0.5, 0.4]} />
        </ToonPart>
      ))}
      {[0, 1, 2, 3].map((i) => {
        const pos = wade(1.6 - (i % 2) * 0.9, i);
        const splashK = (t * 2 + i * 0.3) % 1;
        return (
          <group key={i}>
            {i === 1 && hero ? (
              <ToonCharacter {...hero} position={pos} rotationY={Math.PI} seed={i} />
            ) : (
              <ToonCharacter
                who="jp_soldier"
                pose="carry_overhead"
                expression="neutral"
                position={pos}
                rotationY={Math.PI}
                localFrame={localFrame + i * 11}
                fps={fps}
                seed={i * 2.3}
                rightHandItem={<HandProp item="bicycle" t={t} />}
              />
            )}
            <ToonPart color="#e8f6ff" position={[pos[0], -0.3, pos[2]]} scale={[1 + splashK, 0.2, 1 + splashK]} outline={0.01}>
              <torusGeometry args={[0.4, 0.05, 6, 20]} />
            </ToonPart>
          </group>
        );
      })}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* BEACH CHAIR — the Dutch line folds                                   */
/* ------------------------------------------------------------------ */
const stripes = () =>
  canvasTexture('chair-stripes', 256, 256, (ctx, w, h) => {
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 ? '#ffffff' : '#f28c28';
      ctx.fillRect((i * w) / 8, 0, w / 8 + 1, h);
    }
  });

export const BeachChairSet: React.FC<SetProps> = (p) => {
  const sec = p.frame / p.fps;
  const act = p.beat.character.actionAtSec ?? 32.7;
  const fold = interpolate(sec, [act, act + 0.18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)});
  const after = sec >= act;
  const base = heroProps(p);
  const actLocal = secToLocal(p, act);
  return (
    <group>
      <FlatPart color="#ff9a5a" position={[0, 6, -30]}>
        <planeGeometry args={[120, 30]} />
      </FlatPart>
      <Ground color="#e3c58e" />
      {/* smoke columns */}
      {[-4, 3.5, 7].map((x, i) => (
        <group key={i} position={[x, 0, -9 - i * 2]}>
          {[0, 1, 2, 3].map((j) => (
            <ToonPart key={j} color="#5a5050" position={[Math.sin(sec + j + i) * 0.3, 1 + j * 1.2 + ((sec * 0.6) % 1.2), 0]} scale={0.8 + j * 0.25}>
              <icosahedronGeometry args={[0.7, 1]} />
            </ToonPart>
          ))}
        </group>
      ))}
      <Palm position={[-3.2, 0, -3]} scale={1.2} seed={3} t={sec} />
      {/* sandbag wall */}
      {Array.from({length: 18}).map((_, i) => (
        <ToonPart key={i} color="#b9a274" position={[-2.6 + (i % 9) * 0.65, 0.16 + Math.floor(i / 9) * 0.3, -0.9]} scale={[1, 0.6, 0.7]}>
          <sphereGeometry args={[0.36, 12, 8]} />
        </ToonPart>
      ))}
      {/* deck chair: back rest folds forward onto the officer */}
      <group position={[0, 0, 0.2]}>
        {[-0.42, 0.42].map((x) => (
          <ToonPart key={x} color="#8a5a35" position={[x, 0.25, 0.25]} rotation={[0.5, 0, 0]}>
            <boxGeometry args={[0.05, 0.6, 0.05]} />
          </ToonPart>
        ))}
        <ToonPart color="#ffffff" map={stripes()} position={[0, 0.48, 0.2]} rotation={[-Math.PI / 2 + 0.1 + fold * 0.7, 0, 0]}>
          <boxGeometry args={[0.8, 0.6, 0.03]} />
        </ToonPart>
        <group position={[0, 0.5, -0.12]} rotation={[-0.35 + fold * 1.45, 0, 0]}>
          <ToonPart color="#ffffff" map={stripes()} position={[0, 0.45, 0]}>
            <boxGeometry args={[0.8, 0.9, 0.03]} />
          </ToonPart>
          {[-0.42, 0.42].map((x) => (
            <ToonPart key={x} color="#8a5a35" position={[x, 0.45, -0.02]}>
              <boxGeometry args={[0.05, 0.95, 0.05]} />
            </ToonPart>
          ))}
        </group>
      </group>
      {base ? (
        <ToonCharacter
          {...base}
          position={[0, after ? -0.15 * fold : 0, 0.25]}
          pose={after ? 'squished' : 'sit'}
          fromPose="sit"
          localFrame={after ? p.localFrame - actLocal : p.localFrame}
          actionFrame={undefined}
          tilt={after ? 0.15 * fold : 0}
          emote={base.emote ? {...base.emote, frame: base.emote.frame - (after ? actLocal : 0)} : null}
          rightHandItem={after ? null : <HandProp item="gin_glass" t={0} />}
        />
      ) : null}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* BANDUNG — the ring of flags closes in                                */
/* ------------------------------------------------------------------ */
export const BandungSet: React.FC<SetProps> = (p) => {
  const sec = p.frame / p.fps;
  const R = interpolate(sec, [34.82, 36.39], [8.5, 4.2], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  return (
    <group>
      <FlatPart color="#ff8a3d" position={[0, 10, -40]}>
        <planeGeometry args={[160, 50]} />
      </FlatPart>
      <Ground color="#5e8a3a" />
      {Array.from({length: 18}).map((_, i) => {
        const a = (i / 18) * Math.PI * 2;
        const r = 12 + rand(i) * 3;
        return (
          <ToonPart key={i} color={i % 2 ? '#4a6b3a' : '#3d5a32'} position={[Math.sin(a) * r, 2, Math.cos(a) * r - 2]}>
            <coneGeometry args={[3 + rand(i + 1) * 1.5, 4 + rand(i + 2) * 3, 7]} />
          </ToonPart>
        );
      })}
      {/* town */}
      {Array.from({length: 26}).map((_, i) => {
        const a = rand(i * 2) * Math.PI * 2;
        const r = 0.8 + rand(i * 3) * 2.6;
        return (
          <group key={i} position={[Math.sin(a) * r, 0, Math.cos(a) * r]} rotation={[0, a, 0]}>
            <ToonPart color="#efe2c0" position={[0, 0.25, 0]}>
              <boxGeometry args={[0.5, 0.5, 0.5]} />
            </ToonPart>
            <ToonPart color="#b9583c" position={[0, 0.65, 0]} rotation={[0, Math.PI / 4, 0]}>
              <coneGeometry args={[0.42, 0.35, 4]} />
            </ToonPart>
          </group>
        );
      })}
      {/* last fortress */}
      <ToonPart color="#ffffff" position={[0, 0.5, 0]}>
        <boxGeometry args={[1.4, 1, 0.8]} />
      </ToonPart>
      <ToonPart color="#b9583c" position={[0, 1.25, 0]}>
        <coneGeometry args={[0.35, 0.8, 8]} />
      </ToonPart>
      <WavingFlag kind="dutch" width={0.5} height={0.32} t={sec} amp={0.03} position={[0.02, 1.9, 0]} />
      <ToonPart color="#555" position={[0, 1.7, 0]} outline={0.01}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 6]} />
      </ToonPart>
      {/* closing ring */}
      {Array.from({length: 22}).map((_, i) => {
        const a = (i / 22) * Math.PI * 2;
        return (
          <group key={i} position={[Math.sin(a) * R, 0, Math.cos(a) * R]}>
            <ToonPart color="#555" position={[0, 0.6, 0]} outline={0.01}>
              <cylinderGeometry args={[0.025, 0.025, 1.2, 6]} />
            </ToonPart>
            <WavingFlag kind="japan" width={0.5} height={0.33} t={sec + i} amp={0.03} position={[0.02, 1.05, 0]} rotation={[0, a + Math.PI / 2, 0]} />
          </group>
        );
      })}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* HANGAR — Kalijati airfield (also used for the pen/stamp ECU)         */
/* ------------------------------------------------------------------ */
export const HangarSet: React.FC<SetProps> = (p) => {
  const {localFrame, fps, beat} = p;
  const sec = p.frame / p.fps;
  const t = sec;
  const slamAt = 40.68;
  const signed = sec >= 43.33;
  const stampY = interpolate(sec, [43.2, 43.33], [1.5, 0.8], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)});
  const stampLift = interpolate(sec, [43.5, 43.85], [0, 0.6], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const isPen = beat.set === 'pen_stamp';
  const jp = beat.character.who === 'jp_general' ? heroProps(p) : null;
  return (
    <group>
      {/* hangar shell */}
      <ToonPart color="#8c939a" position={[0, 0, -2]} rotation={[Math.PI / 2, 0, 0]} side={THREE.BackSide} outline={false}>
        <cylinderGeometry args={[6, 6, 14, 32, 1, true, Math.PI / 2, Math.PI]} />
      </ToonPart>
      {Array.from({length: 6}).map((_, i) => (
        <ToonPart key={i} color="#5d646b" position={[0, 0, -8 + i * 2]} outline={false}>
          <torusGeometry args={[5.95, 0.06, 6, 32, Math.PI]} />
        </ToonPart>
      ))}
      <ToonPart color="#b9b4a8" rotation={[-Math.PI / 2, 0, 0]} outline={false}>
        <planeGeometry args={[14, 20]} />
      </ToonPart>
      <FlatPart color="#cfe8f5" position={[0, 3, -8.9]}>
        <planeGeometry args={[12, 6]} />
      </FlatPart>
      {/* biplane silhouette outside (back opening) */}
      <group position={[3, 0, -7]} rotation={[0, -0.6, 0]}>
        <ToonPart color="#6f7444" position={[0, 1, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.35, 0.2, 3, 12]} />
        </ToonPart>
        <ToonPart color="#6f7444" position={[0.4, 1.1, 0]}>
          <boxGeometry args={[0.8, 0.08, 4.4]} />
        </ToonPart>
      </group>
      {/* crate + sleeping cat (easter egg #4: same cat, still asleep) */}
      <ToonPart color="#9a7040" position={[-2.3, 0.3, -1.6]}>
        <boxGeometry args={[0.8, 0.6, 0.6]} />
      </ToonPart>
      <group position={[-2.3, 0.6, -1.6]}>
        <ToonPart color="#e8964a" position={[0, 0.14, 0]} scale={[1.4, 0.7 * (1 + 0.04 * Math.sin(t * 2.2)), 0.9]}>
          <sphereGeometry args={[0.2, 16, 12]} />
        </ToonPart>
        <ToonPart color="#e8964a" position={[0.27, 0.14, 0]}>
          <sphereGeometry args={[0.12, 16, 12]} />
        </ToonPart>
      </group>
      {/* table */}
      <ToonPart color="#6e4526" position={[0, 0.75, 0]}>
        <boxGeometry args={[1.7, 0.06, 1.0]} />
      </ToonPart>
      {[
        [-0.75, -0.42],
        [0.75, -0.42],
        [-0.75, 0.42],
        [0.75, 0.42],
      ].map(([x, z], i) => (
        <ToonPart key={i} color="#5a3a22" position={[x, 0.37, z]}>
          <boxGeometry args={[0.06, 0.74, 0.06]} />
        </ToonPart>
      ))}
      {/* the capitulation document */}
      <FlatPart position={[0, 0.785, 0.18]} rotation={[-Math.PI / 2, 0, 0]} map={paperTexture(signed ? 'document_signed' : 'document')}>
        <planeGeometry args={[0.36, 0.45]} />
      </FlatPart>
      {/* stamp */}
      <group position={[0.1, stampY + stampLift, 0.12]}>
        <ToonPart color="#7a2a2a" position={[0, 0.03, 0]}>
          <boxGeometry args={[0.14, 0.05, 0.1]} />
        </ToonPart>
        <ToonPart color="#4a2a1a" position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.025, 0.035, 0.18, 10]} />
        </ToonPart>
        <ToonPart color="#4a2a1a" position={[0, 0.25, 0]}>
          <sphereGeometry args={[0.045, 10, 8]} />
        </ToonPart>
      </group>
      {isPen ? <WorldProp p={p} /> : null}
      <DustPuff position={[0.1, 0.8, 0.15]} k={(sec - 43.33) / 0.4} n={8} spread={0.22} size={0.22} />
      <DustPuff position={[-0.15, 0.8, 0.2]} k={(sec - slamAt) / 0.45} n={8} spread={0.5} size={0.5} />
      {/* chairs */}
      <ToonPart color="#5a3a22" position={[0, 0.45, 1.0]}>
        <boxGeometry args={[0.5, 0.06, 0.5]} />
      </ToonPart>
      {/* Dutch general seated, back to camera, shoulders slumped */}
      {isPen ? null : <ToonCharacter
        who="general"
        position={[0, 0, 1.05]}
        rotationY={Math.PI}
        pose="sit"
        expression="sweat"
        localFrame={localFrame + 50}
        fps={fps}
        lookAt={[0, 1.5, -0.9]}
      />}
      {/* Japanese general behind the table */}
      {jp ? (
        <ToonCharacter {...jp} position={[0, 0, -0.9]} />
      ) : (
        <ToonCharacter who="jp_general" pose="idle" expression="neutral" position={[0, 0, -0.9]} localFrame={localFrame} fps={fps} lookAt={[0, 1.4, 1]} />
      )}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* BOMBER WINDOW — over-the-shoulder through the hangar window          */
/* ------------------------------------------------------------------ */
export const BomberWindowSet: React.FC<SetProps> = (p) => {
  const sec = p.frame / p.fps;
  const jp = heroProps(p);
  const hole = {w: 3.0, h: 3.2, y: 2.6};
  return (
    <group>
      {/* sky + horizon fire */}
      <FlatPart color="#c2331f" position={[0, 8, -60]}>
        <planeGeometry args={[200, 40]} />
      </FlatPart>
      <FlatPart color="#ff8a2a" position={[0, 1.5, -59]}>
        <planeGeometry args={[200, 5]} />
      </FlatPart>
      {Array.from({length: 9}).map((_, i) => (
        <ToonPart key={i} color="#3a1410" position={[(i - 4) * 9, 0, -40]} outline={false}>
          <coneGeometry args={[6, 7 + rand(i) * 4, 6]} />
        </ToonPart>
      ))}
      {Array.from({length: 5}).map((_, i) => {
        const x = -16 + ((sec - 41.79) * 5 + i * 5.5);
        return (
          <group key={i} position={[x, 7 + (i % 2) * 1.6, -26 - i * 2]} rotation={[0, 0, 0]}>
            <ToonPart color="#1a1a1a" rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.35, 0.25, 3.2, 8]} />
            </ToonPart>
            <ToonPart color="#1a1a1a">
              <boxGeometry args={[1.0, 0.08, 5]} />
            </ToonPart>
          </group>
        );
      })}
      <Ground color="#2a1a14" y={-0.01} />
      {/* wall with window opening */}
      {[
        [0, hole.y + hole.h / 2 + 2, 12, 4],
        [0, (hole.y - hole.h / 2) / 2, 12, hole.y - hole.h / 2],
        [-(hole.w / 2 + 3), hole.y, 6, hole.h],
        [hole.w / 2 + 3, hole.y, 6, hole.h],
      ].map(([x, y, w, h], i) => (
        <ToonPart key={i} color="#4d4f52" position={[x, y, 0]} outline={false}>
          <boxGeometry args={[w, h, 0.2]} />
        </ToonPart>
      ))}
      {[
        [0, hole.y, 0.08, hole.h],
        [0, hole.y, hole.w, 0.08],
      ].map(([x, y, w, h], i) => (
        <ToonPart key={i} color="#222" position={[x, y, 0.05]}>
          <boxGeometry args={[w, h, 0.08]} />
        </ToonPart>
      ))}
      {jp ? <ToonCharacter {...jp} position={[1.0, 0, 4.1]} rotationY={Math.PI} /> : null}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* FLAGPOLES — Dutch flag down, Japanese flag up                        */
/* ------------------------------------------------------------------ */
export const FlagpolesSet: React.FC<SetProps> = (p) => {
  const sec = p.frame / p.fps;
  const dutchY = interpolate(sec, [43.95, 45.4], [4.55, 1.5], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const japanY = interpolate(sec, [44.25, 45.6], [1.5, 4.55], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const facingFlags = p.beat.id === 'S27_flag_swap';
  return (
    <group>
      <FlatPart color="#9fd8f5" position={[0, 8, -30]}>
        <planeGeometry args={[120, 40]} />
      </FlatPart>
      <Ground color="#79b851" />
      {Array.from({length: 8}).map((_, i) => (
        <Palm key={i} position={[(i - 3.5) * 4, 0, -8 - rand(i) * 4]} scale={1.2} seed={i} t={sec} />
      ))}
      {[-0.9, 0.9].map((x) => (
        <group key={x}>
          <ToonPart color="#dddddd" position={[x, 2.5, 0]}>
            <cylinderGeometry args={[0.05, 0.06, 5, 10]} />
          </ToonPart>
          <ToonPart color="#c49a3a" position={[x, 5.05, 0]} outline={0.015}>
            <sphereGeometry args={[0.09, 10, 8]} />
          </ToonPart>
        </group>
      ))}
      <WavingFlag kind="dutch" width={1.1} height={0.72} t={sec} position={[-0.86, dutchY, 0]} />
      <WavingFlag kind="japan" width={1.1} height={0.72} t={sec + 1} position={[0.94, japanY, 0]} />
      <Hero p={p} position={facingFlags ? [0.35, 0, 3.6] : [0.2, 0, 2.5]} rotationY={facingFlags ? Math.PI : 0.15} />
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* EGG — the chocolate-egg analogy                                      */
/* ------------------------------------------------------------------ */
const crackTexture = () =>
  canvasTexture('egg-crack', 512, 512, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 9;
    ctx.lineJoin = 'miter';
    for (let k = 0; k < 4; k++) {
      ctx.beginPath();
      let x = (k * w) / 4 + 40;
      let y = h * 0.5;
      ctx.moveTo(x, y);
      for (let i = 0; i < 8; i++) {
        x += 18 + rand(k * 10 + i) * 20;
        y += (rand(k * 20 + i) - 0.5) * 70;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  });

const Table: React.FC = () => (
  <group>
    <FlatPart color="#e7c79a" position={[0, 2, -3]}>
      <planeGeometry args={[14, 8]} />
    </FlatPart>
    <ToonPart color="#8a5a35" rotation={[-Math.PI / 2, 0, 0]} outline={false}>
      <planeGeometry args={[14, 14]} />
    </ToonPart>
  </group>
);

export const EggSet: React.FC<SetProps> = (p) => {
  const {beat, localFrame, fps} = p;
  const sec = p.frame / p.fps;
  const t = sec;

  if (beat.id === 'S31_choc_egg') {
    return (
      <group>
        <Table />
        <group rotation={[0, t * 0.6, 0]}>
          <EggMesh />
        </group>
        {/* specular toon glints */}
        <FlatPart color="#ffffff" position={[-0.18, 0.72, 0.3]} rotation={[0, -0.4, 0.5]}>
          <circleGeometry args={[0.05, 10]} />
        </FlatPart>
      </group>
    );
  }

  if (beat.id === 'S32_hollow') {
    const open = interpolate(sec, [53.39, 53.8], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.6))});
    return (
      <group>
        <Table />
        {/* two halves swing apart, revealing a hollow interior */}
        <group position={[-0.1 * open, 0, 0]} rotation={[0, 0, 0.22 * open]}>
          <EggMesh phiStart={Math.PI} phiLength={Math.PI} inside />
        </group>
        <group position={[0.1 * open, 0, 0]} rotation={[0, 0, -0.22 * open]}>
          <EggMesh phiStart={0} phiLength={Math.PI} inside />
        </group>
      </group>
    );
  }

  if (beat.id === 'S33_propped_up') {
    const hero = heroProps(p);
    const kings: Vec3[] = [
      [-0.16, 0.0, 0.0],
      [0.0, 0.0, 0.05],
      [0.16, 0.0, 0.0],
    ];
    const wobble = Math.sin(localFrame * 0.5) * 0.015;
    return (
      <group>
        <Table />
        {/* back half of the shell, opened */}
        <group rotation={[0, -Math.PI / 2, 0]} scale={1.2}>
          <EggMesh phiStart={Math.PI} phiLength={Math.PI} inside />
        </group>
        {/* plank held up by local kings */}
        <ToonPart color="#a77c4a" position={[0, 0.535, 0.02]} rotation={[0, 0, wobble]} outline={0.01}>
          <boxGeometry args={[0.5, 0.02, 0.14]} />
        </ToonPart>
        {kings.map((pos, i) =>
          i === 1 && hero ? (
            <ToonCharacter key={i} {...hero} position={pos} scale={0.22} seed={i} />
          ) : (
            <ToonCharacter key={i} who="king" pose="arms_up" expression="sweat" position={pos} scale={0.22} localFrame={localFrame + i * 7} fps={fps} seed={i * 1.9} />
          ),
        )}
        {/* a few Dutch officials standing on top, smug */}
        {[-0.1, 0.1].map((x, i) => (
          <ToonCharacter
            key={i}
            who="official"
            pose={i ? 'point' : 'idle'}
            expression="smug"
            position={[x, 0.545, 0.02]}
            scale={0.18}
            localFrame={localFrame + i * 5}
            fps={fps}
            seed={i + 7}
            tilt={wobble * 3}
          />
        ))}
      </group>
    );
  }

  // S34 — one tap… crack.
  const crackK = sec >= 57.28 ? 1 : 0;
  const breakK = Math.max(0, (sec - 57.36) / 0.5);
  const tap = sec - 56.72;
  const wob = tap > 0 ? Math.sin(tap * 40) * 0.08 * Math.exp(-tap * 6) : 0;
  const ring = sec - 56.47;
  const bellWob = ring > 0 ? Math.sin(ring * 60) * 0.15 * Math.exp(-ring * 5) : 0;
  return (
    <group>
      <Table />
      {/* bicycle bell callback */}
      <group position={[0.78, 0, 0.1]}>
        <ToonPart color="#2a2a2a" position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
        </ToonPart>
        <ToonPart color="#2a2a2a" position={[0, 0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.5, 8]} />
        </ToonPart>
        <group position={[-0.12, 0.64, 0]} rotation={[0, 0, bellWob]}>
          <ToonPart color="#dcdcdc">
            <sphereGeometry args={[0.07, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </ToonPart>
        </group>
      </group>
      {breakK <= 0 ? (
        <group rotation={[0, 0.3, wob]}>
          <EggMesh />
          {crackK ? (
            <mesh scale={1.012}>
              <latheGeometry args={[eggProfile, 40]} />
              <meshBasicMaterial map={crackTexture()} transparent alphaTest={0.4} />
            </mesh>
          ) : null}
        </group>
      ) : (
        <group>
          <group position={[-0.4 * breakK, 0, 0]} rotation={[0, 0, 0.9 * Math.min(1, breakK)]}>
            <EggMesh phiStart={Math.PI} phiLength={Math.PI} inside />
          </group>
          <group position={[0.4 * breakK, 0, 0]} rotation={[0, 0, -0.9 * Math.min(1, breakK)]}>
            <EggMesh phiStart={0} phiLength={Math.PI} inside />
          </group>
          {Array.from({length: 10}).map((_, i) => {
            const a = (i / 10) * Math.PI * 2;
            const k = Math.min(1.5, breakK);
            return (
              <ToonPart
                key={i}
                color={['#ae1c28', '#ffffff', '#21468b'][i % 3]}
                position={[Math.cos(a) * k * 0.8, 0.5 + k * 0.9 - k * k * 0.9, Math.sin(a) * k * 0.6]}
                rotation={[k * 6 + i, k * 4, i]}
                outline={0.01}
              >
                <tetrahedronGeometry args={[0.06, 0]} />
              </ToonPart>
            );
          })}
        </group>
      )}
    </group>
  );
};

/* ------------------------------------------------------------------ */
/* FINALE — Bima steps out of the broken shell, raises Merah Putih       */
/* ------------------------------------------------------------------ */
export const FinaleSet: React.FC<SetProps> = (p) => {
  const sec = p.frame / p.fps;
  const isWalk = p.beat.id === 'S35_bima_steps_out';
  const z = isWalk ? interpolate(sec, [57.9, 59.36], [-0.8, 0.9], {extrapolateRight: 'clamp'}) : 1.0;
  return (
    <group>
      <FlatPart color="#ffd27a" position={[0, 8, -30]}>
        <planeGeometry args={[120, 40]} />
      </FlatPart>
      <FlatPart color="#fff3c4" position={[0, 6, -29]}>
        <circleGeometry args={[4, 48]} />
      </FlatPart>
      {/* sun rays */}
      {Array.from({length: 12}).map((_, i) => (
        <FlatPart key={i} color="#ffe9a8" position={[0, 6, -29.5]} rotation={[0, 0, (i / 12) * Math.PI * 2 + sec * 0.1]}>
          <planeGeometry args={[0.8, 40]} />
        </FlatPart>
      ))}
      <Ground color="#d9b24a" />
      {/* giant broken shell halves */}
      <group position={[-1.9, 0, -1.2]} rotation={[0, 0.4, 0.5]} scale={3.2}>
        <EggMesh phiStart={Math.PI} phiLength={Math.PI} inside />
      </group>
      <group position={[1.9, 0, -1.4]} rotation={[0, -0.4, -0.5]} scale={3.2}>
        <EggMesh phiStart={0} phiLength={Math.PI} inside />
      </group>
      {Array.from({length: 14}).map((_, i) => (
        <ToonPart
          key={i}
          color={['#ae1c28', '#ffffff', '#21468b'][i % 3]}
          position={[(rand(i) - 0.5) * 6, 0.08, (rand(i + 3) - 0.5) * 3 - 0.5]}
          rotation={[rand(i) * 3, rand(i + 1) * 3, 0]}
          outline={0.015}
        >
          <tetrahedronGeometry args={[0.18, 0]} />
        </ToonPart>
      ))}
      <Hero p={p} position={[0, 0, z]} rotationY={0} />
    </group>
  );
};

export {Bicycle};
