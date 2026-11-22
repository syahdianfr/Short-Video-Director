import React from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {Easing, interpolate} from 'remotion';
import {rand} from '../lib/toon';
import type {KahfiBeat, Vec3} from './types';

export const WHIP_FRAMES = 6;

const v = (a: Vec3) => new THREE.Vector3(a[0], a[1], a[2]);

/** One resolved camera segment: a beat's base move, or one of its sub-cuts. */
interface Segment {
  startSec: number;
  endSec: number;
  pos: Vec3;
  target: Vec3;
  posEnd?: Vec3;
  targetEnd?: Vec3;
  fov: number;
  zoomEnd: number;
  transition: 'cut' | 'whip';
}

/**
 * Flatten a beat into its camera segments.
 *
 * A beat is one VO line, which can run past five seconds. The brief wants the
 * picture to change every 1.5-3 s, so a long line carries sub-cuts: the beat
 * stays the unit of story data, while the camera cuts inside it.
 */
export const segmentsOf = (beat: KahfiBeat): Segment[] => {
  const c = beat.camera;
  const subs = (c.subCuts ?? []).slice().sort((a, b) => a.atSec - b.atSec);
  const bounds = [beat.startSec, ...subs.map((s) => s.atSec), beat.endSec];
  const segs: Segment[] = [
    {
      startSec: bounds[0],
      endSec: bounds[1],
      pos: c.pos,
      target: c.target,
      posEnd: c.posEnd,
      targetEnd: c.targetEnd,
      fov: c.fov ?? 38,
      zoomEnd: c.zoomEnd,
      transition: c.transition,
    },
  ];
  subs.forEach((s, i) => {
    segs.push({
      startSec: bounds[i + 1],
      endSec: bounds[i + 2],
      pos: s.pos,
      target: s.target,
      posEnd: s.posEnd,
      targetEnd: s.targetEnd,
      fov: s.fov ?? c.fov ?? 38,
      zoomEnd: s.zoomEnd ?? 1,
      transition: s.transition ?? 'cut',
    });
  });
  return segs;
};

export const segmentAt = (beat: KahfiBeat, sec: number): Segment => {
  const segs = segmentsOf(beat);
  for (let i = segs.length - 1; i >= 0; i--) if (sec >= segs[i].startSec) return segs[i];
  return segs[0];
};

/**
 * The camera pose at an absolute frame. A pure function of the frame: the
 * shake and the idle creep both come from the frame number, never from a
 * clock or from delta time, so two renders of the same frame match exactly.
 */
export const kahfiCameraAt = (beat: KahfiBeat, frame: number, fps: number) => {
  const sec = frame / fps;
  const seg = segmentAt(beat, sec);
  const startF = seg.startSec * fps;
  const endF = seg.endSec * fps;
  const localFrame = frame - startF;

  const p = interpolate(frame, [startF, endF], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const tgt = v(seg.target).lerp(v(seg.targetEnd ?? seg.target), p);
  const base = v(seg.pos).lerp(v(seg.posEnd ?? seg.pos), p);
  /* Micro-zoom scales the distance to the target rather than the fov, so the
     perspective does not change unless a beat asks for a dolly zoom. */
  const zoom = 1 + (seg.zoomEnd - 1) * p;
  const pos = tgt.clone().add(base.clone().sub(tgt).multiplyScalar(zoom));

  /* Whip: swing in from a yaw offset over the first six frames. */
  let whipYaw = 0;
  if (seg.transition === 'whip' && localFrame < WHIP_FRAMES) {
    whipYaw = interpolate(localFrame, [0, WHIP_FRAMES], [0.52, 0], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  }

  /* Deterministic shake, declared per beat. Never set on a beat with a verse. */
  let shake = new THREE.Vector3();
  if (beat.camera.shake) {
    const sf = frame - beat.camera.shake.atSec * fps;
    if (sf >= 0 && sf < beat.camera.shake.frames) {
      const decay = 1 - sf / beat.camera.shake.frames;
      const k = decay * beat.camera.shake.amp;
      shake = new THREE.Vector3((rand(frame * 1.7) - 0.5) * 2 * k, (rand(frame * 3.1 + 11) - 0.5) * 2 * k, (rand(frame * 5.3 + 23) - 0.5) * k);
    }
  }

  /* A hold that never truly holds: a breath of drift so no frame is frozen. */
  const creep = new THREE.Vector3(Math.sin(frame * 0.045) * 0.009, Math.cos(frame * 0.038) * 0.007, 0);

  return {
    pos: pos.add(shake).add(creep),
    target: tgt.add(shake.clone().multiplyScalar(0.5)),
    whipYaw,
    roll: ((beat.camera.roll ?? 0) * Math.PI) / 180,
    fov: seg.fov,
    segStartFrame: Math.round(startF),
    transition: seg.transition,
  };
};

export const KahfiCamera: React.FC<{beat: KahfiBeat; frame: number; fps: number}> = ({beat, frame, fps}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const c = kahfiCameraAt(beat, frame, fps);
  camera.position.copy(c.pos);
  camera.up.set(0, 1, 0);
  camera.lookAt(c.target);
  if (c.whipYaw !== 0) camera.rotateY(c.whipYaw);
  if (c.roll !== 0) camera.rotateZ(c.roll);
  camera.fov = c.fov;
  camera.near = 0.05;
  camera.far = 400;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  return null;
};
